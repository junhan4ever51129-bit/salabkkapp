export type Language = 'km' | 'en';

export type Gender = 'M' | 'F';

export type StudentStatus = 'active' | 'dropped' | 'transferred';

export interface SchoolInfo {
  provinceKh: string;
  provinceEn: string;
  departmentKh: string;
  departmentEn: string;
  officeKh: string;
  officeEn: string;
  schoolNameKh: string;
  schoolNameZh: string;
  schoolNameEn: string;
  principalName: string;
  teacherName: string;
  teacherPositionKh: string;
  subjectNameKh: string;
  subjectNameZh: string;
  subjectNameEn: string;
  maxScore: number; // Default 50 (per PDF 6: បញ្ជីស្រង់ពិន្ទុសិស្សថ្នាក់ទី 8C where full score is 50)
  academicYear: string;
}

export interface ClassGroup {
  id: string; // e.g., '8A', '8B', '8C', '9A', '9B', '9C', '10A', '10C'
  name: string; // e.g., '៨A', '៨B', etc.
  gradeLevel: number;
  scheduleDayKh: string; // e.g., 'ថ្ងៃអង្គារ'
  scheduleTime: string; // e.g., '15:00-16:30'
  weeklyHoursLabel: string; // e.g., '១ម៉ ៣០ន/ សប្តាហ៍'
  textbookName: string; // e.g., '快乐汉语 (第一册) / ភាសាចិនរីករាយ'
  termId?: string;
}

export interface Student {
  id: string;
  classId: string; // '8A' | '8B' | '8C' | '9A' | '9B' | '9C' | '10A' | '10C'
  studentCode: string; // e.g., '18660' or '01'
  name: string; // Khmer full name
  chineseName: string; // Chinese name e.g., '卡若琳'
  gender: Gender; // 'M' = ប, 'F' = ស
  dob: string; // e.g., '19/9/2009' or '2009-09-19'
  status: StudentStatus;
  note: string; // e.g., 'មិនដែលមករៀន', 'សុំមិនបង់ថវិកា'
}

export interface MonthConfig {
  id: string; // 'nov', 'dec', 'jan', 'feb', 'mar', 'sem1', 'apr', 'may', 'jun', 'jul', 'aug', 'sem2'
  nameKh: string;
  nameEn: string;
  semester: 1 | 2;
  isSemesterExam?: boolean;
  year: number;
  monthIndex: number;
  daysInMonth: number;
  lunarDate: string;
  gregorianDate: string;
  enabled: boolean;
  // 10 weekly session date headers for the monthly attendance sheet (PDF 1 style)
  sessionDates?: string[];
}

export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface GradeThresholds {
  A: number; // default 90 (%)
  B: number; // default 80 (%)
  C: number; // default 70 (%)
  D: number; // default 60 (%)
  E: number; // default 50 (%)
}

export type ScoreValue = number | null | 'ABS';

// classId -> studentId -> monthId -> ScoreValue (Chinese subject score for that month/exam)
export type ClassChineseScores = Record<string, Record<string, Record<string, ScoreValue>>>;

// '' = unmarked, 'P' = Present (✓), 'E' = Excused (ច្បាប់ P), 'U' = Unexcused (អត់ច្បាប់ A), 'L' = Late (មកយឺត L)
export type AttendanceStatus = '' | 'P' | 'E' | 'U' | 'L';

// classId -> monthId -> studentId -> sessionIndex (1..10) -> AttendanceStatus
export type ClassSessionAttendance = Record<
  string,
  Record<string, Record<string, Record<number, AttendanceStatus>>>
>;

// classId -> monthId -> sessionIndex (1..15) -> date label (e.g. '04', '11')
export type ClassSessionDateLabels = Record<string, Record<string, Record<number, string>>>;

// classId -> monthId -> sessionIndex (1..15) -> month label (e.g. 'វិច្ឆិកា', 'ធ្នូ', '11', '12')
export type ClassSessionMonthLabels = Record<string, Record<string, Record<number, string>>>;

