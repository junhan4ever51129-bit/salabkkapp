import {
  AppDatabaseState,
  GradeLetter,
} from '../types';
import {
  calculateChineseGradeDistribution,
  calculateClassChineseResults,
  calculateClassMonthlyBreakdownRows,
  calculateModelSchoolChecklistStats,
  calculateScopeMonthlyPerformanceSummary,
  deriveTeacherDutyReportFromLiveRecords,
  formatNumeral,
  formatPaddedScore,
  getClassMaxScore,
  getResolvedAnnualClassroomPlan,
  getResolvedMonthlyScoreConfig,
  isoToDdMmYyyy,
  resolveStudentStandardEvaluation,
  sortStudentsByKhmerName,
} from './calculations';
import { formatSignatureLinesMarkdown } from '../components/SignatureDateEditor';
import {
  generateDefaultDailyHomeworkRecords,
} from '../data/defaultData';

export type MarkdownDocSection =
  | 'all'
  | 'roster_schedule'
  | 'scores'
  | 'monthly_breakdown'
  | 'student_stats'
  | 'teacher_checklist'
  | 'annual_classroom_plan'
  | 'attendance'
  | 'homework_lesson'
  | 'curriculum'
  | 'weekly_log'
  | 'lesson_plan'
  | 'performance_reflection'
  | 'model_school_duty';

export function getOfficialHeaderMarkdown(state: AppDatabaseState): string {
  return [
    `<div class="a4-official-header">`,
    `  <div class="header-left">`,
    `    <div class="moul">${state.schoolInfo.departmentKh}</div>`,
    `    <div>${state.schoolInfo.officeKh}</div>`,
    `    <div class="moul">${state.schoolInfo.schoolNameKh}</div>`,
    `  </div>`,
    `  <div class="header-right">`,
    `    <div class="moul">ព្រះរាជាណាចក្រកម្ពុជា</div>`,
    `    <div class="moul">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>`,
    `    <div class="tacteing">~~~•~~~</div>`,
    `  </div>`,
    `</div>`,
  ].join('\n');
}

export function getSignatureBlockMarkdown(
  state: AppDatabaseState,
  includePrincipal = true,
  customLunarDate?: string,
  customGregorianDate?: string
): string {
  const sigLines = formatSignatureLinesMarkdown(
    state.signatureDate,
    state.schoolInfo.teacherName
  );
  const lunarLine = customLunarDate || sigLines[0];
  const gregorianLine = customGregorianDate || sigLines[1];

  return [
    `<div class="a4-official-signature">`,
    `  <div class="sig-left">`,
    includePrincipal
      ? `    <div class="sig-bold">បានឃើញ និងឯកភាព</div>\n    <div class="moul">ជ.នាយកវិទ្យាល័យ</div>\n    <div class="sig-space"></div>\n    <div class="sig-bold">${state.schoolInfo.principalName}</div>`
      : ``,
    `  </div>`,
    `  <div class="sig-right">`,
    `    <div>${lunarLine}</div>`,
    `    <div>${gregorianLine}</div>`,
    `    <div class="sig-bold">គ្រូមុខវិជ្ជា</div>`,
    `    <div class="sig-space"></div>`,
    `    <div class="sig-bold">${state.schoolInfo.teacherName}</div>`,
    `  </div>`,
    `</div>`,
  ].join('\n');
}

export function generateRosterAndScheduleMarkdown(
  state: AppDatabaseState,
  _selectedClassId: string
): string {
  const lines: string[] = [
    getOfficialHeaderMarkdown(state),
    ``,
    `# បញ្ជីឈ្មោះសិស្ស និងកាលវិភាគបង្រៀនភាសាចិន`,
    `## ឆ្នាំសិក្សា ${state.schoolInfo.academicYear}`,
    ``,
    `- **គ្រូមុខវិជ្ជា ៖** អ្នកគ្រូ **${state.schoolInfo.teacherName}**`,
    `- **មុខវិជ្ជា ៖** **${state.schoolInfo.subjectNameKh}**`,
    ``,
    `### ១. កាលវិភាគបង្រៀនមុខវិជ្ជាភាសាចិនទាំង ${formatNumeral(state.classes.length, state.useKhmerNumerals)} ថ្នាក់`,
    ``,
    `| ល.រ | ថ្នាក់ទី | កម្រិតថ្នាក់ | ថ្ងៃបង្រៀន | ម៉ោងបង្រៀន | ចំនួនម៉ោង/សប្តាហ៍ | សៀវភៅគោល | សិស្សសរុប (ស្រី) |`,
    `| :---: | :---: | :---: | :--- | :---: | :---: | :--- | :---: |`,
  ];

  state.classes.forEach((c, idx) => {
    const stus = state.students.filter((s) => s.classId === c.id);
    const fem = stus.filter((s) => s.gender === 'F').length;
    const cleanClassName = (c.name || c.id).replace(/^ថ្នាក់ទី\s*/g, '').trim();
    const cleanDayKh = (c.scheduleDayKh || '').replace(/^ថ្ងៃ\s*/g, '').trim();
    const cleanTime = (c.scheduleTime || '').replace(/\r?\n/g, ' ').trim();
    const cleanHours = (c.weeklyHoursLabel || '').replace(/\r?\n/g, ' ').trim();
    const cleanBook = (c.textbookName || '').replace(/\r?\n/g, ' ').trim();
    lines.push(
      `| ${formatNumeral(idx + 1, state.useKhmerNumerals)} | **${cleanClassName}** | ${c.gradeLevel} | ${cleanDayKh} | ${cleanTime} | ${cleanHours} | ${cleanBook} | **${stus.length} នាក់** (${fem}) |`
    );
  });

  state.classes.forEach((cls, cIdx) => {
    const classStudents = sortStudentsByKhmerName(
      state.students.filter((s) => s.classId === cls.id)
    );
    const femaleCount = classStudents.filter((s) => s.gender === 'F').length;
    const sectionPrefix =
      state.classes.length > 1
        ? `២.${formatNumeral(cIdx + 1, state.useKhmerNumerals)}`
        : `២`;

    lines.push(
      ``,
      `### ${sectionPrefix}. បញ្ជីរាយនាមសិស្សថ្នាក់ទី ${cls.name} (សរុប ${classStudents.length} នាក់, ស្រី ${femaleCount} នាក់)`,
      ``,
      `- **ថ្ងៃបង្រៀន ៖** ${cls.scheduleDayKh} · **ម៉ោង ៖** ${cls.scheduleTime} (${cls.weeklyHoursLabel})`,
      `- **សៀវភៅគោល ៖** ${cls.textbookName}`,
      ``,
      `| ល.រ | អត្តលេខ | គោត្តនាម-នាម | ភេទ | ថ្ងៃខែឆ្នាំកំណើត | កំណត់សម្គាល់ |`,
      `| :---: | :---: | :--- | :---: | :---: | :--- |`
    );

    classStudents.forEach((stu, idx) => {
      lines.push(
        `| ${formatNumeral(idx + 1, state.useKhmerNumerals)} | ${stu.studentCode} | **${stu.name}** | ${stu.gender === 'F' ? 'ស' : 'ប'} | ${stu.dob || '-'} | ${stu.note || '-'} |`
      );
    });
  });

  lines.push(getSignatureBlockMarkdown(state, true));
  return lines.join('\n');
}

