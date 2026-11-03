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
  convertIsoDateToKhmerSignature,
  ddMmYyyyToIso,
  deriveTeacherDutyReportFromLiveRecords,
  formatNumeral,
  isoToDdMmYyyy,
} from '../utils/calculations';
import { AiGeneratorBar } from './AiGeneratorBar';
import { MarkdownCopyBar } from './MarkdownDocumentView';
import { SignatureDateEditor } from './SignatureDateEditor';
import {
  BookMarked,
  CalendarDays,
  ClipboardList,
  FileCheck2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
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
    state.lessonPlans[0]?.id || 'lp-1'
  );
  const [weekMondayDateInput, setWeekMondayDateInput] = useState('17/11/2025');
  const [lpDateWeekday, setLpDateWeekday] = useState('');
  const [lpDateDay, setLpDateDay] = useState('');
  const [lpDateMonth, setLpDateMonth] = useState('');
  const [lpDateYear, setLpDateYear] = useState('២០២៦');

  const activeClass =
    state.classes.find((c) => c.id === selectedClassId) || state.classes[0];

  const enabledMonths = useMemo(
    () => state.months.filter((m) => m.enabled && !m.isSemesterExam),
    [state.months]
  );

  const activeMonth =
    enabledMonths.find((m) => m.id === selectedMonthId) ||
    enabledMonths.find((m) => m.id === 'jul') ||
    enabledMonths[0] ||
    state.months[0];

  const activeLessonPlan =
    state.lessonPlans.find((lp) => lp.id === selectedLessonPlanId) ||
    state.lessonPlans[0];

  const weeklyMeta: WeeklyLogSignatureMeta = state.weeklyLogMeta || {
    fridayDateStr: '14/11/2025',
    lunarDate: 'ថ្ងៃសុក្រ ៩រោច ខែកត្តិក ឆ្នាំម្សាញ់ សប្តស័ក ព.ស.២៥៦៩',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី១៤ ខែវិច្ឆិកា ឆ្នាំ២០២៥',
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
        state,
        activeClass?.id || '8A',
        activeMonth?.id || 'jul'
      ),
    [state, activeClass?.id, activeMonth?.id]
  );

  const currentTaskReport: TeacherMonthlyTaskReport = useMemo(() => {
    const saved = state.teacherTaskReports[activeClass?.id]?.[activeMonth?.id];
    if (saved) {
      return {
        ...liveDerivedDutyReport,
        ...saved,
      };
    }
    return liveDerivedDutyReport;
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
    const fresh = deriveTeacherDutyReportFromLiveRecords(state, cId, mId);
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
        const fresh = deriveTeacherDutyReportFromLiveRecords(prev, cls.id, mId);
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

  // --- Curriculum Handlers ---
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
    onUpdateState((prev) => ({
      ...prev,
      curriculumPlan: [...prev.curriculumPlan, newRow],
    }));
  };

  const handleCurriculumChange = (
    id: string,
    field: keyof CurriculumPlanItem,
    value: string | number
  ) => {
    onUpdateState((prev) => ({
      ...prev,
      curriculumPlan: prev.curriculumPlan.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteCurriculumRow = (id: string) => {
    onUpdateState((prev) => ({
      ...prev,
      curriculumPlan: prev.curriculumPlan.filter((item) => item.id !== id),
    }));
  };

  // --- Weekly Log Handlers ---
  const handleWeeklyLogChange = (
    id: string,
    field: keyof WeeklyLessonLogItem,
    value: string
  ) => {
    onUpdateState((prev) => ({
      ...prev,
      weeklyLogs: prev.weeklyLogs.map((w) =>
        w.id === id ? { ...w, [field]: value } : w
      ),
    }));
  };

  const handleDeleteWeeklyLog = (id: string) => {
    onUpdateState((prev) => ({
      ...prev,
      weeklyLogs: prev.weeklyLogs.filter((w) => w.id !== id),
    }));
  };

  const handleAddSingleWeeklyLog = () => {
    const newItem: WeeklyLessonLogItem = {
      id: `wlog-${Date.now()}`,
      dateStr: weekMondayDateInput,
      weekdayKh: 'ពុធ',
      timeRange: '15:00-16:30',
      classId: '10C',
      unitTitle: '第一单元 我和朋友',
      lessonTitle: '第一课 他是谁 · មេរៀនទី១ តើគាត់គឺជានរណា',
      contentDetails: '1. 生词 ពាក្យថ្មី៖ ...\n2. 句型 ទម្រង់ល្បះ៖ ...',
    };
    onUpdateState((prev) => ({
      ...prev,
      weeklyLogs: [...prev.weeklyLogs, newItem],
    }));
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
    const generated: WeeklyLessonLogItem[] = WEEKLY_8_CLASS_TEMPLATE.map(
      (tpl, idx) => ({
        id: `wlog-week-${Date.now()}-${idx}`,
        dateStr: addDaysToDdMmYyyy(weekMondayDateInput, tpl.dayOffset),
        weekdayKh: tpl.weekdayKh,
        timeRange: tpl.timeRange,
        classId: tpl.classId,
        unitTitle: tpl.defaultUnit,
        lessonTitle: tpl.defaultLesson,
        contentDetails: tpl.defaultContent,
      })
    );
    const fridayStr = addDaysToDdMmYyyy(weekMondayDateInput, 4);
    onUpdateState((prev) => ({
      ...prev,
      weeklyLogs: generated,
      weeklyLogMeta: {
        ...(prev.weeklyLogMeta || weeklyMeta),
        fridayDateStr: fridayStr,
      },
    }));
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

  // --- Lesson Plan Inline Editing Handlers ---
  const updateActiveLessonPlan = (patch: Partial<ChineseLessonPlan>) => {
    if (!activeLessonPlan) return;
    onUpdateState((prev) => ({
      ...prev,
      lessonPlans: prev.lessonPlans.map((lp) =>
        lp.id === activeLessonPlan.id ? { ...lp, ...patch } : lp
      ),
    }));
  };

  const handleAddLessonPlan = () => {
    const newLp: ChineseLessonPlan = {
      id: `lp-${Date.now()}`,
      chapterTitle: 'ជំពូកទី៣ ការទិញទំនិញ (第三单元 购物)',
      lessonTitle: 'មេរៀនថ្មី (新课)',
      durationLabel: '៤ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
      pagesLabel: 'ទំព័រទី... ដល់ ទំព័រទី...',
      textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语',
      knowledgeObjective: 'សិស្សប្រើប្រាស់ត្រឹមត្រូវក្នុងការប្រាស្រ័យទាក់ទងគ្នាជាភាសាចិន...',
      skillObjective: 'សិស្សចេះអាន និងសរសេរពាក្យថ្មី និងគំនូសអក្សរចិន...',
      attitudeObjective: 'សិស្សមានវិន័យល្អក្នុងការចូលរួម សហការណ៍ ក្នុងសកម្មភាពសិក្សា។',
      teachingMaterialsTeacher: 'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណអក្សររូបភាព',
      teachingMaterialsStudent: 'សៀវភៅគោលសម្រាប់សិស្ស សៀវភៅលំហាត់',
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
              teacherActivity: 'សរសេរចំណងជើង និងបង្រៀនពាក្យថ្មី ព្រមទាំងទម្រង់ល្បះ',
              lessonContent: '一. 生词 ពាក្យថ្មី៖ ...\n二. 句型 ទម្រង់ល្បះ៖ ...',
              studentActivity: 'សិស្សអានតាមគ្រូ ចាប់គូសន្ទនា និងកត់ត្រាចូលសៀវភៅ',
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
              lessonContent: '作业 កិច្ចការផ្ទះ៖ ហាត់សរសេរពាក្យថ្មី និងទម្រង់ល្បះ',
              studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ',
            },
          ],
        },
      ],
    };
    onUpdateState((prev) => ({
      ...prev,
      lessonPlans: [...prev.lessonPlans, newLp],
    }));
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

    onUpdateState((prev) => ({
      ...prev,
      curriculumPlan:
        mode === 'replace' ? built : [...prev.curriculumPlan, ...built],
    }));
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

    onUpdateState((prev) => ({
      ...prev,
      weeklyLogs: mode === 'replace' ? built : [...prev.weeklyLogs, ...built],
    }));
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
      durationLabel: d.durationLabel || '៤ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
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
      sessions:
        Array.isArray(d.sessions) && d.sessions.length > 0
          ? d.sessions
          : activeLessonPlan?.sessions || [],
    };
    onUpdateState((prev) => ({
      ...prev,
      lessonPlans: [...prev.lessonPlans, created],
    }));
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
            <span className="text-slate-500">ជ្រើសរើសមេរៀន៖</span>
            {state.lessonPlans.map((lp) => (
              <button
                key={lp.id}
                type="button"
                onClick={() => setSelectedLessonPlanId(lp.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeLessonPlan?.id === lp.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lp.lessonTitle}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: ANNUAL CHINESE CURRICULUM PLAN (កម្មវិធីសិក្សាភាសាចិន កំរិត២) */}
      {docTab === 'curriculum' && (
        <div className="space-y-4">
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
            />
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY LESSON LOG FOR ALL 8 CLASSES (សម្រង់អត្ថបទប្រចាំសប្តាហ៍ — PDF 2 STYLE) */}
      {docTab === 'weekly_log' && (
        <div className="space-y-4">
          <AiGeneratorBar
            taskType="weekly_log"
            titleKh="AI បង្កើត ឬបង្ហោះឯកសារសម្រង់អត្ថបទប្រចាំសប្តាហ៍ (ទាំង ៨ ថ្នាក់៖ 9A, 9C, 8C, 8A, 10A, 10C, 9B, 8B)"
            placeholderKh="ឧ. បង្កើតសម្រង់អត្ថបទប្រចាំសប្តាហ៍ មេរៀនទី២ នាងខ្ពស់ជាងខ្ញុំ សម្រាប់ទាំង ៨ ថ្នាក់ (ចន្ទ–ព្រហស្បតិ៍) ឬបង្ហោះ PDF/រូបភាព..."
            defaultPrompt={`Generate a complete 8-class weekly teaching log (សម្រង់អត្ថបទប្រចាំសប្តាហ៍) starting Monday ${weekMondayDateInput} for classes 9A, 9C (Monday), 8C, 8A (Tuesday), 10A, 10C (Wednesday), and 9B, 8B (Thursday).`}
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
                {state.weeklyLogs.map((log) => (
                  <tr key={log.id} className="align-top group">
                    <td className="border border-slate-900 py-2 px-1.5 text-center">
                      <input
                        type="date"
                        value={ddMmYyyyToIso(log.dateStr)}
                        onChange={(e) => {
                          const picked = e.target.value;
                          if (!picked) return;
                          const converted = convertIsoDateToKhmerSignature(picked);
                          onUpdateState((prev) => ({
                            ...prev,
                            weeklyLogs: prev.weeklyLogs.map((w) =>
                              w.id === log.id
                                ? {
                                    ...w,
                                    dateStr: converted.ddMmYyyy,
                                    weekdayKh: converted.weekdayKh,
                                  }
                                : w
                            ),
                          }));
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
                        onChange={(e) =>
                          handleWeeklyLogChange(log.id, 'classId', e.target.value)
                        }
                        className="w-full text-center font-mono font-bold text-xs bg-transparent focus:outline-none focus:bg-indigo-50/40"
                      />
                    </td>
                    <td className="border border-slate-900 py-2 px-3 space-y-1 relative">
                      <input
                        type="text"
                        value={log.unitTitle}
                        placeholder="ជំពូក (Unit)..."
                        onChange={(e) =>
                          handleWeeklyLogChange(log.id, 'unitTitle', e.target.value)
                        }
                        className="w-full text-center font-bold text-slate-950 bg-transparent focus:outline-none focus:bg-indigo-50/40"
                      />
                      <input
                        type="text"
                        value={log.lessonTitle}
                        placeholder="ចំណងជើងមេរៀន (Lesson)..."
                        onChange={(e) =>
                          handleWeeklyLogChange(log.id, 'lessonTitle', e.target.value)
                        }
                        className="w-full text-center font-bold text-indigo-950 bg-transparent focus:outline-none focus:bg-indigo-50/40"
                      />
                      <textarea
                        rows={3}
                        value={log.contentDetails}
                        onChange={(e) =>
                          handleWeeklyLogChange(log.id, 'contentDetails', e.target.value)
                        }
                        className="w-full whitespace-pre-line leading-relaxed pt-1 text-slate-900 bg-transparent focus:outline-none focus:bg-indigo-50/40 resize-y"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteWeeklyLog(log.id)}
                        className="opacity-0 group-hover:opacity-100 absolute top-1.5 right-1.5 text-slate-300 hover:text-rose-600 no-print"
                        title="លុបជួរនេះ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

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
            />
          </div>
        </div>
      )}

      {/* TAB 4: 5-STEP CHINESE LESSON PLANS (កិច្ចតែងការបង្រៀន) */}
      {docTab === 'lesson_plan' && activeLessonPlan && (
        <div className="space-y-4">
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
                  value={lpDateWeekday}
                  onChange={(e) => setLpDateWeekday(e.target.value)}
                  placeholder="..............."
                  className="w-20 text-center border-b border-dotted border-slate-500 bg-transparent focus:outline-none"
                />
                <span>ទី</span>
                <input
                  type="text"
                  value={lpDateDay}
                  onChange={(e) => setLpDateDay(e.target.value)}
                  placeholder="......."
                  className="w-12 text-center border-b border-dotted border-slate-500 bg-transparent focus:outline-none"
                />
                <span>ខែ</span>
                <input
                  type="text"
                  value={lpDateMonth}
                  onChange={(e) => setLpDateMonth(e.target.value)}
                  placeholder="..............."
                  className="w-24 text-center border-b border-dotted border-slate-500 bg-transparent focus:outline-none"
                />
                <span>ឆ្នាំ</span>
                <input
                  type="text"
                  value={lpDateYear}
                  onChange={(e) => setLpDateYear(e.target.value)}
                  placeholder="២០២..."
                  className="w-16 text-center border-b border-dotted border-slate-500 bg-transparent focus:outline-none"
                />
                <div className="inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-semibold no-print">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-700" />
                  <span>ជ្រើសរើសថ្ងៃ/ខែ៖</span>
                  <input
                    type="date"
                    onChange={(e) => {
                      const picked = e.target.value;
                      if (!picked) return;
                      const conv = convertIsoDateToKhmerSignature(picked);
                      setLpDateWeekday(conv.weekdayKh);
                      setLpDateDay(conv.gregorianDay);
                      setLpDateMonth(conv.gregorianMonth);
                      setLpDateYear(conv.gregorianYear);
                    }}
                    className="bg-white px-2 py-0.5 rounded border border-slate-300 text-[11px] font-bold cursor-pointer"
                  />
                </div>
              </div>
              <div>ថ្នាក់ ៖ ៨A / ៨B / ៨C / ៩A / ៩B / ៩C / ១០A / ១០C</div>
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
            />
            <div className="pt-4 border-t-2 border-emerald-700 flex items-center justify-between text-xs text-slate-800">
              <div>រៀបរៀង និង បង្រៀនដោយ អ្នកគ្រូ {state.schoolInfo.teacherName}</div>
              <div>មុខវិជ្ជា៖ ភាសាចិន</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
