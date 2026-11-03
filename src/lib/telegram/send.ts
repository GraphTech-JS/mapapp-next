type SendOpts = {
  chatId?: string | number;
  replyMarkup?: Record<string, unknown>;
};

export async function sendTelegramMessage(
  text: string,
  opts: SendOpts = {},
): Promise<boolean | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = opts.chatId ?? process.env.TELEGRAM_CHAT_ID;
  if (!token || chatId === undefined || chatId === "") return null;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...(opts.replyMarkup ? { reply_markup: opts.replyMarkup } : {}),
      }),
    });
    if (!res.ok) console.error("telegram: sendMessage error", res.status, await res.text());
    return res.ok;
  } catch (error) {
    console.error("telegram: sendMessage unreachable", error);
    return false;
  }
}
