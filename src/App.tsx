/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppDatabaseState, Language } from './types';
import { createInitialAppDatabaseState } from './data/defaultData';
import {
  loadStateFromIndexedDB,
  saveStateToIndexedDB,
} from './utils/storage';
import { t } from './utils/i18n';
import { BasicSettingsModule } from './components/BasicSettingsModule';
import { MonthlyScoreModule } from './components/MonthlyScoreModule';
import { AttendanceModule } from './components/AttendanceModule';
import { ReportsModule } from './components/ReportsModule';
import { GeipPlanModule } from './components/GeipPlanModule';
import { HomeworkTrackerModule } from './components/HomeworkTrackerModule';
import { MarkdownDocumentView } from './components/MarkdownDocumentView';
import { TermAndClassBar } from './components/TermAndClassBar';
import { DataManagementModal } from './components/DataManagementModal';
import { downloadOfficialCambodiaWorkbook } from './utils/excelWorkbookBuilder';
import { Database, Download, FileText, Globe, Hash, Save, ShieldCheck } from 'lucide-react';

type ActiveModule =
  | 'markdown_docs'
  | 'settings'
  | 'scores'
  | 'attendance'
  | 'homework'
  | 'curriculum'
  | 'reports';

export default function App() {
  const [state, setState] = useState<AppDatabaseState>(() => createInitialAppDatabaseState());
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lang] = useState<Language>('km');
  const [activeModule, setActiveModule] = useState<ActiveModule>('scores');
  const [selectedClassId, setSelectedClassId] = useState<string>('10C');
  const [selectedMonthId, setSelectedMonthId] = useState<string>('nov');
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [quickClassCode, setQuickClassCode] = useState('');
  const [quickClassDay, setQuickClassDay] = useState('ថ្ងៃចន្ទ');
  const [quickClassTime, setQuickClassTime] = useState('15:00-16:30');

  // Load initial state from browser IndexedDB on mount
  useEffect(() => {
    let mounted = true;
    loadStateFromIndexedDB().then((loaded) => {
      if (!mounted) return;
      setState(loaded);
      setIsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Warn before closing browser tab if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Debounced auto-save to IndexedDB
  useEffect(() => {
    if (!isLoaded || !hasUnsavedChanges) return;
    const timer = window.setTimeout(() => {
      saveStateToIndexedDB(state).then(() => {
        setHasUnsavedChanges(false);
      });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [state, isLoaded, hasUnsavedChanges]);

  const handleUpdateState = (updater: (prev: AppDatabaseState) => AppDatabaseState) => {
    setState((prev) => updater(prev));
    setHasUnsavedChanges(true);
  };

  // Scope classes & students to the active academic term so a new academic year starts clean
  const currentTermId = state.currentTermId || 'term-2026-2027';
  const termScopedState = React.useMemo<AppDatabaseState>(() => {
    const termClasses = state.classes.filter(
      (c) => (c.termId || 'term-2025-2026') === currentTermId
    );
    const termClassIds = new Set(termClasses.map((c) => c.id));
    const termStudents = state.students.filter((s) => termClassIds.has(s.classId));
    return {
      ...state,
      classes: termClasses,
      students: termStudents,
    };
  }, [state, currentTermId]);

  // Keep selectedClassId valid within the current term
  useEffect(() => {
    if (termScopedState.classes.length > 0) {
      const exists = termScopedState.classes.some((c) => c.id === selectedClassId);
      if (!exists) {
        setSelectedClassId(termScopedState.classes[0].id);
      }
    } else if (selectedClassId !== '') {
      setSelectedClassId('');
    }
  }, [termScopedState.classes, selectedClassId]);

  const handleScopedUpdateState = (
    updater: (prev: AppDatabaseState) => AppDatabaseState
  ) => {
    setState((prev) => {
      const prevTermId = prev.currentTermId || 'term-2026-2027';
      const prevTermClasses = prev.classes.filter(
        (c) => (c.termId || 'term-2025-2026') === prevTermId
      );
      const prevTermClassIds = new Set(prevTermClasses.map((c) => c.id));
      const prevTermStudents = prev.students.filter((s) =>
        prevTermClassIds.has(s.classId)
      );

      const scopedPrev: AppDatabaseState = {
        ...prev,
        classes: prevTermClasses,
        students: prevTermStudents,
      };

      const nextScoped = updater(scopedPrev);
      const nextTermId = nextScoped.currentTermId || prevTermId;

      const otherClasses = prev.classes.filter(
        (c) => (c.termId || 'term-2025-2026') !== prevTermId
      );
      const otherStudents = prev.students.filter(
        (s) => !prevTermClassIds.has(s.classId)
      );

      const taggedNextClasses = nextScoped.classes.map((c) => ({
        ...c,
        termId: c.termId || nextTermId,
      }));

      return {
        ...nextScoped,
        classes: [...otherClasses, ...taggedNextClasses],
        students: [...otherStudents, ...nextScoped.students],
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleQuickAddFirstClass = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = quickClassCode.trim();
    if (!raw) return;
    const normCode = raw
      .replace(/[០-៩]/g, (ch) => String('០១២៣៤៥៦៧៨៩'.indexOf(ch)))
      .replace(/^ថ្នាក់ទី\s*/g, '')
      .replace(/^ថ្នាក់\s*/g, '')
      .replace(/\s+/g, '')
      .toUpperCase();
    if (!normCode) return;

    const cleanName = raw
      .replace(/^ថ្នាក់ទី\s*/g, '')
      .replace(/^ថ្នាក់\s*/g, '')
      .trim();
    const matchGrade = normCode.match(/^(7|8|9|10|11|12)/);
    const gradeLevel = matchGrade ? Number(matchGrade[1]) : 8;
    const scopedId =
      currentTermId === 'term-2025-2026'
        ? normCode
        : `${currentTermId}__${normCode}`;

    handleUpdateState((prev) => ({
      ...prev,
      classes: [
        ...prev.classes,
        {
          id: scopedId,
          name: cleanName || normCode,
          gradeLevel,
          scheduleDayKh: quickClassDay.trim() || 'ថ្ងៃចន្ទ',
          scheduleTime: quickClassTime.trim() || '15:00-16:30',
          weeklyHoursLabel: '១ម៉ ៣០ន/ សប្តាហ៍',
          textbookName:
            gradeLevel >= 10
              ? '快乐汉语 (第二册) ភាសាចិនរីករាយ (កំរិត២)'
              : '快乐汉语 (第一册) ភាសាចិនរីករាយ (កំរិត១)',
          termId: currentTermId,
        },
      ],
    }));
    setSelectedClassId(scopedId);
    setQuickClassCode('');
  };

  const handleManualSave = async () => {
    await saveStateToIndexedDB(state);
    setHasUnsavedChanges(false);
  };

  const handleRestoreState = async (restored: AppDatabaseState) => {
    setState(restored);
    await saveStateToIndexedDB(restored);
    setHasUnsavedChanges(false);
  };

  const toggleKhmerNumerals = () => {
    handleUpdateState((prev) => ({
      ...prev,
      useKhmerNumerals: !prev.useKhmerNumerals,
    }));
  };

  const navItems: { id: ActiveModule; step: string; labelKh: string; labelZh: string }[] = [
    {
      id: 'scores',
      step: '១',
      labelKh: 'ពិន្ទុប្រចាំខែ & ស្ថិតិ',
      labelZh: '成绩与统计',
    },
    {
      id: 'attendance',
      step: '២',
      labelKh: 'វត្តមានសិស្ស',
      labelZh: '考勤点名',
    },
    {
      id: 'homework',
      step: '៣',
      labelKh: 'កិច្ចការផ្ទះ & មេរៀន',
      labelZh: '作业与课程',
    },
    {
      id: 'curriculum',
      step: '៤',
      labelKh: 'ផែនការ & កិច្ចតែងការ',
      labelZh: '教学计划与教案',
    },
    {
      id: 'reports',
      step: '៥',
      labelKh: 'របាយការណ៍សរុប',
      labelZh: '总结报告',
    },
    {
      id: 'settings',
      step: '៦',
      labelKh: 'បញ្ជីឈ្មោះ & ការកំណត់',
      labelZh: '名册与设置',
    },
    {
      id: 'markdown_docs',
      step: '៧',
      labelKh: 'នាំចេញ A4 HTML',
      labelZh: '导出 A4 HTML',
    },
  ];

  const hasClassesInCurrentTerm = termScopedState.classes.length > 0;
  const requiresClassSelection =
    activeModule === 'scores' ||
    activeModule === 'attendance' ||
    activeModule === 'homework' ||
    activeModule === 'reports' ||
    activeModule === 'markdown_docs';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-khmer-battambang">
      {/* Clean Top Header Bar */}
      <header className="bg-white border-b border-slate-200 no-print">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: School & Subject Identity */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setActiveModule('scores');
              }}
              className="font-khmer-moul text-sm sm:text-base text-slate-900 hover:text-indigo-700 transition-colors"
            >
              {state.schoolInfo.schoolNameKh}
            </a>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-700">
              មុខវិជ្ជា{state.schoolInfo.subjectNameKh}
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-xs text-slate-600">
              អ្នកគ្រូ {state.schoolInfo.teacherName}
            </span>
          </div>

          {/* Right: Compact Global Utilities */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleManualSave}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border font-medium transition-colors cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={hasUnsavedChanges ? t(lang, 'unsavedChanges') : t(lang, 'savedState')}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{hasUnsavedChanges ? 'រក្សាទុកឥឡូវ' : 'បានរក្សាទុក'}</span>
            </button>

            <button
              type="button"
              onClick={toggleKhmerNumerals}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
            >
              <Hash className="w-3.5 h-3.5 text-slate-500" />
              <span>{state.useKhmerNumerals ? 'លេខខ្មែរ (១២៣)' : 'លេខសកល (123)'}</span>
            </button>

            <button
              type="button"
              onClick={() => void downloadOfficialCambodiaWorkbook(termScopedState)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-700 text-white hover:bg-emerald-800 font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDataModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>បម្រុងទុកទិន្នន័យ</span>
            </button>
          </div>
        </div>

        {/* Primary 7-Step Navigation Bar */}
        <div className="border-t border-slate-100 bg-slate-50/70">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-1.5">
            {navItems.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveModule(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span
                    className={`text-xs ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {item.step}.
                  </span>
                  <span>{item.labelKh}</span>
                  <span
                    className={`text-[11px] ${
                      isActive ? 'text-slate-300 font-normal' : 'text-slate-400 font-normal'
                    }`}
                  >
                    ({item.labelZh})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Unified Academic Year & Class Selector Bar */}
      <TermAndClassBar
        state={state}
        selectedClassId={selectedClassId}
        onSelectClass={setSelectedClassId}
        onUpdateState={handleUpdateState}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
        {!hasClassesInCurrentTerm && requiresClassSelection ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl mx-auto space-y-4 shadow-2xs">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">
                ឆ្នាំសិក្សាថ្មី៖ {state.schoolInfo.academicYear} (ចាប់ផ្តើមពីខែវិច្ឆិកា ដល់ ខែសីហា/កញ្ញា)
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                ឆ្នាំសិក្សាថ្មីមិនរក្សាទុកឈ្មោះសិស្ស និងថ្នាក់រៀនពីឆ្នាំចាស់ទេ។ សូមបន្ថែមថ្នាក់រៀនថ្មីរបស់អ្នកនៅខាងក្រោម ឬចុចប៊ូតុង{' '}
                <strong>«+ បន្ថែមថ្នាក់»</strong> នៅរបារខាងលើ (新学期不保留去年的班级和学生姓名，请手动添加本学期班级)。
              </p>
            </div>

            <form
              onSubmit={handleQuickAddFirstClass}
              className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-end gap-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ឈ្មោះថ្នាក់ (班级名称, ឧ. 8A, 9B, 10C)
                </label>
                <input
                  type="text"
                  value={quickClassCode}
                  onChange={(e) => setQuickClassCode(e.target.value)}
                  placeholder="ឧ. 10C ឬ 8A"
                  className="w-36 px-3 py-1.5 bg-white border border-slate-300 rounded-md font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ថ្ងៃបង្រៀន (上课日)
                </label>
                <input
                  type="text"
                  value={quickClassDay}
                  onChange={(e) => setQuickClassDay(e.target.value)}
                  placeholder="ថ្ងៃចន្ទ"
                  className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ម៉ោងសិក្សា (时间)
                </label>
                <input
                  type="text"
                  value={quickClassTime}
                  onChange={(e) => setQuickClassTime(e.target.value)}
                  placeholder="15:00-16:30"
                  className="w-32 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-md hover:bg-slate-800 cursor-pointer"
              >
                + បង្កើតថ្នាក់រៀន (创建班级)
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>
                បន្ទាប់ពីបង្កើតថ្នាក់រៀនរួច អ្នកអាចបញ្ចូលឈ្មោះសិស្សនៅក្នុងផ្នែក «៦. បញ្ជីឈ្មោះ & ការកំណត់» ឬ «២. វត្តមានសិស្ស»។
              </span>
              <button
                type="button"
                onClick={() => setActiveModule('settings')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                ទៅកាន់បញ្ជីឈ្មោះ & ការកំណត់ →
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeModule === 'markdown_docs' && (
              <MarkdownDocumentView
                state={termScopedState}
                selectedClassId={selectedClassId}
                selectedMonthId={selectedMonthId}
                onSelectClassId={setSelectedClassId}
                onSelectMonthId={setSelectedMonthId}
                onUpdateState={handleScopedUpdateState}
              />
            )}

            {activeModule === 'settings' && (
              <BasicSettingsModule
                state={termScopedState}
                lang={lang}
                selectedClassId={selectedClassId}
                onSelectClassId={setSelectedClassId}
                onUpdateState={handleScopedUpdateState}
              />
            )}

            {activeModule === 'scores' && (
              <MonthlyScoreModule
                state={termScopedState}
                lang={lang}
                selectedClassId={selectedClassId}
                onSelectClassId={setSelectedClassId}
                selectedMonthId={selectedMonthId}
                onSelectMonthId={setSelectedMonthId}
                onUpdateState={handleScopedUpdateState}
              />
            )}

            {activeModule === 'attendance' && (
              <AttendanceModule
                state={termScopedState}
                lang={lang}
                selectedClassId={selectedClassId}
                onSelectClassId={setSelectedClassId}
                selectedMonthId={selectedMonthId}
                onSelectMonthId={setSelectedMonthId}
                onUpdateState={handleScopedUpdateState}
              />
            )}

            {activeModule === 'homework' && (
              <HomeworkTrackerModule
                state={termScopedState}
                lang={lang}
                selectedClassId={selectedClassId}
                onSelectClass={setSelectedClassId}
                onUpdateState={handleScopedUpdateState}
              />
            )}

            {activeModule === 'curriculum' && (
              <GeipPlanModule
                state={termScopedState}
                lang={lang}
                selectedClassId={selectedClassId}
                onSelectClassId={setSelectedClassId}
                selectedMonthId={selectedMonthId}
                onSelectMonthId={setSelectedMonthId}
                onUpdateState={handleScopedUpdateState}
              />
            )}

            {activeModule === 'reports' && (
              <ReportsModule
                state={termScopedState}
                lang={lang}
                selectedClassId={selectedClassId}
                onSelectClassId={setSelectedClassId}
                selectedMonthId={selectedMonthId}
                onSelectMonthId={setSelectedMonthId}
                onUpdateState={handleScopedUpdateState}
              />
            )}
          </>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 no-print">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            ប្រព័ន្ធគ្រប់គ្រងការបង្រៀនមុខវិជ្ជាភាសាចិន —{' '}
            <span className="font-khmer-moul text-xs text-slate-800">
              {state.schoolInfo.schoolNameKh}
            </span>
          </div>
          <div>
            អ្នកគ្រូ {state.schoolInfo.teacherName} · ឆ្នាំសិក្សា {state.schoolInfo.academicYear}
          </div>
        </div>
      </footer>

      {/* Backup, Restore & Unit Test Modal */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        state={state}
        lang={lang}
        onRestoreState={handleRestoreState}
      />
    </div>
  );
}
