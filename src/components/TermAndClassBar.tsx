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
import { formatNumeral as formatNum } from '../utils/calculations';
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
  const [newClassTime, setNewClassTime] = useState('15:00-16:30');

  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const currentClass = state.classes.find((c) => c.id === selectedClassId) || state.classes[0];
  const [editClassName, setEditClassName] = useState(currentClass?.name || '');
  const [editClassDay, setEditClassDay] = useState(currentClass?.scheduleDayKh || '');
  const [editClassTime, setEditClassTime] = useState(currentClass?.scheduleTime || '');
  const [editClassTermId, setEditClassTermId] = useState(
    currentClass?.termId || state.currentTermId || 'term-2026-2027'
  );

  const terms: AcademicTerm[] =
    state.academicTerms && state.academicTerms.length > 0
      ? state.academicTerms
      : DEFAULT_ACADEMIC_TERMS;

  const currentTermId = state.currentTermId || terms[0]?.id || 'term-2026-2027';
  const currentTerm = terms.find((t) => t.id === currentTermId) || terms[0];

  // Always display ALL added classes so no class is ever hidden by termId filtering
  const displayedClasses = state.classes;

  const totalTermStudents = state.students.filter((s) =>
    displayedClasses.some((c) => c.id === s.classId)
  ).length;

  const normalizeClassId = (raw: string): string => {
    return raw
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
    onUpdateState((prev) => ({
      ...prev,
      currentTermId: term.id,
      schoolInfo: {
        ...prev.schoolInfo,
        academicYear: term.nameKh,
      },
      academicTerms: (prev.academicTerms || DEFAULT_ACADEMIC_TERMS).map((t) => ({
        ...t,
        isCurrent: t.id === term.id,
      })),
    }));
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
  };

  const handleSaveTermRename = (termId: string) => {
    const trimmed = editingTermName.trim();
    if (!trimmed) return;
    onUpdateState((prev) => ({
      ...prev,
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

  const handleDeleteCurrentTerm = () => {
    if (terms.length <= 1) return;
    const remaining = terms.filter((t) => t.id !== currentTermId);
    const nextTerm = remaining[0];
    onUpdateState((prev) => ({
      ...prev,
      currentTermId: nextTerm.id,
      schoolInfo: {
        ...prev.schoolInfo,
        academicYear: nextTerm.nameKh,
      },
      academicTerms: remaining.map((t, idx) => ({
        ...t,
        isCurrent: idx === 0,
      })),
    }));
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
      // First heal any existing class whose id doesn't match its name
      const nextClasses = prev.classes.map((c) => {
        const nId = normalizeClassId(c.id);
        const nName = normalizeClassId(c.name);
        if (nId && nName && nId !== nName && !prev.classes.some((o) => o !== c && normalizeClassId(o.id) === nName)) {
          return {
            ...c,
            id: nName,
            gradeLevel: inferGradeFromCode(nName, c.gradeLevel),
          };
        }
        return c;
      });

      tokens.forEach((token, idx) => {
        const classId = normalizeClassId(token);
        if (!classId) return;
        const customName =
          tokens.length === 1 && newClassName.trim()
            ? newClassName.trim().replace(/^ថ្នាក់ទី\s*/g, '').replace(/^ថ្នាក់\s*/g, '').trim()
            : token.replace(/^ថ្នាក់ទី\s*/g, '').replace(/^ថ្នាក់\s*/g, '').trim();
        const displayKh = customName || classId;
        const gradeLevel = inferGradeFromCode(classId, Number(newClassGrade) || 8);

        const existingIdx = nextClasses.findIndex(
          (c) =>
            normalizeClassId(c.id) === classId &&
            normalizeClassId(c.name) === normalizeClassId(displayKh)
        );

        if (existingIdx >= 0) {
          lastAddedId = nextClasses[existingIdx].id;
          return;
        }

        const uniqueId = nextClasses.some((c) => c.id === classId)
          ? `${classId}_${Date.now()}_${idx}`
          : classId;

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
    const newNormId = normalizeClassId(cleanName || currentClass.id);
    const oldId = currentClass.id;
    const canRenameId =
      newNormId &&
      newNormId !== oldId &&
      !state.classes.some((c) => c.id === newNormId && c.id !== oldId);
    const targetId = canRenameId ? newNormId : oldId;
    const inferredGrade = inferGradeFromCode(
      newNormId,
      currentClass.gradeLevel
    );

    onUpdateState((prev) => ({
      ...prev,
      classes: prev.classes.map((c) =>
        c.id === oldId
          ? {
              ...c,
              id: targetId,
              name: cleanName || c.name,
              gradeLevel: inferredGrade,
              scheduleDayKh: editClassDay.trim() || c.scheduleDayKh,
              scheduleTime: editClassTime.trim() || c.scheduleTime,
              termId: editClassTermId,
            }
          : c
      ),
      students: canRenameId
        ? prev.students.map((s) =>
            s.classId === oldId ? { ...s, classId: targetId } : s
          )
        : prev.students,
    }));
    if (canRenameId) {
      onSelectClass(targetId);
    }
    setShowEditClassModal(false);
  };

  const handleDeleteSelectedClass = () => {
    if (!currentClass || state.classes.length <= 1) return;
    const nextClasses = state.classes.filter((c) => c.id !== currentClass.id);
    onUpdateState((prev) => ({
      ...prev,
      classes: nextClasses,
      students: prev.students.filter((s) => s.classId !== currentClass.id),
    }));
    onSelectClass(nextClasses[0].id);
    setShowEditClassModal(false);
  };

  return (
    <div className="bg-white border-b border-slate-200 no-print font-khmer-battambang">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Class Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">
              ជ្រើសរើសថ្នាក់ (选择班级):
            </span>

            {displayedClasses.map((cls) => {
              const count = state.students.filter((s) => s.classId === cls.id).length;
              const isSelected = cls.id === selectedClassId;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => onSelectClass(cls.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>ថ្នាក់ {cls.name}</span>
                  <span
                    className={`text-[11px] font-mono ${
                      isSelected ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    ({formatNum(count, state.useKhmerNumerals)})
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowAddClassModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>បន្ថែមថ្នាក់</span>
            </button>

            <button
              type="button"
              onClick={openEditClassModal}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>កែប្រែថ្នាក់</span>
            </button>
          </div>

          {/* Right: Compact Academic Year Selector */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">ឆ្នាំសិក្សា៖</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTermMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>{currentTerm?.nameKh || state.schoolInfo.academicYear}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
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
                                    onClick={handleDeleteCurrentTerm}
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
                disabled={state.classes.length <= 1}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold disabled:opacity-40 cursor-pointer"
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
    </div>
  );
};
