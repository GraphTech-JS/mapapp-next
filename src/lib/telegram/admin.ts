import { esc } from "@/lib/leads";
import {
  BTN_ADMIN_ADD,
  BTN_ADMIN_EXIT,
  BTN_ADMIN_STATS,
  BTN_CATEGORY_OTHER,
  BTN_SKIP_COMMENT,
  BTN_SKIP_POSITION,
  CATEGORIES,
  COMPLEXES,
  OUTREACH_STATUSES,
  chunkButtons,
  statusFromButton,
  type OutreachStatus,
} from "@/lib/telegram/outreach-constants";
import { insertOutreach, outreachStats } from "@/lib/telegram/outreach-db";
import { clearSession, getSession, setSession, type AdminOutreachStep } from "@/lib/telegram/sessions";
import { sendTelegramMessage } from "@/lib/telegram/send";

type TgUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type ReplyMenu = {
  keyboard: Array<Array<Record<string, unknown>>>;
  resize_keyboard: boolean;
  one_time_keyboard: boolean;
};

const DEFAULT_ADMIN_USERNAMES = ["andrew_257"];

const cancelOnly: ReplyMenu = {
  keyboard: [[{ text: "Скасувати" }]],
  resize_keyboard: true,
  one_time_keyboard: false,
};

export const adminMenu: ReplyMenu = {
  keyboard: [[{ text: BTN_ADMIN_ADD }], [{ text: BTN_ADMIN_STATS }], [{ text: BTN_ADMIN_EXIT }]],
  resize_keyboard: true,
  one_time_keyboard: false,
};