export function generateScoresMarkdown(
  state: AppDatabaseState,
  _selectedClassId: string,
  selectedMonthId: string
): string {
  const enabledMonths = state.months.filter((m) => m.enabled);
  const monthIds = enabledMonths.map((m) => m.id);
  const activeMonth =
    enabledMonths.find((m) => m.id === selectedMonthId) || enabledMonths[0];

  const monthHeaders = enabledMonths
    .map((m) => m.nameKh.replace(/^ខែ\s*/g, '').trim())
    .join(' | ');
  const monthAligns = enabledMonths.map(() => ':---:').join(' | ');

  const classPages = state.classes.map((cls) => {
    const classMaxScore = getClassMaxScore(cls);
    const classStudents = sortStudentsByKhmerName(
      state.students.filter((s) => s.classId === cls.id)
    );
    const computedRows = calculateClassChineseResults(
      classStudents,
      state.scores[cls.id],
      monthIds,
      classMaxScore,
      state.gradeThresholds,
      true
    );
    const gradeDist = calculateChineseGradeDistribution(computedRows);

    const lines: string[] = [
      getOfficialHeaderMarkdown(state),
      ``,
      `# បញ្ជីស្រង់ពិន្ទុសិស្សថ្នាក់ទី ${cls.name}`,
      `## ឆ្នាំសិក្សា ${state.schoolInfo.academicYear}`,
      ``,
      `- **គ្រូមុខវិជ្ជា ៖** អ្នកគ្រូ **${state.schoolInfo.teacherName}** · **មុខវិជ្ជា ៖** **${state.schoolInfo.subjectNameKh}** (ពិន្ទុពេញ **${classMaxScore}**)`,
      `- **សិស្សសរុប ៖** **${gradeDist.totalActive} នាក់** (ស្រី **${gradeDist.femaleActive} នាក់**)`,
      `- **សង្ខេបនិទ្ទេស ៖** A: **${gradeDist.grades.A.total}** · B: **${gradeDist.grades.B.total}** · C: **${gradeDist.grades.C.total}** · D: **${gradeDist.grades.D.total}** · E: **${gradeDist.grades.E.total}** · F: **${gradeDist.grades.F.total}**`,
      ``,
      `| ល.រ | គោត្តនាម-នាម | ភេទ | ${monthHeaders} | មធ្យមភាគ | ចំ.ថ្នាក់ | និទ្ទេស |`,
      `| :---: | :--- | :---: | ${monthAligns} | :---: | :---: | :---: |`,
    ];

    computedRows.forEach((row, idx) => {
      const mVals = enabledMonths
        .map((m) => {
          const v = row.monthScores[m.id];
          return v === null || v === undefined ? '-' : String(v);
        })
        .join(' | ');
      const avgStr =
        row.averageScore !== null
          ? formatPaddedScore(row.averageScore, state.useKhmerNumerals)
          : '-';
      const rankStr =
        row.rank !== null
          ? `${formatPaddedScore(row.rank, state.useKhmerNumerals)}${row.isTied ? '=' : ''}`
          : '-';
      lines.push(
        `| ${formatNumeral(idx + 1, state.useKhmerNumerals)} | **${row.name}** | ${row.gender === 'F' ? 'ស' : 'ប'} | ${mVals} | **${avgStr}** | **${rankStr}** | **${row.grade}** |`
      );
    });

    lines.push(
      ``,
      `### សូចនាករស្តង់ដាសាលាមធ្យមសិក្សាទុតិយភូមិ · តារាងស្ថិតិសិស្សមកពីថ្នាក់ទី ${cls.name} (ខែ${activeMonth?.nameKh})`,
      `#### ការដាក់ពិន្ទុលើ បំណិនសម្បទា និង ចរិយាសម្បទា ( មួយមុខយកម្តង )`,
      ``,
      `| ល.រ | គោត្តនាម និង នាម | ភេទ | អាយុ | រៀនខ្សោយ | ឈប់ច្រើន | បំណិនសម្បទា | ចរិយាសម្បទា | ផ្សេងៗ |`,
      `| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |`
    );

    classStudents.forEach((stu, idx) => {
      const ev = resolveStudentStandardEvaluation(
        state,
        cls.id,
        activeMonth?.id || 'nov',
        stu
      );
      const isFreqAbs = Boolean(
        ev.absentCount && ev.absentCount.trim() !== '' && ev.absentCount !== '0'
      );
      const skillStr =
        ev.skillScore !== null && ev.skillScore !== undefined
          ? `**${ev.skillScore}**`
          : '';
      const attStr =
        ev.attitudeScore !== null && ev.attitudeScore !== undefined
          ? `**${ev.attitudeScore}**`
          : '';
      lines.push(
        `| ${formatNumeral(idx + 1, state.useKhmerNumerals)} | **${stu.name}** | ${stu.gender === 'F' ? 'ស' : 'ប'} | ${stu.dob || '-'} | ${ev.isWeakLearner ? '**✓**' : ''} | ${isFreqAbs ? '**✓**' : ''} | ${skillStr} | ${attStr} | ${ev.remark || ''} |`
      );
    });

    lines.push(getSignatureBlockMarkdown(state, true));
    return lines.join('\n');
  });

  return classPages.join('\n\n===A4_PAGE_BREAK===\n\n');
}

export function generateStudentStatsMarkdown(
  state: AppDatabaseState,
  _selectedClassId: string,
  selectedMonthId: string
): string {
  const enabledMonths = state.months.filter((m) => m.enabled && !m.isSemesterExam);
  const activeMonth =
    enabledMonths.find((m) => m.id === selectedMonthId) ||
    enabledMonths.find((m) => m.id === 'nov') ||
    enabledMonths[0];
  const currentTerm =
    state.academicTerms?.find((t) => t.id === state.currentTermId)?.nameKh ||
    state.schoolInfo.academicYear ||
    '២០២៦ ~ ២០២៧';

  const classPages = state.classes.map((cls) => {
    const classStudents = sortStudentsByKhmerName(
      state.students.filter((s) => s.classId === cls.id)
    );
    const lines: string[] = [
      getOfficialHeaderMarkdown(state),
      ``,
      `# សូចនាករស្តង់ដាសាលាមធ្យមសិក្សាទុតិយភូមិ`,
      `## តារាងស្ថិតិសិស្សមកពីថ្នាក់ទី ${cls.name}`,
      `### ឆ្នាំសិក្សា : ${currentTerm} · ខែ ${activeMonth?.nameKh || 'វិច្ឆិកា'} មុខវិជ្ជា ${state.schoolInfo.subjectNameKh}`,
      `#### ការដាក់ពិន្ទុលើ បំណិនសម្បទា និង ចរិយាសម្បទា ( មួយមុខយកម្តង )`,
      ``,
      `| ល.រ | គោត្តនាម និង នាម | ភេទ | អាយុ | រៀនខ្សោយ | ឈប់ច្រើន | បំណិនសម្បទា | ចរិយាសម្បទា | ផ្សេងៗ |`,
      `| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |`,
    ];

    classStudents.forEach((stu, idx) => {
      const ev = resolveStudentStandardEvaluation(
        state,
        cls.id,
        activeMonth?.id || 'nov',
        stu
      );
      const isFreqAbs = Boolean(
        ev.absentCount && ev.absentCount.trim() !== '' && ev.absentCount !== '0'
      );
      const skillStr =
        ev.skillScore !== null && ev.skillScore !== undefined
          ? `**${ev.skillScore}**`
          : '';
      const attStr =
        ev.attitudeScore !== null && ev.attitudeScore !== undefined
          ? `**${ev.attitudeScore}**`
          : '';
      lines.push(
        `| ${formatNumeral(idx + 1, state.useKhmerNumerals)} | **${stu.name}** | ${
          stu.gender === 'F' ? 'ស' : 'ប'
        } | ${stu.dob || '-'} | ${ev.isWeakLearner ? '**✓**' : ''} | ${
          isFreqAbs ? '**✓**' : ''
        } | ${skillStr} | ${attStr} | ${
          ev.remark || ''
        } |`
      );
    });

    lines.push(getSignatureBlockMarkdown(state, true));
    return lines.join('\n');
  });

  return classPages.join('\n\n===A4_PAGE_BREAK===\n\n');
}

