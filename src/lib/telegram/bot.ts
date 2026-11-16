import { esc } from "@/lib/leads";
import { handleAdminUpdate, isAdmin } from "@/lib/telegram/admin";
import { BTN_ADMIN_EXIT } from "@/lib/telegram/outreach-constants";
import {
  clearSession,
  getSession,
  setSession,
  type BusinessStep,
  type Session,
  type SessionDraft,
} from "@/lib/telegram/sessions";
import { sendTelegramMessage } from "@/lib/telegram/send";

const BTN_RESIDENT = "Я житель";
const BTN_BUSINESS = "Заявка від бізнесу";
const BTN_CANCEL = "Скасувати";
const BTN_SKIP = "Пропустити коментар";
const BTN_SHARE_PHONE = "Поділитися номером";

const MAX_TEXT = 2000;
const recentSubmit = new Map<number, number[]>();

type TgUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type TgContact = {
  phone_number: string;
  first_name?: string;
  user_id?: number;
};

type TgMessage = {
  message_id: number;
  chat: { id: number; type: string };
  from?: TgUser;
  text?: string;
  contact?: TgContact;
};

type TgUpdate = {
  update_id: number;
  message?: TgMessage;
};

type ReplyMenu = {
  keyboard: Array<Array<Record<string, unknown>>>;
  resize_keyboard: boolean;
  one_time_keyboard: boolean;
};

const mainMenu: ReplyMenu = {
  keyboard: [[{ text: BTN_BUSINESS }], [{ text: BTN_RESIDENT }]],
  resize_keyboard: true,
  one_time_keyboard: false,
};

const cancelMenu: ReplyMenu = {
  keyboard: [[{ text: BTN_CANCEL }]],
  resize_keyboard: true,
  one_time_keyboard: false,
};

const phoneMenu: ReplyMenu = {
  keyboard: [
    [{ text: BTN_SHARE_PHONE, request_contact: true }],
    [{ text: BTN_CANCEL }],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};

const commentMenu: ReplyMenu = {
  keyboard: [[{ text: BTN_SKIP }], [{ text: BTN_CANCEL }]],
  resize_keyboard: true,
  one_time_keyboard: false,
};

function formatFrom(user: TgUser) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || "Без імені";
  const nick = user.username ? ` (@${user.username})` : "";
  return `${esc(name)}${esc(nick)} · id <code>${user.id}</code>`;
}

function rateLimited(userId: number, max = 8, windowMs = 10 * 60_000) {
  const now = Date.now();
  const hits = (recentSubmit.get(userId) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  recentSubmit.set(userId, hits);
  return hits.length > max;
}

function isPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return /^\+?[0-9\s\-()]+$/.test(value) && digits.length >= 10 && digits.length <= 15;
}

async function reply(chatId: number, text: string, menu: ReplyMenu) {
  await sendTelegramMessage(text, { chatId, replyMarkup: menu });
}

function menuForStep(step: BusinessStep): ReplyMenu {
  if (step === "phone") return phoneMenu;
  if (step === "comment") return commentMenu;
  return cancelMenu;
}

async function showMainMenu(chatId: number, text: string) {
  clearSession(chatId);
  await reply(chatId, text, mainMenu);
}

const stepPrompt: Record<BusinessStep, string> = {
  complex: "Напишіть назву ЖК (наприклад: Варшавський).",
  business: "Напишіть назву закладу.",
  name: "Ваше ім'я (контактна особа).",
  phone:
    "Номер телефону для зв'язку.\nНатисніть «Поділитися номером» або введіть вручну.",
  comment: "Коментар (необов'язково) або натисніть «Пропустити коментар».",
};

function businessDraft(session: Extract<Session, { kind: "business" }>): Extract<SessionDraft, { kind: "business" }> {
  return {
    kind: "business",
    step: session.step,
    complex: session.complex,
    business: session.business,
    name: session.name,
    phone: session.phone,
  };
}

async function startBusiness(chatId: number) {
  setSession(chatId, { kind: "business", step: "complex" });
  await reply(
    chatId,
    "Заявка бізнесу на мапу QMaply.\n\n" + stepPrompt.complex,
    cancelMenu,
  );
}

