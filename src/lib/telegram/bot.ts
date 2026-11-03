import { esc } from "@/lib/leads";
import { clearSession, getSession, setSession, type FeedbackRole } from "@/lib/telegram/sessions";
import { sendTelegramMessage } from "@/lib/telegram/send";

const BTN_RESIDENT = "Я житель";
const BTN_BUSINESS = "Я бізнес";
const BTN_CANCEL = "Скасувати";
const BTN_CHANGE_ROLE = "Змінити роль";

const MAX_FEEDBACK = 2000;
const recentFeedback = new Map<number, number[]>();

type TgUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type TgMessage = {
  message_id: number;
  chat: { id: number; type: string };
  from?: TgUser;
  text?: string;
};

type TgUpdate = {
  update_id: number;
  message?: TgMessage;
};

const mainMenu = {
  keyboard: [[{ text: BTN_RESIDENT }, { text: BTN_BUSINESS }]],
  resize_keyboard: true,
  one_time_keyboard: false,
};

const waitingMenu = {
  keyboard: [[{ text: BTN_CANCEL }, { text: BTN_CHANGE_ROLE }]],
  resize_keyboard: true,
  one_time_keyboard: false,
};

function roleLabel(role: FeedbackRole) {
  return role === "resident" ? "Житель" : "Бізнес";
}

function formatFrom(user: TgUser) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || "Без імені";
  const nick = user.username ? ` (@${user.username})` : "";
  return `${esc(name)}${esc(nick)} · id <code>${user.id}</code>`;
}

function feedbackRateLimited(userId: number, max = 10, windowMs = 10 * 60_000) {
  const now = Date.now();
  const hits = (recentFeedback.get(userId) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  recentFeedback.set(userId, hits);
  return hits.length > max;
}

async function reply(chatId: number, text: string, menu: typeof mainMenu | typeof waitingMenu) {
  await sendTelegramMessage(text, { chatId, replyMarkup: menu });
}

async function showMainMenu(chatId: number, text: string) {
  clearSession(chatId);
  await reply(chatId, text, mainMenu);
}

async function startFeedback(chatId: number, role: FeedbackRole) {
  setSession(chatId, role);
  await reply(
    chatId,
    `Напишіть ваш фідбек одним повідомленням.\nРоль: <b>${roleLabel(role)}</b>`,
    waitingMenu,
  );
}

async function deliverFeedback(chatId: number, user: TgUser, role: FeedbackRole, text: string) {
  if (feedbackRateLimited(user.id)) {
    await reply(chatId, "Занадто багато повідомлень. Спробуйте пізніше.", waitingMenu);
    return;
  }

  const adminText = [
    `<b>Фідбек · ${roleLabel(role)}</b>`,
    `<b>Від:</b> ${formatFrom(user)}`,
    `<b>Текст:</b>`,
    esc(text),
  ].join("\n");

  const ok = await sendTelegramMessage(adminText);
  if (ok === false || ok === null) {
    await reply(chatId, "Не вдалося надіслати фідбек. Спробуйте пізніше.", waitingMenu);
    return;
  }

  await showMainMenu(chatId, "Дякуємо! Фідбек надіслано.");
}

export async function handleTelegramUpdate(update: TgUpdate) {
  const message = update.message;
  if (!message?.from || message.chat.type !== "private") return;

  const chatId = message.chat.id;
  const user = message.from;
  const text = message.text?.trim() ?? "";

  if (!text) {
    const session = getSession(chatId);
    if (session) {
      await reply(chatId, "Надішліть, будь ласка, текстом.", waitingMenu);
    } else {
      await showMainMenu(chatId, "Спочатку оберіть роль кнопкою нижче.");
    }
    return;
  }

  if (text === "/start" || text.startsWith("/start ")) {
    await showMainMenu(
      chatId,
      "Вітаємо в боті QMAP.\nНадішліть фідбек — ідею, скаргу чи пропозицію.\nОберіть, хто ви:",
    );
    return;
  }

  if (text === BTN_RESIDENT) {
    await startFeedback(chatId, "resident");
    return;
  }

  if (text === BTN_BUSINESS) {
    await startFeedback(chatId, "business");
    return;
  }

  if (text === BTN_CANCEL || text === BTN_CHANGE_ROLE) {
    await showMainMenu(chatId, "Оберіть роль кнопкою нижче:");
    return;
  }

  const session = getSession(chatId);
  if (!session) {
    await showMainMenu(chatId, "Спочатку оберіть роль кнопкою нижче.");
    return;
  }

  if (text.length > MAX_FEEDBACK) {
    await reply(
      chatId,
      `Текст занадто довгий (макс. ${MAX_FEEDBACK} символів). Скоротіть і надішліть ще раз.`,
      waitingMenu,
    );
    return;
  }

  await deliverFeedback(chatId, user, session.role, text);
}
