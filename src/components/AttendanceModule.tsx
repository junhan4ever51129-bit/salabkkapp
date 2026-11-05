import React, { useMemo, useState } from 'react';
import { AppDatabaseState, AttendanceStatus, Gender, Language, Student } from '../types';
import {
  calculateStudentSessionAttendance,
  convertIsoDateToKhmerSignature,
  formatNumeral,
  sortAllStudentsInDatabase,
  sortStudentsByKhmerName,
} from '../utils/calculations';
import { AiGeneratorBar } from './AiGeneratorBar';
import { MarkdownCopyBar } from './MarkdownDocumentView';
import { MonthSelectorBar } from './MonthSelectorBar';
import { SignatureDateEditor } from './SignatureDateEditor';
import {
  Calendar,
  CheckCircle2,
  Columns,
  Rows,
  Trash2,
  UserPlus,
} from 'lucide-react';

interface Props {
  state: AppDatabaseState;
  lang: Language;
  selectedClassId: string;
  onSelectClassId: (id: string) => void;
  selectedMonthId: string;
  onSelectMonthId: (id: string) => void;
  onUpdateState: (updater: (prev: AppDatabaseState) => AppDatabaseState) => void;
}

const CYCLE_ORDER: AttendanceStatus[] = ['P', 'E', 'U', 'L', ''];

