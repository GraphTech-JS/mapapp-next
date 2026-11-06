import dns from "node:dns";
import https from "node:https";

// api.telegram.org frequently resets IPv6 from some hosts (ECONNRESET).
dns.setDefaultResultOrder("ipv4first");

type SendOpts = {
  chatId?: string | number;
  replyMarkup?: Record<string, unknown>;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function postJson(
  url: string,
  body: string,
): Promise<{ ok: boolean; status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || 443,
        path: `${u.pathname}${u.search}`,
        method: "POST",
        family: 4,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          const status = res.statusCode ?? 0;
          resolve({ ok: status >= 200 && status < 300, status, text });
        });
      },
    );

    req.setTimeout(12_000, () => {
      req.destroy(new Error("telegram request timeout"));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export async function sendTelegramMessage(
  text: string,
  opts: SendOpts = {},
): Promise<boolean | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = opts.chatId ?? process.env.TELEGRAM_CHAT_ID;
  if (!token || chatId === undefined || chatId === "") return null;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(opts.replyMarkup ? { reply_markup: opts.replyMarkup } : {}),
  });

  const attempts = 3;
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      const res = await postJson(url, body);
      if (res.ok) return true;
      console.error("telegram: sendMessage error", res.status, res.text);
      if (res.status < 500 && res.status !== 429) return false;
    } catch (error) {
      lastError = error;
      console.error(`telegram: sendMessage unreachable (try ${i + 1}/${attempts})`, error);
    }
    if (i < attempts - 1) await sleep(400 * (i + 1));
  }

  if (lastError) console.error("telegram: sendMessage failed after retries", lastError);
  return false;
}
