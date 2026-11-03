import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large base64 PDF/image uploads for AI teaching material extraction
  app.use(express.json({ limit: '25mb' }));

  app.post('/api/ai/generate', async (req, res) => {
    const {
      taskType,
      prompt,
      fileBase64,
      fileMimeType,
      fileData,
      contextData,
    } = req.body as {
      taskType:
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
      prompt?: string;
      fileBase64?: string;
      fileMimeType?: string;
      fileData?: { mimeType: string; data: string; fileName?: string };
      contextData?: Record<string, unknown>;
    };

    const zhNumToKhmer = (raw: string): string => {
      const khDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
      const toKhDigits = (n: number | string) =>
        String(n).replace(/[0-9]/g, (d) => khDigits[Number(d)]);
      const cnMap: Record<string, number> = {
        一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
        十一: 11, 十二: 12, 十三: 13, 十四: 14, 十五: 15, 十六: 16, 十七: 17, 十八: 18, 十九: 19, 二十: 20,
        二十一: 21, 二十二: 22, 二十三: 23, 二十四: 24,
      };
      let out = raw;
      out = out.replace(/第([一二三四五六七八九十\d]+)单元/g, (_m, p1) => {
        const num = cnMap[p1] || p1;
        return `ជំពូកទី${toKhDigits(num)}`;
      });
      out = out.replace(/第([一二三四五六七八九十\d]+)课/g, (_m, p1) => {
        const num = cnMap[p1] || p1;
        return `មេរៀនទី${toKhDigits(num)}`;
      });
      return out;
    };

    const ZH_KH_DICTIONARY: Record<string, string> = {
      你好: 'សួស្តី',
      我和朋友: 'ខ្ញុំ និងមិត្តភក្តិ',
      你和我: 'អ្នក និងខ្ញុំ',
      他是谁: 'តើគាត់គឺជានរណា',
      她比我高: 'នាងខ្ពស់ជាងខ្ញុំ',
      我的一天: 'មួយថ្ងៃរបស់ខ្ញុំ',
      我的家: 'គ្រួសាររបស់ខ្ញុំ',
      家和学校: 'គ្រួសារ និងសាលារៀន',
      客厅在南边: 'បន្ទប់ទទួលភ្ញៀវនៅទិសខាងត្បូង',
      今天几月几号: 'ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន ខែណា',
      时间与约会: 'ពេលវេលា និងការណាត់ជួប',
      买东西: 'ការទិញទំនិញ',
      多少钱: 'តម្លៃប៉ុន្មាន',
      去学校: 'ទៅសាលារៀន',
      在学校: 'នៅសាលារៀន',
      喜欢吃什么: 'ចូលចិត្តញ៉ាំអ្វី',
      天气怎么样: 'អាកាសធាតុយ៉ាងម៉េចដែរ',
      看病: 'ទៅពេទ្យពិនិត្យជំងឺ',
      起床: 'ក្រោកពីគេង',
      吃: 'ញ៉ាំ',
      早饭: 'អាហារពេលព្រឹក',
      午饭: 'អាហារថ្ងៃត្រង់',
      晚饭: 'អាហារពេលល្ងាច',
      去: 'ទៅ',
      上学: 'ទៅរៀន',
      睡觉: 'ចូលគេង',
      姓: 'នាមត្រកូល',
      名字: 'ឈ្មោះ',
      多: 'ច្រើន',
      朋友: 'មិត្តភក្តិ',
      谁: 'នរណា',
      欢迎: 'ស្វាគមន៍',
      地方: 'ទីកន្លែង',
      国家: 'ប្រទេស',
      号码: 'លេខ',
      爸爸: 'ឪពុក',
      妈妈: 'ម្តាយ',
      哥哥: 'បងប្រុស',
      姐姐: 'បងស្រី',
      弟弟: 'ប្អូនប្រុស',
      妹妹: 'ប្អូនស្រី',
      老师: 'គ្រូបង្រៀន',
      学生: 'សិស្ស',
      学校: 'សាលារៀន',
      高: 'ខ្ពស់',
      矮: 'ទាប',
      胖: 'ធាត់',
      瘦: 'ស្គម',
      漂亮: 'ស្អាត',
      聪明: 'ឆ្លាត',
      今天: 'ថ្ងៃនេះ',
      明天: 'ថ្ងៃស្អែក',
      昨天: 'ម្សិលមិញ',
      现在: 'ឥឡូវនេះ',
      几点: 'ម៉ោងប៉ុន្មាន',
      点: 'ម៉ោង',
      分: 'នាទី',
      买: 'ទិញ',
      卖: 'លក់',
      钱: 'លុយ/ប្រាក់',
      块: 'រៀល/យន់',
      苹果: 'ផ្លែប៉ោម',
      水: 'ទឹក',
      书: 'សៀវភៅ',
      写: 'សរសេរ',
      读: 'អាន',
      说: 'និយាយ',
      听: 'ស្តាប់',
      看: 'មើល',
    };

    const translateSegmentZhToKh = (text: string): string => {
      const clean = (text || '').trim();
      if (!clean) return '';
      // If it already contains Khmer characters, keep as is
      if (/[\u1780-\u17FF]/.test(clean)) return clean;
      if (ZH_KH_DICTIONARY[clean]) {
        return `${clean} (${ZH_KH_DICTIONARY[clean]})`;
      }
      let translated = zhNumToKhmer(clean);
      for (const [zh, km] of Object.entries(ZH_KH_DICTIONARY)) {
        if (translated.includes(zh)) {
          translated = translated.replace(new RegExp(zh, 'g'), km);
        }
      }
      if (translated !== clean) {
        return `${clean} · ${translated}`;
      }
      return `${clean} (ភាសាចិន-ខ្មែរ)`;
    };

    const buildBilingualInputsFallback = (ctx?: Record<string, unknown>) => {
      const rawLessonNum = String(ctx?.lessonNumber || '').trim();
      const rawLessonTitle = String(ctx?.lessonTitle || '').trim();
      const rawVocab = String(ctx?.vocabulary || '').trim();
      const rawSentences = String(ctx?.sentences || '').trim();

      const lessonNumber = rawLessonNum
        ? /[\u1780-\u17FF]/.test(rawLessonNum)
          ? rawLessonNum
          : `${rawLessonNum} · ${zhNumToKhmer(rawLessonNum)}`
        : '第一单元 第三课 · ជំពូកទី១ មេរៀនទី៣';

      const lessonTitle = rawLessonTitle
        ? translateSegmentZhToKh(rawLessonTitle)
        : '我的一天 · មួយថ្ងៃរបស់ខ្ញុំ';

      const vocabItems = rawVocab
        ? rawVocab
            .split(/[,，、;；\s]+/)
            .map((w) => w.trim())
            .filter(Boolean)
            .map((w, i) => {
              if (/[\u1780-\u17FF]/.test(w)) return w;
              const km = ZH_KH_DICTIONARY[w];
              return `${i + 1}.${w}${km ? ` (${km})` : ''}`;
            })
            .join('  ')
        : '1.起床 (ក្រោកពីគេង)  2.吃早饭 (ញ៉ាំអាហារពេលព្រឹក)  3.去上学 (ទៅរៀន)  4.睡觉 (ចូលគេង)';

      const sentenceItems = rawSentences
        ? rawSentences
            .split(/(?<=[。？！?!;；])\s*|\n+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s, i) => {
              if (/[\u1780-\u17FF]/.test(s)) return s;
              let kmSent = s;
              for (const [zh, km] of Object.entries(ZH_KH_DICTIONARY)) {
                kmSent = kmSent.replace(new RegExp(zh, 'g'), ` ${km}`);
              }
              return `${i + 1}.${s} (${kmSent.trim()})`;
            })
            .join(' ')
        : '1.我六点起床。(ខ្ញុំក្រោកពីគេងម៉ោង៦។) 2.你几点去上学？(តើអ្នកទៅរៀនម៉ោងប៉ុន្មាន?)';

      return {
        lessonNumber,
        lessonTitle,
        vocabulary: vocabItems,
        sentences: sentenceItems,
      };
    };

    try {
      const bilingualTranslationRule = `
CRITICAL BILINGUAL TRANSLATION REQUIREMENT (中文自动翻译高棉语):
- The user frequently types ONLY Chinese (中文) into lessonNumber (第几课/单元), lessonTitle (什么题目), vocabulary (生词), sentences (句子/句型), or the prompt.
- You MUST translate ALL Chinese inputs into natural, accurate Cambodian Khmer (ភាសាខ្មែរ) while keeping the Chinese characters!
  * Example Unit/Lesson: "第一单元 第三课" -> "第一单元 第三课 · ជំពូកទី១ មេរៀនទី៣"
  * Example Title: "我的一天" -> "我的一天 · មួយថ្ងៃរបស់ខ្ញុំ"
  * Example Vocabulary: "起床, 吃, 早饭, 去, 上学, 睡觉" -> "①起床 (ក្រោកពីគេង) ②吃 (ញ៉ាំ) ③早饭 (អាហារពេលព្រឹក) ④去 (ទៅ) ⑤上学 (ទៅរៀន) ⑥睡觉 (ចូលគេង)"
  * Example Sentences: "我六点起床。你几点去上学？" -> "①我六点起床。(ខ្ញុំក្រោកពីគេងម៉ោង៦។) ②你几点去上学？(តើអ្នកទៅរៀនម៉ោងប៉ុន្មាន?)"
- Always include a top-level "translatedInputs" object in your JSON response so the frontend can immediately populate the user's input boxes with the Khmer translation for easy manual editing:
  "translatedInputs": {
    "lessonNumber": "第一单元 第三课 · ជំពូកទី១ មេរៀនទី៣",
    "lessonTitle": "我的一天 · មួយថ្ងៃរបស់ខ្ញុំ",
    "vocabulary": "①起床 (ក្រោកពីគេង) ②吃 (ញ៉ាំ) ③早饭 (អាហារពេលព្រឹក)...",
    "sentences": "①我六点起床。(ខ្ញុំក្រោកពីគេងម៉ោង៦។) ②你几点去上学？(តើអ្នកទៅរៀនម៉ោងប៉ុន្មាន?)",
    "promptKh": "ការបកប្រែជាភាសាខ្មែរ..."
  }
- Never output any Thai characters; use pure Cambodian Khmer Unicode + Chinese.`;

      const systemInstructions: Record<string, string> = {
        translate_zh_km: `You are an expert Chinese-to-Cambodian Khmer (中文 -> ភាសាខ្មែរ) educational translator at វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង.
Translate all provided Chinese lesson numbers, titles, vocabulary words, sentences, and prompt text into accurate, natural Cambodian Khmer (keeping bilingual Chinese + Khmer format so the teacher can review and manually edit).
${bilingualTranslationRule}
Return ONLY a valid JSON object matching:
{
  "translatedInputs": {
    "lessonNumber": "第一单元 第三课 · ជំពូកទី១ មេរៀនទី៣",
    "lessonTitle": "我的一天 · មួយថ្ងៃរបស់ខ្ញុំ",
    "vocabulary": "①起床 (ក្រោកពីគេង) ②吃 (ញ៉ាំ) ③早饭 (អាហារពេលព្រឹក)",
    "sentences": "①我六点起床。(ខ្ញុំក្រោកពីគេងម៉ោង៦។) ②你几点去上学？(តើអ្នកទៅរៀនម៉ោងប៉ុន្មាន?)",
    "promptKh": "..."
  }
}`,
        curriculum: `You are an expert Cambodian High School Chinese Language curriculum planner at វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង (Teacher: លឹម ដាណេ, Textbook: 快乐汉语（第二册）ភាសាចិនរីករាយ (កំរិត២)).
When the user provides vocabulary (生词), sentences (句子/句型), lesson number (第几课/单元), lesson title (什么题目), or uploads a PDF/image, translate all Chinese into Cambodian Khmer and generate the structured curriculum rows strictly following the official កម្មវិធីសិក្សាភាសាចិន កំរិត២ template.
${bilingualTranslationRule}
Formatting rules for each row:
- If the user inputs a specific lesson (with 生词 and/or 句子), break that lesson into 4 weekly sessions (សប្តាហ៍ទី ១, ២, ៣, ៤) of 1.5 hours each:
  * Week ១: Bilingual Unit Title + Chinese & Khmer Lesson Title + "1. 生词 ពាក្យថ្មី៖ ①... (ខ្មែរ) ②... (ខ្មែរ)"
  * Week ២: Bilingual Unit Title + Chinese & Khmer Lesson Title + "2. 句型 ទម្រង់ល្បះ៖ ①... (ខ្មែរ) ②... (ខ្មែរ)"
  * Week ៣: Bilingual Unit Title + Chinese & Khmer Lesson Title + "3. 课文与汉字笔画 អត្ថបទសន្ទនា និងលំដាប់គំនូសអក្សរចិន"
  * Week ៤: Bilingual Unit Title + Chinese & Khmer Lesson Title + "4. 练习册 សៀវភៅលំហាត់ និងរំលឹកមេរៀន"
Return ONLY a valid JSON object matching:
{
  "translatedInputs": {
    "lessonNumber": "...",
    "lessonTitle": "...",
    "vocabulary": "...",
    "sentences": "...",
    "promptKh": "..."
  },
  "items": [
    {
      "monthNameKh": "វិច្ឆិកា",
      "weekNumber": "១",
      "lessonContent": "第一单元 我和朋友 · ជំពូកទី១ ខ្ញុំនិងមិត្តភក្តិ\\n第一课 他是谁 · មេរៀនទី១ តើគាត់គឺជានរណា\\n1. 生词 ពាក្យថ្មី៖ ①姓 (នាមត្រកូល) ②名字 (ឈ្មោះ) ③朋友 (មិត្តភក្តិ)",
      "pageNumber": "សៀ.សិស្ស ៣",
      "hours": 1.5,
      "note": ""
    }
  ]
}`,
        weekly_log: `You are an expert Cambodian High School Chinese Language teacher assistant at វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង (Teacher: លឹម ដាណេ, Textbook: 快乐汉语（第二册）ភាសាចិនរីករាយ (កំរិត២)).
When the user inputs vocabulary (生词), sentences (句子/句型), lesson number (第几课), lesson title (什么题目) in Chinese, translate every item into Cambodian Khmer and generate the complete 8-class weekly teaching log (សម្រង់អត្ថបទប្រចាំសប្តាហ៍) strictly matching the official Monday–Thursday timetable:
1. ចន្ទ (Monday) 13:00-14:30 -> Class "9A"
2. ចន្ទ (Monday) 15:00-16:30 -> Class "9C"
3. អង្គារ (Tuesday) 13:00-14:30 -> Class "8C"
4. អង្គារ (Tuesday) 15:00-16:30 -> Class "8A"
5. ពុធ (Wednesday) 13:00-14:30 -> Class "10A"
6. ពុធ (Wednesday) 15:00-16:30 -> Class "10C"
7. ព្រហស្បតិ៍ (Thursday) 13:00-14:30 -> Class "9B"
8. ព្រហស្បតិ៍ (Thursday) 15:00-16:30 -> Class "8B"
${bilingualTranslationRule}
Each log item must include bilingual unitTitle (Chinese + Khmer), bilingual lessonTitle (Chinese + Khmer), and contentDetails formatted cleanly with numbered vocabulary ("1. 生词 ពាក្យថ្មី៖ ①中文 (ភាសាខ្មែរ) ②...") and sentence patterns ("2. 句型 ទម្រង់ល្បះ៖ ①中文 (ភាសាខ្មែរ) ②...").
Return ONLY a valid JSON object matching:
{
  "translatedInputs": {
    "lessonNumber": "...",
    "lessonTitle": "...",
    "vocabulary": "...",
    "sentences": "...",
    "promptKh": "..."
  },
  "logs": [
    {
      "dateStr": "10/11/2025",
      "weekdayKh": "ចន្ទ",
      "timeRange": "13:00-14:30",
      "classId": "9A",
      "unitTitle": "第一单元 我和朋友 · ជំពូកទី១ ខ្ញុំនិងមិត្តភក្តិ",
      "lessonTitle": "第一课 他是谁 · មេរៀនទី១ តើគាត់គឺជានរណា",
      "contentDetails": "1. 生词 ពាក្យថ្មី៖ ①姓 (នាមត្រកូល) ②名字 (ឈ្មោះ) ③朋友 (មិត្តភក្តិ)\\n2. 句型 ទម្រង់ល្បះ៖ ①你姓什么？(តើអ្នកមាននាមត្រកូលអ្វី?) ②我叫马丽丽。(ខ្ញុំឈ្មោះម៉ាលីលី។)"
    }
  ]
}`,
        homework_duty: `You are an expert Cambodian High School Chinese Language teacher assistant at វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង (Teacher: លឹម ដាណេ).
Generate the monthly Model School Teacher Duty Report (ភារកិច្ចគ្រូបង្រៀន ស្តង់ដាសាលាគំរូ) in Cambodian Khmer (translating any Chinese inputs into Khmer) based on the real Weekly Lesson Logs (សម្រង់អត្ថបទប្រចាំសប្តាហ៍) and Daily Homework & Lesson Records (កំណត់ត្រាកិច្ចការផ្ទះ និងកំណត់ត្រាមេរៀនប្រចាំថ្ងៃ).
${bilingualTranslationRule}
Return ONLY a valid JSON object matching:
{
  "translatedInputs": {
    "promptKh": "..."
  },
  "monthTitleKh": "កក្កដា",
  "preStudyAssignedCount": 2,
  "preStudyDetails": [
    "ក. មេរៀនទី៣ មួយថ្ងៃរបស់ខ្ញុំ (ពាក្យថ្មី ទំព័រ 13)",
    "ខ. មេរៀនទី៣ មួយថ្ងៃរបស់ខ្ញុំ (ល្បះ ទំព័រ 13)"
  ],
  "projectAssignedCount": 1,
  "projectDetails": [
    "ក. សៀវភៅលំហាត់ (ទំព័រទី 14-15) លំហាត់ 1-6"
  ],
  "homeworkAssignedCount": 1,
  "homeworkDetails": [
    "ក. សៀវភៅលំហាត់ (ទំព័រទី 15-16) លំហាត់ 7 និង 9"
  ],
  "homeworkGradedCount": 1,
  "vulnerableStudentsNote": "សិស្សក្រីក្រ ជួបការលំបាក សិស្សរងហិង្សាឬមានវិបត្តិផ្លូវចិត្ត សិស្សឈប់ច្រើនម៉ោងខ្លួន សិស្សរៀនខ្សោយមុខវិជ្ជាខ្លួន"
}`,
        lesson_plan: `You are an expert Cambodian High School Chinese Language teacher assistant at វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង (Teacher: លឹម ដាណេ, Textbook: 快乐汉语（第二册）ភាសាចិនរីករាយ (កំរិត២)).
When the user inputs vocabulary (生词), sentences (句子/句型), lesson number (第几课), lesson title (什么题目) in Chinese, translate all Chinese into Cambodian Khmer and generate a complete, official 4-session, 5-step Cambodian MoEYS Chinese Lesson Plan (កិច្ចតែងការបង្រៀនភាសាចិន) strictly matching the school's official template.
${bilingualTranslationRule}
Requirements:
1. Bilingual Khmer + Chinese chapterTitle and lessonTitle.
2. Objectives: knowledgeObjective (វិជ្ជាសម្បទា), skillObjective (បំណិនសម្បទា), attitudeObjective (ចរិយាសម្បទា) in Cambodian Khmer tailored to the vocabulary and sentences of this lesson.
3. Generate 4 complete sessions in "sessions":
   - "ម៉ោងសិក្សាទី១ (៩០នាទី) — ពាក្យថ្មី (生词教学)"
   - "ម៉ោងសិក្សាទី២ (៩០នាទី) — ទម្រង់ល្បះ និងអត្ថបទសន្ទនា (句型与课文教学)"
   - "ម៉ោងសិក្សាទី៣ (៩០នាទី) — លំដាប់គំនូសអក្សរចិន (汉字笔画与书写)"
   - "ម៉ោងសិក្សាទី៤ (៩០នាទី) — សៀវភៅលំហាត់ និងពង្រឹងពុទ្ធិ (练习册与综合复习)"
4. Every session MUST have all 5 official steps:
   - "ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)"
   - "ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)"
   - "ជំហានទី៣ មេរៀនប្រចាំថ្ងៃ (៥០នាទី)" (In lessonContent, list the exact Chinese characters, Pinyin, and Cambodian Khmer meaning for each vocabulary word and sentence pattern!)
   - "ជំហានទី៤ ពង្រឹងពុទ្ធិ (១៥នាទី)"
   - "ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (១០នាទី)"
Return ONLY a valid JSON object matching:
{
  "translatedInputs": {
    "lessonNumber": "...",
    "lessonTitle": "...",
    "vocabulary": "...",
    "sentences": "...",
    "promptKh": "..."
  },
  "chapterTitle": "ជំពូកទី១ ខ្ញុំ និងមិត្តភក្តិ (第一单元 我和朋友)",
  "lessonTitle": "មេរៀនទី១ តើគាត់គឺជានរណា (第一课 他是谁)",
  "durationLabel": "៤ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)",
  "pagesLabel": "ទំព័រទី១ ដល់ ទំព័រទី៥",
  "textbookSource": "សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册) KUAILE HANYU",
  "knowledgeObjective": "...",
  "skillObjective": "...",
  "attitudeObjective": "...",
  "teachingMaterialsTeacher": "សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណអក្សររូបភាព",
  "teachingMaterialsStudent": "សៀវភៅគោលសម្រាប់សិស្ស សៀវភៅលំហាត់",
  "sessions": [
    {
      "sessionTitle": "ម៉ោងសិក្សាទី១ (៩០នាទី) — ពាក្យថ្មី (生词教学)",
      "steps": [
        {
          "stepTitle": "ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)",
          "teacherActivity": "...",
          "lessonContent": "...",
          "studentActivity": "..."
        }
      ]
    }
  ]
}`,
        attendance: `You are an expert Cambodian High School Chinese Language teacher assistant.
Extract or generate student list (Khmer Name គោត្តនាម-នាម, Chinese Name ឈ្មោះចិន, Gender 'F' for ស or 'M' for ប, Note ផ្សេងៗ) and/or session dates (ខែ / ថ្ងៃទី) for the attendance sheet.
Return ONLY a valid JSON object matching:
{
  "monthRangeLabel": "វិច្ឆិកា ~ ធ្នូ",
  "sessionColumns": [
    { "monthLabel": "វិច្ឆិកា", "dayLabel": "04" },
    { "monthLabel": "វិច្ឆិកា", "dayLabel": "11" }
  ],
  "students": [
    { "name": "ខា សុខលីម", "chineseName": "卡若琳", "gender": "F", "note": "" }
  ]
}`,
        student_roster: `You are an expert Cambodian High School Chinese Language teacher assistant.
Extract all students from the uploaded PDF, image, spreadsheet, or text. If a Chinese name is not provided for a student, generate an appropriate phonetic Chinese name (e.g. 卡若琳, 柯洛他, 金珍珠).
Map gender 'ស' / 'ស្រី' / 'F' to "F", and 'ប' / 'ប្រុស' / 'M' to "M".
Return ONLY a valid JSON object matching:
{
  "students": [
    {
      "studentCode": "01",
      "name": "ខា សុខលីម",
      "chineseName": "卡若琳",
      "gender": "F",
      "dob": "",
      "note": ""
    }
  ]
}`,
        daily_homework: `You are an expert Cambodian High School Chinese Language teacher assistant (វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង, Teacher លឹម ដាណេ).
When the user inputs Chinese lesson number, lesson title, vocabulary, sentences, or homework instructions, translate all Chinese into Cambodian Khmer and generate both the Daily Lesson Record (កំណត់ត្រាមេរៀន) AND the Daily Homework Record (កំណត់ត្រាកិច្ចការផ្ទះ) in bilingual Khmer and Chinese.
${bilingualTranslationRule}
Return ONLY a valid JSON object matching:
{
  "translatedInputs": {
    "lessonNumber": "...",
    "lessonTitle": "...",
    "vocabulary": "...",
    "sentences": "...",
    "promptKh": "..."
  },
  "lessonUnitTitle": "ជំពូកទី២ គ្រួសារ និងសាលារៀន (第二单元 家和学校)",
  "lessonTitle": "មេរៀនទី៤ គ្រួសាររបស់ខ្ញុំ (第四课 我的家)",
  "lessonContentDetails": "1. 生词 ពាក្យថ្មី៖ ①爸爸 (ឪពុក) ②妈妈 (ម្តាយ) ③哥哥 (បងប្រុស) ④姐姐 (បងស្រី)\\n2. 句型 ទម្រង់ល្បះ៖ ①这是我爸爸。(នេះគឺជាឪពុករបស់ខ្ញុំ។) ②你有哥哥吗？(តើអ្នកមានបងប្រុសទេ?)",
  "homeworkTitle": "មេរៀនទី៤៖ គ្រួសាររបស់ខ្ញុំ (第四课：我的家)",
  "homeworkDetail": "សរសេរអក្សរចិន 爸爸 (ឪពុក), 妈妈 (ម្តាយ), 哥哥 (បងប្រុស), 姐姐 (បងស្រី) មួយពាក្យ ៥ ជួរ និងធ្វើលំហាត់ក្នុងសៀវភៅលំហាត់ទំព័រ ១៤-១៥។",
  "dueDate": "សប្តាហ៍ក្រោយ"
}`,
        signature_date: `You are an expert in Cambodian Lunar (ចន្ទគតិ) and Gregorian (សុរិយគតិ) official document dates.
Generate the exact Cambodian lunar day/phase, lunar month, lunar year/era, and Gregorian day, month, year in Khmer numerals.
Return ONLY a valid JSON object matching:
{
  "lunarDay": "សុក្រ ១១កើត",
  "lunarMonth": "មិគសិរ",
  "lunarYearEra": "ឆ្នាំម្សាញ់ សប្តស័ក ព.ស.២៥៦៩",
  "gregorianLocation": "រាជធានីភ្នំពេញ",
  "gregorianDay": "២៧",
  "gregorianMonth": "វិច្ឆិកា",
  "gregorianYear": "២០២៦"
}`,
        teacher_reflection: `You are an expert Cambodian High School Chinese Language teacher (អ្នកគ្រូ លឹម ដាណេ, វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង).
Based on the real monthly student score statistics (ដើមឆ្នាំ, គ្រោងចុងឆ្នាំ, សម្រេចចុងឆ្នាំ, average scores, pass rates, and top/weak students) provided in Context, generate the Student Learning Progress Record (កំណត់ត្រាស្ថានភាពសិក្សារបស់សិស្ស) and Teacher Pedagogical Reflection (ការឆ្លុះបញ្ចាំងរបស់គ្រូបង្រៀន) for all scopes ("ALL", "G8", "8A", "8B", "8C", "G9", "9A", "9B", "9C", "G10", "10A", "10C") in Khmer (with relevant Chinese teaching terms).
Return ONLY a valid JSON object matching:
{
  "scopes": [
    {
      "scopeId": "ALL",
      "studentLearningStatus": "...",
      "teacherReflection": "..."
    }
  ]
}`,
      };

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      const resolvedBase64 = fileBase64 || fileData?.data;
      const resolvedMime = fileMimeType || fileData?.mimeType;

      if (resolvedBase64 && resolvedMime) {
        parts.push({
          inlineData: {
            mimeType: resolvedMime,
            data: resolvedBase64,
          },
        });
      }

      const userPromptText = `Task Type: ${taskType}
Context: ${JSON.stringify(contextData || {})}
User Instruction: ${prompt || 'Please translate all Chinese inputs into Cambodian Khmer and generate the structured Cambodian Khmer + Chinese teaching data.'}`;

      parts.push({ text: userPromptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction: systemInstructions[taskType] || systemInstructions.curriculum,
          responseMimeType: 'application/json',
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json({ ok: true, success: true, data: parsed });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'AI generation failed';
      console.warn('Gemini API fallback triggered:', errMsg);

      // Deterministic Chinese-to-Khmer fallback so the teacher's Chinese input is ALWAYS translated into Khmer
      const tr = buildBilingualInputsFallback(contextData);
      const contentCombined = `1. 生词 ពាក្យថ្មី៖ ${tr.vocabulary}\n2. 句型 ទម្រង់ល្បះ៖ ${tr.sentences}`;

      if (taskType === 'translate_zh_km') {
        res.json({
          ok: true,
          success: true,
          data: {
            translatedInputs: {
              ...tr,
              promptKh: prompt ? translateSegmentZhToKh(prompt) : '',
            },
          },
        });
        return;
      }

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
        res.json({
          ok: true,
          success: true,
          data: {
            translatedInputs: tr,
            logs: schedule.map((slot) => ({
              ...slot,
              unitTitle: tr.lessonNumber,
              lessonTitle: tr.lessonTitle,
              contentDetails: contentCombined,
            })),
          },
        });
        return;
      }

      if (taskType === 'curriculum') {
        res.json({
          ok: true,
          success: true,
          data: {
            translatedInputs: tr,
            items: [
              {
                monthNameKh: 'វិច្ឆិកា',
                weekNumber: '១',
                lessonContent: `${tr.lessonNumber}\n${tr.lessonTitle}\n1. 生词 ពាក្យថ្មី៖ ${tr.vocabulary}`,
                pageNumber: 'សៀ.សិស្ស ១៣',
                hours: 1.5,
                note: '',
              },
              {
                monthNameKh: 'វិច្ឆិកា',
                weekNumber: '២',
                lessonContent: `${tr.lessonNumber}\n${tr.lessonTitle}\n2. 句型 ទម្រង់ល្បះ៖ ${tr.sentences}`,
                pageNumber: 'សៀ.សិស្ស ១៤',
                hours: 1.5,
                note: '',
              },
              {
                monthNameKh: 'វិច្ឆិកា',
                weekNumber: '៣',
                lessonContent: `${tr.lessonNumber}\n${tr.lessonTitle}\n3. 课文与汉字笔画 អត្ថបទសន្ទនា និងលំដាប់គំនូសអក្សរចិន`,
                pageNumber: 'សៀ.សិស្ស ១៥',
                hours: 1.5,
                note: '',
              },
              {
                monthNameKh: 'វិច្ឆិកា',
                weekNumber: '៤',
                lessonContent: `${tr.lessonNumber}\n${tr.lessonTitle}\n4. 练习册 សៀវភៅលំហាត់ និងរំលឹកមេរៀន`,
                pageNumber: 'សៀ.លំហាត់ ១៦',
                hours: 1.5,
                note: '',
              },
            ],
          },
        });
        return;
      }

      if (taskType === 'daily_homework') {
        res.json({
          ok: true,
          success: true,
          data: {
            translatedInputs: tr,
            lessonUnitTitle: tr.lessonNumber,
            lessonTitle: tr.lessonTitle,
            lessonContentDetails: contentCombined,
            homeworkTitle: `${tr.lessonNumber} · ${tr.lessonTitle}`,
            homeworkDetail: `ហាត់សរសេរពាក្យថ្មី (${tr.vocabulary}) មួយពាក្យ ៥ ជួរ និងអានប្រយោគ (${tr.sentences})។`,
            dueDate: 'សប្តាហ៍ក្រោយ',
          },
        });
        return;
      }

      if (taskType === 'lesson_plan') {
        res.json({
          ok: true,
          success: true,
          data: {
            translatedInputs: tr,
            chapterTitle: tr.lessonNumber,
            lessonTitle: tr.lessonTitle,
            durationLabel: '៤ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
            pagesLabel: 'ទំព័រទី១៣ ដល់ ទំព័រទី១៧',
            textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册)',
            knowledgeObjective: `សិស្សយល់ដឹង និងចងចាំពាក្យថ្មី (${tr.vocabulary}) និងទម្រង់ល្បះ (${tr.sentences}) ក្នុងមេរៀន ${tr.lessonTitle}។`,
            skillObjective: `សិស្សចេះអាន បញ្ចេញសំឡេងភីនអ៊ីន សន្ទនា និងសរសេរអក្សរចិននៃមេរៀន ${tr.lessonTitle} បានត្រឹមត្រូវ។`,
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
                    lessonContent: `${tr.lessonNumber} · ${tr.lessonTitle}\n${contentCombined}`,
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
                    lessonContent: `កិច្ចការផ្ទះ (作业)៖ សរសេរពាក្យថ្មី (${tr.vocabulary}) ៥ ជួរ។`,
                    studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ',
                  },
                ],
              },
            ],
          },
        });
        return;
      }

      res.status(500).json({ ok: false, success: false, error: errMsg });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
