import React, { useMemo, useRef, useState } from 'react';
import {
  AnnualClassroomPlanSheet,
  AnnualPlanColumnKey,
  AppDatabaseState,
  ClassroomPerformanceMark,
  GradeLetter,
  Language,
  MonthlyScoreSheetConfig,
  ScoreValue,
  StudentMonthlyBreakdownEntry,
  StudentStandardEvaluation,
} from '../types';
import {
  calculateChineseGradeDistribution,
  calculateClassChineseResults,
  calculateClassMonthlyBreakdownRows,
  calculateModelSchoolChecklistStats,
  formatNumeral,
  formatPaddedScore,
  generateAutoSessionDatesForMonth,
  getClassMaxScore,
  getResolvedAnnualClassroomPlan,
  getResolvedMonthlyScoreConfig,
  isoToDdMmYyyy,
  resolveStudentMonthlyBreakdown,
  resolveStudentStandardEvaluation,
  sortStudentsByKhmerName,
} from '../utils/calculations';
import { MarkdownCopyBar } from './MarkdownDocumentView';
import { MonthSelectorBar, formatMonthButtonLabel } from './MonthSelectorBar';
import { SignatureDateEditor } from './SignatureDateEditor';
import {
  BarChart3,
  Calculator,
  CheckCircle2,
  CheckSquare,
  ClipboardCheck,
  RefreshCw,
  Sparkles,
  Table2,
} from 'lucide-react';

interface Props {
  state: AppDatabaseState;
  lang: Language;
  selectedClassId: string;
  onSelectClassId: (id: string) => void;
  selectedMonthId: string;
  onSelectMonthId: (id: string) => void;
  onUpdateState: (updater: (prev: AppDatabaseState) => AppDatabaseState) => void;
  onNavigateToPrint?: () => void;
}

type ScoreSubMode =
  | 'monthly_breakdown'
  | 'chinese_scores'
  | 'skill_attitude'
  | 'model_school_checklist'
  | 'annual_classroom_plan';
type SemesterFilter = 'sem1' | 'sem2' | 'all';

const ANNUAL_PLAN_COL_KEYS: {
  key: AnnualPlanColumnKey;
  line1: string;
  line2: string;
}[] = [
  { key: 'baseline', line1: 'ទិន្ន័យ', line2: 'មូលដ្ឋាន' },
  { key: 'sem1Target', line1: 'គោលដៅ', line2: 'ឆមាសទី១' },
  { key: 'sem1Actual', line1: 'ផលសម្រេច', line2: 'ឆមាសទី១' },
  { key: 'sem2Target', line1: 'គោលដៅ', line2: 'ឆមាសទី២' },
  { key: 'sem2Actual', line1: 'ផលសម្រេច', line2: 'ឆមាសទី២' },
  { key: 'yearEndTarget', line1: 'គោលដៅ', line2: 'បំណាច់ឆ្នាំ' },
  { key: 'yearEndActual', line1: 'ផលសម្រេច', line2: 'បំណាច់ឆ្នាំ' },
];

