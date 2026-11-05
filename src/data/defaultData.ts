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
import { sortAllStudentsInDatabase } from '../utils/calculations';

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
    scheduleTime: '15:00-16:30',
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

export const DEFAULT_WEEKLY_LOG_META: WeeklyLogSignatureMeta = {
  fridayDateStr: '14/11/2025',
  lunarDate: 'ថ្ងៃសុក្រ ៩រោច ខែកត្តិក ឆ្នាំម្សាញ់ សប្តស័ក ព.ស.២៥៦៩',
  gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី១៤ ខែវិច្ឆិកា ឆ្នាំ២០២៥',
  textbookTitle: '快乐汉语（第一册 & 第二册）ភាសាចិនរីករាយ (កំរិត១ និង កំរិត២)',
};

// Exact Weekly Lesson Log from PDF 2 (2សម្រង់អត្ថបទ2025-2026.pdf — All 8 classes Mon-Thu)
export const DEFAULT_WEEKLY_LOGS: WeeklyLessonLogItem[] = [
  {
    id: 'wlog-1',
    weekLabel: 'សប្តាហ៍ទី១ (១០-១៤ វិច្ឆិកា ២០២៥)',
    dateStr: '10/11/2025',
    weekdayKh: 'ចន្ទ',
    timeRange: '13:00-14:30',
    classId: '9A',
    unitTitle: '汉语基础（复习学前测试）',
    lessonTitle: 'មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
    contentDetails:
      '- 声母 ព្យញ្ជនៈ\n- 韵母 ស្រៈ\n- 声调与拼读 សូរសំឡេង និងការរៀនប្រកប ភីនអ៊ីន',
  },
  {
    id: 'wlog-2',
    weekLabel: 'សប្តាហ៍ទី១ (១០-១៤ វិច្ឆិកា ២០២៥)',
    dateStr: '10/11/2025',
    weekdayKh: 'ចន្ទ',
    timeRange: '15:00-16:30',
    classId: '9C',
    unitTitle: '汉语基础（复习学前测试）',
    lessonTitle: 'មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
    contentDetails:
      '- 声母 ព្យញ្ជនៈ\n- 韵母 ស្រៈ\n- 声调与拼读 សូរសំឡេង និងការរៀនប្រកប ភីនអ៊ីន',
  },
  {
    id: 'wlog-3',
    weekLabel: 'សប្តាហ៍ទី១ (១០-១៤ វិច្ឆិកា ២០២៥)',
    dateStr: '11/11/2025',
    weekdayKh: 'អង្គារ',
    timeRange: '13:00-14:30',
    classId: '8C',
    unitTitle: '第一单元 你和我',
    lessonTitle: '第一课 你好 · មេរៀនទី១ សួស្តី',
    contentDetails:
      '1. 生词 ពាក្យថ្មី៖ 你、好、吗、我、很\n2. 句型 ទម្រង់ល្បះ៖ ①你好！ ②你好吗？ ③我很好。',
  },
  {
    id: 'wlog-4',
    weekLabel: 'សប្តាហ៍ទី១ (១០-១៤ វិច្ឆិកា ២០២៥)',
    dateStr: '11/11/2025',
    weekdayKh: 'អង្គារ',
    timeRange: '15:00-16:30',
    classId: '8A',
    unitTitle: '第一单元 你和我',
    lessonTitle: '第一课 你好 · មេរៀនទី១ សួស្តី',
    contentDetails:
      '1. 生词 ពាក្យថ្មី៖ 你、好、吗、我、很\n2. 句型 ទម្រង់ល្បះ៖ ①你好！ ②你好吗？ ③我很好。',
  },
  {
    id: 'wlog-5',
    weekLabel: 'សប្តាហ៍ទី១ (១០-១៤ វិច្ឆិកា ២០២៥)',
    dateStr: '12/11/2025',
    weekdayKh: 'ពុធ',
    timeRange: '13:00-14:30',
    classId: '10A',
    unitTitle: '第一单元 我和朋友',
    lessonTitle: '第一课 他是谁 · មេរៀនទី១ តើគាត់គឺជានរណា',
    contentDetails:
      '1. 生词 ពាក្យថ្មី៖ ①姓 ②名字 ③多 ④朋友 ⑤谁 ⑥欢迎 ⑦地方 ⑧国家 ⑨号码\n2. 句型 ទម្រង់ល្បះ៖ ①你姓什么？ ②叫什么名字？ ③我姓马，我叫马丽丽。 ④他是谁？',
  },
  {
    id: 'wlog-6',
    weekLabel: 'សប្តាហ៍ទី១ (១០-១៤ វិច្ឆិកា ២០២៥)',
    dateStr: '12/11/2025',
    weekdayKh: 'ពុធ',
    timeRange: '15:00-16:30',
    classId: '10C',
    unitTitle: '第一单元 我和朋友',
    lessonTitle: '第一课 他是谁 · មេរៀនទី១ តើគាត់គឺជានរណា',
    contentDetails:
      '1. 生词 ពាក្យថ្មី៖ ①姓 ②名字 ③多 ④朋友 ⑤谁 ⑥欢迎 ⑦地方 ⑧国家 ⑨号码\n2. 句型 ទម្រង់ល្បះ៖ ①你姓什么？ ②叫什么名字？ ③我姓马，我叫马丽丽。 ④他是谁？',
  },
  {
    id: 'wlog-7',
    weekLabel: 'សប្តាហ៍ទី១ (១០-១៤ វិច្ឆិកា ២០២៥)',
    dateStr: '13/11/2025',
    weekdayKh: 'ព្រហស្បតិ៍',
    timeRange: '13:00-14:30',
    classId: '9B',
    unitTitle: '汉语基础（复习学前测试）',
    lessonTitle: 'មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
    contentDetails:
      '- 声母 ព្យញ្ជនៈ\n- 韵母 ស្រៈ\n- 声调与拼读 សូរសំឡេង និងការរៀនប្រកប ភីនអ៊ីន',
  },
  {
    id: 'wlog-8',
    weekLabel: 'សប្តាហ៍ទី១ (១០-១៤ វិច្ឆិកា ២០២៥)',
    dateStr: '13/11/2025',
    weekdayKh: 'ព្រហស្បតិ៍',
    timeRange: '15:00-16:30',
    classId: '8B',
    unitTitle: '第一单元 你和我',
    lessonTitle: '第一课 你好 · មេរៀនទី១ សួស្តី',
    contentDetails:
      '1. 生词 ពាក្យថ្មី៖ 你、好、吗、我、很\n2. 句型 ទម្រង់ល្បះ៖ ①你好！ ②你好吗？ ③我很好。',
  },
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
      '第一单元 我和朋友 · 第一课 他是谁 (មេរៀនទី១ តើគាត់គឺជានរណា)\n1. 生词 ពាក្យថ្មី៖ 姓、名字、多、朋友、谁、欢迎、地方、国家、号码\n2. 句型 ទម្រង់ល្បះ៖ ①你姓什么？ ②叫什么名字？ ③我姓马，我叫马丽丽。 ④他是谁？',
    pageNumber: 'សៀ.សិស្ស ៣',
    hours: 1.5,
    note: '',
  },
  {
    id: 'cur-3',
    monthNameKh: 'វិច្ឆិកា',
    weekNumber: '៣',
    lessonContent:
      '第一单元 我和朋友 · 第一课 他是谁 (មេរៀនទី១ តើគាត់គឺជានរណា)\n3. 对话 សន្ទនា៖ A: 你好。 B: 你好。 A: 你姓什么？ B: 我姓马。',
    pageNumber: 'សៀ.សិស្ស ៣',
    hours: 1.5,
    note: '',
  },
  {
    id: 'cur-4',
    monthNameKh: 'វិច្ឆិកា',
    weekNumber: '៤',
    lessonContent:
      '第一课 他是谁 · 4. 汉字笔画 គំនូសអក្សរចិន៖ 姓、名、字、多、朋、友、谁、欢、迎、地、方、国、家、号、码\n5. 综合练习：课本和练习册',
    pageNumber: 'សៀ.សិស្ស (៤-៥) / សៀ.លំ (១-៧)',
    hours: 1.5,
    note: '',
  },
  {
    id: 'cur-5',
    monthNameKh: 'ធ្នូ',
    weekNumber: '១',
    lessonContent:
      '第二课 她比我高 (មេរៀនទី២ នាងខ្ពស់ជាងខ្ញុំ)\n1. 生词 ពាក្យថ្មី៖ 多、今年、她、比、说、英语、汉语、谢谢、网友、年龄、高、艺术\n2. 句型 ទម្រង់ល្បះ៖ ①你多大？ ②我今年十六岁。',
    pageNumber: '៨',
    hours: 1.5,
    note: '',
  },
  {
    id: 'cur-6',
    monthNameKh: 'ធ្នូ',
    weekNumber: '២',
    lessonContent:
      '第二课 她比我高 · 3. 对话 សន្ទនា + 十二月月考 (ប្រឡងប្រចាំខែធ្នូ)',
    pageNumber: '៨',
    hours: 1.5,
    note: 'ប្រឡងប្រចាំខែធ្នូ',
  },
  {
    id: 'cur-7',
    monthNameKh: 'មករា',
    weekNumber: '១-២',
    lessonContent:
      '第三课 我的一天 (មេរៀនទី៣ មួយថ្ងៃរបស់ខ្ញុំ)\n3. 情境应用 ការប្រើប្រាស់ក្នុងបរិបទ + 4. 汉字笔画 គំនូសអក្សរចិន + 一月月考 (ប្រឡងប្រចាំខែមករា)',
    pageNumber: 'សៀ.សិស្ស (១៣-១៦) / សៀ.លំ (១៧-២៥)',
    hours: 3.0,
    note: 'ប្រឡងប្រចាំខែមករា',
  },
  {
    id: 'cur-8',
    monthNameKh: 'កុម្ភៈ',
    weekNumber: '១-៤',
    lessonContent:
      '第二单元 我的家 · 第四课 我的房间 (មេរៀនទី៤ បន្ទប់របស់ខ្ញុំ) & 第五课 客厅在南边 (មេរៀនទី៥ បន្ទប់ទទួលភ្ញៀវនៅទិសខាងត្បូង) + 期中考试 (ប្រឡងឆមាសលើកទី១)',
    pageNumber: '២២-៣១',
    hours: 6.0,
    note: 'ប្រឡងឆមាសលើកទី១',
  },
  {
    id: 'cur-9',
    monthNameKh: 'មីនា - មេសា',
    weekNumber: '១-៤',
    lessonContent:
      '第六课 你家的花园真漂亮 (មេរៀនទី៦ សួនច្បារផ្ទះរបស់អ្នកពិតជាស្អាតមែន) & 第三单元 购物 · 第七课 你买什么 (មេរៀនទី៧ តើអ្នកទិញអ្វី)',
    pageNumber: '៣៣-៤៧',
    hours: 6.0,
    note: 'ប្រឡងប្រចាំខែមីនា',
  },
  {
    id: 'cur-10',
    monthNameKh: 'ឧសភា - មិថុនា',
    weekNumber: '១-៤',
    lessonContent:
      '第八课 苹果多少钱一斤 (មេរៀនទី៨ តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន) & 第九课 这件衣服比那件贵一点儿 (មេរៀនទី៩ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច)',
    pageNumber: '៤៩-៦៥',
    hours: 6.0,
    note: 'ប្រឡងប្រចាំខែឧសភា & មិថុនា',
  },
  {
    id: 'cur-11',
    monthNameKh: 'កក្កដា - សីហា',
    weekNumber: '១-៤',
    lessonContent:
      '第四单元 学校生活 · 第十课 你今天上了什么课, 第十一课 汉语不难 & 第十二课 来打乒乓球吧 + 期末考试 (ប្រឡងឆមាសទី២)',
    pageNumber: '៦៥-៩០',
    hours: 6.0,
    note: 'ប្រឡងឆមាសទី២ (សរុប ៥៧ ម៉ោង)',
  },
];

