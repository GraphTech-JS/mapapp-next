import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import Modal from "@/components/ui/Modal";
import StoreBadges from "@/components/ui/StoreBadges";
import BusinessQuestionModal from "./BusinessQuestionModal";
import BusinessRequestModal from "./BusinessRequestModal";
import Container from "@/components/ui/Container";
import { PhoneScreenshot } from "@/components/phones/Phone";
import AddFormDemo from "@/components/phones/AddFormDemo";
import PostDemo from "@/components/phones/PostDemo";

type Perk = { icon: string; title: string; text: string };

const ICONS: Record<string, ReactNode> = {
  gift: <><path d="M20 12v8H4v-8" /><path d="M2 7h20v5H2z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17.5" cy="9" r="2.5" /><path d="M16 14.2a5 5 0 0 1 5.5 4.8" /></>,
  bell: <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  tag: <><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  sliders: <><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 6-7" /></>,
};

export default async function ForBusiness() {
  const t = await getTranslations("business");
  const perks = t.raw("perks") as Perk[];
  const steps = t.raw("steps") as string[];
  const postSteps = t.raw("post.steps") as string[];
  return (
    <section id="business" className="pb-12 sm:pb-16">
      <Container>
        <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,var(--color-orange),#FF8C45_60%,#FFA466)] px-5 py-8 text-white sm:px-10 sm:py-10 md:rounded-[40px] lg:px-14">
          <div className="flex min-w-0 flex-col gap-4">
            <span className="font-mono text-[12.5px] uppercase tracking-[0.12em] text-white/80">{t("eyebrow")}</span>
            <h2 className="text-[clamp(28px,3.6vw,46px)] font-bold">{t("title")}</h2>
            <p className="max-w-[34em] text-lg text-white/90">{t("text")}</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {perks.map((p, i) => (
                <li key={p.title} className="reveal flex gap-3.5 rounded-[20px] border border-white/25 bg-white/12 p-4 backdrop-blur-sm">
                  <span className="grid size-10 flex-none place-items-center rounded-xl bg-white text-orange-deep">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden>{ICONS[p.icon] ?? ICONS.gift}</svg>
                  </span>
                  <div className="min-w-0">
                    <b className="block text-[16.5px] leading-snug">{p.title}</b>
                    <span className="text-[14.5px] leading-snug text-white/85">{p.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="group mt-8 grid gap-8 rounded-[24px] bg-white p-5 text-ink sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <b className="font-display text-xl">{t("stepsTitle")}</b>
              <div className="flex flex-wrap gap-2.5">
                <Modal
                  trigger={t("cta")}
                  label={t("add.title")}
                  triggerClassName="rounded-full bg-orange px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-deep"
                >
                  <div className="flex flex-col gap-5">
                    <div className="pr-10">
                      <h3 className="text-2xl font-bold">{t("add.title")}</h3>
                      <p className="mt-2 text-[15px] text-ink-2">{t("add.text")}</p>
                    </div>
                    <StoreBadges />
                    <ol className="grid gap-2.5">
                      {steps.map((step, i) => (
                        <li key={step} className="flex items-start gap-3 text-[15px] font-medium">
                          <span className="grid size-7 flex-none place-items-center rounded-full bg-orange font-display text-[13px] font-bold text-white">{i + 1}</span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                    <p className="text-sm text-ink-3">{t("note")}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-4 text-[15px] text-ink-2">
                      {t("add.formText")}
                      <BusinessRequestModal
                        trigger={`${t("add.formCta")} →`}
                        triggerClassName="font-semibold text-orange-deep hover:text-orange"
                      />
                    </div>
                  </div>
                </Modal>
                <BusinessQuestionModal trigger={t("ctaAlt")} />
              </div>
            </div>
            <ol className="grid gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-1 lg:gap-3">
              {steps.map((s, i) => (
                <li key={s} className="flex items-start gap-3 rounded-2xl bg-tint p-4 text-[15px] font-medium">
                  <span className="grid size-7 flex-none place-items-center rounded-full bg-orange font-display text-[13px] font-bold text-white">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <p className="text-sm text-ink-3">{t("note")}</p>
          </div>
          <div className="relative grid min-w-0 place-items-center">
            <div aria-hidden className="absolute aspect-square w-[78%] max-w-[380px] rounded-full bg-[radial-gradient(circle,var(--color-tint-2),transparent_70%)]" />
            <PhoneScreenshot src="/screens/add-v2.png" alt="QMaply" width={860} height={1747}>
              <AddFormDemo />
            </PhoneScreenshot>
          </div>
          </div>

          <div className="group mt-4 grid gap-8 rounded-[24px] bg-white p-5 text-ink sm:p-7 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-12">
          <div className="flex min-w-0 flex-col gap-5 lg:order-2">
            <b className="font-display text-xl">{t("post.title")}</b>
            <ol className="grid gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-1 lg:gap-3">
              {postSteps.map((s, i) => (
                <li key={s} className="flex items-start gap-3 rounded-2xl bg-tint p-4 text-[15px] font-medium">
                  <span className="grid size-7 flex-none place-items-center rounded-full bg-orange font-display text-[13px] font-bold text-white">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <p className="text-sm text-ink-3">{t("post.note")}</p>
          </div>
          <div className="relative grid min-w-0 place-items-center">
            <div aria-hidden className="absolute aspect-square w-[78%] max-w-[380px] rounded-full bg-[radial-gradient(circle,var(--color-tint-2),transparent_70%)]" />
            <PhoneScreenshot src="/screens/post-v1.png" alt="QMaply" width={860} height={1747}>
              <PostDemo />
            </PhoneScreenshot>
          </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
