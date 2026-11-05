import { fromGregorian } from '@thyrith/momentkh';
import {
  AnnualClassroomPlanSheet,
  AppDatabaseState,
  AttendanceStatus,
  ChineseLessonPlan,
  ClassGroup,
  ClassroomPerformanceMark,
  ComputedChineseStudentRow,
  CurriculumPlanItem,
  DailyHomeworkRecord,
  GradeLetter,
  GradeThresholds,
  MonthConfig,
  MonthlyScoreSheetConfig,
  ScoreValue,
  SignatureDateConfig,
  Student,
  StudentMonthlyBreakdownEntry,
  StudentStandardEvaluation,
  TeacherMonthlyTaskReport,
  WeeklyLessonLogItem,
} from '../types';

const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

const khmerCollator =
  typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined'
    ? new Intl.Collator('km', { usage: 'sort', sensitivity: 'variant', numeric: true })
    : null;

function cleanKhmerNameForSort(raw: string | undefined | null): string {
  return String(raw || '')
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compare two Khmer student names in standard Cambodian alphabetical order (ពី ក ដល់ អ).
 * Blank/empty names are always placed at the bottom.
 */
export function compareKhmerNames(
  nameA: string | undefined | null,
  nameB: string | undefined | null
): number {
  const a = cleanKhmerNameForSort(nameA);
  const b = cleanKhmerNameForSort(nameB);
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  // Primary check on stripped consonant+subscript+vowel sequence (ignoring shifters ៉ / ៊ and signs)
  // so that Khmer consonants ក (U+1780) through អ (U+17A2) and vowels sort strictly from ក to អ
  if (khmerCollator) {
    const cmp = khmerCollator.compare(a, b);
    if (cmp !== 0) return cmp;
  }

  const baseA = a.replace(/[\u17C9-\u17D1\u17DD]/g, '');
  const baseB = b.replace(/[\u17C9-\u17D1\u17DD]/g, '');
  if (baseA !== baseB) {
    return baseA < baseB ? -1 : 1;
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Return a new array of student items sorted from ក to អ by their Khmer full name (គោត្តនាម-នាម).
 */
export function sortStudentsByKhmerName<T extends { name: string }>(
  students: readonly T[]
): T[] {
  return [...students].sort((a, b) => compareKhmerNames(a.name, b.name));
}

/**
 * Sort a single class's students from ក to អ and re-sequence 1-2 digit auto studentCodes (01, 02...)
 * while preserving any 3+ digit real school IDs (e.g. 18660).
 */
export function sortAndNormalizeClassStudents(students: readonly Student[]): Student[] {
  const sorted = sortStudentsByKhmerName(students);
  return sorted.map((stu, idx) => {
    const code = (stu.studentCode || '').trim();
    if (!code || /^\d{1,2}$/.test(code)) {
      return {
        ...stu,
        studentCode: String(idx + 1).padStart(2, '0'),
      };
    }
    return stu;
  });
}

/**
 * Sort all students in the database from ក to អ within each classId.
 */
export function sortAllStudentsInDatabase(students: readonly Student[]): Student[] {
  const byClass = new Map<string, Student[]>();
  for (const stu of students) {
    const list = byClass.get(stu.classId) || [];
    list.push(stu);
    byClass.set(stu.classId, list);
  }
  const result: Student[] = [];
  for (const [, list] of byClass.entries()) {
    result.push(...sortAndNormalizeClassStudents(list));
  }
  return result;
}

/**
 * Convert Arabic digits in a string or number to Khmer digits if enabled
 */
export function formatNumeral(
  value: number | string | null | undefined,
  useKhmer: boolean,
  decimals?: number
): string {
  if (value === null || value === undefined || value === '') return '-';
  let str: string;
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return '-';
    str = decimals !== undefined ? value.toFixed(decimals) : String(value);
  } else {
    str = String(value);
  }
  if (!useKhmer) return str;
  return str.replace(/[0-9]/g, (d) => KHMER_DIGITS[Number(d)]);
}

/**
 * Format 2-digit zero-padded number like in PDF 6 (00, 01, 02 .. 50)
 */
export function formatPaddedScore(
  value: number | string | null | undefined,
  useKhmer: boolean
): string {
  if (value === null || value === undefined || value === '') return '-';
  if (value === 'ABS') return 'ABS';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  const rounded = Math.round(num * 10) / 10;
  const isInt = Math.abs(rounded - Math.round(rounded)) < 1e-4;
  const str = isInt
    ? String(Math.round(rounded)).padStart(2, '0')
    : rounded.toFixed(1);
  return formatNumeral(str, useKhmer);
}

/**
 * Return the full score (ពិន្ទុពេញ) for a given class:
 * - Grade 8 & Grade 9: 50 points (Exam 25 + Attendance 5 + Classroom Performance 10 + Homework 10 = 50)
 * - Grade 10: 100 points (Exam 50 + Attendance 10 + Classroom Performance 20 + Homework 20 = 100)
 */
export function getClassMaxScore(
  cls?: { id?: string; name?: string; gradeLevel?: number } | null
): number {
  if (!cls) return 50;
  if (typeof cls.gradeLevel === 'number' && cls.gradeLevel >= 10) return 100;
  const raw = String(cls.name || cls.id || '')
    .replace(/^.*__/, '')
    .replace(/^ថ្នាក់ទី\s*/, '')
    .replace(/^ថ្នាក់\s*/, '')
    .trim();
  if (/^(10|១០)/.test(raw)) return 100;
  return 50;
}

/**
 * Determine Grade Letter (A-F) from a percentage (0-100) and configurable thresholds
 */
export function getGradeFromPercentage(
  percentage: number | null,
  thresholds: GradeThresholds
): GradeLetter | '-' {
  if (percentage === null || Number.isNaN(percentage)) return '-';
  const p = Math.round(percentage * 10000) / 10000;
  if (p >= thresholds.A) return 'A';
  if (p >= thresholds.B) return 'B';
  if (p >= thresholds.C) return 'C';
  if (p >= thresholds.D) return 'D';
  if (p >= thresholds.E) return 'E';
  return 'F';
}

/**
 * Calculate a single student's Chinese Subject score summary across selected month IDs.
 * Matches PDF 6 (បញ្ជីស្រង់ពិន្ទុសិស្សមុខវិជ្ជាភាសាចិន):
 * - Each month score is out of `maxScore` (default 50).
 * - Empty (null) is ignored from denominator; 'ABS' counts as 0 in denominator.
 * - Average is rounded to integer or 2 decimals (in PDF 6, integer rounding e.g. (31+34+25+25)/4 = 28.75 -> 29).
 */
export function calculateSingleChineseStudentRow(
  student: Student,
  studentMonthScores: Record<string, ScoreValue> | undefined,
  monthIds: string[],
  maxScore: number,
  thresholds: GradeThresholds,
  roundAverageToInteger = true
): Omit<ComputedChineseStudentRow, 'rank' | 'isTied'> {
  const scoresMap = studentMonthScores || {};
  const monthScores: Record<string, ScoreValue> = {};
  let evaluatedMonthsCount = 0;
  let totalScore = 0;
  const effectiveMax = maxScore > 0 ? maxScore : 50;

  for (const mId of monthIds) {
    const raw = scoresMap[mId] !== undefined ? scoresMap[mId] : null;
    if (raw === null || raw === undefined) {
      monthScores[mId] = null;
      continue;
    }
    if (raw === 'ABS') {
      monthScores[mId] = 'ABS';
      evaluatedMonthsCount += 1;
      continue;
    }
    if (typeof raw === 'number' && !Number.isNaN(raw)) {
      const clamped = Math.max(0, Math.min(effectiveMax, raw));
      monthScores[mId] = clamped;
      totalScore += clamped;
      evaluatedMonthsCount += 1;
    } else {
      monthScores[mId] = null;
    }
  }

  if (evaluatedMonthsCount === 0) {
    return {
      studentId: student.id,
      studentCode: student.studentCode,
      name: student.name,
      chineseName: student.chineseName,
      gender: student.gender,
      dob: student.dob,
      status: student.status,
      note: student.note,
      monthScores,
      evaluatedMonthsCount: 0,
      totalScore: 0,
      averageScore: null,
      percentageScore: null,
      grade: '-',
    };
  }

  const rawAverage = totalScore / evaluatedMonthsCount;
  const averageScore = roundAverageToInteger
    ? Math.round(rawAverage)
    : Math.round(rawAverage * 100) / 100;
  const percentageScore = Math.round(((rawAverage / effectiveMax) * 100) * 100) / 100;
  const grade = getGradeFromPercentage(percentageScore, thresholds);

  return {
    studentId: student.id,
    studentCode: student.studentCode,
    name: student.name,
    chineseName: student.chineseName,
    gender: student.gender,
    dob: student.dob,
    status: student.status,
    note: student.note,
    monthScores,
    evaluatedMonthsCount,
    totalScore: Math.round(totalScore * 100) / 100,
    averageScore,
    percentageScore,
    grade,
  };
}

/**
 * Compute Chinese Subject scores, averages, competition rankings (1, 2, 2, 4), and grades
 * for all students in a given class across one or more months.
 */
export function calculateClassChineseResults(
  classStudents: Student[],
  classScores: Record<string, Record<string, ScoreValue>> | undefined,
  monthIds: string[],
  maxScore: number,
  thresholds: GradeThresholds,
  roundAverageToInteger = true
): ComputedChineseStudentRow[] {
  const unranked = classStudents.map((stu) =>
    calculateSingleChineseStudentRow(
      stu,
      classScores?.[stu.id],
      monthIds,
      maxScore,
      thresholds,
      roundAverageToInteger
    )
  );

  // Rank active students with at least one evaluated score
  // Sort by averageScore (and totalScore as tie-breaker if not integer-rounded, matching PDF 6)
  const evaluated = unranked
    .filter((r) => r.status === 'active' && r.averageScore !== null)
    .sort((a, b) => {
      const diffAvg = (b.averageScore ?? -1) - (a.averageScore ?? -1);
      if (Math.abs(diffAvg) > 1e-4) return diffAvg;
      return b.totalScore - a.totalScore;
    });

  const rankMap = new Map<string, { rank: number; isTied: boolean }>();

  for (let i = 0; i < evaluated.length; i++) {
    const curr = evaluated[i];
    let rank = i + 1;
    if (i > 0) {
      const prev = evaluated[i - 1];
      if (
        Math.abs((curr.averageScore ?? 0) - (prev.averageScore ?? 0)) < 1e-4 &&
        Math.abs(curr.totalScore - prev.totalScore) < 1e-4
      ) {
        rank = rankMap.get(prev.studentId)!.rank;
      }
    }
    rankMap.set(curr.studentId, { rank, isTied: false });
  }

  const rankCounts = new Map<number, number>();
  for (const info of rankMap.values()) {
    rankCounts.set(info.rank, (rankCounts.get(info.rank) || 0) + 1);
  }
  for (const [id, info] of rankMap.entries()) {
    if ((rankCounts.get(info.rank) || 0) > 1) {
      rankMap.set(id, { rank: info.rank, isTied: true });
    }
  }

  return unranked.map((r) => {
    const info = rankMap.get(r.studentId);
    return {
      ...r,
      rank: info ? info.rank : null,
      isTied: info ? info.isTied : false,
    };
  });
}

/**
 * Compute A-F grade distribution (Total & Female counts + percentages) for a set of computed rows
 */
export function calculateChineseGradeDistribution(
  rows: ComputedChineseStudentRow[]
): {
  totalActive: number;
  femaleActive: number;
  totalEvaluated: number;
  femaleEvaluated: number;
  grades: Record<
    GradeLetter,
    { total: number; female: number; pctTotal: number; pctFemale: number }
  >;
} {
  const grades: Record<
    GradeLetter,
    { total: number; female: number; pctTotal: number; pctFemale: number }
  > = {
    A: { total: 0, female: 0, pctTotal: 0, pctFemale: 0 },
    B: { total: 0, female: 0, pctTotal: 0, pctFemale: 0 },
    C: { total: 0, female: 0, pctTotal: 0, pctFemale: 0 },
    D: { total: 0, female: 0, pctTotal: 0, pctFemale: 0 },
    E: { total: 0, female: 0, pctTotal: 0, pctFemale: 0 },
    F: { total: 0, female: 0, pctTotal: 0, pctFemale: 0 },
  };

  let totalActive = 0;
  let femaleActive = 0;
  let totalEvaluated = 0;
  let femaleEvaluated = 0;

  for (const r of rows) {
    if (r.status !== 'active') continue;
    totalActive += 1;
    if (r.gender === 'F') femaleActive += 1;

    if (r.grade !== '-') {
      totalEvaluated += 1;
      grades[r.grade].total += 1;
      if (r.gender === 'F') {
        femaleEvaluated += 1;
        grades[r.grade].female += 1;
      }
    }
  }

  for (const g of ['A', 'B', 'C', 'D', 'E', 'F'] as GradeLetter[]) {
    grades[g].pctTotal =
      totalEvaluated > 0 ? Math.round((grades[g].total / totalEvaluated) * 100) : 0;
    grades[g].pctFemale =
      femaleEvaluated > 0 ? Math.round((grades[g].female / femaleEvaluated) * 100) : 0;
  }

  return {
    totalActive,
    femaleActive,
    totalEvaluated,
    femaleEvaluated,
    grades,
  };
}

/**
 * Summarize session attendance for a student across 1..10 sessions in a month
 */
export function calculateStudentSessionAttendance(
  sessionMap: Record<number, AttendanceStatus> | undefined
): {
  present: number;
  excused: number;
  unexcused: number;
  late: number;
  totalAbsences: number;
} {
  let present = 0;
  let excused = 0;
  let unexcused = 0;
  let late = 0;

  if (sessionMap) {
    for (const status of Object.values(sessionMap)) {
      if (status === 'P') present += 1;
      else if (status === 'E') excused += 1;
      else if (status === 'U') unexcused += 1;
      else if (status === 'L') late += 1;
    }
  }

  return {
    present,
    excused,
    unexcused,
    late,
    totalAbsences: excused + unexcused,
  };
}

/**
 * Dynamically resolve a student's Standard 1 Evaluation (តារាងស្ថិតិសិស្ស & បញ្ជីរាយនាមសិស្សសម្រាប់គ្រូបង្រៀន)
 * by combining live data from:
 *  - Academic scores (ពិន្ទុប្រចាំខែ -> រៀនខ្សោយ, បំណិនសម្បទា)
 *  - Regular attendance (វត្តមាន ៤ ដងក្នុង ១ ខែ -> ឈប់ច្រើន if > 2 absences, បានទទួលកិច្ចការ if present)
 *  - Daily homework submissions (កំណត់ត្រាកិច្ចការផ្ទះ -> បានធ្វើកិច្ចការ if submitted, រៀនខ្សោយ if missing)
 *  - Manual overrides saved by the teacher (manualOverrides)
 */
export function resolveStudentStandardEvaluation(
  state: AppDatabaseState,
  classId: string,
  monthId: string,
  student: Student
): StudentStandardEvaluation {
  const saved = state.standardEvaluations?.[classId]?.[monthId]?.[student.id];
  const overrides = saved?.manualOverrides || {};
  const isDropped =
    student.status === 'dropped' || (student.note || '').includes('ឈប់រៀន');
  const isNeverPresent = (student.note || '').includes('មិនដែលមករៀន');

  const clsObj = state.classes.find((c) => c.id === classId);
  const monthCfg = state.months.find((m) => m.id === monthId);
  const scoreCfg = state.monthlyScoreConfigs?.[classId]?.[monthId];
  const sessionCount = scoreCfg?.sessionCount || 4;
  const maxScore = scoreCfg
    ? scoreCfg.examMax +
      scoreCfg.attendanceMax +
      scoreCfg.performanceMax +
      scoreCfg.homeworkMax
    : getClassMaxScore(clsObj);

  // 1. Attendance in this month (e.g. 4 weekly sessions per month)
  // "ឈប់ច្រើន要根据学生的考勤，如果一个月四次课，他们只来了一次或两次那就打钩"
  const monthAtt =
    state.attendance?.[classId]?.[monthId]?.[student.id] ||
    state.attendance?.[classId]?.['nov']?.[student.id] ||
    {};

  let presentSessions = 0;
  let absentSessions = 0;
  let recordedSessions = 0;
  for (let s = 1; s <= sessionCount; s++) {
    const status = monthAtt[s];
    if (status === 'P' || status === 'L') {
      presentSessions += 1;
      recordedSessions += 1;
    } else if (status === 'E' || status === 'U') {
      absentSessions += 1;
      recordedSessions += 1;
    }
  }
  if (isNeverPresent) {
    presentSessions = 0;
    absentSessions = sessionCount;
    recordedSessions = sessionCount;
  }

  // If a month has 4 classes and student only attended 1 or 2 times (or 0 times, i.e. absentSessions >= 2), mark '✓'
  const isFrequentAbsence =
    !isDropped &&
    (isNeverPresent ||
      absentSessions >= Math.ceil(sessionCount / 2) ||
      (recordedSessions >= 3 && presentSessions <= 2));
  const autoAbsentCount = isFrequentAbsence ? '✓' : '';
  const effectiveAbsentCount = overrides.absentCount
    ? saved?.absentCount === '3' || saved?.absentCount === '4'
      ? '✓'
      : saved?.absentCount ?? ''
    : autoAbsentCount;

  // 2. Homework assignment & submission (កំណត់ត្រាកិច្ចការផ្ទះ)
  // "（បានទទួលកិច្ចការ）的部分要根据我布置作业的哪一天和哪一天哪个学生来上课来算的，比如今天他来上课，我也在今天布置作业，那就在បានទទួលកិច្ចការ自动打钩。បានធ្វើកិច្ចការ根据作业提交来自动生成。"
  const allClassHw = (state.dailyHomeworkRecords || []).filter(
    (r) => r.classId === classId && r.assigned
  );
  const monthMatchedHw = allClassHw.filter((r) => {
    if (!monthCfg || !r.date) return true;
    const dt = new Date(r.date + 'T12:00:00');
    return !Number.isNaN(dt.getTime()) && dt.getMonth() === monthCfg.monthIndex;
  });
  const assignedHwRecords =
    monthMatchedHw.length > 0 ? monthMatchedHw : allClassHw;

  const autoDatesMap =
    scoreCfg?.sessionDates ||
    generateAutoSessionDatesForMonth(clsObj, monthCfg, sessionCount).sessionDates;
  const sheetDayLabels = state.sessionDates?.[classId]?.[monthId] || {};

  // Helper to check if the student attended class on a given homework date (YYYY-MM-DD)
  const didStudentAttendOnDate = (hwDateIso: string): boolean => {
    if (isDropped || isNeverPresent) return false;
    const cleanIso = (hwDateIso || '').trim();
    const dayStr = cleanIso.slice(8, 10);
    const dayNum = parseInt(dayStr, 10);

    // Find matching session index (1..sessionCount)
    let matchedSessionIdx: number | null = null;
    for (let s = 1; s <= sessionCount; s++) {
      if (autoDatesMap[s] === cleanIso) {
        matchedSessionIdx = s;
        break;
      }
      if (dayStr && sheetDayLabels[s] && sheetDayLabels[s].padStart(2, '0') === dayStr) {
        matchedSessionIdx = s;
        break;
      }
    }
    if (matchedSessionIdx === null && !Number.isNaN(dayNum) && dayNum >= 1) {
      matchedSessionIdx = Math.min(
        sessionCount,
        Math.max(1, Math.ceil(dayNum / 7))
      );
    }

    if (matchedSessionIdx !== null) {
      const attStatus = monthAtt[matchedSessionIdx];
      if (attStatus === 'U' || attStatus === 'E') return false;
      if (attStatus === 'P' || attStatus === 'L') return true;
    }

    // If that specific session wasn't marked U/E, check if student attended class in this month
    return presentSessions > 0 || absentSessions < sessionCount;
  };

  let receivedHwCount = 0;
  let submittedHwUnits = 0;
  let submittedHwCount = 0;

  for (const hw of assignedHwRecords) {
    const attendedOnHwDay = didStudentAttendOnDate(hw.date);
    if (attendedOnHwDay) {
      receivedHwCount += 1;
      const subStatus = hw.submissions?.[student.id];
      if (subStatus === 'submitted') {
        submittedHwUnits += 1;
        submittedHwCount += 1;
      } else if (subStatus === 'late') {
        submittedHwUnits += 0.5;
        submittedHwCount += 1;
      }
    }
  }

  const autoReceivedHomework =
    !isDropped && !isNeverPresent && assignedHwRecords.length > 0 && receivedHwCount > 0;
  const effectiveReceivedHomework = overrides.receivedHomework
    ? Boolean(saved?.receivedHomework)
    : autoReceivedHomework;

  const autoCompletedTasks =
    !isDropped &&
    !isNeverPresent &&
    effectiveReceivedHomework &&
    assignedHwRecords.length > 0 &&
    submittedHwCount > 0;
  const effectiveCompletedTasks = overrides.completedTasks
    ? Boolean(saved?.completedTasks)
    : autoCompletedTasks;

  // មានផែនការសិក្សា: left unchecked (false) by default for manual checking
  const effectiveHasStudyPlan = overrides.hasStudyPlan
    ? Boolean(saved?.hasStudyPlan)
    : false;

  // មានសភគោល: has textbook
  const effectiveHasTextbook = overrides.hasTextbook
    ? Boolean(saved?.hasTextbook)
    : !isDropped && !isNeverPresent;

  // 3. Academic score & Skill/Attitude score
  const rawMonthScore = state.scores?.[classId]?.[student.id]?.[monthId];
  let numericScore: number | null =
    typeof rawMonthScore === 'number' ? rawMonthScore : null;
  if (numericScore === null && rawMonthScore !== 'ABS') {
    const stuScores = state.scores?.[classId]?.[student.id] || {};
    const validNums = Object.values(stuScores).filter(
      (v): v is number => typeof v === 'number'
    );
    if (validNums.length > 0) {
      numericScore =
        validNums.reduce((acc, v) => acc + v, 0) / validNums.length;
    }
  }

  // បំណិនសម្បទា (Skill Score, Max 5):
  // "បំណិនសម្បទា 看学生的作业情况，低于布置作业的数量分数也跟这低បំណិនសម្បទា 满分5分"
  const savedBreakdown = state.monthlyScoreBreakdowns?.[classId]?.[monthId]?.[student.id];
  const homeworkMax = scoreCfg?.homeworkMax || 10;

  let autoSkillScore: number | null = null;
  if (isDropped) {
    autoSkillScore = null;
  } else if (isNeverPresent || rawMonthScore === 'ABS') {
    autoSkillScore = 0;
  } else if (
    savedBreakdown?.homeworkScoreOverride !== undefined &&
    savedBreakdown?.homeworkScoreOverride !== null
  ) {
    const ratio = Math.max(
      0,
      Math.min(1, savedBreakdown.homeworkScoreOverride / homeworkMax)
    );
    autoSkillScore = Math.round(ratio * 5);
  } else if (assignedHwRecords.length > 0) {
    const ratio = Math.max(
      0,
      Math.min(1, submittedHwUnits / assignedHwRecords.length)
    );
    autoSkillScore = effectiveCompletedTasks ? Math.round(ratio * 5) : 0;
  } else {
    autoSkillScore = effectiveCompletedTasks ? 5 : 0;
  }

  // ចរិយាសម្បទា (Attitude Score, Max 5):
  // "ចរិយាសម្បទា看他们的表现，表现不好，分数也跟个低（满分5分）。"
  const performanceMax = scoreCfg?.performanceMax || 10;
  let autoAttitudeScore: number | null = null;
  if (isDropped) {
    autoAttitudeScore = null;
  } else if (isNeverPresent || rawMonthScore === 'ABS') {
    autoAttitudeScore = 0;
  } else if (
    savedBreakdown?.performanceScoreOverride !== undefined &&
    savedBreakdown?.performanceScoreOverride !== null
  ) {
    const ratio = Math.max(
      0,
      Math.min(1, savedBreakdown.performanceScoreOverride / performanceMax)
    );
    autoAttitudeScore = Math.round(ratio * 5);
  } else {
    let earnedPerfUnits = 0;
    let perfCount = 0;
    for (let s = 1; s <= sessionCount; s++) {
      const savedMark = savedBreakdown?.performanceMarks?.[s];
      let mark: ClassroomPerformanceMark = savedMark || '';
      if (!mark) {
        const att = monthAtt[s];
        if (att === 'U') mark = 'bad';
        else if (att === 'E' || att === 'L') mark = 'half';
        else mark = 'good';
      }
      if (mark === 'good') {
        earnedPerfUnits += 1;
        perfCount += 1;
      } else if (mark === 'half') {
        earnedPerfUnits += 0.5;
        perfCount += 1;
      } else if (mark === 'bad') {
        earnedPerfUnits += 0;
        perfCount += 1;
      }
    }
    const perfRatio =
      perfCount > 0 ? Math.max(0, Math.min(1, earnedPerfUnits / perfCount)) : 1;
    autoAttitudeScore = Math.round(perfRatio * 5);
  }

  const effectiveSkillScore = overrides.skillScore
    ? saved?.skillScore ?? null
    : autoSkillScore;
  const effectiveAttitudeScore = overrides.attitudeScore
    ? saved?.attitudeScore ?? null
    : autoAttitudeScore;

  // 4. រៀនខ្សោយ:
  // "រៀនខ្សោយ根据学生成绩来打钩，如果他们的成绩低于或等于25（满分50分）就自动打钩。"
  const weakThreshold = maxScore * 0.5; // 25 when maxScore is 50
  const autoIsWeakLearner = isDropped
    ? false
    : isNeverPresent || rawMonthScore === 'ABS'
    ? true
    : numericScore !== null
    ? numericScore <= weakThreshold
    : false;

  const effectiveIsWeakLearner = overrides.isWeakLearner
    ? Boolean(saved?.isWeakLearner)
    : autoIsWeakLearner;

  return {
    skillScore: effectiveSkillScore,
    attitudeScore: effectiveAttitudeScore,
    isWeakLearner: effectiveIsWeakLearner,
    absentCount: effectiveAbsentCount,
    receivedPreStudy: effectiveReceivedHomework,
    receivedHomework: effectiveReceivedHomework,
    completedTasks: effectiveCompletedTasks,
    hasStudyPlan: effectiveHasStudyPlan,
    goodCooperation: effectiveHasTextbook,
    hasTextbook: effectiveHasTextbook,
    readingSpeedCategory: saved?.readingSpeedCategory || '30to50',
    remark: overrides.remark ? saved?.remark ?? '' : saved?.remark || student.note || '',
    manualOverrides: overrides,
  };
}

/**
 * Resolve the 1-Year Teaching Plan / Classroom Plan (ផែនការបង្រៀន ១ឆ្នាំ ឬផែនការថ្នាក់រៀន) for a class:
 * - ទិន្ន័យមូលដ្ឋាន (baseline): generated from Month 1 (ខែ វិច្ឆិកា / 'nov') scores.
 * - គោលដៅឆមាសទី១ (sem1Target), គោលដៅឆមាសទី២ (sem2Target), គោលដៅបំណាច់ឆ្នាំ (yearEndTarget): manual ចំនួន input -> auto % calculation.
 * - ផលសម្រេចឆមាសទី១ (sem1Actual): generated from ឆមាសទី១ ('sem1') scores -> auto % calculation.
 * - ផលសម្រេចឆមាសទី២ (sem2Actual): generated from ឆមាសទី២ ('sem2') scores -> auto % calculation.
 * - ផលសម្រេចបំណាច់ឆ្នាំ (yearEndActual): generated from ឆមាសទី២ ('sem2') scores -> auto % calculation.
 */
export function getResolvedAnnualClassroomPlan(
  state: AppDatabaseState,
  classId: string
): AnnualClassroomPlanSheet {
  const cls = state.classes.find((c) => c.id === classId) || state.classes[0];
  const classStudents = sortStudentsByKhmerName(
    state.students.filter((s) => s.classId === classId)
  );
  const rosterTotal = classStudents.length;
  const rosterFemale = classStudents.filter((s) => s.gender === 'F').length;

  const existing = state.annualClassroomPlans?.[classId];
  const maxScore = getClassMaxScore(cls);

  // 1. ទិន្ន័យមូលដ្ឋាន (baseline) from first month ខែ វិច្ឆិកា ('nov')
  const novRows = calculateClassChineseResults(
    classStudents,
    state.scores[classId],
    ['nov'],
    maxScore,
    state.gradeThresholds,
    true
  );
  const novDist = calculateChineseGradeDistribution(novRows);

  // 2. ផលសម្រេចឆមាសទី១ (sem1Actual) from ឆមាសទី១ ('sem1' or sem1 months)
  const hasSem1Direct = classStudents.some(
    (s) => typeof state.scores?.[classId]?.[s.id]?.['sem1'] === 'number'
  );
  const sem1Rows = calculateClassChineseResults(
    classStudents,
    state.scores[classId],
    hasSem1Direct ? ['sem1'] : ['nov', 'dec', 'jan', 'feb', 'mar', 'sem1'],
    maxScore,
    state.gradeThresholds,
    true
  );
  const sem1Dist = calculateChineseGradeDistribution(sem1Rows);

  // 3. ផលសម្រេចឆមាសទី២ (sem2Actual) & ផលសម្រេចបំណាច់ឆ្នាំ (yearEndActual) from ឆមាសទី២ ('sem2' or sem2 months)
  const hasSem2Direct = classStudents.some(
    (s) => typeof state.scores?.[classId]?.[s.id]?.['sem2'] === 'number'
  );
  const sem2Rows = calculateClassChineseResults(
    classStudents,
    state.scores[classId],
    hasSem2Direct ? ['sem2'] : ['may', 'jun', 'jul', 'sem2'],
    maxScore,
    state.gradeThresholds,
    true
  );
  const sem2Dist = calculateChineseGradeDistribution(sem2Rows);

  const activeEvaluatedStudents = classStudents.filter(
    (s) => s.status === 'active' && !(s.note || '').includes('មិនដែលមករៀន')
  );
  const defaultTotal =
    rosterTotal > 0
      ? rosterTotal
      : novDist.totalEvaluated > 0
      ? novDist.totalEvaluated
      : activeEvaluatedStudents.length;
  const defaultFemale =
    rosterFemale > 0
      ? rosterFemale
      : novDist.totalEvaluated > 0
      ? novDist.femaleEvaluated
      : activeEvaluatedStudents.filter((s) => s.gender === 'F').length;

  const parsedOverrideTotal = parseInt(
    String(existing?.totalStudentsOverride ?? '').replace(/[០-៩]/g, (ch) =>
      String('០១២៣៤៥៦៧៨៩'.indexOf(ch))
    ),
    10
  );
  const parsedOverrideFemale = parseInt(
    String(existing?.femaleStudentsOverride ?? '').replace(/[០-៩]/g, (ch) =>
      String('០១២៣៤៥៦៧៨៩'.indexOf(ch))
    ),
    10
  );

  const effectiveTotalNum = Math.max(
    1,
    !Number.isNaN(parsedOverrideTotal) && parsedOverrideTotal > 0
      ? parsedOverrideTotal
      : defaultTotal || 1
  );

  const calcPct = (countStr: string, denom = effectiveTotalNum): string => {
    const clean = (countStr || '')
      .trim()
      .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)));
    if (clean === '') return '';
    const num = parseFloat(clean);
    if (Number.isNaN(num)) return '';
    return String(Math.round((num / Math.max(1, denom)) * 100));
  };

  const calcCountFromPct = (pctStr: string, denom = effectiveTotalNum): string => {
    const clean = (pctStr || '')
      .trim()
      .replace(/%/g, '')
      .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)));
    if (clean === '') return '';
    const num = parseFloat(clean);
    if (Number.isNaN(num)) return '';
    return String(Math.round((num / 100) * Math.max(1, denom)));
  };

  const resolveAutoOrManualPair = (
    savedPair: { count?: string; pct?: string } | undefined,
    autoCountStr: string,
    denom = effectiveTotalNum
  ): { count: string; pct: string } => {
    const hasManualCount =
      savedPair?.count !== undefined && savedPair.count.trim() !== '';
    const hasManualPct =
      savedPair?.pct !== undefined && savedPair.pct.trim() !== '';
    if (hasManualCount) {
      return {
        count: savedPair!.count!,
        pct: calcPct(savedPair!.count!, effectiveTotalNum),
      };
    }
    if (hasManualPct) {
      return {
        count: calcCountFromPct(savedPair!.pct!, effectiveTotalNum),
        pct: savedPair!.pct!,
      };
    }
    return {
      count: autoCountStr,
      pct: calcPct(autoCountStr, denom),
    };
  };

  // Manual input of ចំនួន for គោលដៅឆមាសទី១, គោលដៅឆមាសទី២, គោលដៅបំណាច់ឆ្នាំ -> always calculate % from whole class student count (effectiveTotalNum)
  const resolveTargetPair = (
    savedPair: { count?: string; pct?: string } | undefined
  ): { count: string; pct: string } => {
    const rawCount = savedPair?.count ?? '';
    const rawPct = savedPair?.pct ?? '';
    if (rawCount.trim() !== '') {
      return {
        count: rawCount,
        pct: calcPct(rawCount, effectiveTotalNum),
      };
    }
    if (rawPct.trim() !== '') {
      return {
        count: calcCountFromPct(rawPct, effectiveTotalNum),
        pct: rawPct,
      };
    }
    return { count: '', pct: '' };
  };

  const grades: GradeLetter[] = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rows = {} as AnnualClassroomPlanSheet['rows'];

  const baseDenom = effectiveTotalNum;
  const s1Denom = effectiveTotalNum;
  const s2Denom = effectiveTotalNum;

  grades.forEach((g) => {
    const exRow = existing?.rows?.[g];

    // ទិន្ន័យមូលដ្ឋាន: generated from ខែ វិច្ឆិកា ('nov')
    const baseCount = String(novDist.grades[g]?.total ?? 0);

    // ផលសម្រេចឆមាសទី១: generated from ឆមាសទី១ scores
    const s1ActualCount = String(sem1Dist.grades[g]?.total ?? 0);

    // ផលសម្រេចឆមាសទី២ & ផលសម្រេចបំណាច់ឆ្នាំ: generated from ឆមាសទី២ scores
    const s2ActualCount = String(sem2Dist.grades[g]?.total ?? 0);
    const yeActualCount = String(sem2Dist.grades[g]?.total ?? 0);

    rows[g] = {
      baseline: resolveAutoOrManualPair(exRow?.baseline, baseCount, baseDenom),
      sem1Target: resolveTargetPair(exRow?.sem1Target),
      sem1Actual: resolveAutoOrManualPair(exRow?.sem1Actual, s1ActualCount, s1Denom),
      sem2Target: resolveTargetPair(exRow?.sem2Target),
      sem2Actual: resolveAutoOrManualPair(exRow?.sem2Actual, s2ActualCount, s2Denom),
      yearEndTarget: resolveTargetPair(exRow?.yearEndTarget),
      yearEndActual: resolveAutoOrManualPair(exRow?.yearEndActual, yeActualCount, s2Denom),
    };
  });

  const totalDisplay = String(
    !Number.isNaN(parsedOverrideTotal) && parsedOverrideTotal > 0
      ? existing?.totalStudentsOverride
      : defaultTotal || 0
  );
  const femaleDisplay = String(
    !Number.isNaN(parsedOverrideFemale) && parsedOverrideFemale > 0
      ? existing?.femaleStudentsOverride
      : defaultFemale || 0
  );

  rows.TOTAL = {
    baseline: { count: totalDisplay, pct: '100' },
    sem1Target: { count: totalDisplay, pct: '100' },
    sem1Actual: { count: totalDisplay, pct: '100' },
    sem2Target: { count: totalDisplay, pct: '100' },
    sem2Actual: { count: totalDisplay, pct: '100' },
    yearEndTarget: { count: totalDisplay, pct: '100' },
    yearEndActual: { count: totalDisplay, pct: '100' },
  };

  return {
    classId,
    planTitleYearKh:
      existing?.planTitleYearKh ||
      state.schoolInfo.academicYear ||
      '២០២៦ ~ ២០២៧',
    homeroomTeacherName: existing?.homeroomTeacherName || '',
    phoneNumber: existing?.phoneNumber || '',
    totalStudentsOverride: totalDisplay,
    femaleStudentsOverride: femaleDisplay,
    scoreRange100Text:
      existing?.scoreRange100Text ||
      'កម្រិតពិន្ទុ : Fក្រោម៥០ពិន្ទុ Eពី៥០ ទៅ ៥៩ពិន្ទុ Dពី៦០ ទៅ៦៩ពិន្ទុ Cពី៧០ ទៅ ៧៩ពិន្ទុ Bពី៨០ ទៅ៨៩ពិន្ទុ Aពី៩០ទៅ១០០ពិន្ទុ',
    scoreRange50Text:
      existing?.scoreRange50Text ||
      'កម្រិតពិន្ទុ : Fក្រោមពិន្ទុ២៥ Eពី២៥ ទៅ២៩ពិន្ទុ Dពី៣០ ទៅ៣៤ពិន្ទុ Cពី៣៥ ទៅ៣៩ពិន្ទុ Bពី៤០ ទៅ ៤៤ពិន្ទុ Aពី៤៥ ទៅ ៥០ពិន្ទុ',
    rows,
  };
}

