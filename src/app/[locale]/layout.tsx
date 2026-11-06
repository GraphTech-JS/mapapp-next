import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/config/site";
import { COMPLEXES } from "@/config/complexes";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieNotice from "@/components/layout/CookieNotice";
import JsonLd from "@/components/seo/JsonLd";
import "../globals.css";

import "@fontsource-variable/unbounded";
import "@fontsource-variable/onest";
import "@fontsource/jetbrains-mono/500.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#FF6B1A", viewportFit: "cover" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");
  const canonical = locale === routing.defaultLocale ? "/" : `/${locale}`;
  const ogLocale = locale === "uk" ? "uk_UA" : "en_US";

  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s · ${site.app}` },
    description,
    keywords: t("keywords"),
    applicationName: site.app,
    authors: [{ name: site.company, url: site.url }],
    creator: site.company,
    publisher: site.company,
    category: "lifestyle",
    alternates: {
      canonical,
      languages: { uk: "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: site.app,
      title,
      description,
      locale: ogLocale,
      alternateLocale: locale === "uk" ? ["en_US"] : ["uk_UA"],
      images: [
        {
          url: "/og.jpg",
          width: 1280,
          height: 720,
          alt: t("ogAlt"),
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: "/og.jpg", alt: t("ogAlt") }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    other: {
      "geo.region": site.geo.region,
      "geo.placename": site.geo.placename,
      "geo.position": site.geo.position,
      ICBM: site.geo.icbm,
    },
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const tMeta = await getTranslations({ locale, namespace: "meta" });
  const tComplexes = await getTranslations({ locale, namespace: "complexes" });
  const complexNames = Object.fromEntries(
    COMPLEXES.map((c) => [c.id, tComplexes(`items.${c.id}.name`)]),
  );

  return (
    <html lang={locale}>
      <body>
        <JsonLd
          locale={locale}
          title={tMeta("title")}
          description={tMeta("description")}
          complexNames={complexNames}
        />
        <NextIntlClientProvider>
          <Header />
          {children}
          <Footer />
          <CookieNotice />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
