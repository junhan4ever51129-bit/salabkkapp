import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  Calendar,
  CheckCheck,
  RotateCcw,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Trash2,
  Copy,
  ClipboardPaste,
  Share2,
  Sparkles,
  Table,
  Printer,
  Layers,
  Award,
  CheckSquare,
} from 'lucide-react';
import {
  AppDatabaseState,
  DailyHomeworkRecord,
  HomeworkSubmissionStatus,
  Language,
  MonthlyHomeworkSheetConfig,
  MonthlyHomeworkStudentEntry,
} from '../types';
import {
  addDaysToDdMmYyyy,
  cleanClassDisplayCode,
  ddMmYyyyToIso,
  formatNumeral as formatNum,
  getResolvedMonthlyHomeworkConfig,
  sortStudentsByKhmerName,
  syncWeeklyLogsFromDailyHomework,
} from '../utils/calculations';
import { AiGeneratorBar } from './AiGeneratorBar';
import {
  DEFAULT_WEEKLY_LOG_META,
  DEFAULT_WEEKLY_LOGS,
  DEFAULT_WEEK2_WEEKLY_LOGS,
  DEFAULT_WEEK2_WEEKLY_LOG_META,
  LESSON_7_VOCAB_CONTENT_DETAILS,
  generateDefaultDailyHomeworkRecords,
  generateWeek2DailyHomeworkRecords,
} from '../data/defaultData';
import { SignatureDateEditor } from './SignatureDateEditor';
import { MarkdownCopyBar } from './MarkdownDocumentView';

interface Props {
  state: AppDatabaseState;
  lang: Language;
  selectedClassId: string;
  onSelectClass: (id: string) => void;
  onUpdateState: (updater: (prev: AppDatabaseState) => AppDatabaseState) => void;
}

interface CopiedLessonHomeworkClip {
  sourceClassName: string;
  lessonUnitTitle: string;
  lessonTitle: string;
  lessonContentDetails: string;
  homeworkTitle: string;
  homeworkDetail: string;
  dueDate: string;
}

function isoToDdMmYyyy(iso: string): string {
  const parts = iso.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return iso;
}

interface MonthlyHomeworkTableViewProps {
  state: AppDatabaseState;
  currentClass: import('../types').ClassGroup;
  selectedMonthId: string;
  onSelectMonth: (monthId: string) => void;
  onSelectClass: (classId: string) => void;
  onUpdateState: (updater: (prev: AppDatabaseState) => AppDatabaseState) => void;
  syncMessage: string | null;
  setSyncMessage: (msg: string | null) => void;
}

