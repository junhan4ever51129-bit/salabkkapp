import ExcelJS from 'exceljs';
import { AppDatabaseState } from '../types';
import { createInitialAppDatabaseState } from '../data/defaultData';
import { sortStudentsByKhmerName } from './calculations';

const FONT_KHMER_BODY = 'Khmer OS Battambang';
const FONT_KHMER_TITLE = 'Khmer OS Muol Light';
const FONT_ZH = 'Microsoft YaHei';

const YELLOW_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFF2CC' },
};

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF2F4F8' },
};

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } },
};

function applyA4PortraitSetup(ws: ExcelJS.Worksheet, repeatRows?: string) {
  ws.pageSetup = {
    paperSize: 9, // A4
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.4,
      right: 0.4,
      top: 0.4,
      bottom: 0.4,
      header: 0.2,
      footer: 0.2,
    },
    printTitlesRow: repeatRows,
  };
}

function addOfficialKingdomAndSchoolHeader(
  ws: ExcelJS.Worksheet,
  lastColLetter: string,
  totalCols: number
) {
  const halfCol = Math.floor(totalCols / 2);
  const leftEndCol = ws.getColumn(halfCol).letter;
  const rightStartCol = ws.getColumn(halfCol + 1).letter;

  // Row 1: Right = Kingdom, Left = Ministry/Department
  ws.mergeCells(`A1:${leftEndCol}1`);
  ws.getCell('A1').value = { formula: 'Settings!$B$6', result: 'មន្ទីរអប់រំ យុវជន និងកីឡារាជធានីភ្នំពេញ' };
  ws.getCell('A1').font = { name: FONT_KHMER_TITLE, size: 10 };
  ws.getCell('A1').alignment = { horizontal: 'left', vertical: 'middle' };

  ws.mergeCells(`${rightStartCol}1:${lastColLetter}1`);
  ws.getCell(`${rightStartCol}1`).value = 'ព្រះរាជាណាចក្រកម្ពុជា';
  ws.getCell(`${rightStartCol}1`).font = { name: FONT_KHMER_TITLE, size: 11 };
  ws.getCell(`${rightStartCol}1`).alignment = { horizontal: 'right', vertical: 'middle' };

  // Row 2: Left = School Name, Right = Motto
  ws.mergeCells(`A2:${leftEndCol}2`);
  ws.getCell('A2').value = { formula: 'Settings!$B$2', result: 'វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង' };
  ws.getCell('A2').font = { name: FONT_KHMER_TITLE, size: 10 };
  ws.getCell('A2').alignment = { horizontal: 'left', vertical: 'middle' };

  ws.mergeCells(`${rightStartCol}2:${lastColLetter}2`);
  ws.getCell(`${rightStartCol}2`).value = 'ជាតិ សាសនា ព្រះមហាក្សត្រ';
  ws.getCell(`${rightStartCol}2`).font = { name: FONT_KHMER_TITLE, size: 11 };
  ws.getCell(`${rightStartCol}2`).alignment = { horizontal: 'right', vertical: 'middle' };

  ws.getRow(1).height = 22;
  ws.getRow(2).height = 22;
}

function addOfficialSignatureFooter(
  ws: ExcelJS.Worksheet,
  startRow: number,
  totalCols: number,
  lunarDateText = 'ថ្ងៃ........................ខែ.............ឆ្នាំម្សាញ់ សប្តស័ក ព.ស.២៥៦៩',
  gregorianDateText = 'រាជធានីភ្នំពេញ, ថ្ងៃទី........ខែ............ឆ្នាំ២០២៥'
) {
  const halfCol = Math.floor(totalCols / 2);
  const leftEndCol = ws.getColumn(halfCol).letter;
  const rightStartCol = ws.getColumn(halfCol + 1).letter;
  const lastColLetter = ws.getColumn(totalCols).letter;

  const r1 = startRow + 1;
  ws.mergeCells(`${rightStartCol}${r1}:${lastColLetter}${r1}`);
  ws.getCell(`${rightStartCol}${r1}`).value = lunarDateText;
  ws.getCell(`${rightStartCol}${r1}`).font = { name: FONT_KHMER_BODY, size: 10 };
  ws.getCell(`${rightStartCol}${r1}`).alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getCell(`${rightStartCol}${r1}`).fill = YELLOW_FILL;

  const r2 = startRow + 2;
  ws.mergeCells(`${rightStartCol}${r2}:${lastColLetter}${r2}`);
  ws.getCell(`${rightStartCol}${r2}`).value = gregorianDateText;
  ws.getCell(`${rightStartCol}${r2}`).font = { name: FONT_KHMER_BODY, size: 10 };
  ws.getCell(`${rightStartCol}${r2}`).alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getCell(`${rightStartCol}${r2}`).fill = YELLOW_FILL;

  const r3 = startRow + 3;
  ws.mergeCells(`A${r3}:${leftEndCol}${r3}`);
  ws.getCell(`A${r3}`).value = 'បានឃើញ និង ឯកភាព';
  ws.getCell(`A${r3}`).font = { name: FONT_KHMER_BODY, size: 10 };
  ws.getCell(`A${r3}`).alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells(`${rightStartCol}${r3}:${lastColLetter}${r3}`);
  ws.getCell(`${rightStartCol}${r3}`).value = 'គ្រូមុខវិជ្ជា';
  ws.getCell(`${rightStartCol}${r3}`).font = { name: FONT_KHMER_TITLE, size: 10 };
  ws.getCell(`${rightStartCol}${r3}`).alignment = { horizontal: 'center', vertical: 'middle' };

  const r4 = startRow + 4;
  ws.mergeCells(`A${r4}:${leftEndCol}${r4}`);
  ws.getCell(`A${r4}`).value = 'ជ.នាយកវិទ្យាល័យ';
  ws.getCell(`A${r4}`).font = { name: FONT_KHMER_TITLE, size: 10 };
  ws.getCell(`A${r4}`).alignment = { horizontal: 'center', vertical: 'middle' };

  const r6 = startRow + 6;
  ws.mergeCells(`${rightStartCol}${r6}:${lastColLetter}${r6}`);
  ws.getCell(`${rightStartCol}${r6}`).value = { formula: 'Settings!$B$3', result: 'លឹម ដាណេ' };
  ws.getCell(`${rightStartCol}${r6}`).font = { name: FONT_KHMER_BODY, size: 10, bold: true };
  ws.getCell(`${rightStartCol}${r6}`).alignment = { horizontal: 'center', vertical: 'middle' };
}

