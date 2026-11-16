import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { OutreachStatus } from "@/lib/telegram/outreach-constants";
import { OUTREACH_STATUSES } from "@/lib/telegram/outreach-constants";

export type OutreachRecord = {
  complex: string;
  business: string;
  category: string;
  contact: string;
  personName: string;
  position: string;
  status: OutreachStatus;
  comment: string;
  createdBy: number;
};

export type StatusCounts = Record<OutreachStatus, number> & { total: number };

let db: DatabaseSync | null = null;

function kyivDay(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function dbPath() {
  return process.env.OUTREACH_DB_PATH || path.join(process.cwd(), "data", "outreach.sqlite");
}

function getDb() {
  if (db) return db;
  const file = dbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  db = new DatabaseSync(file);
  db.exec(`
    CREATE TABLE IF NOT EXISTS outreach (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complex TEXT NOT NULL,
      business TEXT NOT NULL,
      category TEXT NOT NULL,
      contact TEXT NOT NULL,
      person_name TEXT NOT NULL,
      position TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL,
      comment TEXT NOT NULL DEFAULT '',
      created_by INTEGER NOT NULL,
      created_day TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_outreach_day ON outreach(created_day);
    CREATE INDEX IF NOT EXISTS idx_outreach_status ON outreach(status);
  `);
  return db;
}

export function insertOutreach(record: OutreachRecord) {
  const database = getDb();
  database
    .prepare(
      `INSERT INTO outreach
        (complex, business, category, contact, person_name, position, status, comment, created_by, created_day)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      record.complex,
      record.business,
      record.category,
      record.contact,
      record.personName,
      record.position,
      record.status,
      record.comment,
      record.createdBy,
      kyivDay(),
    );
}

function emptyCounts(): StatusCounts {
  return { added: 0, contact_passed: 0, not_interested: 0, total: 0 };
}

function countsFor(whereSql: string, params: Array<string | number> = []): StatusCounts {
  const database = getDb();
  const rows = database
    .prepare(`SELECT status, COUNT(*) AS c FROM outreach ${whereSql} GROUP BY status`)
    .all(...params) as Array<{ status: string; c: number }>;

  const counts = emptyCounts();
  for (const row of rows) {
    if (row.status in OUTREACH_STATUSES) {
      counts[row.status as OutreachStatus] = Number(row.c);
      counts.total += Number(row.c);
    }
  }
  return counts;
}

export function outreachStats() {
  return {
    today: countsFor("WHERE created_day = ?", [kyivDay()]),
    all: countsFor(""),
    dayLabel: kyivDay(),
  };
}