export const AttendanceModule: React.FC<Props> = ({
  state,
  selectedClassId,
  onSelectClassId,
  selectedMonthId,
  onSelectMonthId,
  onUpdateState,
}) => {
  const activeClass =
    state.classes.find((c) => c.id === selectedClassId) || state.classes[0];

  const enabledMonths = useMemo(
    () => state.months.filter((m) => m.enabled),
    [state.months]
  );

  const activeMonth =
    enabledMonths.find((m) => m.id === selectedMonthId) ||
    enabledMonths.find((m) => m.id === 'nov') ||
    enabledMonths[0] ||
    state.months[0];

  const sheetConfig = useMemo(() => {
    return (
      state.attendanceSheetConfigs?.[activeClass.id]?.[activeMonth.id] || {
        monthHeaderLabel: `${activeMonth.nameKh} ~ ............`,
        columnCount: 10,
        blankRowsCount: 2,
      }
    );
  }, [state.attendanceSheetConfigs, activeClass.id, activeMonth.id, activeMonth.nameKh]);

  const columnCount = Math.max(4, Math.min(16, sheetConfig.columnCount ?? 10));
  const blankRowsCount = Math.max(0, Math.min(15, sheetConfig.blankRowsCount ?? 2));

  const sessionIndices = useMemo(
    () => Array.from({ length: columnCount }, (_, i) => i + 1),
    [columnCount]
  );

  const [editingNameStudentId, setEditingNameStudentId] = useState<string | null>(null);

  const classStudents = useMemo(() => {
    const raw = state.students.filter((s) => s.classId === activeClass?.id);
    return editingNameStudentId ? raw : sortStudentsByKhmerName(raw);
  }, [state.students, activeClass?.id, editingNameStudentId]);

  const femaleCount = useMemo(
    () => classStudents.filter((s) => s.gender === 'F').length,
    [classStudents]
  );

  const updateSheetConfig = (
    patch: Partial<{ monthHeaderLabel: string; columnCount: number; blankRowsCount: number }>
  ) => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    onUpdateState((prev) => {
      const current = prev.attendanceSheetConfigs?.[cId]?.[mId] || {
        monthHeaderLabel: `${activeMonth.nameKh} ~ ............`,
        columnCount: 10,
        blankRowsCount: 2,
      };
      return {
        ...prev,
        attendanceSheetConfigs: {
          ...(prev.attendanceSheetConfigs || {}),
          [cId]: {
            ...(prev.attendanceSheetConfigs?.[cId] || {}),
            [mId]: {
              ...current,
              ...patch,
            },
          },
        },
      };
    });
  };

  const handleCycleSessionStatus = (studentId: string, sessionIdx: number) => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    const current: AttendanceStatus =
      state.attendance[cId]?.[mId]?.[studentId]?.[sessionIdx] || '';
    const nextStatus = CYCLE_ORDER[(CYCLE_ORDER.indexOf(current) + 1) % CYCLE_ORDER.length];

    onUpdateState((prev) => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [cId]: {
          ...(prev.attendance[cId] || {}),
          [mId]: {
            ...(prev.attendance[cId]?.[mId] || {}),
            [studentId]: {
              ...(prev.attendance[cId]?.[mId]?.[studentId] || {}),
              [sessionIdx]: nextStatus,
            },
          },
        },
      },
    }));
  };

  const handleMarkSessionAllPresent = (sessionIdx: number) => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    onUpdateState((prev) => {
      const nextMonthAtt = { ...(prev.attendance[cId]?.[mId] || {}) };
      classStudents.forEach((stu) => {
        const isNeverPresent = (stu.note || '').includes('មិនដែលមករៀន');
        nextMonthAtt[stu.id] = {
          ...(nextMonthAtt[stu.id] || {}),
          [sessionIdx]: isNeverPresent ? 'U' : 'P',
        };
      });
      return {
        ...prev,
        attendance: {
          ...prev.attendance,
          [cId]: {
            ...(prev.attendance[cId] || {}),
            [mId]: nextMonthAtt,
          },
        },
      };
    });
  };

  const handleSessionMonthChange = (sessionIdx: number, monthStr: string) => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    onUpdateState((prev) => ({
      ...prev,
      sessionMonths: {
        ...(prev.sessionMonths || {}),
        [cId]: {
          ...(prev.sessionMonths?.[cId] || {}),
          [mId]: {
            ...(prev.sessionMonths?.[cId]?.[mId] || {}),
            [sessionIdx]: monthStr,
          },
        },
      },
    }));
  };

  const handleSessionDateChange = (sessionIdx: number, dateStr: string) => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    onUpdateState((prev) => ({
      ...prev,
      sessionDates: {
        ...prev.sessionDates,
        [cId]: {
          ...(prev.sessionDates[cId] || {}),
          [mId]: {
            ...(prev.sessionDates[cId]?.[mId] || {}),
            [sessionIdx]: dateStr,
          },
        },
      },
    }));
  };

  const handlePickSessionCalendarDate = (sessionIdx: number, isoDate: string) => {
    if (!isoDate) return;
    const conv = convertIsoDateToKhmerSignature(isoDate);
    const cId = activeClass.id;
    const mId = activeMonth.id;
    onUpdateState((prev) => ({
      ...prev,
      sessionMonths: {
        ...(prev.sessionMonths || {}),
        [cId]: {
          ...(prev.sessionMonths?.[cId] || {}),
          [mId]: {
            ...(prev.sessionMonths?.[cId]?.[mId] || {}),
            [sessionIdx]: conv.gregorianMonth,
          },
        },
      },
      sessionDates: {
        ...prev.sessionDates,
        [cId]: {
          ...(prev.sessionDates[cId] || {}),
          [mId]: {
            ...(prev.sessionDates[cId]?.[mId] || {}),
            [sessionIdx]: conv.dayTwoDigit,
          },
        },
      },
    }));
  };

  const handleAutoFillWeeklyDatesFromStart = (startIso: string) => {
    if (!startIso) return;
    const [yStr, mStr, dStr] = startIso.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10) - 1;
    const d = parseInt(dStr, 10);
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return;

    const cId = activeClass.id;
    const mId = activeMonth.id;
    const monthMap: Record<number, string> = {};
    const dayMap: Record<number, string> = {};
    const uniqueMonths: string[] = [];

    sessionIndices.forEach((sIdx, i) => {
      const dt = new Date(y, m, d + i * 7);
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
        dt.getDate()
      ).padStart(2, '0')}`;
      const conv = convertIsoDateToKhmerSignature(iso);
      monthMap[sIdx] = conv.gregorianMonth;
      dayMap[sIdx] = conv.dayTwoDigit;
      if (!uniqueMonths.includes(conv.gregorianMonth)) {
        uniqueMonths.push(conv.gregorianMonth);
      }
    });

    onUpdateState((prev) => ({
      ...prev,
      attendanceSheetConfigs: {
        ...(prev.attendanceSheetConfigs || {}),
        [cId]: {
          ...(prev.attendanceSheetConfigs?.[cId] || {}),
          [mId]: {
            ...(prev.attendanceSheetConfigs?.[cId]?.[mId] || {
              columnCount,
              blankRowsCount,
            }),
            monthHeaderLabel: uniqueMonths.join(' ~ '),
          },
        },
      },
      sessionMonths: {
        ...(prev.sessionMonths || {}),
        [cId]: {
          ...(prev.sessionMonths?.[cId] || {}),
          [mId]: monthMap,
        },
      },
      sessionDates: {
        ...prev.sessionDates,
        [cId]: {
          ...(prev.sessionDates[cId] || {}),
          [mId]: dayMap,
        },
      },
    }));
  };

  const handleStudentFieldChange = (
    studentId: string,
    field: 'name' | 'chineseName' | 'gender' | 'note',
    value: string
  ) => {
    onUpdateState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, [field]: value } : s
      ),
    }));
  };

  const handleAddStudentRow = () => {
    const nextIdx = classStudents.length + 1;
    const newStu: Student = {
      id: `stu-${activeClass.id}-${Date.now()}`,
      classId: activeClass.id,
      studentCode: String(nextIdx).padStart(2, '0'),
      name: '',
      chineseName: '',
      gender: 'F',
      dob: '',
      status: 'active',
      note: '',
    };
    onUpdateState((prev) => ({
      ...prev,
      students: [...prev.students, newStu],
    }));
  };

  const handleDeleteStudentRow = (studentId: string) => {
    onUpdateState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
    }));
  };

  const handleAiAttendanceResult = (data: unknown, mode: 'replace' | 'append') => {
    if (!data || typeof data !== 'object') return;
    const parsed = data as {
      monthRangeLabel?: string;
      sessionColumns?: { monthLabel?: string; dayLabel?: string }[];
      students?: { name?: string; chineseName?: string; gender?: 'M' | 'F'; note?: string }[];
    };

    const cId = activeClass.id;
    const mId = activeMonth.id;

    onUpdateState((prev) => {
      let nextState = { ...prev };

      if (parsed.monthRangeLabel) {
        const curCfg = nextState.attendanceSheetConfigs?.[cId]?.[mId] || {
          columnCount: 10,
          blankRowsCount: 2,
        };
        nextState = {
          ...nextState,
          attendanceSheetConfigs: {
            ...(nextState.attendanceSheetConfigs || {}),
            [cId]: {
              ...(nextState.attendanceSheetConfigs?.[cId] || {}),
              [mId]: {
                ...curCfg,
                monthHeaderLabel: parsed.monthRangeLabel,
                columnCount: parsed.sessionColumns?.length
                  ? Math.max(4, Math.min(16, parsed.sessionColumns.length))
                  : curCfg.columnCount,
              },
            },
          },
        };
      }

      if (Array.isArray(parsed.sessionColumns) && parsed.sessionColumns.length > 0) {
        const monthMap: Record<number, string> = {};
        const dayMap: Record<number, string> = {};
        parsed.sessionColumns.forEach((col, i) => {
          monthMap[i + 1] = col.monthLabel || '';
          dayMap[i + 1] = col.dayLabel || '';
        });
        nextState = {
          ...nextState,
          sessionMonths: {
            ...(nextState.sessionMonths || {}),
            [cId]: {
              ...(nextState.sessionMonths?.[cId] || {}),
              [mId]: monthMap,
            },
          },
          sessionDates: {
            ...nextState.sessionDates,
            [cId]: {
              ...(nextState.sessionDates[cId] || {}),
              [mId]: dayMap,
            },
          },
        };
      }

      if (Array.isArray(parsed.students) && parsed.students.length > 0) {
        const otherClassStudents = nextState.students.filter((s) => s.classId !== cId);
        const existingClassStudents = nextState.students.filter((s) => s.classId === cId);
        const builtStudents: Student[] = parsed.students.map((st, idx) => ({
          id: `stu-${cId}-ai-${Date.now()}-${idx}`,
          classId: cId,
          studentCode: String(
            (mode === 'append' ? existingClassStudents.length : 0) + idx + 1
          ).padStart(2, '0'),
          name: st.name || '',
          chineseName: st.chineseName || '',
          gender: (st.gender === 'M' ? 'M' : 'F') as Gender,
          dob: '',
          status: 'active',
          note: st.note || '',
        }));

        nextState = {
          ...nextState,
          students: sortAllStudentsInDatabase(
            mode === 'replace'
              ? [...otherClassStudents, ...builtStudents]
              : [...nextState.students, ...builtStudents]
          ),
        };
      }

      return nextState;
    });
  };

  const renderStatusCell = (status: AttendanceStatus) => {
    switch (status) {
      case 'P':
        return { label: '✓', cls: 'text-emerald-700 bg-emerald-50/50 font-bold' };
      case 'E':
        return { label: 'P', cls: 'text-amber-800 bg-amber-100/70 font-bold' };
      case 'U':
        return { label: 'A', cls: 'text-rose-800 bg-rose-100/70 font-bold' };
      case 'L':
        return { label: 'L', cls: 'text-sky-800 bg-sky-100/70 font-bold' };
      default:
        return { label: '', cls: 'text-slate-300 hover:bg-slate-50' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar (Hidden when printing) */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2.5 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <MonthSelectorBar
            state={state}
            activeMonthId={activeMonth?.id || 'nov'}
            onSelectMonthId={onSelectMonthId}
            onUpdateState={onUpdateState}
            labelKh="សន្លឹកវត្តមាន៖"
          />

          <MarkdownCopyBar
            state={state}
            section="attendance"
            selectedClassId={activeClass?.id || '8A'}
            selectedMonthId={activeMonth?.id || 'nov'}
          />
        </div>

        {/* Dynamic Row/Col Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">

          {/* Add/Remove Columns, Students, and Blank Rows */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-200">
              <Columns className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-700">ជួរឈរថ្ងៃសិក្សា ({columnCount}):</span>
              <button
                type="button"
                onClick={() => updateSheetConfig({ columnCount: Math.max(4, columnCount - 1) })}
                className="px-1.5 py-0.5 bg-white border border-slate-300 rounded hover:bg-slate-50 font-bold"
                title="បន្ថយជួរឈរ"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => updateSheetConfig({ columnCount: Math.min(16, columnCount + 1) })}
                className="px-1.5 py-0.5 bg-white border border-slate-300 rounded hover:bg-slate-50 font-bold"
                title="បន្ថែមជួរឈរ"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-200">
              <Rows className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-700">ជួរទទេខាងក្រោម ({blankRowsCount}):</span>
              <button
                type="button"
                onClick={() =>
                  updateSheetConfig({ blankRowsCount: Math.max(0, blankRowsCount - 1) })
                }
                className="px-1.5 py-0.5 bg-white border border-slate-300 rounded hover:bg-slate-50 font-bold"
              >
                -
              </button>
              <button
                type="button"
                onClick={() =>
                  updateSheetConfig({ blankRowsCount: Math.min(15, blankRowsCount + 1) })
                }
                className="px-1.5 py-0.5 bg-white border border-slate-300 rounded hover:bg-slate-50 font-bold"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddStudentRow}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-medium hover:bg-indigo-100"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + បន្ថែមសិស្ស
            </button>
          </div>
        </div>

        {/* Legend + Weekly Start Date Picker */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              💡 <strong>ចុចជ្រើសរើសថ្ងៃសិក្សាពីប្រតិទិន៖</strong> អាចចុចជ្រើសរើសថ្ងៃទី១ ដើម្បីបំពេញខែ និងថ្ងៃទីរៀងរាល់សប្តាហ៍ ឬចុចប្រតិទិនក្នុងជួរឈរនីមួយៗ៖
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
              <Calendar className="w-3.5 h-3.5" />
              <span>ថ្ងៃចាប់ផ្តើមសប្តាហ៍ទី១:</span>
              <input
                type="date"
                onChange={(e) => handleAutoFillWeeklyDatesFromStart(e.target.value)}
                className="bg-white px-2 py-0.5 rounded border border-slate-300 text-xs font-bold cursor-pointer"
                title="ជ្រើសរើសថ្ងៃសិក្សាដំបូង ដើម្បីបំពេញខែ និងថ្ងៃទីគ្រប់ជួរឈរស្វ័យប្រវត្តិ (+7 ថ្ងៃ)"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> ✓ = មករៀន
            </span>
            <span>·</span>
            <span className="text-amber-700 font-medium">P = ច្បាប់</span>
            <span>·</span>
            <span className="text-rose-700 font-medium">A = អត់ច្បាប់</span>
            <span>·</span>
            <span className="text-sky-700 font-medium">L = មកយឺត</span>
          </div>
        </div>
      </div>

      {/* AI & File Upload Auto-Generation Bar */}
      <AiGeneratorBar
        taskType="attendance"
        titleKh="AI បង្កើត ឬបង្ហោះឯកសារបញ្ជីវត្តមានសិស្ស និងកាលបរិច្ឆេទសិក្សា"
        placeholderKh="ឧ. បង្កើតកាលបរិច្ឆេទថ្ងៃអង្គារ ខែវិច្ឆិកា និងខែធ្នូ ២០២៥ ឬបង្ហោះរូបភាព/PDF/Excel បញ្ជីឈ្មោះសិស្ស..."
        defaultPrompt={`Generate multi-month weekly session columns (ខែ and ថ្ងៃទី) for class ${activeClass.id} (${activeClass.scheduleDayKh}) spanning November and December 2025.`}
        onResult={handleAiAttendanceResult}
      />

      {/* Official A4 Attendance Sheet matching PDF 1 & User's Typography Specification */}
      <div className="bg-white border border-slate-300 rounded-lg p-8 max-w-[210mm] mx-auto print-container space-y-3 font-khmer-battambang text-slate-950">
        {/* Top Kingdom & School Header (Khmer Muol for Department & School Name, NO Chinese School Name) */}
        <div className="grid grid-cols-2 gap-4 items-start text-xs">
          <div className="space-y-1.5">
            <div className="font-khmer-moul text-xs text-slate-950">
              {state.schoolInfo.departmentKh}
            </div>
            <div className="font-khmer-moul text-xs text-slate-950">
              {state.schoolInfo.schoolNameKh}
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="font-khmer-moul text-sm text-slate-950">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div className="font-khmer-moul text-xs text-slate-900">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
          </div>
        </div>

        {/* Title Block */}
        <div className="text-center space-y-1 pt-1">
          <h2 className="font-khmer-moul text-base text-slate-950">
            បញ្ជីស្រង់វត្តមានសិស្សថ្នាក់ទី {activeClass?.id}
          </h2>
          <div className="font-khmer-moul text-sm text-slate-900 flex items-center justify-center gap-1">
            <span>ប្រចាំខែ</span>
            <input
              type="text"
              value={sheetConfig.monthHeaderLabel ?? ''}
              placeholder="........................"
              onChange={(e) => updateSheetConfig({ monthHeaderLabel: e.target.value })}
              className="font-khmer-battambang font-bold text-sm text-center border-b border-dotted border-slate-600 bg-transparent focus:outline-none w-44"
            />
          </div>
          <div className="font-khmer-battambang font-bold text-xs text-slate-950">
            ឆ្នាំសិក្សា {formatNumeral(state.schoolInfo.academicYear, true)}
          </div>
        </div>

        {/* Teacher, Subject & Schedule Meta Strip in Khmer OS Battambang */}
        <div className="flex flex-wrap items-end justify-between gap-2 text-xs font-khmer-battambang text-slate-950 pt-1">
          <div className="space-y-0.5">
            <div>
              គ្រូមុខវិជ្ជា ៖ <strong>{state.schoolInfo.teacherName}</strong>
            </div>
            <div>
              មុខវិជ្ជា ៖ <strong>{state.schoolInfo.subjectNameKh}</strong>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-bold">{activeClass?.scheduleDayKh}</span>
            <span>
              ម៉ោង ៖ <strong className="font-mono">{activeClass?.scheduleTime}</strong> (
              {activeClass?.weeklyHoursLabel})
            </span>
          </div>
        </div>

        {/* Main Multi-Month Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-900 text-xs font-khmer-battambang">
            <thead>
              <tr className="text-slate-950 font-bold">
                <th className="border border-slate-900 py-1.5 px-1.5 text-center w-9">ល.រ</th>
                <th className="border border-slate-900 py-1.5 px-2.5 min-w-[215px] text-center">
                  គោត្តនាម-នាម
                </th>
                <th className="border border-slate-900 p-0 text-center w-12 text-[11px] leading-tight">
                  <div className="py-1 border-b border-slate-900">ខែ</div>
                  <div className="py-1 border-b border-slate-900">ថ្ងៃទី</div>
                  <div className="py-1">ភេទ</div>
                </th>
                {sessionIndices.map((sIdx) => {
                  const monthLabel =
                    state.sessionMonths?.[activeClass.id]?.[activeMonth.id]?.[sIdx] || '';
                  const dateLabel =
                    state.sessionDates[activeClass.id]?.[activeMonth.id]?.[sIdx] || '';
                  return (
                    <th
                      key={sIdx}
                      className="border border-slate-900 p-0 text-center w-11 align-top"
                    >
                      {/* Direct Calendar Date Picker for this column (Hidden in print) */}
                      <div className="no-print border-b border-slate-200 bg-slate-50 px-0.5 py-0.5">
                        <input
                          type="date"
                          onChange={(e) => handlePickSessionCalendarDate(sIdx, e.target.value)}
                          title="ចុចជ្រើសរើសថ្ងៃ/ខែពីប្រតិទិន"
                          className="w-full text-[9px] bg-white border border-slate-300 rounded px-0.5 cursor-pointer"
                        />
                      </div>
                      {/* Row 1: ខែ (Month) */}
                      <input
                        type="text"
                        placeholder="ខែ"
                        value={monthLabel}
                        onChange={(e) => handleSessionMonthChange(sIdx, e.target.value)}
                        className="w-full py-1 px-0.5 text-center font-khmer-battambang text-[10px] border-b border-slate-900 bg-transparent focus:outline-none focus:bg-indigo-50/40"
                      />
                      {/* Row 2: ថ្ងៃទី (Day) */}
                      <input
                        type="text"
                        placeholder={`ទី${sIdx}`}
                        value={dateLabel}
                        onChange={(e) => handleSessionDateChange(sIdx, e.target.value)}
                        className="w-full py-1 px-0.5 text-center font-mono text-[10px] border-b border-slate-300 bg-transparent focus:outline-none focus:bg-indigo-50/40"
                      />
                      {/* Quick Mark All Present Button (Hidden in print) */}
                      <button
                        type="button"
                        onClick={() => handleMarkSessionAllPresent(sIdx)}
                        title="ដាក់វត្តមានមករៀនទាំងអស់ (Mark All Present)"
                        className="w-full py-0.5 text-[9px] text-indigo-600 hover:bg-indigo-50 no-print font-normal"
                      >
                        ✓ទាំងអស់
                      </button>
                    </th>
                  );
                })}
                <th className="border border-slate-900 py-1.5 px-2 text-center min-w-[115px]">
                  ផ្សេងៗ
                </th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((stu, idx) => {
                const studentSessions =
                  state.attendance[activeClass.id]?.[activeMonth.id]?.[stu.id];
                const attSum = calculateStudentSessionAttendance(studentSessions);

                return (
                  <tr key={stu.id} className="hover:bg-slate-50/70 group">
                    <td className="border border-slate-900 py-1 px-1.5 text-center font-khmer-battambang tabular-nums">
                      {formatNumeral(idx + 1, true)}
                    </td>
                    <td className="border border-slate-900 py-0.5 px-2">
                      <div className="flex items-center justify-between gap-1.5">
                        <input
                          type="text"
                          value={stu.name}
                          placeholder="គោត្តនាម-នាម..."
                          onFocus={() => setEditingNameStudentId(stu.id)}
                          onBlur={() => {
                            setEditingNameStudentId(null);
                            onUpdateState((prev) => ({
                              ...prev,
                              students: sortAllStudentsInDatabase(prev.students),
                            }));
                          }}
                          onChange={(e) =>
                            handleStudentFieldChange(stu.id, 'name', e.target.value)
                          }
                          className="w-full font-khmer-battambang text-xs text-slate-950 bg-transparent focus:outline-none focus:bg-indigo-50/40"
                        />
                        <input
                          type="text"
                          value={stu.chineseName}
                          placeholder="中文名"
                          onChange={(e) =>
                            handleStudentFieldChange(stu.id, 'chineseName', e.target.value)
                          }
                          className="w-16 text-right text-xs text-slate-900 bg-transparent focus:outline-none focus:bg-indigo-50/40 shrink-0"
                        />
                      </div>
                    </td>
                    <td className="border border-slate-900 py-0.5 px-1 text-center font-khmer-battambang">
                      <button
                        type="button"
                        onClick={() =>
                          handleStudentFieldChange(
                            stu.id,
                            'gender',
                            stu.gender === 'F' ? 'M' : 'F'
                          )
                        }
                        title="ចុចដើម្បីប្តូរភេទ (ស / ប)"
                        className="w-full text-center font-khmer-battambang text-xs text-slate-950 hover:text-indigo-700"
                      >
                        {stu.gender === 'F' ? 'ស' : 'ប'}
                      </button>
                    </td>
                    {sessionIndices.map((sIdx) => {
                      const status: AttendanceStatus = studentSessions?.[sIdx] || '';
                      const cell = renderStatusCell(status);
                      return (
                        <td
                          key={sIdx}
                          onClick={() => handleCycleSessionStatus(stu.id, sIdx)}
                          className={`border border-slate-900 py-1 px-0.5 text-center font-mono cursor-pointer select-none ${cell.cls}`}
                        >
                          {cell.label}
                        </td>
                      );
                    })}
                    <td className="border border-slate-900 py-0.5 px-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <input
                          type="text"
                          value={stu.note}
                          placeholder=""
                          onChange={(e) =>
                            handleStudentFieldChange(stu.id, 'note', e.target.value)
                          }
                          className="w-full text-xs font-khmer-battambang bg-transparent focus:outline-none"
                        />
                        {(attSum.excused > 0 || attSum.unexcused > 0) && (
                          <span className="text-[10px] font-mono whitespace-nowrap text-rose-700 shrink-0">
                            {attSum.excused > 0 ? `P:${attSum.excused} ` : ''}
                            {attSum.unexcused > 0 ? `A:${attSum.unexcused}` : ''}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteStudentRow(stu.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 no-print shrink-0"
                          title="លុបជួរសិស្សនេះ"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Extra Blank Rows at the bottom (e.g. ៣១, ៣២) */}
              {Array.from({ length: blankRowsCount }, (_, bIdx) => {
                const rowNum = classStudents.length + bIdx + 1;
                return (
                  <tr key={`blank-${bIdx}`} className="h-6">
                    <td className="border border-slate-900 py-1 px-1.5 text-center font-khmer-battambang tabular-nums">
                      {formatNumeral(rowNum, true)}
                    </td>
                    <td className="border border-slate-900 py-1 px-2" />
                    <td className="border border-slate-900 py-1 px-1" />
                    {sessionIndices.map((sIdx) => (
                      <td key={sIdx} className="border border-slate-900 py-1 px-1" />
                    ))}
                    <td className="border border-slate-900 py-1 px-2" />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer matching PDF 1 with editable/AI signature date */}
        <div className="pt-2 text-xs text-slate-950 space-y-2">
          <div>
            សិស្សសរុប{' '}
            <strong className="underline px-2">
              {formatNumeral(classStudents.length, true)}
            </strong>{' '}
            នាក់ ស្រី{' '}
            <strong className="underline px-2">
              {formatNumeral(femaleCount, true)}
            </strong>{' '}
            នាក់
          </div>
          <SignatureDateEditor
            state={state}
            onUpdateState={onUpdateState}
            showPrincipalLeft={true}
            sheetKey={`attendance_${activeClass?.id}_${activeMonth?.id}`}
          />
        </div>
      </div>
    </div>
  );
};
