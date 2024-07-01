const API_KEY = "of40zatnkd1ftcaqnf92ahqznkg1vn";

/**
 * @deprecated APIから取得可能
 */
const CLASSIFICATION_LABELS = [
  {
    name: "薬物・酩酊・過度の喫煙",
    id: "DrugsIntoxication",
    description:
      "タバコの過度な賛美・宣伝、マリファナの摂取・使用、合法薬物やアルコールによる酩酊、違法薬物の話題。",
  },
  {
    name: "性的なテーマ",
    id: "SexualThemes",
    description:
      "実際に金銭のやり取りが発生する、オンラインまたは対面式のギャンブル、ポーカー、ファンタジースポーツへの参加。",
  },
  {
    name: "著しい冒涜や下品な表現",
    id: "ProfanityVulgarity",
    description: "特に通常の会話内での、猥褻的・冒涜的・下品な表現の頻繁な使用。",
  },
  {
    name: "ギャンブル",
    id: "Gambling",
    description:
      "実際に金銭のやり取りが発生する、オンラインまたは対面式のギャンブル、ポーカー、ファンタジースポーツへの参加。",
  },
  {
    name: "暴力的で露骨な描写",
    id: "ViolentGraphic",
    description: "リアルな暴力、流血、重傷、死のシミュレーションや描写。",
  },
] as const;

const BROADCAST_LANGUAGE = [
  { id: "ja", name: "日本語" },
  { id: "en", name: "English" },
  { id: "id", name: "Bahasa Indonesia" },
  { id: "ca", name: "Català" },
  { id: "da", name: "Dansk" },
  { id: "de", name: "Deutsch" },
  { id: "es", name: "Español" },
  { id: "fr", name: "Français" },
  { id: "it", name: "Italiano" },
  { id: "hu", name: "Magyar" },
  { id: "nl", name: "Nederlands" },
  { id: "no", name: "Norsk" },
  { id: "pl", name: "Polski" },
  { id: "pt", name: "Português" },
  { id: "ro", name: "Română" },
  { id: "sk", name: "Slovenčina" },
  { id: "fi", name: "Suomi" },
  { id: "sv", name: "Svenska" },
  { id: "tl", name: "Tagalog" },
  { id: "vi", name: "Tiếng Việt" },
  { id: "tr", name: "Türkçe" },
  { id: "cs", name: "Čeština" },
  { id: "el", name: "Ελληνικά" },
  { id: "bg", name: "Български" },
  { id: "ru", name: "Русский" },
  { id: "uk", name: "ภาษาไทย" },
  { id: "zh", name: "中文" },
  { id: "zh-hk", name: "粵語" },
  { id: "ko", name: "한국어" },
  { id: "asl", name: "American Sign Language" },
  { id: "other", name: "その他" },
] as const;

export const TWITCH_CONSTANTS = {
  CLASSIFICATION_LABELS,
  BROADCAST_LANGUAGE,
  API_KEY,
};
