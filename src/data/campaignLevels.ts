export type CampaignDifficulty = 'normal' | 'medium' | 'hard' | 'extreme';

export interface CampaignLevel {
  id: string;
  tier: CampaignDifficulty;
  levelNumber: number;
  title: string;
  bengaliTitle: string;
  description: string;
  text: string;
  targetWpm: number;
  targetAccuracy: number;
  starThresholds: {
    oneStar: { wpm: number; accuracy: number };
    twoStar: { wpm: number; accuracy: number };
    threeStar: { wpm: number; accuracy: number };
  };
  bonusPoints: number;
}

export interface UserLevelProgress {
  levelId: string;
  completed: boolean;
  unlocked: boolean;
  stars: number;
  bestWpm: number;
  bestAccuracy: number;
  bestErrors?: number;
  zeroErrorClear?: boolean;
  attempts: number;
  completedAt?: string;
}

export const DIFFICULTY_CONFIG: Record<
  CampaignDifficulty,
  {
    name: string;
    bengaliName: string;
    description: string;
    color: string;
    borderColor: string;
    bgColor: string;
    badgeColor: string;
    icon: string;
  }
> = {
  normal: {
    name: 'Normal',
    bengaliName: 'নরমাল',
    description: 'সহজ শব্দ, হোম রো অনুশীলন এবং মৌলিক গতি গঠন।',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    bgColor: 'bg-emerald-500/10',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: 'ShieldCheck'
  },
  medium: {
    name: 'Medium',
    bengaliName: 'মিডিয়াম',
    description: 'বাস্তব বাক্য, বড় হাতের অক্ষর, মাঝারি শব্দ এবং সাধারণ যতিচিহ্ন।',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    bgColor: 'bg-amber-500/10',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: 'Flame'
  },
  hard: {
    name: 'Hard',
    bengaliName: 'হার্ড',
    description: 'জটিল সাহিত্যিক শব্দভাণ্ডার, সংখ্যা, সেমিকোলন এবং উচ্চ গতির চ্যালেঞ্জ।',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/40 hover:border-orange-400',
    bgColor: 'bg-orange-500/10',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    icon: 'Zap'
  },
  extreme: {
    name: 'Extreme Hard',
    bengaliName: 'এক্সট্রিম হার্ড',
    description: 'স্পেশাল সিম্বল, প্রোগ্রামিং সিনট্যাক্স, টাং টুইস্টার ও বিদ্যুৎগতির পরীক্ষা।',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    bgColor: 'bg-rose-500/10',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon: 'Skull'
  }
};

