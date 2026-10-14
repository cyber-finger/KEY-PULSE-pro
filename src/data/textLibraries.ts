export const COMMON_WORDS: string[] = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they',
  'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'his',
  'from', 'they', 'say', 'her', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
  'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
  'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year',
  'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only',
  'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work',
  'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most',
  'us', 'great', 'world', 'here', 'life', 'never', 'much', 'should', 'need', 'feel', 'high',
  'system', 'program', 'code', 'speed', 'focus', 'flow', 'finger', 'rhythm', 'key', 'type',
  'practice', 'quick', 'brown', 'fox', 'jumps', 'lazy', 'dog', 'sound', 'light', 'dark',
  'screen', 'mind', 'power', 'future', 'skill', 'learn', 'stream', 'pulse', 'spark', 'shift',
  'energy', 'build', 'create', 'reach', 'climb', 'quiet', 'swift', 'sharp', 'steady', 'drive',
  'matrix', 'signal', 'memory', 'vision', 'simple', 'clean', 'nature', 'water', 'stone',
  'mountain', 'breeze', 'cloud', 'silver', 'golden', 'shadow', 'echo', 'bright', 'calm', 'depth',
  'journey', 'wonder', 'curious', 'action', 'result', 'target', 'motion', 'orbit', 'zenith', 'tempo',
  'balance', 'clarity', 'crystal', 'flight', 'forest', 'galaxy', 'harbor', 'horizon', 'island',
  'jungle', 'knight', 'legend', 'meadow', 'nebula', 'ocean', 'path', 'planet', 'portal',
  'quest', 'radar', 'river', 'rocket', 'sensor', 'serene', 'shelter', 'spiral', 'spring',
  'stellar', 'summit', 'temple', 'thunder', 'timber', 'trail', 'valley', 'vessel', 'voyage',
  'wave', 'whisper', 'winter', 'wisdom', 'wizard', 'zen', 'beacon', 'bounty', 'canvas',
  'canyon', 'castle', 'chimera', 'circuit', 'comet', 'compass', 'cradle', 'creek', 'dawn',
  'delta', 'desert', 'domain', 'dragon', 'dune', 'ember', 'falcon', 'fathom', 'feather',
  'flame', 'glacier', 'glimmer', 'grove', 'haven', 'hollow', 'lagoon', 'lantern', 'lunar',
  'magma', 'mantle', 'meteor', 'mirage', 'oasis', 'onyx', 'panther', 'pebble', 'phoenix',
  'prism', 'quartz', 'radian', 'raptor', 'realm', 'relic', 'ridge', 'ruby', 'safari',
  'sapphire', 'shadow', 'shrine', 'siren', 'solace', 'solitude', 'sparkle', 'spectrum',
  'strata', 'stream', 'stride', 'tesseract', 'tide', 'titan', 'tundra', 'twilight', 'vanguard',
  'vortex', 'wilderness', 'wind', 'zephyr', 'always', 'between', 'change', 'different',
  'example', 'family', 'group', 'important', 'keep', 'large', 'move', 'number', 'point',
  'question', 'right', 'school', 'small', 'story', 'together', 'under', 'water', 'young'
];

export interface QuoteItem {
  id: string;
  quote: string;
  author: string;
  length: 'short' | 'medium' | 'long';
}

export const FAMOUS_QUOTES: QuoteItem[] = [
  {
    id: 'q1',
    quote: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    author: "Buddha",
    length: "short"
  },
  {
    id: 'q2',
    quote: "Simplicity is prerequisite for reliability. Premature optimization is the root of all evil in software engineering.",
    author: "Donald Knuth",
    length: "medium"
  },
  {
    id: 'q3',
    quote: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    author: "Steve Jobs",
    length: "medium"
  },
  {
    id: 'q4',
    quote: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    length: "medium"
  },
  {
    id: 'q5',
    quote: "It does not matter how slowly you go as long as you do not stop. Persistence overcomes the hardest barriers.",
    author: "Confucius",
    length: "short"
  },
  {
    id: 'q6',
    quote: "The greatest glory in living lies not in never falling, but in rising every time we fall. Strength is forged through adversity.",
    author: "Nelson Mandela",
    length: "medium"
  },
  {
    id: 'q7',
    quote: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
    length: "short"
  },
  {
    id: 'q8',
    quote: "First, solve the problem. Then, write the code. Clear thinking is the foundation of elegant design.",
    author: "John Johnson",
    length: "short"
  },
  {
    id: 'q9',
    quote: "In the middle of difficulty lies opportunity. Keep your attention centered on what is within your control.",
    author: "Albert Einstein",
    length: "short"
  },
  {
    id: 'q10',
    quote: "Knowledge is of no value unless you put it into practice. Repetition builds effortless mastery in any craft.",
    author: "Anton Chekhov",
    length: "short"
  }
];

