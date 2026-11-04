import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { AppDatabaseState, MonthConfig } from '../types';
import {
  convertIsoDateToKhmerSignature,
  getCalendarYearForMonthInAcademicTerm,
} from '../utils/calculations';

interface Props {
  state: AppDatabaseState;
  activeMonthId: string;
  onSelectMonthId: (id: string) => void;
  onUpdateState: (updater: (prev: AppDatabaseState) => AppDatabaseState) => void;
  labelKh?: string;
}

interface PresetMonthOption {
  id: string;
  nameKh: string;
  nameEn: string;
  monthIndex: number;
  semester: 1 | 2;
  isSemesterExam?: boolean;
}

const PRESET_MONTH_OPTIONS: PresetMonthOption[] = [
  { id: 'nov', nameKh: 'វិច្ឆិកា', nameEn: 'November', monthIndex: 10, semester: 1 },
  { id: 'dec', nameKh: 'ធ្នូ', nameEn: 'December', monthIndex: 11, semester: 1 },
  { id: 'jan', nameKh: 'មករា', nameEn: 'January', monthIndex: 0, semester: 1 },
  { id: 'feb', nameKh: 'កុម្ភៈ', nameEn: 'February', monthIndex: 1, semester: 1 },
  { id: 'mar', nameKh: 'មីនា', nameEn: 'March', monthIndex: 2, semester: 1 },
  { id: 'apr', nameKh: 'មេសា', nameEn: 'April', monthIndex: 3, semester: 1 },
  {
    id: 'sem1',
    nameKh: 'ឆមាសទី១',
    nameEn: 'Semester 1 Exam',
    monthIndex: 2,
    semester: 1,
    isSemesterExam: true,
  },
  { id: 'may', nameKh: 'ឧសភា', nameEn: 'May', monthIndex: 4, semester: 2 },
  { id: 'jun', nameKh: 'មិថុនា', nameEn: 'June', monthIndex: 5, semester: 2 },
  { id: 'jul', nameKh: 'កក្កដា', nameEn: 'July', monthIndex: 6, semester: 2 },
  { id: 'aug', nameKh: 'សីហា', nameEn: 'August', monthIndex: 7, semester: 2 },
  { id: 'sep', nameKh: 'កញ្ញា', nameEn: 'September', monthIndex: 8, semester: 2 },
  { id: 'oct', nameKh: 'តុលា', nameEn: 'October', monthIndex: 9, semester: 1 },
  {
    id: 'sem2',
    nameKh: 'ឆមាសទី២',
    nameEn: 'Semester 2 Exam',
    monthIndex: 7,
    semester: 2,
    isSemesterExam: true,
  },
];

export function formatMonthButtonLabel(m: MonthConfig): string {
  const clean = (m.nameKh || '').trim();
  if (
    m.isSemesterExam ||
    clean.startsWith('ឆមាស') ||
    clean.startsWith('ខែ') ||
    clean.startsWith('ប្រឡង')
  ) {
    return clean;
  }
  return `ខែ${clean}`;
}

