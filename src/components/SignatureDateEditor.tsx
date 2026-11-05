import React, { useEffect, useState } from 'react';
import { Sparkles, RotateCcw, Calendar } from 'lucide-react';
import { AppDatabaseState, SignatureDateConfig } from '../types';
import { DEFAULT_SIGNATURE_DATE } from '../data/defaultData';
import {
  convertIsoDateToKhmerSignature,
  parseSignatureGregorianToIso,
} from '../utils/calculations';

interface Props {
  state: AppDatabaseState;
  onUpdateState: (updater: (prev: AppDatabaseState) => AppDatabaseState) => void;
  showPrincipalLeft?: boolean;
  compact?: boolean;
  sheetKey?: string; // Optional unique key per sheet/document so each sheet can have its own independent signature date
}

export function formatSignatureLinesMarkdown(
  sig: SignatureDateConfig | undefined,
  teacherName: string
): string[] {
  const s = sig || DEFAULT_SIGNATURE_DATE;
  const lunarDayStr = s.lunarDay.trim() || 'ចន្ទ ៧រោច';
  const lunarMonthStr = s.lunarMonth.trim() || 'អស្សុជ';
  const lunarYearStr = s.lunarYearEra.trim() || 'ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០';
  const locStr = s.gregorianLocation.trim() || 'រាជធានីភ្នំពេញ';
  const gregDayStr = s.gregorianDay.trim() || '០២';
  const gregMonthStr = s.gregorianMonth.trim() || 'វិច្ឆិកា';
  const gregYearStr = s.gregorianYear.trim() || '២០២៦';

  return [
    `ថ្ងៃ ${lunarDayStr} ខែ ${lunarMonthStr} ${lunarYearStr}`,
    `${locStr} ,ថ្ងៃទី ${gregDayStr} ខែ ${gregMonthStr} ឆ្នាំ ${gregYearStr}`,
    `**គ្រូមុខវិជ្ជា**`,
    `**${teacherName}**`,
  ];
}