export interface CodeSnippetItem {
  id: string;
  title: string;
  language: string;
  code: string;
}

export const CODE_SNIPPETS: CodeSnippetItem[] = [
  {
    id: 'c1',
    title: 'TypeScript Binary Search',
    language: 'TypeScript',
    code: "function binarySearch(arr: number[], target: number): number {\n  let low = 0;\n  let high = arr.length - 1;\n  while (low <= high) {\n    const mid = Math.floor((low + high) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}"
  },
  {
    id: 'c2',
    title: 'React Custom Hook',
    language: 'React',
    code: "function useDebounce<T>(value: T, delay: number): T {\n  const [debounced, setDebounced] = useState<T>(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}"
  },
  {
    id: 'c3',
    title: 'Python QuickSort',
    language: 'Python',
    code: "def quicksort(items):\n    if len(items) <= 1:\n        return items\n    pivot = items[len(items) // 2]\n    left = [x for x in items if x < pivot]\n    middle = [x for x in items if x == pivot]\n    right = [x for x in items if x > pivot]\n    return quicksort(left) + middle + quicksort(right)"
  },
  {
    id: 'c4',
    title: 'JavaScript Array Pipeline',
    language: 'JavaScript',
    code: "const results = items\n  .filter(item => item.isActive && item.score > 80)\n  .map(item => ({ ...item, formattedScore: `${item.score}%` }))\n  .sort((a, b) => b.score - a.score);"
  }
];

export const PUNCTUATION_TEXTS: string[] = [
  "Wait! Did you hear that? The frequency was 14.5 Hz, exactly 3.2% above baseline: [Alpha-09]. Let's verify: (x + y) * (z - 4) = 1,024!",
  "In 2026, over 94.7% of engineers said: \"Clean architecture + strong typing = peace of mind.\" Isn't that 100% true? Check #docs @v2.4!",
  "Warning: file_path = \"/usr/local/bin/run.sh\"; exit_code: -1 (ERR_TIMEOUT). Please retry with flags: [--force, --verbose=true]!",
  "The quick, brown fox—jumping swiftly—cleared 10-foot fences; while 42 lazy dogs lay under the 90° shade. Are you ready?"
];

export function generateRandomWords(count: number): string {
  const words: string[] = [];
  let prevWord = '';
  for (let i = 0; i < count; i++) {
    let rand = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];
    while (rand === prevWord) {
      rand = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];
    }
    words.push(rand);
    prevWord = rand;
  }
  return words.join(' ');
}

export function getRandomQuote(): QuoteItem {
  const index = Math.floor(Math.random() * FAMOUS_QUOTES.length);
  return FAMOUS_QUOTES[index];
}

export function getRandomCode(): CodeSnippetItem {
  const index = Math.floor(Math.random() * CODE_SNIPPETS.length);
  return CODE_SNIPPETS[index];
}

export function getRandomPunctuation(): string {
  const index = Math.floor(Math.random() * PUNCTUATION_TEXTS.length);
  return PUNCTUATION_TEXTS[index];
}

