import * as XLSX from 'xlsx';
import { AppDatabaseState, ScoreValue, Student } from '../types';
import {
  createInitialAppDatabaseState,
  generateDefaultDailyHomeworkRecords,
} from '../data/defaultData';
import {
  calculateClassChineseResults,
  cleanClassDisplayCode,
  convertIsoDateToKhmerSignature,
  parseSignatureGregorianToIso,
  sortAllStudentsInDatabase,
  sortStudentsByKhmerName,
  syncMonthsWithAcademicYear,
} from './calculations';
import { downloadOfficialCambodiaWorkbook } from './excelWorkbookBuilder';

const DB_NAME = 'SalaGradeChineseTeacherDB';
const DB_VERSION = 3;
const STORE_NAME = 'workspace';
const RECORD_KEY = 'chinese_subject_data_v3';
const LOCAL_STORAGE_FALLBACK_KEY = 'salagrade_chinese_backup_v3';

export function saveDocumentAsPdf(documentTitle: string): void {
  const previousTitle = document.title;
  document.title = documentTitle;
  window.print();
  window.setTimeout(() => {
    document.title = previousTitle;
  }, 800);
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function normalizeClassCode(raw: string): string {
  return raw
    .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)))
    .replace(/^ថ្នាក់ទី\s*/g, '')
    .replace(/^ថ្នាក់\s*/g, '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

function toKhmerClassDisplay(code: string): string {
  return code.replace(/[0-9]/g, (d) => '០១២៣៤៥៦៧៨៩'[Number(d)]);
}

const DEFAULT_2025_CLASS_IDS = new Set([
  '8A',
  '8B',
  '8C',
  '9A',
  '9B',
  '9C',
  '10A',
  '10C',
]);

function mergeWithValidDefaultScores(
  defaults: AppDatabaseState,
  loaded: AppDatabaseState
): AppDatabaseState {
  // Heal any class where id and name diverged (e.g. class id '10C' was edited to name '10B', blocking '10C' from being added)
  const healedClasses = [...(loaded.classes || defaults.classes)];
  const extraRestoredClasses: typeof healedClasses = [];

  for (let i = 0; i < healedClasses.length; i++) {
    const cls = healedClasses[i];
    const normId = normalizeClassCode(cls.id || '');
    const normName = normalizeClassCode(cls.name || '');
    if (normId && normName && normId !== normName && !cls.id.includes('__')) {
      // Update this class's id to match its new name (e.g. '10B')
      const mGrade = normName.match(/^(7|8|9|10|11|12)/);
      const inferredGrade = mGrade ? Number(mGrade[1]) : cls.gradeLevel;
      healedClasses[i] = {
        ...cls,
        id: normName,
        gradeLevel: inferredGrade,
      };
      // And restore the original class (e.g. '10C') if it isn't already in the list
      const origExists = healedClasses.some(
        (c, idx) =>
          idx !== i &&
          (normalizeClassCode(c.id) === normId || normalizeClassCode(c.name) === normId)
      );
      if (!origExists) {
        const defaultOrig = defaults.classes.find(
          (dc) => normalizeClassCode(dc.id) === normId
        );
        extraRestoredClasses.push(
          defaultOrig || {
            ...cls,
            id: normId,
            name: toKhmerClassDisplay(normId),
            termId: 'term-2025-2026',
          }
        );
      }
    }
  }

  const allStudentsSource = loaded.students || defaults.students;
  let finalClasses = [...extraRestoredClasses, ...healedClasses].map((cls) => {
    const hasDefault2025Students =
      DEFAULT_2025_CLASS_IDS.has(cls.id) &&
      allStudentsSource.some((s) => s.classId === cls.id && s.id === `stu-${cls.id}-1`);
    if (hasDefault2025Students) {
      return { ...cls, termId: 'term-2025-2026' };
    }
    return cls;
  });

  // Ensure default 10C exists for term-2026-2027 if user hasn't added any other class yet
  const has2026Class = finalClasses.some(
    (c) => (c.termId || 'term-2025-2026') === 'term-2026-2027'
  );
  if (!has2026Class) {
    const default10C = defaults.classes.find(
      (c) => c.termId === 'term-2026-2027'
    );
    if (default10C) {
      finalClasses.push(default10C);
    }
  }

  const mergedScores = { ...defaults.scores, ...(loaded.scores || {}) };
  for (const cls of finalClasses) {
    const classStudents = (loaded.students || defaults.students).filter(
      (s) => s.classId === cls.id
    );
    const existingClassScores = mergedScores[cls.id] || {};
    const hasAnyEvaluatedStudent = classStudents.some((stu) => {
      const mMap = existingClassScores[stu.id];
      return mMap && Object.values(mMap).some((v) => typeof v === 'number');
    });
    if (!hasAnyEvaluatedStudent && defaults.scores[cls.id]) {
      mergedScores[cls.id] = defaults.scores[cls.id];
    } else if (cls.gradeLevel >= 10 || /^(10|១០)/.test(cls.id)) {
      // If Grade 10 class has legacy 50-scale scores (max score <= 50), scale them to 100-point scale (× 2)
      let maxFound = 0;
      for (const stuMap of Object.values(existingClassScores)) {
        if (!stuMap) continue;
        for (const v of Object.values(stuMap)) {
          if (typeof v === 'number' && v > maxFound) {
            maxFound = v;
          }
        }
      }
      if (maxFound > 0 && maxFound <= 50) {
        const scaledClassScores: typeof existingClassScores = {};
        for (const [stuId, stuMap] of Object.entries(existingClassScores)) {
          if (!stuMap) continue;
          const scaledStuMap: Record<string, number | 'ABS' | null> = {};
          for (const [mId, val] of Object.entries(stuMap)) {
            scaledStuMap[mId] =
              typeof val === 'number' ? Math.min(100, Math.round(val * 2 * 10) / 10) : val;
          }
          scaledClassScores[stuId] = scaledStuMap;
        }
        mergedScores[cls.id] = scaledClassScores;
      }
    }
  }
  let baseStudents = loaded.students || defaults.students;
  const hasNew8C = baseStudents.some(
    (s) => s.classId === '8C' && s.studentCode === '18793'
  );
  const hasNew8B = baseStudents.some(
    (s) => s.classId === '8B' && s.name.includes('រ៉ាវុធ ពិសី')
  );
  const healedEvaluations = {
    ...defaults.standardEvaluations,
    ...(loaded.standardEvaluations || {}),
  };
  if (!hasNew8C) {
    baseStudents = [
      ...baseStudents.filter((s) => s.classId !== '8C'),
      ...defaults.students.filter((s) => s.classId === '8C'),
    ];
    healedEvaluations['8C'] = defaults.standardEvaluations['8C'];
  }
  if (!hasNew8B) {
    baseStudents = [
      ...baseStudents.filter((s) => s.classId !== '8B'),
      ...defaults.students.filter((s) => s.classId === '8B'),
    ];
    healedEvaluations['8B'] = defaults.standardEvaluations['8B'];
  }

  // Normalize any legacy numeric absentCount ('3', '4') to '✓'
  for (const cid of Object.keys(healedEvaluations)) {
    const cMap = healedEvaluations[cid] || {};
    for (const mid of Object.keys(cMap)) {
      const mMap = cMap[mid] || {};
      for (const sid of Object.keys(mMap)) {
        const ev = mMap[sid];
        if (ev && ev.absentCount && ev.absentCount !== '✓') {
          mMap[sid] = {
            ...ev,
            absentCount: Number(ev.absentCount) >= 2 ? '✓' : '',
          };
        }
      }
    }
  }

  const sortedStudents = sortAllStudentsInDatabase(baseStudents);

  // Ensure signatureDate is synced with authentic Chhankitek lunar date
  let healedSignatureDate = {
    ...defaults.signatureDate!,
    ...(loaded.signatureDate || {}),
  };
  const sigIso = parseSignatureGregorianToIso(healedSignatureDate);
  if (sigIso) {
    const realLunar = convertIsoDateToKhmerSignature(sigIso);
    healedSignatureDate = {
      ...healedSignatureDate,
      lunarDay: realLunar.lunarDay,
      lunarMonth: realLunar.lunarMonth,
      lunarYearEra: realLunar.lunarYearEra,
    };
  }

  const healedPlans = { ...(defaults.annualClassroomPlans || {}) };
  if (loaded.annualClassroomPlans) {
    for (const [cid, plan] of Object.entries(loaded.annualClassroomPlans)) {
      const defPlan = defaults.annualClassroomPlans?.[cid];
      healedPlans[cid] = {
        ...(defPlan || plan),
        ...plan,
        // Clear legacy hardcoded '17'/'8' demo overrides so attendance sheet count is used automatically
        totalStudentsOverride:
          plan.totalStudentsOverride === '17' ? '' : plan.totalStudentsOverride,
        femaleStudentsOverride:
          plan.femaleStudentsOverride === '8' ? '' : plan.femaleStudentsOverride,
        scoreRange100Text:
          plan.scoreRange100Text ||
          defPlan?.scoreRange100Text ||
          'កម្រិតពិន្ទុ : Fក្រោម៥០ពិន្ទុ Eពី៥០ ទៅ ៥៩ពិន្ទុ Dពី៦០ ទៅ៦៩ពិន្ទុ Cពី៧០ ទៅ ៧៩ពិន្ទុ Bពី៨០ ទៅ៨៩ពិន្ទុ Aពី៩០ទៅ១០០ពិន្ទុ',
        scoreRange50Text:
          plan.scoreRange50Text ||
          defPlan?.scoreRange50Text ||
          'កម្រិតពិន្ទុ : Fក្រោមពិន្ទុ២៥ Eពី២៥ ទៅ២៩ពិន្ទុ Dពី៣០ ទៅ៣៤ពិន្ទុ Cពី៣៥ ទៅ៣៩ពិន្ទុ Bពី៤០ ទៅ ៤៤ពិន្ទុ Aពី៤៥ ទៅ ៥០ពិន្ទុ',
      };
    }
  }

  const activeAcademicYear =
    (loaded.academicTerms || defaults.academicTerms)?.find(
      (t) => t.id === (loaded.currentTermId || defaults.currentTermId)
    )?.nameKh ||
    loaded.schoolInfo?.academicYear ||
    defaults.schoolInfo.academicYear;

  let mergedMonths = loaded.months && loaded.months.length > 0 ? [...loaded.months] : [...defaults.months];
  if (!mergedMonths.some((m) => m.id === 'aug')) {
    const augDefault = defaults.months.find((m) => m.id === 'aug');
    if (augDefault) {
      const sem2Idx = mergedMonths.findIndex((m) => m.id === 'sem2');
      if (sem2Idx >= 0) {
        mergedMonths.splice(sem2Idx, 0, augDefault);
      } else {
        mergedMonths.push(augDefault);
      }
    }
  }
  let mergedLessonPlans = loaded.lessonPlans && loaded.lessonPlans.length > 0
    ? [...loaded.lessonPlans]
    : [...defaults.lessonPlans];
  // Ensure the Week 1 Pinyin review plan (lp-0) is included as the first lesson plan
  if (!mergedLessonPlans.some((lp) => lp.id === 'lp-0')) {
    mergedLessonPlans = [defaults.lessonPlans[0], ...mergedLessonPlans];
  }
  // Ensure the Week 2 Shopping lesson plan (lp-week2-shopping) is included and up-to-date
  const defaultWeek2Plan = defaults.lessonPlans.find(
    (lp) => lp.id === 'lp-week2-shopping' || lp.linkedCurriculumId === 'cur-2'
  );
  if (defaultWeek2Plan) {
    const existingWeek2Index = mergedLessonPlans.findIndex(
      (lp) => lp.id === 'lp-week2-shopping' || lp.linkedCurriculumId === 'cur-2'
    );
    if (existingWeek2Index >= 0) {
      if (
        !mergedLessonPlans[existingWeek2Index].lessonTitle.includes('你买什么') ||
        !mergedLessonPlans[existingWeek2Index].lessonTitle.includes('只教生词')
      ) {
        mergedLessonPlans[existingWeek2Index] = defaultWeek2Plan;
      }
    } else {
      mergedLessonPlans.splice(1, 0, defaultWeek2Plan);
    }
  }

  // Ensure the Week 3 Shopping Sentences lesson plan (lp-week3-shopping-sentences) is included and up-to-date
  const defaultWeek3Plan = defaults.lessonPlans.find(
    (lp) => lp.id === 'lp-week3-shopping-sentences' || lp.linkedCurriculumId === 'cur-3'
  );
  if (defaultWeek3Plan) {
    const existingWeek3Index = mergedLessonPlans.findIndex(
      (lp) => lp.id === 'lp-week3-shopping-sentences' || lp.linkedCurriculumId === 'cur-3'
    );
    if (existingWeek3Index >= 0) {
      if (
        !mergedLessonPlans[existingWeek3Index].lessonTitle.includes('句型') ||
        !mergedLessonPlans[existingWeek3Index].lessonTitle.includes('你买什么')
      ) {
        mergedLessonPlans[existingWeek3Index] = defaultWeek3Plan;
      }
    } else {
      const w2Idx = mergedLessonPlans.findIndex(
        (lp) => lp.id === 'lp-week2-shopping' || lp.linkedCurriculumId === 'cur-2'
      );
      if (w2Idx >= 0) {
        mergedLessonPlans.splice(w2Idx + 1, 0, defaultWeek3Plan);
      } else {
        mergedLessonPlans.push(defaultWeek3Plan);
      }
    }
  }

  // Ensure the Week 4 Shopping Dialogues lesson plan (lp-week4-shopping-dialogues) is included and up-to-date
  const defaultWeek4Plan = defaults.lessonPlans.find(
    (lp) => lp.id === 'lp-week4-shopping-dialogues' || lp.linkedCurriculumId === 'cur-4'
  );
  if (defaultWeek4Plan) {
    const existingWeek4Index = mergedLessonPlans.findIndex(
      (lp) => lp.id === 'lp-week4-shopping-dialogues' || lp.linkedCurriculumId === 'cur-4'
    );
    if (existingWeek4Index >= 0) {
      if (
        !mergedLessonPlans[existingWeek4Index].lessonTitle.includes('对话') ||
        !mergedLessonPlans[existingWeek4Index].lessonTitle.includes('你买什么')
      ) {
        mergedLessonPlans[existingWeek4Index] = defaultWeek4Plan;
      }
    } else {
      const w3Idx = mergedLessonPlans.findIndex(
        (lp) => lp.id === 'lp-week3-shopping-sentences' || lp.linkedCurriculumId === 'cur-3'
      );
      if (w3Idx >= 0) {
        mergedLessonPlans.splice(w3Idx + 1, 0, defaultWeek4Plan);
      } else {
        mergedLessonPlans.push(defaultWeek4Plan);
      }
    }
  }

  // Ensure the Week 5 Shopping Exercises lesson plan (lp-week5-shopping-exercises) is included and up-to-date
  const defaultWeek5Plan = defaults.lessonPlans.find(
    (lp) => lp.id === 'lp-week5-shopping-exercises' || lp.linkedCurriculumId === 'cur-5'
  );
  if (defaultWeek5Plan) {
    const existingWeek5Index = mergedLessonPlans.findIndex(
      (lp) => lp.id === 'lp-week5-shopping-exercises' || lp.linkedCurriculumId === 'cur-5'
    );
    if (existingWeek5Index >= 0) {
      if (
        !mergedLessonPlans[existingWeek5Index].lessonTitle.includes('练习') ||
        !mergedLessonPlans[existingWeek5Index].lessonTitle.includes('你买什么')
      ) {
        mergedLessonPlans[existingWeek5Index] = defaultWeek5Plan;
      }
    } else {
      const w4Idx = mergedLessonPlans.findIndex(
        (lp) => lp.id === 'lp-week4-shopping-dialogues' || lp.linkedCurriculumId === 'cur-4'
      );
      if (w4Idx >= 0) {
        mergedLessonPlans.splice(w4Idx + 1, 0, defaultWeek5Plan);
      } else {
        mergedLessonPlans.push(defaultWeek5Plan);
      }
    }
  }

  // Ensure curriculumPlan has Weeks 2, 3, 4, 5 updated to Unit 3 Lesson 7 你买什么？
  let mergedCurriculum = loaded.curriculumPlan && loaded.curriculumPlan.length > 0
    ? [...loaded.curriculumPlan]
    : [...defaults.curriculumPlan];
  const cur2Index = mergedCurriculum.findIndex((c) => c.id === 'cur-2');
  const defaultCur2 = defaults.curriculumPlan.find((c) => c.id === 'cur-2');
  if (defaultCur2) {
    if (cur2Index >= 0) {
      if (
        !mergedCurriculum[cur2Index].lessonContent.includes('你买什么') ||
        !mergedCurriculum[cur2Index].lessonContent.includes('只教生词')
      ) {
        mergedCurriculum[cur2Index] = defaultCur2;
      }
    } else {
      mergedCurriculum.splice(1, 0, defaultCur2);
    }
  }

  const cur3Index = mergedCurriculum.findIndex((c) => c.id === 'cur-3');
  const defaultCur3 = defaults.curriculumPlan.find((c) => c.id === 'cur-3');
  if (defaultCur3) {
    if (cur3Index >= 0) {
      if (
        !mergedCurriculum[cur3Index].lessonContent.includes('你买什么') ||
        !mergedCurriculum[cur3Index].lessonContent.includes('只上句型')
      ) {
        mergedCurriculum[cur3Index] = defaultCur3;
      }
    } else {
      const c2Idx = mergedCurriculum.findIndex((c) => c.id === 'cur-2');
      mergedCurriculum.splice(c2Idx >= 0 ? c2Idx + 1 : 2, 0, defaultCur3);
    }
  }

  const cur4Index = mergedCurriculum.findIndex((c) => c.id === 'cur-4');
  const defaultCur4 = defaults.curriculumPlan.find((c) => c.id === 'cur-4');
  if (defaultCur4) {
    if (cur4Index >= 0) {
      if (
        !mergedCurriculum[cur4Index].lessonContent.includes('你买什么') ||
        !mergedCurriculum[cur4Index].lessonContent.includes('只上对话')
      ) {
        mergedCurriculum[cur4Index] = defaultCur4;
      }
    } else {
      const c3Idx = mergedCurriculum.findIndex((c) => c.id === 'cur-3');
      mergedCurriculum.splice(c3Idx >= 0 ? c3Idx + 1 : 3, 0, defaultCur4);
    }
  }

  const cur5Index = mergedCurriculum.findIndex((c) => c.id === 'cur-5');
  const defaultCur5 = defaults.curriculumPlan.find((c) => c.id === 'cur-5');
  if (defaultCur5) {
    if (cur5Index >= 0) {
      if (
        !mergedCurriculum[cur5Index].lessonContent.includes('你买什么') ||
        !mergedCurriculum[cur5Index].lessonContent.includes('44') ||
        !mergedCurriculum[cur5Index].lessonContent.includes('全完成课本')
      ) {
        mergedCurriculum[cur5Index] = defaultCur5;
      }
    } else {
      const c4Idx = mergedCurriculum.findIndex((c) => c.id === 'cur-4');
      mergedCurriculum.splice(c4Idx >= 0 ? c4Idx + 1 : 4, 0, defaultCur5);
    }
  }

  // Ensure Lesson 8 lesson plans for December (Weeks 6, 7, 8, 9) are included and up-to-date
  const decPlanKeys = [
    { id: 'lp-week6-apple-vocab', curId: 'cur-6', kw: '生词' },
    { id: 'lp-week7-apple-sentences', curId: 'cur-7', kw: '句型' },
    { id: 'lp-week8-apple-dialogues', curId: 'cur-8', kw: '对话' },
    { id: 'lp-week9-apple-exercises', curId: 'cur-9', kw: '练习' },
  ];

  for (const dp of decPlanKeys) {
    const defaultPlan = defaults.lessonPlans.find(
      (lp) => lp.id === dp.id || lp.linkedCurriculumId === dp.curId
    );
    if (defaultPlan) {
      const existingIdx = mergedLessonPlans.findIndex(
        (lp) => lp.id === dp.id || lp.linkedCurriculumId === dp.curId
      );
      if (existingIdx >= 0) {
        if (
          !mergedLessonPlans[existingIdx].lessonTitle.includes('苹果多少钱一斤') ||
          !mergedLessonPlans[existingIdx].lessonTitle.includes(dp.kw)
        ) {
          mergedLessonPlans[existingIdx] = defaultPlan;
        }
      } else {
        mergedLessonPlans.push(defaultPlan);
      }
    }
  }

  // Ensure curriculumPlan has Weeks 6, 7, 8, 9 for Lesson 8 in December
  const decCurKeys = [
    { id: 'cur-6', kw: '生词' },
    { id: 'cur-7', kw: '句型' },
    { id: 'cur-8', kw: '对话' },
    { id: 'cur-9', kw: '练习' },
  ];

  for (const dc of decCurKeys) {
    const defaultCur = defaults.curriculumPlan.find((c) => c.id === dc.id);
    if (defaultCur) {
      const curIdx = mergedCurriculum.findIndex((c) => c.id === dc.id);
      if (curIdx >= 0) {
        if (
          !mergedCurriculum[curIdx].lessonContent.includes('苹果多少钱一斤') ||
          !mergedCurriculum[curIdx].lessonContent.includes(dc.kw)
        ) {
          mergedCurriculum[curIdx] = defaultCur;
        }
      } else {
        mergedCurriculum.push(defaultCur);
      }
    }
  }

  // Ensure Lesson 9 lesson plans for January 2027 (Weeks 10, 11, 12, 13) are included and up-to-date
  const janPlanKeys = [
    { id: 'lp-week10-clothes-vocab', curId: 'cur-10', kw: '生词' },
    { id: 'lp-week11-clothes-sentences', curId: 'cur-11', kw: '句型' },
    { id: 'lp-week12-clothes-dialogues', curId: 'cur-12', kw: '对话' },
    { id: 'lp-week13-clothes-exercises', curId: 'cur-13', kw: '练习' },
  ];

  for (const jp of janPlanKeys) {
    const defaultPlan = defaults.lessonPlans.find(
      (lp) => lp.id === jp.id || lp.linkedCurriculumId === jp.curId
    );
    if (defaultPlan) {
      const existingIdx = mergedLessonPlans.findIndex(
        (lp) => lp.id === jp.id || lp.linkedCurriculumId === jp.curId
      );
      if (existingIdx >= 0) {
        if (
          !mergedLessonPlans[existingIdx].lessonTitle.includes('这件衣服比那件贵一点儿') ||
          !mergedLessonPlans[existingIdx].lessonTitle.includes(jp.kw)
        ) {
          mergedLessonPlans[existingIdx] = defaultPlan;
        }
      } else {
        mergedLessonPlans.push(defaultPlan);
      }
    }
  }

  // Ensure curriculumPlan has Weeks 10, 11, 12, 13 for Lesson 9 in January 2027
  const janCurKeys = [
    { id: 'cur-10', kw: '生词' },
    { id: 'cur-11', kw: '句型' },
    { id: 'cur-12', kw: '对话' },
    { id: 'cur-13', kw: '练习' },
  ];

  for (const jc of janCurKeys) {
    const defaultCur = defaults.curriculumPlan.find((c) => c.id === jc.id);
    if (defaultCur) {
      const curIdx = mergedCurriculum.findIndex((c) => c.id === jc.id);
      if (curIdx >= 0) {
        if (
          !mergedCurriculum[curIdx].lessonContent.includes('这件衣服比那件贵一点儿') ||
          !mergedCurriculum[curIdx].lessonContent.includes(jc.kw)
        ) {
          mergedCurriculum[curIdx] = defaultCur;
        }
      } else {
        mergedCurriculum.push(defaultCur);
      }
    }
  }

  // Ensure Lesson 10 lesson plans for February 2027 (Weeks 14, 15, 16, 17) are included and up-to-date
  const febPlanKeys = [
    { id: 'lp-week14-schedule-vocab', curId: 'cur-14', kw: '生词' },
    { id: 'lp-week15-schedule-sentences', curId: 'cur-15', kw: '句型' },
    { id: 'lp-week16-schedule-dialogues', curId: 'cur-16', kw: '对话' },
    { id: 'lp-week17-schedule-exercises', curId: 'cur-17', kw: '练习' },
  ];

  for (const fp of febPlanKeys) {
    const defaultPlan = defaults.lessonPlans.find(
      (lp) => lp.id === fp.id || lp.linkedCurriculumId === fp.curId
    );
    if (defaultPlan) {
      const existingIdx = mergedLessonPlans.findIndex(
        (lp) => lp.id === fp.id || lp.linkedCurriculumId === fp.curId
      );
      if (existingIdx >= 0) {
        if (
          !mergedLessonPlans[existingIdx].lessonTitle.includes('你今天上了什么课') ||
          !mergedLessonPlans[existingIdx].lessonTitle.includes(fp.kw)
        ) {
          mergedLessonPlans[existingIdx] = defaultPlan;
        }
      } else {
        mergedLessonPlans.push(defaultPlan);
      }
    }
  }

  // Ensure curriculumPlan has Weeks 14, 15, 16, 17 for Lesson 10 in February 2027
  const febCurKeys = [
    { id: 'cur-14', kw: '生词' },
    { id: 'cur-15', kw: '句型' },
    { id: 'cur-16', kw: '对话' },
    { id: 'cur-17', kw: '练习' },
  ];

  for (const fc of febCurKeys) {
    const defaultCur = defaults.curriculumPlan.find((c) => c.id === fc.id);
    if (defaultCur) {
      const curIdx = mergedCurriculum.findIndex((c) => c.id === fc.id);
      if (curIdx >= 0) {
        if (
          !mergedCurriculum[curIdx].lessonContent.includes('你今天上了什么课') ||
          !mergedCurriculum[curIdx].lessonContent.includes(fc.kw)
        ) {
          mergedCurriculum[curIdx] = defaultCur;
        }
      } else {
        mergedCurriculum.push(defaultCur);
      }
    }
  }

  // Ensure Lesson 11 lesson plans for March 2027 (Weeks 18, 19, 20, 21) are included and up-to-date
  const marPlanKeys = [
    { id: 'lp-week18-hard-vocab', curId: 'cur-18', kw: '生词' },
    { id: 'lp-week19-hard-sentences', curId: 'cur-19', kw: '句型' },
    { id: 'lp-week20-hard-dialogues', curId: 'cur-20', kw: '对话' },
    { id: 'lp-week21-hard-exercises', curId: 'cur-21', kw: '练习' },
  ];

  for (const mp of marPlanKeys) {
    const defaultPlan = defaults.lessonPlans.find(
      (lp) => lp.id === mp.id || lp.linkedCurriculumId === mp.curId
    );
    if (defaultPlan) {
      const existingIdx = mergedLessonPlans.findIndex(
        (lp) => lp.id === mp.id || lp.linkedCurriculumId === mp.curId
      );
      if (existingIdx >= 0) {
        if (
          !mergedLessonPlans[existingIdx].lessonTitle.includes('汉语难不难') ||
          !mergedLessonPlans[existingIdx].lessonTitle.includes(mp.kw)
        ) {
          mergedLessonPlans[existingIdx] = defaultPlan;
        }
      } else {
        mergedLessonPlans.push(defaultPlan);
      }
    }
  }

  // Ensure curriculumPlan has Weeks 18, 19, 20, 21 for Lesson 11 in March 2027
  const marCurKeys = [
    { id: 'cur-18', kw: '生词' },
    { id: 'cur-19', kw: '句型' },
    { id: 'cur-20', kw: '对话' },
    { id: 'cur-21', kw: '练习' },
  ];

  for (const mc of marCurKeys) {
    const defaultCur = defaults.curriculumPlan.find((c) => c.id === mc.id);
    if (defaultCur) {
      const curIdx = mergedCurriculum.findIndex((c) => c.id === mc.id);
      if (curIdx >= 0) {
        if (
          !mergedCurriculum[curIdx].lessonContent.includes('汉语难不难') ||
          !mergedCurriculum[curIdx].lessonContent.includes(mc.kw)
        ) {
          mergedCurriculum[curIdx] = defaultCur;
        }
      } else {
        mergedCurriculum.push(defaultCur);
      }
    }
  }

  // Ensure weeklyLogs are loaded and contain Week 2 Lesson 7 vocabulary logs
  let mergedWeeklyLogs = loaded.weeklyLogs && loaded.weeklyLogs.length > 0
    ? [...loaded.weeklyLogs]
    : [...defaults.weeklyLogs];
  if (
    mergedWeeklyLogs.some(
      (w) =>
        w.dateStr.includes('2025') ||
        (w.unitTitle.includes('买东西') && !w.lessonTitle.includes('你买什么')) ||
        w.lessonTitle.includes('你是谁') ||
        w.lessonTitle.includes('你好')
    )
  ) {
    mergedWeeklyLogs = [...defaults.weeklyLogs];
  }

  // If user only had week 1 logs previously, include Week 2 Lesson 7 vocabulary logs at the top
  const hasWeek2Vocab = mergedWeeklyLogs.some(
    (w) =>
      (w.weekLabel && w.weekLabel.includes('សប្តាហ៍ទី២')) ||
      (w.lessonTitle && w.lessonTitle.includes('你买什么')) ||
      (w.contentDetails && (w.contentDetails.includes('买 (mǎi') || w.contentDetails.includes('1.买')))
  );
  if (!hasWeek2Vocab) {
    const week2Defaults = defaults.weeklyLogs.filter(
      (w) => w.weekLabel?.includes('សប្តាហ៍ទី២') || w.id.startsWith('wlog-w2-')
    );
    mergedWeeklyLogs = [...week2Defaults, ...mergedWeeklyLogs];
  }

  // Adjust Week 2 Monday holiday: Monday 09/11/2026 classes generate on Tuesday 10/11/2026
  mergedWeeklyLogs = mergedWeeklyLogs.map((log) => {
    if (
      (log.weekLabel?.includes('សប្តាហ៍ទី២') || log.lessonTitle?.includes('你买什么')) &&
      (log.dateStr === '09/11/2026' || log.weekdayKh === 'ចន្ទ')
    ) {
      return {
        ...log,
        dateStr: '10/11/2026',
        weekdayKh: 'អង្គារ',
      };
    }
    return log;
  });

  // Synchronize teaching hours in weeklyLogs with each class's real scheduleTime
  mergedWeeklyLogs = mergedWeeklyLogs.map((log) => {
    const matchedClass = finalClasses.find(
      (c) =>
        cleanClassDisplayCode(c.name || c.id) === cleanClassDisplayCode(log.classId) ||
        c.id === log.classId
    );
    if (matchedClass && matchedClass.scheduleTime) {
      return {
        ...log,
        timeRange: matchedClass.scheduleTime,
      };
    }
    return log;
  });

  let mergedDailyHomework = loaded.dailyHomeworkRecords && loaded.dailyHomeworkRecords.length > 0
    ? [...loaded.dailyHomeworkRecords]
    : [...(defaults.dailyHomeworkRecords || [])];

  // Heal any homework records that have generic placeholders or missing pinyin assignments
  mergedDailyHomework = mergedDailyHomework.map((r) => {
    const isGenericLesson =
      !r.lessonTitle ||
      r.lessonTitle.includes('មេរៀនភាសាចិនប្រចាំសប្តាហ៍') ||
      r.lessonTitle.includes('មេរៀនប្រចាំសប្តាហ៍') ||
      r.lessonTitle.includes('我的家') ||
      r.lessonTitle.includes('多少钱') ||
      r.lessonTitle.includes('今天几月几号');

    const isGenericHomework =
      !r.homeworkTitle ||
      r.homeworkTitle.includes('កិច្ចការផ្ទះភាសាចិនប្រចាំថ្ងៃ') ||
      r.homeworkTitle.includes('日常汉语作业') ||
      r.homeworkTitle.trim() === '';

    if (isGenericLesson || isGenericHomework) {
      return {
        ...r,
        assigned: true,
        lessonUnitTitle: r.lessonUnitTitle || '汉语基础（复习）· មូលដ្ឋានគ្រឹះភាសាចិន (រំលឹកមេរៀន)',
        lessonTitle: isGenericLesson
          ? '复习拼音：声母与韵母 · រំលឹកភីនអ៊ីន (ព្យញ្ជនៈ ២៣ និង ស្រៈ ២៤)'
          : r.lessonTitle,
        homeworkTitle: isGenericHomework
          ? 'ចម្លងភីនអ៊ីន ៥ដង (抄写声母和韵母各5遍)'
          : r.homeworkTitle,
        homeworkDetail:
          !r.homeworkDetail || r.homeworkDetail.includes('ហាត់សរសេរពាក្យថ្មី')
            ? 'ចម្លងព្យញ្ជនៈ (声母) ២៣ និង ស្រៈ (韵母) ២៤ ចំនួន ៥ដង ប្រគល់នៅសប្តាហ៍ក្រោយ។ (抄写声母和韵母各5遍，下周交)'
            : r.homeworkDetail,
        dueDate: !r.dueDate || r.dueDate === 'សប្តាហ៍ក្រោយ' ? 'សប្តាហ៍ក្រោយ (下周交)' : r.dueDate,
        syncedToWeeklyLog: true,
      };
    }
    return r;
  });

  if (mergedDailyHomework.length === 0) {
    mergedDailyHomework = generateDefaultDailyHomeworkRecords(finalClasses, sortedStudents);
  }

  let healedWeeklyLogMeta = loaded.weeklyLogMeta || defaults.weeklyLogMeta;
  if (!healedWeeklyLogMeta || healedWeeklyLogMeta.fridayDateStr?.includes('2025')) {
    healedWeeklyLogMeta = defaults.weeklyLogMeta;
  }

  return {
    ...defaults,
    ...loaded,
    months: mergedMonths,
    lessonPlans: mergedLessonPlans,
    curriculumPlan: mergedCurriculum,
    weeklyLogs: mergedWeeklyLogs,
    weeklyLogMeta: healedWeeklyLogMeta,
    dailyHomeworkRecords: mergedDailyHomework,
    classes: finalClasses,
    students: sortedStudents,
    scores: mergedScores,
    standardEvaluations: healedEvaluations,
    signatureDate: healedSignatureDate,
    sheetSignatureDates: loaded.sheetSignatureDates || defaults.sheetSignatureDates || {},
    annualClassroomPlans: healedPlans,
    performanceAgreementMeta:
      loaded.performanceAgreementMeta || defaults.performanceAgreementMeta,
    schoolInfo: {
      ...loaded.schoolInfo,
      schoolNameZh: '',
      principalName:
        loaded.schoolInfo?.principalName === 'នុត ងួនលី'
          ? ''
          : loaded.schoolInfo?.principalName || '',
    },
  };
}

export async function loadStateFromIndexedDB(): Promise<AppDatabaseState> {
  const defaults = createInitialAppDatabaseState();
  try {
    const db = await openDatabase();
    return await new Promise<AppDatabaseState>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(RECORD_KEY);
      req.onsuccess = () => {
        const res = req.result as AppDatabaseState | undefined;
        if (
          res &&
          res.version === '2.3.2-chinese-subject' &&
          Array.isArray(res.classes) &&
          Array.isArray(res.students)
        ) {
          resolve(mergeWithValidDefaultScores(defaults, res));
        } else {
          resolve(defaults);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppDatabaseState;
        if (parsed.version === '2.3.2-chinese-subject' && Array.isArray(parsed.classes)) {
          return mergeWithValidDefaultScores(defaults, parsed);
        }
      }
    } catch {
      // ignore fallback error
    }
    return defaults;
  }
}

export async function saveStateToIndexedDB(state: AppDatabaseState): Promise<void> {
  const payload: AppDatabaseState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota error
  }

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(payload, RECORD_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // fallback already written
  }

  // Also silently sync to server cloud endpoint in background so deployed URL can fetch it
  try {
    fetch('/api/cloud-sync/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: payload }),
    }).catch(() => {
      // offline or standalone
    });
  } catch {
    // ignore
  }
}

