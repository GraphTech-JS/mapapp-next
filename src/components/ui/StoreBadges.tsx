import { useTranslations } from "next-intl";
import { site } from "@/config/site";

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true" className="size-[26px] flex-none">
    <path d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.9-.8-3.1-.8C6.8 7.2 5.3 8.2 4.5 9.6c-1.7 2.9-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.1.8c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.7-1-2.7-4zM14.2 5.6c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3z" />
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[26px] flex-none">
    <path d="M4 3.5v17l9-8.5z" fill="#FFB27A" />
    <path d="M4 3.5l12.2 6.9L13 12z" fill="#fff" />
    <path d="M4 20.5l12.2-6.9L13 12z" fill="#FF6B1A" />
    <path d="M16.2 10.4L20 12.5l-3.8 2.1L13 12z" fill="#FFD3B5" />
  </svg>
);

export default function StoreBadges({ className = "" }: { className?: string }) {
  const t = useTranslations("stores");
  const items = [
    { url: site.iosUrl, icon: <AppleIcon />, small: t("appStore"), big: "App Store" },
    { url: site.androidUrl, icon: <PlayIcon />, small: t("googlePlay"), big: "Google Play" },
  ];

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {items.map((s) => {
        const soon = !s.url;
        const content = (
          <>
            {s.icon}
            <span className="leading-tight">
              <small className="block text-[11px] opacity-75">{soon ? t("soon") : s.small}</small>
              <span className="text-[17px] font-semibold">{s.big}</span>
            </span>
          </>
        );

        if (soon) {
          return (
            <span
              key={s.big}
              aria-label={`${s.big}: ${t("launchSoon")}`}
              className="relative inline-flex min-w-[178px] cursor-default overflow-hidden rounded-[14px] bg-ink py-2.5 pr-5 pl-3.5 text-white max-[400px]:w-full"
            >
              <span aria-hidden className="inline-flex items-center gap-3 blur-[2.5px] opacity-55">
                {content}
              </span>
              <span className="pointer-events-none absolute inset-0 grid place-items-center bg-ink/25">
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink shadow-[0_6px_16px_-8px_rgba(0,0,0,.45)]">
                  {t("launchSoon")}
                </span>
              </span>
            </span>
          );
        }

        return (
          <a
            key={s.big}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-[178px] items-center gap-3 rounded-[14px] bg-ink py-2.5 pr-5 pl-3.5 text-white transition hover:-translate-y-[3px] hover:bg-[#2c211b] max-[400px]:w-full"
          >
            {content}
          </a>
        );
      })}
    </div>
  );
}