export interface AttendanceSheetConfig {
  monthHeaderLabel?: string; // e.g. 'វិច្ឆិកា - ធ្នូ' or '........................'
  columnCount?: number; // default 10
  blankRowsCount?: number; // default 2
}

export type AllAttendanceSheetConfigs = Record<string, Record<string, AttendanceSheetConfig>>;

// Model School Standard 1 (PDF 7 & PDF 8): Skills (បំណិនសម្បទា 1-5), Attitude (ចរិយាសម្បទា 1-5), and 5 Student Checklists
export interface StudentStandardEvaluation {
  skillScore: number | null; // បំណិនសម្បទា (0-5)
  attitudeScore: number | null; // ចរិយាសម្បទា (0-5)
  isWeakLearner?: boolean; // រៀនខ្សោយ (✓)
  absentCount?: string; // ឈប់ច្រើន (e.g. '3' or '')
  receivedPreStudy: boolean; // បានទទួលកិច្ចការរៀនមុន
  receivedHomework: boolean; // បានទទួលកិច្ចការ / កិច្ចការផ្ទះ
  completedTasks: boolean; // បានធ្វើកិច្ចការ
  hasStudyPlan: boolean; // មានផែនការសិក្សា
  goodCooperation?: boolean; // មានសហការល្អ
  hasTextbook: boolean; // មានស.ភគោល
  readingSpeedCategory: 'none' | 'under20' | 'over30' | '30to50' | 'over50';
  remark: string;
  manualOverrides?: Record<string, boolean>;
}

// classId -> monthId -> studentId -> StudentStandardEvaluation
export type AllStandardEvaluations = Record<
  string,
  Record<string, Record<string, StudentStandardEvaluation>>
>;

// Teacher Monthly Task Report (ភារកិច្ចគ្រូបង្រៀន ស្តង់ដាសាលាគំរូ - PDF 8 page 1 & 3)
export interface TeacherMonthlyTaskReport {
  monthTitleKh?: string; // e.g., 'កក្កដា'
  preStudyAssignedCount: number; // ដងក្នុង១ខែ
  preStudyDetails: string[];
  projectAssignedCount: number; // ដងក្នុង១ខែ
  projectDetails: string[];
  homeworkAssignedCount: number; // ដងក្នុង១ខែ
  homeworkDetails: string[];
  homeworkGradedCount: number; // ដងក្នុង១ខែ
  scoredSkillAttitudeCountOverride?: number | null; // នាក់ក្នុង១ខែ
  studentPreStudyCountOverride?: number | null; // នាក់ក្នុង១ខែ
  studentProjectCountOverride?: number | null; // នាក់ក្នុង១ខែ
  studentHomeworkCountOverride?: number | null; // នាក់ក្នុង១ខែ
  studentStudyPlanCountOverride?: number | null; // នាក់ (១ឆ្នាំ)
  vulnerableStudentsNote: string; // សិស្សក្រីក្រ / សិស្សឈប់ច្រើនម៉ោង / សិស្សរៀនខ្សោយ
  customLunarDate?: string;
  customGregorianDate?: string;
}

// classId -> monthId -> TeacherMonthlyTaskReport
export type AllTeacherTaskReports = Record<string, Record<string, TeacherMonthlyTaskReport>>;

// Weekly Teaching Log (សម្រង់អត្ថបទប្រចាំសប្តាហ៍ - PDF 2)
export interface WeeklyLessonLogItem {
  id: string;
  weekLabel?: string; // e.g. 'សប្តាហ៍ទី១ (១០-១៤ វិច្ឆិកា ២០២៥)'
  dateStr: string; // e.g. '10/11/2025'
  weekdayKh: string; // e.g. 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍'
  timeRange: string; // e.g. '13:00-14:30'
  classId: string; // e.g. '9A', '9C', '8C', '8A', '10A', '10C', '9B', '8B'
  unitTitle: string; // e.g. '第一单元 我和朋友'
  lessonTitle: string; // e.g. '第一课 他是谁 / មេរៀនទី១ តើគាត់គឺជានរណា'
  contentDetails: string; // Vocabulary, Sentence Patterns, Dialogue, Strokes, etc.
}