/**
 * Summarize Model School Standard 1 Checklist & Skills/Attitude counts for a class in a month (PDF 7 & PDF 8)
 */
export function calculateModelSchoolChecklistStats(
  classStudents: Student[],
  monthEvals: Record<string, StudentStandardEvaluation> | undefined,
  state?: AppDatabaseState,
  classId?: string,
  monthId?: string
): {
  activeCount: number;
  femaleCount: number;
  scoredSkillAttitudeCount: number;
  preStudyCount: number;
  homeworkCount: number;
  completedTasksCount: number;
  studyPlanCount: number;
  textbookCount: number;
} {
  const active = classStudents.filter((s) => s.status === 'active');
  let scoredSkillAttitudeCount = 0;
  let preStudyCount = 0;
  let homeworkCount = 0;
  let completedTasksCount = 0;
  let studyPlanCount = 0;
  let textbookCount = 0;

  for (const stu of active) {
    const ev =
      state && classId && monthId
        ? resolveStudentStandardEvaluation(state, classId, monthId, stu)
        : monthEvals?.[stu.id];
    if (!ev) continue;
    if (ev.skillScore !== null || ev.attitudeScore !== null) {
      scoredSkillAttitudeCount += 1;
    }
    if (ev.receivedPreStudy) preStudyCount += 1;
    if (ev.receivedHomework) homeworkCount += 1;
    if (ev.completedTasks) completedTasksCount += 1;
    if (ev.hasStudyPlan) studyPlanCount += 1;
    if (ev.hasTextbook) textbookCount += 1;
  }

  return {
    activeCount: active.length,
    femaleCount: active.filter((s) => s.gender === 'F').length,
    scoredSkillAttitudeCount,
    preStudyCount,
    homeworkCount,
    completedTasksCount,
    studyPlanCount,
    textbookCount,
  };
}

