import { COMPLEXES } from "@/config/complexes";
import { site } from "@/config/site";

type Props = {
  locale: string;
  title: string;
  description: string;
  complexNames: Record<string, string>;
};

export default function JsonLd({ locale, title, description, complexNames }: Props) {
  const pageUrl = locale === "uk" ? site.url : `${site.url}/${locale}`;
  const places = COMPLEXES.map((c) => ({
    "@type": "Place" as const,
    "@id": `${site.url}/#complex-${c.id}`,
    name: complexNames[c.id] ?? c.id,
    geo: {
      "@type": "GeoCoordinates",
      latitude: c.geo.latitude,
      longitude: c.geo.longitude,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: c.geo.streetAddress,
      addressLocality: c.geo.addressLocality,
      addressRegion: c.geo.addressRegion,
      postalCode: c.geo.postalCode,
      addressCountry: c.geo.addressCountry,
    },
  }));

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.company,
        url: site.url,
        email: site.email,
        logo: `${site.url}/icon-512.png`,
        areaServed: {
          "@type": "City",
          name: "Kyiv",
          containedInPlace: { "@type": "Country", name: "Ukraine" },
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.app,
        description,
        inLanguage: ["uk", "en"],
        publisher: { "@id": `${site.url}/#organization` },
      },
      {
        "@type": "WebApplication",
        "@id": `${site.url}/#app`,
        name: site.app,
        url: site.url,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "iOS, Android",
        description,
        image: `${site.url}/og.jpg`,
        inLanguage: locale,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "UAH",
        },
        provider: { "@id": `${site.url}/#organization` },
        spatialCoverage: places.map((p) => ({ "@id": p["@id"] })),
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: title,
        description,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#app` },
        primaryImageOfPage: `${site.url}/og.jpg`,
        inLanguage: locale,
      },
      ...places,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
