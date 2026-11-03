import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Check, FileUp, Languages, Loader2, Sparkles, Upload, X } from 'lucide-react';

export type AiTaskType =
  | 'curriculum'
  | 'weekly_log'
  | 'homework_duty'
  | 'lesson_plan'
  | 'attendance'
  | 'student_roster'
  | 'daily_homework'
  | 'signature_date'
  | 'teacher_reflection'
  | 'translate_zh_km';

interface Props {
  taskType: AiTaskType;
  titleKh?: string;
  title?: string;
  placeholderKh?: string;
  placeholder?: string;
  defaultPrompt?: string;
  contextData?: Record<string, unknown>;
  onResult?: (data: unknown, mode: 'replace' | 'append') => void;
  onApplyResult?: (data: unknown, mode: 'replace' | 'append') => void;
  allowAppend?: boolean;
}

export const AiGeneratorBar: React.FC<Props> = ({
  taskType,
  titleKh,
  title,
  placeholderKh,
  placeholder,
  defaultPrompt = '',
  contextData,
  onResult,
  onApplyResult,
  allowAppend = true,
}) => {
  const [promptText, setPromptText] = useState('');
  const [lessonNumberInput, setLessonNumberInput] = useState('');
  const [lessonTitleInput, setLessonTitleInput] = useState('');
  const [vocabInput, setVocabInput] = useState('');
  const [sentencesInput, setSentencesInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'replace' | 'append'>(allowAppend ? 'append' : 'replace');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isLessonTemplateTask =
    taskType === 'curriculum' ||
    taskType === 'weekly_log' ||
    taskType === 'lesson_plan' ||
    taskType === 'daily_homework';

  const displayTitle = titleKh || title || 'AI បង្កើតទិន្នន័យស្វ័យប្រវត្តិ';
  const displayPlaceholder =
    placeholderKh ||
    placeholder ||
    'វាយបញ្ចូលភាសាចិន (中文) ឬខ្មែរ ឬបង្ហោះឯកសារ PDF/រូបភាព ដើម្បីបកប្រែភាសាខ្មែរ និងបង្កើតតាមគំរូ...';

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const commaIdx = result.indexOf(',');
        resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const extractSpreadsheetOrText = async (file: File): Promise<string> => {
    const ext = file.name.toLowerCase();
    if (ext.endsWith('.xlsx') || ext.endsWith('.xls') || ext.endsWith('.csv')) {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const texts: string[] = [];
      wb.SheetNames.forEach((name) => {
        const csv = XLSX.utils.sheet_to_csv(wb.Sheets[name]);
        if (csv.trim()) {
          texts.push(`--- Sheet: ${name} ---\n${csv}`);
        }
      });
      return texts.join('\n\n');
    }
    return await file.text();
  };

  const applyTranslatedInputsToBoxes = (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const tr = (data as {
      translatedInputs?: {
        lessonNumber?: string;
        lessonTitle?: string;
        vocabulary?: string;
        sentences?: string;
        promptKh?: string;
      };
    }).translatedInputs;
    if (!tr) return;
    if (tr.lessonNumber && lessonNumberInput.trim()) {
      setLessonNumberInput(tr.lessonNumber);
    }
    if (tr.lessonTitle && lessonTitleInput.trim()) {
      setLessonTitleInput(tr.lessonTitle);
    }
    if (tr.vocabulary && vocabInput.trim()) {
      setVocabInput(tr.vocabulary);
    }
    if (tr.sentences && sentencesInput.trim()) {
      setSentencesInput(tr.sentences);
    }
  };

  const handleTranslateOnly = async () => {
    setIsTranslating(true);
    setStatusMsg(null);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'translate_zh_km',
          prompt: `Translate these Chinese educational inputs into bilingual Chinese + Cambodian Khmer (中文 · ភាសាខ្មែរ):\nLesson/Unit: ${lessonNumberInput}\nTitle: ${lessonTitleInput}\nVocabulary: ${vocabInput}\nSentences: ${sentencesInput}\nExtra: ${promptText}`,
          contextData: {
            lessonNumber: lessonNumberInput.trim() || undefined,
            lessonTitle: lessonTitleInput.trim() || undefined,
            vocabulary: vocabInput.trim() || undefined,
            sentences: sentencesInput.trim() || undefined,
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'ការបកប្រែភាសាខ្មែរបរាជ័យ');
      }
      applyTranslatedInputsToBoxes(payload.data);
      const tr = payload.data?.translatedInputs;
      if (tr?.promptKh && promptText.trim()) {
        setPromptText(tr.promptKh);
      }
      setStatusMsg({
        type: 'ok',
        text: 'បានបកប្រែភាសាចិនទៅជាភាសាខ្មែររួចរាល់! អ្នកអាចកែប្រែពាក្យខ្មែរក្នុងប្រអប់ដោយដៃ មុននឹងចុចបង្កើតតាមគំរូ។ (已翻译为高棉语，您可直接在框内手动修改)',
      });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'មានបញ្ហាក្នុងការបកប្រែ',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleApplyManualBoxesDirectly = () => {
    const unitStr = lessonNumberInput.trim() || '第一单元 · ជំពូកទី១';
    const titleStr = lessonTitleInput.trim() || '第一课 · មេរៀនទី១';
    const vocabStr = vocabInput.trim();
    const sentStr = sentencesInput.trim();
    const contentCombined = [
      vocabStr ? `1. 生词 ពាក្យថ្មី៖ ${vocabStr}` : '',
      sentStr ? `2. 句型 ទម្រង់ល្បះ៖ ${sentStr}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    let manualData: unknown = null;
    if (taskType === 'weekly_log') {
      const schedule = [
        { dateStr: '17/11/2025', weekdayKh: 'ចន្ទ', timeRange: '13:00-14:30', classId: '9A' },
        { dateStr: '17/11/2025', weekdayKh: 'ចន្ទ', timeRange: '15:00-16:30', classId: '9C' },
        { dateStr: '18/11/2025', weekdayKh: 'អង្គារ', timeRange: '13:00-14:30', classId: '8C' },
        { dateStr: '18/11/2025', weekdayKh: 'អង្គារ', timeRange: '15:00-16:30', classId: '8A' },
        { dateStr: '19/11/2025', weekdayKh: 'ពុធ', timeRange: '13:00-14:30', classId: '10A' },
        { dateStr: '19/11/2025', weekdayKh: 'ពុធ', timeRange: '15:00-16:30', classId: '10C' },
        { dateStr: '20/11/2025', weekdayKh: 'ព្រហស្បតិ៍', timeRange: '13:00-14:30', classId: '9B' },
        { dateStr: '20/11/2025', weekdayKh: 'ព្រហស្បតិ៍', timeRange: '15:00-16:30', classId: '8B' },
      ];
      manualData = {
        logs: schedule.map((slot) => ({
          ...slot,
          unitTitle: unitStr,
          lessonTitle: titleStr,
          contentDetails: contentCombined,
        })),
      };
    } else if (taskType === 'curriculum') {
      manualData = {
        items: [
          {
            monthNameKh: 'វិច្ឆិកា',
            weekNumber: '១',
            lessonContent: `${unitStr}\n${titleStr}\n1. 生词 ពាក្យថ្មី៖ ${vocabStr}`,
            pageNumber: 'សៀ.សិស្ស ១៣',
            hours: 1.5,
            note: '',
          },
          {
            monthNameKh: 'វិច្ឆិកា',
            weekNumber: '២',
            lessonContent: `${unitStr}\n${titleStr}\n2. 句型 ទម្រង់ល្បះ៖ ${sentStr}`,
            pageNumber: 'សៀ.សិស្ស ១៤',
            hours: 1.5,
            note: '',
          },
        ],
      };
    } else if (taskType === 'daily_homework') {
      manualData = {
        lessonUnitTitle: unitStr,
        lessonTitle: titleStr,
        lessonContentDetails: contentCombined,
        homeworkTitle: `${unitStr} · ${titleStr}`,
        homeworkDetail: `ហាត់សរសេរពាក្យថ្មី (${vocabStr}) មួយពាក្យ ៥ ជួរ និងអានប្រយោគ (${sentStr})។`,
        dueDate: 'សប្តាហ៍ក្រោយ',
      };
    } else if (taskType === 'lesson_plan') {
      manualData = {
        chapterTitle: unitStr,
        lessonTitle: titleStr,
        durationLabel: '៤ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
        pagesLabel: 'ទំព័រទី១៣ ដល់ ទំព័រទី១៧',
        textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册)',
        knowledgeObjective: `សិស្សយល់ដឹង និងចងចាំពាក្យថ្មី (${vocabStr}) និងទម្រង់ល្បះ (${sentStr}) ក្នុងមេរៀន ${titleStr}។`,
        skillObjective: `សិស្សចេះអាន បញ្ចេញសំឡេងភីនអ៊ីន សន្ទនា និងសរសេរអក្សរចិននៃមេរៀន ${titleStr} បានត្រឹមត្រូវ។`,
        attitudeObjective: 'សិស្សមានវិន័យល្អ យកចិត្តទុកដាក់ស្តាប់គ្រូ និងសហការគ្នាក្នុងការសន្ទនាភាសាចិន។',
        teachingMaterialsTeacher: 'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណអក្សររូបភាព',
        teachingMaterialsStudent: 'សៀវភៅគោលសម្រាប់សិស្ស សៀវភៅលំហាត់',
        sessions: [
          {
            sessionTitle: 'ម៉ោងសិក្សាទី១ (៩០នាទី) — ពាក្យថ្មី និងទម្រង់ល្បះ (生词与句型教学)',
            steps: [
              {
                stepTitle: 'ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)',
                teacherActivity: 'ត្រួតពិនិត្យអនាម័យ សណ្តាប់ធ្នាប់ និងវត្តមានសិស្ស',
                lessonContent: 'ពង្រឹងវិន័យ និងពិនិត្យវត្តមានសិស្ស',
                studentActivity: 'ប្រធានថ្នាក់រាយការណ៍វត្តមានសិស្ស',
              },
              {
                stepTitle: 'ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)',
                teacherActivity: 'សួរសំណួររំលឹកពាក្យថ្មី និងល្បះមេរៀនមុន',
                lessonContent: 'រំលឹកមេរៀនចាស់',
                studentActivity: 'សិស្សឆ្លើយសំណួរគ្រូ',
              },
              {
                stepTitle: 'ជំហានទី៣ មេរៀនប្រចាំថ្ងៃ (៥០នាទី)',
                teacherActivity: 'សរសេរចំណងជើងមេរៀន ពន្យល់ពាក្យថ្មី និងដឹកនាំសិស្សអានទម្រង់ល្បះជាភាសាចិន-ខ្មែរ',
                lessonContent: `${unitStr} · ${titleStr}\n${contentCombined}`,
                studentActivity: 'សិស្សអានតាមគ្រូ ចាប់គូសន្ទនា និងកត់ត្រាចូលសៀវភៅ',
              },
              {
                stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១៥នាទី)',
                teacherActivity: 'ហៅសិស្សឡើងអានពាក្យថ្មី និងបកប្រែប្រយោគជាភាសាខ្មែរ',
                lessonContent: contentCombined,
                studentActivity: 'សិស្សឡើងអាន និងបកប្រែប្រយោគ',
              },
              {
                stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (១០នាទី)',
                teacherActivity: 'ដាក់កិច្ចការផ្ទះ និងណែនាំឱ្យសិស្សស្វ័យសិក្សា',
                lessonContent: `កិច្ចការផ្ទះ (作业)៖ សរសេរពាក្យថ្មី (${vocabStr}) ៥ ជួរ។`,
                studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ',
              },
            ],
          },
        ],
      };
    }

    if (manualData) {
      if (onResult) onResult(manualData, mode);
      if (onApplyResult) onApplyResult(manualData, mode);
      setStatusMsg({
        type: 'ok',
        text: 'បានយកអត្ថបទដែលអ្នកកែប្រែដោយដៃទៅដាក់ក្នុងតារាងរួចរាល់! (已将您手动修改的中柬文直接填入下方表格)',
      });
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const structuredParts: string[] = [];
      if (lessonNumberInput.trim()) {
        structuredParts.push(`第几课 / 单元 (មេរៀនទី / ជំពូក): ${lessonNumberInput.trim()}`);
      }
      if (lessonTitleInput.trim()) {
        structuredParts.push(`题目 (ចំណងជើងមេរៀន): ${lessonTitleInput.trim()}`);
      }
      if (vocabInput.trim()) {
        structuredParts.push(`生词 (ពាក្យថ្មី): ${vocabInput.trim()}`);
      }
      if (sentencesInput.trim()) {
        structuredParts.push(`句子 / 句型 (ទម្រង់ល្បះ): ${sentencesInput.trim()}`);
      }

      const structuredBlock =
        structuredParts.length > 0
          ? `【用户输入的课程要素 / ធាតុចូលមេរៀនពីគ្រូបង្រៀន】\n${structuredParts.join('\n')}\n\n请将以上所有中文自动翻译成准确的高棉语（ភាសាខ្មែរ），并严格按照 វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង (谢辛万景岗中学, 教师 លឹម ដាណេ, 教材 快乐汉语 第二册 ភាសាចិនរីករាយ កំរិត២) 官方标准模版生成完整中柬双语内容。`
          : '';

      let combinedPrompt = [structuredBlock, promptText.trim()]
        .filter(Boolean)
        .join('\n\n');

      if (!combinedPrompt) {
        combinedPrompt =
          defaultPrompt ||
          `Generate structured Cambodian & Chinese educational data strictly matching the official school template for ${taskType}`;
      }

      let fileBase64: string | undefined;
      let fileMimeType: string | undefined;

      if (selectedFile) {
        const lower = selectedFile.name.toLowerCase();
        if (
          lower.endsWith('.xlsx') ||
          lower.endsWith('.xls') ||
          lower.endsWith('.csv') ||
          lower.endsWith('.txt') ||
          lower.endsWith('.json')
        ) {
          const extractedText = await extractSpreadsheetOrText(selectedFile);
          combinedPrompt += `\n\nឯកសារភ្ជាប់ (${selectedFile.name}):\n${extractedText.slice(0, 25000)}`;
        } else {
          fileBase64 = await fileToBase64(selectedFile);
          fileMimeType =
            selectedFile.type ||
            (lower.endsWith('.pdf') ? 'application/pdf' : 'image/png');
        }
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          prompt: combinedPrompt,
          fileBase64,
          fileMimeType,
          contextData: {
            ...(contextData || {}),
            lessonNumber: lessonNumberInput.trim() || undefined,
            lessonTitle: lessonTitleInput.trim() || undefined,
            vocabulary: vocabInput.trim() || undefined,
            sentences: sentencesInput.trim() || undefined,
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'ការបង្កើតដោយ AI បរាជ័យ (AI generation failed)');
      }

      // Auto-populate the 4 editable input boxes with the Chinese + Khmer translation so the user can see and tweak it
      applyTranslatedInputsToBoxes(payload.data);

      if (onResult) onResult(payload.data, mode);
      if (onApplyResult) onApplyResult(payload.data, mode);

      setStatusMsg({
        type: 'ok',
        text: 'បានបកប្រែភាសាខ្មែរ និងបង្កើតតាមគំរូស្តង់ដាររួចរាល់! កន្លែងណាបកប្រែខុស អ្នកអាចកែប្រែដោយដៃផ្ទាល់ក្នុងប្រអប់ ឬក្នុងតារាងខាងក្រោមបានភ្លាមៗ។ (已自动翻译高棉语并填入表格，所有高棉语均可直接手动修改)',
      });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'មានបញ្ហាក្នុងការហៅ AI',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3.5 space-y-2.5 no-print text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 font-semibold text-indigo-950">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{displayTitle}</span>
          <span className="text-[11px] font-normal text-indigo-700">
            (只需输入中文，AI 自动翻译高棉语并生成模版 · បញ្ចូលតែភាសាចិនក៏បាន AI នឹងបកប្រែជាភាសាខ្មែរស្វ័យប្រវត្តិ និងអាចកែប្រែដោយដៃបាន)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {isLessonTemplateTask && (
            <>
              <button
                type="button"
                disabled={isTranslating || isLoading}
                onClick={handleTranslateOnly}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-300 text-indigo-800 rounded font-semibold hover:bg-indigo-100 disabled:opacity-50 cursor-pointer text-[11px]"
                title="只将框内输入的中文翻译为高棉语，方便先检查或手动修改"
              >
                {isTranslating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Languages className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span>បកប្រែភាសាខ្មែរ (中文翻译高棉语)</span>
              </button>
              <button
                type="button"
                onClick={handleApplyManualBoxesDirectly}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 cursor-pointer text-[11px]"
                title="如果您手动修改了框内的高棉语翻译，点击此按钮直接同步到下方表格"
              >
                <Check className="w-3.5 h-3.5" />
                <span>យកការកែប្រែដាក់ក្នុងតារាង (手动修改同步到表格)</span>
              </button>
            </>
          )}

          {allowAppend && (
            <div className="flex items-center gap-1 bg-white border border-indigo-200 rounded p-0.5">
              <button
                type="button"
                onClick={() => setMode('append')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  mode === 'append'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                បន្ថែមពីលើ (追加)
              </button>
              <button
                type="button"
                onClick={() => setMode('replace')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  mode === 'replace'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ជំនួសថ្មី (替换)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Template Input Fields for Curriculum, Weekly Log, Lesson Plan & Daily Homework */}
      {isLessonTemplateTask && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-0.5">
          <div>
            <label className="block text-[11px] font-semibold text-indigo-950 mb-0.5">
              មេរៀនទីប៉ុន្មាន / ជំពូក (第几课/单元 - 输入中文自动译高棉语)៖
            </label>
            <input
              type="text"
              value={lessonNumberInput}
              onChange={(e) => setLessonNumberInput(e.target.value)}
              placeholder="ឧ. 第一单元 第三课"
              className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-indigo-950 mb-0.5">
              ចំណងជើងមេរៀន (什么题目 - 输入中文自动译高棉语)៖
            </label>
            <input
              type="text"
              value={lessonTitleInput}
              onChange={(e) => setLessonTitleInput(e.target.value)}
              placeholder="ឧ. 我的一天"
              className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-indigo-950 mb-0.5">
              ពាក្យថ្មី (生词 - 输入中文自动译高棉语)៖
            </label>
            <input
              type="text"
              value={vocabInput}
              onChange={(e) => setVocabInput(e.target.value)}
              placeholder="ឧ. 起床, 吃, 早饭, 去, 上学, 睡觉"
              className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-indigo-950 mb-0.5">
              ទម្រង់ល្បះ / ប្រយោគ (句子/句型 - 输入中文自动译高棉语)៖
            </label>
            <input
              type="text"
              value={sentencesInput}
              onChange={(e) => setSentencesInput(e.target.value)}
              placeholder="ឧ. 我六点起床。你几点去上学？"
              className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder={displayPlaceholder}
          className="flex-1 px-3 py-1.5 bg-white border border-indigo-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />

        {/* Hidden file input for PDF / Image / Spreadsheet upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*,.xlsx,.xls,.csv,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setSelectedFile(file);
          }}
        />

        {selectedFile ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-md text-xs font-medium shrink-0">
            <FileUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="max-w-[160px] truncate">{selectedFile.name}</span>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-emerald-700 hover:text-rose-600 ml-1 cursor-pointer"
              title="លុបឯកសារភ្ជាប់"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-300 text-indigo-800 rounded-md hover:bg-indigo-100 font-medium whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            បង្ហោះ PDF / រូបភាព (上传PDF)
          </button>
        )}

        <button
          type="button"
          disabled={isLoading}
          onClick={handleGenerate}
          className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60 font-medium whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              កំពុងបកប្រែភាសាខ្មែរ & បង្កើត...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              AI បង្កើតតាមគំរូ (自动译高棉语并生成)
            </>
          )}
        </button>
      </div>

      {statusMsg && (
        <div
          className={`text-[11px] font-medium px-2.5 py-1 rounded ${
            statusMsg.type === 'ok'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMsg.text}
        </div>
      )}
    </div>
  );
};