async function startResidentFeedback(chatId: number) {
  setSession(chatId, { kind: "feedback", role: "resident" });
  await reply(chatId, "Напишіть фідбек одним повідомленням.", cancelMenu);
}

async function deliverBusiness(
  chatId: number,
  user: TgUser,
  draft: Extract<Session, { kind: "business" }>,
  comment: string,
) {
  if (rateLimited(user.id)) {
    await reply(chatId, "Занадто багато заявок. Спробуйте пізніше.", cancelMenu);
    return;
  }

  const adminText = [
    "🏪 <b>Заявка бізнесу на мапу (Telegram-бот)</b>",
    "",
    `<b>ЖК:</b> ${esc(draft.complex ?? "")}`,
    `<b>Заклад:</b> ${esc(draft.business ?? "")}`,
    `<b>Ім'я:</b> ${esc(draft.name ?? "")}`,
    `<b>Телефон:</b> ${esc(draft.phone ?? "")}`,
    ...(comment ? [`<b>Коментар:</b> ${esc(comment)}`] : []),
    "",
    `<b>Від у Telegram:</b> ${formatFrom(user)}`,
  ].join("\n");

  const ok = await sendTelegramMessage(adminText);
  if (ok === false || ok === null) {
    await reply(chatId, "Не вдалося надіслати заявку. Спробуйте пізніше.", cancelMenu);
    return;
  }

  await showMainMenu(
    chatId,
    "Дякуємо! Заявку надіслано.\nМи перевіримо дані й зв'яжемось із вами.",
  );
}

async function deliverResidentFeedback(chatId: number, user: TgUser, text: string) {
  if (rateLimited(user.id)) {
    await reply(chatId, "Занадто багато повідомлень. Спробуйте пізніше.", cancelMenu);
    return;
  }

  const adminText = [
    "<b>Фідбек · Житель</b>",
    `<b>Від:</b> ${formatFrom(user)}`,
    "<b>Текст:</b>",
    esc(text),
  ].join("\n");

  const ok = await sendTelegramMessage(adminText);
  if (ok === false || ok === null) {
    await reply(chatId, "Не вдалося надіслати фідбек. Спробуйте пізніше.", cancelMenu);
    return;
  }

  await showMainMenu(chatId, "Дякуємо! Фідбек надіслано.");
}

async function acceptPhone(
  chatId: number,
  session: Extract<Session, { kind: "business" }>,
  phone: string,
) {
  const normalized = phone.trim().slice(0, 20);
  setSession(chatId, { ...businessDraft(session), step: "comment", phone: normalized });
  await reply(chatId, stepPrompt.comment, commentMenu);
}

async function handleBusinessStep(
  chatId: number,
  user: TgUser,
  session: Extract<Session, { kind: "business" }>,
  text: string,
) {
  const value = text.trim();

  if (session.step === "complex") {
    if (value.length < 2) {
      await reply(chatId, "Занадто коротко. " + stepPrompt.complex, cancelMenu);
      return;
    }
    setSession(chatId, { ...businessDraft(session), step: "business", complex: value.slice(0, 120) });
    await reply(chatId, stepPrompt.business, cancelMenu);
    return;
  }

  if (session.step === "business") {
    if (value.length < 2) {
      await reply(chatId, "Занадто коротко. " + stepPrompt.business, cancelMenu);
      return;
    }
    setSession(chatId, { ...businessDraft(session), step: "name", business: value.slice(0, 120) });
    await reply(chatId, stepPrompt.name, cancelMenu);
    return;
  }

  if (session.step === "name") {
    if (value.length < 2) {
      await reply(chatId, "Занадто коротко. " + stepPrompt.name, cancelMenu);
      return;
    }
    setSession(chatId, { ...businessDraft(session), step: "phone", name: value.slice(0, 80) });
    await reply(chatId, stepPrompt.phone, phoneMenu);
    return;
  }

  if (session.step === "phone") {
    if (!isPhone(value)) {
      await reply(
        chatId,
        "Не схоже на номер телефону. Приклад: +380XXXXXXXXX\n\n" + stepPrompt.phone,
        phoneMenu,
      );
      return;
    }
    await acceptPhone(chatId, session, value);
    return;
  }

  // comment
  if (value === BTN_SKIP) {
    await deliverBusiness(chatId, user, session, "");
    return;
  }
  await deliverBusiness(chatId, user, session, value.slice(0, 1000));
}

