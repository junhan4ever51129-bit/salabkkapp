import React, { useState } from 'react';
import {
  AppDatabaseState,
  ClassGroup,
  Gender,
  GradeThresholds,
  Language,
  MonthConfig,
  SchoolInfo,
  Student,
} from '../types';
import { t } from '../utils/i18n';
import {
  convertIsoDateToKhmerSignature,
  ddMmYyyyToIso,
  formatNumeral,
  isoToDdMmYyyy,
  sortAllStudentsInDatabase,
  sortStudentsByKhmerName,
} from '../utils/calculations';
import { AiGeneratorBar } from './AiGeneratorBar';
import { MarkdownCopyBar } from './MarkdownDocumentView';
import { SignatureDateEditor } from './SignatureDateEditor';
import {
  ArrowUpDown,
  Building2,
  Calendar,
  Clock,
  ListPlus,
  Plus,
  Search,
  Sliders,
  Trash2,
  UserPlus,
} from 'lucide-react';

interface Props {
  state: AppDatabaseState;
  lang: Language;
  selectedClassId: string;
  onSelectClassId: (id: string) => void;
  onUpdateState: (updater: (prev: AppDatabaseState) => AppDatabaseState) => void;
}

export const BasicSettingsModule: React.FC<Props> = ({
  state,
  lang,
  selectedClassId,
  onSelectClassId,
  onUpdateState,
}) => {
  const [subTab, setSubTab] = useState<'students' | 'classes' | 'school' | 'months'>('students');
  const [studentSearch, setStudentSearch] = useState('');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showBatchStudentModal, setShowBatchStudentModal] = useState(false);
  const [batchStudentText, setBatchStudentText] = useState('');
  const [batchReplaceExisting, setBatchReplaceExisting] = useState(false);

  const [showAddClassRow, setShowAddClassRow] = useState(false);
  const [newClassId, setNewClassId] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<number>(8);
  const [newClassDay, setNewClassDay] = useState('ថ្ងៃចន្ទ');
  const [newClassTime, setNewClassTime] = useState('15:00-16:30');

  const activeClass =
    state.classes.find((c) => c.id === selectedClassId) || state.classes[0];

  const rawClassStudents = state.students.filter((s) => s.classId === activeClass?.id);
  const classStudents = editingStudentId
    ? rawClassStudents
    : sortStudentsByKhmerName(rawClassStudents);
  const classFemaleCount = classStudents.filter((s) => s.gender === 'F').length;

  const allActiveStudents = state.students.filter((s) => s.status === 'active');
  const allFemaleStudents = allActiveStudents.filter((s) => s.gender === 'F');

  const [newStudent, setNewStudent] = useState({
    studentCode: '',
    name: '',
    chineseName: '',
    gender: 'F' as Gender,
    dob: '',
    note: '',
  });

  const handleSchoolChange = (field: keyof SchoolInfo, value: string | number) => {
    onUpdateState((prev) => ({
      ...prev,
      schoolInfo: {
        ...prev.schoolInfo,
        [field]: value,
      },
    }));
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !activeClass) return;
    const nextCode =
      newStudent.studentCode.trim() || String(classStudents.length + 1).padStart(2, '0');
    const created: Student = {
      id: `stu-${activeClass.id}-${Date.now()}`,
      classId: activeClass.id,
      studentCode: nextCode,
      name: newStudent.name.trim(),
      chineseName: newStudent.chineseName.trim(),
      gender: newStudent.gender,
      dob: newStudent.dob.trim(),
      status: 'active',
      note: newStudent.note.trim(),
    };

    onUpdateState((prev) => ({
      ...prev,
      students: sortAllStudentsInDatabase([...prev.students, created]),
    }));
    setShowAddStudentModal(false);
    setNewStudent({
      studentCode: '',
      name: '',
      chineseName: '',
      gender: 'F',
      dob: '',
      note: '',
    });
  };

  // Batch input parser: supports Excel tab-separated, pipe-separated, comma-separated, or plain lines
  const handleBatchStudentImport = () => {
    if (!batchStudentText.trim() || !activeClass) return;
    const lines = batchStudentText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const parsedStudents: Student[] = [];
    const baseIndex = batchReplaceExisting ? 0 : classStudents.length;

    lines.forEach((line, idx) => {
      const parts = line.includes('\t')
        ? line.split('\t').map((p) => p.trim())
        : line.includes('|')
        ? line.split('|').map((p) => p.trim())
        : line.includes(',')
        ? line.split(',').map((p) => p.trim())
        : [line];

      // Remove leading numbering like "1." or "១" if first column is just a small index and there are >=2 columns
      let cols = [...parts];
      if (cols.length >= 2 && /^[0-9០-៩]+\.?$/.test(cols[0])) {
        cols = cols.slice(1);
      }

      let name = cols[0] || '';
      let chineseName = '';
      let gender: Gender = 'F';
      let studentCode = String(baseIndex + idx + 1).padStart(2, '0');
      let dob = '';
      let note = '';

      for (let i = 1; i < cols.length; i++) {
        const val = cols[i];
        if (!val) continue;
        if (val === 'ប' || val.toUpperCase() === 'M' || val === 'ប្រុស' || val === '男') {
          gender = 'M';
        } else if (val === 'ស' || val.toUpperCase() === 'F' || val === 'ស្រី' || val === '女') {
          gender = 'F';
        } else if (/[\u4e00-\u9fa5]/.test(val) && !chineseName) {
          chineseName = val;
        } else if (/^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/.test(val) && !dob) {
          dob = val;
        } else if (/^\d{3,8}$/.test(val)) {
          studentCode = val;
        } else if (!chineseName && i === 1) {
          chineseName = val;
        } else {
          note = note ? `${note} ${val}` : val;
        }
      }

      if (name) {
        parsedStudents.push({
          id: `stu-${activeClass.id}-${Date.now()}-${idx}`,
          classId: activeClass.id,
          studentCode,
          name,
          chineseName,
          gender,
          dob,
          status: 'active',
          note,
        });
      }
    });

    if (parsedStudents.length === 0) return;

    onUpdateState((prev) => {
      const others = batchReplaceExisting
        ? prev.students.filter((s) => s.classId !== activeClass.id)
        : prev.students;
      return {
        ...prev,
        students: sortAllStudentsInDatabase([...others, ...parsedStudents]),
      };
    });

    setBatchStudentText('');
    setShowBatchStudentModal(false);
  };

  // AI / PDF Upload auto-generated student roster handler
  const handleAiStudentRosterResult = (rawData: unknown) => {
    if (!activeClass || !rawData) return;
    const rawList = Array.isArray(rawData)
      ? rawData
      : typeof rawData === 'object' && Array.isArray((rawData as { students?: unknown[] }).students)
      ? (rawData as { students: unknown[] }).students
      : [];
    if (rawList.length === 0) return;
    const baseIndex = classStudents.length;
    const generated: Student[] = rawList
      .map((item, idx): Student | null => {
        if (!item || typeof item !== 'object') return null;
        const r = item as Record<string, unknown>;
        const name = String(r.name || '').trim();
        if (!name) return null;
        const gRaw = String(r.gender || 'F').trim().toUpperCase();
        const gender: Gender =
          gRaw === 'M' || gRaw === 'ប' || gRaw === 'ប្រុស' || gRaw === '男' ? 'M' : 'F';
        return {
          id: `stu-${activeClass.id}-${Date.now()}-${idx}`,
          classId: activeClass.id,
          studentCode: String(r.studentCode || String(baseIndex + idx + 1).padStart(2, '0')),
          name,
          chineseName: String(r.chineseName || ''),
          gender,
          dob: String(r.dob || ''),
          status: 'active',
          note: String(r.note || ''),
        };
      })
      .filter((s): s is Student => s !== null);

    if (generated.length === 0) return;

    onUpdateState((prev) => ({
      ...prev,
      students: sortAllStudentsInDatabase([
        ...prev.students.filter((s) => s.classId !== activeClass.id),
        ...generated,
      ]),
    }));
  };

  const handleStudentFieldChange = (id: string, field: keyof Student, value: string) => {
    onUpdateState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  };

  const handleDeleteStudent = (id: string) => {
    onUpdateState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
    }));
  };

  const handleClassFieldChange = (
    id: string,
    field: keyof ClassGroup,
    value: string | number
  ) => {
    onUpdateState((prev) => ({
      ...prev,
      classes: prev.classes.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));
  };

  const handleAddClass = () => {
    const rawInput = (newClassId.trim() || newClassName.trim());
    if (!rawInput) return;
    const normCode = rawInput
      .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)))
      .replace(/^ថ្នាក់ទី\s*/g, '')
      .replace(/^ថ្នាក់\s*/g, '')
      .replace(/\s+/g, '')
      .toUpperCase();
    if (!normCode) return;

    const cleanName = (newClassName.trim() || rawInput)
      .replace(/^ថ្នាក់ទី\s*/g, '')
      .replace(/^ថ្នាក់\s*/g, '')
      .trim();
    const matchGrade = normCode.match(/^(7|8|9|10|11|12)/);
    const gradeLevel = matchGrade ? Number(matchGrade[1]) : Number(newClassGrade) || 8;

    let targetId = normCode;
    onUpdateState((prev) => {
      const healed = prev.classes.map((c) => {
        const cId = c.id
          .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)))
          .toUpperCase();
        const cName = c.name
          .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)))
          .replace(/^ថ្នាក់ទី\s*/g, '')
          .replace(/^ថ្នាក់\s*/g, '')
          .replace(/\s+/g, '')
          .toUpperCase();
        if (cId && cName && cId !== cName && !prev.classes.some((o) => o !== c && o.id === cName)) {
          return { ...c, id: cName };
        }
        return c;
      });

      const existing = healed.find(
        (c) =>
          c.id.toUpperCase() === normCode &&
          c.name.replace(/\s+/g, '').toUpperCase() === cleanName.replace(/\s+/g, '').toUpperCase()
      );
      if (existing) {
        targetId = existing.id;
        return { ...prev, classes: healed };
      }

      const uniqueId = healed.some((c) => c.id === normCode)
        ? `${normCode}_${Date.now()}`
        : normCode;
      targetId = uniqueId;

      const created: ClassGroup = {
        id: uniqueId,
        name: cleanName || normCode,
        gradeLevel,
        scheduleDayKh: newClassDay.trim() || 'ថ្ងៃចន្ទ',
        scheduleTime: newClassTime.trim() || '15:00-16:30',
        weeklyHoursLabel: '១ម៉ ៣០ន/ សប្តាហ៍',
        textbookName:
          gradeLevel >= 10
            ? '快乐汉语 (第二册) ភាសាចិនរីករាយ (កំរិត២)'
            : '快乐汉语 (第一册) ភាសាចិនរីករាយ (កំរិត១)',
        termId: state.currentTermId || 'term-2026-2027',
      };
      return {
        ...prev,
        classes: [...healed, created],
      };
    });
    onSelectClassId(targetId);
    setNewClassId('');
    setNewClassName('');
    setShowAddClassRow(false);
  };

  const handleDeleteClass = (classId: string) => {
    if (state.classes.length <= 1) return;
    const remaining = state.classes.filter((c) => c.id !== classId);
    onUpdateState((prev) => ({
      ...prev,
      classes: remaining,
      students: prev.students.filter((s) => s.classId !== classId),
    }));
    if (selectedClassId === classId) {
      onSelectClassId(remaining[0].id);
    }
  };

  const handleMonthChange = (
    id: string,
    field: keyof MonthConfig,
    value: string | number | boolean
  ) => {
    onUpdateState((prev) => ({
      ...prev,
      months: prev.months.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }));
  };

  const handleThresholdChange = (letter: keyof GradeThresholds, value: number) => {
    onUpdateState((prev) => ({
      ...prev,
      gradeThresholds: {
        ...prev.gradeThresholds,
        [letter]: Math.max(0, Math.min(100, value)),
      },
    }));
  };

  const filteredClassStudents = classStudents.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.chineseName.toLowerCase().includes(q) ||
      s.studentCode.toLowerCase().includes(q) ||
      s.note.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 font-khmer-battambang">
      {/* Clean Sub-navigation Tabs + Export Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs no-print">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setSubTab('students')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'students'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>១. បញ្ជីឈ្មោះសិស្ស (ថ្នាក់ {activeClass?.name})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('classes')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'classes'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>២. ថ្នាក់បង្រៀន & ម៉ោងសិក្សា ({state.classes.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('school')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'school'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>៣. ព័ត៌មានសាលា & គ្រូ</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('months')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'months'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>៤. ខែសិក្សា & កម្រិតនិទ្ទេស</span>
          </button>
        </div>

        <MarkdownCopyBar
          state={state}
          section="roster_schedule"
          selectedClassId={activeClass?.id || '8A'}
          selectedMonthId="feb"
        />
      </div>

      {/* TAB 1: STUDENT ROSTER BY CLASS (WITH BATCH INPUT, PDF UPLOAD AUTO-GENERATE & PDF EXPORT) */}
      {subTab === 'students' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          {/* Official Print Header (shown when exporting to PDF / printing) */}
          <div className="hidden print:block mb-4 text-slate-900 font-khmer-battambang">
            <div className="grid grid-cols-2 gap-2 items-start">
              <div className="space-y-1 text-left">
                <p className="text-xs font-bold">{state.schoolInfo.departmentKh}</p>
                <p className="text-xs font-normal font-khmer-moul">
                  {state.schoolInfo.schoolNameKh}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-normal font-khmer-moul">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p className="text-xs font-normal font-khmer-moul">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
              </div>
            </div>
            <div className="text-center my-3">
              <h1 className="text-base font-normal font-khmer-moul">
                បញ្ជីរាយនាមសិស្សថ្នាក់ទី {activeClass?.name} ឆ្នាំសិក្សា {state.schoolInfo.academicYear}
              </h1>
              <p className="text-xs font-bold mt-1">
                គ្រូមុខវិជ្ជា៖ អ្នកគ្រូ {state.schoolInfo.teacherName} · មុខវិជ្ជា៖{' '}
                {state.schoolInfo.subjectNameKh} · សិស្សសរុប {classStudents.length} នាក់ (ស្រី{' '}
                {classFemaleCount} នាក់)
              </p>
            </div>
          </div>

          {/* Concise Class Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 no-print">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
              <span className="font-bold text-slate-900 text-sm">
                ថ្នាក់ទី {activeClass?.name}
              </span>
              <span className="text-slate-300">|</span>
              <span>
                សិស្សសរុប <strong>{formatNumeral(classStudents.length, state.useKhmerNumerals)}</strong> នាក់ (ស្រី <strong>{formatNumeral(classFemaleCount, state.useKhmerNumerals)}</strong> នាក់)
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">
                {activeClass?.scheduleDayKh} · {activeClass?.scheduleTime}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddClassRow((v) => !v)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>បន្ថែមថ្នាក់ថ្មី</span>
              </button>
              {state.classes.length > 1 && activeClass && (
                <button
                  type="button"
                  onClick={() => handleDeleteClass(activeClass.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md cursor-pointer"
                >
                  <span>លុបថ្នាក់ {activeClass.name}</span>
                </button>
              )}
            </div>
          </div>

          {showAddClassRow && (
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex flex-wrap items-end gap-2.5 text-xs no-print">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">កូដថ្នាក់ (ឧ. 8D)</label>
                <input
                  type="text"
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                  placeholder="8D"
                  className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">ឈ្មោះថ្នាក់ (ខ្មែរ)</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="៨D"
                  className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">ថ្ងៃបង្រៀន</label>
                <input
                  type="text"
                  value={newClassDay}
                  onChange={(e) => setNewClassDay(e.target.value)}
                  className="w-28 px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">ម៉ោង</label>
                <input
                  type="text"
                  value={newClassTime}
                  onChange={(e) => setNewClassTime(e.target.value)}
                  className="w-28 px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
              <button
                type="button"
                onClick={handleAddClass}
                className="px-3.5 py-1.5 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 cursor-pointer"
              >
                រក្សាទុកថ្នាក់ថ្មី
              </button>
            </div>
          )}

          {/* Upload PDF / AI Auto-Generate Student Roster Bar */}
          <div className="no-print">
            <AiGeneratorBar
              taskType="student_roster"
              title={`បង្ហោះឯកសារ PDF ឬរូបភាព ដើម្បីបង្កើតបញ្ជីឈ្មោះសិស្សថ្នាក់ទី ${activeClass?.name} ស្វ័យប្រវត្តិ`}
              placeholder="បង្ហោះឯកសារ PDF បញ្ជីឈ្មោះសិស្ស ឬវាយបញ្ចូលឈ្មោះសិស្សដើម្បីបំប្លែងជាតារាងស្វ័យប្រវត្តិ..."
              contextData={{
                classId: activeClass?.id,
                className: activeClass?.name,
              }}
              onApplyResult={handleAiStudentRosterResult}
            />
          </div>

          {/* Search & Action Buttons Bar (Single Add, Batch Input, PDF Export) */}
          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកឈ្មោះខ្មែរ ឈ្មោះចិន (中文) ឬអត្តលេខ..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 w-72"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingStudentId(null);
                  onUpdateState((prev) => ({
                    ...prev,
                    students: sortAllStudentsInDatabase(prev.students),
                  }));
                }}
                title="តម្រៀបបញ្ជីឈ្មោះសិស្សតាមលំដាប់អក្ខរក្រមខ្មែរពី ក ដល់ អ"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>តម្រៀបឈ្មោះ ក → អ (ស្វ័យប្រវត្តិ)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBatchStudentModal((v) => !v)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <ListPlus className="w-4 h-4" />
                <span>បញ្ចូលឈ្មោះសិស្សជាក្រុម (Paste ច្រើននាក់)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddStudentModal((v) => !v)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {t(lang, 'addStudent')} (ថ្នាក់ទី {activeClass?.name})
              </button>
            </div>
          </div>

          {/* Modal: Batch Input Students (បញ្ចូលឈ្មោះសិស្សជាក្រុម) */}
          {showBatchStudentModal && (
            <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3 no-print">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    បញ្ចូលឈ្មោះសិស្សជាក្រុមក្នុងថ្នាក់ទី {activeClass?.name} (Copy & Paste ពី Excel / Word / PDF)
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    ១ជួរ = សិស្ស ១នាក់។ អាចដាក់៖ ឈ្មោះខ្មែរ, ឈ្មោះចិន, ភេទ (ស/ប), អត្តលេខ, ថ្ងៃខែឆ្នាំកំណើត (ឃ្លាដោយ Tab ឬ | ឬ ,)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBatchStudentModal(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  បោះបង់
                </button>
              </div>

              <textarea
                rows={6}
                value={batchStudentText}
                onChange={(e) => setBatchStudentText(e.target.value)}
                placeholder={`ឧទាហរណ៍៖\nខា សុខលីម\t卡若琳\tស\t18660\nខឿន រដ្ឋា\t柯洛他\tប\t18661\nគា រតនៈ\t吉若那\tប\t18662`}
                className="w-full p-3 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={batchReplaceExisting}
                    onChange={(e) => setBatchReplaceExisting(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span>ជំនួសបញ្ជីសិស្សចាស់ក្នុងថ្នាក់ទី {activeClass?.name} ទាំងស្រុង</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBatchStudentModal(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg cursor-pointer"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="button"
                    onClick={handleBatchStudentImport}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                  >
                    បញ្ចូលឈ្មោះសិស្សទាំងអស់
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAddStudentModal && (
            <form
              onSubmit={handleAddStudentSubmit}
              className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 no-print"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900">
                  បន្ថែមសិស្សថ្មីក្នុងថ្នាក់ទី {activeClass?.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  បោះបង់
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">{t(lang, 'studentCode')}</label>
                  <input
                    type="text"
                    placeholder="ឧ. 18660 ឬ 25"
                    value={newStudent.studentCode}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, studentCode: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-1">{t(lang, 'fullName')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. ខា សុខលីម"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">{t(lang, 'chineseName')}</label>
                  <input
                    type="text"
                    placeholder="ឧ. 卡若琳"
                    value={newStudent.chineseName}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, chineseName: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">{t(lang, 'gender')}</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, gender: e.target.value as Gender })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="F">ស (ស្រី)</option>
                    <option value="M">ប (ប្រុស)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 cursor-pointer"
                  >
                    រក្សាទុក
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Student Roster Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-2.5 px-3 w-12">ល.រ</th>
                  <th className="py-2.5 px-3 w-24">{t(lang, 'studentCode')}</th>
                  <th className="py-2.5 px-3 min-w-[180px]">{t(lang, 'fullName')}</th>
                  <th className="py-2.5 px-3 min-w-[130px]">{t(lang, 'chineseName')}</th>
                  <th className="py-2.5 px-3 w-20 text-center">{t(lang, 'gender')}</th>
                  <th className="py-2.5 px-3 w-36">{t(lang, 'dob')}</th>
                  <th className="py-2.5 px-3 min-w-[160px]">{t(lang, 'note')}</th>
                  <th className="py-2.5 px-3 w-24 text-right no-print">{t(lang, 'actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredClassStudents.map((stu, idx) => {
                  const isEditing = editingStudentId === stu.id;
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 font-mono tabular-nums text-slate-500">
                        {formatNumeral(idx + 1, state.useKhmerNumerals)}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">
                        {isEditing ? (
                          <input
                            type="text"
                            value={stu.studentCode}
                            onChange={(e) =>
                              handleStudentFieldChange(stu.id, 'studentCode', e.target.value)
                            }
                            className="w-20 px-1.5 py-1 border border-slate-300 rounded"
                          />
                        ) : (
                          stu.studentCode
                        )}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={stu.name}
                            onChange={(e) =>
                              handleStudentFieldChange(stu.id, 'name', e.target.value)
                            }
                            className="w-full px-1.5 py-1 border border-slate-300 rounded"
                          />
                        ) : (
                          stu.name
                        )}
                      </td>
                      <td className="py-2 px-3 font-medium text-indigo-950">
                        {isEditing ? (
                          <input
                            type="text"
                            value={stu.chineseName}
                            onChange={(e) =>
                              handleStudentFieldChange(stu.id, 'chineseName', e.target.value)
                            }
                            className="w-full px-1.5 py-1 border border-slate-300 rounded"
                          />
                        ) : (
                          stu.chineseName || '-'
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {isEditing ? (
                          <select
                            value={stu.gender}
                            onChange={(e) =>
                              handleStudentFieldChange(stu.id, 'gender', e.target.value)
                            }
                            className="px-1.5 py-1 border border-slate-300 rounded"
                          >
                            <option value="F">ស</option>
                            <option value="M">ប</option>
                          </select>
                        ) : (
                          <span
                            className={
                              stu.gender === 'F'
                                ? 'font-semibold text-emerald-700'
                                : 'text-slate-700'
                            }
                          >
                            {stu.gender === 'F' ? 'ស' : 'ប'}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono tabular-nums text-slate-600">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="date"
                              value={ddMmYyyyToIso(stu.dob)}
                              onChange={(e) => {
                                const picked = e.target.value;
                                if (!picked) return;
                                handleStudentFieldChange(stu.id, 'dob', isoToDdMmYyyy(picked));
                              }}
                              className="px-1.5 py-1 border border-slate-300 rounded text-xs cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder="DD/MM/YYYY"
                              value={stu.dob}
                              onChange={(e) =>
                                handleStudentFieldChange(stu.id, 'dob', e.target.value)
                              }
                              className="w-24 px-1.5 py-1 border border-slate-300 rounded"
                            />
                          </div>
                        ) : (
                          stu.dob || '-'
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {isEditing ? (
                          <input
                            type="text"
                            value={stu.note}
                            onChange={(e) =>
                              handleStudentFieldChange(stu.id, 'note', e.target.value)
                            }
                            className="w-full px-1.5 py-1 border border-slate-300 rounded"
                          />
                        ) : (
                          <span className={stu.note ? 'text-rose-700 font-medium' : ''}>
                            {stu.note || '-'}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap space-x-2 no-print">
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditing) {
                              setEditingStudentId(null);
                              onUpdateState((prev) => ({
                                ...prev,
                                students: sortAllStudentsInDatabase(prev.students),
                              }));
                            } else {
                              setEditingStudentId(stu.id);
                            }
                          }}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                          {isEditing ? 'រួចរាល់' : 'កែប្រែ'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(stu.id)}
                          className="text-slate-400 hover:text-rose-600 inline-flex items-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <SignatureDateEditor
            state={state}
            onUpdateState={onUpdateState}
            showPrincipalLeft={true}
          />
        </div>
      )}

      {/* TAB 2: TEACHING SCHEDULE ACROSS CLASSES */}
      {subTab === 'classes' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                កាលវិភាគបង្រៀនមុខវិជ្ជាភាសាចិនទាំង {formatNumeral(state.classes.length, state.useKhmerNumerals)} ថ្នាក់
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ឆ្នាំសិក្សា {state.schoolInfo.academicYear} · អ្នកគ្រូ {state.schoolInfo.teacherName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddClassRow((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 no-print cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែមថ្នាក់ថ្មី</span>
            </button>
          </div>

          {showAddClassRow && (
            <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl flex flex-wrap items-end gap-2.5 text-xs no-print">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">កូដថ្នាក់ (ឧ. 8D)</label>
                <input
                  type="text"
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                  placeholder="8D"
                  className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">ឈ្មោះថ្នាក់ (ខ្មែរ)</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="៨D"
                  className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">កម្រិតថ្នាក់</label>
                <input
                  type="number"
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(Number(e.target.value))}
                  className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">ថ្ងៃបង្រៀន</label>
                <input
                  type="text"
                  value={newClassDay}
                  onChange={(e) => setNewClassDay(e.target.value)}
                  className="w-28 px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">ម៉ោង</label>
                <input
                  type="text"
                  value={newClassTime}
                  onChange={(e) => setNewClassTime(e.target.value)}
                  className="w-28 px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
              <button
                type="button"
                onClick={handleAddClass}
                className="px-3.5 py-1.5 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 cursor-pointer"
              >
                រក្សាទុកថ្នាក់ថ្មី
              </button>
            </div>
          )}

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-2.5 px-3">ថ្នាក់ទី</th>
                  <th className="py-2.5 px-3">កម្រិតថ្នាក់</th>
                  <th className="py-2.5 px-3">ថ្ងៃបង្រៀន</th>
                  <th className="py-2.5 px-3">ម៉ោងបង្រៀន</th>
                  <th className="py-2.5 px-3">ចំនួនម៉ោង/សប្តាហ៍</th>
                  <th className="py-2.5 px-3 min-w-[240px]">សៀវភៅគោល (快乐汉语)</th>
                  <th className="py-2.5 px-3 text-center">សិស្សសរុប / ស្រី</th>
                  <th className="py-2.5 px-3 text-right no-print">លុប</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {state.classes.map((cls) => {
                  const stus = state.students.filter((s) => s.classId === cls.id);
                  const fem = stus.filter((s) => s.gender === 'F').length;
                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 font-bold text-indigo-900">
                        <input
                          type="text"
                          value={cls.name}
                          onChange={(e) =>
                            handleClassFieldChange(cls.id, 'name', e.target.value)
                          }
                          className="w-20 px-2 py-1 border border-slate-300 rounded font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 font-mono">ទី{cls.gradeLevel}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={cls.scheduleDayKh}
                          onChange={(e) =>
                            handleClassFieldChange(cls.id, 'scheduleDayKh', e.target.value)
                          }
                          className="w-28 px-2 py-1 border border-slate-300 rounded"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={cls.scheduleTime}
                          onChange={(e) =>
                            handleClassFieldChange(cls.id, 'scheduleTime', e.target.value)
                          }
                          className="w-28 px-2 py-1 font-mono border border-slate-300 rounded"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={cls.weeklyHoursLabel}
                          onChange={(e) =>
                            handleClassFieldChange(cls.id, 'weeklyHoursLabel', e.target.value)
                          }
                          className="w-36 px-2 py-1 border border-slate-300 rounded"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={cls.textbookName}
                          onChange={(e) =>
                            handleClassFieldChange(cls.id, 'textbookName', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                        />
                      </td>
                      <td className="py-2 px-3 text-center font-mono tabular-nums font-semibold">
                        {formatNumeral(stus.length, state.useKhmerNumerals)} នាក់ (ស្រី{' '}
                        {formatNumeral(fem, state.useKhmerNumerals)})
                      </td>
                      <td className="py-2 px-3 text-right no-print">
                        <button
                          type="button"
                          disabled={state.classes.length <= 1}
                          onClick={() => handleDeleteClass(cls.id)}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SCHOOL & CHINESE TEACHER INFO */}
      {subTab === 'school' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">{t(lang, 'tabSchool')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {t(lang, 'department')}
              </label>
              <input
                type="text"
                value={state.schoolInfo.departmentKh}
                onChange={(e) => handleSchoolChange('departmentKh', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">{t(lang, 'office')}</label>
              <input
                type="text"
                value={state.schoolInfo.officeKh}
                onChange={(e) => handleSchoolChange('officeKh', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ឈ្មោះសាលារៀន (អក្សរឆ្លាក់ Khmer Muol)
              </label>
              <input
                type="text"
                value={state.schoolInfo.schoolNameKh}
                onChange={(e) => handleSchoolChange('schoolNameKh', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md font-khmer-moul text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {t(lang, 'principalName')}
              </label>
              <input
                type="text"
                value={state.schoolInfo.principalName}
                onChange={(e) => handleSchoolChange('principalName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {t(lang, 'teacherName')}
              </label>
              <input
                type="text"
                value={state.schoolInfo.teacherName}
                onChange={(e) => handleSchoolChange('teacherName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ឋានៈមន្ត្រីរាជការ / តួនាទី
              </label>
              <input
                type="text"
                value={state.schoolInfo.teacherPositionKh}
                onChange={(e) => handleSchoolChange('teacherPositionKh', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {t(lang, 'maxScore')} (ទី៨ និងទី៩ = 50 ពិន្ទុ · ទី១០ = 100 ពិន្ទុ)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={state.schoolInfo.maxScore}
                onChange={(e) =>
                  handleSchoolChange('maxScore', parseFloat(e.target.value) || 50)
                }
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {t(lang, 'academicYear')}
              </label>
              <input
                type="text"
                value={state.schoolInfo.academicYear}
                onChange={(e) => handleSchoolChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MONTHS & GRADE THRESHOLDS */}
      {subTab === 'months' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">
                {t(lang, 'gradeThresholdsTitle')}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
              {(['A', 'B', 'C', 'D', 'E'] as const).map((letter) => (
                <div key={letter} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-xs font-semibold text-slate-700">
                    និទ្ទេស {letter} (≥ %)
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={state.gradeThresholds[letter]}
                    onChange={(e) => handleThresholdChange(letter, Number(e.target.value))}
                    className="mt-1.5 w-full px-2.5 py-1.5 font-mono tabular-nums text-sm font-semibold border border-slate-300 rounded bg-white"
                  />
                </div>
              ))}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-xs font-semibold text-rose-700">និទ្ទេស F (&lt; %)</div>
                <div className="mt-1.5 px-2.5 py-1.5 font-mono tabular-nums text-sm font-semibold text-slate-600 bg-slate-100 rounded border border-slate-200">
                  &lt; {state.gradeThresholds.E}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              ការកំណត់ខែប្រឡង និងកាលបរិច្ឆេទចន្ទគតិ/សុរិយគតិ
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Active</th>
                    <th className="py-2.5 px-3">ខែ</th>
                    <th className="py-2.5 px-3">ឆមាស</th>
                    <th className="py-2.5 px-3">ជ្រើសរើសថ្ងៃ/ខែ (ប្រតិទិន)</th>
                    <th className="py-2.5 px-3 min-w-[240px]">{t(lang, 'lunarDate')}</th>
                    <th className="py-2.5 px-3 min-w-[220px]">{t(lang, 'gregorianDate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {state.months.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3">
                        <input
                          type="checkbox"
                          checked={m.enabled}
                          onChange={(e) => handleMonthChange(m.id, 'enabled', e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {m.nameKh} ({m.nameEn})
                      </td>
                      <td className="py-2 px-3">ឆមាសទី{m.semester}</td>
                      <td className="py-2 px-3">
                        <input
                          type="date"
                          onChange={(e) => {
                            const picked = e.target.value;
                            if (!picked) return;
                            const conv = convertIsoDateToKhmerSignature(picked);
                            onUpdateState((prev) => ({
                              ...prev,
                              months: prev.months.map((item) =>
                                item.id === m.id
                                  ? {
                                      ...item,
                                      lunarDate: conv.fullLunarString,
                                      gregorianDate: conv.fullGregorianString,
                                    }
                                  : item
                              ),
                            }));
                          }}
                          className="px-2 py-1 bg-white border border-slate-300 rounded font-bold text-xs cursor-pointer"
                          title="ចុចជ្រើសរើសថ្ងៃ/ខែពីប្រតិទិន ដើម្បីបំពេញចន្ទគតិ និងសុរិយគតិស្វ័យប្រវត្តិ"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={m.lunarDate}
                          onChange={(e) => handleMonthChange(m.id, 'lunarDate', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={m.gregorianDate}
                          onChange={(e) =>
                            handleMonthChange(m.id, 'gregorianDate', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
