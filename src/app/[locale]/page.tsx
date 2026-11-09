import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import Problem from "@/components/sections/Problem";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import ForBusiness from "@/components/sections/ForBusiness";
import Complexes from "@/components/sections/Complexes";
import Faq from "@/components/sections/Faq";
import About from "@/components/sections/About";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(
    hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
  );
  return (
    <main>
      <Hero />
      <Marquee />
      <Problem />
      <Features />
      <ForBusiness />
      <Complexes />
      <HowItWorks />
      <Faq />
      <About />
    </main>
  );
}
