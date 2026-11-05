import React, { useMemo, useState } from 'react';
import { Check, Download, FileCode2, FileText, Printer } from 'lucide-react';
import { AppDatabaseState } from '../types';
import {
  generateFullTeachingDocumentMarkdown,
  MarkdownDocSection,
} from '../utils/markdownGenerator';
import { SignatureDateEditor } from './SignatureDateEditor';

function convertSinglePageToA4Html(mdPage: string): string {
  const lines = mdPage.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  let inOrderedList = false;
  let tableBuffer: string[] = [];

  const formatInline = (text: string): string => {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  };

  const flushList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
    if (inOrderedList) {
      out.push('</ol>');
      inOrderedList = false;
    }
  };

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const rawParsedRows = tableBuffer.map((r) =>
      r
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim())
    );

    const alignRow = rawParsedRows.find((cells) =>
      cells.every((c) => /^:?-{2,}:?$/.test(c))
    );
    const colAlignments: ('center' | 'right' | 'left')[] = alignRow
      ? alignRow.map((c) => {
          if (c.startsWith(':') && c.endsWith(':')) return 'center';
          if (c.endsWith(':')) return 'right';
          return 'left';
        })
      : [];

    const rows = rawParsedRows.filter(
      (cells) => !cells.every((c) => /^:?-{2,}:?$/.test(c))
    );

    if (rows.length > 0) {
      const isScheduleTable =
        rows[0]?.includes('កម្រិតថ្នាក់') && rows[0]?.includes('សៀវភៅគោល');
      const isWeeklyLogTable =
        rows[0]?.includes('កាលបរិច្ឆេទ') && rows[0]?.includes('ខ្លឹមសារមេរៀន');
      const extraClass = isScheduleTable
        ? ' a4-nowrap-table'
        : isWeeklyLogTable
        ? ' a4-weekly-table'
        : '';
      out.push(
        `<table class="a4-table${extraClass}" border="1" cellspacing="0" cellpadding="6">`
      );
      rows.forEach((cells, rIdx) => {
        out.push('<tr>');
        cells.forEach((cell, cIdx) => {
          if (rIdx === 0) {
            out.push(
              `<th style="text-align:center;vertical-align:middle;">${formatInline(
                cell
              )}</th>`
            );
          } else {
            const align = colAlignments[cIdx] || 'left';
            const styleAttr =
              align === 'center'
                ? ' style="text-align:center;vertical-align:middle;"'
                : align === 'right'
                ? ' style="text-align:right;vertical-align:middle;"'
                : ' style="vertical-align:middle;"';
            out.push(`<td${styleAttr}>${formatInline(cell)}</td>`);
          }
        });
        out.push('</tr>');
      });
      out.push('</table>');
    }
    tableBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      tableBuffer.push(line);
      continue;
    } else {
      flushTable();
    }

    if (!line) {
      flushList();
      continue;
    }

    // Pass raw HTML blocks (official A4 header, multi-header tables & signature blocks) straight through
    if (
      line.startsWith('<div') ||
      line.startsWith('</div') ||
      line.startsWith('<table') ||
      line.startsWith('</table') ||
      line.startsWith('<thead') ||
      line.startsWith('</thead') ||
      line.startsWith('<tbody') ||
      line.startsWith('</tbody') ||
      line.startsWith('<tr') ||
      line.startsWith('</tr') ||
      line.startsWith('<th') ||
      line.startsWith('<td')
    ) {
      flushList();
      out.push(rawLine);
      continue;
    }

    if (line === '---') {
      flushList();
      out.push('<hr class="section-divider" />');
      continue;
    }

    if (line.startsWith('#### ')) {
      flushList();
      out.push(`<h4>${formatInline(line.slice(5))}</h4>`);
    } else if (line.startsWith('### ')) {
      flushList();
      out.push(`<h3>${formatInline(line.slice(4))}</h3>`);
    } else if (line.startsWith('## ')) {
      flushList();
      out.push(`<h2 class="a4-subtitle">${formatInline(line.slice(3))}</h2>`);
    } else if (line.startsWith('# ')) {
      flushList();
      out.push(`<h1 class="a4-title">${formatInline(line.slice(2))}</h1>`);
    } else if (line.startsWith('- ')) {
      if (inOrderedList) {
        out.push('</ol>');
        inOrderedList = false;
      }
      if (!inList) {
        out.push('<ul class="a4-meta-list">');
        inList = true;
      }
      out.push(`<li>${formatInline(line.slice(2))}</li>`);
    } else if (/^\d+\.\s+/.test(line)) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      if (!inOrderedList) {
        out.push('<ol class="a4-ordered-list">');
        inOrderedList = true;
      }
      out.push(`<li>${formatInline(line.replace(/^\d+\.\s+/, ''))}</li>`);
    } else {
      flushList();
      out.push(`<p>${formatInline(line)}</p>`);
    }
  }

  flushList();
  flushTable();
  return `<div class="a4-sheet">\n${out.join('\n')}\n</div>`;
}