export interface WeeklyLogSignatureMeta {
  fridayDateStr: string; // e.g. '14/11/2025'
  lunarDate: string; // e.g. 'ថ្ងៃសុក្រ ៩រោច ខែកត្តិក ឆ្នាំម្សាញ់ សប្តស័ក ព.ស.២៥៦៩'
  gregorianDate: string; // e.g. 'រាជធានីភ្នំពេញ, ថ្ងៃទី១៤ ខែវិច្ឆិកា ឆ្នាំ២០២៥'
  textbookTitle: string; // e.g. '快乐汉语（第一册 & 第二册）ភាសាចិនរីករាយ'
}

// Annual Curriculum Plan Item (កម្មវិធីសិក្សាភាសាចិន - PDF 3)
export interface CurriculumPlanItem {
  id: string;
  monthNameKh: string; // e.g. 'វិច្ឆិកា'
  weekNumber: string; // '១', '២', '៣', '៤'
  lessonContent: string;
  pageNumber: string; // e.g. 'សៀ.សិស្ស ៣'
  hours: number; // 1.5
  note: string;
}

// Detailed Chinese Lesson Plan (កិច្ចតែងការបង្រៀន - PDF 4)
export interface ChineseLessonPlan {
  id: string;
  chapterTitle: string; // e.g. 'ជំពូកទី១ ខ្ញុំ និង អ្នក (第一单元 你和我)'
  lessonTitle: string; // e.g. 'មេរៀនទី១ សួស្តី (第一课 你好)'
  durationLabel: string; // '៤ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)'
  pagesLabel: string; // 'ទំព័រទី១ ដល់ ទំព័រទី៣'
  textbookSource: string; // 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU'
  knowledgeObjective: string; // វិជ្ជាសម្បទា
  skillObjective: string; // បំណិនសម្បទា
  attitudeObjective: string; // ចរិយាសម្បទា
  teachingMaterialsTeacher: string; // ចំពោះគ្រូ
  teachingMaterialsStudent: string; // ចំពោះសិស្ស
  sessions: {
    sessionTitle: string; // ម៉ោងសិក្សាទី១..៤
    steps: {
      stepTitle: string; // ជំហានទី១..៥
      teacherActivity: string;
      lessonContent: string;
      studentActivity: string;
    }[];
  }[];
}

// Performance Agreement Targets (កិច្ចព្រមព្រៀងលទ្ធផលប្រចាំឆ្នាំរបស់គ្រូបង្រៀន - PDF 5)
export interface ClassPerformanceTarget {
  scopeId: string; // 'ALL' | 'G8' | '8A' | '8B' | '8C' | 'G9' | '9A' | '9B' | '9C' | 'G10' | '10A' | '10C'
  labelKh: string;
  totalStudents: number;
  femaleStudents: number;
  baselineGrades: Record<GradeLetter, { pct: number; count: number }>;
  targetGrades: Record<GradeLetter, { pct: number; count: number }>;
  baselineReading?: {
    nonePct: number;
    noneCount: number;
    level1Pct: number;
    level1Count: number;
    level2Pct: number;
    level2Count: number;
  };
  targetReading?: {
    nonePct: number;
    noneCount: number;
    level1Pct: number;
    level1Count: number;
    level2Pct: number;
    level2Count: number;
  };
  absencesOver4Target?: number;
  studentLearningStatus?: string; // កំណត់ត្រាស្ថានភាពសិក្សារបស់សិស្ស
  teacherReflection?: string; // ការឆ្លុះបញ្ចាំងរបស់គ្រូបង្រៀន
}