const MonthlyHomeworkTableView: React.FC<MonthlyHomeworkTableViewProps> = ({
  state,
  currentClass,
  selectedMonthId,
  onSelectMonth,
  onSelectClass,
  onUpdateState,
  syncMessage,
  setSyncMessage,
}) => {
  const isGrade10 = Boolean(
    currentClass?.gradeLevel === 10 ||
      currentClass?.name?.includes('10') ||
      currentClass?.id?.includes('10')
  );

  const displayMonths = useMemo(
    () =>
      state.months.filter(
        (m) => m.id !== 'sem1' && m.id !== 'sem2' && m.id !== 'year'
      ),
    [state.months]
  );

  const selectedMonth =
    state.months.find((m) => m.id === selectedMonthId) || displayMonths[0];

  const monthlyConfig = useMemo(
    () =>
      getResolvedMonthlyHomeworkConfig(
        state,
        currentClass?.id || '8A',
        selectedMonthId
      ),
    [state, currentClass?.id, selectedMonthId]
  );

  const maxScore = monthlyConfig.maxScore ?? (isGrade10 ? 20 : 10);

  const activeAcademicYear =
    state.academicTerms?.find((t) => t.id === state.currentTermId)?.nameKh ||
    state.schoolInfo.academicYear ||
    '២០២៦ ~ ២០២៧';

  const classStudents = useMemo(
    () =>
      sortStudentsByKhmerName(
        state.students.filter(
          (s) => s.classId === currentClass?.id && s.status === 'active'
        )
      ),
    [state.students, currentClass?.id]
  );

  const resolvedDefaultStudentEntries = useMemo(() => {
    const map: Record<string, MonthlyHomeworkStudentEntry> = {};
    const count = monthlyConfig.sessionCount;
    classStudents.forEach((stu, idx) => {
      const isDropped =
        stu.status === 'dropped' || (stu.note || '').includes('មិនដែលមករៀន');
      const subs: Record<number, boolean> = {};
      for (let s = 1; s <= count; s++) {
        if (isDropped) {
          subs[s] = false;
        } else if (idx % 11 === 4 && s === 3) {
          subs[s] = false;
        } else if (idx % 13 === 7 && s === 4) {
          subs[s] = false;
        } else {
          subs[s] = true;
        }
      }
      map[stu.id] = {
        submissions: subs,
        scoreOverride: null,
        note: isDropped ? 'បោះបង់ការសិក្សា' : '',
      };
    });
    return map;
  }, [classStudents, monthlyConfig.sessionCount]);

  const updateMonthlyConfig = (
    updater: (prev: MonthlyHomeworkSheetConfig) => MonthlyHomeworkSheetConfig
  ) => {
    if (!currentClass) return;
    onUpdateState((prev) => {
      const currentResolved = getResolvedMonthlyHomeworkConfig(
        prev,
        currentClass.id,
        selectedMonthId
      );
      const updated = updater(currentResolved);
      return {
        ...prev,
        monthlyHomeworkConfigs: {
          ...(prev.monthlyHomeworkConfigs || {}),
          [currentClass.id]: {
            ...(prev.monthlyHomeworkConfigs?.[currentClass.id] || {}),
            [selectedMonthId]: updated,
          },
        },
      };
    });
  };

  const computeHwScore = (
    subs: Record<number, boolean>,
    override: number | null | undefined,
    isDropped: boolean
  ) => {
    if (isDropped) return 0;
    if (override !== null && override !== undefined) return override;
    let count = 0;
    for (let s = 1; s <= monthlyConfig.sessionCount; s++) {
      if (subs[s]) count++;
    }
    return Number(((count / monthlyConfig.sessionCount) * maxScore).toFixed(1));
  };

  const handleBatchSetSession = (sessionIdx: number, isSubmitted: boolean) => {
    if (!currentClass) return;
    onUpdateState((prev) => {
      const trackers = { ...(prev.monthlyHomeworkTrackers || {}) };
      const classTrackers = { ...(trackers[currentClass.id] || {}) };
      const monthTrackers = { ...(classTrackers[selectedMonthId] || {}) };

      const currentBreakdowns = prev.monthlyScoreBreakdowns || {};
      const classBreakdowns = { ...(currentBreakdowns[currentClass.id] || {}) };
      const monthBreakdowns = { ...(classBreakdowns[selectedMonthId] || {}) };

      classStudents.forEach((stu) => {
        const isDropped = Boolean(
          stu.status === 'dropped' || (stu.note || '').includes('មិនដែលមករៀន')
        );
        const existing =
          monthTrackers[stu.id] ||
          resolvedDefaultStudentEntries[stu.id] || {
            submissions: {},
            scoreOverride: null,
            note: '',
          };
        const nextSubs = {
          ...existing.submissions,
          [sessionIdx]: isSubmitted,
        };
        monthTrackers[stu.id] = {
          ...existing,
          submissions: nextSubs,
        };

        const newScore = computeHwScore(nextSubs, existing.scoreOverride, isDropped);
        const prevBreakdown = monthBreakdowns[stu.id] || {
          performanceMarks: {},
          examScore: null,
        };
        monthBreakdowns[stu.id] = {
          ...prevBreakdown,
          homeworkScoreOverride: newScore,
        };
      });

      classTrackers[selectedMonthId] = monthTrackers;
      trackers[currentClass.id] = classTrackers;
      classBreakdowns[selectedMonthId] = monthBreakdowns;

      return {
        ...prev,
        monthlyHomeworkTrackers: trackers,
        monthlyScoreBreakdowns: {
          ...currentBreakdowns,
          [currentClass.id]: classBreakdowns,
        },
      };
    });
  };

  const handleBatchSetAllSessions = (isSubmitted: boolean) => {
    if (!currentClass) return;
    onUpdateState((prev) => {
      const trackers = { ...(prev.monthlyHomeworkTrackers || {}) };
      const classTrackers = { ...(trackers[currentClass.id] || {}) };
      const monthTrackers = { ...(classTrackers[selectedMonthId] || {}) };

      const currentBreakdowns = prev.monthlyScoreBreakdowns || {};
      const classBreakdowns = { ...(currentBreakdowns[currentClass.id] || {}) };
      const monthBreakdowns = { ...(classBreakdowns[selectedMonthId] || {}) };

      classStudents.forEach((stu) => {
        const isDropped = Boolean(
          stu.status === 'dropped' || (stu.note || '').includes('មិនដែលមករៀន')
        );
        const existing =
          monthTrackers[stu.id] ||
          resolvedDefaultStudentEntries[stu.id] || {
            submissions: {},
            scoreOverride: null,
            note: '',
          };
        const nextSubs: Record<number, boolean> = { ...existing.submissions };
        for (let s = 1; s <= monthlyConfig.sessionCount; s++) {
          nextSubs[s] = isSubmitted;
        }
        monthTrackers[stu.id] = {
          ...existing,
          submissions: nextSubs,
        };

        const newScore = computeHwScore(nextSubs, existing.scoreOverride, isDropped);
        const prevBreakdown = monthBreakdowns[stu.id] || {
          performanceMarks: {},
          examScore: null,
        };
        monthBreakdowns[stu.id] = {
          ...prevBreakdown,
          homeworkScoreOverride: newScore,
        };
      });

      classTrackers[selectedMonthId] = monthTrackers;
      trackers[currentClass.id] = classTrackers;
      classBreakdowns[selectedMonthId] = monthBreakdowns;

      return {
        ...prev,
        monthlyHomeworkTrackers: trackers,
        monthlyScoreBreakdowns: {
          ...currentBreakdowns,
          [currentClass.id]: classBreakdowns,
        },
      };
    });
  };

  const handleToggleStudent = (studentId: string, sessionIdx: number) => {
    if (!currentClass) return;
    onUpdateState((prev) => {
      const trackers = { ...(prev.monthlyHomeworkTrackers || {}) };
      const classTrackers = { ...(trackers[currentClass.id] || {}) };
      const monthTrackers = { ...(classTrackers[selectedMonthId] || {}) };
      const existing =
        monthTrackers[studentId] ||
        resolvedDefaultStudentEntries[studentId] || {
          submissions: {},
          scoreOverride: null,
          note: '',
        };
      const currentVal = Boolean(existing.submissions?.[sessionIdx]);
      const nextSubs = {
        ...existing.submissions,
        [sessionIdx]: !currentVal,
      };

      monthTrackers[studentId] = {
        ...existing,
        submissions: nextSubs,
      };

      classTrackers[selectedMonthId] = monthTrackers;
      trackers[currentClass.id] = classTrackers;

      // Direct live sync into monthlyScoreBreakdowns so MonthlyScoreModule immediately displays it!
      const currentBreakdowns = prev.monthlyScoreBreakdowns || {};
      const classBreakdowns = { ...(currentBreakdowns[currentClass.id] || {}) };
      const monthBreakdowns = { ...(classBreakdowns[selectedMonthId] || {}) };
      const stu = classStudents.find((s) => s.id === studentId);
      const isDropped = Boolean(
        stu?.status === 'dropped' || (stu?.note || '').includes('មិនដែលមករៀន')
      );
      const newHwScore = computeHwScore(nextSubs, existing.scoreOverride, isDropped);

      const prevBreakdown = monthBreakdowns[studentId] || {
        performanceMarks: {},
        examScore: null,
      };
      monthBreakdowns[studentId] = {
        ...prevBreakdown,
        homeworkScoreOverride: newHwScore,
      };
      classBreakdowns[selectedMonthId] = monthBreakdowns;

      return {
        ...prev,
        monthlyHomeworkTrackers: trackers,
        monthlyScoreBreakdowns: {
          ...currentBreakdowns,
          [currentClass.id]: classBreakdowns,
        },
      };
    });
  };

  const handleStudentNoteChange = (studentId: string, note: string) => {
    if (!currentClass) return;
    onUpdateState((prev) => {
      const trackers = { ...(prev.monthlyHomeworkTrackers || {}) };
      const classTrackers = { ...(trackers[currentClass.id] || {}) };
      const monthTrackers = { ...(classTrackers[selectedMonthId] || {}) };
      const existing =
        monthTrackers[studentId] ||
        resolvedDefaultStudentEntries[studentId] || {
          submissions: {},
          scoreOverride: null,
          note: '',
        };

      monthTrackers[studentId] = {
        ...existing,
        note,
      };

      classTrackers[selectedMonthId] = monthTrackers;
      trackers[currentClass.id] = classTrackers;

      return {
        ...prev,
        monthlyHomeworkTrackers: trackers,
      };
    });
  };

  const handleStudentScoreOverride = (studentId: string, rawVal: string) => {
    if (!currentClass) return;
    onUpdateState((prev) => {
      const trackers = { ...(prev.monthlyHomeworkTrackers || {}) };
      const classTrackers = { ...(trackers[currentClass.id] || {}) };
      const monthTrackers = { ...(classTrackers[selectedMonthId] || {}) };
      const existing =
        monthTrackers[studentId] ||
        resolvedDefaultStudentEntries[studentId] || {
          submissions: {},
          scoreOverride: null,
          note: '',
        };

      const trimmed = rawVal.trim();
      const parsed =
        trimmed === ''
          ? null
          : Math.max(0, Math.min(maxScore, parseFloat(trimmed)));

      monthTrackers[studentId] = {
        ...existing,
        scoreOverride: Number.isNaN(parsed) ? null : parsed,
      };

      classTrackers[selectedMonthId] = monthTrackers;
      trackers[currentClass.id] = classTrackers;

      // Direct live sync into monthlyScoreBreakdowns
      const currentBreakdowns = prev.monthlyScoreBreakdowns || {};
      const classBreakdowns = { ...(currentBreakdowns[currentClass.id] || {}) };
      const monthBreakdowns = { ...(classBreakdowns[selectedMonthId] || {}) };
      const stu = classStudents.find((s) => s.id === studentId);
      const isDropped = Boolean(
        stu?.status === 'dropped' || (stu?.note || '').includes('មិនដែលមករៀន')
      );
      const newHwScore = computeHwScore(existing.submissions, parsed, isDropped);

      const prevBreakdown = monthBreakdowns[studentId] || {
        performanceMarks: {},
        examScore: null,
      };
      monthBreakdowns[studentId] = {
        ...prevBreakdown,
        homeworkScoreOverride: newHwScore,
      };
      classBreakdowns[selectedMonthId] = monthBreakdowns;

      return {
        ...prev,
        monthlyHomeworkTrackers: trackers,
        monthlyScoreBreakdowns: {
          ...currentBreakdowns,
          [currentClass.id]: classBreakdowns,
        },
      };
    });
  };

  const handleSyncToMonthlyScoreSheet = () => {
    if (!currentClass) return;
    onUpdateState((prev) => {
      const currentBreakdowns = prev.monthlyScoreBreakdowns || {};
      const classBreakdowns = { ...(currentBreakdowns[currentClass.id] || {}) };
      const monthBreakdowns = { ...(classBreakdowns[selectedMonthId] || {}) };
      const sessCount = monthlyConfig.sessionCount;

      classStudents.forEach((stu) => {
        const entry =
          prev.monthlyHomeworkTrackers?.[currentClass.id]?.[selectedMonthId]?.[
            stu.id
          ] || resolvedDefaultStudentEntries[stu.id];
        const isDropped =
          stu.status === 'dropped' || (stu.note || '').includes('មិនដែលមករៀន');
        let subCount = 0;
        for (let s = 1; s <= sessCount; s++) {
          if (entry?.submissions?.[s]) subCount++;
        }
        const autoScore = Number(
          ((subCount / sessCount) * maxScore).toFixed(1)
        );
        const score = isDropped ? 0 : entry?.scoreOverride ?? autoScore;

        const existingEntry = monthBreakdowns[stu.id] || {
          performanceMarks: {},
          examScore: null,
        };

        monthBreakdowns[stu.id] = {
          ...existingEntry,
          homeworkScoreOverride: score,
        };
      });

      classBreakdowns[selectedMonthId] = monthBreakdowns;

      return {
        ...prev,
        monthlyScoreBreakdowns: {
          ...currentBreakdowns,
          [currentClass.id]: classBreakdowns,
        },
      };
    });
    setSyncMessage(
      `បានធ្វើសមកាលកម្មពិន្ទុកិច្ចការផ្ទះថ្នាក់ ${currentClass.name} ខែ ${
        selectedMonth?.nameKh || selectedMonthId
      } ទៅកាន់តារាងពិន្ទុប្រចាំខែរួចរាល់! (已同步至月度成绩册)`
    );
    window.setTimeout(() => setSyncMessage(null), 5000);
  };

  const femaleCount = classStudents.filter((s) => s.gender === 'F').length;

  let totalAllSubmissions = 0;
  const totalPossibleSubmissions =
    classStudents.length * monthlyConfig.sessionCount;
  let sumScores = 0;

  classStudents.forEach((stu) => {
    const e =
      state.monthlyHomeworkTrackers?.[currentClass?.id || '8A']?.[
        selectedMonthId
      ]?.[stu.id] || resolvedDefaultStudentEntries[stu.id];
    let subCount = 0;
    for (let s = 1; s <= monthlyConfig.sessionCount; s++) {
      if (e?.submissions?.[s]) subCount++;
    }
    totalAllSubmissions += subCount;
    const isDropped =
      stu.status === 'dropped' || (stu.note || '').includes('មិនដែលមករៀន');
    const autoScore = isDropped
      ? 0
      : Number(((subCount / monthlyConfig.sessionCount) * maxScore).toFixed(1));
    const score =
      e?.scoreOverride !== undefined && e?.scoreOverride !== null
        ? e.scoreOverride
        : autoScore;
    sumScores += score;
  });

  const avgRatePct =
    totalPossibleSubmissions > 0
      ? Math.round((totalAllSubmissions / totalPossibleSubmissions) * 100)
      : 0;

  const avgScore =
    classStudents.length > 0
      ? Number((sumScores / classStudents.length).toFixed(1))
      : 0;

  return (
    <div className="space-y-4">
      {/* Class Selector Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200 no-print">
        <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>ជ្រើសរើសថ្នាក់ (班级):</span>
        </span>
        {state.classes.map((cls) => {
          const isSelected = cls.id === currentClass.id;
          return (
            <button
              key={cls.id}
              type="button"
              onClick={() => onSelectClass(cls.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-2xs ring-2 ring-indigo-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cls.name}
            </button>
          );
        })}
      </div>

      {/* Month Selector Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200 no-print">
        <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>ខែសិក្សា (月份):</span>
        </span>
        {displayMonths.map((m) => {
          const isSel = m.id === selectedMonthId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMonth(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isSel
                  ? 'bg-amber-600 text-white shadow-2xs ring-2 ring-amber-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{m.nameKh}</span>
              <span className="ml-1 opacity-80 text-[10px]">
                ({m.monthIndex}月)
              </span>
            </button>
          );
        })}
      </div>

      {/* Configuration & Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Session Count: 4 or 5 */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-700">
                ចំនួនលើកកិច្ចការក្នុងខែ (月作业次数):
              </span>
              <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => updateMonthlyConfig((c) => ({ ...c, sessionCount: 4 }))}
                  className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                    monthlyConfig.sessionCount === 4
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ៤ លើក (4次)
                </button>
                <button
                  type="button"
                  onClick={() => updateMonthlyConfig((c) => ({ ...c, sessionCount: 5 }))}
                  className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                    monthlyConfig.sessionCount === 5
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ៥ លើក (5次)
                </button>
              </div>
            </div>

            {/* Max Score: 10 (G8/9) or 20 (G10) */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-700">
                ពិន្ទុពេញ (满分):
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                {maxScore} ពិន្ទុ ({isGrade10 ? '10年级满分20分' : '9年级/8年级满分10分'})
              </span>
              <input
                type="number"
                min={1}
                max={100}
                value={maxScore}
                onChange={(e) =>
                  updateMonthlyConfig((c) => ({
                    ...c,
                    maxScore: Math.max(1, Number(e.target.value) || (isGrade10 ? 20 : 10)),
                  }))
                }
                title="កែសម្រួលពិន្ទុពេញ (修改满分)"
                className="w-14 px-1.5 py-0.5 text-xs text-center border border-slate-300 rounded bg-white font-bold"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleBatchSetAllSessions(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>ដាក់ ✓ គ្រប់កិច្ចការ (一键全部已交)</span>
            </button>

            <button
              type="button"
              onClick={handleSyncToMonthlyScoreSheet}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="បញ្ចូលពិន្ទុកិច្ចការផ្ទះទៅកាន់តារាងពិន្ទុប្រចាំខែស្វ័យប្រវត្តិ"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ធ្វើសមកាលកម្មពិន្ទុទៅតារាងប្រចាំខែ (同步至月考册)</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
            ✓ {syncMessage}
          </div>
        )}

        <MarkdownCopyBar
          state={state}
          section="homework_lesson"
          selectedClassId={currentClass.id}
          selectedMonthId={selectedMonthId}
          label="ចម្លង Markdown តារាងកិច្ចការផ្ទះប្រចាំខែ"
        />
      </div>

      {/* Statistical Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">សិស្សសរុប (总人数)</div>
          <div className="text-lg font-bold text-slate-900">
            {formatNum(classStudents.length, state.useKhmerNumerals)}{' '}
            <span className="text-xs font-normal text-slate-500">
              (ស្រី {formatNum(femaleCount, state.useKhmerNumerals)})
            </span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">កិច្ចការបានប្រគល់សរុប (已交总次数)</div>
          <div className="text-lg font-bold text-emerald-700">
            {formatNum(totalAllSubmissions, state.useKhmerNumerals)} /{' '}
            {formatNum(totalPossibleSubmissions, state.useKhmerNumerals)}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">អត្រាប្រគល់កិច្ចការ (提交率)</div>
          <div className="text-lg font-bold text-sky-700">
            {formatNum(avgRatePct, state.useKhmerNumerals)}%
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">មធ្យមភាគពិន្ទុកិច្ចការ (平均分)</div>
          <div className="text-lg font-bold text-indigo-700">
            {formatNum(avgScore, state.useKhmerNumerals)}{' '}
            <span className="text-xs font-normal text-slate-500">
              / {formatNum(maxScore, state.useKhmerNumerals)}
            </span>
          </div>
        </div>
      </div>

      {/* A4 MoEYS Official Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs print:border-none print:shadow-none print:p-0">
        <div className="text-center space-y-1 mb-4 print:mb-2">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
            ព្រះរាជាណាចក្រកម្ពុជា
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-800">
            ជាតិ សាសនា ព្រះមហាក្សត្រ
          </div>
          <div className="w-24 h-0.5 bg-slate-800 mx-auto my-1"></div>
          <div className="text-xs font-semibold text-slate-700">
            {state.schoolInfo.schoolNameKh || 'វិទ្យាល័យ ហ៊ុន សែន មិត្តភាព'}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-1">
            តារាងតាមដាន និងវាយតម្លៃកិច្ចការផ្ទះប្រចាំខែ (月度课后作业跟踪与评分表)
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            មុខវិជ្ជា ៖ {state.schoolInfo.subjectNameKh} ({state.schoolInfo.subjectNameZh || '汉语'}) · ថ្នាក់ទី ៖ {currentClass.name} · {selectedMonth?.nameKh || 'ខែវិច្ឆិកា'} · ឆ្នាំសិក្សា ៖ {activeAcademicYear} · គ្រូបង្រៀន ៖ {state.schoolInfo.teacherName}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-black a4-singleline-table whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-black font-bold">
                <th rowSpan={2} className="py-2 px-1.5 text-center border border-black w-10 whitespace-nowrap">
                  ល.រ
                </th>
                <th rowSpan={2} className="py-2 px-2 text-center border border-black w-20 whitespace-nowrap">
                  អត្តលេខ
                </th>
                <th rowSpan={2} className="py-2 px-3 text-left border border-black whitespace-nowrap">
                  គោត្តនាម-នាម
                </th>
                <th rowSpan={2} className="py-2 px-3 text-left border border-black whitespace-nowrap">
                  ឈ្មោះចិន (姓名)
                </th>
                <th rowSpan={2} className="py-2 px-1.5 text-center border border-black w-12 whitespace-nowrap">
                  ភេទ
                </th>
                <th
                  colSpan={monthlyConfig.sessionCount}
                  className="py-1.5 px-2 text-center border border-black bg-amber-50/60 whitespace-nowrap"
                >
                  កិច្ចការផ្ទះប្រចាំខែ (月度课后作业 · {monthlyConfig.sessionCount} លើក)
                </th>
                <th rowSpan={2} className="py-2 px-2 text-center border border-black bg-emerald-50/50 w-24 whitespace-nowrap">
                  បានប្រគល់ ({monthlyConfig.sessionCount})
                </th>
                <th rowSpan={2} className="py-2 px-2 text-center border border-black bg-sky-50/50 w-20 whitespace-nowrap">
                  អត្រា %
                </th>
                <th rowSpan={2} className="py-2 px-2 text-center border border-black bg-indigo-50/60 w-24 whitespace-nowrap">
                  ពិន្ទុ ({maxScore})
                </th>
                <th rowSpan={2} className="py-2 px-2 text-left border border-black whitespace-nowrap">
                  ផ្សេងៗ / កំណត់សម្គាល់
                </th>
              </tr>
              <tr className="bg-slate-50 text-black font-bold">
                {Array.from({ length: monthlyConfig.sessionCount }, (_, i) => i + 1).map((sIdx) => {
                  const sIso = monthlyConfig.sessionDates[sIdx] || '';
                  const shortDateLabel = sIso
                    ? isoToDdMmYyyy(sIso).slice(0, 5)
                    : `${String((sIdx - 1) * 7 + 2).padStart(2, '0')}/11`;
                  return (
                    <th key={sIdx} className="py-1 px-1.5 text-center border border-black whitespace-nowrap bg-amber-50/20">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-mono text-[11px] font-bold text-slate-900">
                          {shortDateLabel}
                        </span>
                        <input
                          type="date"
                          value={sIso}
                          onChange={(e) =>
                            updateMonthlyConfig((c) => ({
                              ...c,
                              sessionDates: {
                                ...c.sessionDates,
                                [sIdx]: e.target.value,
                              },
                            }))
                          }
                          title="ចុចជ្រើសរើសកាលបរិច្ឆេទ (点击选择日期)"
                          className="w-5 h-5 p-0 text-[10px] border border-slate-300 rounded bg-white cursor-pointer no-print opacity-75 hover:opacity-100"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1 no-print">
                        <button
                          type="button"
                          onClick={() => handleBatchSetSession(sIdx, true)}
                          title="ដាក់ ✓ បានប្រគល់ទាំងអស់ក្នុងជួរឈរនេះ (全部已交)"
                          className="px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                        >
                          全✓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBatchSetSession(sIdx, false)}
                          title="ដាក់ ✗ មិនទាន់ប្រគល់ទាំងអស់ក្នុងជួរឈរនេះ (全部未交)"
                          className="px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                        >
                          全✗
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {classStudents.map((stu, idx) => {
                const entry =
                  state.monthlyHomeworkTrackers?.[currentClass.id]?.[selectedMonthId]?.[stu.id] ||
                  resolvedDefaultStudentEntries[stu.id];
                const subs = entry?.submissions || {};
                let subCount = 0;
                for (let s = 1; s <= monthlyConfig.sessionCount; s++) {
                  if (subs[s]) subCount++;
                }
                const isDropped = stu.status === 'dropped' || (stu.note || '').includes('មិនដែលមករៀន');
                const ratePct = isDropped ? 0 : Math.round((subCount / monthlyConfig.sessionCount) * 100);
                const autoScore = isDropped
                  ? 0
                  : Number(((subCount / monthlyConfig.sessionCount) * maxScore).toFixed(1));
                const displayScore =
                  entry?.scoreOverride !== undefined && entry?.scoreOverride !== null
                    ? entry.scoreOverride
                    : autoScore;

                return (
                  <tr key={stu.id} className="hover:bg-slate-50/80 whitespace-nowrap">
                    <td className="py-1 px-1.5 text-center border border-black font-mono">
                      {formatNum(idx + 1, state.useKhmerNumerals)}
                    </td>
                    <td className="py-1 px-2 text-center border border-black font-mono text-[11px]">
                      {stu.studentCode}
                    </td>
                    <td className="py-1 px-3 border border-black font-medium">
                      {stu.name}
                    </td>
                    <td className="py-1 px-3 border border-black font-medium">
                      {stu.chineseName}
                    </td>
                    <td className="py-1 px-1.5 text-center border border-black">
                      {stu.gender === 'F' ? 'ស' : 'ប'}
                    </td>

                    {/* Assignment Sessions 1..sessionCount */}
                    {Array.from({ length: monthlyConfig.sessionCount }, (_, i) => i + 1).map((sIdx) => {
                      const isSubmitted = Boolean(subs[sIdx]);
                      return (
                        <td key={sIdx} className="py-1 px-1 text-center border border-black align-middle">
                          <div className="flex items-center justify-center no-print">
                            <button
                              type="button"
                              onClick={() => handleToggleStudent(stu.id, sIdx)}
                              title={
                                isSubmitted
                                  ? 'បានប្រគល់កិច្ចការ (已交 · ចុចដើម្បីប្តូរ)'
                                  : 'មិនទាន់ប្រគល់ (未交 · ចុចដើម្បីប្តូរ)'
                              }
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center font-bold text-base transition-all cursor-pointer ${
                                isSubmitted
                                  ? 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700 border border-emerald-700'
                                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300'
                              }`}
                            >
                              {isSubmitted ? '✓' : '✗'}
                            </button>
                          </div>
                          <span className="hidden print:inline-block font-bold text-sm">
                            {isSubmitted ? '✓' : '✗'}
                          </span>
                        </td>
                      );
                    })}

                    {/* Submitted Count */}
                    <td className="py-1 px-2 text-center border border-black font-mono font-bold align-middle bg-emerald-50/20">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] ${
                          subCount === monthlyConfig.sessionCount
                            ? 'bg-emerald-100 text-emerald-800'
                            : subCount > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {formatNum(subCount, state.useKhmerNumerals)}/{formatNum(monthlyConfig.sessionCount, state.useKhmerNumerals)}
                      </span>
                    </td>

                    {/* Rate % */}
                    <td className="py-1 px-2 text-center border border-black font-mono align-middle bg-sky-50/20">
                      {formatNum(ratePct, state.useKhmerNumerals)}%
                    </td>

                    {/* Homework Score */}
                    <td className="py-1 px-1.5 text-center border border-black font-mono font-bold align-middle bg-indigo-50/20">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className={`text-xs font-bold ${
                            displayScore === maxScore
                              ? 'text-emerald-700'
                              : displayScore > 0
                              ? 'text-indigo-700'
                              : 'text-rose-600'
                          }`}
                        >
                          {formatNum(displayScore, state.useKhmerNumerals)}
                        </span>
                        {entry?.scoreOverride !== undefined && entry?.scoreOverride !== null && (
                          <span
                            className="text-[9px] px-1 rounded bg-amber-100 text-amber-800 no-print font-sans cursor-pointer"
                            title="ពិន្ទុកែសម្រួលដោយដៃ (点击重置为自动)"
                            onClick={() => handleStudentScoreOverride(stu.id, '')}
                          >
                            កែ
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="py-1 px-2 border border-black">
                      <input
                        type="text"
                        value={entry?.note || ''}
                        onChange={(e) => handleStudentNoteChange(stu.id, e.target.value)}
                        placeholder="..."
                        className="w-full bg-transparent text-xs focus:outline-none px-1 py-0.5"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-black text-xs">
                <td colSpan={5} className="py-2 px-3 border border-black text-right">
                  សរុបសិស្ស៖ {formatNum(classStudents.length, state.useKhmerNumerals)} នាក់ (ស្រី {formatNum(femaleCount, state.useKhmerNumerals)} នាក់)
                </td>
                {Array.from({ length: monthlyConfig.sessionCount }, (_, i) => i + 1).map((sIdx) => {
                  const colSubmitted = classStudents.filter((stu) => {
                    const e =
                      state.monthlyHomeworkTrackers?.[currentClass.id]?.[selectedMonthId]?.[stu.id] ||
                      resolvedDefaultStudentEntries[stu.id];
                    return Boolean(e?.submissions?.[sIdx]);
                  }).length;
                  return (
                    <td
                      key={sIdx}
                      className="py-1.5 px-1 text-center border border-black font-mono text-[11px] text-emerald-800 bg-emerald-50/30"
                    >
                      {formatNum(colSubmitted, state.useKhmerNumerals)}/{formatNum(classStudents.length, state.useKhmerNumerals)}
                    </td>
                  );
                })}
                <td className="py-2 px-1 text-center border border-black font-mono text-emerald-800 bg-emerald-50/40">
                  {formatNum(totalAllSubmissions, state.useKhmerNumerals)}
                </td>
                <td className="py-2 px-1 text-center border border-black font-mono text-sky-800 bg-sky-50/40">
                  {formatNum(avgRatePct, state.useKhmerNumerals)}%
                </td>
                <td className="py-2 px-1 text-center border border-black font-mono font-bold text-indigo-900 bg-indigo-50/40">
                  {formatNum(avgScore, state.useKhmerNumerals)}
                </td>
                <td className="py-2 px-2 border border-black text-slate-600 text-[11px]">
                  ពិន្ទុពេញ {formatNum(maxScore, state.useKhmerNumerals)} ពិន្ទុ
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Editable & AI Signature Date Footer */}
        <SignatureDateEditor
          state={state}
          onUpdateState={onUpdateState}
          showPrincipalLeft={true}
          sheetKey={`homework_monthly_${currentClass.id}_${selectedMonthId}`}
        />
      </div>
    </div>
  );
};

export const HomeworkTrackerModule: React.FC<Props> = ({
  state,
  selectedClassId,
  onSelectClass,
  onUpdateState,
}) => {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [filterMode, setFilterMode] = useState<'all' | 'submitted' | 'missing'>('all');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [copiedClip, setCopiedClip] = useState<CopiedLessonHomeworkClip | null>(null);

  const currentClass =
    state.classes.find((c) => c.id === selectedClassId) || state.classes[0];

  const allRecords = useMemo(() => {
    const existing = state.dailyHomeworkRecords || [];
    const forDate = existing.filter((r) => r.date === selectedDate);
    if (forDate.length >= state.classes.length) {
      return existing;
    }
    const generated = generateDefaultDailyHomeworkRecords(state.classes, state.students).map(
      (r) => ({
        ...r,
        id: `hw-${r.classId}-${selectedDate}`,
        date: selectedDate,
      })
    );
    const merged = [...existing];
    for (const g of generated) {
      if (!merged.some((m) => m.classId === g.classId && m.date === selectedDate)) {
        merged.push(g);
      }
    }
    return merged;
  }, [state.dailyHomeworkRecords, state.classes, state.students, selectedDate]);

  const dateRecordsByClass = useMemo(() => {
    const map: Record<string, DailyHomeworkRecord> = {};
    for (const cls of state.classes) {
      const found =
        allRecords.find((r) => r.classId === cls.id && r.date === selectedDate) ||
        allRecords.find((r) => r.classId === cls.id);
      if (found) {
        map[cls.id] = found;
      }
    }
    return map;
  }, [allRecords, state.classes, selectedDate]);

  const currentRecord = dateRecordsByClass[currentClass?.id || '8A'];

  const classStudents = useMemo(
    () =>
      sortStudentsByKhmerName(
        state.students.filter(
          (s) => s.classId === currentClass?.id && s.status === 'active'
        )
      ),
    [state.students, currentClass?.id]
  );

  const [trackerMode, setTrackerMode] = useState<'monthly' | 'daily'>('monthly');
  const [selectedMonthId, setSelectedMonthId] = useState<string>('nov');

  const isGrade10 = Boolean(
    currentClass?.gradeLevel === 10 ||
      currentClass?.name?.includes('10') ||
      currentClass?.id?.includes('10')
  );

  const displayMonths = useMemo(
    () =>
      state.months.filter(
        (m) => m.id !== 'sem1' && m.id !== 'sem2' && m.id !== 'year'
      ),
    [state.months]
  );

  const selectedMonth =
    state.months.find((m) => m.id === selectedMonthId) || displayMonths[0];

  const monthlyHomeworkConfig = useMemo(
    () =>
      getResolvedMonthlyHomeworkConfig(
        state,
        currentClass?.id || '8A',
        selectedMonthId
      ),
    [state, currentClass?.id, selectedMonthId]
  );

  const maxHomeworkScore =
    monthlyHomeworkConfig.maxScore ?? (isGrade10 ? 20 : 10);

  const activeAcademicYear =
    state.academicTerms?.find((t) => t.id === state.currentTermId)?.nameKh ||
    state.schoolInfo.academicYear ||
    '២០២៦ ~ ២០២៧';

  const resolvedDefaultStudentEntries = useMemo(() => {
    const map: Record<string, MonthlyHomeworkStudentEntry> = {};
    const count = monthlyHomeworkConfig.sessionCount;
    classStudents.forEach((stu, idx) => {
      const isDropped =
        stu.status === 'dropped' || (stu.note || '').includes('មិនដែលមករៀន');
      const subs: Record<number, boolean> = {};
      for (let s = 1; s <= count; s++) {
        if (isDropped) {
          subs[s] = false;
        } else if (idx % 11 === 4 && s === 3) {
          subs[s] = false;
        } else if (idx % 13 === 7 && s === 4) {
          subs[s] = false;
        } else {
          subs[s] = true;
        }
      }
      map[stu.id] = {
        submissions: subs,
        scoreOverride: null,
        note: isDropped ? 'បោះបង់ការសិក្សា' : '',
      };
    });
    return map;
  }, [classStudents, monthlyHomeworkConfig.sessionCount]);

  const updateMonthlyHomeworkConfig = (
    updater: (prev: MonthlyHomeworkSheetConfig) => MonthlyHomeworkSheetConfig
  ) => {
    if (!currentClass) return;
    onUpdateState((prev) => {
      const currentResolved = getResolvedMonthlyHomeworkConfig(
        prev,
        currentClass.id,
        selectedMonthId
      );
      const updated = updater(currentResolved);
      return {
        ...prev,
        monthlyHomeworkConfigs: {
          ...(prev.monthlyHomeworkConfigs || {}),
          [currentClass.id]: {
            ...(prev.monthlyHomeworkConfigs?.[currentClass.id] || {}),
            [selectedMonthId]: updated,
          },
        },
      };
    });
  };

  const handleBatchSetMonthlySubmission = (
    sessionIdx: number,
    isSubmitted: boolean
  ) => {
    if (!currentClass) return;
    onUpdateState((prev) => {
      const trackers = { ...(prev.monthlyHomeworkTrackers || {}) };
      const classTrackers = { ...(trackers[currentClass.id] || {}) };
      const monthTrackers = { ...(classTrackers[selectedMonthId] || {}) };

      classStudents.forEach((stu) => {
        const existing =
          monthTrackers[stu.id] ||
          resolvedDefaultStudentEntries[stu.id] || {
            submissions: {},
            scoreOverride: null,
            note: '',
          };
        monthTrackers[stu.id] = {
          ...existing,
          submissions: {
            ...existing.submissions,
            [sessionIdx]: isSubmitted,
          },
        };
      });

      classTrackers[selectedMonthId] = monthTrackers;
      trackers[currentClass.id] = classTrackers;

      return {
        ...prev,
        monthlyHomeworkTrackers: trackers,
      };
    });
  };

  const handleToggleMonthlyStudentSubmission = (
    studentId: string,
    sessionIdx: number
  ) => {
    if (!currentClass) return;
    onUpdateState((prev) => {
      const trackers = { ...(prev.monthlyHomeworkTrackers || {}) };
      const classTrackers = { ...(trackers[currentClass.id] || {}) };
      const monthTrackers = { ...(classTrackers[selectedMonthId] || {}) };
      const existing =
        monthTrackers[studentId] ||
        resolvedDefaultStudentEntries[studentId] || {
          submissions: {},
          scoreOverride: null,
          note: '',
        };
      const currentVal = Boolean(existing.submissions?.[sessionIdx]);

      monthTrackers[studentId] = {
        ...existing,
        submissions: {
          ...existing.submissions,
          [sessionIdx]: !currentVal,
        },
      };

      classTrackers[selectedMonthId] = monthTrackers;
      trackers[currentClass.id] = classTrackers;

      return {
        ...prev,
        monthlyHomeworkTrackers: trackers,
      };
    });
  };

  const handleMonthlyStudentNoteChange = (studentId: string, note: string) => {
    if (!currentClass) return;
    onUpdateState((prev) => {
      const trackers = { ...(prev.monthlyHomeworkTrackers || {}) };
      const classTrackers = { ...(trackers[currentClass.id] || {}) };
      const monthTrackers = { ...(classTrackers[selectedMonthId] || {}) };
      const existing =
        monthTrackers[studentId] ||
        resolvedDefaultStudentEntries[studentId] || {
          submissions: {},
          scoreOverride: null,
          note: '',
        };

      monthTrackers[studentId] = {
        ...existing,
        note,
      };

      classTrackers[selectedMonthId] = monthTrackers;
      trackers[currentClass.id] = classTrackers;

      return {
        ...prev,
        monthlyHomeworkTrackers: trackers,
      };
    });
  };

  const handleMonthlyStudentScoreOverride = (
    studentId: string,
    rawVal: string
  ) => {
    if (!currentClass) return;
    onUpdateState((prev) => {
      const trackers = { ...(prev.monthlyHomeworkTrackers || {}) };
      const classTrackers = { ...(trackers[currentClass.id] || {}) };
      const monthTrackers = { ...(classTrackers[selectedMonthId] || {}) };
      const existing =
        monthTrackers[studentId] ||
        resolvedDefaultStudentEntries[studentId] || {
          submissions: {},
          scoreOverride: null,
          note: '',
        };

      const trimmed = rawVal.trim();
      const parsed =
        trimmed === ''
          ? null
          : Math.max(0, Math.min(maxHomeworkScore, parseFloat(trimmed)));

      monthTrackers[studentId] = {
        ...existing,
        scoreOverride: Number.isNaN(parsed) ? null : parsed,
      };

      classTrackers[selectedMonthId] = monthTrackers;
      trackers[currentClass.id] = classTrackers;

      return {
        ...prev,
        monthlyHomeworkTrackers: trackers,
      };
    });
  };

  const handleSyncMonthlyHomeworkToScoreModule = () => {
    if (!currentClass) return;
    onUpdateState((prev) => {
      const currentBreakdowns = prev.monthlyScoreBreakdowns || {};
      const classBreakdowns = { ...(currentBreakdowns[currentClass.id] || {}) };
      const monthBreakdowns = { ...(classBreakdowns[selectedMonthId] || {}) };
      const sessCount = monthlyHomeworkConfig.sessionCount;

      classStudents.forEach((stu) => {
        const entry =
          prev.monthlyHomeworkTrackers?.[currentClass.id]?.[selectedMonthId]?.[
            stu.id
          ] || resolvedDefaultStudentEntries[stu.id];
        const isDropped =
          stu.status === 'dropped' || (stu.note || '').includes('មិនដែលមករៀន');
        let subCount = 0;
        for (let s = 1; s <= sessCount; s++) {
          if (entry?.submissions?.[s]) subCount++;
        }
        const autoScore = Number(
          ((subCount / sessCount) * maxHomeworkScore).toFixed(1)
        );
        const score = isDropped ? 0 : entry?.scoreOverride ?? autoScore;

        const existingEntry = monthBreakdowns[stu.id] || {
          performanceMarks: {},
          examScore: null,
        };

        monthBreakdowns[stu.id] = {
          ...existingEntry,
          homeworkScoreOverride: score,
        };
      });

      classBreakdowns[selectedMonthId] = monthBreakdowns;

      return {
        ...prev,
        monthlyScoreBreakdowns: {
          ...currentBreakdowns,
          [currentClass.id]: classBreakdowns,
        },
      };
    });
    setSyncMessage(
      `បានធ្វើសមកាលកម្មពិន្ទុកិច្ចការផ្ទះថ្នាក់ ${currentClass.name} ខែ ${
        selectedMonth?.nameKh || selectedMonthId
      } ទៅកាន់តារាងពិន្ទុប្រចាំខែរួចរាល់! (已同步至月度成绩册)`
    );
    window.setTimeout(() => setSyncMessage(null), 5000);
  };

  const submittedStudents = useMemo(
    () =>
      classStudents.filter(
        (s) => (currentRecord?.submissions?.[s.id] || 'missing') === 'submitted'
      ),
    [classStudents, currentRecord]
  );

  const missingStudents = useMemo(
    () =>
      classStudents.filter(
        (s) => (currentRecord?.submissions?.[s.id] || 'missing') !== 'submitted'
      ),
    [classStudents, currentRecord]
  );

  const filteredStudents = useMemo(() => {
    if (filterMode === 'submitted') return submittedStudents;
    if (filterMode === 'missing') return missingStudents;
    return classStudents;
  }, [classStudents, submittedStudents, missingStudents, filterMode]);

  const assignedClasses = useMemo(
    () => state.classes.filter((c) => dateRecordsByClass[c.id]?.assigned),
    [state.classes, dateRecordsByClass]
  );

  const unassignedClasses = useMemo(
    () => state.classes.filter((c) => !dateRecordsByClass[c.id]?.assigned),
    [state.classes, dateRecordsByClass]
  );

  const upsertRecord = (
    classId: string,
    updater: (prevRecord: DailyHomeworkRecord) => DailyHomeworkRecord,
    autoSyncWeeklyLog = true
  ) => {
    onUpdateState((prev) => {
      const baseList =
        prev.dailyHomeworkRecords && prev.dailyHomeworkRecords.length > 0
          ? [...prev.dailyHomeworkRecords]
          : generateDefaultDailyHomeworkRecords(prev.classes, prev.students);

      // Ensure all classes have a record for selectedDate so sequential weekly logs stay connected
      for (const cls of prev.classes) {
        if (!baseList.some((r) => r.classId === cls.id && r.date === selectedDate)) {
          const existingForCls = dateRecordsByClass[cls.id];
          if (existingForCls) {
            baseList.push({ ...existingForCls, date: selectedDate });
          }
        }
      }

      const idx = baseList.findIndex(
        (r) => r.classId === classId && r.date === selectedDate
      );
      const fallback: DailyHomeworkRecord =
        dateRecordsByClass[classId] || {
          id: `hw-${classId}-${selectedDate}`,
          classId,
          date: selectedDate,
          assigned: true,
          lessonUnitTitle: '汉语基础（复习）· មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
          lessonTitle: '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)',
          lessonContentDetails:
            '1. រំលឹកព្យញ្ជនៈទាំង ២៣ (២៣ 声母) ៖ b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w\n2. រំលឹកស្រៈទាំង ២៤ (២៤ 韵母) ៖ a, o, e, i, u, ü, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong\n3. ហាត់អាន បញ្ចេញសំឡេង និងសរសេរឱ្យបានត្រឹមត្រូវ (会读会记 会正确拼读与书写)',
          syncedToWeeklyLog: true,
          homeworkTitle: 'ចម្លងភីនអ៊ីន ៥ដង (抄写声母和韵母各5遍)',
          homeworkDetail:
            'ចម្លងព្យញ្ជនៈ (声母) ២៣ និង ស្រៈ (韵母) ២៤ ចំនួន ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写声母和韵母各5遍，下周交)',
          dueDate: 'សប្តាហ៍ក្រោយ (下周交)',
          submissions: {},
          notes: {},
        };

      const prevRec = idx >= 0 ? baseList[idx] : fallback;
      const updated = {
        ...updater(prevRec),
        syncedToWeeklyLog: true,
      };
      if (idx >= 0) {
        baseList[idx] = updated;
      } else {
        baseList.push(updated);
      }

      // Check if lesson/homework content changed; if so, propagate sequentially to subsequent classes
      const contentChanged =
        updated.lessonUnitTitle !== prevRec.lessonUnitTitle ||
        updated.lessonTitle !== prevRec.lessonTitle ||
        updated.lessonContentDetails !== prevRec.lessonContentDetails ||
        updated.homeworkTitle !== prevRec.homeworkTitle ||
        updated.homeworkDetail !== prevRec.homeworkDetail;

      if (contentChanged && autoSyncWeeklyLog) {
        const editedClsIdx = prev.classes.findIndex((c) => c.id === classId);
        if (editedClsIdx >= 0) {
          for (let cIdx = editedClsIdx + 1; cIdx < prev.classes.length; cIdx++) {
            const subCls = prev.classes[cIdx];
            const subRecIdx = baseList.findIndex(
              (r) => r.classId === subCls.id && r.date === selectedDate
            );
            if (subRecIdx >= 0) {
              baseList[subRecIdx] = {
                ...baseList[subRecIdx],
                lessonUnitTitle: updated.lessonUnitTitle,
                lessonTitle: updated.lessonTitle,
                lessonContentDetails: updated.lessonContentDetails,
                homeworkTitle: updated.homeworkTitle,
                homeworkDetail: updated.homeworkDetail,
                syncedToWeeklyLog: true,
              };
            }
          }
        }
      }

      const nextWeeklyLogs = autoSyncWeeklyLog
        ? syncWeeklyLogsFromDailyHomework(
            prev.classes,
            baseList,
            prev.weeklyLogs,
            selectedDate,
            contentChanged ? classId : undefined
          )
        : prev.weeklyLogs;

      return {
        ...prev,
        dailyHomeworkRecords: baseList,
        weeklyLogs: nextWeeklyLogs,
      };
    });
  };

  const handleUpdateClassSchedule = (
    classId: string,
    patch: { scheduleDayKh?: string; scheduleTime?: string }
  ) => {
    onUpdateState((prev) => {
      const nextClasses = prev.classes.map((c) =>
        c.id === classId ? { ...c, ...patch } : c
      );
      const nextWeeklyLogs = syncWeeklyLogsFromDailyHomework(
        nextClasses,
        prev.dailyHomeworkRecords || [],
        prev.weeklyLogs,
        selectedDate,
        classId
      );
      return {
        ...prev,
        classes: nextClasses,
        weeklyLogs: nextWeeklyLogs,
      };
    });
  };

  // --- Copy & Paste Handlers for កំណត់ត្រាមេរៀន និងកំណត់ត្រាកិច្ចការផ្ទះ ---
  const handleCopyFromClass = (classId: string) => {
    const rec = dateRecordsByClass[classId];
    const cls = state.classes.find((c) => c.id === classId);
    if (!rec) return;
    const clip: CopiedLessonHomeworkClip = {
      sourceClassName: cls?.name || classId,
      lessonUnitTitle: rec.lessonUnitTitle || '',
      lessonTitle: rec.lessonTitle || '',
      lessonContentDetails: rec.lessonContentDetails || '',
      homeworkTitle: rec.homeworkTitle || '',
      homeworkDetail: rec.homeworkDetail || '',
      dueDate: rec.dueDate || '',
    };
    setCopiedClip(clip);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(
          `${clip.lessonUnitTitle} | ${clip.lessonTitle}\n${clip.lessonContentDetails}\n作业: ${clip.homeworkTitle} - ${clip.homeworkDetail}`
        )
        .catch(() => {});
    }
    setSyncMessage(
      `បានចម្លងមេរៀន និងកិច្ចការផ្ទះពីថ្នាក់ទី ${clip.sourceClassName} រួចរាល់! សូមចុច «បិទភ្ជាប់ (粘贴)» នៅថ្នាក់បន្ទាប់។ (已复制 ${clip.sourceClassName} 班课程与作业)`
    );
    window.setTimeout(() => setSyncMessage(null), 4000);
  };

  const handlePasteToClass = (targetClassId: string) => {
    const targetCls = state.classes.find((c) => c.id === targetClassId);
    const sourceClip =
      copiedClip ||
      (currentRecord
        ? {
            sourceClassName: currentClass?.name || '',
            lessonUnitTitle: currentRecord.lessonUnitTitle || '',
            lessonTitle: currentRecord.lessonTitle || '',
            lessonContentDetails: currentRecord.lessonContentDetails || '',
            homeworkTitle: currentRecord.homeworkTitle || '',
            homeworkDetail: currentRecord.homeworkDetail || '',
            dueDate: currentRecord.dueDate || '',
          }
        : null);

    if (!sourceClip) {
      setSyncMessage('សូមចុចប៊ូតុង «ចម្លង (复制)» ពីថ្នាក់ណាមួយជាមុនសិន!');
      window.setTimeout(() => setSyncMessage(null), 3000);
      return;
    }

    upsertRecord(
      targetClassId,
      (rec) => ({
        ...rec,
        assigned: true,
        lessonUnitTitle: sourceClip.lessonUnitTitle,
        lessonTitle: sourceClip.lessonTitle,
        lessonContentDetails: sourceClip.lessonContentDetails,
        homeworkTitle: sourceClip.homeworkTitle,
        homeworkDetail: sourceClip.homeworkDetail,
        dueDate: sourceClip.dueDate,
      }),
      true
    );

    setSyncMessage(
      `បានបិទភ្ជាប់មេរៀន និងកិច្ចការផ្ទះទៅថ្នាក់ទី ${targetCls?.name || targetClassId} ហើយបង្កើតតភ្ជាប់ក្នុង «សម្រង់អត្ថបទប្រចាំសប្តាហ៍» ស្វ័យប្រវត្តិ! (已粘贴到 ${targetCls?.name || targetClassId} 班并自动连续生成周志)`
    );
    window.setTimeout(() => setSyncMessage(null), 4000);
  };

  const handlePasteToAllOtherClasses = () => {
    const sourceClip =
      copiedClip ||
      (currentRecord
        ? {
            sourceClassName: currentClass?.name || '',
            lessonUnitTitle: currentRecord.lessonUnitTitle || '',
            lessonTitle: currentRecord.lessonTitle || '',
            lessonContentDetails: currentRecord.lessonContentDetails || '',
            homeworkTitle: currentRecord.homeworkTitle || '',
            homeworkDetail: currentRecord.homeworkDetail || '',
            dueDate: currentRecord.dueDate || '',
          }
        : null);

    if (!sourceClip) return;

    onUpdateState((prev) => {
      const baseList =
        prev.dailyHomeworkRecords && prev.dailyHomeworkRecords.length > 0
          ? [...prev.dailyHomeworkRecords]
          : generateDefaultDailyHomeworkRecords(prev.classes, prev.students);

      for (const cls of prev.classes) {
        const idx = baseList.findIndex(
          (r) => r.classId === cls.id && r.date === selectedDate
        );
        const existing =
          idx >= 0
            ? baseList[idx]
            : dateRecordsByClass[cls.id] || {
                id: `hw-${cls.id}-${selectedDate}`,
                classId: cls.id,
                date: selectedDate,
                assigned: true,
                submissions: {},
                notes: {},
                homeworkTitle: '',
                homeworkDetail: '',
                dueDate: '',
              };

        const updated: DailyHomeworkRecord = {
          ...existing,
          date: selectedDate,
          assigned: true,
          lessonUnitTitle: sourceClip.lessonUnitTitle,
          lessonTitle: sourceClip.lessonTitle,
          lessonContentDetails: sourceClip.lessonContentDetails,
          homeworkTitle: sourceClip.homeworkTitle,
          homeworkDetail: sourceClip.homeworkDetail,
          dueDate: sourceClip.dueDate,
          syncedToWeeklyLog: true,
        };

        if (idx >= 0) {
          baseList[idx] = updated;
        } else {
          baseList.push(updated);
        }
      }

      const nextWeeklyLogs = syncWeeklyLogsFromDailyHomework(
        prev.classes,
        baseList,
        prev.weeklyLogs,
        selectedDate
      );

      return {
        ...prev,
        dailyHomeworkRecords: baseList,
        weeklyLogs: nextWeeklyLogs,
      };
    });

    setSyncMessage(
      `បានចម្លង និងបិទភ្ជាប់មេរៀន & កិច្ចការផ្ទះទៅគ្រប់ថ្នាក់ទាំងអស់ (${state.classes.length} ថ្នាក់) និងបង្កើត «សម្រង់អត្ថបទប្រចាំសប្តាហ៍» បន្តបន្ទាប់គ្នារួចរាល់! (已一键粘贴到所有班级并连续生成周志)`
    );
    window.setTimeout(() => setSyncMessage(null), 4000);
  };

  const handleSyncAllClassesToWeeklyLog = () => {
    onUpdateState((prev) => {
      const baseList =
        prev.dailyHomeworkRecords && prev.dailyHomeworkRecords.length > 0
          ? [...prev.dailyHomeworkRecords]
          : allRecords;
      const nextLogs = syncWeeklyLogsFromDailyHomework(
        prev.classes,
        baseList,
        prev.weeklyLogs,
        selectedDate
      );
      return {
        ...prev,
        dailyHomeworkRecords: baseList,
        weeklyLogs: nextLogs,
      };
    });
    setSyncMessage(
      'បានបញ្ចូលកំណត់ត្រាមេរៀន និងកិច្ចការផ្ទះទាំងអស់ទៅក្នុង សម្រង់អត្ថបទប្រចាំសប្តាហ៍ តាមលំដាប់ថ្នាក់រួចរាល់!'
    );
    window.setTimeout(() => setSyncMessage(null), 3500);
  };

  const handleToggleClassAssigned = (classId: string) => {
    upsertRecord(classId, (rec) => ({
      ...rec,
      assigned: !rec.assigned,
    }));
  };

  const handleDeleteClassHomework = (classId: string) => {
    const targetCls = state.classes.find((c) => c.id === classId);
    upsertRecord(
      classId,
      (rec) => ({
        ...rec,
        assigned: false,
        homeworkTitle: '',
        homeworkDetail: '',
        dueDate: '',
        submissions: {},
        notes: {},
      }),
      true
    );
    setSyncMessage(
      `បានលុបកិច្ចការផ្ទះថ្នាក់ទី ${targetCls?.name || classId} រួចរាល់! (已手动删除该班作业)`
    );
    window.setTimeout(() => setSyncMessage(null), 3500);
  };

  const handleToggleStudentSubmission = (studentId: string) => {
    if (!currentClass) return;
    upsertRecord(
      currentClass.id,
      (rec) => {
        const currentStatus: HomeworkSubmissionStatus =
          rec.submissions?.[studentId] === 'submitted' ? 'missing' : 'submitted';
        return {
          ...rec,
          assigned: true,
          submissions: {
            ...rec.submissions,
            [studentId]: currentStatus,
          },
          notes: {
            ...rec.notes,
            [studentId]:
              currentStatus === 'submitted' ? 'បានប្រគល់រួចរាល់' : 'មិនទាន់ប្រគល់សៀវភៅ',
          },
        };
      },
      false
    );
  };

  const handleMarkAllStudents = (status: HomeworkSubmissionStatus) => {
    if (!currentClass) return;
    upsertRecord(
      currentClass.id,
      (rec) => {
        const nextSub: Record<string, HomeworkSubmissionStatus> = { ...rec.submissions };
        const nextNotes: Record<string, string> = { ...rec.notes };
        classStudents.forEach((stu) => {
          nextSub[stu.id] = status;
          nextNotes[stu.id] =
            status === 'submitted' ? 'បានប្រគល់រួចរាល់' : 'មិនទាន់ប្រគល់សៀវភៅ';
        });
        return {
          ...rec,
          assigned: status === 'submitted' ? true : rec.assigned,
          submissions: nextSub,
          notes: nextNotes,
        };
      },
      false
    );
  };

  const handleStudentNoteChange = (studentId: string, note: string) => {
    if (!currentClass) return;
    upsertRecord(
      currentClass.id,
      (rec) => ({
        ...rec,
        notes: {
          ...rec.notes,
          [studentId]: note,
        },
      }),
      false
    );
  };

  const handleAiHomeworkAndLessonResult = (rawData: unknown) => {
    if (!currentClass || !rawData || typeof rawData !== 'object') return;
    const obj = rawData as Record<string, unknown>;
    upsertRecord(
      currentClass.id,
      (rec) => ({
        ...rec,
        assigned: true,
        lessonUnitTitle: String(
          obj.lessonUnitTitle || rec.lessonUnitTitle || 'ជំពូកទី២ (第二单元)'
        ),
        lessonTitle: String(
          obj.lessonTitle || obj.homeworkTitle || rec.lessonTitle || ''
        ),
        lessonContentDetails: String(
          obj.lessonContentDetails || rec.lessonContentDetails || ''
        ),
        homeworkTitle: String(
          obj.homeworkTitle || obj.title || rec.homeworkTitle
        ),
        homeworkDetail: String(
          obj.homeworkDetail || obj.description || rec.homeworkDetail
        ),
        dueDate: String(obj.dueDate || rec.dueDate),
      }),
      true
    );
    setSyncMessage(
      `បានបង្កើតកំណត់ត្រាមេរៀន និងកិច្ចការផ្ទះថ្នាក់ទី ${currentClass.name} ហើយបញ្ចូលទៅក្នុង សម្រង់អត្ថបទប្រចាំសប្តាហ៍ ស្វ័យប្រវត្តិ!`
    );
    window.setTimeout(() => setSyncMessage(null), 4000);
  };

  const handleSetWeek2Lesson7VocabForAllClasses = () => {
    onUpdateState((prev) => {
      const currentTerm = prev.currentTermId || 'term-2026-2027';
      const termClasses = prev.classes.filter(
        (c) => (c.termId || 'term-2025-2026') === currentTerm
      );
      const targetClasses = termClasses.length > 0 ? termClasses : prev.classes;

      const updatedDailyRecords = generateWeek2DailyHomeworkRecords(
        prev.classes,
        prev.students
      );

      const dayOffsetMap: Record<string, number> = {
        ចន្ទ: 0,
        អង្គារ: 1,
        ពុធ: 2,
        ព្រហស្បតិ៍: 3,
        សុក្រ: 4,
        សៅរ៍: 5,
      };

      const updatedWeeklyLogs = targetClasses.map((cls, idx) => {
        const cleanCode = cleanClassDisplayCode(cls.name || cls.id) || cls.name || cls.id;
        const dayShort = (cls.scheduleDayKh || 'ចន្ទ').replace(/^ថ្ងៃ\s*/g, '').trim();
        // Monday holiday: Monday classes shift to Tuesday 10/11/2026
        const isMondayClass = dayShort === 'ចន្ទ' || cleanCode === '10C' || cleanCode === '10B';
        const offset = isMondayClass ? 1 : (dayOffsetMap[dayShort] ?? Math.min(idx, 3));
        const resolvedDate = addDaysToDdMmYyyy('09/11/2026', offset);
        const resolvedDayShort = isMondayClass ? 'អង្គារ' : dayShort;
        return {
          id: `wlog-week2-${cls.id || cleanCode}-${idx}`,
          weekLabel: 'សប្តាហ៍ទី២ (០៩-១៣ វិច្ឆិកា ២០២៦)',
          dateStr: resolvedDate,
          weekdayKh: resolvedDayShort,
          timeRange: cls.scheduleTime?.trim() || (idx % 2 === 0 ? '13:00-14:30' : '15:00-16:30'),
          classId: cleanCode,
          unitTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
          lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (生词)',
          contentDetails: LESSON_7_VOCAB_CONTENT_DETAILS,
        };
      });

      const existingOtherHw = (prev.dailyHomeworkRecords || []).filter(
        (r) =>
          r.date !== '2026-11-09' &&
          r.date !== '2026-11-10' &&
          r.date !== '2026-11-11' &&
          r.date !== '2026-11-12' &&
          r.date !== '2026-11-13'
      );

      const otherLogs = (prev.weeklyLogs || []).filter(
        (w) =>
          !w.weekLabel?.includes('សប្តាហ៍ទី២') &&
          !w.id.startsWith('wlog-week2-') &&
          !w.id.startsWith('wlog-w2-')
      );

      return {
        ...prev,
        dailyHomeworkRecords: [...updatedDailyRecords, ...existingOtherHw],
        weeklyLogs: [...updatedWeeklyLogs, ...otherLogs],
        weeklyLogMeta: DEFAULT_WEEK2_WEEKLY_LOG_META,
      };
    });
    setSelectedDate('2026-11-10');
    setSyncMessage(
      'បានកំណត់សប្តាហ៍ទី២ (មេរៀនទី៧ ពាក្យថ្មីទាំង ១១ ពាក្យ និងកិច្ចការផ្ទះចម្លង ៥ដង) គ្រប់ថ្នាក់រួចរាល់! ថ្ងៃចន្ទឈប់សម្រាក បានបង្កើតនៅថ្ងៃអង្គារ ១០/១១/២០២៦។ (已一键生成第2周第七课生词作业与周志，周一放假转周二生成)'
    );
    window.setTimeout(() => setSyncMessage(null), 5000);
  };

  const handleSetWeek1PinyinReviewForAllClasses = () => {
    onUpdateState((prev) => {
      const currentTerm = prev.currentTermId || 'term-2026-2027';
      const termClasses = prev.classes.filter(
        (c) => (c.termId || 'term-2025-2026') === currentTerm
      );
      const targetClasses = termClasses.length > 0 ? termClasses : prev.classes;

      const updatedDailyRecords = generateDefaultDailyHomeworkRecords(
        prev.classes,
        prev.students
      );

      const pinyinContent =
        '1. រំលឹកព្យញ្ជនៈទាំង ២៣ (២៣ 声母) ៖ b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w\n2. រំលឹកស្រៈទាំង ២៤ (២៤ 韵母) ៖ a, o, e, i, u, ü, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong\n3. ហាត់អាន បញ្ចេញសំឡេង និងសរសេរឱ្យបានត្រឹមត្រូវ (会读会记 会正确拼读与书写)\nកិច្ចការផ្ទះ (作业) ៖ ចម្លងព្យញ្ជនៈ (声母) ២៣ និង ស្រៈ (韵母) ២៤ ចំនួន ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写声母和韵母各5遍，下周交)';

      const dayOffsetMap: Record<string, number> = {
        ចន្ទ: 0,
        អង្គារ: 1,
        ពុធ: 2,
        ព្រហស្បតិ៍: 3,
        សុក្រ: 4,
        សៅរ៍: 5,
      };

      const updatedWeeklyLogs = targetClasses.map((cls, idx) => {
        const cleanCode = cleanClassDisplayCode(cls.name || cls.id) || cls.name || cls.id;
        const dayShort = (cls.scheduleDayKh || 'ចន្ទ').replace(/^ថ្ងៃ\s*/g, '').trim();
        const offset = dayOffsetMap[dayShort] ?? Math.min(idx, 3);
        const resolvedDate = addDaysToDdMmYyyy('02/11/2026', offset);
        return {
          id: `wlog-week1-${cls.id || cleanCode}-${idx}`,
          weekLabel: 'សប្តាហ៍ទី១ (០២-០៦ វិច្ឆិកា ២០២៦)',
          dateStr: resolvedDate,
          weekdayKh: dayShort,
          timeRange: cls.scheduleTime?.trim() || (idx % 2 === 0 ? '13:00-14:30' : '15:00-16:30'),
          classId: cleanCode,
          unitTitle: '汉语基础（复习）· មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
          lessonTitle: '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)',
          contentDetails: pinyinContent,
        };
      });

      return {
        ...prev,
        dailyHomeworkRecords: updatedDailyRecords,
        weeklyLogs: updatedWeeklyLogs,
        weeklyLogMeta: DEFAULT_WEEKLY_LOG_META,
      };
    });
    setSyncMessage(
      'បានកំណត់សប្តាហ៍ទី១ (ចន្ទ ដល់ ព្រហស្បតិ៍) រំលឹកភីនអ៊ីន (声母២៣ & 韵母២៤) និងកិច្ចការផ្ទះចម្លង ៥ដង សម្រាប់គ្រប់ថ្នាក់រួចរាល់! (已一键生成第1周所有班级拼音复习与作业)'
    );
    window.setTimeout(() => setSyncMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top View Mode Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTrackerMode('monthly')}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                trackerMode === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>តារាងកិច្ចការផ្ទះប្រចាំខែ (月度作业跟踪表 · ៤-៥លើក)</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-indigo-900/60 text-white font-mono font-semibold">
                {isGrade10 ? '满分 20 分 (10年级)' : '满分 10 分 (9年级/8年级)'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTrackerMode('daily')}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                trackerMode === 'daily'
                  ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>កំណត់ត្រាកិច្ចការផ្ទះប្រចាំថ្ងៃ (每日作业记录 · 与周志联动)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>បោះពុម្ព (打印 A4)</span>
            </button>
          </div>
        </div>
      </div>

      {trackerMode === 'monthly' ? (
        <MonthlyHomeworkTableView
          state={state}
          currentClass={currentClass}
          selectedMonthId={selectedMonthId}
          onSelectMonth={setSelectedMonthId}
          onSelectClass={onSelectClass}
          onUpdateState={onUpdateState}
          syncMessage={syncMessage}
          setSyncMessage={setSyncMessage}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Action & Date Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                កំណត់ត្រាកិច្ចការផ្ទះ និងកំណត់ត្រាមេរៀនប្រចាំថ្ងៃ (ភ្ជាប់ស្វ័យប្រវត្តិទៅសម្រង់អត្ថបទប្រចាំសប្តាហ៍)
              </h2>
              <p className="text-xs text-slate-600">
                បំពេញតែ ១ ថ្នាក់ រួចចុចរូបតំណាង «ចម្លង (复制)» និង «បិទភ្ជាប់ (粘贴)» ទៅថ្នាក់បន្ទាប់ ដើម្បីបង្កើត សម្រង់អត្ថបទប្រចាំសប្តាហ៍ តភ្ជាប់គ្នាស្វ័យប្រវត្តិ (ឧ. 10C → 10B)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
              <Calendar className="w-4 h-4" />
              <span>កាលបរិច្ឆេទ (ថ្ងៃនេះ):</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white px-2 py-0.5 rounded border border-slate-300 text-xs font-bold"
              />
            </div>

            <button
              type="button"
              onClick={handleSetWeek2Lesson7VocabForAllClasses}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-2xs ring-2 ring-indigo-300"
              title="កំណត់សប្តាហ៍ទី២ មេរៀនទី៧ អ្នកទិញអ្វី？ (ពាក្យថ្មី ១១ពាក្យ) និងកិច្ចការផ្ទះចម្លង ៥ដង គ្រប់ថ្នាក់ (ថ្ងៃចន្ទឈប់សម្រាក បង្កើតនៅថ្ងៃអង្គារ)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ កំណត់សប្តាហ៍ទី២ មេរៀនទី៧ ពាក្យថ្មី (第2周第七课生词与作业)</span>
            </button>

            <button
              type="button"
              onClick={handleSetWeek1PinyinReviewForAllClasses}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shadow-2xs"
              title="កំណត់សប្តាហ៍ទី១ រំលឹកភីនអ៊ីន (声母 & 韵母) និងកិច្ចការផ្ទះចម្លង ៥ដង គ្រប់ថ្នាក់"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>កំណត់សប្តាហ៍ទី១ រំលឹកភីនអ៊ីន (第1周全周拼音复习)</span>
            </button>

            <button
              type="button"
              onClick={handleSyncAllClassesToWeeklyLog}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>បញ្ចូលកំណត់ត្រាមេរៀនទាំងអស់ទៅ សម្រង់អត្ថបទប្រចាំសប្តាហ៍</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
            ✓ {syncMessage}
          </div>
        )}

        {/* Standard Markdown Copy Bar (Replaces PDF button) */}
        <MarkdownCopyBar
          state={state}
          section="homework_lesson"
          selectedClassId={currentClass?.id || '8A'}
          selectedMonthId="feb"
          label="ចម្លង Markdown កំណត់ត្រាកិច្ចការផ្ទះ & មេរៀន"
        />
      </div>

      {/* Section 1: Today's Class Homework Assignment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Classes Assigned Today */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold">
                ថ្ងៃនេះ ថ្នាក់ដែលបានដាក់កិច្ចការផ្ទះរួចហើយ ({formatNum(assignedClasses.length, state.useKhmerNumerals)}{' '}
                ថ្នាក់)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              បានដាក់កិច្ចការ ✓
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {assignedClasses.map((cls) => {
              const rec = dateRecordsByClass[cls.id];
              const clsStudents = state.students.filter(
                (s) => s.classId === cls.id && s.status === 'active'
              );
              const subCount = clsStudents.filter(
                (s) => rec?.submissions?.[s.id] === 'submitted'
              ).length;
              const missCount = clsStudents.length - subCount;
              const isSelected = cls.id === currentClass?.id;

              return (
                <div
                  key={cls.id}
                  onClick={() => onSelectClass(cls.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-600 ring-1 ring-indigo-600'
                      : 'bg-white border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className="font-bold text-sm">
                      ថ្នាក់ទី {cls.name} ({cls.scheduleDayKh} {cls.scheduleTime})
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyFromClass(cls.id);
                        }}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[11px] font-bold cursor-pointer"
                        title="ចម្លងមេរៀន និងកិច្ចការផ្ទះពីថ្នាក់នេះ (复制本班课程与作业)"
                      >
                        <Copy className="w-3 h-3" />
                        <span>复制</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePasteToClass(cls.id);
                        }}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-violet-100 hover:bg-violet-200 text-violet-800 text-[11px] font-bold cursor-pointer"
                        title="បិទភ្ជាប់មេរៀន និងកិច្ចការផ្ទះមកថ្នាក់នេះ (粘贴课程与作业到本班)"
                      >
                        <ClipboardPaste className="w-3 h-3" />
                        <span>粘贴</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClassHomework(cls.id);
                        }}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold cursor-pointer"
                        title="លុបកិច្ចការផ្ទះថ្នាក់នេះ (删除作业)"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {/* Lesson Title (ចំណងជើងមេរៀន) */}
                  <p className="text-xs text-slate-800 truncate mb-1" title={rec?.lessonTitle || '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)'}>
                    <span className="font-bold text-slate-900">មេរៀន៖</span>{' '}
                    <span className="font-semibold text-slate-700">
                      {rec?.lessonTitle || '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)'}
                    </span>
                  </p>

                  {/* Homework Title (ចំណងជើងកិច្ចការផ្ទះ ៖ ចម្លងភីនអ៊ីន ៥ដង) */}
                  <div
                    className="flex items-center gap-1.5 text-xs text-amber-900 font-bold bg-amber-50/90 px-2 py-1 rounded-md border border-amber-200/80 mb-2 truncate"
                    title={rec?.homeworkTitle || 'ចម្លងភីនអ៊ីន ៥ដង (抄写声母和韵母各5遍)'}
                  >
                    <span className="shrink-0 text-amber-700 font-extrabold">កិច្ចការផ្ទះ៖</span>
                    <span className="truncate">
                      {rec?.homeworkTitle || 'ចម្លងភីនអ៊ីន ៥ដង (抄写声母和韵母各5遍)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-emerald-700 font-bold">
                      បានប្រគល់: {formatNum(subCount, state.useKhmerNumerals)} នាក់
                    </span>
                    <span className="text-rose-700 font-bold">
                      មិនទាន់ប្រគល់: {formatNum(missCount, state.useKhmerNumerals)} នាក់
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Classes Not Yet Assigned Today */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold">
                ថ្ងៃនេះ ថ្នាក់មិនទាន់ដាក់កិច្ចការផ្ទះ ({formatNum(unassignedClasses.length, state.useKhmerNumerals)}{' '}
                ថ្នាក់)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              មិនទាន់ដាក់កិច្ចការ
            </span>
          </div>

          {unassignedClasses.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              គ្រប់ថ្នាក់ទាំងអស់បានដាក់កិច្ចការផ្ទះរួចរាល់សម្រាប់ថ្ងៃនេះ!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {unassignedClasses.map((cls) => {
                const isSelected = cls.id === currentClass?.id;
                return (
                  <div
                    key={cls.id}
                    onClick={() => onSelectClass(cls.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/50 border-indigo-600 ring-1 ring-indigo-600'
                        : 'bg-white border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm">
                        ថ្នាក់ទី {cls.name} ({cls.scheduleDayKh})
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePasteToClass(cls.id);
                          }}
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold cursor-pointer"
                          title="បិទភ្ជាប់មេរៀន និងកិច្ចការផ្ទះមកថ្នាក់នេះ (粘贴到本班)"
                        >
                          <ClipboardPaste className="w-3 h-3" />
                          <span>បិទភ្ជាប់ (粘贴)</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">
                      ម៉ោងសិក្សា: {cls.scheduleTime}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleClassAssigned(cls.id);
                        onSelectClass(cls.id);
                      }}
                      className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                    >
                      + ដាក់កិច្ចការផ្ទះថ្នាក់ {cls.name} ថ្ងៃនេះ
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Lesson Record (កំណត់ត្រាមេរៀន) + Homework Record (កំណត់ត្រាកិច្ចការផ្ទះ) -> Auto Syncs to សម្រង់អត្ថបទប្រចាំសប្តាហ៍ */}
      {currentClass && currentRecord && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold">
                  កំណត់ត្រាមេរៀន និងកំណត់ត្រាកិច្ចការផ្ទះ សម្រាប់ថ្នាក់ទី {currentClass.name} ({currentClass.scheduleDayKh}{' '}
                  {currentClass.scheduleTime})
                </h3>
                <p className="text-xs text-slate-600">
                  រាល់ការបំពេញ ឬចម្លង/បិទភ្ជាប់ (复制/粘贴) នឹងបង្កើតតភ្ជាប់គ្នាក្នុង សម្រង់អត្ថបទប្រចាំសប្តាហ៍ តាមលំដាប់ថ្នាក់ដោយស្វ័យប្រវត្តិ
                </p>
              </div>
            </div>

            {/* Copy & Paste Toolbar + Status Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyFromClass(currentClass.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold cursor-pointer"
                title="ចម្លងមេរៀន និងកិច្ចការផ្ទះពីថ្នាក់នេះ (复制本班课程与作业)"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>ចម្លង (复制)</span>
              </button>

              <button
                type="button"
                onClick={() => handlePasteToClass(currentClass.id)}
                disabled={!copiedClip}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                  copiedClip
                    ? 'bg-violet-600 hover:bg-violet-700 text-white border-violet-600 shadow-2xs'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
                title={
                  copiedClip
                    ? `បិទភ្ជាប់ពីថ្នាក់ ${copiedClip.sourceClassName} មកថ្នាក់ ${currentClass.name} (从 ${copiedClip.sourceClassName} 粘贴到 ${currentClass.name})`
                    : 'សូមចុច «ចម្លង (复制)» ជាមុនសិន'
                }
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>
                  បិទភ្ជាប់ (粘贴
                  {copiedClip ? ` ពី ${copiedClip.sourceClassName}` : ''})
                </span>
              </button>

              <button
                type="button"
                onClick={handlePasteToAllOtherClasses}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-2xs"
                title="ចម្លងមេរៀន និងកិច្ចការផ្ទះនេះទៅគ្រប់ថ្នាក់ទាំងអស់ និងបង្កើតសម្រង់អត្ថបទប្រចាំសប្តាហ៍តភ្ជាប់គ្នា (一键复制粘贴到所有班级)"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>បិទភ្ជាប់ទៅគ្រប់ថ្នាក់ (粘贴到所有班)</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleClassAssigned(currentClass.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  currentRecord.assigned
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {currentRecord.assigned ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>បានដាក់កិច្ចការ</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>មិនទាន់ដាក់កិច្ចការ</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDeleteClassHomework(currentClass.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                title="លុបកិច្ចការផ្ទះថ្នាក់នេះ (删除作业)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>លុប (删除)</span>
              </button>
            </div>
          </div>

          <AiGeneratorBar
            taskType="daily_homework"
            title={`AI បង្កើតកំណត់ត្រាមេរៀន និងកិច្ចការផ្ទះថ្នាក់ទី ${currentClass.name} (ភ្ជាប់ទៅសម្រង់អត្ថបទប្រចាំសប្តាហ៍)`}
            placeholder="ឧ. មេរៀនទី៥៖ ការណែនាំខ្លួន ពាក្យថ្មី និងលំហាត់សរសេរអក្សរចិន..."
            contextData={{
              classId: currentClass.id,
              className: currentClass.name,
              textbook: currentClass.textbookName,
            }}
            onApplyResult={handleAiHomeworkAndLessonResult}
          />

          {/* កំណត់ត្រាមេរៀន (Lesson Record Fields -> Synced to Weekly Log) */}
          <div className="p-3.5 rounded-lg bg-indigo-50/40 border border-indigo-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-indigo-950">
                ១. កំណត់ត្រាមេរៀន (自动同步并按班级顺序连续生成 សម្រង់អត្ថបទប្រចាំសប្តាហ៍)
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <label className="inline-flex items-center gap-1 font-semibold text-slate-700">
                  <span>ថ្ងៃបង្រៀន៖</span>
                  <input
                    type="text"
                    value={currentClass.scheduleDayKh || ''}
                    onChange={(e) =>
                      handleUpdateClassSchedule(currentClass.id, {
                        scheduleDayKh: e.target.value,
                      })
                    }
                    placeholder="ឧ. ថ្ងៃពុធ"
                    className="w-24 px-2 py-0.5 rounded border border-slate-300 bg-white text-xs font-bold"
                  />
                </label>
                <label className="inline-flex items-center gap-1 font-semibold text-slate-700">
                  <span>ម៉ោងសិក្សា (节次)៖</span>
                  <input
                    type="text"
                    value={currentClass.scheduleTime || ''}
                    onChange={(e) =>
                      handleUpdateClassSchedule(currentClass.id, {
                        scheduleTime: e.target.value,
                      })
                    }
                    placeholder="ឧ. 13:00-14:30"
                    className="w-32 px-2 py-0.5 rounded border border-slate-300 bg-white text-xs font-bold font-mono"
                  />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">
                  ជំពូក / 单元 (Unit Title)
                </label>
                <input
                  type="text"
                  value={currentRecord.lessonUnitTitle || ''}
                  onChange={(e) =>
                    upsertRecord(currentClass.id, (rec) => ({
                      ...rec,
                      lessonUnitTitle: e.target.value,
                    }))
                  }
                  placeholder="ឧ. 第二单元 家和学校 · ជំពូកទី២"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  ចំណងជើងមេរៀន / 课题 (Lesson Title)
                </label>
                <input
                  type="text"
                  value={currentRecord.lessonTitle || ''}
                  onChange={(e) =>
                    upsertRecord(currentClass.id, (rec) => ({
                      ...rec,
                      lessonTitle: e.target.value,
                    }))
                  }
                  placeholder="ឧ. 复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-semibold"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      upsertRecord(currentClass.id, (rec) => ({
                        ...rec,
                        lessonUnitTitle: '汉语基础（复习）· មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
                        lessonTitle: '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)',
                        lessonContentDetails:
                          '1. រំលឹកព្យញ្ជនៈទាំង ២៣ (២៣ 声母) ៖ b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w\n2. រំលឹកស្រៈទាំង ២៤ (២៤ 韵母) ៖ a, o, e, i, u, ü, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong\n3. ហាត់អាន បញ្ចេញសំឡេង និងសរសេរឱ្យបានត្រឹមត្រូវ (会读会记 会正确拼读与书写)',
                      }))
                    }
                    className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold border border-indigo-200 cursor-pointer"
                  >
                    + រំលឹកភីនអ៊ីន (复习拼音)
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  ខ្លឹមសារកំណត់ត្រាមេរៀន (ពាក្យថ្មី / ល្បះ / អត្ថបទ)
                </label>
                <input
                  type="text"
                  value={currentRecord.lessonContentDetails || ''}
                  onChange={(e) =>
                    upsertRecord(currentClass.id, (rec) => ({
                      ...rec,
                      lessonContentDetails: e.target.value,
                    }))
                  }
                  placeholder="ឧ. 1. រំលឹកព្យញ្ជនៈ ២៣ (b, p, m...) · 2. ស្រៈ ២៤ (a, o, e...)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* កំណត់ត្រាកិច្ចការផ្ទះ (Homework Record Fields) */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <span className="block text-xs font-bold">
              ២. កំណត់ត្រាកិច្ចការផ្ទះ (ប្រចាំថ្ងៃ)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">
                  ប្រធានបទកិច្ចការផ្ទះ (ចំណងជើងកិច្ចការផ្ទះ)
                </label>
                <input
                  type="text"
                  value={currentRecord.homeworkTitle}
                  onChange={(e) =>
                    upsertRecord(currentClass.id, (rec) => ({
                      ...rec,
                      homeworkTitle: e.target.value,
                    }))
                  }
                  placeholder="ឧ. ចម្លងភីនអ៊ីន ៥ដង (抄写声母和韵母各5遍)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-amber-950"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      upsertRecord(currentClass.id, (rec) => ({
                        ...rec,
                        homeworkTitle: 'ចម្លងភីនអ៊ីន ៥ដង (抄写声母和韵母各5遍)',
                        homeworkDetail:
                          'ចម្លងព្យញ្ជនៈ (声母) ២៣ និង ស្រៈ (韵母) ២៤ ចំនួន ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写声母和韵母各5遍，下周交)',
                        dueDate: 'សប្តាហ៍ក្រោយ (下周交)',
                      }))
                    }
                    className="text-[11px] px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold border border-amber-300 cursor-pointer"
                  >
                    + ចម្លងភីនអ៊ីន ៥ដង (抄写拼音5遍)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      upsertRecord(currentClass.id, (rec) => ({
                        ...rec,
                        homeworkTitle: 'ហាត់សរសេរពាក្យថ្មី ៥ដង (抄写生词5遍)',
                        homeworkDetail: 'ហាត់សរសេរពាក្យថ្មីក្នុងមេរៀនចំនួន ៥ដង និងហាត់អានឱ្យស្ទាត់។',
                        dueDate: 'សប្តាហ៍ក្រោយ (下周交)',
                      }))
                    }
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold border border-slate-300 cursor-pointer"
                  >
                    + សរសេរពាក្យថ្មី ៥ដង
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  ខ្លឹមសារកិច្ចការផ្ទះលម្អិត
                </label>
                <input
                  type="text"
                  value={currentRecord.homeworkDetail}
                  onChange={(e) =>
                    upsertRecord(currentClass.id, (rec) => ({
                      ...rec,
                      homeworkDetail: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  ថ្ងៃកំណត់ប្រគល់កិច្ចការ (ចុចជ្រើសរើសថ្ងៃ/ខែ ឬវាយបញ្ចូល)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={
                      /^\d{2}\/\d{2}\/\d{4}$/.test(currentRecord.dueDate || '')
                        ? ddMmYyyyToIso(currentRecord.dueDate)
                        : selectedDate
                    }
                    onChange={(e) => {
                      const picked = e.target.value;
                      if (!picked) return;
                      upsertRecord(currentClass.id, (rec) => ({
                        ...rec,
                        dueDate: isoToDdMmYyyy(picked),
                      }));
                    }}
                    className="px-2 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold cursor-pointer shrink-0"
                    title="ជ្រើសរើសថ្ងៃ/ខែពីប្រតិទិន"
                  />
                  <input
                    type="text"
                    value={currentRecord.dueDate}
                    placeholder="ឧ. 09/11/2026 ឬ សប្តាហ៍ក្រោយ"
                    onChange={(e) =>
                      upsertRecord(currentClass.id, (rec) => ({
                        ...rec,
                        dueDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Quick Lists of Submitted vs Not Submitted Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              សិស្សបានប្រគល់កិច្ចការហើយ (ថ្នាក់ {currentClass?.name}):{' '}
              {formatNum(submittedStudents.length, state.useKhmerNumerals)} នាក់
            </span>
            <button
              type="button"
              onClick={() => handleMarkAllStudents('submitted')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>ប្រគល់ទាំងអស់</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {submittedStudents.map((stu, idx) => (
              <button
                key={stu.id}
                type="button"
                onClick={() => handleToggleStudentSubmission(stu.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-xs font-medium cursor-pointer"
              >
                <span className="font-bold">✓</span>
                <span>
                  {formatNum(idx + 1, state.useKhmerNumerals)}. {stu.name}
                </span>
                {stu.chineseName && <span>({stu.chineseName})</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              សិស្សមិនទាន់ប្រគល់កិច្ចការ (ថ្នាក់ {currentClass?.name}):{' '}
              {formatNum(missingStudents.length, state.useKhmerNumerals)} នាក់
            </span>
            <button
              type="button"
              onClick={() => handleMarkAllStudents('missing')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>កំណត់ឡើងវិញ</span>
            </button>
          </div>
          {missingStudents.length === 0 ? (
            <div className="py-4 text-center text-xs font-semibold">
              សិស្សទាំងអស់ក្នុងថ្នាក់ទី {currentClass?.name} បានប្រគល់កិច្ចការផ្ទះគ្រប់គ្នា!
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {missingStudents.map((stu, idx) => (
                <button
                  key={stu.id}
                  type="button"
                  onClick={() => handleToggleStudentSubmission(stu.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-xs font-semibold cursor-pointer"
                >
                  <span className="font-bold">✗</span>
                  <span>
                    {formatNum(idx + 1, state.useKhmerNumerals)}. {stu.name}
                  </span>
                  {stu.chineseName && <span>({stu.chineseName})</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Clean Structural Document View */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-8 space-y-4">
        <div className="space-y-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
            <div className="space-y-1 text-left">
              <p className="text-sm font-bold">{state.schoolInfo.departmentKh}</p>
              <p className="text-sm font-bold">{state.schoolInfo.schoolNameKh}</p>
            </div>
            <div className="text-center md:text-right space-y-1">
              <p className="text-sm font-bold">ព្រះរាជាណាចក្រកម្ពុជា</p>
              <p className="text-sm font-bold">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
            </div>
          </div>

          <div className="text-center my-3 space-y-1">
            <h1 className="text-base sm:text-lg font-bold">
              កំណត់ត្រាការដាក់កិច្ចការផ្ទះ និងកំណត់ត្រាមេរៀន ថ្នាក់ទី{currentClass?.name}
            </h1>
            <p className="text-xs sm:text-sm font-bold">
              ឆ្នាំសិក្សា {state.schoolInfo.academicYear} · កាលបរិច្ឆេទ៖ {selectedDate}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm border-y border-slate-300 py-2">
            <div>
              <strong>គ្រូមុខវិជ្ជា ៖ អ្នកគ្រូ {state.schoolInfo.teacherName}</strong> ·{' '}
              <span>មុខវិជ្ជា ៖ {state.schoolInfo.subjectNameKh}</span>
            </div>
            <div>
              <strong>កំណត់ត្រាមេរៀន៖ </strong>
              <span>{currentRecord?.lessonTitle}</span>
            </div>
            <div>
              <strong>ប្រធានបទកិច្ចការផ្ទះ៖ </strong>
              <span>{currentRecord?.homeworkTitle}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                filterMode === 'all' ? 'bg-white shadow-xs' : ''
              }`}
            >
              សិស្សទាំងអស់ ({formatNum(classStudents.length, state.useKhmerNumerals)})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('submitted')}
              className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                filterMode === 'submitted' ? 'bg-white shadow-xs' : ''
              }`}
            >
              បានប្រគល់ហើយ ({formatNum(submittedStudents.length, state.useKhmerNumerals)})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('missing')}
              className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                filterMode === 'missing' ? 'bg-white shadow-xs' : ''
              }`}
            >
              មិនទាន់ប្រគល់ ({formatNum(missingStudents.length, state.useKhmerNumerals)})
            </button>
          </div>

          <span className="text-xs font-bold">
            អ្នកគ្រូ {state.schoolInfo.teacherName}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-800 px-2 py-2 text-center w-12">ល.រ</th>
                <th className="border border-slate-800 px-3 py-2 text-left">គោត្តនាម-នាម</th>
                <th className="border border-slate-800 px-3 py-2 text-left">ឈ្មោះចិន (姓名)</th>
                <th className="border border-slate-800 px-2 py-2 text-center w-14">ភេទ</th>
                <th className="border border-slate-800 px-3 py-2 text-center w-44">
                  ស្ថានភាពប្រគល់កិច្ចការ
                </th>
                <th className="border border-slate-800 px-3 py-2 text-left">ផ្សេងៗ / កំណត់សម្គាល់</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((stu, idx) => {
                const isSubmitted =
                  (currentRecord?.submissions?.[stu.id] || 'missing') === 'submitted';
                const noteVal = currentRecord?.notes?.[stu.id] || '';
                return (
                  <tr key={stu.id}>
                    <td className="border border-slate-800 px-2 py-1.5 text-center font-semibold">
                      {formatNum(idx + 1, state.useKhmerNumerals)}
                    </td>
                    <td className="border border-slate-800 px-3 py-1.5 font-bold">
                      {stu.name}
                    </td>
                    <td className="border border-slate-800 px-3 py-1.5">
                      {stu.chineseName}
                    </td>
                    <td className="border border-slate-800 px-2 py-1.5 text-center">
                      {stu.gender === 'F' ? 'ស' : 'ប'}
                    </td>
                    <td className="border border-slate-800 px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStudentSubmission(stu.id)}
                        className="px-3 py-1 rounded border border-slate-300 text-xs font-bold cursor-pointer"
                      >
                        {isSubmitted ? '✓ បានប្រគល់កិច្ចការ' : '✗ មិនទាន់ប្រគល់'}
                      </button>
                    </td>
                    <td className="border border-slate-800 px-2 py-1">
                      <input
                        type="text"
                        value={noteVal}
                        onChange={(e) => handleStudentNoteChange(stu.id, e.target.value)}
                        placeholder="..."
                        className="w-full bg-transparent text-xs focus:outline-none px-1 py-0.5"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Editable & AI Signature Date Footer */}
        <SignatureDateEditor
          state={state}
          onUpdateState={onUpdateState}
          showPrincipalLeft={false}
          sheetKey={`homework_${selectedClassId}_${selectedDate}`}
        />
      </div>
    </div>
      )}
    </div>
  );
};