export function generateTeacherChecklistMarkdown(
  state: AppDatabaseState,
  _selectedClassId: string,
  selectedMonthId: string
): string {
  const enabledMonths = state.months.filter((m) => m.enabled && !m.isSemesterExam);
  const activeMonth =
    enabledMonths.find((m) => m.id === selectedMonthId) ||
    enabledMonths.find((m) => m.id === 'nov') ||
    enabledMonths[0];
  const currentTerm =
    state.academicTerms?.find((t) => t.id === state.currentTermId)?.nameKh ||
    state.schoolInfo.academicYear ||
    '២០២៦ ~ ២០២៧';

  const classPages = state.classes.map((cls) => {
    const classStudents = sortStudentsByKhmerName(
      state.students.filter((s) => s.classId === cls.id)
    );
    const lines: string[] = [
      getOfficialHeaderMarkdown(state),
      ``,
      `# បញ្ជីរាយនាមសិស្សថ្នាក់ទី ${cls.name} (ខែ ${activeMonth?.nameKh || 'វិច្ឆិកា'}) សម្រាប់គ្រូបង្រៀន`,
      `## ឆ្នាំសិក្សា ${currentTerm} · មុខវិជ្ជា ${state.schoolInfo.subjectNameKh}`,
      ``,
      `| ល.រ | អត្តលេខ | គោត្តនាម និងនាម | ភេទ | ថ្ងៃ,ខែ ឆ្នាំកំណើត | បានទទួលកិច្ចការ | បានធ្វើកិច្ចការ | មានផែនការសិក្សា | មានសភគោល | ផ្សេងៗ |`,
      `| :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |`,
    ];

    classStudents.forEach((stu, idx) => {
      const ev = resolveStudentStandardEvaluation(
        state,
        cls.id,
        activeMonth?.id || 'nov',
        stu
      );
      lines.push(
        `| ${formatNumeral(idx + 1, state.useKhmerNumerals)} | ${stu.studentCode} | **${stu.name}** | ${
          stu.gender === 'F' ? 'ស' : 'ប'
        } | ${stu.dob || '-'} | ${ev.receivedHomework ? '**✓**' : ''} | ${ev.completedTasks ? '**✓**' : ''} | ${
          ev.hasStudyPlan ? '**✓**' : ''
        } | ${ev.hasTextbook ? '**✓**' : ''} | ${ev.remark || ''} |`
      );
    });

    lines.push(getSignatureBlockMarkdown(state, true));
    return lines.join('\n');
  });

  return classPages.join('\n\n===A4_PAGE_BREAK===\n\n');
}

export function generateAnnualClassroomPlanMarkdown(
  state: AppDatabaseState,
  _selectedClassId: string
): string {
  const GRADES: GradeLetter[] = ['A', 'B', 'C', 'D', 'E', 'F'];

  const classPages = state.classes.map((cls) => {
    const plan = getResolvedAnnualClassroomPlan(state, cls.id);
    const totalStus = plan.totalStudentsOverride || '0';
    const femStus = plan.femaleStudentsOverride || '0';

    const buildRowHtml = (rKey: GradeLetter | 'TOTAL', label: string) => {
      const r = plan.rows[rKey];
      const cols = [
        r?.baseline,
        r?.sem1Target,
        r?.sem1Actual,
        r?.sem2Target,
        r?.sem2Actual,
        r?.yearEndTarget,
        r?.yearEndActual,
      ];
      return `    <tr>\n      <td style="text-align:center;font-weight:700;">${label}</td>\n${cols
        .map(
          (c) =>
            `      <td style="text-align:center;">${c?.count || ''}</td>\n      <td style="text-align:center;">${c?.pct || ''}</td>`
        )
        .join('\n')}\n    </tr>`;
    };

    const tableHtml = [
      `<div class="annual-plan-table-wrap">`,
      `  <table class="a4-table" border="1" cellspacing="0" cellpadding="5">`,
      `    <thead>`,
      `      <tr>`,
      `        <th colspan="15" style="text-align:center;">ចំនួន និងភាគរយ មុខវិជ្ជា ភាសាចិន</th>`,
      `      </tr>`,
      `      <tr>`,
      `        <th rowspan="2" style="vertical-align:middle;width:60px;">និទ្ទេស</th>`,
      `        <th colspan="2">ទិន្ន័យមូលដ្ឋាន</th>`,
      `        <th colspan="2">គោលដៅឆមាសទី១</th>`,
      `        <th colspan="2">ផលសម្រេចឆមាសទី១</th>`,
      `        <th colspan="2">គោលដៅឆមាសទី២</th>`,
      `        <th colspan="2">ផលសម្រេចឆមាសទី២</th>`,
      `        <th colspan="2">គោលដៅបំណាច់ឆ្នាំ</th>`,
      `        <th colspan="2">ផលសម្រេចបំណាច់ឆ្នាំ</th>`,
      `      </tr>`,
      `      <tr>`,
      `        <th>ចំនួន</th><th>%</th>`,
      `        <th>ចំនួន</th><th>%</th>`,
      `        <th>ចំនួន</th><th>%</th>`,
      `        <th>ចំនួន</th><th>%</th>`,
      `        <th>ចំនួន</th><th>%</th>`,
      `        <th>ចំនួន</th><th>%</th>`,
      `        <th>ចំនួន</th><th>%</th>`,
      `      </tr>`,
      `    </thead>`,
      `    <tbody>`,
      ...GRADES.map((g) => buildRowHtml(g, g)),
      buildRowHtml('TOTAL', 'សរុប'),
      `    </tbody>`,
      `  </table>`,
      `</div>`,
    ].join('\n');

    return [
      getOfficialHeaderMarkdown(state),
      ``,
      `# ផែនការបង្រៀន ១ឆ្នាំ ឬផែនការថ្នាក់រៀន ${plan.planTitleYearKh || '២០២៦ ~ ២០២៧'}`,
      ``,
      `- **ឈ្មោះសាលា ៖** **${state.schoolInfo.schoolNameKh}**`,
      `- **ថ្នាក់ទី ៖** **${cls.name}** · **ចំនួនសិស្សសរុប ៖** **${totalStus}** · **ស្រី ៖** **${femStus}**`,
      `- **ឈ្មោះគ្រូបន្ទុកថ្នាក់ ៖** ${plan.homeroomTeacherName || ''} · **លេខទូរសព្ទ ៖** ${plan.phoneNumber || ''}`,
      `- ${plan.scoreRange100Text || 'កម្រិតពិន្ទុ : Fក្រោម៥០ពិន្ទុ Eពី៥០ ទៅ ៥៩ពិន្ទុ Dពី៦០ ទៅ៦៩ពិន្ទុ Cពី៧០ ទៅ ៧៩ពិន្ទុ Bពី៨០ ទៅ៨៩ពិន្ទុ Aពី៩០ទៅ១០០ពិន្ទុ'}`,
      `- ${plan.scoreRange50Text || 'កម្រិតពិន្ទុ : Fក្រោមពិន្ទុ២៥ Eពី២៥ ទៅ២៩ពិន្ទុ Dពី៣០ ទៅ៣៤ពិន្ទុ Cពី៣៥ ទៅ៣៩ពិន្ទុ Bពី៤០ ទៅ ៤៤ពិន្ទុ Aពី៤៥ ទៅ ៥០ពិន្ទុ'}`,
      ``,
      tableHtml,
      getSignatureBlockMarkdown(state, true),
    ].join('\n');
  });

  return classPages.join('\n\n===A4_PAGE_BREAK===\n\n');
}