export interface AcademicTerm {
  id: string;
  nameKh: string; // e.g. '២០២៦ ~ ២០២៧'
  nameZh?: string;
  isCurrent?: boolean;
}

export type HomeworkSubmissionStatus = 'submitted' | 'missing' | 'not_submitted' | 'late';

export interface DailyHomeworkRecord {
  id: string;
  classId: string; // '8A'..'10C'
  date: string; // YYYY-MM-DD
  assigned: boolean;
  homeworkTitle: string;
  homeworkDetail: string;
  dueDate: string;
  // កំណត់ត្រាមេរៀន (Lesson Record fields that sync to សម្រង់អត្ថបទប្រចាំសប្តាហ៍)
  lessonUnitTitle?: string;
  lessonTitle?: string;
  lessonContentDetails?: string;
  syncedToWeeklyLog?: boolean;
  submissions: Record<string, HomeworkSubmissionStatus>;
  notes: Record<string, string>;
}

export interface SignatureDateConfig {
  lunarDay: string; // ថ្ងៃ............................ (e.g. 'ចន្ទ ៥កើត')
  lunarMonth: string; // ខែ............. (e.g. 'មិគសិរ')
  lunarYearEra: string; // ឆ្នាំម្សាញ់ សប្តស័ក ព.ស.២៥៦៩
  gregorianLocation: string; // រាជធានីភ្នំពេញ
  gregorianDay: string; // ថ្ងៃទី........ (e.g. '០១')
  gregorianMonth: string; // ខែ............ (e.g. 'វិច្ឆិកា')
  gregorianYear: string; // ឆ្នាំ២០២... (e.g. '២០២៦')
}

export interface PerformanceAgreementMeta {
  mainHeadingKh: string; // e.g. 'វត្ថុបំណងបំពេញការងារ'
  agreementTitleKh: string; // e.g. 'កិច្ចព្រមព្រៀងលទ្ធផល ប្រចាំឆ្នាំ២០២៥ របស់គ្រូបង្រៀន'
  academicPeriodKh: string; // e.g. 'ប្រចាំឆ្នាំសិក្សា ២០២៥ - ២០២៦ ចាប់ពីខែ មករា ដល់ ខែ តុលា ឆ្នាំ២០២៦'
  reviewSubtitleKh: string; // e.g. 'ការកំណត់វត្ថុបំណង និងលក្ខណៈវិនិច្ឆ័យបំពេញការងារ សម្រាប់ ការពិនិត្យឡើងវិញ ការអនុវត្តការងារមន្ត្រីឆ្នាំ ២០២៥-២០២៦'
  objective1TitleKh: string; // e.g. 'វត្ថុបំណងទី១៖ លទ្ធផលសិក្សារៀនសូត្ររបស់សិស្សមុខវិជ្ជា ( ភាសាចិន ) ថ្នាក់ទី ៨ ទី៩ និងទី១០'
}

export interface AnnualClassroomPlanColumnPair {
  count: string;
  pct: string;
}

export type AnnualPlanColumnKey =
  | 'baseline'
  | 'sem1Target'
  | 'sem1Actual'
  | 'sem2Target'
  | 'sem2Actual'
  | 'yearEndTarget'
  | 'yearEndActual';

export interface AnnualClassroomPlanSheet {
  classId: string;
  planTitleYearKh: string; // e.g. '២០២៤ - ២០២៥' or '២០២៥ - ២០២៦'
  homeroomTeacherName: string; // ឈ្មោះគ្រូបន្ទុកថ្នាក់
  phoneNumber: string; // លេខទូរសព្ទ
  totalStudentsOverride?: string;
  femaleStudentsOverride?: string;
  scoreRange100Text?: string;
  scoreRange50Text?: string;
  rows: Record<GradeLetter | 'TOTAL', Record<AnnualPlanColumnKey, AnnualClassroomPlanColumnPair>>;
}

