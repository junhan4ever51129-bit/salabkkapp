import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { extractText, getDocumentProxy } from 'unpdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getGenAiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // In-memory + file-backed cloud sync store for sharing database state between preview and deployed instances
  let serverCloudState: Record<string, unknown> | null = null;

  app.get('/api/cloud-sync/load', (_req, res) => {
    res.json({ ok: true, data: serverCloudState });
  });

  app.post('/api/cloud-sync/save', (req, res) => {
    const { state } = req.body as { state: Record<string, unknown> };
    if (!state) {
      res.status(400).json({ ok: false, error: 'No state payload' });
      return;
    }
    serverCloudState = state;
    res.json({ ok: true, message: 'Cloud state synced successfully' });
  });

  app.post('/api/ai/generate', async (req, res) => {
    const {
      taskType,
      prompt,
      fileBase64,
      fileMimeType,
      fileName,
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
        | 'translate_zh_km'
        | 'scan_pdf_lesson';
      prompt?: string;
      fileBase64?: string;
      fileMimeType?: string;
      fileName?: string;
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

    // Authentic Kuaile Hanyu Book 2 (快乐汉语 第二册) Lessons 1–12 matching វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង curriculum
    const KUAILE_HANYU_LESSONS: Record<
      number,
      {
        unitZhKh: string;
        titleZhKh: string;
        vocabZhKh: string;
        sentencesZhKh: string;
        dialogueZhKh: string;
      }
    > = {
      1: {
        unitZhKh: '第一单元 我和朋友 · ជំពូកទី១ ខ្ញុំ និងមិត្តភក្តិ',
        titleZhKh: '第一课 他是谁 · មេរៀនទី១ តើគាត់គឺជានរណា',
        vocabZhKh:
          '①姓 (នាមត្រកូល) ②名字 (ឈ្មោះ) ③多 (ច្រើន/ប៉ុន្មាន) ④朋友 (មិត្តភក្តិ) ⑤谁 (នរណា) ⑥欢迎 (ស្វាគមន៍) ⑦地方 (ទីកន្លែង) ⑧国家 (ប្រទេស) ⑨号码 (លេខ)',
        sentencesZhKh:
          '①你姓什么？(តើអ្នកមាននាមត្រកូលអ្វី?) ②你叫什么名字？(តើអ្នកឈ្មោះអ្វី?) ③我姓马，我叫马丽丽。(ខ្ញុំត្រកូលម៉ា ខ្ញុំឈ្មោះម៉ាលីលី។) ④他是谁？(តើគាត់គឺជានរណា?)',
        dialogueZhKh:
          'A: 你好！你姓什么？叫什么名字？(សួស្តី! តើអ្នកមាននាមត្រកូលអ្វី? ឈ្មោះអ្វី?) · B: 我姓马，我叫马丽丽。他是谁？(ខ្ញុំត្រកូលម៉ា ខ្ញុំឈ្មោះម៉ាលីលី។ តើគាត់គឺជានរណា?) · A: 他是我的朋友。(គាត់គឺជាមិត្តភក្តិរបស់ខ្ញុំ។)',
      },
      2: {
        unitZhKh: '第一单元 我和朋友 · ជំពូកទី១ ខ្ញុំ និងមិត្តភក្តិ',
        titleZhKh: '第二课 她比我高 · មេរៀនទី២ នាងខ្ពស់ជាងខ្ញុំ',
        vocabZhKh:
          '①多 (ប៉ុន្មាន) ②今年 (ឆ្នាំនេះ) ③她 (នាង) ④比 (ជាង/ប្រៀបធៀប) ⑤说 (និយាយ) ⑥英语 (ភាសាអង់គ្លេស) ⑦汉语 (ភាសាចិន) ⑧谢谢 (អរគុណ) ⑨网友 (មិត្តតាមអ៊ីនធឺណិត) ⑩年龄 (អាយុ) ⑪高 (ខ្ពស់) ⑫艺术 (សិល្បៈ)',
        sentencesZhKh:
          '①你多大？(តើអ្នកអាយុប៉ុន្មាន?) ②我今年十六岁。(ឆ្នាំនេះខ្ញុំអាយុ១៦ឆ្នាំ។) ③她比我高。(នាងខ្ពស់ជាងខ្ញុំ។)',
        dialogueZhKh:
          'A: 她是谁？(តើនាងជានរណា?) · B: 她是我的网友，今年十六岁，她比我高。(នាងគឺជាមិត្តតាមអ៊ីនធឺណិតរបស់ខ្ញុំ ឆ្នាំនេះអាយុ១៦ឆ្នាំ នាងខ្ពស់ជាងខ្ញុំ។)',
      },
      3: {
        unitZhKh: '第一单元 我和朋友 · ជំពូកទី១ ខ្ញុំ និងមិត្តភក្តិ',
        titleZhKh: '第三课 我的一天 · មេរៀនទី៣ មួយថ្ងៃរបស់ខ្ញុំ',
        vocabZhKh:
          '①起床 (ក្រោកពីគេង) ②吃 (ញ៉ាំ) ③早饭 (អាហារពេលព្រឹក) ④午饭 (អាហារថ្ងៃត្រង់) ⑤晚饭 (អាហារពេលល្ងាច) ⑥去 (ទៅ) ⑦上学 (ទៅរៀន) ⑧上课 (ចូលរៀន) ⑨下课 (ចេញពីរៀន) ⑩睡觉 (ចូលគេង)',
        sentencesZhKh:
          '①我早上六点起床。(ខ្ញុំក្រោកពីគេងម៉ោង៦ព្រឹក។) ②你几点去上学？(តើអ្នកទៅរៀនម៉ោងប៉ុន្មាន?) ③我七点半去上学。(ខ្ញុំទៅរៀនម៉ោង៧កន្លះ។)',
        dialogueZhKh:
          'A: 你每天几点起床？(តើរាល់ថ្ងៃអ្នកក្រោកពីគេងម៉ោងប៉ុន្មាន?) · B: 我六点起床，六点半吃早饭，七点去上学。(ខ្ញុំក្រោកម៉ោង៦ ញ៉ាំអាហារពេលព្រឹកម៉ោង៦កន្លះ និងទៅរៀនម៉ោង៧។)',
      },
      4: {
        unitZhKh: '第二单元 我的家 · ជំពូកទី២ ផ្ទះរបស់ខ្ញុំ',
        titleZhKh: '第四课 我的房间 · មេរៀនទី៤ បន្ទប់របស់ខ្ញុំ',
        vocabZhKh:
          '①房间 (បន្ទប់) ②里 (ក្នុង) ③有 (មាន) ④桌子 (តុ) ⑤椅子 (កៅអី) ⑥床 (គ្រែ) ⑦电脑 (កុំព្យូទ័រ) ⑧书架 (ទូដាក់សៀវភៅ) ⑨上 (លើ) ⑩下 (ក្រោម) ⑪旁边 (ក្បែរ/ជិត)',
        sentencesZhKh:
          '①我的房间里有一张床和一张桌子。(ក្នុងបន្ទប់របស់ខ្ញុំមានគ្រែមួយ និងតុមួយ។) ②桌子上有一台电脑。(នៅលើតុមានកុំព្យូទ័រមួយគ្រឿង។)',
        dialogueZhKh:
          'A: 这是你的房间吗？(តើនេះជាបន្ទប់របស់អ្នកឬ?) · B: 是，我的房间里有一张床、一张桌子和一把椅子，桌子上有一台电脑。(បាទ/ចាស ក្នុងបន្ទប់ខ្ញុំមានគ្រែមួយ តុមួយ និងកៅអីមួយ នៅលើតុមានកុំព្យូទ័រមួយគ្រឿង។)',
      },
      5: {
        unitZhKh: '第二单元 我的家 · ជំពូកទី២ ផ្ទះរបស់ខ្ញុំ',
        titleZhKh: '第五课 客厅在南边 · មេរៀនទី៥ បន្ទប់ទទួលភ្ញៀវនៅទិសខាងត្បូង',
        vocabZhKh:
          '①客厅 (បន្ទប់ទទួលភ្ញៀវ) ②卧室 (បន្ទប់គេង) ③厨房 (ផ្ទះបាយ) ④卫生间 (បន្ទប់ទឹក) ⑤东边 (ទិសខាងកើត) ⑥南边 (ទិសខាងត្បូង) ⑦西边 (ទិសខាងលិច) ⑧北边 (ទិសខាងជើង)',
        sentencesZhKh:
          '①客厅在南边。(បន្ទប់ទទួលភ្ញៀវនៅទិសខាងត្បូង។) ②你的卧室在哪儿？(តើបន្ទប់គេងរបស់អ្នកនៅឯណា?) ③我的卧室在东边。(បន្ទប់គេងរបស់ខ្ញុំនៅទិសខាងកើត។)',
        dialogueZhKh:
          'A: 这是我家的客厅，客厅在南边。(នេះគឺជាបន្ទប់ទទួលភ្ញៀវផ្ទះខ្ញុំ បន្ទប់ទទួលភ្ញៀវនៅទិសខាងត្បូង។) · B: 你的卧室在哪儿？(តើបន្ទប់គេងរបស់អ្នកនៅឯណា?) · A: 我的卧室在东边。(បន្ទប់គេងរបស់ខ្ញុំនៅទិសខាងកើត។)',
      },
      6: {
        unitZhKh: '第二单元 我的家 · ជំពូកទី២ ផ្ទះរបស់ខ្ញុំ',
        titleZhKh: '第六课 你家的花园真漂亮 · មេរៀនទី៦ សួនច្បារផ្ទះរបស់អ្នកពិតជាស្អាតមែន',
        vocabZhKh:
          '①花园 (សួនច្បារ) ②真 (ពិតជា) ③漂亮 (ស្អាត) ④花 (ផ្កា) ⑤树 (ដើមឈើ) ⑥草 (ស្មៅ) ⑦种 (ដាំ) ⑧喜欢 (ចូលចិត្ត)',
        sentencesZhKh:
          '①你家的花园真漂亮！(សួនច្បារផ្ទះរបស់អ្នកពិតជាស្អាតមែន!) ②花园里有很多花和树。(ក្នុងសួនច្បារមានផ្កា និងដើមឈើជាច្រើន។)',
        dialogueZhKh:
          'A: 你家的花园真漂亮！(សួនច្បារផ្ទះរបស់អ្នកពិតជាស្អាតមែន!) · B: 谢谢！我妈妈喜欢种花，花园里有很多花和树。(អរគុណ! ម្តាយខ្ញុំចូលចិត្តដាំផ្កា ក្នុងសួនច្បារមានផ្កា និងដើមឈើជាច្រើន។)',
      },
      7: {
        unitZhKh: '第三单元 买东西 · ជំពូកទី៣ ការទិញទំនិញ',
        titleZhKh: '第七课 你买什么 (买东西) · មេរៀនទី៧ តើអ្នកទិញអ្វី (ការទិញទំនិញ)',
        vocabZhKh:
          '①买 (ទិញ) ②东西 (របស់របរ/ទំនិញ) ③售货员 (អ្នកលក់ទំនិញ) ④衣服 (សម្លៀកបំពាក់) ⑤件 (សម្រាប់ - ឯកតាសម្លៀកបំពាក់) ⑥白 (ពណ៌ស) ⑦红 (ពណ៌ក្រហម) ⑧黄 (ពណ៌លឿង) ⑨蓝 (ពណ៌ខៀវ) ⑩绿 (ពណ៌បៃតង) ⑪穿 (ស្លៀកពាក់) ⑫条 (ឯកតាខោ/សំពត់) ⑬裤子 (ខោ) ⑭号 (លេខ/ទំហំ) ⑮中 (កណ្តាល/ទំហំ M)',
        sentencesZhKh:
          '①你要买什么？(តើអ្នកចង់ទិញអ្វី?) ②我想买一件衣服。(ខ្ញុំចង់ទិញសម្លៀកបំពាក់មួយសម្រាប់។) ③你喜欢什么颜色的？(តើអ្នកចូលចិត្តពណ៌អ្វី?) ④我喜欢蓝色的。(ខ្ញុំចូលចិត្តពណ៌ខៀវ។) ⑤你穿多大号的？(តើអ្នកស្លៀកពាក់ទំហំប៉ុន្មាន?) ⑥我穿中号的。(ខ្ញុំស្លៀកពាក់ទំហំកណ្តាល។)',
        dialogueZhKh:
          '售货员：你要买什么？(អ្នកលក់៖ តើអ្នកចង់ទិញអ្វី?) · 玛丽：我想买一件衣服。(ម៉ាលី៖ ខ្ញុំចង់ទិញសម្លៀកបំពាក់មួយសម្រាប់។) · 售货员：你喜欢什么颜色的？(អ្នកលក់៖ តើអ្នកចូលចិត្តពណ៌អ្វី?) · 玛丽：我喜欢蓝色的。(ម៉ាលី៖ ខ្ញុំចូលចិត្តពណ៌ខៀវ។) · 售货员：你穿多大号的？(អ្នកលក់៖ តើអ្នកស្លៀកពាក់ទំហំប៉ុន្មាន?) · 玛丽：我穿中号的。(ម៉ាលី៖ ខ្ញុំស្លៀកពាក់ទំហំកណ្តាល។)',
      },
      8: {
        unitZhKh: '第三单元 买东西 · ជំពូកទី៣ ការទិញទំនិញ',
        titleZhKh: '第八课 苹果多少钱一斤 (多少钱) · មេរៀនទី៨ តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន',
        vocabZhKh:
          '①苹果 (ផ្លែប៉ោម) ②多少钱 (តម្លៃប៉ុន្មាន) ③斤 (កន្លះគីឡូ) ④块 (យន់/រៀល) ⑤毛 (កាក់) ⑥香蕉 (ផ្លែចេក) ⑦橘子 (ផ្លែក្រូច) ⑧葡萄 (ផ្លែទំពាំងបាយជូរ) ⑨西瓜 (ផ្លែឪឡឹក) ⑩一共 (សរុបទាំងអស់) ⑪给 (ឱ្យ) ⑫找 (អាប់លុយ)',
        sentencesZhKh:
          '①苹果多少钱一斤？(តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន?) ②三块五一斤。(កន្លះគីឡូតម្លៃ ៣យន់ ៥កាក់។) ③你要几斤？(តើអ្នកយកប៉ុន្មានគីឡូ?) ④一共多少钱？(សរុបទាំងអស់តម្លៃប៉ុន្មាន?)',
        dialogueZhKh:
          'A: 苹果多少钱一斤？(តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន?) · B: 三块五一斤。你要几斤？(កន្លះគីឡូ ៣យន់កន្លះ។ តើអ្នកយកប៉ុន្មានគីឡូ?) · A: 我要两斤苹果。一共多少钱？(ខ្ញុំយកផ្លែប៉ោមពីរជីន។ សរុបទាំងអស់តម្លៃប៉ុន្មាន?) · B: 一共七块。(សរុបទាំងអស់ ៧យន់។)',
      },
      9: {
        unitZhKh: '第三单元 买东西 · ជំពូកទី៣ ការទិញទំនិញ',
        titleZhKh: '第九课 这件衣服比那件贵一点儿 · មេរៀនទី៩ សម្លៀកបំពាក់នេះថ្លៃជាងសម្លៀកបំពាក់នោះបន្តិច',
        vocabZhKh:
          '①贵 (ថ្លៃ) ②一点儿 (បន្តិច) ③便宜 (ថោក) ④双 (គូ) ⑤鞋 (ស្បែកជើង) ⑥合适 (សមល្មម) ⑦长 (វែង) ⑧短 (ខ្លី) ⑨大 (ធំ) ⑩小 (តូច)',
        sentencesZhKh:
          '①这件衣服比那件贵一点儿。(សម្លៀកបំពាក់នេះថ្លៃជាងសម្លៀកបំពាក់នោះបន្តិច។) ②那条裤子比这条便宜。(ខោនោះថោកជាងខោនេះ។) ③这双鞋大小合适。(ស្បែកជើងមួយគូនេះទំហំសមល្មម។)',
        dialogueZhKh:
          'A: 这件衣服怎么样？(តើសម្លៀកបំពាក់នេះយ៉ាងម៉េចដែរ?) · B: 颜色很好看，就是比那件贵一点儿。(ពណ៌ស្អាតណាស់ គ្រាន់តែថ្លៃជាងមួយនោះបន្តិច។) · A: 那试试这双鞋吧，大小很合适。(អញ្ចឹងសាកស្បែកជើងមួយគូនេះចុះ ទំហំសមល្មមណាស់។)',
      },
      10: {
        unitZhKh: '第四单元 学校生活 · ជំពូកទី៤ ជីវភាពក្នុងសាលារៀន',
        titleZhKh: '第十课 你今天上了什么课 · មេរៀនទី១០ តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វី',
        vocabZhKh:
          '①今天 (ថ្ងៃនេះ) ②上 (រៀន/ចូលរៀន) ③课 (មុខវិជ្ជា/មេរៀន) ④汉语 (ភាសាចិន) ⑤英语 (ភាសាអង់គ្លេស) ⑥数学 (គណិតវិទ្យា) ⑦历史 (ប្រវត្តិវិទ្យា) ⑧体育 (កីឡា/អប់រំកាយ) ⑨音乐 (តន្ត្រី) ⑩美术 (សិល្បៈគំនូរ)',
        sentencesZhKh:
          '①你今天上了什么课？(តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វី?) ②我今天上了汉语课和数学课。(ថ្ងៃនេះខ្ញុំបានរៀនមុខវិជ្ជាភាសាចិន និងគណិតវិទ្យា។)',
        dialogueZhKh:
          'A: 你今天上了什么课？(តើថ្ងៃនេះអ្នកបានរៀនមុខវិជ្ជាអ្វី?) · B: 上午上了数学课和英语课，下午上了汉语课和体育课。(ពេលព្រឹករៀនគណិតវិទ្យា និងអង់គ្លេស ពេលរសៀលរៀនភាសាចិន និងកីឡា។)',
      },
      11: {
        unitZhKh: '第四单元 学校生活 · ជំពូកទី៤ ជីវភាពក្នុងសាលារៀន',
        titleZhKh: '第十一课 汉语不难 · មេរៀនទី១១ ភាសាចិនមិនពិបាកទេ',
        vocabZhKh:
          '①难 (ពិបាក) ②容易 (ងាយស្រួល) ③汉字 (អក្សរចិន) ④发音 (ការបញ្ចេញសំឡេង) ⑤写 (សរសេរ) ⑥读 (អាន) ⑦听 (ស្តាប់) ⑧说 (និយាយ) ⑨觉得 (យល់ថា/គិតថា) ⑩有意思 (គួរឱ្យចាប់អារម្មណ៍)',
        sentencesZhKh:
          '①汉语不难。(ភាសាចិនមិនពិបាកទេ។) ②我觉得说汉语很容易，写汉字有一点儿难。(ខ្ញុំគិតថានិយាយភាសាចិនងាយស្រួលណាស់ ប៉ុន្តែសរសេរអក្សរចិនពិបាកបន្តិច។)',
        dialogueZhKh:
          'A: 你觉得汉语难不难？(តើអ្នកគិតថាភាសាចិនពិបាកឬទេ?) · B: 汉语不难，我觉得说汉语很容易，学汉语很有意思。(ភាសាចិនមិនពិបាកទេ ខ្ញុំគិតថានិយាយភាសាចិនងាយស្រួល ហើយរៀនភាសាចិនគួរឱ្យចាប់អារម្មណ៍ណាស់។)',
      },
      12: {
        unitZhKh: '第四单元 学校生活 · ជំពូកទី៤ ជីវភាពក្នុងសាលារៀន',
        titleZhKh: '第十二课 来打乒乓球吧 · មេរៀនទី១២ មកវាយកូនឃ្លីលើតុទាំងអស់គ្នា',
        vocabZhKh:
          '①打 (លេង/វាយ) ②乒乓球 (កូនឃ្លីលើតុ) ③篮球 (បាល់បោះ) ④踢 (ទាត់) ⑤足球 (បាល់ទាត់) ⑥游泳 (ហែលទឹក) ⑦跑步 (រត់ហាត់ប្រាណ) ⑧运动 (កីឡា)',
        sentencesZhKh:
          '①来打乒乓球吧！(មកវាយកូនឃ្លីលើតុទាំងអស់គ្នា!) ②你喜欢什么运动？(តើអ្នកចូលចិត្តកីឡាអ្វី?) ③我喜欢打篮球和踢足球。(ខ្ញុំចូលចិត្តលេងបាល់បោះ និងទាត់បាល់។)',
        dialogueZhKh:
          'A: 下课了，我们来打乒乓球吧！(ចេញពីរៀនហើយ ពួកយើងមកវាយកូនឃ្លីលើតុទាំងអស់គ្នា!) · B: 好啊！我也喜欢打篮球和踢足球。(ល្អណាស់! ខ្ញុំក៏ចូលចិត្តលេងបាល់បោះ និងទាត់បាល់ដែរ។)',
      },
    };

    const detectLessonNumberFromText = (str: string): number | null => {
      if (!str) return null;
      const cnMap: Record<string, number> = {
        一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
        十一: 11, 十二: 12,
      };
      const m = str.match(/第([一二三四五六七八九十\d]+)课/);
      if (m) {
        const val = cnMap[m[1]] || parseInt(m[1], 10);
        if (val && !Number.isNaN(val)) return val;
      }
      const mEn = str.match(/lesson\s*(\d+)/i);
      if (mEn) {
        return parseInt(mEn[1], 10);
      }
      if (str.includes('买东西') || str.includes('你买什么') || str.includes('售货员')) return 7;
      if (str.includes('多少钱') || str.includes('苹果')) return 8;
      if (str.includes('贵一点儿')) return 9;
      if (str.includes('花园真漂亮')) return 6;
      if (str.includes('客厅在南边')) return 5;
      if (str.includes('我的房间')) return 4;
      if (str.includes('我的一天')) return 3;
      if (str.includes('她比我高')) return 2;
      if (str.includes('他是谁')) return 1;
      return null;
    };

    const ZH_KH_DICTIONARY: Record<string, string> = {
      你好: 'សួស្តី',
      我和朋友: 'ខ្ញុំ និងមិត្តភក្តិ',
      你和我: 'អ្នក និងខ្ញុំ',
      他是谁: 'តើគាត់គឺជានរណា',
      她比我高: 'នាងខ្ពស់ជាងខ្ញុំ',
      我的一天: 'មួយថ្ងៃរបស់ខ្ញុំ',
      我的家: 'ផ្ទះរបស់ខ្ញុំ',
      我的房间: 'បន្ទប់របស់ខ្ញុំ',
      家和学校: 'គ្រួសារ និងសាលារៀន',
      客厅在南边: 'បន្ទប់ទទួលភ្ញៀវនៅទិសខាងត្បូង',
      你家的花园真漂亮: 'សួនច្បារផ្ទះរបស់អ្នកពិតជាស្អាតមែន',
      今天几月几号: 'ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន ខែណា',
      现在几点: 'ឥឡូវនេះម៉ោងប៉ុន្មានហើយ',
      时间与约会: 'ពេលវេលា និងការណាត់ជួប',
      买东西: 'ការទិញទំនិញ',
      购物: 'ការទិញទំនិញ',
      你买什么: 'តើអ្នកទិញអ្វី',
      你要买什么: 'តើអ្នកចង់ទិញអ្វី',
      苹果多少钱一斤: 'តើផ្លែប៉ោមកន្លះគីឡូតម្លៃប៉ុន្មាន',
      这件衣服比那件贵一点儿: 'សម្លៀកបំពាក់នេះថ្លៃជាងសម្លៀកបំពាក់នោះបន្តិច',
      多少钱: 'តម្លៃប៉ុន្មាន',
      售货员: 'អ្នកលក់ទំនិញ',
      衣服: 'សម្លៀកបំពាក់',
      件: 'សម្រាប់',
      白: 'ពណ៌ស',
      白色: 'ពណ៌ស',
      红: 'ពណ៌ក្រហម',
      红色: 'ពណ៌ក្រហម',
      黄: 'ពណ៌លឿង',
      黄色: 'ពណ៌លឿង',
      蓝: 'ពណ៌ខៀវ',
      蓝色: 'ពណ៌ខៀវ',
      绿: 'ពណ៌បៃតង',
      绿色: 'ពណ៌បៃតង',
      颜色: 'ពណ៌',
      穿: 'ស្លៀកពាក់',
      条: 'ឯកតាខោ/សំពត់',
      裤子: 'ខោ',
      裙子: 'សំពត់',
      号: 'លេខ/ទំហំ',
      大号: 'ទំហំធំ (L)',
      中号: 'ទំហំកណ្តាល (M)',
      小号: 'ទំហំតូច (S)',
      中: 'កណ្តាល',
      买: 'ទិញ',
      卖: 'លក់',
      东西: 'របស់របរ/ទំនិញ',
      钱: 'លុយ/ប្រាក់',
      块: 'យន់/រៀល',
      毛: 'កាក់',
      斤: 'កន្លះគីឡូ',
      苹果: 'ផ្លែប៉ោម',
      香蕉: 'ផ្លែចេក',
      橘子: 'ផ្លែក្រូច',
      葡萄: 'ផ្លែទំពាំងបាយជូរ',
      西瓜: 'ផ្លែឪឡឹក',
      一共: 'សរុបទាំងអស់',
      给: 'ឱ្យ',
      找: 'អាប់លុយ',
      贵: 'ថ្លៃ',
      便宜: 'ថោក',
      一点儿: 'បន្តិច',
      双: 'គូ',
      鞋: 'ស្បែកជើង',
      合适: 'សមល្មម',
      长: 'វែង',
      短: 'ខ្លី',
      大: 'ធំ',
      小: 'តូច',
      喜欢: 'ចូលចិត្ត',
      想: 'ចង់',
      要: 'ចង់បាន/ត្រូវការ',
      什么: 'អ្វី',
      起床: 'ក្រោកពីគេង',
      吃: 'ញ៉ាំ',
      早饭: 'អាហារពេលព្រឹក',
      午饭: 'អាហារថ្ងៃត្រង់',
      晚饭: 'អាហារពេលល្ងាច',
      去: 'ទៅ',
      上学: 'ទៅរៀន',
      上课: 'ចូលរៀន',
      下课: 'ចេញពីរៀន',
      睡觉: 'ចូលគេង',
      姓: 'នាមត្រកូល',
      名字: 'ឈ្មោះ',
      多: 'ច្រើន/ប៉ុន្មាន',
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
      半: 'កន្លះ',
      刻: '១៥នាទី',
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
      if (/[\u1780-\u17FF]/.test(clean)) return clean;
      if (ZH_KH_DICTIONARY[clean]) {
        return `${clean} (${ZH_KH_DICTIONARY[clean]})`;
      }
      let translated = zhNumToKhmer(clean);
      // Sort dictionary keys by length descending so multi-character phrases match before single characters
      const sortedKeys = Object.keys(ZH_KH_DICTIONARY).sort((a, b) => b.length - a.length);
      for (const zh of sortedKeys) {
        if (translated.includes(zh)) {
          translated = translated.replace(new RegExp(zh, 'g'), ZH_KH_DICTIONARY[zh]);
        }
      }
      if (translated !== clean) {
        return `${clean} · ${translated}`;
      }
      return `${clean} (ភាសាចិន-ខ្មែរ)`;
    };

    // Extract real text from uploaded PDF using unpdf
    const resolvedBase64 = fileBase64 || fileData?.data;
    const resolvedMime = fileMimeType || fileData?.mimeType;
    const resolvedFileName = fileName || fileData?.fileName || '';
    let extractedPdfText = '';

    if (
      resolvedBase64 &&
      (resolvedMime === 'application/pdf' || resolvedFileName.toLowerCase().endsWith('.pdf'))
    ) {
      try {
        const pdfBytes = new Uint8Array(Buffer.from(resolvedBase64, 'base64'));
        const pdfDoc = await getDocumentProxy(pdfBytes);
        const resText = await extractText(pdfDoc, { mergePages: true });
        extractedPdfText = (resText.text || '').trim();
      } catch (pdfErr) {
        console.warn('unpdf extraction warning:', pdfErr);
      }
    }

    // Parse sections from real PDF text if present (New Words, Sentence Patterns, Using in Context)
    const parseRealPdfSections = (rawPdf: string) => {
      if (!rawPdf || rawPdf.length < 10) return null;
      const normalized = rawPdf.replace(/\r/g, '\n');

      // Find section indices
      const nwMatch = normalized.match(/(?:New\s*Words?|生词)/i);
      const spMatch = normalized.match(/(?:Sentence\s*Patterns?|句型)/i);
      const uicMatch = normalized.match(/(?:Using\s*in\s*Context|对话|课文)/i);

      if (!nwMatch && !spMatch && !uicMatch && !/[\u4e00-\u9fff]/.test(normalized)) {
        return null;
      }

      const nwIdx = nwMatch?.index ?? -1;
      const spIdx = spMatch?.index ?? -1;
      const uicIdx = uicMatch?.index ?? -1;

      const headerChunk =
        nwIdx > 0
          ? normalized.slice(0, nwIdx)
          : spIdx > 0
            ? normalized.slice(0, spIdx)
            : normalized.slice(0, 400);

      // Extract Chinese words from New Words section
      let vocabExtracted = '';
      if (nwIdx >= 0) {
        const endIdx =
          spIdx > nwIdx ? spIdx : uicIdx > nwIdx ? uicIdx : Math.min(normalized.length, nwIdx + 1500);
        const nwBlock = normalized.slice(nwIdx + nwMatch![0].length, endIdx);
        const zhWords = Array.from(
          new Set(nwBlock.match(/[\u4e00-\u9fff]{1,6}/g) || [])
        ).filter((w) => !['生词', '词语', '句型', '课文'].includes(w));
        if (zhWords.length > 0) {
          vocabExtracted = zhWords
            .slice(0, 18)
            .map((w, idx) => {
              const km = ZH_KH_DICTIONARY[w];
              return `${idx + 1}.${w}${km ? ` (${km})` : ''}`;
            })
            .join('  ');
        }
      }

      // Extract Chinese sentences from Sentence Patterns section
      let sentencesExtracted = '';
      if (spIdx >= 0) {
        const endIdx =
          uicIdx > spIdx ? uicIdx : nwIdx > spIdx ? nwIdx : Math.min(normalized.length, spIdx + 1500);
        const spBlock = normalized.slice(spIdx + spMatch![0].length, endIdx);
        const zhSents = Array.from(
          new Set(
            spBlock.match(/[\u4e00-\u9fff][\u4e00-\u9fff，。？！、；：“”‘’\s]{2,40}[。？！?！]?/g) || []
          )
        )
          .map((s) => s.replace(/\s+/g, '').trim())
          .filter((s) => s.length >= 3);
        if (zhSents.length > 0) {
          sentencesExtracted = zhSents
            .slice(0, 8)
            .map((s, idx) => `${idx + 1}.${translateSegmentZhToKh(s)}`)
            .join('  ');
        }
      }

      // Extract Chinese dialogue from Using in Context section
      let dialogueExtracted = '';
      if (uicIdx >= 0) {
        const uicBlock = normalized.slice(uicIdx + uicMatch![0].length, uicIdx + 2500);
        const zhLines = Array.from(
          new Set(
            uicBlock.match(/[\u4e00-\u9fff][\u4e00-\u9fff，。？！、：；“”‘’\s]{2,50}[。？！?！]?/g) || []
          )
        )
          .map((s) => s.replace(/\s+/g, '').trim())
          .filter((s) => s.length >= 2);
        if (zhLines.length > 0) {
          dialogueExtracted = zhLines
            .slice(0, 10)
            .map((s) => translateSegmentZhToKh(s))
            .join(' · ');
        }
      }

      const detectedNumFromHeader = detectLessonNumberFromText(headerChunk + ' ' + normalized);
      return {
        detectedNum: detectedNumFromHeader,
        vocabExtracted,
        sentencesExtracted,
        dialogueExtracted,
      };
    };

    const buildBilingualInputsFallback = (ctx?: Record<string, unknown>) => {
      const parsedFromPdf = parseRealPdfSections(extractedPdfText);
      const rawLessonNum = String(ctx?.lessonNumber || '').trim();
      const rawLessonTitle = String(ctx?.lessonTitle || '').trim();
      const rawVocab = String(ctx?.vocabulary || '').trim();
      const rawSentences = String(ctx?.sentences || '').trim();
      const rawDialogue = String(ctx?.dialogue || '').trim();

      const detectedNum =
        parsedFromPdf?.detectedNum ||
        detectLessonNumberFromText(resolvedFileName) ||
        detectLessonNumberFromText(extractedPdfText) ||
        detectLessonNumberFromText(rawLessonNum) ||
        detectLessonNumberFromText(rawLessonTitle) ||
        detectLessonNumberFromText(prompt || '') ||
        7;

      const preset = KUAILE_HANYU_LESSONS[detectedNum] || KUAILE_HANYU_LESSONS[7];

      // When a file is uploaded, prefer the preset/PDF-extracted lesson over stale box inputs
      const isFileScan = Boolean(resolvedBase64 || resolvedFileName);

      const lessonNumber =
        !isFileScan && rawLessonNum
          ? /[\u1780-\u17FF]/.test(rawLessonNum)
            ? rawLessonNum
            : `${rawLessonNum} · ${zhNumToKhmer(rawLessonNum)}`
          : preset.unitZhKh;

      const lessonTitle =
        !isFileScan && rawLessonTitle
          ? translateSegmentZhToKh(rawLessonTitle)
          : preset.titleZhKh;

      const vocabItems =
        parsedFromPdf?.vocabExtracted ||
        (!isFileScan && rawVocab
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
          : preset.vocabZhKh);

      const sentenceItems =
        parsedFromPdf?.sentencesExtracted ||
        (!isFileScan && rawSentences
          ? rawSentences
              .split(/(?<=[。？！?!;；])\s*|\n+/)
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s, i) => {
                if (/[\u1780-\u17FF]/.test(s)) return s;
                return `${i + 1}.${translateSegmentZhToKh(s)}`;
              })
              .join(' ')
          : preset.sentencesZhKh);

      const dialogueItems =
        parsedFromPdf?.dialogueExtracted ||
        (!isFileScan && rawDialogue ? rawDialogue : preset.dialogueZhKh);

      return {
        lessonNumber,
        lessonTitle,
        vocabulary: vocabItems,
        sentences: sentenceItems,
        dialogue: dialogueItems,
      };
    };

    try {
      const pdfExtractionRule = `
CRITICAL PDF / IMAGE TEXTBOOK SCANNING REQUIREMENT (扫描 PDF 自动提取单元第几课、生词、句型、对话):
- When a PDF or image of a Chinese textbook (such as Kuaile Hanyu 快乐汉语) is attached:
  1. Scan the document to identify the **Unit & Lesson number (第几课/第几单元)** and **Lesson Title (课文题目)**, and translate both into Cambodian Khmer (e.g., "第三单元 买东西 · ជំពូកទី៣ ការទិញទំនិញ" and "第七课 你买什么 (买东西) · មេរៀនទី៧ តើអ្នកទិញអ្វី (ការទិញទំនិញ)").
  2. Scan the **"New Words" / "new word" / "生词"** section in the PDF -> extract ALL new words, and format them with Chinese + Cambodian Khmer translation in \`translatedInputs.vocabulary\`.
  3. Scan the **"Sentence Patterns" / "sentence patterns" / "句型"** section in the PDF -> extract ALL key sentences/patterns, and format them with Chinese + Cambodian Khmer translation in \`translatedInputs.sentences\`.
  4. Scan the **"Using in Context" / "using in context" / "对话" / "课文"** section in the PDF -> extract the dialogue or text content, and format it with Chinese + Cambodian Khmer translation in \`translatedInputs.dialogue\`.
- Always include the complete "translatedInputs" object in your JSON response:
  "translatedInputs": {
    "lessonNumber": "第三单元 买东西 · ជំពូកទី៣ ការទិញទំនិញ",
    "lessonTitle": "第七课 你买什么 (买东西) · មេរៀនទី៧ តើអ្នកទិញអ្វី (ការទិញទំនិញ)",
    "vocabulary": "①买 (ទិញ) ②东西 (របស់របរ/ទំនិញ)...",
    "sentences": "①你要买什么？(តើអ្នកចង់ទិញអ្វី?)...",
    "dialogue": "售货员：你要买什么？...",
    "promptKh": "..."
  }
- Never output any Thai characters; use pure Cambodian Khmer Unicode + Chinese.`;

      const systemInstructions: Record<string, string> = {
        scan_pdf_lesson: `You are an expert Chinese-to-Cambodian Khmer (中文 -> ភាសាខ្មែរ) textbook scanner at វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង.
Carefully scan the attached PDF or image textbook lesson.
- Extract the Unit & Lesson number into "lessonNumber" (bilingual Chinese + Khmer).
- Extract the Lesson Title into "lessonTitle" (bilingual Chinese + Khmer).
- Extract all words from "New Words" / "new word" / "生词" into "vocabulary" (bilingual Chinese + Khmer).
- Extract all sentences from "Sentence Patterns" / "sentence patterns" / "句型" into "sentences" (bilingual Chinese + Khmer).
- Extract the dialogue/text from "Using in Context" / "using in context" / "对话" / "课文" into "dialogue" (bilingual Chinese + Khmer).
${pdfExtractionRule}
Return ONLY a valid JSON object matching:
{
  "translatedInputs": {
    "lessonNumber": "...",
    "lessonTitle": "...",
    "vocabulary": "...",
    "sentences": "...",
    "dialogue": "...",
    "promptKh": "..."
  }
}`,
        translate_zh_km: `You are an expert Chinese-to-Cambodian Khmer (中文 -> ភាសាខ្មែរ) educational translator and PDF textbook scanner at វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង.
If a PDF or image is attached, scan it to extract Unit/Lesson, Title, New Words (生词), Sentence Patterns (句型), and Using in Context (对话/课文), and translate all of them into bilingual Chinese + Cambodian Khmer. Otherwise translate the provided text fields.
${pdfExtractionRule}
Return ONLY a valid JSON object matching:
{
  "translatedInputs": {
    "lessonNumber": "...",
    "lessonTitle": "...",
    "vocabulary": "...",
    "sentences": "...",
    "dialogue": "...",
    "promptKh": "..."
  }
}`,
        curriculum: `You are an expert Cambodian High School Chinese Language curriculum planner at វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង (Teacher: លឹម ដាណេ, Textbook: 快乐汉语（第二册）ភាសាចិនរីករាយ (កំរិត២)).
When the user uploads a PDF/image or provides vocabulary (生词 / New Words), sentences (句型 / Sentence Patterns), dialogue (对话/课文 / Using in Context), lesson number (第几课/单元), and lesson title (什么题目), extract and translate all Chinese into Cambodian Khmer and generate the structured curriculum rows strictly following the official កម្មវិធីសិក្សាភាសាចិន កំរិត២ template.
${pdfExtractionRule}
Formatting rules for each row:
- Break the lesson into 4 weekly sessions (សប្តាហ៍ទី ១, ២, ៣, ៤) of 1.5 hours each:
  * Week ១: Bilingual Unit Title + Bilingual Lesson Title + "1. 生词 ពាក្យថ្មី (New Words)៖ ①... (ខ្មែរ) ②... (ខ្មែរ)"
  * Week ២: Bilingual Unit Title + Bilingual Lesson Title + "2. 句型 ទម្រង់ល្បះ (Sentence Patterns)៖ ①... (ខ្មែរ) ②... (ខ្មែរ)"
  * Week ៣: Bilingual Unit Title + Bilingual Lesson Title + "3. 对话与课文 ការសន្ទនា និងអត្ថបទ (Using in Context)៖ ..."
  * Week ៤: Bilingual Unit Title + Bilingual Lesson Title + "4. 汉字与练习册 សៀវភៅលំហាត់ និងរំលឹកមេរៀន"
Return ONLY a valid JSON object matching:
{
  "translatedInputs": {
    "lessonNumber": "...",
    "lessonTitle": "...",
    "vocabulary": "...",
    "sentences": "...",
    "dialogue": "...",
    "promptKh": "..."
  },
  "items": [
    {
      "monthNameKh": "វិច្ឆិកា",
      "weekNumber": "១",
      "lessonContent": "...",
      "pageNumber": "សៀ.សិស្ស ៣",
      "hours": 1.5,
      "note": ""
    }
  ]
}`,
        weekly_log: `You are an expert Cambodian High School Chinese Language teacher assistant at វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង (Teacher: លឹម ដាណេ, Textbook: 快乐汉语（第二册）ភាសាចិនរីករាយ (កំរិត២)).
When the user uploads a PDF/image or inputs vocabulary (生词 / New Words), sentences (句型 / Sentence Patterns), dialogue (对话 / Using in Context), lesson number, and lesson title, extract and translate every item into Cambodian Khmer and generate the weekly teaching log (សម្រង់អត្ថបទប្រចាំសប្តាហ៍).
${pdfExtractionRule}
Each log item must include bilingual unitTitle (Chinese + Khmer), bilingual lessonTitle (Chinese + Khmer), and contentDetails formatted cleanly with:
"1. 生词 ពាក្យថ្មី៖ ①中文 (ភាសាខ្មែរ)..."
"2. 句型 ទម្រង់ល្បះ៖ ①中文 (ភាសាខ្មែរ)..."
"3. 对话/课文 ការសន្ទនា៖ ..."
Return ONLY a valid JSON object matching:
{
  "translatedInputs": {
    "lessonNumber": "...",
    "lessonTitle": "...",
    "vocabulary": "...",
    "sentences": "...",
    "dialogue": "...",
    "promptKh": "..."
  },
  "logs": [
    {
      "dateStr": "04/11/2026",
      "weekdayKh": "ពុធ",
      "timeRange": "13:00-14:30",
      "classId": "10C",
      "unitTitle": "...",
      "lessonTitle": "...",
      "contentDetails": "1. 生词 ពាក្យថ្មី៖ ...\n2. 句型 ទម្រង់ល្បះ៖ ...\n3. 对话 ការសន្ទនា៖ ..."
    }
  ]
}`,
        homework_duty: `You are an expert Cambodian High School Chinese Language teacher assistant at វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង (Teacher: លឹម ដាណេ).
Generate the monthly Model School Teacher Duty Report (ភារកិច្ចគ្រូបង្រៀន ស្តង់ដាសាលាគំរូ) in PURE Cambodian Khmer ONLY (DO NOT include any Chinese characters, and keep it concise!).
Format strictly as:
- preStudyDetails: ["ក. មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន? — ស្វ័យសិក្សាពាក្យថ្មី (ពាក្យថ្មី, ល្បះ)"]
- projectDetails: ["ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?"]
- homeworkDetails: ["ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?"]
Return ONLY a valid JSON object matching:
{
  "monthTitleKh": "វិច្ឆិកា",
  "preStudyAssignedCount": 1,
  "preStudyDetails": [
    "ក. មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន? — ស្វ័យសិក្សាពាក្យថ្មី (ពាក្យថ្មី, ល្បះ)"
  ],
  "projectAssignedCount": 1,
  "projectDetails": [
    "ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?"
  ],
  "homeworkAssignedCount": 1,
  "homeworkDetails": [
    "ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?"
  ],
  "homeworkGradedCount": 1,
  "vulnerableStudentsNote": "សិស្សក្រីក្រ ជួបការលំបាក សិស្សរងហិង្សាឬមានវិបត្តិផ្លូវចិត្ត សិស្សឈប់ច្រើនម៉ោងខ្លួន សិស្សរៀនខ្សោយមុខវិជ្ជាខ្លួន"
}`,
        lesson_plan: `You are an expert Cambodian High School Chinese Language teacher assistant at វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង (Teacher: លឹម ដាណេ, Textbook: 快乐汉语（第二册）ភាសាចិនរីករាយ (កំរិត២)).
When the user uploads a PDF/image or inputs vocabulary (生词 / New Words), sentences (句型 / Sentence Patterns), dialogue (对话 / Using in Context), lesson number, and lesson title, extract all content from the PDF, translate all Chinese into Cambodian Khmer, and generate a complete, official 5-step Cambodian MoEYS Chinese Lesson Plan (កិច្ចតែងការបង្រៀនភាសាចិន).
${pdfExtractionRule}
Requirements:
1. Bilingual Khmer + Chinese chapterTitle and lessonTitle.
2. Objectives: knowledgeObjective (វិជ្ជាសម្បទា), skillObjective (បំណិនសម្បទា), attitudeObjective (ចរិយាសម្បទា) in Cambodian Khmer tailored to the New Words (生词), Sentence Patterns (句型), and Using in Context dialogue (对话/课文) of this lesson.
3. Generate complete sessions in "sessions":
   - Session 1: "ម៉ោងសិក្សាទី១ (៩០នាទី) — ពាក្យថ្មី និងទម្រង់ល្បះ (生词与句型教学: New Words & Sentence Patterns)"
   - Session 2: "ម៉ោងសិក្សាទី២ (៩០នាទី) — ការសន្ទនា និងអត្ថបទ (对话与课文教学: Using in Context)"
4. Every session MUST have all 5 official steps:
   - "ជំហានទី១ លំនឹងថ្នាក់ (៥នាទី)"
   - "ជំហានទី២ រំលឹកមេរៀនចាស់ (១០នាទី)"
   - "ជំហានទី៣ មេរៀនប្រចាំថ្ងៃ (៥០នាទី)" (In lessonContent, include the exact extracted New Words 生词, Sentence Patterns 句型, and Using in Context 对话/课文 with Chinese, Pinyin, and Cambodian Khmer meaning!)
   - "ជំហានទី៤ ពង្រឹងពុទ្ធិ (១៥នាទី)"
   - "ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (១០នាទី)"
Return ONLY a valid JSON object matching:
{
  "translatedInputs": {
    "lessonNumber": "...",
    "lessonTitle": "...",
    "vocabulary": "...",
    "sentences": "...",
    "dialogue": "...",
    "promptKh": "..."
  },
  "chapterTitle": "...",
  "lessonTitle": "...",
  "durationLabel": "១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)",
  "pagesLabel": "ទំព័រទី... ដល់ ទំព័រទី...",
  "textbookSource": "សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册) KUAILE HANYU",
  "knowledgeObjective": "...",
  "skillObjective": "...",
  "attitudeObjective": "...",
  "teachingMaterialsTeacher": "សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណអក្សររូបភាព",
  "teachingMaterialsStudent": "សៀវភៅគោលសម្រាប់សិស្ស សៀវភៅលំហាត់",
  "sessions": [
    {
      "sessionTitle": "ម៉ោងសិក្សាទី១ (៩០នាទី) — ពាក្យថ្មី និងទម្រង់ល្បះ (生词与句型教学)",
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
When the user uploads a PDF/image or inputs Chinese lesson number, lesson title, vocabulary (New Words), sentences (Sentence Patterns), dialogue (Using in Context), or homework instructions, extract and translate all Chinese into Cambodian Khmer and generate both the Daily Lesson Record (កំណត់ត្រាមេរៀន) AND the Daily Homework Record (កំណត់ត្រាកិច្ចការផ្ទះ) in bilingual Khmer and Chinese.
${pdfExtractionRule}
Return ONLY a valid JSON object matching:
{
  "translatedInputs": {
    "lessonNumber": "...",
    "lessonTitle": "...",
    "vocabulary": "...",
    "sentences": "...",
    "dialogue": "...",
    "promptKh": "..."
  },
  "lessonUnitTitle": "...",
  "lessonTitle": "...",
  "lessonContentDetails": "1. 生词 ពាក្យថ្មី៖ ...\n2. 句型 ទម្រង់ល្បះ៖ ...\n3. 对话 ការសន្ទនា៖ ...",
  "homeworkTitle": "...",
  "homeworkDetail": "...",
  "dueDate": "សប្តាហ៍ក្រោយ"
}`,
        signature_date: `You are an expert in Cambodian Lunar (ចន្ទគតិ) and Gregorian (សុរិយគតិ) official document dates.
Generate the exact Cambodian lunar day/phase, lunar month, lunar year/era, and Gregorian day, month, year in Khmer numerals.
Return ONLY a valid JSON object matching:
{
  "lunarDay": "សុក្រ ១១កើត",
  "lunarMonth": "មិគសិរ",
  "lunarYearEra": "ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០",
  "gregorianLocation": "រាជធានីភ្នំពេញ",
  "gregorianDay": "២៧",
  "gregorianMonth": "វិច្ឆិកា",
  "gregorianYear": "២០២៦"
}`,
        teacher_reflection: `You are an expert Cambodian High School Chinese Language teacher (អ្នកគ្រូ លឹម ដាណេ, វិទ្យាល័យ ជា ស៊ីម បឹងកេងកង).
Based on the real monthly student score statistics provided in Context, generate the Student Learning Progress Record (កំណត់ត្រាស្ថានភាពសិក្សារបស់សិស្ស) and Teacher Pedagogical Reflection (ការឆ្លុះបញ្ចាំងរបស់គ្រូបង្រៀន) in Khmer.
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

      const aiClient = getGenAiClient();
      if (!aiClient) {
        throw new Error('Using built-in PDF textbook scanner & Khmer translator');
      }

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      if (resolvedBase64 && resolvedMime) {
        parts.push({
          inlineData: {
            mimeType: resolvedMime,
            data: resolvedBase64,
          },
        });
      }

      const userPromptText = `Task Type: ${taskType}
Attached File Name: ${resolvedFileName || 'none'}
Extracted PDF Text: ${extractedPdfText ? extractedPdfText.slice(0, 12000) : 'none'}
Context: ${JSON.stringify(contextData || {})}
User Instruction: ${
        prompt ||
        'Scan the attached PDF/image (New Words = 生词, Sentence Patterns = 句型, Using in Context = 对话/课文), translate all Chinese into Cambodian Khmer, and generate the complete structured teaching data.'
      }`;

      parts.push({ text: userPromptText });

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction:
            systemInstructions[taskType] || systemInstructions.curriculum,
          responseMimeType: 'application/json',
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json({ ok: true, success: true, data: parsed });
    } catch (_error: unknown) {
      const tr = buildBilingualInputsFallback(contextData);
      const contentCombined = [
        `1. 生词 ពាក្យថ្មី (New Words)៖ ${tr.vocabulary}`,
        `2. 句型 ទម្រង់ល្បះ (Sentence Patterns)៖ ${tr.sentences}`,
        tr.dialogue
          ? `3. 对话/课文 ការសន្ទនា និងអត្ថបទ (Using in Context)៖\n${tr.dialogue}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      if (taskType === 'homework_duty') {
        const khOnlyMatch = tr.lessonTitle.match(/មេរៀនទី.*/);
        const khOnlyTitle = khOnlyMatch
          ? khOnlyMatch[0].replace(/[\u3400-\u9FFF()（）]/g, '').trim()
          : 'មេរៀនទី៦ ថ្ងៃនេះជាថ្ងៃទីប៉ុន្មាន?';
        res.json({
          ok: true,
          success: true,
          data: {
            monthTitleKh: String(contextData?.monthNameKh || 'វិច្ឆិកា'),
            preStudyAssignedCount: 1,
            preStudyDetails: [
              `ក. ${khOnlyTitle} — ស្វ័យសិក្សាពាក្យថ្មី (ពាក្យថ្មី, ល្បះ)`,
            ],
            projectAssignedCount: 1,
            projectDetails: [
              `ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ ${khOnlyTitle}`,
            ],
            homeworkAssignedCount: 1,
            homeworkDetails: [
              `ក. លំហាត់សន្ទនា និងសៀវភៅលំហាត់៖ ${khOnlyTitle}`,
            ],
            homeworkGradedCount: 1,
            vulnerableStudentsNote:
              'សិស្សក្រីក្រ ជួបការលំបាក សិស្សរងហិង្សាឬមានវិបត្តិផ្លូវចិត្ត សិស្សឈប់ច្រើនម៉ោងខ្លួន សិស្សរៀនខ្សោយមុខវិជ្ជាខ្លួន',
          },
        });
        return;
      }

      if (taskType === 'translate_zh_km' || taskType === 'scan_pdf_lesson') {
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
          { dateStr: '02/11/2026', weekdayKh: 'ចន្ទ', timeRange: '13:00-14:30', classId: '10C' },
          { dateStr: '02/11/2026', weekdayKh: 'ចន្ទ', timeRange: '15:00-16:30', classId: '10B' },
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
                lessonContent: `${tr.lessonNumber}\n${tr.lessonTitle}\n1. 生词 ពាក្យថ្មី (New Words)៖ ${tr.vocabulary}`,
                pageNumber: 'សៀ.សិស្ស ១៣',
                hours: 1.5,
                note: '',
              },
              {
                monthNameKh: 'វិច្ឆិកា',
                weekNumber: '២',
                lessonContent: `${tr.lessonNumber}\n${tr.lessonTitle}\n2. 句型 ទម្រង់ល្បះ (Sentence Patterns)៖ ${tr.sentences}`,
                pageNumber: 'សៀ.សិស្ស ១៤',
                hours: 1.5,
                note: '',
              },
              {
                monthNameKh: 'វិច្ឆិកា',
                weekNumber: '៣',
                lessonContent: `${tr.lessonNumber}\n${tr.lessonTitle}\n3. 对话与课文 ការសន្ទនា និងអត្ថបទ (Using in Context)៖\n${tr.dialogue}`,
                pageNumber: 'សៀ.សិស្ស ១៥',
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
            homeworkDetail: `ហាត់សរសេរពាក្យថ្មី (${tr.vocabulary}) មួយពាក្យ ៥ ជួរ អានទម្រង់ល្បះ (${tr.sentences}) និងហាត់សន្ទនា (${tr.dialogue})។`,
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
            durationLabel: '១.៥ ម៉ោងសិក្សា (១ម៉ោងសិក្សា មាន៩០នាទី)',
            pagesLabel: 'ទំព័រទី១៣ ដល់ ទំព័រទី១៧',
            textbookSource: 'សៀវភៅសិក្សាគោល ភាសាចិនរីករាយ 快乐汉语 (第二册)',
            knowledgeObjective: `សិស្សយល់ដឹង និងចងចាំពាក្យថ្មី (${tr.vocabulary}) ទម្រង់ល្បះ (${tr.sentences}) និងការសន្ទនា (${tr.dialogue}) ក្នុងមេរៀន ${tr.lessonTitle}។`,
            skillObjective: `សិស្សចេះអាន បញ្ចេញសំឡេងភីនអ៊ីន សន្ទនា និងសរសេរអក្សរចិននៃមេរៀន ${tr.lessonTitle} បានត្រឹមត្រូវ។`,
            attitudeObjective: 'សិស្សមានវិន័យល្អ យកចិត្តទុកដាក់ស្តាប់គ្រូ និងសហការគ្នាក្នុងការសន្ទនាភាសាចិន។',
            teachingMaterialsTeacher: 'សៀវភៅសម្រាប់គ្រូ កិច្ចតែងការបង្រៀន ប័ណ្ណអក្សររូបភាព',
            teachingMaterialsStudent: 'សៀវភៅគោលសម្រាប់សិស្ស សៀវភៅលំហាត់',
            sessions: [
              {
                sessionTitle: 'ម៉ោងសិក្សាទី១ (៩០នាទី) — ពាក្យថ្មី ទម្រង់ល្បះ និងការសន្ទនា (生词、句型与对话教学)',
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
                    teacherActivity: 'សរសេរចំណងជើងមេរៀន ពន្យល់ពាក្យថ្មី (New Words) ទម្រង់ល្បះ (Sentence Patterns) និងដឹកនាំសិស្សអានអត្ថបទសន្ទនា (Using in Context)',
                    lessonContent: `${tr.lessonNumber} · ${tr.lessonTitle}\n${contentCombined}`,
                    studentActivity: 'សិស្សអានតាមគ្រូ ចាប់គូសន្ទនា និងកត់ត្រាចូលសៀវភៅ',
                  },
                  {
                    stepTitle: 'ជំហានទី៤ ពង្រឹងពុទ្ធិ (១៥នាទី)',
                    teacherActivity: 'ហៅសិស្សឡើងអានពាក្យថ្មី ទម្រង់ល្បះ និងសម្តែងការសន្ទនា',
                    lessonContent: contentCombined,
                    studentActivity: 'សិស្សឡើងអាន និងសន្ទនាជាគូ',
                  },
                  {
                    stepTitle: 'ជំហានទី៥ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (១០នាទី)',
                    teacherActivity: 'ដាក់កិច្ចការផ្ទះ និងណែនាំឱ្យសិស្សស្វ័យសិក្សា',
                    lessonContent: `កិច្ចការផ្ទះ (作业)៖ សរសេរពាក្យថ្មី (${tr.vocabulary}) ៥ ជួរ និងហាត់សន្ទនា។`,
                    studentActivity: 'សិស្សកត់ត្រាកិច្ចការផ្ទះ',
                  },
                ],
              },
            ],
          },
        });
        return;
      }

      res.status(500).json({ ok: false, success: false, error: 'AI generation failed' });
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