export const MonthSelectorBar: React.FC<Props> = ({
  state,
  activeMonthId,
  onSelectMonthId,
  onUpdateState,
  labelKh = 'ជ្រើសរើសខែ៖',
}) => {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [customNameKh, setCustomNameKh] = useState('');
  const [customMonthIndex, setCustomMonthIndex] = useState<number>(7); // Aug
  const [customSemester, setCustomSemester] = useState<1 | 2>(2);
  const [customIsExam, setCustomIsExam] = useState<boolean>(false);

  const activeAcademicYear =
    state.academicTerms?.find((t) => t.id === state.currentTermId)?.nameKh ||
    state.schoolInfo.academicYear ||
    '២០២៦ ~ ២០២៧';

  const enabledMonths = state.months.filter((m) => m.enabled);

  const handleDeleteMonth = (monthId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (enabledMonths.length <= 1) return;
    const remaining = enabledMonths.filter((m) => m.id !== monthId);
    onUpdateState((prev) => ({
      ...prev,
      months: prev.months.map((m) =>
        m.id === monthId ? { ...m, enabled: false } : m
      ),
    }));
    if (activeMonthId === monthId && remaining[0]) {
      onSelectMonthId(remaining[0].id);
    }
  };

  const handleAddPresetMonth = (preset: PresetMonthOption) => {
    const targetYear = getCalendarYearForMonthInAcademicTerm(
      preset.monthIndex,
      activeAcademicYear
    );
    const daysInMonth = new Date(targetYear, preset.monthIndex + 1, 0).getDate();
    const isoEnd = `${targetYear}-${String(preset.monthIndex + 1).padStart(
      2,
      '0'
    )}-${String(daysInMonth).padStart(2, '0')}`;
    const sig = convertIsoDateToKhmerSignature(isoEnd);

    onUpdateState((prev) => {
      const exists = prev.months.some((m) => m.id === preset.id);
      if (exists) {
        return {
          ...prev,
          months: prev.months.map((m) =>
            m.id === preset.id
              ? {
                  ...m,
                  enabled: true,
                  year: targetYear,
                  daysInMonth,
                  lunarDate: sig.fullLunarString,
                  gregorianDate: sig.fullGregorianString,
                }
              : m
          ),
        };
      }
      const newMonth: MonthConfig = {
        id: preset.id,
        nameKh: preset.nameKh,
        nameEn: preset.nameEn,
        semester: preset.semester,
        isSemesterExam: preset.isSemesterExam,
        year: targetYear,
        monthIndex: preset.monthIndex,
        daysInMonth,
        lunarDate: sig.fullLunarString,
        gregorianDate: sig.fullGregorianString,
        enabled: true,
      };
      return {
        ...prev,
        months: [...prev.months, newMonth],
      };
    });
    onSelectMonthId(preset.id);
    setShowAddPanel(false);
  };

  const handleAddCustomMonth = () => {
    const trimmed = customNameKh.trim();
    if (!trimmed) return;
    const targetYear = getCalendarYearForMonthInAcademicTerm(
      customMonthIndex,
      activeAcademicYear
    );
    const daysInMonth = new Date(targetYear, customMonthIndex + 1, 0).getDate();
    const isoEnd = `${targetYear}-${String(customMonthIndex + 1).padStart(
      2,
      '0'
    )}-${String(daysInMonth).padStart(2, '0')}`;
    const sig = convertIsoDateToKhmerSignature(isoEnd);
    const newId = `m_${Date.now()}`;
    const isSem =
      customIsExam || trimmed.startsWith('ឆមាស') || trimmed.includes('ប្រឡង');

    const newMonth: MonthConfig = {
      id: newId,
      nameKh: trimmed.replace(/^ខែ\s*/, ''),
      nameEn: trimmed,
      semester: customSemester,
      isSemesterExam: isSem,
      year: targetYear,
      monthIndex: customMonthIndex,
      daysInMonth,
      lunarDate: sig.fullLunarString,
      gregorianDate: sig.fullGregorianString,
      enabled: true,
    };

    onUpdateState((prev) => ({
      ...prev,
      months: [...prev.months, newMonth],
    }));
    onSelectMonthId(newId);
    setCustomNameKh('');
    setShowAddPanel(false);
  };

  const availablePresets = PRESET_MONTH_OPTIONS.filter(
    (p) => !enabledMonths.some((m) => m.id === p.id)
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-500 font-medium mr-1">{labelKh}</span>
        {enabledMonths.map((m) => {
          const isSelected = activeMonthId === m.id;
          const displayYear = getCalendarYearForMonthInAcademicTerm(
            m.monthIndex ?? 10,
            activeAcademicYear
          );
          const label = formatMonthButtonLabel(m);
          return (
            <div
              key={m.id}
              onClick={() => onSelectMonthId(m.id)}
              title={`${label} (${String((m.monthIndex ?? 10) + 1).padStart(2, '0')}/${displayYear})`}
              className={`group inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white font-semibold'
                  : m.isSemesterExam
                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{label}</span>
              <span
                className={`text-[10px] font-mono ${
                  isSelected
                    ? 'text-slate-300'
                    : m.isSemesterExam
                    ? 'text-indigo-500'
                    : 'text-slate-400'
                }`}
              >
                ({String(displayYear).slice(-2)})
              </span>
              {enabledMonths.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteMonth(m.id, e)}
                  title={`លុប ${label} (删除此月份/学期)`}
                  className={`ml-0.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                      : 'text-slate-400 hover:text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setShowAddPanel((v) => !v)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-dashed border-indigo-300 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>បន្ថែមខែ / ឆមាស</span>
        </button>
      </div>

      {showAddPanel && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">
              + បន្ថែមខែ ឬ ឆមាស (ឆ្នាំសិក្សា {activeAcademicYear})
            </span>
            <button
              type="button"
              onClick={() => setShowAddPanel(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {availablePresets.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] text-slate-500">
                ចុចជ្រើសរើសខែ ឬ ឆមាសដើម្បីបន្ថែមភ្លាមៗ (点击快速添加)៖
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {availablePresets.map((p) => {
                  const y = getCalendarYearForMonthInAcademicTerm(
                    p.monthIndex,
                    activeAcademicYear
                  );
                  const lbl =
                    p.isSemesterExam || p.nameKh.startsWith('ឆមាស')
                      ? p.nameKh
                      : `ខែ${p.nameKh}`;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAddPresetMonth(p)}
                      className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-slate-800 font-semibold cursor-pointer"
                    >
                      + {lbl} ({String(p.monthIndex + 1).padStart(2, '0')}/{y})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
            <span className="text-slate-600 font-medium">បង្កើតផ្ទាល់ខ្លួន៖</span>
            <input
              type="text"
              value={customNameKh}
              onChange={(e) => setCustomNameKh(e.target.value)}
              placeholder="ឧ. ខែសីហា, ខែកញ្ញា, ឆមាសទី១, ឆមាសទី២..."
              className="px-2.5 py-1 bg-white border border-slate-300 rounded w-52"
            />
            <select
              value={customMonthIndex}
              onChange={(e) => setCustomMonthIndex(Number(e.target.value))}
              className="px-2 py-1 bg-white border border-slate-300 rounded"
            >
              {[
                { idx: 10, label: '11月 (វិច្ឆិកា)' },
                { idx: 11, label: '12月 (ធ្នូ)' },
                { idx: 0, label: '1月 (មករា)' },
                { idx: 1, label: '2月 (កុម្ភៈ)' },
                { idx: 2, label: '3月 (មីនា)' },
                { idx: 3, label: '4月 (មេសា)' },
                { idx: 4, label: '5月 (ឧសភា)' },
                { idx: 5, label: '6月 (មិថុនា)' },
                { idx: 6, label: '7月 (កក្កដា)' },
                { idx: 7, label: '8月 (សីហា)' },
                { idx: 8, label: '9月 (កញ្ញា)' },
                { idx: 9, label: '10月 (តុលា)' },
              ].map((mOpt) => {
                const y = getCalendarYearForMonthInAcademicTerm(
                  mOpt.idx,
                  activeAcademicYear
                );
                return (
                  <option key={mOpt.idx} value={mOpt.idx}>
                    {mOpt.label} — {y}
                  </option>
                );
              })}
            </select>
            <select
              value={customSemester}
              onChange={(e) => setCustomSemester(Number(e.target.value) as 1 | 2)}
              className="px-2 py-1 bg-white border border-slate-300 rounded"
            >
              <option value={1}>ឆមាសទី១ (第一学期)</option>
              <option value={2}>ឆមាសទី២ (第二学期)</option>
            </select>
            <label className="inline-flex items-center gap-1 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={customIsExam}
                onChange={(e) => setCustomIsExam(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span>ជាឆមាស (学期考)</span>
            </label>
            <button
              type="button"
              onClick={handleAddCustomMonth}
              className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
            >
              បន្ថែម
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