export function generateAttendanceMarkdown(
  state: AppDatabaseState,
  _selectedClassId: string,
  selectedMonthId: string
): string {
  const activeMonth =
    state.months.find((m) => m.id === selectedMonthId) || state.months[0];

  const classPages = state.classes.map((cls) => {
    const classStudents = sortStudentsByKhmerName(
      state.students.filter((s) => s.classId === cls.id)
    );
    const femaleCount = classStudents.filter((s) => s.gender === 'F').length;
    const sheetCfg = state.attendanceSheetConfigs?.[cls.id]?.[activeMonth?.id] || {};
    const colCount = sheetCfg.columnCount || 10;
    const sessions = Array.from({ length: colCount }, (_, i) => i + 1);

    const sessionMonthLabels = state.sessionMonths?.[cls.id]?.[activeMonth?.id] || {};
    const sessionDateLabels = state.sessionDates?.[cls.id]?.[activeMonth?.id] || {};

    const colHeaders = sessions
      .map((sIdx) => {
        const mLbl = sessionMonthLabels[sIdx] || activeMonth?.nameKh || '';
        const rawDateLbl = sessionDateLabels[sIdx] || String(sIdx);
        const dLbl = rawDateLbl.replace(/^ទី\s*/g, '').trim();
        return `${mLbl ? mLbl + ' ' : ''}${dLbl}`;
      })
      .join(' | ');
    const colAligns = sessions.map(() => ':---:').join(' | ');

    const lines: string[] = [
      getOfficialHeaderMarkdown(state),
      ``,
      `# បញ្ជីស្រង់វត្តមានសិស្សថ្នាក់ទី ${cls.name}`,
      `## ឆ្នាំសិក្សា ${state.schoolInfo.academicYear}`,
      ``,
      `- **គ្រូមុខវិជ្ជា ៖** **${state.schoolInfo.teacherName}** · **មុខវិជ្ជា ៖** **${state.schoolInfo.subjectNameKh}**`,
      `- **ថ្ងៃបង្រៀន ៖** **${cls.scheduleDayKh}** · **ម៉ោង ៖** **${cls.scheduleTime}** (${cls.weeklyHoursLabel})`,
      `- **សិស្សសរុប ៖** **${classStudents.length} នាក់** (ស្រី **${femaleCount} នាក់**)`,
      ``,
      `| ល.រ | គោត្តនាម-នាម | ឈ្មោះចិន | ភេទ | ${colHeaders} | ផ្សេងៗ |`,
      `| :---: | :--- | :--- | :---: | ${colAligns} | :--- |`,
    ];

    classStudents.forEach((stu, idx) => {
      const stuAtt = state.attendance?.[cls.id]?.[activeMonth?.id]?.[stu.id] || {};
      const cells = sessions
        .map((sIdx) => {
          const st = stuAtt[sIdx] || 'P';
          if (st === 'P') return '✓';
          if (st === 'E') return 'P(ច្បាប់)';
          if (st === 'U') return 'A(អត់ច្បាប់)';
          if (st === 'L') return 'L(យឺត)';
          return '✓';
        })
        .join(' | ');
      lines.push(
        `| ${formatNumeral(idx + 1, state.useKhmerNumerals)} | **${stu.name}** | ${stu.chineseName || '-'} | ${stu.gender === 'F' ? 'ស' : 'ប'} | ${cells} | ${stu.note || ''} |`
      );
    });

    lines.push(getSignatureBlockMarkdown(state, true));
    return lines.join('\n');
  });

  return classPages.join('\n\n===A4_PAGE_BREAK===\n\n');
}

export function generateHomeworkAndLessonMarkdown(
  state: AppDatabaseState,
  _selectedClassId: string
): string {
  const defaultRecords = generateDefaultDailyHomeworkRecords(
    state.classes,
    state.students
  );
  const existingRecords = state.dailyHomeworkRecords || [];
  const records = state.classes.map(
    (c) =>
      existingRecords.find((r) => r.classId === c.id) ||
      defaultRecords.find((r) => r.classId === c.id) ||
      defaultRecords[0]
  );

  const firstRec = records[0];

  const lines: string[] = [
    getOfficialHeaderMarkdown(state),
    ``,
    `# កំណត់ត្រាកិច្ចការផ្ទះ និងកំណត់ត្រាមេរៀនប្រចាំថ្ងៃ`,
    `## ឆ្នាំសិក្សា ${state.schoolInfo.academicYear}`,
    ``,
    `### ១. ស្ថានភាពការដាក់កិច្ចការផ្ទះ និងកំណត់ត្រាមេរៀនតាមថ្នាក់ថ្ងៃនេះ (${firstRec?.date || new Date().toISOString().slice(0, 10)})`,
    ``,
    `| ល.រ | ថ្នាក់ទី | ថ្ងៃ និងម៉ោង | កំណត់ត្រាមេរៀន (ជំពូក និងមេរៀន) | ខ្លឹមសារកិច្ចការផ្ទះ | សិស្សប្រគល់ / សរុប |`,
    `| :---: | :---: | :--- | :--- | :--- | :---: |`,
  ];

  state.classes.forEach((c, idx) => {
    const rec = records.find((r) => r?.classId === c.id) || firstRec;
    const stus = state.students.filter((s) => s.classId === c.id && s.status === 'active');
    const subCnt = stus.filter((s) => rec?.submissions?.[s.id] === 'submitted').length;
    const cleanClassName = (c.name || c.id).replace(/^ថ្នាក់ទី\s*/g, '').trim();
    lines.push(
      `| ${formatNumeral(idx + 1, state.useKhmerNumerals)} | **${cleanClassName}** | ${c.scheduleDayKh} (${c.scheduleTime}) | **${rec?.lessonTitle || '-'}**<br/>${rec?.lessonContentDetails || ''} | **${
        rec?.homeworkTitle || '-'
      }**<br/>${rec?.homeworkDetail || ''} | **${subCnt}/${stus.length} នាក់** |`
    );
  });

  state.classes.forEach((cls, cIdx) => {
    const currentRec = records.find((r) => r?.classId === cls.id) || firstRec;
    const classStudents = sortStudentsByKhmerName(
      state.students.filter((s) => s.classId === cls.id && s.status === 'active')
    );
    const submittedStudents = classStudents.filter(
      (s) => (currentRec?.submissions?.[s.id] || 'missing') === 'submitted'
    );
    const missingStudents = classStudents.filter(
      (s) => (currentRec?.submissions?.[s.id] || 'missing') !== 'submitted'
    );
    const sectionPrefix =
      state.classes.length > 1
        ? `២.${formatNumeral(cIdx + 1, state.useKhmerNumerals)}`
        : `២`;

    lines.push(
      ``,
      `### ${sectionPrefix}. កំណត់ត្រាមេរៀន និងកិច្ចការផ្ទះថ្នាក់ទី ${cls.name}`,
      ``,
      `- **ជំពូក / 单元 ៖** **${currentRec?.lessonUnitTitle || '-'}**`,
      `- **ចំណងជើងមេរៀន / 课题 ៖** **${currentRec?.lessonTitle || '-'}**`,
      `- **ខ្លឹមសារមេរៀនលម្អិត (កំណត់ត្រាមេរៀន) ៖** ${currentRec?.lessonContentDetails || '-'}`,
      `- **ប្រធានបទកិច្ចការផ្ទះ ៖** **${currentRec?.homeworkTitle || '-'}**`,
      `- **ខ្លឹមសារកិច្ចការផ្ទះ ៖** ${currentRec?.homeworkDetail || '-'}`,
      `- **ថ្ងៃកំណត់ប្រគល់ ៖** ${currentRec?.dueDate || '-'}`,
      `- **សិស្សបានប្រគល់កិច្ចការ ៖** **${submittedStudents.length} នាក់** · **មិនទាន់ប្រគល់ ៖** **${missingStudents.length} នាក់**`,
      ``,
      `#### តារាងរាយនាមសិស្សប្រគល់ និងមិនទាន់ប្រគល់កិច្ចការផ្ទះ ថ្នាក់ទី ${cls.name}`,
      ``,
      `| ល.រ | គោត្តនាម-នាម | ភេទ | ស្ថានភាពប្រគល់កិច្ចការ | កំណត់សម្គាល់ |`,
      `| :---: | :--- | :---: | :---: | :--- |`
    );

    classStudents.forEach((stu, idx) => {
      const isSub = (currentRec?.submissions?.[stu.id] || 'missing') === 'submitted';
      lines.push(
        `| ${formatNumeral(idx + 1, state.useKhmerNumerals)} | **${stu.name}** | ${
          stu.gender === 'F' ? 'ស' : 'ប'
        } | ${
          isSub ? '**✓ បានប្រគល់កិច្ចការ**' : '**✗ មិនទាន់ប្រគល់**'
        } | ${currentRec?.notes?.[stu.id] || ''} |`
      );
    });
  });

  lines.push(getSignatureBlockMarkdown(state, true));
  return lines.join('\n');
}

