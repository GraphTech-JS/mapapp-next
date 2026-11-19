import { callTelegram } from "@/lib/telegram/send";

type TgUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

export type TgCallbackQuery = {
  id: string;
  from: TgUser;
  data?: string;
  message?: { message_id: number; chat: { id: number } };
};

type Action = "approve" | "reject" | "confirm-reject" | "back";

const PREFIX = "biz:";

function keyboard(rows: Array<Array<{ text: string; data: string }>>) {
  return {
    inline_keyboard: rows.map((row) =>
      row.map(({ text, data }) => ({ text, callback_data: data })),
    ),
  };
}

function decisionKeyboard(placeId: string) {
  return keyboard([
    [
      { text: "✅ Прийняти", data: `${PREFIX}approve:${placeId}` },
      { text: "❌ Відхилити", data: `${PREFIX}reject:${placeId}` },
    ],
  ]);
}

function confirmRejectKeyboard(placeId: string) {
  return keyboard([
    [
      { text: "❌ Так, відхилити", data: `${PREFIX}confirm-reject:${placeId}` },
      { text: "↩️ Назад", data: `${PREFIX}back:${placeId}` },
    ],
  ]);
}

function parse(data: string | undefined) {
  if (!data?.startsWith(PREFIX)) return null;
  const rest = data.slice(PREFIX.length);
  const split = rest.indexOf(":");
  if (split < 0) return null;
  const action = rest.slice(0, split) as Action;
  const placeId = rest.slice(split + 1);
  if (!["approve", "reject", "confirm-reject", "back"].includes(action) || !placeId) {
    return null;
  }
  return { action, placeId };
}

function displayName(user: TgUser) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name || (user.username ? `@${user.username}` : `id ${user.id}`);
}

async function answer(query: TgCallbackQuery, text: string, alert = false) {
  await callTelegram("answerCallbackQuery", {
    callback_query_id: query.id,
    text,
    show_alert: alert,
  });
}

async function setKeyboard(
  query: TgCallbackQuery,
  replyMarkup: ReturnType<typeof keyboard>,
) {
  if (!query.message) return;
  await callTelegram("editMessageReplyMarkup", {
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    reply_markup: replyMarkup,
  });
}

async function decide(placeId: string, action: "approve" | "reject", by: string) {
  const api = process.env.QMAP_API_URL;
  const secret = process.env.QMAP_MODERATION_SECRET;
  if (!api || !secret) {
    return { ok: false as const, error: "not_configured" };
  }
  try {
    const res = await fetch(`${api.replace(/\/$/, "")}/v1/telegram/moderation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-qmap-moderation-secret": secret,
      },
      body: JSON.stringify({ placeId, action, by }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      placeName?: string;
      changed?: boolean;
    };
    if (!res.ok) return { ok: false as const, error: body.error ?? `http_${res.status}` };
    return { ok: true as const, placeName: body.placeName ?? "", changed: body.changed ?? false };
  } catch (error) {
    console.error("telegram moderation: api unreachable", error);
    return { ok: false as const, error: "unreachable" };
  }
}

const ERROR_TEXT: Record<string, string> = {
  place_not_found: "Заявку не знайдено — можливо, її вже видалили.",
  not_configured: "Модерацію з Telegram не налаштовано (QMAP_MODERATION_SECRET).",
  unauthorized: "Сервер відхилив запит: перевірте QMAP_MODERATION_SECRET.",
};

export async function handleModerationCallback(query: TgCallbackQuery) {
  const parsed = parse(query.data);
  if (!parsed) return false;

  const moderationChat = process.env.TELEGRAM_CHAT_ID;
  if (!query.message || String(query.message.chat.id) !== moderationChat) {
    await answer(query, "Ця кнопка працює лише в чаті заявок.", true);
    return true;
  }

  const { action, placeId } = parsed;

  if (action === "reject") {
    await setKeyboard(query, confirmRejectKeyboard(placeId));
    await answer(query, "Підтвердіть відхилення");
    return true;
  }
  if (action === "back") {
    await setKeyboard(query, decisionKeyboard(placeId));
    await answer(query, "Скасовано");
    return true;
  }

  const result = await decide(
    placeId,
    action === "approve" ? "approve" : "reject",
    displayName(query.from),
  );
  if (!result.ok) {
    await answer(query, ERROR_TEXT[result.error] ?? "Не вдалося. Спробуйте в адмінці.", true);
    return true;
  }
  if (!result.changed) {
    await setKeyboard(query, keyboard([]));
  }
  await answer(
    query,
    result.changed
      ? action === "approve"
        ? `Прийнято: ${result.placeName}`
        : `Відхилено: ${result.placeName}`
      : "Рішення вже ухвалене раніше",
  );
  return true;
}
