import {
  calculateChineseGradeDistribution,
  calculateClassChineseResults,
  calculateModelSchoolChecklistStats,
  calculateSingleChineseStudentRow,
  calculateStudentSessionAttendance,
  formatNumeral,
  formatPaddedScore,
  getGradeFromPercentage,
} from './calculations';
import { GradeThresholds, Student } from '../types';

export interface UnitTestCaseResult {
  id: string;
  nameKh: string;
  nameEn: string;
  passed: boolean;
  expected: string;
  actual: string;
}

const DEFAULT_THRESHOLDS: GradeThresholds = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
  E: 50,
};

const makeStudent = (
  id: string,
  code: string,
  name: string,
  chineseName: string,
  gender: 'M' | 'F' = 'F'
): Student => ({
  id,
  classId: '8C',
  studentCode: code,
  name,
  chineseName,
  gender,
  dob: '19/9/2009',
  status: 'active',
  note: '',
});

export function runAllCalculationUnitTests(): UnitTestCaseResult[] {
  const results: UnitTestCaseResult[] = [];

  // Test 1: PDF 6 50-Point Chinese Subject Multi-Month Average & Rounding
  {
    // From PDF 6 (បញ្ជីស្រង់ពិន្ទុសិស្សថ្នាក់ទី 8C):
    // ភាព ស្រីកា (文淑雅): May=31, Jun=34, Jul=25, Sem2=25 -> Sum=115, 115/4=28.75 -> Rounded Avg = 29
    const stu = makeStudent('s2', '18628', 'ភាព ស្រីកា', '文淑雅', 'F');
    const row = calculateSingleChineseStudentRow(
      stu,
      { may: 31, jun: 34, jul: 25, sem2: 25 },
      ['may', 'jun', 'jul', 'sem2'],
      50,
      DEFAULT_THRESHOLDS,
      true
    );
    const passed =
      row.totalScore === 115 &&
      row.evaluatedMonthsCount === 4 &&
      row.averageScore === 29 &&
      row.grade === 'E'; // 28.75 / 50 = 57.5% -> Grade E
    results.push({
      id: 'chinese-50pt-avg',
      nameKh: 'ការគណនាមធ្យមភាគមុខវិជ្ជាភាសាចិន (ពិន្ទុអតិបរមា 50)',
      nameEn: 'Chinese Subject 50-point scale average (31, 34, 25, 25 -> Avg 29)',
      passed,
      expected: 'Sum=115, Months=4, Avg=29, Grade=E',
      actual: `Sum=${row.totalScore}, Months=${row.evaluatedMonthsCount}, Avg=${row.averageScore}, Grade=${row.grade}`,
    });
  }

  // Test 2: Tied Competition Ranking (01, 02, 02, 04)
  {
    const students = [
      makeStudent('s1', '01', 'ហុង ស៊ីវហ្វុង', '洪秀锋', 'M'),
      makeStudent('s2', '02', 'ម៉ៅ លីដា', '毛丽达', 'F'),
      makeStudent('s3', '03', 'លាង ពុធដានីកា', '梁丹妮', 'F'),
      makeStudent('s4', '04', 'ភាព ស្រីកា', '文淑雅', 'F'),
    ];
    const scores = {
      s1: { may: 50, jun: 50 }, // Avg 50 -> Rank 1
      s2: { may: 40, jun: 40 }, // Avg 40 -> Rank 2 (Tied)
      s3: { may: 40, jun: 40 }, // Avg 40 -> Rank 2 (Tied)
      s4: { may: 35, jun: 35 }, // Avg 35 -> Rank 4
    };
    const classRes = calculateClassChineseResults(
      students,
      scores,
      ['may', 'jun'],
      50,
      DEFAULT_THRESHOLDS
    );
    const ranks = classRes
      .map((r) => `${r.studentCode}:#${formatPaddedScore(r.rank, false)}${r.isTied ? '=' : ''}`)
      .join(', ');
    const expected = '01:#01, 02:#02=, 03:#02=, 04:#04';
    results.push({
      id: 'tied-ranking',
      nameKh: 'ចំណាត់ថ្នាក់ស្មើគ្នា (Tied Ranking 01, 02=, 02=, 04)',
      nameEn: 'Standard competition ranking on tied Chinese scores',
      passed: ranks === expected,
      expected,
      actual: ranks,
    });
  }

  // Test 3: Empty & Absent ('ABS') Score Handling
  {
    const stu = makeStudent('s5', '05', 'សិស្សសាកល្បង', '测试生', 'M');
    const emptyRow = calculateSingleChineseStudentRow(
      stu,
      { may: null, jun: null },
      ['may', 'jun'],
      50,
      DEFAULT_THRESHOLDS
    );
    const absRow = calculateSingleChineseStudentRow(
      stu,
      { may: 40, jun: 'ABS' },
      ['may', 'jun'],
      50,
      DEFAULT_THRESHOLDS
    );
    const passed =
      emptyRow.averageScore === null &&
      emptyRow.grade === '-' &&
      absRow.evaluatedMonthsCount === 2 &&
      absRow.averageScore === 20 &&
      absRow.grade === 'F';
    results.push({
      id: 'empty-and-abs',
      nameKh: 'ការគ្រប់គ្រងពិន្ទុទទេ និងអវត្តមានពេលប្រឡង (Empty & ABS)',
      nameEn: 'Blank scores ignored; ABS counts as 0 in denominator',
      passed,
      expected: 'Empty: Avg=null | (40, ABS): Months=2, Avg=20, Grade=F',
      actual: `Empty: Avg=${emptyRow.averageScore} | (40, ABS): Months=${absRow.evaluatedMonthsCount}, Avg=${absRow.averageScore}, Grade=${absRow.grade}`,
    });
  }

  // Test 4: Grade Distribution (Total & Female) & Khmer Numerals
  {
    const students = [
      makeStudent('s1', '01', 'សិស្ស ស្រី A', '女A', 'F'),
      makeStudent('s2', '02', 'សិស្ស ប្រុស B', '男B', 'M'),
    ];
    const scores = {
      s1: { nov: 48 }, // 96% -> A
      s2: { nov: 42 }, // 84% -> B
    };
    const rows = calculateClassChineseResults(students, scores, ['nov'], 50, DEFAULT_THRESHOLDS);
    const dist = calculateChineseGradeDistribution(rows);
    const khNum = formatNumeral(2025, true);
    const passed =
      dist.totalEvaluated === 2 &&
      dist.femaleEvaluated === 1 &&
      dist.grades.A.total === 1 &&
      dist.grades.A.female === 1 &&
      dist.grades.B.total === 1 &&
      khNum === '២០២៥';
    results.push({
      id: 'grade-dist-khmer',
      nameKh: 'ស្ថិតិនិទ្ទេស A–F តាមភេទ និងលេខខ្មែរ (២០២៥)',
      nameEn: 'Chinese Grade A-F distribution by gender & Khmer digits',
      passed,
      expected: 'Eval=2(F=1), GradeA=1(F=1), 2025->២០២៥',
      actual: `Eval=${dist.totalEvaluated}(F=${dist.femaleEvaluated}), GradeA=${dist.grades.A.total}(F=${dist.grades.A.female}), 2025->${khNum}`,
    });
  }

  // Test 5: Session Attendance & Model School Standard 1 Checklist Stats
  {
    const attSum = calculateStudentSessionAttendance({ 1: 'P', 2: 'P', 3: 'E', 4: 'U' });
    const stu = makeStudent('s1', '18660', 'ថោង វីរៈបុត្រ', '唐昊辰', 'M');
    const checkStats = calculateModelSchoolChecklistStats([stu], {
      s1: {
        skillScore: 4,
        attitudeScore: 5,
        receivedPreStudy: true,
        receivedHomework: true,
        completedTasks: true,
        hasStudyPlan: true,
        hasTextbook: true,
        readingSpeedCategory: '30to50',
        remark: '',
      },
    });
    const passed =
      attSum.present === 2 &&
      attSum.excused === 1 &&
      attSum.unexcused === 1 &&
      checkStats.scoredSkillAttitudeCount === 1 &&
      checkStats.homeworkCount === 1;
    results.push({
      id: 'attendance-and-model-school',
      nameKh: 'វត្តមានប្រចាំសប្តាហ៍ និងស្តង់ដាសាលាគំរូ (បំណិន/ចរិយាសម្បទា)',
      nameEn: 'Session attendance & Model School Standard 1 checklist aggregation',
      passed,
      expected: 'P=2, E=1, U=1 | Scored=1, Homework=1',
      actual: `P=${attSum.present}, E=${attSum.excused}, U=${attSum.unexcused} | Scored=${checkStats.scoredSkillAttitudeCount}, Homework=${checkStats.homeworkCount}`,
    });
  }

  // Test 6: Custom Grade Thresholds
  {
    const gA = getGradeFromPercentage(90, DEFAULT_THRESHOLDS);
    const gC = getGradeFromPercentage(72, DEFAULT_THRESHOLDS);
    const gF = getGradeFromPercentage(48, DEFAULT_THRESHOLDS);
    results.push({
      id: 'grade-thresholds',
      nameKh: 'កម្រិតនិទ្ទេសភាសាចិន (A≥90%, B≥80%, C≥70%, D≥60%, E≥50%)',
      nameEn: 'Chinese subject grade cutoffs verification',
      passed: gA === 'A' && gC === 'C' && gF === 'F',
      expected: '90%->A, 72%->C, 48%->F',
      actual: `90%->${gA}, 72%->${gC}, 48%->${gF}`,
    });
  }

  return results;
}
