import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  Calendar,
  CheckCheck,
  RotateCcw,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  AppDatabaseState,
  DailyHomeworkRecord,
  HomeworkSubmissionStatus,
  Language,
  WeeklyLessonLogItem,
} from '../types';
import {
  ddMmYyyyToIso,
  formatNumeral as formatNum,
  sortStudentsByKhmerName,
} from '../utils/calculations';
import { AiGeneratorBar } from './AiGeneratorBar';
import { generateDefaultDailyHomeworkRecords } from '../data/defaultData';
import { SignatureDateEditor } from './SignatureDateEditor';
import { MarkdownCopyBar } from './MarkdownDocumentView';

interface Props {
  state: AppDatabaseState;
  lang: Language;
  selectedClassId: string;
  onSelectClass: (id: string) => void;
  onUpdateState: (updater: (prev: AppDatabaseState) => AppDatabaseState) => void;
}

function isoToDdMmYyyy(iso: string): string {
  const parts = iso.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return iso;
}

export const HomeworkTrackerModule: React.FC<Props> = ({
  state,
  selectedClassId,
  onSelectClass,
  onUpdateState,
}) => {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [filterMode, setFilterMode] = useState<'all' | 'submitted' | 'missing'>('all');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const currentClass =
    state.classes.find((c) => c.id === selectedClassId) || state.classes[0];

  const allRecords = useMemo(() => {
    const existing = state.dailyHomeworkRecords || [];
    const forDate = existing.filter((r) => r.date === selectedDate);
    if (forDate.length >= state.classes.length) {
      return existing;
    }
    const generated = generateDefaultDailyHomeworkRecords(state.classes, state.students).map(
      (r) => ({
        ...r,
        id: `hw-${r.classId}-${selectedDate}`,
        date: selectedDate,
      })
    );
    const merged = [...existing];
    for (const g of generated) {
      if (!merged.some((m) => m.classId === g.classId && m.date === selectedDate)) {
        merged.push(g);
      }
    }
    return merged;
  }, [state.dailyHomeworkRecords, state.classes, state.students, selectedDate]);

  const dateRecordsByClass = useMemo(() => {
    const map: Record<string, DailyHomeworkRecord> = {};
    for (const cls of state.classes) {
      const found = allRecords.find(
        (r) => r.classId === cls.id && r.date === selectedDate
      );
      if (found) {
        map[cls.id] = found;
      }
    }
    return map;
  }, [allRecords, state.classes, selectedDate]);

  const currentRecord = dateRecordsByClass[currentClass?.id || '8A'];

  const classStudents = useMemo(
    () =>
      sortStudentsByKhmerName(
        state.students.filter(
          (s) => s.classId === currentClass?.id && s.status === 'active'
        )
      ),
    [state.students, currentClass?.id]
  );

  const submittedStudents = useMemo(
    () =>
      classStudents.filter(
        (s) => (currentRecord?.submissions?.[s.id] || 'missing') === 'submitted'
      ),
    [classStudents, currentRecord]
  );

  const missingStudents = useMemo(
    () =>
      classStudents.filter(
        (s) => (currentRecord?.submissions?.[s.id] || 'missing') !== 'submitted'
      ),
    [classStudents, currentRecord]
  );

  const filteredStudents = useMemo(() => {
    if (filterMode === 'submitted') return submittedStudents;
    if (filterMode === 'missing') return missingStudents;
    return classStudents;
  }, [classStudents, submittedStudents, missingStudents, filterMode]);

  const assignedClasses = useMemo(
    () => state.classes.filter((c) => dateRecordsByClass[c.id]?.assigned),
    [state.classes, dateRecordsByClass]
  );

  const unassignedClasses = useMemo(
    () => state.classes.filter((c) => !dateRecordsByClass[c.id]?.assigned),
    [state.classes, dateRecordsByClass]
  );

  // Helper to sync a DailyHomeworkRecord (with កំណត់ត្រាមេរៀន + កំណត់ត្រាកិច្ចការផ្ទះ) into state.weeklyLogs (សម្រង់អត្ថបទប្រចាំសប្តាហ៍)
  const buildUpdatedWeeklyLogs = (
    prevLogs: WeeklyLessonLogItem[],
    clsGroup: typeof currentClass,
    rec: DailyHomeworkRecord
  ): WeeklyLessonLogItem[] => {
    if (!clsGroup) return prevLogs;
    const weekdayShort = clsGroup.scheduleDayKh.replace(/^ថ្ងៃ/, '');
    const combinedContent = [
      rec.lessonContentDetails || '',
      rec.assigned && rec.homeworkDetail
        ? `កិច្ចការផ្ទះ (作业)៖ ${rec.homeworkTitle} — ${rec.homeworkDetail}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const nextLogs = [...prevLogs];
    // Find existing log for this classId
    const existingIdx = nextLogs.findIndex((w) => w.classId === clsGroup.id);
    const updatedItem: WeeklyLessonLogItem = {
      id: existingIdx >= 0 ? nextLogs[existingIdx].id : `wlog-${clsGroup.id}-${Date.now()}`,
      weekLabel:
        existingIdx >= 0
          ? nextLogs[existingIdx].weekLabel
          : `សប្តាហ៍ (${isoToDdMmYyyy(rec.date)})`,
      dateStr: isoToDdMmYyyy(rec.date),
      weekdayKh: weekdayShort,
      timeRange: clsGroup.scheduleTime,
      classId: clsGroup.id,
      unitTitle: rec.lessonUnitTitle || '第一单元 · ជំពូកទី១',
      lessonTitle: rec.lessonTitle || rec.homeworkTitle,
      contentDetails: combinedContent || rec.homeworkDetail,
    };

    if (existingIdx >= 0) {
      nextLogs[existingIdx] = updatedItem;
    } else {
      nextLogs.push(updatedItem);
    }
    return nextLogs;
  };

  const upsertRecord = (
    classId: string,
    updater: (prevRecord: DailyHomeworkRecord) => DailyHomeworkRecord,
    autoSyncWeeklyLog = true
  ) => {
    onUpdateState((prev) => {
      const baseList =
        prev.dailyHomeworkRecords && prev.dailyHomeworkRecords.length > 0
          ? [...prev.dailyHomeworkRecords]
          : generateDefaultDailyHomeworkRecords(prev.classes, prev.students);

      const idx = baseList.findIndex(
        (r) => r.classId === classId && r.date === selectedDate
      );
      const fallback: DailyHomeworkRecord =
        dateRecordsByClass[classId] || {
          id: `hw-${classId}-${selectedDate}`,
          classId,
          date: selectedDate,
          assigned: true,
          lessonUnitTitle: 'ជំពូកទី២ គ្រួសារ និងសាលារៀន (第二单元)',
          lessonTitle: 'មេរៀនទី៤ គ្រួសាររបស់ខ្ញុំ (第四课 我的家)',
          lessonContentDetails: '1. ពាក្យថ្មី និងល្បះសន្ទនាប្រចាំថ្ងៃ',
          syncedToWeeklyLog: true,
          homeworkTitle: 'កិច្ចការផ្ទះភាសាចិនប្រចាំថ្ងៃ',
          homeworkDetail: '',
          dueDate: 'សប្តាហ៍ក្រោយ',
          submissions: {},
          notes: {},
        };

      const updated = {
        ...updater(idx >= 0 ? baseList[idx] : fallback),
        syncedToWeeklyLog: true,
      };
      if (idx >= 0) {
        baseList[idx] = updated;
      } else {
        baseList.push(updated);
      }

      const targetClass = prev.classes.find((c) => c.id === classId);
      const nextWeeklyLogs =
        autoSyncWeeklyLog && targetClass
          ? buildUpdatedWeeklyLogs(prev.weeklyLogs, targetClass, updated)
          : prev.weeklyLogs;

      return {
        ...prev,
        dailyHomeworkRecords: baseList,
        weeklyLogs: nextWeeklyLogs,
      };
    });
  };

  const handleSyncAllClassesToWeeklyLog = () => {
    onUpdateState((prev) => {
      let nextLogs = [...prev.weeklyLogs];
      for (const cls of prev.classes) {
        const rec = dateRecordsByClass[cls.id];
        if (rec) {
          nextLogs = buildUpdatedWeeklyLogs(nextLogs, cls, rec);
        }
      }
      return {
        ...prev,
        weeklyLogs: nextLogs,
      };
    });
    setSyncMessage(
      'បានបញ្ចូលកំណត់ត្រាមេរៀន និងកិច្ចការផ្ទះទាំងអស់ទៅក្នុង សម្រង់អត្ថបទប្រចាំសប្តាហ៍ រួចរាល់!'
    );
    window.setTimeout(() => setSyncMessage(null), 3500);
  };

  const handleToggleClassAssigned = (classId: string) => {
    upsertRecord(classId, (rec) => ({
      ...rec,
      assigned: !rec.assigned,
    }));
  };

  const handleDeleteClassHomework = (classId: string) => {
    const targetCls = state.classes.find((c) => c.id === classId);
    upsertRecord(
      classId,
      (rec) => ({
        ...rec,
        assigned: false,
        homeworkTitle: '',
        homeworkDetail: '',
        dueDate: '',
        submissions: {},
        notes: {},
      }),
      true
    );
    setSyncMessage(
      `បានលុបកិច្ចការផ្ទះថ្នាក់ទី ${targetCls?.name || classId} រួចរាល់! (已手动删除该班作业)`
    );
    window.setTimeout(() => setSyncMessage(null), 3500);
  };

  const handleToggleStudentSubmission = (studentId: string) => {
    if (!currentClass) return;
    upsertRecord(
      currentClass.id,
      (rec) => {
        const currentStatus: HomeworkSubmissionStatus =
          rec.submissions?.[studentId] === 'submitted' ? 'missing' : 'submitted';
        return {
          ...rec,
          assigned: true,
          submissions: {
            ...rec.submissions,
            [studentId]: currentStatus,
          },
          notes: {
            ...rec.notes,
            [studentId]:
              currentStatus === 'submitted' ? 'បានប្រគល់រួចរាល់' : 'មិនទាន់ប្រគល់សៀវភៅ',
          },
        };
      },
      false
    );
  };

  const handleMarkAllStudents = (status: HomeworkSubmissionStatus) => {
    if (!currentClass) return;
    upsertRecord(
      currentClass.id,
      (rec) => {
        const nextSub: Record<string, HomeworkSubmissionStatus> = { ...rec.submissions };
        const nextNotes: Record<string, string> = { ...rec.notes };
        classStudents.forEach((stu) => {
          nextSub[stu.id] = status;
          nextNotes[stu.id] =
            status === 'submitted' ? 'បានប្រគល់រួចរាល់' : 'មិនទាន់ប្រគល់សៀវភៅ';
        });
        return {
          ...rec,
          assigned: status === 'submitted' ? true : rec.assigned,
          submissions: nextSub,
          notes: nextNotes,
        };
      },
      false
    );
  };

  const handleStudentNoteChange = (studentId: string, note: string) => {
    if (!currentClass) return;
    upsertRecord(
      currentClass.id,
      (rec) => ({
        ...rec,
        notes: {
          ...rec.notes,
          [studentId]: note,
        },
      }),
      false
    );
  };

  const handleAiHomeworkAndLessonResult = (rawData: unknown) => {
    if (!currentClass || !rawData || typeof rawData !== 'object') return;
    const obj = rawData as Record<string, unknown>;
    upsertRecord(
      currentClass.id,
      (rec) => ({
        ...rec,
        assigned: true,
        lessonUnitTitle: String(
          obj.lessonUnitTitle || rec.lessonUnitTitle || 'ជំពូកទី២ (第二单元)'
        ),
        lessonTitle: String(
          obj.lessonTitle || obj.homeworkTitle || rec.lessonTitle || ''
        ),
        lessonContentDetails: String(
          obj.lessonContentDetails || rec.lessonContentDetails || ''
        ),
        homeworkTitle: String(
          obj.homeworkTitle || obj.title || rec.homeworkTitle
        ),
        homeworkDetail: String(
          obj.homeworkDetail || obj.description || rec.homeworkDetail
        ),
        dueDate: String(obj.dueDate || rec.dueDate),
      }),
      true
    );
    setSyncMessage(
      `បានបង្កើតកំណត់ត្រាមេរៀន និងកិច្ចការផ្ទះថ្នាក់ទី ${currentClass.name} ហើយបញ្ចូលទៅក្នុង សម្រង់អត្ថបទប្រចាំសប្តាហ៍ ស្វ័យប្រវត្តិ!`
    );
    window.setTimeout(() => setSyncMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Date Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                កំណត់ត្រាកិច្ចការផ្ទះ និងកំណត់ត្រាមេរៀនប្រចាំថ្ងៃ (ភ្ជាប់ស្វ័យប្រវត្តិទៅសម្រង់អត្ថបទប្រចាំសប្តាហ៍)
              </h2>
              <p className="text-xs text-slate-600">
                ពិនិត្យមើលថ្នាក់ដែលបានដាក់កិច្ចការថ្ងៃនេះ សិស្សប្រគល់/មិនទាន់ប្រគល់ និងបង្កើតកំណត់ត្រាមេរៀនចូលទៅក្នុង សម្រង់អត្ថបទប្រចាំសប្តាហ៍
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
              <Calendar className="w-4 h-4" />
              <span>កាលបរិច្ឆេទ (ថ្ងៃនេះ):</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white px-2 py-0.5 rounded border border-slate-300 text-xs font-bold"
              />
            </div>

            <button
              type="button"
              onClick={handleSyncAllClassesToWeeklyLog}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>បញ្ចូលកំណត់ត្រាមេរៀនទាំងអស់ទៅ សម្រង់អត្ថបទប្រចាំសប្តាហ៍</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
            ✓ {syncMessage}
          </div>
        )}

        {/* Standard Markdown Copy Bar (Replaces PDF button) */}
        <MarkdownCopyBar
          state={state}
          section="homework_lesson"
          selectedClassId={currentClass?.id || '8A'}
          selectedMonthId="feb"
          label="ចម្លង Markdown កំណត់ត្រាកិច្ចការផ្ទះ & មេរៀន"
        />
      </div>

      {/* Section 1: Today's Class Homework Assignment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Classes Assigned Today */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold">
                ថ្ងៃនេះ ថ្នាក់ដែលបានដាក់កិច្ចការផ្ទះរួចហើយ ({formatNum(assignedClasses.length, state.useKhmerNumerals)}{' '}
                ថ្នាក់)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              បានដាក់កិច្ចការ ✓
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {assignedClasses.map((cls) => {
              const rec = dateRecordsByClass[cls.id];
              const clsStudents = state.students.filter(
                (s) => s.classId === cls.id && s.status === 'active'
              );
              const subCount = clsStudents.filter(
                (s) => rec?.submissions?.[s.id] === 'submitted'
              ).length;
              const missCount = clsStudents.length - subCount;
              const isSelected = cls.id === currentClass?.id;

              return (
                <div
                  key={cls.id}
                  onClick={() => onSelectClass(cls.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                      : 'bg-white border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className="font-bold text-sm">
                      ថ្នាក់ទី {cls.name} ({cls.scheduleDayKh})
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleClassAssigned(cls.id);
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[11px] font-bold cursor-pointer"
                        title="ចុចដើម្បីប្តូរស្ថានភាពកិច្ចការផ្ទះ"
                      >
                        ✓ បានដាក់កិច្ចការ
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClassHomework(cls.id);
                        }}
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold cursor-pointer"
                        title="លុបកិច្ចការផ្ទះថ្នាក់នេះ (删除作业)"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>លុប</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 truncate mb-1">
                    មេរៀន៖ {rec?.lessonTitle || rec?.homeworkTitle || '-'}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span>
                      បានប្រគល់: {formatNum(subCount, state.useKhmerNumerals)} នាក់
                    </span>
                    <span>
                      មិនទាន់ប្រគល់: {formatNum(missCount, state.useKhmerNumerals)} នាក់
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Classes Not Yet Assigned Today */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold">
                ថ្ងៃនេះ ថ្នាក់មិនទាន់ដាក់កិច្ចការផ្ទះ ({formatNum(unassignedClasses.length, state.useKhmerNumerals)}{' '}
                ថ្នាក់)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              មិនទាន់ដាក់កិច្ចការ
            </span>
          </div>

          {unassignedClasses.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              គ្រប់ថ្នាក់ទាំងអស់បានដាក់កិច្ចការផ្ទះរួចរាល់សម្រាប់ថ្ងៃនេះ!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {unassignedClasses.map((cls) => {
                const isSelected = cls.id === currentClass?.id;
                return (
                  <div
                    key={cls.id}
                    onClick={() => onSelectClass(cls.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                        : 'bg-white border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm">
                        ថ្នាក់ទី {cls.name} ({cls.scheduleDayKh})
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] font-bold">
                        មិនទាន់ដាក់
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">
                      ម៉ោងសិក្សា: {cls.scheduleTime}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleClassAssigned(cls.id);
                        onSelectClass(cls.id);
                      }}
                      className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                    >
                      + ដាក់កិច្ចការផ្ទះថ្នាក់ {cls.name} ថ្ងៃនេះ
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Lesson Record (កំណត់ត្រាមេរៀន) + Homework Record (កំណត់ត្រាកិច្ចការផ្ទះ) -> Auto Syncs to សម្រង់អត្ថបទប្រចាំសប្តាហ៍ */}
      {currentClass && currentRecord && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5" />
              <div>
                <h3 className="text-sm font-bold">
                  កំណត់ត្រាមេរៀន និងកំណត់ត្រាកិច្ចការផ្ទះ សម្រាប់ថ្នាក់ទី {currentClass.name} ({currentClass.scheduleDayKh}{' '}
                  {currentClass.scheduleTime})
                </h3>
                <p className="text-xs text-slate-600">
                  រាល់ការកែប្រែ ឬបង្កើតដោយ AI នឹងបញ្ចូលទៅក្នុង សម្រង់អត្ថបទប្រចាំសប្តាហ៍ (ថ្នាក់ទី {currentClass.name}) ដោយស្វ័យប្រវត្តិ
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleClassAssigned(currentClass.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  currentRecord.assigned
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {currentRecord.assigned ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ស្ថានភាព៖ បានដាក់កិច្ចការថ្ងៃនេះហើយ</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>ស្ថានភាព៖ មិនទាន់ដាក់កិច្ចការ (ចុចដើម្បីដាក់)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDeleteClassHomework(currentClass.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                title="លុបកិច្ចការផ្ទះថ្នាក់នេះ (删除作业)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>លុបកិច្ចការផ្ទះ (删除作业)</span>
              </button>
            </div>
          </div>

          <AiGeneratorBar
            taskType="daily_homework"
            title={`AI បង្កើតកំណត់ត្រាមេរៀន និងកិច្ចការផ្ទះថ្នាក់ទី ${currentClass.name} (ភ្ជាប់ទៅសម្រង់អត្ថបទប្រចាំសប្តាហ៍)`}
            placeholder="ឧ. មេរៀនទី៥៖ ការណែនាំខ្លួន ពាក្យថ្មី និងលំហាត់សរសេរអក្សរចិន..."
            contextData={{
              classId: currentClass.id,
              className: currentClass.name,
              textbook: currentClass.textbookName,
            }}
            onApplyResult={handleAiHomeworkAndLessonResult}
          />

          {/* កំណត់ត្រាមេរៀន (Lesson Record Fields -> Synced to Weekly Log) */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">
                ១. កំណត់ត្រាមេរៀន (自动同步到 សម្រង់អត្ថបទប្រចាំសប្តាហ៍)
              </span>
              <span className="text-[11px] font-semibold text-emerald-700">
                ✓ ភ្ជាប់ជាមួយសម្រង់អត្ថបទប្រចាំសប្តាហ៍រួចរាល់
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">
                  ជំពូក / 单元 (Unit Title)
                </label>
                <input
                  type="text"
                  value={currentRecord.lessonUnitTitle || ''}
                  onChange={(e) =>
                    upsertRecord(currentClass.id, (rec) => ({
                      ...rec,
                      lessonUnitTitle: e.target.value,
                    }))
                  }
                  placeholder="ឧ. 第二单元 家和学校 · ជំពូកទី២"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  ចំណងជើងមេរៀន / 课题 (Lesson Title)
                </label>
                <input
                  type="text"
                  value={currentRecord.lessonTitle || ''}
                  onChange={(e) =>
                    upsertRecord(currentClass.id, (rec) => ({
                      ...rec,
                      lessonTitle: e.target.value,
                    }))
                  }
                  placeholder="ឧ. 第四课 我的家 · មេរៀនទី៤ គ្រួសាររបស់ខ្ញុំ"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  ខ្លឹមសារកំណត់ត្រាមេរៀន (ពាក្យថ្មី / ល្បះ / អត្ថបទ)
                </label>
                <input
                  type="text"
                  value={currentRecord.lessonContentDetails || ''}
                  onChange={(e) =>
                    upsertRecord(currentClass.id, (rec) => ({
                      ...rec,
                      lessonContentDetails: e.target.value,
                    }))
                  }
                  placeholder="ឧ. 1. 生词 ពាក្យថ្មី៖ 爸爸, 妈妈 · 2. 句型 ល្បះ..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* កំណត់ត្រាកិច្ចការផ្ទះ (Homework Record Fields) */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <span className="block text-xs font-bold">
              ២. កំណត់ត្រាកិច្ចការផ្ទះ (ប្រចាំថ្ងៃ)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">
                  ប្រធានបទកិច្ចការផ្ទះ
                </label>
                <input
                  type="text"
                  value={currentRecord.homeworkTitle}
                  onChange={(e) =>
                    upsertRecord(currentClass.id, (rec) => ({
                      ...rec,
                      homeworkTitle: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  ខ្លឹមសារកិច្ចការផ្ទះលម្អិត
                </label>
                <input
                  type="text"
                  value={currentRecord.homeworkDetail}
                  onChange={(e) =>
                    upsertRecord(currentClass.id, (rec) => ({
                      ...rec,
                      homeworkDetail: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  ថ្ងៃកំណត់ប្រគល់កិច្ចការ (ចុចជ្រើសរើសថ្ងៃ/ខែ ឬវាយបញ្ចូល)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={
                      /^\d{2}\/\d{2}\/\d{4}$/.test(currentRecord.dueDate || '')
                        ? ddMmYyyyToIso(currentRecord.dueDate)
                        : selectedDate
                    }
                    onChange={(e) => {
                      const picked = e.target.value;
                      if (!picked) return;
                      upsertRecord(currentClass.id, (rec) => ({
                        ...rec,
                        dueDate: isoToDdMmYyyy(picked),
                      }));
                    }}
                    className="px-2 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold cursor-pointer shrink-0"
                    title="ជ្រើសរើសថ្ងៃ/ខែពីប្រតិទិន"
                  />
                  <input
                    type="text"
                    value={currentRecord.dueDate}
                    placeholder="ឧ. 09/11/2026 ឬ សប្តាហ៍ក្រោយ"
                    onChange={(e) =>
                      upsertRecord(currentClass.id, (rec) => ({
                        ...rec,
                        dueDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Quick Lists of Submitted vs Not Submitted Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              សិស្សបានប្រគល់កិច្ចការហើយ (ថ្នាក់ {currentClass?.name}):{' '}
              {formatNum(submittedStudents.length, state.useKhmerNumerals)} នាក់
            </span>
            <button
              type="button"
              onClick={() => handleMarkAllStudents('submitted')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>ប្រគល់ទាំងអស់</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {submittedStudents.map((stu, idx) => (
              <button
                key={stu.id}
                type="button"
                onClick={() => handleToggleStudentSubmission(stu.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-xs font-medium cursor-pointer"
              >
                <span className="font-bold">✓</span>
                <span>
                  {formatNum(idx + 1, state.useKhmerNumerals)}. {stu.name}
                </span>
                {stu.chineseName && <span>({stu.chineseName})</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              សិស្សមិនទាន់ប្រគល់កិច្ចការ (ថ្នាក់ {currentClass?.name}):{' '}
              {formatNum(missingStudents.length, state.useKhmerNumerals)} នាក់
            </span>
            <button
              type="button"
              onClick={() => handleMarkAllStudents('missing')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>កំណត់ឡើងវិញ</span>
            </button>
          </div>
          {missingStudents.length === 0 ? (
            <div className="py-4 text-center text-xs font-semibold">
              សិស្សទាំងអស់ក្នុងថ្នាក់ទី {currentClass?.name} បានប្រគល់កិច្ចការផ្ទះគ្រប់គ្នា!
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {missingStudents.map((stu, idx) => (
                <button
                  key={stu.id}
                  type="button"
                  onClick={() => handleToggleStudentSubmission(stu.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-xs font-semibold cursor-pointer"
                >
                  <span className="font-bold">✗</span>
                  <span>
                    {formatNum(idx + 1, state.useKhmerNumerals)}. {stu.name}
                  </span>
                  {stu.chineseName && <span>({stu.chineseName})</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Clean Structural Document View */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-8 space-y-4">
        <div className="space-y-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
            <div className="space-y-1 text-left">
              <p className="text-sm font-bold">{state.schoolInfo.departmentKh}</p>
              <p className="text-sm font-bold">{state.schoolInfo.schoolNameKh}</p>
            </div>
            <div className="text-center md:text-right space-y-1">
              <p className="text-sm font-bold">ព្រះរាជាណាចក្រកម្ពុជា</p>
              <p className="text-sm font-bold">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
            </div>
          </div>

          <div className="text-center my-3 space-y-1">
            <h1 className="text-base sm:text-lg font-bold">
              កំណត់ត្រាការដាក់កិច្ចការផ្ទះ និងកំណត់ត្រាមេរៀន ថ្នាក់ទី{currentClass?.name}
            </h1>
            <p className="text-xs sm:text-sm font-bold">
              ឆ្នាំសិក្សា {state.schoolInfo.academicYear} · កាលបរិច្ឆេទ៖ {selectedDate}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm border-y border-slate-300 py-2">
            <div>
              <strong>គ្រូមុខវិជ្ជា ៖ អ្នកគ្រូ {state.schoolInfo.teacherName}</strong> ·{' '}
              <span>មុខវិជ្ជា ៖ {state.schoolInfo.subjectNameKh}</span>
            </div>
            <div>
              <strong>កំណត់ត្រាមេរៀន៖ </strong>
              <span>{currentRecord?.lessonTitle}</span>
            </div>
            <div>
              <strong>ប្រធានបទកិច្ចការផ្ទះ៖ </strong>
              <span>{currentRecord?.homeworkTitle}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                filterMode === 'all' ? 'bg-white shadow-xs' : ''
              }`}
            >
              សិស្សទាំងអស់ ({formatNum(classStudents.length, state.useKhmerNumerals)})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('submitted')}
              className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                filterMode === 'submitted' ? 'bg-white shadow-xs' : ''
              }`}
            >
              បានប្រគល់ហើយ ({formatNum(submittedStudents.length, state.useKhmerNumerals)})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('missing')}
              className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                filterMode === 'missing' ? 'bg-white shadow-xs' : ''
              }`}
            >
              មិនទាន់ប្រគល់ ({formatNum(missingStudents.length, state.useKhmerNumerals)})
            </button>
          </div>

          <span className="text-xs font-bold">
            អ្នកគ្រូ {state.schoolInfo.teacherName}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-800 px-2 py-2 text-center w-12">ល.រ</th>
                <th className="border border-slate-800 px-3 py-2 text-left">គោត្តនាម-នាម</th>
                <th className="border border-slate-800 px-3 py-2 text-left">ឈ្មោះចិន (姓名)</th>
                <th className="border border-slate-800 px-2 py-2 text-center w-14">ភេទ</th>
                <th className="border border-slate-800 px-3 py-2 text-center w-44">
                  ស្ថានភាពប្រគល់កិច្ចការ
                </th>
                <th className="border border-slate-800 px-3 py-2 text-left">ផ្សេងៗ / កំណត់សម្គាល់</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((stu, idx) => {
                const isSubmitted =
                  (currentRecord?.submissions?.[stu.id] || 'missing') === 'submitted';
                const noteVal = currentRecord?.notes?.[stu.id] || '';
                return (
                  <tr key={stu.id}>
                    <td className="border border-slate-800 px-2 py-1.5 text-center font-semibold">
                      {formatNum(idx + 1, state.useKhmerNumerals)}
                    </td>
                    <td className="border border-slate-800 px-3 py-1.5 font-bold">
                      {stu.name}
                    </td>
                    <td className="border border-slate-800 px-3 py-1.5">
                      {stu.chineseName}
                    </td>
                    <td className="border border-slate-800 px-2 py-1.5 text-center">
                      {stu.gender === 'F' ? 'ស' : 'ប'}
                    </td>
                    <td className="border border-slate-800 px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStudentSubmission(stu.id)}
                        className="px-3 py-1 rounded border border-slate-300 text-xs font-bold cursor-pointer"
                      >
                        {isSubmitted ? '✓ បានប្រគល់កិច្ចការ' : '✗ មិនទាន់ប្រគល់'}
                      </button>
                    </td>
                    <td className="border border-slate-800 px-2 py-1">
                      <input
                        type="text"
                        value={noteVal}
                        onChange={(e) => handleStudentNoteChange(stu.id, e.target.value)}
                        placeholder="..."
                        className="w-full bg-transparent text-xs focus:outline-none px-1 py-0.5"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Editable & AI Signature Date Footer */}
        <SignatureDateEditor
          state={state}
          onUpdateState={onUpdateState}
          showPrincipalLeft={false}
        />
      </div>
    </div>
  );
};
