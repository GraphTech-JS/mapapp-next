export type BusinessStep = "complex" | "business" | "name" | "phone" | "comment";

export type SessionDraft =
  | {
      kind: "feedback";
      role: "resident";
    }
  | {
      kind: "business";
      step: BusinessStep;
      complex?: string;
      business?: string;
      name?: string;
      phone?: string;
    };

export type Session = SessionDraft & { updatedAt: number };

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

export function setSession(chatId: number, draft: SessionDraft) {
  sessions.set(chatId, { ...draft, updatedAt: Date.now() });
}

export function clearSession(chatId: number) {
  sessions.delete(chatId);
}