// Convert document content into A4 pages separated by <div style="page-break-after:always;"></div>
export function markdownToCleanSemanticHtml(md: string): string {
  const rawPages = md
    .split(/===A4_PAGE_BREAK===/g)
    .map((p) => p.trim())
    .filter(Boolean);

  return rawPages
    .map((page) => convertSinglePageToA4Html(page))
    .join('\n<div style="page-break-after:always;"></div>\n');
}

// Build a complete, standalone, A4 print-ready UTF-8 HTML document with online Battambang + Noto Sans SC fonts
export function buildStandaloneHtmlDocument(
  cleanBodyHtml: string,
  docTitle = 'ឯកសារបង្រៀនភាសាចិន - វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង'
): string {
  return `<!DOCTYPE html>
<html lang="km">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>${docTitle}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&family=Noto+Sans+SC:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  @page {
    size: A4;
    margin: 12mm;
  }
  * {
    box-sizing: border-box;
  }
  body {
    font-family: 'Battambang', 'Noto Sans SC', sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: #000000;
    background: #f1f5f9;
    margin: 0;
    padding: 20px 10px;
  }
  .a4-sheet {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto 20px auto;
    padding: 12mm;
    background: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
    border: 1px solid #cbd5e1;
  }
  .moul {
    font-family: 'Moul', 'Battambang', 'Noto Sans SC', serif;
    font-weight: normal;
  }
  .a4-official-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
    font-size: 10.5pt;
    line-height: 1.6;
  }
  .a4-official-header .header-left {
    text-align: left;
  }
  .a4-official-header .header-right {
    text-align: center;
  }
  .a4-official-header .tacteing {
    font-size: 11pt;
    letter-spacing: 2px;
    margin-top: 2px;
  }
  h1.a4-title {
    font-family: 'Moul', 'Battambang', 'Noto Sans SC', serif;
    font-weight: normal;
    font-size: 12.5pt;
    text-align: center;
    margin: 8px 0 4px 0;
  }
  h2.a4-subtitle {
    font-family: 'Moul', 'Battambang', 'Noto Sans SC', serif;
    font-weight: normal;
    font-size: 11pt;
    text-align: center;
    margin: 2px 0 10px 0;
  }
  h3 {
    font-family: 'Moul', 'Battambang', 'Noto Sans SC', serif;
    font-weight: normal;
    font-size: 10.5pt;
    margin: 12px 0 6px 0;
  }
  h4 {
    font-family: 'Battambang', 'Noto Sans SC', sans-serif;
    font-size: 10.5pt;
    font-weight: 700;
    margin: 8px 0 4px 0;
  }
  p {
    margin: 4px 0;
  }
  ul.a4-meta-list {
    list-style: none;
    margin: 4px 0 8px 0;
    padding: 0;
  }
  ul.a4-meta-list li {
    margin: 2px 0;
  }
  ol.a4-ordered-list {
    margin: 4px 0 8px 20px;
    padding: 0;
  }
  table.a4-table {
    width: 99.6%;
    max-width: 99.6%;
    border-collapse: collapse;
    margin: 8px auto 12px auto;
    font-size: 9.5pt;
    table-layout: auto;
    word-wrap: break-word;
    overflow-wrap: anywhere;
    box-sizing: border-box;
  }
  table.a4-table th,
  table.a4-table td {
    border: 1px solid #000000;
    padding: 4px 5px;
    text-align: left;
    vertical-align: top;
    word-wrap: break-word;
    overflow-wrap: anywhere;
    box-sizing: border-box;
  }
  table.a4-table th {
    font-weight: 700;
    background-color: #f8fafc;
    text-align: center;
  }
  table.a4-nowrap-table th,
  table.a4-nowrap-table td {
    font-size: 8.5pt;
    padding: 3px 4px;
    text-align: center;
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }
  table.a4-singleline-table th,
  table.a4-singleline-table td {
    font-size: 8.5pt;
    padding: 3px 4px;
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
    word-wrap: normal !important;
    vertical-align: middle;
  }
  table.a4-weekly-table td:nth-child(1),
  table.a4-weekly-table td:nth-child(2),
  table.a4-weekly-table td:nth-child(3) {
    white-space: nowrap;
    text-align: center;
    vertical-align: middle;
  }
  .a4-official-signature {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 16px;
    page-break-inside: avoid;
    font-size: 10.5pt;
  }
  .a4-official-signature .sig-left,
  .a4-official-signature .sig-right {
    text-align: center;
    min-width: 44%;
  }
  .a4-official-signature .sig-bold {
    font-weight: 700;
  }
  .a4-official-signature .sig-space {
    height: 36px;
  }
  @media print {
    body {
      background: #ffffff;
      padding: 0;
      margin: 0;
    }
    .a4-sheet {
      width: 100%;
      max-width: 100%;
      min-height: auto;
      margin: 0;
      padding: 0 1mm;
      box-shadow: none;
      border: none;
      box-sizing: border-box;
      overflow: hidden;
    }
    table.a4-table {
      width: 99.6%;
      max-width: 99.6%;
    }
  }
</style>
</head>
<body>
${cleanBodyHtml}
</body>
</html>`;
}