export async function buildOfficialCambodiaWorkbookBuffer(
  customState?: AppDatabaseState
): Promise<ArrayBuffer> {
  const state = customState || createInitialAppDatabaseState();
  const wb = new ExcelJS.Workbook();
  wb.creator = 'វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង - លឹម ដាណេ';
  wb.created = new Date();

  // ============================================================================
  // 1. Settings Sheet
  // ============================================================================
  const wsSettings = wb.addWorksheet('Settings');
  applyA4PortraitSetup(wsSettings, '1:2');
  wsSettings.columns = [
    { width: 28 },
    { width: 42 },
    { width: 20 },
    { width: 22 },
    { width: 18 },
    { width: 18 },
  ];

  wsSettings.mergeCells('A1:F1');
  wsSettings.getCell('A1').value = 'ការកំណត់មូលដ្ឋាន (Settings - ព័ត៌មានសាលា គ្រូ និងកាលវិភាគថ្នាក់)';
  wsSettings.getCell('A1').font = { name: FONT_KHMER_TITLE, size: 12 };
  wsSettings.getRow(1).height = 28;

  const settingsMeta: [string, string, boolean][] = [
    ['សាលារៀន (School)', 'វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង', true],
    ['គ្រូមុខវិជ្ជា (Teacher)', 'លឹម ដាណេ', true],
    ['មុខវិជ្ជា (Subject)', 'ភាសាចិន', true],
    ['ឆ្នាំសិក្សា (Academic Year)', '២០២៥ ~ ២០២៦', true],
    ['មន្ទីរអប់រំ (Department)', 'មន្ទីរអប់រំ យុវជន និងកីឡារាជធានីភ្នំពេញ', false],
    ['ការិយាល័យអប់រំ (District Office)', 'ការិយាល័យអយក.នៃរដ្ឋបាលខណ្ឌបឹងកេងកង', false],
    ['ចំនួនម៉ោងក្នុង១សប្តាហ៍ (Weekly Label)', '(១ម៉ ៣០ន/ សប្តាហ៍)', false],
    ['សៀវភៅគោល (Textbook)', '快乐汉语（第二册）ភាសាចិនរីករាយ (កំរិត២)', true],
  ];

  settingsMeta.forEach(([label, val, editable], idx) => {
    const r = idx + 2;
    const row = wsSettings.getRow(r);
    row.height = 22;
    wsSettings.getCell(`A${r}`).value = label;
    wsSettings.getCell(`A${r}`).font = { name: FONT_KHMER_BODY, size: 10, bold: true };
    wsSettings.getCell(`A${r}`).fill = HEADER_FILL;
    wsSettings.getCell(`A${r}`).border = THIN_BORDER;

    wsSettings.getCell(`B${r}`).value = val;
    wsSettings.getCell(`B${r}`).font = { name: FONT_KHMER_BODY, size: 10 };
    if (editable) wsSettings.getCell(`B${r}`).fill = YELLOW_FILL;
    wsSettings.getCell(`B${r}`).border = THIN_BORDER;
  });

  // Schedule Table on Settings (Rows 11..19)
  const schedHeaderRow = 11;
  const schedHeaders = [
    'ថ្នាក់ (Class)',
    'ថ្ងៃបង្រៀន (Day)',
    'ម៉ោងបង្រៀន (Time)',
    'ម៉ោង/សប្តាហ៍ (Hours)',
    'សិស្សសរុប (Total)',
    'សិស្សស្រី (Female)',
  ];
  wsSettings.getRow(schedHeaderRow).height = 24;
  schedHeaders.forEach((h, cIdx) => {
    const cell = wsSettings.getCell(schedHeaderRow, cIdx + 1);
    cell.value = h;
    cell.font = { name: FONT_KHMER_BODY, size: 10, bold: true };
    cell.fill = HEADER_FILL;
    cell.border = THIN_BORDER;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  const classSchedules: [string, string, string, number][] = [
    ['8A', 'ថ្ងៃអង្គារ', '15:00-16:30', 1.5],
    ['8B', 'ថ្ងៃព្រហស្បតិ៍', '15:00-16:30', 1.5],
    ['8C', 'ថ្ងៃអង្គារ', '13:00-14:30', 1.5],
    ['9A', 'ថ្ងៃចន្ទ', '13:00-14:30', 1.5],
    ['9B', 'ថ្ងៃព្រហស្បតិ៍', '13:00-14:30', 1.5],
    ['9C', 'ថ្ងៃចន្ទ', '15:00-16:30', 1.5],
    ['10A', 'ថ្ងៃពុធ', '13:00-14:30', 1.5],
    ['10C', 'ថ្ងៃពុធ', '15:00-16:30', 1.5],
  ];

  classSchedules.forEach(([clsId, dayKh, timeStr, hrs], idx) => {
    const r = 12 + idx;
    wsSettings.getRow(r).height = 21;
    const totalCount = state.students.filter((s) => s.classId === clsId).length;
    const femCount = state.students.filter((s) => s.classId === clsId && s.gender === 'F').length;

    wsSettings.getCell(`A${r}`).value = clsId;
    wsSettings.getCell(`B${r}`).value = dayKh;
    wsSettings.getCell(`C${r}`).value = timeStr;
    wsSettings.getCell(`D${r}`).value = hrs;
    wsSettings.getCell(`E${r}`).value = {
      formula: `COUNTIF(Roster!$A$2:$A$300, A${r})`,
      result: totalCount,
    };
    wsSettings.getCell(`F${r}`).value = {
      formula: `COUNTIFS(Roster!$A$2:$A$300, A${r}, Roster!$F$2:$F$300, "ស")`,
      result: femCount,
    };

    for (let c = 1; c <= 6; c++) {
      const cell = wsSettings.getCell(r, c);
      cell.font = { name: FONT_KHMER_BODY, size: 10 };
      cell.border = THIN_BORDER;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (c >= 2 && c <= 4) cell.fill = YELLOW_FILL;
    }
  });

  // ============================================================================
  // 2. Roster Sheet (Single Source of Truth for All Students)
  // ============================================================================
  const wsRoster = wb.addWorksheet('Roster');
  applyA4PortraitSetup(wsRoster, '1:1');
  wsRoster.columns = [
    { width: 10 }, // A: ថ្នាក់
    { width: 8 },  // B: ល.រ
    { width: 14 }, // C: អត្តលេខ
    { width: 28 }, // D: គោត្តនាម-នាម
    { width: 16 }, // E: 中文名
    { width: 8 },  // F: ភេទ
    { width: 16 }, // G: ថ្ងៃ.ខែ.ឆ្នាំកំណើត
    { width: 22 }, // H: ផ្សេងៗ
    { width: 14 }, // I: ថ្នាក់_ល.រ (Lookup Key for INDEX/MATCH)
  ];

  const rosterHeaders = [
    'ថ្នាក់',
    'ល.រ',
    'អត្តលេខ',
    'គោត្តនាម-នាម',
    '中文名',
    'ភេទ',
    'ថ្ងៃ.ខែ.ឆ្នាំកំណើត',
    'ផ្សេងៗ',
    'Key_Class_No',
  ];
  wsRoster.getRow(1).height = 25;
  rosterHeaders.forEach((h, i) => {
    const cell = wsRoster.getCell(1, i + 1);
    cell.value = h;
    cell.font = { name: FONT_KHMER_BODY, size: 10, bold: true };
    cell.fill = HEADER_FILL;
    cell.border = THIN_BORDER;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  let rosterRowIdx = 2;
  const classOrder = ['8A', '8B', '8C', '9A', '9B', '9C', '10A', '10C'];
  for (const cid of classOrder) {
    const classStus = sortStudentsByKhmerName(
      state.students.filter((s) => s.classId === cid)
    );
    classStus.forEach((stu, idx) => {
      const noInClass = idx + 1;
      const r = rosterRowIdx++;
      const row = wsRoster.getRow(r);
      row.height = 20;

      const isExplicitId = cid === '10C' && stu.studentCode && stu.studentCode.length >= 4;
      wsRoster.getCell(`A${r}`).value = cid;
      wsRoster.getCell(`B${r}`).value = noInClass;
      wsRoster.getCell(`C${r}`).value = isExplicitId ? stu.studentCode : '';
      wsRoster.getCell(`D${r}`).value = stu.name;
      wsRoster.getCell(`E${r}`).value = stu.chineseName || '';
      wsRoster.getCell(`F${r}`).value = stu.gender === 'F' ? 'ស' : 'ប';
      wsRoster.getCell(`G${r}`).value = stu.dob || '';
      wsRoster.getCell(`H${r}`).value = stu.note || '';
      wsRoster.getCell(`I${r}`).value = {
        formula: `A${r}&"-"&B${r}`,
        result: `${cid}-${noInClass}`,
      };

      for (let c = 1; c <= 9; c++) {
        const cell = wsRoster.getCell(r, c);
        cell.font = {
          name: c === 5 ? FONT_ZH : FONT_KHMER_BODY,
          size: 10,
        };
        cell.border = THIN_BORDER;
        cell.alignment = {
          horizontal: c === 4 || c === 8 ? 'left' : 'center',
          vertical: 'middle',
        };
      }
    });
  }

  // ============================================================================
  // 3. Attendance Sheets ×8 (វត្តមាន-8A .. វត្តមាន-10C)
  // ============================================================================
  for (const cid of classOrder) {
    const wsAtt = wb.addWorksheet(`វត្តមាន-${cid}`);
    applyA4PortraitSetup(wsAtt, '8:9');

    // 18 Columns: A=ល.រ, B=គោត្តនាម-នាម, C=中文名, D=ភេទ, E..Q (13 date cols), R=ផ្សេងៗ
    wsAtt.columns = [
      { width: 6 },  // A: ល.រ
      { width: 24 }, // B: គោត្តនាម-នាម
      { width: 12 }, // C: 中文名
      { width: 6 },  // D: ភេទ
      ...Array.from({ length: 13 }, () => ({ width: 4.5 })), // E..Q: 13 date cols
      { width: 16 }, // R: ផ្សេងៗ
    ];

    addOfficialKingdomAndSchoolHeader(wsAtt, 'R', 18);

    // Row 3: Main Title
    wsAtt.mergeCells('A3:R3');
    wsAtt.getCell('A3').value = `បញ្ជីស្រង់វត្តមានសិស្សថ្នាក់ទី ${cid}`;
    wsAtt.getCell('A3').font = { name: FONT_KHMER_TITLE, size: 12 };
    wsAtt.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
    wsAtt.getRow(3).height = 24;

    // Row 4: Month Input
    wsAtt.mergeCells('A4:R4');
    wsAtt.getCell('A4').value = 'ប្រចាំខែ........................';
    wsAtt.getCell('A4').font = { name: FONT_KHMER_TITLE, size: 11 };
    wsAtt.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle' };
    wsAtt.getCell('A4').fill = YELLOW_FILL;
    wsAtt.getRow(4).height = 22;

    // Row 5: Academic Year (formula from Settings)
    wsAtt.mergeCells('A5:R5');
    wsAtt.getCell('A5').value = {
      formula: `"ឆ្នាំសិក្សា "&Settings!$B$5`,
      result: 'ឆ្នាំសិក្សា ២០២៥ ~ ២០២៦',
    };
    wsAtt.getCell('A5').font = { name: FONT_KHMER_TITLE, size: 11 };
    wsAtt.getCell('A5').alignment = { horizontal: 'center', vertical: 'middle' };
    wsAtt.getRow(5).height = 22;

    // Row 6: Teacher
    wsAtt.mergeCells('A6:R6');
    wsAtt.getCell('A6').value = {
      formula: `"គ្រូមុខវិជ្ជា ៖ "&Settings!$B$3`,
      result: 'គ្រូមុខវិជ្ជា ៖ លឹម ដាណេ',
    };
    wsAtt.getCell('A6').font = { name: FONT_KHMER_BODY, size: 10, bold: true };
    wsAtt.getRow(6).height = 20;

    // Row 7: Subject + Day + Time + Weekly Hours (all formulas from Settings)
    const schedInfo = classSchedules.find((x) => x[0] === cid)!;
    wsAtt.mergeCells('A7:D7');
    wsAtt.getCell('A7').value = {
      formula: `"មុខវិជ្ជា ៖ "&Settings!$B$4`,
      result: 'មុខវិជ្ជា ៖ ភាសាចិន',
    };
    wsAtt.getCell('A7').font = { name: FONT_KHMER_BODY, size: 10, bold: true };

    wsAtt.mergeCells('E7:H7');
    wsAtt.getCell('E7').value = {
      formula: `INDEX(Settings!$B$12:$B$19,MATCH("${cid}",Settings!$A$12:$A$19,0))`,
      result: schedInfo[1],
    };
    wsAtt.getCell('E7').font = { name: FONT_KHMER_BODY, size: 10, bold: true };
    wsAtt.getCell('E7').alignment = { horizontal: 'center', vertical: 'middle' };

    wsAtt.mergeCells('I7:N7');
    wsAtt.getCell('I7').value = {
      formula: `"ម៉ោង ៖ "&INDEX(Settings!$C$12:$C$19,MATCH("${cid}",Settings!$A$12:$A$19,0))`,
      result: `ម៉ោង ៖ ${schedInfo[2]}`,
    };
    wsAtt.getCell('I7').font = { name: FONT_KHMER_BODY, size: 10, bold: true };
    wsAtt.getCell('I7').alignment = { horizontal: 'center', vertical: 'middle' };

    wsAtt.mergeCells('O7:R7');
    wsAtt.getCell('O7').value = {
      formula: `Settings!$B$8`,
      result: '(១ម៉ ៣០ន/ សប្តាហ៍)',
    };
    wsAtt.getCell('O7').font = { name: FONT_KHMER_BODY, size: 10 };
    wsAtt.getCell('O7').alignment = { horizontal: 'right', vertical: 'middle' };
    wsAtt.getRow(7).height = 20;

    // Rows 8-9: Table Header (2 rows: ខែ and ថ្ងៃទី)
    wsAtt.mergeCells('A8:A9');
    wsAtt.getCell('A8').value = 'ល.រ';

    wsAtt.mergeCells('B8:B9');
    wsAtt.getCell('B8').value = 'គោត្តនាម-នាម';

    wsAtt.mergeCells('C8:C9');
    wsAtt.getCell('C8').value = '中文名';

    wsAtt.getCell('D8').value = 'ខែ';
    wsAtt.getCell('D9').value = 'ភេទ / ថ្ងៃទី';

    for (let d = 1; d <= 13; d++) {
      const colIdx = 4 + d;
      wsAtt.getCell(8, colIdx).value = '';
      wsAtt.getCell(8, colIdx).fill = YELLOW_FILL;
      wsAtt.getCell(9, colIdx).value = d;
      wsAtt.getCell(9, colIdx).fill = YELLOW_FILL;
    }

    wsAtt.mergeCells('R8:R9');
    wsAtt.getCell('R8').value = 'ផ្សេងៗ';

    wsAtt.getRow(8).height = 18;
    wsAtt.getRow(9).height = 20;
    for (let r = 8; r <= 9; r++) {
      for (let c = 1; c <= 18; c++) {
        const cell = wsAtt.getCell(r, c);
        cell.font = { name: FONT_KHMER_BODY, size: 9, bold: true };
        cell.border = THIN_BORDER;
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        if (c <= 4 || c === 18) cell.fill = HEADER_FILL;
      }
    }

    // Student rows + 5 blank rows
    const classStus = sortStudentsByKhmerName(
      state.students.filter((s) => s.classId === cid)
    );
    const totalRowsForClass = classStus.length + 5;
    const firstDataRow = 10;
    const lastDataRow = firstDataRow + totalRowsForClass - 1;

    for (let i = 0; i < totalRowsForClass; i++) {
      const r = firstDataRow + i;
      const stuNo = i + 1;
      const stu = classStus[i];
      const keyExpr = `"${cid}-"&A${r}`;

      wsAtt.getRow(r).height = 19;
      wsAtt.getCell(`A${r}`).value = stuNo;
      wsAtt.getCell(`B${r}`).value = {
        formula: `IFERROR(INDEX(Roster!$D$2:$D$300,MATCH(${keyExpr},Roster!$I$2:$I$300,0)),"")`,
        result: stu ? stu.name : '',
      };
      wsAtt.getCell(`C${r}`).value = {
        formula: `IFERROR(INDEX(Roster!$E$2:$E$300,MATCH(${keyExpr},Roster!$I$2:$I$300,0)),"")`,
        result: stu ? stu.chineseName : '',
      };
      wsAtt.getCell(`D${r}`).value = {
        formula: `IFERROR(INDEX(Roster!$F$2:$F$300,MATCH(${keyExpr},Roster!$I$2:$I$300,0)),"")`,
        result: stu ? (stu.gender === 'F' ? 'ស' : 'ប') : '',
      };

      for (let c = 1; c <= 18; c++) {
        const cell = wsAtt.getCell(r, c);
        cell.font = {
          name: c === 3 ? FONT_ZH : FONT_KHMER_BODY,
          size: 9.5,
        };
        cell.border = THIN_BORDER;
        cell.alignment = {
          horizontal: c === 2 || c === 18 ? 'left' : 'center',
          vertical: 'middle',
        };
        if (c >= 5 && c <= 17) {
          cell.fill = YELLOW_FILL;
          cell.dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"✓,ច្បាប់,អត់ច្បាប់"'],
          };
        }
      }
    }

    // Summary row at bottom of table
    const sumRow = lastDataRow + 1;
    wsAtt.getRow(sumRow).height = 22;
    wsAtt.mergeCells(`A${sumRow}:H${sumRow}`);
    wsAtt.getCell(`A${sumRow}`).value = {
      formula: `"សិស្សសរុប "&COUNTIF(B${firstDataRow}:B${lastDataRow},"?*")&" នាក់ ស្រី "&COUNTIF(D${firstDataRow}:D${lastDataRow},"ស")&" នាក់"`,
      result: `សិស្សសរុប ${classStus.length} នាក់ ស្រី ${
        classStus.filter((s) => s.gender === 'F').length
      } នាក់`,
    };
    wsAtt.getCell(`A${sumRow}`).font = { name: FONT_KHMER_BODY, size: 10, bold: true };
    wsAtt.getCell(`A${sumRow}`).alignment = { horizontal: 'left', vertical: 'middle' };

    addOfficialSignatureFooter(wsAtt, sumRow, 18);
  }

  // ============================================================================
  // 4. Annual_Program Sheet (កម្មវិធីសិក្សាភាសាចិន កំរិត២)
  // ============================================================================
  const wsAnnual = wb.addWorksheet('Annual_Program');
  applyA4PortraitSetup(wsAnnual, '8:8');
  wsAnnual.columns = [
    { width: 12 }, // A: ខែ
    { width: 10 }, // B: សប្តាហ៍(1-4)
    { width: 26 }, // C: មេរៀន
    { width: 44 }, // D: ខ្លឹមសារ
    { width: 16 }, // E: ទំព័រ(SB/WB)
    { width: 10 }, // F: ចំ.ម៉ោង(1.5)
    { width: 18 }, // G: ផ្សេងៗ
  ];

  addOfficialKingdomAndSchoolHeader(wsAnnual, 'G', 7);

  wsAnnual.mergeCells('A3:G3');
  wsAnnual.getCell('A3').value = 'កម្មវិធីសិក្សាភាសាចិន កំរិត២';
  wsAnnual.getCell('A3').font = { name: FONT_KHMER_TITLE, size: 12 };
  wsAnnual.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
  wsAnnual.getRow(3).height = 24;

  wsAnnual.mergeCells('A4:G4');
  wsAnnual.getCell('A4').value = {
    formula: `"ឆ្នាំសិក្សា "&Settings!$B$5`,
    result: 'ឆ្នាំសិក្សា ២០២៥ ~ ២០២៦',
  };
  wsAnnual.getCell('A4').font = { name: FONT_KHMER_TITLE, size: 11 };
  wsAnnual.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle' };
  wsAnnual.getRow(4).height = 22;

  wsAnnual.mergeCells('A5:G5');
  wsAnnual.getCell('A5').value = {
    formula: `"គ្រូមុខវិជ្ជា ៖ "&Settings!$B$3`,
    result: 'គ្រូមុខវិជ្ជា ៖ លឹម ដាណេ',
  };
  wsAnnual.getCell('A5').font = { name: FONT_KHMER_BODY, size: 10 };

  wsAnnual.mergeCells('A6:G6');
  wsAnnual.getCell('A6').value = 'ម៉ោងសិក្សា ៖ ១ម៉ ៣០ន/ សប្តាហ៍';
  wsAnnual.getCell('A6').font = { name: FONT_KHMER_BODY, size: 10 };

  wsAnnual.mergeCells('A7:G7');
  wsAnnual.getCell('A7').value = {
    formula: `"សៀវភៅគោល ៖ "&Settings!$B$9`,
    result: 'សៀវភៅគោល ៖ 快乐汉语（第二册）ភាសាចិនរីករាយ (កំរិត២)',
  };
  wsAnnual.getCell('A7').font = { name: FONT_KHMER_BODY, size: 10 };

  const annualHeaders = ['ឈ្មោះខែ', 'សប្តាហ៍', 'មេរៀន', 'ខ្លឹមសារមេរៀន', 'ទំព័រ', 'ចំ.ម៉ោង', 'ផ្សេងៗ'];
  wsAnnual.getRow(8).height = 24;
  annualHeaders.forEach((h, i) => {
    const cell = wsAnnual.getCell(8, i + 1);
    cell.value = h;
    cell.font = { name: FONT_KHMER_TITLE, size: 10 };
    cell.fill = HEADER_FILL;
    cell.border = THIN_BORDER;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Exact 40-week curriculum from PDF 3 (10 months × 4 weeks, 38 teaching sessions × 1.5h = 57h)
  const annualRows: [string, string, string, string, string, number | null, string][] = [
    [
      'វិច្ឆិកា',
      '១',
      '汉语基础（复习） មូលដ្ឋានគ្រឹះភាសាចិន(រំលឹកមេរៀន)',
      '- 声母 ព្យញ្ជនៈ / - 韵母 ស្រៈ / - 声调与拼读 សូរសំឡេង និងការរៀនប្រកប ភីនអ៊ីន',
      '',
      1.5,
      '',
    ],
    [
      'វិច្ឆិកា',
      '២',
      '第一单元 我和朋友 · 第一课 他是谁 មេរៀនទី១ តើគាត់គឺជានរណា',
      '1.生词 ពាក្យថ្មី៖ 姓、名字、多、朋友、谁、欢迎、地方、国家、号码 / 2.句型 ទម្រង់ល្បះ៖ ①你姓什么？ ②叫什么名字？ ③我姓马，我叫马丽丽。 ④他是谁？',
      'សៀ.សិស្ស ៣',
      1.5,
      '',
    ],
    [
      'វិច្ឆិកា',
      '៣',
      '第一单元 我和朋友 · 第一课 他是谁 មេរៀនទី១ តើគាត់គឺជានរណា',
      '3.对话 សន្ទនា៖ A: 你好。 B: 你好。 A: 你姓什么？ B: 我姓马。 A: 你叫什么名字？ B: 我叫马丽丽。 A: 他是谁？ B: 他是我的朋友。 A: 欢迎！你家在什么地方？ C: 我家在香港。',
      'សៀ.សិស្ស ៣',
      1.5,
      '',
    ],
    [
      'វិច្ឆិកា',
      '៤',
      '第一单元 我和朋友 · 第一课 他是谁 មេរៀនទី១ តើគាត់គឺជានរណា',
      '4.汉字笔画 គំនូសអក្សរចិន៖ 姓、名、字、多、朋、友、谁、欢、迎、地、方、国、家、号、码 / 5.综合练习：课本和练习册',
      'សៀ.សិស្ស (៤-៥) សៀ.លំ (១-៧)',
      1.5,
      '',
    ],
    [
      'ធ្នូ',
      '១',
      '第一单元 我和朋友 · 第二课 她比我高 មេរៀនទី២ នាងខ្ពស់ជាងខ្ញុំ',
      '1.生词 ពាក្យថ្មី៖ 多、今年、她、比、说、英语、汉语、谢谢、网友、年龄、高、艺术 / 2.句型 ទម្រង់ល្បះ៖ ①你多大？ ②我今年十六岁。 ③我会说英语。 ④她比我大。',
      '៨',
      1.5,
      '',
    ],
    [
      'ធ្នូ',
      '២',
      '第一单元 我和朋友 · 第二课 她比我高 មេរៀនទី២ នាងខ្ពស់ជាងខ្ញុំ',
      '3.对话 សន្ទនា៖ A: 你多大？ B: 我今年十六岁。 A: 你的汉语会很好。 B: 谢谢。你会说英语吗？ / 十二月月考 ប្រលងប្រចាំខែធ្នូ',
      '៨',
      1.5,
      'ប្រលងប្រចាំខែធ្នូ',
    ],
    [
      'ធ្នូ',
      '៣',
      '第一单元 我和朋友 · 第二课 她比我高 មេរៀនទី២ នាងខ្ពស់ជាងខ្ញុំ',
      '4.汉字笔画 គំនូសអក្សរចិន៖ 多、今、年、她、比、说、英、语、汉、语、谢、网、友、龄、高、艺、术 / 5.综合练习：课本和练习册',
      'សៀ.សិស្ស (៩-១១) សៀ.លំ (៨-១៦)',
      1.5,
      '',
    ],
    [
      'ធ្នូ',
      '៤',
      '第一单元 我和朋友 · 第三课 我的一天 មេរៀនទី៣ មួយថ្ងៃរបស់ខ្ញុំ',
      '1.生词 ពាក្យថ្មី៖ 每天、起床、开始、时间表、饭、晚饭、睡觉、早、晚、弟弟、妹妹、展览会 / 2.句型 ទម្រង់ល្បះ៖ ①我每天早上七点起床。 ②我九点开始上课。 ③我想看电影。 ④谁去？ ⑤谁要喝咖啡？',
      '១៣',
      1.5,
      '',
    ],
    [
      'មករា',
      '១',
      '第一单元 我和朋友 · 第三课 我的一天 មេរៀនទី៣ មួយថ្ងៃរបស់ខ្ញុំ',
      '3.情境应用 ការប្រើប្រាស់ក្នុងបរិបទ៖ 这是我的时间表。我每天早上七点起床，七点半吃饭，八点开始上课。晚上七点去图书馆，十点半睡觉。',
      '១៣',
      1.5,
      '',
    ],
    [
      'មករា',
      '២',
      '第三课 我的一天 មេរៀនទី៣ មួយថ្ងៃរបស់ខ្ញុំ',
      '4.汉字笔画 គំនូសអក្សរចិន៖ 每、天、起、床、开、始、时、间表、饭、晚、饭、睡、觉、早、晚、弟、妹、展、览、会 / 5.综合练习：课本和练习册 / 一月月考 ប្រលងប្រចាំខែមករា',
      'សៀ.សិស្ស (១៤-១៦) សៀ.លំ (១៧-២៥)',
      1.5,
      'ប្រលងប្រចាំខែមករា',
    ],
    [
      'មករា',
      '៣',
      '第二单元 我的家 · 第四课 我的房间 មេរៀនទី៤ បន្ទប់របស់ខ្ញុំ',
      '1.生词 ពាក្យថ្មី៖ 里、桌子、椅子、客厅、沙发、书架、上、书、毛笔、床、灯 / 2.句型 ទម្រង់ល្បះ៖ ①我的房间里有桌子、椅子。 ②书架上有很多中文书。 ③客厅里有沙发。',
      '២១',
      1.5,
      '',
    ],
    [
      'មករា',
      '៤',
      '第二单元 我的家 · 第四课 我的房间 មេរៀនទី៤ បន្ទប់របស់ខ្ញុំ',
      '3.对话 សន្ទនា៖ A: 房间里有什么？ B: 房间里有桌子、椅子。 A: 桌子上有什么？ B: 桌子上有毛笔。 A: 书架上有什么？ B: 书架上有很多中文书。',
      '២១',
      1.5,
      '',
    ],
    [
      'កុម្ភៈ',
      '១',
      '第二单元 我的家 · 第四课 我的房间 មេរៀនទី៤ បន្ទប់របស់ខ្ញុំ',
      '4.汉字笔画 គំនូសអក្សរចិន៖ 里、桌、子、椅、客、厅、沙、发、书、架、上、毛、笔、床、灯 / 5.综合练习：课本和练习册',
      'សៀ.សិស្ស (២២-២៥) សៀ.លំ (២៦-៣៤)',
      1.5,
      '',
    ],
    [
      'កុម្ភៈ',
      '២',
      '第二单元 我的家 · 第五课 客厅在南边 មេរៀនទី៥ បន្ទប់ទទួលភ្ញៀវនៅទិសខាងត្បូង',
      '1.生词 ពាក្យថ្មី៖ 卫生间、对面、南边、饭厅、卧室、东边、门、做饭 / 2.句型 ទម្រង់ល្បះ៖ ①卧室在东边。 ②客厅在南边。 ③卫生间在客厅对面。 / 期中考试 ប្រលងឆមាសលើកទី១',
      '២៧',
      1.5,
      'ប្រលងឆមាសលើកទី១',
    ],
    [
      'កុម្ភៈ',
      '៣',
      '第二单元 我的家 · 第五课 客厅在南边 មេរៀនទី៥ បន្ទប់ទទួលភ្ញៀវនៅទិសខាងត្បូង',
      '3.对话 សន្ទនា៖ A: 卧室在哪儿？ B: 卧室在东边。 A: 客厅在哪儿？ B: 客厅在南边。 A: 卫生间在哪儿？ B: 卫生间在客厅对面。',
      '២៧',
      1.5,
      '',
    ],
    [
      'កុម្ភៈ',
      '៤',
      '第二单元 我的家 · 第五课 客厅在南边 មេរៀនទី៥ បន្ទប់ទទួលភ្ញៀវនៅទិសខាងត្បូង',
      '4.汉字笔画 គំនូសអក្សរចិន៖ 卫、生、间、对、面、南、饭、厅、卧、室、东、门、做、饭 / 5.综合练习：课本和练习册',
      'សៀ.សិស្ស (២៨-៣១) សៀ.លំ (៣៥-៤២)',
      1.5,
      '',
    ],
    [
      'មីនា',
      '១',
      '第二单元 我的家 · 第六课 你家的花园真漂亮 មេរៀនទី៦ សួនច្បារផ្ទះរបស់អ្នកពិតជាស្អាតមែន',
      '1.生词 ពាក្យថ្មី៖ 花园、漂亮、花、书桌、干净、真、杂志、整齐、安静、家具 / 2.句型 ទម្រង់ល្បះ៖ ①我的书桌很干净。 ②你家的花园真漂亮。',
      '៣៣',
      1.5,
      '',
    ],
    [
      'មីនា',
      '២',
      '第二单元 我的家 · 第六课 你家的花园真漂亮 មេរៀនទី៦ សួនច្បារផ្ទះរបស់អ្នកពិតជាស្អាតមែន',
      '3.对话 សន្ទនា៖ A: 你家的花园里有很多花！ B: 我爸爸妈妈喜欢花。 A: 你家的花园真漂亮！ B: 谢谢！ / 三月月考 ប្រលងប្រចាំខែមីនា',
      '៣៣',
      1.5,
      'ប្រលងប្រចាំខែមីនា',
    ],
    [
      'មីនា',
      '៣',
      '第二单元 我的家 · 第六课 你家的花园真漂亮 មេរៀនទី៦ សួនច្បារផ្ទះរបស់អ្នកពិតជាស្អាតមែន',
      '4.汉字笔画 គំនូសអក្សរចិន៖ 花、园、漂、亮、书、桌、干、净、真、杂、志、整、齐、安、静、家、具 / 5.综合练习：课本和练习册',
      'សៀ.សិស្ស (៣៤-៣៨) សៀ.លំ (៤៣-៥១)',
      1.5,
      '',
    ],
    [
      'មីនា',
      '៤',
      '第三单元 购物 · 第七课 你买什么 មេរៀនទី៧ តើអ្នកទិញអ្វី',
      '1.生词 ពាក្យថ្មី៖ 买、和、点心、还、要、瓶、斤、东西、水、酒、蛋糕 / 2.句型 ទម្រង់ល្បះ៖ ①一瓶牛奶，两斤苹果。 ②我买苹果和点心。 ③我还要牛奶。 ④我要一瓶。',
      '៤៣',
      1.5,
      '',
    ],
    [
      'មេសា',
      '១',
      '第三单元 购物 · 第七课 你买什么 មេរៀនទី៧ តើអ្នកទិញអ្វី',
      '3.对话 សន្ទនា៖ A: 你买什么？ B: 我买点心。 A: 你买几斤？ B: 我买一斤。 A: 你还要什么？ B: 我还要一瓶水喝两瓶牛奶。',
      '៤៣',
      1.5,
      '',
    ],
    ['មេសា', '២', '小假期 វិស្សមកាលតូច', '小假期 វិស្សមកាលតូច (ឈប់សម្រាកចូលឆ្នាំខ្មែរ)', '', null, 'វិស្សមកាលតូច'],
    ['មេសា', '៣', '小假期 វិស្សមកាលតូច', '小假期 វិស្សមកាលតូច (ឈប់សម្រាកចូលឆ្នាំខ្មែរ)', '', null, 'វិស្សមកាលតូច'],
    [
      'មេសា',
      '៤',
      '第三单元 购物 · 第七课 你买什么 មេរៀនទី៧ តើអ្នកទិញអ្វី',
      '4.汉字笔画 គំនូសអក្សរចិន៖ 买、和、点、心、还、要、瓶、斤、东、西、水、酒、蛋、糕 / 5.综合练习：课本和练习册',
      'សៀ.សិស្ស (៤៤-៤៧) សៀ.លំ (៥២-៥៨)',
      1.5,
      '',
    ],
    [
      'ឧសភា',
      '១',
      '第三单元 购物 · 第八课 苹果多少钱一斤 មេរៀនទី៨ តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន',
      '1.生词 ពាក្យថ្មី៖ 多少、钱、块、毛、一共、猪肉、鸡、零、分、青菜、肉 / 2.句型 ទម្រង់ល្បះ៖ ①苹果多少钱一斤？ ②我要一斤半。',
      '៤៩',
      1.5,
      '',
    ],
    [
      'ឧសភា',
      '២',
      '第三单元 购物 · 第八课 苹果多少钱一斤 មេរៀនទី៨ តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន',
      '3.对话 សន្ទនា៖ A: 请问，苹果多少钱一斤？ B: 四块二一斤。 A: 我要一斤半。 / 五月月考 ប្រលងប្រចាំខែឧសភា',
      '៤៩',
      1.5,
      'ប្រលងប្រចាំខែឧសភា',
    ],
    [
      'ឧសភា',
      '៣',
      '第三单元 购物 · 第八课 苹果多少钱一斤 មេរៀនទី៨ តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន',
      '4.汉字笔画 គំនូសអក្សរចិន៖ 多、少、钱、块、毛、一、共、猪肉、鸡、零、分、青、菜、肉 / 5.综合练习：课本和练习册',
      'សៀ.សិស្ស (៥០-៥៣) សៀ.លំ (៥៩-៦៤)',
      1.5,
      '',
    ],
    [
      'ឧសភា',
      '៤',
      '第三单元 购物 · 第九课 这件衣服比那件贵一点儿 មេរៀនទី៩ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច',
      '1.生词 ពាក្យថ្មី៖ 件、衣服、贵、一点儿、自行车、跟、一样、毛衣、短、便宜 / 2.句型 ទម្រង់ល្បះ៖ ①这件衣服比那件贵一点儿。 ②那件衣服没有这件衣服漂亮。 ③他的自行车跟我的自行车一样。 ④我的爱好跟你的爱好不一样。',
      '៥៥',
      1.5,
      '',
    ],
    [
      'មិថុនា',
      '១',
      '第三单元 购物 · 第九课 这件衣服比那件贵一点儿 មេរៀនទី៩ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច',
      '3.对话 សន្ទនា៖ A: 这是你的自行车吗？ B: 不是，这是他的自行车。 A: 他的自行车跟我的自行车一样。 B: 我的自行车跟你们的不一样。',
      '៥៥',
      1.5,
      '',
    ],
    [
      'មិថុនា',
      '២',
      '第三单元 购物 · 第九课 这件衣服比那件贵一点儿 មេរៀនទី៩ សំលៀកបំពាក់នេះថ្លៃជាងសំលៀកបំពាក់នោះបន្តិច',
      '4.汉字笔画 គំនូសអក្សរចិន៖ 件、衣、服、贵、一、点、儿、自、行、车、跟、样、毛、衣、短、便、宜 / 5.综合练习：课本和练习册 / 六月月考 ប្រលងប្រចាំខែមិថុនា',
      'សៀ.សិស្ស (៥៦-៦០) សៀ.លំ (៦៥-៧៣)',
      1.5,
      'ប្រលងប្រចាំខែមិថុនា',
    ],
    [
      'មិថុនា',
      '៣',
      '第四单元 学校生活 · 第十课 你今天上了什么课 មេរៀនទី១០ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីហើយ',
      '1.生词 ពាក្យថ្មី៖ 上（课）、了、明天、数学、德语、历史、地理、下午、周末、时间 / 2.句型 ទម្រង់ល្បះ៖ ①你今天上了什么课？ ②我今天上了体育课。 ③你明天有什么课？ ④我明天上了汉语课。',
      '៦៥',
      1.5,
      '',
    ],
    [
      'មិថុនា',
      '៤',
      '第四单元 学校生活 · 第十课 你今天上了什么课 មេរៀនទី១០ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីហើយ',
      '3.对话 សន្ទនា៖ A: 你今天上了什么课？ B: 我今天上了音乐课。 A: 你明天有什么课？ B: 我明天有历史课，你呢？ A: 我明天有数学课和地理课。',
      '៦៥',
      1.5,
      '',
    ],
    [
      'កក្កដា',
      '១',
      '第四单元 学校生活 · 第十课 你今天上了什么课 មេរៀនទី១០ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វីហើយ',
      '4.汉字笔画 គំនូសអក្សរចិន៖ 上、课、了、明、天、数、学、德、语、历、史、地、理、下、午、周、末、时、间 / 5.综合练习：课本和练习册',
      'សៀ.សិស្ស (៦៦-៦៩) សៀ.លំ (៧៤-៧៩)',
      1.5,
      '',
    ],
    [
      'កក្កដា',
      '២',
      '第四单元 学校生活 · 第十一课 汉语不难 មេរៀនទី១១ ភាសាចិនមិនលំបាកទេ',
      '1.生词 ពាក្យថ្មី៖ 难、作业、有意思、中学、科目、容易、成绩、没意思、考试、有空儿 / 2.句型 ទម្រង់ល្បះ៖ ①汉语难不难？ ②汉语不难。 / 七月月考 ប្រលងប្រចាំខែកក្កដា',
      '៧១',
      1.5,
      'ប្រលងប្រចាំខែកក្កដា',
    ],
    [
      'កក្កដា',
      '៣',
      '第四单元 学校生活 · 第十一课 汉语不难 មេរៀនទី១១ ភាសាចិនមិនលំបាកទេ',
      '3.对话 សន្ទនា៖ A: 我今天上了汉语课。 B: 汉语难不难？ A: 汉语不难，汉语课很有意思。 B: 中学的科目多不多。 A: 中学的科目很多。',
      '៧១',
      1.5,
      '',
    ],
    [
      'កក្កដា',
      '៤',
      '第四单元 学校生活 · 第十一课 汉语不难 មេរៀនទី១១ ភាសាចិនមិនលំបាកទេ',
      '4.汉字笔画 គំនូសអក្សរចិន៖ 难、作、业、有、意、思、中、学、科、目、容、易、成、绩、没、考、试、空、儿 / 5.综合练习：课本和练习册',
      'សៀ.សិស្ស (៧២-៧៥) សៀ.លំ (៨០-៨៤)',
      1.5,
      '',
    ],
    [
      'សីហា',
      '១',
      '第四单元 学校生活 · 第十二课 来打乒乓球吧 មេរៀនទី១២ មកវាយប៉េងប៉ុងមក',
      '1.生词 ពាក្យថ្មី៖ 来、乒乓球、羽毛球、踢足球、学（习）、语言、书法、上学、游泳池 / 2.句型 ទម្រង់ល្បះ៖ ①来打乒乓球吧！ ②我们去打羽毛球。 ③你们踢不踢足球？',
      '៧៧',
      1.5,
      '',
    ],
    ['សីហា', '២', '期末考试 ប្រលងឆមាសទី២', '期末考试 ប្រលងឆមាសទី២', '', 1.5, 'ប្រលងឆមាសទី២'],
    [
      'សីហា',
      '៣',
      '第四单元 学校生活 · 第十二课 来打乒乓球吧 មេរៀនទី១២ មកវាយប៉េងប៉ុងមក',
      '3.对话 សន្ទនា៖ A: 你打不打乒乓球？ B: 我不打乒乓球，我去打羽毛球。 A: 来打乒乓球吧！ B: 我不会打乒乓球。 C: 我来打乒乓球，我会打乒乓球。',
      '៧៧',
      1.5,
      '',
    ],
    [
      'សីហា',
      '៤',
      '第四单元 学校生活 · 第十二课 来打乒乓球吧 មេរៀនទី១២ មកវាយប៉េងប៉ុងមក',
      '4.汉字笔画 គំនូសអក្សរចិន៖ 来、乒、乓、球、羽、毛、踢、足、学、习、语、言、书、法、上、游、泳、池 / 5.综合练习：课本和练习册',
      'សៀ.សិស្ស (៧៨-៨០) សៀ.លំ (៨៥-៩០)',
      1.5,
      '',
    ],
  ];

  annualRows.forEach(([mKh, wk, lesson, content, page, hrs, remark], idx) => {
    const r = 9 + idx;
    wsAnnual.getRow(r).height = 38;
    wsAnnual.getCell(`A${r}`).value = mKh;
    wsAnnual.getCell(`B${r}`).value = wk;
    wsAnnual.getCell(`C${r}`).value = lesson;
    wsAnnual.getCell(`D${r}`).value = content;
    wsAnnual.getCell(`E${r}`).value = page;
    if (hrs !== null) wsAnnual.getCell(`F${r}`).value = hrs;
    wsAnnual.getCell(`G${r}`).value = remark;

    for (let c = 1; c <= 7; c++) {
      const cell = wsAnnual.getCell(r, c);
      cell.font = { name: FONT_KHMER_BODY, size: 9.5 };
      cell.border = THIN_BORDER;
      cell.alignment = {
        horizontal: c === 3 || c === 4 ? 'left' : 'center',
        vertical: 'middle',
        wrapText: true,
      };
    }
  });

  const lastAnnualRow = 8 + annualRows.length;
  const totalAnnualRow = lastAnnualRow + 1;
  wsAnnual.getRow(totalAnnualRow).height = 24;
  wsAnnual.mergeCells(`A${totalAnnualRow}:E${totalAnnualRow}`);
  wsAnnual.getCell(`A${totalAnnualRow}`).value = 'ចំនួនម៉ោងសរុបប្រចាំឆ្នាំ';
  wsAnnual.getCell(`A${totalAnnualRow}`).font = { name: FONT_KHMER_BODY, size: 10, bold: true };
  wsAnnual.getCell(`A${totalAnnualRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
  wsAnnual.getCell(`A${totalAnnualRow}`).border = THIN_BORDER;

  wsAnnual.getCell(`F${totalAnnualRow}`).value = {
    formula: `SUM(F9:F${lastAnnualRow})`,
    result: 57,
  };
  wsAnnual.getCell(`F${totalAnnualRow}`).font = { name: FONT_KHMER_BODY, size: 10, bold: true };
  wsAnnual.getCell(`F${totalAnnualRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
  wsAnnual.getCell(`F${totalAnnualRow}`).border = THIN_BORDER;

  wsAnnual.getCell(`G${totalAnnualRow}`).value = 'ម៉ោង';
  wsAnnual.getCell(`G${totalAnnualRow}`).font = { name: FONT_KHMER_BODY, size: 10, bold: true };
  wsAnnual.getCell(`G${totalAnnualRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
  wsAnnual.getCell(`G${totalAnnualRow}`).border = THIN_BORDER;

  addOfficialSignatureFooter(
    wsAnnual,
    totalAnnualRow,
    7,
    'ថ្ងៃ សៅរ៍ ១១ កើត ខែ កត្តិក ឆ្នាំ ម្សាញ់ សប្តស័ក ព.ស២៥៦៩',
    'រាជធានីភ្នំពេញ, ថ្ងៃទី ១ ខែ វិច្ឆិកា ឆ្នាំ២០២៥'
  );

  // ============================================================================
  // 5. Weekly_Plan Sheet (សម្រង់អត្ថបទប្រចាំសប្តាហ៍)
  // ============================================================================
  const wsWeekly = wb.addWorksheet('Weekly_Plan');
  applyA4PortraitSetup(wsWeekly, '8:8');
  wsWeekly.columns = [
    { width: 14 }, // A: កាលបរិច្ឆេទ (True Date)
    { width: 12 }, // B: ថ្ងៃ (WEEKDAY formula)
    { width: 15 }, // C: ម៉ោង (INDEX/MATCH from Settings)
    { width: 9 },  // D: ថ្នាក់
    { width: 58 }, // E: ខ្លឹមសារមេរៀន
  ];

  addOfficialKingdomAndSchoolHeader(wsWeekly, 'E', 5);

  wsWeekly.mergeCells('A3:E3');
  wsWeekly.getCell('A3').value = 'សម្រង់អត្ថបទប្រចាំសប្តាហ៍';
  wsWeekly.getCell('A3').font = { name: FONT_KHMER_TITLE, size: 12 };
  wsWeekly.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
  wsWeekly.getRow(3).height = 24;

  wsWeekly.mergeCells('A4:E4');
  wsWeekly.getCell('A4').value = {
    formula: `"ឆ្នាំសិក្សា "&Settings!$B$5`,
    result: 'ឆ្នាំសិក្សា ២០២៥ ~ ២០២៦',
  };
  wsWeekly.getCell('A4').font = { name: FONT_KHMER_TITLE, size: 11 };
  wsWeekly.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle' };
  wsWeekly.getRow(4).height = 22;

  wsWeekly.mergeCells('A5:E5');
  wsWeekly.getCell('A5').value = {
    formula: `"គ្រូមុខវិជ្ជា ៖ "&Settings!$B$3`,
    result: 'គ្រូមុខវិជ្ជា ៖ លឹម ដាណេ',
  };
  wsWeekly.getCell('A5').font = { name: FONT_KHMER_BODY, size: 10 };

  wsWeekly.mergeCells('A6:E6');
  wsWeekly.getCell('A6').value = 'ម៉ោងសិក្សា ៖ ១ម៉ ៣០ន/ សប្តាហ៍';
  wsWeekly.getCell('A6').font = { name: FONT_KHMER_BODY, size: 10 };

  wsWeekly.mergeCells('A7:E7');
  wsWeekly.getCell('A7').value = {
    formula: `"សៀវភៅគោល ៖ "&Settings!$B$9`,
    result: 'សៀវភៅគោល ៖ 快乐汉语（第二册）ភាសាចិនរីករាយ (កំរិត២)',
  };
  wsWeekly.getCell('A7').font = { name: FONT_KHMER_BODY, size: 10 };

  const weeklyHeaders = ['កាលបរិច្ឆេទ', 'ថ្ងៃ', 'ម៉ោង', 'ថ្នាក់', 'ខ្លឹមសារមេរៀន'];
  wsWeekly.getRow(8).height = 24;
  weeklyHeaders.forEach((h, i) => {
    const cell = wsWeekly.getCell(8, i + 1);
    cell.value = h;
    cell.font = { name: FONT_KHMER_TITLE, size: 10 };
    cell.fill = HEADER_FILL;
    cell.border = THIN_BORDER;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  const weeklyWeeks: {
    mondayIso: string;
    lunarSig: string;
    gregSig: string;
    defaultLesson: string;
    overrides?: Record<string, string>;
  }[] = [
    {
      mondayIso: '2025-11-10',
      lunarSig: 'ថ្ងៃ សុក្រ ៩រោច ខែ កត្តិក ឆ្នាំ ម្សាញ់ សប្តស័ក ព.ស២៥៦៩',
      gregSig: 'រាជធានីភ្នំពេញ, ថ្ងៃទី ១៤ ខែ វិច្ឆិកា ឆ្នាំ២០២៥',
      defaultLesson:
        '汉语基础（复习学前测试） មូលដ្ឋានគ្រឹះភាសាចិន\n- 声母 ព្យញ្ជនៈ\n- 韵母 ស្រៈ\n- 声调与拼读 សូរសំឡេង និងការរៀនប្រកប ភីនអ៊ីន',
    },
    {
      mondayIso: '2025-11-17',
      lunarSig: 'ថ្ងៃ សុក្រ ១កើត ខែ មិគសិរ ឆ្នាំ ម្សាញ់ សប្តស័ក ព.ស២៥៦៩',
      gregSig: 'រាជធានីភ្នំពេញ, ថ្ងៃទី ២១ ខែ វិច្ឆិកា ឆ្នាំ២០២៥',
      defaultLesson:
        '第一单元 我和朋友 · 第一课 他是谁 មេរៀនទី១ តើគាត់គឺជានរណា\n1. 生词 ពាក្យថ្មី៖ ①姓 ②名字 ③多 ④朋友 ⑤谁 ⑥欢迎 ⑦地方 ⑧国家 ⑨号码',
      overrides: {
        '10C': 'ការផ្សព្វផ្សាយសារប្រឆាំងអំពើពុករលួយដល់យុវជន',
      },
    },
    {
      mondayIso: '2025-11-24',
      lunarSig: 'ថ្ងៃ សុក្រ ៨កើត ខែ មិគសិរ ឆ្នាំ ម្សាញ់ សប្តស័ក ព.ស២៥៦៩',
      gregSig: 'រាជធានីភ្នំពេញ, ថ្ងៃទី ២៨ ខែ វិច្ឆិកា ឆ្នាំ២០២៥',
      defaultLesson:
        '第一单元 我和朋友 · 第一课 他是谁 មេរៀនទី១ តើគាត់គឺជានរណា\n2. 句型 ទម្រង់ល្បះ៖ ①你姓什么？ ②叫什么名字？ ③我姓马，我叫马丽丽。 ④他是谁？',
      overrides: {
        '10C':
          '第一单元 我和朋友 · 第一课 他是谁 មេរៀនទី១ តើគាត់គឺជានរណា\n1. 生词 ពាក្យថ្មី៖ ①姓 ②名字 ③多 ④朋友 ⑤谁 ⑥欢迎 ⑦地方 ⑧国家 ⑨号码\n2. 句型 ទម្រង់ល្បះ៖ ①你姓什么？ ②叫什么名字？ ③我姓马，我叫马丽丽。 ④他是谁？',
      },
    },
    {
      mondayIso: '2025-12-01',
      lunarSig: 'ថ្ងៃ សុក្រ ១៥កើត ខែ មិគសិរ ឆ្នាំ ម្សាញ់ សប្តស័ក ព.ស២៥៦៩',
      gregSig: 'រាជធានីភ្នំពេញ, ថ្ងៃទី ៥ ខែ ធ្នូ ឆ្នាំ២០២៥',
      defaultLesson:
        '第一单元 我和朋友 · 第一课 他是谁 មេរៀនទី១ តើគាត់គឺជានរណា\n3. 对话 សន្ទនា៖ A: 你好。 B: 你好。 A: 你姓什么？ B: 我姓马。 A: 你叫什么名字？ B: 我叫马丽丽。 A: 他是谁？ B: 他是我的朋友。 A: 欢迎！你家在什么地方？ C: 我家在香港。',
    },
    {
      mondayIso: '2025-12-08',
      lunarSig: 'ថ្ងៃ សុក្រ ៧រោច ខែ មិគសិរ ឆ្នាំ ម្សាញ់ សប្តស័ក ព.ស២៥៦៩',
      gregSig: 'រាជធានីភ្នំពេញ, ថ្ងៃទី ១២ ខែ ធ្នូ ឆ្នាំ២០២៥',
      defaultLesson:
        '第一单元 我和朋友 · 第一课 他是谁 មេរៀនទី១ តើគាត់គឺជានរណា\n4. 汉字笔画 គំនូសអក្សរចិន៖ 姓、名、字、多、朋、友、谁、欢、迎、地、方、国、家、号、码\n5. 综合练习：课本和练习册 ធ្វើលំហាត់ក្នុងសៀវភៅលំហាត់',
    },
    {
      mondayIso: '2025-12-15',
      lunarSig: 'ថ្ងៃ សុក្រ ១៤រោច ខែ មិគសិរ ឆ្នាំ ម្សាញ់ សប្តស័ក ព.ស២៥៦៩',
      gregSig: 'រាជធានីភ្នំពេញ, ថ្ងៃទី ១៩ ខែ ធ្នូ ឆ្នាំ២០២៥',
      defaultLesson: '学前考试 ប្រឡងតេស្តដើមឆ្នាំ',
    },
    {
      mondayIso: '2025-12-22',
      lunarSig: 'ថ្ងៃ សុក្រ ៧កើត ខែ បុស្ស ឆ្នាំ ម្សាញ់ សប្តស័ក ព.ស២៥៦៩',
      gregSig: 'រាជធានីភ្នំពេញ, ថ្ងៃទី ២៦ ខែ ធ្នូ ឆ្នាំ២០២៥',
      defaultLesson:
        '第一单元 我和朋友 · 第二课 她比我高 មេរៀនទី២ នាងខ្ពស់ជាងខ្ញុំ\n1. 生词 ពាក្យថ្មី៖ (1)多 (2)今年 (3)她 (4)比 (5)说 (6)英语 (7)汉语 (8)谢谢 (9)网友 (10)年龄 (11)高 (12)艺术',
    },
  ];

  const weeklyClassSlots: { dayOffset: number; dayKh: string; timeStr: string; cid: string }[] = [
    { dayOffset: 0, dayKh: 'ចន្ទ', timeStr: '13:00-14:30', cid: '9A' },
    { dayOffset: 0, dayKh: 'ចន្ទ', timeStr: '15:00-16:30', cid: '9C' },
    { dayOffset: 1, dayKh: 'អង្គារ', timeStr: '13:00-14:30', cid: '8C' },
    { dayOffset: 1, dayKh: 'អង្គារ', timeStr: '15:00-16:30', cid: '8A' },
    { dayOffset: 2, dayKh: 'ពុធ', timeStr: '13:00-14:30', cid: '10A' },
    { dayOffset: 2, dayKh: 'ពុធ', timeStr: '15:00-16:30', cid: '10C' },
    { dayOffset: 3, dayKh: 'ព្រហស្បតិ៍', timeStr: '13:00-14:30', cid: '9B' },
    { dayOffset: 3, dayKh: 'ព្រហស្បតិ៍', timeStr: '15:00-16:30', cid: '8B' },
  ];

  let curWeeklyRow = 9;
  for (const wk of weeklyWeeks) {
    const baseDate = new Date(`${wk.mondayIso}T00:00:00Z`);
    for (const slot of weeklyClassSlots) {
      const r = curWeeklyRow++;
      const slotDate = new Date(baseDate.getTime() + slot.dayOffset * 86400000);
      wsWeekly.getRow(r).height = 42;

      const dateCell = wsWeekly.getCell(`A${r}`);
      dateCell.value = slotDate;
      dateCell.numFmt = 'dd/mm/yyyy';

      wsWeekly.getCell(`B${r}`).value = {
        formula: `CHOOSE(WEEKDAY(A${r},2),"ចន្ទ","អង្គារ","ពុធ","ព្រហស្បតិ៍","សុក្រ","សៅរ៍","អាទិត្យ")`,
        result: slot.dayKh,
      };
      wsWeekly.getCell(`C${r}`).value = {
        formula: `INDEX(Settings!$C$12:$C$19,MATCH(D${r},Settings!$A$12:$A$19,0))`,
        result: slot.timeStr,
      };
      wsWeekly.getCell(`D${r}`).value = slot.cid;
      wsWeekly.getCell(`E${r}`).value = wk.overrides?.[slot.cid] || wk.defaultLesson;

      for (let c = 1; c <= 5; c++) {
        const cell = wsWeekly.getCell(r, c);
        cell.font = { name: FONT_KHMER_BODY, size: 9.5 };
        cell.border = THIN_BORDER;
        cell.alignment = {
          horizontal: c === 5 ? 'left' : 'center',
          vertical: 'middle',
          wrapText: true,
        };
      }
    }
    addOfficialSignatureFooter(wsWeekly, curWeeklyRow - 1, 5, wk.lunarSig, wk.gregSig);
    curWeeklyRow += 7;
  }

  // ============================================================================
  // 6. Teacher_Log Sheet (ភារកិច្ចគ្រូបង្រៀន ស្តង់ដាសាលាគំរូ)
  // ============================================================================
  const wsTLog = wb.addWorksheet('Teacher_Log');
  applyA4PortraitSetup(wsTLog);
  wsTLog.columns = [
    { width: 6 },
    { width: 42 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
  ];

  addOfficialKingdomAndSchoolHeader(wsTLog, 'F', 6);

  wsTLog.mergeCells('A3:F3');
  wsTLog.getCell('A3').value = 'ភារកិច្ចគ្រូបង្រៀន ស្តង់ដាសាលាគំរូ';
  wsTLog.getCell('A3').font = { name: FONT_KHMER_TITLE, size: 12 };
  wsTLog.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
  wsTLog.getRow(3).height = 24;

  wsTLog.mergeCells('A4:F4');
  wsTLog.getCell('A4').value = {
    formula: `"ឆ្នាំសិក្សា "&Settings!$B$5`,
    result: 'ឆ្នាំសិក្សា ២០២៥ ~ ២០២៦',
  };
  wsTLog.getCell('A4').font = { name: FONT_KHMER_TITLE, size: 11 };
  wsTLog.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 6: Teacher, Subject, Class Dropdown Selector
  wsTLog.getCell('A6').value = 'លោក - លោកស្រី ៖';
  wsTLog.getCell('B6').value = { formula: 'Settings!$B$3', result: 'លឹម ដាណេ' };
  wsTLog.getCell('C6').value = 'បង្រៀនមុខវិជ្ជា ៖';
  wsTLog.getCell('D6').value = { formula: 'Settings!$B$4', result: 'ភាសាចិន' };
  wsTLog.getCell('E6').value = 'ថ្នាក់ទី ៖';
  wsTLog.getCell('F6').value = '10C';
  wsTLog.getCell('F6').fill = YELLOW_FILL;
  wsTLog.getCell('F6').border = THIN_BORDER;
  wsTLog.getCell('F6').alignment = { horizontal: 'center', vertical: 'middle' };
  wsTLog.getCell('F6').dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['Settings!$A$12:$A$19'],
  };

  // Row 7: Student Count & Female Count via COUNTIF/COUNTIFS
  wsTLog.getCell('A7').value = 'សិស្សសរុប ៖';
  wsTLog.getCell('B7').value = {
    formula: 'COUNTIF(Roster!$A$2:$A$300, F6)',
    result: 19,
  };
  wsTLog.getCell('C7').value = 'នាក់ / ស្រី ៖';
  wsTLog.getCell('D7').value = {
    formula: 'COUNTIFS(Roster!$A$2:$A$300, F6, Roster!$F$2:$F$300, "ស")',
    result: 7,
  };
  wsTLog.getCell('E7').value = 'នាក់';

  // Section I: Monthly Teacher Tasks (5 items)
  wsTLog.mergeCells('A9:C9');
  wsTLog.getCell('A9').value = 'I. គ្រូត្រូវធ្វើប្រចាំខែ';
  wsTLog.getCell('A9').font = { name: FONT_KHMER_TITLE, size: 10 };
  wsTLog.getCell('D9').value = 'មករា';
  wsTLog.getCell('D9').fill = YELLOW_FILL;
  wsTLog.getCell('D9').border = THIN_BORDER;

  const section1Items: [string, number, string][] = [
    ['- គ្រូបង្រៀនបានដាក់កិច្ចការឱ្យសិស្សស្វ័យសិក្សាមុនពេលមកជួបគ្រូចំនួន ៖', 2, 'ដងក្នុង១ខែ'],
    ['- គ្រូបង្រៀនបានដាក់កិច្ចការ ជាគម្រោង/ចំណោទ/លំហាត់ឱ្យសិស្សស្រាវជ្រាវចំនួន ៖', 1, 'ដងក្នុង១ខែ'],
    ['- គ្រូបង្រៀនបានដាក់កិច្ចការផ្ទះចំនួន ៖', 1, 'ដងក្នុង១ខែ'],
    ['- គ្រូបង្រៀនបានកែកិច្ចការសិស្សចំនួន ៖', 1, 'ដងក្នុង១ខែ'],
    ['- គ្រូបង្រៀនបានដាក់ពិន្ទុឱ្យសិស្សផ្នែកបំណិនសម្បទានិងចរិយាសម្បទាចំនួន ៖', 16, 'នាក់ក្នុង១ខែ'],
  ];

  section1Items.forEach(([label, val, unit], idx) => {
    const r = 10 + idx;
    wsTLog.getRow(r).height = 22;
    wsTLog.mergeCells(`A${r}:C${r}`);
    wsTLog.getCell(`A${r}`).value = label;
    wsTLog.getCell(`A${r}`).font = { name: FONT_KHMER_BODY, size: 10 };
    wsTLog.getCell(`A${r}`).border = THIN_BORDER;

    wsTLog.getCell(`D${r}`).value = val;
    wsTLog.getCell(`D${r}`).font = { name: FONT_KHMER_BODY, size: 10, bold: true };
    wsTLog.getCell(`D${r}`).fill = YELLOW_FILL;
    wsTLog.getCell(`D${r}`).border = THIN_BORDER;
    wsTLog.getCell(`D${r}`).alignment = { horizontal: 'center', vertical: 'middle' };

    wsTLog.mergeCells(`E${r}:F${r}`);
    wsTLog.getCell(`E${r}`).value = unit;
    wsTLog.getCell(`E${r}`).font = { name: FONT_KHMER_BODY, size: 10 };
    wsTLog.getCell(`E${r}`).border = THIN_BORDER;
  });

  // Section II: Students (3 items + percentage of class formula)
  wsTLog.mergeCells('A16:F16');
  wsTLog.getCell('A16').value = 'II. សិស្ស';
  wsTLog.getCell('A16').font = { name: FONT_KHMER_TITLE, size: 10 };

  const section2Items: [string, string, number][] = [
    [
      '- សិស្សបានស្វ័យសិក្សាមុនពេលមកជួបគ្រូបង្រៀនចំនួន ៖',
      'COUNTIF(Student_Activity!$F$10:$F$49,"✓")',
      16,
    ],
    [
      '- សិស្សបានធ្វើកិច្ចការ ជាគម្រោង/ចំណោទ/លំហាត់ ស្រាវជ្រាវចំនួន ៖',
      'COUNTIF(Student_Activity!$H$10:$H$49,"✓")',
      16,
    ],
    [
      '- សិស្សបានធ្វើកិច្ចការផ្ទះចំនួន ៖',
      'COUNTIF(Student_Activity!$G$10:$G$49,"✓")',
      16,
    ],
  ];

  section2Items.forEach(([label, formulaStr, resVal], idx) => {
    const r = 17 + idx;
    wsTLog.getRow(r).height = 22;
    wsTLog.mergeCells(`A${r}:C${r}`);
    wsTLog.getCell(`A${r}`).value = label;
    wsTLog.getCell(`A${r}`).font = { name: FONT_KHMER_BODY, size: 10 };
    wsTLog.getCell(`A${r}`).border = THIN_BORDER;

    wsTLog.getCell(`D${r}`).value = { formula: formulaStr, result: resVal };
    wsTLog.getCell(`D${r}`).font = { name: FONT_KHMER_BODY, size: 10, bold: true };
    wsTLog.getCell(`D${r}`).border = THIN_BORDER;
    wsTLog.getCell(`D${r}`).alignment = { horizontal: 'center', vertical: 'middle' };

    wsTLog.getCell(`E${r}`).value = 'នាក់ក្នុង១ខែ';
    wsTLog.getCell(`E${r}`).font = { name: FONT_KHMER_BODY, size: 10 };
    wsTLog.getCell(`E${r}`).border = THIN_BORDER;

    wsTLog.getCell(`F${r}`).value = {
      formula: `IF($B$7>0, D${r}/$B$7, 0)`,
      result: resVal / 19,
    };
    wsTLog.getCell(`F${r}`).numFmt = '0.0%';
    wsTLog.getCell(`F${r}`).font = { name: FONT_KHMER_BODY, size: 10, bold: true };
    wsTLog.getCell(`F${r}`).border = THIN_BORDER;
    wsTLog.getCell(`F${r}`).alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Section III: Annual List (6 Categories of Students)
  wsTLog.mergeCells('A21:F21');
  wsTLog.getCell('A21').value =
    'III. គ្រូត្រូវធ្វើប្រចាំឆ្នាំ (បញ្ជីឈ្មោះសិស្សទាំង ៦ ប្រភេទ)';
  wsTLog.getCell('A21').font = { name: FONT_KHMER_TITLE, size: 10 };

  const section3Categories = [
    '១. សិស្សក្រីក្រ ជួបការលំបាក',
    '២. សិស្សរងហិង្សា ឬមានវិបត្តិផ្លូវចិត្ត',
    '៣. សិស្សឈប់ច្រើនម៉ោងខ្លួន',
    '៤. សិស្សរៀនខ្សោយមុខវិជ្ជាខ្លួន',
    '៥. សិស្សប្រើប្រាស់រទេះរុញ',
    '៦. សិស្សពិបាកក្នុងការដើរ',
  ];

  section3Categories.forEach((cat, idx) => {
    const r = 22 + idx;
    wsTLog.getRow(r).height = 21;
    wsTLog.mergeCells(`A${r}:B${r}`);
    wsTLog.getCell(`A${r}`).value = cat;
    wsTLog.getCell(`A${r}`).font = { name: FONT_KHMER_BODY, size: 10 };
    wsTLog.getCell(`A${r}`).border = THIN_BORDER;

    wsTLog.mergeCells(`C${r}:F${r}`);
    wsTLog.getCell(`C${r}`).value =
      idx === 2 ? 'សឿន ផុនា (មិនដែលមករៀន)' : idx === 0 ? 'អួន សុក្ររក្សា (សុំមិនបង់ថវិកា)' : '';
    wsTLog.getCell(`C${r}`).font = { name: FONT_KHMER_BODY, size: 10 };
    wsTLog.getCell(`C${r}`).fill = YELLOW_FILL;
    wsTLog.getCell(`C${r}`).border = THIN_BORDER;
  });

  addOfficialSignatureFooter(wsTLog, 28, 6);

  // ============================================================================
  // 7. Student_Activity Sheet (បញ្ជីរាយនាមសិស្សតាមដានស្តង់ដាសាលាគំរូ)
  // ============================================================================
  const wsAct = wb.addWorksheet('Student_Activity');
  applyA4PortraitSetup(wsAct, '9:9');
  wsAct.columns = [
    { width: 6 },  // A: ល.រ
    { width: 11 }, // B: អត្តលេខ
    { width: 24 }, // C: គោត្តនាម-នាម
    { width: 6 },  // D: ភេទ
    { width: 14 }, // E: ថ្ងៃ.ខែ.ឆ្នាំកំណើត
    { width: 13 }, // F: បានទទួលកិច្ចការរៀនមុន
    { width: 13 }, // G: បានទទួលកិច្ចការផ្ទះ
    { width: 12 }, // H: បានធ្វើកិច្ចការ
    { width: 13 }, // I: មានផែនការសិក្សា
    { width: 12 }, // J: មានស.ភគោល
    { width: 16 }, // K: ផ្សេងៗ
  ];

  addOfficialKingdomAndSchoolHeader(wsAct, 'K', 11);

  wsAct.mergeCells('A3:H3');
  wsAct.getCell('A3').value = {
    formula: `"បញ្ជីរាយនាមសិស្សថ្នាក់ទី "&I3`,
    result: 'បញ្ជីរាយនាមសិស្សថ្នាក់ទី 10C',
  };
  wsAct.getCell('A3').font = { name: FONT_KHMER_TITLE, size: 12 };
  wsAct.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };

  wsAct.getCell('I3').value = '10C';
  wsAct.getCell('I3').fill = YELLOW_FILL;
  wsAct.getCell('I3').border = THIN_BORDER;
  wsAct.getCell('I3').font = { name: FONT_KHMER_BODY, size: 11, bold: true };
  wsAct.getCell('I3').alignment = { horizontal: 'center', vertical: 'middle' };
  wsAct.getCell('I3').dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['Settings!$A$12:$A$19'],
  };

  wsAct.mergeCells('J3:K3');
  wsAct.getCell('J3').value = {
    formula: `"មុខវិជ្ជា "&Settings!$B$4`,
    result: 'មុខវិជ្ជា ភាសាចិន',
  };
  wsAct.getCell('J3').font = { name: FONT_KHMER_BODY, size: 10, bold: true };
  wsAct.getRow(3).height = 24;

  wsAct.mergeCells('A4:K4');
  wsAct.getCell('A4').value = {
    formula: `"ឆ្នាំសិក្សា "&Settings!$B$5`,
    result: 'ឆ្នាំសិក្សា ២០២៥ ~ ២០២៦',
  };
  wsAct.getCell('A4').font = { name: FONT_KHMER_TITLE, size: 11 };
  wsAct.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle' };
  wsAct.getRow(4).height = 22;

  const actHeaders = [
    'ល.រ',
    'អត្តលេខ',
    'គោត្តនាម-នាម',
    'ភេទ',
    'ថ្ងៃ.ខែ.ឆ្នាំកំណើត',
    'បានទទួលកិច្ចការរៀនមុន',
    'បានទទួលកិច្ចការផ្ទះ',
    'បានធ្វើកិច្ចការ',
    'មានផែនការសិក្សា',
    'មានស.ភគោល',
    'ផ្សេងៗ',
  ];
  wsAct.getRow(6).height = 34;
  actHeaders.forEach((h, i) => {
    const cell = wsAct.getCell(6, i + 1);
    cell.value = h;
    cell.font = { name: FONT_KHMER_BODY, size: 9.5, bold: true };
    cell.fill = HEADER_FILL;
    cell.border = THIN_BORDER;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });

  const stu10C = sortStudentsByKhmerName(
    state.students.filter((s) => s.classId === '10C')
  );
  const maxActRows = 35;
  const actStartRow = 7;
  const actEndRow = actStartRow + maxActRows - 1;

  for (let i = 0; i < maxActRows; i++) {
    const r = actStartRow + i;
    const stuNo = i + 1;
    const stu = stu10C[i];
    const keyExpr = `$I$3&"-"&A${r}`;

    wsAct.getRow(r).height = 19;
    wsAct.getCell(`A${r}`).value = stuNo;
    wsAct.getCell(`B${r}`).value = {
      formula: `IFERROR(INDEX(Roster!$C$2:$C$300,MATCH(${keyExpr},Roster!$I$2:$I$300,0)),"")`,
      result: stu?.studentCode || '',
    };
    wsAct.getCell(`C${r}`).value = {
      formula: `IFERROR(INDEX(Roster!$D$2:$D$300,MATCH(${keyExpr},Roster!$I$2:$I$300,0)),"")`,
      result: stu?.name || '',
    };
    wsAct.getCell(`D${r}`).value = {
      formula: `IFERROR(INDEX(Roster!$F$2:$F$300,MATCH(${keyExpr},Roster!$I$2:$I$300,0)),"")`,
      result: stu ? (stu.gender === 'F' ? 'ស' : 'ប') : '',
    };
    wsAct.getCell(`E${r}`).value = {
      formula: `IFERROR(INDEX(Roster!$G$2:$G$300,MATCH(${keyExpr},Roster!$I$2:$I$300,0)),"")`,
      result: stu?.dob || '',
    };

    const hasCheck = stu && stu.note !== 'មិនដែលមករៀន';
    for (let c = 6; c <= 10; c++) {
      const cell = wsAct.getCell(r, c);
      cell.value = hasCheck ? '✓' : '';
      cell.fill = YELLOW_FILL;
      cell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"✓"'],
      };
    }

    wsAct.getCell(`K${r}`).value = {
      formula: `IFERROR(INDEX(Roster!$H$2:$H$300,MATCH(${keyExpr},Roster!$I$2:$I$300,0)),"")`,
      result: stu?.note || '',
    };

    for (let c = 1; c <= 11; c++) {
      const cell = wsAct.getCell(r, c);
      cell.font = { name: FONT_KHMER_BODY, size: 9.5 };
      cell.border = THIN_BORDER;
      cell.alignment = {
        horizontal: c === 3 || c === 11 ? 'left' : 'center',
        vertical: 'middle',
      };
    }
  }

  // Footer statistics on Student_Activity
  const actSum1 = actEndRow + 1;
  wsAct.mergeCells(`A${actSum1}:E${actSum1}`);
  wsAct.getCell(`A${actSum1}`).value = {
    formula: `"បញ្ឈប់បញ្ជីត្រឹមចំនួន "&COUNTIF(C${actStartRow}:C${actEndRow},"?*")&" នាក់   ស្រី ៖ "&COUNTIF(D${actStartRow}:D${actEndRow},"ស")&" នាក់"`,
    result: `បញ្ឈប់បញ្ជីត្រឹមចំនួន ${stu10C.length} នាក់   ស្រី ៖ ${
      stu10C.filter((s) => s.gender === 'F').length
    } នាក់`,
  };
  wsAct.getCell(`A${actSum1}`).font = { name: FONT_KHMER_BODY, size: 10, bold: true };

  const actSum2 = actEndRow + 2;
  wsAct.mergeCells(`A${actSum2}:E${actSum2}`);
  wsAct.getCell(`A${actSum2}`).value = 'សិស្សត្រួតថ្នាក់ ៖ ០០នាក់   ស្រី ៖ ០០នាក់';
  wsAct.getCell(`A${actSum2}`).font = { name: FONT_KHMER_BODY, size: 10 };
  wsAct.getCell(`A${actSum2}`).fill = YELLOW_FILL;

  const actSum3 = actEndRow + 3;
  wsAct.mergeCells(`A${actSum3}:E${actSum3}`);
  wsAct.getCell(`A${actSum3}`).value = 'សិស្សឈប់រៀន / ផ្ទេរចូល ៖ ០០នាក់   ស្រី ៖ ០០នាក់';
  wsAct.getCell(`A${actSum3}`).font = { name: FONT_KHMER_BODY, size: 10 };
  wsAct.getCell(`A${actSum3}`).fill = YELLOW_FILL;

  addOfficialSignatureFooter(
    wsAct,
    actSum3,
    11,
    'ថ្ងៃសៅរ៍ ១១កើត ខែ កត្តិក ឆ្នាំ ម្សាញ់ សប្តស័ក ព.ស២៥៦៩',
    'ត្រូវនឹងថ្ងៃទី០១ ខែវិច្ឆិកា ឆ្នាំ២០២៥'
  );

  // ============================================================================
  // 8. Skill_Conduct Sheet (ស្តង់ដាទី១ស្តីពីលទ្ធផលនៃការសិក្សា បំណិនសម្បទា ចរិយាសម្បទា)
  // ============================================================================
  const wsSkill = wb.addWorksheet('Skill_Conduct');
  applyA4PortraitSetup(wsSkill, '6:6');
  wsSkill.columns = [
    { width: 6 },  // A: ល.រ
    { width: 12 }, // B: អត្តលេខ
    { width: 26 }, // C: គោត្តនាម និងនាម
    { width: 8 },  // D: ភេទ
    { width: 16 }, // E: ថ្ងៃ.ខែ.ឆ្នាំកំណើត
    { width: 16 }, // F: បំណិនសម្បទា (1-5)
    { width: 16 }, // G: ចរិយាសម្បទា (1-5)
    { width: 20 }, // H: ផ្សេងៗ
  ];

  addOfficialKingdomAndSchoolHeader(wsSkill, 'H', 8);

  wsSkill.mergeCells('A3:F3');
  wsSkill.getCell('A3').value = {
    formula: `"ស្តង់ដាទី១ស្តីពីលទ្ធផលនៃការសិក្សា បំណិនសម្បទា ចរិយាសម្បទារបស់សិស្សថ្នាក់ទី "&G3`,
    result: 'ស្តង់ដាទី១ស្តីពីលទ្ធផលនៃការសិក្សា បំណិនសម្បទា ចរិយាសម្បទារបស់សិស្សថ្នាក់ទី 10C',
  };
  wsSkill.getCell('A3').font = { name: FONT_KHMER_TITLE, size: 11 };
  wsSkill.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };

  wsSkill.getCell('G3').value = '10C';
  wsSkill.getCell('G3').fill = YELLOW_FILL;
  wsSkill.getCell('G3').border = THIN_BORDER;
  wsSkill.getCell('G3').font = { name: FONT_KHMER_BODY, size: 11, bold: true };
  wsSkill.getCell('G3').alignment = { horizontal: 'center', vertical: 'middle' };
  wsSkill.getCell('G3').dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['Settings!$A$12:$A$19'],
  };

  wsSkill.getCell('H3').value = 'ខែកុម្ភៈ';
  wsSkill.getCell('H3').fill = YELLOW_FILL;
  wsSkill.getCell('H3').border = THIN_BORDER;
  wsSkill.getCell('H3').font = { name: FONT_KHMER_BODY, size: 10, bold: true };
  wsSkill.getCell('H3').alignment = { horizontal: 'center', vertical: 'middle' };
  wsSkill.getRow(3).height = 24;

  wsSkill.mergeCells('A4:F4');
  wsSkill.getCell('A4').value = {
    formula: `"ឆ្នាំសិក្សា "&Settings!$B$5`,
    result: 'ឆ្នាំសិក្សា ២០២៥ ~ ២០២៦',
  };
  wsSkill.getCell('A4').font = { name: FONT_KHMER_TITLE, size: 10.5 };
  wsSkill.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle' };

  wsSkill.mergeCells('G4:H4');
  wsSkill.getCell('G4').value = {
    formula: `"មុខវិជ្ជា "&Settings!$B$4`,
    result: 'មុខវិជ្ជា ភាសាចិន',
  };
  wsSkill.getCell('G4').font = { name: FONT_KHMER_BODY, size: 10, bold: true };
  wsSkill.getCell('G4').alignment = { horizontal: 'center', vertical: 'middle' };
  wsSkill.getRow(4).height = 22;

  const skillHeaders = [
    'ល.រ',
    'អត្តលេខ',
    'គោត្តនាម និងនាម',
    'ភេទ',
    'ថ្ងៃ.ខែ.ឆ្នាំកំណើត',
    'បំណិនសម្បទា',
    'ចរិយាសម្បទា',
    'ផ្សេងៗ',
  ];
  wsSkill.getRow(6).height = 26;
  skillHeaders.forEach((h, i) => {
    const cell = wsSkill.getCell(6, i + 1);
    cell.value = h;
    cell.font = { name: FONT_KHMER_BODY, size: 10, bold: true };
    cell.fill = HEADER_FILL;
    cell.border = THIN_BORDER;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Exact February Skill & Conduct scores from PDF 6 Page 1 for 10C
  const feb10CScores: [number | null, number | null][] = [
    [3, 3],
    [4, 5],
    [3, 5],
    [5, 5],
    [null, null],
    [4, 3],
    [3, 3],
    [4, 4],
    [4, 5],
    [null, null],
    [3, 3],
    [4, 3],
    [3, 3],
    [3, 4],
    [5, 5],
    [3, 3],
    [4, 5],
    [3, 4],
    [3, 4],
  ];

  const skillStartRow = 7;
  const skillEndRow = skillStartRow + maxActRows - 1;
  for (let i = 0; i < maxActRows; i++) {
    const r = skillStartRow + i;
    const stuNo = i + 1;
    const stu = stu10C[i];
    const keyExpr = `$G$3&"-"&A${r}`;
    const sc = feb10CScores[i] || [null, null];

    wsSkill.getRow(r).height = 19;
    wsSkill.getCell(`A${r}`).value = stuNo;
    wsSkill.getCell(`B${r}`).value = {
      formula: `IFERROR(INDEX(Roster!$C$2:$C$300,MATCH(${keyExpr},Roster!$I$2:$I$300,0)),"")`,
      result: stu?.studentCode || '',
    };
    wsSkill.getCell(`C${r}`).value = {
      formula: `IFERROR(INDEX(Roster!$D$2:$D$300,MATCH(${keyExpr},Roster!$I$2:$I$300,0)),"")`,
      result: stu?.name || '',
    };
    wsSkill.getCell(`D${r}`).value = {
      formula: `IFERROR(INDEX(Roster!$F$2:$F$300,MATCH(${keyExpr},Roster!$I$2:$I$300,0)),"")`,
      result: stu ? (stu.gender === 'F' ? 'ស' : 'ប') : '',
    };
    wsSkill.getCell(`E${r}`).value = {
      formula: `IFERROR(INDEX(Roster!$G$2:$G$300,MATCH(${keyExpr},Roster!$I$2:$I$300,0)),"")`,
      result: stu?.dob || '',
    };

    if (sc[0] !== null) wsSkill.getCell(`F${r}`).value = sc[0];
    if (sc[1] !== null) wsSkill.getCell(`G${r}`).value = sc[1];

    for (const colLet of ['F', 'G']) {
      const cell = wsSkill.getCell(`${colLet}${r}`);
      cell.fill = YELLOW_FILL;
      cell.dataValidation = {
        type: 'whole',
        operator: 'between',
        allowBlank: true,
        formulae: [1, 5],
        showErrorMessage: true,
        errorTitle: 'ពិន្ទុមិនត្រឹមត្រូវ',
        error: 'សូមបញ្ចូលលេខគត់ពី 1 ដល់ 5',
      };
    }

    wsSkill.getCell(`H${r}`).value = {
      formula: `IFERROR(INDEX(Roster!$H$2:$H$300,MATCH(${keyExpr},Roster!$I$2:$I$300,0)),"")`,
      result: stu?.note || '',
    };

    for (let c = 1; c <= 8; c++) {
      const cell = wsSkill.getCell(r, c);
      cell.font = { name: FONT_KHMER_BODY, size: 9.5 };
      cell.border = THIN_BORDER;
      cell.alignment = {
        horizontal: c === 3 || c === 8 ? 'left' : 'center',
        vertical: 'middle',
      };
    }
  }

  const skillSumRow = skillEndRow + 1;
  wsSkill.mergeCells(`A${skillSumRow}:E${skillSumRow}`);
  wsSkill.getCell(`A${skillSumRow}`).value = {
    formula: `"បញ្ឈប់បញ្ជីត្រឹមចំនួន ៖ "&COUNTIF(C${skillStartRow}:C${skillEndRow},"?*")&"នាក់   ស្រី ៖ "&COUNTIF(D${skillStartRow}:D${skillEndRow},"ស")&"នាក់"`,
    result: `បញ្ឈប់បញ្ជីត្រឹមចំនួន ៖ ${stu10C.length}នាក់   ស្រី ៖ ${
      stu10C.filter((s) => s.gender === 'F').length
    }នាក់`,
  };
  wsSkill.getCell(`A${skillSumRow}`).font = { name: FONT_KHMER_BODY, size: 10, bold: true };

  addOfficialSignatureFooter(
    wsSkill,
    skillSumRow,
    8,
    'ថ្ងៃចន្ទ ១១កើត ខែមិគសិរ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩',
    'ត្រូវថ្ងៃទី០១ ខែធ្នូ ឆ្នាំ២០២៥'
  );

  // ============================================================================
  // 9. Guide Sheet (说明与原件模糊字迹核对清单)
  // ============================================================================
  const wsGuide = wb.addWorksheet('Guide');
  applyA4PortraitSetup(wsGuide);
  wsGuide.columns = [{ width: 26 }, { width: 32 }, { width: 65 }];

  wsGuide.mergeCells('A1:C1');
  wsGuide.getCell('A1').value =
    'Guide — 使用说明与扫描件模糊/留空项清单（វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង）';
  wsGuide.getCell('A1').font = { name: FONT_KHMER_TITLE, size: 12 };
  wsGuide.getRow(1).height = 28;

  const guideItems: [string, string, string][] = [
    ['模块 / 工作表', '位置 / 字段', '说明与原件核对情况'],
    [
      'Settings & Roster',
      '唯一数据源',
      '所有工作表的学校、教师(លឹម ដាណេ)、学年(២០២៥ ~ ២០២៦)、课程时间及 8 个班(8A–10C)共 189 名学生均引用自 Settings 与 Roster，无硬编码统计值。',
    ],
    [
      'វត្តមាន-8A ~ 10C',
      '点名表 ×8',
      '严格按原件列顺序：ល.រ | គោត្តនាម-នាម | 中文名 | ភេទ | 13个空白日期列 | ផ្សេងៗ。名单行数 = 实际学生数 + 5 空行；底部总人数与女生人数由 COUNTIF 公式自动统计。',
    ],
    [
      'Roster (10C 学号与生日)',
      '第 5 行 សិន ហ្គឺរីឡា / 第 10 行 សឿន ផុនា',
      '原件《ស្តង់ដាទី១》扫描件中 10C 班第 5 号 សិន ហ្គឺរីឡា 无学号与生日（留空）；第 10 号 សឿន ផុនា 无学号、备注为“មិនដែលមករៀន”（从未到校）。',
    ],
    [
      'Teacher_Log',
      'I. 教师每月手写铅笔字迹',
      '原件扫描件第 1、3 页手写铅笔字迹较淡（ក/ខ/គ 具体课文页码说明），已在表内预留黄色可编辑单元格，并自动关联 Student_Activity 的打勾统计及百分比。',
    ],
    [
      'Student_Activity & Skill_Conduct',
      '班级下拉选择',
      '在顶部黄色单元格选择班级（8A~10C），下方名单通过 INDEX/MATCH 自动切换对应班级学生；勾选列限制为 ✓，技能与品行分限制为 1–5 整数。',
    ],
  ];

  guideItems.forEach(([col1, col2, col3], idx) => {
    const r = idx + 2;
    wsGuide.getRow(r).height = 30;
    wsGuide.getCell(`A${r}`).value = col1;
    wsGuide.getCell(`B${r}`).value = col2;
    wsGuide.getCell(`C${r}`).value = col3;
    for (let c = 1; c <= 3; c++) {
      const cell = wsGuide.getCell(r, c);
      cell.font = {
        name: FONT_KHMER_BODY,
        size: 10,
        bold: idx === 0,
      };
      if (idx === 0) cell.fill = HEADER_FILL;
      cell.border = THIN_BORDER;
      cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    }
  });

  return await wb.xlsx.writeBuffer();
}

export async function downloadOfficialCambodiaWorkbook(
  state?: AppDatabaseState
): Promise<void> {
  const buffer = await buildOfficialCambodiaWorkbookBuffer(state);
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'CheaSimBKK_Chinese_LimDane_2025_2026.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