export function generateCurriculumMarkdown(state: AppDatabaseState): string {
  const totalHours = state.curriculumPlan.reduce(
    (acc, item) => acc + (Number(item.hours) || 0),
    0
  );
  const lines: string[] = [
    getOfficialHeaderMarkdown(state),
    ``,
    `# កម្មវិធីសិក្សាភាសាចិន កំរិត២`,
    `## ឆ្នាំសិក្សា ${state.schoolInfo.academicYear} (សរុប ${totalHours} ម៉ោង)`,
    ``,
    `- **គ្រូមុខវិជ្ជា ៖** **${state.schoolInfo.teacherName}**`,
    `- **សៀវភៅគោល ៖** 快乐汉语（第二册） ភាសាចិនរីករាយ (កំរិត២)`,
    ``,
    `| ល.រ | ខែ | សប្តាហ៍ | ខ្លឹមសារមេរៀន (教学内容) | ទំព័រ | ចំនួនម៉ោង | ផ្សេងៗ |`,
    `| :---: | :---: | :---: | :--- | :---: | :---: | :--- |`,
  ];

  state.curriculumPlan.forEach((item, idx) => {
    const cleanContent = item.lessonContent.replace(/\r?\n/g, '<br/>');
    lines.push(
      `| ${formatNumeral(idx + 1, state.useKhmerNumerals)} | **${item.monthNameKh}** | សប្តាហ៍ទី${item.weekNumber} | ${cleanContent} | ${item.pageNumber} | **${item.hours}** | ${item.note || ''} |`
    );
  });

  lines.push(getSignatureBlockMarkdown(state, true));
  return lines.join('\n');
}

export function generateWeeklyLogMarkdown(state: AppDatabaseState): string {
  const weeklyMeta = state.weeklyLogMeta || {
    fridayDateStr: '14/11/2025',
    lunarDate: 'ថ្ងៃសុក្រ ៩រោច ខែកត្តិក ឆ្នាំម្សាញ់ សប្តស័ក ព.ស.២៥៦៩',
    gregorianDate: 'រាជធានីភ្នំពេញ, ថ្ងៃទី១៤ ខែវិច្ឆិកា ឆ្នាំ២០២៥',
    textbookTitle: '快乐汉语（第二册）ភាសាចិនរីករាយ (កំរិត២)',
  };

  const lines: string[] = [
    getOfficialHeaderMarkdown(state),
    ``,
    `# សរមង់អត្ថបទប្រចាំសប្តាហ៍`,
    `## ឆ្នាំសិក្សា ${state.schoolInfo.academicYear}`,
    ``,
    `- **គ្រូមុខវិជ្ជា ៖** ${state.schoolInfo.teacherName}`,
    `- **ម៉ោងសិក្សា ៖** ១ម៉ោង ៣០នាទី/សប្តាហ៍`,
    `- **សៀវភៅគោល ៖** ${weeklyMeta.textbookTitle}`,
    ``,
    `| កាលបរិច្ឆេទ | ម៉ោង | ថ្នាក់ | ខ្លឹមសារមេរៀន |`,
    `| :---: | :---: | :---: | :--- |`,
  ];

  // Combine weeklyLogs with any newly added classes in state.classes not yet in weeklyLogs
  const allLogs = [...state.weeklyLogs];
  state.classes.forEach((cls) => {
    const cleanId = (cls.name || cls.id).replace(/^ថ្នាក់ទី\s*/g, '').trim();
    const exists = allLogs.some(
      (l) =>
        l.classId.toUpperCase() === cls.id.toUpperCase() ||
        l.classId.toUpperCase() === cleanId.toUpperCase()
    );
    if (!exists) {
      const sampleLog = allLogs[0];
      allLogs.push({
        id: `wlog-auto-${cls.id}`,
        dateStr: sampleLog?.dateStr || '12/11/2025',
        weekdayKh: (cls.scheduleDayKh || 'ពុធ').replace(/^ថ្ងៃ\s*/g, '').trim(),
        timeRange: cls.scheduleTime || '15:00-16:30',
        classId: cleanId,
        unitTitle:
          cls.gradeLevel >= 10 ? '第一单元 我和朋友' : '第一单元 你和我',
        lessonTitle:
          cls.gradeLevel >= 10
            ? '第一课 他是谁 · មេរៀនទី១ តើគាត់គឺជានរណា'
            : '第一课 你好 · មេរៀនទី១ សួស្តី',
        contentDetails:
          sampleLog?.contentDetails ||
          '1. 生词 ពាក្យថ្មី · 2. 句型 ទម្រង់ល្បះ និងការសន្ទនា',
      });
    }
  });

  let lastDateKey = '';
  allLogs.forEach((log) => {
    const dateKey = `${log.dateStr} ${log.weekdayKh}`;
    const dayLabel = log.weekdayKh.startsWith('ថ្ងៃ')
      ? log.weekdayKh
      : `ថ្ងៃ${log.weekdayKh}`;
    const dateCell =
      dateKey === lastDateKey ? '' : `${dayLabel}<br/>**${log.dateStr}**`;
    lastDateKey = dateKey;
    const cleanTimeRange = (log.timeRange || '').replace(/\r?\n/g, '').trim();
    const cleanDetails = log.contentDetails.replace(/\r?\n/g, '<br/>');
    lines.push(
      `| ${dateCell} | ${cleanTimeRange} | **${log.classId}** | **${log.unitTitle}** — **${log.lessonTitle}**<br/>${cleanDetails} |`
    );
  });

  lines.push(
    getSignatureBlockMarkdown(
      state,
      true,
      weeklyMeta.lunarDate,
      weeklyMeta.gregorianDate
    )
  );
  return lines.join('\n');
}