const KHMER_LETTERS = ['ក', 'ខ', 'គ', 'ឃ', 'ង', 'ច', 'ឆ', 'ជ'];

/**
 * Strip all Chinese characters, Pinyin/Latin letters, and detailed lists to keep ONLY the concise Khmer lesson title
 * e.g. "第六课 今天几月几号 · មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?" -> "មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?"
 */
export function extractPureKhmerLessonTitle(rawTitle: string): string {
  if (!rawTitle) return 'មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?';
  const stripped = rawTitle
    .split(/[—\-]/)[0]
    .replace(/^[ក-អ]\.\s*/g, '')
    .replace(/លំហាត់សន្ទនា\s*និងសៀវភៅលំហាត់\s*[៖:]?\s*/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/（[^）]*）/g, ' ')
    .replace(/ជំពូកទី[០-៩0-9]+\s*[^\s·]*/g, ' ')
    .replace(/[\u3400-\u9FFF\uF900-\uFAFF]/g, ' ')
    .replace(/[A-Za-z0-9]+/g, ' ')
    .replace(/[①-⑳，。！：；“”‘’【】《》、·៖]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const match = stripped.match(/មេរៀនទី.*/);
  if (match && match[0].trim()) {
    return match[0]
      .trim()
      .replace(/^មេរៀនទី\s*([០-៩0-9]+)\s*៖?\s*/, 'មេរៀនទី$1 ');
  }
  return stripped || 'មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?';
}

export function normalizeTeacherDutyReport(
  saved: TeacherMonthlyTaskReport | undefined,
  liveDerived: TeacherMonthlyTaskReport
): TeacherMonthlyTaskReport {
  if (!saved) return liveDerived;

  const isAlreadyConcisePreStudy = (s: string) =>
    !/[\u3400-\u9FFF\uF900-\uFAFF]/.test(s) &&
    !/[A-Za-z]/.test(s) &&
    s.includes('— ស្វ័យសិក្សាពាក្យថ្មី (ពាក្យថ្មី, ល្បះ)');

  const isAlreadyConciseHomework = (s: string) =>
    !/[\u3400-\u9FFF\uF900-\uFAFF]/.test(s) &&
    !/[A-Za-z]/.test(s) &&
    s.includes('លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖');

  const formatPreStudyList = (list: string[] | undefined): string[] => {
    if (!list || list.length === 0) return liveDerived.preStudyDetails;
    if (list.every(isAlreadyConcisePreStudy)) return list;
    return list.map((item, idx) => {
      const khTitle = extractPureKhmerLessonTitle(item);
      return `${KHMER_LETTERS[idx] || 'ក'}. ${khTitle} — ស្វ័យសិក្សាពាក្យថ្មី (ពាក្យថ្មី, ល្បះ)`;
    });
  };

  const formatHomeworkList = (
    list: string[] | undefined,
    fallback: string[]
  ): string[] => {
    if (!list || list.length === 0) return fallback;
    if (list.every(isAlreadyConciseHomework)) return list;
    return list.map((item, idx) => {
      const khTitle = extractPureKhmerLessonTitle(item);
      return `${KHMER_LETTERS[idx] || 'ក'}. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ ${khTitle}`;
    });
  };

  return {
    ...liveDerived,
    ...saved,
    preStudyDetails: formatPreStudyList(saved.preStudyDetails),
    projectDetails: formatHomeworkList(
      saved.projectDetails,
      liveDerived.projectDetails
    ),
    homeworkDetails: formatHomeworkList(
      saved.homeworkDetails,
      liveDerived.homeworkDetails
    ),
  };
}

/**
 * Automatically derive the Model School Teacher Monthly Duty Report (ភារកិច្ចគ្រូបង្រៀន ស្តង់ដាសាលាគំរូ)
 * directly from the real Weekly Lesson Logs (សម្រង់អត្ថបទប្រចាំសប្តាហ៍) and Daily Homework & Lesson Records
 * (កំណត់ត្រាកិច្ចការផ្ទះ និងកំណត់ត្រាមេរៀនប្រចាំថ្ងៃ).
 * Pure Khmer only, concise format:
 * - ក. មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន? — ស្វ័យសិក្សាពាក្យថ្មី (ពាក្យថ្មី, ល្បះ)
 * - ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?
 */
export function deriveTeacherDutyReportFromLiveRecords(
  state: AppDatabaseState,
  classId: string,
  monthId: string
): TeacherMonthlyTaskReport {
  const activeMonth = state.months.find((m) => m.id === monthId) || state.months[0];
  const classStudents = state.students.filter(
    (s) => s.classId === classId && s.status === 'active'
  );
  const checklistStats = calculateModelSchoolChecklistStats(
    classStudents,
    state.standardEvaluations[classId]?.[monthId]
  );

  const cleanTargetClass = cleanClassDisplayCode(
    state.classes.find((c) => c.id === classId)?.name || classId
  );

  // 1. Gather Weekly Lesson Logs (សម្រង់អត្ថបទប្រចាំសប្តាហ៍) for this class
  const classWeeklyLogs = state.weeklyLogs.filter(
    (w) => cleanClassDisplayCode(w.classId) === cleanTargetClass
  );
  const effectiveWeeklyLogs =
    classWeeklyLogs.length > 0 ? classWeeklyLogs : state.weeklyLogs.slice(0, 2);

  // 2. Gather Daily Homework & Lesson Records (កំណត់ត្រាកិច្ចការផ្ទះ និងកំណត់ត្រាមេរៀនប្រចាំថ្ងៃ) for this class
  const classHwRecords = (state.dailyHomeworkRecords || []).filter(
    (r) => cleanClassDisplayCode(r.classId) === cleanTargetClass
  );

  // Collect unique pure-Khmer lesson titles (prioritizing Daily Homework & Lesson Records, then Weekly Logs)
  const khmerLessonTitles: string[] = [];
  const addKhTitle = (raw?: string) => {
    if (!raw || !raw.trim()) return;
    const kh = extractPureKhmerLessonTitle(raw);
    if (kh && !khmerLessonTitles.includes(kh)) {
      khmerLessonTitles.push(kh);
    }
  };

  classHwRecords.forEach((hw) => addKhTitle(hw.lessonTitle || hw.homeworkTitle));
  effectiveWeeklyLogs.forEach((w) => addKhTitle(w.lessonTitle));

  if (khmerLessonTitles.length === 0) {
    khmerLessonTitles.push('មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?');
  }

  // Build concise pure-Khmer Pre-Study Details, Project Details, and Homework Details
  const preStudyDetails = khmerLessonTitles.map(
    (khTitle, idx) =>
      `${KHMER_LETTERS[idx] || 'ក'}. ${khTitle} — ស្វ័យសិក្សាពាក្យថ្មី (ពាក្យថ្មី, ល្បះ)`
  );

  const projectDetails = khmerLessonTitles.map(
    (khTitle, idx) =>
      `${KHMER_LETTERS[idx] || 'ក'}. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ ${khTitle}`
  );

  const homeworkDetails = khmerLessonTitles.map(
    (khTitle, idx) =>
      `${KHMER_LETTERS[idx] || 'ក'}. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ ${khTitle}`
  );

  const assignedHwRecords = classHwRecords.filter((r) => r.assigned);
  const sourceHwRecords = assignedHwRecords.length > 0 ? assignedHwRecords : classHwRecords;

  // Compute real student submission count from DailyHomeworkRecords
  let submittedCountFromDaily = 0;
  if (sourceHwRecords.length > 0) {
    const latestRec = sourceHwRecords[sourceHwRecords.length - 1];
    classStudents.forEach((stu) => {
      const status = latestRec.submissions?.[stu.id];
      if (status === 'submitted') {
        submittedCountFromDaily += 1;
      }
    });
  } else {
    submittedCountFromDaily = checklistStats.homeworkCount || classStudents.length;
  }

  const baseVulnerableNote =
    'សិស្សក្រីក្រ ជួបការលំបាក សិស្សរងហិង្សាឬមានវិបត្តិផ្លូវចិត្ត សិស្សឈប់ច្រើនម៉ោងខ្លួន សិស្សរៀនខ្សោយមុខវិជ្ជាខ្លួន';

  return {
    monthTitleKh: activeMonth?.nameKh || 'វិច្ឆិកា',
    preStudyAssignedCount: preStudyDetails.length,
    preStudyDetails,
    projectAssignedCount: projectDetails.length,
    projectDetails,
    homeworkAssignedCount: Math.max(1, homeworkDetails.length),
    homeworkDetails,
    homeworkGradedCount: Math.max(1, assignedHwRecords.length || homeworkDetails.length),
    scoredSkillAttitudeCountOverride:
      checklistStats.scoredSkillAttitudeCount > 0
        ? checklistStats.scoredSkillAttitudeCount
        : classStudents.length,
    studentPreStudyCountOverride: submittedCountFromDaily,
    studentProjectCountOverride: submittedCountFromDaily,
    studentHomeworkCountOverride: submittedCountFromDaily,
    studentStudyPlanCountOverride:
      checklistStats.studyPlanCount > 0 ? checklistStats.studyPlanCount : submittedCountFromDaily,
    vulnerableStudentsNote: baseVulnerableNote,
  };
}

export interface ScopeMonthlyPerformanceSummary {
  scopeId: string;
  totalActive: number;
  femaleActive: number;
  baselineGrades: Record<GradeLetter, { pct: number; count: number }>;
  targetGrades: Record<GradeLetter, { pct: number; count: number }>;
  actualGrades: Record<GradeLetter, { pct: number; count: number }>;
  avgBaselineScore: number;
  avgActualScore: number;
  passRateActualPct: number;
  topStudentNames: string[];
  weakStudentNames: string[];
  autoStudentLearningStatus: string;
  autoTeacherReflection: string;
}

/**
 * Compute Beginning-of-Year (ដើមឆ្នាំ), Planned End-of-Year (គ្រោងចុងឆ្នាំ),
 * Achieved End-of-Year (សម្រេចចុងឆ្នាំ), and Student Learning Status directly from
 * the students' monthly Chinese scores (state.scores).
 */
export function calculateScopeMonthlyPerformanceSummary(
  state: AppDatabaseState
): Record<string, ScopeMonthlyPerformanceSummary> {
  const enabledMonths = state.months.filter((m) => m.enabled);
  const allMonthIds = enabledMonths.map((m) => m.id);
  const firstMonthIds = enabledMonths.length > 0 ? [enabledMonths[0].id] : ['nov'];
  const maxScore = state.schoolInfo.maxScore > 0 ? state.schoolInfo.maxScore : 50;
  const thresholds = state.gradeThresholds;
  const GRADES: GradeLetter[] = ['A', 'B', 'C', 'D', 'E', 'F'];

  const buildScopeSummary = (
    scopeId: string,
    scopeLabelKh: string,
    classList: typeof state.classes
  ): ScopeMonthlyPerformanceSummary => {
    const baselineRows: ComputedChineseStudentRow[] = [];
    const targetRows: ComputedChineseStudentRow[] = [];
    const actualRows: ComputedChineseStudentRow[] = [];

    for (const cls of classList) {
      const clsMaxScore = getClassMaxScore(cls);
      const classStudents = state.students.filter(
        (s) => s.classId === cls.id && s.status === 'active'
      );
      const classScoreMap = state.scores[cls.id] || {};

      // 1. Baseline (ដើមឆ្នាំ): Use each student's earliest recorded month score (or first enabled month)
      const earliestScoreMap: Record<string, Record<string, ScoreValue>> = {};
      // 2. Target (គ្រោងចុងឆ្នាំ): Projected improvement over baseline/current
      const projectedScoreMap: Record<string, Record<string, ScoreValue>> = {};

      classStudents.forEach((stu) => {
        const stuScores = classScoreMap[stu.id] || {};
        let earliestVal: number | null = null;
        for (const mId of allMonthIds) {
          const val = stuScores[mId];
          if (typeof val === 'number' && !Number.isNaN(val)) {
            earliestVal = val;
            break;
          }
        }
        // If no score in any month, fallback to a realistic baseline
        if (earliestVal === null) {
          earliestVal = Math.round(clsMaxScore * 0.64);
        }
        // Make baseline slightly lower than full-year average if only 1 month or same scores
        const allNumeric = allMonthIds
          .map((mId) => stuScores[mId])
          .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
        const minMonthly =
          allNumeric.length > 0 ? Math.min(...allNumeric) : earliestVal;

        earliestScoreMap[stu.id] = { [firstMonthIds[0]]: minMonthly };

        const avgNow =
          allNumeric.length > 0
            ? allNumeric.reduce((a, b) => a + b, 0) / allNumeric.length
            : earliestVal;
        const boost = clsMaxScore === 100 ? 7 : 3.5;
        const projectedVal = Math.min(
          clsMaxScore,
          Math.max(Math.round(clsMaxScore * 0.54), Math.round(avgNow + boost))
        );
        projectedScoreMap[stu.id] = { [firstMonthIds[0]]: projectedVal };
      });

      const bRows = calculateClassChineseResults(
        classStudents,
        earliestScoreMap,
        firstMonthIds,
        clsMaxScore,
        thresholds,
        true
      );
      const tRows = calculateClassChineseResults(
        classStudents,
        projectedScoreMap,
        firstMonthIds,
        clsMaxScore,
        thresholds,
        true
      );
      const aRows = calculateClassChineseResults(
        classStudents,
        classScoreMap,
        allMonthIds,
        clsMaxScore,
        thresholds,
        true
      );

      baselineRows.push(...bRows);
      targetRows.push(...tRows);
      actualRows.push(...aRows);
    }

    const bDist = calculateChineseGradeDistribution(baselineRows);
    const tDist = calculateChineseGradeDistribution(targetRows);
    const aDist = calculateChineseGradeDistribution(actualRows);

    const baselineGrades = {} as Record<GradeLetter, { pct: number; count: number }>;
    const targetGrades = {} as Record<GradeLetter, { pct: number; count: number }>;
    const actualGrades = {} as Record<GradeLetter, { pct: number; count: number }>;

    for (const g of GRADES) {
      baselineGrades[g] = {
        pct: bDist.grades[g].pctTotal,
        count: bDist.grades[g].total,
      };
      targetGrades[g] = {
        pct: tDist.grades[g].pctTotal,
        count: tDist.grades[g].total,
      };
      actualGrades[g] = {
        pct: aDist.grades[g].pctTotal,
        count: aDist.grades[g].total,
      };
    }

    const evalBaseline = baselineRows.filter((r) => r.averageScore !== null);
    const evalActual = actualRows.filter((r) => r.averageScore !== null);

    const avgBaselineScore =
      evalBaseline.length > 0
        ? Math.round(
            (evalBaseline.reduce((s, r) => s + (r.averageScore || 0), 0) /
              evalBaseline.length) *
              10
          ) / 10
        : 0;
    const avgActualScore =
      evalActual.length > 0
        ? Math.round(
            (evalActual.reduce((s, r) => s + (r.averageScore || 0), 0) /
              evalActual.length) *
              10
          ) / 10
        : 0;

    const passCountActual =
      actualGrades.A.count +
      actualGrades.B.count +
      actualGrades.C.count +
      actualGrades.D.count +
      actualGrades.E.count;
    const passRateActualPct =
      aDist.totalEvaluated > 0
        ? Math.round((passCountActual / aDist.totalEvaluated) * 100)
        : 0;

    const sortedActual = [...evalActual].sort(
      (a, b) => (b.averageScore || 0) - (a.averageScore || 0)
    );
    const topStudentNames = sortedActual
      .slice(0, 3)
      .map((r) => `${r.name} (${r.chineseName || '-'} ពិន្ទុ ${r.averageScore}/${maxScore})`);
    const weakStudentNames = sortedActual
      .filter((r) => r.grade === 'F' || r.grade === 'E')
      .slice(-3)
      .map((r) => `${r.name} (${r.chineseName || '-'} និទ្ទេស ${r.grade})`);

    const cleanLabel = scopeLabelKh.replace(/^[០-៩0-9]+\)\s*/, '');
    const autoStudentLearningStatus =
      `ផ្អែកតាមបញ្ជីស្រង់ពិន្ទុប្រចាំខែ សិស្ស${cleanLabel} សរុប ${aDist.totalActive}នាក់ (ស្រី ${aDist.femaleActive}នាក់)៖ ` +
      `ពិន្ទុមធ្យមភាគកើនពី ${avgBaselineScore}/${maxScore} (ដើមឆ្នាំ) ដល់ ${avgActualScore}/${maxScore} (សម្រេចចុងឆ្នាំ), អត្រាជាប់មធ្យមភាគ ${passRateActualPct}% ` +
      `(និទ្ទេស A=${actualGrades.A.count}នាក់, B=${actualGrades.B.count}នាក់, C=${actualGrades.C.count}នាក់, D=${actualGrades.D.count}នាក់, E=${actualGrades.E.count}នាក់, F=${actualGrades.F.count}នាក់)។` +
      (topStudentNames.length > 0
        ? ` សិស្សឆ្នើមប្រចាំខែ៖ ${topStudentNames.join(', ')}។`
        : '');

    const autoTeacherReflection =
      actualGrades.F.count > 0 || actualGrades.E.count > 0
        ? `តាមរយៈលទ្ធផលពិន្ទុប្រចាំខែ សិស្សនិទ្ទេស A–C សម្រេចបាន ${
            actualGrades.A.count + actualGrades.B.count + actualGrades.C.count
          }នាក់ ប៉ុន្តែនៅមានសិស្សនិទ្ទេស E និង F ចំនួន ${
            actualGrades.E.count + actualGrades.F.count
          }នាក់ (${weakStudentNames.join(', ') || 'សិស្សរៀនយឺត'})។ គ្រូត្រូវបន្ថែមលំហាត់ស្វ័យសិក្សាពាក្យថ្មី ការហាត់អានភីនអ៊ីន និងតាមដានកិច្ចការផ្ទះប្រចាំថ្ងៃដើម្បីជួយសិស្សឱ្យសម្រេចគោលដៅចុងឆ្នាំ។`
        : `លទ្ធផលពិន្ទុប្រចាំខែបង្ហាញថាសិស្សទាំង ${aDist.totalActive}នាក់ ទទួលបាននិទ្ទេសល្អប្រសើរ (A=${actualGrades.A.count}នាក់, B=${actualGrades.B.count}នាក់, C=${actualGrades.C.count}នាក់)។ គ្រូនឹងបន្តពង្រឹងការសន្ទនាភាសាចិន និងការសរសេរអត្ថបទខ្លីៗឱ្យកាន់តែស្ទាត់ជំនាញ។`;

    return {
      scopeId,
      totalActive: aDist.totalActive,
      femaleActive: aDist.femaleActive,
      baselineGrades,
      targetGrades,
      actualGrades,
      avgBaselineScore,
      avgActualScore,
      passRateActualPct,
      topStudentNames,
      weakStudentNames,
      autoStudentLearningStatus,
      autoTeacherReflection,
    };
  };

  const map: Record<string, ScopeMonthlyPerformanceSummary> = {};
  for (const cls of state.classes) {
    map[cls.id] = buildScopeSummary(cls.id, `ថ្នាក់ទី ${cls.name}`, [cls]);
  }
  map['G8'] = buildScopeSummary(
    'G8',
    'ថ្នាក់ទី៨ សរុប (៨A ៨B ៨C)',
    state.classes.filter((c) => c.gradeLevel === 8)
  );
  map['G9'] = buildScopeSummary(
    'G9',
    'ថ្នាក់ទី៩ សរុប (៩A ៩B ៩C)',
    state.classes.filter((c) => c.gradeLevel === 9)
  );
  map['G10'] = buildScopeSummary(
    'G10',
    'ថ្នាក់ទី១០ សរុប (១០A ១០C)',
    state.classes.filter((c) => c.gradeLevel === 10)
  );
  map['ALL'] = buildScopeSummary(
    'ALL',
    'សរុបរួមគ្រប់ថ្នាក់ (៨A–១០C)',
    state.classes
  );

  return map;
}