// ============================================================================
// BENGALI TEXT LIBRARY (বাংলা শব্দমালা ও বিখ্যাত বাণী)
// ============================================================================
export const BENGALI_WORDS: string[] = [
  'আমি', 'তুমি', 'সে', 'আমরা', 'তারা', 'বই', 'কলম', 'দেশ', 'ভাষা', 'বাংলা',
  'জীবন', 'মানুষ', 'সময়', 'স্বপ্ন', 'দিন', 'রাত', 'আলো', 'বাতাস', 'নদী', 'আকাশ',
  'সূর্য', 'বৃষ্টি', 'মাটি', 'জল', 'ফুল', 'পাখি', 'গান', 'আনন্দ', 'বন্ধু', 'পথ',
  'কথা', 'কাজ', 'মন', 'চোখ', 'হাত', 'ভালোবাসা', 'শান্তি', 'সুন্দর', 'সত্য', 'জ্ঞান',
  'শক্তি', 'চেষ্টা', 'সাফল্য', 'শিক্ষা', 'সাহস', 'ইতিহাস', 'সংস্কৃতি', 'স্মৃতি', 'স্বাধীনতা', 'মুক্ত',
  'উজ্জ্বল', 'নীরব', 'গভীর', 'মধুর', 'সহজ', 'কঠিন', 'নতুন', 'পুরাতন', 'প্রথম', 'শেষ',
  'ভবিষ্যৎ', 'অতীত', 'বর্তমান', 'হৃদয়', 'জগৎ', 'অমর', 'বিজয়', 'আবেগ', 'চিন্তা', 'উন্নয়ন',
  'প্রকৃতি', 'সাগর', 'পাহাড়', 'অরণ্য', 'মায়া', 'শ্রদ্ধা', 'বিপ্লব', 'গর্ব', 'সাধনা', 'লক্ষ্য',
  'গন্তব্য', 'দৃষ্টি', 'আশা', 'ভরসা', 'বিশ্বাস', 'ঐক্য', 'সংগ্রাম', 'সাধক', 'সৃষ্টি', 'মহৎ',
  'অসীম', 'প্রভাত', 'সন্ধ্যা', 'তারা', 'চাঁদ', 'মহাবিশ্ব', 'বিজ্ঞান', 'প্রযুক্তি', 'যন্ত্র', 'কীবোর্ড',
  'টাইপিং', 'গতি', 'নির্ভুলতা', 'অনুশীলন', 'অভিজ্ঞতা', 'দক্ষতা', 'মেধা', 'সততা', 'আদর্শ', 'চেতনা',
  'ঐতিহ্য', 'অনুপ্রেরণা', 'উৎসাহ', 'সংকল্প', 'দৃঢ়তা', 'অধ্যাবসায়', 'প্রেরণা', 'সতর্কতা', 'সফলতা', 'ধৈর্য',
  'বাংলাদেশ', 'সোনার', 'মাতৃভাষা', 'একুশে', 'শহীদ', 'বর্ণমালা', 'স্বরবর্ণ', 'ব্যঞ্জনবর্ণ', 'স্বরচিহ্ন',
  'কবিতা', 'গল্প', 'উপন্যাস', 'নাটক', 'সাহিত্য', 'চিত্রকলা', 'সংগীত', 'সুর', 'রাগ', 'তাল',
  'হেমন্ত', 'শরৎ', 'বসন্ত', 'বর্ষা', 'গ্রীষ্ম', 'শীত', 'শিশির', 'কুয়াশা', 'রোদ্দুর', 'মেঘমালা',
  'নাবিক', 'যাত্রী', 'অভিযান', 'পাহাড়ি', 'ঝরনা', 'স্রোত', 'কলরব', 'সবুজ', 'শ্যামল', 'পল্লী'
];

