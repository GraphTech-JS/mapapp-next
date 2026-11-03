export type FeedbackRole = "resident" | "business";

export type Session = {
  role: FeedbackRole;
  updatedAt: number;
};

const TTL_MS = 60 * 60_000;
const sessions = new Map<number, Session>();

function prune(now = Date.now()) {
  for (const [chatId, session] of sessions) {
    if (now - session.updatedAt > TTL_MS) sessions.delete(chatId);
  }
}

export function getSession(chatId: number): Session | undefined {
  prune();
  const session = sessions.get(chatId);
  if (!session) return undefined;
  if (Date.now() - session.updatedAt > TTL_MS) {
    sessions.delete(chatId);
    return undefined;
  }
  return session;
}

export function setSession(chatId: number, role: FeedbackRole) {
  sessions.set(chatId, { role, updatedAt: Date.now() });
}

export function clearSession(chatId: number) {
  sessions.delete(chatId);
}
