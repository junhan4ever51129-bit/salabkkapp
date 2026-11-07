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

  // Ensure weeklyLogs are updated to Week 1 Pinyin review if containing legacy 2025 dates or non-pinyin week 1
  let mergedWeeklyLogs = loaded.weeklyLogs && loaded.weeklyLogs.length > 0
    ? [...loaded.weeklyLogs]
    : [...defaults.weeklyLogs];
  if (
    mergedWeeklyLogs.some(
      (w) =>
        w.dateStr.includes('2025') ||
        w.unitTitle.includes('买东西') ||
        w.lessonTitle.includes('你是谁') ||
        w.lessonTitle.includes('你好')
    )
  ) {
    mergedWeeklyLogs = [...defaults.weeklyLogs];
  }

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
  if (
    mergedDailyHomework.some(
      (r) =>
        Boolean(r.date?.includes('2025')) ||
        Boolean(r.lessonTitle?.includes('我的家')) ||
        Boolean(r.lessonTitle?.includes('多少钱')) ||
        Boolean(r.lessonTitle?.includes('今天几月几号'))
    )
  ) {
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