const ANNUAL_PLAN_GRADES: GradeLetter[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export const MonthlyScoreModule: React.FC<Props> = ({
  state,
  selectedClassId,
  onSelectClassId,
  selectedMonthId,
  onSelectMonthId,
  onUpdateState,
}) => {
  const [subMode, setSubMode] = useState<ScoreSubMode>('monthly_breakdown');
  const [semesterFilter, setSemesterFilter] = useState<SemesterFilter>('all');
  const [showAllClassesAnnualPlan, setShowAllClassesAnnualPlan] = useState<boolean>(true);
  const [organizedFeedback, setOrganizedFeedback] = useState<string>('');
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const activeClass =
    state.classes.find((c) => c.id === selectedClassId) || state.classes[0];
  const classMaxScore = getClassMaxScore(activeClass);

  const activeAcademicYear = useMemo(() => {
    return (
      state.academicTerms?.find((t) => t.id === state.currentTermId)?.nameKh ||
      state.schoolInfo.academicYear ||
      '២០២៦ ~ ២០២៧'
    );
  }, [state.academicTerms, state.currentTermId, state.schoolInfo.academicYear]);

  const classStudents = useMemo(
    () =>
      sortStudentsByKhmerName(
        state.students.filter((s) => s.classId === activeClass?.id)
      ),
    [state.students, activeClass?.id]
  );

  const enabledMonths = useMemo(
    () => state.months.filter((m) => m.enabled),
    [state.months]
  );

  const activeMonth =
    enabledMonths.find((m) => m.id === selectedMonthId) ||
    enabledMonths.find((m) => m.id === 'nov') ||
    enabledMonths[0] ||
    state.months[0];

  const displayedMonths = useMemo(() => {
    if (semesterFilter === 'sem1') {
      return enabledMonths.filter((m) => m.semester === 1);
    }
    if (semesterFilter === 'sem2') {
      return enabledMonths.filter((m) => m.semester === 2);
    }
    return enabledMonths;
  }, [enabledMonths, semesterFilter]);

  const displayedMonthIds = useMemo(
    () => displayedMonths.map((m) => m.id),
    [displayedMonths]
  );

  const computedRows = useMemo(
    () =>
      calculateClassChineseResults(
        classStudents,
        state.scores[activeClass?.id],
        displayedMonthIds,
        classMaxScore,
        state.gradeThresholds,
        true
      ),
    [
      classStudents,
      state.scores,
      activeClass?.id,
      displayedMonthIds,
      classMaxScore,
      state.gradeThresholds,
    ]
  );

  const gradeDist = useMemo(
    () => calculateChineseGradeDistribution(computedRows),
    [computedRows]
  );

  const checklistStats = useMemo(
    () =>
      calculateModelSchoolChecklistStats(
        classStudents,
        state.standardEvaluations[activeClass?.id]?.[activeMonth?.id],
        state,
        activeClass?.id,
        activeMonth?.id
      ),
    [
      classStudents,
      state,
      activeClass?.id,
      activeMonth?.id,
    ]
  );

  const parseRawScoreInput = (rawText: string, maxScore: number): ScoreValue => {
    const trimmed = rawText.trim().toUpperCase();
    if (trimmed === '' || trimmed === '-') return null;
    if (trimmed === 'ABS' || trimmed === 'អវត្តមាន') return 'ABS';
    const normalized = trimmed.replace(/[០-៩]/g, (ch) =>
      String('០១២៣៤៥៦៧៨៩'.indexOf(ch))
    );
    const num = parseFloat(normalized);
    if (Number.isNaN(num)) return null;
    return Math.max(0, Math.min(maxScore, Math.round(num * 10) / 10));
  };

  const handleScoreCellChange = (
    studentId: string,
    monthId: string,
    rawValue: string
  ) => {
    const parsed = parseRawScoreInput(rawValue, classMaxScore);
    const cId = activeClass.id;
    onUpdateState((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [cId]: {
          ...(prev.scores[cId] || {}),
          [studentId]: {
            ...(prev.scores[cId]?.[studentId] || {}),
            [monthId]: parsed,
          },
        },
      },
    }));
  };

  const focusCell = (rIdx: number, cIdx: number) => {
    const target = inputRefs.current[`${rIdx}-${cIdx}`];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rIdx: number,
    cIdx: number
  ) => {
    const maxR = computedRows.length - 1;
    const maxC = displayedMonths.length - 1;

    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      if (rIdx < maxR) focusCell(rIdx + 1, cIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rIdx > 0) focusCell(rIdx - 1, cIdx);
    } else if (e.key === 'ArrowRight') {
      if (
        e.currentTarget.selectionStart === e.currentTarget.value.length &&
        cIdx < maxC
      ) {
        e.preventDefault();
        focusCell(rIdx, cIdx + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (e.currentTarget.selectionStart === 0 && cIdx > 0) {
        e.preventDefault();
        focusCell(rIdx, cIdx - 1);
      }
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    startRowIdx: number,
    startColIdx: number
  ) => {
    const text = e.clipboardData.getData('text/plain');
    if (!text || (!text.includes('\n') && !text.includes('\t'))) return;

    e.preventDefault();
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

    const cId = activeClass.id;
    onUpdateState((prev) => {
      const nextClassScores = { ...(prev.scores[cId] || {}) };
      lines.forEach((line, rOffset) => {
        const targetStudent = classStudents[startRowIdx + rOffset];
        if (!targetStudent) return;
        const cells = line.split('\t');
        const stuScores = { ...(nextClassScores[targetStudent.id] || {}) };

        cells.forEach((cellText, cOffset) => {
          const targetMonth = displayedMonths[startColIdx + cOffset];
          if (!targetMonth) return;
          stuScores[targetMonth.id] = parseRawScoreInput(cellText, classMaxScore);
        });

        nextClassScores[targetStudent.id] = stuScores;
      });

      return {
        ...prev,
        scores: {
          ...prev.scores,
          [cId]: nextClassScores,
        },
      };
    });
  };

  const handleEvaluationFieldChange = <K extends keyof StudentStandardEvaluation>(
    studentId: string,
    field: K,
    value: StudentStandardEvaluation[K]
  ) => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    const stu = classStudents.find((s) => s.id === studentId);
    if (!stu) return;

    onUpdateState((prev) => {
      const currentResolved = resolveStudentStandardEvaluation(prev, cId, mId, stu);
      const nextOverrides = {
        ...(currentResolved.manualOverrides || {}),
        [field]: true,
      };
      return {
        ...prev,
        standardEvaluations: {
          ...prev.standardEvaluations,
          [cId]: {
            ...(prev.standardEvaluations[cId] || {}),
            [mId]: {
              ...(prev.standardEvaluations[cId]?.[mId] || {}),
              [studentId]: {
                ...currentResolved,
                [field]: value,
                manualOverrides: nextOverrides,
              },
            },
          },
        },
      };
    });
  };

  const handleResetAutoEvaluationForClass = () => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    onUpdateState((prev) => {
      const nextMonthMap = { ...(prev.standardEvaluations[cId]?.[mId] || {}) };
      classStudents.forEach((stu) => {
        const cur = nextMonthMap[stu.id];
        if (cur) {
          nextMonthMap[stu.id] = {
            ...cur,
            manualOverrides: {},
          };
        }
      });
      return {
        ...prev,
        standardEvaluations: {
          ...prev.standardEvaluations,
          [cId]: {
            ...(prev.standardEvaluations[cId] || {}),
            [mId]: nextMonthMap,
          },
        },
      };
    });
  };

  const handleToggleAllStudyPlan = (checked: boolean) => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    onUpdateState((prev) => {
      const nextMonthMap = { ...(prev.standardEvaluations[cId]?.[mId] || {}) };
      classStudents.forEach((stu) => {
        const resolved = resolveStudentStandardEvaluation(prev, cId, mId, stu);
        const isNeverPresent = (stu.note || '').includes('មិនដែលមករៀន');
        nextMonthMap[stu.id] = {
          ...resolved,
          hasStudyPlan: isNeverPresent ? false : checked,
          manualOverrides: {
            ...(resolved.manualOverrides || {}),
            hasStudyPlan: true,
          },
        };
      });
      return {
        ...prev,
        standardEvaluations: {
          ...prev.standardEvaluations,
          [cId]: {
            ...(prev.standardEvaluations[cId] || {}),
            [mId]: nextMonthMap,
          },
        },
      };
    });
  };

  const handleStudentFieldChange = (
    studentId: string,
    field: 'dob' | 'studentCode' | 'name',
    value: string
  ) => {
    onUpdateState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, [field]: value } : s
      ),
    }));
  };

  const updateAnnualPlanForClass = (
    classId: string,
    updater: (prevPlan: AnnualClassroomPlanSheet) => AnnualClassroomPlanSheet
  ) => {
    onUpdateState((prev) => {
      const currentResolved = getResolvedAnnualClassroomPlan(prev, classId);
      return {
        ...prev,
        annualClassroomPlans: {
          ...(prev.annualClassroomPlans || {}),
          [classId]: updater(currentResolved),
        },
      };
    });
  };

  const handleAnnualPlanCountChange = (
    classId: string,
    rowKey: GradeLetter | 'TOTAL',
    colKey: AnnualPlanColumnKey,
    rawCount: string
  ) => {
    updateAnnualPlanForClass(classId, (prevPlan) => {
      const classStus = state.students.filter((s) => s.classId === classId);
      const parsedOverride = parseInt(
        String(prevPlan.totalStudentsOverride || '').replace(/[០-៩]/g, (ch) =>
          String('០១២៣៤៥៦៧៨៩'.indexOf(ch))
        ),
        10
      );
      const parsedColTotal = parseInt(
        String(prevPlan.rows.TOTAL?.[colKey]?.count || '').replace(
          /[០-៩]/g,
          (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch))
        ),
        10
      );
      // Whole class student count is the primary denominator for %
      const totalStusNum = Math.max(
        1,
        !Number.isNaN(parsedOverride) && parsedOverride > 0
          ? parsedOverride
          : classStus.length > 0
          ? classStus.length
          : !Number.isNaN(parsedColTotal) && parsedColTotal > 0
          ? parsedColTotal
          : 1
      );

      if (rowKey === 'TOTAL') {
        // If user edited TOTAL count, recalculate all A-F percentages in this column based on new TOTAL
        const cleanTotal = rawCount
          .trim()
          .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)));
        const newTotalNum = parseFloat(cleanTotal);
        const nextRows = { ...prevPlan.rows };
        nextRows.TOTAL = {
          ...nextRows.TOTAL,
          [colKey]: {
            count: rawCount,
            pct: rawCount.trim() ? '100' : '',
          },
        };
        if (!Number.isNaN(newTotalNum) && newTotalNum > 0) {
          ANNUAL_PLAN_GRADES.forEach((g) => {
            const gCountStr = nextRows[g]?.[colKey]?.count || '';
            const gClean = gCountStr
              .trim()
              .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)));
            const gNum = parseFloat(gClean);
            nextRows[g] = {
              ...nextRows[g],
              [colKey]: {
                count: gCountStr,
                pct:
                  gClean !== '' && !Number.isNaN(gNum)
                    ? String(Math.round((gNum / newTotalNum) * 100))
                    : '',
              },
            };
          });
        }
        return {
          ...prevPlan,
          totalStudentsOverride:
            !Number.isNaN(newTotalNum) && newTotalNum > 0
              ? rawCount
              : prevPlan.totalStudentsOverride,
          rows: nextRows,
        };
      }

      // User manually entered a grade (A..F) ចំនួន -> automatically calculate % based on whole class student count (totalStusNum)
      const cleanCount = rawCount
        .trim()
        .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)));
      const countNum = parseFloat(cleanCount);
      const autoPct =
        cleanCount !== '' && !Number.isNaN(countNum)
          ? String(Math.round((countNum / totalStusNum) * 100))
          : '';

      return {
        ...prevPlan,
        rows: {
          ...prevPlan.rows,
          [rowKey]: {
            ...prevPlan.rows[rowKey],
            [colKey]: {
              count: rawCount,
              pct: autoPct,
            },
          },
          TOTAL: {
            ...prevPlan.rows.TOTAL,
            [colKey]: {
              count: String(totalStusNum),
              pct: '100',
            },
          },
        },
      };
    });
  };

  const handleAnnualPlanPctChange = (
    classId: string,
    rowKey: GradeLetter | 'TOTAL',
    colKey: AnnualPlanColumnKey,
    rawPct: string
  ) => {
    updateAnnualPlanForClass(classId, (prevPlan) => {
      if (rowKey === 'TOTAL') {
        return {
          ...prevPlan,
          rows: {
            ...prevPlan.rows,
            TOTAL: {
              ...prevPlan.rows.TOTAL,
              [colKey]: {
                ...prevPlan.rows.TOTAL[colKey],
                pct: rawPct,
              },
            },
          },
        };
      }

      const classStus = state.students.filter((s) => s.classId === classId);
      const parsedOverride = parseInt(
        String(prevPlan.totalStudentsOverride || '').replace(/[០-៩]/g, (ch) =>
          String('០១២៣៤៥៦៧៨៩'.indexOf(ch))
        ),
        10
      );
      const totalStusNum = Math.max(
        1,
        !Number.isNaN(parsedOverride) && parsedOverride > 0
          ? parsedOverride
          : classStus.length || 1
      );

      const cleanPct = rawPct
        .trim()
        .replace(/%/g, '')
        .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)));
      const pctNum = parseFloat(cleanPct);
      const autoCount =
        cleanPct !== '' && !Number.isNaN(pctNum)
          ? String(Math.round((pctNum / 100) * totalStusNum))
          : '';

      return {
        ...prevPlan,
        rows: {
          ...prevPlan.rows,
          [rowKey]: {
            ...prevPlan.rows[rowKey],
            [colKey]: {
              count: autoCount,
              pct: rawPct,
            },
          },
          TOTAL: {
            ...prevPlan.rows.TOTAL,
            [colKey]: {
              count: String(totalStusNum),
              pct: '100',
            },
          },
        },
      };
    });
  };

  const monthlyBreakdownConfig = useMemo(
    () =>
      getResolvedMonthlyScoreConfig(
        state,
        activeClass?.id || '8A',
        activeMonth?.id || 'nov'
      ),
    [state, activeClass?.id, activeMonth?.id]
  );

  const monthlyBreakdownRows = useMemo(
    () =>
      calculateClassMonthlyBreakdownRows(
        state,
        activeClass?.id || '8A',
        activeMonth?.id || 'nov',
        classStudents
      ),
    [state, activeClass?.id, activeMonth?.id, classStudents]
  );

  const updateMonthlyConfig = (
    updater: (prevCfg: MonthlyScoreSheetConfig) => MonthlyScoreSheetConfig
  ) => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    onUpdateState((prev) => {
      const resolvedCfg = getResolvedMonthlyScoreConfig(prev, cId, mId);
      const nextCfg = updater(resolvedCfg);
      return {
        ...prev,
        monthlyScoreConfigs: {
          ...(prev.monthlyScoreConfigs || {}),
          [cId]: {
            ...(prev.monthlyScoreConfigs?.[cId] || {}),
            [mId]: nextCfg,
          },
        },
      };
    });
  };

  const handleAiAutoFillMonthlyDates = () => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    onUpdateState((prev) => {
      const resolvedCfg = getResolvedMonthlyScoreConfig(prev, cId, mId);
      const auto = generateAutoSessionDatesForMonth(
        activeClass,
        activeMonth,
        resolvedCfg.sessionCount,
        activeAcademicYear
      );
      const nextCfg: MonthlyScoreSheetConfig = {
        ...resolvedCfg,
        sessionDates: auto.sessionDates,
        scoringEndDate: auto.scoringEndDate,
      };
      return {
        ...prev,
        monthlyScoreConfigs: {
          ...(prev.monthlyScoreConfigs || {}),
          [cId]: {
            ...(prev.monthlyScoreConfigs?.[cId] || {}),
            [mId]: nextCfg,
          },
        },
      };
    });
    setOrganizedFeedback('បានបំពេញកាលបរិច្ឆេទបង្រៀន និងថ្ងៃបញ្ចប់ការគណនាពិន្ទុដោយស្វ័យប្រវត្តិ!');
    window.setTimeout(() => setOrganizedFeedback(''), 3000);
  };

  const updateStudentMonthlyEntryAndSyncTotal = (
    studentId: string,
    updater: (
      prevEntry: StudentMonthlyBreakdownEntry,
      resolvedBefore: ReturnType<typeof resolveStudentMonthlyBreakdown>
    ) => StudentMonthlyBreakdownEntry
  ) => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    const stu = classStudents.find((s) => s.id === studentId);
    if (!stu) return;

    onUpdateState((prev) => {
      const cfg = getResolvedMonthlyScoreConfig(prev, cId, mId);
      const resolvedBefore = resolveStudentMonthlyBreakdown(prev, cId, mId, stu, cfg);
      const existingSaved = prev.monthlyScoreBreakdowns?.[cId]?.[mId]?.[studentId] || {
        performanceMarks: resolvedBefore.performanceMarks,
        examScore: resolvedBefore.examScore,
      };
      const nextEntry = updater(existingSaved, resolvedBefore);

      const nextStateTemp: AppDatabaseState = {
        ...prev,
        monthlyScoreBreakdowns: {
          ...(prev.monthlyScoreBreakdowns || {}),
          [cId]: {
            ...(prev.monthlyScoreBreakdowns?.[cId] || {}),
            [mId]: {
              ...(prev.monthlyScoreBreakdowns?.[cId]?.[mId] || {}),
              [studentId]: nextEntry,
            },
          },
        },
      };

      const resolvedAfter = resolveStudentMonthlyBreakdown(
        nextStateTemp,
        cId,
        mId,
        stu,
        cfg
      );
      const syncedScore =
        typeof resolvedAfter.totalScore === 'number'
          ? Math.round(resolvedAfter.totalScore)
          : resolvedAfter.totalScore;

      return {
        ...nextStateTemp,
        scores: {
          ...prev.scores,
          [cId]: {
            ...(prev.scores[cId] || {}),
            [studentId]: {
              ...(prev.scores[cId]?.[studentId] || {}),
              [mId]: syncedScore,
            },
          },
        },
      };
    });
  };

  const handleSetPerformanceMark = (
    studentId: string,
    sessionIdx: number,
    mark: ClassroomPerformanceMark
  ) => {
    updateStudentMonthlyEntryAndSyncTotal(studentId, (prevEntry, resolvedBefore) => ({
      ...prevEntry,
      performanceMarks: {
        ...resolvedBefore.performanceMarks,
        ...(prevEntry.performanceMarks || {}),
        [sessionIdx]: mark,
      },
      // Clear manual override on performanceScore so the new mark recalculates it automatically
      performanceScoreOverride: null,
      totalScoreOverride: null,
    }));
  };

  const handleCyclePerformanceMark = (studentId: string, sessionIdx: number) => {
    const row = monthlyBreakdownRows.find((r) => r.studentId === studentId);
    const cur = row?.performanceMarks[sessionIdx] || '';
    const order: ClassroomPerformanceMark[] = ['good', 'half', 'bad', ''];
    const next = order[(order.indexOf(cur) + 1) % order.length];
    handleSetPerformanceMark(studentId, sessionIdx, next);
  };

  const handleBatchFillSessionMark = (
    sessionIdx: number,
    mark: ClassroomPerformanceMark
  ) => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    onUpdateState((prev) => {
      const cfg = getResolvedMonthlyScoreConfig(prev, cId, mId);
      const nextBreakdownsForMonth = {
        ...(prev.monthlyScoreBreakdowns?.[cId]?.[mId] || {}),
      };
      const nextScoresForClass = { ...(prev.scores[cId] || {}) };

      classStudents.forEach((stu) => {
        const isNeverPresent =
          stu.status === 'dropped' || (stu.note || '').includes('មិនដែលមករៀន');
        const resolvedBefore = resolveStudentMonthlyBreakdown(prev, cId, mId, stu, cfg);
        const existingSaved = nextBreakdownsForMonth[stu.id] || {
          performanceMarks: resolvedBefore.performanceMarks,
          examScore: resolvedBefore.examScore,
        };
        const nextEntry: StudentMonthlyBreakdownEntry = {
          ...existingSaved,
          performanceMarks: {
            ...resolvedBefore.performanceMarks,
            ...(existingSaved.performanceMarks || {}),
            [sessionIdx]: isNeverPresent ? 'bad' : mark,
          },
          performanceScoreOverride: null,
          totalScoreOverride: null,
        };
        nextBreakdownsForMonth[stu.id] = nextEntry;

        const tempState: AppDatabaseState = {
          ...prev,
          monthlyScoreBreakdowns: {
            ...(prev.monthlyScoreBreakdowns || {}),
            [cId]: {
              ...(prev.monthlyScoreBreakdowns?.[cId] || {}),
              [mId]: nextBreakdownsForMonth,
            },
          },
        };
        const resolvedAfter = resolveStudentMonthlyBreakdown(
          tempState,
          cId,
          mId,
          stu,
          cfg
        );
        nextScoresForClass[stu.id] = {
          ...(nextScoresForClass[stu.id] || {}),
          [mId]:
            typeof resolvedAfter.totalScore === 'number'
              ? Math.round(resolvedAfter.totalScore)
              : resolvedAfter.totalScore,
        };
      });

      return {
        ...prev,
        monthlyScoreBreakdowns: {
          ...(prev.monthlyScoreBreakdowns || {}),
          [cId]: {
            ...(prev.monthlyScoreBreakdowns?.[cId] || {}),
            [mId]: nextBreakdownsForMonth,
          },
        },
        scores: {
          ...prev.scores,
          [cId]: nextScoresForClass,
        },
      };
    });
  };

  const handleFinishAndOrganizeAllMonthlyScores = () => {
    const cId = activeClass.id;
    const mId = activeMonth.id;
    onUpdateState((prev) => {
      const cfg = getResolvedMonthlyScoreConfig(prev, cId, mId);
      const nextCfg: MonthlyScoreSheetConfig = {
        ...cfg,
        isScoringFinished: true,
      };
      const nextBreakdownsForMonth = {
        ...(prev.monthlyScoreBreakdowns?.[cId]?.[mId] || {}),
      };
      const nextScoresForClass = { ...(prev.scores[cId] || {}) };

      classStudents.forEach((stu) => {
        const resolved = resolveStudentMonthlyBreakdown(prev, cId, mId, stu, nextCfg);
        nextBreakdownsForMonth[stu.id] = {
          performanceMarks: resolved.performanceMarks,
          examScore: resolved.examScore,
          attendanceScoreOverride: prev.monthlyScoreBreakdowns?.[cId]?.[mId]?.[stu.id]
            ?.attendanceScoreOverride,
          performanceScoreOverride: prev.monthlyScoreBreakdowns?.[cId]?.[mId]?.[stu.id]
            ?.performanceScoreOverride,
          homeworkScoreOverride: prev.monthlyScoreBreakdowns?.[cId]?.[mId]?.[stu.id]
            ?.homeworkScoreOverride,
          totalScoreOverride: null,
        };
        nextScoresForClass[stu.id] = {
          ...(nextScoresForClass[stu.id] || {}),
          [mId]:
            typeof resolved.totalScore === 'number'
              ? Math.round(resolved.totalScore)
              : resolved.totalScore,
        };
      });

      return {
        ...prev,
        monthlyScoreConfigs: {
          ...(prev.monthlyScoreConfigs || {}),
          [cId]: {
            ...(prev.monthlyScoreConfigs?.[cId] || {}),
            [mId]: nextCfg,
          },
        },
        monthlyScoreBreakdowns: {
          ...(prev.monthlyScoreBreakdowns || {}),
          [cId]: {
            ...(prev.monthlyScoreBreakdowns?.[cId] || {}),
            [mId]: nextBreakdownsForMonth,
          },
        },
        scores: {
          ...prev.scores,
          [cId]: nextScoresForClass,
        },
      };
    });
    setOrganizedFeedback(
      `បានបញ្ចប់ការគណនាពិន្ទុត្រឹមថ្ងៃ ${isoToDdMmYyyy(
        monthlyBreakdownConfig.scoringEndDate
      )} និងរៀបចំពិន្ទុសរុបសិស្សទាំងអស់ (${classStudents.length} នាក់) រួចរាល់!`
    );
    window.setTimeout(() => setOrganizedFeedback(''), 4000);
  };

  const activeCopySection =
    subMode === 'monthly_breakdown'
      ? 'monthly_breakdown'
      : subMode === 'chinese_scores'
      ? 'scores'
      : subMode === 'skill_attitude'
      ? 'student_stats'
      : subMode === 'model_school_checklist'
      ? 'teacher_checklist'
      : 'annual_classroom_plan';

  const getGradeTextStyle = (g: GradeLetter | '-') => {
    switch (g) {
      case 'A':
        return 'text-emerald-700 font-bold';
      case 'B':
        return 'text-indigo-700 font-bold';
      case 'C':
        return 'text-sky-700 font-semibold';
      case 'D':
        return 'text-amber-700 font-semibold';
      case 'E':
        return 'text-orange-700 font-medium';
      case 'F':
        return 'text-rose-700 font-bold';
      default:
        return 'text-slate-400';
    }
  };

  const classesToRenderForAnnualPlan = showAllClassesAnnualPlan
    ? state.classes
    : [activeClass];

  return (
    <div className="space-y-5">
      {/* Sub-mode Switcher & Month Filter Bar */}
      <div className="bg-white border border-indigo-100 shadow-2xs rounded-xl p-3.5 space-y-3 no-print">
        {/* 5 Clean Numbered Sub-Modes */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-indigo-50 pb-3">
          <button
            type="button"
            onClick={() => setSubMode('monthly_breakdown')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              subMode === 'monthly_breakdown'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs ring-2 ring-blue-200'
                : 'bg-sky-50/80 text-indigo-950 border border-sky-200/70 hover:bg-sky-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>១. ពិន្ទុប្រចាំខែ & សកម្មភាពក្នុងថ្នាក់ (月成绩与课堂表现 ✓/○/✗)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubMode('skill_attitude')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              subMode === 'skill_attitude'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xs ring-2 ring-teal-200'
                : 'bg-sky-50/80 text-indigo-950 border border-sky-200/70 hover:bg-sky-100'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>២. តារាងស្ថិតិសិស្ស (បំណិន & ចរិយាសម្បទា)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubMode('model_school_checklist')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              subMode === 'model_school_checklist'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs ring-2 ring-amber-200'
                : 'bg-sky-50/80 text-indigo-950 border border-sky-200/70 hover:bg-sky-100'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>៣. បញ្ជីគ្រូបង្រៀន (មានសភគោល)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubMode('annual_classroom_plan')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              subMode === 'annual_classroom_plan'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xs ring-2 ring-violet-200'
                : 'bg-sky-50/80 text-indigo-950 border border-sky-200/70 hover:bg-sky-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>៤. ផែនការថ្នាក់រៀន ១ឆ្នាំ (年度班级计划)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubMode('chinese_scores')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              subMode === 'chinese_scores'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs ring-2 ring-cyan-200'
                : 'bg-sky-50/80 text-indigo-950 border border-sky-200/70 hover:bg-sky-100'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>
              ៥. តារាងពិន្ទុឆមាសសរុប (学期总成绩表)
            </span>
          </button>
        </div>

        {/* Context Filter Bar */}
        {subMode === 'chinese_scores' ? (
          <div className="space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-indigo-900 font-bold">ជ្រើសរើសឆមាស៖</span>
                <div className="flex items-center gap-1 p-1 bg-sky-50 border border-sky-200/70 rounded-lg">
                  {(
                    [
                      { id: 'sem1', label: 'ឆមាសទី១ (វិច្ឆិកា–មីនា)' },
                      { id: 'sem2', label: 'ឆមាសទី២ (ឧសភា–កញ្ញា)' },
                      { id: 'all', label: 'គ្រប់ខែទាំងអស់' },
                    ] as const
                  ).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSemesterFilter(s.id)}
                      className={`px-2.5 py-1 rounded-md font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        semesterFilter === s.id
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-indigo-900 hover:bg-sky-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 font-mono tabular-nums text-slate-600">
                <span>
                  សិស្សសរុប៖{' '}
                  <strong>
                    {formatNumeral(gradeDist.totalActive, state.useKhmerNumerals)}
                  </strong>{' '}
                  (ស្រី{' '}
                  <strong>
                    {formatNumeral(gradeDist.femaleActive, state.useKhmerNumerals)}
                  </strong>
                  )
                </span>
                <MarkdownCopyBar
                  state={state}
                  section={activeCopySection}
                  selectedClassId={activeClass?.id || '8A'}
                  selectedMonthId={activeMonth?.id || 'nov'}
                />
              </div>
            </div>
            <MonthSelectorBar
              state={state}
              activeMonthId={activeMonth?.id || 'nov'}
              onSelectMonthId={onSelectMonthId}
              onUpdateState={onUpdateState}
            />
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {subMode !== 'annual_classroom_plan' ? (
              <MonthSelectorBar
                state={state}
                activeMonthId={activeMonth?.id || 'nov'}
                onSelectMonthId={onSelectMonthId}
                onUpdateState={onUpdateState}
              />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-indigo-900 font-bold">ការបង្ហាញ៖</span>
                <button
                  type="button"
                  onClick={() => setShowAllClassesAnnualPlan(false)}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                    !showAllClassesAnnualPlan
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs'
                      : 'bg-sky-50 text-indigo-900 border border-sky-200 hover:bg-sky-100'
                  }`}
                >
                  តែថ្នាក់ទី {activeClass?.name}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAllClassesAnnualPlan(true)}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                    showAllClassesAnnualPlan
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs'
                      : 'bg-sky-50 text-indigo-900 border border-sky-200 hover:bg-sky-100'
                  }`}
                >
                  គ្រប់ថ្នាក់ទាំងអស់ ({state.classes.length} ថ្នាក់)
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {subMode === 'model_school_checklist' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleToggleAllStudyPlan(true)}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-medium hover:bg-emerald-100 cursor-pointer"
                  >
                    ដាក់ ✓ មានផែនការសិក្សាទាំងអស់
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAllStudyPlan(false)}
                    className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 cursor-pointer"
                  >
                    ដក ✓ មានផែនការសិក្សា
                  </button>
                </>
              )}
              <MarkdownCopyBar
                state={state}
                section={activeCopySection}
                selectedClassId={activeClass?.id || '10C'}
                selectedMonthId={activeMonth?.id || 'nov'}
              />
            </div>
          </div>
        )}
      </div>

      {/* MODE 0: MONTHLY SCORE BREAKDOWN (EXAM 25 + ATTENDANCE 5 + PERFORMANCE 10 + HOMEWORK 10) & CLASSROOM PERFORMANCE (✓ / ○ / ✗) */}
      {subMode === 'monthly_breakdown' && (
        <div className="space-y-4">
          {/* Compact Controls Bar (No-Print) */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2.5 no-print text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left: Score Weights & Session Count */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                  <span className="font-semibold text-slate-700">ពិន្ទុពេញ៖</span>
                  <label className="inline-flex items-center gap-1">
                    <span>ប្រឡង</span>
                    <input
                      type="number"
                      value={monthlyBreakdownConfig.examMax}
                      onChange={(e) =>
                        updateMonthlyConfig((c) => ({
                          ...c,
                          examMax: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-11 px-1 py-0.5 border border-slate-300 rounded text-center font-bold bg-white"
                    />
                  </label>
                  <span>+</span>
                  <label className="inline-flex items-center gap-1">
                    <span>វត្តមាន</span>
                    <input
                      type="number"
                      value={monthlyBreakdownConfig.attendanceMax}
                      onChange={(e) =>
                        updateMonthlyConfig((c) => ({
                          ...c,
                          attendanceMax: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-10 px-1 py-0.5 border border-slate-300 rounded text-center font-bold bg-white"
                    />
                  </label>
                  <span>+</span>
                  <label className="inline-flex items-center gap-1">
                    <span>សកម្មភាព</span>
                    <input
                      type="number"
                      value={monthlyBreakdownConfig.performanceMax}
                      onChange={(e) =>
                        updateMonthlyConfig((c) => ({
                          ...c,
                          performanceMax: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-10 px-1 py-0.5 border border-slate-300 rounded text-center font-bold bg-white"
                    />
                  </label>
                  <span>+</span>
                  <label className="inline-flex items-center gap-1">
                    <span>កិច្ចការផ្ទះ</span>
                    <input
                      type="number"
                      value={monthlyBreakdownConfig.homeworkMax}
                      onChange={(e) =>
                        updateMonthlyConfig((c) => ({
                          ...c,
                          homeworkMax: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-10 px-1 py-0.5 border border-slate-300 rounded text-center font-bold bg-white"
                    />
                  </label>
                  <span className="font-bold text-indigo-700 ml-1">
                    ={' '}
                    {monthlyBreakdownConfig.examMax +
                      monthlyBreakdownConfig.attendanceMax +
                      monthlyBreakdownConfig.performanceMax +
                      monthlyBreakdownConfig.homeworkMax}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                  <span className="font-semibold text-slate-700">ចំនួនដង/ខែ៖</span>
                  {[2, 3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() =>
                        updateMonthlyConfig((c) => {
                          const auto = generateAutoSessionDatesForMonth(
                            activeClass,
                            activeMonth,
                            cnt,
                            activeAcademicYear
                          );
                          return {
                            ...c,
                            sessionCount: cnt,
                            sessionDates: {
                              ...auto.sessionDates,
                              ...c.sessionDates,
                            },
                            scoringEndDate:
                              c.sessionDates[cnt] || auto.scoringEndDate,
                          };
                        })
                      }
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                        monthlyBreakdownConfig.sessionCount === cnt
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cnt}ដង
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                  <span className="font-semibold text-slate-700">ថ្ងៃបញ្ចប់គណនា៖</span>
                  <input
                    type="date"
                    value={monthlyBreakdownConfig.scoringEndDate}
                    onChange={(e) =>
                      updateMonthlyConfig((c) => ({
                        ...c,
                        scoringEndDate: e.target.value,
                      }))
                    }
                    className="px-2 py-0.5 border border-slate-300 rounded bg-white font-semibold text-slate-900 cursor-pointer"
                  />
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiAutoFillMonthlyDates}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI បំពេញថ្ងៃខែស្វ័យប្រវត្តិ</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinishAndOrganizeAllMonthlyScores}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 font-bold cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>បញ្ចប់ & រៀបចំពិន្ទុសរុប</span>
                </button>
              </div>
            </div>

            {organizedFeedback && (
              <div className="px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{organizedFeedback}</span>
              </div>
            )}
          </div>

          {/* Printable A4 Sheet for Monthly Score Breakdown & Classroom Performance */}
          <div className="bg-white border border-slate-300 rounded-lg p-6 print-container space-y-4 font-khmer-battambang text-black shadow-xs">
            {/* Official Header */}
            <div className="flex justify-between items-start text-xs leading-relaxed">
              <div className="text-left space-y-0.5">
                <div className="font-khmer-moul">{state.schoolInfo.departmentKh}</div>
                <div className="font-khmer-moul">{state.schoolInfo.schoolNameKh}</div>
              </div>
              <div className="text-center space-y-0.5">
                <div className="font-khmer-moul">ព្រះរាជាណាចក្រកម្ពុជា</div>
                <div className="font-khmer-moul">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h2 className="font-khmer-moul text-sm sm:text-base">
                តារាងពិន្ទុប្រចាំខែលម្អិត និង តាមដានសកម្មភាពសិស្សក្នុងថ្នាក់រៀន
              </h2>
              <div className="font-khmer-moul text-xs sm:text-sm">
                ថ្នាក់ទី {activeClass?.name} ·{' '}
                {activeMonth ? formatMonthButtonLabel(activeMonth) : ''} · ឆ្នាំសិក្សា :{' '}
                {formatNumeral(activeAcademicYear, state.useKhmerNumerals)}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold pt-1">
                <div>
                  មុខវិជ្ជា ៖ {state.schoolInfo.subjectNameKh} (ពិន្ទុពេញ{' '}
                  {formatNumeral(
                    monthlyBreakdownConfig.examMax +
                      monthlyBreakdownConfig.attendanceMax +
                      monthlyBreakdownConfig.performanceMax +
                      monthlyBreakdownConfig.homeworkMax,
                    state.useKhmerNumerals
                  )}
                  ៖ ប្រឡង {formatNumeral(monthlyBreakdownConfig.examMax, state.useKhmerNumerals)} + វត្តមាន{' '}
                  {formatNumeral(monthlyBreakdownConfig.attendanceMax, state.useKhmerNumerals)} + សកម្មភាពក្នុងថ្នាក់{' '}
                  {formatNumeral(monthlyBreakdownConfig.performanceMax, state.useKhmerNumerals)} + កិច្ចការផ្ទះ{' '}
                  {formatNumeral(monthlyBreakdownConfig.homeworkMax, state.useKhmerNumerals)})
                </div>
                <div>
                  គណនាពិន្ទុត្រឹមថ្ងៃទី ៖{' '}
                  {formatNumeral(
                    isoToDdMmYyyy(monthlyBreakdownConfig.scoringEndDate),
                    state.useKhmerNumerals
                  )}
                  {monthlyBreakdownConfig.isScoringFinished && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] no-print">
                      ✓ បានបញ្ចប់ការគណនាពិន្ទុ
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-black a4-singleline-table whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-black font-bold">
                    <th rowSpan={2} className="py-1.5 px-1.5 text-center border border-black whitespace-nowrap">
                      ល.រ
                    </th>
                    <th rowSpan={2} className="py-1.5 px-2 text-center border border-black whitespace-nowrap">
                      ឈ្មោះ
                    </th>
                    <th rowSpan={2} className="py-1.5 px-1.5 text-center border border-black whitespace-nowrap">
                      ភេទ
                    </th>
                    <th
                      colSpan={monthlyBreakdownConfig.sessionCount}
                      className="py-1 px-2 text-center border border-black bg-indigo-50/60 whitespace-nowrap"
                    >
                      សកម្មភាពក្នុងថ្នាក់រៀន
                    </th>
                    <th rowSpan={2} className="py-1.5 px-1.5 text-center border border-black bg-emerald-50/50 whitespace-nowrap">
                      សកម្មភាព ({monthlyBreakdownConfig.performanceMax})
                    </th>
                    <th rowSpan={2} className="py-1.5 px-1.5 text-center border border-black bg-sky-50/50 whitespace-nowrap">
                      វត្តមាន ({monthlyBreakdownConfig.attendanceMax})
                    </th>
                    <th rowSpan={2} className="py-1.5 px-1.5 text-center border border-black bg-amber-50/50 whitespace-nowrap">
                      កិច្ចការផ្ទះ ({monthlyBreakdownConfig.homeworkMax})
                    </th>
                    <th rowSpan={2} className="py-1.5 px-1.5 text-center border border-black bg-purple-50/50 whitespace-nowrap">
                      ប្រឡង ({monthlyBreakdownConfig.examMax})
                    </th>
                    <th rowSpan={2} className="py-1.5 px-1.5 text-center border border-black bg-slate-100 whitespace-nowrap">
                      ពិន្ទុសរុប (
                      {monthlyBreakdownConfig.examMax +
                        monthlyBreakdownConfig.attendanceMax +
                        monthlyBreakdownConfig.performanceMax +
                        monthlyBreakdownConfig.homeworkMax}
                      )
                    </th>
                    <th rowSpan={2} className="py-1.5 px-1.5 text-center border border-black whitespace-nowrap">
                      ចំ.ថ្នាក់
                    </th>
                    <th rowSpan={2} className="py-1.5 px-1.5 text-center border border-black whitespace-nowrap">
                      និទ្ទេស
                    </th>
                  </tr>
                  <tr className="bg-slate-50 text-black font-bold">
                    {Array.from(
                      { length: monthlyBreakdownConfig.sessionCount },
                      (_, i) => i + 1
                    ).map((sIdx) => {
                      const sIso = monthlyBreakdownConfig.sessionDates[sIdx] || '';
                      const shortDateLabel = sIso
                        ? isoToDdMmYyyy(sIso).slice(0, 5)
                        : `${String((sIdx - 1) * 7 + 2).padStart(2, '0')}/11`;
                      const isAfterCutoff =
                        Boolean(monthlyBreakdownConfig.scoringEndDate) &&
                        Boolean(sIso) &&
                        sIso > monthlyBreakdownConfig.scoringEndDate;
                      return (
                        <th
                          key={sIdx}
                          className={`py-1 px-1 text-center border border-black whitespace-nowrap ${
                            isAfterCutoff ? 'opacity-50 bg-slate-100' : ''
                          }`}
                        >
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
                              title="ចុចប្តូរថ្ងៃខែ"
                              className="w-5 h-5 p-0 text-[10px] border border-slate-300 rounded bg-white cursor-pointer no-print opacity-75 hover:opacity-100"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-0.5 mt-0.5 no-print">
                            <button
                              type="button"
                              onClick={() => handleBatchFillSessionMark(sIdx, 'good')}
                              title="ដាក់ ✓ ទាំងអស់ក្នុងជួរឈរនេះ"
                              className="px-1 py-0 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[9px] font-bold cursor-pointer"
                            >
                              全✓
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBatchFillSessionMark(sIdx, 'half')}
                              title="ដាក់ ○ ទាំងអស់ក្នុងជួរឈរនេះ"
                              className="px-1 py-0 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 text-[9px] font-bold cursor-pointer"
                            >
                              全○
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {monthlyBreakdownRows.map((row, idx) => (
                    <tr key={row.studentId} className="hover:bg-slate-50/80 whitespace-nowrap">
                      <td className="py-1 px-1.5 text-center border border-black font-mono whitespace-nowrap">
                        {formatNumeral(idx + 1, state.useKhmerNumerals)}
                      </td>
                      <td className="py-1 px-2 border border-black font-medium whitespace-nowrap">
                        {row.name}
                      </td>
                      <td className="py-1 px-1.5 text-center border border-black whitespace-nowrap">
                        {row.gender === 'F' ? 'ស' : 'ប'}
                      </td>

                      {/* Classroom Performance Marks (✓ / ○ / ✗) */}
                      {Array.from(
                        { length: monthlyBreakdownConfig.sessionCount },
                        (_, i) => i + 1
                      ).map((sIdx) => {
                        const mark = row.performanceMarks[sIdx] || '';
                        return (
                          <td
                            key={sIdx}
                            className="py-1 px-1 text-center border border-black align-middle"
                          >
                            <div className="flex items-center justify-center gap-1 no-print">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetPerformanceMark(
                                    row.studentId,
                                    sIdx,
                                    mark === 'good' ? '' : 'good'
                                  )
                                }
                                title="ល្អ (打钩 ✓ = 满分)"
                                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border transition-colors cursor-pointer ${
                                  mark === 'good'
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-400 hover:text-emerald-700'
                                }`}
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetPerformanceMark(
                                    row.studentId,
                                    sIdx,
                                    mark === 'half' ? '' : 'half'
                                  )
                                }
                                title="ល្អពាក់កណ្តាល (打圈 ○ = 半分)"
                                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border transition-colors cursor-pointer ${
                                  mark === 'half'
                                    ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-amber-400 hover:text-amber-700'
                                }`}
                              >
                                ○
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetPerformanceMark(
                                    row.studentId,
                                    sIdx,
                                    mark === 'bad' ? '' : 'bad'
                                  )
                                }
                                title="មិនល្អ (打叉 ✗ = 0分)"
                                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border transition-colors cursor-pointer ${
                                  mark === 'bad'
                                    ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-rose-400 hover:text-rose-700'
                                }`}
                              >
                                ✗
                              </button>
                            </div>
                            <span
                              onClick={() => handleCyclePerformanceMark(row.studentId, sIdx)}
                              className="hidden print:inline-block font-bold text-sm"
                            >
                              {mark === 'good'
                                ? '✓'
                                : mark === 'half'
                                ? '○'
                                : mark === 'bad'
                                ? '✗'
                                : ''}
                            </span>
                          </td>
                        );
                      })}

                      {/* 1. Classroom Performance Score (10 pts) */}
                      <td className="p-0.5 text-center border border-black bg-emerald-50/20">
                        <input
                          type="text"
                          value={formatNumeral(row.performanceScore, state.useKhmerNumerals)}
                          onChange={(e) => {
                            const val = parseRawScoreInput(
                              e.target.value,
                              monthlyBreakdownConfig.performanceMax
                            );
                            updateStudentMonthlyEntryAndSyncTotal(
                              row.studentId,
                              (prevEntry) => ({
                                ...prevEntry,
                                performanceScoreOverride:
                                  typeof val === 'number' ? val : null,
                                totalScoreOverride: null,
                              })
                            );
                          }}
                          className="w-full py-1 px-1 text-center font-mono font-bold text-emerald-900 bg-transparent rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </td>

                      {/* 2. Attendance Score (5 pts) */}
                      <td className="p-0.5 text-center border border-black bg-sky-50/20">
                        <input
                          type="text"
                          value={formatNumeral(row.attendanceScore, state.useKhmerNumerals)}
                          onChange={(e) => {
                            const val = parseRawScoreInput(
                              e.target.value,
                              monthlyBreakdownConfig.attendanceMax
                            );
                            updateStudentMonthlyEntryAndSyncTotal(
                              row.studentId,
                              (prevEntry) => ({
                                ...prevEntry,
                                attendanceScoreOverride:
                                  typeof val === 'number' ? val : null,
                                totalScoreOverride: null,
                              })
                            );
                          }}
                          className="w-full py-1 px-1 text-center font-mono font-bold text-sky-900 bg-transparent rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-600"
                        />
                      </td>

                      {/* 3. Homework Score (10 pts) */}
                      <td className="p-0.5 text-center border border-black bg-amber-50/20">
                        <input
                          type="text"
                          value={formatNumeral(row.homeworkScore, state.useKhmerNumerals)}
                          onChange={(e) => {
                            const val = parseRawScoreInput(
                              e.target.value,
                              monthlyBreakdownConfig.homeworkMax
                            );
                            updateStudentMonthlyEntryAndSyncTotal(
                              row.studentId,
                              (prevEntry) => ({
                                ...prevEntry,
                                homeworkScoreOverride:
                                  typeof val === 'number' ? val : null,
                                totalScoreOverride: null,
                              })
                            );
                          }}
                          className="w-full py-1 px-1 text-center font-mono font-bold text-amber-900 bg-transparent rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                        />
                      </td>

                      {/* 4. Exam Score (25 pts) */}
                      <td className="p-0.5 text-center border border-black bg-purple-50/20">
                        <input
                          type="text"
                          value={
                            row.examScore === null
                              ? ''
                              : formatNumeral(row.examScore, state.useKhmerNumerals)
                          }
                          placeholder="-"
                          onChange={(e) => {
                            const val = parseRawScoreInput(
                              e.target.value,
                              monthlyBreakdownConfig.examMax
                            );
                            updateStudentMonthlyEntryAndSyncTotal(
                              row.studentId,
                              (prevEntry) => ({
                                ...prevEntry,
                                examScore: val,
                                totalScoreOverride: null,
                              })
                            );
                          }}
                          className="w-full py-1 px-1 text-center font-mono font-bold text-purple-950 bg-white border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-600"
                        />
                      </td>

                      {/* 5. Total Monthly Score (50 pts) */}
                      <td className="p-0.5 text-center border border-black bg-slate-100/80">
                        <input
                          type="text"
                          value={
                            row.totalScore === null
                              ? ''
                              : formatNumeral(row.totalScore, state.useKhmerNumerals)
                          }
                          onChange={(e) => {
                            const maxTotal =
                              monthlyBreakdownConfig.examMax +
                              monthlyBreakdownConfig.attendanceMax +
                              monthlyBreakdownConfig.performanceMax +
                              monthlyBreakdownConfig.homeworkMax;
                            const val = parseRawScoreInput(e.target.value, maxTotal);
                            updateStudentMonthlyEntryAndSyncTotal(
                              row.studentId,
                              (prevEntry) => ({
                                ...prevEntry,
                                totalScoreOverride:
                                  typeof val === 'number' ? val : null,
                              })
                            );
                          }}
                          className="w-full py-1 px-1 text-center font-mono font-extrabold text-slate-950 bg-transparent rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </td>

                      {/* Rank */}
                      <td className="py-1.5 px-1.5 text-center border border-black font-mono font-bold">
                        {row.rank !== null
                          ? formatNumeral(row.rank, state.useKhmerNumerals)
                          : '-'}
                      </td>

                      {/* Grade */}
                      <td
                        className={`py-1.5 px-1.5 text-center border border-black font-mono ${getGradeTextStyle(
                          row.grade
                        )}`}
                      >
                        {row.grade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SignatureDateEditor
              state={state}
              onUpdateState={onUpdateState}
              showPrincipalLeft={true}
            />
          </div>
        </div>
      )}

      {/* MODE 1: CHINESE SUBJECT SCORES SPREADSHEET */}
      {subMode === 'chinese_scores' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 print-container space-y-4 font-khmer-battambang">
          <div className="grid grid-cols-2 gap-4 items-start text-xs">
            <div className="space-y-1">
              <div className="font-khmer-battambang font-bold text-xs text-slate-900">
                {state.schoolInfo.departmentKh}
              </div>
              <div className="font-khmer-moul text-xs text-slate-900">
                {state.schoolInfo.schoolNameKh}
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="font-khmer-moul text-sm text-slate-900 text-center sm:text-right">
                ព្រះរាជាណាចក្រកម្ពុជា
              </div>
              <div className="font-khmer-moul text-xs text-slate-800 text-center sm:text-right">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </div>
              <div className="pt-2">
                មុខវិជ្ជា៖ <strong>{state.schoolInfo.subjectNameKh}</strong> (ពិន្ទុពេញ{' '}
                {formatNumeral(classMaxScore, state.useKhmerNumerals)})
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="font-khmer-moul text-base text-slate-900">
              បញ្ជីស្រង់ពិន្ទុសិស្សថ្នាក់ទី {activeClass?.name}
            </h2>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">
              ឆ្នាំសិក្សា{' '}
              {formatNumeral(activeAcademicYear, state.useKhmerNumerals)}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 py-1">
            <span>អ្នកគ្រូ {state.schoolInfo.teacherName}</span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-semibold">
                  <th
                    rowSpan={2}
                    className="border border-slate-300 py-2 px-2.5 text-center w-10"
                  >
                    ល.រ
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-300 py-2 px-3 min-w-[180px]"
                  >
                    គោត្តនាម-នាម
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-300 py-2 px-2 text-center w-14"
                  >
                    ភេទ
                  </th>
                  {displayedMonths.map((m) => (
                    <th
                      key={m.id}
                      className="border border-slate-300 py-1 px-2 text-center font-normal text-slate-600"
                    >
                      ពិន្ទុ
                    </th>
                  ))}
                  <th
                    rowSpan={2}
                    className="border border-slate-300 py-2 px-3 text-center w-24 bg-indigo-50/50"
                  >
                    មធ្យមភាគ
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-300 py-2 px-3 text-center w-20 bg-indigo-50/50"
                  >
                    ចំ.ថ្នាក់
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-300 py-2 px-2.5 text-center w-16 bg-indigo-50/50"
                  >
                    និទ្ទេស
                  </th>
                </tr>
                <tr className="bg-slate-50 text-slate-900 font-bold">
                  {displayedMonths.map((m) => (
                    <th
                      key={m.id}
                      className="border border-slate-300 py-1.5 px-2 text-center min-w-[78px] whitespace-nowrap"
                    >
                      {m.nameKh.replace(/^ខែ\s*/g, '').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {computedRows.map((row, rIdx) => (
                  <tr key={row.studentId} className="hover:bg-slate-50/80">
                    <td className="border border-slate-300 py-1.5 px-2.5 text-center font-mono tabular-nums text-slate-600">
                      {formatNumeral(rIdx + 1, state.useKhmerNumerals)}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-3 font-medium text-slate-900">
                      {row.name}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2 text-center">
                      {row.gender === 'F' ? 'ស' : 'ប'}
                    </td>

                    {displayedMonths.map((m, cIdx) => {
                      const val = row.monthScores[m.id];
                      const displayVal =
                        val === null || val === undefined ? '' : String(val);
                      return (
                        <td
                          key={m.id}
                          className="border border-slate-300 p-0 focus-within:ring-2 focus-within:ring-indigo-600 relative"
                        >
                          <input
                            ref={(el) => {
                              inputRefs.current[`${rIdx}-${cIdx}`] = el;
                            }}
                            type="text"
                            inputMode="decimal"
                            value={displayVal}
                            placeholder="-"
                            onChange={(e) =>
                              handleScoreCellChange(
                                row.studentId,
                                m.id,
                                e.target.value
                              )
                            }
                            onKeyDown={(e) => handleKeyDown(e, rIdx, cIdx)}
                            onPaste={(e) => handlePaste(e, rIdx, cIdx)}
                            className="w-full h-8 px-2 text-center font-mono tabular-nums font-semibold text-xs bg-transparent focus:outline-none focus:bg-indigo-50/40"
                          />
                        </td>
                      );
                    })}

                    <td className="border border-slate-300 py-1.5 px-3 text-center font-mono tabular-nums font-bold text-slate-900 bg-slate-50/60">
                      {row.averageScore !== null
                        ? formatPaddedScore(row.averageScore, state.useKhmerNumerals)
                        : '-'}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-3 text-center font-mono tabular-nums font-bold text-indigo-900 bg-slate-50/60">
                      {row.rank !== null
                        ? `${formatPaddedScore(row.rank, state.useKhmerNumerals)}${
                            row.isTied ? '=' : ''
                          }`
                        : '-'}
                    </td>
                    <td
                      className={`border border-slate-300 py-1.5 px-2.5 text-center font-mono bg-slate-50/60 ${getGradeTextStyle(
                        row.grade
                      )}`}
                    >
                      {row.grade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-xs">
            <div className="font-semibold text-slate-800">
              សិស្សសរុប{' '}
              {formatNumeral(gradeDist.totalActive, state.useKhmerNumerals)} នាក់
              ស្រី {formatNumeral(gradeDist.femaleActive, state.useKhmerNumerals)}{' '}
              នាក់
            </div>
            <SignatureDateEditor
              state={state}
              onUpdateState={onUpdateState}
              showPrincipalLeft={true}
            />
          </div>
        </div>
      )}

      {/* MODE 2: STUDENT STATISTICS & SKILL/ATTITUDE SCORING (សូចនាករស្តង់ដាសាលាមធ្យមសិក្សាទុតិយភូមិ) */}
      {subMode === 'skill_attitude' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 print-container space-y-4 font-khmer-battambang">
          <div className="grid grid-cols-2 gap-4 items-start text-xs">
            <div className="space-y-1 pt-4">
              <div className="font-bold text-xs text-slate-900">
                {state.schoolInfo.departmentKh}
              </div>
              <div className="font-bold text-xs text-slate-900">
                {state.schoolInfo.schoolNameKh}
              </div>
            </div>
            <div className="text-center space-y-0.5">
              <div className="font-khmer-moul text-sm text-slate-900">
                ព្រះរាជាណាចក្រកម្ពុជា
              </div>
              <div className="font-khmer-moul text-xs text-slate-900">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="font-khmer-moul text-sm text-slate-900">
              សូចនាករស្តង់ដាសាលាមធ្យមសិក្សាទុតិយភូមិ
            </div>
            <div className="font-khmer-moul text-sm text-slate-900">
              តារាងស្ថិតិសិស្សមកពីថ្នាក់ទី {activeClass?.name}
            </div>
            <div className="font-khmer-moul text-xs text-slate-900">
              ឆ្នាំសិក្សា : {activeAcademicYear}
            </div>
            <div className="font-khmer-moul text-xs text-slate-900">
              ខែ {activeMonth.nameKh} មុខវិជ្ជា {state.schoolInfo.subjectNameKh}
            </div>
            <div className="font-khmer-moul text-xs text-slate-900 pt-0.5">
              ការដាក់ពិន្ទុលើ បំណិនសម្បទា និង ចរិយាសម្បទា ( មួយមុខយកម្តង )
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded px-3 py-2 text-xs text-amber-950 no-print flex flex-wrap items-center justify-between gap-2">
            <div>
              <strong>គណនាស្វ័យប្រវត្តិ និងអាចកែដោយដៃ៖</strong>{' '}
              <strong>«រៀនខ្សោយ»</strong> ពិន្ទុប្រចាំខែ ≤{' '}
              {formatNumeral(classMaxScore / 2, true)} (ពេញ{' '}
              {formatNumeral(classMaxScore, true)}ពិន្ទុ) ធីក ✓ ស្វ័យប្រវត្តិ ·{' '}
              <strong>«ឈប់ច្រើន»</strong> ១ខែរៀន ៤ដង មករៀនតែ ១ ឬ ២ដង ធីក ✓ ស្វ័យប្រវត្តិ ·{' '}
              <strong>«បំណិនសម្បទា (ពេញ ៥)»</strong> តាមចំនួនកិច្ចការផ្ទះដែលសិស្សធ្វើ ·{' '}
              <strong>«ចរិយាសម្បទា (ពេញ ៥)»</strong> តាមសកម្មភាពក្នុងថ្នាក់ (✓/○/✗)។
            </div>
            <button
              type="button"
              onClick={handleResetAutoEvaluationForClass}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shrink-0 cursor-pointer"
            >
              គណនាស្វ័យប្រវត្តិឡើងវិញ
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-400 rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold">
                  <th className="border border-slate-400 py-2 px-2 text-center align-middle w-10">
                    ល.រ
                  </th>
                  <th className="border border-slate-400 py-2 px-3 min-w-[175px] text-center align-middle">
                    គោត្តនាម និង នាម
                  </th>
                  <th className="border border-slate-400 py-2 px-2 text-center align-middle w-12">
                    ភេទ
                  </th>
                  <th className="border border-slate-400 py-2 px-2 text-center align-middle w-28">
                    អាយុ
                  </th>
                  <th className="border border-slate-400 py-2 px-2 text-center align-middle w-20">
                    រៀនខ្សោយ
                  </th>
                  <th className="border border-slate-400 py-2 px-2 text-center align-middle w-20">
                    ឈប់ច្រើន
                  </th>
                  <th className="border border-slate-400 py-2 px-2 text-center align-middle w-24">
                    បំណិនសម្បទា
                  </th>
                  <th className="border border-slate-400 py-2 px-2 text-center align-middle w-24">
                    ចរិយាសម្បទា
                  </th>
                  <th className="border border-slate-400 py-2 px-3 min-w-[120px] text-center align-middle">
                    ផ្សេងៗ
                  </th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((stu, idx) => {
                  const ev = resolveStudentStandardEvaluation(
                    state,
                    activeClass.id,
                    activeMonth.id,
                    stu
                  );
                  const isFrequentAbsent = Boolean(
                    ev.absentCount && ev.absentCount.trim() !== '' && ev.absentCount !== '0'
                  );
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80">
                      <td className="border border-slate-400 py-1 px-2 text-center align-middle font-mono">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-400 py-1 px-2.5 align-middle font-medium text-slate-900">
                        {stu.name}
                      </td>
                      <td className="border border-slate-400 py-1 px-2 text-center align-middle">
                        {stu.gender === 'F' ? 'ស' : 'ប'}
                      </td>
                      <td className="border border-slate-400 p-0.5 text-center align-middle">
                        <input
                          type="text"
                          value={stu.dob || ''}
                          placeholder="ថ្ងៃ/ខែ/ឆ្នាំ"
                          onChange={(e) =>
                            handleStudentFieldChange(stu.id, 'dob', e.target.value)
                          }
                          className="w-full px-1.5 py-0.5 text-center font-mono text-xs bg-transparent focus:outline-none focus:bg-indigo-50/40"
                        />
                      </td>
                      <td
                        onClick={() =>
                          handleEvaluationFieldChange(
                            stu.id,
                            'isWeakLearner',
                            !ev.isWeakLearner
                          )
                        }
                        className="border border-slate-400 py-1 px-2 text-center align-middle cursor-pointer select-none font-bold text-slate-900 hover:bg-indigo-50/50"
                        title={`ពិន្ទុ ≤ ${formatNumeral(classMaxScore / 2, true)} ធីក ✓ ស្វ័យប្រវត្តិ (ចុចដើម្បីកែដោយដៃ)`}
                      >
                        {ev.isWeakLearner ? '✓' : ''}
                      </td>
                      <td
                        onClick={() =>
                          handleEvaluationFieldChange(
                            stu.id,
                            'absentCount',
                            isFrequentAbsent ? '' : '✓'
                          )
                        }
                        className="border border-slate-400 py-1 px-2 text-center align-middle cursor-pointer select-none font-bold text-slate-900 hover:bg-indigo-50/50"
                        title="១ខែរៀន ៤ដង មករៀនតែ ១ ឬ ២ដង ធីក ✓ ស្វ័យប្រវត្តិ (ចុចដើម្បីកែដោយដៃ)"
                      >
                        {isFrequentAbsent ? '✓' : ''}
                      </td>
                      <td className="border border-slate-400 p-0.5 text-center align-middle">
                        <input
                          type="number"
                          min="0"
                          max="5"
                          placeholder=""
                          value={ev.skillScore ?? ''}
                          onChange={(e) => {
                            const val =
                              e.target.value === '' ? null : Number(e.target.value);
                            handleEvaluationFieldChange(stu.id, 'skillScore', val);
                          }}
                          className="w-full px-1 py-0.5 text-center font-mono font-bold text-slate-900 bg-transparent focus:outline-none focus:bg-indigo-50/40"
                        />
                      </td>
                      <td className="border border-slate-400 p-0.5 text-center align-middle">
                        <input
                          type="number"
                          min="0"
                          max="5"
                          placeholder=""
                          value={ev.attitudeScore ?? ''}
                          onChange={(e) => {
                            const val =
                              e.target.value === '' ? null : Number(e.target.value);
                            handleEvaluationFieldChange(
                              stu.id,
                              'attitudeScore',
                              val
                            );
                          }}
                          className="w-full px-1 py-0.5 text-center font-mono font-bold text-slate-900 bg-transparent focus:outline-none focus:bg-indigo-50/40"
                        />
                      </td>
                      <td className="border border-slate-400 p-0.5 align-middle">
                        <input
                          type="text"
                          value={ev.remark ?? ''}
                          onChange={(e) =>
                            handleEvaluationFieldChange(
                              stu.id,
                              'remark',
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-0.5 text-xs bg-transparent focus:outline-none focus:bg-indigo-50/40"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-xs space-y-2">
            <div className="font-semibold">
              បញ្ឈប់បញ្ជីត្រឹមចំនួន៖{' '}
              {formatNumeral(checklistStats.activeCount, state.useKhmerNumerals)} នាក់
              ស្រី៖{' '}
              {formatNumeral(checklistStats.femaleCount, state.useKhmerNumerals)} នាក់
            </div>
            <SignatureDateEditor
              state={state}
              onUpdateState={onUpdateState}
              showPrincipalLeft={true}
            />
          </div>
        </div>
      )}

      {/* MODE 3: TEACHER STUDENT CHECKLIST (បញ្ជីរាយនាមសិស្សថ្នាក់ទី ... សម្រាប់គ្រូបង្រៀន) */}
      {subMode === 'model_school_checklist' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 print-container space-y-4 font-khmer-battambang">
          <div className="grid grid-cols-2 gap-4 items-start text-xs">
            <div className="space-y-1 pt-3">
              <div className="font-khmer-moul text-xs text-slate-900">
                {state.schoolInfo.departmentKh}
              </div>
              <div className="font-khmer-moul text-xs text-slate-900">
                {state.schoolInfo.schoolNameKh}
              </div>
            </div>
            <div className="text-center space-y-0.5">
              <div className="font-khmer-moul text-sm text-slate-900">
                ព្រះរាជាណាចក្រកម្ពុជា
              </div>
              <div className="font-khmer-moul text-xs text-slate-900">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="font-khmer-moul text-sm text-slate-900">
              បញ្ជីរាយនាមសិស្សថ្នាក់ទី {activeClass?.name} (ខែ {activeMonth.nameKh})
              សម្រាប់គ្រូបង្រៀន
            </h2>
            <div className="font-khmer-moul text-xs text-slate-900">
              ឆ្នាំសិក្សា {activeAcademicYear}
            </div>
            <div className="font-khmer-moul text-xs text-slate-900">
              មុខវិជ្ជា {state.schoolInfo.subjectNameKh}
            </div>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200 rounded px-3 py-2 text-xs text-indigo-950 no-print">
            <strong>គណនាស្វ័យប្រវត្តិ និងអាចកែដោយដៃ៖</strong>{' '}
            <strong>«បានទទួលកិច្ចការ»</strong> ផ្អែកតាមការដាក់កិច្ចការរបស់គ្រូ និងវត្តមានសិស្សមករៀន ·{' '}
            <strong>«បានធ្វើកិច្ចការ»</strong> ផ្អែកតាមការប្រគល់កិច្ចការផ្ទះឱ្យគ្រូកែ ·{' '}
            <strong>«មានផែនការសិក្សា»</strong> សម្រាប់អ្នកគ្រូចុចធីក (✓) ដោយដៃ ·{' '}
            <strong>«មានសភគោល»</strong> មានសៀវភៅពុម្ពគោល។ គ្រប់ប្រអប់ទាំងអស់អាចចុចកែដោយដៃបាន។
          </div>

          <div className="overflow-x-auto border border-slate-400 rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold">
                  <th className="border border-slate-400 py-2 px-2 text-center w-9">
                    ល.រ
                  </th>
                  <th className="border border-slate-400 py-2 px-2 text-center w-20">
                    អត្តលេខ
                  </th>
                  <th className="border border-slate-400 py-2 px-2.5 min-w-[165px] text-center">
                    គោត្តនាម និងនាម
                  </th>
                  <th className="border border-slate-400 py-2 px-1.5 text-center w-12">
                    ភេទ
                  </th>
                  <th className="border border-slate-400 py-2 px-2 text-center w-28">
                    ថ្ងៃ,ខែ ឆ្នាំកំណើត
                  </th>
                  <th className="border border-slate-400 py-2 px-2 text-center w-24">
                    បានទទួលកិច្ចការ
                  </th>
                  <th className="border border-slate-400 py-2 px-2 text-center w-24">
                    បានធ្វើកិច្ចការ
                  </th>
                  <th className="border border-slate-400 py-2 px-2 text-center w-24">
                    មានផែនការសិក្សា
                  </th>
                  <th className="border border-slate-400 py-2 px-2 text-center w-24">
                    មានសភគោល
                  </th>
                  <th className="border border-slate-400 py-2 px-2 text-center min-w-[100px]">
                    ផ្សេងៗ
                  </th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((stu, idx) => {
                  const ev = resolveStudentStandardEvaluation(
                    state,
                    activeClass.id,
                    activeMonth.id,
                    stu
                  );

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80">
                      <td className="border border-slate-400 py-1 px-2 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-400 p-0.5 text-center">
                        <input
                          type="text"
                          value={stu.studentCode || ''}
                          onChange={(e) =>
                            handleStudentFieldChange(
                              stu.id,
                              'studentCode',
                              e.target.value
                            )
                          }
                          className="w-full px-1 py-0.5 text-center font-mono text-xs bg-transparent focus:outline-none focus:bg-indigo-50/40"
                        />
                      </td>
                      <td className="border border-slate-400 py-1 px-2.5 font-medium text-slate-900">
                        {stu.name}
                      </td>
                      <td className="border border-slate-400 py-1 px-1.5 text-center">
                        {stu.gender === 'F' ? 'ស' : 'ប'}
                      </td>
                      <td className="border border-slate-400 p-0.5 text-center">
                        <input
                          type="text"
                          value={stu.dob || ''}
                          onChange={(e) =>
                            handleStudentFieldChange(stu.id, 'dob', e.target.value)
                          }
                          className="w-full px-1 py-0.5 text-center font-mono text-xs bg-transparent focus:outline-none focus:bg-indigo-50/40"
                        />
                      </td>
                      {(
                        [
                          'receivedHomework',
                          'completedTasks',
                          'hasStudyPlan',
                          'hasTextbook',
                        ] as const
                      ).map((fKey) => {
                        const isChecked = Boolean(ev[fKey]);
                        return (
                          <td
                            key={fKey}
                            onClick={() =>
                              handleEvaluationFieldChange(stu.id, fKey, !isChecked)
                            }
                            className="border border-slate-400 py-1 px-2 text-center cursor-pointer select-none font-bold text-slate-900 hover:bg-indigo-50/50"
                            title="ចុចដើម្បីដាក់ ឬដកសញ្ញា ✓ ដោយដៃ"
                          >
                            {isChecked ? '✓' : ''}
                          </td>
                        );
                      })}
                      <td className="border border-slate-400 p-0.5">
                        <input
                          type="text"
                          value={ev.remark ?? ''}
                          onChange={(e) =>
                            handleEvaluationFieldChange(
                              stu.id,
                              'remark',
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-0.5 text-xs bg-transparent focus:outline-none focus:bg-indigo-50/40"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-3 text-xs space-y-2">
            <div className="space-y-1">
              <div>
                បញ្ឈប់បញ្ជីត្រឹម៖{' '}
                <strong>
                  {formatNumeral(
                    checklistStats.activeCount,
                    state.useKhmerNumerals
                  )}{' '}
                  នាក់
                </strong>{' '}
                ស្រី៖{' '}
                <strong>
                  {formatNumeral(
                    checklistStats.femaleCount,
                    state.useKhmerNumerals
                  )}{' '}
                  នាក់
                </strong>
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

      {/* MODE 4: 1-YEAR TEACHING PLAN / CLASSROOM PLAN (ផែនការបង្រៀន ១ឆ្នាំ ឬផែនការថ្នាក់រៀន — ONE PER CLASS) */}
      {subMode === 'annual_classroom_plan' && (
        <div className="space-y-8">
          {classesToRenderForAnnualPlan.map((cls) => {
            const plan = getResolvedAnnualClassroomPlan(state, cls.id);
            const rosterStudents = state.students.filter(
              (s) => s.classId === cls.id
            );
            const rosterTotal = rosterStudents.length;
            const rosterFemale = rosterStudents.filter(
              (s) => s.gender === 'F'
            ).length;

            return (
              <div
                key={cls.id}
                className="bg-white border border-slate-200 rounded-lg p-6 print-container space-y-4 font-khmer-battambang text-slate-950"
              >
                {/* Official Header matching Attachment 3 */}
                <div className="space-y-1">
                  <div className="text-center space-y-0.5">
                    <div className="font-khmer-moul text-sm text-slate-950">
                      ព្រះរាជាណាចក្រកម្ពុជា
                    </div>
                    <div className="font-khmer-moul text-xs text-slate-950">
                      ជាតិ សាសនា ព្រះមហាក្សត្រ
                    </div>
                  </div>
                  <div className="space-y-0.5 pt-1">
                    <div className="font-khmer-moul text-xs text-slate-950">
                      រាជធានី ភ្នំពេញ
                    </div>
                    <div className="font-khmer-moul text-xs text-slate-950">
                      មន្ទីរអប់រំ យុវជន និងកីឡា
                    </div>
                  </div>
                </div>

                {/* Title with editable Academic Year */}
                <div className="text-center pt-1">
                  <div className="inline-flex flex-wrap items-center justify-center gap-1.5 font-khmer-moul text-sm sm:text-base text-slate-950">
                    <span>ផែនការបង្រៀន ១ឆ្នាំ ឬផែនការថ្នាក់រៀន</span>
                    <input
                      type="text"
                      value={plan.planTitleYearKh}
                      onChange={(e) =>
                        updateAnnualPlanForClass(cls.id, (prev) => ({
                          ...prev,
                          planTitleYearKh: e.target.value,
                        }))
                      }
                      className="w-36 border-b border-dashed border-slate-400 bg-transparent text-center font-khmer-moul text-sm sm:text-base focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* School / Class (auto from attendance sheet) / Homeroom Teacher & Phone (manual) / Score Threshold Lines */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">ឈ្មោះសាលា:</span>
                    <span className="font-semibold">
                      {state.schoolInfo.schoolNameKh}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">ថ្នាក់ទី៖</span>
                      <span className="font-mono font-bold px-2 py-0.5 bg-slate-50 border-b border-slate-300">
                        {cls.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">ចំនួនសិស្សសរុប៖</span>
                      <input
                        type="text"
                        value={plan.totalStudentsOverride ?? String(rosterTotal)}
                        onChange={(e) => {
                          const newTotal = e.target.value;
                          const newTotalNum = parseFloat(newTotal);
                          updateAnnualPlanForClass(cls.id, (prev) => {
                            const nextRows = { ...prev.rows };
                            if (nextRows.TOTAL) {
                              nextRows.TOTAL = {
                                baseline: { count: newTotal, pct: newTotalNum > 0 ? '100' : '0' },
                                sem1Target: { count: newTotal, pct: newTotalNum > 0 ? '100' : '0' },
                                sem1Actual: { count: newTotal, pct: newTotalNum > 0 ? '100' : '0' },
                                sem2Target: { count: newTotal, pct: newTotalNum > 0 ? '100' : '0' },
                                sem2Actual: { count: newTotal, pct: newTotalNum > 0 ? '100' : '0' },
                                yearEndTarget: { count: newTotal, pct: newTotalNum > 0 ? '100' : '0' },
                                yearEndActual: { count: newTotal, pct: newTotalNum > 0 ? '100' : '0' },
                              };
                            }
                            if (!isNaN(newTotalNum) && newTotalNum > 0) {
                              const cols: AnnualPlanColumnKey[] = [
                                'baseline',
                                'sem1Target',
                                'sem1Actual',
                                'sem2Target',
                                'sem2Actual',
                                'yearEndTarget',
                                'yearEndActual',
                              ];
                              ANNUAL_PLAN_GRADES.forEach((rk) => {
                                const r = { ...nextRows[rk] };
                                cols.forEach((ck) => {
                                  const cVal = r[ck]?.count ?? '';
                                  const cNum = parseFloat(cVal);
                                  if (cVal.trim() !== '' && !isNaN(cNum)) {
                                    const rawPct = (cNum / newTotalNum) * 100;
                                    const formattedPct = Number.isInteger(rawPct)
                                      ? String(rawPct)
                                      : rawPct.toFixed(1).replace(/\.0$/, '');
                                    r[ck] = { count: cVal, pct: formattedPct };
                                  }
                                });
                                nextRows[rk] = r;
                              });
                            }
                            return {
                              ...prev,
                              totalStudentsOverride: newTotal,
                              rows: nextRows,
                            };
                          });
                        }}
                        title="ទាញផ្ទាល់ពីបញ្ជីវត្តមានសិស្ស (អាចវាយកែដោយដៃ)"
                        className="w-20 border-b border-dashed border-slate-300 bg-transparent px-1 py-0.5 font-mono font-bold focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">ស្រី៖</span>
                      <input
                        type="text"
                        value={
                          plan.femaleStudentsOverride ?? String(rosterFemale)
                        }
                        onChange={(e) => {
                          const newFem = e.target.value;
                          updateAnnualPlanForClass(cls.id, (prev) => ({
                            ...prev,
                            femaleStudentsOverride: newFem,
                          }));
                        }}
                        title="ទាញផ្ទាល់ពីបញ្ជីវត្តមានសិស្ស (អាចវាយកែដោយដៃ)"
                        className="w-20 border-b border-dashed border-slate-300 bg-transparent px-1 py-0.5 font-mono font-bold focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">
                        ឈ្មោះគ្រូបន្ទុកថ្នាក់៖
                      </span>
                      <input
                        type="text"
                        value={plan.homeroomTeacherName}
                        placeholder="វាយបញ្ចូលឈ្មោះគ្រូបន្ទុកថ្នាក់..."
                        onChange={(e) =>
                          updateAnnualPlanForClass(cls.id, (prev) => ({
                            ...prev,
                            homeroomTeacherName: e.target.value,
                          }))
                        }
                        className="flex-1 border-b border-dashed border-slate-400 bg-transparent px-1 py-0.5 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">លេខទូរសព្ទ៖</span>
                      <input
                        type="text"
                        value={plan.phoneNumber}
                        placeholder="វាយបញ្ចូលលេខទូរសព្ទ..."
                        onChange={(e) =>
                          updateAnnualPlanForClass(cls.id, (prev) => ({
                            ...prev,
                            phoneNumber: e.target.value,
                          }))
                        }
                        className="flex-1 border-b border-dashed border-slate-400 bg-transparent px-1 py-0.5 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Two Score Threshold Lines between Homeroom Teacher/Phone and the Table */}
                  <div className="space-y-1 pt-1">
                    <input
                      type="text"
                      value={plan.scoreRange100Text}
                      onChange={(e) =>
                        updateAnnualPlanForClass(cls.id, (prev) => ({
                          ...prev,
                          scoreRange100Text: e.target.value,
                        }))
                      }
                      className="w-full border-b border-transparent hover:border-slate-300 bg-transparent py-0.5 text-xs focus:outline-none focus:border-indigo-600"
                    />
                    <input
                      type="text"
                      value={plan.scoreRange50Text}
                      onChange={(e) =>
                        updateAnnualPlanForClass(cls.id, (prev) => ({
                          ...prev,
                          scoreRange50Text: e.target.value,
                        }))
                      }
                      className="w-full border-b border-transparent hover:border-slate-300 bg-transparent py-0.5 text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Multi-Header Table matching Attachment 3 */}
                <div className="overflow-x-auto border border-slate-500 rounded">
                  <table className="w-full border-collapse text-xs text-center">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-950">
                        <th
                          colSpan={15}
                          className="border border-slate-500 py-1.5 px-2 text-center"
                        >
                          ចំនួន និងភាគរយ មុខវិជ្ជា ភាសាចិន
                        </th>
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-950">
                        <th
                          rowSpan={2}
                          className="border border-slate-500 py-2 px-2 w-14 text-center"
                        >
                          និទ្ទេស
                        </th>
                        {ANNUAL_PLAN_COL_KEYS.map((col) => (
                          <th
                            key={col.key}
                            colSpan={2}
                            className="border border-slate-500 py-1 px-1.5 text-center leading-tight"
                          >
                            <div>{col.line1}</div>
                            <div>{col.line2}</div>
                          </th>
                        ))}
                      </tr>
                      <tr className="bg-slate-50 font-semibold text-slate-900">
                        {ANNUAL_PLAN_COL_KEYS.map((col) => (
                          <React.Fragment key={col.key}>
                            <th className="border border-slate-500 py-1 px-1 text-center w-12">
                              ចំនួន
                            </th>
                            <th className="border border-slate-500 py-1 px-1 text-center w-12">
                              %
                            </th>
                          </React.Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {([...ANNUAL_PLAN_GRADES, 'TOTAL'] as const).map((rKey) => {
                        const rowObj = plan.rows[rKey];
                        const isTotal = rKey === 'TOTAL';
                        return (
                          <tr
                            key={rKey}
                            className={
                              isTotal
                                ? 'bg-slate-50 font-bold text-slate-950'
                                : 'hover:bg-slate-50/70'
                            }
                          >
                            <td className="border border-slate-500 py-1.5 px-2 text-center font-bold">
                              {isTotal ? 'សរុប' : rKey}
                            </td>
                            {ANNUAL_PLAN_COL_KEYS.map((col) => {
                              const cellPair = rowObj?.[col.key] || {
                                count: '',
                                pct: '',
                              };
                              return (
                                <React.Fragment key={col.key}>
                                  <td className="border border-slate-500 p-0">
                                    <input
                                      type="text"
                                      value={cellPair.count}
                                      placeholder={
                                        !isTotal &&
                                        (col.key === 'sem1Target' ||
                                          col.key === 'sem2Target' ||
                                          col.key === 'yearEndTarget')
                                          ? 'វាយចំនួន'
                                          : ''
                                      }
                                      onChange={(e) =>
                                        handleAnnualPlanCountChange(
                                          cls.id,
                                          rKey,
                                          col.key,
                                          e.target.value
                                        )
                                      }
                                      className="w-full h-7 px-1 text-center font-mono text-xs bg-transparent placeholder:text-[10px] placeholder:text-slate-300 focus:outline-none focus:bg-indigo-50/50"
                                    />
                                  </td>
                                  <td className="border border-slate-500 p-0 bg-slate-50/40">
                                    <input
                                      type="text"
                                      value={cellPair.pct}
                                      onChange={(e) =>
                                        handleAnnualPlanPctChange(
                                          cls.id,
                                          rKey,
                                          col.key,
                                          e.target.value
                                        )
                                      }
                                      title="គណនា % ស្វ័យប្រវត្តិតាមសរុបសិស្សក្នុងថ្នាក់"
                                      className="w-full h-7 px-1 text-center font-mono text-xs bg-transparent focus:outline-none focus:bg-indigo-50/50"
                                    />
                                  </td>
                                </React.Fragment>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Signature Footer with Principal Left & Teacher Right */}
                <div className="pt-2 text-xs">
                  <SignatureDateEditor
                    state={state}
                    onUpdateState={onUpdateState}
                    showPrincipalLeft={true}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
