import React, { useMemo, useState } from 'react';
import {
  AppDatabaseState,
  GradeLetter,
  Language,
  PerformanceAgreementMeta,
} from '../types';
import {
  calculateChineseGradeDistribution,
  calculateClassChineseResults,
  calculateModelSchoolChecklistStats,
  calculateScopeMonthlyPerformanceSummary,
  deriveTeacherDutyReportFromLiveRecords,
  formatNumeral,
  getClassMaxScore,
  sortStudentsByKhmerName,
} from '../utils/calculations';
import { exportToExcelWorkbook } from '../utils/storage';
import { t } from '../utils/i18n';
import { AiGeneratorBar } from './AiGeneratorBar';
import { SignatureDateEditor } from './SignatureDateEditor';
import { MarkdownCopyBar } from './MarkdownDocumentView';
import {
  Award,
  BarChart3,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  RefreshCw,
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

type ReportTab =
  | 'performance_agreement'
  | 'model_school_duty'
  | 'all_classes_stats'
  | 'chinese_certificates';

const GRADES: GradeLetter[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export const ReportsModule: React.FC<Props> = ({
  state,
  lang,
  selectedClassId,
  onSelectClassId,
  selectedMonthId,
  onSelectMonthId,
  onUpdateState,
}) => {
  const [reportTab, setReportTab] = useState<ReportTab>('performance_agreement');
  const [topCertLimit, setTopCertLimit] = useState<number>(3);

  const activeClass =
    state.classes.find((c) => c.id === selectedClassId) || state.classes[0];

  const enabledMonths = useMemo(
    () => state.months.filter((m) => m.enabled),
    [state.months]
  );

  const activeMonth =
    enabledMonths.find((m) => m.id === selectedMonthId) || enabledMonths[0] || state.months[0];

  const allMonthIds = useMemo(() => enabledMonths.map((m) => m.id), [enabledMonths]);

  // Compute live Chinese grade distribution per class and group (8A..10C, G8, G9, G10, ALL)
  const liveDistByScope = useMemo(() => {
    const classDistMap: Record<
      string,
      ReturnType<typeof calculateChineseGradeDistribution>
    > = {};
    const allComputedRows = [];

    for (const cls of state.classes) {
      const stus = sortStudentsByKhmerName(
        state.students.filter((s) => s.classId === cls.id)
      );
      const rows = calculateClassChineseResults(
        stus,
        state.scores[cls.id],
        allMonthIds,
        getClassMaxScore(cls),
        state.gradeThresholds,
        true
      );
      classDistMap[cls.id] = calculateChineseGradeDistribution(rows);
      allComputedRows.push({ gradeLevel: cls.gradeLevel, rows });
    }

    const g8Rows = allComputedRows
      .filter((x) => x.gradeLevel === 8)
      .flatMap((x) => x.rows);
    const g9Rows = allComputedRows
      .filter((x) => x.gradeLevel === 9)
      .flatMap((x) => x.rows);
    const g10Rows = allComputedRows
      .filter((x) => x.gradeLevel === 10)
      .flatMap((x) => x.rows);
    const totalRows = allComputedRows.flatMap((x) => x.rows);

    classDistMap['G8'] = calculateChineseGradeDistribution(g8Rows);
    classDistMap['G9'] = calculateChineseGradeDistribution(g9Rows);
    classDistMap['G10'] = calculateChineseGradeDistribution(g10Rows);
    classDistMap['ALL'] = calculateChineseGradeDistribution(totalRows);

    return classDistMap;
  }, [state.classes, state.students, state.scores, allMonthIds, state.gradeThresholds]);

  const activeClassStudents = useMemo(
    () =>
      sortStudentsByKhmerName(
        state.students.filter((s) => s.classId === activeClass?.id)
      ),
    [state.students, activeClass?.id]
  );

  const activeClassResults = useMemo(
    () =>
      calculateClassChineseResults(
        activeClassStudents,
        state.scores[activeClass?.id],
        allMonthIds,
        getClassMaxScore(activeClass),
        state.gradeThresholds,
        true
      ),
    [
      activeClassStudents,
      state.scores,
      activeClass,
      allMonthIds,
      state.gradeThresholds,
    ]
  );

  const topWinners = useMemo(
    () =>
      [...activeClassResults]
        .filter((r) => r.rank !== null && r.rank <= topCertLimit)
        .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999)),
    [activeClassResults, topCertLimit]
  );

  const checklistStats = useMemo(
    () =>
      calculateModelSchoolChecklistStats(
        activeClassStudents,
        state.standardEvaluations[activeClass?.id]?.[activeMonth?.id]
      ),
    [activeClassStudents, state.standardEvaluations, activeClass?.id, activeMonth?.id]
  );

  const [useScoreDerivedGrades, setUseScoreDerivedGrades] = useState<boolean>(true);

  const monthlyPerfSummary = useMemo(
    () => calculateScopeMonthlyPerformanceSummary(state),
    [state]
  );

  const agreementMeta: PerformanceAgreementMeta = state.performanceAgreementMeta || {
    mainHeadingKh: 'វត្ថុបំណងបំពេញការងារ',
    agreementTitleKh: 'កិច្ចព្រមព្រៀងលទ្ធផល ប្រចាំឆ្នាំ២០២៥ របស់គ្រូបង្រៀន',
    academicPeriodKh: 'ប្រចាំឆ្នាំសិក្សា ២០២៥ - ២០២៦ ចាប់ពីខែ មករា ដល់ ខែ តុលា ឆ្នាំ២០២៦',
    reviewSubtitleKh:
      'ការកំណត់វត្ថុបំណង និងលក្ខណៈវិនិច្ឆ័យបំពេញការងារ សម្រាប់ ការពិនិត្យឡើងវិញ ការអនុវត្តការងារមន្ត្រីឆ្នាំ ២០២៥-២០២៦',
    objective1TitleKh:
      'វត្ថុបំណងទី១៖ លទ្ធផលសិក្សារៀនសូត្ររបស់សិស្សមុខវិជ្ជា ( ភាសាចិន ) ថ្នាក់ទី ៨ ទី៩ និងទី១០',
  };

  const updateAgreementMeta = (patch: Partial<PerformanceAgreementMeta>) => {
    onUpdateState((prev) => ({
      ...prev,
      performanceAgreementMeta: {
        ...agreementMeta,
        ...patch,
      },
    }));
  };

  const liveDerivedDutyReport = useMemo(
    () =>
      deriveTeacherDutyReportFromLiveRecords(
        state,
        activeClass?.id || '8A',
        activeMonth?.id || 'jul'
      ),
    [state, activeClass?.id, activeMonth?.id]
  );

  const currentTaskReport = useMemo(() => {
    const saved = state.teacherTaskReports[activeClass?.id]?.[activeMonth?.id];
    if (saved) {
      return {
        ...liveDerivedDutyReport,
        ...saved,
      };
    }
    return liveDerivedDutyReport;
  }, [state.teacherTaskReports, activeClass?.id, activeMonth?.id, liveDerivedDutyReport]);

  const updateCurrentTaskReport = (patch: Partial<typeof currentTaskReport>) => {
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

  const handleSyncAllTargetsFromMonthlyScores = () => {
    const summaryMap = calculateScopeMonthlyPerformanceSummary(state);
    onUpdateState((prev) => ({
      ...prev,
      performanceTargets: prev.performanceTargets.map((target) => {
        const s = summaryMap[target.scopeId];
        if (!s) return target;
        return {
          ...target,
          totalStudents: s.totalActive,
          femaleStudents: s.femaleActive,
          baselineGrades: s.baselineGrades,
          targetGrades: s.targetGrades,
          studentLearningStatus: s.autoStudentLearningStatus,
          teacherReflection: s.autoTeacherReflection,
        };
      }),
    }));
    setUseScoreDerivedGrades(true);
  };

  const handleTargetReflectionChange = (
    scopeId: string,
    field: 'studentLearningStatus' | 'teacherReflection',
    value: string
  ) => {
    onUpdateState((prev) => ({
      ...prev,
      performanceTargets: prev.performanceTargets.map((item) =>
        item.scopeId === scopeId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAiReflectionResult = (rawData: unknown) => {
    if (!rawData || typeof rawData !== 'object') return;
    const obj = rawData as {
      scopes?: Array<{
        scopeId: string;
        studentLearningStatus?: string;
        teacherReflection?: string;
      }>;
    };
    if (!Array.isArray(obj.scopes)) return;
    const summaryMap = calculateScopeMonthlyPerformanceSummary(state);
    onUpdateState((prev) => ({
      ...prev,
      performanceTargets: prev.performanceTargets.map((target) => {
        const s = summaryMap[target.scopeId];
        const match =
          obj.scopes?.find((item) => item.scopeId === target.scopeId) ||
          (target.scopeId.startsWith('8')
            ? obj.scopes?.find((item) => item.scopeId === 'G8')
            : target.scopeId.startsWith('9')
            ? obj.scopes?.find((item) => item.scopeId === 'G9')
            : target.scopeId.startsWith('10')
            ? obj.scopes?.find((item) => item.scopeId === 'G10')
            : undefined);
        return {
          ...target,
          totalStudents: s ? s.totalActive : target.totalStudents,
          femaleStudents: s ? s.femaleActive : target.femaleStudents,
          baselineGrades: s ? s.baselineGrades : target.baselineGrades,
          targetGrades: s ? s.targetGrades : target.targetGrades,
          studentLearningStatus:
            match?.studentLearningStatus ||
            s?.autoStudentLearningStatus ||
            target.studentLearningStatus,
          teacherReflection:
            match?.teacherReflection ||
            s?.autoTeacherReflection ||
            target.teacherReflection,
        };
      }),
    }));
  };

  return (
    <div className="space-y-5">
      {/* Top Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-2xs no-print">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setReportTab('performance_agreement')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                reportTab === 'performance_agreement'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>១. កិច្ចព្រមព្រៀងលទ្ធផល & ការឆ្លុះបញ្ចាំង</span>
            </button>
            <button
              type="button"
              onClick={() => setReportTab('model_school_duty')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                reportTab === 'model_school_duty'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>២. ភារកិច្ចគ្រូសាលាគំរូ (ថ្នាក់ {activeClass?.name})</span>
            </button>
            <button
              type="button"
              onClick={() => setReportTab('all_classes_stats')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                reportTab === 'all_classes_stats'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>៣. ស្ថិតិនិទ្ទេសគ្រប់ថ្នាក់ (A–F)</span>
            </button>
            <button
              type="button"
              onClick={() => setReportTab('chinese_certificates')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                reportTab === 'chinese_certificates'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>៤. ប័ណ្ណសរសើរភាសាចិន (奖状)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => exportToExcelWorkbook(state)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t(lang, 'exportExcelBtn')}</span>
            </button>
            <MarkdownCopyBar
              state={state}
              section={
                reportTab === 'model_school_duty'
                  ? 'model_school_duty'
                  : 'performance_reflection'
              }
              selectedClassId={activeClass?.id || '8A'}
              selectedMonthId={activeMonth?.id || 'feb'}
            />
          </div>
        </div>

        {(reportTab === 'model_school_duty' || reportTab === 'chinese_certificates') && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
            {reportTab === 'model_school_duty' && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-slate-600 mr-1">ជ្រើសរើសខែ៖</span>
                {enabledMonths
                  .filter((m) => !m.isSemesterExam)
                  .map((m) => (
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

            {reportTab === 'chinese_certificates' && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">ចំនួនសិស្សឆ្នើម៖</span>
                {[3, 5, 10].map((lim) => (
                  <button
                    key={lim}
                    type="button"
                    onClick={() => setTopCertLimit(lim)}
                    className={`px-2.5 py-1 rounded font-mono font-bold cursor-pointer ${
                      topCertLimit === lim
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Top {lim}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* REPORT 1: TEACHER PERFORMANCE AGREEMENT ACROSS ALL 8 CLASSES (PDF 5 STYLE) */}
      {reportTab === 'performance_agreement' && (
        <div className="bg-white border border-slate-300 rounded-lg p-8 max-w-[210mm] mx-auto print-container space-y-6 text-xs leading-relaxed">
          {/* Cover Section matching PDF 5 Page 1 — Editable Manual Input Titles */}
          <div className="text-center space-y-2 border-b border-slate-300 pb-5">
            <div className="text-[11px] text-indigo-700 font-medium no-print">
              ចំណងជើងខាងក្រោមអាចវាយបញ្ចូល ឬកែប្រែដោយដៃផ្ទាល់ (标题可手动输入修改)៖
            </div>
            <input
              type="text"
              value={agreementMeta.mainHeadingKh}
              onChange={(e) => updateAgreementMeta({ mainHeadingKh: e.target.value })}
              className="w-full text-center font-khmer-moul text-base text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5"
              placeholder="វត្ថុបំណងបំពេញការងារ"
            />
            <input
              type="text"
              value={agreementMeta.agreementTitleKh}
              onChange={(e) => updateAgreementMeta({ agreementTitleKh: e.target.value })}
              className="w-full text-center font-khmer-moul text-base text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5"
              placeholder="កិច្ចព្រមព្រៀងលទ្ធផល ប្រចាំឆ្នាំ២០២៥ របស់គ្រូបង្រៀន"
            />
            <input
              type="text"
              value={agreementMeta.academicPeriodKh}
              onChange={(e) => updateAgreementMeta({ academicPeriodKh: e.target.value })}
              className="w-full text-center font-khmer-moul text-xs text-rose-700 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5"
              placeholder="ប្រចាំឆ្នាំសិក្សា ២០២៥ - ២០២៦ ចាប់ពីខែ មករា ដល់ ខែ តុលា ឆ្នាំ២០២៦"
            />
            <input
              type="text"
              value={agreementMeta.reviewSubtitleKh}
              onChange={(e) => updateAgreementMeta({ reviewSubtitleKh: e.target.value })}
              className="w-full text-center font-khmer-moul text-xs text-indigo-950 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-600 focus:outline-none pt-1 py-0.5"
              placeholder="ការកំណត់វត្ថុបំណង និងលក្ខណៈវិនិច្ឆ័យបំពេញការងារ..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 border border-slate-200 rounded">
            <div>
              ឈ្មោះគ្រូបង្រៀន៖ <strong>{state.schoolInfo.teacherName}</strong> · ភេទ៖{' '}
              <strong>ស្រី</strong>
            </div>
            <div>
              ឋានៈមន្ត្រីរាជការ៖{' '}
              <strong className="text-rose-700">{state.schoolInfo.teacherPositionKh}</strong>
            </div>
            <div>
              នាយកសាលារៀន៖ <strong>{state.schoolInfo.principalName}</strong> · ភេទ៖{' '}
              <strong>ប្រុស</strong>
            </div>
            <div>
              សាលារៀន៖ <strong className="text-rose-700">{state.schoolInfo.schoolNameKh}</strong> (
              {state.schoolInfo.provinceKh})
            </div>
          </div>

          {/* Objective 1: Chinese Subject Grade Distribution A-F + Student Learning Status & Teacher Reflection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[11px] text-indigo-700 font-medium no-print">
                ចំណងជើងវត្ថុបំណងទី១ (可手动修改题目)៖
              </label>
              <input
                type="text"
                value={agreementMeta.objective1TitleKh}
                onChange={(e) => updateAgreementMeta({ objective1TitleKh: e.target.value })}
                className="w-full font-bold text-sm text-slate-950 bg-indigo-50/40 border border-indigo-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Monthly Score Auto-Calculation Action Bar */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="space-y-0.5">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-emerald-700" />
                  <span>
                    គណនា «ដើមឆ្នាំ · គ្រោងចុងឆ្នាំ · សម្រេចចុងឆ្នាំ» និង «ស្ថានភាពសិក្សារបស់សិស្ស» ផ្ទាល់ពីបញ្ជីពិន្ទុប្រចាំខែ (根据学生每月分数自动计算)
                  </span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  សរុបរួមគ្រប់ថ្នាក់៖ សិស្សសរុប{' '}
                  <strong>{monthlyPerfSummary['ALL']?.totalActive || 0} នាក់</strong> ·
                  មធ្យមភាគដើមឆ្នាំ{' '}
                  <strong>{monthlyPerfSummary['ALL']?.avgBaselineScore || 0}/50</strong> →
                  សម្រេចចុងឆ្នាំ{' '}
                  <strong>{monthlyPerfSummary['ALL']?.avgActualScore || 0}/50</strong> (ជាប់{' '}
                  <strong>{monthlyPerfSummary['ALL']?.passRateActualPct || 0}%</strong>)
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncAllTargetsFromMonthlyScores}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  គណនា និងបំពេញស្ថានភាពសិស្ស + ការឆ្លុះបញ្ចាំងពីពិន្ទុប្រចាំខែ (一键从每月分数生成)
                </button>
              </div>
            </div>

            <AiGeneratorBar
              taskType="teacher_reflection"
              allowAppend={false}
              titleKh="AI បង្កើតការឆ្លុះបញ្ចាំងរបស់គ្រូបង្រៀន និងកំណត់ត្រាស្ថានភាពសិក្សារបស់សិស្ស (ផ្អែកតាមពិន្ទុប្រចាំខែ)"
              placeholderKh="វាយបញ្ចូលចំណុចសំខាន់ៗ ឬចុច AI បង្កើតតាមគំរូ ដើម្បីវិភាគពីពិន្ទុប្រចាំខែ..."
              defaultPrompt="Based on the monthly Chinese scores (ដើមឆ្នាំ, គ្រោងចុងឆ្នាំ, សម្រេចចុងឆ្នាំ) in contextData, generate detailed Student Learning Status (កំណត់ត្រាស្ថានភាពសិក្សារបស់សិស្ស) and Teacher Pedagogical Reflection (ការឆ្លុះបញ្ចាំងរបស់គ្រូបង្រៀន) for all classes and grades."
              contextData={{
                monthlyPerfSummary,
              }}
              onResult={handleAiReflectionResult}
            />

            {state.performanceTargets.map((target) => {
              const live = liveDistByScope[target.scopeId];
              const scoreSummary = monthlyPerfSummary[target.scopeId];
              const resolvedTotalStudents = scoreSummary
                ? scoreSummary.totalActive
                : target.totalStudents;
              const resolvedFemaleStudents = scoreSummary
                ? scoreSummary.femaleActive
                : target.femaleStudents;

              const resolvedBaselineGrades =
                useScoreDerivedGrades && scoreSummary
                  ? scoreSummary.baselineGrades
                  : target.baselineGrades;
              const resolvedTargetGrades =
                useScoreDerivedGrades && scoreSummary
                  ? scoreSummary.targetGrades
                  : target.targetGrades;
              const resolvedActualGrades = scoreSummary
                ? scoreSummary.actualGrades
                : GRADES.reduce((acc, g) => {
                    acc[g] = {
                      pct: live ? live.grades[g].pctTotal : 0,
                      count: live ? live.grades[g].total : 0,
                    };
                    return acc;
                  }, {} as Record<GradeLetter, { pct: number; count: number }>);

              return (
                <div
                  key={target.scopeId}
                  className="p-4 border border-slate-200 rounded-lg space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-bold">
                      {target.labelKh}{' '}
                      <span>
                        (សរុប {formatNumeral(resolvedTotalStudents, state.useKhmerNumerals)} នាក់, ស្រី{' '}
                        {formatNumeral(resolvedFemaleStudents, state.useKhmerNumerals)} នាក់)
                      </span>
                    </div>
                    {scoreSummary && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 no-print">
                        <span>
                          មធ្យមភាគប្រចាំខែ៖{' '}
                          <strong className="text-indigo-700">
                            {scoreSummary.avgBaselineScore} → {scoreSummary.avgActualScore}/
                            {state.schoolInfo.maxScore}
                          </strong>{' '}
                          (ជាប់ <strong>{scoreSummary.passRateActualPct}%</strong>)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            handleTargetReflectionChange(
                              target.scopeId,
                              'studentLearningStatus',
                              scoreSummary.autoStudentLearningStatus
                            );
                            handleTargetReflectionChange(
                              target.scopeId,
                              'teacherReflection',
                              scoreSummary.autoTeacherReflection
                            );
                          }}
                          className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded font-medium cursor-pointer"
                        >
                          ធ្វើបច្ចុប្បន្នភាពតាមពិន្ទុខែ (按月分更新本班)
                        </button>
                      </div>
                    )}
                  </div>

                  <table className="w-full text-center border-collapse border border-slate-800 text-xs">
                    <thead>
                      <tr className="bg-slate-100 font-bold">
                        <th className="border border-slate-800 py-1 px-2 w-28">និទ្ទេស</th>
                        {GRADES.map((g) => (
                          <th key={g} className="border border-slate-800 py-1 px-2">
                            {g}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-800 py-1 px-2 font-bold text-left">
                          ដើមឆ្នាំ
                        </td>
                        {GRADES.map((g) => (
                          <td
                            key={g}
                            className="border border-slate-800 py-1 px-1.5"
                          >
                            {resolvedBaselineGrades[g].pct}% = {resolvedBaselineGrades[g].count}នាក់
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-slate-800 py-1 px-2 font-bold text-left">
                          គ្រោងចុងឆ្នាំ
                        </td>
                        {GRADES.map((g) => (
                          <td
                            key={g}
                            className="border border-slate-800 py-1 px-1.5 font-medium"
                          >
                            {resolvedTargetGrades[g].pct}% = {resolvedTargetGrades[g].count}នាក់
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-emerald-50/40">
                        <td className="border border-slate-800 py-1 px-2 font-bold text-left">
                          សម្រេចចុងឆ្នាំ
                        </td>
                        {GRADES.map((g) => (
                          <td
                            key={g}
                            className="border border-slate-800 py-1 px-1.5 font-bold text-emerald-950"
                          >
                            {resolvedActualGrades[g].pct}% = {resolvedActualGrades[g].count}នាក់
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>

                  {/* Editable Student Learning Status & Teacher Reflection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold mb-1">
                        កំណត់ត្រាស្ថានភាពសិក្សារបស់សិស្ស (记录学生学习情况 — ផ្អែកតាមពិន្ទុប្រចាំខែ)៖
                      </label>
                      <textarea
                        rows={3}
                        value={
                          target.studentLearningStatus ||
                          scoreSummary?.autoStudentLearningStatus ||
                          ''
                        }
                        onChange={(e) =>
                          handleTargetReflectionChange(
                            target.scopeId,
                            'studentLearningStatus',
                            e.target.value
                          )
                        }
                        placeholder="កត់ត្រាស្ថានភាពសិក្សារបស់សិស្សក្នុងថ្នាក់នេះ..."
                        className="w-full p-2 border border-slate-300 rounded text-xs leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">
                        ការឆ្លុះបញ្ចាំងរបស់គ្រូបង្រៀន (教师教学反思)៖
                      </label>
                      <textarea
                        rows={3}
                        value={
                          target.teacherReflection ||
                          scoreSummary?.autoTeacherReflection ||
                          ''
                        }
                        onChange={(e) =>
                          handleTargetReflectionChange(
                            target.scopeId,
                            'teacherReflection',
                            e.target.value
                          )
                        }
                        placeholder="កត់ត្រាការឆ្លុះបញ្ចាំង និងវិធីសាស្ត្រកែលម្អរបស់គ្រូបង្រៀន..."
                        className="w-full p-2 border border-slate-300 rounded text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Signature Footer with Editable / AI Date */}
          <SignatureDateEditor
            state={state}
            onUpdateState={onUpdateState}
            showPrincipalLeft={true}
          />
        </div>
      )}

      {/* REPORT 2: MODEL SCHOOL TEACHER MONTHLY DUTIES REPORT (PDF 8 PAGE 1 & 3 STYLE) */}
      {reportTab === 'model_school_duty' && (
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
                <strong>{liveDerivedDutyReport.preStudyDetails[0] || '-'}</strong> ·
                កិច្ចការផ្ទះ៖{' '}
                <strong>{liveDerivedDutyReport.homeworkDetails[0] || '-'}</strong> ·
                សិស្សប្រគល់កិច្ចការផ្ទះ៖{' '}
                <strong>
                  {liveDerivedDutyReport.studentHomeworkCountOverride ?? 0}/
                  {checklistStats.activeCount} នាក់
                </strong>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSyncDutyFromWeeklyAndDaily}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              បង្កើតផ្ទាល់ពីទិន្នន័យថ្នាក់ {activeClass.name} (根据真实记录直接生成)
            </button>
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
            onResult={(data) => {
              if (!data || typeof data !== 'object') return;
              const d = data as Partial<typeof currentTaskReport>;
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
            }}
          />

          <div className="bg-white border border-slate-300 rounded-lg p-8 max-w-[210mm] mx-auto print-container space-y-5 text-xs leading-relaxed font-khmer-battambang text-slate-950">
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

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
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

            {/* Section I: Teacher Monthly Tasks */}
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

              <div className="pl-4 space-y-2.5">
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
                  <div className="pl-6 mt-1">
                    <textarea
                      rows={2}
                      value={currentTaskReport.preStudyDetails.join('\n')}
                      onChange={(e) =>
                        updateCurrentTaskReport({
                          preStudyDetails: e.target.value.split('\n'),
                        })
                      }
                      className="w-full bg-transparent focus:outline-none resize-y"
                    />
                  </div>
                </div>

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
                  <div className="pl-6 mt-1">
                    <textarea
                      rows={2}
                      value={currentTaskReport.projectDetails.join('\n')}
                      onChange={(e) =>
                        updateCurrentTaskReport({
                          projectDetails: e.target.value.split('\n'),
                        })
                      }
                      className="w-full bg-transparent focus:outline-none resize-y"
                    />
                  </div>
                </div>

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
                  <div className="pl-6 mt-1">
                    <textarea
                      rows={2}
                      value={currentTaskReport.homeworkDetails.join('\n')}
                      onChange={(e) =>
                        updateCurrentTaskReport({
                          homeworkDetails: e.target.value.split('\n'),
                        })
                      }
                      className="w-full bg-transparent focus:outline-none resize-y"
                    />
                  </div>
                </div>

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

                <div className="flex flex-wrap items-center gap-1">
                  <span>
                    - គ្រូបង្រៀនបានដាក់ពិន្ទុឱ្យសិស្សផ្នែកបំណិនសម្បទា និងចរិយាសម្បទារៀងរាល់ខែចំនួន៖
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={
                      currentTaskReport.scoredSkillAttitudeCountOverride ??
                      checklistStats.scoredSkillAttitudeCount
                    }
                    onChange={(e) =>
                      updateCurrentTaskReport({
                        scoredSkillAttitudeCountOverride:
                          e.target.value === '' ? null : parseInt(e.target.value, 10),
                      })
                    }
                    className="w-12 text-center font-bold underline border-b border-slate-400 bg-transparent focus:outline-none"
                  />
                  <span>នាក់ក្នុង១ខែ (ភ្ជាប់តារាងពិន្ទុ)</span>
                </div>
              </div>
            </div>

            {/* Section II: Student Completion Counts */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-slate-950">II. សិស្ស</h3>
              <div className="pl-4 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1">
                  <span>- សិស្សបានស្វ័យសិក្សាមុនពេលមកជួបគ្រូបង្រៀនចំនួន៖</span>
                  <input
                    type="number"
                    min="0"
                    value={
                      currentTaskReport.studentPreStudyCountOverride ??
                      checklistStats.preStudyCount
                    }
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
                    value={
                      currentTaskReport.studentProjectCountOverride ??
                      checklistStats.completedTasksCount
                    }
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
                    value={
                      currentTaskReport.studentHomeworkCountOverride ??
                      checklistStats.homeworkCount
                    }
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
                    value={
                      currentTaskReport.studentStudyPlanCountOverride ??
                      checklistStats.studyPlanCount
                    }
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

            {/* Section III: Annual Vulnerable Students Tracking */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-slate-950">III. គ្រូត្រូវធ្វើប្រចាំឆ្នាំ</h3>
              <div className="pl-4 flex items-start gap-1">
                <span className="shrink-0">- បញ្ជីឈ្មោះ៖</span>
                <textarea
                  rows={2}
                  value={currentTaskReport.vulnerableStudentsNote}
                  onChange={(e) =>
                    updateCurrentTaskReport({ vulnerableStudentsNote: e.target.value })
                  }
                  className="w-full bg-transparent focus:outline-none resize-y"
                />
              </div>
            </div>

            <SignatureDateEditor
              state={state}
              onUpdateState={onUpdateState}
              showPrincipalLeft={false}
            />
          </div>
        </div>
      )}

      {/* REPORT 3: ALL 8 CLASSES CHINESE GRADE SUMMARY TABLE */}
      {reportTab === 'all_classes_stats' && (
        <div className="bg-white border border-slate-300 rounded-lg p-8 max-w-[210mm] mx-auto print-container space-y-5 text-xs">
          <div className="text-center space-y-1">
            <div className="font-khmer-moul text-sm">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div className="font-khmer-moul text-xs">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            <h2 className="font-khmer-moul text-base text-slate-900 pt-2">
              តារាងសរុបស្ថិតិនិទ្ទេសមុខវិជ្ជាភាសាចិន (A–F) ទាំង ៨ ថ្នាក់ (៨A ដល់ ១០C)
            </h2>
            <div className="text-slate-600">
              {state.schoolInfo.schoolNameKh} · អ្នកគ្រូ {state.schoolInfo.teacherName} · ឆ្នាំសិក្សា{' '}
              {state.schoolInfo.academicYear}
            </div>
          </div>

          <table className="w-full text-center border-collapse border border-slate-800 text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-900">
                <th className="border border-slate-800 py-2 px-2">ថ្នាក់ទី</th>
                <th className="border border-slate-800 py-2 px-2">សិស្សសរុប (ស្រី)</th>
                {GRADES.map((g) => (
                  <th key={g} className="border border-slate-800 py-2 px-2">
                    និទ្ទេស {g} (ស្រី)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.classes.map((cls) => {
                const d = liveDistByScope[cls.id];
                return (
                  <tr key={cls.id}>
                    <td className="border border-slate-800 py-2 px-2 font-bold text-indigo-950">
                      ថ្នាក់ទី {cls.name}
                    </td>
                    <td className="border border-slate-800 py-2 px-2 font-mono">
                      {formatNumeral(d?.totalActive ?? 0, state.useKhmerNumerals)} (ស្រី{' '}
                      {formatNumeral(d?.femaleActive ?? 0, state.useKhmerNumerals)})
                    </td>
                    {GRADES.map((g) => (
                      <td key={g} className="border border-slate-800 py-2 px-2 font-mono">
                        <strong>
                          {formatNumeral(d?.grades[g].total ?? 0, state.useKhmerNumerals)}
                        </strong>{' '}
                        <span className="text-slate-500 text-[10px]">
                          ({formatNumeral(d?.grades[g].female ?? 0, state.useKhmerNumerals)}) ·{' '}
                          {formatNumeral(d?.grades[g].pctTotal ?? 0, state.useKhmerNumerals)}%
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50/60 font-bold text-slate-900">
                <td className="border border-slate-800 py-2 px-2">សរុបរួម ៨ ថ្នាក់</td>
                <td className="border border-slate-800 py-2 px-2 font-mono">
                  {formatNumeral(liveDistByScope['ALL']?.totalActive ?? 0, state.useKhmerNumerals)}{' '}
                  (ស្រី{' '}
                  {formatNumeral(liveDistByScope['ALL']?.femaleActive ?? 0, state.useKhmerNumerals)}
                  )
                </td>
                {GRADES.map((g) => (
                  <td key={g} className="border border-slate-800 py-2 px-2 font-mono">
                    {formatNumeral(
                      liveDistByScope['ALL']?.grades[g].total ?? 0,
                      state.useKhmerNumerals
                    )}{' '}
                    ({formatNumeral(
                      liveDistByScope['ALL']?.grades[g].pctTotal ?? 0,
                      state.useKhmerNumerals
                    )}
                    %)
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* REPORT 4: CHINESE SUBJECT HONOR CERTIFICATES (ប័ណ្ណសរសើរភាសាចិន / 汉语奖状) */}
      {reportTab === 'chinese_certificates' && (
        <div className="space-y-8">
          {topWinners.map((winner, idx) => (
            <div
              key={winner.studentId}
              className={`bg-white border-4 border-double border-amber-700/80 rounded-lg p-10 max-w-[210mm] mx-auto print-container ${
                idx < topWinners.length - 1 ? 'print-page-break' : ''
              }`}
            >
              <div className="border border-amber-600/40 p-8 space-y-5 text-center">
                <div className="space-y-1">
                  <div className="font-khmer-moul text-base text-slate-900">
                    ព្រះរាជាណាចក្រកម្ពុជា
                  </div>
                  <div className="font-khmer-moul text-xs text-slate-800">
                    ជាតិ សាសនា ព្រះមហាក្សត្រ
                  </div>
                </div>

                <div className="text-left text-xs space-y-1">
                  <div className="font-khmer-moul text-xs">{state.schoolInfo.departmentKh}</div>
                  <div className="font-khmer-moul text-xs">{state.schoolInfo.schoolNameKh}</div>
                </div>

                <div className="py-2">
                  <h1 className="font-khmer-moul text-2xl text-amber-800">ប័ណ្ណសរសើរ</h1>
                  <div className="text-sm font-bold text-amber-900 mt-1">
                    汉语学习优秀奖状 · Chinese Language Excellence Award
                  </div>
                </div>

                <div className="text-sm text-slate-800 leading-relaxed max-w-xl mx-auto space-y-3">
                  <p>
                    នាយក <strong>{state.schoolInfo.schoolNameKh}</strong> សូមសរសើរដល់សិស្សឈ្មោះ
                  </p>
                  <div className="font-khmer-moul text-xl text-indigo-950 py-1">
                    {winner.name}{' '}
                    {winner.chineseName ? (
                      <span className="font-sans font-bold text-slate-800 ml-2">
                        ({winner.chineseName})
                      </span>
                    ) : null}
                  </div>
                  <p>
                    សិស្សថ្នាក់ទី <strong>{activeClass?.name}</strong> ក្នុងឆ្នាំសិក្សា{' '}
                    <strong>{state.schoolInfo.academicYear}</strong> ដែលបានខិតខំរៀនសូត្រមុខវិជ្ជា{' '}
                    <strong>ភាសាចិន (汉语)</strong> ទទួលបានចំណាត់ថ្នាក់លេខ{' '}
                    <strong className="text-lg text-rose-700 font-mono">
                      {formatNumeral(winner.rank, state.useKhmerNumerals)}
                    </strong>{' '}
                    និងនិទ្ទេស{' '}
                    <strong className="text-lg text-emerald-700 font-mono">{winner.grade}</strong>{' '}
                    (មធ្យមភាគ{' '}
                    <strong className="font-mono">
                      {formatNumeral(winner.averageScore, state.useKhmerNumerals)} /{' '}
                      {formatNumeral(state.schoolInfo.maxScore, state.useKhmerNumerals)}
                    </strong>
                    )។
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 text-xs">
                  <div>
                    <div className="font-semibold">គ្រូមុខវិជ្ជាភាសាចិន</div>
                    <div className="mt-12 font-semibold text-slate-900">
                      {state.schoolInfo.teacherName}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-600">{activeMonth.lunarDate}</div>
                    <div className="text-[11px] text-slate-600 mb-1">
                      {activeMonth.gregorianDate}
                    </div>
                    <div className="font-semibold">ជ.នាយកវិទ្យាល័យ</div>
                    <div className="mt-10 font-semibold text-slate-900" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