export function generateLessonPlanMarkdown(state: AppDatabaseState): string {
  const lessonPages = state.lessonPlans.map((lp, lpIdx) => {
    const pageLines: string[] = [
      getOfficialHeaderMarkdown(state),
      ``,
      `# កិច្ចតែងការបង្រៀនមុខវិជ្ជាភាសាចិន`,
      `## ឆ្នាំសិក្សា ${state.schoolInfo.academicYear}`,
      ``,
      `### មេរៀនទី ${lpIdx + 1}៖ ${lp.lessonTitle}`,
      ``,
      `- **ជំពូក ៖** **${lp.chapterTitle}**`,
      `- **ចំណងជើងមេរៀន ៖** **${lp.lessonTitle}**`,
      `- **រយៈពេល ៖** ${lp.durationLabel} · **ទំព័រ ៖** ${lp.pagesLabel}`,
      `- **ដកស្រង់ចេញពី ៖** ${lp.textbookSource}`,
      ``,
      `#### ១. វត្ថុបំណង (教学目标)`,
      `- **វិជ្ជាសម្បទា ៖** ${lp.knowledgeObjective.replace(/\r?\n/g, ' ')}`,
      `- **បំណិនសម្បទា ៖** ${lp.skillObjective.replace(/\r?\n/g, ' ')}`,
      `- **ចរិយាសម្បទា ៖** ${lp.attitudeObjective.replace(/\r?\n/g, ' ')}`,
      ``,
      `#### ២. សម្ភារៈឧបទេស (教学材料)`,
      `- **ចំពោះគ្រូ ៖** ${lp.teachingMaterialsTeacher}`,
      `- **ចំពោះសិស្ស ៖** ${lp.teachingMaterialsStudent}`,
    ];

    lp.sessions.forEach((sess) => {
      pageLines.push(
        ``,
        `#### ${sess.sessionTitle}`,
        ``,
        `| ជំហាននៃការបង្រៀន | សកម្មភាពគ្រូ | ខ្លឹមសារមេរៀន | សកម្មភាពសិស្ស |`,
        `| :--- | :--- | :--- | :--- |`
      );
      sess.steps.forEach((st) => {
        pageLines.push(
          `| **${st.stepTitle}** | ${st.teacherActivity.replace(/\r?\n/g, '<br/>')} | ${st.lessonContent.replace(/\r?\n/g, '<br/>')} | ${st.studentActivity.replace(/\r?\n/g, '<br/>')} |`
        );
      });
    });

    pageLines.push(getSignatureBlockMarkdown(state, true));
    return pageLines.join('\n');
  });

  return lessonPages.join('\n\n===A4_PAGE_BREAK===\n\n');
}

export function generatePerformanceAndReflectionMarkdown(
  state: AppDatabaseState
): string {
  const GRADES: GradeLetter[] = ['A', 'B', 'C', 'D', 'E', 'F'];
  const summaryMap = calculateScopeMonthlyPerformanceSummary(state);
  const meta = state.performanceAgreementMeta || {
    mainHeadingKh: 'វត្ថុបំណងបំពេញការងារ',
    agreementTitleKh: 'កិច្ចព្រមព្រៀងលទ្ធផល ប្រចាំឆ្នាំ២០២៥ របស់គ្រូបង្រៀន',
    academicPeriodKh: 'ប្រចាំឆ្នាំសិក្សា ២០២៥ - ២០២៦ ចាប់ពីខែ មករា ដល់ ខែ តុលា ឆ្នាំ២០២៦',
    reviewSubtitleKh:
      'ការកំណត់វត្ថុបំណង និងលក្ខណៈវិនិច្ឆ័យបំពេញការងារ សម្រាប់ ការពិនិត្យឡើងវិញ ការអនុវត្តការងារមន្ត្រីឆ្នាំ ២០២៥-២០២៦',
    objective1TitleKh:
      'វត្ថុបំណងទី១៖ លទ្ធផលសិក្សារៀនសូត្ររបស់សិស្សមុខវិជ្ជា ( ភាសាចិន ) ថ្នាក់ទី ៨ ទី៩ និងទី១០',
  };

  const lines: string[] = [
    getOfficialHeaderMarkdown(state),
    ``,
    `# ${meta.mainHeadingKh}`,
    `## ${meta.agreementTitleKh}`,
    `### ${meta.academicPeriodKh}`,
    `- ${meta.reviewSubtitleKh}`,
    ``,
    `### ${meta.objective1TitleKh}`,
  ];

  // Combine existing performanceTargets with any newly added classes in state.classes
  const dynamicTargets = [...state.performanceTargets];
  state.classes.forEach((cls) => {
    const exists = dynamicTargets.some(
      (t) => t.scopeId.toUpperCase() === cls.id.toUpperCase()
    );
    if (!exists) {
      const emptyGradeMap = {
        A: { pct: 0, count: 0 },
        B: { pct: 0, count: 0 },
        C: { pct: 0, count: 0 },
        D: { pct: 0, count: 0 },
        E: { pct: 0, count: 0 },
        F: { pct: 0, count: 0 },
      };
      dynamicTargets.push({
        scopeId: cls.id,
        labelKh: `${formatNumeral(dynamicTargets.length, state.useKhmerNumerals)}) ថ្នាក់ទី ${cls.name}`,
        totalStudents: state.students.filter((s) => s.classId === cls.id).length,
        femaleStudents: state.students.filter(
          (s) => s.classId === cls.id && s.gender === 'F'
        ).length,
        baselineGrades: emptyGradeMap,
        targetGrades: emptyGradeMap,
        studentLearningStatus: '',
        teacherReflection: '',
      });
    }
  });

  dynamicTargets.forEach((target) => {
    const s = summaryMap[target.scopeId];
    const totalStudents = s ? s.totalActive : target.totalStudents;
    const femaleStudents = s ? s.femaleActive : target.femaleStudents;
    const baselineGrades = s ? s.baselineGrades : target.baselineGrades;
    const targetGrades = s ? s.targetGrades : target.targetGrades;
    const actualGrades = s ? s.actualGrades : target.targetGrades;

    lines.push(
      ``,
      `#### ${target.labelKh} (សរុប ${totalStudents} នាក់, ស្រី ${femaleStudents} នាក់)`,
      ``,
      `| និទ្ទេស | A | B | C | D | E | F |`,
      `| :--- | :---: | :---: | :---: | :---: | :---: | :---: |`,
      `| **ដើមឆ្នាំ** | ${GRADES.map((g) => `${baselineGrades[g].pct}% = ${baselineGrades[g].count}នាក់`).join(' | ')} |`,
      `| **គ្រោងចុងឆ្នាំ** | ${GRADES.map((g) => `**${targetGrades[g].pct}% = ${targetGrades[g].count}នាក់**`).join(' | ')} |`,
      `| **សម្រេចចុងឆ្នាំ** | ${GRADES.map((g) => `**${actualGrades[g].pct}% = ${actualGrades[g].count}នាក់**`).join(' | ')} |`
    );
  });

  lines.push(getSignatureBlockMarkdown(state, true));
  return lines.join('\n');
}