export const KHMER_SOLAR_MONTHS = [
  'មករា',
  'កុម្ភៈ',
  'មីនា',
  'មេសា',
  'ឧសភា',
  'មិថុនា',
  'កក្កដា',
  'សីហា',
  'កញ្ញា',
  'តុលា',
  'វិច្ឆិកា',
  'ធ្នូ',
];

export const KHMER_WEEKDAYS_SHORT = [
  'អាទិត្យ',
  'ចន្ទ',
  'អង្គារ',
  'ពុធ',
  'ព្រហស្បតិ៍',
  'សុក្រ',
  'សៅរ៍',
];

export const KHMER_LUNAR_MONTHS = [
  'បុស្ស',
  'មាឃ',
  'ផល្គុន',
  'ចេត្រ',
  'ពិសាខ',
  'ជេស្ឋ',
  'អាសាឍ',
  'ស្រាពណ៍',
  'ភទ្របទ',
  'អស្សុជ',
  'កត្តិក',
  'មិគសិរ',
];

export function isoToDdMmYyyy(iso: string): string {
  const clean = (iso || '').trim();
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  return clean;
}

export function ddMmYyyyToIso(ddMmYyyy: string): string {
  const clean = (ddMmYyyy || '')
    .trim()
    .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)));
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }
  const parts = clean.split(/[\/\-\.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return new Date().toISOString().slice(0, 10);
}

/**
 * Parse a SignatureDateConfig's Gregorian fields (ថ្ងៃទី, ខែ, ឆ្នាំ) into an ISO date string (YYYY-MM-DD) if valid.
 */
export function parseSignatureGregorianToIso(
  sig: Pick<SignatureDateConfig, 'gregorianDay' | 'gregorianMonth' | 'gregorianYear'> | undefined
): string | null {
  if (!sig) return null;
  const toAsciiDigits = (s: string) =>
    (s || '').trim().replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)));

  const dayNum = parseInt(toAsciiDigits(sig.gregorianDay), 10);
  const yearNum = parseInt(toAsciiDigits(sig.gregorianYear), 10);
  const monthClean = (sig.gregorianMonth || '').replace(/^ខែ\s*/g, '').trim();
  const monthIdx = KHMER_SOLAR_MONTHS.indexOf(monthClean);

  if (
    Number.isNaN(dayNum) ||
    dayNum < 1 ||
    dayNum > 31 ||
    Number.isNaN(yearNum) ||
    yearNum < 1900 ||
    yearNum > 2100 ||
    monthIdx < 0
  ) {
    return null;
  }

  return `${yearNum}-${String(monthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
}

/**
 * Convert an ISO date (YYYY-MM-DD) into authentic Cambodian Chhankitek Lunar (ច័ន្ទគតិ) & Gregorian (សុរិយគតិ) signature fields
 */
export function convertIsoDateToKhmerSignature(iso: string): {
  isoDate: string;
  ddMmYyyy: string;
  weekdayKh: string;
  dayTwoDigit: string;
  dayKhmerNumeral: string;
  gregorianLocation: string;
  gregorianDay: string;
  gregorianMonth: string;
  gregorianYear: string;
  lunarDay: string;
  lunarMonth: string;
  lunarYearEra: string;
  fullLunarString: string;
  fullGregorianString: string;
} {
  const validIso = /^\d{4}-\d{2}-\d{2}$/.test(iso)
    ? iso
    : ddMmYyyyToIso(iso);
  const [yStr, mStr, dStr] = validIso.split('-');
  const year = parseInt(yStr, 10) || 2026;
  const monthIdx = Math.max(0, Math.min(11, (parseInt(mStr, 10) || 1) - 1));
  const day = parseInt(dStr, 10) || 1;

  const dt = new Date(year, monthIdx, day, 12, 0, 0);
  const weekdayIdx = Number.isNaN(dt.getTime()) ? 1 : dt.getDay();
  let weekdayKh = KHMER_WEEKDAYS_SHORT[weekdayIdx] || 'ចន្ទ';

  const dayTwoDigit = String(day).padStart(2, '0');
  const dayKhmerNumeral = formatNumeral(dayTwoDigit, true);
  const gregorianMonth = KHMER_SOLAR_MONTHS[monthIdx] || 'វិច្ឆិកា';
  const gregorianYear = formatNumeral(String(year), true);
  const gregorianLocation = 'រាជធានីភ្នំពេញ';

  let lunarDay = `${weekdayKh} ៧រោច`;
  let lunarMonth = 'អស្សុជ';
  let lunarYearEra = 'ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០';

  try {
    // Authentic Cambodian Chhankitek (ច័ន្ទគតិខ្មែរ) calculation via @thyrith/momentkh
    const khmerResult = fromGregorian(year, monthIdx + 1, day, 12, 0, 0);
    const kh = khmerResult.khmer;
    weekdayKh = kh.dayOfWeekName || weekdayKh;
    const phaseDayKh = formatNumeral(kh.day, true);
    lunarDay = `${weekdayKh} ${phaseDayKh}${kh.moonPhaseName}`;
    // Normalize កត្ដិក -> កត្តិក for standard Battambang/Moul spelling
    lunarMonth = (kh.monthName || 'អស្សុជ').replace(/កត្ដិក/g, 'កត្តិក');
    lunarYearEra = `ឆ្នាំ${kh.animalYearName} ${kh.sakName} ព.ស.${formatNumeral(
      kh.beYear,
      true
    )}`;
  } catch {
    // Fallback if date is out of range
  }

  return {
    isoDate: validIso,
    ddMmYyyy: `${dayTwoDigit}/${String(monthIdx + 1).padStart(2, '0')}/${year}`,
    weekdayKh,
    dayTwoDigit,
    dayKhmerNumeral,
    gregorianLocation,
    gregorianDay: dayKhmerNumeral,
    gregorianMonth,
    gregorianYear,
    lunarDay,
    lunarMonth,
    lunarYearEra,
    fullLunarString: `ថ្ងៃ${lunarDay} ខែ${lunarMonth} ${lunarYearEra}`,
    fullGregorianString: `${gregorianLocation}, ថ្ងៃទី${dayKhmerNumeral} ខែ${gregorianMonth} ឆ្នាំ${gregorianYear}`,
  };
}

/**
 * Parse an academic year label like "២០២៦ ~ ២០២៧" or "2026-2027" into { startYear, endYear }.
 * School year starts in November of startYear (e.g. Nov 2026) and ends in Aug/Sep of endYear (e.g. Aug/Sep 2027).
 */
export function parseAcademicYearRange(
  academicYearText?: string
): { startYear: number; endYear: number } {
  const normalized = (academicYearText || '')
    .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)));
  const matches = normalized.match(/\b(20\d{2})\b/g);
  if (matches && matches.length >= 2) {
    const y1 = parseInt(matches[0], 10);
    const y2 = parseInt(matches[1], 10);
    if (!Number.isNaN(y1) && !Number.isNaN(y2) && y2 >= y1) {
      return { startYear: y1, endYear: y2 };
    }
  }
  if (matches && matches.length === 1) {
    const y1 = parseInt(matches[0], 10);
    if (!Number.isNaN(y1)) {
      return { startYear: y1, endYear: y1 + 1 };
    }
  }
  return { startYear: 2026, endYear: 2027 };
}

/**
 * Given a 0-indexed month (0=Jan .. 10=Nov, 11=Dec) and an academic year string (e.g. "២០២៦ ~ ២០២៧"),
 * return the calendar year for that month:
 * - Oct, Nov, Dec (monthIndex >= 9) -> startYear (e.g. 2026)
 * - Jan .. Sep (monthIndex <= 8) -> endYear (e.g. 2027)
 */
export function getCalendarYearForMonthInAcademicTerm(
  monthIndex: number,
  academicYearText?: string
): number {
  const { startYear, endYear } = parseAcademicYearRange(academicYearText);
  return monthIndex >= 9 ? startYear : endYear;
}

/**
 * Sync all MonthConfig entries so their year, daysInMonth, lunarDate, and gregorianDate
 * match the given academic year (e.g. 2026 ~ 2027 -> Nov–Dec 2026, Jan–Sep 2027).
 */
export function syncMonthsWithAcademicYear(
  months: MonthConfig[],
  academicYearText?: string
): MonthConfig[] {
  return months.map((m) => {
    const mIdx = typeof m.monthIndex === 'number' ? m.monthIndex : 10;
    const targetYear = getCalendarYearForMonthInAcademicTerm(mIdx, academicYearText);
    const daysInMonth = new Date(targetYear, mIdx + 1, 0).getDate();
    if (m.year === targetYear && m.daysInMonth === daysInMonth) {
      return m;
    }
    const isoEnd = `${targetYear}-${String(mIdx + 1).padStart(2, '0')}-${String(
      daysInMonth
    ).padStart(2, '0')}`;
    const sig = convertIsoDateToKhmerSignature(isoEnd);
    return {
      ...m,
      year: targetYear,
      daysInMonth,
      lunarDate: sig.fullLunarString,
      gregorianDate: sig.fullGregorianString,
    };
  });
}

/**
 * Determine weekday index (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat) from Khmer scheduleDayKh
 */
export function getWeekdayIndexFromKhmerDay(scheduleDayKh?: string): number {
  const s = scheduleDayKh || '';
  if (s.includes('ចន្ទ')) return 1;
  if (s.includes('អង្គារ')) return 2;
  if (s.includes('ពុធ')) return 3;
  if (s.includes('ព្រហស្បតិ៍')) return 4;
  if (s.includes('សុក្រ')) return 5;
  if (s.includes('សៅរ៍')) return 6;
  if (s.includes('អាទិត្យ')) return 0;
  return 3; // Default Wednesday
}

/**
 * Automatically generate weekly class session ISO dates (YYYY-MM-DD) for a given class and month,
 * plus the default scoring end date (算分截止日期 = last session date of the month).
 */
export function generateAutoSessionDatesForMonth(
  cls?: ClassGroup | null,
  monthConfig?: MonthConfig | null,
  sessionCount = 4,
  academicYearText?: string
): { sessionDates: Record<number, string>; scoringEndDate: string } {
  const monthIdx = monthConfig?.monthIndex ?? 10; // 0-indexed (10 = Nov)
  const year = academicYearText
    ? getCalendarYearForMonthInAcademicTerm(monthIdx, academicYearText)
    : monthConfig?.year || getCalendarYearForMonthInAcademicTerm(monthIdx, '២០២៦ ~ ២០២៧');
  const targetWeekday = getWeekdayIndexFromKhmerDay(cls?.scheduleDayKh);
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const matchingIsoDates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, monthIdx, d, 12, 0, 0);
    if (dt.getDay() === targetWeekday) {
      matchingIsoDates.push(
        `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      );
    }
  }

  // Fallback if somehow empty
  if (matchingIsoDates.length === 0) {
    for (let i = 0; i < sessionCount; i++) {
      const d = Math.min(daysInMonth, 4 + i * 7);
      matchingIsoDates.push(
        `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      );
    }
  }

  const sessionDates: Record<number, string> = {};
  for (let i = 1; i <= sessionCount; i++) {
    if (matchingIsoDates[i - 1]) {
      sessionDates[i] = matchingIsoDates[i - 1];
    } else {
      // If sessionCount > matching weekdays in month, advance by 7 days into next month or clamp to end of month
      const lastIso = matchingIsoDates[matchingIsoDates.length - 1];
      const lastDate = new Date(lastIso + 'T12:00:00');
      lastDate.setDate(lastDate.getDate() + 7 * (i - matchingIsoDates.length));
      sessionDates[i] = lastDate.toISOString().slice(0, 10);
    }
  }

  const scoringEndDate =
    sessionDates[sessionCount] ||
    matchingIsoDates[matchingIsoDates.length - 1] ||
    `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  return { sessionDates, scoringEndDate };
}

/**
 * Resolve the MonthlyScoreSheetConfig for a given class and month.
 * Defaults to 50-point scale (Exam 25 + Attendance 5 + Classroom Performance 10 + Homework 10 = 50)
 * for Grade 8 & Grade 9, and 100-point scale (50 + 10 + 20 + 20 = 100) for Grade 10 (unless configured to 50).
 */
export function getResolvedMonthlyScoreConfig(
  state: AppDatabaseState,
  classId: string,
  monthId: string
): MonthlyScoreSheetConfig {
  const cls = state.classes.find((c) => c.id === classId);
  const monthCfg = state.months.find((m) => m.id === monthId);
  const existing = state.monthlyScoreConfigs?.[classId]?.[monthId];
  const maxScore = getClassMaxScore(cls);
  const is50Scale = maxScore === 50;

  const activeAcademicYear =
    state.academicTerms?.find((t) => t.id === state.currentTermId)?.nameKh ||
    state.schoolInfo.academicYear ||
    '២០២៦ ~ ២០២៧';
  const expectedYearPrefix = String(
    getCalendarYearForMonthInAcademicTerm(monthCfg?.monthIndex ?? 10, activeAcademicYear)
  );

  const sessionCount = existing?.sessionCount ?? 4;
  const autoDates = generateAutoSessionDatesForMonth(
    cls,
    monthCfg,
    sessionCount,
    activeAcademicYear
  );

  const mergedSessionDates: Record<number, string> = { ...autoDates.sessionDates };
  if (existing?.sessionDates) {
    for (let i = 1; i <= sessionCount; i++) {
      const savedIso = existing.sessionDates[i];
      if (savedIso && savedIso.startsWith(expectedYearPrefix)) {
        mergedSessionDates[i] = savedIso;
      }
    }
  }

  const isLegacy50On100Class =
    !is50Scale &&
    existing &&
    existing.examMax === 25 &&
    existing.attendanceMax === 5 &&
    existing.performanceMax === 10 &&
    existing.homeworkMax === 10;

  const savedScoringEnd =
    existing?.scoringEndDate && existing.scoringEndDate.startsWith(expectedYearPrefix)
      ? existing.scoringEndDate
      : '';

  return {
    examMax: isLegacy50On100Class ? 50 : existing?.examMax ?? (is50Scale ? 25 : 50),
    attendanceMax: isLegacy50On100Class ? 10 : existing?.attendanceMax ?? (is50Scale ? 5 : 10),
    performanceMax: isLegacy50On100Class ? 20 : existing?.performanceMax ?? (is50Scale ? 10 : 20),
    homeworkMax: isLegacy50On100Class ? 20 : existing?.homeworkMax ?? (is50Scale ? 10 : 20),
    sessionCount,
    sessionDates: mergedSessionDates,
    scoringEndDate: savedScoringEnd || mergedSessionDates[sessionCount] || autoDates.scoringEndDate,
    isScoringFinished: existing?.isScoringFinished ?? false,
  };
}

export interface ResolvedStudentMonthlyBreakdown {
  studentId: string;
  studentCode: string;
  name: string;
  chineseName: string;
  gender: 'M' | 'F';
  dob: string;
  note: string;
  performanceMarks: Record<number, ClassroomPerformanceMark>;
  activeSessionsCount: number;
  examScore: ScoreValue;
  attendanceScore: number;
  performanceScore: number;
  homeworkScore: number;
  totalScore: ScoreValue;
  grade: GradeLetter | '-';
  rank: number | null;
  isTied: boolean;
  hasExamOverride: boolean;
  hasAttendanceOverride: boolean;
  hasPerformanceOverride: boolean;
  hasHomeworkOverride: boolean;
  hasTotalOverride: boolean;
}

/**
 * Resolve a single student's monthly score breakdown (考试 + 考勤 + 课堂表现 + 作业 = 总分)
 * and classroom performance marks (✓ good = 1.0, ○ half = 0.5, ✗ bad = 0.0).
 */
export function resolveStudentMonthlyBreakdown(
  state: AppDatabaseState,
  classId: string,
  monthId: string,
  student: Student,
  config?: MonthlyScoreSheetConfig
): Omit<ResolvedStudentMonthlyBreakdown, 'rank' | 'isTied'> {
  const cfg = config || getResolvedMonthlyScoreConfig(state, classId, monthId);
  const savedEntry: Partial<StudentMonthlyBreakdownEntry> =
    state.monthlyScoreBreakdowns?.[classId]?.[monthId]?.[student.id] || {};
  const existingMonthScore = state.scores[classId]?.[student.id]?.[monthId];
  const isDroppedOrNeverPresent =
    student.status === 'dropped' || (student.note || '').includes('មិនដែលមករៀន');

  // Determine which session indices (1..sessionCount) are on or before scoringEndDate
  const activeSessionIndices: number[] = [];
  for (let s = 1; s <= cfg.sessionCount; s++) {
    const sDate = cfg.sessionDates[s];
    if (!cfg.scoringEndDate || !sDate || sDate <= cfg.scoringEndDate) {
      activeSessionIndices.push(s);
    }
  }
  if (activeSessionIndices.length === 0) {
    for (let s = 1; s <= cfg.sessionCount; s++) activeSessionIndices.push(s);
  }

  // 1. Resolve Classroom Performance Marks (✓ good, ○ half, ✗ bad)
  const attMap = state.attendance[classId]?.[monthId]?.[student.id] || {};
  const resolvedEval = resolveStudentStandardEvaluation(state, classId, monthId, student);
  const performanceMarks: Record<number, ClassroomPerformanceMark> = {};

  for (let s = 1; s <= cfg.sessionCount; s++) {
    const savedMark = savedEntry.performanceMarks?.[s];
    if (savedMark !== undefined) {
      performanceMarks[s] = savedMark;
    } else if (isDroppedOrNeverPresent) {
      performanceMarks[s] = 'bad';
    } else {
      // Infer initial mark from attendance & student performance level so table is ready to use
      const att = attMap[s];
      if (att === 'U') {
        performanceMarks[s] = 'bad';
      } else if (att === 'E' || att === 'L') {
        performanceMarks[s] = 'half';
      } else if (resolvedEval.isWeakLearner && s % 2 === 0) {
        performanceMarks[s] = 'half';
      } else {
        performanceMarks[s] = 'good';
      }
    }
  }

  // Calculate Classroom Performance Score out of cfg.performanceMax (e.g. 10)
  let computedPerformanceScore = 0;
  let markedCount = 0;
  let earnedPerfUnits = 0;
  for (const s of activeSessionIndices) {
    const mark = performanceMarks[s];
    if (mark === 'good') {
      earnedPerfUnits += 1;
      markedCount += 1;
    } else if (mark === 'half') {
      earnedPerfUnits += 0.5;
      markedCount += 1;
    } else if (mark === 'bad') {
      earnedPerfUnits += 0;
      markedCount += 1;
    } else if (cfg.isScoringFinished) {
      // If scoring is finished, unmarked sessions count in denominator
      markedCount += 1;
    }
  }
  const perfDenom = markedCount > 0 ? markedCount : activeSessionIndices.length || 1;
  computedPerformanceScore =
    Math.round(((earnedPerfUnits / perfDenom) * cfg.performanceMax) * 10) / 10;

  const performanceScore =
    savedEntry.performanceScoreOverride !== undefined &&
    savedEntry.performanceScoreOverride !== null
      ? savedEntry.performanceScoreOverride
      : computedPerformanceScore;

  // 2. Calculate Attendance Score out of cfg.attendanceMax (e.g. 5)
  let earnedAttUnits = 0;
  let recordedAttSessions = 0;
  for (const s of activeSessionIndices) {
    const st = attMap[s];
    if (st === 'P') {
      earnedAttUnits += 1;
      recordedAttSessions += 1;
    } else if (st === 'E' || st === 'L') {
      earnedAttUnits += 0.5;
      recordedAttSessions += 1;
    } else if (st === 'U') {
      earnedAttUnits += 0;
      recordedAttSessions += 1;
    }
  }
  let computedAttendanceScore = cfg.attendanceMax;
  if (isDroppedOrNeverPresent) {
    computedAttendanceScore = 0;
  } else if (recordedAttSessions > 0) {
    computedAttendanceScore =
      Math.round(((earnedAttUnits / recordedAttSessions) * cfg.attendanceMax) * 10) / 10;
  }
  const attendanceScore =
    savedEntry.attendanceScoreOverride !== undefined &&
    savedEntry.attendanceScoreOverride !== null
      ? savedEntry.attendanceScoreOverride
      : computedAttendanceScore;

  // 3. Calculate Homework Score out of cfg.homeworkMax (e.g. 10)
  const monthCfg = state.months.find((m) => m.id === monthId);
  const hwRecords = (state.dailyHomeworkRecords || []).filter((r) => {
    if (r.classId !== classId || !r.assigned) return false;
    if (cfg.scoringEndDate && r.date > cfg.scoringEndDate) return false;
    if (!monthCfg) return true;
    const dt = new Date(r.date + 'T12:00:00');
    return !Number.isNaN(dt.getTime()) && dt.getMonth() === monthCfg.monthIndex;
  });

  let computedHomeworkScore = cfg.homeworkMax;
  if (isDroppedOrNeverPresent) {
    computedHomeworkScore = 0;
  } else if (hwRecords.length > 0) {
    let earnedHw = 0;
    for (const r of hwRecords) {
      const sub = r.submissions?.[student.id];
      if (sub === 'submitted') earnedHw += 1;
      else if (sub === 'late') earnedHw += 0.5;
    }
    computedHomeworkScore =
      Math.round(((earnedHw / hwRecords.length) * cfg.homeworkMax) * 10) / 10;
  } else {
    computedHomeworkScore = resolvedEval.completedTasks ? cfg.homeworkMax : 0;
  }
  const homeworkScore =
    savedEntry.homeworkScoreOverride !== undefined &&
    savedEntry.homeworkScoreOverride !== null
      ? savedEntry.homeworkScoreOverride
      : computedHomeworkScore;

  // 4. Resolve Exam Score out of cfg.examMax (e.g. 25)
  let examScore: ScoreValue = null;
  if (savedEntry.examScore !== undefined) {
    examScore = savedEntry.examScore;
  } else if (existingMonthScore === 'ABS') {
    examScore = 'ABS';
  } else if (typeof existingMonthScore === 'number') {
    if (existingMonthScore === 0 && isDroppedOrNeverPresent) {
      examScore = 0;
    } else {
      const nonExamSum = attendanceScore + performanceScore + homeworkScore;
      const inferredExam = Math.max(
        0,
        Math.min(cfg.examMax, Math.round((existingMonthScore - nonExamSum) * 10) / 10)
      );
      examScore = inferredExam;
    }
  }

  // 5. Calculate Total Monthly Score
  const maxTotal = cfg.examMax + cfg.attendanceMax + cfg.performanceMax + cfg.homeworkMax;
  let totalScore: ScoreValue = null;
  if (savedEntry.totalScoreOverride !== undefined && savedEntry.totalScoreOverride !== null) {
    totalScore = savedEntry.totalScoreOverride;
  } else if (examScore === 'ABS') {
    totalScore = Math.round((attendanceScore + performanceScore + homeworkScore) * 10) / 10;
  } else if (typeof examScore === 'number') {
    totalScore = Math.min(
      maxTotal,
      Math.max(
        0,
        Math.round((examScore + attendanceScore + performanceScore + homeworkScore) * 10) / 10
      )
    );
  } else if (typeof existingMonthScore === 'number') {
    totalScore = existingMonthScore;
  }

  const pct =
    typeof totalScore === 'number' && maxTotal > 0 ? (totalScore / maxTotal) * 100 : null;
  const grade = getGradeFromPercentage(pct, state.gradeThresholds);

  return {
    studentId: student.id,
    studentCode: student.studentCode,
    name: student.name,
    chineseName: student.chineseName,
    gender: student.gender,
    dob: student.dob,
    note: student.note,
    performanceMarks,
    activeSessionsCount: activeSessionIndices.length,
    examScore,
    attendanceScore,
    performanceScore,
    homeworkScore,
    totalScore,
    grade,
    hasExamOverride: savedEntry.examScore !== undefined,
    hasAttendanceOverride:
      savedEntry.attendanceScoreOverride !== undefined &&
      savedEntry.attendanceScoreOverride !== null,
    hasPerformanceOverride:
      savedEntry.performanceScoreOverride !== undefined &&
      savedEntry.performanceScoreOverride !== null,
    hasHomeworkOverride:
      savedEntry.homeworkScoreOverride !== undefined &&
      savedEntry.homeworkScoreOverride !== null,
    hasTotalOverride:
      savedEntry.totalScoreOverride !== undefined && savedEntry.totalScoreOverride !== null,
  };
}

/**
 * Calculate all students' monthly breakdown rows for a class & month, including Competition Ranking (1, 2, 2, 4).
 */
export function calculateClassMonthlyBreakdownRows(
  state: AppDatabaseState,
  classId: string,
  monthId: string,
  students?: readonly Student[]
): ResolvedStudentMonthlyBreakdown[] {
  const cfg = getResolvedMonthlyScoreConfig(state, classId, monthId);
  const classStudents =
    students ||
    sortStudentsByKhmerName(state.students.filter((s) => s.classId === classId));

  const unranked = classStudents.map((stu) =>
    resolveStudentMonthlyBreakdown(state, classId, monthId, stu, cfg)
  );

  const scored = unranked
    .filter((r) => typeof r.totalScore === 'number')
    .sort((a, b) => (b.totalScore as number) - (a.totalScore as number));

  const rankMap = new Map<string, { rank: number; isTied: boolean }>();
  let i = 0;
  while (i < scored.length) {
    const val = scored[i].totalScore as number;
    let j = i;
    while (
      j < scored.length &&
      Math.abs((scored[j].totalScore as number) - val) < 1e-6
    ) {
      j++;
    }
    const rank = i + 1;
    const isTied = j - i > 1;
    for (let k = i; k < j; k++) {
      rankMap.set(scored[k].studentId, { rank, isTied });
    }
    i = j;
  }

  return unranked.map((r) => {
    const rk = rankMap.get(r.studentId);
    return {
      ...r,
      rank: rk ? rk.rank : null,
      isTied: rk ? rk.isTied : false,
    };
  });
}

/**
 * Clean a class code or name (e.g. 'term-2026-2027__10C' or 'ថ្នាក់ទី ១០C') into a normalized display code ('10C').
 */
export function cleanClassDisplayCode(raw: string | undefined | null): string {
  return String(raw || '')
    .replace(/^.*__/, '')
    .replace(/^ថ្នាក់ទី\s*/g, '')
    .replace(/^ថ្នាក់\s*/g, '')
    .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)))
    .replace(/\s+/g, '')
    .toUpperCase();
}

