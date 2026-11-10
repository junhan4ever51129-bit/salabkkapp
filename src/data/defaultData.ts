import {
  AcademicTerm,
  AllAttendanceSheetConfigs,
  AllStandardEvaluations,
  AllTeacherTaskReports,
  AnnualClassroomPlanSheet,
  AppDatabaseState,
  AttendanceStatus,
  ChineseLessonPlan,
  ClassChineseScores,
  ClassGroup,
  ClassPerformanceTarget,
  ClassSessionAttendance,
  ClassSessionDateLabels,
  ClassSessionMonthLabels,
  CurriculumPlanItem,
  DailyHomeworkRecord,
  GradeLetter,
  GradeThresholds,
  MonthConfig,
  PerformanceAgreementMeta,
  SchoolInfo,
  SignatureDateConfig,
  Student,
  WeeklyLessonLogItem,
  WeeklyLogSignatureMeta,
} from '../types';
import { cleanClassDisplayCode, sortAllStudentsInDatabase } from '../utils/calculations';

export const DEFAULT_SCHOOL_INFO: SchoolInfo = {
  provinceKh: 'រាជធានីភ្នំពេញ',
  provinceEn: 'Phnom Penh Capital',
  departmentKh: 'មន្ទីរអប់រំ យុវជន និងកីឡារាជធានីភ្នំពេញ',
  departmentEn: 'Phnom Penh Department of Education, Youth and Sport',
  officeKh: 'ការិយាល័យអប់រំ យុវជន និងកីឡា នៃរដ្ឋបាលខណ្ឌបឹងកេងកង',
  officeEn: 'Boeung Keng Kang District Office of Education',
  schoolNameKh: 'វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង',
  schoolNameZh: '',
  schoolNameEn: 'Chea Sim Boeung Keng Kang High School',
  principalName: '',
  teacherName: 'លឹម ដាណេ',
  teacherPositionKh: 'គ្រូបង្រៀនកិច្ចសន្យា (ភាសាចិន)',
  subjectNameKh: 'ភាសាចិន',
  subjectNameZh: '汉语',
  subjectNameEn: 'Chinese Language',
  maxScore: 50,
  academicYear: '២០២៦ ~ ២០២៧',
};

export const DEFAULT_ACADEMIC_TERMS: AcademicTerm[] = [
  {
    id: 'term-2026-2027',
    nameKh: '២០២៦ ~ ២០២៧',
    nameZh: '2026-2027 ឆមាសទី១-២',
    isCurrent: true,
  },
  {
    id: 'term-2025-2026',
    nameKh: '២០២៥ ~ ២០២៦',
    nameZh: '2025-2026 ឆមាសទី១-២',
    isCurrent: false,
  },
];

export const DEFAULT_CLASSES: ClassGroup[] = [
  {
    id: '8A',
    name: '៨A',
    gradeLevel: 8,
    scheduleDayKh: 'ថ្ងៃអង្គារ',
    scheduleTime: '15:00-16:30',
    weeklyHoursLabel: '១ម៉ ៣០ន/ សប្តាហ៍',
    textbookName: '快乐汉语 (第一册) ភាសាចិនរីករាយ (កំរិត១)',
  },
  {
    id: '8B',
    name: '៨B',
    gradeLevel: 8,
    scheduleDayKh: 'ថ្ងៃព្រហស្បតិ៍',
    scheduleTime: '15:00-16:30',
    weeklyHoursLabel: '១ម៉ ៣០ន/ សប្តាហ៍',
    textbookName: '快乐汉语 (第一册) ភាសាចិនរីករាយ (កំរិត១)',
  },
  {
    id: '8C',
    name: '៨C',
    gradeLevel: 8,
    scheduleDayKh: 'ថ្ងៃអង្គារ',
    scheduleTime: '13:00-14:30',
    weeklyHoursLabel: '១ម៉ ៣០ន/ សប្តាហ៍',
    textbookName: '快乐汉语 (第一册) ភាសាចិនរីករាយ (កំរិត១)',
  },
  {
    id: '9A',
    name: '៩A',
    gradeLevel: 9,
    scheduleDayKh: 'ថ្ងៃចន្ទ',
    scheduleTime: '13:00-14:30',
    weeklyHoursLabel: '១ម៉ ៣០ន/ សប្តាហ៍',
    textbookName: '快乐汉语 (第一册) ភាសាចិនរីករាយ (កំរិត១)',
  },
  {
    id: '9B',
    name: '៩B',
    gradeLevel: 9,
    scheduleDayKh: 'ថ្ងៃព្រហស្បតិ៍',
    scheduleTime: '13:00-14:30',
    weeklyHoursLabel: '១ម៉ ៣០ន/ សប្តាហ៍',
    textbookName: '快乐汉语 (第一册) ភាសាចិនរីករាយ (កំរិត១)',
  },
  {
    id: '9C',
    name: '៩C',
    gradeLevel: 9,
    scheduleDayKh: 'ថ្ងៃចន្ទ',
    scheduleTime: '15:00-16:30',
    weeklyHoursLabel: '១ម៉ ៣០ន/ សប្តាហ៍',
    textbookName: '快乐汉语 (第一册) ភាសាចិនរីករាយ (កំរិត១)',
  },
  {
    id: '10A',
    name: '១០A',
    gradeLevel: 10,
    scheduleDayKh: 'ថ្ងៃពុធ',
    scheduleTime: '13:00-14:30',
    weeklyHoursLabel: '១ម៉ ៣០ន/ សប្តាហ៍',
    textbookName: '快乐汉语 (第二册) ភាសាចិនរីករាយ (កំរិត២)',
  },
  {
    id: '10C',
    name: '១០C',
    gradeLevel: 10,
    scheduleDayKh: 'ថ្ងៃពុធ',
    scheduleTime: '13:00-14:30',
    weeklyHoursLabel: '១ម៉ ៣០ន/ សប្តាហ៍',
    textbookName: '快乐汉语 (第二册) ភាសាចិនរីករាយ (កំរិត២)',
  },
];

// Helper to build student objects cleanly
function buildClassStudents(
  classId: string,
  items: [string, string, 'M' | 'F', string?, string?, string?][]
): Student[] {
  return items.map(([name, chineseName, gender, code, dob, note], idx) => ({
    id: `stu-${classId}-${idx + 1}`,
    classId,
    studentCode: code || String(idx + 1).padStart(2, '0'),
    name,
    chineseName,
    gender,
    dob: dob || '',
    status: 'active',
    note: note || '',
  }));
}

export const DEFAULT_STUDENTS: Student[] = [
  // Class 8A (30 students from PDF 1 pages 1-2)
  ...buildClassStudents('8A', [
    ['ខា សុខលីម', '卡若琳', 'F'],
    ['ខឿន រដ្ឋា', '柯洛他', 'M'],
    ['គា រតនៈ', '吉若那', 'M'],
    ['គឹម ច័ន្ទស្រីតុជ', '金珍珠', 'F'],
    ['ឃាង សុធានីន', '康素宁', 'F'],
    ['ង៉ូវ សុវណ្ណសោភា', '吴小燕', 'F'],
    ['ចាន់ ពេជ្រមុន្នី', '曾毕尼', 'M'],
    ['ចាន់ មុន្នីរិទ្ធ', '曾尼文', 'M'],
    ['ចាន់ សូថាវី', '曾苏婉', 'F'],
    ['ឆេង សត្យាបុត្រ', '陈明光', 'M'],
    ['ជិន ម៉ូនីកា', '甄妮卡', 'F'],
    ['ដួង គង់លីន', '杜光琳', 'M'],
    ['ឌុម វាសនា', '杜万那', 'M'],
    ['ថន សុវណ្ណាស័ក្ត', '唐文辉', 'M'],
    ['ថៃ ម៉ូលីតា', '泰丽达', 'F'],
    ['ទូច វឌ្ឍនា', '杜文南', 'M'],
    ['ធួក សុខសាន្ត', '杜速安', 'M'],
    ['នាង ស៊ីយី', '男夕义', 'M'],
    ['នី សុវណ្ណនុច', '尼文竹', 'M'],
    ['នឿន ថមមី', '诺童明', 'M'],
    ['នឿន ផានិត', '诺凡尼', 'M'],
    ['បញ្ញា សោម៉ានីតា', '马妮达', 'F'],
    ['ប៉ែន សុខសុគន្ធធានី', '文淑妮', 'F'],
    ['ប៊ុន គីមហេង', '文金兴', 'M'],
    ['ប៊ុន ស៊ីវលីង', '文秀玲', 'F'],
    ['បូរ ប៊ុន នីតា', '文妮达', 'F'],
    ['ផល សុខភាសាន', '文苏仙', 'M'],
    ['ផុន បរមី', '万博美', 'F'],
    ['ភិន ច័ន្ទរតនៈ', '文塔那', 'M'],
    ['អ៊ុន ទិត្យធីណាសត្យា', '黄速亚', 'M'],
  ]),

  // Class 8B (Exact 25 students & DOBs from តារាងស្ថិតិសិស្សមកពីថ្នាក់ទី ៨ (B) ខែ ឧសភា មុខវិជ្ជា ភាសាចិន)
  ...buildClassStudents('8B', [
    ['ឆេម ចិត្រា', '陈振达', 'M', '19101', '1/7/2012'],
    ['ជុំ រិទ្ធិរាជ', '朱迪仁', 'M', '19102', '11/7/2011'],
    ['ទេព ច័ន្ទរស្មីឧត្តម', '丁吴童', 'M', '19103', '12/21/2012'],
    ['ពៅ ចាន់ចំរុង', '宝振荣', 'M', '19104', '6/29/2009'],
    ['ប្រាប វឌ្ឍនា', '布万那', 'M', '19105', '10/23/2012'],
    ['ភ័ណ្ឌ វណ្ណាពិសី', '彭碧琪', 'F', '19106', '12/2/2012'],
    ['ភ័ស្ត ផលលីម', '梦菲琳', 'F', '19107', '5/10/2012'],
    ['ម៉ាន់ សាន់ទ្រីយ៉ា', '王立山', 'M', '19108', '10/12/2011'],
    ['ម៉ឹង ពិសិដ្ឋមង្គល', '孟明古', 'M', '19109', '12/25/2011'],
    ['មាស សុខវិជ្ជាឧត្តម', '金吴东', 'M', '19110', '12/9/2009'],
    ['មុត សុខលាភ', '莫素丽', 'F', '19111', '1/30/2012'],
    ['មុំ ចាន់លីណា', '梦丽娜', 'F', '19112', '9/21/2012'],
    ['មួន ស៊ុនហេង', '木速兴', 'M', '19113', '12/22/2012'],
    ['មឿន ស្រីការ', '孟素华', 'F', '19114', '11/30/2011'],
    ['យិន ប៊ុនតុង', '尹文通', 'M', '19115', '9/14/2009'],
    ['យិន រ៉ាយុទ្ធ', '尹如达', 'M', '19116', '4/4/2011'],
    ['យ៉ុន ម៉ូនីកា', '云茉莉', 'F', '19117', '2/10/2012'],
    ['យឹម សូលីដូ', '任利独', 'M', '19118', '9/8/2011'],
    ['យឿន សុដានី', '永书达', 'M', '19119', '7/21/2012'],
    ['រស់ សត្យា', '若思亚', 'M', '19120', '10/12/2011'],
    ['រ៉ា ដារ៉ាន់', '拉达然', 'M', '19121', '5/7/2012'],
    ['រ៉ា រិទ្ធ', '拉锐迪', 'M', '19122', '10/6/2006'],
    ['រ៉ាវុធ ពិសី', '拉碧琪', 'F', '19123', '7/8/2012', 'ឈប់រៀន'],
    ['រិទ្ធី មករា', '任末冉', 'M', '19124', '1/7/2011'],
    ['រត្ន សុវត្តិមា', '伟雅美', 'F', '19125', '2/7/2012'],
  ]),

  // Class 8C (Exact 24 students, Student IDs & DOBs from បញ្ជីរាយនាមសិស្សថ្នាក់ទី ៨ C (ខែ ឧសភា) សម្រាប់គ្រូបង្រៀន)
  ...buildClassStudents('8C', [
    ['ឈិន វឌ្ឍនៈ', '陈文那', 'M', '19010', '10/9/2012'],
    ['ដួង ដាវង្ស', '杜达明', 'M', '18958', '27/03/2012'],
    ['ណាត សៀវម៉ី', '罗秀美', 'F', '18662', '4/10/2012'],
    ['ណាត ណាវីណាត', '王维娜', 'F', '18590', '3/29/2012'],
    ['លី ច័ន្ទអ៊ី', '李展伊', 'F', '18792', '10/5/2012'],
    ['លឹម ទេសឫទ្ធិ', '林德瑞', 'M', '18793', '10/5/2012'],
    ['វ៉ាន់ សុខម៉េងឡុង', '万明朗', 'M', '18789', '11/23/2012'],
    ['សា ពិសិដ្ឋ', '萨比实', 'M', '18795', '8/25/2011'],
    ['សាន សុឃីម', '尚素琴', 'F', '18796', '9/18/2012'],
    ['សារិន រតនៈសម្បត្តិ', '尚速丹', 'M', '18797', '1/31/2012'],
    ['សារុន វិទូកញ្ចនា', '桑卡娜', 'F', '18802', '6/17/2012'],
    ['សិដ្ឋ សូលីដា', '森丽达', 'F', '18927', '1/26/2013'],
    ['សុត មុន្នីកា', '苏敏娜', 'F', '18805', '9/9/2012'],
    ['សឿន សុជាតិតា', '孙洁达', 'F', '18806', '4/6/2012'],
    ['សោម សេរីវុទ្ធ', '绍瑞文', 'M', '18807', '3/25/2012'],
    ['សៅ ពេជ្ររតនៈ', '邵罗纳', 'M', '18808', '11/22/2012'],
    ['សៅ វិបុលណាវី', '邵芝雅', 'F', '18809', '4/21/2012'],
    ['ស្រេង សុម៉ាវត្តី', '盛素达', 'F', '18810', '11/15/2012'],
    ['ហ៊ឹម រត្តិកា', '洪芮卡', 'F', '18593', '11/21/2012'],
    ['ហុង បញ្ញាពេជ្រ', '洪雅珍', 'F', '18813', '12/2/2012'],
    ['ហែម កញ្ចនា', '何美娜', 'F', '18814', '1/2/2010'],
    ['អ៊ុំ បញ្ញា', '黄柏那', 'M', '18820', '6/28/2012'],
    ['អាន ឌីម៉ានុត', '安迪诺', 'M', '18816', '12/15/2012'],
    ['អេត ស្រីលីន', '安淑琳', 'F', '18817', '5/26/2011'],
  ]),

  // Class 9A (21 students from PDF 1 page 7)
  ...buildClassStudents('9A', [
    ['ខា សុខឡេង', '卡素玲', 'F'],
    ['គង់ សុម៉ាវត្តី', '光万达', 'F'],
    ['សួន ភារម្យ', '谢速平', 'M'],
    ['គឹម ខាវី', '金凯威', 'M'],
    ['គឹម ស៊ីដារ៉ា', '金达拉', 'M'],
    ['គូ វីរៈយុទ្ធ', '谷文月', 'M'],
    ['ឃុន សុវណ្ណគីរី', '昆速利', 'M'],
    ['ង៉ែត លីយ៉ា', '吴丽雅', 'F'],
    ['ចន្ថា សុបញ្ញា', '张速那', 'M'],
    ['ញិល ហិល', '宁利华', 'M'],
    ['ញឹម គឹមឡាង', '宁金兰', 'F'],
    ['ឌី ច័ន្ទសំណាង', '迪速南', 'M'],
    ['ពៅ សុខសាន្ត សុធនវឌ្ឍនៈបញ្ញា', '宁柏那', 'M'],
    ['តាំង ស៊ីវឡុង', '唐小龙', 'M'],
    ['តុប អែនណា', '邓安娜', 'F'],
    ['ថន ស្រីកែវ', '佟丽娇', 'F'],
    ['ធី សិដ្ឋ', '迪思达', 'M'],
    ['ប៊ុន ករុណា', '文如那', 'M'],
    ['ផល លឿនសិរីពរ', '彭丽凤', 'F'],
    ['ហ៊ន ស្រីនិត្យ', '黄素宁', 'F'],
    ['ម៉ៅ ចំណូលថនិកា', '毛丽华', 'F'],
  ]),

  // Class 9B (21 students from PDF 1 page 9)
  ...buildClassStudents('9B', [
    ['កេ ណារិទ្ធ', '高宁为', 'M'],
    ['ធូ អ៊ីងហ្គែន', '唐英俊', 'M'],
    ['នី ស៊ីស៊ីង', '倪席心', 'F'],
    ['ប៉ាក់ សុភី', '白速平', 'M'],
    ['ប៉ាវ វីរៈយុទ្ធ', '包伟月', 'M'],
    ['ប៊ិន គីមហ័ង', '文金凰', 'F'],
    ['ផាត យូប៊ីន', '范如冰', 'M'],
    ['ភឿន ទីណា', '文迪那', 'M'],
    ['ម៉ៅ វណ្ណា', '毛万那', 'M'],
    ['មាស ចន្ទសុវណ្ណធិរាជ', '金文利', 'M'],
    ['យាហាន ហាមីត', '哈米', 'M'],
    ['រស់ បញ្ញាលីដា', '阮丽达', 'F'],
    ['រ៉ែន រាជសី', '李平安', 'M'],
    ['រិទ្ធី បញ្ញាស័ក្ត', '任南书', 'M'],
    ['រុន ម៉េងយ៉ាង', '任明阳', 'M'],
    ['រុន ម៉េងយូរ', '任明如', 'M'],
    ['លី រក្សា', '李利沙', 'M'],
    ['វុធ ដារ៉ា', '王达拉', 'M'],
    ['ឡេង ប៊ុនលាភ', '良文兴', 'M'],
    ['អ៊ីម អានុពង្ស', '黄君珩', 'M'],
    ['អ៊ីម អានុរាជ', '黄君弘', 'M'],
  ]),

  // Class 9C (18 students from PDF 1 page 11)
  ...buildClassStudents('9C', [
    ['រ៉ានីត ពន្លឺ', '罗柏良', 'M'],
    ['វ៉ាត់ មុន្នីជោត', '王昱俊', 'M'],
    ['វ៉ាន់ដារី រម្យនា', '王若宁', 'F'],
    ['វ៉េត វីយ៉ាវីន', '王雅文', 'F'],
    ['វិចិត្រ សុវណ្ណនីកា', '文淑爱', 'F'],
    ['វិន នីកូ', '卫尼克', 'M'],
    ['ស៊ីវ៉ាន់ សិរីរាជតា', '席丽妲', 'F'],
    ['សាន សុខនីន', '尚素宁', 'F'],
    ['សាវឿន សុធានីម', '尚素丽', 'F'],
    ['សុខ សម្បត្តិ', '苏司伯', 'M'],
    ['សុខា ពិសី', '苏碧琪', 'F'],
    ['សួន ចន្ទពិសិដ្ឋ', '孙彼晨', 'M'],
    ['សៅ សុច័ន្ទរ៉ានី', '沈雅妮', 'F'],
    ['ស្រី រក្សា', '沈丽莎', 'F'],
    ['ហន សុធាវណ្ណ', '黄速达', 'M'],
    ['ហេង វិទូ', '沈碧独', 'M'],
    ['ឡុង ដារ៉ាវីត', '龙达伟', 'M'],
    ['ឡុង ពេជ្រវិមាន', '龙丽华', 'F'],
  ]),

  // Class 10A (25 students from PDF 1 pages 13-14)
  ...buildClassStudents('10A', [
    ['កេ ណារ៉ាក់', '高那乐', 'M'],
    ['ខៀវ បញ្ចពណ៌', '侨美玲', 'F'],
    ['គី ចរណៃ', '季如娜', 'F'],
    ['គី ទីណា', '柯迪南', 'M'],
    ['ឃាង បញ្ញាវ័ន្ត', '康文安', 'M'],
    ['ចន នីម', '卓宁', 'M'],
    ['ចាប រ៉ាវុធ', '陈拉文', 'M'],
    ['ច័ន្ទ ម៉ូណាលីតា', '展丽达', 'F'],
    ['ជា រតនា', '谢速达', 'M'],
    ['ឈាត ម៉ារ៉ាទីន', '倩马廷', 'M'],
    ['ឈិត សេងលាភ', '陈盛辛', 'M'],
    ['ណាន់ ភ័ក្ត្រា', '南明轩', 'M'],
    ['ណុប ស្រីពីន', '宁素嫔', 'F'],
    ['ថុល ឥន្ទ្រៈវេហាស៍', '童南兴', 'M'],
    ['ធា បញ្ញា', '田柏纳', 'M'],
    ['ធីម លាងហេង', '丁良兴', 'F'],
    ['នឿន ផានុន', '宁柏农', 'M'],
    ['ផលទី សុគច័ន្ទ', '范素展', 'F'],
    ['ផា វិច្ឆិកា', '史月', 'F'],
    ['សូ ជូលី', '苏珠丽', 'F'],
    ['សឿន ម៉ាណែត', '沈马奈', 'M'],
    ['សំណាង ជុតិវង្ស', '苏之旺', 'M'],
    ['ហួរ ជីងលៀង', '华晶莲', 'F'],
    ['ហេង ស៊ីនួន', '兴西暖', 'F'],
    ['ឡយ គីមមួយ', '赖金梅', 'F'],
  ]),

  // Class 10C (19 students from PDF 1 page 15 & PDF 7 & PDF 8 with real Student IDs & DOBs)
  ...buildClassStudents('10C', [
    ['ថោង វីរៈបុត្រ', '唐昊辰', 'M', '18660', '19/9/2009'],
    ['ណុប ដាវី', '宁达伟', 'M', '18572', '22/3/2009'],
    ['ភាព ស្រីកា', '文淑雅', 'F', '18628', '13/8/2009'],
    ['ម៉ៅ លីដា', '毛丽达', 'F', '18656', '7/3/2011'],
    ['សិន ហ្គឺរីឡា', '孙利拉', 'M', '18659', '10/5/2010'],
    ['សារឹម វិសាល', '沈文思', 'M', '18368', '14/4/2010'],
    ['សុបិន្ត សុជាតា', '苏速达', 'F', '18369', '18/3/2010'],
    ['សុខ លីហ្សា', '速丽莎', 'F', '18488', '26/6/2010'],
    ['សួន លក្ខិណា', '苏丽娜', 'F', '18970', '10/9/2010'],
    ['សឿន ផុនា', '孙福那', 'M', '18901', '3/7/2008', 'មិនដែលមករៀន'],
    ['សេន ម៉ារាជ', '沈君辰', 'M', '18375', '27/6/2010'],
    ['សែន ស៊ីណាតូ', '沈拿督', 'M', '18671', '5/7/2011'],
    ['ស្វាយ កត្តញ្ញូ', '司承恩', 'M', '18661', '6/8/2009'],
    ['សំ ឌីណាយ៉ាដែន', '苏亚诚', 'M', '18971', '12/4/2010'],
    ['ហុង ស៊ីវហ្វុង', '洪秀锋', 'M', '18379', '12/12/2010'],
    ['ហុន សុភ័ក្ត្រ', '洪诗翔', 'M', '18380', '13/9/2009'],
    ['ហួយ ដាណេ', '黄达妮', 'F', '18381', '21/6/2010'],
    ['អ៊ុត សេដ្ឋវិទូ', '吴司徒', 'M', '18969', '5/2/2010'],
    ['អួន សុក្ររក្សា', '欧丽莎', 'F', '18387', '24/4/2009', 'សុំមិនបង់ថវិកា'],
  ]),
];

export const DEFAULT_MONTHS: MonthConfig[] = [
  {
    id: 'nov',
    nameKh: 'វិច្ឆិកា',
    nameEn: 'November',
    semester: 1,
    year: 2026,
    monthIndex: 10,
    daysInMonth: 30,
    lunarDate: 'ថ្ងៃចន្ទ ៧រោច ខែកត្តិក ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី៣០ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
    enabled: true,
  },
  {
    id: 'dec',
    nameKh: 'ធ្នូ',
    nameEn: 'December',
    semester: 1,
    year: 2026,
    monthIndex: 11,
    daysInMonth: 31,
    lunarDate: 'ថ្ងៃព្រហស្បតិ៍ ៧រោច ខែមិគសិរ ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី៣១ ខែធ្នូ ឆ្នាំ២០២៦',
    enabled: true,
  },
  {
    id: 'jan',
    nameKh: 'មករា',
    nameEn: 'January',
    semester: 1,
    year: 2027,
    monthIndex: 0,
    daysInMonth: 31,
    lunarDate: 'ថ្ងៃអាទិត្យ ៩រោច ខែបុស្ស ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី៣១ ខែមករា ឆ្នាំ២០២៧',
    enabled: true,
  },
  {
    id: 'feb',
    nameKh: 'កុម្ភៈ',
    nameEn: 'February',
    semester: 1,
    year: 2027,
    monthIndex: 1,
    daysInMonth: 28,
    lunarDate: 'ថ្ងៃអាទិត្យ ៧រោច ខែមាឃ ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី២៨ ខែកុម្ភៈ ឆ្នាំ២០២៧',
    enabled: true,
  },
  {
    id: 'mar',
    nameKh: 'មីនា',
    nameEn: 'March',
    semester: 1,
    year: 2027,
    monthIndex: 2,
    daysInMonth: 31,
    lunarDate: 'ថ្ងៃពុធ ៩រោច ខែផល្គុន ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី៣១ ខែមីនា ឆ្នាំ២០២៧',
    enabled: true,
  },
  {
    id: 'sem1',
    nameKh: 'ឆមាសទី១',
    nameEn: 'Semester 1 Exam',
    semester: 1,
    isSemesterExam: true,
    year: 2027,
    monthIndex: 2,
    daysInMonth: 31,
    lunarDate: 'ថ្ងៃពុធ ៩រោច ខែផល្គុន ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី៣១ ខែមីនា ឆ្នាំ២០២៧',
    enabled: true,
  },
  {
    id: 'may',
    nameKh: 'ឧសភា',
    nameEn: 'May',
    semester: 2,
    year: 2027,
    monthIndex: 4,
    daysInMonth: 31,
    lunarDate: 'ថ្ងៃចន្ទ ១០រោច ខែពិសាខ ឆ្នាំមមែ នព្វស័ក ព.ស.២៥៧១',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី៣១ ខែឧសភា ឆ្នាំ២០២៧',
    enabled: true,
  },
  {
    id: 'jun',
    nameKh: 'មិថុនា',
    nameEn: 'June',
    semester: 2,
    year: 2027,
    monthIndex: 5,
    daysInMonth: 30,
    lunarDate: 'ថ្ងៃពុធ ១១រោច ខែជេស្ឋ ឆ្នាំមមែ នព្វស័ក ព.ស.២៥៧១',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី៣០ ខែមិថុនា ឆ្នាំ២០២៧',
    enabled: true,
  },
  {
    id: 'jul',
    nameKh: 'កក្កដា',
    nameEn: 'July',
    semester: 2,
    year: 2027,
    monthIndex: 6,
    daysInMonth: 31,
    lunarDate: 'ថ្ងៃសៅរ៍ ១២រោច ខែអាសាឍ ឆ្នាំមមែ នព្វស័ក ព.ស.២៥៧១',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី៣១ ខែកក្កដា ឆ្នាំ២០២៧',
    enabled: true,
  },
  {
    id: 'aug',
    nameKh: 'សីហា',
    nameEn: 'August',
    semester: 2,
    year: 2027,
    monthIndex: 7,
    daysInMonth: 31,
    lunarDate: 'ថ្ងៃអង្គារ ១៤រោច ខែស្រាពណ៍ ឆ្នាំមមែ នព្វស័ក ព.ស.២៥៧១',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី៣១ ខែសីហា ឆ្នាំ២០២៧',
    enabled: true,
  },
  {
    id: 'sem2',
    nameKh: 'ឆមាសទី២',
    nameEn: 'Semester 2 Exam',
    semester: 2,
    isSemesterExam: true,
    year: 2027,
    monthIndex: 7,
    daysInMonth: 31,
    lunarDate: 'ថ្ងៃអង្គារ ១៤រោច ខែស្រាពណ៍ ឆ្នាំមមែ នព្វស័ក ព.ស.២៥៧១',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី៣១ ខែសីហា ឆ្នាំ២០២៧',
    enabled: true,
  },
];

export const DEFAULT_GRADE_THRESHOLDS: GradeThresholds = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
  E: 50,
};

function generateDefaultScores(): ClassChineseScores {
  const scores: ClassChineseScores = {};

  // Populate scores for all classes, including exact scores for 10C from PDF 6 (when they were in 8C)
  const pdf6ScoresFor10C: Record<number, { may: number; jun: number; jul: number; sem2: number; nov: number; dec: number; jan: number; feb: number }> = {
    1: { nov: 42, dec: 44, jan: 45, feb: 46, may: 42, jun: 44, jul: 45, sem2: 46 }, // ថោង វីរៈបុត្រ
    2: { nov: 35, dec: 38, jan: 36, feb: 40, may: 3, jun: 0, jul: 0, sem2: 0 }, // ណុប ដាវី
    3: { nov: 38, dec: 40, jan: 42, feb: 41, may: 31, jun: 34, jul: 25, sem2: 25 }, // ភាព ស្រីកា
    4: { nov: 46, dec: 48, jan: 49, feb: 50, may: 5, jun: 50, jul: 40, sem2: 50 }, // ម៉ៅ លីដា
    5: { nov: 32, dec: 34, jan: 35, feb: 36, may: 35, jun: 41, jul: 17, sem2: 25 }, // សិន ហ្គឺរីឡា
    6: { nov: 36, dec: 38, jan: 37, feb: 39, may: 30, jun: 32, jul: 28, sem2: 30 }, // សារឹម វិសាល
    7: { nov: 33, dec: 35, jan: 34, feb: 36, may: 3, jun: 23, jul: 14, sem2: 25 }, // សុបិន្ត សុជាតា
    8: { nov: 40, dec: 42, jan: 41, feb: 43, may: 38, jun: 40, jul: 39, sem2: 41 }, // សុខ លីហ្សា
    9: { nov: 41, dec: 43, jan: 42, feb: 44, may: 40, jun: 42, jul: 41, sem2: 43 }, // សួន លក្ខិណា
    10: { nov: 0, dec: 0, jan: 0, feb: 0, may: 5, jun: 0, jul: 0, sem2: 0 }, // សឿន ផុនា
    11: { nov: 30, dec: 32, jan: 33, feb: 35, may: 2, jun: 0, jul: 0, sem2: 0 }, // សេន ម៉ារាជ
    12: { nov: 34, dec: 36, jan: 37, feb: 38, may: 11, jun: 37, jul: 0, sem2: 6 }, // សែន ស៊ីណាតូ
    13: { nov: 35, dec: 36, jan: 38, feb: 39, may: 10, jun: 29, jul: 0, sem2: 4 }, // ស្វាយ កត្តញ្ញូ
    14: { nov: 36, dec: 37, jan: 38, feb: 40, may: 15, jun: 32, jul: 25, sem2: 3 }, // សំ ឌីណាយ៉ាដែន
    15: { nov: 50, dec: 50, jan: 50, feb: 50, may: 50, jun: 50, jul: 50, sem2: 50 }, // ហុង ស៊ីវហ្វុង
    16: { nov: 37, dec: 39, jan: 40, feb: 41, may: 27, jun: 34, jul: 0, sem2: 25 }, // ហុន សុភ័ក្ត្រ
    17: { nov: 43, dec: 44, jan: 45, feb: 46, may: 38, jun: 40, jul: 42, sem2: 44 }, // ហួយ ដាណេ
    18: { nov: 34, dec: 35, jan: 36, feb: 37, may: 30, jun: 32, jul: 33, sem2: 35 }, // អ៊ុត សេដ្ឋវិទូ
    19: { nov: 32, dec: 34, jan: 35, feb: 36, may: 14, jun: 28, jul: 25, sem2: 0 }, // អួន សុក្ររក្សា
  };

  DEFAULT_CLASSES.forEach((cls) => {
    scores[cls.id] = {};
    const isGrade10 = cls.gradeLevel >= 10 || /^(10|១០)/.test(cls.id);
    const scaleFactor = isGrade10 ? 2 : 1;
    const maxCap = isGrade10 ? 100 : 50;
    const classStudents = DEFAULT_STUDENTS.filter((s) => s.classId === cls.id);
    classStudents.forEach((stu, idx) => {
      if (cls.id === '10C' && pdf6ScoresFor10C[idx + 1]) {
        const rawMap = pdf6ScoresFor10C[idx + 1];
        scores[cls.id][stu.id] = {
          nov: Math.min(maxCap, Math.round(rawMap.nov * scaleFactor)),
          dec: Math.min(maxCap, Math.round(rawMap.dec * scaleFactor)),
          jan: Math.min(maxCap, Math.round(rawMap.jan * scaleFactor)),
          feb: Math.min(maxCap, Math.round(rawMap.feb * scaleFactor)),
          may: Math.min(maxCap, Math.round(rawMap.may * scaleFactor)),
          jun: Math.min(maxCap, Math.round(rawMap.jun * scaleFactor)),
          jul: Math.min(maxCap, Math.round(rawMap.jul * scaleFactor)),
          sem2: Math.min(maxCap, Math.round(rawMap.sem2 * scaleFactor)),
        };
      } else {
        const base = Math.max(21, 46 - (idx % 12) * 2.1);
        scores[cls.id][stu.id] = {
          nov: Math.max(18 * scaleFactor, Math.min(maxCap, Math.round((base - 3) * scaleFactor))),
          dec: Math.min(maxCap, Math.round(base * scaleFactor)),
          jan: Math.min(maxCap, Math.round((base + 1.5) * scaleFactor)),
          feb: Math.min(maxCap, Math.round((base + 2.5) * scaleFactor)),
          mar: Math.min(maxCap, Math.round((base + 3) * scaleFactor)),
          sem1: Math.min(maxCap, Math.round((base + 3.5) * scaleFactor)),
          may: Math.min(maxCap, Math.round((base + 3) * scaleFactor)),
          jun: Math.min(maxCap, Math.round((base + 3.5) * scaleFactor)),
          jul: Math.min(maxCap, Math.round((base + 4) * scaleFactor)),
          sem2: Math.min(maxCap, Math.round((base + 4.5) * scaleFactor)),
        };
      }
    });
  });

  return scores;
}

function generateDefaultSessionDates(): ClassSessionDateLabels {
  const map: ClassSessionDateLabels = {};
  DEFAULT_CLASSES.forEach((cls) => {
    map[cls.id] = {
      nov: { 1: '04', 2: '11', 3: '18', 4: '25', 5: '02', 6: '09', 7: '16', 8: '23', 9: '30', 10: '06' },
      dec: { 1: '03', 2: '10', 3: '17', 4: '24', 5: '31', 6: '07', 7: '14', 8: '21', 9: '28', 10: '' },
      jan: { 1: '07', 2: '14', 3: '21', 4: '28', 5: '04', 6: '11', 7: '18', 8: '25', 9: '', 10: '' },
      feb: { 1: '04', 2: '11', 3: '18', 4: '25', 5: '04', 6: '11', 7: '18', 8: '25', 9: '', 10: '' },
      mar: { 1: '04', 2: '11', 3: '18', 4: '25', 5: '', 6: '', 7: '', 8: '', 9: '', 10: '' },
    };
  });
  return map;
}

function generateDefaultSessionMonths(): ClassSessionMonthLabels {
  const map: ClassSessionMonthLabels = {};
  DEFAULT_CLASSES.forEach((cls) => {
    map[cls.id] = {
      nov: { 1: 'វិច្ឆិកា', 2: 'វិច្ឆិកា', 3: 'វិច្ឆិកា', 4: 'វិច្ឆិកា', 5: 'ធ្នូ', 6: 'ធ្នូ', 7: 'ធ្នូ', 8: 'ធ្នូ', 9: 'ធ្នូ', 10: 'មករា' },
      dec: { 1: 'ធ្នូ', 2: 'ធ្នូ', 3: 'ធ្នូ', 4: 'ធ្នូ', 5: 'ធ្នូ', 6: 'មករា', 7: 'មករា', 8: 'មករា', 9: 'មករា', 10: '' },
      jan: { 1: 'មករា', 2: 'មករា', 3: 'មករា', 4: 'មករា', 5: 'កុម្ភៈ', 6: 'កុម្ភៈ', 7: 'កុម្ភៈ', 8: 'កុម្ភៈ', 9: '', 10: '' },
      feb: { 1: 'កុម្ភៈ', 2: 'កុម្ភៈ', 3: 'កុម្ភៈ', 4: 'កុម្ភៈ', 5: 'មីនា', 6: 'មីនា', 7: 'មីនា', 8: 'មីនា', 9: '', 10: '' },
      mar: { 1: 'មីនា', 2: 'មីនា', 3: 'មីនា', 4: 'មីនា', 5: '', 6: '', 7: '', 8: '', 9: '', 10: '' },
    };
  });
  return map;
}

function generateDefaultAttendanceSheetConfigs(): AllAttendanceSheetConfigs {
  const map: AllAttendanceSheetConfigs = {};
  DEFAULT_CLASSES.forEach((cls) => {
    map[cls.id] = {
      nov: { monthHeaderLabel: 'វិច្ឆិកា ~ ធ្នូ', columnCount: 10, blankRowsCount: 2 },
      dec: { monthHeaderLabel: 'ធ្នូ ~ មករា', columnCount: 10, blankRowsCount: 2 },
      jan: { monthHeaderLabel: 'មករា ~ កុម្ភៈ', columnCount: 10, blankRowsCount: 2 },
      feb: { monthHeaderLabel: 'កុម្ភៈ ~ មីនា', columnCount: 10, blankRowsCount: 2 },
      mar: { monthHeaderLabel: 'មីនា', columnCount: 10, blankRowsCount: 2 },
    };
  });
  return map;
}

function generateDefaultAttendance(): ClassSessionAttendance {
  const att: ClassSessionAttendance = {};
  DEFAULT_CLASSES.forEach((cls) => {
    att[cls.id] = { nov: {}, dec: {}, jan: {}, feb: {}, mar: {}, may: {}, jun: {}, jul: {} };
    const classStudents = DEFAULT_STUDENTS.filter((s) => s.classId === cls.id);
    classStudents.forEach((stu, idx) => {
      let baseSessionMap: Record<number, AttendanceStatus>;
      if (stu.note.includes('មិនដែលមករៀន')) {
        // Missed all 4 sessions in the month
        baseSessionMap = { 1: 'U', 2: 'U', 3: 'U', 4: 'U' };
      } else if ((cls.id === '8B' && idx === 21) || (cls.id !== '8B' && idx === 7)) {
        // Missed 3 out of 4 sessions (> half of the 4 monthly classes -> ឈប់ច្រើន = 3)
        baseSessionMap = { 1: 'P', 2: 'U', 3: 'E', 4: 'U' };
      } else {
        baseSessionMap = {
          1: 'P',
          2: idx === 4 ? 'E' : 'P',
          3: 'P',
          4: 'P',
        };
      }
      ['nov', 'dec', 'jan', 'feb', 'mar', 'may', 'jun', 'jul'].forEach((mKey) => {
        att[cls.id][mKey][stu.id] = { ...baseSessionMap };
      });
    });
  });
  return att;
}

function generateDefaultStandardEvaluations(): AllStandardEvaluations {
  // Exact data from PDF 7 (ស្តង់ដាទី១ បំណិនសម្បទា និងចរិយាសម្បទា ថ្នាក់ទី 10C ខែកុម្ភៈ មីនា ឧសភា) & PDF 8 (បញ្ជីរាយនាមសិស្សថ្នាក់ទី 10C)
  const evals: AllStandardEvaluations = {};

  const feb10C: [number | null, number | null, string][] = [
    [3, 3, ''],
    [4, 5, ''],
    [3, 5, ''],
    [5, 5, ''],
    [null, null, ''],
    [4, 3, ''],
    [3, 3, ''],
    [4, 4, ''],
    [4, 5, ''],
    [null, null, 'មិនដែលមករៀន'],
    [3, 3, ''],
    [4, 3, ''],
    [3, 3, ''],
    [3, 4, ''],
    [5, 5, ''],
    [3, 3, ''],
    [4, 5, ''],
    [3, 4, ''],
    [3, 4, 'សុំមិនបង់ថវិកា'],
  ];

  const mar10C: [number | null, number | null, string][] = [
    [3, 3, ''],
    [4, 5, ''],
    [4, 5, ''],
    [5, 5, ''],
    [null, null, ''],
    [4, 3, ''],
    [3, 4, ''],
    [4, 4, ''],
    [4, 5, ''],
    [null, null, 'មិនដែលមករៀន'],
    [3, 4, ''],
    [null, null, ''],
    [3, 4, ''],
    [3, 4, ''],
    [5, 5, ''],
    [3, 3, ''],
    [4, 5, ''],
    [3, 4, ''],
    [3, 5, 'សុំមិនបង់ថវិកា'],
  ];

  const may10C: [number | null, number | null, string][] = [
    [2, 3, ''],
    [3, 4, ''],
    [3, 3, ''],
    [5, 5, ''],
    [null, null, ''],
    [3, 4, ''],
    [3, 3, ''],
    [3, 4, ''],
    [3, 4, ''],
    [null, null, 'មិនដែលមករៀន'],
    [null, null, ''],
    [null, null, ''],
    [2, 3, ''],
    [2, 2, ''],
    [5, 5, ''],
    [2, 3, ''],
    [2, 3, ''],
    [null, null, ''],
    [2, 3, 'សុំមិនបង់ថវិកា'],
  ];

  // Exact Class 8B Student Statistics & Skill/Attitude Scores from តារាងស្ថិតិសិស្សមកពីថ្នាក់ទី ៨ (B) ខែ ឧសភា
  // [isWeakLearner, absentCount, skillScore, attitudeScore, remark]
  const may8B: Record<string, [boolean, string, number | null, number | null, string]> = {
    '19101': [false, '', 3, 5, ''], // ឆេម ចិត្រា
    '19102': [true, '✓', 0, 0, ''], // ជុំ រិទ្ធិរាជ
    '19103': [true, '✓', 0, 0, ''], // ទេព ច័ន្ទរស្មីឧត្តម
    '19104': [true, '✓', 0, 0, ''], // ពៅ ចាន់ចំរុង
    '19105': [false, '', 4, 5, ''], // ប្រាប វឌ្ឍនា
    '19106': [true, '✓', 0, 0, ''], // ភ័ណ្ឌ វណ្ណាពិសី
    '19107': [true, '✓', 0, 0, ''], // ភ័ស្ត ផលលីម
    '19108': [true, '✓', 0, 0, ''], // ម៉ាន់ សាន់ទ្រីយ៉ា
    '19109': [false, '', 2, 3, ''], // ម៉ឹង ពិសិដ្ឋមង្គល
    '19110': [false, '', 2, 2, ''], // មាស សុខវិជ្ជាឧត្តម
    '19111': [false, '', 4, 5, ''], // មុត សុខលាភ
    '19112': [true, '✓', 0, 0, ''], // មុំ ចាន់លីណា
    '19113': [false, '', 1, 1, ''], // មួន ស៊ុនហេង
    '19114': [false, '', 1, 1, ''], // មឿន ស្រីការ
    '19115': [false, '', 3, 3, ''], // យិន ប៊ុនតុង
    '19116': [false, '', 3, 2, ''], // យិន រ៉ាយុទ្ធ
    '19117': [false, '', 2, 3, ''], // យ៉ុន ម៉ូនីកា
    '19118': [false, '', 2, 2, ''], // យឹម សូលីដូ
    '19119': [false, '', 2, 3, ''], // យឿន សុដានី
    '19120': [false, '', 4, 5, ''], // រស់ សត្យា
    '19121': [true, '✓', 1, 1, ''], // រ៉ា ដារ៉ាន់
    '19122': [true, '✓', 0, 0, ''], // រ៉ា រិទ្ធ
    '19123': [false, '', null, null, 'ឈប់រៀន'], // រ៉ាវុធ ពិសី
    '19124': [true, '✓', 0, 0, ''], // រិទ្ធី មករា
    '19125': [false, '', 2, 3, ''], // រត្ន សុវត្តិមា
  };

  // Exact Class 8C Teacher Checklist from បញ្ជីរាយនាមសិស្សថ្នាក់ទី ៨ C (ខែ ឧសភា) សម្រាប់គ្រូបង្រៀន
  // [receivedHomework, completedTasks, hasStudyPlan, hasTextbook]
  const may8CChecklist: Record<string, [boolean, boolean, boolean, boolean]> = {
    '19010': [false, false, false, false], // ឈិន វឌ្ឍនៈ
    '18958': [true, false, false, false], // ដួង ដាវង្ស
    '18662': [true, true, false, false], // ណាត សៀវម៉ី
    '18590': [true, true, false, true], // ណាត ណាវីណាត
    '18792': [true, true, false, true], // លី ច័ន្ទអ៊ី
    '18793': [true, true, false, true], // លឹម ទេសឫទ្ធិ
    '18789': [true, false, false, false], // វ៉ាន់ សុខម៉េងឡុង
    '18795': [true, true, false, true], // សា ពិសិដ្ឋ
    '18796': [true, true, false, true], // សាន សុឃីម
    '18797': [true, false, false, false], // សារិន រតនៈសម្បត្តិ
    '18802': [true, true, false, true], // សារុន វិទូកញ្ចនា
    '18927': [true, true, false, true], // សិដ្ឋ សូលីដា
    '18805': [true, true, false, true], // សុត មុន្នីកា
    '18806': [true, true, false, true], // សឿន សុជាតិតា
    '18807': [true, true, false, true], // សោម សេរីវុទ្ធ
    '18808': [true, false, false, false], // សៅ ពេជ្ររតនៈ
    '18809': [true, true, false, true], // សៅ វិបុលណាវី
    '18810': [true, true, false, false], // ស្រេង សុម៉ាវត្តី
    '18593': [true, true, false, true], // ហ៊ឹម រត្តិកា
    '18813': [true, true, false, true], // ហុង បញ្ញាពេជ្រ
    '18814': [true, true, false, true], // ហែម កញ្ចនា
    '18820': [true, true, false, false], // អ៊ុំ បញ្ញា
    '18816': [true, true, false, false], // អាន ឌីម៉ានុត
    '18817': [true, true, false, false], // អេត ស្រីលីន
  };

  DEFAULT_CLASSES.forEach((cls) => {
    evals[cls.id] = { nov: {}, dec: {}, jan: {}, feb: {}, mar: {}, may: {}, jun: {}, jul: {} };
    const classStudents = DEFAULT_STUDENTS.filter((s) => s.classId === cls.id);
    classStudents.forEach((stu, idx) => {
      if (cls.id === '8B' && may8B[stu.studentCode]) {
        const [weak, absCnt, sk, att, rem] = may8B[stu.studentCode];
        const base8B = {
          skillScore: sk,
          attitudeScore: att,
          isWeakLearner: weak,
          absentCount: absCnt,
          receivedPreStudy: !weak,
          receivedHomework: !weak,
          completedTasks: !weak,
          hasStudyPlan: false,
          goodCooperation: !weak,
          hasTextbook: true,
          readingSpeedCategory: '30to50' as const,
          remark: rem,
        };
        ['nov', 'dec', 'jan', 'feb', 'mar', 'may', 'jun', 'jul'].forEach((mKey) => {
          evals[cls.id][mKey][stu.id] = { ...base8B };
        });
        return;
      }

      if (cls.id === '8C' && may8CChecklist[stu.studentCode]) {
        const [recHw, compHw, studyPlan, hasTb] = may8CChecklist[stu.studentCode];
        const base8C = {
          skillScore: compHw ? 4 : 2,
          attitudeScore: compHw ? 5 : 3,
          isWeakLearner: !compHw,
          absentCount: recHw ? '' : '✓',
          receivedPreStudy: recHw,
          receivedHomework: recHw,
          completedTasks: compHw,
          hasStudyPlan: studyPlan,
          goodCooperation: hasTb,
          hasTextbook: hasTb,
          readingSpeedCategory: '30to50' as const,
          remark: '',
          manualOverrides: {
            hasTextbook: true,
          },
        };
        ['nov', 'dec', 'jan', 'feb', 'mar', 'may', 'jun', 'jul'].forEach((mKey) => {
          evals[cls.id][mKey][stu.id] = { ...base8C };
        });
        return;
      }

      const f: [number | null, number | null, string] =
        cls.id === '10C' ? feb10C[idx] : [4, 5, ''];
      const m: [number | null, number | null, string] =
        cls.id === '10C' ? mar10C[idx] : [4, 5, ''];
      const my: [number | null, number | null, string] =
        cls.id === '10C' ? may10C[idx] : [4, 5, ''];
      const isActivePresent = Boolean(f && f[0] !== null);

      evals[cls.id]['feb'][stu.id] = {
        skillScore: f ? f[0] : 4,
        attitudeScore: f ? f[1] : 5,
        isWeakLearner: false,
        absentCount: '',
        receivedPreStudy: isActivePresent,
        receivedHomework: isActivePresent,
        completedTasks: isActivePresent,
        hasStudyPlan: false,
        goodCooperation: isActivePresent,
        hasTextbook: isActivePresent,
        readingSpeedCategory: '30to50',
        remark: f ? f[2] : '',
      };

      evals[cls.id]['mar'][stu.id] = {
        skillScore: m ? m[0] : 4,
        attitudeScore: m ? m[1] : 5,
        isWeakLearner: false,
        absentCount: '',
        receivedPreStudy: Boolean(m && m[0] !== null),
        receivedHomework: Boolean(m && m[0] !== null),
        completedTasks: Boolean(m && m[0] !== null),
        hasStudyPlan: false,
        goodCooperation: Boolean(m && m[0] !== null),
        hasTextbook: Boolean(m && m[0] !== null),
        readingSpeedCategory: '30to50',
        remark: m ? m[2] : '',
      };

      evals[cls.id]['may'][stu.id] = {
        skillScore: my ? my[0] : 4,
        attitudeScore: my ? my[1] : 5,
        isWeakLearner: false,
        absentCount: '',
        receivedPreStudy: Boolean(my && my[0] !== null),
        receivedHomework: Boolean(my && my[0] !== null),
        completedTasks: Boolean(my && my[0] !== null),
        hasStudyPlan: false,
        goodCooperation: Boolean(my && my[0] !== null),
        hasTextbook: Boolean(my && my[0] !== null),
        readingSpeedCategory: '30to50',
        remark: my ? my[2] : '',
      };

      ['nov', 'dec', 'jan', 'jun', 'jul'].forEach((mKey) => {
        evals[cls.id][mKey][stu.id] = {
          ...evals[cls.id]['may'][stu.id],
        };
      });
    });
  });

  return evals;
}

function generateDefaultTeacherTaskReports(): AllTeacherTaskReports {
  const reports: AllTeacherTaskReports = {};
  DEFAULT_CLASSES.forEach((cls) => {
    reports[cls.id] = {
      nov: {
        monthTitleKh: 'វិច្ឆិកា',
        preStudyAssignedCount: 1,
        preStudyDetails: [
          'ក. មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន? — ស្វ័យសិក្សាពាក្យថ្មី (ពាក្យថ្មី, ល្បះ)',
        ],
        projectAssignedCount: 1,
        projectDetails: [
          'ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?',
        ],
        homeworkAssignedCount: 1,
        homeworkDetails: [
          'ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?',
        ],
        homeworkGradedCount: 1,
        vulnerableStudentsNote:
          'សិស្សក្រីក្រ ជួបការលំបាក សិស្សរងហិង្សាឬមានវិបត្តិផ្លូវចិត្ត សិស្សឈប់ច្រើនម៉ោងខ្លួន សិស្សរៀនខ្សោយមុខវិជ្ជាខ្លួន',
      },
      jan: {
        monthTitleKh: 'មករា',
        preStudyAssignedCount: 1,
        preStudyDetails: [
          'ក. មេរៀនទី៣ មួយថ្ងៃរបស់ខ្ញុំ — ស្វ័យសិក្សាពាក្យថ្មី (ពាក្យថ្មី, ល្បះ)',
        ],
        projectAssignedCount: 1,
        projectDetails: ['ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ មេរៀនទី៣ មួយថ្ងៃរបស់ខ្ញុំ'],
        homeworkAssignedCount: 1,
        homeworkDetails: ['ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ មេរៀនទី៣ មួយថ្ងៃរបស់ខ្ញុំ'],
        homeworkGradedCount: 1,
        vulnerableStudentsNote:
          'សិស្សក្រីក្រ ជួបការលំបាក សិស្សរងហិង្សាឬមានវិបត្តិផ្លូវចិត្ត សិស្សឈប់ច្រើនម៉ោងខ្លួន សិស្សរៀនខ្សោយមុខវិជ្ជាខ្លួន',
      },
      feb: {
        monthTitleKh: 'កុម្ភៈ',
        preStudyAssignedCount: 1,
        preStudyDetails: [
          'ក. មេរៀនទី៤ បន្ទប់របស់ខ្ញុំ — ស្វ័យសិក្សាពាក្យថ្មី (ពាក្យថ្មី, ល្បះ)',
        ],
        projectAssignedCount: 1,
        projectDetails: ['ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ មេរៀនទី៤ បន្ទប់របស់ខ្ញុំ'],
        homeworkAssignedCount: 1,
        homeworkDetails: ['ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ មេរៀនទី៤ បន្ទប់របស់ខ្ញុំ'],
        homeworkGradedCount: 1,
        vulnerableStudentsNote:
          'សិស្សក្រីក្រ ជួបការលំបាក សិស្សរងហិង្សាឬមានវិបត្តិផ្លូវចិត្ត សិស្សឈប់ច្រើនម៉ោងខ្លួន សិស្សរៀនខ្សោយមុខវិជ្ជាខ្លួន',
      },
      jul: {
        monthTitleKh: 'កក្កដា',
        preStudyAssignedCount: 1,
        preStudyDetails: [
          'ក. មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន? — ស្វ័យសិក្សាពាក្យថ្មី (ពាក្យថ្មី, ល្បះ)',
        ],
        projectAssignedCount: 1,
        projectDetails: ['ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?'],
        homeworkAssignedCount: 1,
        homeworkDetails: ['ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?'],
        homeworkGradedCount: 1,
        scoredSkillAttitudeCountOverride: null,
        studentPreStudyCountOverride: 0,
        studentProjectCountOverride: 0,
        studentHomeworkCountOverride: 0,
        studentStudyPlanCountOverride: 0,
        vulnerableStudentsNote:
          'សិស្សក្រីក្រ ជួបការលំបាក សិស្សរងហិង្សាឬមានវិបត្តិផ្លូវចិត្ត សិស្សឈប់ច្រើនម៉ោងខ្លួន សិស្សរៀនខ្សោយមុខវិជ្ជាខ្លួន',
      },
    };
  });
  return reports;
}

export const DEFAULT_WEEK1_WEEKLY_LOG_META: WeeklyLogSignatureMeta = {
  fridayDateStr: '06/11/2026',
  lunarDate: 'ថ្ងៃសុក្រ ១២រោច ខែកត្តិក ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០',
  gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី០៦ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
  textbookTitle: '快乐汉语（第一册 & 第二册）ភាសាចិនរីករាយ (កំរិត១ និង កំរិត២)',
};

export const DEFAULT_WEEK2_WEEKLY_LOG_META: WeeklyLogSignatureMeta = {
  fridayDateStr: '13/11/2026',
  lunarDate: 'ថ្ងៃសុក្រ ៥កើត ខែកត្តិក ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០',
  gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី១៣ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
  textbookTitle: '快乐汉语（第二册）ភាសាចិនរីករាយ (កំរិត២)',
};

export const DEFAULT_WEEKLY_LOG_META: WeeklyLogSignatureMeta = DEFAULT_WEEK2_WEEKLY_LOG_META;

export const LESSON_7_VOCAB_CONTENT_DETAILS =
  '1. 生词 (ពាក្យថ្មីទាំង ១១ ពាក្យ) ៖ 1.买 (mǎi : ទិញ) 2.和 (hé : និង/ជាមួយ) 3.点心 (diǎnxin : នំចំណី) 4.还 (hái : នៅ...ទៀត) 5.要 (yào : ចង់បាន/យក) 6.瓶 (píng : ដប) 7.斤 (jīn : គីឡូកន្លះ/៥០០ក្រាម) 8.东西 (dōngxi : របស់របរ/អីវ៉ាន់) 9.水 (shuǐ : ទឹក) 10.酒 (jiǔ : ស្រា) 11.蛋糕 (dàngāo : នំខេក)\n2. 词组搭配与认读 (ការផ្សំពាក្យ និងអាន) ៖ 买东西、一瓶水、一斤苹果、喝水、吃点心、买蛋糕、还要什么\n3. 笔顺与拼音发音 (ហាត់សរសេរតាមលំដាប់លំដោយកម្រងអក្សរ និងបញ្ចេញសំឡេង)\nកិច្ចការផ្ទះ (作业) ៖ ចម្លងពាក្យថ្មីដែលបានរៀនទាំង ១១ ពាក្យ ក្នុង១ពាក្យ ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写所学11个生词各5遍，下周交)';

// Weekly Lesson Log for Week 2 (Tuesday 10/11/2026 to Thursday 12/11/2026: Lesson 7 What do you buy? - 11 Vocabulary words + copy 5 times. NOTE: Monday 09/11/2026 is Independence Day holiday, Monday classes generated on Tuesday)
export const DEFAULT_WEEK2_WEEKLY_LOGS: WeeklyLessonLogItem[] = [
  {
    id: 'wlog-w2-1',
    weekLabel: 'សប្តាហ៍ទី២ (០៩-១៣ វិច្ឆិកា ២០២៦)',
    dateStr: '10/11/2026',
    weekdayKh: 'អង្គារ',
    timeRange: '13:00-14:30',
    classId: '10C',
    unitTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (生词)',
    contentDetails: LESSON_7_VOCAB_CONTENT_DETAILS,
  },
  {
    id: 'wlog-w2-2',
    weekLabel: 'សប្តាហ៍ទី២ (០៩-១៣ វិច្ឆិកា ២០២៦)',
    dateStr: '10/11/2026',
    weekdayKh: 'អង្គារ',
    timeRange: '15:00-16:30',
    classId: '10B',
    unitTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (生词)',
    contentDetails: LESSON_7_VOCAB_CONTENT_DETAILS,
  },
  {
    id: 'wlog-w2-3',
    weekLabel: 'សប្តាហ៍ទី២ (០៩-១៣ វិច្ឆិកា ២០២៦)',
    dateStr: '10/11/2026',
    weekdayKh: 'អង្គារ',
    timeRange: '13:00-14:30',
    classId: '9C',
    unitTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (生词)',
    contentDetails: LESSON_7_VOCAB_CONTENT_DETAILS,
  },
  {
    id: 'wlog-w2-4',
    weekLabel: 'សប្តាហ៍ទី២ (០៩-១៣ វិច្ឆិកា ២០២៦)',
    dateStr: '10/11/2026',
    weekdayKh: 'អង្គារ',
    timeRange: '13:00-14:30',
    classId: '8C',
    unitTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (生词)',
    contentDetails: LESSON_7_VOCAB_CONTENT_DETAILS,
  },
  {
    id: 'wlog-w2-5',
    weekLabel: 'សប្តាហ៍ទី២ (០៩-១៣ វិច្ឆិកា ២០២៦)',
    dateStr: '10/11/2026',
    weekdayKh: 'អង្គារ',
    timeRange: '15:00-16:30',
    classId: '8A',
    unitTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (生词)',
    contentDetails: LESSON_7_VOCAB_CONTENT_DETAILS,
  },
  {
    id: 'wlog-w2-6',
    weekLabel: 'សប្តាហ៍ទី២ (០៩-១៣ វិច្ឆិកា ២០២៦)',
    dateStr: '11/11/2026',
    weekdayKh: 'ពុធ',
    timeRange: '15:00-16:30',
    classId: '9A',
    unitTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (生词)',
    contentDetails: LESSON_7_VOCAB_CONTENT_DETAILS,
  },
  {
    id: 'wlog-w2-7',
    weekLabel: 'សប្តាហ៍ទី២ (០៩-១៣ វិច្ឆិកា ២០២៦)',
    dateStr: '11/11/2026',
    weekdayKh: 'ពុធ',
    timeRange: '13:00-14:30',
    classId: '10A',
    unitTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (生词)',
    contentDetails: LESSON_7_VOCAB_CONTENT_DETAILS,
  },
  {
    id: 'wlog-w2-8',
    weekLabel: 'សប្តាហ៍ទី២ (០៩-១៣ វិច្ឆិកា ២០២៦)',
    dateStr: '12/11/2026',
    weekdayKh: 'ព្រហស្បតិ៍',
    timeRange: '13:00-14:30',
    classId: '9B',
    unitTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (生词)',
    contentDetails: LESSON_7_VOCAB_CONTENT_DETAILS,
  },
  {
    id: 'wlog-w2-9',
    weekLabel: 'សប្តាហ៍ទី២ (០៩-១៣ វិច្ឆិកា ២០២៦)',
    dateStr: '12/11/2026',
    weekdayKh: 'ព្រហស្បតិ៍',
    timeRange: '15:00-16:30',
    classId: '8B',
    unitTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (生词)',
    contentDetails: LESSON_7_VOCAB_CONTENT_DETAILS,
  },
];

// Exact Weekly Lesson Log for Week 1 (Monday to Thursday: Review Pinyin 23 initials & 24 finals + homework copy 5 times)
export const DEFAULT_WEEK1_WEEKLY_LOGS: WeeklyLessonLogItem[] = [
  {
    id: 'wlog-1',
    weekLabel: 'សប្តាហ៍ទី១ (០២-០៦ វិច្ឆិកា ២០២៦)',
    dateStr: '02/11/2026',
    weekdayKh: 'ចន្ទ',
    timeRange: '13:00-14:30',
    classId: '9A',
    unitTitle: '汉语基础（复习）· មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
    lessonTitle: '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)',
    contentDetails:
      '1. រំលឹកព្យញ្ជនៈទាំង ២៣ (២៣ 声母) ៖ b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w\n2. រំលឹកស្រៈទាំង ២៤ (២៤ 韵母) ៖ a, o, e, i, u, ü, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong\n3. ហាត់អាន បញ្ចេញសំឡេង និងសរសេរឱ្យបានត្រឹមត្រូវ (会读会记 会正确拼读与书写)\nកិច្ចការផ្ទះ (作业) ៖ ចម្លងព្យញ្ជនៈ (声母) ២៣ និង ស្រៈ (韵母) ២៤ ចំនួន ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写声母和韵母各5遍，下周交)',
  },
  {
    id: 'wlog-2',
    weekLabel: 'សប្តាហ៍ទី១ (០២-០៦ វិច្ឆិកា ២០២៦)',
    dateStr: '02/11/2026',
    weekdayKh: 'ចន្ទ',
    timeRange: '15:00-16:30',
    classId: '9C',
    unitTitle: '汉语基础（复习）· មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
    lessonTitle: '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)',
    contentDetails:
      '1. រំលឹកព្យញ្ជនៈទាំង ២៣ (២៣ 声母) ៖ b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w\n2. រំលឹកស្រៈទាំង ២៤ (២៤ 韵母) ៖ a, o, e, i, u, ü, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong\n3. ហាត់អាន បញ្ចេញសំឡេង និងសរសេរឱ្យបានត្រឹមត្រូវ (会读会记 会正确拼读与书写)\nកិច្ចការផ្ទះ (作业) ៖ ចម្លងព្យញ្ជនៈ (声母) ២៣ និង ស្រៈ (韵母) ២៤ ចំនួន ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写声母和韵母各5遍，下周交)',
  },
  {
    id: 'wlog-3',
    weekLabel: 'សប្តាហ៍ទី១ (០២-០៦ វិច្ឆិកា ២០២៦)',
    dateStr: '03/11/2026',
    weekdayKh: 'អង្គារ',
    timeRange: '13:00-14:30',
    classId: '8C',
    unitTitle: '汉语基础（复习）· មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
    lessonTitle: '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)',
    contentDetails:
      '1. រំលឹកព្យញ្ជនៈទាំង ២៣ (២៣ 声母) ៖ b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w\n2. រំលឹកស្រៈទាំង ២៤ (២៤ 韵母) ៖ a, o, e, i, u, ü, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong\n3. ហាត់អាន បញ្ចេញសំឡេង និងសរសេរឱ្យបានត្រឹមត្រូវ (会读会记 会正确拼读与书写)\nកិច្ចការផ្ទះ (作业) ៖ ចម្លងព្យញ្ជនៈ (声母) ២៣ និង ស្រៈ (韵母) ២៤ ចំនួន ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写声母和韵母各5遍，下周交)',
  },
  {
    id: 'wlog-4',
    weekLabel: 'សប្តាហ៍ទី១ (០២-០៦ វិច្ឆិកា ២០២៦)',
    dateStr: '03/11/2026',
    weekdayKh: 'អង្គារ',
    timeRange: '15:00-16:30',
    classId: '8A',
    unitTitle: '汉语基础（复习）· មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
    lessonTitle: '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)',
    contentDetails:
      '1. រំលឹកព្យញ្ជនៈទាំង ២៣ (២៣ 声母) ៖ b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w\n2. រំលឹកស្រៈទាំង ២៤ (២៤ 韵母) ៖ a, o, e, i, u, ü, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong\n3. ហាត់អាន បញ្ចេញសំឡេង និងសរសេរឱ្យបានត្រឹមត្រូវ (会读会记 会正确拼读与书写)\nកិច្ចការផ្ទះ (作业) ៖ ចម្លងព្យញ្ជនៈ (声母) ២៣ និង ស្រៈ (韵母) ២៤ ចំនួន ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写声母和韵母各5遍，下周交)',
  },
  {
    id: 'wlog-5',
    weekLabel: 'សប្តាហ៍ទី១ (០២-០៦ វិច្ឆិកា ២០២៦)',
    dateStr: '04/11/2026',
    weekdayKh: 'ពុធ',
    timeRange: '13:00-14:30',
    classId: '10A',
    unitTitle: '汉语基础（复习）· មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
    lessonTitle: '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)',
    contentDetails:
      '1. រំលឹកព្យញ្ជនៈទាំង ២៣ (២៣ 声母) ៖ b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w\n2. រំលឹកស្រៈទាំង ២៤ (២៤ 韵母) ៖ a, o, e, i, u, ü, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong\n3. ហាត់អាន បញ្ចេញសំឡេង និងសរសេរឱ្យបានត្រឹមត្រូវ (会读会记 会正确拼读与书写)\nកិច្ចការផ្ទះ (作业) ៖ ចម្លងព្យញ្ជនៈ (声母) ២៣ និង ស្រៈ (韵母) ២៤ ចំនួន ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写声母和韵母各5遍，下周交)',
  },
  {
    id: 'wlog-6',
    weekLabel: 'សប្តាហ៍ទី១ (០២-០៦ វិច្ឆិកា ២០២៦)',
    dateStr: '04/11/2026',
    weekdayKh: 'ពុធ',
    timeRange: '13:00-14:30',
    classId: '10C',
    unitTitle: '汉语基础（复习）· មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
    lessonTitle: '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)',
    contentDetails:
      '1. រំលឹកព្យញ្ជនៈទាំង ២៣ (២៣ 声母) ៖ b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w\n2. រំលឹកស្រៈទាំង ២៤ (២៤ 韵母) ៖ a, o, e, i, u, ü, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong\n3. ហាត់អាន បញ្ចេញសំឡេង និងសរសេរឱ្យបានត្រឹមត្រូវ (会读会记 会正确拼读与书写)\nកិច្ចការផ្ទះ (作业) ៖ ចម្លងព្យញ្ជនៈ (声母) ២៣ និង ស្រៈ (韵母) ២៤ ចំនួន ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写声母和韵母各5遍，下周交)',
  },
  {
    id: 'wlog-7',
    weekLabel: 'សប្តាហ៍ទី១ (០២-០៦ វិច្ឆិកា ២០២៦)',
    dateStr: '05/11/2026',
    weekdayKh: 'ព្រហស្បតិ៍',
    timeRange: '13:00-14:30',
    classId: '9B',
    unitTitle: '汉语基础（复习）· មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
    lessonTitle: '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)',
    contentDetails:
      '1. រំលឹកព្យញ្ជនៈទាំង ២៣ (២៣ 声母) ៖ b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w\n2. រំលឹកស្រៈទាំង ២៤ (២៤ 韵母) ៖ a, o, e, i, u, ü, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong\n3. ហាត់អាន បញ្ចេញសំឡេង និងសរសេរឱ្យបានត្រឹមត្រូវ (会读会记 会正确拼读与书写)\nកិច្ចការផ្ទះ (作业) ៖ ចម្លងព្យញ្ជនៈ (声母) ២៣ និង ស្រៈ (韵母) ២៤ ចំនួន ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写声母和韵母各5遍，下周交)',
  },
  {
    id: 'wlog-8',
    weekLabel: 'សប្តាហ៍ទី១ (០២-០៦ វិច្ឆិកា ២០២៦)',
    dateStr: '05/11/2026',
    weekdayKh: 'ព្រហស្បតិ៍',
    timeRange: '15:00-16:30',
    classId: '8B',
    unitTitle: '汉语基础（复习）· មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
    lessonTitle: '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)',
    contentDetails:
      '1. រំលឹកព្យញ្ជនៈទាំង ២៣ (២៣ 声母) ៖ b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w\n2. រំលឹកស្រៈទាំង ២៤ (២៤ 韵母) ៖ a, o, e, i, u, ü, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong\n3. ហាត់អាន បញ្ចេញសំឡេង និងសរសេរឱ្យបានត្រឹមត្រូវ (会读会记 会正确拼读与书写)\nកិច្ចការផ្ទះ (作业) ៖ ចម្លងព្យញ្ជនៈ (声母) ២៣ និង ស្រៈ (韵母) ២៤ ចំនួន ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写声母和韵母各5遍，下周交)',
  },
];

export const DEFAULT_WEEKLY_LOGS: WeeklyLessonLogItem[] = [
  ...DEFAULT_WEEK2_WEEKLY_LOGS,
  ...DEFAULT_WEEK1_WEEKLY_LOGS,
];

// Exact Annual Chinese Curriculum Plan from PDF 3 (កម្មវិធីសិក្សាភាសាចិន កំរិត២ ឆ្នាំសិក្សា ២០២៥ ~ ២០២៦)
export const DEFAULT_CURRICULUM_PLAN: CurriculumPlanItem[] = [
  {
    id: 'cur-1',
    monthNameKh: 'វិច្ឆិកា',
    weekNumber: '១',
    lessonContent:
      '汉语基础（复习）មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)\n- 声母 ព្យញ្ជនៈ · 韵母 ស្រៈ · 声调与拼读 សូរសំឡេង និងការរៀនប្រកប ភីនអ៊ីន',
    pageNumber: '-',
    hours: 1.5,
    note: '',
  },
  {
    id: 'cur-2',
    monthNameKh: 'វិច្ឆិកា',
    weekNumber: '២',
    lessonContent:
      '第三单元 购物 · 第七课 你买什么？ (មេរៀនទី៧ តើអ្នកទិញអ្វី? — 第一周只教生词)\n一. 生词 (ពាក្យថ្មីទាំង ១១ ពាក្យ) ៖ 1.买 (mǎi) 2.和 (hé) 3.点心 (diǎnxin) 4.还 (hái) 5.要 (yào) 6.瓶 (píng) 7.斤 (jīn) 8.东西 (dōngxi) 9.水 (shuǐ) 10.酒 (jiǔ) 11.蛋糕 (dàngāo)\n二. 词组与搭配 (ឃ្លា និងការផ្គុំពាក្យ) ៖ 买东西、一瓶水、一斤苹果、喝水、喝酒、吃点心、买蛋糕\n三. 作业 (កិច្ចការផ្ទះ) ៖ 抄写所学11个生词各5遍 (ចម្លងពាក្យថ្មីដែលបានរៀនទាំង ១១ ពាក្យ ក្នុង១ពាក្យ ៥ដង)',
    pageNumber: 'សៀ.សិស្ស (២៨-២៩)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី២ (រៀនតែពាក្យថ្មី)',
  },
  {
    id: 'cur-3',
    monthNameKh: 'វិច្ឆិកា',
    weekNumber: '៣',
    lessonContent:
      '第三单元 购物 · 第七课 你买什么？ (មេរៀនទី៧ តើអ្នកទិញអ្វី? — 这一周只上句型)\n一. 句型 (ទម្រង់ល្បះទាំង ៥) ៖\n1. 你买什么？ (Nǐ mǎi shénme? · តើអ្នកទិញអ្វី?)\n2. 我买鸡蛋和点心。 (Wǒ mǎi jīdàn hé diǎnxin. · ខ្ញុំទិញស៊ុតមាន់ និងនំចំណី។)\n3. 你还要什么？ (Nǐ hái yào shénme? · តើអ្នកត្រូវការអ្វីទៀត?)\n4. 我还要一瓶牛奶、两斤苹果。 (Wǒ hái yào yì píng niúnǎi, liǎng jīn píngguǒ. · ខ្ញុំត្រូវការទឹកដោះគោមួយដប និងផ្លែប៉ោមពីរគីឡូកន្លះទៀត។)\n5. 我想买很多东西。 (Wǒ xiǎng mǎi hěn duō dōngxi. · ខ្ញុំចង់ទិញរបស់របរជាច្រើន។)\n二. 句型替换与运用 (ការហាត់បង្កើតល្បះជំនួសពាក្យ) ៖ 还要... / 想买...\n三. 作业 (កិច្ចការផ្ទះ) ៖ 抄写所学5个句型各5遍并翻译 (ចម្លងទម្រង់ល្បះទាំង ៥ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ)',
    pageNumber: 'សៀ.សិស្ស (៤៤)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី៣ (រៀនតែ句型)',
  },
  {
    id: 'cur-4',
    monthNameKh: 'វិច្ឆិកា',
    weekNumber: '៤',
    lessonContent:
      '第三单元 购物 · 第七课 你买什么？ (មេរៀនទី៧ តើអ្នកទិញអ្វី? — 这一周只上对话)\n一. 对话一 (សន្ទនាទី១) ៖\nA: 你买什么？ B: 我买点心。\nA: 你买几斤？ B: 我买一斤。\nA: 你还要什么？ B: 我还要一瓶水和两瓶牛奶。\n二. 对话/短文二 (សន្ទនា/អត្ថបទខ្លីទី២) ៖\n今天是星期六，我要买很多东西。我要买五瓶水、三瓶牛奶，还要买六个鸡蛋、两斤苹果和一斤点心。\n三. 角色扮演 (Role-play) ៖ ការអនុវត្តសន្ទនាទិញលក់ទំនិញជាក់ស្តែងក្នុងថ្នាក់\n四. 作业 (កិច្ចការផ្ទះ) ៖ 抄写对话1和短文2各2遍并背诵对话1 (ចម្លងសន្ទនាទី១ និងអត្ថបទទី២ ចំនួន ២ដង ព្រមទាំងទន្ទេញចាំមាត់)',
    pageNumber: 'សៀ.សិស្ស (៤៥)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី៤ (រៀនតែ对话)',
  },
  {
    id: 'cur-5',
    monthNameKh: 'វិច្ឆិកា',
    weekNumber: '៥',
    lessonContent:
      '第三单元 购物 · 第七课 你买什么？ (មេរៀនទី៧ តើអ្នកទិញអ្វី? — 全完成课本与练习册)\n一. 课本练习 (សៀវភៅពុម្ព第44页-47页的练习) ៖ ការស្តាប់ ការអាន ការជ្រើសរើសចម្លើយ ការផ្គូផ្គង និងការឆ្លើយសំណួរ\n二. 练习册练习 (សៀវភៅលំហាត់第52页到58页) ៖ ហាត់សរសេរអក្សរចិន ការបំពេញល្បះ ការបកប្រែ និងការរៀបលំដាប់ពាក្យ\n三. 单元总结与评价 (សង្ខេប និងវាយតម្លៃបញ្ចប់មេរៀនទី៧ ទាំងមូល)\n四. 作业 (កិច្ចការផ្ទះ) ៖ 完成并订正课本第44-47页与练习册第52-58页的所有练习 (បំពេញ និងកែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់)',
    pageNumber: 'សៀ.សិស្ស (៤៤-៤៧) / សៀ.លំ (៥២-៥៨)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី៥ (បញ្ចប់មេរៀនទី៧ ទាំងស្រុង)',
  },
  {
    id: 'cur-6',
    monthNameKh: 'ធ្នូ',
    weekNumber: '១',
    lessonContent:
      '第三单元 购物 · 第八课 苹果多少钱一斤？ (មេរៀនទី៨ តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន? — 这一周只上生词)\n一. 生词 (ពាក្យថ្មីទាំង ១១ ពាក្យ) ៖ 1.多少 (duōshao) 2.钱 (qián) 3.块/元 (kuài/yuán) 4.毛 (máo) 5.一共 (yígòng) 6.猪肉 (zhūròu) 7.鸡 (jī) 8.零 (líng) 9.分 (fēn) 10.青菜 (qīngcài) 11.肉 (ròu)\n二. 词组搭配 (ការផ្សំពាក្យ) ៖ 多少钱、一斤猪肉、一只鸡、买青菜、一块钱、两毛钱、一共多少钱\n三. 作业 (កិច្ចការផ្ទះ) ៖ 抄写所学11个生词各5遍并翻译 (ចម្លងពាក្យថ្មីទាំង ១១ ពាក្យ ក្នុង១ពាក្យ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ)',
    pageNumber: 'សៀ.សិស្ស (៤៨-៤៩)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី១ (រៀនតែ生词)',
  },
  {
    id: 'cur-7',
    monthNameKh: 'ធ្នូ',
    weekNumber: '២',
    lessonContent:
      '第三单元 购物 · 第八课 苹果多少钱一斤？ (មេរៀនទី៨ តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន? — 这一周只上句型)\n一. 核心句型 (ទម្រង់ល្បះទាំង ៥) ៖\n1. 苹果多少钱一斤？ (Píngguǒ duōshao qián yì jīn? · តើផ្លែប៉ោមមួយគីឡូកន្លះតម្លៃប៉ុន្មាន?)\n2. 苹果四块两毛九一斤。 (Píngguǒ sì kuài liǎng máo jiǔ yì jīn. · ផ្លែប៉ោមមួយគីឡូកន្លះតម្លៃបួនយ័នពីរកាក់ប្រាំបួនសេន / ៤.២៩ យ័ន។)\n3. 你买多少？ (Nǐ mǎi duōshao? · តើអ្នកទិញប៉ុន្មាន?)\n4. 我要一斤半。 (Wǒ yào yì jīn bàn. · ខ្ញុំយកមួយគីឡូកន្លះនិងកន្លះទៀត / ៧៥០ក្រាម។)\n5. 一共多少钱？ (Yígòng duōshao qián? · សរុបទាំងអស់តម្លៃប៉ុន្មាន?)\n二. 语法重点 (វេយ្យាករណ៍ និងការបញ្ចេញតម្លៃប្រាក់ចិន) ៖ 块、毛、分、一斤半\n三. 作业 (កិច្ចការផ្ទះ) ៖ 抄写所学5个句型各5遍并翻译 (ចម្លងទម្រង់ល្បះទាំង ៥ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ)',
    pageNumber: 'សៀ.សិស្ស (៥០)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី២ (រៀនតែ句型)',
  },
  {
    id: 'cur-8',
    monthNameKh: 'ធ្នូ',
    weekNumber: '៣',
    lessonContent:
      '第三单元 购物 · 第八课 苹果多少钱一斤？ (មេរៀនទី៨ តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន? — 这一周只上对话)\n一. 对话一 (សន្ទនាទី១ ៖ សួរតម្លៃ និងទិញផ្លែប៉ោម) ៖\nA: 请问，苹果多少钱一斤？\nB: 四块二一斤。\nA: 我要一斤半。\n二. 对话二 (សន្ទនាទី២ ៖ ទិញសាច់ជ្រូក មាន់ និងគិតលុយសរុប) ៖\nA: 我要半斤猪肉。\nB: 你还要什么？\nA: 我还要一只鸡，一共多少钱？\nB: 一共二十三块零六分。\n三. 角色扮演 (Role-play) ៖ ការអនុវត្តសន្ទនាទិញលក់ និងការគិតប្រាក់ជាក់ស្តែង\n四. 作业 (កិច្ចការផ្ទះ) ៖ 抄写对话1和对话2各2遍并背诵对话1 (ចម្លងសន្ទនាទី១ និងទី២ ចំនួន ២ដង ព្រមទាំងទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់)',
    pageNumber: 'សៀ.សិស្ស (៥១)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី៣ (រៀនតែ对话)',
  },
  {
    id: 'cur-9',
    monthNameKh: 'ធ្នូ',
    weekNumber: '៤',
    lessonContent:
      '第三单元 购物 · 第八课 苹果多少钱一斤？ (មេរៀនទី៨ តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន? — 全完成课本与练习册)\n一. 课本练习 (សៀវភៅពុម្ព第50页-53页的练习) ៖ 听录音、看图问答、价格计算与交际活动 (ទំព័រ ៥០-៥៣)\n二. 练习册练习 (សៀវភៅលំហាត់第59页到64页) ៖ 汉字书写、看拼音写词语、连词成句与综合练习 (ទំព័រ ៥៩-៦៤)\n三. 单元总结与评价 (សង្ខេប និងវាយតម្លៃបញ្ចប់មេរៀនទី៨ ទាំងមូល)\n四. 作业 (កិច្ចការផ្ទះ) ៖ 完成并订正课本第50-53页与练习册第59-64页的所有练习 (បំពេញ និងកែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់)',
    pageNumber: 'សៀ.សិស្ស (៥០-៥៣) / សៀ.លំ (៥៩-៦៤)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី៤ (បញ្ចប់មេរៀនទី៨ ទាំងស្រុង)',
  },
  {
    id: 'cur-10',
    monthNameKh: 'មករា',
    weekNumber: '១',
    lessonContent:
      '第三单元 购物 · 第九课 这件衣服比那件贵一点儿 (មេរៀនទី៩ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច — 这一周只上生词)\n一. 生词 (ពាក្យថ្មីទាំង ១២ ពាក្យ) ៖ 1.件 (jiàn) 2.衣服 (yīfu) 3.贵 (guì) 4.一点儿 (yìdiǎnr) 5.自行车 (zìxíngchē) 6.跟 (gēn) 7.一样 (yíyàng) 8.毛衣 (máoyī) 9.短 (duǎn) 10.便宜 (piányi) 11.运动鞋 (yùndòngxié) 12.长 (cháng)\n二. 词组搭配 (ការផ្សំពាក្យ) ៖ 两件衣服、贵一点儿、跟...一样、便宜一点儿、买毛衣、穿运动鞋、头发长/短\n三. 作业 (កិច្ចការផ្ទះ) ៖ 抄写所学12个生词各5遍并翻译 (ចម្លងពាក្យថ្មីទាំង ១២ ពាក្យ ក្នុង១ពាក្យ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ)',
    pageNumber: 'សៀ.សិស្ស (៥៤-៥៥)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី១ (រៀនតែ生词)',
  },
  {
    id: 'cur-11',
    monthNameKh: 'មករា',
    weekNumber: '២',
    lessonContent:
      '第三单元 购物 · 第九课 这件衣服比那件贵一点儿 (មេរៀនទី៩ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច — 这一周只上句型)\n一. 核心句型 (ទម្រង់ល្បះទាំង ៥) ៖\n1. 这件衣服比那件贵一点儿。 (Zhè jiàn yīfu bǐ nà jiàn guì yìdiǎnr. · សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច។)\n2. 那件衣服没有这件衣服漂亮。 (Nà jiàn yīfu méiyǒu zhè jiàn yīfu piàoliang. · សំលៀកបំពាក់នោះមិនស្អាតដូចសំលៀកបំពាក់នេះទេ។)\n3. 他的自行车跟我的自行车一样。 (Tā de zìxíngchē gēn wǒ de zìxíngchē yíyàng. · កង់របស់គាត់ដូចគ្នានឹងកង់របស់ខ្ញុំដែរ។)\n4. 我的爱好跟你的爱好不一样。 (Wǒ de àihào gēn nǐ de àihào bù yíyàng. · ចំណង់ចំណូលចិត្តរបស់ខ្ញុំមិនដូចគ្នានឹងចំណង់ចំណូលចិត្តរបស់អ្នកទេ។)\n5. 哥哥比他大一点儿。 (Gēge bǐ tā dà yìdiǎnr. · បងប្រុសធំជាងគាត់បន្តិច។)\n二. 语法重点 (វេយ្យាករណ៍) ៖ 比较句「比」、否定比较「没有」、同异比较「跟...一样 / 不一样」\n三. 作业 (កិច្ចការផ្ទះ) ៖ 抄写所学5个句型各5遍并翻译 (ចម្លងទម្រង់ល្បះទាំង ៥ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ)',
    pageNumber: 'សៀ.សិស្ស (៥៦)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី២ (រៀនតែ句型)',
  },
  {
    id: 'cur-12',
    monthNameKh: 'មករា',
    weekNumber: '៣',
    lessonContent:
      '第三单元 购物 · 第九课 这件衣服比那件贵一点儿 (មេរៀនទី៩ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច — 这一周只上对话)\n一. 对话一 (សន្ទនាទី១ ៖ ប្រៀបធៀបកង់) ៖\nA: 这是你的自行车吗？\nB: 不是，这是Jim的自行车。\nA: 他的自行车跟我的自行车一样。\nB: 我的自行车跟你们的不一样。\n二. 短文二 (អត្ថបទខ្លីទី២ ៖ ប្រៀបធៀបសំលៀកបំពាក់ទាំងពីរ) ៖\n我有两件衣服。这件衣服比那件贵一点儿，那件衣服没有这件衣服漂亮。我喜欢这件。\n三. 角色扮演 (Role-play) ៖ ការអនុវត្តសន្ទនាប្រៀបធៀបរបស់របរជាក់ស្តែង\n四. 作业 (កិច្ចការផ្ទះ) ៖ 抄写对话1和短文2各2遍并背诵对话1 (ចម្លងសន្ទនាទី១ និងអត្ថបទខ្លីទី២ ចំនួន ២ដង ព្រមទាំងទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់)',
    pageNumber: 'សៀ.សិស្ស (៥៧)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី៣ (រៀនតែ对话)',
  },
  {
    id: 'cur-13',
    monthNameKh: 'មករា',
    weekNumber: '៤',
    lessonContent:
      '第三单元 购物 · 第九课 这件衣服比那件贵一点儿 (មេរៀនទី៩ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច — 全完成课本与练习册)\n一. 课本练习 (សៀវភៅពុម្ព第56页-60页的练习) ៖ 听录音比较、读课文连线、看图造句与课堂交际调查 (ទំព័រ ៥៦-៦០)\n二. 练习册练习 (សៀវភៅលំហាត់第65页到73页) ៖ 汉字书写描红、看拼音写汉字、改写句子、阅读短文与问答 (ទំព័រ ៦៥-៧៣)\n三. 单元总结与评价 (សង្ខេប និងវាយតម្លៃបញ្ចប់មេរៀនទី៩ ទាំងមូល)\n四. 作业 (កិច្ចការផ្ទះ) ៖ 完成并订正课本第56-60页与练习册第65-73页的所有练习 (បំពេញ និងកែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់)',
    pageNumber: 'សៀ.សិស្ស (៥៦-៦០) / សៀ.លំ (៦៥-៧៣)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី៤ (បញ្ចប់មេរៀនទី៩ ទាំងស្រុង)',
  },
  {
    id: 'cur-14',
    monthNameKh: 'កុម្ភៈ',
    weekNumber: '១',
    lessonContent:
      '第四单元 学习生活 · 第十课 你今天上了什么课？ (មេរៀនទី១០ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីខ្លះ? — 这一周只上生词)\n一. 生词 (ពាក្យថ្មីទាំង ១០ ពាក្យ) ៖ 1.上(课) (shàng kè) 2.了 (le) 3.明天 (míngtiān) 4.数学 (shùxué) 5.德语 (déyǔ) 6.历史 (lìshǐ) 7.地理 (dìlǐ) 8.下午 (xiàwǔ) 9.周末 (zhōumò) 10.时间 (shíjiān)\n二. 词组搭配 (ការផ្សំពាក្យ) ៖ 上课、上了课、明天见、数学课、德语课、历史课、地理课、今天下午、过周末、有时间\n三. 作业 (កិច្ចការផ្ទះ) ៖ 抄写所学10个生词各5遍并翻译 (ចម្លងពាក្យថ្មីទាំង ១០ ពាក្យ ក្នុង១ពាក្យ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ)',
    pageNumber: 'សៀ.សិស្ស (៦៤-៦៥)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី១ (រៀនតែ生词)',
  },
  {
    id: 'cur-15',
    monthNameKh: 'កុម្ភៈ',
    weekNumber: '២',
    lessonContent:
      '第四单元 学习生活 · 第十课 你今天上了什么课？ (មេរៀនទី១០ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីខ្លះ? — 这一周只上句型)\n一. 核心句型 (ទម្រង់ល្បះទាំង ៥) ៖\n1. 你今天上了什么课？ (Nǐ jīntiān shàng le shénme kè? · តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីខ្លះ?)\n2. 我今天上了体育课。 (Wǒ jīntiān shàng le tǐyù kè. · ថ្ងៃនេះខ្ញុំបានរៀនមុខវិជ្ជាអប់រំកាយ/កីឡា។)\n3. 你明天有什么课？ (Nǐ míngtiān yǒu shénme kè? · តើថ្ងៃស្អែកអ្នកមានរៀនមុខវិជ្ជាអ្វីខ្លះ?)\n4. 我明天有汉语课。 (Wǒ míngtiān yǒu hànyǔ kè. · ថ្ងៃស្អែកខ្ញុំមានរៀនមុខវិជ្ជាភាសាចិន។)\n5. 星期二我没有数学课和德语课。 (Xīngqī’èr wǒ méiyǒu shùxué kè hé déyǔ kè. · ថ្ងៃអង្គារខ្ញុំមិនមានរៀនមុខវិជ្ជាគណិតវិទ្យា និងភាសាអាល្លឺម៉ង់ទេ។)\n二. 语法重点 (វេយ្យាករណ៍) ៖ 动态助词「了」表动作完成、时间状语、课程表表达与否定「没有」\n三. 作业 (កិច្ចការផ្ទះ) ៖ 抄写所学5个句型各5遍并翻译 (ចម្លងទម្រង់ល្បះទាំង ៥ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ)',
    pageNumber: 'សៀ.សិស្ស (៦៦)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី២ (រៀនតែ句型)',
  },
  {
    id: 'cur-16',
    monthNameKh: 'កុម្ភៈ',
    weekNumber: '៣',
    lessonContent:
      '第四单元 学习生活 · 第十课 你今天上了什么课？ (មេរៀនទី១០ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីខ្លះ? — 这一周只上对话)\n一. 对话一 (សន្ទនាទី១ ៖ សាកសួរពីមុខវិជ្ជាដែលបានរៀន និងមុខវិជ្ជាថ្ងៃស្អែក) ៖\nA: 你今天上了什么课？\nB: 我今天上了音乐课。\nA: 你明天有什么课？\nB: 我明天有历史课，你呢？\nA: 我明天有数学课和地理课。\n二. 短文二 (អត្ថបទខ្លីទី២ ៖ ជីវិតសិក្សារបស់ជីម Jim) ៖\nJim是英国人，他会说汉语。他今天下午上了汉语课，他喜欢汉语课。Jim也会说德语。他明天有德语课，他也喜欢德语课。周末他有时间，他想去看中文电影。\n三. 角色扮演 (Role-play) ៖ ការអនុវត្តសន្ទនាសាកសួរកាលវិភាគសិក្សាជាក់ស្តែងក្នុងថ្នាក់\n四. 作业 (កិច្ចការផ្ទះ) ៖ 抄写对话1和短文2各2遍并背诵对话1 (ចម្លងសន្ទនាទី១ និងអត្ថបទខ្លីទី២ ចំនួន ២ដង ព្រមទាំងទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់)',
    pageNumber: 'សៀ.សិស្ស (៦៧)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី៣ (រៀនតែ对话)',
  },
  {
    id: 'cur-17',
    monthNameKh: 'កុម្ភៈ',
    weekNumber: '៤',
    lessonContent:
      '第四单元 学习生活 · 第十课 你今天上了什么课？ (មេរៀនទី១០ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីខ្លះ? — 全完成课本与练习册)\n一. 课本练习 (សៀវភៅពុម្ព第66页-69页的练习) ៖ 听录音选课程、看课程表问答、阅读理解与交际调查 (ទំព័រ ៦៦-៦៩)\n二. 练习册练习 (សៀវភៅលំហាត់第74页到84页) ៖ 汉字描红与书写、连词成句、用「了」造句与综合测试 (ទំព័រ ៧៤-៨៤)\n三. 单元总结与评价 (សង្ខេប និងវាយតម្លៃបញ្ចប់មេរៀនទី១០ ទាំងមូល)\n四. 作业 (កិច្ចការផ្ទះ) ៖ 完成并订正课本第66-69页与练习册第74-84页的所有练习 (បំពេញ និងកែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់)',
    pageNumber: 'សៀ.សិស្ស (៦៦-៦៩) / សៀ.លំ (៧៤-៨៤)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី៤ (បញ្ចប់មេរៀនទី១០ ទាំងស្រុង)',
  },
  {
    id: 'cur-18',
    monthNameKh: 'មីនា',
    weekNumber: '១',
    lessonContent:
      '第四单元 学习生活 · 第十一课 汉语难不难？ (មេរៀនទី១១ ភាសាចិនពិបាកឬទេ? — 这一周只上生词)\n一. 生词 (ពាក្យថ្មីទាំង ១០ ពាក្យ) ៖ 1.难 (nán) 2.作业 (zuòyè) 3.有意思 (yǒu yìsi) 4.中学 (zhōngxué) 5.科目 (kēmù) 6.容易 (róngyì) 7.成绩 (chéngjì) 8.没意思 (méi yìsi) 9.考试 (kǎoshì) 10.有空儿 (yǒu kòngr)\n二. 词组搭配 (ការផ្សំពាក្យ) ៖ 汉语难、做作业、很有意思、中学生活、学习科目、容易学、好成绩、真没意思、准备考试、周末有空儿\n三. 作业 (កិច្ចការផ្ទះ) ៖ 抄写所学10个生词各5遍并翻译 (ចម្លងពាក្យថ្មីទាំង ១០ ពាក្យ ក្នុង១ពាក្យ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ)',
    pageNumber: 'សៀ.សិស្ស (៧០-៧១)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី១ (រៀនតែ生词)',
  },
  {
    id: 'cur-19',
    monthNameKh: 'មីនា',
    weekNumber: '២',
    lessonContent:
      '第四单元 学习生活 · 第十一课 汉语难不难？ (មេរៀនទី១១ ភាសាចិនពិបាកឬទេ? — 这一周只上句型)\n一. 核心句型 (ទម្រង់ល្បះទាំង ៦) ៖\n1. 汉语难不难？ (Hànyǔ nán bù nán? · តើភាសាចិនពិបាកឬទេ?)\n2. 汉语不难。 (Hànyǔ bù nán. · ភាសាចិនមិនពិបាកទេ។)\n3. 今天作业多不多？ (Jīntiān zuòyè duō bù duō? · តើថ្ងៃនេះកិច្ចការផ្ទះច្រើនឬទេ?)\n4. 今天作业很多。 (Jīntiān zuòyè hěn duō. · ថ្ងៃនេះកិច្ចការផ្ទះច្រើនណាស់។)\n5. 汉语课有意思吗？ (Hànyǔ kè yǒu yìsi ma? · តើម៉ោងរៀនភាសាចិនគួរឱ្យចាប់អារម្មណ៍ឬទេ?)\n6. 汉语课很有意思。 (Hànyǔ kè hěn yǒu yìsi. · ម៉ោងរៀនភាសាចិនគួរឱ្យចាប់អារម្មណ៍ណាស់។)\n二. 语法重点 (វេយ្យាករណ៍) ៖ 正反疑问句「A不A」、形容词谓语句与程度副词「很」、否定「不难 / 没有意思」\n三. 作业 (កិច្ចការផ្ទះ) ៖ 抄写所学6个句型各5遍并翻译 (ចម្លងទម្រង់ល្បះទាំង ៦ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ)',
    pageNumber: 'សៀ.សិស្ស (៧២)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី២ (រៀនតែ句型)',
  },
  {
    id: 'cur-20',
    monthNameKh: 'មីនា',
    weekNumber: '៣',
    lessonContent:
      '第四单元 学习生活 · 第十一课 汉语难不难？ (មេរៀនទី១១ ភាសាចិនពិបាកឬទេ? — 这一周只上对话)\n一. 对话一 (សន្ទនាទី១ ៖ សាកសួរពីការរៀនភាសាចិន និងមុខវិជ្ជានៅអនុវិទ្យាល័យ) ៖\nA: 我今天上了汉语课。\nB: 汉语难不难？\nA: 汉语不难，汉语课很有意思。\nB: 中学的科目多不多？\nA: 中学的科目很多。\nB: 你喜欢什么课？\nA: 我喜欢汉语课和地理课。\n二. 短文二 (អត្ថបទខ្លីទី២ ៖ ជីវិតសិក្សារបស់ Ann និងប្អូនប្រុស) ៖\n我是Ann，我是学生。我今天上了汉语课和数学课。汉语课很有意思，数学课也很有意思。汉语作业很容易，数学作业不容易。我弟弟喜欢历史课，他的历史成绩很好。他不喜欢地理课，他说地理没意思。\n三. 角色扮演 (Role-play) ៖ ការអនុវត្តសន្ទនាសាកសួរមុខវិជ្ជា និងចំណាប់អារម្មណ៍សិក្សាជាក់ស្តែង\n四. 作业 (កិច្ចការផ្ទះ) ៖ 抄写对话1和短文2各2遍并背诵对话1 (ចម្លងសន្ទនាទី១ និងអត្ថបទខ្លីទី២ ចំនួន ២ដង ព្រមទាំងទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់)',
    pageNumber: 'សៀ.សិស្ស (៧៣)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី៣ (រៀនតែ对话)',
  },
  {
    id: 'cur-21',
    monthNameKh: 'មីនា',
    weekNumber: '៤',
    lessonContent:
      '第四单元 学习生活 · 第十一课 汉语难不难？ (មេរៀនទី១១ ភាសាចិនពិបាកឬទេ? — 全完成课本与练习册)\n一. 课本练习 (សៀវភៅពុម្ព第72页-75页的练习) ៖ 听录音辨别正反问句、读课文连线、看图问答与同伴调查 (ទំព័រ ៧២-៧៥)\n二. 练习册练习 (សៀវភៅលំហាត់第80页到84页) ៖ 汉字描红规范书写、看拼音写词语、连词成句、改写正反问句与阅读测试 (ទំព័រ ៨០-៨៤)\n三. 单元总结与评价 (សង្ខេប និងវាយតម្លៃបញ្ចប់មេរៀនទី១១ ទាំងមូល)\n四. 作业 (កិច្ចការផ្ទះ) ៖ 完成并订正课本第72-75页与练习册第80-84页的所有练习 (បំពេញ និងកែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់)',
    pageNumber: 'សៀ.សិស្ស (៧២-៧៥) / សៀ.លំ (៨០-៨៤)',
    hours: 1.5,
    note: 'សប្តាហ៍ទី៤ (បញ្ចប់មេរៀនទី១១ ទាំងស្រុង)',
  },
  {
    id: 'cur-22',
    monthNameKh: 'មេសា',
    weekNumber: '១-៤',
    lessonContent:
      'ចូលឆ្នាំខ្មែរ (បុណ្យចូលឆ្នាំប្រពៃណីជាតិ) + រំលឹកមេរៀនប្រចាំខែ',
    pageNumber: '៧០-៨២',
    hours: 4.5,
    note: 'បុណ្យចូលឆ្នាំខ្មែរ',
  },
  {
    id: 'cur-23',
    monthNameKh: 'ឧសភា - មិថុនា',
    weekNumber: '១-៤',
    lessonContent:
      '第十二课 来打乒乓球吧 (មេរៀនទី១២ មកវាយកូនឃ្លីលើតុ) + ប្រឡងប្រចាំខែឧសភា & មិថុនា',
    pageNumber: '៨៤-៩៦',
    hours: 6.0,
    note: 'ប្រឡងប្រចាំខែឧសភា & មិថុនា',
  },
  {
    id: 'cur-24',
    monthNameKh: 'កក្កដា - សីហា',
    weekNumber: '១-៤',
    lessonContent:
      '第十二课 来打乒乓球吧 + 期末考试 (ប្រឡងឆមាសទី២)',
    pageNumber: '៦៥-៩០',
    hours: 6.0,
    note: 'ប្រឡងឆមាសទី២ (សរុប ៥៧ ម៉ោង)',
  },
];

export const DEFAULT_LESSON_PLANS: ChineseLessonPlan[] = [
  {
    id: 'lp-0',
    linkedCurriculumId: 'cur-1',
    dateWeekday: 'ចន្ទ',
    dateDay: '០២',
    dateMonth: 'វិច្ឆិកា',
    dateYear: '២០២៦',
    isoDate: '2026-11-02',
    chapterTitle: 'ខែវិច្ឆិកា · សប្តាហ៍ទី១ (开学第一周)',
    lessonTitle: '汉语基础（复习）មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី១ ដល់ ទំព័រទី២ (តារាងភីនអ៊ីន)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សចងចាំ និងយល់ដឹងច្បាស់លាស់ពីប្រព័ន្ធភីនអ៊ីនភាសាចិន (Pinyin) រួមមាន ព្យញ្ជនៈ (声母) ទាំង ២៣ តួ និង ស្រៈ (韵母) ទាំង ២៤ តួ ព្រមទាំងសូរសំឡេងទាំង ៤ (Four Tones) តាមរយៈការពន្យល់ និងការហ្វឹកហាត់ជាបុគ្គល និងដៃគូ។',
    skillObjective:
      'សិស្សចេះអានបញ្ចេញសំឡេងបានត្រឹមត្រូវ ច្បាស់ និងចេះចងចាំទម្រង់សរសេរនៃព្យញ្ជនៈទាំង ២៣ (b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w) និងស្រៈទាំង ២៤ (a, o, e, i, u, ü, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong) ព្រមទាំងចេះប្រកបសូរភីនអ៊ីនជាមូលដ្ឋាន។',
    attitudeObjective:
      'សិស្សមានវិន័យល្អ យកចិត្តទុកដាក់ខ្ពស់ ចូលរួមសហការក្នុងការអាន និងស្ម័គ្រចិត្តឡើងអានក្តារខៀន ដើម្បីកសាងមូលដ្ឋានគ្រឹះរឹងមាំក្នុងការរៀនភាសាចិនពេញមួយឆ្នាំសិក្សា។',
    teachingMaterialsTeacher: 'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន តារាងព្យញ្ជនៈនិងស្រៈភីនអ៊ីន (Pinyin Chart) ប័ណ្ណពាក្យ',
    teachingMaterialsStudent: 'សៀវភៅគោលសម្រាប់សិស្ស សៀវភៅកត់ត្រា និងប៊ិច',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — រំលឹកព្យញ្ជនៈ ២៣តួ និងស្រៈ ២៤តួ (复习声母23个与韵母24个)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងដើមឆ្នាំសិក្សាថ្មី និងណែនាំខ្លួន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ លើកទឹកចិត្តសិស្សដើមឆ្នាំសិក្សា និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ឯកសណ្ឋានត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួរទៅកាន់សិស្សដើម្បីវាស់ស្ទង់ការចងចាំភីនអ៊ីន៖\n- តើភីនអ៊ីនភាសាចិន (Pinyin) មានសារៈសំខាន់ដូចម្តេច?\n- តើសិស្សណាខ្លះចាំព្យញ្ជនៈ b, p, m, f... និងស្រៈ a, o, e...?',
            lessonContent: 'រំលឹកសារៈសំខាន់នៃភីនអ៊ីន (Pinyin) ក្នុងការអាន និងបញ្ចេញសំឡេងអក្សរចិន',
            studentActivity: 'សិស្សលើកដៃឆ្លើយសំណួរគ្រូ និងបញ្ចេញសំឡេងស្រៈមូលដ្ឋានមួយចំនួនដែលខ្លួនចាំ',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «汉语基础（复习）មូលដ្ឋានគ្រឹះភាសាចិន» លើក្តារខៀន\n២. បង្ហាញ និងសរសេរព្យញ្ជនៈ (声母) ទាំង ២៣ តួ លើក្តារខៀន នាំសិស្សអានតាមជួរ (b p m f / d t n l / g k h / j q x / zh ch sh r / z c s / y w) ដោយកែតម្រង់ការបញ្ចេញសំឡេង\n៣. បង្ហាញ និងសរសេរស្រៈ (韵母) ទាំង ២៤ តួ (ស្រៈទោល ៦ + ស្រៈផ្សំ ១៨) លើក្តារខៀន និងបង្វឹកសិស្សអានឱ្យច្បាស់ និងចាំ\n៤. ហៅសិស្សឡើងអានម្នាក់ម្តងៗ និងជាក្រុម រួចណែនាំគន្លឹះទន្ទេញចាំ',
            lessonContent:
              '汉语基础（复习） មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)\n\n一. 23个声母 (ព្យញ្ជនៈ ២៣ តួ)៖\nb, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w\n\n二. 24个韵母 (ស្រៈ ២៤ តួ)៖\n• 单韵母 (ស្រៈទោល ៦)៖ a, o, e, i, u, ü\n• 复韵母 (ស្រៈផ្សំ ៨)៖ ai, ei, ui, ao, ou, iu, ie, üe\n• 特殊韵母 (ស្រៈពិសេស ១)៖ er\n• 前鼻韵母 (ស្រៈច្រមុះមុខ ៥)៖ an, en, in, un, ün\n• 后鼻韵母 (ស្រៈច្រមុះក្រោយ ៤)៖ ang, eng, ing, ong\n\n三. 拼读与认读 (ការអាន និងការចងចាំ)៖\nហ្វឹកហាត់បញ្ចេញសំឡេងឱ្យត្រូវតាមខ្យល់បន្លឺឡើង និងចងចាំតួអក្សរឡាតាំងនៃភីនអ៊ីន។',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ សង្កេតរបៀបបញ្ចេញសំឡេង និងទម្រង់មាត់ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ហាត់ទន្ទេញឱ្យចាំ និងចម្លងព្យញ្ជនៈ ២៣ តួ និងស្រៈ ២៤ តួ ចូលក្នុងសៀវភៅកត់ត្រាឱ្យស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity:
              '១. ចង្អុលលើក្តារខៀនដោយចៃដន្យ ឱ្យសិស្សអានព្យញ្ជនៈ ឬស្រៈ (ឧ. zh, q, x, ü, eng, iu...)\n២. ហៅសិស្ស ២–៣ នាក់ឡើងក្តារខៀន ឱ្យសរសេរព្យញ្ជនៈ ឬស្រៈតាមសំឡេងដែលគ្រូអាន',
            lessonContent: 'ពង្រឹងការអានត្រឹមត្រូវ (会读) និងការចងចាំបានច្បាស់លាស់ (会记) នូវ ២៣ 声母 និង ២៤ 韵母',
            studentActivity: 'សិស្សដែលត្រូវហៅឡើងអាន និងសរសេរលើក្តារខៀន សិស្សឯទៀតផ្ទៀងផ្ទាត់និងទះដៃលើកទឹកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សហាត់សរសេរ និងទន្ទេញ\n២. ណែនាំសិស្សឱ្យស្វ័យសិក្សា និងរៀបចំសម្រាប់មេរៀនទី១ សប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លងព្យញ្ជនៈ (声母) ២៣ តួ និងស្រៈ (韵母) ២៤ តួ ម្នាក់ ៣ ចប់ និងទន្ទេញឱ្យចាំមាត់។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week2-shopping',
    linkedCurriculumId: 'cur-2',
    dateWeekday: 'ចន្ទ',
    dateDay: '០៩',
    dateMonth: 'វិច្ឆិកា',
    dateYear: '២០២៦',
    isoDate: '2026-11-09',
    chapterTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (第一周只教生词)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី២៨ ដល់ ទំព័រទី២៩ (សៀវភៅពុម្ព 生词表)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សស្គាល់ ចងចាំ និងយល់អត្ថន័យយ៉ាងច្បាស់លាស់នូវពាក្យថ្មីទាំង ១១ ពាក្យក្នុងមេរៀនទី៧ រួមមាន៖ 1.买 (mǎi - ទិញ), 2.和 (hé - និង/ជាមួយ), 3.点心 (diǎnxin - នំចំណី/អាហារសម្រន់), 4.还 (hái - នៅ...ទៀត/ថែមទាំង), 5.要 (yào - ចង់បាន/យក), 6.瓶 (píng - ដប), 7.斤 (jīn - គីឡូកន្លះ/៥០០ក្រាម), 8.东西 (dōngxi - របស់របរ/អីវ៉ាន់), 9.水 (shuǐ - ទឹក), 10.酒 (jiǔ - ស្រា), 11.蛋糕 (dàngāo - នំខេក) តាមរយៈការបញ្ចេញសំឡេងភីនអ៊ីន ការពន្យល់របស់គ្រូ និងប័ណ្ណរូបភាព។',
    skillObjective:
      'សិស្សមានសមត្ថភាពអាន បញ្ចេញសំឡេងភីនអ៊ីនបានត្រឹមត្រូវ ច្បាស់លាស់ ស្គាល់ទម្រង់តួអក្សរចិន ចេះសរសេរពាក្យថ្មីទាំង ១១ ពាក្យតាមលំដាប់លំដោយគំនូសអក្សរចិនត្រឹមត្រូវ និងចេះផ្សំផ្គុំជាឃ្លាខ្លីៗដែលទាក់ទងនឹងជីវភាពរស់នៅ (ឧ. 买东西, 一瓶水, 买点心, 喝水, 吃蛋糕)។',
    attitudeObjective:
      'សិស្សមានវិន័យល្អ យកចិត្តទុកដាក់ខ្ពស់ ចូលរួមអានពាក្យថ្មីដោយស្វាហាប់ និងសហការជាមួយមិត្តភក្តិក្នុងការអនុវត្តសរសេរពាក្យចិន។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណពាក្យរូបភាព (Flashcards វត្ថុពិត/រូបភាព៖ ទឹក ដប នំខេក នំចំណី ស្រា របស់របរ) កាតពាក្យភីនអ៊ីន និងស្លាយបង្ហាញលំដាប់គំនូសអក្សរចិន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第一册) សៀវភៅកត់ត្រា ប៊ិច និងបន្ទះអនុវត្តសរសេរអក្សរចិន',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — រៀនពាក្យថ្មីទាំង ១១ ពាក្យ (第一课时：学习第七课11个生词与拼音认读)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួររំលឹកព្យញ្ជនៈ ស្រៈភីនអ៊ីន និងសូរសំឡេងទាំង៤ ដើម្បីត្រៀមប្រកបអានពាក្យថ្មី',
            lessonContent: 'រំលឹកមូលដ្ឋានគ្រឹះភីនអ៊ីន (声母与韵母) ដើម្បីជួយសិស្សប្រកបអានពាក្យថ្មីបានត្រឹមត្រូវ',
            studentActivity: 'សិស្សលើកដៃឆ្លើយសំណួរគ្រូ និងបញ្ចេញសំឡេងភីនអ៊ីនដោយភាពជឿជាក់',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第三单元 购物 · 第七课 你买什么？(第一周只教生词)» លើក្តារខៀន\n២. បង្ហាញរូបភាព និងប័ណ្ណពាក្យ បង្រៀនពាក្យថ្មីទាំង ១១ ពាក្យម្តងមួយៗ (1.买 2.和 3.点心 4.还 5.要 6.瓶 7.斤 8.东西 9.水 10.酒 11.蛋糕) ដោយពន្យល់ពីអត្ថន័យ ភីនអ៊ីន និងប្រភេទពាក្យ (កិរិយាសព្ទ, នាម, ឈ្នាប់, រនាប់)\n៣. បង្វឹកសិស្សអានបញ្ចេញសំឡេងភីនអ៊ីនឱ្យបានត្រឹមត្រូវ ជាពិសេសសំឡេងទី៣ (mǎi, shuǐ, jiǔ) និងសូរសំឡេងស្រាល (diǎnxin, dōngxi)\n៤. ណែនាំឃ្លាផ្គុំខ្លីៗ ៖ 买东西 (ទិញអីវ៉ាន់), 一瓶水 (ទឹកមួយដប), 一斤苹果 (ផ្លែប៉ោមមួយជីន), 吃点心 (ញ៉ាំនំចំណី), 买蛋糕 (ទិញនំខេក)\n៥. ហៅសិស្សអានជាក្រុម អានជាជួរ និងអានម្នាក់ម្តងៗ រួចកែតម្រង់ការបញ្ចេញសំឡេង',
            lessonContent:
              '第三单元 购物 · 第七课 你买什么？ (第一周只教生词)\n\n一. 生词 (ពាក្យថ្មីទាំង ១១ ពាក្យ) ៖\n1. 买 (mǎi) ៖ [កិ.] ទិញ (to buy)\n2. 和 (hé) ៖ [ឈ្នាប់] និង, ជាមួយ (and, with)\n3. 点心 (diǎnxin) ៖ [ន.] នំចំណី, អាហារសម្រន់ (dim sum, pastry, snack)\n4. 还 (hái) ៖ [គុ.កិ.] នៅ...ទៀត, ថែមទាំង (still, also, in addition)\n5. 要 (yào) ៖ [កិ.] ចង់បាន, ត្រូវការ, យក (to want, to need)\n6. 瓶 (píng) ៖ [រនាប់] ដប (bottle) — ឧ. 一瓶水 ទឹកមួយដប, 一瓶酒 ស្រាមួយដប\n7. 斤 (jīn) ៖ [រនាប់] គីឡូកន្លះ, ជីន = 500ក្រាម (half kilo / catty) — ឧ. 一斤 មួយជីន\n8. 东西 (dōngxi) ៖ [ន.] របស់របរ, អីវ៉ាន់ (things, stuff) — ឧ. 买东西 ទិញអីវ៉ាន់\n9. 水 (shuǐ) ៖ [ន.] ទឹក (water) — ឧ. 喝水 ផឹកទឹក, 矿泉水 ទឹកបរិសុទ្ធ\n10. 酒 (jiǔ) ៖ [ន.] ស្រា (wine, liquor, alcohol) — ឧ. 啤酒 ស្រាបៀរ, 红酒 ស្រាក្រហម\n11. 蛋糕 (dàngāo) ៖ [ន.] នំខេក (cake) — ឧ. 生日蛋糕 នំខេកថ្ងៃកំណើត\n\n二. 词组搭配 (ការផ្គុំពាក្យជាឃ្លាខ្លីៗ) ៖\n• 买东西 (ទិញអីវ៉ាន់) · 买点心 (ទិញនំចំណី) · 买蛋糕 (ទិញនំខេក)\n• 一瓶水 (ទឹកមួយដប) · 一瓶酒 (ស្រាមួយដប) · 一斤东西 (របស់មួយជីន)\n• 喝水 (ផឹកទឹក) · 要水 (យកទឹក) · 还要 (នៅយក...ទៀត)',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ សង្កេតរូបភាព និងប័ណ្ណពាក្យ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ហាត់បញ្ចេញសំឡេងភីនអ៊ីនឱ្យបានត្រឹមត្រូវ និងចម្លងពាក្យថ្មីទាំង ១១ ចូលសៀវភៅកត់ត្រាឱ្យបានស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity:
              '១. ចង្អុលបង្ហាញរូបភាព (ទឹក ដប នំខេក នំចំណី ស្រា របស់របរ) ឱ្យសិស្សឆ្លើយពាក្យចិនភ្លាមៗ\n២. គ្រូអានភីនអ៊ីន ឱ្យសិស្សរកតួអក្សរចិន និងប្រាប់អត្ថន័យ',
            lessonContent: 'ពង្រឹងការចងចាំពាក្យថ្មីទាំង ១១ ពាក្យ (会读会记 会正确发音)',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ និងប្រកួតប្រជែងអានពាក្យថ្មីដោយភាពរស់រវើក',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងពាក្យថ្មីដែលបានរៀន ៥ដង\n២. ណែនាំសិស្សឱ្យទន្ទេញពាក្យថ្មីឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លងពាក្យថ្មីដែលបានរៀនទាំង ១១ ពាក្យ (1.买 2.和 3.点心 4.还 5.要 6.瓶 7.斤 8.东西 9.水 10.酒 11.蛋糕) ក្នុងមួយពាក្យសរសេរចំនួន ៥ដង (抄写所学的生词写5遍) ព្រមទាំងភីនអ៊ីន និងអត្ថន័យខ្មែរ រួចទន្ទេញឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — ហ្វឹកហាត់អាន ស្គាល់អក្សរ និងសរសេរពាក្យថ្មី (第二课时：生词认读拓展与汉字书写)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ៣ នាក់ឡើងក្តារខៀន សរសេរភីនអ៊ីន និងអានពាក្យថ្មី 买, 东西, 水, 蛋糕, 瓶, 酒',
            lessonContent: 'រំលឹកពាក្យថ្មីទាំង ១១ ពាក្យដែលបានរៀនក្នុងម៉ោងសិក្សាទី១',
            studentActivity: 'សិស្សឡើងអាន និងសរសេរលើក្តារខៀន សិស្សឯទៀតផ្ទៀងផ្ទាត់ក្នុងសៀវភៅ',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. ដឹកនាំសិស្សលេងល្បែងផ្គូផ្គងពាក្យថ្មី (生词配对游戏 ៖ 买+东西, 一瓶+水, 一瓶+酒, 一斤+点心)\n២. បង្រៀនគំនូស និងលំដាប់គំនូសអក្សរចិននៃពាក្យថ្មីលើក្តារខៀន ៖\n• 买 (6 画) ៖ 横撇、点、点、撇、点、撇\n• 水 (4 画) ៖ 竖钩、横撇、撇、捺\n• 和 (8 画) ៖ 禾字旁 (5 画) + 口 (3 画)\n• 东 (5 画), 西 (6 画) ៖ 东西\n• 蛋 (11 画), 糕 (16 画) ៖ 蛋糕\n៣. ណែនាំសិស្សឱ្យហាត់សរសេរតាមលំដាប់លំដោយគំនូសអក្សរចិនត្រឹមត្រូវ',
            lessonContent:
              '一. 生词认读与词组 (ការអាន និងផ្សំផ្គុំពាក្យថ្មី) ៖\n• 买 (买东西, 买点心, 买蛋糕)\n• 要 (要水, 还要, 要一瓶水)\n• 和 (水和酒, 点心和蛋糕)\n\n二. 汉字笔画笔顺 (គំនូស និងលំដាប់គំនូសអក្សរចិន) ៖\n1. 买 (6 画) ៖ 横撇、点、点、撇、点、撇\n2. 水 (4 画) ៖ 竖钩、横撇、撇、捺\n3. 和 (8 画) ៖ 禾 (5 画) + 口 (3 画)\n4. 东西 ៖ 东 (5 画: 横、撇折、竖钩、撇、点) + 西 (6 画: 横、竖、横折、撇、竖弯、横)',
            studentActivity:
              'សិស្សសង្កេតគំនូសលើក្តារខៀន យកម្រាមដៃគូសវាសលើខ្យល់តាមគ្រូ ហាត់សរសេរអក្សរចិន 买, 水, 和, 东西 ក្នុងសៀវភៅលំហាត់ និងលេងល្បែងផ្គូផ្គងពាក្យថ្មី។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ២ នាក់ឡើងសរសេរអក្សរ 买 និង 水 លើក្តារខៀន រួចឱ្យថ្នាក់ទាំងមូលផ្ទៀងផ្ទាត់',
            lessonContent: 'ពង្រឹងការសរសេរអក្សរចិន និងការចងចាំពាក្យថ្មី',
            studentActivity: 'សិស្សឡើងសរសេរលើក្តារខៀន និងអានពាក្យឱ្យបានច្បាស់ៗ',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះឱ្យសិស្សចម្លងពាក្យថ្មីដែលបានរៀន ៥ដង និងទន្ទេញឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 抄写所学生词写5遍 — ចម្លងពាក្យថ្មីដែលបានរៀនទាំង ១១ ពាក្យ ក្នុង១ពាក្យ ៥ដង (买, 和, 点心, 还, 要, 瓶, 斤, 东西, 水, 酒, 蛋糕) ព្រមទាំងភីនអ៊ីន និងអត្ថន័យ រួចទន្ទេញឱ្យចាំមាត់។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week3-shopping-sentences',
    linkedCurriculumId: 'cur-3',
    dateWeekday: 'ចន្ទ',
    dateDay: '១៦',
    dateMonth: 'វិច្ឆិកា',
    dateYear: '២០២៦',
    isoDate: '2026-11-16',
    chapterTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (句型 · 这一周只上句型)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៤៤ (សៀវភៅពុម្ព 句型)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សស្គាល់ ចងចាំ និងយល់ច្បាស់លាស់ពីទម្រង់ល្បះគំរូទាំង ៥ ក្នុងការទិញទំនិញ៖ 1.你买什么？ (តើអ្នកទិញអ្វី?), 2.我买鸡蛋和点心。 (ខ្ញុំទិញពងមាន់ និងនំចំណី។), 3.你还要什么？ (តើអ្នកត្រូវការអ្វីទៀត?), 4.我还要一瓶牛奶、两斤苹果。 (ខ្ញុំត្រូវការទឹកដោះគោមួយដប និងផ្លែប៉ោមពីរគីឡូកន្លះទៀត។), 5.我想买很多东西。 (ខ្ញុំចង់ទិញរបស់របរជាច្រើន។) ព្រមទាំងយល់ដឹងពីរបៀបប្រើប្រាស់ពាក្យ «和» (និង/ជាមួយ), «还» (នៅ...ទៀត), «要/想» (ចង់បាន/ត្រូវការ/ចង់) ក្នុងការសន្ទនា។',
    skillObjective:
      'សិស្សមានសមត្ថភាពអាន បញ្ចេញសំឡេងភីនអ៊ីនបានត្រឹមត្រូវ ចេះសួរសំណួរ និងឆ្លើយប្រាប់ពីរបស់របរដែលខ្លួនចង់ទិញបានយ៉ាងរលូន ចេះយកពាក្យថ្មីៗមកជំនួសក្នុងទម្រង់ល្បះ (ឧ. 我买水、我还要一瓶酒、我想买点心) និងចេះសរសេរទម្រង់ល្បះទាំង ៥ យ៉ាងស្អាត និងត្រឹមត្រូវ។',
    attitudeObjective:
      'សិស្សមានភាពក្លាហាន ស្វាហាប់ ចូលរួមយ៉ាងសកម្មក្នុងការហាត់បង្កើតល្បះ និងអនុវត្តសន្ទនាជាមួយមិត្តរួមថ្នាក់។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណទម្រង់ល្បះ ប័ណ្ណពាក្យរូបភាព (ពងមាន់ នំចំណី ទឹកដោះគោ ផ្លែប៉ោម ទឹក របស់របរ) ក្តារខៀន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第一册) សៀវភៅកត់ត្រា ប៊ិច',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — រៀនទម្រង់ល្បះទាំង ៥ ក្នុងមេរៀនទី៧ (第一课时：学习第七课5个核心句型)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួររំលឹកពាក្យថ្មីទាំង ១១ ពាក្យដែលបានរៀនសប្តាហ៍មុន (买, 和, 点心, 还, 要, 瓶, 斤, 东西, 水, 酒, 蛋糕)',
            lessonContent: 'រំលឹកពាក្យថ្មីទាំង ១១ ពាក្យ ដើម្បីត្រៀមរៀនទម្រង់ល្បះពេញលេញ',
            studentActivity: 'សិស្សលើកដៃអានពាក្យថ្មី និងប្រាប់អត្ថន័យជាភាសាខ្មែរ',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第三单元 购物 · 第七课 你买什么？ (句型 · 这一周只上句型)» លើក្តារខៀន\n២. បង្រៀនទម្រង់ល្បះទាំង ៥ ម្តងមួយៗ ព្រមទាំងភីនអ៊ីន និងការបកប្រែ ៖\n   1. 你买什么？ (Nǐ mǎi shénme? · តើអ្នកទិញអ្វី?)\n   2. 我买鸡蛋和点心。 (Wǒ mǎi jīdàn hé diǎnxin. · ខ្ញុំទិញពងមាន់ និងនំចំណី។)\n   3. 你还要什么？ (Nǐ hái yào shénme? · តើអ្នកត្រូវការអ្វីទៀត?)\n   4. 我还要一瓶牛奶、两斤苹果。 (Wǒ hái yào yì píng niúnǎi, liǎng jīn píngguǒ. · ខ្ញុំត្រូវការទឹកដោះគោមួយដប និងផ្លែប៉ោមពីរគីឡូកន្លះទៀត។)\n   5. 我想买很多东西。 (Wǒ xiǎng mǎi hěn duō dōngxi. · ខ្ញុំចង់ទិញរបស់របរជាច្រើន។)\n៣. ពន្យល់ចំណុចវេយ្យាករណ៍គន្លឹះ ៖ ឈ្នាប់ «和» (និង), គុណកិរិយា «还» (នៅ...ទៀត), កិរិយាសព្ទជំនួយ «想» (ចង់) & «要» (ត្រូវការ/យក), រនាប់នាម «瓶» (ដប), «斤» (គីឡូកន្លះ/ជីន)\n៤. ដឹកនាំសិស្សហាត់អានជាក្រុម អានជាជួរ និងហៅសិស្សអានម្នាក់ម្តងៗ\n៥. ណែនាំសិស្សហាត់បង្កើតល្បះជំនួសពាក្យ (替换练习)',
            lessonContent:
              '第三单元 购物 · 第七课 你买什么？ (句型 · 这一周只上句型)\n\n一. 核心句型 (ទម្រង់ល្បះគោលទាំង ៥) ៖\n1. 你买什么？ (Nǐ mǎi shénme?) ៖ តើអ្នកទិញអ្វី?\n2. 我买鸡蛋和点心。 (Wǒ mǎi jīdàn hé diǎnxin.) ៖ ខ្ញុំទិញពងមាន់ និងនំចំណី។\n3. 你还要什么？ (Nǐ hái yào shénme?) ៖ តើអ្នកត្រូវការអ្វីទៀត?\n4. 我还要一瓶牛奶、两斤苹果。 (Wǒ hái yào yì píng niúnǎi, liǎng jīn píngguǒ.) ៖ ខ្ញុំត្រូវការទឹកដោះគោមួយដប និងផ្លែប៉ោមពីរគីឡូកន្លះទៀត។\n5. 我想买很多东西。 (Wǒ xiǎng mǎi hěn duō dōngxi.) ៖ ខ្ញុំចង់ទិញរបស់របរជាច្រើន。\n\n二. 语法重点 (វេយ្យាករណ៍សំខាន់) ៖\n• 和 (hé) ៖ ឈ្នាប់តភ្ជាប់នាម និងនាម (鸡蛋 和 点心)\n• 还 (hái) ៖ គុណកិរិយា នៅ...ទៀត (还要)\n• 瓶 (píng) / 斤 (jīn) ៖ រនាប់នាម (一瓶牛奶 / 两斤苹果)\n• 想买 (xiǎng mǎi) ៖ ចង់ទិញ / 买很多东西 (ទិញរបស់របរជាច្រើន)\n\n三. 替换练习 (លំហាត់ជំនួសពាក្យ) ៖\n• 你买什么？ ➔ 我买水 / 我买蛋糕 / 我买苹果。\n• 你还要什么？ ➔ 我还要一瓶水 / 我还要两斤苹果。',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ហាត់សួរនិងឆ្លើយតាមទម្រង់ល្បះ និងចម្លងទម្រង់ល្បះទាំង ៥ ចូលសៀវភៅកត់ត្រាឱ្យបានស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity:
              '១. សួរសិស្សចៃដន្យ ៖ «你买什么？», «你还要什么？» ឱ្យសិស្សឆ្លើយជាភាសាចិនភ្លាមៗ\n២. ហៅសិស្ស ២ នាក់ឡើងក្តារខៀន បង្កើតល្បះសួរ-ឆ្លើយ',
            lessonContent: 'ពង្រឹងសមត្ថភាពសួរ-ឆ្លើយតាមទម្រង់ល្បះទិញទំនិញ (会读会用 会正确表达)',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូដោយភាពជឿជាក់ និងអនុវត្តសន្ទនាសួរ-ឆ្លើយលើក្តារខៀន',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងទម្រង់ល្បះទាំង ៥ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ\n២. ណែនាំឱ្យសិស្សហាត់អានទន្ទេញឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លងទម្រង់ល្បះទាំង ៥ ក្នុងមេរៀនទី៧ ក្នុងមួយល្បះសរសេរចំនួន ៥ដង (抄写所学5个句型各5遍) ព្រមទាំងភីនអ៊ីន និងអត្ថន័យខ្មែរ រួចហាត់អានឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — អនុវត្តបង្កើតល្បះ និងហ្វឹកហាត់វេយ្យាករណ៍ (第二课时：句型拓展运用与造句练习)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ៣ នាក់ឡើងអានទម្រង់ល្បះទាំង ៥ ដោយមិនមើលសៀវភៅ',
            lessonContent: 'រំលឹកទម្រង់ល្បះទាំង ៥ នៃមេរៀនទី៧',
            studentActivity: 'សិស្សឡើងអានទម្រង់ល្បះដោយទំនុកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. ដឹកនាំសិស្សធ្វើលំហាត់ជំនួសពាក្យក្នុងល្បះលើក្តារខៀន\n២. បង្រៀនសិស្សបង្កើតល្បះដោយប្រើ «想买...», «还要...», «...和...»\n៣. ដាក់លំហាត់ឱ្យសិស្សអនុវត្តសរសេរក្នុងសៀវភៅលំហាត់',
            lessonContent:
              '一. 连词成句与造句 (ការរៀបពាក្យជាល្បះ និងការបង្កើតល្បះ) ៖\n1. 买 / 什么 / 你 / ？ ➔ 你买什么？\n2. 鸡蛋 / 和 / 买 / 点心 / 我 / 。 ➔ 我买鸡蛋和点心。\n3. 还 / 什么 / 要 / 你 / ？ ➔ 你还要什么？\n4. 牛奶 / 一瓶 / 两斤 / 我 / 还要 / 苹果 / 、 / 。 ➔ 我还要一瓶牛奶、两斤苹果。\n5. 想 / 很多 / 买 / 东西 / 我 / 。 ➔ 我想买很多东西。\n\n二. 语法拓展 (ពង្រីកវេយ្យាករណ៍) ៖\n• 我想买一瓶水和一块蛋糕。\n• 我还要两斤苹果和一瓶牛奶。',
            studentActivity: 'សិស្សឡើងក្តារខៀនរៀបពាក្យជាល្បះ អនុវត្តសរសេរចូលសៀវភៅ និងផ្ទៀងផ្ទាត់ជាមួយមិត្តភក្តិ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ឱ្យសិស្សម្នាក់ៗនិយាយប្រាប់ពីរបស់ដែលខ្លួនចង់ទិញនៅផ្សារ ឧ. «我想买...，还要...»',
            lessonContent: 'ពង្រឹងសមត្ថភាពបញ្ចេញមតិ និងការប្រើប្រាស់ភាសាចិនជាក់ស្តែង',
            studentActivity: 'សិស្សលើកដៃនិយាយប្រាប់របស់ដែលខ្លួនចង់ទិញជាភាសាចិន',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះចម្លង ៥ដង និងត្រៀមរៀនផ្នែកសន្ទនានៅសប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 抄写5个句型各5遍 — ចម្លងទម្រង់ល្បះទាំង ៥ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week4-shopping-dialogues',
    linkedCurriculumId: 'cur-4',
    dateWeekday: 'ចន្ទ',
    dateDay: '២៣',
    dateMonth: 'វិច្ឆិកា',
    dateYear: '២០២៦',
    isoDate: '2026-11-23',
    chapterTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (对话 · 这一周只上对话)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៤៥ (សៀវភៅពុម្ព 对话)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សយល់ដឹងយ៉ាងច្បាស់លាស់នូវអត្ថន័យ និងបរិបទប្រើប្រាស់នៃការសន្ទនាទាំងពីរក្នុងមេរៀនទី៧៖ 对话1 (A: 你买什么？ B: 我买点心。 A: 你买几斤？ B: 我买一斤。 A: 你还要什么？ B: 我还要一瓶水和两瓶牛奶。) និង 对话/短文2 (今天是星期六，我要买很多东西。我要买五瓶水、三瓶牛奶，还要买六个鸡蛋、两斤苹果和一斤点心。)。',
    skillObjective:
      'សិស្សចេះអានសន្ទនា និងអត្ថបទដោយរលូន ត្រឹមត្រូវតាមសូរសំឡេងភីនអ៊ីន មានទឹកដមសំនៀងធម្មជាតិ ចេះចាប់ដៃគូសន្ទនាទិញលក់ទំនិញ (Role-play ៖ អ្នកទិញ និងអ្នកលក់) ព្រមទាំងចេះសរសេរចម្លងអត្ថបទសន្ទនាបានយ៉ាងស្អាត។',
    attitudeObjective:
      'សិស្សចូលរួមសកម្មភាពសន្ទនាជាដៃគូដោយភាពជឿជាក់ និងរីករាយក្នុងការប្រើប្រាស់ភាសាចិនក្នុងការប្រាស្រ័យទាក់ទង។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណសន្ទនា វត្ថុពិត/រូបភាពទំនិញ (ដបទឹក ដបទឹកដោះគោ ពងមាន់ ផ្លែប៉ោម នំចំណី) ក្តារខៀន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第一册) សៀវភៅកត់ត្រា ប៊ិច',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — រៀនសន្ទនាទី១ និងអត្ថបទទី២ ក្នុងមេរៀនទី៧ (第一课时：学习第七课对话一与短文二)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួររំលឹកទម្រង់ល្បះទាំង ៥ នៃសប្តាហ៍មុន (你买什么？我买鸡蛋和点心...)',
            lessonContent: 'រំលឹកទម្រង់ល្បះទាំង ៥ ដើម្បីត្រៀមរៀនការសន្ទនាជាក់ស្តែង',
            studentActivity: 'សិស្សលើកដៃឆ្លើយ និងអានទម្រង់ល្បះឱ្យគ្រូស្តាប់',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第三单元 购物 · 第七课 你买什么？ (对话 · 这一周只上对话)» លើក្តារខៀន\n២. បង្រៀន និងដឹកនាំសិស្សអាន 对话一 ៖\n   A: 你买什么？ (តើអ្នកទិញអ្វី?)\n   B: 我买点心。 (ខ្ញុំទិញនំចំណី។)\n   A: 你买几斤？ (តើអ្នកទិញប៉ុន្មានគីឡូកន្លះ/ជីន?)\n   B: 我买一斤。 (ខ្ញុំទិញមួយគីឡូកន្លះ/ជីន។)\n   A: 你还要什么？ (តើអ្នកត្រូវការអ្វីទៀត?)\n   B: 我还要一瓶水和两瓶牛奶。 (ខ្ញុំត្រូវការទឹកមួយដប និងទឹកដោះគោពីរដបទៀត។)\n៣. បង្រៀន និងដឹកនាំសិស្សអាន 对话/短文二 ៖\n   今天是星期六，我要买很多东西。我要买五瓶水、三瓶牛奶，还要买六个鸡蛋、两斤苹果和一斤点心。\n   (ថ្ងៃនេះជាថ្ងៃសៅរ៍ ខ្ញុំចង់ទិញរបស់របរជាច្រើន។ ខ្ញុំត្រូវការទិញទឹកប្រាំដប ទឹកដោះគោបីដប ហើយនៅត្រូវទិញពងមាន់ប្រាំមួយគ្រាប់ ផ្លែប៉ោមពីរគីឡូកន្លះ និងនំចំណីមួយគីឡូកន្លះទៀត។)\n៤. បែងចែកតួអង្គ A (អ្នកលក់) និង B (អ្នកទិញ) ឱ្យសិស្សអនុវត្តសន្ទនាជាដៃគូ\n៥. កែតម្រង់ការបញ្ចេញសំឡេង និងទឹកដមសំនៀង',
            lessonContent:
              '第三单元 购物 · 第七课 你买什么？ (对话 · 这一周只上对话)\n\n一. 对话一 (សន្ទនាទី១ ៖ ការសន្ទនាទិញនំចំណី និងភេសជ្ជៈ) ៖\nA: 你买什么？ (Nǐ mǎi shénme?) ៖ តើអ្នកទិញអ្វី?\nB: 我买点心。 (Wǒ mǎi diǎnxin.) ៖ ខ្ញុំទិញនំចំណី។\nA: 你买几斤？ (Nǐ mǎi jǐ jīn?) ៖ តើអ្នកទិញប៉ុន្មានគីឡូកន្លះ/ជីន?\nB: 我买一斤。 (Wǒ mǎi yì jīn.) ៖ ខ្ញុំទិញមួយគីឡូកន្លះ/ជីន។\nA: 你还要什么？ (Nǐ hái yào shénme?) ៖ តើអ្នកត្រូវការអ្វីទៀត?\nB: 我还要一瓶水和两瓶牛奶。 (Wǒ hái yào yì píng shuǐ hé liǎng píng niúnǎi.) ៖ ខ្ញុំត្រូវការទឹកមួយដប និងទឹកដោះគោពីរដបទៀត។\n\n二. 对话/短文二 (សន្ទនា/អត្ថបទខ្លីទី២ ៖ ទៅទិញរបស់របរនៅថ្ងៃសៅរ៍) ៖\n今天是星期六，我要买很多东西。我要买五瓶水、三瓶牛奶，还要买六个鸡蛋、两斤苹果和一斤点心。\n(Jīntiān shì xīngqīliù, wǒ yào mǎi hěn duō dōngxi. Wǒ yào mǎi wǔ píng shuǐ, sān píng niúnǎi, hái yào mǎi liù gè jīdàn, liǎng jīn píngguǒ hé yì jīn diǎnxin.)\n[បកប្រែ] ៖ ថ្ងៃនេះជាថ្ងៃសៅរ៍ ខ្ញុំចង់ទិញរបស់របរជាច្រើន។ ខ្ញុំត្រូវការទិញទឹកប្រាំដប ទឹកដោះគោបីដប ហើយនៅត្រូវទិញពងមាន់ប្រាំមួយគ្រាប់ ផ្លែប៉ោមពីរគីឡូកន្លះ និងនំចំណីមួយគីឡូកន្លះទៀត។\n\n三. 角色分工与语言点 (ការបែងចែកតួអង្គ និងចំណុចភាសា) ៖\n• A: 售货员 (អ្នកលក់) / B: 顾客 (អ្នកទិញ)\n• 数量表达 (ការប្រាប់ចំនួន) ៖ 五瓶水 (ទឹក៥ដប)、三瓶牛奶 (ទឹកដោះគោ៣ដប)、六个鸡蛋 (ពងមាន់៦គ្រាប់)、两斤苹果 (ផ្លែប៉ោម២ជីន)、一斤点心 (នំចំណី១ជីន)',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ចាប់ដៃគូឡើងសម្តែងសន្ទនា A-B និងចម្លងសន្ទនាទី១ និងអត្ថបទទី២ ចូលសៀវភៅកត់ត្រាឱ្យបានស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ហៅគូសិស្ស ២–៣ គូឡើងមុខថ្នាក់ សម្តែងការសន្ទនាទិញលក់ទំនិញដោយមិនមើលសៀវភៅ',
            lessonContent: 'ពង្រឹងភាពស្ទាត់ជំនាញក្នុងការសន្ទនាជាក់ស្តែង (会对话 会演练 会熟练表达)',
            studentActivity: 'គូសិស្សឡើងមុខថ្នាក់សម្តែងសន្ទនាដោយភាពរស់រវើក មិត្តរួមថ្នាក់ទះដៃលើកទឹកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងសន្ទនាទី១ និងអត្ថបទទី២ ចំនួន ២ដង\n២. ណែនាំឱ្យសិស្សទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លង 对话1 និង 短文2 ក្នុងមេរៀនទី៧ ចូលសៀវភៅ ចំនួន ២ដង (抄写对话1和短文2各2遍) ព្រមទាំងភីនអ៊ីន និងបកប្រែខ្មែរ រួចទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — សកម្មភាពសន្ទនាផ្សារទំនើប និងអនុវត្តតួអង្គ (第二课时：超市购物情境演练与对话拓展)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ២ នាក់ឡើងទន្ទេញសន្ទនាទី១ ឱ្យមិត្តរួមថ្នាក់ស្តាប់',
            lessonContent: 'រំលឹកសន្ទនាទី១ និងអត្ថបទទី២ នៃមេរៀនទី៧',
            studentActivity: 'សិស្សឡើងទន្ទេញសន្ទនាដោយភាពជឿជាក់',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. រៀបចំជ្រុងថ្នាក់រៀនជាតូបលក់ទំនិញខ្នាតតូច (Mini Supermarket)\n២. ឱ្យសិស្សប្រើប្រាស់ល្បះសន្ទនា និងប្តូរទំនិញ (ដបទឹក ផ្លែប៉ោម នំខេក ស្រា)\n៣. ណែនាំសិស្សឱ្យហាត់សរសេររាយនាមទំនិញដែលខ្លួនត្រូវទិញនៅថ្ងៃសៅរ៍ (Shopping List)',
            lessonContent:
              '一. 超市情境演练 (សកម្មភាពទិញទំនិញក្នុងផ្សារទំនើប) ៖\n• 售货员 (អ្នកលក់) ៖ 你好！你买什么？ / 你买几斤？ / 你还要什么？\n• 顾客 (អ្នកទិញ) ៖ 我买点心，买一斤。我还要两瓶水。\n\n二. 我的购物清单 (បញ្ជីទិញទំនិញរបស់ខ្ញុំ) ៖\n今天是星期六，我想买：\n1. 五瓶水\n2. 三瓶牛奶\n3. 六个鸡蛋\n4. 两斤苹果\n5. 一斤点心',
            studentActivity: 'សិស្សចូលរួមដើរតួជាអ្នកទិញ និងអ្នកលក់ អនុវត្តសន្ទនាជាភាសាចិន និងសរសេរបញ្ជីទំនិញ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'វាយតម្លៃការបញ្ចេញសំឡេង និងភាពរលូននៃការសន្ទនារបស់ក្រុមនីមួយៗ',
            lessonContent: 'ពង្រឹងទំនុកចិត្តក្នុងការប្រើប្រាស់ភាសាចិនប្រាស្រ័យទាក់ទង',
            studentActivity: 'សិស្សស្តាប់ការកែលម្អរបស់គ្រូ និងកែតម្រង់ការបញ្ចេញសំឡេង',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះ និងណែនាំឱ្យត្រៀមសៀវភៅពុម្ព និងសៀវភៅលំហាត់សម្រាប់សប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 抄写对话1和短文2各2遍并背诵 — ចម្លងសន្ទនាទី១ និងអត្ថបទទី២ ចំនួន ២ដង និងទន្ទេញឱ្យចាំមាត់។ ត្រៀមធ្វើលំហាត់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់សប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week5-shopping-exercises',
    linkedCurriculumId: 'cur-5',
    dateWeekday: 'ចន្ទ',
    dateDay: '៣០',
    dateMonth: 'វិច្ឆិកា',
    dateYear: '២០២៦',
    isoDate: '2026-11-30',
    chapterTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (综合练习 · 课本44-47页 & 练习册52-58页)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'សៀវភៅពុម្ព ទំព័រ ៤៤-៤៧ និង សៀវភៅលំហាត់ ទំព័រ ៥២-៥៨',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សក្តាប់បានយ៉ាងរឹងមាំនូវចំណេះដឹងទាំងអស់នៃមេរៀនទី៧ រួមមាន ពាក្យថ្មីទាំង ១១ ពាក្យ ទម្រង់ល្បះទាំង ៥ និងអត្ថបទសន្ទនា ព្រមទាំងចេះអនុវត្តធ្វើលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព (ទំព័រ ៤៤-៤៧) និងសៀវភៅលំហាត់ (ទំព័រ ៥២-៥៨) បានត្រឹមត្រូវគ្រប់ជ្រុងជ្រោយ។',
    skillObjective:
      'សិស្សមានជំនាញច្បាស់លាស់លើការស្តាប់ ការអាន ការសរសេរអក្សរចិន ការបំពេញពាក្យក្នុងប្រយោគ ការផ្គូផ្គង ការបកប្រែ និងការឆ្លើយសំណួរក្នុងលំហាត់សៀវភៅពុម្ព (第44-47页) និងសៀវភៅលំហាត់ (第52-58页)។',
    attitudeObjective:
      'សិស្សមានស្មារតីទទួលខុសត្រូវខ្ពស់ យកចិត្តទុកដាក់បំពេញកិច្ចការគ្រប់លំហាត់ឱ្យបានពេញលេញ ស្អាតបាត និងទាន់ពេលវេលា។',
    teachingMaterialsTeacher:
      'សៀវភៅពុម្ព (ទំព័រ ៤៤-៤៧) សៀវភៅលំហាត់ (ទំព័រ ៥២-៥៨) សៀវភៅគ្រូ កិច្ចតែងការបង្រៀន ក្តារខៀន ឯកសារចម្លើយគំរូ',
    teachingMaterialsStudent:
      'សៀវភៅពុម្ព (第44-47页) សៀវភៅលំហាត់ (第52-58页) ប៊ិច ខ្មៅដៃ បន្ទាត់',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — បំពេញលំហាត់សៀវភៅពុម្ព ទំព័រ ៤៤-៤៧ (第一课时：完成课本第44页-47页练习)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'រំលឹកសង្ខេបពាក្យថ្មី ទម្រង់ល្បះ និងសន្ទនាទិញទំនិញក្នុងមេរៀនទី៧',
            lessonContent: 'រំលឹកចំណេះដឹងគន្លឹះនៃមេរៀនទី៧ មុនចាប់ផ្តើមធ្វើលំហាត់សៀវភៅពុម្ព',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ និងត្រៀមបើកសៀវភៅពុម្ពទំព័រ ៤៤',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第三单元 购物 · 第七课 你买什么？ (综合练习 · 课本第44页-47页)» លើក្តារខៀន\n២. ណែនាំសិស្សធ្វើលំហាត់ក្នុងសៀវភៅពុម្ពម្តងមួយទំព័រ ៖\n   • ទំព័រ ៤៤ ៖ 听录音选出正确答案 (ស្តាប់ការបញ្ចេញសំឡេង និងគូសជ្រើសរើសចម្លើយត្រឹមត្រូវ)\n   • ទំព័រ ៤៥ ៖ 读一读，连一连 (អានពាក្យ ឃ្លា និងគូសផ្គូផ្គងជាមួយរូបភាពទំនិញ)\n   • ទំព័រ ៤៦ ៖ 看图回答问题 (សង្កេតរូបភាព និងឆ្លើយសំណួរទិញលក់ទំនិញ ៖ 买什么、买几斤、还要什么)\n   • ទំព័រ ៤៧ ៖ 课堂交际活动与角色演练 (សកម្មភាពប្រាស្រ័យទាក់ទង និងសង្ខេបចំណេះដឹង)\n៣. ដើរមើល ជួយណែនាំ និងកែតម្រង់សិស្សដែលជួបការលំបាក\n៤. កែសម្រួលចម្លើយត្រឹមត្រូវរួមគ្នានៅលើក្តារខៀន',
            lessonContent:
              '第三单元 购物 · 第七课 你买什么？ (综合练习 · 课本第44页-47页)\n\n一. 课本第44页练习 (សៀវភៅពុម្ព ទំព័រ ៤៤) ៖\n• 听音选图/选词 (ស្តាប់សំឡេង និងជ្រើសរើសរូបភាព/ពាក្យត្រឹមត្រូវ)\n• 重点考察生词认读 (ពិនិត្យការស្គាល់ពាក្យថ្មី៖ 买、和、点心、水、酒、蛋糕、瓶、斤)\n\n二. 课本第45-46页练习 (សៀវភៅពុម្ព ទំព័រ ៤៥-៤៦) ៖\n• 词句连线 (គូសផ្គូផ្គងពាក្យ និងប្រយោគ) ៖\n  1. 买东西 ➔ 去超市\n  2. 一瓶水 ➔ 矿泉水\n  3. 两斤苹果 ➔ 水果\n  4. 吃点心 ➔ 蛋糕/面包\n• 看图问答 (សង្កេតរូបភាព និងឆ្លើយសំណួរ) ៖\n  1. 问：你买什么？ 答：我买点心。\n  2. 问：你买几斤？ 答：我买一斤。\n  3. 问：你还要什么？ 答：我还要一瓶水和两瓶牛奶。\n\n三. 课本第47页交际活动 (សៀវភៅពុម្ព ទំព័រ ៤៧) ៖\n• 课堂购物调查 (ការស្ទង់មតិទិញទំនិញក្នុងថ្នាក់រៀន)\n• 熟练运用句型完成交际任务',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ធ្វើលំហាត់ក្នុងសៀវភៅពុម្ពទំព័រ ៤៤-៤៧ ដោយយកចិត្តទុកដាក់ លើកដៃសួរគ្រូពេលមិនយល់ ឡើងក្តារខៀនសរសេរចម្លើយ និងកត់ត្រាកែតម្រង់ចូលសៀវភៅ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'សង្ខេបចម្លើយសំខាន់ៗនៃទំព័រ ៤៤-៤៧ និងឱ្យសិស្សផ្ទៀងផ្ទាត់ឡើងវិញឱ្យបានត្រឹមត្រូវ ១០០%',
            lessonContent: 'ផ្ទៀងផ្ទាត់ និងពង្រឹងចម្លើយលំហាត់សៀវភៅពុម្ព (订正课本练习 确保全对)',
            studentActivity: 'សិស្សផ្ទៀងផ្ទាត់ចម្លើយ និងកែសម្រួលចំណុចខ្វះខាត',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់ភារកិច្ចឱ្យសិស្សបន្តធ្វើលំហាត់ក្នុងសៀវភៅលំហាត់ ទំព័រ ៥២ ដល់ ៥៨\n២. ត្រៀមកែសម្រួល និងបូកសរុបពិន្ទុមេរៀនទី៧',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ប្អូនៗត្រូវបំពេញលំហាត់ទាំងអស់ក្នុងសៀវភៅលំហាត់ (练习册) ពីទំព័រ ៥២ ដល់ ៥៨ (第52页到58页) ឱ្យបានគ្រប់ជ្រុងជ្រោយ ដើម្បីត្រៀមផ្ទៀងផ្ទាត់ និងកែសម្រួលនៅម៉ោងបន្ទាប់។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — បំពេញ និងកែសម្រួលសៀវភៅលំហាត់ ទំព័រ ៥២-៥៨ (第二课时：全完成并订正练习册第52页到58页)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសៀវភៅលំហាត់របស់សិស្សគ្រប់គ្នា',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យការយកសៀវភៅលំហាត់មកថ្នាក់',
            studentActivity: 'សិស្សដាក់សៀវភៅលំហាត់លើតុ និងត្រៀមកែសម្រួល',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួរពិនិត្យលំហាត់សៀវភៅពុម្ពទំព័រ ៤៤-៤៧ ដែលបានធ្វើរួច',
            lessonContent: 'រំលឹកឡើងវិញនូវលំហាត់សៀវភៅពុម្ព',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. ដឹកនាំសិស្សធ្វើ និងកែសម្រួលលំហាត់ក្នុងសៀវភៅលំហាត់第52页到58页 ៖\n   • 第52-53页 ៖ 汉字描红与书写 (ហាត់សរសេរអក្សរចិន 买, 水, 和, 东西, 蛋糕)\n   • 第54-55页 ៖ 看拼音写汉字与选词填空 (មើលភីនអ៊ីនសរសេរអក្សរចិន និងបំពេញចន្លោះល្បះ)\n   • 第56-57页 ៖ 连词成句与汉柬互译 (រៀបពាក្យជាល្បះ និងការបកប្រែ ចិន-ខ្មែរ)\n   • 第58页 ៖ 阅读理解与综合测试 (ការអានយល់អត្ថបទខ្លី និងឆ្លើយសំណួរ)\n២. ហៅសិស្សឡើងក្តារខៀនសរសេរចម្លើយលំហាត់នីមួយៗ\n៣. ពន្យល់ចំណុចដែលសិស្សឧស្សាហ៍ច្រឡំ និងកែតម្រូវរួមគ្នា',
            lessonContent:
              '一. 练习册第52页到58页核心练习解析 (ការពន្យល់លំហាត់សៀវភៅលំហាត់ ទំព័រ ៥២-៥៨) ៖\n1. 汉字书写 (第52-53页) ៖ 规范书写生词汉字，掌握正确笔画笔顺。\n2. 选词填空 (第54-55页) ៖\n   • 我去超市 (买) 东西。\n   • 我要一 (瓶) 水和两 (斤) 苹果。\n   • 他买了面包 (和) 点心。\n3. 连词成句 (第56-57页) ៖\n   • 你 / 买 / 什么 / ？ ➔ 你买什么？\n   • 我 / 还要 / 一瓶牛奶 / 。 ➔ 我还要一瓶牛奶。\n   • 今天 / 星期六 / 是 / 我想买 / 很多东西 / 。 ➔ 今天是星期六，我想买很多东西。\n4. 阅读与问答 (第58页) ៖ 理解购物短文，准确回答数量与物品。',
            studentActivity: 'សិស្សផ្ទៀងផ្ទាត់ចម្លើយក្នុងសៀវភៅលំហាត់ទំព័រ ៥២-៥៨ កែសម្រួលចំណុចខុសដោយប៊ិចក្រហម និងកត់ត្រាចម្លើយត្រឹមត្រូវចូលសៀវភៅ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'សង្ខេប និងវាយតម្លៃលទ្ធផលការរៀនមេរៀនទី៧ ទាំងមូល (生词、句型、对话、练习) ដោយលើកសរសើរសិស្សដែលខិតខំប្រឹងប្រែង',
            lessonContent: 'សង្ខេប និងវាយតម្លៃបញ្ចប់មេរៀនទី៧ ទាំងមូល (第七课全课总结与学习评价)',
            studentActivity: 'សិស្សស្តាប់ការសង្ខេបរបស់គ្រូ និងឆ្លើយសំណួរបូកសរុបមេរៀន',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ណែនាំឱ្យសិស្សកែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់ឱ្យបានពេញលេញ ១០០%\n២. ណែនាំឱ្យអានរំលឹកមេរៀនទី៧ ឡើងវិញនៅផ្ទះ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 完整订正课本第44-47页与练习册第52-58页的所有练习，复习第七课生词与对话。(កែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់ឱ្យបានពេញលេញ និងត្រឹមត្រូវ ១០០% ព្រមទាំងរំលឹកឡើងវិញនូវមេរៀនទី៧ ទាំងមូល)',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week6-apple-vocab',
    linkedCurriculumId: 'cur-6',
    dateWeekday: 'ចន្ទ',
    dateDay: '០៧',
    dateMonth: 'ធ្នូ',
    dateYear: '២០២៦',
    isoDate: '2026-12-07',
    chapterTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第八课 苹果多少钱一斤？ · មេរៀនទី៨ តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន？ (生词 · 这一周只上生词)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៤៨ ដល់ ទំព័រទី៤៩ (សៀវភៅពុម្ព 生词表)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សស្គាល់ ចងចាំ និងយល់អត្ថន័យយ៉ាងច្បាស់លាស់នូវពាក្យថ្មីទាំង ១១ ពាក្យក្នុងមេរៀនទី៨ រួមមាន៖ 1.多少 (duōshao - ប៉ុន្មាន), 2.钱 (qián - លុយ/ប្រាក់), 3.块（元） (kuài/yuán - យ័ន/កាក់), 4.毛 (máo - កាក់/១ភាគ១០នៃយ័ន), 5.一共 (yígòng - សរុបទាំងអស់), 6.猪肉 (zhūròu - សាច់ជ្រូក), 7.鸡 (jī - មាន់), 8.零 (líng - សូន្យ), 9.分 (fēn - សេន/កាក់តូច), 10.青菜 (qīngcài - បន្លែបៃតង), 11.肉 (ròu - សាច់) តាមរយៈការពន្យល់ ការបញ្ចេញសំឡេងភីនអ៊ីន និងរូបភាពជាក់ស្តែង។',
    skillObjective:
      'សិស្សមានសមត្ថភាពអាន បញ្ចេញសំឡេងភីនអ៊ីនបានត្រឹមត្រូវ ច្បាស់លាស់ ស្គាល់ទម្រង់តួអក្សរចិន ចេះសរសេរពាក្យថ្មីទាំង ១១ ពាក្យតាមលំដាប់លំដោយគំនូសត្រឹមត្រូវ និងចេះផ្សំផ្គុំជាឃ្លាខ្លីៗទាក់ទងនឹងការសួរតម្លៃ (ឧ. 多少钱、一斤猪肉、一只鸡、买青菜、一块两毛钱、一共多少钱)។',
    attitudeObjective:
      'សិស្សមានវិន័យល្អ យកចិត្តទុកដាក់ខ្ពស់ ចូលរួមសកម្មភាពអាន និងសរសេរពាក្យថ្មីដោយស្វាហាប់ និងសហការល្អជាមួយមិត្តរួមថ្នាក់។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណពាក្យរូបភាព (បន្លែ សាច់ជ្រូក មាន់ ផ្លែប៉ោម ក្រដាសប្រាក់ និងកាក់ប្រាក់ចិន) ក្តារខៀន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第一册) សៀវភៅកត់ត្រា ប៊ិច',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — រៀនពាក្យថ្មីទាំង ១១ ពាក្យក្នុងមេរៀនទី៨ (第一课时：学习第八课11个生词与拼音认读)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួររំលឹកពាក្យ និងឃ្លាទិញទំនិញក្នុងមេរៀនទី៧ ៖ 买东西, 水, 蛋糕, 苹果',
            lessonContent: 'រំលឹកពាក្យគន្លឹះមេរៀនមុន ដើម្បីភ្ជាប់ទៅកាន់ការសួរតម្លៃ និងទិញទំនិញក្នុងមេរៀនទី៨',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ និងបញ្ចេញសំឡេងពាក្យដោយទំនុកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第三单元 购物 · 第八课 苹果多少钱一斤？ (生词 · 这一周只上生词)» លើក្តារខៀន\n២. បង្រៀនពាក្យថ្មីទាំង ១១ ពាក្យម្តងមួយៗ (1.多少 2.钱 3.块/元 4.毛 5.一共 6.猪肉 7.鸡 8.零 9.分 10.青菜 11.肉) ព្រមទាំងភីនអ៊ីន និងអត្ថន័យ\n៣. បង្ហាញរូបភាព និងក្រដាសប្រាក់គំរូ ពន្យល់រូបិយវត្ថុចិន ៖ 块 (យ័ន) > 毛 (កាក់ = ១/១០ យ័ន) > 分 (សេន = ១/១០០ យ័ន)\n៤. ណែនាំឃ្លាផ្សំពាក្យ ៖ 多少钱 (តម្លៃប៉ុន្មាន), 一斤猪肉 (សាច់ជ្រូកមួយជីន), 一只鸡 (មាន់មួយក្បាល), 买青菜 (ទិញបន្លែ), 一共多少钱 (សរុបតម្លៃប៉ុន្មាន)\n៥. ដឹកនាំសិស្សអានជាក្រុម អានជាជួរ និងអានម្នាក់ម្តងៗ',
            lessonContent:
              '第三单元 购物 · 第八课 苹果多少钱一斤？ (生词 · 这一周只上生词)\n\n一. 生词 (ពាក្យថ្មីទាំង ១១ ពាក្យ) ៖\n1. 多少 (duōshao) ៖ [សព្វនាម] ប៉ុន្មាន (how many / how much)\n2. 钱 (qián) ៖ [នាម] លុយ, ប្រាក់ (money)\n3. 块（元） (kuài / yuán) ៖ [រនាប់] យ័ន, កាក់ (yuan / dollar) — ភាសានិយាយប្រើ 块, សរសេរប្រើ 元\n4. 毛 (máo) ៖ [រនាប់] កាក់, ១ភាគ១០នៃយ័ន = 10 分 (10 cents / dime)\n5. 一共 (yígòng) ៖ [គុណកិរិយា] សរុបទាំងអស់ (altogether, in total)\n6. 猪肉 (zhūròu) ៖ [នាម] សាច់ជ្រូក (pork)\n7. 鸡 (jī) ៖ [នាម] មាន់ (chicken)\n8. 零 (líng) ៖ [ចំនួន] សូន្យ (zero)\n9. 分 (fēn) ៖ [រនាប់] សេន, កាក់តូច = 1/100 យ័ន (cent)\n10. 青菜 (qīngcài) ៖ [នាម] បន្លែបៃតង, បន្លែស្រស់ (green vegetables)\n11. 肉 (ròu) ៖ [នាម] សាច់ (meat)\n\n二. 词组搭配 (ការផ្សំពាក្យ) ៖\n• 多少钱 (តម្លៃប៉ុន្មាន) · 一共多少钱 (សរុបតម្លៃប៉ុន្មាន)\n• 一斤猪肉 (សាច់ជ្រូក១ជីន) · 一只鸡 (មាន់១ក្បាល) · 买青菜 (ទិញបន្លែ)\n• 一块两毛钱 (១យ័ន២កាក់) · 五块零三分 (៥យ័ននិង៣សេន)',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ សង្កេតរូបភាព និងប័ណ្ណពាក្យ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ហាត់បញ្ចេញសំឡេងភីនអ៊ីនឱ្យបានត្រឹមត្រូវ និងចម្លងពាក្យថ្មីទាំង ១១ ចូលសៀវភៅកត់ត្រាឱ្យបានស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'បង្ហាញប័ណ្ណរូបភាព (សាច់ជ្រូក មាន់ បន្លែ លុយ) ឱ្យសិស្សឆ្លើយពាក្យចិនភ្លាមៗ និងហៅសិស្សឡើងអានពាក្យ',
            lessonContent: 'ពង្រឹងការចងចាំពាក្យថ្មីទាំង ១១ ពាក្យ (会读会记 会正确发音)',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ និងប្រកួតប្រជែងអានពាក្យថ្មីដោយភាពរស់រវើក',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងពាក្យថ្មីទាំង ១១ ពាក្យ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ\n២. ណែនាំឱ្យទន្ទេញឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លងពាក្យថ្មីដែលបានរៀនទាំង ១១ ពាក្យ (1.多少 2.钱 3.块 4.毛 5.一共 6.猪肉 7.鸡 8.零 9.分 10.青菜 11.肉) ក្នុងមួយពាក្យសរសេរចំនួន ៥ដង (抄写所学的生词写5遍) ព្រមទាំងភីនអ៊ីន និងអត្ថន័យខ្មែរ រួចទន្ទេញឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — ហ្វឹកហាត់អាន ស្គាល់អក្សរ និងសរសេរពាក្យថ្មី (第二课时：生词认读拓展与汉字书写)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ៣ នាក់ឡើងក្តារខៀន សរសេរភីនអ៊ីន និងអានពាក្យថ្មី 多少, 钱, 块, 毛, 猪肉, 青菜',
            lessonContent: 'រំលឹកពាក្យថ្មីទាំង ១១ ពាក្យនៃមេរៀនទី៨',
            studentActivity: 'សិស្សឡើងអាន និងសរសេរលើក្តារខៀន',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. ដឹកនាំសិស្សធ្វើលំហាត់ផ្គូផ្គងពាក្យ និងរូបភាពលើក្តារខៀន\n២. បង្រៀនគំនូស និងលំដាប់គំនូសអក្សរចិនសំខាន់ៗ ៖\n• 少 (4 画) ៖ 小 (3 画) + 撇 (1 画)\n• 钱 (10 画) ៖ 金字旁 (5 画) + 戋 (5 画)\n• 块 (7 画) ៖ 提土旁 (3 画) + 夬 (4 画)\n• 毛 (4 画) ៖ 撇、横、横、竖弯钩\n• 肉 (6 画) ៖ 竖、横折钩、撇、点、撇、点\n៣. ណែនាំសិស្សឱ្យហាត់សរសេរតាមលំដាប់លំដោយគំនូសអក្សរចិនត្រឹមត្រូវ',
            lessonContent:
              '一. 汉字笔画笔顺指导 (ការណែនាំគំនូស និងលំដាប់គំនូសអក្សរចិន) ៖\n1. 少 (4 画) ៖ 竖、点、撇、撇\n2. 钱 (10 画) ៖ 撇、横、横、横、竖提、横、斜钩、撇、点\n3. 块 (7 画) ៖ 横、竖、提、横折、横、撇、捺\n4. 毛 (4 画) ៖ 撇、横、横、竖弯钩\n5. 肉 (6 画) ៖ 竖、横折钩、撇、点、撇、点\n\n二. 词组扩展 (ពង្រីកការផ្សំពាក្យ) ៖\n• 买肉 · 买鸡 · 买菜 · 多少肉 · 一斤青菜',
            studentActivity: 'សិស្សសង្កេតគំនូសលើក្តារខៀន យកដៃគូសវាសលើខ្យល់តាមគ្រូ ហាត់សរសេរអក្សរចិនក្នុងសៀវភៅលំហាត់។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ហៅសិស្សឡើងសរសេរអក្សរ 钱, 块, 毛, 肉 លើក្តារខៀន និងអានឱ្យច្បាស់ៗ',
            lessonContent: 'ពង្រឹងការសរសេរអក្សរចិនត្រឹមត្រូវតាមក្បួនគំនូស',
            studentActivity: 'សិស្សឡើងសរសេរលើក្តារខៀន និងអានពាក្យ',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះឱ្យសិស្សចម្លងពាក្យថ្មី ៥ដង និងត្រៀមរៀនទម្រង់ល្បះនៅសប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ) ៖ 抄写所学生词写5遍 — ចម្លងពាក្យថ្មីដែលបានរៀនទាំង ១១ ពាក្យ ក្នុង១ពាក្យ ៥ដង ព្រមទាំងភីនអ៊ីន និងអត្ថន័យ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week7-apple-sentences',
    linkedCurriculumId: 'cur-7',
    dateWeekday: 'ចន្ទ',
    dateDay: '១៤',
    dateMonth: 'ធ្នូ',
    dateYear: '២០២៦',
    isoDate: '2026-12-14',
    chapterTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第八课 苹果多少钱一斤？ · មេរៀនទី៨ តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន？ (句型 · 这一周只上句型)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៥០ (សៀវភៅពុម្ព 句型)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សស្គាល់ ចងចាំ និងយល់ច្បាស់លាស់ពីទម្រង់ល្បះគំរូទាំង ៥ ក្នុងការសួរតម្លៃ និងទិញទំនិញ៖ 1.苹果多少钱一斤？ (តើផ្លែប៉ោមមួយគីឡូកន្លះតម្លៃប៉ុន្មាន?), 2.苹果四块两毛九一斤。 (ផ្លែប៉ោមមួយគីឡូកន្លះតម្លៃបួនយ័នពីរកាក់ប្រាំបួនសេន / ៤.២៩ យ័ន។), 3.你买多少？ (តើអ្នកទិញប៉ុន្មាន?), 4.我要一斤半。 (ខ្ញុំយកមួយគីឡូកន្លះនិងកន្លះទៀត / ៧៥០ក្រាម។), 5.一共多少钱？ (សរុបទាំងអស់តម្លៃប៉ុន្មាន?) ព្រមទាំងចេះប្រើប្រាស់រចនាសម្ព័ន្ធ «...多少钱一斤？», «我要...», «一共...» យ៉ាងត្រឹមត្រូវ។',
    skillObjective:
      'សិស្សមានសមត្ថភាពអាន បញ្ចេញសំឡេងភីនអ៊ីនបានត្រឹមត្រូវ ចេះសួរតម្លៃទំនិញ និងឆ្លើយប្រាប់តម្លៃប្រាក់ចិន (块、毛、分) បានយ៉ាងរលូន ចេះយកឈ្មោះទំនិញដទៃទៀតមកជំនួសក្នុងទម្រង់ល្បះ (ឧ. 猪肉多少钱一斤？青菜多少钱一斤？) និងចេះសរសេរទម្រង់ល្បះទាំង ៥ យ៉ាងស្អាត និងត្រឹមត្រូវ។',
    attitudeObjective:
      'សិស្សមានភាពក្លាហាន ស្វាហាប់ ចូលរួមយ៉ាងសកម្មក្នុងការហាត់បង្កើតល្បះសួរតម្លៃ និងអនុវត្តការទិញលក់ជាមួយមិត្តរួមថ្នាក់។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណទម្រង់ល្បះ ស្លាកតម្លៃទំនិញ ក្រដាសប្រាក់គំរូ ក្តារខៀន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第一册) សៀវភៅកត់ត្រា ប៊ិច',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — រៀនទម្រង់ល្បះទាំង ៥ ក្នុងមេរៀនទី៨ (第一课时：学习第八课5个核心句型)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួររំលឹកពាក្យថ្មីទាំង ១១ ពាក្យដែលបានរៀនសប្តាហ៍មុន (多少, 钱, 块, 毛, 一共, 猪肉, 鸡, 零, 分, 青菜, 肉)',
            lessonContent: 'រំលឹកពាក្យថ្មីទាំង ១១ ពាក្យ ដើម្បីត្រៀមរៀនទម្រង់ល្បះសួរតម្លៃ',
            studentActivity: 'សិស្សលើកដៃអានពាក្យថ្មី និងប្រាប់អត្ថន័យជាភាសាខ្មែរ',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第三单元 购物 · 第八课 苹果多少钱一斤？ (句型 · 这一周只上句型)» លើក្តារខៀន\n២. បង្រៀនទម្រង់ល្បះទាំង ៥ ម្តងមួយៗ ព្រមទាំងភីនអ៊ីន និងការបកប្រែ ៖\n   1. 苹果多少钱一斤？ (Píngguǒ duōshao qián yì jīn? · តើផ្លែប៉ោមមួយគីឡូកន្លះតម្លៃប៉ុន្មាន?)\n   2. 苹果四块两毛九一斤。 (Píngguǒ sì kuài liǎng máo jiǔ yì jīn. · ផ្លែប៉ោមមួយគីឡូកន្លះតម្លៃបួនយ័នពីរកាក់ប្រាំបួនសេន / ៤.២៩ យ័ន។)\n   3. 你买多少？ (Nǐ mǎi duōshao? · តើអ្នកទិញប៉ុន្មាន?)\n   4. 我要一斤半。 (Wǒ yào yì jīn bàn. · ខ្ញុំយកមួយគីឡូកន្លះនិងកន្លះទៀត / ៧៥០ក្រាម។)\n   5. 一共多少钱？ (Yígòng duōshao qián? · សរុបទាំងអស់តម្លៃប៉ុន្មាន?)\n៣. ពន្យល់ចំណុចវេយ្យាករណ៍គន្លឹះ ៖\n   • រចនាសម្ព័ន្ធសួរតម្លៃ ៖ [ទំនិញ] + 多少钱一斤？\n   • របៀបប្រាប់តម្លៃ ៖ [ទំនិញ] + [ចំនួន]块 + [ចំនួន]毛 + [ចំនួន]分 + 一斤\n   • ពាក្យ «半» (កន្លះ) ៖ 一斤半 (មួយជីនកន្លះ = ៧៥០ក្រាម), 半斤 (កន្លះជីន = ២៥០ក្រាម)\n   • ពាក្យ «一共» (សរុប) ៖ 一共多少钱？ (សរុបតម្លៃប៉ុន្មាន?)\n៤. ដឹកនាំសិស្សហាត់អានជាក្រុម អានជាជួរ និងហៅសិស្សអានម្នាក់ម្តងៗ\n៥. ណែនាំសិស្សហាត់បង្កើតល្បះជំនួសពាក្យ (替换练习)',
            lessonContent:
              '第三单元 购物 · 第八课 苹果多少钱一斤？ (句型 · 这一周只上句型)\n\n一. 核心句型 (ទម្រង់ល្បះគោលទាំង ៥) ៖\n1. 苹果多少钱一斤？ (Píngguǒ duōshao qián yì jīn?) ៖ តើផ្លែប៉ោមមួយគីឡូកន្លះតម្លៃប៉ុន្មាន?\n2. 苹果四块两毛九一斤。 (Píngguǒ sì kuài liǎng máo jiǔ yì jīn.) ៖ ផ្លែប៉ោមមួយគីឡូកន្លះតម្លៃបួនយ័នពីរកាក់ប្រាំបួនសេន (4.29 元)។\n3. 你买多少？ (Nǐ mǎi duōshao?) ៖ តើអ្នកទិញប៉ុន្មាន?\n4. 我要一斤半。 (Wǒ yào yì jīn bàn.) ៖ ខ្ញុំយកមួយគីឡូកន្លះនិងកន្លះទៀត (一斤半 = 750 克)។\n5. 一共多少钱？ (Yígòng duōshao qián?) ៖ សរុបទាំងអស់តម្លៃប៉ុន្មាន?\n\n二. 语法与价格表达 (វេយ្យាករណ៍ និងការប្រាប់តម្លៃប្រាក់ចិន) ៖\n• 4.29 元 ➔ 四块两毛九\n• 5.50 元 ➔ 五块五 (毛)\n• 10.08 元 ➔ 十块零八分\n• 物品 + 多少钱一斤？ (猪肉多少钱一斤？ / 青菜多少钱一斤？)\n\n三. 替换练习 (លំហាត់ជំនួសពាក្យ) ៖\n• 猪肉多少钱一斤？ ➔ 猪肉十八块一斤。\n• 你买多少？ ➔ 我要两斤 / 我要半斤。',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ហាត់សួរនិងឆ្លើយតម្លៃទំនិញ និងចម្លងទម្រង់ល្បះទាំង ៥ ចូលសៀវភៅកត់ត្រាឱ្យបានស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'បង្ហាញស្លាកតម្លៃ (ឧ. 苹果 ¥4.29, 猪肉 ¥18.00, 青菜 ¥3.50) ឱ្យសិស្សបង្កើតល្បះសួរ-ឆ្លើយភ្លាមៗ',
            lessonContent: 'ពង្រឹងសមត្ថភាពសួរ-ឆ្លើយតម្លៃទំនិញ (会问价 会报价 会正确表达)',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ និងអនុវត្តសន្ទនាសួរតម្លៃទំនិញដោយភាពជឿជាក់',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងទម្រង់ល្បះទាំង ៥ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ\n២. ណែនាំឱ្យហាត់អានទន្ទេញឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លងទម្រង់ល្បះទាំង ៥ ក្នុងមេរៀនទី៨ ក្នុងមួយល្បះសរសេរចំនួន ៥ដង (抄写所学5个句型各5遍) ព្រមទាំងភីនអ៊ីន និងអត្ថន័យខ្មែរ រួចហាត់អានឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — អនុវត្តបង្កើតល្បះ និងហ្វឹកហាត់វេយ្យាករណ៍ (第二课时：句型拓展运用与造句练习)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ៣ នាក់ឡើងអានទម្រង់ល្បះទាំង ៥ នៃមេរៀនទី៨ ដោយមិនមើលសៀវភៅ',
            lessonContent: 'រំលឹកទម្រង់ល្បះទាំង ៥ នៃមេរៀនទី៨',
            studentActivity: 'សិស្សឡើងអានទម្រង់ល្បះដោយទំនុកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. ដឹកនាំសិស្សធ្វើលំហាត់រៀបពាក្យជាល្បះលើក្តារខៀន\n២. បង្រៀនសិស្សបង្កើតល្បះសួរតម្លៃ និងគិតប្រាក់សរុប\n៣. ដាក់លំហាត់ឱ្យសិស្សអនុវត្តសរសេរក្នុងសៀវភៅលំហាត់',
            lessonContent:
              '一. 连词成句与造句 (ការរៀបពាក្យជាល្បះ និងការបង្កើតល្បះ) ៖\n1. 苹果 / 多少钱 / 一斤 / ？ ➔ 苹果多少钱一斤？\n2. 四块两毛九 / 苹果 / 一斤 / 。 ➔ 苹果四块两毛九一斤。\n3. 买 / 多少 / 你 / ？ ➔ 你买多少？\n4. 一斤半 / 要 / 我 / 。 ➔ 我要一斤半。\n5. 多少钱 / 一共 / ？ ➔ 一共多少钱？\n\n二. 语法拓展 (ពង្រីកវេយ្យាករណ៍) ៖\n• 苹果四块两毛九一斤，我要两斤，一共八块五毛八。',
            studentActivity: 'សិស្សឡើងក្តារខៀនរៀបពាក្យជាល្បះ អនុវត្តសរសេរចូលសៀវភៅ និងផ្ទៀងផ្ទាត់ជាមួយមិត្តភក្តិ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ឱ្យសិស្សម្នាក់ៗសួរតម្លៃទំនិញដែលខ្លួនចូលចិត្ត ឧ. «...多少钱一斤？»',
            lessonContent: 'ពង្រឹងសមត្ថភាពសួរតម្លៃទំនិញជាភាសាចិន',
            studentActivity: 'សិស្សលើកដៃអនុវត្តសួរតម្លៃទំនិញជាភាសាចិន',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះចម្លង ៥ដង និងត្រៀមរៀនផ្នែកសន្ទនានៅសប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 抄写5个句型各5遍 — ចម្លងទម្រង់ល្បះទាំង ៥ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week8-apple-dialogues',
    linkedCurriculumId: 'cur-8',
    dateWeekday: 'ចន្ទ',
    dateDay: '២១',
    dateMonth: 'ធ្នូ',
    dateYear: '២០២៦',
    isoDate: '2026-12-21',
    chapterTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第八课 苹果多少钱一斤？ · មេរៀនទី៨ តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន？ (对话 · 这一周只上对话)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៥១ (សៀវភៅពុម្ព 对话)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សយល់ដឹងយ៉ាងច្បាស់លាស់នូវអត្ថន័យ និងបរិបទប្រើប្រាស់នៃការសន្ទនាទាំងពីរក្នុងមេរៀនទី៨៖ 对话1 (A: 请问，苹果多少钱一斤？ B: 四块二一斤。 A: 我要一斤半。) និង 对话2 (A: 我要半斤猪肉。 B: 你还要什么？ A: 我还要一只鸡，一共多少钱？ B: 一共二十三块零六分。)。',
    skillObjective:
      'សិស្សចេះអានសន្ទនាដោយរលូន ត្រឹមត្រូវតាមសូរសំឡេងភីនអ៊ីន មានទឹកដមសំនៀងធម្មជាតិ ចេះចាប់ដៃគូសន្ទនាទិញម្ហូបអាហារនៅផ្សារ (Role-play ៖ អ្នកលក់ និងអ្នកទិញ) ព្រមទាំងចេះគិតប្រាក់ និងសរសេរចម្លងអត្ថបទសន្ទនាបានយ៉ាងស្អាត។',
    attitudeObjective:
      'សិស្សចូលរួមសកម្មភាពសន្ទនាជាដៃគូដោយភាពជឿជាក់ និងរីករាយក្នុងការប្រើប្រាស់ភាសាចិនក្នុងការប្រាស្រ័យទាក់ទងទិញលក់ទំនិញ។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណសន្ទនា រូបភាពទំនិញ (ផ្លែប៉ោម សាច់ជ្រូក មាន់) ក្រដាសប្រាក់គំរូ ក្តារខៀន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第一册) សៀវភៅកត់ត្រា ប៊ិច',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — រៀនសន្ទនាទី១ និងសន្ទនាទី២ ក្នុងមេរៀនទី៨ (第一课时：学习第八课对话一与对话二)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួររំលឹកទម្រង់ល្បះទាំង ៥ នៃសប្តាហ៍មុន (苹果多少钱一斤？苹果四块两毛九一斤...)',
            lessonContent: 'រំលឹកទម្រង់ល្បះទាំង ៥ ដើម្បីត្រៀមរៀនការសន្ទនាជាក់ស្តែង',
            studentActivity: 'សិស្សលើកដៃឆ្លើយ និងអានទម្រង់ល្បះឱ្យគ្រូស្តាប់',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第三单元 购物 · 第八课 苹果多少钱一斤？ (对话 · 这一周只上对话)» លើក្តារខៀន\n២. បង្រៀន និងដឹកនាំសិស្សអាន 对话一 ៖\n   A: 请问，苹果多少钱一斤？ (សូមសួរមួយ តើផ្លែប៉ោមមួយគីឡូកន្លះតម្លៃប៉ុន្មាន?)\n   B: 四块二一斤。 (មួយគីឡូកន្លះតម្លៃ ៤ យ័ន ២ កាក់ / 4.20 元។)\n   A: 我要一斤半。 (ខ្ញុំយកមួយគីឡូកន្លះនិងកន្លះទៀត / ៧៥០ ក្រាម។)\n៣. បង្រៀន និងដឹកនាំសិស្សអាន 对话二 ៖\n   A: 我要半斤猪肉。 (ខ្ញុំយកសាច់ជ្រូកកន្លះជីន / ២៥០ ក្រាម។)\n   B: 你还要什么？ (តើអ្នកត្រូវការអ្វីទៀត?)\n   A: 我还要一只鸡，一共多少钱？ (ខ្ញុំត្រូវការមាន់មួយក្បាលទៀត សរុបទាំងអស់តម្លៃប៉ុន្មាន?)\n   B: 一共二十三块零六分。 (សរុបទាំងអស់ ២៣ យ័ន និង ៦ សេន / 23.06 元។)\n៤. បែងចែកតួអង្គ A (អ្នកទិញ) និង B (អ្នកលក់) ឱ្យសិស្សអនុវត្តសន្ទនាជាដៃគូ\n៥. កែតម្រង់ការបញ្ចេញសំឡេង និងទឹកដមសំនៀង',
            lessonContent:
              '第三单元 购物 · 第八课 苹果多少钱一斤？ (对话 · 这一周只上对话)\n\n一. 对话一 (សន្ទនាទី១ ៖ សួរតម្លៃ និងទិញផ្លែប៉ោម) ៖\nA: 请问，苹果多少钱一斤？ (Qǐngwèn, píngguǒ duōshao qián yì jīn?)\n   [បកប្រែ] ៖ សូមសួរមួយ តើផ្លែប៉ោមមួយគីឡូកន្លះតម្លៃប៉ុន្មាន?\nB: 四块二一斤。 (Sì kuài èr yì jīn.)\n   [បកប្រែ] ៖ បួនយ័នពីរកាក់ក្នុងមួយគីឡូកន្លះ (4.20 元/斤)។\nA: 我要一斤半。 (Wǒ yào yì jīn bàn.)\n   [បកប្រែ] ៖ ខ្ញុំយកមួយគីឡូកន្លះនិងកន្លះទៀត (750 克)។\n\n二. 对话二 (សន្ទនាទី២ ៖ ទិញសាច់ជ្រូក មាន់ និងគិតលុយសរុប) ៖\nA: 我要半斤猪肉。 (Wǒ yào bàn jīn zhūròu.)\n   [បកប្រែ] ៖ ខ្ញុំយកសាច់ជ្រូកកន្លះជីន (250 克)។\nB: 你还要什么？ (Nǐ hái yào shénme?)\n   [បកប្រែ] ៖ តើអ្នកត្រូវការអ្វីទៀត?\nA: 我还要一只鸡，一共多少钱？ (Wǒ hái yào yì zhī jī, yígòng duōshao qián?)\n   [បកប្រែ] ៖ ខ្ញុំត្រូវការមាន់មួយក្បាលទៀត សរុបទាំងអស់តម្លៃប៉ុន្មាន?\nB: 一共二十三块零六分。 (Yígòng èrshísān kuài líng liù fēn.)\n   [បកប្រែ] ៖ សរុបទាំងអស់ម្ភៃបីយ័ននិងប្រាំមួយសេន (23.06 元)។\n\n三. 语言点与角色分工 (ចំណុចភាសា និងការបែងចែកតួអង្គ) ៖\n• 礼貌用语 ៖ 请问 (សូមសួរមួយ / excuse me)\n• 数量与单位 ៖ 一斤半 (750g) · 半斤 (250g) · 一只鸡 (មាន់១ក្បាល)\n• 总价计算 ៖ 二十三块零六分 (¥23.06)',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ចាប់ដៃគូឡើងសម្តែងសន្ទនា A-B និងចម្លងសន្ទនាទី១ និងសន្ទនាទី២ ចូលសៀវភៅកត់ត្រាឱ្យបានស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ហៅគូសិស្ស ២–៣ គូឡើងមុខថ្នាក់ សម្តែងការសន្ទនាទិញម្ហូបនៅផ្សារដោយមិនមើលសៀវភៅ',
            lessonContent: 'ពង្រឹងភាពស្ទាត់ជំនាញក្នុងការសន្ទនាជាក់ស្តែង (会对话 会演练 会熟练表达)',
            studentActivity: 'គូសិស្សឡើងមុខថ្នាក់សម្តែងសន្ទនាដោយភាពរស់រវើក មិត្តរួមថ្នាក់ទះដៃលើកទឹកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងសន្ទនាទី១ និងទី២ ចំនួន ២ដង\n២. ណែនាំឱ្យសិស្សទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លង 对话1 និង 对话2 ក្នុងមេរៀនទី៨ ចូលសៀវភៅ ចំនួន ២ដង (抄写对话1和对话2各2遍) ព្រមទាំងភីនអ៊ីន និងបកប្រែខ្មែរ រួចទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — សកម្មភាពសន្ទនាផ្សារលក់បន្លែសាច់ និងគិតប្រាក់ (第二课时：农贸市场购物情境演练与买卖对话)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ២ នាក់ឡើងទន្ទេញសន្ទនាទី១ ឱ្យមិត្តរួមថ្នាក់ស្តាប់',
            lessonContent: 'រំលឹកសន្ទនាទី១ និងទី២ នៃមេរៀនទី៨',
            studentActivity: 'សិស្សឡើងទន្ទេញសន្ទនាដោយភាពជឿជាក់',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. រៀបចំជ្រុងថ្នាក់រៀនជាតូបលក់ផ្លែឈើ និងសាច់ (Market Stall)\n២. ឱ្យសិស្សប្រើប្រាស់ល្បះសន្ទនា និងប្តូរទំនិញ (ផ្លែប៉ោម សាច់ជ្រូក មាន់ បន្លែ)\n៣. ណែនាំសិស្សឱ្យហាត់គិតប្រាក់សរុប និងប្រាប់តម្លៃជាភាសាចិន',
            lessonContent:
              '一. 菜市场情境演练 (សកម្មភាពទិញទំនិញនៅផ្សារ) ៖\n• 摊主 (អ្នកលក់) ៖ 你好！你买什么？ / 苹果四块二一斤 / 一共二十三块零六分。\n• 顾客 (អ្នកទិញ) ៖ 请问，苹果多少钱一斤？我要一斤半。我要半斤猪肉，还要一只鸡。\n\n二. 实际算账练习 (ការអនុវត្តគិតប្រាក់ជាក់ស្តែង) ៖\n1. 苹果 1.5 斤 = 4.2 × 1.5 = 6.30 元 (六块三)\n2. 猪肉 0.5 斤 = 9.00 元 (九块)\n3. 鸡 1 只 = 14.06 元 (十四块零六分)\n➔ 一共二十九块三毛六 (29.36 元)',
            studentActivity: 'សិស្សចូលរួមដើរតួជាអ្នកទិញ និងអ្នកលក់ អនុវត្តសន្ទនាជាភាសាចិន និងហាត់គិតប្រាក់។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'វាយតម្លៃការបញ្ចេញសំឡេង និងភាពរលូននៃការសន្ទនារបស់ក្រុមនីមួយៗ',
            lessonContent: 'ពង្រឹងទំនុកចិត្តក្នុងការប្រើប្រាស់ភាសាចិនប្រាស្រ័យទាក់ទងទិញលក់',
            studentActivity: 'សិស្សស្តាប់ការកែលម្អរបស់គ្រូ និងកែតម្រង់ការបញ្ចេញសំឡេង',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះ និងណែនាំឱ្យត្រៀមសៀវភៅពុម្ព និងសៀវភៅលំហាត់សម្រាប់សប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 抄写对话1和对话2各2遍并背诵对话1 — ចម្លងសន្ទនាទី១ និងទី២ ចំនួន ២ដង និងទន្ទេញឱ្យចាំមាត់។ ត្រៀមធ្វើលំហាត់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់សប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week9-apple-exercises',
    linkedCurriculumId: 'cur-9',
    dateWeekday: 'ចន្ទ',
    dateDay: '២៨',
    dateMonth: 'ធ្នូ',
    dateYear: '២០២៦',
    isoDate: '2026-12-28',
    chapterTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第八课 苹果多少钱一斤？ · មេរៀនទី៨ តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន？ (综合练习 · 课本50-53页 & 练习册59-64页)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'សៀវភៅពុម្ព ទំព័រ ៥០-៥៣ និង សៀវភៅលំហាត់ ទំព័រ ៥៩-៦៤',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សក្តាប់បានយ៉ាងរឹងមាំនូវចំណេះដឹងទាំងអស់នៃមេរៀនទី៨ រួមមាន ពាក្យថ្មីទាំង ១១ ពាក្យ ទម្រង់ល្បះទាំង ៥ និងអត្ថបទសន្ទនាទិញលក់ទំនិញ ព្រមទាំងចេះអនុវត្តធ្វើលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព (ទំព័រ ៥០-៥៣) និងសៀវភៅលំហាត់ (ទំព័រ ៥៩-៦៤) បានត្រឹមត្រូវគ្រប់ជ្រុងជ្រោយ។',
    skillObjective:
      'សិស្សមានជំនាញច្បាស់លាស់លើការស្តាប់តម្លៃ ការអាន ការសរសេរអក្សរចិន ការគណនាតម្លៃប្រាក់ចិន ការបំពេញពាក្យ ការផ្គូផ្គង ការបកប្រែ និងការឆ្លើយសំណួរក្នុងលំហាត់សៀវភៅពុម្ព (第50-53页) និងសៀវភៅលំហាត់ (第59-64页)។',
    attitudeObjective:
      'សិស្សមានស្មារតីទទួលខុសត្រូវខ្ពស់ យកចិត្តទុកដាក់បំពេញកិច្ចការគ្រប់លំហាត់ឱ្យបានពេញលេញ ស្អាតបាត និងទាន់ពេលវេលា។',
    teachingMaterialsTeacher:
      'សៀវភៅពុម្ព (ទំព័រ ៥០-៥៣) សៀវភៅលំហាត់ (ទំព័រ ៥៩-៦៤) សៀវភៅគ្រូ កិច្ចតែងការបង្រៀន ក្តារខៀន ឯកសារចម្លើយគំរូ',
    teachingMaterialsStudent:
      'សៀវភៅពុម្ព (第50-53页) សៀវភៅលំហាត់ (第59-64页) ប៊ិច ខ្មៅដៃ បន្ទាត់',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — បំពេញលំហាត់សៀវភៅពុម្ព ទំព័រ ៥០-៥៣ (第一课时：完成课本第50页-53页练习)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'រំលឹកសង្ខេបពាក្យថ្មី ទម្រង់ល្បះ និងសន្ទនាសួរតម្លៃក្នុងមេរៀនទី៨',
            lessonContent: 'រំលឹកចំណេះដឹងគន្លឹះនៃមេរៀនទី៨ មុនចាប់ផ្តើមធ្វើលំហាត់សៀវភៅពុម្ព',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ និងត្រៀមបើកសៀវភៅពុម្ពទំព័រ ៥០',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第三单元 购物 · 第八课 苹果多少钱一斤？ (综合练习 · 课本第50页-53页)» លើក្តារខៀន\n២. ណែនាំសិស្សធ្វើលំហាត់ក្នុងសៀវភៅពុម្ពម្តងមួយទំព័រ ៖\n   • ទំព័រ ៥០ ៖ 听录音选出正确价格 (ស្តាប់ការបញ្ចេញសំឡេងតម្លៃ និងគូសជ្រើសរើសចម្លើយត្រឹមត្រូវ)\n   • ទំព័រ ៥១ ៖ 读一读，连一连 (អានពាក្យ ឃ្លា និងគូសផ្គូផ្គងជាមួយតម្លៃទំនិញ)\n   • ទំព័រ ៥២ ៖ 看图计算价格并回答问题 (សង្កេតរូបភាព គណនាតម្លៃ និងឆ្លើយសំណួរ ៖ 多少钱一斤、买多少、一共多少钱)\n   • ទំព័រ ៥៣ ៖ 课堂购物交际活动与角色演练 (សកម្មភាពប្រាស្រ័យទាក់ទង និងសង្ខេបចំណេះដឹង)\n៣. ដើរមើល ជួយណែនាំ និងកែតម្រង់សិស្សដែលជួបការលំបាក\n៤. កែសម្រួលចម្លើយត្រឹមត្រូវរួមគ្នានៅលើក្តារខៀន',
            lessonContent:
              '第三单元 购物 · 第八课 苹果多少钱一斤？ (综合练习 · 课本第50页-53页)\n\n一. 课本第50页练习 (សៀវភៅពុម្ព ទំព័រ ៥០) ៖\n• 听音选价 (ស្តាប់សំឡេង និងជ្រើសរើសតម្លៃត្រឹមត្រូវ ៖ 4.29元 / 18.00元 / 23.06元)\n• 重点考察价格听力理解 (ពិនិត្យការស្តាប់តម្លៃ ៖ 块、毛、分)\n\n二. 课本第51-52页练习 (សៀវភៅពុម្ព ទំព័រ ៥១-៥២) ៖\n• 物品与价格连线 (គូសផ្គូផ្គងទំនិញ និងតម្លៃ) ៖\n  1. 苹果 ➔ 四块两毛九一斤\n  2. 猪肉 ➔ 十八块一斤\n  3. 青菜 ➔ 三块五一斤\n  4. 鸡 ➔ 二十三块一只\n• 看图算账问答 (សង្កេតរូបភាព និងគណនាតម្លៃ) ៖\n  1. 问：苹果多少钱一斤？ 答：四块两毛九一斤。\n  2. 问：你要多少？ 答：我要一斤半。\n  3. 问：一共多少钱？ 答：一共六块四毛四。\n\n三. 课本第53页交际活动 (សៀវភៅពុម្ព ទំព័រ ៥៣) ៖\n• 课堂买菜大调查 (ការស្ទង់មតិទិញម្ហូបអាហារក្នុងថ្នាក់រៀន)\n• 熟练运用问价句型完成交际任务',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ធ្វើលំហាត់ក្នុងសៀវភៅពុម្ពទំព័រ ៥០-៥៣ ដោយយកចិត្តទុកដាក់ លើកដៃសួរគ្រូពេលមិនយល់ ឡើងក្តារខៀនសរសេរចម្លើយ និងកត់ត្រាកែតម្រង់ចូលសៀវភៅ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'សង្ខេបចម្លើយសំខាន់ៗនៃទំព័រ ៥០-៥៣ និងឱ្យសិស្សផ្ទៀងផ្ទាត់ឡើងវិញឱ្យបានត្រឹមត្រូវ ១០០%',
            lessonContent: 'ផ្ទៀងផ្ទាត់ និងពង្រឹងចម្លើយលំហាត់សៀវភៅពុម្ព (订正课本练习 确保全对)',
            studentActivity: 'សិស្សផ្ទៀងផ្ទាត់ចម្លើយ និងកែសម្រួលចំណុចខ្វះខាត',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់ភារកិច្ចឱ្យសិស្សបន្តធ្វើលំហាត់ក្នុងសៀវភៅលំហាត់ ទំព័រ ៥៩ ដល់ ៦៤\n២. ត្រៀមកែសម្រួល និងបូកសរុបពិន្ទុមេរៀនទី៨',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ប្អូនៗត្រូវបំពេញលំហាត់ទាំងអស់ក្នុងសៀវភៅលំហាត់ (练习册) ពីទំព័រ ៥៩ ដល់ ៦៤ (第59页到64页) ឱ្យបានគ្រប់ជ្រុងជ្រោយ ដើម្បីត្រៀមផ្ទៀងផ្ទាត់ និងកែសម្រួលនៅម៉ោងបន្ទាប់។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — បំពេញ និងកែសម្រួលសៀវភៅលំហាត់ ទំព័រ ៥៩-៦៤ (第二课时：全完成并订正练习册第59页到64页)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសៀវភៅលំហាត់របស់សិស្សគ្រប់គ្នា',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យការយកសៀវភៅលំហាត់មកថ្នាក់',
            studentActivity: 'សិស្សដាក់សៀវភៅលំហាត់លើតុ និងត្រៀមកែសម្រួល',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួរពិនិត្យលំហាត់សៀវភៅពុម្ពទំព័រ ៥០-៥៣ ដែលបានធ្វើរួច',
            lessonContent: 'រំលឹកឡើងវិញនូវលំហាត់សៀវភៅពុម្ព',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. ដឹកនាំសិស្សធ្វើ និងកែសម្រួលលំហាត់ក្នុងសៀវភៅលំហាត់第59页到64页 ៖\n   • 第59-60页 ៖ 汉字描红与书写 (ហាត់សរសេរអក្សរចិន 少, 钱, 块, 毛, 肉, 鸡, 菜)\n   • 第61-62页 ៖ 看拼音写汉字与选词填空 (មើលភីនអ៊ីនសរសេរអក្សរចិន និងបំពេញចន្លោះល្បះ)\n   • 第63页 ៖ 连词成句与汉柬互译 (រៀបពាក្យជាល្បះ និងការបកប្រែ ចិន-ខ្មែរ)\n   • 第64页 ៖ 阅读理解与综合测试 (ការអានយល់អត្ថបទខ្លីទិញទំនិញ និងឆ្លើយសំណួរ)\n២. ហៅសិស្សឡើងក្តារខៀនសរសេរចម្លើយលំហាត់នីមួយៗ\n៣. ពន្យល់ចំណុចដែលសិស្សឧស្សាហ៍ច្រឡំ និងកែតម្រូវរួមគ្នា',
            lessonContent:
              '一. 练习册第59页到64页核心练习解析 (ការពន្យល់លំហាត់សៀវភៅលំហាត់ ទំព័រ ៥៩-៦៤) ៖\n1. 汉字书写 (第59-60页) ៖ 规范书写生词汉字，掌握正确笔画笔顺。\n2. 选词填空 (第61-62页) ៖\n   • 请问，苹果多少 (钱) 一斤？\n   • 苹果四 (块) 两 (毛) 九一斤。\n   • 我要一斤 (半) 猪肉。\n   • 一只鸡和两斤青菜， (一共) 二十块。\n3. 连词成句 (第63页) ៖\n   • 苹果 / 多少钱 / 一斤 / ？ ➔ 苹果多少钱一斤？\n   • 我 / 一斤半 / 要 / 。 ➔ 我要一斤半。\n   • 一共 / 多少钱 / ？ ➔ 一共多少钱？\n4. 阅读与问答 (第64页) ៖ 理解买菜短文，准确计算总价与购买数量。',
            studentActivity: 'សិស្សផ្ទៀងផ្ទាត់ចម្លើយក្នុងសៀវភៅលំហាត់ទំព័រ ៥៩-៦៤ កែសម្រួលចំណុចខុសដោយប៊ិចក្រហម និងកត់ត្រាចម្លើយត្រឹមត្រូវចូលសៀវភៅ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'សង្ខេប និងវាយតម្លៃលទ្ធផលការរៀនមេរៀនទី៨ ទាំងមូល (生词、句型、对话、练习) ដោយលើកសរសើរសិស្សដែលខិតខំប្រឹងប្រែង',
            lessonContent: 'សង្ខេប និងវាយតម្លៃបញ្ចប់មេរៀនទី៨ ទាំងមូល (第八课全课总结与学习评价)',
            studentActivity: 'សិស្សស្តាប់ការសង្ខេបរបស់គ្រូ និងឆ្លើយសំណួរបូកសរុបមេរៀន',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ណែនាំឱ្យសិស្សកែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់ឱ្យបានពេញលេញ ១០០%\n២. ណែនាំឱ្យអានរំលឹកមេរៀនទី៨ ឡើងវិញនៅផ្ទះ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 完整订正课本第50-53页与练习册第59-64页的所有练习，复习第八课生词、句型与对话。(កែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់ឱ្យបានពេញលេញ និងត្រឹមត្រូវ ១០០% ព្រមទាំងរំលឹកឡើងវិញនូវមេរៀនទី៨ ទាំងមូល)',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week10-clothes-vocab',
    linkedCurriculumId: 'cur-10',
    dateWeekday: 'ចន្ទ',
    dateDay: '០៤',
    dateMonth: 'មករា',
    dateYear: '២០២៧',
    isoDate: '2027-01-04',
    chapterTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第九课 这件衣服比那件贵一点儿 · មេរៀនទី៩ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច (生词 · 这一周只上生词)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៥៤ ដល់ ទំព័រទី៥៥ (សៀវភៅពុម្ព 生词表)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សស្គាល់ ចងចាំ និងយល់អត្ថន័យយ៉ាងច្បាស់លាស់នូវពាក្យថ្មីទាំង ១២ ពាក្យក្នុងមេរៀនទី៩ រួមមាន៖ 1.件 (jiàn - កំប្លេរ/សម្រាប់ខោអាវ), 2.衣服 (yīfu - សំលៀកបំពាក់/ខោអាវ), 3.贵 (guì - ថ្លៃ), 4.一点儿 (yìdiǎnr - បន្តិច/បន្តិចបន្តួច), 5.自行车 (zìxíngchē - កង់), 6.跟 (gēn - ជាមួយ/ដូច), 7.一样 (yíyàng - ដូចគ្នា), 8.毛衣 (máoyī - អាវរងា/អាវចាក់), 9.短 (duǎn - ខ្លី), 10.便宜 (piányi - ថោក), 11.运动鞋 (yùndòngxié - ស្បែកជើងកីឡា), 12.长 (cháng - វែង) តាមរយៈការពន្យល់ ការបញ្ចេញសំឡេងភីនអ៊ីន និងរូបភាពជាក់ស្តែង។',
    skillObjective:
      'សិស្សមានសមត្ថភាពអាន បញ្ចេញសំឡេងភីនអ៊ីនបានត្រឹមត្រូវ ច្បាស់លាស់ ស្គាល់ទម្រង់តួអក្សរចិន ចេះសរសេរពាក្យថ្មីទាំង ១២ ពាក្យតាមលំដាប់លំដោយគំនូសត្រឹមត្រូវ និងចេះផ្សំផ្គុំជាឃ្លាខ្លីៗទាក់ទងនឹងការប្រៀបធៀប (ឧ. 两件衣服、贵一点儿、跟...一样、便宜一点儿、买毛衣、穿运动鞋、头发长/短)។',
    attitudeObjective:
      'សិស្សមានវិន័យល្អ យកចិត្តទុកដាក់ខ្ពស់ ចូលរួមសកម្មភាពអាន និងសរសេរពាក្យថ្មីដោយស្វាហាប់ និងសហការល្អជាមួយមិត្តរួមថ្នាក់។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណពាក្យរូបភាព (ខោអាវ អាវរងា ស្បែកជើងកីឡា កង់ រូបភាពវែង-ខ្លី ថ្លៃ-ថោក) ក្តារខៀន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第一册) សៀវភៅកត់ត្រា ប៊ិច',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — រៀនពាក្យថ្មីទាំង ១២ ពាក្យក្នុងមេរៀនទី៩ (第一课时：学习第九课12个生词与拼音认读)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្សដើមឆ្នាំថ្មី ២០២៧',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយដើមឆ្នាំ ២០២៧ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួររំលឹកពាក្យ និងឃ្លាទិញទំនិញក្នុងមេរៀនទី៨ ៖ 多少钱, 苹果, 猪肉, 块, 毛',
            lessonContent: 'រំលឹកពាក្យគន្លឹះមេរៀនមុន ដើម្បីភ្ជាប់ទៅកាន់ការប្រៀបធៀបតម្លៃ និងគុណភាពទំនិញក្នុងមេរៀនទី៩',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ និងបញ្ចេញសំឡេងពាក្យដោយទំនុកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第三单元 购物 · 第九课 这件衣服比那件贵一点儿 (生词 · 这一周只上生词)» លើក្តារខៀន\n២. បង្រៀនពាក្យថ្មីទាំង ១២ ពាក្យម្តងមួយៗ (1.件 2.衣服 3.贵 4.一点儿 5.自行车 6.跟 7.一样 8.毛衣 9.短 10.便宜 11.运动鞋 12.长) ព្រមទាំងភីនអ៊ីន និងអត្ថន័យ\n៣. បង្ហាញរូបភាព និងគូពាក្យផ្ទុយ ៖ 贵 (ថ្លៃ) ↔ 便宜 (ថោក), 长 (វែង) ↔ 短 (ខ្លី), 一样 (ដូចគ្នា) ↔ 不一样 (មិនដូចគ្នា)\n៤. ណែនាំឃ្លាផ្សំពាក្យ ៖ 这件衣服 (សំលៀកបំពាក់នេះ), 贵一点儿 (ថ្លៃជាងបន្តិច), 自行车 (កង់), 跟...一样 (ដូចគ្នានឹង...)\n៥. ដឹកនាំសិស្សអានជាក្រុម អានជាជួរ និងអានម្នាក់ម្តងៗ',
            lessonContent:
              '第三单元 购物 · 第九课 这件衣服比那件贵一点儿 (生词 · 这一周只上生词)\n\n一. 生词 (ពាក្យថ្មីទាំង ១២ ពាក្យ) ៖\n1. 件 (jiàn) ៖ [រនាប់] សម្រាប់សំលៀកបំពាក់/អាវ (piece / item of clothing) — ឧ. 一件衣服\n2. 衣服 (yīfu) ៖ [នាម] សំលៀកបំពាក់, ខោអាវ (clothes)\n3. 贵 (guì) ៖ [គុណនាម] ថ្លៃ (expensive)\n4. 一点儿 (yìdiǎnr) ៖ [បរិមាណ] បន្តិច, បន្តិចបន្តួច (a little bit)\n5. 自行车 (zìxíngchē) ៖ [នាម] កង់ (bicycle)\n6. 跟 (gēn) ៖ [ឈ្នាប់/ធ្នាក់] ជាមួយ, ដូច (with, as)\n7. 一样 (yíyàng) ៖ [គុណនាម] ដូចគ្នា (same, alike)\n8. 毛衣 (máoyī) ៖ [នាម] អាវរងាធ្វើពីរោមចៀម, អាវចាក់ (sweater)\n9. 短 (duǎn) ៖ [គុណនាម] ខ្លី (short)\n10. 便宜 (piányi) ៖ [គុណនាម] ថោក (cheap)\n11. 运动鞋 (yùndòngxié) ៖ [នាម] ស្បែកជើងកីឡា (sneakers / sports shoes)\n12. 长 (cháng) ៖ [គុណនាម] វែង (long)\n\n二. 反义词与搭配 (ពាក្យផ្ទុយ និងការផ្សំពាក្យ) ៖\n• 贵 (ថ្លៃ) ↔ 便宜 (ថោក) · 长 (វែង) ↔ 短 (ខ្លី) · 一样 (ដូចគ្នា) ↔ 不一样 (មិនដូចគ្នា)\n• 两件衣服 (សំលៀកបំពាក់២កំប្លេរ) · 一件毛衣 (អាវរងា១) · 一双运动鞋 (ស្បែកជើងកីឡា១គូ)\n• 贵一点儿 (ថ្លៃជាងបន្តិច) · 便宜一点儿 (ថោកជាងបន្តិច) · 跟我的自行车一样 (ដូចគ្នានឹងកង់របស់ខ្ញុំ)',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ សង្កេតរូបភាព និងប័ណ្ណពាក្យ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ហាត់បញ្ចេញសំឡេងភីនអ៊ីនឱ្យបានត្រឹមត្រូវ និងចម្លងពាក្យថ្មីទាំង ១២ ចូលសៀវភៅកត់ត្រាឱ្យបានស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'បង្ហាញប័ណ្ណរូបភាព (អាវ កង់ ស្បែកជើងកីឡា វែង-ខ្លី) ឱ្យសិស្សឆ្លើយពាក្យចិនភ្លាមៗ និងហៅសិស្សឡើងអានពាក្យ',
            lessonContent: 'ពង្រឹងការចងចាំពាក្យថ្មីទាំង ១២ ពាក្យ (会读会记 会正确发音)',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ និងប្រកួតប្រជែងអានពាក្យថ្មីដោយភាពរស់រវើក',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងពាក្យថ្មីទាំង ១២ ពាក្យ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ\n២. ណែនាំឱ្យទន្ទេញឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លងពាក្យថ្មីដែលបានរៀនទាំង ១២ ពាក្យ (1.件 2.衣服 3.贵 4.一点儿 5.自行车 6.跟 7.一样 8.毛衣 9.短 10.便宜 11.运动鞋 12.长) ក្នុងមួយពាក្យសរសេរចំនួន ៥ដង (抄写所学的生词写5遍) ព្រមទាំងភីនអ៊ីន និងអត្ថន័យខ្មែរ រួចទន្ទេញឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — ហ្វឹកហាត់អាន ស្គាល់អក្សរ និងសរសេរពាក្យថ្មី (第二课时：生词认读拓展与汉字书写)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ៣ នាក់ឡើងក្តារខៀន សរសេរភីនអ៊ីន និងអានពាក្យថ្មី 件, 衣服, 贵, 自行车, 一样, 便宜',
            lessonContent: 'រំលឹកពាក្យថ្មីទាំង ១២ ពាក្យនៃមេរៀនទី៩',
            studentActivity: 'សិស្សឡើងអាន និងសរសេរលើក្តារខៀន',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. ដឹកនាំសិស្សធ្វើលំហាត់ផ្គូផ្គងពាក្យផ្ទុយ និងរូបភាពលើក្តារខៀន\n២. បង្រៀនគំនូស និងលំដាប់គំនូសអក្សរចិនសំខាន់ៗ ៖\n• 件 (6 画) ៖ 单人旁 (2 画) + 牛 (4 画)\n• 衣 (6 画) ៖ 点、横、撇、竖提、撇、捺\n• 服 (8 画) ៖ 月字旁 (4 画) + 5 画\n• 贵 (9 画) ៖ 中 (4 画) + 一 (1 画) + 贝 (4 画)\n• 跟 (13 画) ៖ 足字旁 (7 画) + 艮 (6 画)\n• 样 (10 画) ៖ 木字旁 (4 画) + 羊 (6 画)\n• 长 (4 画) ៖ 撇、横、竖提、捺\n៣. ណែនាំសិស្សឱ្យហាត់សរសេរតាមលំដាប់លំដោយគំនូសអក្សរចិនត្រឹមត្រូវ',
            lessonContent:
              '一. 汉字笔画笔顺指导 (ការណែនាំគំនូស និងលំដាប់គំនូសអក្សរចិន) ៖\n1. 件 (6 画) ៖ 撇、竖、撇、横、横、竖\n2. 衣 (6 画) ៖ 点、横、撇、竖提、撇、捺\n3. 贵 (9 画) ៖ 竖、横折、横、横、横、竖、横折、撇、点\n4. 跟 (13 画) ៖ 竖、横折、横、竖、横、竖、提、横折、横、横、竖提、撇、捺\n5. 长 (4 画) ៖ 撇、横、竖提、捺\n\n二. 词组扩展 (ពង្រីកការផ្សំពាក្យ) ៖\n• 买衣服 · 穿毛衣 · 骑自行车 · 运动鞋 · 贵一点儿',
            studentActivity: 'សិស្សសង្កេតគំនូសលើក្តារខៀន យកដៃគូសវាសលើខ្យល់តាមគ្រូ ហាត់សរសេរអក្សរចិនក្នុងសៀវភៅលំហាត់។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ហៅសិស្សឡើងសរសេរអក្សរ 件, 衣, 贵, 跟, 样, 长 លើក្តារខៀន និងអានឱ្យច្បាស់ៗ',
            lessonContent: 'ពង្រឹងការសរសេរអក្សរចិនត្រឹមត្រូវតាមក្បួនគំនូស',
            studentActivity: 'សិស្សឡើងសរសេរលើក្តារខៀន និងអានពាក្យ',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះឱ្យសិស្សចម្លងពាក្យថ្មី ៥ដង និងត្រៀមរៀនទម្រង់ល្បះនៅសប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ) ៖ 抄写所学生词写5遍 — ចម្លងពាក្យថ្មីដែលបានរៀនទាំង ១២ ពាក្យ ក្នុង១ពាក្យ ៥ដង ព្រមទាំងភីនអ៊ីន និងអត្ថន័យ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week11-clothes-sentences',
    linkedCurriculumId: 'cur-11',
    dateWeekday: 'ចន្ទ',
    dateDay: '១១',
    dateMonth: 'មករា',
    dateYear: '២០២៧',
    isoDate: '2027-01-11',
    chapterTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第九课 这件衣服比那件贵一点儿 · មេរៀនទី៩ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច (句型 · 这一周只上句型)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៥៦ (សៀវភៅពុម្ព 句型)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សស្គាល់ ចងចាំ និងយល់ច្បាស់លាស់ពីទម្រង់ល្បះគំរូទាំង ៥ ក្នុងការប្រៀបធៀបរបស់របរ និងមនុស្ស៖ 1.这件衣服比那件贵一点儿。 (សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច។), 2.那件衣服没有这件衣服漂亮。 (សំលៀកបំពាក់នោះមិនស្អាតដូចសំលៀកបំពាក់នេះទេ។), 3.他的自行车跟我的自行车一样。 (កង់របស់គាត់ដូចគ្នានឹងកង់របស់ខ្ញុំដែរ។), 4.我的爱好跟你的爱好不一样。 (ចំណង់ចំណូលចិត្តរបស់ខ្ញុំមិនដូចគ្នានឹងចំណង់ចំណូលចិត្តរបស់អ្នកទេ។), 5.哥哥比他大一点儿。 (បងប្រុសធំជាងគាត់បន្តិច។) ព្រមទាំងយល់ដឹងពីរចនាសម្ព័ន្ធវេយ្យាករណ៍ «A 比 B + គុណនាម + 一点儿», «A 没有 B + គុណនាម», «A 跟 B 一样 / 不一样»។',
    skillObjective:
      'សិស្សមានសមត្ថភាពអាន បញ្ចេញសំឡេងភីនអ៊ីនបានត្រឹមត្រូវ ចេះប្រៀបធៀបរបស់របរ តម្លៃ និងចំណូលចិត្តក្នុងជីវភាពរស់នៅបានយ៉ាងរលូន ចេះយកវត្ថុដទៃទៀតមកជំនួសក្នុងទម្រង់ល្បះ (ឧ. 这双鞋比那双便宜一点儿 / 我的书包跟他的书包一样) និងចេះសរសេរទម្រង់ល្បះទាំង ៥ យ៉ាងស្អាត និងត្រឹមត្រូវ។',
    attitudeObjective:
      'សិស្សមានភាពក្លាហាន ស្វាហាប់ ចូលរួមយ៉ាងសកម្មក្នុងការហាត់បង្កើតល្បះប្រៀបធៀប និងអនុវត្តសន្ទនាជាមួយមិត្តរួមថ្នាក់។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណទម្រង់ល្បះ រូបភាពប្រៀបធៀប (ខោអាវ កង់ សៀវភៅ កម្ពស់ អាយុ) ក្តារខៀន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第一册) សៀវភៅកត់ត្រា ប៊ិច',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — រៀនទម្រង់ល្បះទាំង ៥ ក្នុងមេរៀនទី៩ (第一课时：学习第九课5个核心句型)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួររំលឹកពាក្យថ្មីទាំង ១២ ពាក្យដែលបានរៀនសប្តាហ៍មុន (件, 衣服, 贵, 一点儿, 自行车, 跟, 一样, 毛衣, 短, 便宜, 运动鞋, 长)',
            lessonContent: 'រំលឹកពាក្យថ្មីទាំង ១២ ពាក្យ ដើម្បីត្រៀមរៀនទម្រង់ល្បះប្រៀបធៀប',
            studentActivity: 'សិស្សលើកដៃអានពាក្យថ្មី និងប្រាប់អត្ថន័យជាភាសាខ្មែរ',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第三单元 购物 · 第九课 这件衣服比那件贵一点儿 (句型 · 这一周只上句型)» លើក្តារខៀន\n២. បង្រៀនទម្រង់ល្បះទាំង ៥ ម្តងមួយៗ ព្រមទាំងភីនអ៊ីន និងការបកប្រែ ៖\n   1. 这件衣服比那件贵一点儿。 (Zhè jiàn yīfu bǐ nà jiàn guì yìdiǎnr. · សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច។)\n   2. 那件衣服没有这件衣服漂亮。 (Nà jiàn yīfu méiyǒu zhè jiàn yīfu piàoliang. · សំលៀកបំពាក់នោះមិនស្អាតដូចសំលៀកបំពាក់នេះទេ។)\n   3. 他的自行车跟我的自行车一样。 (Tā de zìxíngchē gēn wǒ de zìxíngchē yíyàng. · កង់របស់គាត់ដូចគ្នានឹងកង់របស់ខ្ញុំដែរ។)\n   4. 我的爱好跟你的爱好不一样。 (Wǒ de àihào gēn nǐ de àihào bù yíyàng. · ចំណង់ចំណូលចិត្តរបស់ខ្ញុំមិនដូចគ្នានឹងចំណង់ចំណូលចិត្តរបស់អ្នកទេ។)\n   5. 哥哥比他大一点儿。 (Gēge bǐ tā dà yìdiǎnr. · បងប្រុសធំជាងគាត់បន្តិច។)\n៣. ពន្យល់ចំណុចវេយ្យាករណ៍គន្លឹះ ៖\n   • រចនាសម្ព័ន្ធប្រៀបធៀប «比» ៖ A + 比 + B + គុណនាម + (一点儿)\n   • ទម្រង់បដិសេធ «没有» ៖ A + 没有 + B + គុណនាម (A មិនស្មើ B ទេ)\n   • រចនាសម្ព័ន្ធដូចគ្នា/ខុសគ្នា «跟...一样 / 不一样» ៖ A + 跟 + B + 一样 / 不一样\n៤. ដឹកនាំសិស្សហាត់អានជាក្រុម អានជាជួរ និងហៅសិស្សអានម្នាក់ម្តងៗ\n៥. ណែនាំសិស្សហាត់បង្កើតល្បះជំនួសពាក្យ (替换练习)',
            lessonContent:
              '第三单元 购物 · 第九课 这件衣服比那件贵一点儿 (句型 · 这一周只上句型)\n\n一. 核心句型 (ទម្រង់ល្បះគោលទាំង ៥) ៖\n1. 这件衣服比那件贵一点儿。 (Zhè jiàn yīfu bǐ nà jiàn guì yìdiǎnr.) ៖ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច។\n2. 那件衣服没有这件衣服漂亮。 (Nà jiàn yīfu méiyǒu zhè jiàn yīfu piàoliang.) ៖ សំលៀកបំពាក់នោះមិនស្អាតដូចសំលៀកបំពាក់នេះទេ។\n3. 他的自行车跟我的自行车一样。 (Tā de zìxíngchē gēn wǒ de zìxíngchē yíyàng.) ៖ កង់របស់គាត់ដូចគ្នានឹងកង់របស់ខ្ញុំដែរ។\n4. 我的爱好跟你的爱好不一样。 (Wǒ de àihào gēn nǐ de àihào bù yíyàng.) ៖ ចំណង់ចំណូលចិត្តរបស់ខ្ញុំមិនដូចគ្នានឹងចំណង់ចំណូលចិត្តរបស់អ្នកទេ។\n5. 哥哥比他大一点儿。 (Gēge bǐ tā dà yìdiǎnr.) ៖ បងប្រុសធំជាងគាត់បន្តិច។\n\n二. 语法重点 (វេយ្យាករណ៍សំខាន់) ៖\n• A 比 B + 形容词 + 一点儿 ៖ 这件毛衣比那件便宜一点儿。\n• A 没有 B + 形容词 ៖ 他的自行车没有我的自行车大。\n• A 跟 B 一样 / 不一样 ៖ 这双运动鞋跟那双运动鞋一样。\n\n三. 替换练习 (លំហាត់ជំនួសពាក្យ) ៖\n• 弟弟比他小两岁。\n• 我的运动鞋跟他的运动鞋一样。',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ហាត់បង្កើតល្បះប្រៀបធៀប និងចម្លងទម្រង់ល្បះទាំង ៥ ចូលសៀវភៅកត់ត្រាឱ្យបានស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'បង្ហាញរូបភាពវត្ថុពីរ (ឧ. កង់ពីរ អាវពីរ) ឱ្យសិស្សបង្កើតល្បះប្រៀបធៀបភ្លាមៗដោយប្រើ «比» និង «跟...一样»',
            lessonContent: 'ពង្រឹងសមត្ថភាពបង្កើតល្បះប្រៀបធៀប (会比较 会运用 会正确表达)',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ និងអនុវត្តបង្កើតល្បះប្រៀបធៀបដោយភាពជឿជាក់',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងទម្រង់ល្បះទាំង ៥ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ\n២. ណែនាំឱ្យហាត់អានទន្ទេញឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លងទម្រង់ល្បះទាំង ៥ ក្នុងមេរៀនទី៩ ក្នុងមួយល្បះសរសេរចំនួន ៥ដង (抄写所学5个句型各5遍) ព្រមទាំងភីនអ៊ីន និងអត្ថន័យខ្មែរ រួចហាត់អានឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — អនុវត្តបង្កើតល្បះ និងហ្វឹកហាត់វេយ្យាករណ៍ (第二课时：句型拓展运用与造句练习)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ៣ នាក់ឡើងអានទម្រង់ល្បះទាំង ៥ នៃមេរៀនទី៩ ដោយមិនមើលសៀវភៅ',
            lessonContent: 'រំលឹកទម្រង់ល្បះទាំង ៥ នៃមេរៀនទី៩',
            studentActivity: 'សិស្សឡើងអានទម្រង់ល្បះដោយទំនុកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. ដឹកនាំសិស្សធ្វើលំហាត់រៀបពាក្យជាល្បះប្រៀបធៀបលើក្តារខៀន\n២. បង្រៀនសិស្សកែប្រែល្បះពី «比» ទៅជា «没有» និង «跟...一样 / 不一样»\n៣. ដាក់លំហាត់ឱ្យសិស្សអនុវត្តសរសេរក្នុងសៀវភៅលំហាត់',
            lessonContent:
              '一. 连词成句与句型改写 (ការរៀបពាក្យជាល្បះ និងការកែប្រែប្រយោគ) ៖\n1. 这件衣服 / 贵一点儿 / 比那件 / 。 ➔ 这件衣服比那件贵一点儿。\n2. 没有 / 那件衣服 / 这件衣服 / 漂亮 / 。 ➔ 那件衣服没有这件衣服漂亮。\n3. 我的自行车 / 跟 / 他的自行车 / 一样 / 。 ➔ 他的自行车跟我的自行车一样。\n4. 爱好 / 我的 / 跟 / 你的爱好 / 不一样 / 。 ➔ 我的爱好跟你的爱好不一样。\n5. 哥哥 / 比他 / 大一点儿 / 。 ➔ 哥哥比他大一点儿。\n\n二. 句型改写练习 (ការកែសម្រួលល្បះ) ៖\n• 这件衣服比那件贵。 ➔ 那件衣服没有这件衣服贵。\n• 他的爱好跟我的不一样。 ➔ 他的爱好和我的爱好不同。',
            studentActivity: 'សិស្សឡើងក្តារខៀនរៀបពាក្យជាល្បះ អនុវត្តសរសេរចូលសៀវភៅ និងផ្ទៀងផ្ទាត់ជាមួយមិត្តភក្តិ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ឱ្យសិស្សម្នាក់ៗនិយាយប្រៀបធៀបរបស់របរផ្ទាល់ខ្លួនជាមួយមិត្តរួមថ្នាក់ ឧ. «我的笔跟他的笔一样»',
            lessonContent: 'ពង្រឹងសមត្ថភាពនិយាយប្រៀបធៀបជាភាសាចិន',
            studentActivity: 'សិស្សលើកដៃអនុវត្តនិយាយប្រៀបធៀបជាភាសាចិន',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះចម្លង ៥ដង និងត្រៀមរៀនផ្នែកសន្ទនានៅសប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 抄写5个句型各5遍 — ចម្លងទម្រង់ល្បះទាំង ៥ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week12-clothes-dialogues',
    linkedCurriculumId: 'cur-12',
    dateWeekday: 'ចន្ទ',
    dateDay: '១៨',
    dateMonth: 'មករា',
    dateYear: '២០២៧',
    isoDate: '2027-01-18',
    chapterTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第九课 这件衣服比那件贵一点儿 · មេរៀនទី៩ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច (对话 · 这一周只上对话)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៥៧ (សៀវភៅពុម្ព 对话)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សយល់ដឹងយ៉ាងច្បាស់លាស់នូវអត្ថន័យ និងបរិបទប្រើប្រាស់នៃការសន្ទនា និងអត្ថបទខ្លីក្នុងមេរៀនទី៩៖ 对话1 (A: 这是你的自行车吗？ B: 不是，这是Jim的自行车。 A: 他的自行车跟我的自行车一样。 B: 我的自行车跟你们的不一样。) និង 短文2 (我有两件衣服。这件衣服比那件贵一点儿，那件衣服没有这件衣服漂亮。我喜欢这件。)。',
    skillObjective:
      'សិស្សចេះអានសន្ទនា និងអត្ថបទដោយរលូន ត្រឹមត្រូវតាមសូរសំឡេងភីនអ៊ីន មានទឹកដមសំនៀងធម្មជាតិ ចេះចាប់ដៃគូសន្ទនាប្រៀបធៀបរបស់របរប្រើប្រាស់ផ្ទាល់ខ្លួន ព្រមទាំងចេះសរសេរចម្លងអត្ថបទសន្ទនាបានយ៉ាងស្អាត។',
    attitudeObjective:
      'សិស្សចូលរួមសកម្មភាពសន្ទនាជាដៃគូដោយភាពជឿជាក់ និងរីករាយក្នុងការប្រើប្រាស់ភាសាចិនក្នុងការប្រាស្រ័យទាក់ទង។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណសន្ទនា រូបភាពកង់ និងខោអាវម៉ូដផ្សេងៗ ក្តារខៀន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第一册) សៀវភៅកត់ត្រា ប៊ិច',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — រៀនសន្ទនាទី១ និងអត្ថបទទី២ ក្នុងមេរៀនទី៩ (第一课时：学习第九课对话一与短文二)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួររំលឹកទម្រង់ល្បះទាំង ៥ នៃសប្តាហ៍មុន (这件衣服比那件贵一点儿...)',
            lessonContent: 'រំលឹកទម្រង់ល្បះទាំង ៥ ដើម្បីត្រៀមរៀនការសន្ទនាជាក់ស្តែង',
            studentActivity: 'សិស្សលើកដៃឆ្លើយ និងអានទម្រង់ល្បះឱ្យគ្រូស្តាប់',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第三单元 购物 · 第九课 这件衣服比那件贵一点儿 (对话 · 这一周只上对话)» លើក្តារខៀន\n២. បង្រៀន និងដឹកនាំសិស្សអាន 对话一 ៖\n   A: 这是你的自行车吗？ (តើនេះជាកង់របស់អ្នកមែនទេ?)\n   B: 不是，这是Jim的自行车。 (មិនមែនទេ នេះជាកង់របស់ជីម Jim។)\n   A: 他的自行车跟我的自行车一样。 (កង់របស់គាត់ដូចគ្នានឹងកង់របស់ខ្ញុំដែរ។)\n   B: 我的自行车跟你们的不一样。 (កង់របស់ខ្ញុំមិនដូចគ្នានឹងកង់របស់អ្នកទាំងអស់គ្នាទេ។)\n៣. បង្រៀន និងដឹកនាំសិស្សអាន 短文二 ៖\n   我有两件衣服。这件衣服比那件贵一点儿，那件衣服没有这件衣服漂亮。我喜欢这件。\n   (ខ្ញុំមានសំលៀកបំពាក់ពីរ។ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច សំលៀកបំពាក់នោះមិនស្អាតដូចសំលៀកបំពាក់នេះទេ។ ខ្ញុំចូលចិត្តមួយនេះ។)\n៤. បែងចែកតួអង្គ A និង B ឱ្យសិស្សអនុវត្តសន្ទនាជាដៃគូ\n៥. កែតម្រង់ការបញ្ចេញសំឡេង និងទឹកដមសំនៀង',
            lessonContent:
              '第三单元 购物 · 第九课 这件衣服比那件贵一点儿 (对话 · 这一周只上对话)\n\n一. 对话一 (សន្ទនាទី១ ៖ ប្រៀបធៀបកង់) ៖\nA: 这是你的自行车吗？ (Zhè shì nǐ de zìxíngchē ma?)\n   [បកប្រែ] ៖ តើនេះជាកង់របស់អ្នកមែនទេ?\nB: 不是，这是Jim的自行车。 (Bú shì, zhè shì Jim de zìxíngchē.)\n   [បកប្រែ] ៖ មិនមែនទេ នេះជាកង់របស់ជីម Jim។\nA: 他的自行车跟我的自行车一样。 (Tā de zìxíngchē gēn wǒ de zìxíngchē yíyàng.)\n   [បកប្រែ] ៖ កង់របស់គាត់ដូចគ្នានឹងកង់របស់ខ្ញុំដែរ។\nB: 我的自行车跟你们的不一样。 (Wǒ de zìxíngchē gēn nǐmen de bù yíyàng.)\n   [បកប្រែ] ៖ កង់របស់ខ្ញុំមិនដូចគ្នានឹងកង់របស់អ្នកទាំងអស់គ្នាទេ។\n\n二. 短文二 (អត្ថបទខ្លីទី២ ៖ ប្រៀបធៀបសំលៀកបំពាក់ទាំងពីរ) ៖\n我有两件衣服。这件衣服比那件贵一点儿，那件衣服没有这件衣服漂亮。我喜欢这件。\n(Wǒ yǒu liǎng jiàn yīfu. Zhè jiàn yīfu bǐ nà jiàn guì yìdiǎnr, nà jiàn yīfu méiyǒu zhè jiàn yīfu piàoliang. Wǒ xǐhuan zhè jiàn.)\n[បកប្រែ] ៖ ខ្ញុំមានសំលៀកបំពាក់ពីរ។ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច សំលៀកបំពាក់នោះមិនស្អាតដូចសំលៀកបំពាក់នេះទេ។ ខ្ញុំចូលចិត្តមួយនេះ។\n\n三. 语言点与表达 (ចំណុចភាសា និងការប្រើប្រាស់) ៖\n• 同异对比 ៖ 跟...一样 / 不一样 (我的自行车跟你们的不一样)\n• 比较与喜好 ៖ 比...贵一点儿 / 没有...漂亮 / 我喜欢这件',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ចាប់ដៃគូឡើងសម្តែងសន្ទនា A-B និងចម្លងសន្ទនាទី១ និងអត្ថបទខ្លីទី២ ចូលសៀវភៅកត់ត្រាឱ្យបានស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ហៅគូសិស្ស ២–៣ គូឡើងមុខថ្នាក់ សម្តែងការសន្ទនាប្រៀបធៀបរបស់របរដោយមិនមើលសៀវភៅ',
            lessonContent: 'ពង្រឹងភាពស្ទាត់ជំនាញក្នុងការសន្ទនាជាក់ស្តែង (会对话 会演练 会熟练表达)',
            studentActivity: 'គូសិស្សឡើងមុខថ្នាក់សម្តែងសន្ទនាដោយភាពរស់រវើក មិត្តរួមថ្នាក់ទះដៃលើកទឹកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងសន្ទនាទី១ និងអត្ថបទខ្លីទី២ ចំនួន ២ដង\n២. ណែនាំឱ្យសិស្សទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លង 对话1 និង 短文2 ក្នុងមេរៀនទី៩ ចូលសៀវភៅ ចំនួន ២ដង (抄写对话1和短文2各2遍) ព្រមទាំងភីនអ៊ីន និងបកប្រែខ្មែរ រួចទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — សកម្មភាពសន្ទនាប្រៀបធៀប និងបង្ហាញម៉ូដសំលៀកបំពាក់ (第二课时：物品比较情境演练与服装搭配展示)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ២ នាក់ឡើងទន្ទេញសន្ទនាទី១ ឱ្យមិត្តរួមថ្នាក់ស្តាប់',
            lessonContent: 'រំលឹកសន្ទនាទី១ និងអត្ថបទខ្លីទី២ នៃមេរៀនទី៩',
            studentActivity: 'សិស្សឡើងទន្ទេញសន្ទនាដោយភាពជឿជាក់',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. រៀបចំសកម្មភាពប្រៀបធៀបរបស់របរក្នុងថ្នាក់រៀន (កាតាប សៀវភៅ ប៊ិច សំលៀកបំពាក់)\n២. ឱ្យសិស្សប្រើប្រាស់ល្បះសន្ទនាប្រៀបធៀប ៖ «我的...比你的...» / «他的...跟我的...一样»\n៣. ណែនាំសិស្សឱ្យហាត់សរសេរប្រយោគខ្លីបង្ហាញពីរបស់ដែលខ្លួនចូលចិត្តជាងគេ',
            lessonContent:
              '一. 物品比较交际演练 (សកម្មភាពប្រាស្រ័យទាក់ទងប្រៀបធៀបរបស់របរ) ៖\n• A: 这是你的衣服吗？\n• B: 是，我有两件衣服。这件比那件贵一点儿，那件没有这件漂亮。我喜欢这件。\n• C: 他的运动鞋跟我的运动鞋一样。\n\n二. 我最喜欢的物品描述 (ការពណ៌នារបស់ដែលខ្លួនចូលចិត្ត) ៖\n我有两辆自行车。这辆车比那辆新一点儿，我最喜欢这辆。',
            studentActivity: 'សិស្សចូលរួមសកម្មភាពប្រៀបធៀបរបស់របរ អនុវត្តសន្ទនាជាភាសាចិន និងសរសេរប្រយោគពណ៌នា។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'វាយតម្លៃការបញ្ចេញសំឡេង និងភាពរលូននៃការសន្ទនារបស់ក្រុមនីមួយៗ',
            lessonContent: 'ពង្រឹងទំនុកចិត្តក្នុងការប្រើប្រាស់ភាសាចិនប្រៀបធៀប',
            studentActivity: 'សិស្សស្តាប់ការកែលម្អរបស់គ្រូ និងកែតម្រង់ការបញ្ចេញសំឡេង',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះ និងណែនាំឱ្យត្រៀមសៀវភៅពុម្ព និងសៀវភៅលំហាត់សម្រាប់សប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 抄写对话1和短文2各2遍并背诵对话1 — ចម្លងសន្ទនាទី១ និងអត្ថបទខ្លីទី២ ចំនួន ២ដង និងទន្ទេញឱ្យចាំមាត់។ ត្រៀមធ្វើលំហាត់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់សប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week13-clothes-exercises',
    linkedCurriculumId: 'cur-13',
    dateWeekday: 'ចន្ទ',
    dateDay: '២៥',
    dateMonth: 'មករា',
    dateYear: '២០២៧',
    isoDate: '2027-01-25',
    chapterTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第九课 这件衣服比那件贵一点儿 · មេរៀនទី៩ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច (综合练习 · 课本56-60页 & 练习册65-73页)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'សៀវភៅពុម្ព ទំព័រ ៥៦-៦០ និង សៀវភៅលំហាត់ ទំព័រ ៦៥-៧៣',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សក្តាប់បានយ៉ាងរឹងមាំនូវចំណេះដឹងទាំងអស់នៃមេរៀនទី៩ រួមមាន ពាក្យថ្មីទាំង ១២ ពាក្យ ទម្រង់ល្បះប្រៀបធៀបទាំង ៥ និងអត្ថបទសន្ទនា ព្រមទាំងចេះអនុវត្តធ្វើលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព (ទំព័រ ៥៦-៦០) និងសៀវភៅលំហាត់ (ទំព័រ ៦៥-៧៣) បានត្រឹមត្រូវគ្រប់ជ្រុងជ្រោយ។',
    skillObjective:
      'សិស្សមានជំនាញច្បាស់លាស់លើការស្តាប់ការប្រៀបធៀប ការអាន ការសរសេរអក្សរចិន ការកែប្រែប្រយោគប្រៀបធៀប ការបំពេញពាក្យ ការផ្គូផ្គង ការបកប្រែ និងការឆ្លើយសំណួរក្នុងលំហាត់សៀវភៅពុម្ព (第56-60页) និងសៀវភៅលំហាត់ (第65-73页)។',
    attitudeObjective:
      'សិស្សមានស្មារតីទទួលខុសត្រូវខ្ពស់ យកចិត្តទុកដាក់បំពេញកិច្ចការគ្រប់លំហាត់ឱ្យបានពេញលេញ ស្អាតបាត និងទាន់ពេលវេលា។',
    teachingMaterialsTeacher:
      'សៀវភៅពុម្ព (ទំព័រ ៥៦-៦០) សៀវភៅលំហាត់ (ទំព័រ ៦៥-៧៣) សៀវភៅគ្រូ កិច្ចតែងការបង្រៀន ក្តារខៀន ឯកសារចម្លើយគំរូ',
    teachingMaterialsStudent:
      'សៀវភៅពុម្ព (第56-60页) សៀវភៅលំហាត់ (第65-73页) ប៊ិច ខ្មៅដៃ បន្ទាត់',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — បំពេញលំហាត់សៀវភៅពុម្ព ទំព័រ ៥៦-៦០ (第一课时：完成课本第56页-60页练习)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'រំលឹកសង្ខេបពាក្យថ្មី ទម្រង់ល្បះ និងសន្ទនាប្រៀបធៀបក្នុងមេរៀនទី៩',
            lessonContent: 'រំលឹកចំណេះដឹងគន្លឹះនៃមេរៀនទី៩ មុនចាប់ផ្តើមធ្វើលំហាត់សៀវភៅពុម្ព',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ និងត្រៀមបើកសៀវភៅពុម្ពទំព័រ ៥៦',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第三单元 购物 · 第九课 这件衣服比那件贵一点儿 (综合练习 · 课本第56页-60页)» លើក្តារខៀន\n២. ណែនាំសិស្សធ្វើលំហាត់ក្នុងសៀវភៅពុម្ពម្តងមួយទំព័រ ៖\n   • ទំព័រ ៥៦ ៖ 听录音辨析比较 (ស្តាប់ការប្រៀបធៀប និងគូសជ្រើសរើសចម្លើយត្រឹមត្រូវ)\n   • ទំព័រ ៥៧ ៖ 读一读，连一连 (អានពាក្យ ឃ្លា និងគូសផ្គូផ្គងជាមួយរូបភាពប្រៀបធៀប)\n   • ទំព័រ ៥៨-៥៩ ៖ 看图用「比」和「跟...一样」造句并回答问题 (សង្កេតរូបភាព បង្កើតល្បះ និងឆ្លើយសំណួរ)\n   • ទំព័រ ៦០ ៖ 课堂交际活动与角色演练 (សកម្មភាពប្រាស្រ័យទាក់ទង និងសង្ខេបចំណេះដឹង)\n៣. ដើរមើល ជួយណែនាំ និងកែតម្រង់សិស្សដែលជួបការលំបាក\n៤. កែសម្រួលចម្លើយត្រឹមត្រូវរួមគ្នានៅលើក្តារខៀន',
            lessonContent:
              '第三单元 购物 · 第九课 这件衣服比那件贵一点儿 (综合练习 · 课本第56页-60页)\n\n一. 课本第56页练习 (សៀវភៅពុម្ព ទំព័រ ៥៦) ៖\n• 听音选图 (ស្តាប់សំឡេង និងជ្រើសរើសរូបភាពត្រឹមត្រូវ ៖ 衣服、毛衣、自行车、运动鞋)\n• 重点考察比较句听力理解 (ពិនិត្យការស្តាប់ល្បះប្រៀបធៀប ៖ 比...贵 / 比...大 / 跟...一样)\n\n二. 课本第57-59页练习 (សៀវភៅពុម្ព ទំព័រ ៥៧-៥៩) ៖\n• 词句连线 (គូសផ្គូផ្គងពាក្យ និងប្រយោគ) ៖\n  1. 这件衣服 ➔ 比那件贵一点儿\n  2. 他的自行车 ➔ 跟我的自行车一样\n  3. 我的爱好 ➔ 跟你的爱好不一样\n  4. 哥哥 ➔ 比他大一点儿\n• 看图造句 (សង្កេតរូបភាព និងបង្កើតល្បះ) ៖\n  1. 这双运动鞋比那双便宜。\n  2. 他的头发比我的长。\n  3. 这辆自行车没有那辆漂亮。\n\n三. 课本第60页交际活动 (សៀវភៅពុម្ព ទំព័រ ៦០) ៖\n• 课堂物品大比拼 (សកម្មភាពប្រៀបធៀបរបស់របរក្នុងថ្នាក់រៀន)\n• 熟练运用比较句型完成交际任务',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ធ្វើលំហាត់ក្នុងសៀវភៅពុម្ពទំព័រ ៥៦-៦០ ដោយយកចិត្តទុកដាក់ លើកដៃសួរគ្រូពេលមិនយល់ ឡើងក្តារខៀនសរសេរចម្លើយ និងកត់ត្រាកែតម្រង់ចូលសៀវភៅ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'សង្ខេបចម្លើយសំខាន់ៗនៃទំព័រ ៥៦-៦០ និងឱ្យសិស្សផ្ទៀងផ្ទាត់ឡើងវិញឱ្យបានត្រឹមត្រូវ ១០០%',
            lessonContent: 'ផ្ទៀងផ្ទាត់ និងពង្រឹងចម្លើយលំហាត់សៀវភៅពុម្ព (订正课本练习 确保全对)',
            studentActivity: 'សិស្សផ្ទៀងផ្ទាត់ចម្លើយ និងកែសម្រួលចំណុចខ្វះខាត',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់ភារកិច្ចឱ្យសិស្សបន្តធ្វើលំហាត់ក្នុងសៀវភៅលំហាត់ ទំព័រ ៦៥ ដល់ ៧៣\n២. ត្រៀមកែសម្រួល និងបូកសរុបពិន្ទុមេរៀនទី៩',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ប្អូនៗត្រូវបំពេញលំហាត់ទាំងអស់ក្នុងសៀវភៅលំហាត់ (练习册) ពីទំព័រ ៦៥ ដល់ ៧៣ (第65页到73页) ឱ្យបានគ្រប់ជ្រុងជ្រោយ ដើម្បីត្រៀមផ្ទៀងផ្ទាត់ និងកែសម្រួលនៅម៉ោងបន្ទាប់។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — បំពេញ និងកែសម្រួលសៀវភៅលំហាត់ ទំព័រ ៦៥-៧៣ (第二课时：全完成并订正练习册第65页到73页)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសៀវភៅលំហាត់របស់សិស្សគ្រប់គ្នា',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យការយកសៀវភៅលំហាត់មកថ្នាក់',
            studentActivity: 'សិស្សដាក់សៀវភៅលំហាត់លើតុ និងត្រៀមកែសម្រួល',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួរពិនិត្យលំហាត់សៀវភៅពុម្ពទំព័រ ៥៦-៦០ ដែលបានធ្វើរួច',
            lessonContent: 'រំលឹកឡើងវិញនូវលំហាត់សៀវភៅពុម្ព',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. ដឹកនាំសិស្សធ្វើ និងកែសម្រួលលំហាត់ក្នុងសៀវភៅលំហាត់第65页到73页 ៖\n   • 第65-66页 ៖ 汉字描红与书写 (ហាត់សរសេរអក្សរចិន 件, 衣, 服, 贵, 跟, 样, 长)\n   • 第67-68页 ៖ 看拼音写汉字与选词填空 (មើលភីនអ៊ីនសរសេរអក្សរចិន និងបំពេញចន្លោះល្បះ)\n   • 第69-70页 ៖ 句型转换与改写 (កែប្រែប្រយោគពី «比» ទៅ «没有» និង «跟...一样»)\n   • 第71-72页 ៖ 连词成句与汉柬互译 (រៀបពាក្យជាល្បះ និងការបកប្រែ ចិន-ខ្មែរ)\n   • 第73页 ៖ 阅读理解与综合测试 (ការអានយល់អត្ថបទខ្លីប្រៀបធៀប និងឆ្លើយសំណួរ)\n២. ហៅសិស្សឡើងក្តារខៀនសរសេរចម្លើយលំហាត់នីមួយៗ\n៣. ពន្យល់ចំណុចដែលសិស្សឧស្សាហ៍ច្រឡំ និងកែតម្រូវរួមគ្នា',
            lessonContent:
              '一. 练习册第65页到73页核心练习解析 (ការពន្យល់លំហាត់សៀវភៅលំហាត់ ទំព័រ ៦៥-៧៣) ៖\n1. 汉字书写 (第65-66页) ៖ 规范书写生词汉字，掌握正确笔画笔顺。\n2. 选词填空 (第67-68页) ៖\n   • 这 (件) 衣服比那件贵一点儿。\n   • 他的自行车 (跟) 我的自行车一样。\n   • 我的爱好跟你的 (不一样) 。\n   • 哥哥比他 (大) 一点儿。\n3. 句型改写 (第69-70页) ៖\n   • 这件衣服比那件贵。 ➔ 那件衣服没有这件衣服贵。\n   • 弟弟比他小。 ➔ 他比弟弟大。\n4. 连词成句 (第71-72页) ៖\n   • 衣服 / 这件 / 比那件 / 贵一点儿 / 。 ➔ 这件衣服比那件贵一点儿。\n   • 漂亮 / 没有 / 这件衣服 / 那件衣服 / 。 ➔ 那件衣服没有这件衣服漂亮。\n5. 阅读与问答 (第73页) ៖ 理解物品比较短文，准确回答价格与特征。',
            studentActivity: 'សិស្សផ្ទៀងផ្ទាត់ចម្លើយក្នុងសៀវភៅលំហាត់ទំព័រ ៦៥-៧៣ កែសម្រួលចំណុចខុសដោយប៊ិចក្រហម និងកត់ត្រាចម្លើយត្រឹមត្រូវចូលសៀវភៅ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'សង្ខេប និងវាយតម្លៃលទ្ធផលការរៀនមេរៀនទី៩ ទាំងមូល (生词、句型、对话、练习) ដោយលើកសរសើរសិស្សដែលខិតខំប្រឹងប្រែង',
            lessonContent: 'សង្ខេប និងវាយតម្លៃបញ្ចប់មេរៀនទី៩ ទាំងមូល (第九课全课总结与学习评价)',
            studentActivity: 'សិស្សស្តាប់ការសង្ខេបរបស់គ្រូ និងឆ្លើយសំណួរបូកសរុបមេរៀន',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ណែនាំឱ្យសិស្សកែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់ឱ្យបានពេញលេញ ១០០%\n២. ណែនាំឱ្យអានរំលឹកមេរៀនទី៩ ឡើងវិញនៅផ្ទះ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 完整订正课本第56-60页与练习册第65-73页的所有练习，复习第九课生词、句型与对话。(កែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់ឱ្យបានពេញលេញ និងត្រឹមត្រូវ ១០០% ព្រមទាំងរំលឹកឡើងវិញនូវមេរៀនទី៩ ទាំងមូល)',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week14-schedule-vocab',
    linkedCurriculumId: 'cur-14',
    dateWeekday: 'ចន្ទ',
    dateDay: '០១',
    dateMonth: 'កុម្ភៈ',
    dateYear: '២០២៧',
    isoDate: '2027-02-01',
    chapterTitle: '第四单元 学习生活 · ជំពូកទី៤ ជីវិតសិក្សា',
    lessonTitle: '第十课 你今天上了什么课 · មេរៀនទី១០ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីខ្លះ？ (生词 · 这一周只上生词)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៦៤ ដល់ ទំព័រទី៦៥ (សៀវភៅពុម្ព 生词)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សស្គាល់ យល់អត្ថន័យ ចងចាំ និងបញ្ចេញសំឡេងយ៉ាងត្រឹមត្រូវនូវពាក្យថ្មីទាំង ១០ ពាក្យ នៃមេរៀនទី១០ ៖ 1.上(课) (ចូលរៀន), 2.了 (ហើយ/បាន...ហើយ), 3.明天 (ថ្ងៃស្អែក), 4.数学 (គណិតវិទ្យា), 5.德语 (ភាសាអាល្លឺម៉ង់), 6.历史 (ប្រវត្តិវិទ្យា), 7.地理 (ភូមិវិទ្យា), 8.下午 (ពេលរសៀល), 9.周末 (ចុងសប្តាហ៍), 10.时间 (ពេលវេលា) តាមរយៈរូបភាពកាលវិភាគ និងប័ណ្ណពាក្យ។',
    skillObjective:
      'សិស្សចេះអាន ផ្សំពាក្យ សរសេរអក្សរចិនតាមលំដាប់គំនូសត្រឹមត្រូវ និងចេះប្រើប្រាស់ពាក្យថ្មីទាំង ១០ ដើម្បីហៅឈ្មោះមុខវិជ្ជានិងពេលវេលាសិក្សា ព្រមទាំងបំពេញកិច្ចការផ្ទះបានត្រឹមត្រូវ។',
    attitudeObjective:
      'សិស្សមានវិន័យល្អ យកចិត្តទុកដាក់រៀនសូត្រ ស្រឡាញ់ការសិក្សាគ្រប់មុខវិជ្ជា និងសហការយ៉ាងសកម្មក្នុងថ្នាក់រៀន។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណពាក្យរូបភាពមុខវិជ្ជានិងពេលវេលា កាលវិភាគគំរូ ក្តារខៀន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第二册) សៀវភៅកត់ត្រា ប៊ិច បន្ទាត់',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — បង្រៀនពាក្យថ្មីទាំង ១០ ពាក្យ (第一课时：学习第十课全部10个生词与发音)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួររំលឹកឈ្មោះមុខវិជ្ជាដែលធ្លាប់បានរៀនពីមុន ដូចជា 汉语 (ភាសាចិន), 英语 (ភាសាអង់គ្លេស), 体育 (កីឡា), 音乐 (តន្ត្រី)',
            lessonContent: 'រំលឹកពាក្យមុខវិជ្ជាចាស់ ដើម្បីតភ្ជាប់ទៅកាន់ពាក្យមុខវិជ្ជាថ្មីនៃមេរៀនទី១០',
            studentActivity: 'សិស្សលើកដៃឆ្លើយឈ្មោះមុខវិជ្ជាដែលខ្លួនចាំ',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第四单元 学习生活 · 第十课 你今天上了什么课？ (生词 · 这一周只上生词)» លើក្តារខៀន\n២. បង្រៀនពាក្យថ្មីទាំង ១០ ពាក្យ ម្តងមួយៗ ដោយពន្យល់សូរសំឡេងភីនអ៊ីន និងអត្ថន័យជាភាសាខ្មែរ ៖\n   1. 上(课) (shàng kè) ៖ ចូលរៀន / ទៅរៀន\n   2. 了 (le) ៖ ហើយ / បាន...ហើយ (បញ្ជាក់ពីសកម្មភាពបានសម្រេច)\n   3. 明天 (míngtiān) ៖ ថ្ងៃស្អែក\n   4. 数学 (shùxué) ៖ គណិតវិទ្យា\n   5. 德语 (déyǔ) ៖ ភាសាអាល្លឺម៉ង់\n   6. 历史 (lìshǐ) ៖ ប្រវត្តិវិទ្យា\n   7. 地理 (dìlǐ) ៖ ភូមិវិទ្យា\n   8. 下午 (xiàwǔ) ៖ ពេលរសៀល / រសៀល\n   9. 周末 (zhōumò) ៖ ចុងសប្តាហ៍\n   10. 时间 (shíjiān) ៖ ពេលវេលា / ពេល\n៣. ដឹកនាំសិស្សអានតាមគ្រូជាសមូហភាព ជាក្រុម និងម្នាក់ៗ\n៤. ពន្យល់ការផ្សំពាក្យគន្លឹះ ៖ 上了课、明天见、数学课、德语课、历史课、地理课、今天下午、过周末、有时间',
            lessonContent:
              '第四单元 学习生活 · 第十课 你今天上了什么课？ (生词 · 这一周只上生词)\n\n一. 生词表 (តារាងពាក្យថ្មីទាំង ១០ ពាក្យ) ៖\n1. 上(课) (shàng kè) [动] ៖ ចូលរៀន / 上课了 (ដល់ម៉ោងចូលរៀនហើយ)\n2. 了 (le) [助] ៖ ហើយ / បាន...ហើយ (上了课 បានចូលរៀនហើយ)\n3. 明天 (míngtiān) [名] ៖ ថ្ងៃស្អែក / 明天见 (ជួបគ្នាថ្ងៃស្អែក)\n4. 数学 (shùxué) [名] ៖ គណិតវិទ្យា / 数学课 (ម៉ោងគណិតវិទ្យា)\n5. 德语 (déyǔ) [名] ៖ ភាសាអាល្លឺម៉ង់ / 德语课 (ម៉ោងភាសាអាល្លឺម៉ង់)\n6. 历史 (lìshǐ) [名] ៖ ប្រវត្តិវិទ្យា / 历史课 (ម៉ោងប្រវត្តិវិទ្យា)\n7. 地理 (dìlǐ) [名] ៖ ភូមិវិទ្យា / 地理课 (ម៉ោងភូមិវិទ្យា)\n8. 下午 (xiàwǔ) [名] ៖ ពេលរសៀល / 今天下午 (រសៀលថ្ងៃនេះ)\n9. 周末 (zhōumò) [名] ៖ ចុងសប្តាហ៍ / 周末愉快 (ចុងសប្តាហ៍រីករាយ)\n10. 时间 (shíjiān) [名] ៖ ពេលវេលា / 有时间 (មានពេល / មានពេលទំនេរ)\n\n二. 词组拓展 (ការផ្សំពាក្យបន្ថែម) ៖\n• 课程类 ៖ 数学课、德语课、历史课、地理课、汉语课\n• 时间类 ៖ 今天下午、明天上午、周末、有时间、没时间',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ សង្កេតប័ណ្ណពាក្យ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ចាប់គូអានឱ្យគ្នាទៅវិញទៅមក និងកត់ត្រាពាក្យថ្មីទាំង ១០ ចូលក្នុងសៀវភៅកត់ត្រា។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'បង្ហាញប័ណ្ណរូបភាពមុខវិជ្ជា និងពេលវេលា ឱ្យសិស្សឆ្លើយជាភាសាចិនភ្លាមៗ (Flashcard Quiz)',
            lessonContent: 'ពង្រឹងការចងចាំពាក្យថ្មីទាំង ១០ ពាក្យ (会读 会认 会正确翻译)',
            studentActivity: 'សិស្សលើកដៃដណ្តើមគ្នាឆ្លើយ និងបញ្ចេញសំឡេងយ៉ាងច្បាស់ៗ',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងពាក្យថ្មីទាំង ១០ ពាក្យ ក្នុង១ពាក្យ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ\n២. ណែនាំឱ្យហាត់អានទន្ទេញឱ្យចាំមាត់នៅផ្ទះ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លងពាក្យថ្មីទាំង ១០ ពាក្យ ក្នុងមេរៀនទី១០ ក្នុងមួយពាក្យសរសេរចំនួន ៥ដង (抄写所学10个生词各5遍) ព្រមទាំងដាក់ភីនអ៊ីន និងប្រែជាភាសាខ្មែរ រួចហាត់អានឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — ហាត់សរសេរអក្សរចិន និងផ្សំពាក្យមុខវិជ្ជា (第二课时：生词汉字书写笔顺与课程词汇拓展)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ៣ នាក់ឡើងអានពាក្យថ្មីទាំង ១០ ពាក្យ លើក្តារខៀន',
            lessonContent: 'រំលឹកការបញ្ចេញសំឡេងពាក្យថ្មីទាំង ១០',
            studentActivity: 'សិស្សឡើងអានពាក្យថ្មីដោយទំនុកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. បង្ហាញរបៀបសរសេរគំនូសអក្សរចិនគន្លឹះលើក្តារខៀន ៖\n   • 上 (3 画) ៖ 竖、横、横\n   • 了 (2 画) ៖ 横撇/横钩、竖钩\n   • 明 (8 画) ៖ 日 + 月\n   • 数 (13 画) ៖ 米 + 女 + 攵\n   • 语 (9 画) ៖ 讠 + 五 + 口\n   • 历 (4 画) ៖ 厂 + 力\n   • 地 (6 画) ៖ 土 + 也\n   • 下 (3 画) ៖ 横、竖、点\n   • 时 (7 画) ៖ 日 + 寸\n   • 间 (7 画) ៖ 门 + 日\n២. ដឹកនាំសិស្សរាប់ចំនួនគំនូស និងហាត់សរសេរលើអាកាស\n៣. ដាក់លំហាត់ផ្គូផ្គងពាក្យមុខវិជ្ជានិងពេលវេលាលើក្តារខៀន',
            lessonContent:
              '一. 汉字笔画笔顺 (គំនូស និងលំដាប់គំនូសអក្សរចិន) ៖\n• 上 (3 画), 了 (2 画), 明 (8 画), 数 (13 画), 语 (9 画)\n• 历 (4 画), 地 (6 画), 下 (3 画), 时 (7 画), 间 (7 画)\n\n二. 课程与作息搭配演练 (ការផ្សំពាក្យមុខវិជ្ជា និងពេលវេលា) ៖\n• 上课 / 下课 (ចូលរៀន / ចេញពីរៀន)\n• 今天下午上数学课 (រសៀលថ្ងៃនេះរៀនមុខវិជ្ជាគណិតវិទ្យា)\n• 明天上午上德语课 (ព្រឹកថ្ងៃស្អែករៀនមុខវិជ្ជាភាសាអាល្លឺម៉ង់)\n• 周末有时间 (ចុងសប្តាហ៍មានពេលទំនេរ)',
            studentActivity: 'សិស្សយកដៃគូសវាសលំដាប់គំនូសលើអាកាស ហាត់សរសេរក្នុងសៀវភៅលំហាត់ និងឡើងក្តារខៀនបំពេញចន្លោះ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ឱ្យសិស្សប្តូរវេនសួរឆ្លើយរវាងពាក្យចិន និងអត្ថន័យខ្មែរ',
            lessonContent: 'ពង្រឹងសមត្ថភាពសរសេរ និងការចងចាំពាក្យថ្មី',
            studentActivity: 'សិស្សអនុវត្តសួរឆ្លើយជាដៃគូយ៉ាងរស់រវើក',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះចម្លង ៥ដង និងត្រៀមរៀនទម្រង់ល្បះនៅសប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 抄写10个生词各5遍 — ចម្លងពាក្យថ្មីទាំង ១០ ពាក្យ ក្នុង១ពាក្យ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ។ ត្រៀមរៀនទម្រង់ល្បះសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week15-schedule-sentences',
    linkedCurriculumId: 'cur-15',
    dateWeekday: 'ចន្ទ',
    dateDay: '០៨',
    dateMonth: 'កុម្ភៈ',
    dateYear: '២០២៧',
    isoDate: '2027-02-08',
    chapterTitle: '第四单元 学习生活 · ជំពូកទី៤ ជីវិតសិក្សា',
    lessonTitle: '第十课 你今天上了什么课 · មេរៀនទី១០ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីខ្លះ？ (句型 · 这一周只上句型)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៦៦ (សៀវភៅពុម្ព 句型)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សយល់ច្បាស់នូវទម្រង់ល្បះទាំង ៥ ក្នុងមេរៀនទី១០ រួមមាន ៖ 1. 你今天上了什么课？, 2. 我今天上了体育课。, 3. 你明天有什么课？, 4. 我明天有汉语课。, 5. 星期二我没有数学课和德语课។ សិស្សចេះប្រើប្រាស់សូរស័ព្ទ «了» បញ្ជាក់ពីសកម្មភាពបានបញ្ចប់ និងចេះសួរនាំអំពីកាលវិភាគសិក្សា។',
    skillObjective:
      'សិស្សចេះសួរ និងឆ្លើយទម្រង់ល្បះកាលវិភាគសិក្សាបានយ៉ាងស្ទាត់ជំនាញ ចេះជំនួសឈ្មោះមុខវិជ្ជាផ្សេងៗចូលក្នុងល្បះ និងចេះសរសេរទម្រង់ល្បះទាំង ៥ ដោយត្រឹមត្រូវតាមវេយ្យាករណ៍ចិន។',
    attitudeObjective:
      'សិស្សមានទំនុកចិត្តក្នុងការសន្ទនាជាភាសាចិន មានភាពក្លាហានក្នុងការឡើងសួរឆ្លើយមុខថ្នាក់ និងស្រឡាញ់ពេលវេលាសិក្សា។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន តារាងកាលវិភាគប្រចាំសប្តាហ៍ ប័ណ្ណទម្រង់ល្បះ ក្តារខៀន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第二册) សៀវភៅកត់ត្រា ប៊ិច',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — បង្រៀនទម្រង់ល្បះទាំង ៥ នៃមេរៀនទី១០ (第一课时：学习第十课全部5个核心句型)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួរពិនិត្យពាក្យថ្មីទាំង ១០ ពាក្យ នៃសប្តាហ៍មុន (上课、了、明天、数学、德语...)',
            lessonContent: 'រំលឹកពាក្យថ្មីទាំង ១០ ពាក្យ ដើម្បីត្រៀមរៀនទម្រង់ល្បះ',
            studentActivity: 'សិស្សលើកដៃឆ្លើយ និងអានពាក្យថ្មីរួមគ្នា',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第四单元 学习生活 · 第十课 你今天上了什么课？ (句型 · 这一周只上句型)» លើក្តារខៀន\n២. បង្រៀន និងពន្យល់ទម្រង់ល្បះទាំង ៥ ម្តងមួយៗ ៖\n   1. 你今天上了什么课？ (តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីខ្លះ?)\n   2. 我今天上了体育课。 (ថ្ងៃនេះខ្ញុំបានរៀនមុខវិជ្ជាអប់រំកាយ/កីឡា។)\n   3. 你明天有什么课？ (តើថ្ងៃស្អែកអ្នកមានរៀនមុខវិជ្ជាអ្វីខ្លះ?)\n   4. 我明天有汉语课。 (ថ្ងៃស្អែកខ្ញុំមានរៀនមុខវិជ្ជាភាសាចិន។)\n   5. 星期二我没有数学课和德语课。 (ថ្ងៃអង្គារខ្ញុំមិនមានរៀនមុខវិជ្ជាគណិតវិទ្យា និងភាសាអាល្លឺម៉ង់ទេ។)\n៣. ពន្យល់ចំណុចវេយ្យាករណ៍ ៖\n   • 动态助词「了」៖ ប្រើប្រាស់ក្រោយកិរិយាសព្ទ 上 了 ដើម្បីបញ្ជាក់ថាសកម្មភាពបានកើតឡើងរួចរាល់ (បានរៀនហើយ)\n   • 问时间与课程 ៖ «今天上了什么课» (អតីតកាល/បច្ចុប្បន្ន) vs «明天有什么课» (អនាគតកាល)\n   • 否定式 ៖ ប្រើ «没有» ដើម្បីបដិសេធ (没有数学课)\n៤. ដឹកនាំសិស្សអានតាមគ្រូជាសមូហភាព ជាក្រុម និងប្តូរវេនសួរឆ្លើយ',
            lessonContent:
              '第四单元 学习生活 · 第十课 你今天上了什么课？ (句型 · 这一周只上句型)\n\n一. 核心句型 (ទម្រង់ល្បះស្នូលទាំង ៥) ៖\n1. 你今天上了什么课？ (Nǐ jīntiān shàng le shénme kè?)\n   [បកប្រែ] ៖ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីខ្លះ?\n2. 我今天上了体育课。 (Wǒ jīntiān shàng le tǐyù kè.)\n   [បកប្រែ] ៖ ថ្ងៃនេះខ្ញុំបានរៀនមុខវិជ្ជាអប់រំកាយ/កីឡា។\n3. 你明天有什么课？ (Nǐ míngtiān yǒu shénme kè?)\n   [បកប្រែ] ៖ តើថ្ងៃស្អែកអ្នកមានរៀនមុខវិជ្ជាអ្វីខ្លះ?\n4. 我明天有汉语课。 (Wǒ míngtiān yǒu hànyǔ kè.)\n   [បកប្រែ] ៖ ថ្ងៃស្អែកខ្ញុំមានរៀនមុខវិជ្ជាភាសាចិន។\n5. 星期二我没有数学课和德语课。 (Xīngqī’èr wǒ méiyǒu shùxué kè hé déyǔ kè.)\n   [បកប្រែ] ៖ ថ្ងៃអង្គារខ្ញុំមិនមានរៀនមុខវិជ្ជាគណិតវិទ្យា និងភាសាអាល្លឺម៉ង់ទេ។\n\n二. 语法重点与句型替换 (វេយ្យាករណ៍ និងការជំនួសពាក្យ) ៖\n• 结构一 ៖ 主语 + 时间 + 上了 + 什么课？\n  例 ៖ 你今天下午上了什么课？ ➔ 我今天下午上了历史课。\n• 结构二 ៖ 主语 + 时间 + 有 / 没有 + 课程名\n  例 ៖ 星期三我有地理课，没有德语课。',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់វេយ្យាករណ៍ អានតាមគ្រូ ចាប់គូអនុវត្តសួរឆ្លើយល្បះ ១-៥ និងចម្លងទម្រង់ល្បះទាំង ៥ ចូលក្នុងសៀវភៅកត់ត្រាឱ្យបានស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ចង្អុលកាលវិភាគលើក្តារខៀន និងសួរសិស្សភ្លាមៗ ៖ «你今天上了什么课？», «你明天有什么课？»',
            lessonContent: 'ពង្រឹងការសួរឆ្លើយទម្រង់ល្បះកាលវិភាគ (会问 会答 会正确运用)',
            studentActivity: 'សិស្សឆ្លើយតបយ៉ាងរហ័ស និងត្រឹមត្រូវតាមកាលវិភាគជាក់ស្តែង',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងទម្រង់ល្បះទាំង ៥ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ\n២. ណែនាំឱ្យហាត់អានទន្ទេញឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លងទម្រង់ល្បះទាំង ៥ ក្នុងមេរៀនទី១០ ក្នុងមួយល្បះសរសេរចំនួន ៥ដង (抄写所学5个句型各5遍) ព្រមទាំងភីនអ៊ីន និងអត្ថន័យខ្មែរ រួចហាត់អានឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — អនុវត្តបង្កើតល្បះ និងសួរឆ្លើយកាលវិភាគថ្នាក់រៀន (第二课时：课程表问答实战与造句练习)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ៣ នាក់ឡើងអានទម្រង់ល្បះទាំង ៥ នៃមេរៀនទី១០ ដោយមិនមើលសៀវភៅ',
            lessonContent: 'រំលឹកទម្រង់ល្បះទាំង ៥ នៃមេរៀនទី១០',
            studentActivity: 'សិស្សឡើងអានទម្រង់ល្បះដោយទំនុកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. ដឹកនាំសិស្សធ្វើលំហាត់រៀបពាក្យជាល្បះលើក្តារខៀន\n២. ណែនាំសិស្សឱ្យអនុវត្តកែប្រែល្បះពីស្រប ទៅជាបដិសេធ ដោយប្រើ «没有»\n៣. ដាក់លំហាត់ឱ្យសិស្សសរសេរកាលវិភាគសិក្សាផ្ទាល់ខ្លួនជាភាសាចិន',
            lessonContent:
              '一. 连词成句与句型改写 (ការរៀបពាក្យជាល្បះ និងការកែប្រែប្រយោគ) ៖\n1. 上了 / 你 / 什么课 / 今天 / ？ ➔ 你今天上了什么课？\n2. 体育课 / 今天 / 我 / 上了 / 。 ➔ 我今天上了体育课。\n3. 明天 / 有 / 你 / 什么课 / ？ ➔ 你明天有什么课？\n4. 汉语课 / 明天 / 我 / 有 / 。 ➔ 我明天有汉语课。\n5. 没有 / 星期二 / 数学课和德语课 / 我 / 。 ➔ 星期二我没有数学课和德语课。\n\n二. 个人课程表表达练习 (ការសរសេរកាលវិភាគផ្ទាល់ខ្លួន) ៖\n• 今天我上了数学课和历史课。\n• 明天我有地理课和体育课。\n• 星期五我没有德语课。',
            studentActivity: 'សិស្សឡើងក្តារខៀនរៀបពាក្យជាល្បះ អនុវត្តសរសេរចូលសៀវភៅ និងផ្ទៀងផ្ទាត់ជាមួយមិត្តភក្តិ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ឱ្យសិស្សម្នាក់ៗនិយាយប្រាប់មិត្តរួមថ្នាក់ពីមុខវិជ្ជាដែលខ្លួនចូលចិត្ត និងបានរៀននៅថ្ងៃនេះ',
            lessonContent: 'ពង្រឹងសមត្ថភាពនិយាយភាសាចិនពីជីវិតសិក្សា',
            studentActivity: 'សិស្សលើកដៃអនុវត្តនិយាយជាភាសាចិនដោយរលូន',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះចម្លង ៥ដង និងត្រៀមរៀនផ្នែកសន្ទនានៅសប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 抄写5个句型各5遍 — ចម្លងទម្រង់ល្បះទាំង ៥ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ។ ត្រៀមរៀនផ្នែកសន្ទនាសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week16-schedule-dialogues',
    linkedCurriculumId: 'cur-16',
    dateWeekday: 'ចន្ទ',
    dateDay: '១៥',
    dateMonth: 'កុម្ភៈ',
    dateYear: '២០២៧',
    isoDate: '2027-02-15',
    chapterTitle: '第四单元 学习生活 · ជំពូកទី៤ ជីវិតសិក្សា',
    lessonTitle: '第十课 你今天上了什么课 · មេរៀនទី១០ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីខ្លះ？ (对话 · 这一周只上对话)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៦៧ (សៀវភៅពុម្ព 对话)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សយល់ដឹងយ៉ាងច្បាស់លាស់នូវអត្ថន័យ និងបរិបទប្រើប្រាស់នៃការសន្ទនា និងអត្ថបទខ្លីក្នុងមេរៀនទី១០ ៖ 对话1 (A: 你今天上了什么课？ B: 我今天上了音乐课。 A: 你明天有什么课？ B: 我明天有历史课，你呢？ A: 我明天有数学课和地理课。) និង 短文2 (Jim是英国人，他会说汉语。他今天下午上了汉语课，他喜欢汉语课。Jim也会说德语。他明天有德语课，他也喜欢德语课。周末他有时间，他想去看中文电影。)。',
    skillObjective:
      'សិស្សចេះអានសន្ទនា និងអត្ថបទដោយរលូន ត្រឹមត្រូវតាមសូរសំឡេងភីនអ៊ីន មានទឹកដមសំនៀងធម្មជាតិ ចេះចាប់ដៃគូសន្ទនាសាកសួរមុខវិជ្ជាសិក្សា ព្រមទាំងចេះសរសេរចម្លងអត្ថបទសន្ទនាបានយ៉ាងស្អាត។',
    attitudeObjective:
      'សិស្សចូលរួមសកម្មភាពសន្ទនាជាដៃគូដោយភាពជឿជាក់ រីករាយក្នុងការប្រើប្រាស់ភាសាចិនក្នុងការប្រាស្រ័យទាក់ទង និងមានទឹកចិត្តស្រឡាញ់ការរៀនភាសាបរទេស។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណសន្ទនា រូបភាពសិស្សរៀនមុខវិជ្ជាផ្សេងៗ និងទង់ជាតិប្រទេស ក្តារខៀន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第二册) សៀវភៅកត់ត្រា ប៊ិច',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — រៀនសន្ទនាទី១ និងអត្ថបទទី២ ក្នុងមេរៀនទី១០ (第一课时：学习第十课对话一与短文二)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួររំលឹកទម្រង់ល្បះទាំង ៥ នៃសប្តាហ៍មុន (你今天上了什么课？...)',
            lessonContent: 'រំលឹកទម្រង់ល្បះទាំង ៥ ដើម្បីត្រៀមរៀនការសន្ទនាជាក់ស្តែង',
            studentActivity: 'សិស្សលើកដៃឆ្លើយ និងអានទម្រង់ល្បះឱ្យគ្រូស្តាប់',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第四单元 学习生活 · 第十课 你今天上了什么课？ (对话 · 这一周只上对话)» លើក្តារខៀន\n២. បង្រៀន និងដឹកនាំសិស្សអាន 对话一 ៖\n   A: 你今天上了什么课？ (តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីខ្លះ?)\n   B: 我今天上了音乐课。 (ថ្ងៃនេះខ្ញុំបានរៀនមុខវិជ្ជាតន្ត្រី។)\n   A: 你明天有什么课？ (តើថ្ងៃស្អែកអ្នកមានរៀនមុខវិជ្ជាអ្វីខ្លះ?)\n   B: 我明天有历史课，你呢？ (ថ្ងៃស្អែកខ្ញុំមានរៀនមុខវិជ្ជាប្រវត្តិវិទ្យា ចុះអ្នកវិញ?)\n   A: 我明天有数学课和地理课。 (ថ្ងៃស្អែកខ្ញុំមានរៀនមុខវិជ្ជាគណិតវិទ្យា និងភូមិវិទ្យា។)\n៣. បង្រៀន និងដឹកនាំសិស្សអាន 短文二 ៖\n   Jim是英国人，他会说汉语。他今天下午上了汉语课，他喜欢汉语课。Jim也会说德语。他明天有德语课，他也喜欢德语课。周末他有时间，他想去看中文电影。\n   (Jim គឺជាជនជាតិអង់គ្លេស គាត់ចេះនិយាយភាសាចិន។ រសៀលថ្ងៃនេះគាត់បានចូលរៀនមុខវិជ្ជាភាសាចិន គាត់ចូលចិត្តម៉ោងរៀនភាសាចិន។ Jim ក៏ចេះនិយាយភាសាអាល្លឺម៉ង់ដែរ។ ថ្ងៃស្អែកគាត់មានម៉ោងរៀនភាសាអាល្លឺម៉ង់ គាត់ក៏ចូលចិត្តម៉ោងរៀនភាសាអាល្លឺម៉ង់ដែរ។ នៅចុងសប្តាហ៍គាត់មានពេលវេលា គាត់ចង់ទៅមើលខ្សែភាពយន្តចិន។)\n៤. បែងចែកតួអង្គ A និង B ឱ្យសិស្សអនុវត្តសន្ទនាជាដៃគូ\n៥. កែតម្រង់ការបញ្ចេញសំឡេង និងទឹកដមសំនៀង',
            lessonContent:
              '第四单元 学习生活 · 第十课 你今天上了什么课？ (对话 · 这一周只上对话)\n\n一. 对话一 (សន្ទនាទី១ ៖ សាកសួរពីមុខវិជ្ជាសិក្សា) ៖\nA: 你今天上了什么课？ (Nǐ jīntiān shàng le shénme kè?)\n   [បកប្រែ] ៖ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីខ្លះ?\nB: 我今天上了音乐课。 (Wǒ jīntiān shàng le yīnyuè kè.)\n   [បកប្រែ] ៖ ថ្ងៃនេះខ្ញុំបានរៀនមុខវិជ្ជាតន្ត្រី។\nA: 你明天有什么课？ (Nǐ míngtiān yǒu shénme kè?)\n   [បកប្រែ] ៖ តើថ្ងៃស្អែកអ្នកមានរៀនមុខវិជ្ជាអ្វីខ្លះ?\nB: 我明天有历史课，你呢？ (Wǒ míngtiān yǒu lìshǐ kè, nǐ ne?)\n   [បកប្រែ] ៖ ថ្ងៃស្អែកខ្ញុំមានរៀនមុខវិជ្ជាប្រវត្តិវិទ្យា ចុះអ្នកវិញ?\nA: 我明天有数学课和地理课。 (Wǒ míngtiān yǒu shùxué kè hé dìlǐ kè.)\n   [បកប្រែ] ៖ ថ្ងៃស្អែកខ្ញុំមានរៀនមុខវិជ្ជាគណិតវិទ្យា និងភូមិវិទ្យា។\n\n二. 短文二 (អត្ថបទខ្លីទី២ ៖ ជីវិតសិក្សារបស់ជីម Jim) ៖\nJim是英国人，他会说汉语。他今天下午上了汉语课，他喜欢汉语课。Jim也会说德语。他明天有德语课，他也喜欢德语课。周末他有时间，他想去看中文电影。\n(Jim shì yīngguó rén, tā huì shuō hànyǔ. Tā jīntiān xiàwǔ shàng le hànyǔ kè, tā xǐhuan hànyǔ kè. Jim yě huì shuō déyǔ. Tā míngtiān yǒu déyǔ kè, tā yě xǐhuan déyǔ kè. Zhōumò tā yǒu shíjiān, tā xiǎng qù kàn zhōngwén diànyǐng.)\n[បកប្រែ] ៖ Jim គឺជាជនជាតិអង់គ្លេស គាត់ចេះនិយាយភាសាចិន។ រសៀលថ្ងៃនេះគាត់បានចូលរៀនមុខវិជ្ជាភាសាចិន គាត់ចូលចិត្តម៉ោងរៀនភាសាចិន។ Jim ក៏ចេះនិយាយភាសាអាល្លឺម៉ង់ដែរ។ ថ្ងៃស្អែកគាត់មានម៉ោងរៀនភាសាអាល្លឺម៉ង់ គាត់ក៏ចូលចិត្តម៉ោងរៀនភាសាអាល្លឺម៉ង់ដែរ។ នៅចុងសប្តាហ៍គាត់មានពេលវេលា គាត់ចង់ទៅមើលខ្សែភាពយន្តចិន។\n\n三. 语言点解析 (ការពន្យល់ចំណុចភាសា) ៖\n• 询问与反问 ៖ 你明天有什么课？ / 你呢？\n• 喜爱与计划 ៖ 喜欢...课 / 周末有时间 / 想去看中文电影',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ចាប់ដៃគូឡើងសម្តែងសន្ទនា A-B និងចម្លងសន្ទនាទី១ និងអត្ថបទខ្លីទី២ ចូលសៀវភៅកត់ត្រាឱ្យបានស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ហៅគូសិស្ស ២–៣ គូឡើងមុខថ្នាក់ សម្តែងការសន្ទនាសាកសួរមុខវិជ្ជាដោយមិនមើលសៀវភៅ',
            lessonContent: 'ពង្រឹងភាពស្ទាត់ជំនាញក្នុងការសន្ទនាជាក់ស្តែង (会对话 会演练 会熟练表达)',
            studentActivity: 'គូសិស្សឡើងមុខថ្នាក់សម្តែងសន្ទនាដោយភាពរស់រវើក មិត្តរួមថ្នាក់ទះដៃលើកទឹកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងសន្ទនាទី១ និងអត្ថបទខ្លីទី២ ចំនួន ២ដង\n២. ណែនាំឱ្យសិស្សទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លង 对话1 និង 短文2 ក្នុងមេរៀនទី១០ ចូលសៀវភៅ ចំនួន ២ដង (抄写对话1和短文2各2遍) ព្រមទាំងភីនអ៊ីន និងបកប្រែខ្មែរ រួចទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — សកម្មភាពសន្ទនាកាលវិភាគ និងណែនាំចំណង់ចំណូលចិត្ត (第二课时：日常学习交际演练与周末计划问答)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ២ នាក់ឡើងទន្ទេញសន្ទនាទី១ ឱ្យមិត្តរួមថ្នាក់ស្តាប់',
            lessonContent: 'រំលឹកសន្ទនាទី១ និងអត្ថបទខ្លីទី២ នៃមេរៀនទី១០',
            studentActivity: 'សិស្សឡើងទន្ទេញសន្ទនាដោយភាពជឿជាក់',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. រៀបចំសកម្មភាពសាកសួរកាលវិភាគសិក្សាជាក់ស្តែងក្នុងថ្នាក់រៀន\n២. ឱ្យសិស្សអនុវត្តសួរនាំមិត្តភក្តិ ៖ «你今天上了什么课？», «你明天有什么课？», «周末你想做什么？»\n៣. ណែនាំសិស្សឱ្យហាត់សរសេរប្រយោគខ្លីពណ៌នាពីជីវិតសិក្សារបស់ខ្លួនឯង តាមគំរូអត្ថបទរបស់ Jim',
            lessonContent:
              '一. 学习生活交际演练 (សកម្មភាពប្រាស្រ័យទាក់ទងពីជីវិតសិក្សា) ៖\n• A: 你今天上了什么课？\n• B: 我今天上了数学课和汉语课。你呢？\n• A: 我今天上了地理课。\n• B: 周末你有时间吗？\n• A: 我有时间，我想去踢足球。\n\n二. 我的学习生活小短文 (តែងកថាខណ្ឌខ្លីពីជីវិតសិក្សាខ្លួនឯង) ៖\n我是柬埔寨人，我会说汉语。我今天下午上了汉语课，我喜欢汉语课。周末我有时间，我想和朋友去打篮球。',
            studentActivity: 'សិស្សចូលរួមសកម្មភាពសន្ទនា អនុវត្តនិយាយជាភាសាចិន និងសរសេរកថាខណ្ឌខ្លីពណ៌នាពីខ្លួនឯង។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'វាយតម្លៃការបញ្ចេញសំឡេង និងភាពរលូននៃការសន្ទនារបស់ក្រុមនីមួយៗ',
            lessonContent: 'ពង្រឹងទំនុកចិត្តក្នុងការប្រើប្រាស់ភាសាចិនប្រាស្រ័យទាក់ទង',
            studentActivity: 'សិស្សស្តាប់ការកែលម្អរបស់គ្រូ និងកែតម្រង់ការបញ្ចេញសំឡេង',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះ និងណែនាំឱ្យត្រៀមសៀវភៅពុម្ព និងសៀវភៅលំហាត់សម្រាប់សប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 抄写对话1和短文2各2遍并背诵对话1 — ចម្លងសន្ទនាទី១ និងអត្ថបទខ្លីទី២ ចំនួន ២ដង និងទន្ទេញឱ្យចាំមាត់។ ត្រៀមធ្វើលំហាត់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់សប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week17-schedule-exercises',
    linkedCurriculumId: 'cur-17',
    dateWeekday: 'ចន្ទ',
    dateDay: '២២',
    dateMonth: 'កុម្ភៈ',
    dateYear: '២០២៧',
    isoDate: '2027-02-22',
    chapterTitle: '第四单元 学习生活 · ជំពូកទី៤ ជីវិតសិក្សា',
    lessonTitle: '第十课 你今天上了什么课 · មេរៀនទី១០ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីខ្លះ？ (综合练习 · 课本66-69页 & 练习册74-84页)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'សៀវភៅពុម្ព ទំព័រ ៦៦-៦៩ និង សៀវភៅលំហាត់ ទំព័រ ៧៤-៨៤',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សក្តាប់បានយ៉ាងរឹងមាំនូវចំណេះដឹងទាំងអស់នៃមេរៀនទី១០ រួមមាន ពាក្យថ្មីទាំង ១០ ពាក្យ ទម្រង់ល្បះសួរនាំកាលវិភាគទាំង ៥ និងអត្ថបទសន្ទនា ព្រមទាំងចេះអនុវត្តធ្វើលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព (ទំព័រ ៦៦-៦៩) និងសៀវភៅលំហាត់ (ទំព័រ ៧៤-៨៤) បានត្រឹមត្រូវគ្រប់ជ្រុងជ្រោយ។',
    skillObjective:
      'សិស្សមានជំនាញច្បាស់លាស់លើការស្តាប់ការសន្ទនាកាលវិភាគ ការអាន ការសរសេរអក្សរចិន ការបំពេញពាក្យ ការប្រើប្រាស់ «了» បង្កើតល្បះ ការផ្គូផ្គង ការបកប្រែ និងការឆ្លើយសំណួរក្នុងលំហាត់សៀវភៅពុម្ព (第66-69页) និងសៀវភៅលំហាត់ (第74-84页)។',
    attitudeObjective:
      'សិស្សមានស្មារតីទទួលខុសត្រូវខ្ពស់ យកចិត្តទុកដាក់បំពេញកិច្ចការគ្រប់លំហាត់ឱ្យបានពេញលេញ ស្អាតបាត និងទាន់ពេលវេលា។',
    teachingMaterialsTeacher:
      'សៀវភៅពុម្ព (ទំព័រ ៦៦-៦៩) សៀវភៅលំហាត់ (ទំព័រ ៧៤-៨៤) សៀវភៅគ្រូ កិច្ចតែងការបង្រៀន ក្តារខៀន ឯកសារចម្លើយគំរូ',
    teachingMaterialsStudent:
      'សៀវភៅពុម្ព (第66-69页) សៀវភៅលំហាត់ (第74-84页) ប៊ិច ខ្មៅដៃ បន្ទាត់',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — បំពេញលំហាត់សៀវភៅពុម្ព ទំព័រ ៦៦-៦៩ (第一课时：完成课本第66页-69页练习)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'រំលឹកសង្ខេបពាក្យថ្មី ទម្រង់ល្បះ និងសន្ទនាក្នុងមេរៀនទី១០',
            lessonContent: 'រំលឹកចំណេះដឹងគន្លឹះនៃមេរៀនទី១០ មុនចាប់ផ្តើមធ្វើលំហាត់សៀវភៅពុម្ព',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ និងត្រៀមបើកសៀវភៅពុម្ពទំព័រ ៦៦',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第四单元 学习生活 · 第十课 你今天上了什么课？ (综合练习 · 课本第66页-69页)» លើក្តារខៀន\n២. ណែនាំសិស្សធ្វើលំហាត់ក្នុងសៀវភៅពុម្ពម្តងមួយទំព័រ ៖\n   • ទំព័រ ៦៦ ៖ 听录音辨别课程与时间 (ស្តាប់សំឡេងកំណត់មុខវិជ្ជា និងពេលវេលា)\n   • ទំព័រ ៦៧ ៖ 读课程表连线并回答问题 (អានកាលវិភាគ គូសផ្គូផ្គង និងឆ្លើយសំណួរ)\n   • ទំព័រ ៦៨ ៖ 用「了」造句与课程替换练习 (បង្កើតល្បះដោយប្រើ «了» និងជំនួសមុខវិជ្ជា)\n   • ទំព័រ ៦៩ ៖ 课堂交际调查与周末计划汇报 (សកម្មភាពស្ទង់មតិកាលវិភាគ និងរាយការណ៍គម្រោងចុងសប្តាហ៍)\n៣. ដើរមើល ជួយណែនាំ និងកែតម្រង់សិស្សដែលជួបការលំបាក\n៤. កែសម្រួលចម្លើយត្រឹមត្រូវរួមគ្នានៅលើក្តារខៀន',
            lessonContent:
              '第四单元 学习生活 · 第十课 你今天上了什么课？ (综合练习 · 课本第66页-69页)\n\n一. 课本第66-67页练习 (សៀវភៅពុម្ព ទំព័រ ៦៦-៦៧) ៖\n• 听音选课 (ស្តាប់សំឡេង និងជ្រើសរើសមុខវិជ្ជាត្រឹមត្រូវ ៖ 数学、德语、历史、地理)\n• 课程表连线 (គូសផ្គូផ្គងកាលវិភាគ) ៖\n  1. 今天上午 ➔ 数学课、德语课\n  2. 今天下午 ➔ 历史课、地理课\n  3. 明天 ➔ 汉语课、体育课\n  4. 星期二 ➔ 没有数学课\n\n二. 课本第68-69页练习 (សៀវភៅពុម្ព ទំព័រ ៦៨-៦៩) ៖\n• 用「了」造句 (បង្កើតល្បះដោយប្រើ «了») ៖\n  1. 我今天上了音乐课。\n  2. 他下午上了汉语课。\n  3. 妹妹买了一件漂亮的衣服。\n• 课堂交际调查 (ការស្ទង់មតិក្នុងថ្នាក់) ៖ 调查同伴今日与明日课程表，用汉语汇报。',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ធ្វើលំហាត់ក្នុងសៀវភៅពុម្ពទំព័រ ៦៦-៦៩ ដោយយកចិត្តទុកដាក់ លើកដៃសួរគ្រូពេលមិនយល់ ឡើងក្តារខៀនសរសេរចម្លើយ និងកត់ត្រាកែតម្រង់ចូលសៀវភៅ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'សង្ខេបចម្លើយសំខាន់ៗនៃទំព័រ ៦៦-៦៩ និងឱ្យសិស្សផ្ទៀងផ្ទាត់ឡើងវិញឱ្យបានត្រឹមត្រូវ ១០០%',
            lessonContent: 'ផ្ទៀងផ្ទាត់ និងពង្រឹងចម្លើយលំហាត់សៀវភៅពុម្ព (订正课本练习 确保全对)',
            studentActivity: 'សិស្សផ្ទៀងផ្ទាត់ចម្លើយ និងកែសម្រួលចំណុចខ្វះខាត',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់ភារកិច្ចឱ្យសិស្សបន្តធ្វើលំហាត់ក្នុងសៀវភៅលំហាត់ ទំព័រ ៧៤ ដល់ ៨៤\n២. ត្រៀមកែសម្រួល និងបូកសរុបពិន្ទុមេរៀនទី១០',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ប្អូនៗត្រូវបំពេញលំហាត់ទាំងអស់ក្នុងសៀវភៅលំហាត់ (练习册) ពីទំព័រ ៧៤ ដល់ ៨៤ (第74页到84页) ឱ្យបានគ្រប់ជ្រុងជ្រោយ ដើម្បីត្រៀមផ្ទៀងផ្ទាត់ និងកែសម្រួលនៅម៉ោងបន្ទាប់។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — បំពេញ និងកែសម្រួលសៀវភៅលំហាត់ ទំព័រ ៧៤-៨៤ (第二课时：全完成并订正练习册第74页到84页)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសៀវភៅលំហាត់របស់សិស្សគ្រប់គ្នា',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យការយកសៀវភៅលំហាត់មកថ្នាក់',
            studentActivity: 'សិស្សដាក់សៀវភៅលំហាត់លើតុ និងត្រៀមកែសម្រួល',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួរពិនិត្យលំហាត់សៀវភៅពុម្ពទំព័រ ៦៦-៦៩ ដែលបានធ្វើរួច',
            lessonContent: 'រំលឹកឡើងវិញនូវលំហាត់សៀវភៅពុម្ព',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. ដឹកនាំសិស្សធ្វើ និងកែសម្រួលលំហាត់ក្នុងសៀវភៅលំហាត់第74页到84页 ៖\n   • 第74-76页 ៖ 汉字描红与规范书写 (ហាត់សរសេរអក្សរចិន 上, 了, 明, 天, 数, 学, 语, 历, 史, 地, 理, 时, 间)\n   • 第77-78页 ៖ 看拼音写汉字与选词填空 (មើលភីនអ៊ីនសរសេរអក្សរចិន និងបំពេញចន្លោះល្បះ)\n   • 第79-80页 ៖ 连词成句与动态助词「了」专项练习 (រៀបពាក្យជាល្បះ និងការប្រើប្រាស់ «了»)\n   • 第81-82页 ៖ 汉柬互译与课程表问答 (ការបកប្រែ ចិន-ខ្មែរ និងឆ្លើយសំណួរតាមកាលវិភាគ)\n   • 第83-84页 ៖ 阅读短文理解与单元综合测试 (ការអានយល់អត្ថបទ និងតេស្តបូកសរុបមេរៀនទី១០)\n២. ហៅសិស្សឡើងក្តារខៀនសរសេរចម្លើយលំហាត់នីមួយៗ\n៣. ពន្យល់ចំណុចដែលសិស្សឧស្សាហ៍ច្រឡំ និងកែតម្រូវរួមគ្នា',
            lessonContent:
              '一. 练习册第74页到84页核心练习解析 (ការពន្យល់លំហាត់សៀវភៅលំហាត់ ទំព័រ ៧៤-៨៤) ៖\n1. 汉字书写 (第74-76页) ៖ 掌握正确笔顺，规范书写生词汉字。\n2. 选词填空 (第77-78页) ៖\n   • 我今天上 (了) 体育课。\n   • 你 (明天) 有什么课？\n   • 星期二我 (没有) 数学课和德语课。\n   • (周末) 他有时间，想去看电影。\n3. 连词成句 (第79-80页) ៖\n   • 历史课 / 今天 / 我 / 上了 / 音乐课和 / 。 ➔ 我今天上了音乐课和历史课。\n   • 数学课 / 明天 / 你 / 有 / 吗 / ？ ➔ 你明天有数学课吗？\n4. 课程翻译 (第81-82页) ៖\n   • គណិតវិទ្យា ➔ 数学 / ភាសាអាល្លឺម៉ង់ ➔ 德语\n   • ប្រវត្តិវិទ្យា ➔ 历史 / ភូមិវិទ្យា ➔ 地理\n5. 阅读短文问答 (第83-84页) ៖ 理解Jim的学习生活，准确回答Jim会说什么语言、喜欢什么课与周末计划。',
            studentActivity: 'សិស្សផ្ទៀងផ្ទាត់ចម្លើយក្នុងសៀវភៅលំហាត់ទំព័រ ៧៤-៨៤ កែសម្រួលចំណុចខុសដោយប៊ិចក្រហម និងកត់ត្រាចម្លើយត្រឹមត្រូវចូលសៀវភៅ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'សង្ខេប និងវាយតម្លៃលទ្ធផលការរៀនមេរៀនទី១០ ទាំងមូល (生词、句型、对话、练习) ដោយលើកសរសើរសិស្សដែលខិតខំប្រឹងប្រែង',
            lessonContent: 'សង្ខេប និងវាយតម្លៃបញ្ចប់មេរៀនទី១០ ទាំងមូល (第十课全课总结与学习评价)',
            studentActivity: 'សិស្សស្តាប់ការសង្ខេបរបស់គ្រូ និងឆ្លើយសំណួរបូកសរុបមេរៀន',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ណែនាំឱ្យសិស្សកែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់ឱ្យបានពេញលេញ ១០០%\n២. ណែនាំឱ្យអានរំលឹកមេរៀនទី១០ ឡើងវិញនៅផ្ទះ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 完整订正课本第66-69页与练习册第74-84页的所有练习，复习第十课生词、句型与对话。(កែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់ឱ្យបានពេញលេញ និងត្រឹមត្រូវ ១០០% ព្រមទាំងរំលឹកឡើងវិញនូវមេរៀនទី១០ ទាំងមូល)',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week18-hard-vocab',
    linkedCurriculumId: 'cur-18',
    dateWeekday: 'ចន្ទ',
    dateDay: '០១',
    dateMonth: 'មីនា',
    dateYear: '២០២៧',
    isoDate: '2027-03-01',
    chapterTitle: '第四单元 学习生活 · ជំពូកទី៤ ជីវិតសិក្សា',
    lessonTitle: '第十一课 汉语难不难 · មេរៀនទី១១ ភាសាចិនពិបាកឬទេ？ (生词 · 这一周只上生词)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៧០ ដល់ ទំព័រទី៧១ (សៀវភៅពុម្ព 生词)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សស្គាល់ យល់អត្ថន័យ ចងចាំ និងបញ្ចេញសំឡេងយ៉ាងត្រឹមត្រូវនូវពាក្យថ្មីទាំង ១០ ពាក្យ នៃមេរៀនទី១១ ៖ 1.难 (ពិបាក), 2.作业 (កិច្ចការផ្ទះ/កិច្ចការ), 3.有意思 (គួរឱ្យចាប់អារម្មណ៍ / មានន័យ), 4.中学 (អនុវិទ្យាល័យ/វិទ្យាល័យ), 5.科目 (មុខវិជ្ជា), 6.容易 (ងាយស្រួល), 7.成绩 (លទ្ធផល/ពិន្ទុ), 8.没意思 (មិនគួរឱ្យចាប់អារម្មណ៍ / គ្មានន័យ), 9.考试 (ការប្រឡង/ប្រឡង), 10.有空儿 (មានពេលទំនេរ) តាមរយៈរូបភាព និងប័ណ្ណពាក្យ។',
    skillObjective:
      'សិស្សចេះអាន ផ្សំពាក្យ សរសេរអក្សរចិនតាមលំដាប់គំនូសត្រឹមត្រូវ និងចេះប្រើប្រាស់ពាក្យថ្មីទាំង ១០ ដើម្បីវាយតម្លៃការសិក្សាមុខវិជ្ជា និងសកម្មភាពនានា ព្រមទាំងបំពេញកិច្ចការផ្ទះបានត្រឹមត្រូវ។',
    attitudeObjective:
      'សិស្សមានទំនុកចិត្ត មិនខ្លាចការលំបាកក្នុងការរៀនភាសាចិន មានអាកប្បកិរិយាវិជ្ជមាន និងរីករាយក្នុងការសិក្សា។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណពាក្យ ប័ណ្ណរូបភាពមុខវិជ្ជា និងការប្រឡង ក្តារខៀន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第二册) សៀវភៅកត់ត្រា ប៊ិច បន្ទាត់',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — បង្រៀនពាក្យថ្មីទាំង ១០ ពាក្យ (第一课时：学习第十一课全部10个生词与发音)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួររំលឹកពាក្យមុខវិជ្ជា និងពេលវេលានៃមេរៀនទី១០ (数学、德语、历史、地理、上课、周末...)',
            lessonContent: 'រំលឹកពាក្យមុខវិជ្ជាចាស់ ដើម្បីតភ្ជាប់ទៅកាន់ការវាយតម្លៃពិបាក/ងាយនៃមេរៀនទី១១',
            studentActivity: 'សិស្សលើកដៃឆ្លើយឈ្មោះមុខវិជ្ជាដែលខ្លួនចាំ',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第四单元 学习生活 · 第十一课 汉语难不难？ (生词 · 这一周只上生词)» លើក្តារខៀន\n២. បង្រៀនពាក្យថ្មីទាំង ១០ ពាក្យ ម្តងមួយៗ ដោយពន្យល់សូរសំឡេងភីនអ៊ីន និងអត្ថន័យជាភាសាខ្មែរ ៖\n   1. 难 (nán) ៖ ពិបាក\n   2. 作业 (zuòyè) ៖ កិច្ចការផ្ទះ / កិច្ចការ\n   3. 有意思 (yǒu yìsi) ៖ គួរឱ្យចាប់អារម្មណ៍ / មានន័យ\n   4. 中学 (zhōngxué) ៖ អនុវិទ្យាល័យ / វិទ្យាល័យ\n   5. 科目 (kēmù) ៖ មុខវិជ្ជា\n   6. 容易 (róngyì) ៖ ងាយស្រួល\n   7. 成绩 (chéngjì) ៖ លទ្ធផល / ពិន្ទុ\n   8. 没意思 (méi yìsi) ៖ មិនគួរឱ្យចាប់អារម្មណ៍ / គ្មានន័យ\n   9. 考试 (kǎoshì) ៖ ការប្រឡង / ប្រឡង\n   10. 有空儿 (yǒu kòngr) ៖ មានពេលទំនេរ\n៣. ដឹកនាំសិស្សអានតាមគ្រូជាសមូហភាព ជាក្រុម និងម្នាក់ៗ\n៤. ពន្យល់ការផ្សំពាក្យគន្លឹះ ៖ 汉语难、做作业、很有意思、中学生活、学习科目、容易学、好成绩、真没意思、准备考试、周末有空儿',
            lessonContent:
              '第四单元 学习生活 · 第十一课 汉语难不难？ (生词 · 这一周只上生词)\n\n一. 生词表 (តារាងពាក្យថ្មីទាំង ១០ ពាក្យ) ៖\n1. 难 (nán) [形] ៖ ពិបាក / 汉语不难 (ភាសាចិនមិនពិបាកទេ)\n2. 作业 (zuòyè) [名] ៖ កិច្ចការផ្ទះ / 做作业 (ធ្វើកិច្ចការផ្ទះ)\n3. 有意思 (yǒu yìsi) [形] ៖ គួរឱ្យចាប់អារម្មណ៍ / 很有意思 (គួរឱ្យចាប់អារម្មណ៍ណាស់)\n4. 中学 (zhōngxué) [名] ៖ អនុវិទ្យាល័យ / វិទ្យាល័យ / 中学生 (សិស្សអនុវិទ្យាល័យ)\n5. 科目 (kēmù) [名] ៖ មុខវិជ្ជា / 很多科目 (មុខវិជ្ជាជាច្រើន)\n6. 容易 (róngyì) [形] ៖ ងាយស្រួល / 很容易 (ងាយស្រួលណាស់)\n7. 成绩 (chéngjì) [名] ៖ លទ្ធផល / ពិន្ទុ / 成绩很好 (ពិន្ទុល្អណាស់)\n8. 没意思 (méi yìsi) [形] ៖ មិនគួរឱ្យចាប់អារម្មណ៍ / គ្មានន័យ / 真没意思\n9. 考试 (kǎoshì) [名/动] ៖ ការប្រឡង / ប្រឡង / 期中考试 (ប្រឡងពាក់កណ្តាលឆមាស)\n10. 有空儿 (yǒu kòngr) [动] ៖ មានពេលទំនេរ / 周末有空儿吗？\n\n二. 词组与反义词拓展 (ការផ្សំពាក្យ និងពាក្យផ្ទុយ) ៖\n• 反义词 ៖ 难 (ពិបាក) ⟷ 容易 (ងាយស្រួល) | 有意思 (គួរឱ្យចាប់អារម្មណ៍) ⟷ 没意思 (គ្មានន័យ)\n• 搭配 ៖ 汉语作业、考试成绩、中学科目、有空儿去看电影',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ សង្កេតប័ណ្ណពាក្យ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ចាប់គូអានឱ្យគ្នាទៅវិញទៅមក និងកត់ត្រាពាក្យថ្មីទាំង ១០ ចូលក្នុងសៀវភៅកត់ត្រា។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'លេងល្បែងផ្គូផ្គងពាក្យផ្ទុយ (难 ⟷ 容易, 有意思 ⟷ 没意思) និងប័ណ្ណពាក្យ Flashcard Quiz',
            lessonContent: 'ពង្រឹងការចងចាំពាក្យថ្មីទាំង ១០ ពាក្យ (会读 会认 会正确翻译 会辨别反义词)',
            studentActivity: 'សិស្សលើកដៃដណ្តើមគ្នាឆ្លើយ និងបញ្ចេញសំឡេងយ៉ាងច្បាស់ៗ',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងពាក្យថ្មីទាំង ១០ ពាក្យ ក្នុង១ពាក្យ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ\n២. ណែនាំឱ្យហាត់អានទន្ទេញឱ្យចាំមាត់នៅផ្ទះ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លងពាក្យថ្មីទាំង ១០ ពាក្យ ក្នុងមេរៀនទី១១ ក្នុងមួយពាក្យសរសេរចំនួន ៥ដង (抄写所学10个生词各5遍) ព្រមទាំងដាក់ភីនអ៊ីន និងប្រែជាភាសាខ្មែរ រួចហាត់អានឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — ហាត់សរសេរអក្សរចិន និងផ្សំពាក្យរៀនសូត្រ (第二课时：生词汉字书写笔顺与学业评价词汇拓展)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ៣ នាក់ឡើងអានពាក្យថ្មីទាំង ១០ ពាក្យ លើក្តារខៀន',
            lessonContent: 'រំលឹកការបញ្ចេញសំឡេងពាក្យថ្មីទាំង ១០',
            studentActivity: 'សិស្សឡើងអានពាក្យថ្មីដោយទំនុកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. បង្ហាញរបៀបសរសេរគំនូសអក្សរចិនគន្លឹះលើក្តារខៀន ៖\n   • 难 (10 画) ៖ 又 + 隹\n   • 业 (5 画) ៖ 竖、竖、点、撇、横\n   • 意 (13 画) ៖ 音 + 心\n   • 思 (9 画) ៖ 田 + 心\n   • 科 (9 画) ៖ 禾 + 斗\n   • 容 (10 画) ៖ 宀 + 谷\n   • 易 (8 画) ៖ 日 + 勿\n   • 成 (6 画) ៖ 横、撇、横折钩、斜钩、撇、点\n   • 考 (6 画) ៖ 土 + 𠤎\n   • 空 (8 画) ៖ 穴 + 工\n២. ដឹកនាំសិស្សរាប់ចំនួនគំនូស និងហាត់សរសេរលើអាកាស\n៣. ដាក់លំហាត់ផ្គូផ្គងពាក្យវាយតម្លៃមុខវិជ្ជាលើក្តារខៀន',
            lessonContent:
              '一. 汉字笔画笔顺 (គំនូស និងលំដាប់គំនូសអក្សរចិន) ៖\n• 难 (10 画), 业 (5 画), 意 (13 画), 思 (9 画), 科 (9 画)\n• 容 (10 画), 易 (8 画), 成 (6 画), 考 (6 画), 空 (8 画)\n\n二. 学习评价搭配演练 (ការផ្សំពាក្យវាយតម្លៃការសិក្សា) ៖\n• 汉语作业很容易 (កិច្ចការផ្ទះភាសាចិនងាយស្រួលណាស់)\n• 数学作业不容易 (កិច្ចការផ្ទះគណិតវិទ្យាមិនងាយស្រួលទេ)\n• 历史成绩很好 (ពិន្ទុប្រវត្តិវិទ្យាល្អណាស់)\n• 周末有空儿 (ចុងសប្តាហ៍មានពេលទំនេរ)',
            studentActivity: 'សិស្សយកដៃគូសវាសលំដាប់គំនូសលើអាកាស ហាត់សរសេរក្នុងសៀវភៅលំហាត់ និងឡើងក្តារខៀនបំពេញចន្លោះ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ឱ្យសិស្សប្តូរវេនសួរឆ្លើយរវាងពាក្យចិន និងអត្ថន័យខ្មែរ',
            lessonContent: 'ពង្រឹងសមត្ថភាពសរសេរ និងការចងចាំពាក្យថ្មី',
            studentActivity: 'សិស្សអនុវត្តសួរឆ្លើយជាដៃគូយ៉ាងរស់រវើក',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះចម្លង ៥ដង និងត្រៀមរៀនទម្រង់ល្បះនៅសប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 抄写10个生词各5遍 — ចម្លងពាក្យថ្មីទាំង ១០ ពាក្យ ក្នុង១ពាក្យ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ។ ត្រៀមរៀនទម្រង់ល្បះសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week19-hard-sentences',
    linkedCurriculumId: 'cur-19',
    dateWeekday: 'ចន្ទ',
    dateDay: '០៨',
    dateMonth: 'មីនា',
    dateYear: '២០២៧',
    isoDate: '2027-03-08',
    chapterTitle: '第四单元 学习生活 · ជំពូកទី៤ ជីវិតសិក្សា',
    lessonTitle: '第十一课 汉语难不难 · មេរៀនទី១១ ភាសាចិនពិបាកឬទេ？ (句型 · 这一周只上句型)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៧២ (សៀវភៅពុម្ព 句型)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សយល់ច្បាស់នូវទម្រង់ល្បះទាំង ៦ ក្នុងមេរៀនទី១១ រួមមាន ៖ 1. 汉语难不难？, 2. 汉语不难。, 3. 今天作业多不多？, 4. 今天作业很多。, 5. 汉语课有意思吗？, 6. 汉语课很有意思។ សិស្សចេះប្រើប្រាស់សំណួរស្រប-បដិសេធ «A不A» (正反疑问句) និងការប្រើប្រាស់គុណនាមវាយតម្លៃកម្រិតសិក្សាដោយប្រើ «很»។',
    skillObjective:
      'សិស្សចេះសួរ និងឆ្លើយទម្រង់ល្បះ «A不A» បានយ៉ាងស្ទាត់ជំនាញ ចេះបង្កើតល្បះវាយតម្លៃមុខវិជ្ជា និងកិច្ចការផ្ទះ ព្រមទាំងចេះសរសេរទម្រង់ល្បះទាំង ៦ ដោយត្រឹមត្រូវតាមវេយ្យាករណ៍ចិន។',
    attitudeObjective:
      'សិស្សមានទំនុកចិត្តក្នុងការបញ្ចេញមតិយោបល់លើការសិក្សា មានភាពក្លាហានក្នុងការឡើងសួរឆ្លើយមុខថ្នាក់ និងស្រឡាញ់ការរៀនសូត្រ។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណទម្រង់ល្បះ ក្តារខៀន ប័ណ្ណសំណួរ-ចម្លើយ',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第二册) សៀវភៅកត់ត្រា ប៊ិច',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — បង្រៀនទម្រង់ល្បះទាំង ៦ នៃមេរៀនទី១១ (第一课时：学习第十一课全部6个核心句型)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួរពិនិត្យពាក្យថ្មីទាំង ១០ ពាក្យ នៃសប្តាហ៍មុន (难、容易、作业、有意思、科目...)',
            lessonContent: 'រំលឹកពាក្យថ្មីទាំង ១០ ពាក្យ ដើម្បីត្រៀមរៀនទម្រង់ល្បះ',
            studentActivity: 'សិស្សលើកដៃឆ្លើយ និងអានពាក្យថ្មីរួមគ្នា',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第四单元 学习生活 · 第十一课 汉语难不难？ (句型 · 这一周只上句型)» លើក្តារខៀន\n២. បង្រៀន និងពន្យល់ទម្រង់ល្បះទាំង ៦ ម្តងមួយៗ ៖\n   1. 汉语难不难？ (តើភាសាចិនពិបាកឬទេ?)\n   2. 汉语不难。 (ភាសាចិនមិនពិបាកទេ។)\n   3. 今天作业多不多？ (តើថ្ងៃនេះកិច្ចការផ្ទះច្រើនឬទេ?)\n   4. 今天作业很多。 (ថ្ងៃនេះកិច្ចការផ្ទះច្រើនណាស់។)\n   5. 汉语课有意思吗？ (តើម៉ោងរៀនភាសាចិនគួរឱ្យចាប់អារម្មណ៍ឬទេ?)\n   6. 汉语课很有意思。 (ម៉ោងរៀនភាសាចិនគួរឱ្យចាប់អារម្មណ៍ណាស់។)\n៣. ពន្យល់ចំណុចវេយ្យាករណ៍ ៖\n   • 正反疑问句 (សំណួរស្រប-បដិសេធ) ៖ រចនាសម្ព័ន្ធ «គុណនាម + 不 + គុណនាម» (难不难？/ 多不多？/ 好不好？) មានន័យស្មើនឹង «... 吗？»\n   • 形容词谓语句 (ល្បះមានកិរិយាសព្ទគុណនាម) ៖ ពេលឆ្លើយស្រប ត្រូវបន្ថែមឈ្នាប់កម្រិត «很» (很有意思 / 很多 / 很好) ចៀសវាងការប្រើគុណនាមទទេតែមួយម៉ាត់\n   • 否定回答 (ចម្លើយបដិសេធ) ៖ ប្រើ «不» (不难 / 不多 / 不容易)\n៤. ដឹកនាំសិស្សអានតាមគ្រូជាសមូហភាព ជាក្រុម និងប្តូរវេនសួរឆ្លើយ',
            lessonContent:
              '第四单元 学习生活 · 第十一课 汉语难不难？ (句型 · 这一周只上句型)\n\n一. 核心句型 (ទម្រង់ល្បះស្នូលទាំង ៦) ៖\n1. 汉语难不难？ (Hànyǔ nán bù nán?)\n   [បកប្រែ] ៖ តើភាសាចិនពិបាកឬទេ?\n2. 汉语不难。 (Hànyǔ bù nán.)\n   [បកប្រែ] ៖ ភាសាចិនមិនពិបាកទេ។\n3. 今天作业多不多？ (Jīntiān zuòyè duō bù duō?)\n   [បកប្រែ] ៖ តើថ្ងៃនេះកិច្ចការផ្ទះច្រើនឬទេ?\n4. 今天作业很多。 (Jīntiān zuòyè hěn duō.)\n   [បកប្រែ] ៖ ថ្ងៃនេះកិច្ចការផ្ទះច្រើនណាស់។\n5. 汉语课有意思吗？ (Hànyǔ kè yǒu yìsi ma?)\n   [បកប្រែ] ៖ តើម៉ោងរៀនភាសាចិនគួរឱ្យចាប់អារម្មណ៍ឬទេ?\n6. 汉语课很有意思。 (Hànyǔ kè hěn yǒu yìsi.)\n   [បកប្រែ] ៖ ម៉ោងរៀនភាសាចិនគួរឱ្យចាប់អារម្មណ៍ណាស់។\n\n二. 语法重点与句型替换 (វេយ្យាករណ៍ និងការជំនួសពាក្យ) ៖\n• 正反问句 ៖ 主语 + 形容词 + 不 + 形容词？\n  例 ៖ 数学作业容易不容易？ ➔ 数学作业不容易。\n• 肯定与否定对比 ៖\n  - 汉语难不难？ ➔ 不难，很容易。\n  - 历史课有意思吗？ ➔ 很有意思 / 没意思。',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់វេយ្យាករណ៍ អានតាមគ្រូ ចាប់គូអនុវត្តសួរឆ្លើយល្បះ ១-៦ និងចម្លងទម្រង់ល្បះទាំង ៦ ចូលក្នុងសៀវភៅកត់ត្រាឱ្យបានស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'សួរសិស្សក្នុងថ្នាក់ភ្លាមៗ ៖ «今天的作业多不多？», «汉语难不难？», «数学课有意思吗？»',
            lessonContent: 'ពង្រឹងការសួរឆ្លើយទម្រង់ល្បះ正反疑问句 (会问 会答 会正确运用)',
            studentActivity: 'សិស្សឆ្លើយតបយ៉ាងរហ័ស និងត្រឹមត្រូវដោយប្រើ «很...» ឬ «不...»',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងទម្រង់ល្បះទាំង ៦ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ\n២. ណែនាំឱ្យហាត់អានទន្ទេញឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លងទម្រង់ល្បះទាំង ៦ ក្នុងមេរៀនទី១១ ក្នុងមួយល្បះសរសេរចំនួន ៥ដង (抄写所学6个句型各5遍) ព្រមទាំងភីនអ៊ីន និងអត្ថន័យខ្មែរ រួចហាត់អានឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — អនុវត្តបង្កើតល្បះ正反疑问句 និងវាយតម្លៃមុខវិជ្ជា (第二课时：正反问句转换实战与造句练习)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ៣ នាក់ឡើងអានទម្រង់ល្បះទាំង ៦ នៃមេរៀនទី១១ ដោយមិនមើលសៀវភៅ',
            lessonContent: 'រំលឹកទម្រង់ល្បះទាំង ៦ នៃមេរៀនទី១១',
            studentActivity: 'សិស្សឡើងអានទម្រង់ល្បះដោយទំនុកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. ដឹកនាំសិស្សធ្វើលំហាត់បំប្លែងល្បះពី «... 吗？» ទៅជា «A不A？» លើក្តារខៀន\n   • 汉语难吗？ ➔ 汉语难不难？\n   • 作业多吗？ ➔ 作业多不多？\n   • 历史课有意思吗？ ➔ 历史课有没有意思？\n២. ណែនាំសិស្សឱ្យអនុវត្តរៀបពាក្យជាល្បះ\n៣. ដាក់លំហាត់ឱ្យសិស្សសរសេរប្រយោគវាយតម្លៃមុខវិជ្ជារបស់ខ្លួន',
            lessonContent:
              '一. 句型转换练习 (ការកែប្រែទម្រង់ល្បះ) ៖\n1. 汉语难吗？ ➔ 汉语难不难？\n2. 今天的作业多吗？ ➔ 今天的作业多不多？\n3. 地理课有意思吗？ ➔ 地理课有没有意思？\n4. 考试容易吗？ ➔ 考试容易不容易？\n\n二. 连词成句练习 (ការរៀបពាក្យជាល្បះ) ៖\n1. 难不难 / 汉语 / ？ ➔ 汉语难不难？\n2. 很 / 有意思 / 汉语课 / 。 ➔ 汉语课很有意思。\n3. 今天 / 多不多 / 作业 / ？ ➔ 今天作业多不多？\n4. 不容易 / 数学作业 / 。 ➔ 数学作业不容易。',
            studentActivity: 'សិស្សឡើងក្តារខៀនរៀបពាក្យជាល្បះ បំប្លែងប្រយោគសំណួរ និងកត់ត្រាចូលសៀវភៅលំហាត់។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ឱ្យសិស្សម្នាក់ៗនិយាយប្រាប់មិត្តរួមថ្នាក់ពីមុខវិជ្ជាដែលខ្លួនគិតថា «很容易» ឬ «很有意思»',
            lessonContent: 'ពង្រឹងសមត្ថភាពបញ្ចេញមតិយោបល់លើមុខវិជ្ជា',
            studentActivity: 'សិស្សលើកដៃអនុវត្តនិយាយជាភាសាចិនដោយរលូន',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះចម្លង ៥ដង និងត្រៀមរៀនផ្នែកសន្ទនានៅសប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 抄写6个句型各5遍 — ចម្លងទម្រង់ល្បះទាំង ៦ ក្នុង១ល្បះ ៥ដង ព្រមទាំងភីនអ៊ីន និងបកប្រែ។ ត្រៀមរៀនផ្នែកសន្ទនាសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week20-hard-dialogues',
    linkedCurriculumId: 'cur-20',
    dateWeekday: 'ចន្ទ',
    dateDay: '១៥',
    dateMonth: 'មីនា',
    dateYear: '២០២៧',
    isoDate: '2027-03-15',
    chapterTitle: '第四单元 学习生活 · ជំពូកទី៤ ជីវិតសិក្សា',
    lessonTitle: '第十一课 汉语难不难 · មេរៀនទី១១ ភាសាចិនពិបាកឬទេ？ (对话 · 这一周只上对话)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៧៣ (សៀវភៅពុម្ព 对话)',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សយល់ដឹងយ៉ាងច្បាស់លាស់នូវអត្ថន័យ និងបរិបទប្រើប្រាស់នៃការសន្ទនា និងអត្ថបទខ្លីក្នុងមេរៀនទី១១ ៖ 对话1 (A: 我今天上了汉语课。 B: 汉语难不难？ A: 汉语不难，汉语课很有意思。 B: 中学的科目多不多？ A: 中学的科目很多。 B: 你喜欢什么课？ A: 我喜欢汉语课和地理课。) និង 短文2 (我是Ann，我是学生。我今天上了汉语课和数学课。汉语课很有意思，数学课也很有意思。汉语作业很容易，数学作业不容易。我弟弟喜欢历史课，他的历史成绩很好。他不喜欢地理课，他说地理没意思。)。',
    skillObjective:
      'សិស្សចេះអានសន្ទនា និងអត្ថបទដោយរលូន ត្រឹមត្រូវតាមសូរសំឡេងភីនអ៊ីន មានទឹកដមសំនៀងធម្មជាតិ ចេះចាប់ដៃគូសន្ទនាសាកសួរមុខវិជ្ជា និងភាពលំបាកងាយ ព្រមទាំងចេះសរសេរចម្លងអត្ថបទសន្ទនាបានយ៉ាងស្អាត។',
    attitudeObjective:
      'សិស្សចូលរួមសកម្មភាពសន្ទនាជាដៃគូដោយភាពជឿជាក់ រីករាយក្នុងការប្រើប្រាស់ភាសាចិនក្នុងការប្រាស្រ័យទាក់ទង និងមានទឹកចិត្តស្រឡាញ់ការរៀនសូត្រគ្រប់មុខវិជ្ជា។',
    teachingMaterialsTeacher:
      'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណសន្ទនា រូបភាព Ann និងប្អូនប្រុសរៀនមុខវិជ្ជាផ្សេងៗ ក្តារខៀន',
    teachingMaterialsStudent:
      'សៀវភៅគោលសម្រាប់សិស្ស (快乐汉语 第二册) សៀវភៅកត់ត្រា ប៊ិច',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — រៀនសន្ទនាទី១ និងអត្ថបទទី២ ក្នុងមេរៀនទី១១ (第一课时：学习第十一课对话一与短文二)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួររំលឹកទម្រង់ល្បះទាំង ៦ នៃសប្តាហ៍មុន (汉语难不难？ 今天作业多不多？...)',
            lessonContent: 'រំលឹកទម្រង់ល្បះទាំង ៦ ដើម្បីត្រៀមរៀនការសន្ទនាជាក់ស្តែង',
            studentActivity: 'សិស្សលើកដៃឆ្លើយ និងអានទម្រង់ល្បះឱ្យគ្រូស្តាប់',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第四单元 学习生活 · 第十一课 汉语难不难？ (对话 · 这一周只上对话)» លើក្តារខៀន\n២. បង្រៀន និងដឹកនាំសិស្សអាន 对话一 ៖\n   A: 我今天上了汉语课。 (ថ្ងៃនេះខ្ញុំបានរៀនមុខវិជ្ជាភាសាចិន។)\n   B: 汉语难不难？ (តើភាសាចិនពិបាកឬទេ?)\n   A: 汉语不难，汉语课很有意思。 (ភាសាចិនមិនពិបាកទេ ម៉ោងរៀនភាសាចិនគួរឱ្យចាប់អារម្មណ៍ណាស់។)\n   B: 中学的科目多不多？ (តើមុខវិជ្ជានៅអនុវិទ្យាល័យច្រើនឬទេ?)\n   A: 中学的科目很多。 (មុខវិជ្ជានៅអនុវិទ្យាល័យច្រើនណាស់។)\n   B: 你喜欢什么课？ (តើអ្នកចូលចិត្តមុខវិជ្ជាអ្វីខ្លះ?)\n   A: 我喜欢汉语课和地理课。 (ខ្ញុំចូលចិត្តមុខវិជ្ជាភាសាចិន និងភូមិវិទ្យា។)\n៣. បង្រៀន និងដឹកនាំសិស្សអាន 短文二 ៖\n   我是Ann，我是学生。我今天上了汉语课和数学课。汉语课很有意思，数学课也很有意思。汉语作业很容易，数学作业不容易。我弟弟喜欢历史课，他的历史成绩很好。他不喜欢地理课，他说地理没意思。\n   (ខ្ញុំឈ្មោះ Ann ខ្ញុំជាសិស្ស។ ថ្ងៃនេះខ្ញុំបានរៀនមុខវិជ្ជាភាសាចិន និងគណិតវិទ្យា។ ម៉ោងរៀនភាសាចិនគួរឱ្យចាប់អារម្មណ៍ណាស់ ហើយម៉ោងរៀនគណិតវិទ្យាក៏គួរឱ្យចាប់អារម្មណ៍ណាស់ដែរ។ កិច្ចការផ្ទះភាសាចិនងាយស្រួលណាស់ ប៉ុន្តែកិច្ចការផ្ទះគណិតវិទ្យាមិនងាយស្រួលទេ។ ប្អូនប្រុសរបស់ខ្ញុំចូលចិត្តម៉ោងរៀនប្រវត្តិវិទ្យា លទ្ធផលពិន្ទុប្រវត្តិវិទ្យារបស់គាត់ល្អណាស់។ គាត់មិនចូលចិត្តម៉ោងរៀនភូមិវិទ្យាទេ គាត់ថារៀនភូមិវិទ្យាគ្មានន័យ/មិនគួរឱ្យចាប់អារម្មណ៍។)\n៤. បែងចែកតួអង្គ A និង B ឱ្យសិស្សអនុវត្តសន្ទនាជាដៃគូ\n៥. កែតម្រង់ការបញ្ចេញសំឡេង និងទឹកដមសំនៀង',
            lessonContent:
              '第四单元 学习生活 · 第十一课 汉语难不难？ (对话 · 这一周只上对话)\n\n一. 对话一 (សន្ទនាទី១ ៖ សាកសួរពីការរៀនភាសាចិន និងមុខវិជ្ជា) ៖\nA: 我今天上了汉语课。 (Wǒ jīntiān shàng le hànyǔ kè.)\n   [បកប្រែ] ៖ ថ្ងៃនេះខ្ញុំបានរៀនមុខវិជ្ជាភាសាចិន។\nB: 汉语难不难？ (Hànyǔ nán bù nán?)\n   [បកប្រែ] ៖ តើភាសាចិនពិបាកឬទេ?\nA: 汉语不难，汉语课很有意思。 (Hànyǔ bù nán, hànyǔ kè hěn yǒu yìsi.)\n   [បកប្រែ] ៖ ភាសាចិនមិនពិបាកទេ ម៉ោងរៀនភាសាចិនគួរឱ្យចាប់អារម្មណ៍ណាស់។\nB: 中学的科目多不多？ (Zhōngxué de kēmù duō bù duō?)\n   [បកប្រែ] ៖ តើមុខវិជ្ជានៅអនុវិទ្យាល័យច្រើនឬទេ?\nA: 中学的科目很多。 (Zhōngxué de kēmù hěn duō.)\n   [បកប្រែ] ៖ មុខវិជ្ជានៅអនុវិទ្យាល័យច្រើនណាស់។\nB: 你喜欢什么课？ (Nǐ xǐhuan shénme kè?)\n   [បកប្រែ] ៖ តើអ្នកចូលចិត្តមុខវិជ្ជាអ្វីខ្លះ?\nA: 我喜欢汉语课和地理课。 (Wǒ xǐhuan hànyǔ kè hé dìlǐ kè.)\n   [បកប្រែ] ៖ ខ្ញុំចូលចិត្តមុខវិជ្ជាភាសាចិន និងភូមិវិទ្យា។\n\n二. 短文二 (អត្ថបទខ្លីទី២ ៖ ជីវិតសិក្សារបស់ Ann និងប្អូនប្រុស) ៖\n我是Ann，我是学生。我今天上了汉语课和数学课。汉语课很有意思，数学课也很有意思。汉语作业很容易，数学作业不容易。我弟弟喜欢历史课，他的历史成绩很好。他不喜欢地理课，他说地理没意思。\n(Wǒ shì Ann, wǒ shì xuésheng. Wǒ jīntiān shàng le hànyǔ kè hé shùxué kè. Hànyǔ kè hěn yǒu yìsi, shùxué kè yě hěn yǒu yìsi. Hànyǔ zuòyè hěn róngyì, shùxué zuòyè bù róngyì. Wǒ dìdi xǐhuan lìshǐ kè, tā de lìshǐ chéngjì hěn hǎo. Tā bù xǐhuan dìlǐ kè, tā shuō dìlǐ méi yìsi.)\n[បកប្រែ] ៖ ខ្ញុំឈ្មោះ Ann ខ្ញុំជាសិស្ស។ ថ្ងៃនេះខ្ញុំបានរៀនមុខវិជ្ជាភាសាចិន និងគណិតវិទ្យា។ ម៉ោងរៀនភាសាចិនគួរឱ្យចាប់អារម្មណ៍ណាស់ ហើយម៉ោងរៀនគណិតវិទ្យាក៏គួរឱ្យចាប់អារម្មណ៍ណាស់ដែរ។ កិច្ចការផ្ទះភាសាចិនងាយស្រួលណាស់ ប៉ុន្តែកិច្ចការផ្ទះគណិតវិទ្យាមិនងាយស្រួលទេ។ ប្អូនប្រុសរបស់ខ្ញុំចូលចិត្តម៉ោងរៀនប្រវត្តិវិទ្យា លទ្ធផលពិន្ទុប្រវត្តិវិទ្យារបស់គាត់ល្អណាស់។ គាត់មិនចូលចិត្តម៉ោងរៀនភូមិវិទ្យាទេ គាត់ថារៀនភូមិវិទ្យាគ្មានន័យ/មិនគួរឱ្យចាប់អារម្មណ៍។\n\n三. 语言点解析 (ការពន្យល់ចំណុចភាសា) ៖\n• 询问科目与难易 ៖ 汉语难不难？ / 中学的科目多不多？\n• 学习评价与成绩 ៖ 很容易 / 不容易 / 成绩很好 / 没意思',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ស្តាប់គ្រូពន្យល់ អានតាមគ្រូជាក្រុមនិងម្នាក់ៗ ចាប់ដៃគូឡើងសម្តែងសន្ទនា A-B និងចម្លងសន្ទនាទី១ និងអត្ថបទខ្លីទី២ ចូលសៀវភៅកត់ត្រាឱ្យបានស្អាត។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'ហៅគូសិស្ស ២–៣ គូឡើងមុខថ្នាក់ សម្តែងការសន្ទនាសាកសួរមុខវិជ្ជា និងភាពលំបាកងាយដោយមិនមើលសៀវភៅ',
            lessonContent: 'ពង្រឹងភាពស្ទាត់ជំនាញក្នុងការសន្ទនាជាក់ស្តែង (会对话 会演练 会熟练表达)',
            studentActivity: 'គូសិស្សឡើងមុខថ្នាក់សម្តែងសន្ទនាដោយភាពរស់រវើក មិត្តរួមថ្នាក់ទះដៃលើកទឹកចិត្ត',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់កិច្ចការផ្ទះឱ្យសិស្សចម្លងសន្ទនាទី១ និងអត្ថបទខ្លីទី២ ចំនួន ២ដង\n២. ណែនាំឱ្យសិស្សទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ចូរប្អូនៗចម្លង 对话1 និង 短文2 ក្នុងមេរៀនទី១១ ចូលសៀវភៅ ចំនួន ២ដង (抄写对话1和短文2各2遍) ព្រមទាំងភីនអ៊ីន និងបកប្រែខ្មែរ រួចទន្ទេញសន្ទនាទី១ ឱ្យចាំមាត់ ប្រគល់នៅសប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — សកម្មភាពសន្ទនាវាយតម្លៃមុខវិជ្ជា និងណែនាំលទ្ធផលសិក្សា (第二课时：科目评价情境演练与学业交流)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសណ្តាប់ធ្នាប់សិស្សក្នុងថ្នាក់',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សរៀបចំសៀវភៅ ប៊ិច និងត្រៀមរៀន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'ហៅសិស្ស ២ នាក់ឡើងទន្ទេញសន្ទនាទី១ ឱ្យមិត្តរួមថ្នាក់ស្តាប់',
            lessonContent: 'រំលឹកសន្ទនាទី១ និងអត្ថបទខ្លីទី២ នៃមេរៀនទី១១',
            studentActivity: 'សិស្សឡើងទន្ទេញសន្ទនាដោយភាពជឿជាក់',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. រៀបចំសកម្មភាពសាកសួរចំណាប់អារម្មណ៍ និងការវាយតម្លៃមុខវិជ្ជារបស់មិត្តរួមថ្នាក់\n២. ឱ្យសិស្សអនុវត្តសួរនាំមិត្តភក្តិ ៖ «你觉得数学课难不难？», «汉语作业容易不容易？», «你喜欢什么科目？»\n៣. ណែនាំសិស្សឱ្យហាត់សរសេរកថាខណ្ឌខ្លីពណ៌នាពីជីវិតសិក្សារបស់ខ្លួនឯង តាមគំរូអត្ថបទរបស់ Ann',
            lessonContent:
              '一. 科目评价交流演练 (សកម្មភាពប្រាស្រ័យទាក់ទងវាយតម្លៃមុខវិជ្ជា) ៖\n• A: 你今天上了什么课？\n• B: 我今天上了汉语课和历史课。\n• A: 汉语作业难不难？\n• B: 汉语作业不难，很容易。\n• A: 你的历史成绩好不好？\n• B: 我的历史成绩很好。\n\n二. 我的学习短文仿写 (តែងកថាខណ្ឌខ្លីពណ៌នាពីខ្លួនឯង) ៖\n我是李明，我是中学学生。中学的科目很多。我喜欢汉语课和地理课，汉语课很有意思。我的汉语成绩很好。',
            studentActivity: 'សិស្សចូលរួមសកម្មភាពសន្ទនា អនុវត្តនិយាយជាភាសាចិន និងសរសេរកថាខណ្ឌខ្លីពណ៌នាពីការសិក្សារបស់ខ្លួន។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'វាយតម្លៃការបញ្ចេញសំឡេង និងភាពរលូននៃការសន្ទនារបស់ក្រុមនីមួយៗ',
            lessonContent: 'ពង្រឹងទំនុកចិត្តក្នុងការប្រើប្រាស់ភាសាចិនប្រាស្រ័យទាក់ទង',
            studentActivity: 'សិស្សស្តាប់ការកែលម្អរបស់គ្រូ និងកែតម្រង់ការបញ្ចេញសំឡេង',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: 'រំលឹកកិច្ចការផ្ទះ និងណែនាំឱ្យត្រៀមសៀវភៅពុម្ព និងសៀវភៅលំហាត់សម្រាប់សប្តាហ៍ក្រោយ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 抄写对话1和短文2各2遍并背诵对话1 — ចម្លងសន្ទនាទី១ និងអត្ថបទខ្លីទី២ ចំនួន ២ដង និងទន្ទេញឱ្យចាំមាត់។ ត្រៀមធ្វើលំហាត់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់សប្តាហ៍ក្រោយ។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-week21-hard-exercises',
    linkedCurriculumId: 'cur-21',
    dateWeekday: 'ចន្ទ',
    dateDay: '២២',
    dateMonth: 'មីនា',
    dateYear: '២០២៧',
    isoDate: '2027-03-22',
    chapterTitle: '第四单元 学习生活 · ជំពូកទី៤ ជីវិតសិក្សា',
    lessonTitle: '第十一课 汉语难不难 · មេរៀនទី១១ ភាសាចិនពិបាកឬទេ？ (综合练习 · 课本72-75页 & 练习册80-84页)',
    durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'សៀវភៅពុម្ព ទំព័រ ៧២-៧៥ និង សៀវភៅលំហាត់ ទំព័រ ៨០-៨៤',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សក្តាប់បានយ៉ាងរឹងមាំនូវចំណេះដឹងទាំងអស់នៃមេរៀនទី១១ រួមមាន ពាក្យថ្មីទាំង ១០ ពាក្យ ទម្រង់ល្បះ正反疑问句ទាំង ៦ និងអត្ថបទសន្ទនា ព្រមទាំងចេះអនុវត្តធ្វើលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព (ទំព័រ ៧២-៧៥) និងសៀវភៅលំហាត់ (ទំព័រ ៨០-៨៤) បានត្រឹមត្រូវគ្រប់ជ្រុងជ្រោយ។',
    skillObjective:
      'សិស្សមានជំនាញច្បាស់លាស់លើការស្តាប់ការសន្ទនាវាយតម្លៃការសិក្សា ការអាន ការសរសេរអក្សរចិន ការកែប្រែប្រយោគស្រប-បដិសេធ ការផ្គូផ្គងពាក្យផ្ទុយ ការបកប្រែ និងការឆ្លើយសំណួរក្នុងលំហាត់សៀវភៅពុម្ព (第72-75页) និងសៀវភៅលំហាត់ (第80-84页)។',
    attitudeObjective:
      'សិស្សមានស្មារតីទទួលខុសត្រូវខ្ពស់ យកចិត្តទុកដាក់បំពេញកិច្ចការគ្រប់លំហាត់ឱ្យបានពេញលេញ ស្អាតបាត និងទាន់ពេលវេលា។',
    teachingMaterialsTeacher:
      'សៀវភៅពុម្ព (ទំព័រ ៧២-៧៥) សៀវភៅលំហាត់ (ទំព័រ ៨០-៨៤) សៀវភៅគ្រូ កិច្ចតែងការបង្រៀន ក្តារខៀន ឯកសារចម្លើយគំរូ',
    teachingMaterialsStudent:
      'សៀវភៅពុម្ព (第72-75页) សៀវភៅលំហាត់ (第80-84页) ប៊ិច ខ្មៅដៃ បន្ទាត់',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — បំពេញលំហាត់សៀវភៅពុម្ព ទំព័រ ៧២-៧៥ (第一课时：完成课本第72页-75页练习)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ស្វាគមន៍សិស្សក្នុងថ្នាក់រៀន\n២. ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ ឯកសណ្ឋាន និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ បង្កើតបរិយាកាសរីករាយ និងពិនិត្យវត្តមានសិស្ស',
            studentActivity: 'សិស្សក្រោកឈរជម្រាបសួរគ្រូ ស្លៀកពាក់ត្រឹមត្រូវ អង្គុយត្រង់ ប្រធានថ្នាក់រាយការណ៍វត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'រំលឹកសង្ខេបពាក្យថ្មី ទម្រង់ល្បះ និងសន្ទនាក្នុងមេរៀនទី១១',
            lessonContent: 'រំលឹកចំណេះដឹងគន្លឹះនៃមេរៀនទី១១ មុនចាប់ផ្តើមធ្វើលំហាត់សៀវភៅពុម្ព',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ និងត្រៀមបើកសៀវភៅពុម្ពទំព័រ ៧២',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើង «第四单元 学习生活 · 第十一课 汉语难不难？ (综合练习 · 课本第72页-75页)» លើក្តារខៀន\n២. ណែនាំសិស្សធ្វើលំហាត់ក្នុងសៀវភៅពុម្ពម្តងមួយទំព័រ ៖\n   • ទំព័រ ៧២ ៖ 听录音选出正确评价 (ស្តាប់សំឡេង និងជ្រើសរើសចម្លើយវាយតម្លៃត្រឹមត្រូវ ៖ 难/容易, 多/不多)\n   • ទំព័រ ៧៣ ៖ 读课文连线与问答 (អានអត្ថបទ គូសផ្គូផ្គង និងឆ្លើយសំណួរអំពី Ann និងប្អូនប្រុស)\n   • ទំព័រ ៧៤ ៖ 看图用正反问句造句 (សង្កេតរូបភាព និងបង្កើតសំណួរស្រប-បដិសេធ «A不A»)\n   • ទំព័រ ៧៥ ៖ 课堂交际调查活动 (សកម្មភាពស្ទង់មតិក្នុងថ្នាក់រៀនអំពីមុខវិជ្ជា និងលទ្ធផលសិក្សា)\n៣. ដើរមើល ជួយណែនាំ និងកែតម្រង់សិស្សដែលជួបការលំបាក\n៤. កែសម្រួលចម្លើយត្រឹមត្រូវរួមគ្នានៅលើក្តារខៀន',
            lessonContent:
              '第四单元 学习生活 · 第十一课 汉语难不难？ (综合练习 · 课本第72页-75页)\n\n一. 课本第72-73页练习 (សៀវភៅពុម្ព ទំព័រ ៧២-៧៣) ៖\n• 听音选评 (ស្តាប់សំឡេង និងជ្រើសរើស ៖ 难 / 容易 / 很有意思 / 没意思)\n• 课文连线 (គូសផ្គូផ្គងតាមអត្ថបទ) ៖\n  1. 汉语课 ➔ 很有意思\n  2. 汉语作业 ➔ 很容易\n  3. 数学作业 ➔ 不容易\n  4. 历史成绩 ➔ 很好\n  5. 地理课 ➔ 没意思\n\n二. 课本第74-75页练习 (សៀវភៅពុម្ព ទំព័រ ៧៤-៧៥) ៖\n• 看图用正反问句提问与回答 ៖\n  1. 问 ៖ 这个考试难不难？ ➔ 答 ៖ 这个考试不难。\n  2. 问 ៖ 中学的科目多不多？ ➔ 答 ៖ 中学的科目很多。\n• 课堂交际调查 ៖ 采访同伴最喜欢的科目与期中考试准备情况。',
            studentActivity:
              'សិស្សផ្ចង់អារម្មណ៍ធ្វើលំហាត់ក្នុងសៀវភៅពុម្ពទំព័រ ៧២-៧៥ ដោយយកចិត្តទុកដាក់ លើកដៃសួរគ្រូពេលមិនយល់ ឡើងក្តារខៀនសរសេរចម្លើយ និងកត់ត្រាកែតម្រង់ចូលសៀវភៅ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'សង្ខេបចម្លើយសំខាន់ៗនៃទំព័រ ៧២-៧៥ និងឱ្យសិស្សផ្ទៀងផ្ទាត់ឡើងវិញឱ្យបានត្រឹមត្រូវ ១០០%',
            lessonContent: 'ផ្ទៀងផ្ទាត់ និងពង្រឹងចម្លើយលំហាត់សៀវភៅពុម្ព (订正课本练习 确保全对)',
            studentActivity: 'សិស្សផ្ទៀងផ្ទាត់ចម្លើយ និងកែសម្រួលចំណុចខ្វះខាត',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ដាក់ភារកិច្ចឱ្យសិស្សបន្តធ្វើលំហាត់ក្នុងសៀវភៅលំហាត់ ទំព័រ ៨០ ដល់ ៨៤\n២. ត្រៀមកែសម្រួល និងបូកសរុបពិន្ទុមេរៀនទី១១',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ ប្អូនៗត្រូវបំពេញលំហាត់ទាំងអស់ក្នុងសៀវភៅលំហាត់ (练习册) ពីទំព័រ ៨០ ដល់ ៨៤ (第80页到84页) ឱ្យបានគ្រប់ជ្រុងជ្រោយ ដើម្បីត្រៀមផ្ទៀងផ្ទាត់ និងកែសម្រួលនៅម៉ោងបន្ទាប់។',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះចូលក្នុងសៀវភៅ និងស្តាប់ការណែនាំរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ — បំពេញ និងកែសម្រួលសៀវភៅលំហាត់ ទំព័រ ៨០-៨៤ (第二课时：全完成并订正练习册第80页到84页)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: 'ត្រួតពិនិត្យវត្តមាន អនាម័យ និងសៀវភៅលំហាត់របស់សិស្សគ្រប់គ្នា',
            lessonContent: 'ពង្រឹងវិន័យ និងត្រួតពិនិត្យការយកសៀវភៅលំហាត់មកថ្នាក់',
            studentActivity: 'សិស្សដាក់សៀវភៅលំហាត់លើតុ និងត្រៀមកែសម្រួល',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
            teacherActivity: 'សួរសំណួរពិនិត្យលំហាត់សៀវភៅពុម្ពទំព័រ ៧២-៧៥ ដែលបានធ្វើរួច',
            lessonContent: 'រំលឹកឡើងវិញនូវលំហាត់សៀវភៅពុម្ព',
            studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              '១. ដឹកនាំសិស្សធ្វើ និងកែសម្រួលលំហាត់ក្នុងសៀវភៅលំហាត់第80页到84页 ៖\n   • 第80-81页 ៖ 汉字描红与规范书写 (ហាត់សរសេរអក្សរចិន 难, 业, 意, 思, 科, 目, 容, 易, 成, 绩, 考, 试)\n   • 第82页 ៖ 看拼音写词语与选词填空 (មើលភីនអ៊ីនសរសេរពាក្យចិន និងបំពេញចន្លោះល្បះ)\n   • 第83页 ៖ 连词成句与正反疑问句专项训练 (រៀបពាក្យជាល្បះ និងកែប្រែប្រយោគ «A不A»)\n   • 第84页 ៖ 汉柬互译与阅读理解综合测试 (ការបកប្រែ ចិន-ខ្មែរ និងតេស្តអានយល់អត្ថបទមេរៀនទី១១)\n២. ហៅសិស្សឡើងក្តារខៀនសរសេរចម្លើយលំហាត់នីមួយៗ\n៣. ពន្យល់ចំណុចដែលសិស្សឧស្សាហ៍ច្រឡំ និងកែតម្រូវរួមគ្នា',
            lessonContent:
              '一. 练习册第80页到84页核心练习解析 (ការពន្យល់លំហាត់សៀវភៅលំហាត់ ទំព័រ ៨០-៨៤) ៖\n1. 汉字书写 (第80-81页) ៖ 掌握正确笔顺，规范书写生词汉字。\n2. 选词填空 (第82页) ៖\n   • 汉语 (不难) ，汉语课很有意思。\n   • 今天的作业 (多不多) ？\n   • 我弟弟的数学 (成绩) 很好。\n   • 周末我有 (空儿) ，想去看电影。\n3. 连词成句 (第83页) ៖\n   • 难不难 / 汉语 / ？ ➔ 汉语难不难？\n   • 很有意思 / 汉语课 / 。 ➔ 汉语课很有意思。\n   • 很容易 / 汉语作业 / 。 ➔ 汉语作业很容易。\n   • 科目 / 中学的 / 很多 / 。 ➔ 中学的科目很多。\n4. 综合阅读与测试 (第84页) ៖ 阅读Ann的学习短文，准确回答Ann喜欢什么课、哪门作业不容易与弟弟的成绩。',
            studentActivity: 'សិស្សផ្ទៀងផ្ទាត់ចម្លើយក្នុងសៀវភៅលំហាត់ទំព័រ ៨០-៨៤ កែសម្រួលចំណុចខុសដោយប៊ិចក្រហម និងកត់ត្រាចម្លើយត្រឹមត្រូវចូលសៀវភៅ។',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១០នាទី)',
            teacherActivity: 'សង្ខេប និងវាយតម្លៃលទ្ធផលការរៀនមេរៀនទី១១ ទាំងមូល (生词、句型、对话、练习) ដោយលើកសរសើរសិស្សដែលខិតខំប្រឹងប្រែង',
            lessonContent: 'សង្ខេប និងវាយតម្លៃបញ្ចប់មេរៀនទី១១ ទាំងមូល (第十一课全课总结与学习评价)',
            studentActivity: 'សិស្សស្តាប់ការសង្ខេបរបស់គ្រូ និងឆ្លើយសំណួរបូកសរុបមេរៀន',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (៥នាទី)',
            teacherActivity: '១. ណែនាំឱ្យសិស្សកែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់ឱ្យបានពេញលេញ ១០០%\n២. ណែនាំឱ្យអានរំលឹកមេរៀនទី១១ ឡើងវិញនៅផ្ទះ',
            lessonContent: '作业 (កិច្ចការផ្ទះ)៖ 完整订正课本第72-75页与练习册第80-84页的所有练习，复习第十一课生词、句型与对话。(កែសម្រួលលំហាត់ទាំងអស់ក្នុងសៀវភៅពុម្ព និងសៀវភៅលំហាត់ឱ្យបានពេញលេញ និងត្រឹមត្រូវ ១០០% ព្រមទាំងរំលឹកឡើងវិញនូវមេរៀនទី១១ ទាំងមូល)',
            studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ និងស្តាប់ការផ្តាំផ្ញើរបស់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-1',
    chapterTitle: 'ជំពូកទី១ ខ្ញុំ និង អ្នក (第一单元 你和我)',
    lessonTitle: 'មេរៀនទី១ សួស្តី (第一课 你好)',
    durationLabel: '៤ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី១ ដល់ ទំព័រទី៣',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សប្រើប្រាស់ត្រឹមត្រូវក្នុងការប្រាស្រ័យទាក់ទងគ្នាជាភាសាចិនដូចជា “你好! សួស្តី!”, “你好吗？ តើអ្នកសុខសប្បាយជាទេ?”, “我很好。 ខ្ញុំសុខសប្បាយជាទេ។” តាមរយៈការហ្វឹកហាត់ជាបុគ្គល និងដៃគូ។',
    skillObjective:
      'សិស្សមានសមត្ថភាពក្នុងការប្រាស្រ័យទាក់ទងគ្នាជាភាសាចិន ហាត់សរសេរគំនូសអក្សរចិន 你 (7 画), 很 (9 画), 好 (6 画) និងស្រៈ សំឡេងទាំង៤របស់ភីនអ៊ីន (a, o, e)។',
    attitudeObjective:
      'សិស្សមានវិន័យល្អក្នុងការចូលរួម សហការណ៍ ក្នុងសកម្មភាពសិក្សា ដើម្បីជាផលប្រយោជន៍ក្នុងការប្រាស្រ័យទាក់ទងគ្នាក្នុងពេលអនាគត។',
    teachingMaterialsTeacher: 'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណអក្សររូបភាព',
    teachingMaterialsStudent: 'សៀវភៅគោលសម្រាប់សិស្ស សៀវភៅលំហាត់',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ — ១. ទម្រង់ល្បះ (句型)',
        steps: [
          {
            stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
            teacherActivity: '១. ត្រួតពិនិត្យអនាម័យ សំលៀកបំពាក់ និងវត្តមានសិស្ស',
            lessonContent: 'ពង្រឹងវិន័យ សណ្តាប់ធ្នាប់ និងពិនិត្យអវត្តមានសិស្ស',
            studentActivity: 'ស្លៀកពាក់ឯកសណ្ឋាន អង្គុយឱ្យត្រង់ ប្រធានថ្នាក់រាយការណ៍អវត្តមាន',
          },
          {
            stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (០នាទី)',
            teacherActivity: 'គ្មាន (មេរៀនដំបូង)',
            lessonContent: 'គ្មាន',
            studentActivity: 'គ្មាន',
          },
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៧៥នាទី)',
            teacherActivity:
              '១. សរសេរចំណងជើងដាក់លើក្តារខៀន រួចអានឱ្យសិស្សស្តាប់\n២. បង្ហាញរូបទី១ និងទី២ ណែនាំល្បះ “你好!”, “你好吗？”, “我很好。”\n៣. ហៅសិស្សឡើងអានម្នាក់ម្ដងៗ និងចាប់គូហ្វឹកហាត់សន្ទនា',
            lessonContent:
              '第一单元 你和我 · 第一课 你好\n一. 句型 ទម្រង់ល្បះ៖\n1. 你好 (nǐhǎo)! សួស្តី!\n2. 你好吗 (nǐhǎoma)? តើអ្នកសុខសប្បាយជាទេ?\n3. 我很好 (wǒhěnhǎo)。 ខ្ញុំសុខសប្បាយជាទេ។',
            studentActivity:
              'សិស្សសង្កេត ស្តាប់គ្រូអាន អានតាមគ្រូ ចាប់គូឡើងសន្ទនា និងចម្លងមេរៀនចូលសៀវភៅ',
          },
          {
            stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (៥នាទី)',
            teacherActivity: 'គ្រូសួរជាភាសាខ្មែរ៖ “តើសួស្តី, តើអ្នកសុខសប្បាយជាទេ?, ខ្ញុំសុខសប្បាយជាទេ។ ជាភាសាចិននិយាយម៉េច?”',
            lessonContent: '你好！ / 你好吗？ / 我很好。',
            studentActivity: 'សិស្សទាំងអស់គ្នាឆ្លើយសំណួររបស់គ្រូជាភាសាចិន',
          },
          {
            stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ (៥នាទី)',
            teacherActivity: 'ឱ្យសិស្សកត់ចំណងជើងកិច្ចការផ្ទះ និងរំលឹកមេរៀនពេលត្រលប់ទៅផ្ទះវិញ',
            lessonContent: '作业 កិច្ចការផ្ទះ៖ ចូរប្អូនសរសេរទម្រង់ល្បះ អក្សរចិន ភីនអ៊ីន ព្រមទាំងបកប្រែ ក្នុងមួយល្បះ ៥ដង។',
            studentActivity: 'សិស្សចម្លងកិច្ចការផ្ទះ និងស្តាប់គ្រូដោយយកចិត្តទុកដាក់',
          },
        ],
      },
      {
        sessionTitle: 'ម៉ោងសិក្សាទី២ & ទី៣ — ២. ពាក្យថ្មី (生词) & ៣. គំនូសអក្សរចិន (笔画笔顺)',
        steps: [
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              'ណែនាំពាក្យថ្មី 你, 好, 吗, 我, 很 និងបង្ហាញរបៀបសរសេរគំនូសអក្សរចិន 你 (7 画), 很 (9 画), 好 (6 画)',
            lessonContent:
              '二. 生词 ពាក្យថ្មី៖ 1.你 (អ្នក) 2.好 (ល្អ) 3.吗 (ឬទេ?) 4.我 (ខ្ញុំ) 5.很 (ណាស់)\n三. 笔画笔顺 គំនូស និងចំនួនគំនូសអក្សរចិន៖ 你 (7 画), 很 (9 画), 好 (6 画)',
            studentActivity:
              'សិស្សរាប់ចំនួនគំនូសតាមគ្រូ យកដៃចង្អុលគូសវាសតាមគំនូសអក្សរ និងហាត់សរសេរក្នុងសៀវភៅលំហាត់',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-2',
    chapterTitle: 'ជំពូកទី១ ខ្ញុំ និង អ្នក (第一单元 你和我)',
    lessonTitle: 'មេរៀនទី២ តើអ្នកឈ្មោះអ្វី (第二课 你叫什么)',
    durationLabel: '៤ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៤ ដល់ ទំព័រទី៧',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សប្រើប្រាស់ត្រឹមត្រូវក្នុងការប្រាស្រ័យទាក់ទងគ្នាជាភាសាចិនដូចជា “你叫什么？ តើអ្នកឈ្មោះអ្វី?”, “我叫李小龙。 ខ្ញុំឈ្មោះលី សៀវឡុង។”, “你是哪国人？ តើអ្នកជាជនជាតិណា?”, “我是中国人。 ខ្ញុំជាជនជាតិចិន។”',
    skillObjective:
      'សិស្សចេះអាន និងសរសេរពាក្យថ្មី 叫、什么、是、哪、国、人、中国、柬埔寨、法国 និងគំនូសអក្សរ 中 (4 画), 国 (8 画), 人 (2 画) ព្រមទាំងស្រៈ i, u, ü, y, w។',
    attitudeObjective:
      'សិស្សមានវិន័យល្អក្នុងការចូលរួម សហការណ៍ ក្នុងសកម្មភាពសិក្សា។',
    teachingMaterialsTeacher: 'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណអក្សររូបភាព',
    teachingMaterialsStudent: 'សៀវភៅគោលសម្រាប់សិស្ស សៀវភៅលំហាត់',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ & ទី២ — ពាក្យថ្មី និងទម្រង់ល្បះ',
        steps: [
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              'បង្រៀនពាក្យថ្មី និងដាក់ឈ្មោះចិនឱ្យសិស្សម្នាក់ៗ រួចឱ្យសិស្សអនុវត្តសន្ទនាសួរឈ្មោះ និងសញ្ជាតិ',
            lessonContent:
              '一. 生词៖ 1.叫 2.什么 3.是 4.哪 5.国 6.人 7.中国 8.柬埔寨 9.法国\n二. 句型៖ 1.你叫什么？ 2.我叫李小龙。 3.你是哪国人？ 4.我是柬埔寨人。',
            studentActivity: 'សិស្សរៀនអាន និងសរសេរឈ្មោះចិនរបស់ខ្លួន ព្រមទាំងអនុវត្តន៍សន្ទនាជាដៃគូ',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-3',
    chapterTitle: 'ជំពូកទី២ គ្រួសាររបស់ខ្ញុំ (第二单元 我的家)',
    lessonTitle: 'មេរៀនទី៣ តើផ្ទះអ្នកនៅឯណា (第三课 你家在哪儿)',
    durationLabel: '៤ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី៨ ដល់ ទំព័រទី១១',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សប្រើប្រាស់ត្រឹមត្រូវក្នុងការប្រាស្រ័យទាក់ទងគ្នាជាភាសាចិនដូចជា “你家在哪儿？ តើផ្ទះអ្នកនៅឯណា?”, “我家在北京。 ផ្ទះខ្ញុំនៅប៉េកាំង។”',
    skillObjective:
      'សិស្សចេះពាក្យថ្មី 家、在、哪儿、北京、上海、香港、他、金边、西港、她、它 និងគំនូសអក្សរ 我 (7 画), 在 (6 画), 北 (5 画), 京 (8 画) ព្រមទាំងព្យញ្ជនៈ b, p, m, f។',
    attitudeObjective:
      'សិស្សមានវិន័យល្អក្នុងការចូលរួម សហការណ៍ ក្នុងសកម្មភាពសិក្សា។',
    teachingMaterialsTeacher: 'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណអក្សររូបភាព',
    teachingMaterialsStudent: 'សៀវភៅគោលសម្រាប់សិស្ស សៀវភៅលំហាត់',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១–៤ — ពាក្យថ្មី ទម្រង់ល្បះ គំនូសអក្សរ និងព្យញ្ជនៈ b p m f',
        steps: [
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity:
              'បង្រៀនពាក្យទីកន្លែង (ភ្នំពេញ 金边, កំពង់សោម 西港, ប៉េកាំង 北京) និងការប្រកបព្យញ្ជនៈ b p m f ជាមួយស្រៈ a o i u',
            lessonContent:
              '一. 生词៖ 家、在、哪儿、北京、上海、香港、他、金边、西港、她、它\n二. 句型៖ 1.你家在哪儿？ 2.我家在金边。\n三. 笔画៖ 我 (7 画), 在 (6 画), 北 (5 画), 京 (8 画)',
            studentActivity: 'សិស្សអានតាមគ្រូ ចាប់គូសន្ទនា និងហាត់សរសេរអក្សរចិន',
          },
        ],
      },
    ],
  },
  {
    id: 'lp-4',
    chapterTitle: 'ជំពូកទី២ គ្រួសាររបស់ខ្ញុំ (第二单元 我的家)',
    lessonTitle: 'មេរៀនទី៤ ប៉ា ម៉ាក់ (第四课 爸爸、妈妈)',
    durationLabel: '៤ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
    pagesLabel: 'ទំព័រទី១៣ ដល់ ទំព័រទី១៧',
    textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第一册) KUAILE HANYU',
    knowledgeObjective:
      'សិស្សប្រើប្រាស់ត្រឹមត្រូវក្នុងការប្រាស្រ័យទាក់ទងគ្នាជាភាសាចិនដូចជា “这是我爸爸。 នេះគឺជាប៉ាខ្ញុំ។”, “那是我妈妈。 នោះគឺជាម៉ាក់ខ្ញុំ។”, “这是我。 នេះគឺជាខ្ញុំ។”',
    skillObjective:
      'សិស្សចេះពាក្យសមាជិកគ្រួសារ 爸爸、妈妈、哥哥、姐姐、弟弟、妹妹、叔叔、阿姨、爷爷、奶奶、不។',
    attitudeObjective:
      'សិស្សមានវិន័យល្អ និងគោរពស្រឡាញ់សមាជិកគ្រួសារ។',
    teachingMaterialsTeacher: 'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណអក្សររូបភាព',
    teachingMaterialsStudent: 'សៀវភៅគោលសម្រាប់សិស្ស សៀវភៅលំហាត់',
    sessions: [
      {
        sessionTitle: 'ម៉ោងសិក្សាទី១ & ទី២ — ពាក្យថ្មីសមាជិកគ្រួសារ និងទម្រង់ល្បះ',
        steps: [
          {
            stepTitle: 'ជំហានទី៣ ខ្លឹមសារមេរៀន (៦០នាទី)',
            teacherActivity: 'បង្ហាញរូបភាពសមាជិកគ្រួសារ និងណែនាំល្បះ 这是我爸爸 / 那是我妈妈',
            lessonContent:
              '一. 生词៖ 1.这 2.那 3.爸爸 4.妈妈 5.哥哥 6.姐姐 7.弟弟 8.妹妹 9.叔叔 10.阿姨 11.爷爷 12.奶奶 15.不\n二. 句型៖ 这是我爸爸。 / 那是我妈妈。',
            studentActivity: 'សិស្សអានពាក្យថ្មី និងណែនាំសមាជិកគ្រួសារជាភាសាចិន',
          },
        ],
      },
    ],
  },
];

// Exact Performance Agreement Data from PDF 5 (កិច្ចព្រមព្រៀងលទ្ធផលប្រចាំឆ្នាំ ២០២៥-២០២៦ របស់គ្រូបង្រៀន លឹម ដាណេ)
export const DEFAULT_PERFORMANCE_TARGETS: ClassPerformanceTarget[] = [
  {
    scopeId: 'ALL',
    labelKh: '០) សរុបរួមគ្រប់ថ្នាក់ (៨A ៨B ៨C ៩A ៩B ៩C ១០A ១០C)',
    totalStudents: 189,
    femaleStudents: 77,
    baselineGrades: {
      A: { pct: 15, count: 28 },
      B: { pct: 4, count: 9 },
      C: { pct: 6, count: 13 },
      D: { pct: 3, count: 6 },
      E: { pct: 6, count: 11 },
      F: { pct: 67, count: 123 },
    },
    targetGrades: {
      A: { pct: 15, count: 28 },
      B: { pct: 17, count: 32 },
      C: { pct: 23, count: 43 },
      D: { pct: 15, count: 28 },
      E: { pct: 23, count: 43 },
      F: { pct: 9, count: 13 },
    },
    baselineReading: {
      nonePct: 79,
      noneCount: 160,
      level1Pct: 21,
      level1Count: 29,
      level2Pct: 0,
      level2Count: 0,
    },
    targetReading: {
      nonePct: 21,
      noneCount: 40,
      level1Pct: 72,
      level1Count: 138,
      level2Pct: 7,
      level2Count: 11,
    },
    absencesOver4Target: 39,
  },
  {
    scopeId: 'G8',
    labelKh: '១) ថ្នាក់ទី៨ សរុប (៨A ៨B ៨C)',
    totalStudents: 81,
    femaleStudents: 35,
    baselineGrades: {
      A: { pct: 35, count: 28 },
      B: { pct: 8, count: 6 },
      C: { pct: 15, count: 12 },
      D: { pct: 4, count: 3 },
      E: { pct: 7, count: 6 },
      F: { pct: 31, count: 25 },
    },
    targetGrades: {
      A: { pct: 40, count: 32 },
      B: { pct: 25, count: 20 },
      C: { pct: 18, count: 15 },
      D: { pct: 11, count: 9 },
      E: { pct: 5, count: 4 },
      F: { pct: 1, count: 1 },
    },
    baselineReading: {
      nonePct: 100,
      noneCount: 81,
      level1Pct: 0,
      level1Count: 0,
      level2Pct: 0,
      level2Count: 0,
    },
    targetReading: {
      nonePct: 19,
      noneCount: 15,
      level1Pct: 75,
      level1Count: 61,
      level2Pct: 6,
      level2Count: 5,
    },
    absencesOver4Target: 14,
  },
  {
    scopeId: '8A',
    labelKh: '២) ថ្នាក់ទី ៨A',
    totalStudents: 31,
    femaleStudents: 12,
    baselineGrades: {
      A: { pct: 46, count: 14 },
      B: { pct: 17, count: 5 },
      C: { pct: 8, count: 2 },
      D: { pct: 4, count: 1 },
      E: { pct: 4, count: 1 },
      F: { pct: 21, count: 7 },
    },
    targetGrades: {
      A: { pct: 50, count: 16 },
      B: { pct: 25, count: 8 },
      C: { pct: 17, count: 5 },
      D: { pct: 8, count: 2 },
      E: { pct: 0, count: 0 },
      F: { pct: 0, count: 0 },
    },
    baselineReading: {
      nonePct: 100,
      noneCount: 24,
      level1Pct: 0,
      level1Count: 0,
      level2Pct: 0,
      level2Count: 0,
    },
    targetReading: {
      nonePct: 8,
      noneCount: 2,
      level1Pct: 83,
      level1Count: 26,
      level2Pct: 8,
      level2Count: 2,
    },
    absencesOver4Target: 2,
  },
  {
    scopeId: '8B',
    labelKh: '៣) ថ្នាក់ទី ៨B',
    totalStudents: 26,
    femaleStudents: 9,
    baselineGrades: {
      A: { pct: 35, count: 9 },
      B: { pct: 4, count: 1 },
      C: { pct: 15, count: 4 },
      D: { pct: 0, count: 0 },
      E: { pct: 12, count: 3 },
      F: { pct: 34, count: 9 },
    },
    targetGrades: {
      A: { pct: 42, count: 11 },
      B: { pct: 23, count: 6 },
      C: { pct: 15, count: 4 },
      D: { pct: 12, count: 3 },
      E: { pct: 8, count: 2 },
      F: { pct: 0, count: 0 },
    },
    baselineReading: {
      nonePct: 100,
      noneCount: 26,
      level1Pct: 0,
      level1Count: 0,
      level2Pct: 0,
      level2Count: 0,
    },
    targetReading: {
      nonePct: 27,
      noneCount: 7,
      level1Pct: 69,
      level1Count: 18,
      level2Pct: 4,
      level2Count: 1,
    },
    absencesOver4Target: 5,
  },
  {
    scopeId: '8C',
    labelKh: '៤) ថ្នាក់ទី ៨C',
    totalStudents: 26,
    femaleStudents: 14,
    baselineGrades: {
      A: { pct: 31, count: 8 },
      B: { pct: 6, count: 2 },
      C: { pct: 20, count: 5 },
      D: { pct: 6, count: 2 },
      E: { pct: 6, count: 2 },
      F: { pct: 31, count: 8 },
    },
    targetGrades: {
      A: { pct: 34, count: 9 },
      B: { pct: 26, count: 7 },
      C: { pct: 20, count: 5 },
      D: { pct: 11, count: 3 },
      E: { pct: 6, count: 2 },
      F: { pct: 3, count: 1 },
    },
    baselineReading: {
      nonePct: 100,
      noneCount: 26,
      level1Pct: 0,
      level1Count: 0,
      level2Pct: 0,
      level2Count: 0,
    },
    targetReading: {
      nonePct: 20,
      noneCount: 5,
      level1Pct: 74,
      level1Count: 19,
      level2Pct: 6,
      level2Count: 2,
    },
    absencesOver4Target: 7,
  },
  {
    scopeId: 'G9',
    labelKh: '៥) ថ្នាក់ទី៩ សរុប (៩A ៩B ៩C)',
    totalStudents: 68,
    femaleStudents: 26,
    baselineGrades: {
      A: { pct: 31, count: 21 },
      B: { pct: 6, count: 4 },
      C: { pct: 20, count: 14 },
      D: { pct: 6, count: 4 },
      E: { pct: 6, count: 4 },
      F: { pct: 31, count: 21 },
    },
    targetGrades: {
      A: { pct: 34, count: 23 },
      B: { pct: 26, count: 18 },
      C: { pct: 20, count: 14 },
      D: { pct: 11, count: 7 },
      E: { pct: 6, count: 4 },
      F: { pct: 3, count: 2 },
    },
    baselineReading: {
      nonePct: 67,
      noneCount: 46,
      level1Pct: 31,
      level1Count: 21,
      level2Pct: 0,
      level2Count: 0,
    },
    targetReading: {
      nonePct: 23,
      noneCount: 16,
      level1Pct: 69,
      level1Count: 47,
      level2Pct: 8,
      level2Count: 5,
    },
    absencesOver4Target: 13,
  },
  {
    scopeId: '9A',
    labelKh: '៦) ថ្នាក់ទី ៩A',
    totalStudents: 26,
    femaleStudents: 11,
    baselineGrades: {
      A: { pct: 15, count: 4 },
      B: { pct: 4, count: 1 },
      C: { pct: 6, count: 2 },
      D: { pct: 3, count: 1 },
      E: { pct: 6, count: 2 },
      F: { pct: 66, count: 17 },
    },
    targetGrades: {
      A: { pct: 15, count: 4 },
      B: { pct: 15, count: 4 },
      C: { pct: 15, count: 4 },
      D: { pct: 14, count: 4 },
      E: { pct: 14, count: 4 },
      F: { pct: 27, count: 7 },
    },
    baselineReading: {
      nonePct: 82,
      noneCount: 21,
      level1Pct: 18,
      level1Count: 5,
      level2Pct: 0,
      level2Count: 0,
    },
    targetReading: {
      nonePct: 18,
      noneCount: 5,
      level1Pct: 73,
      level1Count: 19,
      level2Pct: 9,
      level2Count: 2,
    },
    absencesOver4Target: 4,
  },
  {
    scopeId: '9B',
    labelKh: '៧) ថ្នាក់ទី ៩B',
    totalStudents: 23,
    femaleStudents: 5,
    baselineGrades: {
      A: { pct: 0, count: 0 },
      B: { pct: 0, count: 0 },
      C: { pct: 0, count: 0 },
      D: { pct: 5, count: 1 },
      E: { pct: 0, count: 0 },
      F: { pct: 95, count: 22 },
    },
    targetGrades: {
      A: { pct: 5, count: 1 },
      B: { pct: 11, count: 3 },
      C: { pct: 16, count: 4 },
      D: { pct: 21, count: 5 },
      E: { pct: 21, count: 5 },
      F: { pct: 26, count: 6 },
    },
    baselineReading: {
      nonePct: 42,
      noneCount: 10,
      level1Pct: 53,
      level1Count: 12,
      level2Pct: 0,
      level2Count: 0,
    },
    targetReading: {
      nonePct: 26,
      noneCount: 6,
      level1Pct: 68,
      level1Count: 16,
      level2Pct: 5,
      level2Count: 1,
    },
    absencesOver4Target: 4,
  },
  {
    scopeId: '9C',
    labelKh: '៨) ថ្នាក់ទី ៩C',
    totalStudents: 19,
    femaleStudents: 10,
    baselineGrades: {
      A: { pct: 0, count: 0 },
      B: { pct: 0, count: 0 },
      C: { pct: 0, count: 0 },
      D: { pct: 0, count: 0 },
      E: { pct: 10, count: 2 },
      F: { pct: 90, count: 17 },
    },
    targetGrades: {
      A: { pct: 5, count: 1 },
      B: { pct: 20, count: 4 },
      C: { pct: 15, count: 3 },
      D: { pct: 15, count: 3 },
      E: { pct: 15, count: 3 },
      F: { pct: 30, count: 6 },
    },
    baselineReading: {
      nonePct: 75,
      noneCount: 14,
      level1Pct: 25,
      level1Count: 5,
      level2Pct: 0,
      level2Count: 0,
    },
    targetReading: {
      nonePct: 25,
      noneCount: 5,
      level1Pct: 65,
      level1Count: 12,
      level2Pct: 10,
      level2Count: 2,
    },
    absencesOver4Target: 5,
  },
  {
    scopeId: 'G10',
    labelKh: '៩) ថ្នាក់ទី១០ សរុប (១០A ១០C)',
    totalStudents: 42,
    femaleStudents: 18,
    baselineGrades: {
      A: { pct: 36, count: 15 },
      B: { pct: 5, count: 2 },
      C: { pct: 2, count: 1 },
      D: { pct: 2, count: 1 },
      E: { pct: 48, count: 20 },
      F: { pct: 7, count: 3 },
    },
    targetGrades: {
      A: { pct: 26, count: 11 },
      B: { pct: 24, count: 10 },
      C: { pct: 24, count: 10 },
      D: { pct: 26, count: 11 },
      E: { pct: 0, count: 0 },
      F: { pct: 0, count: 0 },
    },
    baselineReading: {
      nonePct: 79,
      noneCount: 33,
      level1Pct: 21,
      level1Count: 9,
      level2Pct: 0,
      level2Count: 0,
    },
    targetReading: {
      nonePct: 21,
      noneCount: 9,
      level1Pct: 72,
      level1Count: 30,
      level2Pct: 7,
      level2Count: 3,
    },
    absencesOver4Target: 12,
  },
  {
    scopeId: '10A',
    labelKh: '១០) ថ្នាក់ទី ១០A',
    totalStudents: 25,
    femaleStudents: 10,
    baselineGrades: {
      A: { pct: 12, count: 3 },
      B: { pct: 8, count: 2 },
      C: { pct: 4, count: 1 },
      D: { pct: 4, count: 1 },
      E: { pct: 64, count: 16 },
      F: { pct: 8, count: 2 },
    },
    targetGrades: {
      A: { pct: 28, count: 7 },
      B: { pct: 24, count: 6 },
      C: { pct: 24, count: 6 },
      D: { pct: 24, count: 6 },
      E: { pct: 0, count: 0 },
      F: { pct: 0, count: 0 },
    },
    baselineReading: {
      nonePct: 80,
      noneCount: 20,
      level1Pct: 20,
      level1Count: 5,
      level2Pct: 0,
      level2Count: 0,
    },
    targetReading: {
      nonePct: 30,
      noneCount: 8,
      level1Pct: 67,
      level1Count: 17,
      level2Pct: 3,
      level2Count: 1,
    },
    absencesOver4Target: 8,
  },
  {
    scopeId: '10C',
    labelKh: '១១) ថ្នាក់ទី ១០C',
    totalStudents: 17,
    femaleStudents: 8,
    baselineGrades: {
      A: { pct: 71, count: 12 },
      B: { pct: 0, count: 0 },
      C: { pct: 0, count: 0 },
      D: { pct: 0, count: 0 },
      E: { pct: 24, count: 4 },
      F: { pct: 6, count: 1 },
    },
    targetGrades: {
      A: { pct: 24, count: 4 },
      B: { pct: 24, count: 4 },
      C: { pct: 24, count: 4 },
      D: { pct: 29, count: 5 },
      E: { pct: 0, count: 0 },
      F: { pct: 0, count: 0 },
    },
    baselineReading: {
      nonePct: 88,
      noneCount: 15,
      level1Pct: 12,
      level1Count: 2,
      level2Pct: 0,
      level2Count: 0,
    },
    targetReading: {
      nonePct: 18,
      noneCount: 3,
      level1Pct: 71,
      level1Count: 12,
      level2Pct: 12,
      level2Count: 2,
    },
    absencesOver4Target: 4,
  },
];

export const DEFAULT_SIGNATURE_DATE: SignatureDateConfig = {
  lunarDay: 'ចន្ទ ៧រោច',
  lunarMonth: 'អស្សុជ',
  lunarYearEra: 'ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០',
  gregorianLocation: 'រាជធានីភ្នំពេញ',
  gregorianDay: '០២',
  gregorianMonth: 'វិច្ឆិកា',
  gregorianYear: '២០២៦',
};

export function generateDefaultAnnualClassroomPlans(): Record<string, AnnualClassroomPlanSheet> {
  const plans: Record<string, AnnualClassroomPlanSheet> = {};
  const grades: GradeLetter[] = ['A', 'B', 'C', 'D', 'E', 'F'];

  DEFAULT_CLASSES.forEach((cls) => {
    const rows = {} as AnnualClassroomPlanSheet['rows'];
    grades.forEach((g) => {
      rows[g] = {
        baseline: { count: '', pct: '' },
        sem1Target: { count: '', pct: '' },
        sem1Actual: { count: '', pct: '' },
        sem2Target: { count: '', pct: '' },
        sem2Actual: { count: '', pct: '' },
        yearEndTarget: { count: '', pct: '' },
        yearEndActual: { count: '', pct: '' },
      };
    });
    rows.TOTAL = {
      baseline: { count: '', pct: '100' },
      sem1Target: { count: '', pct: '100' },
      sem1Actual: { count: '', pct: '100' },
      sem2Target: { count: '', pct: '100' },
      sem2Actual: { count: '', pct: '100' },
      yearEndTarget: { count: '', pct: '100' },
      yearEndActual: { count: '', pct: '100' },
    };

    plans[cls.id] = {
      classId: cls.id,
      planTitleYearKh: '២០២៦ ~ ២០២៧',
      homeroomTeacherName: '',
      phoneNumber: '',
      scoreRange100Text:
        'កម្រិតពិន្ទុ : Fក្រោម៥០ពិន្ទុ Eពី៥០ ទៅ ៥៩ពិន្ទុ Dពី៦០ ទៅ៦៩ពិន្ទុ Cពី៧០ ទៅ ៧៩ពិន្ទុ Bពី៨០ ទៅ៨៩ពិន្ទុ Aពី៩០ទៅ១០០ពិន្ទុ',
      scoreRange50Text:
        'កម្រិតពិន្ទុ : Fក្រោមពិន្ទុ២៥ Eពី២៥ ទៅ២៩ពិន្ទុ Dពី៣០ ទៅ៣៤ពិន្ទុ Cពី៣៥ ទៅ៣៩ពិន្ទុ Bពី៤០ ទៅ ៤៤ពិន្ទុ Aពី៤៥ ទៅ ៥០ពិន្ទុ',
      rows,
    };
  });

  return plans;
}

export function enrichPerformanceTargetsWithReflections(
  targets: ClassPerformanceTarget[] = DEFAULT_PERFORMANCE_TARGETS
): ClassPerformanceTarget[] {
  const defaultReflections: Record<
    string,
    { studentLearningStatus: string; teacherReflection: string }
  > = {
    '8A': {
      studentLearningStatus:
        'សិស្សថ្នាក់ទី ៨A ចំនួន ៣០នាក់ (ស្រី ១៩នាក់) មានភាពសកម្មក្នុងការហាត់អានប្រកបភីនអ៊ីន (Pinyin) និងចងចាំពាក្យថ្មីមូលដ្ឋានបានល្អ។ សិស្សភាគច្រើនទទួលបាននិទ្ទេស B និង C ហើយគ្មានសិស្សធ្លាក់និទ្ទេស F នៅចុងឆ្នាំ។',
      teacherReflection:
        'ត្រូវបន្តប្រើប្រាស់ប័ណ្ណពាក្យរូបភាព និងការសន្ទនាជាគូ ដើម្បីជួយសិស្សនិទ្ទេស D ឱ្យឡើងមកនិទ្ទេស C និង B ព្រមទាំងពង្រឹងការសរសេរលំដាប់គំនូសអក្សរចិន (汉字笔画)។',
    },
    '8B': {
      studentLearningStatus:
        'សិស្សថ្នាក់ទី ៨B ចំនួន ២៥នាក់ (ស្រី ៩នាក់) គោរពវិន័យក្នុងថ្នាក់បានល្អ មានការរីកចម្រើនផ្នែកការស្តាប់ និងការឆ្លើយតបប្រយោគខ្លីៗជាភាសាចិន (日常交际用语)។',
      teacherReflection:
        'បង្កើនការដាក់កិច្ចការស្វ័យសិក្សាមុនម៉ោងរៀន និងត្រួតពិនិត្យសៀវភៅលំហាត់ប្រចាំសប្តាហ៍ ដើម្បីជួយសិស្សដែលអានយឺតឱ្យអានអត្ថបទបានស្ទាត់។',
    },
    '8C': {
      studentLearningStatus:
        'សិស្សថ្នាក់ទី ៨C ចំនួន ២៤នាក់ (ស្រី ១៤នាក់) បានទទួលកិច្ចការ បានធ្វើកិច្ចការ មានផែនការសិក្សា និងមានសហការល្អ ១០០% ស្របតាមស្តង់ដាសាលាគំរូ។',
      teacherReflection:
        'រៀបចំក្រុមសិក្សាជួយគ្នា (សិស្សពូកែជួយសិស្សខ្សោយ) និងផ្តល់លំហាត់ហាត់សរសេរអក្សរចិនបន្ថែមនៅផ្ទះ។',
    },
    G8: {
      studentLearningStatus:
        'សរុបសិស្សថ្នាក់ទី៨ ទាំង ៣ ថ្នាក់ (៨A, ៨B, ៨C) បានសម្រេចគោលដៅមូលដ្ឋាននៃសៀវភៅ ភាសាចិនរីករាយ ភាគ១ (快乐汉语 第一册) ដោយអត្រាជាប់មធ្យមភាគកើនឡើងដល់ ១០០%។',
      teacherReflection:
        'ការបង្រៀនតាមវិធីសាស្ត្រសកម្ម និងការតាមដានកិច្ចការផ្ទះប្រចាំថ្ងៃបានជួយកាត់បន្ថយអត្រាសិស្សខ្សោយយ៉ាងមានប្រសិទ្ធភាព។',
    },
    '9A': {
      studentLearningStatus:
        'សិស្សថ្នាក់ទី ៩A ចំនួន ២៩នាក់ (ស្រី ១៧នាក់) មានមូលដ្ឋានគ្រឹះភាសាចិនរឹងមាំ អាចអានអត្ថបទសន្ទនា និងបកប្រែពីភាសាចិនមកភាសាខ្មែរបានច្បាស់លាស់។',
      teacherReflection:
        'បន្ថែមលំហាត់តែងល្បះ និងការសន្ទនាក្លែងធ្វើស្ថានភាពជាក់ស្តែង ដើម្បីបង្កើនចំនួនសិស្សទទួលបាននិទ្ទេស A និង B។',
    },
    '9B': {
      studentLearningStatus:
        'សិស្សថ្នាក់ទី ៩B ចំនួន ២៧នាក់ (ស្រី ១៤នាក់) មានការចូលរួមឆ្លើយសំណួរក្នុងថ្នាក់បានល្អ និងប្រគល់កិច្ចការផ្ទះទៀងទាត់។',
      teacherReflection:
        'បន្តលើកទឹកចិត្តសិស្សតាមរយៈការផ្តល់ពិន្ទុបន្ថែម និងប័ណ្ណសរសើរប្រចាំខែដល់សិស្សដែលខិតខំប្រឹងប្រែង។',
    },
    '9C': {
      studentLearningStatus:
        'សិស្សថ្នាក់ទី ៩C ចំនួន ៣៣នាក់ (ស្រី ២១នាក់) មានភាពរីកចម្រើនខ្លាំងលើការចងចាំពាក្យថ្មី និងការប្រើប្រាស់ឃ្លាវេយ្យាករណ៍មូលដ្ឋាន។',
      teacherReflection:
        'យកចិត្តទុកដាក់បំប៉នបន្ថែមដល់សិស្សដែលឈប់សម្រាកច្រើនម៉ោង ដើម្បីឱ្យពួកគេតាមទាន់កម្មវិធីសិក្សា។',
    },
    G9: {
      studentLearningStatus:
        'សរុបសិស្សថ្នាក់ទី៩ ទាំង ៣ ថ្នាក់ (៩A, ៩B, ៩C) ចំនួន ៨៩នាក់ (ស្រី ៥២នាក់) មានសមត្ថភាពអាន និងសរសេរប្រយោគភាសាចិនកម្រិតមធ្យមបានល្អប្រសើរ ស្របតាមស្តង់ដាសាលាគំរូ។',
      teacherReflection:
        'ការរួមបញ្ចូលការវាយតម្លៃបំណិនសម្បទា និងចរិយាសម្បទាប្រចាំខែ បានជំរុញឱ្យសិស្សថ្នាក់ទី៩ មានទម្លាប់ស្វ័យសិក្សាល្អ។',
    },
    '10A': {
      studentLearningStatus:
        'សិស្សថ្នាក់ទី ១០A ចំនួន ៣១នាក់ (ស្រី ២១នាក់) សិក្សាសៀវភៅ ភាសាចិនរីករាយ ភាគ២ (快乐汉语 第二册) អាចអានអត្ថបទវែង និងសរសេរអត្ថបទខ្លីៗបានល្អ។',
      teacherReflection:
        'ពង្រឹងការហាត់ស្តាប់ និងការសរសេរអត្ថបទខ្លី ៥០-៨០ អក្សរចិន ដើម្បីត្រៀមប្រឡងឆមាសឱ្យទទួលបាននិទ្ទេសខ្ពស់។',
    },
    '10C': {
      studentLearningStatus:
        'សិស្សថ្នាក់ទី ១០C ចំនួន ១៧នាក់ (ស្រី ៨នាក់) ថ្នាក់មានចំនួនសិស្សសមល្មម ធ្វើឱ្យគ្រូអាចណែនាំផ្ទាល់ដល់សិស្សម្នាក់ៗលើការបញ្ចេញសំឡេង និងការសរសេរអក្សរចិនបានយ៉ាងដិតដល់។',
      teacherReflection:
        'បន្តតាមដានសិស្សដែលអវត្តមានញឹកញាប់ និងផ្តល់ឯកសារស្វ័យសិក្សាបន្ថែមដើម្បីធានាថាសិស្សគ្រប់រូបទទួលបាននិទ្ទេសល្អ។',
    },
    G10: {
      studentLearningStatus:
        'សរុបសិស្សថ្នាក់ទី១០ ទាំង ២ ថ្នាក់ (១០A, ១០C) ចំនួន ៤៨នាក់ (ស្រី ២៧នាក់) មានសមត្ថភាពប្រើប្រាស់ភាសាចិនក្នុងការសន្ទនា និងការសរសេរកម្រិតខ្ពស់ជាងមុនយ៉ាងច្បាស់។',
      teacherReflection:
        'ការអនុវត្តគម្រោងសិក្សាជាក្រុម និងការត្រួតពិនិត្យកិច្ចការផ្ទះទៀងទាត់ បានជួយឱ្យសិស្សថ្នាក់ទី១០ សម្រេចបានគោលដៅកិច្ចព្រមព្រៀងលទ្ធផលប្រចាំឆ្នាំ។',
    },
    ALL: {
      studentLearningStatus:
        'សរុបរួមសិស្សទាំង ៨ ថ្នាក់ (ថ្នាក់ទី៨ ទី៩ និងទី១០) មានការរីកចម្រើនគួរឱ្យកត់សម្គាល់ទាំងផ្នែកវិជ្ជាសម្បទា បំណិនសម្បទា និងចរិយាសម្បទា ដោយអត្រាសិស្សទទួលបាននិទ្ទេស A, B, C កើនឡើងតាមផែនការគ្រោងទុក។',
      teacherReflection:
        'ក្នុងនាមជាគ្រូបង្រៀនមុខវិជ្ជាភាសាចិន នាងខ្ញុំបានអនុវត្តយ៉ាងខ្ជាប់ខ្ជួននូវការដាក់កិច្ចការស្វ័យសិក្សាមុនម៉ោងរៀន ការកែកិច្ចការផ្ទះ និងការបំប៉នសិស្សខ្សោយ ដែលធ្វើឱ្យលទ្ធផលសិក្សារបស់សិស្សថ្នាក់ទី៨ ទី៩ និងទី១០ សម្រេចបានតាមស្តង់ដាសាលាគំរូ។',
    },
  };

  return targets.map((t) => ({
    ...t,
    studentLearningStatus:
      t.studentLearningStatus || defaultReflections[t.scopeId]?.studentLearningStatus || '',
    teacherReflection:
      t.teacherReflection || defaultReflections[t.scopeId]?.teacherReflection || '',
  }));
}

export function generateDefaultDailyHomeworkRecords(
  classes: ClassGroup[] = DEFAULT_CLASSES,
  students: Student[] = DEFAULT_STUDENTS
): DailyHomeworkRecord[] {
  const todayIso = new Date().toISOString().slice(0, 10);
  const defaultPinyinReviewTopic = {
    assigned: true,
    unitTitle: '汉语基础（复习）· មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
    lessonTitle: '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)',
    lessonContent:
      '1. រំលឹកព្យញ្ជនៈទាំង ២៣ (២៣ 声母) ៖ b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w\n2. រំលឹកស្រៈទាំង ២៤ (២៤ 韵母) ៖ a, o, e, i, u, ü, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong\n3. ហាត់អាន បញ្ចេញសំឡេង និងសរសេរឱ្យបានត្រឹមត្រូវ (会读会记 会正确拼读与书写)',
    title: 'ចម្លងភីនអ៊ីន ៥ដង (抄写声母和韵母各5遍)',
    detail:
      'ចម្លងព្យញ្ជនៈ (声母) ២៣ និង ស្រៈ (韵母) ២៤ ចំនួន ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写声母和韵母各5遍，下周交)',
    dueDate: 'សប្តាហ៍ក្រោយ (下周交)',
  };

  const defaultTopics: Record<
    string,
    {
      assigned: boolean;
      unitTitle: string;
      lessonTitle: string;
      lessonContent: string;
      title: string;
      detail: string;
      dueDate: string;
    }
  > = {
    '8A': { ...defaultPinyinReviewTopic },
    '8B': { ...defaultPinyinReviewTopic },
    '8C': { ...defaultPinyinReviewTopic },
    '9A': { ...defaultPinyinReviewTopic },
    '9B': { ...defaultPinyinReviewTopic },
    '9C': { ...defaultPinyinReviewTopic },
    '10A': { ...defaultPinyinReviewTopic },
    '10B': { ...defaultPinyinReviewTopic },
    '10C': { ...defaultPinyinReviewTopic },
  };

  const novFirstDates: Record<string, string> = {
    '10C': '2026-11-02',
    '10B': '2026-11-02',
    '9A': '2026-11-02',
    '9C': '2026-11-02',
    '8C': '2026-11-03',
    '8A': '2026-11-03',
    '10A': '2026-11-04',
    '9B': '2026-11-05',
    '8B': '2026-11-05',
  };

  return classes.map((cls) => {
    const classStudents = students.filter((s) => s.classId === cls.id);
    const cleanCode = cleanClassDisplayCode(cls.name || cls.id) || cls.name || cls.id;
    const dayShort = (cls.scheduleDayKh || '').replace(/^ថ្ងៃ\s*/g, '').trim();

    let hwDate = novFirstDates[cleanCode] || novFirstDates[cls.id] || todayIso;
    if (dayShort === 'ចន្ទ') hwDate = '2026-11-02';
    else if (dayShort === 'អង្គារ') hwDate = '2026-11-03';
    else if (dayShort === 'ពុធ') hwDate = '2026-11-04';
    else if (dayShort === 'ព្រហស្បតិ៍') hwDate = '2026-11-05';
    else if (dayShort === 'សុក្រ') hwDate = '2026-11-06';

    const cfg = defaultTopics[cleanCode] || defaultTopics[cls.id] || defaultPinyinReviewTopic;
    const submissions: Record<string, 'submitted' | 'missing'> = {};
    const notes: Record<string, string> = {};
    classStudents.forEach((stu, idx) => {
      const isNeverPresent =
        stu.status === 'dropped' || (stu.note || '').includes('មិនដែលមករៀន');
      const isMissing = isNeverPresent || idx % 6 === 4;
      submissions[stu.id] = cfg.assigned ? (isMissing ? 'missing' : 'submitted') : 'missing';
      notes[stu.id] = isMissing && cfg.assigned ? 'មិនទាន់ប្រគល់សៀវភៅ' : '';
    });

    return {
      id: `hw-${cls.id}-${hwDate}`,
      classId: cls.id,
      date: hwDate,
      assigned: cfg.assigned,
      lessonUnitTitle: cfg.unitTitle,
      lessonTitle: cfg.lessonTitle,
      lessonContentDetails: cfg.lessonContent,
      syncedToWeeklyLog: true,
      homeworkTitle: cfg.title,
      homeworkDetail: cfg.detail,
      dueDate: cfg.dueDate,
      submissions,
      notes,
    };
  });
}

export function generateWeek2DailyHomeworkRecords(
  classes: ClassGroup[] = DEFAULT_CLASSES,
  students: Student[] = DEFAULT_STUDENTS
): DailyHomeworkRecord[] {
  const week2Topic = {
    assigned: true,
    unitTitle: '第三单元 购物 · ជំពូកទី៣ ការទិញទំនិញ',
    lessonTitle: '第七课 你买什么？ · មេរៀនទី៧ តើអ្នកទិញអ្វី？ (生词)',
    lessonContent: LESSON_7_VOCAB_CONTENT_DETAILS,
    title: 'ចម្លងពាក្យថ្មី ៥ដង (抄写生词5遍)',
    detail:
      'ចម្លងពាក្យថ្មីដែលបានរៀនទាំង ១១ ពាក្យ ក្នុង១ពាក្យ ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写所学11个生词各5遍，下周交)',
    dueDate: 'សប្តាហ៍ក្រោយ (下周交)',
  };

  const week2Dates: Record<string, string> = {
    '10C': '2026-11-10', // 星期一放假，排在星期二
    '10B': '2026-11-10', // 星期一放假，排在星期二
    '9A': '2026-11-11',
    '9C': '2026-11-10',
    '8C': '2026-11-10',
    '8A': '2026-11-10',
    '10A': '2026-11-11',
    '9B': '2026-11-12',
    '8B': '2026-11-12',
  };

  return classes.map((cls) => {
    const classStudents = students.filter((s) => s.classId === cls.id);
    const cleanCode = cleanClassDisplayCode(cls.name || cls.id) || cls.name || cls.id;
    const dayShort = (cls.scheduleDayKh || '').replace(/^ថ្ងៃ\s*/g, '').trim();

    let hwDate = week2Dates[cleanCode] || week2Dates[cls.id] || '2026-11-10';
    if (dayShort === 'ចន្ទ') hwDate = '2026-11-10'; // 星期一放假，排在星期二
    else if (dayShort === 'អង្គារ') hwDate = '2026-11-10';
    else if (dayShort === 'ពុធ') hwDate = '2026-11-11';
    else if (dayShort === 'ព្រហស្បតិ៍') hwDate = '2026-11-12';
    else if (dayShort === 'សុក្រ') hwDate = '2026-11-13';

    const submissions: Record<string, 'submitted' | 'missing'> = {};
    const notes: Record<string, string> = {};
    classStudents.forEach((stu, idx) => {
      const isNeverPresent =
        stu.status === 'dropped' || (stu.note || '').includes('មិនដែលមករៀន');
      const isMissing = isNeverPresent || idx % 6 === 4;
      submissions[stu.id] = isMissing ? 'missing' : 'submitted';
      notes[stu.id] = isMissing ? 'មិនទាន់ប្រគល់សៀវភៅ' : '';
    });

    return {
      id: `hw-${cls.id}-${hwDate}`,
      classId: cls.id,
      date: hwDate,
      assigned: week2Topic.assigned,
      lessonUnitTitle: week2Topic.unitTitle,
      lessonTitle: week2Topic.lessonTitle,
      lessonContentDetails: week2Topic.lessonContent,
      syncedToWeeklyLog: true,
      homeworkTitle: week2Topic.title,
      homeworkDetail: week2Topic.detail,
      dueDate: week2Topic.dueDate,
      submissions,
      notes,
    };
  });
}

export const DEFAULT_PERFORMANCE_AGREEMENT_META: PerformanceAgreementMeta = {
  mainHeadingKh: 'វត្ថុបំណងបំពេញការងារ',
  agreementTitleKh: 'កិច្ចព្រមព្រៀងលទ្ធផល ប្រចាំឆ្នាំ២០២៥ របស់គ្រូបង្រៀន',
  academicPeriodKh: 'ប្រចាំឆ្នាំសិក្សា ២០២៥ - ២០២៦ ចាប់ពីខែ មករា ដល់ ខែ តុលា ឆ្នាំ២០២៦',
  reviewSubtitleKh:
    'ការកំណត់វត្ថុបំណង និងលក្ខណៈវិនិច្ឆ័យបំពេញការងារ សម្រាប់ ការពិនិត្យឡើងវិញ ការអនុវត្តការងារមន្ត្រីឆ្នាំ ២០២៥-២០២៦',
  objective1TitleKh:
    'វត្ថុបំណងទី១៖ លទ្ធផលសិក្សារៀនសូត្ររបស់សិស្សមុខវិជ្ជា ( ភាសាចិន ) ថ្នាក់ទី ៨ ទី៩ និងទី១០',
};

export function createInitialAppDatabaseState(): AppDatabaseState {
  const classesWithTerm = [
    ...DEFAULT_CLASSES.map((c) => ({
      ...c,
      termId: c.termId || 'term-2025-2026',
    })),
    {
      id: 'term-2026-2027__10C',
      name: '១០C',
      gradeLevel: 10,
      scheduleDayKh: 'ថ្ងៃពុធ',
      scheduleTime: '13:00-14:30',
      weeklyHoursLabel: '១ម៉ ៣០ន/ សប្តាហ៍',
      textbookName: '快乐汉语 (第二册) ភាសាចិនរីករាយ (កំរិត២)',
      termId: 'term-2026-2027',
    },
  ];
  return {
    version: '2.3.2-chinese-subject',
    updatedAt: new Date().toISOString(),
    useKhmerNumerals: false,
    schoolInfo: DEFAULT_SCHOOL_INFO,
    academicTerms: DEFAULT_ACADEMIC_TERMS,
    currentTermId: 'term-2026-2027',
    signatureDate: DEFAULT_SIGNATURE_DATE,
    performanceAgreementMeta: DEFAULT_PERFORMANCE_AGREEMENT_META,
    annualClassroomPlans: generateDefaultAnnualClassroomPlans(),
    classes: classesWithTerm,
    students: sortAllStudentsInDatabase(DEFAULT_STUDENTS),
    months: DEFAULT_MONTHS,
    gradeThresholds: DEFAULT_GRADE_THRESHOLDS,
    scores: generateDefaultScores(),
    attendance: generateDefaultAttendance(),
    sessionDates: generateDefaultSessionDates(),
    sessionMonths: generateDefaultSessionMonths(),
    attendanceSheetConfigs: generateDefaultAttendanceSheetConfigs(),
    standardEvaluations: generateDefaultStandardEvaluations(),
    teacherTaskReports: generateDefaultTeacherTaskReports(),
    weeklyLogs: DEFAULT_WEEKLY_LOGS,
    weeklyLogMeta: DEFAULT_WEEKLY_LOG_META,
    curriculumPlan: DEFAULT_CURRICULUM_PLAN,
    lessonPlans: DEFAULT_LESSON_PLANS,
    performanceTargets: enrichPerformanceTargetsWithReflections(DEFAULT_PERFORMANCE_TARGETS),
    dailyHomeworkRecords: generateDefaultDailyHomeworkRecords(classesWithTerm, DEFAULT_STUDENTS),
  };
}
