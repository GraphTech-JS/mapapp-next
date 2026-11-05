import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import SectionHead from "@/components/ui/SectionHead";
// import { FreshScreen } from "@/components/phones/Screens";
import { PhoneScreenshot } from "@/components/phones/Phone";
import AddFormDemo from "@/components/phones/AddFormDemo";
import MapZoomDemo from "@/components/phones/MapZoomDemo";
import SearchDemo from "@/components/phones/SearchDemo";
import NotifyDemo from "@/components/phones/NotifyDemo";

const ITEMS = [
  {
    key: "map",
    screen: (
      <PhoneScreenshot src="/screens/map-v3.png" alt="QMaply" width={860} height={1747}>
        <MapZoomDemo src="/screens/map-v3-layer.jpg" mask="/screens/map-v3-mask.png" />
      </PhoneScreenshot>
    ),
  },
  {
    key: "add",
    screen: (
      <PhoneScreenshot src="/screens/add-v2.png" alt="QMaply" width={860} height={1747}>
        <AddFormDemo />
      </PhoneScreenshot>
    ),
  },
  // { key: "fresh", screen: <FreshScreen /> },
  {
    key: "search",
    screen: (
      <PhoneScreenshot src="/screens/search-phone.png" alt="QMaply" width={424} height={865}>
        <SearchDemo src="/screens/search-phone.png" />
      </PhoneScreenshot>
    ),
  },
  {
    key: "notify",
    screen: (
      <PhoneScreenshot src="/screens/news-qmap.png" alt="QMaply" width={424} height={865}>
        <NotifyDemo />
      </PhoneScreenshot>
    ),
  },
] as const satisfies readonly { key: string; screen: ReactNode }[];

export default async function Features() {
  const t = await getTranslations("features");
  return (
    <section id="features" className="pt-6 pb-12 sm:pb-16">
      <Container>
        <SectionHead eyebrow={t("eyebrow")} title={t("title")} text={t("text")} className="mb-4 sm:mb-6" />
        {ITEMS.map(({ key, screen }, i) => {
          const ticks = t.raw(`items.${key}.ticks`) as string[];
          const rev = i % 2 === 1;
          return (
            <article
              key={key}
              className={`group reveal grid items-center gap-6 md:grid-cols-2 md:gap-12 ${i ? "border-t border-line py-8 md:py-10" : "pt-2 pb-8 md:pb-10"}`}
            >
              <div className={`flex min-w-0 flex-col gap-4 ${rev ? "md:order-2" : ""}`}>
                <span className="eyebrow">{t(`items.${key}.eyebrow`)}</span>
                <h3 className="text-[clamp(24px,2.8vw,36px)] font-bold">{t(`items.${key}.title`)}</h3>
                <p className="max-w-[32em] text-[17.5px] text-ink-2">{t(`items.${key}.text`)}</p>
                <ul className="tick-list mt-1.5 grid gap-2.5">{ticks.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div className="relative grid min-w-0 place-items-center">
                <div aria-hidden className="absolute aspect-square w-[78%] max-w-[420px] rounded-full bg-[radial-gradient(circle,var(--color-tint-2),transparent_70%)]" />
                {screen}
              </div>
            </article>
          );
        })}
      </Container>
    </section>
  );
}