export const BENGALI_QUOTES: QuoteItem[] = [
  {
    id: 'bq1',
    quote: "যদি তোর ডাক শুনে কেউ না আসে তবে একলা চলো রে। একলা চলো, একলা চলো, একলা চলো রে।",
    author: "রবীন্দ্রনাথ ঠাকুর",
    length: "short"
  },
  {
    id: 'bq2',
    quote: "গাহি সাম্যের গান— মানুষের চেয়ে বড় কিছু নাই, নহে কিছু মহীয়ান। নাই দেশ-কাল-পাত্রের ভেদ, অভেদ ধর্মজাতি।",
    author: "কাজী নজরুল ইসলাম",
    length: "medium"
  },
  {
    id: 'bq3',
    quote: "চিত্ত যেথা ভয়শূন্য, উচ্চ যেথা শির, জ্ঞান যেথা মুক্ত, যেথা গৃহের প্রাচীর আপন প্রাঙ্গণতলে দিবসশর্বরী বসুধারে রাখে নাই খণ্ড ক্ষুদ্র করি।",
    author: "রবীন্দ্রনাথ ঠাকুর",
    length: "long"
  },
  {
    id: 'bq4',
    quote: "এ বিশ্বকে এ শিশুর বাসযোগ্য করে যাব আমি— নবজাতকের কাছে এ আমার দৃঢ় অঙ্গীকার।",
    author: "সুকান্ত ভট্টাচার্য",
    length: "short"
  },
  {
    id: 'bq5',
    quote: "বাংলার মুখ আমি দেখিয়াছি, তাই আমি পৃথিবীর রূপ খুঁজিতে যাই না আর। অন্ধকারে জেগে ওঠে নদীর ওপার।",
    author: "জীবনানন্দ দাশ",
    length: "short"
  },
  {
    id: 'bq6',
    quote: "মরিতে চাহি না আমি সুন্দর ভুবনে, মানবের মাঝে আমি বাঁচিবারে চাই। এই সূর্যকরে এই পুষ্পিত কাননে জীবন্ত হৃদয়-মাঝে যদি স্থান পাই।",
    author: "রবীন্দ্রনাথ ঠাকুর",
    length: "medium"
  },
  {
    id: 'bq7',
    quote: "বল বীর— বল উন্নত মম শির! শির নেহারি আমারি, নতশির ওই শিখর হিমাদ্রির! বল বীর— বল মহাবিশ্বের মহাকাশ ফাড়ি।",
    author: "কাজী নজরুল ইসলাম",
    length: "medium"
  },
  {
    id: 'bq8',
    quote: "মেঘ দেখে কেউ করিস নে ভয়, আড়ালে তার সূর্য হাসে। হারা শশীর হারা হাসি অন্ধকারেই ফিরে আসে।",
    author: "রবীন্দ্রনাথ ঠাকুর",
    length: "short"
  },
  {
    id: 'bq9',
    quote: "আমারে তুমি অশেষ করেছ, এমনি লীলা তব— ফুরায়ে ফেলে আবার ভরেছ জীবন নব নব।",
    author: "রবীন্দ্রনাথ ঠাকুর",
    length: "short"
  },
  {
    id: 'bq10',
    quote: "মোদের গরব, মোদের আশা, আ মরি বাংলা ভাষা! তোমার কোলে, তোমার বোলে, কতই শান্তি ভালোবাসা।",
    author: "অতুলপ্রসাদ সেন",
    length: "medium"
  }
];

export function generateRandomBengaliWords(count: number): string {
  const words: string[] = [];
  let prevWord = '';
  for (let i = 0; i < count; i++) {
    let rand = BENGALI_WORDS[Math.floor(Math.random() * BENGALI_WORDS.length)];
    while (rand === prevWord) {
      rand = BENGALI_WORDS[Math.floor(Math.random() * BENGALI_WORDS.length)];
    }
    words.push(rand);
    prevWord = rand;
  }
  return words.join(' ');
}

export function getRandomBengaliQuote(): QuoteItem {
  const index = Math.floor(Math.random() * BENGALI_QUOTES.length);
  return BENGALI_QUOTES[index];
}