export function generateModelSchoolDutyMarkdown(
  state: AppDatabaseState,
  _selectedClassId: string,
  selectedMonthId: string
): string {
  const activeMonth =
    state.months.find((m) => m.id === selectedMonthId) || state.months[0];

  const classPages = state.classes.map((cls) => {
    const classStudents = sortStudentsByKhmerName(
      state.students.filter((s) => s.classId === cls.id)
    );
    const checklistStats = calculateModelSchoolChecklistStats(
      classStudents,
      state.standardEvaluations[cls.id]?.[activeMonth?.id]
    );
    const liveDerived = deriveTeacherDutyReportFromLiveRecords(
      state,
      cls.id || '8A',
      activeMonth?.id || 'jul'
    );
    const savedReport = state.teacherTaskReports[cls.id]?.[activeMonth?.id];
    const taskReport = savedReport ? { ...liveDerived, ...savedReport } : liveDerived;

    const lines: string[] = [
      getOfficialHeaderMarkdown(state),
      ``,
      `# ភារកិច្ចគ្រូបង្រៀន ស្តង់ដាសាលាគំរូ`,
      `## ថ្នាក់ទី ${cls.name} · ខែ${taskReport.monthTitleKh || activeMonth?.nameKh} (${state.schoolInfo.academicYear})`,
      ``,
      `- **លោក - លោកស្រី ៖** **${state.schoolInfo.teacherName}**`,
      `- **បង្រៀនមុខវិជ្ជា ៖** **${state.schoolInfo.subjectNameKh}** · **ថ្នាក់ទី ៖** **${cls.name}**`,
      `- **សិស្សសរុប ៖** **${checklistStats.activeCount} នាក់** / ស្រី **${checklistStats.femaleCount} នាក់**`,
      ``,
      `### I. គ្រូត្រូវធ្វើប្រចាំខែ ${taskReport.monthTitleKh || activeMonth?.nameKh}`,
      `1. **គ្រូបង្រៀនបានដាក់កិច្ចការឱ្យសិស្សស្វ័យសិក្សាមុនពេលមកជួបគ្រូចំនួន ៖** **${taskReport.preStudyAssignedCount}** ដងក្នុង១ខែ`,
      ...taskReport.preStudyDetails.map((d) => `- ${d}`),
      `2. **គ្រូដាក់កិច្ចការគម្រោង ឬប្រធានបទឱ្យសិស្សធ្វើចំនួន ៖** **${taskReport.projectAssignedCount}** ដងក្នុង១ខែ`,
      ...taskReport.projectDetails.map((d) => `- ${d}`),
      `3. **គ្រូដាក់កិច្ចការផ្ទះឱ្យសិស្សធ្វើចំនួន ៖** **${taskReport.homeworkAssignedCount}** ដងក្នុង១ខែ`,
      ...taskReport.homeworkDetails.map((d) => `- ${d}`),
      `4. **គ្រូកែកិច្ចការផ្ទះសិស្សបានចំនួន ៖** **${taskReport.homeworkGradedCount}** ដងក្នុង១ខែ`,
      `5. **គ្រូដាក់ពិន្ទុបំណិនសម្បទា និងចរិយាសម្បទាសិស្សបានចំនួន ៖** **${taskReport.scoredSkillAttitudeCountOverride ?? checklistStats.scoredSkillAttitudeCount}** នាក់ក្នុង១ខែ`,
      ``,
      `### II. សិស្សត្រូវធ្វើប្រចាំខែ`,
      `- **សិស្សបានស្វ័យសិក្សាមុនពេលមកជួបគ្រូបង្រៀនចំនួន ៖** **${taskReport.studentPreStudyCountOverride ?? checklistStats.preStudyCount}** នាក់ក្នុង១ខែ`,
      `- **សិស្សបានធ្វើកិច្ចការ ជាគម្រោង/ចំណោទ/លំហាត់ ស្រាវជ្រាវចំនួន ៖** **${taskReport.studentProjectCountOverride ?? checklistStats.completedTasksCount}** នាក់ក្នុង១ខែ`,
      `- **សិស្សបានធ្វើកិច្ចការផ្ទះចំនួន ៖** **${taskReport.studentHomeworkCountOverride ?? checklistStats.homeworkCount}** នាក់ក្នុង១ខែ`,
      `- **សិស្សបានធ្វើផែនការសិក្សារៀនសូត្រចំនួន ៖** **${taskReport.studentStudyPlanCountOverride ?? checklistStats.studyPlanCount}** នាក់ (១ឆ្នាំ)`,
      `- **កំណត់សម្គាល់សិស្សជួបការលំបាក ៖** ${taskReport.vulnerableStudentsNote}`,
      getSignatureBlockMarkdown(state, true),
    ];

    return lines.join('\n');
  });

  return classPages.join('\n\n===A4_PAGE_BREAK===\n\n');
}