export const SignatureDateEditor: React.FC<Props> = ({
  state,
  onUpdateState,
  showPrincipalLeft = true,
  compact = false,
  sheetKey,
}) => {
  // If sheetKey is provided, use independent signature date for this specific sheet; fallback to global state.signatureDate
  const sig: SignatureDateConfig =
    (sheetKey && state.sheetSignatureDates?.[sheetKey]) ||
    state.signatureDate ||
    DEFAULT_SIGNATURE_DATE;
  const initialIso = parseSignatureGregorianToIso(sig) || '2026-11-02';
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(initialIso);

  // Keep selectedIsoDate in sync when sig changes
  useEffect(() => {
    const parsedIso = parseSignatureGregorianToIso(sig);
    if (parsedIso) {
      setSelectedIsoDate(parsedIso);
      if (
        sig.lunarDay.includes('៨រោច') &&
        sig.lunarMonth.includes('កត្តិក') &&
        parsedIso === '2026-11-02'
      ) {
        const real = convertIsoDateToKhmerSignature(parsedIso);
        onUpdateState((prev) => {
          const updatedSig = {
            ...sig,
            lunarDay: real.lunarDay,
            lunarMonth: real.lunarMonth,
            lunarYearEra: real.lunarYearEra,
          };
          if (sheetKey) {
            return {
              ...prev,
              sheetSignatureDates: {
                ...(prev.sheetSignatureDates || {}),
                [sheetKey]: updatedSig,
              },
            };
          }
          return {
            ...prev,
            signatureDate: updatedSig,
          };
        });
      }
    } else {
      setSelectedIsoDate('');
    }
  }, [sig.gregorianDay, sig.gregorianMonth, sig.gregorianYear, sheetKey]);

  const updateSigField = (field: keyof SignatureDateConfig, value: string) => {
    onUpdateState((prev) => {
      const current =
        (sheetKey && prev.sheetSignatureDates?.[sheetKey]) ||
        prev.signatureDate ||
        DEFAULT_SIGNATURE_DATE;
      const nextSig: SignatureDateConfig = {
        ...current,
        [field]: value,
      };
      if (
        field === 'gregorianDay' ||
        field === 'gregorianMonth' ||
        field === 'gregorianYear'
      ) {
        const iso = parseSignatureGregorianToIso(nextSig);
        if (iso) {
          const converted = convertIsoDateToKhmerSignature(iso);
          nextSig.lunarDay = converted.lunarDay;
          nextSig.lunarMonth = converted.lunarMonth;
          nextSig.lunarYearEra = converted.lunarYearEra;
        }
      }
      if (sheetKey) {
        return {
          ...prev,
          sheetSignatureDates: {
            ...(prev.sheetSignatureDates || {}),
            [sheetKey]: nextSig,
          },
        };
      }
      return {
        ...prev,
        signatureDate: nextSig,
      };
    });
  };

  const handlePickCalendarDate = (isoDate: string) => {
    setSelectedIsoDate(isoDate);
    if (!isoDate) return;
    const converted = convertIsoDateToKhmerSignature(isoDate);
    const newSig: SignatureDateConfig = {
      lunarDay: converted.lunarDay,
      lunarMonth: converted.lunarMonth,
      lunarYearEra: converted.lunarYearEra,
      gregorianLocation: converted.gregorianLocation,
      gregorianDay: converted.gregorianDay,
      gregorianMonth: converted.gregorianMonth,
      gregorianYear: converted.gregorianYear,
    };
    onUpdateState((prev) => {
      if (sheetKey) {
        return {
          ...prev,
          sheetSignatureDates: {
            ...(prev.sheetSignatureDates || {}),
            [sheetKey]: newSig,
          },
        };
      }
      return {
        ...prev,
        signatureDate: newSig,
        weeklyLogMeta: prev.weeklyLogMeta
          ? {
              ...prev.weeklyLogMeta,
              fridayDateStr: converted.ddMmYyyy,
              lunarDate: converted.fullLunarString,
              gregorianDate: converted.fullGregorianString,
            }
          : prev.weeklyLogMeta,
      };
    });
  };

  const handleClearToDots = () => {
    setSelectedIsoDate('');
    const emptySig: SignatureDateConfig = {
      lunarDay: '',
      lunarMonth: '',
      lunarYearEra: 'ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០',
      gregorianLocation: 'រាជធានីភ្នំពេញ',
      gregorianDay: '',
      gregorianMonth: '',
      gregorianYear: '២០២៦',
    };
    onUpdateState((prev) => {
      if (sheetKey) {
        return {
          ...prev,
          sheetSignatureDates: {
            ...(prev.sheetSignatureDates || {}),
            [sheetKey]: emptySig,
          },
        };
      }
      return {
        ...prev,
        signatureDate: emptySig,
      };
    });
  };

  const handleGenerateRealLunarDate = () => {
    const parsedFromGregorian = parseSignatureGregorianToIso(sig);
    const targetIso =
      parsedFromGregorian ||
      selectedIsoDate ||
      new Date().toISOString().slice(0, 10);
    handlePickCalendarDate(targetIso);
  };

  return (
    <div
      className={`${
        compact ? 'pt-1 space-y-2' : 'pt-4 border-t border-slate-200 space-y-3'
      }`}
    >
      {/* Calendar Date Picker + Real Chhankitek Lunar Calculation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs no-print">
        <span className="font-semibold text-slate-600">
          កាលបរិច្ឆេទចុះហត្ថលេខា (ចន្ទគតិខ្មែរពិតប្រាកដ)៖
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-300 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <input
              type="date"
              value={selectedIsoDate}
              onChange={(e) => handlePickCalendarDate(e.target.value)}
              className="bg-transparent text-xs font-semibold cursor-pointer focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleGenerateRealLunarDate}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>គណនាចន្ទគតិ</span>
          </button>
          <button
            type="button"
            onClick={handleClearToDots}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ដាក់ចុចៗ (....)</span>
          </button>
        </div>
      </div>

      {/* Signature Block */}
      <div
        className={`grid ${
          showPrincipalLeft ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        } gap-6 text-sm`}
      >
        {showPrincipalLeft && (
          <div className="text-center space-y-1">
            <div className="font-bold">បានឃើញ និងឯកភាព</div>
            <div className="font-bold">ជ.នាយកវិទ្យាល័យ</div>
            <div className="h-10" />
          </div>
        )}

        <div
          className={
            showPrincipalLeft ? 'text-center space-y-1.5' : 'flex justify-end'
          }
        >
          <div className="text-center space-y-1.5">
            {/* Lunar Date Line: ថ្ងៃ ចន្ទ ៧រោច ខែ អស្សុជ ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០ */}
            <div className="flex flex-wrap items-center justify-center gap-1">
              <span>ថ្ងៃ</span>
              <input
                type="text"
                value={sig.lunarDay}
                onChange={(e) => updateSigField('lunarDay', e.target.value)}
                placeholder="............................"
                className="border-b border-dotted border-slate-500 px-1 text-center w-36 bg-transparent focus:outline-none focus:border-indigo-600"
              />
              <span>ខែ</span>
              <input
                type="text"
                value={sig.lunarMonth}
                onChange={(e) => updateSigField('lunarMonth', e.target.value)}
                placeholder="............."
                className="border-b border-dotted border-slate-500 px-1 text-center w-24 bg-transparent focus:outline-none focus:border-indigo-600"
              />
              <input
                type="text"
                value={sig.lunarYearEra}
                onChange={(e) => updateSigField('lunarYearEra', e.target.value)}
                className="border-b border-dotted border-slate-400 px-1 text-center w-52 bg-transparent focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Gregorian Date Line: រាជធានីភ្នំពេញ ,ថ្ងៃទី ០២ ខែ វិច្ឆិកា ឆ្នាំ ២០២៦ */}
            <div className="flex flex-wrap items-center justify-center gap-1">
              <input
                type="text"
                value={sig.gregorianLocation}
                onChange={(e) =>
                  updateSigField('gregorianLocation', e.target.value)
                }
                className="border-b border-dotted border-slate-400 px-1 text-right w-32 bg-transparent focus:outline-none"
              />
              <span>,ថ្ងៃទី</span>
              <input
                type="text"
                value={sig.gregorianDay}
                onChange={(e) => updateSigField('gregorianDay', e.target.value)}
                placeholder="........"
                className="border-b border-dotted border-slate-500 px-1 text-center w-16 bg-transparent focus:outline-none focus:border-indigo-600"
              />
              <span>ខែ</span>
              <input
                type="text"
                value={sig.gregorianMonth}
                onChange={(e) =>
                  updateSigField('gregorianMonth', e.target.value)
                }
                placeholder="............"
                className="border-b border-dotted border-slate-500 px-1 text-center w-24 bg-transparent focus:outline-none focus:border-indigo-600"
              />
              <span>ឆ្នាំ</span>
              <input
                type="text"
                value={sig.gregorianYear}
                onChange={(e) =>
                  updateSigField('gregorianYear', e.target.value)
                }
                placeholder="២០២..."
                className="border-b border-dotted border-slate-500 px-1 text-center w-20 bg-transparent focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="font-bold pt-1">គ្រូមុខវិជ្ជា</div>
            <div className="h-8" />
            <div className="font-bold">{state.schoolInfo.teacherName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