// ============================================================================
// DEVELOPER SPECIAL SYNTAX DRILLS (প্রোগ্রামারদের জন্য স্পেশাল কোড ও সিম্বল ড্রিল)
// ============================================================================
export const DEVELOPER_SYNTAX_DRILLS: string[] = [
  "const handleFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {\n  const token = localStorage.getItem('token');\n  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };\n  return await fetch(`/api/v1/${endpoint}`, { ...options, headers });\n};",
  "interface ApiResponse<T> {\n  success: boolean;\n  status: 200 | 400 | 401 | 500;\n  data?: T;\n  error?: { code: string; message: string; details?: string[] };\n}\ntype HandlerFn<T, R> = (input: T, ctx?: Record<string, unknown>) => Promise<ApiResponse<R>>;",
  "const [query, setQuery] = useState<string>('');\nconst filteredUsers = useMemo(() => {\n  if (!query.trim()) return users;\n  return users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.tags?.some(t => t === query));\n}, [users, query]);",
  "def evaluate_telemetry(history, target_wpm=60, min_acc=95.0):\n    valid_runs = [run for run in history if run['wpm'] >= target_wpm and run['acc'] >= min_acc]\n    return {'cleared': len(valid_runs) > 0, 'count': len(valid_runs), 'best': max((r['wpm'] for r in history), default=0)}",
  "const matrix: number[][] = Array.from({ length: rows }, (_, r) =>\n  Array.from({ length: cols }, (_, c) => (r === c ? 1 : (r + c) % 2 === 0 ? 0 : -1))\n);\nconst flat = matrix.flatMap((row, idx) => row.map(val => ({ row: idx, val, active: val > 0 })));",
  "SELECT u.id, u.email, COUNT(s.id) AS total_sessions, AVG(s.wpm) AS avg_wpm\nFROM users u\nLEFT JOIN typing_sessions s ON s.user_id = u.id\nWHERE s.created_at >= NOW() - INTERVAL '30 days' AND s.accuracy >= 90.0\nGROUP BY u.id, u.email HAVING COUNT(s.id) >= 10 ORDER BY avg_wpm DESC LIMIT 50;",
  "{ [ ( < x != null && y !== undefined ? (a * (b + c) / 2) : [1, 2, 3] > ) ] } => { return `val_${id}`; };\nconst symbols = ['{', '}', '[', ']', '(', ')', '<', '>', '&&', '||', '=>', '===', '!==', '?:', ';', ':'];",
  "export const useDebounce = <T,>(value: T, delay: number = 300): T => {\n  const [debouncedValue, setDebouncedValue] = useState<T>(value);\n  useEffect(() => {\n    const handler = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debouncedValue;\n};",
  "class BinarySearchTree<T> {\n  private root: TreeNode<T> | null = null;\n  insert(val: T): void {\n    this.root = this.insertNode(this.root, val);\n  }\n  find(target: T): boolean {\n    let curr = this.root;\n    while (curr) {\n      if (curr.val === target) return true;\n      curr = target < curr.val ? curr.left : curr.right;\n    }\n    return false;\n  }\n}",
  "<div className=\"flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800\">\n  <button onClick={() => setStreak(s => s + 1)} className={`px-4 py-2 font-mono font-bold ${isActive ? 'bg-amber-400 text-black' : 'text-slate-400'}`}>\n    {`Active Streak: ${streak}`}\n  </button>\n</div>"
];

export function getRandomSyntaxDrill(): string {
  const index = Math.floor(Math.random() * DEVELOPER_SYNTAX_DRILLS.length);
  return DEVELOPER_SYNTAX_DRILLS[index];
}

// ============================================================================
// WEAK KEY DRILL GENERATOR (দুর্বল অক্ষর অনুশীলন ড্রিল)
// ============================================================================
export function generateWeakKeyDrill(weakKeys: string[], wordCount: number = 28): string {
  if (!weakKeys || weakKeys.length === 0) {
    weakKeys = ['p', 'q', 'z', 'x', 'b', ';'];
  }

  // Filter dictionary words that contain at least one of the weak keys
  const normalizedKeys = weakKeys.map(k => k.toLowerCase());
  const matchingWords = COMMON_WORDS.filter(w =>
    normalizedKeys.some(k => w.toLowerCase().includes(k))
  );

  // Custom targeted patterns that force repeated muscle memory finger reaches for weak keys
  const drillPatterns: string[] = [];
  normalizedKeys.forEach(k => {
    drillPatterns.push(
      `${k}${k} ${k}a${k} ${k}e${k} ${k}o${k}`,
      `a${k} e${k} i${k} o${k} u${k}`,
      `${k}ing ${k}ed ${k}er ${k}ly`
    );
  });

  const pool = [...matchingWords, ...drillPatterns];
  const drillResult: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    const picked = pool[Math.floor(Math.random() * pool.length)];
    drillResult.push(picked);
  }

  return drillResult.join(' ');
}