export function generateMonthlyBreakdownAndPerformanceMarkdown(
  state: AppDatabaseState,
  _selectedClassId: string,
  selectedMonthId: string
): string {
  const enabledMonths = state.months.filter((m) => m.enabled && !m.isSemesterExam);
  const activeMonth =
    enabledMonths.find((m) => m.id === selectedMonthId) ||
    enabledMonths.find((m) => m.id === 'nov') ||
    enabledMonths[0] ||
    state.months[0];

  const classPages = state.classes.map((cls) => {
    const cfg = getResolvedMonthlyScoreConfig(state, cls.id, activeMonth.id);
    const maxTotal = cfg.examMax + cfg.attendanceMax + cfg.performanceMax + cfg.homeworkMax;
    const rows = calculateClassMonthlyBreakdownRows(state, cls.id, activeMonth.id);
    const femaleCount = rows.filter((r) => r.gender === 'F').length;

    const sessionIndices = Array.from({ length: cfg.sessionCount }, (_, i) => i + 1);
    const sessionHeaders = sessionIndices.map((s) => {
      const iso = cfg.sessionDates[s] || '';
      const shortDate = iso ? isoToDdMmYyyy(iso).slice(0, 5) : `លើកទី${s}`;
      return `លើកទី${formatNumeral(s, state.useKhmerNumerals)}<br/>(${shortDate})`;
    });

    const lines: string[] = [
      getOfficialHeaderMarkdown(state),
      ``,
      `# តារាងពិន្ទុប្រចាំខែលម្អិត និង សកម្មភាពក្នុងថ្នាក់រៀន`,
      `## ថ្នាក់ទី ${cls.name} · ខែ ${activeMonth.nameKh} · ឆ្នាំសិក្សា : ${state.schoolInfo.academicYear}`,
      `<div style="display:flex;justify-content:space-between;font-weight:700;margin:6px 0;"><div>មុខវិជ្ជា ៖ ${state.schoolInfo.subjectNameKh} (ពិន្ទុពេញ ${maxTotal}៖ ប្រឡង ${cfg.examMax} + វត្តមាន ${cfg.attendanceMax} + សកម្មភាពក្នុងថ្នាក់ ${cfg.performanceMax} + កិច្ចការផ្ទះ ${cfg.homeworkMax})</div><div>ថ្ងៃបញ្ចប់ការគណនាពិន្ទុ ៖ ${isoToDdMmYyyy(cfg.scoringEndDate)}</div></div>`,
      `<div style="font-size:9pt;margin-bottom:6px;">សញ្ញាសកម្មភាពក្នុងថ្នាក់៖ <strong>✓</strong> = ល្អ (ពេញពិន្ទុ) · <strong>○</strong> = មធ្យម/ល្អពាក់កណ្តាល (ពាក់កណ្តាលពិន្ទុ) · <strong>✗</strong> = ខ្សោយ (០ពិន្ទុ) | សិស្សសរុប ${rows.length} នាក់ (ស្រី ${femaleCount} នាក់)</div>`,
      `<table class="a4-table" border="1" cellspacing="0" cellpadding="4">`,
      `  <thead>`,
      `    <tr>`,
      `      <th rowspan="2" style="text-align:center;">ល.រ</th>`,
      `      <th rowspan="2" style="text-align:center;">អត្តលេខ</th>`,
      `      <th rowspan="2" style="text-align:center;">គោត្តនាម និងនាម</th>`,
      `      <th rowspan="2" style="text-align:center;">ភេទ</th>`,
      `      <th colspan="${cfg.sessionCount}" style="text-align:center;">សកម្មភាពក្នុងថ្នាក់រៀន (✓ / ○ / ✗)</th>`,
      `      <th rowspan="2" style="text-align:center;">សកម្មភាព<br/>(${cfg.performanceMax})</th>`,
      `      <th rowspan="2" style="text-align:center;">វត្តមាន<br/>(${cfg.attendanceMax})</th>`,
      `      <th rowspan="2" style="text-align:center;">កិច្ចការផ្ទះ<br/>(${cfg.homeworkMax})</th>`,
      `      <th rowspan="2" style="text-align:center;">ប្រឡង<br/>(${cfg.examMax})</th>`,
      `      <th rowspan="2" style="text-align:center;">ពិន្ទុសរុប<br/>(${maxTotal})</th>`,
      `      <th rowspan="2" style="text-align:center;">ចំ.ថ្នាក់</th>`,
      `      <th rowspan="2" style="text-align:center;">និទ្ទេស</th>`,
      `    </tr>`,
      `    <tr>`,
      ...sessionHeaders.map((h) => `      <th style="text-align:center;font-size:8.5pt;">${h}</th>`),
      `    </tr>`,
      `  </thead>`,
      `  <tbody>`,
    ];

    rows.forEach((r, idx) => {
      const markCells = sessionIndices
        .map((s) => {
          const m = r.performanceMarks[s];
          const sym = m === 'good' ? '✓' : m === 'half' ? '○' : m === 'bad' ? '✗' : '';
          return `      <td style="text-align:center;font-weight:700;">${sym}</td>`;
        })
        .join('\n');

      lines.push(
        `    <tr>`,
        `      <td style="text-align:center;">${formatNumeral(idx + 1, state.useKhmerNumerals)}</td>`,
        `      <td style="text-align:center;">${r.studentCode}</td>`,
        `      <td>${r.name}</td>`,
        `      <td style="text-align:center;">${r.gender === 'F' ? 'ស' : 'ប'}</td>`,
        markCells,
        `      <td style="text-align:center;">${formatNumeral(r.performanceScore, state.useKhmerNumerals)}</td>`,
        `      <td style="text-align:center;">${formatNumeral(r.attendanceScore, state.useKhmerNumerals)}</td>`,
        `      <td style="text-align:center;">${formatNumeral(r.homeworkScore, state.useKhmerNumerals)}</td>`,
        `      <td style="text-align:center;">${r.examScore === null ? '-' : formatNumeral(r.examScore, state.useKhmerNumerals)}</td>`,
        `      <td style="text-align:center;font-weight:700;">${r.totalScore === null ? '-' : formatNumeral(r.totalScore, state.useKhmerNumerals)}</td>`,
        `      <td style="text-align:center;font-weight:700;">${r.rank !== null ? formatNumeral(r.rank, state.useKhmerNumerals) : '-'}</td>`,
        `      <td style="text-align:center;font-weight:700;">${r.grade}</td>`,
        `    </tr>`
      );
    });

    lines.push(
      `  </tbody>`,
      `</table>`,
      getSignatureBlockMarkdown(state, true)
    );

    return lines.join('\n');
  });

  return classPages.join('\n\n===A4_PAGE_BREAK===\n\n');
}

export function generateFullTeachingDocumentMarkdown(
  state: AppDatabaseState,
  section: MarkdownDocSection,
  selectedClassId: string,
  selectedMonthId: string
): string {
  switch (section) {
    case 'roster_schedule':
      return generateRosterAndScheduleMarkdown(state, selectedClassId);
    case 'scores':
      return generateScoresMarkdown(state, selectedClassId, selectedMonthId);
    case 'monthly_breakdown':
      return generateMonthlyBreakdownAndPerformanceMarkdown(
        state,
        selectedClassId,
        selectedMonthId
      );
    case 'student_stats':
      return generateStudentStatsMarkdown(state, selectedClassId, selectedMonthId);
    case 'teacher_checklist':
      return generateTeacherChecklistMarkdown(state, selectedClassId, selectedMonthId);
    case 'annual_classroom_plan':
      return generateAnnualClassroomPlanMarkdown(state, selectedClassId);
    case 'attendance':
      return generateAttendanceMarkdown(state, selectedClassId, selectedMonthId);
    case 'homework_lesson':
      return generateHomeworkAndLessonMarkdown(state, selectedClassId);
    case 'curriculum':
      return generateCurriculumMarkdown(state);
    case 'weekly_log':
      return generateWeeklyLogMarkdown(state);
    case 'lesson_plan':
      return generateLessonPlanMarkdown(state);
    case 'performance_reflection':
      return generatePerformanceAndReflectionMarkdown(state);
    case 'model_school_duty':
      return generateModelSchoolDutyMarkdown(state, selectedClassId, selectedMonthId);
    case 'all':
    default:
      return [
        generateRosterAndScheduleMarkdown(state, selectedClassId),
        `\n\n===A4_PAGE_BREAK===\n\n`,
        generateMonthlyBreakdownAndPerformanceMarkdown(state, selectedClassId, selectedMonthId),
        `\n\n===A4_PAGE_BREAK===\n\n`,
        generateScoresMarkdown(state, selectedClassId, selectedMonthId),
        `\n\n===A4_PAGE_BREAK===\n\n`,
        generateStudentStatsMarkdown(state, selectedClassId, selectedMonthId),
        `\n\n===A4_PAGE_BREAK===\n\n`,
        generateTeacherChecklistMarkdown(state, selectedClassId, selectedMonthId),
        `\n\n===A4_PAGE_BREAK===\n\n`,
        generateAnnualClassroomPlanMarkdown(state, selectedClassId),
        `\n\n===A4_PAGE_BREAK===\n\n`,
        generateAttendanceMarkdown(state, selectedClassId, selectedMonthId),
        `\n\n===A4_PAGE_BREAK===\n\n`,
        generateHomeworkAndLessonMarkdown(state, selectedClassId),
        `\n\n===A4_PAGE_BREAK===\n\n`,
        generateCurriculumMarkdown(state),
        `\n\n===A4_PAGE_BREAK===\n\n`,
        generateWeeklyLogMarkdown(state),
        `\n\n===A4_PAGE_BREAK===\n\n`,
        generateLessonPlanMarkdown(state),
        `\n\n===A4_PAGE_BREAK===\n\n`,
        generatePerformanceAndReflectionMarkdown(state),
        `\n\n===A4_PAGE_BREAK===\n\n`,
        generateModelSchoolDutyMarkdown(state, selectedClassId, selectedMonthId),
      ].join('');
  }
}
