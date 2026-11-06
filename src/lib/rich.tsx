import { Fragment, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { isPlaceholder, site } from "@/config/site";

export type Vars = Record<string, string | number>;

const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\{[a-zA-Z]+\})/g;

function renderVar(name: string, vars: Vars, key: string): ReactNode {
  const value = vars[name];
  if (value === undefined) return `{${name}}`;
  const str = String(value);
  if (isPlaceholder(str)) return <span key={key} className="ph">{str}</span>;
  if (name === "email")
    return (
      <a key={key} href={`mailto:${str}`} className="text-orange-deep underline underline-offset-3">
        {str}
      </a>
    );
  if (name === "company" && site.companyUrl)
    return (
      <a key={key} href={site.companyUrl} target="_blank" rel="noopener noreferrer" className="text-orange-deep underline underline-offset-3 hover:text-orange">
        {str}
      </a>
    );
  return <Fragment key={key}>{str}</Fragment>;
}

export function rich(text: string, vars: Vars = {}): ReactNode[] {
  return text.split(TOKEN).filter(Boolean).map((part, i) => {
    const key = `${i}`;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={key} className="font-semibold text-ink">{rich(part.slice(2, -2), vars)}</strong>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const cls = "text-orange-deep underline underline-offset-3 hover:text-orange";
      return href.startsWith("/") ? (
        <Link key={key} href={href} className={cls}>{label}</Link>
      ) : (
        <a key={key} href={href} className={cls} target="_blank" rel="noopener noreferrer">{label}</a>
      );
    }
    const v = part.match(/^\{([a-zA-Z]+)\}$/);
    if (v) return renderVar(v[1], vars, key);
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export function interpolate(text: string, vars: Vars): string {
  return text.replace(/\{([a-zA-Z]+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}