export const CAMPAIGN_LEVELS: CampaignLevel[] = [
  // ==========================================
  // NORMAL TIER (নরমাল) - 6 Levels
  // ==========================================
  {
    id: 'normal_1',
    tier: 'normal',
    levelNumber: 1,
    title: 'Home Row Foundations',
    bengaliTitle: 'লেভেল ১: হোম রো ভিত্তি',
    description: 'কীবোর্ডের হোম রো-এর সবচেয়ে মৌলিক অক্ষরগুলো আয়ত্ত করুন।',
    text: 'all sad fall flask glad half slash ask dad alas flash salad fall flag',
    targetWpm: 18,
    targetAccuracy: 85,
    starThresholds: {
      oneStar: { wpm: 18, accuracy: 85 },
      twoStar: { wpm: 24, accuracy: 90 },
      threeStar: { wpm: 30, accuracy: 95 }
    },
    bonusPoints: 100
  },
  {
    id: 'normal_2',
    tier: 'normal',
    levelNumber: 2,
    title: 'Common 3-Letter Words',
    bengaliTitle: 'লেভেল ২: ৩ অক্ষরের সহজ শব্দ',
    description: 'দৈনন্দিন ৩ অক্ষরের পরিচিত শব্দের ছন্দ তৈরি করুন।',
    text: 'the and for are but not you all any can had her was one our out day get has him his',
    targetWpm: 22,
    targetAccuracy: 88,
    starThresholds: {
      oneStar: { wpm: 22, accuracy: 88 },
      twoStar: { wpm: 28, accuracy: 92 },
      threeStar: { wpm: 34, accuracy: 96 }
    },
    bonusPoints: 150
  },
  {
    id: 'normal_3',
    tier: 'normal',
    levelNumber: 3,
    title: 'Everyday Rhythms',
    bengaliTitle: 'লেভেল ৩: প্রাত্যহিক ছন্দ',
    description: '৪ ও ৫ অক্ষরের বহুল ব্যবহৃত সাধারণ শব্দ টাইপ করুন।',
    text: 'time water sound place thing great small every world year right think good give new live come find work know',
    targetWpm: 25,
    targetAccuracy: 88,
    starThresholds: {
      oneStar: { wpm: 25, accuracy: 88 },
      twoStar: { wpm: 32, accuracy: 92 },
      threeStar: { wpm: 38, accuracy: 96 }
    },
    bonusPoints: 200
  },
  {
    id: 'normal_4',
    tier: 'normal',
    levelNumber: 4,
    title: 'Gentle Sentences',
    bengaliTitle: 'লেভেল ৪: সহজ ছোট বাক্য',
    description: 'ছোট ছোট পূর্ণাঙ্গ বাক্যে গতি ধরে রাখার অনুশীলন।',
    text: 'The sun will rise and bring new light to the quiet forest. Every quiet path leads to peace and calm thoughts.',
    targetWpm: 28,
    targetAccuracy: 90,
    starThresholds: {
      oneStar: { wpm: 28, accuracy: 90 },
      twoStar: { wpm: 35, accuracy: 93 },
      threeStar: { wpm: 42, accuracy: 97 }
    },
    bonusPoints: 250
  },
  {
    id: 'normal_5',
    tier: 'normal',
    levelNumber: 5,
    title: 'Steady Fingers & Balance',
    bengaliTitle: 'লেভেল ৫: অবিচল আঙুল ও ভারসাম্য',
    description: 'আঙুলের চাপ ও মসৃণ টাইপিং গতির সমন্বয়।',
    text: 'Keep your hands relaxed and steady on the keyboard. Calm breathing helps maintain focus and smooth rhythm.',
    targetWpm: 30,
    targetAccuracy: 90,
    starThresholds: {
      oneStar: { wpm: 30, accuracy: 90 },
      twoStar: { wpm: 38, accuracy: 94 },
      threeStar: { wpm: 45, accuracy: 97 }
    },
    bonusPoints: 300
  },
  {
    id: 'normal_6',
    tier: 'normal',
    levelNumber: 6,
    title: 'Normal Tier Apex',
    bengaliTitle: 'লেভেল ৬: নরমাল মোড বস ফাইট',
    description: 'নরমাল স্তরের চূড়ান্ত চ্যালেঞ্জ শেষ করে মিডিয়াম স্তরের দরজা খুলুন।',
    text: 'Consistent daily practice creates permanent muscle memory. You are now prepared to conquer the intermediate typing trials.',
    targetWpm: 34,
    targetAccuracy: 92,
    starThresholds: {
      oneStar: { wpm: 34, accuracy: 92 },
      twoStar: { wpm: 42, accuracy: 95 },
      threeStar: { wpm: 50, accuracy: 98 }
    },
    bonusPoints: 500
  },

  // ==========================================
  // MEDIUM TIER (মিডিয়াম) - 6 Levels
  // ==========================================
  {
    id: 'medium_1',
    tier: 'medium',
    levelNumber: 1,
    title: 'Capitals & World Cities',
    bengaliTitle: 'লেভেল ১: ক্যাপিটাল লেটার ও শহর',
    description: 'শিফ্‌ট (Shift) কী-র সাহায্যে বড় হাতের অক্ষরের নির্ভুল সমন্বয়।',
    text: 'London, Tokyo, New York, and Paris are vibrant cities known for rich culture, art, and diverse architecture.',
    targetWpm: 36,
    targetAccuracy: 90,
    starThresholds: {
      oneStar: { wpm: 36, accuracy: 90 },
      twoStar: { wpm: 44, accuracy: 94 },
      threeStar: { wpm: 52, accuracy: 97 }
    },
    bonusPoints: 400
  },
  {
    id: 'medium_2',
    tier: 'medium',
    levelNumber: 2,
    title: 'Conversational Dialogue',
    bengaliTitle: 'লেভেল ২: বাস্তব জীবনের কথোপকথন',
    description: 'প্রশ্নবোধক চিহ্ন ও কোলন সহ স্বতঃস্ফূর্ত বাক্য বিন্যাস।',
    text: 'Have you seen the recent milestone update? It seems very promising: everyone on the team contributed with passion!',
    targetWpm: 40,
    targetAccuracy: 92,
    starThresholds: {
      oneStar: { wpm: 40, accuracy: 92 },
      twoStar: { wpm: 48, accuracy: 95 },
      threeStar: { wpm: 56, accuracy: 98 }
    },
    bonusPoints: 450
  },
  {
    id: 'medium_3',
    tier: 'medium',
    levelNumber: 3,
    title: 'Atmospheric Storytelling',
    bengaliTitle: 'লেভেল ৩: আবহময় বর্ণনা ও দৃশ্য',
    description: 'দীর্ঘ বাক্য ও ছন্দোময় শব্দাবলির ধারাবাহিকতা।',
    text: 'The ancient wooden clock echoed through foggy midnight streets, signaling that another quiet journey had begun.',
    targetWpm: 44,
    targetAccuracy: 92,
    starThresholds: {
      oneStar: { wpm: 44, accuracy: 92 },
      twoStar: { wpm: 52, accuracy: 95 },
      threeStar: { wpm: 60, accuracy: 98 }
    },
    bonusPoints: 500
  },
  {
    id: 'medium_4',
    tier: 'medium',
    levelNumber: 4,
    title: 'Syllabic Precision',
    bengaliTitle: 'লেভেল ৪: জটিল সিলেবল ও গতি',
    description: 'বহু-সিলেবলের মধ্যম শব্দের নির্ভুল টাইপিং।',
    text: 'Extraordinary achievements require determination, flexibility, and sustained attention during demanding situations.',
    targetWpm: 48,
    targetAccuracy: 93,
    starThresholds: {
      oneStar: { wpm: 48, accuracy: 93 },
      twoStar: { wpm: 56, accuracy: 96 },
      threeStar: { wpm: 64, accuracy: 98 }
    },
    bonusPoints: 550
  },
  {
    id: 'medium_5',
    tier: 'medium',
    levelNumber: 5,
    title: 'Punctuation Harmony',
    bengaliTitle: 'লেভেল ৫: যতিচিহ্ন সমন্বয়',
    description: 'কমা, ড্যাশ এবং ইনভার্টেড কমার মিশ্রণ।',
    text: 'Patience, posture, and rhythm — these three disciplines transform a hesitant beginner into an effortless typist.',
    targetWpm: 52,
    targetAccuracy: 93,
    starThresholds: {
      oneStar: { wpm: 52, accuracy: 93 },
      twoStar: { wpm: 60, accuracy: 96 },
      threeStar: { wpm: 68, accuracy: 98 }
    },
    bonusPoints: 600
  },
  {
    id: 'medium_6',
    tier: 'medium',
    levelNumber: 6,
    title: 'Medium Tier Apex',
    bengaliTitle: 'লেভেল ৬: মিডিয়াম মোড বস ফাইট',
    description: 'মিডিয়াম স্তরের চূড়ান্ত ট্রায়াল জয় করে হার্ড স্তরে প্রবেশ করুন।',
    text: 'Success is not final, failure is not fatal: it is the courage to continue through adversity that truly defines a champion.',
    targetWpm: 55,
    targetAccuracy: 94,
    starThresholds: {
      oneStar: { wpm: 55, accuracy: 94 },
      twoStar: { wpm: 64, accuracy: 96 },
      threeStar: { wpm: 72, accuracy: 99 }
    },
    bonusPoints: 800
  },

  // ==========================================
  // HARD TIER (হার্ড) - 6 Levels
  // ==========================================
  {
    id: 'hard_1',
    tier: 'hard',
    levelNumber: 1,
    title: 'Historical Dates & Figures',
    bengaliTitle: 'লেভেল ১: সংখ্যা ও ঐতিহাসিক তারিখ',
    description: 'নাম্বার রো (Number Row) ও ক্যাপিটাল অক্ষরের দ্রুত রূপান্তর।',
    text: 'On July 20, 1969, Apollo 11 touched down on the Moon at 20:17 UTC with 2 brave astronauts aboard.',
    targetWpm: 56,
    targetAccuracy: 93,
    starThresholds: {
      oneStar: { wpm: 56, accuracy: 93 },
      twoStar: { wpm: 65, accuracy: 96 },
      threeStar: { wpm: 74, accuracy: 98 }
    },
    bonusPoints: 700
  },
  {
    id: 'hard_2',
    tier: 'hard',
    levelNumber: 2,
    title: 'Semicolons & Parentheses',
    bengaliTitle: 'লেভেল ২: সেমিকোলন ও বন্ধনী',
    description: 'জটিল যতিচিহ্ন ও বন্ধনীর ভেতরের তথ্যের দ্রুত টাইপ।',
    text: 'Theoretical knowledge provides direction; however, relentless daily execution (yielding over 95% accuracy) ensures mastery.',
    targetWpm: 60,
    targetAccuracy: 94,
    starThresholds: {
      oneStar: { wpm: 60, accuracy: 94 },
      twoStar: { wpm: 68, accuracy: 96 },
      threeStar: { wpm: 78, accuracy: 98 }
    },
    bonusPoints: 750
  },
  {
    id: 'hard_3',
    tier: 'hard',
    levelNumber: 3,
    title: 'Literary Depth & Quotations',
    bengaliTitle: 'লেভেল ৩: সাহিত্যিক গভীরতা ও উদ্ধৃতি',
    description: 'উদ্ধৃতি চিহ্ন ও চিন্তাশীল গভীর শব্দসমষ্টি।',
    text: '"The invariable mark of wisdom," wrote Ralph Waldo Emerson, "is to see the miraculous in the common things of life."',
    targetWpm: 63,
    targetAccuracy: 94,
    starThresholds: {
      oneStar: { wpm: 63, accuracy: 94 },
      twoStar: { wpm: 72, accuracy: 97 },
      threeStar: { wpm: 82, accuracy: 99 }
    },
    bonusPoints: 800
  },
  {
    id: 'hard_4',
    tier: 'hard',
    levelNumber: 4,
    title: 'Financial & Percentage Analytics',
    bengaliTitle: 'লেভেল ৪: আর্থিক ও গাণিতিক ডেটা',
    description: 'ডলার সাইন, শতাংশ ও জটিল অংকের মিশ্রণ।',
    text: 'Report 14-B indicates net profit surged by 28.7% in Q3, reaching $1,845,900 and exceeding all forecast metrics by 12.4%.',
    targetWpm: 66,
    targetAccuracy: 95,
    starThresholds: {
      oneStar: { wpm: 66, accuracy: 95 },
      twoStar: { wpm: 75, accuracy: 97 },
      threeStar: { wpm: 85, accuracy: 99 }
    },
    bonusPoints: 850
  },
  {
    id: 'hard_5',
    tier: 'hard',
    levelNumber: 5,
    title: 'Technical Dexterity',
    bengaliTitle: 'লেভেল ৫: প্রযুক্তিগত পরিভাষা',
    description: 'কম্পিউটার বিজ্ঞান ও প্রকৌশল শব্দভাণ্ডার।',
    text: 'Asynchronous distributed protocols require fault-tolerant consensus mechanisms; sub-millisecond network latency is paramount!',
    targetWpm: 68,
    targetAccuracy: 95,
    starThresholds: {
      oneStar: { wpm: 68, accuracy: 95 },
      twoStar: { wpm: 78, accuracy: 97 },
      threeStar: { wpm: 88, accuracy: 99 }
    },
    bonusPoints: 900
  },
  {
    id: 'hard_6',
    tier: 'hard',
    levelNumber: 6,
    title: 'Hard Tier Apex',
    bengaliTitle: 'লেভেল ৬: হার্ড মোড বস ফাইট',
    description: 'হার্ড স্তরের চূড়ান্ত অগ্নিপরীক্ষা অতিক্রম করে এক্সট্রিম স্তরে উত্তীর্ণ হোন।',
    text: '"Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away." — Antoine de Saint-Exupéry',
    targetWpm: 72,
    targetAccuracy: 95,
    starThresholds: {
      oneStar: { wpm: 72, accuracy: 95 },
      twoStar: { wpm: 82, accuracy: 97 },
      threeStar: { wpm: 92, accuracy: 99 }
    },
    bonusPoints: 1200
  },

  // ==========================================
  // EXTREME HARD TIER (এক্সট্রিম হার্ড) - 6 Levels
  // ==========================================
  {
    id: 'extreme_1',
    tier: 'extreme',
    levelNumber: 1,
    title: 'JSON Syntax & Objects',
    bengaliTitle: 'লেভেল ১: কোড সিনট্যাক্স ও ব্র্যাকেট',
    description: 'কার্লি ব্র্যাকেট, কোলন ও কোড স্ট্রাকচার ড্রিল।',
    text: 'const userProfile = { id: 9042, active: true, scores: [98.4, 102.1, 114.7], tag: "#master", token: "0x7F9B" };',
    targetWpm: 70,
    targetAccuracy: 95,
    starThresholds: {
      oneStar: { wpm: 70, accuracy: 95 },
      twoStar: { wpm: 80, accuracy: 97 },
      threeStar: { wpm: 90, accuracy: 99 }
    },
    bonusPoints: 1200
  },
  {
    id: 'extreme_2',
    tier: 'extreme',
    levelNumber: 2,
    title: 'Asynchronous TypeScript',
    bengaliTitle: 'লেভেল ২: টাইপস্ক্রিপ্ট ফাংশন ড্রিল',
    description: 'জেনেরিক টাইপ, অ্যারো অপারেটর ও প্যারামিটার।',
    text: 'async function verifyToken<T>(key: string, secret: T): Promise<boolean> { return await auth.verify(key, { timeout: 3000 }); }',
    targetWpm: 74,
    targetAccuracy: 95,
    starThresholds: {
      oneStar: { wpm: 74, accuracy: 95 },
      twoStar: { wpm: 84, accuracy: 97 },
      threeStar: { wpm: 94, accuracy: 99 }
    },
    bonusPoints: 1300
  },
  {
    id: 'extreme_3',
    tier: 'extreme',
    levelNumber: 3,
    title: 'Twister Tongue Rapids',
    bengaliTitle: 'লেভেল ৩: টাং টুইস্টার স্প্রিন্ট',
    description: 'একই ধরনের অক্ষরের দ্রুত পুনরাবৃত্তি ও কড়া টেস্ট।',
    text: 'The sixth sick sheikh\'s sixth sheep\'s sick. How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
    targetWpm: 78,
    targetAccuracy: 96,
    starThresholds: {
      oneStar: { wpm: 78, accuracy: 96 },
      twoStar: { wpm: 88, accuracy: 98 },
      threeStar: { wpm: 98, accuracy: 99 }
    },
    bonusPoints: 1400
  },
  {
    id: 'extreme_4',
    tier: 'extreme',
    levelNumber: 4,
    title: 'Regex & Symbol Storm',
    bengaliTitle: 'লেভেল ৪: রেজেক্স ও স্পেশাল সিম্বল',
    description: 'ক্যারট, ব্যাকস্ল্যাশ, ডলার এবং বন্ধনীর ঝড়।',
    text: '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$/.test("pro.typist@keypulse.io") === true && status === 200;',
    targetWpm: 80,
    targetAccuracy: 96,
    starThresholds: {
      oneStar: { wpm: 80, accuracy: 96 },
      twoStar: { wpm: 90, accuracy: 98 },
      threeStar: { wpm: 100, accuracy: 99 }
    },
    bonusPoints: 1500
  },
  {
    id: 'extreme_5',
    tier: 'extreme',
    levelNumber: 5,
    title: 'Dense Scientific Biology',
    bengaliTitle: 'লেভেল ৫: দীর্ঘ বিজ্ঞান ও পরিভাষা',
    description: 'উচ্চ মাত্রার জটিল বৈজ্ঞানিক জটিল শব্দাবলী।',
    text: 'Deoxyribonucleic acid polymerases synthesize polydeoxyribonucleotides through phosphodiester bonds at an equilibrium of 37.5°C.',
    targetWpm: 84,
    targetAccuracy: 96,
    starThresholds: {
      oneStar: { wpm: 84, accuracy: 96 },
      twoStar: { wpm: 94, accuracy: 98 },
      threeStar: { wpm: 105, accuracy: 99 }
    },
    bonusPoints: 1800
  },
  {
    id: 'extreme_6',
    tier: 'extreme',
    levelNumber: 6,
    title: 'Grandmaster Apex Apex',
    bengaliTitle: 'লেভেল ৬: গড-টিয়ার গ্র্যান্ডমাস্টার বস',
    description: 'সমস্ত স্তরের সর্বোচ্চ শীর্ষবিন্দু: ১০০+ ডব্লিউপিএম কিংবদন্তি টাইপিস্টদের জন্য।',
    text: 'while (cycle++ < MAX_ITERATIONS) { if (telemetry.wpm >= 100.0 && telemetry.accuracy >= 97.5) { return "KEYPULSE_IMMORTAL"; } } // APEX VICTORY!',
    targetWpm: 88,
    targetAccuracy: 97,
    starThresholds: {
      oneStar: { wpm: 88, accuracy: 97 },
      twoStar: { wpm: 98, accuracy: 98 },
      threeStar: { wpm: 110, accuracy: 99 }
    },
    bonusPoints: 3000
  }
];

export const CAMPAIGN_STORAGE_KEY = 'keypulse_campaign_progress_v1';

export function getInitialCampaignProgress(): Record<string, UserLevelProgress> {
  const result: Record<string, UserLevelProgress> = {};
  CAMPAIGN_LEVELS.forEach((level, idx) => {
    result[level.id] = {
      levelId: level.id,
      completed: false,
      unlocked: idx === 0, // only the very first level (normal_1) starts unlocked
      stars: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      attempts: 0
    };
  });
  return result;
}

export function loadCampaignProgress(): Record<string, UserLevelProgress> {
  try {
    const raw = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    if (!raw) return getInitialCampaignProgress();
    const parsed = JSON.parse(raw);
    const initial = getInitialCampaignProgress();
    return { ...initial, ...parsed };
  } catch {
    return getInitialCampaignProgress();
  }
}

export function saveCampaignProgress(data: Record<string, UserLevelProgress>) {
  try {
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save campaign progress', e);
  }
}
