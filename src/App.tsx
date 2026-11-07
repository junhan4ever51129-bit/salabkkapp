/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppDatabaseState, Language } from './types';
import { createInitialAppDatabaseState } from './data/defaultData';
import {
  loadStateFromCloud,
  loadStateFromIndexedDB,
  saveStateToIndexedDB,
  syncStateToCloud,
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
import {
  Database,
  Download,
  Hash,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
} from 'lucide-react';

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
  const [selectedClassId, setSelectedClassId] = useState<string>('term-2026-2027__10C');
  const [selectedMonthId, setSelectedMonthId] = useState<string>('nov');
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [quickClassCode, setQuickClassCode] = useState('');
  const [quickClassDay, setQuickClassDay] = useState('ថ្ងៃចន្ទ');
  const [quickClassTime, setQuickClassTime] = useState('13:00-14:30');

  // Load initial state from browser IndexedDB on mount, or fallback to Cloud Sync if fresh environment
  useEffect(() => {
    let mounted = true;
    (async () => {
      const loaded = await loadStateFromIndexedDB();
      if (!mounted) return;

      // If loaded state doesn't have custom classes or was fresh default, check if server has synced cloud data
      try {
        const cloud = await loadStateFromCloud();
        if (cloud && mounted) {
          // If cloud has more updated data or local is just initial default
          const cloudHasCustomClasses = cloud.classes && cloud.classes.length > 0;
          if (cloudHasCustomClasses) {
            setState(cloud);
            setIsLoaded(true);
            void saveStateToIndexedDB(cloud);
            return;
          }
        }
      } catch {
        // offline or standalone
      }

      setState(loaded);
      setIsLoaded(true);
      // Push current loaded state to server cloud sync
      void syncStateToCloud(loaded);
    })();
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

  const navItems: {
    id: ActiveModule;
    step: string;
    labelKh: string;
    labelZh: string;
    activeClass: string;
    badgeClass: string;
  }[] = [
    {
      id: 'scores',
      step: '១',
      labelKh: 'ពិន្ទុប្រចាំខែ & ស្ថិតិ',
      labelZh: '成绩与统计',
      activeClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-blue-300',
      badgeClass: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'attendance',
      step: '២',
      labelKh: 'វត្តមានសិស្ស',
      labelZh: '考勤点名',
      activeClass: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm ring-1 ring-teal-300',
      badgeClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'homework',
      step: '៣',
      labelKh: 'កិច្ចការផ្ទះ & មេរៀន',
      labelZh: '作业与课程',
      activeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm ring-1 ring-amber-300',
      badgeClass: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'curriculum',
      step: '៤',
      labelKh: 'ផែនការ & កិច្ចតែងការ',
      labelZh: '教学计划与教案',
      activeClass: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm ring-1 ring-violet-300',
      badgeClass: 'bg-violet-100 text-violet-700',
    },
    {
      id: 'reports',
      step: '៥',
      labelKh: 'របាយការណ៍សរុប',
      labelZh: '总结报告',
      activeClass: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm ring-1 ring-cyan-300',
      badgeClass: 'bg-cyan-100 text-cyan-800',
    },
    {
      id: 'settings',
      step: '៦',
      labelKh: 'បញ្ជីឈ្មោះ & ការកំណត់',
      labelZh: '名册与设置',
      activeClass: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm ring-1 ring-rose-300',
      badgeClass: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'markdown_docs',
      step: '៧',
      labelKh: 'នាំចេញ A4 HTML',
      labelZh: '导出 A4 HTML',
      activeClass: 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-sm ring-1 ring-indigo-300',
      badgeClass: 'bg-indigo-100 text-indigo-700',
    },
  ];

  const hasClassesInCurrentTerm = termScopedState.classes.length > 0;
  const requiresClassSelection =
    activeModule === 'scores' ||
    activeModule === 'attendance' ||
    activeModule === 'homework' ||
    activeModule === 'reports' ||
    activeModule === 'markdown_docs';

  const activeNavItem = navItems.find((item) => item.id === activeModule) || navItems[0];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50/80 via-indigo-50/40 to-teal-50/60 text-slate-900 font-khmer-battambang">
      {/* Vibrant Top Header Bar */}
      <header className="bg-gradient-to-r from-blue-700 via-indigo-600 to-teal-600 text-white shadow-sm no-print">
        <div className="w-full px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Sidebar Toggle + School & Subject Identity */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((v) => !v)}
              title={
                isSidebarOpen
                  ? 'លាក់របារម៉ឺនុយខាងឆ្វេង (完全收起左侧导航)'
                  : 'បង្ហាញរបារម៉ឺនុយខាងឆ្វេង (展开左侧导航)'
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                isSidebarOpen
                  ? 'bg-white/15 border-white/30 text-white hover:bg-white/25'
                  : 'bg-amber-400 border-amber-300 text-slate-950 hover:bg-amber-300 shadow-sm'
              }`}
            >
              {isSidebarOpen ? (
                <>
                  <PanelLeftClose className="w-4 h-4 text-sky-100" />
                  <span className="hidden sm:inline">លាក់ម៉ឺនុយ (收起)</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-slate-950" />
                  <span>ម៉ឺនុយ៖ {activeNavItem.step}. {activeNavItem.labelKh}</span>
                </>
              )}
            </button>

            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setActiveModule('scores');
              }}
              className="font-khmer-moul text-sm sm:text-base text-white hover:text-amber-200 transition-colors drop-shadow-2xs"
            >
              {state.schoolInfo.schoolNameKh}
            </a>
            <span className="text-sky-200/70" aria-hidden="true">
              ·
            </span>
            <span className="text-xs sm:text-sm font-semibold text-sky-100 bg-white/15 px-2.5 py-0.5 rounded-md border border-white/20">
              មុខវិជ្ជា{state.schoolInfo.subjectNameKh}
            </span>
            <span className="text-sky-200/70" aria-hidden="true">
              ·
            </span>
            <span className="text-xs text-sky-100 font-medium">
              អ្នកគ្រូ {state.schoolInfo.teacherName}
            </span>
          </div>

          {/* Right: Compact Global Utilities */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleManualSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-colors cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-amber-400 border-amber-300 text-slate-950 hover:bg-amber-300 shadow-xs'
                  : 'bg-white/15 border-white/25 text-white hover:bg-white/25'
              }`}
              title={hasUnsavedChanges ? t(lang, 'unsavedChanges') : t(lang, 'savedState')}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{hasUnsavedChanges ? 'រក្សាទុកឥឡូវ' : 'បានរក្សាទុក'}</span>
            </button>

            <button
              type="button"
              onClick={toggleKhmerNumerals}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 border border-white/25 text-white hover:bg-white/25 font-semibold transition-colors cursor-pointer"
            >
              <Hash className="w-3.5 h-3.5 text-amber-300" />
              <span>{state.useKhmerNumerals ? 'លេខខ្មែរ (១២៣)' : 'លេខសកល (123)'}</span>
            </button>

            <button
              type="button"
              onClick={() => void downloadOfficialCambodiaWorkbook(termScopedState)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white border border-emerald-300/60 font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDataModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-indigo-900 hover:bg-sky-50 font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>បម្រុងទុកទិន្នន័យ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body Layout: Collapsible Left Sidebar + Right Main Content */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Floating Quick-Open Tab on far left edge when sidebar is completely hidden */}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            title="បង្ហាញរបារម៉ឺនុយខាងឆ្វេង (展开左侧导航栏)"
            className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-b from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-2 rounded-r-xl shadow-lg border border-l-0 border-white/30 transition-all cursor-pointer no-print"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* Left Sidebar Navigation (Completely invisible when collapsed so it never blocks right content) */}
        {isSidebarOpen && (
          <aside className="w-64 shrink-0 bg-white/95 border-r border-indigo-100 shadow-xs flex flex-col justify-between no-print select-none">
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-100/80">
                <span className="text-xs font-bold text-indigo-900">
                  ម៉ឺនុយមុខងារ (功能导航)
                </span>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  title="លាក់របារម៉ឺនុយទាំងស្រុង (完全隐藏侧边栏，不挡右侧内容)"
                  className="inline-flex items-center gap-1 px-1.5 py-1 rounded-md text-xs text-indigo-600 hover:text-indigo-950 hover:bg-indigo-100/70 transition-colors cursor-pointer"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveModule(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? item.activeClass
                          : 'bg-white hover:bg-sky-50/90 text-slate-700 hover:text-indigo-950 border border-transparent hover:border-sky-200/80'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg inline-flex items-center justify-center text-xs font-bold shrink-0 ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : item.badgeClass
                        }`}
                      >
                        {item.step}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-bold leading-snug truncate">
                          {item.labelKh}
                        </span>
                        <span
                          className={`text-[11px] truncate ${
                            isActive
                              ? 'text-white/90 font-medium'
                              : 'text-slate-500 font-normal'
                          }`}
                        >
                          {item.labelZh}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-3 border-t border-indigo-100/80 bg-sky-50/40">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-950 border border-indigo-200/70 text-xs font-bold transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
                <span>លាក់របារខាងឆ្វេង (收起导航)</span>
              </button>
            </div>
          </aside>
        )}

        {/* Right Side: Class Selector Bar + Main Content Viewport */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Unified Academic Year & Class Selector Bar */}
          <TermAndClassBar
            state={state}
            selectedClassId={selectedClassId}
            onSelectClass={setSelectedClassId}
            onUpdateState={handleUpdateState}
          />

          {/* Main Content Viewport */}
          <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
        {!hasClassesInCurrentTerm && requiresClassSelection ? (
          <div className="bg-white border border-indigo-100 rounded-2xl p-6 max-w-2xl mx-auto space-y-4 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-indigo-950">
                ឆ្នាំសិក្សាថ្មី៖ {state.schoolInfo.academicYear} (ចាប់ផ្តើមពីខែវិច្ឆិកា ដល់ ខែសីហា/កញ្ញា)
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                ឆ្នាំសិក្សាថ្មីមិនរក្សាទុកឈ្មោះសិស្ស និងថ្នាក់រៀនពីឆ្នាំចាស់ទេ។ សូមបន្ថែមថ្នាក់រៀនថ្មីរបស់អ្នកនៅខាងក្រោម ឬចុចប៊ូតុង{' '}
                <strong className="text-emerald-700">«+ បន្ថែមថ្នាក់»</strong> នៅរបារខាងលើ (新学期不保留去年的班级和学生姓名，请手动添加本学期班级)。
              </p>
            </div>

            <form
              onSubmit={handleQuickAddFirstClass}
              className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50/60 border border-sky-200 rounded-xl flex flex-wrap items-end gap-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-indigo-950 mb-1">
                  ឈ្មោះថ្នាក់ (班级名称, ឧ. 8A, 9B, 10C)
                </label>
                <input
                  type="text"
                  value={quickClassCode}
                  onChange={(e) => setQuickClassCode(e.target.value)}
                  placeholder="ឧ. 10C ឬ 8A"
                  className="w-36 px-3 py-1.5 bg-white border border-sky-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-indigo-950 mb-1">
                  ថ្ងៃបង្រៀន (上课日)
                </label>
                <input
                  type="text"
                  value={quickClassDay}
                  onChange={(e) => setQuickClassDay(e.target.value)}
                  placeholder="ថ្ងៃចន្ទ"
                  className="w-28 px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-indigo-950 mb-1">
                  ម៉ោងសិក្សា (时间)
                </label>
                <input
                  type="text"
                  value={quickClassTime}
                  onChange={(e) => setQuickClassTime(e.target.value)}
                  placeholder="15:00-16:30"
                  className="w-32 px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-slate-800"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-xs cursor-pointer"
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
                className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
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
        </div>
      </div>

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
