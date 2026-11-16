import type { OutreachStatus } from "@/lib/telegram/outreach-constants";

export type BusinessStep = "complex" | "business" | "name" | "phone" | "comment";

export type AdminOutreachStep =
  | "complex"
  | "business"
  | "category"
  | "category_custom"
  | "contact"
  | "name"
  | "position"
  | "status"
  | "comment";

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
    }
  | {
      kind: "admin";
    }
  | {
      kind: "admin_outreach";
      step: AdminOutreachStep;
      complex?: string;
      business?: string;
      category?: string;
      contact?: string;
      personName?: string;
      position?: string;
      status?: OutreachStatus;
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
