export const COMPLEXES = ["Варшавський", "Діброва парк"] as const;

/** Same list as messages/uk.json → categories */
export const CATEGORIES = [
  "Кав'ярні",
  "Аптеки",
  "Пекарні",
  "Барбершопи",
  "Зоомагазини",
  "Дитячі клуби",
  "Ремонт взуття",
  "Доставка води",
  "Хімчистки",
  "Фітнес",
  "Квіти",
  "Нотаріуси",
] as const;

export const OUTREACH_STATUSES = {
  added: "Додався",
  contact_passed: "Передали контакт",
  not_interested: "Не цікаво",
} as const;

export type OutreachStatus = keyof typeof OUTREACH_STATUSES;

export const BTN_ADMIN_ADD = "➕ Додати заклад";
export const BTN_ADMIN_STATS = "📊 Статистика";
export const BTN_ADMIN_EXIT = "🚪 Вийти з адмінки";
export const BTN_CATEGORY_OTHER = "Інше (ввести)";
export const BTN_SKIP_CONTACT = "Пропустити контакт";
export const BTN_SKIP_NAME = "Пропустити ім'я";
export const BTN_SKIP_POSITION = "Пропустити посаду";
export const BTN_SKIP_COMMENT = "Пропустити коментар";

export function statusFromButton(text: string): OutreachStatus | null {
  for (const [key, label] of Object.entries(OUTREACH_STATUSES) as Array<
    [OutreachStatus, string]
  >) {
    if (label === text) return key;
  }
  return null;
}

export function chunkButtons(labels: string[], perRow = 2) {
  const rows: Array<Array<{ text: string }>> = [];
  for (let i = 0; i < labels.length; i += perRow) {
    rows.push(labels.slice(i, i + perRow).map((text) => ({ text })));
  }
  return rows;
}
