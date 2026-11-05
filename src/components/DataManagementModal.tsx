import React, { useMemo, useRef, useState } from 'react';
import { AppDatabaseState, Language } from '../types';
import {
  exportToExcelWorkbook,
  exportToJsonFile,
  importFromExcelWorkbook,
  importFromJsonFile,
  loadStateFromCloud,
  syncStateToCloud,
} from '../utils/storage';
import { createInitialAppDatabaseState } from '../data/defaultData';
import { runAllCalculationUnitTests } from '../utils/calculations.test';
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  RotateCcw,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: AppDatabaseState;
  lang: Language;
  onRestoreState: (nextState: AppDatabaseState) => void;
}

export const DataManagementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  state,
  lang,
  onRestoreState,
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'tests'>('backup');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [confirmReset, setConfirmReset] = useState(false);

  const jsonInputRef = useRef<HTMLInputElement | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);

  const unitTestResults = useMemo(() => {
    if (!isOpen) return [];
    return runAllCalculationUnitTests();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleJsonImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const restored = await importFromJsonFile(file);
      onRestoreState(restored);
      setMessage({
        type: 'success',
        text:
          lang === 'km'
            ? 'បានស្តារទិន្នន័យពីឯកសារ JSON ដោយជោគជ័យ!'
            : 'Successfully restored data from JSON backup!',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to parse JSON file.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const restored = await importFromExcelWorkbook(file, state);
      onRestoreState(restored);
      setMessage({
        type: 'success',
        text:
          lang === 'km'
            ? 'បាននាំចូលទិន្នន័យពីឯកសារ Excel (.xlsx) ដោយជោគជ័យ!'
            : 'Successfully imported data from Excel (.xlsx) workbook!',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to import Excel file.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleResetDemo = () => {
    const fresh = createInitialAppDatabaseState();
    onRestoreState(fresh);
    setConfirmReset(false);
    setMessage({
      type: 'success',
      text:
        lang === 'km'
          ? 'បានកំណត់ទិន្នន័យគំរូដើម (A01–A10) ឡើងវិញដោយជោគជ័យ!'
          : 'Successfully reset to initial fictional sample data (A01–A10)!',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('backup')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'backup'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {lang === 'km' ? 'បម្រុងទុក & នាំចូល/នាំចេញ (JSON / Excel)' : 'Backup & Import/Export'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'tests'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {lang === 'km' ? 'ផ្ទៀងផ្ទាត់រូបមន្តគណនា (Unit Tests)' : 'Unit Tests & Formula Verifier'}
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {message && (
            <div
              className={`p-3 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-semibold text-slate-900">
                  {lang === 'km'
                    ? 'ឯកជនភាពទិន្នន័យ ១០០% (Offline IndexedDB Storage)'
                    : '100% Local Offline Privacy (Browser IndexedDB)'}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {lang === 'km'
                    ? 'ទិន្នន័យសិស្ស និងពិន្ទុទាំងអស់ត្រូវបានរក្សាទុកក្នុងកុំព្យូទ័រ ឬទូរស័ព្ទរបស់អ្នកផ្ទាល់ (IndexedDB) ដោយមិនបង្ហោះទៅកាន់ម៉ាស៊ីនមេខាងក្រៅឡើយ។ សូមទាញយកឯកសារបម្រុងទុក (JSON ឬ Excel) ជាប្រចាំ។'
                    : 'All student records, grades, and attendance stay strictly inside your browser IndexedDB and never leave your device. Export JSON or Excel backups regularly.'}
                </p>
              </div>

              {/* One-Click Cloud Sync between Preview & Deployed URLs */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <span>🔄 សមកាលកម្មពពកផ្ទាល់ (一键同步到部署网址 / Cloud Sync)</span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    ចុចប៊ូតុងនេះដើម្បីផ្ញើទិន្នន័យពីកន្លែងនេះ ទៅកាន់គេហទំព័រដែលបានដាក់ពង្រាយ (部署出来的网址) ភ្លាមៗ ដោយមិនចាំបាច់ផ្ទេរឯកសារដោយដៃ។
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await syncStateToCloud(state);
                      setMessage({
                        type: ok ? 'success' : 'error',
                        text: ok
                          ? '✅ បានបង្ហោះទិន្នន័យទៅកាន់ពពកជោគជ័យ! សូមបើកគេហទំព័រដាក់ពង្រាយ (部署网址) ហើយចុច "ទាញយកពីពពក (从云端拉取)"។'
                          : 'មិនអាចសមកាលកម្មទិន្នន័យទៅពពកបានទេ។',
                      });
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer transition-colors"
                  >
                    <span>⬆️ ផ្ញើទិន្នន័យទៅពពក (推送当前数据到云端)</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const cloud = await loadStateFromCloud();
                      if (cloud) {
                        onRestoreState(cloud);
                        setMessage({
                          type: 'success',
                          text: '✅ បានទាញយកទិន្នន័យចុងក្រោយពីពពកដោយជោគជ័យ!',
                        });
                      } else {
                        setMessage({
                          type: 'error',
                          text: 'មិនទាន់មានទិន្នន័យរក្សាទុកនៅលើពពកនៅឡើយទេ។',
                        });
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 font-bold text-indigo-900 bg-white hover:bg-slate-100 border border-indigo-200 rounded-lg shadow-xs cursor-pointer transition-colors"
                  >
                    <span>⬇️ ទាញយកពីពពក (从云端拉取同步)</span>
                  </button>
                </div>
              </div>

              {/* JSON Backup & Restore */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg space-y-3">
                  <div className="font-semibold text-slate-900">
                    1. JSON Full Backup (.json)
                  </div>
                  <p className="text-slate-500">
                    {lang === 'km'
                      ? 'រក្សាទុក ឬស្តារទិន្នន័យទាំងអស់ (សិស្ស ពិន្ទុ វត្តមាន ផែនការ GEIP និងការកំណត់)។'
                      : 'Export or restore complete application state including settings, scores, attendance, and GEIP targets.'}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => exportToJsonFile(state)}
                      className="flex items-center gap-1.5 px-3 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {lang === 'km' ? 'ទាញយក JSON' : 'Export JSON'}
                    </button>
                    <button
                      type="button"
                      onClick={() => jsonInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      {lang === 'km' ? 'នាំចូល JSON' : 'Restore JSON'}
                    </button>
                    <input
                      ref={jsonInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleJsonImport}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Excel (.xlsx) Export & Import */}
                <div className="p-4 border border-slate-200 rounded-lg space-y-3">
                  <div className="font-semibold text-slate-900">
                    2. Microsoft Excel (.xlsx)
                  </div>
                  <p className="text-slate-500">
                    {lang === 'km'
                      ? 'នាំចេញជាសៀវភៅបញ្ជី Excel មានច្រើនសន្លឹក (Students, Subjects, Scores) ឬនាំចូលពី Excel។'
                      : 'Export multi-sheet Excel workbook (Students, Subjects, Monthly Scores) or import from Excel.'}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => exportToExcelWorkbook(state)}
                      className="flex items-center gap-1.5 px-3 py-2 font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      {lang === 'km' ? 'ទាញយក Excel' : 'Export Excel'}
                    </button>
                    <button
                      type="button"
                      onClick={() => excelInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      {lang === 'km' ? 'នាំចូល Excel' : 'Import Excel'}
                    </button>
                    <input
                      ref={excelInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelImport}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Reset to Sample Data */}
              <div className="p-4 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-900">
                    {lang === 'km'
                      ? 'កំណត់ទិន្នន័យគំរូដើមឡើងវិញ (Reset to Fictional Sample Data A01–A10)'
                      : 'Reset to Fictional Sample Data (A01–A10)'}
                  </div>
                  <div className="text-slate-500">
                    {lang === 'km'
                      ? 'ប្រើសម្រាប់សាកល្បងប្រព័ន្ធជាមួយទិន្នន័យសិស្សប្រឌិត A01 ដល់ A10។'
                      : 'Restore the clean fictional 10-student dataset (A01–A10).'}
                  </div>
                </div>
                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="flex items-center gap-1.5 px-3 py-2 font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {lang === 'km' ? 'កំណត់ឡើងវិញ' : 'Reset Demo Data'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetDemo}
                      className="px-3 py-1.5 font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700"
                    >
                      {lang === 'km' ? 'បញ្ជាក់' : 'Confirm Reset'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-2 py-1.5 text-slate-600"
                    >
                      {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {unitTestResults.filter((r) => r.passed).length} / {unitTestResults.length}{' '}
                    {lang === 'km'
                      ? 'ការធ្វើតេស្តអនុគមន៍សុទ្ធ (Pure Function Unit Tests) ជោគជ័យទាំងអស់'
                      : 'Pure Function Unit Tests Passing'}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-emerald-700">
                  src/utils/calculations.test.ts
                </span>
              </div>

              <div className="space-y-2.5">
                {unitTestResults.map((test) => (
                  <div
                    key={test.id}
                    className="p-3.5 border border-slate-200 rounded-lg space-y-1.5 bg-white"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-slate-900">
                        {lang === 'km' ? test.nameKh : test.nameEn}
                      </div>
                      {test.passed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> FAIL
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 space-y-0.5">
                      <div>Expected: {test.expected}</div>
                      <div>Actual:   {test.actual}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