/**
 * Parse a curriculum row's lessonContent into chapterTitle, lessonTitle, and details.
 */
function parseCurriculumLessonContent(item: CurriculumPlanItem, idx: number): {
  chapterTitle: string;
  lessonTitle: string;
  bodyContent: string;
} {
  const raw = (item.lessonContent || '').trim();
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const firstLine = lines[0] || `មេរៀនសប្តាហ៍ទី${item.weekNumber || idx + 1}`;
  let chapterTitle = `ខែ${item.monthNameKh || 'វិច្ឆិកា'} · សប្តាហ៍ទី${item.weekNumber || idx + 1}`;
  let lessonTitle = firstLine;

  if (firstLine.includes('·')) {
    const parts = firstLine
      .split('·')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      chapterTitle = parts[0];
      lessonTitle = parts.slice(1).join(' · ');
    }
  } else if (firstLine.includes('单元') || firstLine.includes('ជំពូក')) {
    chapterTitle = firstLine;
    lessonTitle = lines[1] || firstLine;
  }

  return {
    chapterTitle,
    lessonTitle,
    bodyContent: raw || firstLine,
  };
}

/**
 * Automatically synchronize Lesson Plans (៤. កិច្ចតែងការបង្រៀន) from Annual Curriculum Plan (១. កម្មវិធីសិក្សាប្រចាំឆ្នាំ).
 * Preserves each Lesson Plan's manual date fields (dateWeekday, dateDay, dateMonth, dateYear, isoDate) so the teacher can adjust dates freely.
 */