export async function syncStateToCloud(state: AppDatabaseState): Promise<boolean> {
  try {
    const res = await fetch('/api/cloud-sync/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
    const json = (await res.json()) as { ok: boolean };
    return Boolean(json.ok);
  } catch {
    return false;
  }
}

export async function loadStateFromCloud(): Promise<AppDatabaseState | null> {
  try {
    const res = await fetch('/api/cloud-sync/load');
    const json = (await res.json()) as { ok: boolean; data: AppDatabaseState | null };
    if (json.ok && json.data) {
      return json.data;
    }
    return null;
  } catch {
    return null;
  }
}

export function exportToJsonFile(state: AppDatabaseState): void {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateSlug = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `ChineseSubject_LimDane_${dateSlug}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importFromJsonFile(file: File): Promise<AppDatabaseState> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Partial<AppDatabaseState>;
  if (!parsed || !parsed.schoolInfo || !Array.isArray(parsed.students)) {
    throw new Error('ឯកសារ JSON មិនត្រឹមត្រូវទេ (Invalid JSON backup structure).');
  }
  const defaults = createInitialAppDatabaseState();
  const sortedStudents = sortAllStudentsInDatabase(parsed.students || defaults.students);
  return {
    ...defaults,
    ...parsed,
    students: sortedStudents,
    schoolInfo: {
      ...defaults.schoolInfo,
      ...parsed.schoolInfo,
      schoolNameZh: '',
    },
    version: '2.3.2-chinese-subject',
    updatedAt: new Date().toISOString(),
  };
}

export function exportToExcelWorkbook(state: AppDatabaseState): void {
  void downloadOfficialCambodiaWorkbook(state);
}

export function exportLegacySimpleWorkbook(state: AppDatabaseState): void {
  const wb = XLSX.utils.book_new();

  // 1. School & Teacher Info
  const infoRows = [
    ['Field', 'Value'],
    ['មន្ទីរអប់រំ (Department)', state.schoolInfo.departmentKh],
    ['ការិយាល័យអប់រំ (Office)', state.schoolInfo.officeKh],
    ['សាលារៀន (School Khmer)', state.schoolInfo.schoolNameKh],
    ['នាយកសាលា (Principal)', state.schoolInfo.principalName],
    ['គ្រូមុខវិជ្ជា (Subject Teacher)', state.schoolInfo.teacherName],
    ['មុខវិជ្ជា (Subject)', `${state.schoolInfo.subjectNameKh} (${state.schoolInfo.subjectNameZh})`],
    ['ពិន្ទុអតិបរមា (Max Score)', state.schoolInfo.maxScore],
    ['ឆ្នាំសិក្សា (Academic Year)', state.schoolInfo.academicYear],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(infoRows), 'TeacherInfo');

  // 2. Classes Sheet
  const classRows = state.classes.map((c) => ({
    ClassID: c.id,
    ClassName: c.name,
    GradeLevel: c.gradeLevel,
    ScheduleDay: c.scheduleDayKh,
    ScheduleTime: c.scheduleTime,
    WeeklyHours: c.weeklyHoursLabel,
    Textbook: c.textbookName,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(classRows), 'Classes');

  // 3. All Students Sheet
  const studentRows = state.students.map((s) => ({
    ClassID: s.classId,
    StudentCode: s.studentCode,
    KhmerName: s.name,
    ChineseName: s.chineseName,
    Gender: s.gender === 'F' ? 'ស' : 'ប',
    DOB: s.dob,
    Status: s.status,
    Note: s.note,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(studentRows), 'Students');

  // 4. Score Sheet per Class (8A..10C)
  const enabledMonths = state.months.filter((m) => m.enabled);
  const monthIds = enabledMonths.map((m) => m.id);

  for (const cls of state.classes) {
    const classStudents = sortStudentsByKhmerName(
      state.students.filter((s) => s.classId === cls.id)
    );
    const computed = calculateClassChineseResults(
      classStudents,
      state.scores[cls.id],
      monthIds,
      state.schoolInfo.maxScore,
      state.gradeThresholds,
      true
    );

    const header = [
      'ល.រ',
      'អត្តលេខ',
      'គោត្តនាម-នាម',
      'ឈ្មោះចិន (姓名)',
      'ភេទ',
      ...enabledMonths.map((m) => `${m.id}:${m.nameKh}`),
      'មធ្យមភាគ',
      'ចំ.ថ្នាក់',
      'និទ្ទេស',
    ];

    const rows = computed.map((r, idx) => [
      idx + 1,
      r.studentCode,
      r.name,
      r.chineseName,
      r.gender === 'F' ? 'ស' : 'ប',
      ...enabledMonths.map((m) => {
        const val = r.monthScores[m.id];
        return val === null || val === undefined ? '' : val;
      }),
      r.averageScore !== null ? r.averageScore : '',
      r.rank !== null ? r.rank : '',
      r.grade,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, `Scores_${cls.id}`);
  }

  const dateSlug = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `ChineseSubject_LimDane_${dateSlug}.xlsx`);
}

export async function importFromExcelWorkbook(
  file: File,
  currentState: AppDatabaseState
): Promise<AppDatabaseState> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const nextState: AppDatabaseState = JSON.parse(JSON.stringify(currentState));

  if (wb.SheetNames.includes('Students')) {
    const rawStudents = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets['Students']);
    if (rawStudents.length > 0) {
      const parsed: Student[] = rawStudents.map((row, idx) => {
        const classId = String(row['ClassID'] || '8A').trim();
        const code = String(row['StudentCode'] || String(idx + 1).padStart(2, '0')).trim();
        const genderRaw = String(row['Gender'] || 'ស').trim().toUpperCase();
        const gender = genderRaw === 'M' || genderRaw === 'ប' || genderRaw === 'ប្រុស' ? 'M' : 'F';
        return {
          id: `stu-${classId}-${idx + 1}`,
          classId,
          studentCode: code,
          name: String(row['KhmerName'] || row['គោត្តនាម-នាម'] || ''),
          chineseName: String(row['ChineseName'] || row['ឈ្មោះចិន (姓名)'] || ''),
          gender,
          dob: String(row['DOB'] || ''),
          status: 'active',
          note: String(row['Note'] || ''),
        };
      });
      nextState.students = sortAllStudentsInDatabase(parsed);
    }
  }

  for (const sheetName of wb.SheetNames) {
    if (sheetName.startsWith('Scores_')) {
      const classId = sheetName.replace('Scores_', '').trim();
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName]);
      if (!nextState.scores[classId]) nextState.scores[classId] = {};
      const classStudents = nextState.students.filter((s) => s.classId === classId);

      rows.forEach((row, idx) => {
        const stu =
          classStudents.find(
            (s) =>
              s.studentCode === String(row['អត្តលេខ'] || '') ||
              s.name === String(row['គោត្តនាម-នាម'] || '')
          ) || classStudents[idx];
        if (!stu) return;
        if (!nextState.scores[classId][stu.id]) nextState.scores[classId][stu.id] = {};

        for (const m of nextState.months) {
          const key = `${m.id}:${m.nameKh}`;
          const rawVal = row[key] ?? row[m.nameKh] ?? row[m.id];
          if (rawVal === undefined || rawVal === '') continue;
          if (String(rawVal).toUpperCase() === 'ABS') {
            nextState.scores[classId][stu.id][m.id] = 'ABS';
          } else {
            const num = Number(rawVal);
            const scoreVal: ScoreValue = !Number.isNaN(num) ? num : null;
            nextState.scores[classId][stu.id][m.id] = scoreVal;
          }
        }
      });
    }
  }

  nextState.updatedAt = new Date().toISOString();
  return nextState;
}