export function downloadStandaloneHtmlFile(
  fullHtml: string,
  section: MarkdownDocSection,
  selectedClassId: string,
  selectedMonthId: string
): void {
  const blob = new Blob(['\ufeff' + fullHtml], {
    type: 'text/html;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeSection = section || 'all';
  link.href = url;
  link.download = `ឯកសារបង្រៀនភាសាចិន_A4_${safeSection}_${selectedClassId}_${selectedMonthId}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyMarkdownAndCleanHtml(md: string): Promise<void> {
  const cleanHtml = markdownToCleanSemanticHtml(md);
  const fullHtml = buildStandaloneHtmlDocument(cleanHtml);
  await navigator.clipboard.writeText(fullHtml);
}

interface CopyBarProps {
  state: AppDatabaseState;
  section: MarkdownDocSection;
  selectedClassId: string;
  selectedMonthId: string;
  label?: string;
}

export const MarkdownCopyBar: React.FC<CopyBarProps> = ({
  state,
  section,
  selectedClassId,
  selectedMonthId,
  label,
}) => {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [showHtmlModal, setShowHtmlModal] = useState(false);

  const mdContent = useMemo(
    () =>
      generateFullTeachingDocumentMarkdown(
        state,
        section,
        selectedClassId,
        selectedMonthId
      ),
    [state, section, selectedClassId, selectedMonthId]
  );

  const cleanHtml = useMemo(() => markdownToCleanSemanticHtml(mdContent), [mdContent]);
  const fullHtml = useMemo(
    () =>
      buildStandaloneHtmlDocument(
        cleanHtml,
        `${state.schoolInfo.schoolNameKh} - ${section} (${selectedClassId})`
      ),
    [cleanHtml, state.schoolInfo.schoolNameKh, section, selectedClassId]
  );

  const resolvedLabel = useMemo(() => {
    if (!label) return 'ទាញយកឯកសារ HTML ទម្រង់ A4 (.html) / 导出 A4 HTML';
    return label
      .replace(/Markdown/gi, 'HTML ទម្រង់ A4')
      .replace(/ចម្លង/g, 'ទាញយក');
  }, [label]);

  const handleDownloadHtml = () => {
    downloadStandaloneHtmlFile(fullHtml, section, selectedClassId, selectedMonthId);
  };

  const handleCopyHtmlCode = async () => {
    await navigator.clipboard.writeText(fullHtml);
    setCopiedHtml(true);
    window.setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={handleDownloadHtml}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ទាញយក A4 HTML (.html)</span>
        </button>

        <button
          type="button"
          onClick={handleCopyHtmlCode}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
        >
          {copiedHtml ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <FileCode2 className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>{copiedHtml ? 'បានចម្លងកូដ!' : 'ចម្លងកូដ HTML'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowHtmlModal((v) => !v)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>{showHtmlModal ? 'លាក់កូដ' : 'មើលកូដ'}</span>
        </button>
      </div>

      {showHtmlModal && (
        <div className="border border-slate-300 rounded-lg bg-white p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <span>
              កូដឯកសារ HTML ទម្រង់ក្រដាស A4 ស្តង់ដារ (UTF-8 + Battambang + Noto Sans SC + @page A4 margin: 12mm)
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="text-indigo-700 underline cursor-pointer"
              >
                ទាញយកឯកសារ A4 .html (导出 A4 HTML)
              </button>
              <button
                type="button"
                onClick={handleCopyHtmlCode}
                className="underline cursor-pointer"
              >
                ចម្លងកូដ HTML ទាំងអស់ (Copy All HTML)
              </button>
            </div>
          </div>
          <textarea
            readOnly
            rows={14}
            value={fullHtml}
            className="w-full p-3 border border-slate-300 rounded font-mono text-xs leading-relaxed focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};

interface FullDocViewProps {
  state: AppDatabaseState;
  selectedClassId: string;
  selectedMonthId: string;
  onSelectClassId: (id: string) => void;
  onSelectMonthId: (id: string) => void;
  onUpdateState: (updater: (prev: AppDatabaseState) => AppDatabaseState) => void;
}

export const MarkdownDocumentView: React.FC<FullDocViewProps> = ({
  state,
  selectedClassId,
  selectedMonthId,
  onUpdateState,
}) => {
  const [section, setSection] = useState<MarkdownDocSection>('all');
  const [viewMode, setViewMode] = useState<'both' | 'html_code' | 'a4_preview'>('both');
  const [copiedHtml, setCopiedHtml] = useState(false);

  const mdContent = useMemo(
    () =>
      generateFullTeachingDocumentMarkdown(
        state,
        section,
        selectedClassId,
        selectedMonthId
      ),
    [state, section, selectedClassId, selectedMonthId]
  );

  const cleanHtml = useMemo(() => markdownToCleanSemanticHtml(mdContent), [mdContent]);

  const sections: { id: MarkdownDocSection; label: string }[] = [
    { id: 'all', label: '០. ឯកសារបង្រៀនពេញលេញទាំងអស់ (全部完整教学文档汇总)' },
    { id: 'roster_schedule', label: '១. បញ្ជីឈ្មោះសិស្ស & កាលវិភាគ (名册与课表)' },
    {
      id: 'monthly_breakdown',
      label: '២.០ តារាងពិន្ទុប្រចាំខែលម្អិត & សកម្មភាពក្នុងថ្នាក់ (每月成绩表：考试25+考勤5+课堂表现10+作业10 & 课堂表现✓/○/✗)',
    },
    { id: 'scores', label: '២. បញ្ជីស្រង់ពិន្ទុ & ស្តង់ដាទី១ (学期与月度成绩汇总表)' },
    {
      id: 'student_stats',
      label: '២.១ សូចនាករស្តង់ដា & តារាងស្ថិតិសិស្ស (បំណិន & ចរិយាសម្បទា - រៀនខ្សោយ / ឈប់ច្រើន)',
    },
    {
      id: 'teacher_checklist',
      label: '២.២ បញ្ជីរាយនាមសិស្សសម្រាប់គ្រូបង្រៀន (តាមដានកិច្ចការ & មានសភគោល)',
    },
    {
      id: 'annual_classroom_plan',
      label: '២.៣ ផែនការបង្រៀន ១ឆ្នាំ ឬផែនការថ្នាក់រៀន (គ្រប់ថ្នាក់ - ចំនួន និងភាគរយ មុខវិជ្ជា ភាសាចិន)',
    },
    { id: 'attendance', label: '៣. បញ្ជីស្រង់វត្តមានសិស្ស (出勤点名册)' },
    { id: 'homework_lesson', label: '៤. កំណត់ត្រាកិច្ចការផ្ទះ & មេរៀន (作业与课程记录)' },
    { id: 'curriculum', label: '៥. កម្មវិធីសិក្សាភាសាចិន ៥៧ម៉ោង (教学大纲)' },
    { id: 'weekly_log', label: '៦. សម្រង់អត្ថបទប្រចាំសប្តាហ៍ ៨ថ្នាក់ (周教学进度)' },
    { id: 'lesson_plan', label: '៧. កិច្ចតែងការបង្រៀនភាសាចិន (汉语教案)' },
    {
      id: 'performance_reflection',
      label: '៨. លទ្ធផលសិក្សាសិស្ស ទី៨ ទី៩ ទី១០ & ការឆ្លុះបញ្ចាំងគ្រូ (学生学习情况与教师反思)',
    },
    { id: 'model_school_duty', label: '៩. ភារកិច្ចគ្រូបង្រៀន ស្តង់ដាសាលាគំរូ (模范学校职责)' },
  ];

  const activeSectionLabel =
    sections.find((s) => s.id === section)?.label || sections[0].label;

  const fullHtmlDocument = useMemo(
    () =>
      buildStandaloneHtmlDocument(
        cleanHtml,
        `${state.schoolInfo.schoolNameKh} - ${activeSectionLabel}`
      ),
    [cleanHtml, state.schoolInfo.schoolNameKh, activeSectionLabel]
  );

  const handleDownloadHtmlFile = () => {
    downloadStandaloneHtmlFile(
      fullHtmlDocument,
      section,
      selectedClassId,
      selectedMonthId
    );
  };

  const handleCopyHtmlCode = async () => {
    await navigator.clipboard.writeText(fullHtmlDocument);
    setCopiedHtml(true);
    window.setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handlePrintA4 = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold">
              មជ្ឈមណ្ឌលនាំចេញឯកសារបង្រៀន HTML ទម្រង់ក្រដាស A4 ស្តង់ដារ (A4 格式 HTML 教学文档导出中心)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              នាំចេញជាឯកសារ HTML (.html) ទម្រង់ក្រដាស A4 ផ្លូវការ (UTF-8 + Battambang + Noto Sans SC + @page A4 margin: 12mm) មានក្បាលលិខិតផ្លូវការ តារាងពេញទម្រង់ និងហត្ថលេខា។
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadHtmlFile}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-indigo-700 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ទាញយកឯកសារ HTML ទម្រង់ A4 (.html) (导出 A4 格式 HTML)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyHtmlCode}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold cursor-pointer"
            >
              {copiedHtml ? (
                <Check className="w-4 h-4" />
              ) : (
                <FileCode2 className="w-4 h-4" />
              )}
              <span>
                {copiedHtml
                  ? 'បានចម្លងកូដ HTML ទម្រង់ A4 រួចរាល់!'
                  : 'ចម្លងកូដ HTML ទម្រង់ A4 (复制 A4 标准 HTML 代码)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrintA4}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព / រក្សាទុក PDF ទម្រង់ A4 (A4 格式打印导出)</span>
            </button>
          </div>
        </div>

        {/* Document Section Selector */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                section === s.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">របៀបបង្ហាញ៖</span>
            <button
              type="button"
              onClick={() => setViewMode('both')}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                viewMode === 'both' ? 'bg-slate-800 text-white font-semibold' : 'bg-slate-100'
              }`}
            >
              បង្ហាញទាំងពីរ (កូដ HTML + ទម្រង់ក្រដាស A4)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('html_code')}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                viewMode === 'html_code'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-slate-100'
              }`}
            >
              តែកូដ HTML ទម្រង់ A4 (仅显示 HTML 代码)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('a4_preview')}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                viewMode === 'a4_preview'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-slate-100'
              }`}
            >
              តែទម្រង់ក្រដាស A4 ស្តង់ដារ (A4 格式导出预览)
            </button>
          </div>
        </div>

        {/* Editable & AI Signature Date Editor */}
        <SignatureDateEditor
          state={state}
          onUpdateState={onUpdateState}
          showPrincipalLeft={true}
        />
      </div>

      {/* Output Area */}
      <div
        className={`grid ${
          viewMode === 'both' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'
        } gap-6`}
      >
        {(viewMode === 'both' || viewMode === 'html_code') && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 no-print">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <span className="font-bold text-sm">
                ១. កូដ HTML ទម្រង់ក្រដាស A4 ស្តង់ដារ (A4 Standard HTML Code)
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadHtmlFile}
                  className="text-xs font-semibold text-indigo-700 underline cursor-pointer"
                >
                  ទាញយក A4 .html (导出 A4 HTML)
                </button>
                <button
                  type="button"
                  onClick={handleCopyHtmlCode}
                  className="text-xs font-semibold underline cursor-pointer"
                >
                  ចម្លងកូដ HTML ទាំងអស់
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={fullHtmlDocument}
              rows={38}
              className="w-full p-4 border border-slate-300 rounded-lg font-mono text-xs leading-relaxed focus:outline-none"
            />
          </div>
        )}

        {(viewMode === 'both' || viewMode === 'a4_preview') && (
          <div className="bg-slate-200/70 border border-slate-300 rounded-xl p-4 sm:p-6 space-y-3 print:bg-white print:border-none print:p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-2 no-print">
              <span className="font-bold text-sm">
                ២. ទម្រង់ក្រដាស A4 ស្តង់ដារ (210mm × 297mm · A4 格式导出与打印预览)
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadHtmlFile}
                  className="text-xs font-semibold text-indigo-700 underline cursor-pointer"
                >
                  ទាញយកឯកសារ HTML ទម្រង់ A4 (.html)
                </button>
                <button
                  type="button"
                  onClick={handlePrintA4}
                  className="text-xs font-semibold underline cursor-pointer"
                >
                  បោះពុម្ពទម្រង់ A4 (Print A4)
                </button>
              </div>
            </div>
            <div
              className="overflow-x-auto [&_.a4-sheet]:bg-white [&_.a4-sheet]:shadow-md [&_.a4-sheet]:border [&_.a4-sheet]:border-slate-300 [&_.a4-sheet]:mx-auto [&_.a4-sheet]:mb-6 [&_.a4-sheet]:p-6 sm:[&_.a4-sheet]:p-[12mm] [&_.a4-sheet]:w-full [&_.a4-sheet]:max-w-[210mm] [&_.a4-sheet]:min-h-[297mm] [&_.a4-sheet]:box-border [&_.a4-sheet]:overflow-hidden print:[&_.a4-sheet]:shadow-none print:[&_.a4-sheet]:border-none print:[&_.a4-sheet]:m-0 print:[&_.a4-sheet]:p-0 [&_.moul]:font-khmer-moul [&_.a4-official-header]:flex [&_.a4-official-header]:justify-between [&_.a4-official-header]:items-start [&_.a4-official-header]:mb-3 [&_.a4-official-header]:text-xs [&_.header-right]:text-center [&_.a4-title]:font-khmer-moul [&_.a4-title]:text-base [&_.a4-title]:text-center [&_.a4-title]:mt-2 [&_.a4-subtitle]:font-khmer-moul [&_.a4-subtitle]:text-sm [&_.a4-subtitle]:text-center [&_.a4-subtitle]:mb-3 [&_h3]:font-khmer-moul [&_h3]:text-xs [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h4]:font-bold [&_h4]:text-xs [&_h4]:mt-2 [&_h4]:mb-1 [&_.a4-meta-list]:list-none [&_.a4-meta-list]:pl-0 [&_.a4-meta-list]:mb-2 [&_.a4-meta-list]:text-xs [&_.a4-ordered-list]:list-decimal [&_.a4-ordered-list]:pl-5 [&_.a4-ordered-list]:text-xs [&_.a4-table]:w-[99.6%] [&_.a4-table]:max-w-[99.6%] [&_.a4-table]:mx-auto [&_.a4-table]:border-collapse [&_.a4-table]:my-2.5 [&_.a4-table]:text-xs [&_.a4-table]:break-words [&_.a4-nowrap-table]:text-[11px] [&_.a4-nowrap-table_td]:text-center [&_.a4-weekly-table_td:nth-child(1)]:whitespace-nowrap [&_.a4-weekly-table_td:nth-child(1)]:text-center [&_.a4-weekly-table_td:nth-child(1)]:align-middle [&_.a4-weekly-table_td:nth-child(2)]:whitespace-nowrap [&_.a4-weekly-table_td:nth-child(2)]:text-center [&_.a4-weekly-table_td:nth-child(2)]:align-middle [&_.a4-weekly-table_td:nth-child(3)]:whitespace-nowrap [&_.a4-weekly-table_td:nth-child(3)]:text-center [&_.a4-weekly-table_td:nth-child(3)]:align-middle [&_th]:border [&_th]:border-black [&_th]:bg-slate-50 [&_th]:p-1.5 [&_th]:text-center [&_th]:font-bold [&_td]:border [&_td]:border-black [&_td]:p-1.5 [&_td]:align-top [&_td]:break-words [&_.a4-official-signature]:flex [&_.a4-official-signature]:justify-between [&_.a4-official-signature]:items-start [&_.a4-official-signature]:mt-5 [&_.a4-official-signature]:text-xs [&_.sig-left]:text-center [&_.sig-left]:min-w-[44%] [&_.sig-right]:text-center [&_.sig-right]:min-w-[44%] [&_.sig-bold]:font-bold [&_.sig-space]:h-9"
              dangerouslySetInnerHTML={{ __html: cleanHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
