import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  FolderPlus,
  ChevronDown,
  Trash2,
  Plus,
  SlidersHorizontal,
  Check,
  X,
  Edit3,
} from 'lucide-react';
import { AcademicTerm, AppDatabaseState, ClassGroup } from '../types';
import {
  cleanClassDisplayCode,
  formatNumeral as formatNum,
  syncMonthsWithAcademicYear,
} from '../utils/calculations';
import { DEFAULT_ACADEMIC_TERMS } from '../data/defaultData';

interface Props {
  state: AppDatabaseState;
  selectedClassId: string;
  onSelectClass: (id: string) => void;
  onUpdateState: (updater: (prev: AppDatabaseState) => AppDatabaseState) => void;
}

export const TermAndClassBar: React.FC<Props> = ({
  state,
  selectedClassId,
  onSelectClass,
  onUpdateState,
}) => {
  const [showTermMenu, setShowTermMenu] = useState(false);
  const [newTermKh, setNewTermKh] = useState('');
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [editingTermName, setEditingTermName] = useState('');

  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassId, setNewClassId] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<number>(8);
  const [newClassDay, setNewClassDay] = useState('ថ្ងៃចន្ទ');
  const [newClassTime, setNewClassTime] = useState('13:00-14:30');

  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [pendingDeleteClass, setPendingDeleteClass] = useState<ClassGroup | null>(
    null
  );
  const [pendingDeleteTerm, setPendingDeleteTerm] = useState<AcademicTerm | null>(
    null
  );

  const terms: AcademicTerm[] =
    state.academicTerms && state.academicTerms.length > 0
      ? state.academicTerms
      : DEFAULT_ACADEMIC_TERMS;

  const currentTermId = state.currentTermId || terms[0]?.id || 'term-2026-2027';
  const currentTerm = terms.find((t) => t.id === currentTermId) || terms[0];

  // Display only classes belonging to the current academic term
  const displayedClasses = state.classes.filter(
    (c) => (c.termId || 'term-2025-2026') === currentTermId
  );

  const currentClass =
    displayedClasses.find((c) => c.id === selectedClassId) || displayedClasses[0];
  const [editClassName, setEditClassName] = useState(currentClass?.name || '');
  const [editClassDay, setEditClassDay] = useState(currentClass?.scheduleDayKh || '');
  const [editClassTime, setEditClassTime] = useState(currentClass?.scheduleTime || '');
  const [editClassTermId, setEditClassTermId] = useState(
    currentClass?.termId || currentTermId
  );

  const normalizeClassId = (raw: string): string => {
    return raw
      .replace(/^.*__/, '')
      .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)))
      .replace(/^ថ្នាក់ទី\s*/g, '')
      .replace(/^ថ្នាក់\s*/g, '')
      .replace(/\s+/g, '')
      .toUpperCase();
  };

  const inferGradeFromCode = (code: string, fallback: number): number => {
    const match = code.match(/^(7|8|9|10|11|12)/);
    return match ? Number(match[1]) : fallback;
  };

  const handleSelectTerm = (term: AcademicTerm) => {
    onUpdateState((prev) => {
      const nextTermClasses = prev.classes.filter(
        (c) => (c.termId || 'term-2025-2026') === term.id
      );
      if (nextTermClasses[0]) {
        onSelectClass(nextTermClasses[0].id);
      }
      return {
        ...prev,
        currentTermId: term.id,
        months: syncMonthsWithAcademicYear(prev.months, term.nameKh),
        schoolInfo: {
          ...prev.schoolInfo,
          academicYear: term.nameKh,
        },
        academicTerms: (prev.academicTerms || DEFAULT_ACADEMIC_TERMS).map((t) => ({
          ...t,
          isCurrent: t.id === term.id,
        })),
      };
    });
    setShowTermMenu(false);
  };

  const handleCreateTerm = () => {
    const trimmed = newTermKh.trim();
    if (!trimmed) return;
    const newId = `term-${Date.now()}`;
    const newTerm: AcademicTerm = {
      id: newId,
      nameKh: trimmed,
      nameZh: trimmed,
      isCurrent: true,
    };
    onUpdateState((prev) => ({
      ...prev,
      currentTermId: newId,
      months: syncMonthsWithAcademicYear(prev.months, trimmed),
      schoolInfo: {
        ...prev.schoolInfo,
        academicYear: trimmed,
      },
      academicTerms: [
        newTerm,
        ...(prev.academicTerms || DEFAULT_ACADEMIC_TERMS).map((t) => ({
          ...t,
          isCurrent: false,
        })),
      ],
    }));
    setNewTermKh('');
    setShowTermMenu(false);
    setShowAddClassModal(true);
  };

  const handleSaveTermRename = (termId: string) => {
    const trimmed = editingTermName.trim();
    if (!trimmed) return;
    onUpdateState((prev) => ({
      ...prev,
      months:
        prev.currentTermId === termId
          ? syncMonthsWithAcademicYear(prev.months, trimmed)
          : prev.months,
      schoolInfo:
        prev.currentTermId === termId
          ? { ...prev.schoolInfo, academicYear: trimmed }
          : prev.schoolInfo,
      academicTerms: (prev.academicTerms || DEFAULT_ACADEMIC_TERMS).map((t) =>
        t.id === termId ? { ...t, nameKh: trimmed } : t
      ),
    }));
    setEditingTermId(null);
  };

  const requestDeleteCurrentTerm = () => {
    if (terms.length <= 1 || !currentTerm) return;
    setPendingDeleteTerm(currentTerm);
  };

  const confirmDeleteTerm = () => {
    if (!pendingDeleteTerm || terms.length <= 1) {
      setPendingDeleteTerm(null);
      return;
    }
    const termIdToDelete = pendingDeleteTerm.id;
    const remaining = terms.filter((t) => t.id !== termIdToDelete);
    const nextTerm = remaining[0];
    onUpdateState((prev) => ({
      ...prev,
      currentTermId: nextTerm.id,
      months: syncMonthsWithAcademicYear(prev.months, nextTerm.nameKh),
      schoolInfo: {
        ...prev.schoolInfo,
        academicYear: nextTerm.nameKh,
      },
      academicTerms: remaining.map((t, idx) => ({
        ...t,
        isCurrent: idx === 0,
      })),
    }));
    setPendingDeleteTerm(null);
    setShowTermMenu(false);
  };

  const handleAddClass = () => {
    const rawInput = newClassId.trim() || newClassName.trim();
    if (!rawInput) return;

    // Support adding multiple classes at once if separated by comma/semicolon/space
    const tokens = rawInput
      .split(/[,;、\n]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    if (tokens.length === 0) return;

    let lastAddedId = selectedClassId;

    onUpdateState((prev) => {
      const nextClasses = [...prev.classes];

      tokens.forEach((token, idx) => {
        const classCode = normalizeClassId(token);
        if (!classCode) return;
        const customName =
          tokens.length === 1 && newClassName.trim()
            ? newClassName.trim().replace(/^ថ្នាក់ទី\s*/g, '').replace(/^ថ្នាក់\s*/g, '').trim()
            : token.replace(/^ថ្នាក់ទី\s*/g, '').replace(/^ថ្នាក់\s*/g, '').trim();
        const displayKh = customName || classCode;
        const gradeLevel = inferGradeFromCode(classCode, Number(newClassGrade) || 8);

        // Check if this class already exists in the current term
        const existingInCurrentTerm = nextClasses.find(
          (c) =>
            (c.termId || 'term-2025-2026') === currentTermId &&
            (normalizeClassId(c.id) === classCode ||
              normalizeClassId(c.name) === normalizeClassId(displayKh))
        );

        if (existingInCurrentTerm) {
          lastAddedId = existingInCurrentTerm.id;
          return;
        }

        // Scope ID to currentTermId so new term classes never inherit last year's students or scores
        const baseScopedId =
          currentTermId === 'term-2025-2026'
            ? classCode
            : `${currentTermId}__${classCode}`;
        const uniqueId = nextClasses.some((c) => c.id === baseScopedId)
          ? `${baseScopedId}_${Date.now()}_${idx}`
          : baseScopedId;

        const created: ClassGroup = {
          id: uniqueId,
          name: displayKh,
          gradeLevel,
          scheduleDayKh: newClassDay.trim() || 'ថ្ងៃចន្ទ',
          scheduleTime: newClassTime.trim() || '15:00-16:30',
          weeklyHoursLabel: '១ម៉ ៣០ន/ សប្តាហ៍',
          textbookName:
            gradeLevel >= 10
              ? '快乐汉语 (第二册) ភាសាចិនរីករាយ (កំរិត២)'
              : '快乐汉语 (第一册) ភាសាចិនរីករាយ (កំរិត១)',
          termId: currentTermId,
        };
        nextClasses.push(created);
        lastAddedId = created.id;
      });

      return {
        ...prev,
        classes: nextClasses,
      };
    });

    onSelectClass(lastAddedId);
    setNewClassId('');
    setNewClassName('');
    setShowAddClassModal(false);
  };

  const openEditClassModal = () => {
    if (!currentClass) return;
    setEditClassName(currentClass.name);
    setEditClassDay(currentClass.scheduleDayKh);
    setEditClassTime(currentClass.scheduleTime);
    setEditClassTermId(currentClass.termId || currentTermId);
    setShowEditClassModal(true);
  };

  const handleSaveEditClass = () => {
    if (!currentClass) return;
    const cleanName = editClassName
      .trim()
      .replace(/^ថ្នាក់ទី\s*/g, '')
      .replace(/^ថ្នាក់\s*/g, '')
      .trim();
    const newNormCode = normalizeClassId(cleanName || currentClass.name || currentClass.id);
    const oldId = currentClass.id;
    const inferredGrade = inferGradeFromCode(
      newNormCode,
      currentClass.gradeLevel
    );

    const newScheduleTime = editClassTime.trim() || currentClass.scheduleTime || '13:00-14:30';
    const newScheduleDayKh = editClassDay.trim() || currentClass.scheduleDayKh || 'ថ្ងៃចន្ទ';
    const newWeekdayShort = newScheduleDayKh.replace(/^ថ្ងៃ\s*/g, '').trim();
    const targetOldCode = cleanClassDisplayCode(currentClass.name || oldId);
    const targetNewCode = cleanClassDisplayCode(cleanName || newNormCode);

    onUpdateState((prev) => {
      const updatedClasses = prev.classes.map((c) =>
        c.id === oldId
          ? {
              ...c,
              name: cleanName || c.name,
              gradeLevel: inferredGrade,
              scheduleDayKh: newScheduleDayKh,
              scheduleTime: newScheduleTime,
              termId: editClassTermId,
            }
          : c
      );

      const updatedWeeklyLogs = (prev.weeklyLogs || []).map((w) => {
        const wCode = cleanClassDisplayCode(w.classId);
        if (
          wCode === targetOldCode ||
          wCode === targetNewCode ||
          w.classId === oldId ||
          cleanClassDisplayCode(w.classId) === cleanClassDisplayCode(oldId)
        ) {
          return {
            ...w,
            classId: cleanName || w.classId,
            timeRange: newScheduleTime,
            weekdayKh: newWeekdayShort || w.weekdayKh,
          };
        }
        return w;
      });

      return {
        ...prev,
        classes: updatedClasses,
        weeklyLogs: updatedWeeklyLogs,
      };
    });
    setShowEditClassModal(false);
  };

  const requestDeleteClass = (cls: ClassGroup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPendingDeleteClass(cls);
  };

  const confirmDeleteClass = () => {
    if (!pendingDeleteClass) return;
    const classIdToDelete = pendingDeleteClass.id;
    const nextClasses = state.classes.filter((c) => c.id !== classIdToDelete);
    const nextDisplayed = nextClasses.filter(
      (c) => (c.termId || 'term-2025-2026') === currentTermId
    );
    onUpdateState((prev) => ({
      ...prev,
      classes: nextClasses,
      students: prev.students.filter((s) => s.classId !== classIdToDelete),
    }));
    if (selectedClassId === classIdToDelete) {
      onSelectClass(nextDisplayed[0]?.id || '');
    }
    setPendingDeleteClass(null);
    setShowEditClassModal(false);
  };

  const handleDeleteSelectedClass = () => {
    if (!currentClass) return;
    setPendingDeleteClass(currentClass);
  };

  return (
    <div className="bg-gradient-to-r from-white via-sky-50/50 to-indigo-50/40 border-b border-indigo-100 no-print font-khmer-battambang">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Class Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-indigo-900 mr-1">
              ជ្រើសរើសថ្នាក់ (选择班级):
            </span>

            {displayedClasses.length === 0 ? (
              <span className="text-xs text-amber-900 bg-amber-100/80 border border-amber-300 px-3 py-1 rounded-lg font-semibold">
                ឆ្នាំសិក្សាថ្មី ({currentTerm?.nameKh}) មិនទាន់មានថ្នាក់រៀនទេ — សូមចុច «+ បន្ថែមថ្នាក់» ដើម្បីបង្កើតថ្នាក់ថ្មី
              </span>
            ) : (
              displayedClasses.map((cls) => {
                const count = state.students.filter((s) => s.classId === cls.id).length;
                const isSelected = cls.id === currentClass?.id;
                return (
                  <div
                    key={cls.id}
                    onClick={() => onSelectClass(cls.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs ring-2 ring-blue-200'
                        : 'bg-sky-50/90 text-indigo-950 border border-sky-200/80 hover:bg-sky-100 hover:border-sky-300'
                    }`}
                  >
                    <span>ថ្នាក់ {cls.name}</span>
                    <span
                      className={`text-[11px] font-mono ${
                        isSelected ? 'text-sky-100' : 'text-indigo-500'
                      }`}
                    >
                      ({formatNum(count, state.useKhmerNumerals)})
                    </span>
                    <button
                      type="button"
                      onClick={(e) => requestDeleteClass(cls, e)}
                      title={`លុបថ្នាក់ ${cls.name}`}
                      className={`ml-0.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'text-sky-100 hover:text-white hover:bg-white/20'
                          : 'text-indigo-400 hover:text-rose-600 hover:bg-rose-100'
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}

            <button
              type="button"
              onClick={() => setShowAddClassModal((v) => !v)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ បន្ថែមថ្នាក់ (添加班级)</span>
            </button>

            {currentClass && (
              <button
                type="button"
                onClick={openEditClassModal}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                <span>កែប្រែថ្នាក់</span>
              </button>
            )}
          </div>

          {/* Right: Compact Academic Year Selector */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-indigo-900 font-semibold">ឆ្នាំសិក្សា៖</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTermMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>{currentTerm?.nameKh || state.schoolInfo.academicYear}</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
              </button>

              {showTermMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700">
                      ជ្រើសរើស ឬបន្ថែមឆ្នាំសិក្សា
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTermMenu(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {terms.map((term) => {
                      const isActive = term.id === currentTermId;
                      const isEditing = editingTermId === term.id;
                      return (
                        <div
                          key={term.id}
                          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-xs ${
                            isActive
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold'
                              : 'bg-slate-50 border-slate-200/70 text-slate-700'
                          }`}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1 flex-1">
                              <input
                                type="text"
                                value={editingTermName}
                                onChange={(e) => setEditingTermName(e.target.value)}
                                className="flex-1 px-2 py-1 bg-white border border-indigo-300 rounded text-xs focus:outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveTermRename(term.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSelectTerm(term)}
                                className="flex-1 text-left truncate cursor-pointer"
                              >
                                {term.nameKh}
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTermId(term.id);
                                    setEditingTermName(term.nameKh);
                                  }}
                                  className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                                  title="កែឈ្មោះឆ្នាំសិក្សា"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {terms.length > 1 && isActive && (
                                  <button
                                    type="button"
                                    onClick={requestDeleteCurrentTerm}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                    title="លុបឆ្នាំសិក្សានេះ"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-500">
                      បង្កើតឆ្នាំសិក្សាថ្មី៖
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newTermKh}
                        onChange={(e) => setNewTermKh(e.target.value)}
                        placeholder="២០២៦ ~ ២០២៧"
                        className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleCreateTerm}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0"
                      >
                        បន្ថែម
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal: Add Class (+ បន្ថែមថ្នាក់) */}
        {showAddClassModal && (
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">
                + បន្ថែមថ្នាក់បង្រៀនថ្មី (ក្នុងឆ្នាំសិក្សា {currentTerm?.nameKh})
              </h4>
              <button
                type="button"
                onClick={() => setShowAddClassModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  លេខកូដថ្នាក់ (ឧ. 8D, 10B)
                </label>
                <input
                  type="text"
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                  placeholder="ឧ. 8D ឬ 10B"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ឈ្មោះថ្នាក់ (ខ្មែរ)
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="ឧ. ៨D ឬ ១០B"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">កម្រិតថ្នាក់</label>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value={7}>ថ្នាក់ទី ៧ (Grade 7)</option>
                  <option value={8}>ថ្នាក់ទី ៨ (Grade 8)</option>
                  <option value={9}>ថ្នាក់ទី ៩ (Grade 9)</option>
                  <option value={10}>ថ្នាក់ទី ១០ (Grade 10)</option>
                  <option value={11}>ថ្នាក់ទី ១១ (Grade 11)</option>
                  <option value={12}>ថ្នាក់ទី ១២ (Grade 12)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ថ្ងៃបង្រៀន</label>
                <input
                  type="text"
                  value={newClassDay}
                  onChange={(e) => setNewClassDay(e.target.value)}
                  placeholder="ថ្ងៃចន្ទ"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ម៉ោងបង្រៀន</label>
                <input
                  type="text"
                  value={newClassTime}
                  onChange={(e) => setNewClassTime(e.target.value)}
                  placeholder="15:00-16:30"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddClassModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleAddClass}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                រក្សាទុកថ្នាក់ថ្មី
              </button>
            </div>
          </div>
        )}

        {/* Modal: Edit / Delete Class or Change Term (កែប្រែថ្នាក់ / ប្តូរឆ្នាំសិក្សា) */}
        {showEditClassModal && currentClass && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">
                កែប្រែថ្នាក់ទី {currentClass.name} ({currentClass.id}) ឬលុបថ្នាក់
              </h4>
              <button
                type="button"
                onClick={() => setShowEditClassModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ឈ្មោះថ្នាក់
                </label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ថ្ងៃបង្រៀន
                </label>
                <input
                  type="text"
                  value={editClassDay}
                  onChange={(e) => setEditClassDay(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ម៉ោងបង្រៀន
                </label>
                <input
                  type="text"
                  value={editClassTime}
                  onChange={(e) => setEditClassTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ឆ្នាំសិក្សា / ឆមាស
                </label>
                <select
                  value={editClassTermId}
                  onChange={(e) => setEditClassTermId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nameKh}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleDeleteSelectedClass}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>លុបថ្នាក់ {currentClass.name} នេះ</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditClassModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditClass}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  រក្សាទុកការកែប្រែ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal: Delete Class */}
      {pendingDeleteClass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4 no-print"
          onClick={() => setPendingDeleteClass(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 font-khmer-battambang text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                បញ្ជាក់ការលុបថ្នាក់រៀន (确认删除班级)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                តើអ្នកពិតជាចង់លុប{' '}
                <strong className="text-rose-600 font-bold">
                  «ថ្នាក់ទី {pendingDeleteClass.name}»
                </strong>{' '}
                មែនទេ?
                <br />
                <span className="text-slate-500">
                  (确定要删除班级「{pendingDeleteClass.name}」吗？)
                </span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setPendingDeleteClass(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
              >
                បោះបង់ (取消)
              </button>
              <button
                type="button"
                onClick={confirmDeleteClass}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                យល់ព្រមលុប (确定删除)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Academic Term */}
      {pendingDeleteTerm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4 no-print"
          onClick={() => setPendingDeleteTerm(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 font-khmer-battambang text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                បញ្ជាក់ការលុបឆ្នាំសិក្សា (确认删除学年)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                តើអ្នកពិតជាចង់លុបឆ្នាំសិក្សា{' '}
                <strong className="text-rose-600 font-bold">
                  «{pendingDeleteTerm.nameKh}»
                </strong>{' '}
                មែនទេ?
                <br />
                <span className="text-slate-500">
                  (确定要删除学年「{pendingDeleteTerm.nameKh}」吗？)
                </span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setPendingDeleteTerm(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
              >
                បោះបង់ (取消)
              </button>
              <button
                type="button"
                onClick={confirmDeleteTerm}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                យល់ព្រមលុប (确定删除)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