export function syncLessonPlansFromCurriculum(
  curriculumPlan: CurriculumPlanItem[],
  existingLessonPlans: ChineseLessonPlan[]
): ChineseLessonPlan[] {
  if (!curriculumPlan || curriculumPlan.length === 0) {
    return existingLessonPlans;
  }

  return curriculumPlan.map((item, idx) => {
    const existing =
      existingLessonPlans.find(
        (lp) =>
          lp.linkedCurriculumId === item.id ||
          (item.linkedLessonPlanId && lp.id === item.linkedLessonPlanId)
      ) || existingLessonPlans[idx];

    const parsed = parseCurriculumLessonContent(item, idx);
    const hoursStr = formatNumeral(item.hours || 1.5, true);
    const durationLabel = `${hoursStr} ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)`;
    const pagesLabel =
      item.pageNumber && item.pageNumber.trim() !== '-'
        ? item.pageNumber.startsWith('ទំព័រ') || item.pageNumber.startsWith('សៀ.')
          ? item.pageNumber
          : `ទំព័រ ${item.pageNumber}`
        : existing?.pagesLabel || 'ទំព័រទី១ ដល់ ទំព័រទី៥';

    const defaultSteps = [
      {
        stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
        teacherActivity: 'ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ និងវត្តមានសិស្ស',
        lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ និងពិនិត្យវត្តមានសិស្ស',
        studentActivity: 'ស្លៀកពាក់ឯកសណ្ឋាន អង្គុយឱ្យត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
      },
      {
        stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
        teacherActivity: 'សួរសំណួររំលឹកពាក្យថ្មី និងទម្រង់ល្បះមេរៀនមុន',
        lessonContent: 'រំលឹកពាក្យថ្មី និងល្បះសន្ទនាមេរៀនមុន',
        studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ',
      },
      {
        stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
        teacherActivity:
          '១. សរសេរចំណងជើងមេរៀនដាក់លើក្តារខៀន រួចអានឱ្យសិស្សស្តាប់\n២. បង្រៀនពាក្យថ្មី ទម្រង់ល្បះ និងការសន្ទនា\n៣. ហៅសិស្សឡើងអាន និងចាប់គូហ្វឹកហាត់សន្ទនា',
        lessonContent: parsed.bodyContent,
        studentActivity:
          'សិស្សសង្កេត ស្តាប់គ្រូអាន អានតាមគ្រូ ចាប់គូឡើងសន្ទនា និងកត់ត្រាចូលសៀវភៅ',
      },
      {
        stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
        teacherActivity: 'ហៅសិស្សឡើងអាន និងបកប្រែពាក្យ ឬល្បះសំខាន់ៗក្នុងមេរៀន',
        lessonContent: `ហ្វឹកហាត់អាន និងឆ្លើយសំណួរ៖ ${parsed.lessonTitle}`,
        studentActivity: 'សិស្សឡើងអាន និងឆ្លើយសំណួររបស់គ្រូជាភាសាចិន',
      },
      {
        stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ (៥នាទី)',
        teacherActivity: 'ដាក់កិច្ចការផ្ទះ និងណែនាំឱ្យសិស្សស្វ័យសិក្សាពេលត្រឡប់ទៅផ្ទះវិញ',
        lessonContent: `作业 កិច្ចការផ្ទះ៖ ហាត់សរសេរពាក្យថ្មី និងទម្រង់ល្បះ (${parsed.lessonTitle})`,
        studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់គ្រូដោយយកចិត្តទុកដាក់',
      },
    ];

    const updatedSessions =
      existing && existing.sessions && existing.sessions.length > 0
        ? existing.sessions.map((sess, sIdx) => {
            if (sIdx !== 0) return sess;
            const hasStep3 = sess.steps.some((st) => st.stepTitle.includes('ជំហានទី៣'));
            const nextSteps = hasStep3
              ? sess.steps.map((st) =>
                  st.stepTitle.includes('ជំហានទី៣')
                    ? { ...st, lessonContent: st.lessonContent || parsed.bodyContent }
                    : st
                )
              : sess.steps.map((st, k) =>
                  k === Math.min(2, sess.steps.length - 1)
                    ? { ...st, lessonContent: st.lessonContent || parsed.bodyContent }
                    : st
                );
            return {
              ...sess,
              sessionTitle: `ម៉ោងសិក្សាទី១ — ${parsed.lessonTitle}`,
              steps: nextSteps,
            };
          })
        : [
            {
              sessionTitle: `ម៉ោងសិក្សាទី១ — ${parsed.lessonTitle}`,
              steps: defaultSteps,
            },
          ];

    return {
      id: existing?.id || `lp-sync-${item.id}`,
      linkedCurriculumId: item.id,
      // Preserve user's manual date adjustments
      dateWeekday: existing?.dateWeekday,
      dateDay: existing?.dateDay,
      dateMonth: existing?.dateMonth || item.monthNameKh,
      dateYear: existing?.dateYear,
      isoDate: existing?.isoDate,
      chapterTitle: parsed.chapterTitle,
      lessonTitle: parsed.lessonTitle,
      durationLabel,
      pagesLabel,
      textbookSource:
        existing?.textbookSource ||
        'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册 & 第二册) KUAILE HANYU',
      knowledgeObjective:
        existing?.knowledgeObjective ||
        `សិស្សប្រើប្រាស់ត្រឹមត្រូវក្នុងការប្រាស្រ័យទាក់ទងគ្នាជាភាសាចិនក្នុងមេរៀន «${parsed.lessonTitle}» តាមរយៈការហ្វឹកហាត់ជាបុគ្គល និងដៃគូ។`,
      skillObjective:
        existing?.skillObjective ||
        `សិស្សចេះអាន និងសរសេរពាក្យថ្មី ទម្រង់ល្បះ និងគំនូសអក្សរចិន៖ ${parsed.bodyContent.replace(/\r?\n/g, ' · ')}`,
      attitudeObjective:
        existing?.attitudeObjective ||
        'សិស្សមានវិន័យល្អក្នុងការចូលរួម សហការណ៍ ក្នុងសកម្មភាពសិក្សា។',
      teachingMaterialsTeacher:
        existing?.teachingMaterialsTeacher ||
        'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណអក្សររូបភាព',
      teachingMaterialsStudent:
        existing?.teachingMaterialsStudent ||
        'សៀវភៅគោលសម្រាប់សិស្ស សៀវភៅលំហាត់',
      sessions: updatedSessions,
    };
  });
}