// Exact Chinese Lesson Plans from PDF 4 (កិច្ចតែងការបង្រៀន ភាសាចិន វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង)
export const DEFAULT_LESSON_PLANS: ChineseLessonPlan[] = [
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
    '8A': {
      assigned: true,
      unitTitle: '第二单元 家和学校 · ជំពូកទី២ គ្រួសារ និងសាលារៀន',
      lessonTitle: '第四课 我的家 · មេរៀនទី៤ គ្រួសាររបស់ខ្ញុំ',
      lessonContent:
        '1. 生词 ពាក្យថ្មី៖ ①爸爸 ②妈妈 ③哥哥 ④姐姐 · 2. 句型 ល្បះ៖ 这是我爸爸。你有哥哥吗？',
      title: 'មេរៀនទី៤៖ គ្រួសាររបស់ខ្ញុំ (第四课：我的家)',
      detail: 'សរសេរអក្សរចិន 爸爸, 妈妈, 哥哥, 姐姐 មួយពាក្យ ៥ ជួរ និងតែងប្រយោគ ៣ ឃ្លា។',
      dueDate: 'សប្តាហ៍ក្រោយ (ថ្ងៃអង្គារ)',
    },
    '8B': {
      assigned: false,
      unitTitle: '第二单元 家和学校 · ជំពូកទី២ គ្រួសារ និងសាលារៀន',
      lessonTitle: '第四课 我的家 · មេរៀនទី៤ គ្រួសាររបស់ខ្ញុំ',
      lessonContent:
        '1. 生词 ពាក្យថ្មី៖ ①爸爸 ②妈妈 ③哥哥 ④姐姐 · 2. 课文 ការហាត់អានអត្ថបទសន្ទនាទំព័រទី ១០-១១',
      title: 'មេរៀនទី៤៖ គ្រួសាររបស់ខ្ញុំ (第四课：我的家)',
      detail: 'មិនទាន់ដាក់កិច្ចការផ្ទះថ្ងៃនេះទេ (ចុចប៊ូតុងដាក់កិច្ចការដើម្បីដាក់ជូនសិស្ស)។',
      dueDate: 'សប្តាហ៍ក្រោយ (ថ្ងៃព្រហស្បតិ៍)',
    },
    '8C': {
      assigned: true,
      unitTitle: '第二单元 家和学校 · ជំពូកទី២ គ្រួសារ និងសាលារៀន',
      lessonTitle: '第四课 家庭成员 · មេរៀនទី៤ សមាជិកគ្រួសារ និងមុខរបរ',
      lessonContent:
        '1. 生词 ពាក្យថ្មី៖ ①家 ②有 ③口 ④人 · 2. 句型 ល្បះ៖ 你家有几口人？我家有五口人。',
      title: 'មេរៀនទី៤៖ សមាជិកគ្រួសារ និងមុខរបរ (第四课：家庭成员)',
      detail: 'ហាត់សរសេរពាក្យថ្មីចំនួន ៦ ពាក្យក្នុងសៀវភៅកិច្ចការផ្ទះ និងថតសំឡេងអានអត្ថបទ។',
      dueDate: 'សប្តាហ៍ក្រោយ (ថ្ងៃអង្គារ)',
    },
    '9A': {
      assigned: true,
      unitTitle: '第三单元 时间与日期 · ជំពូកទី៣ ពេលវេលា និងកាលបរិច្ឆេទ',
      lessonTitle: '第六课 今天几月几号 · មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?',
      lessonContent:
        '1. 生词 ពាក្យថ្មី៖ ①月 ②号 ③星期 ④今天 ⑤昨天 ⑥明天 · 2. 句型 ល្បះ៖ 今天几月几号？',
      title: 'មេរៀនទី៦៖ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន? (第六课：今天几月几号)',
      detail: 'ធ្វើលំហាត់ទំព័រទី ៣២-៣៣ និងសរសេរកាលបរិច្ឆេទថ្ងៃខួបកំណើតរបស់ខ្លួនជាភាសាចិន។',
      dueDate: 'សប្តាហ៍ក្រោយ (ថ្ងៃចន្ទ)',
    },
    '9B': {
      assigned: false,
      unitTitle: '第三单元 时间与日期 · ជំពូកទី៣ ពេលវេលា និងកាលបរិច្ឆេទ',
      lessonTitle: '第六课 日期与星期 · មេរៀនទី៦ ថ្ងៃខែឆ្នាំ និងថ្ងៃនៃសប្តាហ៍',
      lessonContent:
        '1. 复习生词 រំលឹកពាក្យថ្មីអំពីថ្ងៃខែ និងថ្ងៃទាំង៧នៃសប្តាហ៍ · 2. 练习对话 ហាត់សន្ទនាជាគូ',
      title: 'មេរៀនទី៦៖ ថ្ងៃខែឆ្នាំ និងថ្ងៃនៃសប្តាហ៍ (第六课：日期与星期)',
      detail: 'មិនទាន់ដាក់កិច្ចការផ្ទះថ្ងៃនេះទេ។',
      dueDate: 'សប្តាហ៍ក្រោយ (ថ្ងៃព្រហស្បតិ៍)',
    },
    '9C': {
      assigned: true,
      unitTitle: '第三单元 时间与日期 · ជំពូកទី៣ ពេលវេលា និងកាលបរិច្ឆេទ',
      lessonTitle: '第六课 时间与约会 · មេរៀនទី៦ ការណាត់ជួប និងពេលវេលា',
      lessonContent:
        '1. 生词 ពាក្យថ្មី៖ ①生日 ②快乐 ③祝 ④岁 · 2. 句型 ល្បះ៖ 你的生日是几月几号？祝你生日快乐！',
      title: 'មេរៀនទី៦៖ ការណាត់ជួប និងពេលវេលា (第六课：时间与约会)',
      detail: 'សរសេរកិច្ចសន្ទនាខ្លី ៦ ឃ្លាអំពីការសួរថ្ងៃខែ និងម៉ោង។',
      dueDate: 'សប្តាហ៍ក្រោយ (ថ្ងៃចន្ទ)',
    },
    '10A': {
      assigned: true,
      unitTitle: '第四单元 买东西 · ជំពូកទី៤ ការទិញទំនិញ',
      lessonTitle: '第八课 买东西 · មេរៀនទី៨ ការទិញទំនិញ និងតម្លៃ',
      lessonContent:
        '1. 生词 ពាក្យថ្មី៖ ①买 ②东西 ③多少钱 ④块 ⑤贵 ⑥便宜 · 2. 句型 ល្បះ៖ 这个多少钱？太贵了。',
      title: 'មេរៀនទី៨៖ ការទិញទំនិញ និងតម្លៃ (第八课：买东西)',
      detail: 'សរសេរអត្ថបទខ្លី ៥០ អក្សរចិន អំពីការទៅផ្សារទិញផ្លែឈើ និងសម្ភារៈសិក្សា។',
      dueDate: 'សប្តាហ៍ក្រោយ (ថ្ងៃពុធ)',
    },
    '10C': {
      assigned: true,
      unitTitle: '第四单元 买东西 · ជំពូកទី៤ ការទិញទំនិញ',
      lessonTitle: '第八课 多少钱 · មេរៀនទី៨ ការសួរតម្លៃ និងការតថ្លៃ',
      lessonContent:
        '1. 课文对话 អត្ថបទសន្ទនាទី២ ទំព័រទី ៤៤-៤៥ · 2. 语法 ការប្រើប្រាស់ឯកតារូបិយប័ណ្ណ និងទម្ងន់',
      title: 'មេរៀនទី៨៖ ការសួរតម្លៃ និងការតថ្លៃ (第八课：多少钱)',
      detail: 'ចម្លងអត្ថបទសន្ទនាទី២ ចូលសៀវភៅកិច្ចការផ្ទះ និងបកប្រែជាភាសាខ្មែរ។',
      dueDate: 'សប្តាហ៍ក្រោយ (ថ្ងៃពុធ)',
    },
  };

  const novFirstDates: Record<string, string> = {
    '9A': '2026-11-02',
    '9C': '2026-11-02',
    '8C': '2026-11-03',
    '8A': '2026-11-03',
    '10A': '2026-11-04',
    '10C': '2026-11-04',
    '9B': '2026-11-05',
    '8B': '2026-11-05',
  };

  return classes.map((cls) => {
    const classStudents = students.filter((s) => s.classId === cls.id);
    const hwDate = novFirstDates[cls.id] || todayIso;
    const cfg = defaultTopics[cls.id] || {
      assigned: true,
      unitTitle: '第一单元 · ជំពូកទី១',
      lessonTitle: 'មេរៀនភាសាចិនប្រចាំសប្តាហ៍',
      lessonContent: '1. ពាក្យថ្មី និងឃ្លាសន្ទនាប្រចាំថ្ងៃ',
      title: 'កិច្ចការផ្ទះភាសាចិនប្រចាំថ្ងៃ (日常汉语作业)',
      detail: 'ហាត់សរសេរពាក្យថ្មី និងធ្វើលំហាត់ក្នុងសៀវភៅពុម្ព។',
      dueDate: 'សប្តាហ៍ក្រោយ',
    };
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
      scheduleTime: '15:00-16:30',
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
