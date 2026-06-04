const PROFANITY_SET = new Set([
  // English
  "nigger",
  "nigga",
  "niggas",
  "niggers",
  "faggot",
  "fag",
  "n1gger",
  "retard",
  "retarded",

  // Russian (мат)
  "пизда",
  "пиздец",
  "пиздить",
  "пиздят",
  "пиздатый",
  "распиздяй",
  "запиздец",
  "выебать",
  "разъебать",
  "разъебал",
  "гандон",
  "гондон",
  "шлюха",
  "шлюшка",
  "проститутка",

  // Kazakh
  "қотақ",
  "котак",
  "ам",
  "көт",
  "кот",
  "сигым",
  "малакай",
  "сақал",
  "сакал",
  "жындых",
  "қасап",
  "мылжың",
  "бөксе",
  "жағымсыз",
  "есер",
  "аңқау",
  "жынды",
  "масқара",
]);

function normalize(text: string): string {
  const leetMap: Record<string, string> = {
    "0": "o",
    "1": "i",
    "3": "e",
    "4": "a",
    "5": "s",
    "6": "g",
    "7": "t",
    "8": "b",
    $: "s",
    "@": "a",
  };

  const chars: string[] = [];
  for (const c of text.toLowerCase()) {
    chars.push(leetMap[c] || c);
  }

  return chars
    .join("")
    .replace(/[^a-zа-яёөүіңқғәһҗұүһӘІҢҚҒҰҮҺ\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsProfanity(text: string): boolean {
  const normalized = normalize(text);
  if (!normalized) return false;

  const words = normalized.split(/\s+/);
  for (const word of words) {
    if (word.length < 2) continue;
    if (PROFANITY_SET.has(word)) return true;
  }

  return false;
}