/**
 * Automatically synchronize Annual Curriculum Plan (១. កម្មវិធីសិក្សាប្រចាំឆ្នាំ) from Lesson Plans (៤. កិច្ចតែងការបង្រៀន).
 */
export function syncCurriculumFromLessonPlans(
  lessonPlans: ChineseLessonPlan[],
  existingCurriculum: CurriculumPlanItem[]
): CurriculumPlanItem[] {
  if (!lessonPlans || lessonPlans.length === 0) {
    return existingCurriculum;
  }

  return lessonPlans.map((lp, idx) => {
    const existing =
      existingCurriculum.find(
        (c) =>
          c.id === lp.linkedCurriculumId ||
          (c.linkedLessonPlanId && c.linkedLessonPlanId === lp.id)
      ) || existingCurriculum[idx];

    const step3 =
      lp.sessions?.[0]?.steps?.find((st) => st.stepTitle.includes('ជំហានទី៣')) ||
      lp.sessions?.[0]?.steps?.[2] ||
      lp.sessions?.[0]?.steps?.[0];

    const step3Body = (step3?.lessonContent || '').trim();
    const headerTitle = [lp.chapterTitle, lp.lessonTitle]
      .map((s) => (s || '').trim())
      .filter(Boolean)
      .join(' · ');

    const combinedContent = step3Body
      ? step3Body.includes(lp.lessonTitle)
        ? step3Body
        : `${headerTitle}\n${step3Body}`
      : headerTitle;

    const rawDuration = (lp.durationLabel || '').replace(
      /[០-៩]/g,
      (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch))
    );
    const matchHours = rawDuration.match(/(\d+(?:\.\d+)?)/);
    const parsedHours = matchHours
      ? parseFloat(matchHours[1])
      : existing?.hours || 1.5;

    const cleanPages = (lp.pagesLabel || '')
      .replace(/^ទំព័រទី\s*/g, '')
      .replace(/^ទំព័រ\s*/g, '')
      .trim();

    return {
      id: existing?.id || lp.linkedCurriculumId || `cur-sync-${lp.id}`,
      linkedLessonPlanId: lp.id,
      monthNameKh: lp.dateMonth || existing?.monthNameKh || 'វិច្ឆិកា',
      weekNumber: existing?.weekNumber || formatNumeral(idx + 1, true),
      lessonContent: combinedContent,
      pageNumber: cleanPages || existing?.pageNumber || '-',
      hours: parsedHours > 0 ? parsedHours : 1.5,
      note: existing?.note || '',
    };
  });
}

