import React, { useMemo, useState } from 'react';
import {
  AppDatabaseState,
  ChineseLessonPlan,
  CurriculumPlanItem,
  Language,
  TeacherMonthlyTaskReport,
  WeeklyLessonLogItem,
  WeeklyLogSignatureMeta,
} from '../types';
import {
  calculateModelSchoolChecklistStats,
  cleanClassDisplayCode,
  convertIsoDateToKhmerSignature,
  ddMmYyyyToIso,
  deriveTeacherDutyReportFromLiveRecords,
  formatNumeral,
  isoToDdMmYyyy,
  normalizeTeacherDutyReport,
  syncCurriculumFromLessonPlans,
  syncDailyHomeworkFromWeeklyLogs,
  syncLessonPlansFromCurriculum,
  syncWeeklyLogsFromDailyHomework,
} from '../utils/calculations';
import { AiGeneratorBar } from './AiGeneratorBar';
import { MarkdownCopyBar } from './MarkdownDocumentView';
import { SignatureDateEditor } from './SignatureDateEditor';
import {
  AlertTriangle,
  BookMarked,
  CalendarDays,
  ClipboardList,
  ClipboardPaste,
  Copy,
  FileCheck2,
  Link2,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Trash2,
  X,
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

type DocTab = 'curriculum' | 'weekly_log' | 'homework_duty' | 'lesson_plan';

const WEEKLY_8_CLASS_TEMPLATE: {
  dayOffset: number;
  weekdayKh: string;
  timeRange: string;
  classId: string;
  defaultUnit: string;
  defaultLesson: string;
  defaultContent: string;
}[] = [
  {
    dayOffset: 0,
    weekdayKh: 'ចន្ទ',
    timeRange: '13:00-14:30',
    classId: '9A',
    defaultUnit: '第一单元 你和我',
    defaultLesson: '第一课 你好 · មេរៀនទី១ សួស្តី',
    defaultContent:
      '1. 生词 ពាក្យថ្មី៖ 你、好、吗、我、很\n2. 句型 ទម្រង់ល្បះ៖ ①你好！ ②你好吗？ ③我很好。',
  },
  {
    dayOffset: 0,
    weekdayKh: 'ចន្ទ',
    timeRange: '15:00-16:30',
    classId: '9C',
    defaultUnit: '第一单元 你和我',
    defaultLesson: '第一课 你好 · មេរៀនទី១ សួស្តី',
    defaultContent:
      '1. 生词 ពាក្យថ្មី៖ 你、好、吗、我、很\n2. 句型 ទម្រង់ល្បះ៖ ①你好！ ②你好吗？ ③我很好。',
  },
  {
    dayOffset: 1,
    weekdayKh: 'អង្គារ',
    timeRange: '13:00-14:30',
    classId: '8C',
    defaultUnit: '第一单元 你和我',
    defaultLesson: '第一课 你好 · មេរៀនទី១ សួស្តី',
    defaultContent:
      '1. 生词 ពាក្យថ្មី៖ 你、好、吗、我、很\n2. 句型 ទម្រង់ល្បះ៖ ①你好！ ②你好吗？ ③我很好。',
  },
  {
    dayOffset: 1,
    weekdayKh: 'អង្គារ',
    timeRange: '15:00-16:30',
    classId: '8A',
    defaultUnit: '第一单元 你和我',
    defaultLesson: '第一课 你好 · មេរៀនទី១ សួស្តី',
    defaultContent:
      '1. 生词 ពាក្យថ្មី៖ 你、好、吗、我、很\n2. 句型 ទម្រង់ល្បះ៖ ①你好！ ②你好吗？ ③我很好。',
  },
  {
    dayOffset: 2,
    weekdayKh: 'ពុធ',
    timeRange: '13:00-14:30',
    classId: '10A',
    defaultUnit: '第一单元 我和朋友',
    defaultLesson: '第一课 他是谁 · មេរៀនទី១ តើគាត់គឺជានរណា',
    defaultContent:
      '1. 生词 ពាក្យថ្មី៖ ①姓 ②名字 ③多 ④朋友 ⑤谁 ⑥欢迎 ⑦地方 ⑧国家 ⑨号码\n2. 句型 ទម្រង់ល្បះ៖ ①你姓什么？ ②叫什么名字？ ③我姓马，我叫马丽丽。 ④他是谁？',
  },
  {
    dayOffset: 2,
    weekdayKh: 'ពុធ',
    timeRange: '15:00-16:30',
    classId: '10C',
    defaultUnit: '第一单元 我和朋友',
    defaultLesson: '第一课 他是谁 · មេរៀនទី១ តើគាត់គឺជានរណា',
    defaultContent:
      '1. 生词 ពាក្យថ្មី៖ ①姓 ②名字 ③多 ④朋友 ⑤谁 ⑥欢迎 ⑦地方 ⑧国家 ⑨号码\n2. 句型 ទម្រង់ល្បះ៖ ①你姓什么？ ②叫什么名字？ ③我姓马，我叫马丽丽。 ④他是谁？',
  },
  {
    dayOffset: 3,
    weekdayKh: 'ព្រហស្បតិ៍',
    timeRange: '13:00-14:30',
    classId: '9B',
    defaultUnit: '第一单元 你和我',
    defaultLesson: '第一课 你好 · មេរៀនទី១ សួស្តី',
    defaultContent:
      '1. 生词 ពាក្យថ្មី៖ 你、好、吗、我、很\n2. 句型 ទម្រង់ល្បះ៖ ①你好！ ②你好吗？ ③我很好。',
  },
  {
    dayOffset: 3,
    weekdayKh: 'ព្រហស្បតិ៍',
    timeRange: '15:00-16:30',
    classId: '8B',
    defaultUnit: '第一单元 你和我',
    defaultLesson: '第一课 你好 · មេរៀនទី១ សួស្តី',
    defaultContent:
      '1. 生词 ពាក្យថ្មី៖ 你、好、吗、我、很\n2. 句型 ទម្រង់ល្បះ៖ ①你好！ ②你好吗？ ③我很好。',
  },
];

export const GeipPlanModule: React.FC<Props> = ({
  state,
  selectedClassId,
  onSelectClassId,
  selectedMonthId,
  onSelectMonthId,
  onUpdateState,
}) => {
  const [docTab, setDocTab] = useState<DocTab>('curriculum');
  const [selectedLessonPlanId, setSelectedLessonPlanId] = useState<string>(
    state.lessonPlans[0]?.id || 'lp-0'
  );
  const [weekMondayDateInput, setWeekMondayDateInput] = useState('02/11/2026');
  const [pendingDeleteLessonPlan, setPendingDeleteLessonPlan] = useState<{
    id: string;
    linkedCurriculumId?: string;
    index: number;
    title: string;
  } | null>(null);
  const [copiedWeeklyLogClip, setCopiedWeeklyLogClip] = useState<{
    sourceClassId: string;
    unitTitle: string;
    lessonTitle: string;
    contentDetails: string;
  } | null>(null);
  const [autoPropagateWeeklyLogs, setAutoPropagateWeeklyLogs] = useState<boolean>(true);
  const [weeklySyncNotice, setWeeklySyncNotice] = useState<string | null>(null);

  const activeClass =
    state.classes.find((c) => c.id === selectedClassId) || state.classes[0];

  const enabledMonths = useMemo(
    () => state.months.filter((m) => m.enabled && !m.isSemesterExam),
    [state.months]
  );

  const activeMonth =
    enabledMonths.find((m) => m.id === selectedMonthId) ||
    enabledMonths.find((m) => m.id === 'nov') ||
    enabledMonths[0] ||
    state.months[0];

  // Bidirectional 1-to-1 synced lesson plans from curriculumPlan
  const effectiveLessonPlans = useMemo(
    () =>
      syncLessonPlansFromCurriculum(state.curriculumPlan, state.lessonPlans),
    [state.curriculumPlan, state.lessonPlans]
  );

  const activeLessonPlan =
    effectiveLessonPlans.find((lp) => lp.id === selectedLessonPlanId) ||
    effectiveLessonPlans[0];

  // Sequential weekly logs synced with active term classes & daily homework/lesson records
  const displayedWeeklyLogs = useMemo(
    () =>
      syncWeeklyLogsFromDailyHomework(
        state.classes,
        state.dailyHomeworkRecords || [],
        state.weeklyLogs
      ),
    [state.classes, state.dailyHomeworkRecords, state.weeklyLogs]
  );

  const weeklyMeta: WeeklyLogSignatureMeta = state.weeklyLogMeta || {
    fridayDateStr: '06/11/2026',
    lunarDate: 'ថ្ងៃសុក្រ ១២រោច ខែកត្តិក ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី០៦ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
    textbookTitle: '快乐汉语（第二册）ភាសាចិនរីករាយ (កំរិត២)',
  };

  const activeClassStudents = useMemo(
    () => state.students.filter((s) => s.classId === activeClass?.id),
    [state.students, activeClass?.id]
  );

  const checklistStats = useMemo(
    () =>
      calculateModelSchoolChecklistStats(
        activeClassStudents,
        state.standardEvaluations[activeClass?.id]?.[activeMonth?.id]
      ),
    [activeClassStudents, state.standardEvaluations, activeClass?.id, activeMonth?.id]
  );

  const liveDerivedDutyReport: TeacherMonthlyTaskReport = useMemo(
    () =>
      deriveTeacherDutyReportFromLiveRecords(
        {
          ...state,
          weeklyLogs: displayedWeeklyLogs,
        },
        activeClass?.id || '8A',
        activeMonth?.id || 'nov'
      ),
    [state, displayedWeeklyLogs, activeClass?.id, activeMonth?.id]
  );

  const currentTaskReport: TeacherMonthlyTaskReport = useMemo(() => {
    const saved = state.teacherTaskReports[activeClass?.id]?.[activeMonth?.id];
    return normalizeTeacherDutyReport(saved, liveDerivedDutyReport);
  }, [state.teacherTaskReports, activeClass?.id, activeMonth?.id, liveDerivedDutyReport]);

  const updateCurrentTaskReport = (
    patch: Partial<TeacherMonthlyTaskReport>
  ) => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    onUpdateState((prev) => ({
      ...prev,
      teacherTaskReports: {
        ...prev.teacherTaskReports,
        [cId]: {
          ...(prev.teacherTaskReports[cId] || {}),
          [mId]: {
            ...currentTaskReport,
            ...patch,
          },
        },
      },
    }));
  };

  const handleSyncDutyFromWeeklyAndDaily = () => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    const fresh = deriveTeacherDutyReportFromLiveRecords(
      { ...state, weeklyLogs: displayedWeeklyLogs },
      cId,
      mId
    );
    onUpdateState((prev) => ({
      ...prev,
      teacherTaskReports: {
        ...prev.teacherTaskReports,
        [cId]: {
          ...(prev.teacherTaskReports[cId] || {}),
          [mId]: fresh,
        },
      },
    }));
  };

  const handleSyncDutyAllClasses = () => {
    const mId = activeMonth.id;
    onUpdateState((prev) => {
      const nextReports = { ...prev.teacherTaskReports };
      for (const cls of prev.classes) {
        const fresh = deriveTeacherDutyReportFromLiveRecords(
          { ...prev, weeklyLogs: displayedWeeklyLogs },
          cls.id,
          mId
        );
        nextReports[cls.id] = {
          ...(nextReports[cls.id] || {}),
          [mId]: fresh,
        };
      }
      return {
        ...prev,
        teacherTaskReports: nextReports,
      };
    });
  };

  // --- Curriculum Handlers (Bidirectionally synced with Lesson Plans ៤. កិច្ចតែងការបង្រៀន) ---
  const handleAddCurriculumRow = () => {
    const newRow: CurriculumPlanItem = {
      id: `cur-${Date.now()}`,
      monthNameKh: 'សីហា',
      weekNumber: '៤',
      lessonContent: '复习与期末考试 · រំលឹកមេរៀន និងប្រឡងឆមាសទី២',
      pageNumber: '៧៨-៩០',
      hours: 1.5,
      note: '',
    };
    onUpdateState((prev) => {
      const nextCurriculum = [...prev.curriculumPlan, newRow];
      const nextLessonPlans = syncLessonPlansFromCurriculum(
        nextCurriculum,
        prev.lessonPlans
      );
      return {
        ...prev,
        curriculumPlan: nextCurriculum,
        lessonPlans: nextLessonPlans,
      };
    });
  };

  const handleCurriculumChange = (
    id: string,
    field: keyof CurriculumPlanItem,
    value: string | number
  ) => {
    onUpdateState((prev) => {
      const nextCurriculum = prev.curriculumPlan.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      );
      const nextLessonPlans = syncLessonPlansFromCurriculum(
        nextCurriculum,
        prev.lessonPlans
      );
      return {
        ...prev,
        curriculumPlan: nextCurriculum,
        lessonPlans: nextLessonPlans,
      };
    });
  };

  const handleDeleteCurriculumRow = (id: string) => {
    onUpdateState((prev) => {
      const nextCurriculum = prev.curriculumPlan.filter((item) => item.id !== id);
      const nextLessonPlans = syncLessonPlansFromCurriculum(
        nextCurriculum,
        prev.lessonPlans.filter((lp) => lp.linkedCurriculumId !== id)
      );
      return {
        ...prev,
        curriculumPlan: nextCurriculum,
        lessonPlans: nextLessonPlans,
      };
    });
  };

  // --- Weekly Log Handlers (Bidirectionally synced with កំណត់ត្រាមេរៀន និងកំណត់ត្រាកិច្ចការផ្ទះ) ---
  const handleWeeklyLogChange = (
    id: string,
    field: keyof WeeklyLessonLogItem,
    value: string
  ) => {
    onUpdateState((prev) => {
      const baseLogs = syncWeeklyLogsFromDailyHomework(
        prev.classes,
        prev.dailyHomeworkRecords || [],
        prev.weeklyLogs
      );
      const editedIdx = baseLogs.findIndex((w) => w.id === id);
      const isContentField =
        field === 'unitTitle' || field === 'lessonTitle' || field === 'contentDetails';

      const nextWeeklyLogs = baseLogs.map((w, idx) => {
        if (w.id === id) {
          return { ...w, [field]: value };
        }
        // When autoPropagateWeeklyLogs is enabled, editing lesson content in e.g. 10C (period 1) automatically updates 10B (period 2) and subsequent classes
        if (autoPropagateWeeklyLogs && isContentField && editedIdx >= 0 && idx > editedIdx) {
          return { ...w, [field]: value };
        }
        return w;
      });
      const nextDailyRecords = syncDailyHomeworkFromWeeklyLogs(
        nextWeeklyLogs,
        prev.classes,
        prev.dailyHomeworkRecords || []
      );
      return {
        ...prev,
        weeklyLogs: nextWeeklyLogs,
        dailyHomeworkRecords: nextDailyRecords,
      };
    });
  };

  const handleCopyWeeklyLogRow = (log: WeeklyLessonLogItem, rowIndex?: number) => {
    const clip = {
      sourceClassId: log.classId,
      unitTitle: log.unitTitle || '',
      lessonTitle: log.lessonTitle || '',
      contentDetails: log.contentDetails || '',
    };
    setCopiedWeeklyLogClip(clip);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(`${clip.unitTitle}\n${clip.lessonTitle}\n${clip.contentDetails}`)
        .catch(() => {});
    }

    // If copying from the last row (or if there is only 1 row), automatically create a blank next row below so the user has a space to click Paste!
    onUpdateState((prev) => {
      const baseLogs = syncWeeklyLogsFromDailyHomework(
        prev.classes,
        prev.dailyHomeworkRecords || [],
        prev.weeklyLogs
      );
      const isLastRow =
        rowIndex === undefined || rowIndex >= baseLogs.length - 1;
      if (!isLastRow) {
        return prev;
      }
      const nextTimeRange =
        log.timeRange === '13:00-14:30' ? '15:00-16:30' : '13:00-14:30';
      const newBlankRow: WeeklyLessonLogItem = {
        id: `wlog-manual-${Date.now()}`,
        dateStr: log.dateStr || weekMondayDateInput,
        weekdayKh: log.weekdayKh || 'ពុធ',
        timeRange: nextTimeRange,
        classId: '',
        unitTitle: '',
        lessonTitle: '',
        contentDetails: '',
      };
      return {
        ...prev,
        weeklyLogs: [...baseLogs, newBlankRow],
      };
    });

    setWeeklySyncNotice(
      `✓ បានចម្លងមេរៀនពីថ្នាក់ ${clip.sourceClassId} និងបង្កើតជួរថ្មីខាងក្រោមរួចរាល់! សូមចុច «បិទភ្ជាប់ (粘贴)» នៅជួរខាងក្រោម។ (已复制并在下方自动留出新行空间，请点击下方「粘贴」)`
    );
    window.setTimeout(() => setWeeklySyncNotice(null), 5000);
  };

  const handleInsertBlankRowBelow = (afterIndex: number, autoPaste = false) => {
    const source =
      copiedWeeklyLogClip ||
      (displayedWeeklyLogs[afterIndex]
        ? {
            sourceClassId: displayedWeeklyLogs[afterIndex].classId,
            unitTitle: displayedWeeklyLogs[afterIndex].unitTitle,
            lessonTitle: displayedWeeklyLogs[afterIndex].lessonTitle,
            contentDetails: displayedWeeklyLogs[afterIndex].contentDetails,
          }
        : null);

    onUpdateState((prev) => {
      const baseLogs = syncWeeklyLogsFromDailyHomework(
        prev.classes,
        prev.dailyHomeworkRecords || [],
        prev.weeklyLogs
      );
      const refRow = baseLogs[afterIndex] || baseLogs[baseLogs.length - 1];
      const nextTimeRange =
        refRow?.timeRange === '13:00-14:30' ? '15:00-16:30' : '13:00-14:30';
      const newRow: WeeklyLessonLogItem = {
        id: `wlog-manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        dateStr: refRow?.dateStr || weekMondayDateInput,
        weekdayKh: refRow?.weekdayKh || 'ពុធ',
        timeRange: nextTimeRange,
        classId: '',
        unitTitle: autoPaste && source ? source.unitTitle : '',
        lessonTitle: autoPaste && source ? source.lessonTitle : '',
        contentDetails: autoPaste && source ? source.contentDetails : '',
      };
      const nextWeeklyLogs = [...baseLogs];
      nextWeeklyLogs.splice(afterIndex + 1, 0, newRow);
      const nextDailyRecords = syncDailyHomeworkFromWeeklyLogs(
        nextWeeklyLogs,
        prev.classes,
        prev.dailyHomeworkRecords || []
      );
      return {
        ...prev,
        weeklyLogs: nextWeeklyLogs,
        dailyHomeworkRecords: nextDailyRecords,
      };
    });

    setWeeklySyncNotice(
      autoPaste
        ? `✓ បានបន្ថែមជួរថ្មីខាងក្រោម និងបិទភ្ជាប់មេរៀនរួចរាល់! (已在下一行新增并粘贴课程内容)`
        : `✓ បានបន្ថែមជួរទទេខាងក្រោមរួចរាល់! អ្នកអាចចុច «បិទភ្ជាប់ (粘贴)» បាន។ (已在下一行留出空白行，可点击粘贴)`
    );
    window.setTimeout(() => setWeeklySyncNotice(null), 4000);
  };

  const handlePasteWeeklyLogRow = (targetLogId: string) => {
    const source =
      copiedWeeklyLogClip ||
      (displayedWeeklyLogs[0]
        ? {
            sourceClassId: displayedWeeklyLogs[0].classId,
            unitTitle: displayedWeeklyLogs[0].unitTitle,
            lessonTitle: displayedWeeklyLogs[0].lessonTitle,
            contentDetails: displayedWeeklyLogs[0].contentDetails,
          }
        : null);
    if (!source) return;

    onUpdateState((prev) => {
      const baseLogs = syncWeeklyLogsFromDailyHomework(
        prev.classes,
        prev.dailyHomeworkRecords || [],
        prev.weeklyLogs
      );
      const nextWeeklyLogs = baseLogs.map((w) =>
        w.id === targetLogId
          ? {
              ...w,
              unitTitle: source.unitTitle,
              lessonTitle: source.lessonTitle,
              contentDetails: source.contentDetails,
            }
          : w
      );
      const nextDailyRecords = syncDailyHomeworkFromWeeklyLogs(
        nextWeeklyLogs,
        prev.classes,
        prev.dailyHomeworkRecords || []
      );
      return {
        ...prev,
        weeklyLogs: nextWeeklyLogs,
        dailyHomeworkRecords: nextDailyRecords,
      };
    });
    setWeeklySyncNotice(`✓ បានបិទភ្ជាប់មេរៀនពីថ្នាក់ ${source.sourceClassId} រួចរាល់! (已成功粘贴课程内容到本行)`);
    window.setTimeout(() => setWeeklySyncNotice(null), 3500);
  };

  const handlePropagateWeeklyLogToSubsequent = (fromIndex = 0) => {
    onUpdateState((prev) => {
      const baseLogs = syncWeeklyLogsFromDailyHomework(
        prev.classes,
        prev.dailyHomeworkRecords || [],
        prev.weeklyLogs
      );
      const sourceRow = baseLogs[fromIndex] || baseLogs[0];
      if (!sourceRow) return prev;

      const clip = copiedWeeklyLogClip && fromIndex === 0 ? copiedWeeklyLogClip : {
        sourceClassId: sourceRow.classId,
        unitTitle: sourceRow.unitTitle,
        lessonTitle: sourceRow.lessonTitle,
        contentDetails: sourceRow.contentDetails,
      };

      const nextWeeklyLogs = baseLogs.map((w, idx) =>
        idx >= fromIndex
          ? {
              ...w,
              unitTitle: clip.unitTitle,
              lessonTitle: clip.lessonTitle,
              contentDetails: clip.contentDetails,
            }
          : w
      );
      const nextDailyRecords = syncDailyHomeworkFromWeeklyLogs(
        nextWeeklyLogs,
        prev.classes,
        prev.dailyHomeworkRecords || []
      );
      return {
        ...prev,
        weeklyLogs: nextWeeklyLogs,
        dailyHomeworkRecords: nextDailyRecords,
      };
    });
    setWeeklySyncNotice(
      `✓ បានបំពេញ និងចម្លងមេរៀនបន្តបន្ទាប់គ្នាទៅគ្រប់ថ្នាក់រួចរាល់! (已连续复制并生成到后续所有班级)`
    );
    window.setTimeout(() => setWeeklySyncNotice(null), 4000);
  };

  const handleConfirmDeleteLessonPlan = () => {
    if (!pendingDeleteLessonPlan) return;
    const { id, linkedCurriculumId, index } = pendingDeleteLessonPlan;
    onUpdateState((prev) => {
      const basePlans = syncLessonPlansFromCurriculum(
        prev.curriculumPlan,
        prev.lessonPlans
      );
      const nextLessonPlans = basePlans.filter(
        (lp, idx) => lp.id !== id && idx !== index
      );
      const nextCurriculum = prev.curriculumPlan.filter((c, idx) => {
        if (linkedCurriculumId && c.id === linkedCurriculumId) return false;
        if (c.linkedLessonPlanId && c.linkedLessonPlanId === id) return false;
        if (idx === index && prev.curriculumPlan.length === basePlans.length) return false;
        return true;
      });
      if (selectedLessonPlanId === id && nextLessonPlans.length > 0) {
        const nextSel =
          nextLessonPlans[Math.min(index, nextLessonPlans.length - 1)] ||
          nextLessonPlans[0];
        setSelectedLessonPlanId(nextSel.id);
      }
      return {
        ...prev,
        lessonPlans: nextLessonPlans,
        curriculumPlan: nextCurriculum,
      };
    });
    setPendingDeleteLessonPlan(null);
  };

  const handleDeleteWeeklyLog = (id: string) => {
    onUpdateState((prev) => {
      const baseLogs = syncWeeklyLogsFromDailyHomework(
        prev.classes,
        prev.dailyHomeworkRecords || [],
        prev.weeklyLogs
      );
      return {
        ...prev,
        weeklyLogs: baseLogs.filter((w) => w.id !== id),
      };
    });
  };

  const handleAddSingleWeeklyLog = () => {
    const newItem: WeeklyLessonLogItem = {
      id: `wlog-manual-${Date.now()}`,
      dateStr: weekMondayDateInput,
      weekdayKh: (activeClass?.scheduleDayKh || 'ពុធ').replace(/^ថ្ងៃ\s*/g, ''),
      timeRange: activeClass?.scheduleTime || '15:00-16:30',
      classId: '',
      unitTitle: copiedWeeklyLogClip?.unitTitle || '',
      lessonTitle: copiedWeeklyLogClip?.lessonTitle || '',
      contentDetails: copiedWeeklyLogClip?.contentDetails || '',
    };
    onUpdateState((prev) => {
      const baseLogs = syncWeeklyLogsFromDailyHomework(
        prev.classes,
        prev.dailyHomeworkRecords || [],
        prev.weeklyLogs
      );
      const nextWeeklyLogs = [...baseLogs, newItem];
      const nextDailyRecords = syncDailyHomeworkFromWeeklyLogs(
        nextWeeklyLogs,
        prev.classes,
        prev.dailyHomeworkRecords || []
      );
      return {
        ...prev,
        weeklyLogs: nextWeeklyLogs,
        dailyHomeworkRecords: nextDailyRecords,
      };
    });
  };

  const addDaysToDdMmYyyy = (baseStr: string, offsetDays: number): string => {
    const parts = baseStr.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const dt = new Date(y, m, d + offsetDays);
      if (!Number.isNaN(dt.getTime())) {
        const dd = String(dt.getDate()).padStart(2, '0');
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const yyyy = dt.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    }
    return baseStr;
  };

  const handleGenerateFull8ClassWeek = () => {
    onUpdateState((prev) => {
      const generated: WeeklyLessonLogItem[] =
        prev.classes.length > 0
          ? prev.classes.map((cls, idx) => {
              const cleanCode = cleanClassDisplayCode(cls.name || cls.id);
              const dayShort = (cls.scheduleDayKh || 'ចន្ទ')
                .replace(/^ថ្ងៃ\s*/g, '')
                .trim();
              const dayOffsetMap: Record<string, number> = {
                ចន្ទ: 0,
                អង្គារ: 1,
                ពុធ: 2,
                ព្រហស្បតិ៍: 3,
                សុក្រ: 4,
                សៅរ៍: 5,
              };
              const offset = dayOffsetMap[dayShort] ?? Math.min(idx, 4);
              const existingRec = (prev.dailyHomeworkRecords || []).find(
                (r) => r.classId === cls.id
              );
              return {
                id: `wlog-week-${cls.id}-${Date.now()}-${idx}`,
                dateStr: addDaysToDdMmYyyy(weekMondayDateInput, offset),
                weekdayKh: dayShort,
                timeRange:
                  cls.scheduleTime ||
                  (idx % 2 === 0 ? '13:00-14:30' : '15:00-16:30'),
                classId: cleanCode,
                unitTitle:
                  existingRec?.lessonUnitTitle ||
                  (cls.gradeLevel >= 10 ? '第一单元 我和朋友' : '第一单元 你和我'),
                lessonTitle:
                  existingRec?.lessonTitle ||
                  (cls.gradeLevel >= 10
                    ? '第一课 他是谁 · មេរៀនទី១ តើគាត់គឺជានរណា'
                    : '第一课 你好 · មេរៀនទី១ សួស្តី'),
                contentDetails:
                  existingRec?.lessonContentDetails ||
                  '1. 生词 ពាក្យថ្មី៖ 你、好、吗、我、很\n2. 句型 ទម្រង់ល្បះ៖ ①你好！ ②你好吗？ ③我很好。',
              };
            })
          : WEEKLY_8_CLASS_TEMPLATE.map((tpl, idx) => ({
              id: `wlog-week-${Date.now()}-${idx}`,
              dateStr: addDaysToDdMmYyyy(weekMondayDateInput, tpl.dayOffset),
              weekdayKh: tpl.weekdayKh,
              timeRange: tpl.timeRange,
              classId: tpl.classId,
              unitTitle: tpl.defaultUnit,
              lessonTitle: tpl.defaultLesson,
              contentDetails: tpl.defaultContent,
            }));

      const fridayStr = addDaysToDdMmYyyy(weekMondayDateInput, 4);
      const nextDailyRecords = syncDailyHomeworkFromWeeklyLogs(
        generated,
        prev.classes,
        prev.dailyHomeworkRecords || []
      );
      return {
        ...prev,
        weeklyLogs: generated,
        dailyHomeworkRecords: nextDailyRecords,
        weeklyLogMeta: {
          ...(prev.weeklyLogMeta || weeklyMeta),
          fridayDateStr: fridayStr,
        },
      };
    });
  };

  const updateWeeklyMeta = (patch: Partial<WeeklyLogSignatureMeta>) => {
    onUpdateState((prev) => ({
      ...prev,
      weeklyLogMeta: {
        ...weeklyMeta,
        ...patch,
      },
    }));
  };

  // --- Lesson Plan Inline Editing Handlers (Bidirectionally synced with ១. កម្មវិធីសិក្សាប្រចាំឆ្នាំ) ---
  const updateActiveLessonPlan = (patch: Partial<ChineseLessonPlan>) => {
    if (!activeLessonPlan) return;
    onUpdateState((prev) => {
      const basePlans = syncLessonPlansFromCurriculum(
        prev.curriculumPlan,
        prev.lessonPlans
      );
      const nextLessonPlans = basePlans.map((lp) =>
        lp.id === activeLessonPlan.id ? { ...lp, ...patch } : lp
      );
      const nextCurriculum = syncCurriculumFromLessonPlans(
        nextLessonPlans,
        prev.curriculumPlan
      );
      return {
        ...prev,
        lessonPlans: nextLessonPlans,
        curriculumPlan: nextCurriculum,
      };
    });
  };

  const handleAddLessonPlan = () => {
    const newId = `lp-${Date.now()}`;
    const newCurId = `cur-auto-${Date.now()}`;
    const newLp: ChineseLessonPlan = {
      id: newId,
      linkedCurriculumId: newCurId,
      chapterTitle: 'ជំពូកទី៣ ការទិញទំនិញ (第三单元 购物)',
      lessonTitle: 'មេរៀនថ្មី (新课)',
      durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
      pagesLabel: 'ទំព័រទី... ដល់ ទំព័រទី...',
      textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语',
      knowledgeObjective:
        'សិស្សប្រើប្រាស់ត្រឹមត្រូវក្នុងការប្រាស្រ័យទាក់ទងគ្នាជាភាសាចិន...',
      skillObjective:
        'សិស្សចេះអាន និងសរសេរពាក្យថ្មី និងគំនូសអក្សរចិន...',
      attitudeObjective:
        'សិស្សមានវិន័យល្អក្នុងការចូលរួម សហការណ៍ ក្នុងសកម្មភាពសិក្សា។',
      teachingMaterialsTeacher:
        'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណអក្សររូបភាព',
      teachingMaterialsStudent: 'សៀវភៅគោលសម្រាប់សិស្ស សៀវភៅលំហាត់',
      dateWeekday: '',
      dateDay: '',
      dateMonth: '',
      dateYear: '២០២៦',
      sessions: [
        {
          sessionTitle: 'ម៉ោងសិក្សាទី១ — ពាក្យថ្មី និងទម្រង់ល្បះ',
          steps: [
            {
              stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
              teacherActivity: 'ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ និងវត្តមានសិស្ស',
              lessonContent: 'ពង្រឹងវិន័យ និងពិនិត្យវត្តមាន',
              studentActivity: 'ប្រធានថ្នាក់រាយការណ៍វត្តមានសិស្ស',
            },
            {
              stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
              teacherActivity: 'សួរសំណួររំលឹកពាក្យ និងល្បះមេរៀនមុន',
              lessonContent: 'រំលឹកមេរៀនចាស់',
              studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ',
            },
            {
              stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
              teacherActivity:
                'សរសេរចំណងជើង និងបង្រៀនពាក្យថ្មី ព្រមទាំងទម្រង់ល្បះ',
              lessonContent:
                '一. 生词 ពាក្យថ្មី៖ ...\n二. 句型 ទម្រង់ល្បះ៖ ...',
              studentActivity:
                'សិស្សអានតាមគ្រូ ចាប់គូសន្ទនា និងកត់ត្រាចូលសៀវភៅ',
            },
            {
              stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
              teacherActivity: 'ហៅសិស្សឡើងអាន និងបកប្រែល្បះ',
              lessonContent: 'ហ្វឹកហាត់អាន និងឆ្លើយសំណួរ',
              studentActivity: 'សិស្សឡើងអាន និងឆ្លើយសំណួរ',
            },
            {
              stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ (៥នាទី)',
              teacherActivity: 'ដាក់កិច្ចការផ្ទះ និងណែនាំឱ្យសិស្សស្វ័យសិក្សា',
              lessonContent:
                '作业 កិច្ចការផ្ទះ៖ ហាត់សរសេរពាក្យថ្មី និងទម្រង់ល្បះ',
              studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ',
            },
          ],
        },
      ],
    };
    onUpdateState((prev) => {
      const basePlans = syncLessonPlansFromCurriculum(
        prev.curriculumPlan,
        prev.lessonPlans
      );
      const nextLessonPlans = [...basePlans, newLp];
      const nextCurriculum = syncCurriculumFromLessonPlans(
        nextLessonPlans,
        prev.curriculumPlan
      );
      return {
        ...prev,
        lessonPlans: nextLessonPlans,
        curriculumPlan: nextCurriculum,
      };
    });
    setSelectedLessonPlanId(newLp.id);
  };

  // --- AI Generation Result Callbacks ---
  const handleAiCurriculumResult = (data: unknown, mode: 'replace' | 'append') => {
    if (!data || typeof data !== 'object') return;
    const rawItems = (data as { items?: Partial<CurriculumPlanItem>[] }).items;
    if (!Array.isArray(rawItems) || rawItems.length === 0) return;

    const built: CurriculumPlanItem[] = rawItems.map((it, idx) => ({
      id: `cur-ai-${Date.now()}-${idx}`,
      monthNameKh: it.monthNameKh || 'វិច្ឆិកា',
      weekNumber: it.weekNumber || '១',
      lessonContent: it.lessonContent || '',
      pageNumber: it.pageNumber || '-',
      hours: typeof it.hours === 'number' ? it.hours : 1.5,
      note: it.note || '',
    }));

    onUpdateState((prev) => {
      const nextCurriculum =
        mode === 'replace' ? built : [...prev.curriculumPlan, ...built];
      const nextLessonPlans = syncLessonPlansFromCurriculum(
        nextCurriculum,
        mode === 'replace' ? [] : prev.lessonPlans
      );
      return {
        ...prev,
        curriculumPlan: nextCurriculum,
        lessonPlans: nextLessonPlans,
      };
    });
  };

  const handleAiWeeklyLogResult = (data: unknown, mode: 'replace' | 'append') => {
    if (!data || typeof data !== 'object') return;
    const rawLogs = (data as { logs?: Partial<WeeklyLessonLogItem>[] }).logs;
    if (!Array.isArray(rawLogs) || rawLogs.length === 0) return;

    const built: WeeklyLessonLogItem[] = rawLogs.map((lg, idx) => ({
      id: `wlog-ai-${Date.now()}-${idx}`,
      dateStr: lg.dateStr || weekMondayDateInput,
      weekdayKh: lg.weekdayKh || 'ចន្ទ',
      timeRange: lg.timeRange || '13:00-14:30',
      classId: lg.classId || '9A',
      unitTitle: lg.unitTitle || '',
      lessonTitle: lg.lessonTitle || '',
      contentDetails: lg.contentDetails || '',
    }));

    onUpdateState((prev) => {
      const nextWeeklyLogs =
        mode === 'replace' ? built : [...displayedWeeklyLogs, ...built];
      const nextDailyRecords = syncDailyHomeworkFromWeeklyLogs(
        nextWeeklyLogs,
        prev.classes,
        prev.dailyHomeworkRecords || []
      );
      return {
        ...prev,
        weeklyLogs: nextWeeklyLogs,
        dailyHomeworkRecords: nextDailyRecords,
      };
    });
  };

  const handleAiHomeworkDutyResult = (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const d = data as Partial<TeacherMonthlyTaskReport>;
    updateCurrentTaskReport({
      monthTitleKh: d.monthTitleKh || currentTaskReport.monthTitleKh,
      preStudyAssignedCount:
        typeof d.preStudyAssignedCount === 'number'
          ? d.preStudyAssignedCount
          : currentTaskReport.preStudyAssignedCount,
      preStudyDetails:
        Array.isArray(d.preStudyDetails) && d.preStudyDetails.length > 0
          ? d.preStudyDetails
          : currentTaskReport.preStudyDetails,
      projectAssignedCount:
        typeof d.projectAssignedCount === 'number'
          ? d.projectAssignedCount
          : currentTaskReport.projectAssignedCount,
      projectDetails:
        Array.isArray(d.projectDetails) && d.projectDetails.length > 0
          ? d.projectDetails
          : currentTaskReport.projectDetails,
      homeworkAssignedCount:
        typeof d.homeworkAssignedCount === 'number'
          ? d.homeworkAssignedCount
          : currentTaskReport.homeworkAssignedCount,
      homeworkDetails:
        Array.isArray(d.homeworkDetails) && d.homeworkDetails.length > 0
          ? d.homeworkDetails
          : currentTaskReport.homeworkDetails,
      homeworkGradedCount:
        typeof d.homeworkGradedCount === 'number'
          ? d.homeworkGradedCount
          : currentTaskReport.homeworkGradedCount,
      vulnerableStudentsNote:
        d.vulnerableStudentsNote || currentTaskReport.vulnerableStudentsNote,
    });
  };

  const handleAiLessonPlanResult = (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const d = data as Partial<ChineseLessonPlan>;
    const created: ChineseLessonPlan = {
      id: `lp-ai-${Date.now()}`,
      chapterTitle: d.chapterTitle || 'ជំពូកទី១ ខ្ញុំ និង អ្នក (第一单元)',
      lessonTitle: d.lessonTitle || 'មេរៀនថ្មី',
      durationLabel: d.durationLabel || '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
      pagesLabel: d.pagesLabel || 'ទំព័រទី១ ដល់ ទំព័រទី៥',
      textbookSource:
        d.textbookSource ||
        'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册/第二册)',
      knowledgeObjective: d.knowledgeObjective || '',
      skillObjective: d.skillObjective || '',
      attitudeObjective: d.attitudeObjective || '',
      teachingMaterialsTeacher:
        d.teachingMaterialsTeacher ||
        'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណអក្សររូបភាព',
      teachingMaterialsStudent:
        d.teachingMaterialsStudent || 'សៀវភៅគោលសម្រាប់សិស្ស សៀវភៅលំហាត់',
      dateWeekday: activeLessonPlan?.dateWeekday || '',
      dateDay: activeLessonPlan?.dateDay || '',
      dateMonth: activeLessonPlan?.dateMonth || '',
      dateYear: activeLessonPlan?.dateYear || '២០២៦',
      sessions:
        Array.isArray(d.sessions) && d.sessions.length > 0
          ? d.sessions
          : activeLessonPlan?.sessions || [],
    };
    onUpdateState((prev) => {
      const basePlans = syncLessonPlansFromCurriculum(
        prev.curriculumPlan,
        prev.lessonPlans
      );
      const nextLessonPlans = [...basePlans, created];
      const nextCurriculum = syncCurriculumFromLessonPlans(
        nextLessonPlans,
        prev.curriculumPlan
      );
      return {
        ...prev,
        lessonPlans: nextLessonPlans,
        curriculumPlan: nextCurriculum,
      };
    });
    setSelectedLessonPlanId(created.id);
  };

  const totalCurriculumHours = useMemo(
    () =>
      state.curriculumPlan.reduce(
        (acc, item) => acc + (Number(item.hours) || 0),
        0
      ),
    [state.curriculumPlan]
  );

  // Resolved student counts for Teacher Monthly Duty Report (supports manual override OR auto-sync)
  const resolvedScoredSkillCount =
    currentTaskReport.scoredSkillAttitudeCountOverride !== undefined &&
    currentTaskReport.scoredSkillAttitudeCountOverride !== null
      ? currentTaskReport.scoredSkillAttitudeCountOverride
      : checklistStats.scoredSkillAttitudeCount;

  const resolvedPreStudyStudentCount =
    currentTaskReport.studentPreStudyCountOverride !== undefined &&
    currentTaskReport.studentPreStudyCountOverride !== null
      ? currentTaskReport.studentPreStudyCountOverride
      : checklistStats.preStudyCount;

  const resolvedProjectStudentCount =
    currentTaskReport.studentProjectCountOverride !== undefined &&
    currentTaskReport.studentProjectCountOverride !== null
      ? currentTaskReport.studentProjectCountOverride
      : checklistStats.completedTasksCount;

  const resolvedHomeworkStudentCount =
    currentTaskReport.studentHomeworkCountOverride !== undefined &&
    currentTaskReport.studentHomeworkCountOverride !== null
      ? currentTaskReport.studentHomeworkCountOverride
      : checklistStats.homeworkCount;

  const resolvedStudyPlanStudentCount =
    currentTaskReport.studentStudyPlanCountOverride !== undefined &&
    currentTaskReport.studentStudyPlanCountOverride !== null
      ? currentTaskReport.studentStudyPlanCountOverride
      : checklistStats.studyPlanCount;

  return (
    <div className="space-y-4">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-2xs no-print">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setDocTab('curriculum')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                docTab === 'curriculum'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>១. កម្មវិធីសិក្សាប្រចាំឆ្នាំ ({totalCurriculumHours}ម៉)</span>
            </button>
            <button
              type="button"
              onClick={() => setDocTab('weekly_log')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                docTab === 'weekly_log'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>២. សម្រង់អត្ថបទប្រចាំសប្តាហ៍</span>
            </button>
            <button
              type="button"
              onClick={() => setDocTab('homework_duty')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                docTab === 'homework_duty'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>៣. ភារកិច្ចគ្រូបង្រៀន (ថ្នាក់ {activeClass?.name})</span>
            </button>
            <button
              type="button"
              onClick={() => setDocTab('lesson_plan')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                docTab === 'lesson_plan'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>៤. កិច្ចតែងការបង្រៀន</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {docTab === 'curriculum' && (
              <button
                type="button"
                onClick={handleAddCurriculumRow}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>បន្ថែមសប្តាហ៍</span>
              </button>
            )}
            {docTab === 'weekly_log' && (
              <>
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-700" />
                  <span className="text-slate-700">ថ្ងៃចន្ទ៖</span>
                  <input
                    type="date"
                    value={ddMmYyyyToIso(weekMondayDateInput)}
                    onChange={(e) => {
                      const picked = e.target.value;
                      if (!picked) return;
                      setWeekMondayDateInput(isoToDdMmYyyy(picked));
                    }}
                    className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-xs cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateFull8ClassWeek}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>បង្កើតសប្តាហ៍ថ្មី</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAddSingleWeeklyLog}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>បន្ថែមជួរ</span>
                </button>
              </>
            )}
            {docTab === 'lesson_plan' && (
              <button
                type="button"
                onClick={handleAddLessonPlan}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>បន្ថែមកិច្ចតែងការថ្មី</span>
              </button>
            )}
            <MarkdownCopyBar
              state={state}
              section={
                docTab === 'curriculum'
                  ? 'curriculum'
                  : docTab === 'weekly_log'
                  ? 'weekly_log'
                  : docTab === 'homework_duty'
                  ? 'model_school_duty'
                  : 'lesson_plan'
              }
              selectedClassId={activeClass?.id || '8A'}
              selectedMonthId={activeMonth?.id || 'feb'}
            />
          </div>
        </div>

        {/* Month selector for Homework Duty */}
        {docTab === 'homework_duty' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-600 mr-1">ជ្រើសរើសខែ៖</span>
            {enabledMonths.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMonthId(m.id)}
                className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  activeMonth?.id === m.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ខែ{m.nameKh}
              </button>
            ))}
          </div>
        )}

        {docTab === 'lesson_plan' && (
          <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100 text-xs">
            <span className="text-slate-500">ជ្រើសរើសមេរៀន ({effectiveLessonPlans.length})៖</span>
            {effectiveLessonPlans.map((lp, idx) => {
              const isSelected = activeLessonPlan?.id === lp.id;
              return (
                <div
                  key={lp.id}
                  className={`inline-flex items-center rounded-md font-medium transition-colors border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedLessonPlanId(lp.id)}
                    className="px-2.5 py-1.5 cursor-pointer text-left"
                  >
                    {idx + 1}. {lp.lessonTitle}
                  </button>
                  {effectiveLessonPlans.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDeleteLessonPlan({
                          id: lp.id,
                          linkedCurriculumId: lp.linkedCurriculumId,
                          index: idx,
                          title: `${idx + 1}. ${lp.lessonTitle}`,
                        });
                      }}
                      className={`px-1.5 py-1.5 mr-0.5 rounded-r-md transition-colors cursor-pointer ${
                        isSelected
                          ? 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                          : 'text-slate-400 hover:bg-rose-100 hover:text-rose-600'
                      }`}
                      title="លុបមេរៀននេះ (删除此课程)"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TAB 1: ANNUAL CHINESE CURRICULUM PLAN (កម្មវិធីសិក្សាភាសាចិន កំរិត២) */}
      {docTab === 'curriculum' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-950 no-print">
            <div className="flex items-center gap-2 font-bold">
              <Link2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                ១. កម្មវិធីសិក្សាប្រចាំឆ្នាំ និង ៤. កិច្ចតែងការបង្រៀន ភ្ជាប់គ្នាស្វ័យប្រវត្តិ (年度教学计划与教案内容双向互通，填其中一个另一个自动生成，日期可自行调整)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDocTab('lesson_plan')}
              className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700 cursor-pointer"
            >
              មើល ៤. កិច្ចតែងការបង្រៀន ({effectiveLessonPlans.length}) →
            </button>
          </div>

          <AiGeneratorBar
            taskType="curriculum"
            titleKh="AI បង្កើត ឬបង្ហោះឯកសារកម្មវិធីសិក្សាភាសាចិន (កម្មវិធីសិក្សា ៥៧ ម៉ោង)"
            placeholderKh="ឧ. បង្កើតកម្មវិធីសិក្សាភាសាចិន កំរិត២ 快乐汉语（第二册）ពីខែវិច្ឆិកាដល់ខែសីហា ឬបង្ហោះឯកសារ PDF/រូបភាព..."
            defaultPrompt="Generate the annual Chinese curriculum plan (កម្មវិធីសិក្សាភាសាចិន កំរិត២, 快乐汉语 第二册) from November to August (1.5 hours/week, 57 hours total) in bilingual Chinese and Khmer."
            onResult={handleAiCurriculumResult}
          />

          <div className="bg-white border border-slate-300 rounded-lg p-8 max-w-[210mm] mx-auto print-container space-y-4 font-khmer-battambang text-slate-950">
            <div className="grid grid-cols-2 gap-4 items-start text-xs">
              <div className="space-y-1">
                <div className="font-khmer-moul text-xs text-slate-950">
                  {state.schoolInfo.departmentKh}
                </div>
                <div className="font-khmer-battambang text-xs text-slate-900">
                  {state.schoolInfo.officeKh}
                </div>
                <div className="font-khmer-moul text-xs text-slate-950">
                  {state.schoolInfo.schoolNameKh}
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="font-khmer-moul text-sm">ព្រះរាជាណាចក្រកម្ពុជា</div>
                <div className="font-khmer-moul text-xs">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
              </div>
            </div>

            <div className="text-center space-y-1 pt-2">
              <h2 className="font-khmer-moul text-base text-slate-950">
                កម្មវិធីសិក្សាភាសាចិន កំរិត២
              </h2>
              <div className="font-khmer-battambang font-bold text-xs text-slate-900">
                ឆ្នាំសិក្សា {formatNumeral(state.schoolInfo.academicYear, true)}
              </div>
            </div>

            <div className="text-xs space-y-1 font-khmer-battambang">
              <div>
                គ្រូមុខវិជ្ជា ៖ <strong>{state.schoolInfo.teacherName}</strong>
              </div>
              <div>ម៉ោងសិក្សា ៖ ១ម៉ ៣០ន/ សប្តាហ៍</div>
              <div>
                សៀវភៅគោល ៖ <strong>快乐汉语（第二册）ភាសាចិនរីករាយ (កំរិត២)</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-900 text-xs font-khmer-battambang">
                <thead>
                  <tr className="bg-slate-100 text-slate-950 font-bold">
                    <th className="border border-slate-900 py-2 px-2 text-center w-24">ឈ្មោះខែ</th>
                    <th className="border border-slate-900 py-2 px-2 text-center w-16">សប្តាហ៍</th>
                    <th className="border border-slate-900 py-2 px-3">ខ្លឹមសារមេរៀន</th>
                    <th className="border border-slate-900 py-2 px-2 text-center w-28">ទំព័រ</th>
                    <th className="border border-slate-900 py-2 px-2 text-center w-16">ចំ.ម៉ោង</th>
                    <th className="border border-slate-900 py-2 px-2 text-center w-24">ផ្សេងៗ</th>
                  </tr>
                </thead>
                <tbody>
                  {state.curriculumPlan.map((item) => (
                    <tr key={item.id} className="align-top group">
                      <td className="border border-slate-900 py-1.5 px-1.5 text-center font-bold">
                        <input
                          type="text"
                          value={item.monthNameKh}
                          onChange={(e) =>
                            handleCurriculumChange(item.id, 'monthNameKh', e.target.value)
                          }
                          className="w-full text-center font-bold bg-transparent focus:outline-none focus:bg-indigo-50/40"
                        />
                      </td>
                      <td className="border border-slate-900 py-1.5 px-1.5 text-center">
                        <input
                          type="text"
                          value={item.weekNumber}
                          onChange={(e) =>
                            handleCurriculumChange(item.id, 'weekNumber', e.target.value)
                          }
                          className="w-full text-center bg-transparent focus:outline-none focus:bg-indigo-50/40"
                        />
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2.5 whitespace-pre-line leading-relaxed">
                        <textarea
                          rows={3}
                          value={item.lessonContent}
                          onChange={(e) =>
                            handleCurriculumChange(item.id, 'lessonContent', e.target.value)
                          }
                          className="w-full bg-transparent focus:outline-none focus:bg-indigo-50/40 resize-y"
                        />
                      </td>
                      <td className="border border-slate-900 py-1.5 px-1.5 text-center">
                        <input
                          type="text"
                          value={item.pageNumber}
                          onChange={(e) =>
                            handleCurriculumChange(item.id, 'pageNumber', e.target.value)
                          }
                          className="w-full text-center bg-transparent focus:outline-none focus:bg-indigo-50/40"
                        />
                      </td>
                      <td className="border border-slate-900 py-1.5 px-1.5 text-center">
                        <input
                          type="number"
                          step="0.5"
                          value={item.hours}
                          onChange={(e) =>
                            handleCurriculumChange(
                              item.id,
                              'hours',
                              parseFloat(e.target.value) || 1.5
                            )
                          }
                          className="w-full text-center font-mono bg-transparent focus:outline-none focus:bg-indigo-50/40"
                        />
                      </td>
                      <td className="border border-slate-900 py-1.5 px-1.5 text-center relative">
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) =>
                            handleCurriculumChange(item.id, 'note', e.target.value)
                          }
                          className="w-full text-center bg-transparent focus:outline-none focus:bg-indigo-50/40"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteCurriculumRow(item.id)}
                          className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 text-slate-300 hover:text-rose-600 no-print"
                          title="លុបជួរនេះ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right font-bold text-xs">
              ចំនួនម៉ោង {formatNumeral(totalCurriculumHours, true)} ម៉ោង
            </div>

            <SignatureDateEditor
              state={state}
              onUpdateState={onUpdateState}
              showPrincipalLeft={true}
              sheetKey="geip_curriculum_plan"
            />
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY LESSON LOG FOR ALL CLASSES (សម្រង់អត្ថបទប្រចាំសប្តាហ៍ — PDF 2 STYLE) */}
      {docTab === 'weekly_log' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/90 border border-emerald-300 rounded-lg p-3 space-y-2.5 text-xs text-emerald-950 no-print">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold">
                <Link2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  សម្រង់អត្ថបទប្រចាំសប្តាហ៍ ភ្ជាប់ស្វ័យប្រវត្តិជាមួយ «កំណត់ត្រាមេរៀន និងកំណត់ត្រាកិច្ចការផ្ទះ» តាមលំដាប់ថ្នាក់បង្រៀន (ឧ. 10C ម៉ោងទី១ → 10B ម៉ោងទី២ បន្តបន្ទាប់គ្នា)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-emerald-300 text-emerald-900 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPropagateWeeklyLogs}
                    onChange={(e) => setAutoPropagateWeeklyLogs(e.target.checked)}
                    className="rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>ភ្ជាប់បន្តគ្រប់ថ្នាក់ស្វ័យប្រវត្តិ (改第1节自动连续同步后续班)</span>
                </label>
                <button
                  type="button"
                  onClick={() => handlePropagateWeeklyLogToSubsequent(0)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-2xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>បំពេញមេរៀនបន្តគ្នាគ្រប់ថ្នាក់ (一键按第1节连续复制生成所有班)</span>
                </button>
              </div>
            </div>
            {weeklySyncNotice && (
              <div className="px-3 py-1.5 rounded bg-emerald-600 text-white font-bold text-xs flex items-center justify-between">
                <span>{weeklySyncNotice}</span>
                <button
                  type="button"
                  onClick={() => setWeeklySyncNotice(null)}
                  className="text-emerald-100 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <AiGeneratorBar
            taskType="weekly_log"
            titleKh="AI បង្កើត ឬបង្ហោះឯកសារសម្រង់អត្ថបទប្រចាំសប្តាហ៍"
            placeholderKh="ឧ. បង្កើតសម្រង់អត្ថបទប្រចាំសប្តាហ៍ មេរៀនទី២ នាងខ្ពស់ជាងខ្ញុំ សម្រាប់គ្រប់ថ្នាក់ ឬបង្ហោះ PDF/រូបភាព..."
            defaultPrompt={`Generate a complete weekly teaching log (សម្រង់អត្ថបទប្រចាំសប្តាហ៍) starting Monday ${weekMondayDateInput} for classes ${state.classes.map((c) => cleanClassDisplayCode(c.name || c.id)).join(', ') || '10C, 10B'}.`}
            onResult={handleAiWeeklyLogResult}
          />

          <div className="bg-white border border-slate-300 rounded-lg p-8 max-w-[210mm] mx-auto print-container space-y-4 font-khmer-battambang text-slate-950">
            <div className="grid grid-cols-2 gap-4 items-start text-xs">
              <div className="space-y-1">
                <div className="font-khmer-moul text-xs text-slate-950">
                  {state.schoolInfo.departmentKh}
                </div>
                <div className="font-khmer-moul text-xs text-slate-950">
                  {state.schoolInfo.schoolNameKh}
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="font-khmer-moul text-sm">ព្រះរាជាណាចក្រកម្ពុជា</div>
                <div className="font-khmer-moul text-xs">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h2 className="font-khmer-moul text-base text-slate-950">
                សម្រង់អត្ថបទប្រចាំសប្តាហ៍
              </h2>
              <div className="font-khmer-battambang font-bold text-xs text-slate-900">
                ឆ្នាំសិក្សា {formatNumeral(state.schoolInfo.academicYear, true)}
              </div>
            </div>

            <div className="text-xs space-y-1 font-khmer-battambang">
              <div>
                គ្រូមុខវិជ្ជា ៖ <strong>{state.schoolInfo.teacherName}</strong>
              </div>
              <div>ម៉ោងសិក្សា ៖ ១ម៉ ៣០ន/ សប្តាហ៍</div>
              <div className="flex items-center gap-1">
                <span>សៀវភៅគោល ៖</span>
                <input
                  type="text"
                  value={weeklyMeta.textbookTitle}
                  onChange={(e) => updateWeeklyMeta({ textbookTitle: e.target.value })}
                  className="font-bold bg-transparent border-b border-transparent focus:border-indigo-400 focus:outline-none flex-1"
                />
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-slate-900 text-xs font-khmer-battambang">
              <thead>
                <tr className="bg-slate-100 text-slate-950 font-bold">
                  <th className="border border-slate-900 py-2 px-2 text-center w-28">
                    កាលបរិច្ឆេទ
                  </th>
                  <th className="border border-slate-900 py-2 px-2 text-center w-24">ម៉ោង</th>
                  <th className="border border-slate-900 py-2 px-2 text-center w-16">ថ្នាក់</th>
                  <th className="border border-slate-900 py-2 px-3 text-center">ខ្លឹមសារមេរៀន</th>
                </tr>
              </thead>
              <tbody>
                {displayedWeeklyLogs.map((log, logIdx) => (
                  <tr key={log.id} className="align-top group">
                    <td className="border border-slate-900 py-2 px-1.5 text-center">
                      <input
                        type="date"
                        value={ddMmYyyyToIso(log.dateStr)}
                        onChange={(e) => {
                          const picked = e.target.value;
                          if (!picked) return;
                          const converted = convertIsoDateToKhmerSignature(picked);
                          onUpdateState((prev) => {
                            const baseLogs = syncWeeklyLogsFromDailyHomework(
                              prev.classes,
                              prev.dailyHomeworkRecords || [],
                              prev.weeklyLogs
                            );
                            const nextWeeklyLogs = baseLogs.map((w) =>
                              w.id === log.id
                                ? {
                                    ...w,
                                    dateStr: converted.ddMmYyyy,
                                    weekdayKh: converted.weekdayKh,
                                  }
                                : w
                            );
                            const nextDailyRecords = syncDailyHomeworkFromWeeklyLogs(
                              nextWeeklyLogs,
                              prev.classes,
                              prev.dailyHomeworkRecords || []
                            );
                            return {
                              ...prev,
                              weeklyLogs: nextWeeklyLogs,
                              dailyHomeworkRecords: nextDailyRecords,
                            };
                          });
                        }}
                        className="w-full px-1 py-0.5 mb-0.5 bg-slate-50 border border-slate-300 rounded text-[10px] font-bold cursor-pointer no-print"
                        title="ចុចជ្រើសរើសថ្ងៃ/ខែពីប្រតិទិន"
                      />
                      <input
                        type="text"
                        value={log.dateStr}
                        onChange={(e) =>
                          handleWeeklyLogChange(log.id, 'dateStr', e.target.value)
                        }
                        className="w-full text-center font-mono text-xs bg-transparent focus:outline-none focus:bg-indigo-50/40"
                      />
                      <input
                        type="text"
                        value={log.weekdayKh}
                        onChange={(e) =>
                          handleWeeklyLogChange(log.id, 'weekdayKh', e.target.value)
                        }
                        className="w-full text-center font-khmer-battambang text-xs text-slate-900 mt-0.5 bg-transparent focus:outline-none focus:bg-indigo-50/40"
                      />
                    </td>
                    <td className="border border-slate-900 py-2 px-2 text-center">
                      <input
                        type="text"
                        value={log.timeRange}
                        onChange={(e) =>
                          handleWeeklyLogChange(log.id, 'timeRange', e.target.value)
                        }
                        className="w-full text-center font-mono text-xs bg-transparent focus:outline-none focus:bg-indigo-50/40"
                      />
                    </td>
                    <td className="border border-slate-900 py-2 px-1.5 text-center font-bold">
                      <input
                        type="text"
                        value={log.classId}
                        placeholder="ថ្នាក់ (如 10B)"
                        onChange={(e) =>
                          handleWeeklyLogChange(log.id, 'classId', e.target.value)
                        }
                        className="w-full text-center font-mono font-bold text-xs bg-transparent placeholder:text-[10px] placeholder:text-slate-400 focus:outline-none focus:bg-indigo-50/40"
                      />
                    </td>
                    <td className="border border-slate-900 py-2 px-3 space-y-1 relative">
                      <div className="flex flex-wrap items-center justify-end gap-1 mb-1 no-print">
                        <button
                          type="button"
                          onClick={() => handleCopyWeeklyLogRow(log, logIdx)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                          title="ចម្លងមេរៀនថ្នាក់នេះ (复制本行，若在最后一行会自动在下方新增空白行供粘贴)"
                        >
                          <Copy className="w-3 h-3" />
                          <span>ចម្លង (复制)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePasteWeeklyLogRow(log.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold cursor-pointer ${
                            copiedWeeklyLogClip && !log.lessonTitle
                              ? 'bg-emerald-600 border-emerald-700 text-white shadow-2xs animate-pulse'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title="បិទភ្ជាប់មេរៀនមកជួរនេះ (粘贴课程内容到本行)"
                        >
                          <ClipboardPaste className="w-3 h-3" />
                          <span>បិទភ្ជាប់ (粘贴)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertBlankRowBelow(logIdx, false)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-[10px] font-bold text-sky-700 hover:bg-sky-100 cursor-pointer"
                          title="បន្ថែមជួរទទេខាងក្រោមដើម្បីបិទភ្ជាប់ (在下方新增一行空白空间)"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+បន្ថែមជួរខាងក្រោម (+下一行空间)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertBlankRowBelow(logIdx, true)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
                          title="បន្ថែមជួរថ្មីខាងក្រោម និងបិទភ្ជាប់ភ្លាមៗ (直接在下一行新增并粘贴)"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>ចម្លងទៅជួរបន្ទាប់ (复制到下一行)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWeeklyLog(log.id)}
                          className="inline-flex items-center p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="លុបជួរនេះ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={log.unitTitle}
                        placeholder="ជំពូក (Unit) — ចុច «បិទភ្ជាប់ (粘贴)» ខាងលើដើម្បីបិទភ្ជាប់..."
                        onChange={(e) =>
                          handleWeeklyLogChange(log.id, 'unitTitle', e.target.value)
                        }
                        className="w-full text-center font-bold text-slate-950 bg-transparent placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:bg-indigo-50/40"
                      />
                      <input
                        type="text"
                        value={log.lessonTitle}
                        placeholder="ចំណងជើងមេរៀន (Lesson)..."
                        onChange={(e) =>
                          handleWeeklyLogChange(log.id, 'lessonTitle', e.target.value)
                        }
                        className="w-full text-center font-bold text-indigo-950 bg-transparent placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:bg-indigo-50/40"
                      />
                      <textarea
                        rows={3}
                        value={log.contentDetails}
                        placeholder="ខ្លឹមសារមេរៀន (點擊上方「បិទភ្ជាប់ (粘贴)」即可粘贴刚复制的内容)..."
                        onChange={(e) =>
                          handleWeeklyLogChange(log.id, 'contentDetails', e.target.value)
                        }
                        className="w-full whitespace-pre-line leading-relaxed pt-1 text-slate-900 bg-transparent placeholder:text-slate-300 focus:outline-none focus:bg-indigo-50/40 resize-y"
                      />
                    </td>
                  </tr>
                ))}

                {/* Interactive Add Next Row / Paste Row inside table (No-Print) */}
                <tr className="no-print bg-emerald-50/50">
                  <td colSpan={4} className="border border-slate-900 py-2 px-3 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleInsertBlankRowBelow(displayedWeeklyLogs.length - 1, false)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-indigo-300 text-indigo-700 font-bold text-xs hover:bg-indigo-50 shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ បន្ថែមជួរថ្មីខាងក្រោម (+ 在下一行添加空白空间让我粘贴)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleInsertBlankRowBelow(displayedWeeklyLogs.length - 1, true)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-2xs cursor-pointer"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5" />
                        <span>+ បន្ថែមជួរថ្មី & បិទភ្ជាប់មេរៀនភ្លាមៗ (+ 新增下一行并直接粘贴课程内容)</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Friday Signature Row matching 2សម្រង់អត្ថបទ2025-2026.pdf */}
                <tr className="align-top">
                  <td className="border border-slate-900 py-3 px-1.5 text-center">
                    <input
                      type="date"
                      value={ddMmYyyyToIso(weeklyMeta.fridayDateStr)}
                      onChange={(e) => {
                        const picked = e.target.value;
                        if (!picked) return;
                        const converted = convertIsoDateToKhmerSignature(picked);
                        onUpdateState((prev) => ({
                          ...prev,
                          weeklyLogMeta: {
                            ...weeklyMeta,
                            fridayDateStr: converted.ddMmYyyy,
                            lunarDate: converted.fullLunarString,
                            gregorianDate: converted.fullGregorianString,
                          },
                          signatureDate: {
                            lunarDay: converted.lunarDay,
                            lunarMonth: converted.lunarMonth,
                            lunarYearEra: converted.lunarYearEra,
                            gregorianLocation: converted.gregorianLocation,
                            gregorianDay: converted.gregorianDay,
                            gregorianMonth: converted.gregorianMonth,
                            gregorianYear: converted.gregorianYear,
                          },
                        }));
                      }}
                      className="w-full px-1 py-0.5 mb-0.5 bg-slate-50 border border-slate-300 rounded text-[10px] font-bold cursor-pointer no-print"
                      title="ចុចជ្រើសរើសថ្ងៃសុក្រពីប្រតិទិន"
                    />
                    <input
                      type="text"
                      value={weeklyMeta.fridayDateStr}
                      onChange={(e) =>
                        updateWeeklyMeta({ fridayDateStr: e.target.value })
                      }
                      className="w-full text-center font-mono text-xs bg-transparent focus:outline-none"
                    />
                    <div className="mt-1">សុក្រ</div>
                  </td>
                  <td className="border border-slate-900 py-3 px-2" />
                  <td className="border border-slate-900 py-3 px-2" />
                  <td className="border border-slate-900 py-3 px-3">
                    <SignatureDateEditor
                      state={state}
                      onUpdateState={onUpdateState}
                      showPrincipalLeft={false}
                      compact={true}
                      sheetKey="geip_weekly_log"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="pt-2 text-center w-56 text-xs">
              <div>បានឃើញ និង ឯកភាព</div>
              <div className="text-xs font-bold mt-1">ជ.នាយកវិទ្យាល័យ</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HOMEWORK RECORDS & AUTO-GENERATED MODEL SCHOOL TEACHER MONTHLY DUTIES (ភារកិច្ចគ្រូបង្រៀន ស្តង់ដាសាលាគំរូ) */}
      {docTab === 'homework_duty' && (
        <div className="space-y-4">
          {/* Direct Auto-Sync Bar from Weekly Lesson Logs & Daily Homework Records */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 no-print text-xs">
            <div className="space-y-1">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-emerald-700" />
                <span>
                  ភ្ជាប់ទិន្នន័យពិតពី «សម្រង់អត្ថបទប្រចាំសប្តាហ៍» និង «កំណត់ត្រាកិច្ចការផ្ទះ និងកំណត់ត្រាមេរៀនប្រចាំថ្ងៃ» (ថ្នាក់ទី {activeClass.name})
                </span>
              </div>
              <div className="text-[11px] text-emerald-800">
                មេរៀនប្រចាំសប្តាហ៍៖{' '}
                <strong>
                  {liveDerivedDutyReport.preStudyDetails[0] || '-'}
                </strong>{' '}
                · កិច្ចការផ្ទះ៖{' '}
                <strong>
                  {liveDerivedDutyReport.homeworkDetails[0] || '-'}
                </strong>{' '}
                · សិស្សប្រគល់កិច្ចការផ្ទះ៖{' '}
                <strong>
                  {liveDerivedDutyReport.studentHomeworkCountOverride ?? 0}/
                  {checklistStats.activeCount} នាក់
                </strong>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSyncDutyFromWeeklyAndDaily}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                បង្កើតផ្ទាល់ពីទិន្នន័យថ្នាក់ {activeClass.name} (根据真实记录直接生成)
              </button>
              <button
                type="button"
                onClick={handleSyncDutyAllClasses}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 font-medium rounded-md hover:bg-emerald-100 cursor-pointer"
              >
                ធ្វើបច្ចុប្បន្នភាពគ្រប់ ៨ ថ្នាក់ (同步全部8个班)
              </button>
            </div>
          </div>

          <AiGeneratorBar
            taskType="homework_duty"
            allowAppend={false}
            titleKh="AI បង្កើតកំណត់ត្រាកិច្ចការសិស្ស និងភារកិច្ចគ្រូបង្រៀន ស្តង់ដាសាលាគំរូ"
            placeholderKh="ឧ. បង្កើតភារកិច្ចគ្រូបង្រៀនប្រចាំខែតាមសម្រង់អត្ថបទប្រចាំសប្តាហ៍ និងកំណត់ត្រាកិច្ចការផ្ទះ ឬបង្ហោះរូបភាព/PDF..."
            defaultPrompt={`Generate the monthly homework records and Model School teacher monthly duty report (ភារកិច្ចគ្រូបង្រៀន ស្តង់ដាសាលាគំរូ) for class ${activeClass.id} in month ${
              currentTaskReport.monthTitleKh || activeMonth.nameKh
            } strictly based on the real Weekly Lesson Logs and Daily Homework Records.`}
            contextData={{
              classId: activeClass.id,
              monthNameKh: currentTaskReport.monthTitleKh || activeMonth.nameKh,
              weeklyLogsForClass: state.weeklyLogs.filter((w) => w.classId === activeClass.id),
              dailyHomeworkForClass: (state.dailyHomeworkRecords || []).filter(
                (r) => r.classId === activeClass.id
              ),
              liveDerivedDutyReport,
            }}
            onResult={handleAiHomeworkDutyResult}
          />

          {/* Official Editable A4 Teacher Monthly Duties Sheet matching User Prompt & PDF 8 */}
          <div className="bg-white border border-slate-300 rounded-lg p-8 max-w-[210mm] mx-auto print-container space-y-4 text-xs leading-relaxed font-khmer-battambang text-slate-950">
            <div className="text-center space-y-1">
              <div className="font-khmer-moul text-sm">ព្រះរាជាណាចក្រកម្ពុជា</div>
              <div className="font-khmer-moul text-xs">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            </div>

            <div className="space-y-1">
              <div className="font-khmer-moul text-xs">{state.schoolInfo.departmentKh}</div>
              <div className="font-khmer-battambang text-xs">{state.schoolInfo.officeKh}</div>
              <div className="font-khmer-moul text-xs">{state.schoolInfo.schoolNameKh}</div>
            </div>

            <div className="text-center space-y-1">
              <h2 className="font-khmer-moul text-sm underline">
                ភារកិច្ចគ្រូបង្រៀន ស្តង់ដាសាលាគំរូ
              </h2>
              <div className="font-bold">ឆ្នាំសិក្សា ២០២៥ - ២០២៦</div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 pb-3">
              <div>
                លោក - លោកស្រី ៖ <strong>{state.schoolInfo.teacherName}</strong>
              </div>
              <div>
                បង្រៀនមុខវិជ្ជា ៖ <strong>{state.schoolInfo.subjectNameKh}</strong>
              </div>
              <div>
                ថ្នាក់ទី ៖ <strong>{activeClass?.id}</strong>
              </div>
              <div>
                សិស្សសរុប ៖{' '}
                <strong className="underline px-1">
                  {formatNumeral(checklistStats.activeCount, true)}
                </strong>{' '}
                នាក់ / ស្រី{' '}
                <strong className="underline px-1">
                  {formatNumeral(checklistStats.femaleCount, true)}
                </strong>{' '}
                នាក់
              </div>
            </div>

            {/* Section I: I. គ្រូត្រូវធ្វើប្រចាំខែ ... */}
            <div className="space-y-3">
              <div className="font-bold text-sm text-slate-950 flex items-center gap-1.5">
                <span>I. គ្រូត្រូវធ្វើប្រចាំខែ</span>
                <input
                  type="text"
                  value={currentTaskReport.monthTitleKh ?? activeMonth.nameKh}
                  onChange={(e) =>
                    updateCurrentTaskReport({ monthTitleKh: e.target.value })
                  }
                  className="font-bold text-sm border-b border-dotted border-slate-500 bg-transparent focus:outline-none w-28 text-center"
                />
              </div>

              <div className="pl-3 space-y-3">
                {/* 1. Pre-study tasks */}
                <div>
                  <div className="flex flex-wrap items-center gap-1">
                    <span>
                      - គ្រូបង្រៀនបានដាក់កិច្ចការឱ្យសិស្សស្វ័យសិក្សាមុនពេលមកជួបគ្រូចំនួន៖
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={currentTaskReport.preStudyAssignedCount}
                      onChange={(e) =>
                        updateCurrentTaskReport({
                          preStudyAssignedCount: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-12 text-center font-bold underline border-b border-slate-400 bg-transparent focus:outline-none"
                    />
                    <span>ដងក្នុង១ខែ</span>
                  </div>
                  <div className="pl-5 mt-1">
                    <textarea
                      rows={2}
                      value={currentTaskReport.preStudyDetails.join('\n')}
                      onChange={(e) =>
                        updateCurrentTaskReport({
                          preStudyDetails: e.target.value.split('\n'),
                        })
                      }
                      className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-400 rounded p-1 focus:outline-none resize-y"
                    />
                  </div>
                </div>

                {/* 2. Project / Workbook research tasks */}
                <div>
                  <div className="flex flex-wrap items-center gap-1">
                    <span>
                      - គ្រូបង្រៀនបានដាក់កិច្ចការ ជាគម្រោង/ចំណោទ/លំហាត់ឱ្យសិស្សស្រាវជ្រាវចំនួន៖
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={currentTaskReport.projectAssignedCount}
                      onChange={(e) =>
                        updateCurrentTaskReport({
                          projectAssignedCount: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-12 text-center font-bold underline border-b border-slate-400 bg-transparent focus:outline-none"
                    />
                    <span>ដងក្នុង១ខែ</span>
                  </div>
                  <div className="pl-5 mt-1">
                    <textarea
                      rows={2}
                      value={currentTaskReport.projectDetails.join('\n')}
                      onChange={(e) =>
                        updateCurrentTaskReport({
                          projectDetails: e.target.value.split('\n'),
                        })
                      }
                      className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-400 rounded p-1 focus:outline-none resize-y"
                    />
                  </div>
                </div>

                {/* 3. Homework assigned */}
                <div>
                  <div className="flex flex-wrap items-center gap-1">
                    <span>- គ្រូបង្រៀនបានដាក់កិច្ចការផ្ទះចំនួន៖</span>
                    <input
                      type="number"
                      min="0"
                      value={currentTaskReport.homeworkAssignedCount}
                      onChange={(e) =>
                        updateCurrentTaskReport({
                          homeworkAssignedCount: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-12 text-center font-bold underline border-b border-slate-400 bg-transparent focus:outline-none"
                    />
                    <span>ដងក្នុង១ខែ</span>
                  </div>
                  <div className="pl-5 mt-1">
                    <textarea
                      rows={2}
                      value={currentTaskReport.homeworkDetails.join('\n')}
                      onChange={(e) =>
                        updateCurrentTaskReport({
                          homeworkDetails: e.target.value.split('\n'),
                        })
                      }
                      className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-400 rounded p-1 focus:outline-none resize-y"
                    />
                  </div>
                </div>

                {/* 4. Homework graded count */}
                <div className="flex flex-wrap items-center gap-1">
                  <span>- គ្រូបង្រៀនបានកែកិច្ចការសិស្សចំនួន៖</span>
                  <input
                    type="number"
                    min="0"
                    value={currentTaskReport.homeworkGradedCount}
                    onChange={(e) =>
                      updateCurrentTaskReport({
                        homeworkGradedCount: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-12 text-center font-bold underline border-b border-slate-400 bg-transparent focus:outline-none"
                  />
                  <span>ដងក្នុង១ខែ (ភ្ជាប់សន្លឹកកិច្ចការមកជាមួយ)</span>
                </div>

                {/* 5. Skill & Attitude scored count */}
                <div className="flex flex-wrap items-center gap-1">
                  <span>
                    - គ្រូបង្រៀនបានដាក់ពិន្ទុឱ្យសិស្សផ្នែកបំណិនសម្បទា និងចរិយាសម្បទារៀងរាល់ខែចំនួន៖
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={resolvedScoredSkillCount}
                    onChange={(e) =>
                      updateCurrentTaskReport({
                        scoredSkillAttitudeCountOverride:
                          e.target.value === '' ? null : parseInt(e.target.value, 10),
                      })
                    }
                    className="w-14 text-center font-bold underline border-b border-slate-400 bg-transparent focus:outline-none"
                  />
                  <span>នាក់ក្នុង១ខែ (ភ្ជាប់តារាងពិន្ទុ)</span>
                </div>
              </div>
            </div>

            {/* Section II: II. សិស្ស */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-950">II. សិស្ស</h3>
                <div className="flex items-center gap-2 no-print text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentTaskReport({
                        studentPreStudyCountOverride: 0,
                        studentProjectCountOverride: 0,
                        studentHomeworkCountOverride: 0,
                        studentStudyPlanCountOverride: 0,
                      })
                    }
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    កំណត់ ០ នាក់ទាំងអស់
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentTaskReport({
                        scoredSkillAttitudeCountOverride: null,
                        studentPreStudyCountOverride: null,
                        studentProjectCountOverride: null,
                        studentHomeworkCountOverride: null,
                        studentStudyPlanCountOverride: null,
                      })
                    }
                    className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 rounded text-indigo-700"
                  >
                    គណនាស្វ័យប្រវត្តិពីបញ្ជីសិស្ស ({checklistStats.preStudyCount} នាក់)
                  </button>
                </div>
              </div>

              <div className="pl-3 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1">
                  <span>- សិស្សបានស្វ័យសិក្សាមុនពេលមកជួបគ្រូបង្រៀនចំនួន៖</span>
                  <input
                    type="number"
                    min="0"
                    value={resolvedPreStudyStudentCount}
                    onChange={(e) =>
                      updateCurrentTaskReport({
                        studentPreStudyCountOverride:
                          e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                      })
                    }
                    className="w-12 text-center font-bold underline border-b border-slate-400 bg-transparent focus:outline-none"
                  />
                  <span>នាក់ក្នុង១ខែ</span>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <span>- សិស្សបានធ្វើកិច្ចការ ជាគម្រោង/ចំណោទ/លំហាត់ ស្រាវជ្រាវចំនួន៖</span>
                  <input
                    type="number"
                    min="0"
                    value={resolvedProjectStudentCount}
                    onChange={(e) =>
                      updateCurrentTaskReport({
                        studentProjectCountOverride:
                          e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                      })
                    }
                    className="w-12 text-center font-bold underline border-b border-slate-400 bg-transparent focus:outline-none"
                  />
                  <span>នាក់ក្នុង១ខែ</span>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <span>- សិស្សបានធ្វើកិច្ចការផ្ទះចំនួន៖</span>
                  <input
                    type="number"
                    min="0"
                    value={resolvedHomeworkStudentCount}
                    onChange={(e) =>
                      updateCurrentTaskReport({
                        studentHomeworkCountOverride:
                          e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                      })
                    }
                    className="w-12 text-center font-bold underline border-b border-slate-400 bg-transparent focus:outline-none"
                  />
                  <span>នាក់ក្នុង១ខែ</span>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <span>- សិស្សបានធ្វើផែនការសិក្សារៀនសូត្រចំនួន៖</span>
                  <input
                    type="number"
                    min="0"
                    value={resolvedStudyPlanStudentCount}
                    onChange={(e) =>
                      updateCurrentTaskReport({
                        studentStudyPlanCountOverride:
                          e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                      })
                    }
                    className="w-12 text-center font-bold underline border-b border-slate-400 bg-transparent focus:outline-none"
                  />
                  <span>នាក់ (១ឆ្នាំ)</span>
                </div>
              </div>
            </div>

            {/* Section III: III. គ្រូត្រូវធ្វើប្រចាំឆ្នាំ */}
            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-slate-950">III. គ្រូត្រូវធ្វើប្រចាំឆ្នាំ</h3>
              <div className="pl-3 flex items-start gap-1">
                <span className="shrink-0">- បញ្ជីឈ្មោះ៖</span>
                <textarea
                  rows={2}
                  value={currentTaskReport.vulnerableStudentsNote}
                  onChange={(e) =>
                    updateCurrentTaskReport({ vulnerableStudentsNote: e.target.value })
                  }
                  className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-400 rounded p-0.5 focus:outline-none resize-y"
                />
              </div>
            </div>

            <SignatureDateEditor
              state={state}
              onUpdateState={onUpdateState}
              showPrincipalLeft={true}
              sheetKey={`homework_duty_${activeClass?.id}_${activeMonth?.id}`}
            />
          </div>
        </div>
      )}

      {/* TAB 4: 5-STEP CHINESE LESSON PLANS (កិច្ចតែងការបង្រៀន) */}
      {docTab === 'lesson_plan' && activeLessonPlan && (
        <div className="space-y-4">
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-950 no-print">
            <div className="flex items-center gap-2 font-bold">
              <Link2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                ៤. កិច្ចតែងការបង្រៀន និង ១. កម្មវិធីសិក្សាប្រចាំឆ្នាំ ភ្ជាប់គ្នាស្វ័យប្រវត្តិ (កែប្រែមេរៀននៅទីនេះ នឹងធ្វើបច្ចុប្បន្នភាពទៅ ១. កម្មវិធីសិក្សាប្រចាំឆ្នាំ ដោយរក្សាទុកកាលបរិច្ឆេទតាមការកំណត់ផ្ទាល់)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDocTab('curriculum')}
              className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700 cursor-pointer"
            >
              ← មើល ១. កម្មវិធីសិក្សាប្រចាំឆ្នាំ
            </button>
          </div>

          <AiGeneratorBar
            taskType="lesson_plan"
            allowAppend={false}
            titleKh="AI បង្កើត ឬបង្ហោះឯកសារកិច្ចតែងការបង្រៀនភាសាចិន (៥ ជំហាន)"
            placeholderKh="ឧ. បង្កើតកិច្ចតែងការបង្រៀន មេរៀនទី៥ បន្ទប់ទទួលភ្ញៀវនៅទិសខាងត្បូង (第五课 客厅在南边) ឬបង្ហោះរូបភាព/PDF មេរៀន..."
            defaultPrompt="Generate a 5-step Cambodian MoEYS Chinese lesson plan (កិច្ចតែងការបង្រៀន) for Kuaile Hanyu with bilingual Chinese and Khmer objectives, materials, and step-by-step teacher/student activities."
            onResult={handleAiLessonPlanResult}
          />

          <div className="bg-white border border-slate-300 rounded-lg p-8 max-w-[210mm] mx-auto print-container space-y-5 text-xs leading-relaxed font-khmer-battambang text-slate-950">
            {/* Header with School Khmer Name in Khmer Muol (NO Chinese School Name) */}
            <div className="flex items-center justify-between border-b-2 border-emerald-700 pb-3">
              <div className="font-khmer-moul text-sm text-slate-950">
                {state.schoolInfo.schoolNameKh}
              </div>
              <input
                type="text"
                value={activeLessonPlan.chapterTitle}
                onChange={(e) =>
                  updateActiveLessonPlan({ chapterTitle: e.target.value })
                }
                className="text-right font-khmer-moul text-xs text-slate-900 bg-transparent focus:outline-none w-1/2"
              />
            </div>

            <div className="text-center space-y-1">
              <h2 className="font-khmer-moul text-base underline text-slate-950">
                កិច្ចតែងការបង្រៀន
              </h2>
              <input
                type="text"
                value={activeLessonPlan.lessonTitle}
                onChange={(e) =>
                  updateActiveLessonPlan({ lessonTitle: e.target.value })
                }
                className="font-khmer-moul text-sm text-indigo-950 pt-1 text-center w-full bg-transparent focus:outline-none"
              />
            </div>

            {/* Metadata Box */}
            <div className="border border-slate-800 p-3 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span>កាលបរិច្ឆេទ ៖ ថ្ងៃ</span>
                <input
                  type="text"
                  value={activeLessonPlan.dateWeekday ?? ''}
                  onChange={(e) =>
                    updateActiveLessonPlan({ dateWeekday: e.target.value })
                  }
                  placeholder="..............."
                  className="w-20 text-center border-b border-dotted border-slate-500 bg-transparent focus:outline-none"
                />
                <span>ទី</span>
                <input
                  type="text"
                  value={activeLessonPlan.dateDay ?? ''}
                  onChange={(e) =>
                    updateActiveLessonPlan({ dateDay: e.target.value })
                  }
                  placeholder="......."
                  className="w-12 text-center border-b border-dotted border-slate-500 bg-transparent focus:outline-none"
                />
                <span>ខែ</span>
                <input
                  type="text"
                  value={activeLessonPlan.dateMonth ?? ''}
                  onChange={(e) =>
                    updateActiveLessonPlan({ dateMonth: e.target.value })
                  }
                  placeholder="..............."
                  className="w-24 text-center border-b border-dotted border-slate-500 bg-transparent focus:outline-none"
                />
                <span>ឆ្នាំ</span>
                <input
                  type="text"
                  value={activeLessonPlan.dateYear ?? '២០២៦'}
                  onChange={(e) =>
                    updateActiveLessonPlan({ dateYear: e.target.value })
                  }
                  placeholder="២០២..."
                  className="w-16 text-center border-b border-dotted border-slate-500 bg-transparent focus:outline-none"
                />
                <div className="inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-semibold no-print">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-700" />
                  <span>ជ្រើសរើសថ្ងៃ/ខែ៖</span>
                  <input
                    type="date"
                    value={activeLessonPlan.isoDate || ''}
                    onChange={(e) => {
                      const picked = e.target.value;
                      if (!picked) return;
                      const conv = convertIsoDateToKhmerSignature(picked);
                      updateActiveLessonPlan({
                        isoDate: picked,
                        dateWeekday: conv.weekdayKh,
                        dateDay: conv.gregorianDay,
                        dateMonth: conv.gregorianMonth,
                        dateYear: conv.gregorianYear,
                      });
                    }}
                    className="bg-white px-2 py-0.5 rounded border border-slate-300 text-[11px] font-bold cursor-pointer"
                  />
                </div>
              </div>
              <div>
                ថ្នាក់ ៖{' '}
                {state.classes.length > 0
                  ? state.classes
                      .map((c) => cleanClassDisplayCode(c.name || c.id))
                      .join(' / ')
                  : '៨A / ៨B / ៨C / ៩A / ៩B / ៩C / ១០A / ១០C'}
              </div>
              <div>
                មុខវិជ្ជា ៖ <strong>{state.schoolInfo.subjectNameKh}</strong>
              </div>
              <div className="flex items-center gap-1">
                <span>មេរៀន ៖</span>
                <input
                  type="text"
                  value={activeLessonPlan.lessonTitle}
                  onChange={(e) =>
                    updateActiveLessonPlan({ lessonTitle: e.target.value })
                  }
                  className="font-bold flex-1 bg-transparent focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                <span>រយៈពេល ៖</span>
                <input
                  type="text"
                  value={activeLessonPlan.durationLabel}
                  onChange={(e) =>
                    updateActiveLessonPlan({ durationLabel: e.target.value })
                  }
                  className="flex-1 bg-transparent focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                <span>ទំព័រ ៖</span>
                <input
                  type="text"
                  value={activeLessonPlan.pagesLabel}
                  onChange={(e) =>
                    updateActiveLessonPlan({ pagesLabel: e.target.value })
                  }
                  className="flex-1 bg-transparent focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                <span>ដកស្រង់ពី ៖</span>
                <input
                  type="text"
                  value={activeLessonPlan.textbookSource}
                  onChange={(e) =>
                    updateActiveLessonPlan({ textbookSource: e.target.value })
                  }
                  className="flex-1 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* 1. Objectives */}
            <div className="space-y-2">
              <h4 className="font-khmer-moul text-xs underline text-slate-950">១. វត្ថុបំណង</h4>
              <div className="border border-slate-800 divide-y divide-slate-800">
                <div className="grid grid-cols-12 p-2.5 gap-2">
                  <div className="col-span-3 font-bold">• វិជ្ជាសម្បទា ៖</div>
                  <div className="col-span-9">
                    <textarea
                      rows={2}
                      value={activeLessonPlan.knowledgeObjective}
                      onChange={(e) =>
                        updateActiveLessonPlan({ knowledgeObjective: e.target.value })
                      }
                      className="w-full bg-transparent focus:outline-none resize-y"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 p-2.5 gap-2">
                  <div className="col-span-3 font-bold">• បំណិនសម្បទា ៖</div>
                  <div className="col-span-9">
                    <textarea
                      rows={2}
                      value={activeLessonPlan.skillObjective}
                      onChange={(e) =>
                        updateActiveLessonPlan({ skillObjective: e.target.value })
                      }
                      className="w-full bg-transparent focus:outline-none resize-y"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 p-2.5 gap-2">
                  <div className="col-span-3 font-bold">• ចរិយាសម្បទា ៖</div>
                  <div className="col-span-9">
                    <textarea
                      rows={2}
                      value={activeLessonPlan.attitudeObjective}
                      onChange={(e) =>
                        updateActiveLessonPlan({ attitudeObjective: e.target.value })
                      }
                      className="w-full bg-transparent focus:outline-none resize-y"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Teaching Materials */}
            <div className="space-y-2">
              <h4 className="font-khmer-moul text-xs underline text-slate-950">
                ២. សម្ភារៈឧបទេស
              </h4>
              <div className="border border-slate-800 divide-y divide-slate-800">
                <div className="grid grid-cols-12 p-2 gap-2">
                  <div className="col-span-3 font-bold">• គោលវិធី ៖</div>
                  <div className="col-span-9">សិស្សមជ្ឈមណ្ឌល</div>
                </div>
                <div className="grid grid-cols-12 p-2 gap-2">
                  <div className="col-span-3 font-bold">• ចំពោះគ្រូ ៖</div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      value={activeLessonPlan.teachingMaterialsTeacher}
                      onChange={(e) =>
                        updateActiveLessonPlan({
                          teachingMaterialsTeacher: e.target.value,
                        })
                      }
                      className="w-full bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 p-2 gap-2">
                  <div className="col-span-3 font-bold">• ចំពោះសិស្ស ៖</div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      value={activeLessonPlan.teachingMaterialsStudent}
                      onChange={(e) =>
                        updateActiveLessonPlan({
                          teachingMaterialsStudent: e.target.value,
                        })
                      }
                      className="w-full bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Teaching Procedure Table (5 Steps) */}
            <div className="space-y-2">
              <h4 className="font-khmer-moul text-xs underline text-slate-950">
                ៣. ដំណើរការបង្រៀន
              </h4>
              {activeLessonPlan.sessions.map((ses, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  <table className="w-full text-left border-collapse border border-slate-900 text-xs">
                    <thead>
                      <tr className="bg-emerald-50/70">
                        <th
                          colSpan={3}
                          className="border border-slate-900 py-1.5 px-3 text-center font-bold text-slate-950"
                        >
                          <input
                            type="text"
                            value={ses.sessionTitle}
                            onChange={(e) => {
                              const nextSessions = activeLessonPlan.sessions.map(
                                (item, idx) =>
                                  idx === sIdx
                                    ? { ...item, sessionTitle: e.target.value }
                                    : item
                              );
                              updateActiveLessonPlan({ sessions: nextSessions });
                            }}
                            className="w-full text-center font-bold bg-transparent focus:outline-none"
                          />
                        </th>
                      </tr>
                      <tr className="bg-slate-100 text-slate-950 font-bold">
                        <th className="border border-slate-900 py-1.5 px-2.5 text-center w-1/3">
                          សកម្មភាពគ្រូ
                        </th>
                        <th className="border border-slate-900 py-1.5 px-2.5 text-center w-1/3">
                          ខ្លឹមសារមេរៀន
                        </th>
                        <th className="border border-slate-900 py-1.5 px-2.5 text-center w-1/3">
                          សកម្មភាពសិស្ស
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ses.steps.map((st, stIdx) => (
                        <React.Fragment key={stIdx}>
                          <tr className="bg-slate-50">
                            <td
                              colSpan={3}
                              className="border border-slate-900 py-1 px-3 font-bold text-slate-950"
                            >
                              <input
                                type="text"
                                value={st.stepTitle}
                                onChange={(e) => {
                                  const nextSessions = activeLessonPlan.sessions.map(
                                    (sItem, idx) =>
                                      idx === sIdx
                                        ? {
                                            ...sItem,
                                            steps: sItem.steps.map((stepItem, k) =>
                                              k === stIdx
                                                ? { ...stepItem, stepTitle: e.target.value }
                                                : stepItem
                                            ),
                                          }
                                        : sItem
                                  );
                                  updateActiveLessonPlan({ sessions: nextSessions });
                                }}
                                className="w-full font-bold bg-transparent focus:outline-none"
                              />
                            </td>
                          </tr>
                          <tr className="align-top">
                            <td className="border border-slate-900 py-2 px-2.5">
                              <textarea
                                rows={3}
                                value={st.teacherActivity}
                                onChange={(e) => {
                                  const nextSessions = activeLessonPlan.sessions.map(
                                    (sItem, idx) =>
                                      idx === sIdx
                                        ? {
                                            ...sItem,
                                            steps: sItem.steps.map((stepItem, k) =>
                                              k === stIdx
                                                ? {
                                                    ...stepItem,
                                                    teacherActivity: e.target.value,
                                                  }
                                                : stepItem
                                            ),
                                          }
                                        : sItem
                                  );
                                  updateActiveLessonPlan({ sessions: nextSessions });
                                }}
                                className="w-full bg-transparent focus:outline-none resize-y"
                              />
                            </td>
                            <td className="border border-slate-900 py-2 px-2.5 font-medium text-indigo-950">
                              <textarea
                                rows={3}
                                value={st.lessonContent}
                                onChange={(e) => {
                                  const nextSessions = activeLessonPlan.sessions.map(
                                    (sItem, idx) =>
                                      idx === sIdx
                                        ? {
                                            ...sItem,
                                            steps: sItem.steps.map((stepItem, k) =>
                                              k === stIdx
                                                ? {
                                                    ...stepItem,
                                                    lessonContent: e.target.value,
                                                  }
                                                : stepItem
                                            ),
                                          }
                                        : sItem
                                  );
                                  updateActiveLessonPlan({ sessions: nextSessions });
                                }}
                                className="w-full bg-transparent focus:outline-none resize-y"
                              />
                            </td>
                            <td className="border border-slate-900 py-2 px-2.5">
                              <textarea
                                rows={3}
                                value={st.studentActivity}
                                onChange={(e) => {
                                  const nextSessions = activeLessonPlan.sessions.map(
                                    (sItem, idx) =>
                                      idx === sIdx
                                        ? {
                                            ...sItem,
                                            steps: sItem.steps.map((stepItem, k) =>
                                              k === stIdx
                                                ? {
                                                    ...stepItem,
                                                    studentActivity: e.target.value,
                                                  }
                                                : stepItem
                                            ),
                                          }
                                        : sItem
                                  );
                                  updateActiveLessonPlan({ sessions: nextSessions });
                                }}
                                className="w-full bg-transparent focus:outline-none resize-y"
                              />
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Footer matching PDF 4 */}
            <SignatureDateEditor
              state={state}
              onUpdateState={onUpdateState}
              showPrincipalLeft={true}
              sheetKey={`lesson_plan_${activeLessonPlan.id}`}
            />
            <div className="pt-4 border-t-2 border-emerald-700 flex items-center justify-between text-xs text-slate-800">
              <div>រៀបរៀង និង បង្រៀនដោយ អ្នកគ្រូ {state.schoolInfo.teacherName}</div>
              <div>មុខវិជ្ជា៖ ភាសាចិន</div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting a Lesson Plan (图1) */}
      {pendingDeleteLessonPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  បញ្ជាក់ការលុបមេរៀន (确定删除这个内容吗？)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  តើអ្នកពិតជាចង់លុបមេរៀន{' '}
                  <span className="font-bold text-rose-600">
                    «{pendingDeleteLessonPlan.title}»
                  </span>{' '}
                  មែនទេ?
                  <br />
                  您确定要删除课程「{pendingDeleteLessonPlan.title}」吗？删除后将无法恢复。
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPendingDeleteLessonPlan(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                បោះបង់ (取消)
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLessonPlan}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-2xs cursor-pointer"
              >
                បញ្ជាក់ការលុប (确定删除)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