export async function handleTelegramUpdate(update: TgUpdate) {
  const message = update.message;
  if (!message?.from || message.chat.type !== "private") return;

  const chatId = message.chat.id;
  const user = message.from;
  const text = message.text?.trim() ?? "";

  if (text === "/start" || text.startsWith("/start ")) {
    await showMainMenu(
      chatId,
      "Вітаємо в боті QMaply.\n\n" +
        "• Бізнес — залиште заявку на мапу ЖК\n" +
        "• Житель — надішліть фідбек\n\n" +
        "Оберіть кнопку нижче:",
    );
    return;
  }

  // Hidden admin: /admin and admin keyboards (only @Andrew_257 / TELEGRAM_ADMIN_*)
  if (text) {
    const handled = await handleAdminUpdate(chatId, user, text);
    if (handled) return;
    // Admin pressed «Вийти» → fall through to public menu below when text is exit
    if (isAdmin(user) && text === BTN_ADMIN_EXIT) {
      await showMainMenu(chatId, "Вийшли з адмінки. Звичайне меню:");
      return;
    }
  }

  if (text === BTN_CANCEL) {
    await showMainMenu(chatId, "Скасовано. Оберіть дію кнопкою нижче:");
    return;
  }

  if (text === BTN_BUSINESS) {
    await startBusiness(chatId);
    return;
  }

  if (text === BTN_RESIDENT) {
    await startResidentFeedback(chatId);
    return;
  }

  if (message.contact) {
    const session = getSession(chatId);
    if (session?.kind === "business" && session.step === "phone") {
      const contact = message.contact;
      if (contact.user_id != null && contact.user_id !== user.id) {
        await reply(
          chatId,
          "Потрібно поділитися саме своїм номером.\n\n" + stepPrompt.phone,
          phoneMenu,
        );
        return;
      }
      if (!contact.phone_number) {
        await reply(chatId, "Не вдалося прочитати номер. Спробуйте ще раз або введіть вручну.", phoneMenu);
        return;
      }
      const phone = contact.phone_number.startsWith("+")
        ? contact.phone_number
        : `+${contact.phone_number}`;
      await acceptPhone(chatId, session, phone);
      return;
    }
    await showMainMenu(chatId, "Оберіть дію кнопкою нижче:");
    return;
  }

  if (!text) {
    const session = getSession(chatId);
    if (session?.kind === "admin" || session?.kind === "admin_outreach") {
      if (isAdmin(user)) {
        await handleAdminUpdate(chatId, user, "/admin");
      } else {
        clearSession(chatId);
        await showMainMenu(chatId, "Оберіть дію кнопкою нижче:");
      }
      return;
    }
    if (session?.kind === "business") {
      await reply(chatId, "Надішліть текстом.\n\n" + stepPrompt[session.step], menuForStep(session.step));
    } else if (session?.kind === "feedback") {
      await reply(chatId, "Надішліть, будь ласка, текстом.", cancelMenu);
    } else {
      await showMainMenu(chatId, "Оберіть дію кнопкою нижче:");
    }
    return;
  }

  const session = getSession(chatId);
  if (!session || session.kind === "admin" || session.kind === "admin_outreach") {
    await showMainMenu(chatId, "Оберіть дію кнопкою нижче:");
    return;
  }

  if (text.length > MAX_TEXT) {
    await reply(
      chatId,
      `Текст занадто довгий (макс. ${MAX_TEXT} символів). Скоротіть і надішліть ще раз.`,
      session.kind === "business" ? menuForStep(session.step) : cancelMenu,
    );
    return;
  }

  if (session.kind === "business") {
    await handleBusinessStep(chatId, user, session, text);
    return;
  }

  await deliverResidentFeedback(chatId, user, text);
}