/**
 * Sequentially synchronize Weekly Lesson Logs (សម្រង់អត្ថបទប្រចាំសប្តាហ៍) across all classes in the current term
 * based on Daily Homework & Lesson Records (កំណត់ត្រាមេរៀន និងកំណត់ត្រាកិច្ចការផ្ទះ).
 * Connects classes sequentially (e.g. 10C first period -> 10B second period -> ...) and propagates
 * the filled lesson/homework content when subsequent classes share the same study progress.
 */
export function syncWeeklyLogsFromDailyHomework(
  classes: ClassGroup[],
  dailyHomeworkRecords: DailyHomeworkRecord[],
  prevWeeklyLogs: WeeklyLessonLogItem[],
  activeDateIso?: string,
  editedClassId?: string
): WeeklyLessonLogItem[] {
  if (!classes || classes.length === 0) return prevWeeklyLogs;

  const findRecordForClass = (cls: ClassGroup): DailyHomeworkRecord | undefined => {
    const cleanCode = cleanClassDisplayCode(cls.name || cls.id);
    if (activeDateIso) {
      const exact = dailyHomeworkRecords.find(
        (r) =>
          r.date === activeDateIso &&
          (r.classId === cls.id || cleanClassDisplayCode(r.classId) === cleanCode)
      );
      if (exact) return exact;
    }
    const matching = dailyHomeworkRecords.filter(
      (r) => r.classId === cls.id || cleanClassDisplayCode(r.classId) === cleanCode
    );
    return matching[matching.length - 1];
  };

  // Reference record from the class just edited (so subsequent classes in the sequence also connect seamlessly)
  const editedClassIndex = editedClassId
    ? classes.findIndex(
        (c) =>
          c.id === editedClassId ||
          cleanClassDisplayCode(c.name || c.id) === cleanClassDisplayCode(editedClassId)
      )
    : -1;
  const editedClassObj = editedClassIndex >= 0 ? classes[editedClassIndex] : undefined;
  const editedRec = editedClassObj ? findRecordForClass(editedClassObj) : undefined;

  const usedLogIds = new Set<string>();

  const classLogs = classes.map((cls, idx) => {
    const cleanCode = cleanClassDisplayCode(cls.name || cls.id) || cls.name || cls.id;
    const existingLog = prevWeeklyLogs.find(
      (w) => !usedLogIds.has(w.id) && cleanClassDisplayCode(w.classId) === cleanCode
    );
    if (existingLog) {
      usedLogIds.add(existingLog.id);
    }
    const rec = findRecordForClass(cls);
    // When a class is edited (e.g. 10C first period), propagate its lesson to subsequent classes in the sequence
    const shouldPropagateFromEdited =
      editedRec !== undefined && editedClassIndex >= 0 && idx >= editedClassIndex;
    const sourceRec = shouldPropagateFromEdited ? editedRec : rec || editedRec;

    const weekdayShort = (cls.scheduleDayKh || existingLog?.weekdayKh || 'ចន្ទ')
      .replace(/^ថ្ងៃ\s*/g, '')
      .trim();
    const dateStr = sourceRec?.date
      ? isoToDdMmYyyy(sourceRec.date)
      : existingLog?.dateStr ||
        (activeDateIso ? isoToDdMmYyyy(activeDateIso) : '03/11/2026');

    const unitTitle =
      (shouldPropagateFromEdited ? sourceRec?.lessonUnitTitle : existingLog?.unitTitle || sourceRec?.lessonUnitTitle) ||
      '第一单元 · ជំពូកទី១';
    const lessonTitle =
      (shouldPropagateFromEdited
        ? sourceRec?.lessonTitle || sourceRec?.homeworkTitle
        : existingLog?.lessonTitle || sourceRec?.lessonTitle || sourceRec?.homeworkTitle) ||
      'មេរៀនប្រចាំសប្តាហ៍';

    const combinedDetails = [
      sourceRec?.lessonContentDetails || '',
      sourceRec?.assigned && sourceRec?.homeworkDetail
        ? `កិច្ចការផ្ទះ (作业)៖ ${sourceRec.homeworkTitle ? sourceRec.homeworkTitle + ' — ' : ''}${sourceRec.homeworkDetail}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const resolvedId = existingLog?.id || `wlog-seq-${cleanCode}-${idx + 1}`;
    usedLogIds.add(resolvedId);

    return {
      id: resolvedId,
      weekLabel: existingLog?.weekLabel || `សប្តាហ៍ (${dateStr})`,
      dateStr,
      weekdayKh: weekdayShort,
      timeRange: existingLog?.timeRange || cls.scheduleTime || '13:00-14:30',
      classId: existingLog?.classId || cleanCode,
      unitTitle,
      lessonTitle,
      contentDetails:
        (shouldPropagateFromEdited
          ? combinedDetails || sourceRec?.homeworkDetail
          : existingLog?.contentDetails || combinedDetails || sourceRec?.homeworkDetail) ||
        '',
    };
  });

  // Preserve any extra rows manually added by the teacher (e.g. via + បន្ថែមជួរ or Copy -> Add Next Row)
  const extraManualLogs = prevWeeklyLogs.filter(
    (w) =>
      !usedLogIds.has(w.id) &&
      (w.id.startsWith('wlog-manual-') ||
        w.id.startsWith('wlog-paste-') ||
        prevWeeklyLogs.length > classes.length)
  );

  return [...classLogs, ...extraManualLogs];
}

/**
 * Synchronize Daily Homework & Lesson Records (កំណត់ត្រាមេរៀន និងកំណត់ត្រាកិច្ចការផ្ទះ) when a row in
 * Weekly Lesson Log (សម្រង់អត្ថបទប្រចាំសប្តាហ៍) is edited.
 */
export function syncDailyHomeworkFromWeeklyLogs(
  weeklyLogs: WeeklyLessonLogItem[],
  classes: ClassGroup[],
  prevDailyRecords: DailyHomeworkRecord[]
): DailyHomeworkRecord[] {
  const nextRecords = [...(prevDailyRecords || [])];

  weeklyLogs.forEach((log) => {
    const cleanLogClass = cleanClassDisplayCode(log.classId);
    const matchedClass = classes.find(
      (c) => cleanClassDisplayCode(c.name || c.id) === cleanLogClass
    );
    const targetClassId = matchedClass ? matchedClass.id : log.classId;
    const isoDate = ddMmYyyyToIso(log.dateStr) || new Date().toISOString().slice(0, 10);

    // Split contentDetails back into lessonContentDetails and homework line if present
    const lines = (log.contentDetails || '').split(/\r?\n/);
    const hwLineIdx = lines.findIndex(
      (l) => l.includes('កិច្ចការផ្ទះ') || l.includes('作业')
    );
    let lessonDetails = log.contentDetails || '';
    let parsedHwTitle = log.lessonTitle || 'កិច្ចការផ្ទះភាសាចិន';
    let parsedHwDetail = '';

    if (hwLineIdx >= 0) {
      const hwRaw = lines[hwLineIdx]
        .replace(/^.*?(?:កិច្ចការផ្ទះ\s*\(作业\)|កិច្ចការផ្ទះ|作业)\s*[៖:]\s*/i, '')
        .trim();
      lessonDetails = lines
        .filter((_, i) => i !== hwLineIdx)
        .join('\n')
        .trim();
      if (hwRaw.includes('—')) {
        const [tPart, ...dParts] = hwRaw.split('—');
        parsedHwTitle = tPart.trim() || parsedHwTitle;
        parsedHwDetail = dParts.join('—').trim();
      } else {
        parsedHwDetail = hwRaw;
      }
    }

    // Update all records for this class (or create one for isoDate)
    const matchingIndices = nextRecords
      .map((r, i) =>
        r.classId === targetClassId ||
        cleanClassDisplayCode(r.classId) === cleanLogClass
          ? i
          : -1
      )
      .filter((i) => i >= 0);

    if (matchingIndices.length > 0) {
      matchingIndices.forEach((rIdx) => {
        const oldRec = nextRecords[rIdx];
        nextRecords[rIdx] = {
          ...oldRec,
          lessonUnitTitle: log.unitTitle,
          lessonTitle: log.lessonTitle,
          lessonContentDetails: lessonDetails || oldRec.lessonContentDetails,
          homeworkTitle: parsedHwTitle || oldRec.homeworkTitle,
          homeworkDetail: parsedHwDetail || oldRec.homeworkDetail,
          syncedToWeeklyLog: true,
        };
      });
    } else {
      nextRecords.push({
        id: `hw-${targetClassId}-${isoDate}`,
        classId: targetClassId,
        date: isoDate,
        assigned: true,
        lessonUnitTitle: log.unitTitle,
        lessonTitle: log.lessonTitle,
        lessonContentDetails: lessonDetails,
        homeworkTitle: parsedHwTitle,
        homeworkDetail: parsedHwDetail,
        dueDate: 'សប្តាហ៍ក្រោយ',
        syncedToWeeklyLog: true,
        submissions: {},
        notes: {},
      });
    }
  });

  return nextRecords;
}