export type ClassroomPerformanceMark = '' | 'good' | 'half' | 'bad';

export interface MonthlyScoreSheetConfig {
  examMax: number; // default 25 (or 50 for 100-pt scale)
  attendanceMax: number; // default 5 (or 10 for 100-pt scale)
  performanceMax: number; // default 10 (or 20 for 100-pt scale)
  homeworkMax: number; // default 10 (or 20 for 100-pt scale)
  sessionCount: number; // default 4 (can be 2, 3, 4, 5, 6)
  sessionDates: Record<number, string>; // 1..6 -> YYYY-MM-DD
  scoringEndDate: string; // YYYY-MM-DD (算分截止/结束日期)
  isScoringFinished?: boolean;
}

export interface StudentMonthlyBreakdownEntry {
  performanceMarks: Record<number, ClassroomPerformanceMark>; // sessionIndex 1..6 -> 'good' (✓) | 'half' (○) | 'bad' (✗) | ''
  examScore: ScoreValue; // 考试得分 (out of examMax, e.g. 25)
  attendanceScoreOverride?: number | null; // 考勤得分 override (out of attendanceMax, e.g. 5)
  performanceScoreOverride?: number | null; // 课堂表现得分 override (out of performanceMax, e.g. 10)
  homeworkScoreOverride?: number | null; // 作业得分 override (out of homeworkMax, e.g. 10)
  totalScoreOverride?: number | null; // 总分 override (out of 50 or 100)
}

// classId -> monthId -> MonthlyScoreSheetConfig
export type AllMonthlyScoreConfigs = Record<string, Record<string, MonthlyScoreSheetConfig>>;

// classId -> monthId -> studentId -> StudentMonthlyBreakdownEntry
export type AllMonthlyScoreBreakdowns = Record<
  string,
  Record<string, Record<string, StudentMonthlyBreakdownEntry>>
>;

export interface AppDatabaseState {
  version: string;
  updatedAt: string;
  useKhmerNumerals: boolean;
  academicTerms?: AcademicTerm[];
  currentTermId?: string;
  signatureDate?: SignatureDateConfig;
  performanceAgreementMeta?: PerformanceAgreementMeta;
  annualClassroomPlans?: Record<string, AnnualClassroomPlanSheet>;
  monthlyScoreConfigs?: AllMonthlyScoreConfigs;
  monthlyScoreBreakdowns?: AllMonthlyScoreBreakdowns;
  schoolInfo: SchoolInfo;
  classes: ClassGroup[];
  students: Student[];
  months: MonthConfig[];
  gradeThresholds: GradeThresholds;
  scores: ClassChineseScores;
  attendance: ClassSessionAttendance;
  sessionDates: ClassSessionDateLabels;
  sessionMonths?: ClassSessionMonthLabels;
  attendanceSheetConfigs?: AllAttendanceSheetConfigs;
  standardEvaluations: AllStandardEvaluations;
  teacherTaskReports: AllTeacherTaskReports;
  dailyHomeworkRecords?: DailyHomeworkRecord[];
  weeklyLogs: WeeklyLessonLogItem[];
  weeklyLogMeta?: WeeklyLogSignatureMeta;
  curriculumPlan: CurriculumPlanItem[];
  lessonPlans: ChineseLessonPlan[];
  performanceTargets: ClassPerformanceTarget[];
}

export interface ComputedChineseStudentRow {
  studentId: string;
  studentCode: string;
  name: string;
  chineseName: string;
  gender: Gender;
  dob: string;
  status: StudentStatus;
  note: string;
  monthScores: Record<string, ScoreValue>;
  evaluatedMonthsCount: number;
  totalScore: number;
  averageScore: number | null; // Out of maxScore (default 50)
  percentageScore: number | null; // 0-100%
  rank: number | null;
  isTied: boolean;
  grade: GradeLetter | '-';
}