function complexMenu(): ReplyMenu {
  return {
    keyboard: [...chunkButtons([...COMPLEXES], 2), [{ text: "Скасувати" }]],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

function categoryMenu(): ReplyMenu {
  return {
    keyboard: [
      ...chunkButtons([...CATEGORIES], 2),
      [{ text: BTN_CATEGORY_OTHER }],
      [{ text: "Скасувати" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

function statusMenu(): ReplyMenu {
  return {
    keyboard: [
      ...chunkButtons(Object.values(OUTREACH_STATUSES), 1),
      [{ text: "Скасувати" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

function positionMenu(): ReplyMenu {
  return {
    keyboard: [[{ text: BTN_SKIP_POSITION }], [{ text: "Скасувати" }]],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

function commentMenu(): ReplyMenu {
  return {
    keyboard: [[{ text: BTN_SKIP_COMMENT }], [{ text: "Скасувати" }]],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

function menuForStep(step: AdminOutreachStep): ReplyMenu {
  if (step === "complex") return complexMenu();
  if (step === "category") return categoryMenu();
  if (step === "status") return statusMenu();
  if (step === "position") return positionMenu();
  if (step === "comment") return commentMenu();
  return cancelOnly;
}

const stepPrompt: Record<AdminOutreachStep, string> = {
  complex: "Оберіть ЖК:",
  business: "Назва закладу:",
  category: "Категорія (зі списку або «Інше»):",
  category_custom: "Введіть категорію вручну:",
  contact: "Контакт (телефон / @username / інше):",
  name: "Ім'я контактної особи:",
  position: "Посада (або «Пропустити посаду»):",
  status: "Статус:",
  comment: "Коментар (або «Пропустити коментар»):",
};

async function reply(chatId: number, text: string, menu: ReplyMenu) {
  await sendTelegramMessage(text, { chatId, replyMarkup: menu });
}

export function isAdmin(user: TgUser): boolean {
  const ids = (process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.includes(String(user.id))) return true;

  const envNicks = (process.env.TELEGRAM_ADMIN_USERNAMES || "")
    .split(",")
    .map((s) => s.trim().replace(/^@/, "").toLowerCase())
    .filter(Boolean);
  const nicks = new Set([...DEFAULT_ADMIN_USERNAMES, ...envNicks]);
  const username = user.username?.toLowerCase();
  return Boolean(username && nicks.has(username));
}

export async function showAdminMenu(chatId: number, text?: string) {
  clearSession(chatId);
  setSession(chatId, { kind: "admin" });
  await reply(
    chatId,
    text ?? "Адмін-меню outreach.\nДодавайте заклади та дивіться статистику.",
    adminMenu,
  );
}

function formatCounts(title: string, counts: ReturnType<typeof outreachStats>["today"]) {
  const lines = [
    `<b>${esc(title)}</b>`,
    `• ${OUTREACH_STATUSES.added}: <b>${counts.added}</b>`,
    `• ${OUTREACH_STATUSES.contact_passed}: <b>${counts.contact_passed}</b>`,
    `• ${OUTREACH_STATUSES.not_interested}: <b>${counts.not_interested}</b>`,
    `Разом: <b>${counts.total}</b>`,
  ];
  return lines.join("\n");
}

export async function sendStats(chatId: number) {
  const { today, all, dayLabel } = outreachStats();
  const text = [
    "📊 <b>Статистика outreach</b>",
    "",
    formatCounts(`Сьогодні (${dayLabel})`, today),
    "",
    formatCounts("Всього", all),
  ].join("\n");
  await reply(chatId, text, adminMenu);
  setSession(chatId, { kind: "admin" });
}

async function startAdd(chatId: number) {
  setSession(chatId, { kind: "admin_outreach", step: "complex" });
  await reply(chatId, stepPrompt.complex, complexMenu());
}

function draftFromSession(session: Extract<ReturnType<typeof getSession>, { kind: "admin_outreach" }>) {
  return {
    kind: "admin_outreach" as const,
    step: session.step,
    complex: session.complex,
    business: session.business,
    category: session.category,
    contact: session.contact,
    personName: session.personName,
    position: session.position,
    status: session.status,
  };
}

async function saveRecord(
  chatId: number,
  user: TgUser,
  session: NonNullable<ReturnType<typeof getSession>> & { kind: "admin_outreach" },
  comment: string,
) {
  if (!session.complex || !session.business || !session.category || !session.contact || !session.personName || !session.status) {
    await showAdminMenu(chatId, "Не вистачає даних. Почніть додавання знову.");
    return;
  }

  insertOutreach({
    complex: session.complex,
    business: session.business,
    category: session.category,
    contact: session.contact,
    personName: session.personName,
    position: session.position ?? "",
    status: session.status,
    comment,
    createdBy: user.id,
  });

  const summary = [
    "✅ <b>Збережено</b>",
    `<b>ЖК:</b> ${esc(session.complex)}`,
    `<b>Заклад:</b> ${esc(session.business)}`,
    `<b>Категорія:</b> ${esc(session.category)}`,
    `<b>Контакт:</b> ${esc(session.contact)}`,
    `<b>Ім'я:</b> ${esc(session.personName)}`,
    ...(session.position ? [`<b>Посада:</b> ${esc(session.position)}`] : []),
    `<b>Статус:</b> ${esc(OUTREACH_STATUSES[session.status])}`,
    ...(comment ? [`<b>Коментар:</b> ${esc(comment)}`] : []),
  ].join("\n");

  await showAdminMenu(chatId, summary + "\n\nЩо далі?");
}

async function handleOutreachStep(
  chatId: number,
  user: TgUser,
  session: NonNullable<ReturnType<typeof getSession>> & { kind: "admin_outreach" },
  text: string,
) {
  const value = text.trim();
  const base = draftFromSession(session);

  if (session.step === "complex") {
    if (!(COMPLEXES as readonly string[]).includes(value)) {
      await reply(chatId, "Оберіть ЖК кнопкою.\n\n" + stepPrompt.complex, complexMenu());
      return;
    }
    setSession(chatId, { ...base, step: "business", complex: value });
    await reply(chatId, stepPrompt.business, cancelOnly);
    return;
  }

  if (session.step === "business") {
    if (value.length < 2) {
      await reply(chatId, "Занадто коротко. " + stepPrompt.business, cancelOnly);
      return;
    }
    setSession(chatId, { ...base, step: "category", business: value.slice(0, 120) });
    await reply(chatId, stepPrompt.category, categoryMenu());
    return;
  }

  if (session.step === "category") {
    if (value === BTN_CATEGORY_OTHER) {
      setSession(chatId, { ...base, step: "category_custom" });
      await reply(chatId, stepPrompt.category_custom, cancelOnly);
      return;
    }
    if (!(CATEGORIES as readonly string[]).includes(value)) {
      await reply(chatId, "Оберіть категорію кнопкою або «Інше».\n\n" + stepPrompt.category, categoryMenu());
      return;
    }
    setSession(chatId, { ...base, step: "contact", category: value });
    await reply(chatId, stepPrompt.contact, cancelOnly);
    return;
  }

  if (session.step === "category_custom") {
    if (value.length < 2) {
      await reply(chatId, "Занадто коротко. " + stepPrompt.category_custom, cancelOnly);
      return;
    }
    setSession(chatId, { ...base, step: "contact", category: value.slice(0, 80) });
    await reply(chatId, stepPrompt.contact, cancelOnly);
    return;
  }

  if (session.step === "contact") {
    if (value.length < 3) {
      await reply(chatId, "Занадто коротко. " + stepPrompt.contact, cancelOnly);
      return;
    }
    setSession(chatId, { ...base, step: "name", contact: value.slice(0, 120) });
    await reply(chatId, stepPrompt.name, cancelOnly);
    return;
  }

  if (session.step === "name") {
    if (value.length < 2) {
      await reply(chatId, "Занадто коротко. " + stepPrompt.name, cancelOnly);
      return;
    }
    setSession(chatId, { ...base, step: "position", personName: value.slice(0, 80) });
    await reply(chatId, stepPrompt.position, positionMenu());
    return;
  }

  if (session.step === "position") {
    const position = value === BTN_SKIP_POSITION ? "" : value.slice(0, 80);
    if (value !== BTN_SKIP_POSITION && value.length < 2) {
      await reply(chatId, "Занадто коротко. " + stepPrompt.position, positionMenu());
      return;
    }
    setSession(chatId, { ...base, step: "status", position });
    await reply(chatId, stepPrompt.status, statusMenu());
    return;
  }

  if (session.step === "status") {
    const status = statusFromButton(value);
    if (!status) {
      await reply(chatId, "Оберіть статус кнопкою.\n\n" + stepPrompt.status, statusMenu());
      return;
    }
    setSession(chatId, { ...base, step: "comment", status });
    await reply(chatId, stepPrompt.comment, commentMenu());
    return;
  }

  // comment
  if (value === BTN_SKIP_COMMENT) {
    await saveRecord(chatId, user, session, "");
    return;
  }
  await saveRecord(chatId, user, { ...session, status: session.status as OutreachStatus }, value.slice(0, 1000));
}

/** Returns true if the update was handled as admin. */
export async function handleAdminUpdate(
  chatId: number,
  user: TgUser,
  text: string,
): Promise<boolean> {
  if (!isAdmin(user)) return false;

  if (text === "/admin" || text.startsWith("/admin ")) {
    await showAdminMenu(chatId);
    return true;
  }

  const session = getSession(chatId);

  if (text === BTN_ADMIN_EXIT) {
    clearSession(chatId);
    return false; // let bot show public main menu
  }

  if (text === BTN_ADMIN_ADD) {
    await startAdd(chatId);
    return true;
  }

  if (text === BTN_ADMIN_STATS) {
    await sendStats(chatId);
    return true;
  }

  if (session?.kind === "admin") {
    await showAdminMenu(chatId, "Оберіть дію кнопкою:");
    return true;
  }

  if (session?.kind === "admin_outreach") {
    if (text === "Скасувати") {
      await showAdminMenu(chatId, "Скасовано. Адмін-меню:");
      return true;
    }
    if (text.length > 2000) {
      await reply(chatId, "Текст занадто довгий (макс. 2000).", menuForStep(session.step));
      return true;
    }
    await handleOutreachStep(chatId, user, session, text);
    return true;
  }

  return false;
}
