import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import type { Vars } from "./rich";
import type { Locale } from "@/i18n/routing";

export async function getSiteVars(locale: Locale): Promise<Vars> {
  const t = await getTranslations({ locale });
  return {
    app: site.app,
    company: site.company,
    companyId: site.companyId,
    address: site.address,
    email: site.email,
    emailPlain: site.email,
    domain: site.domain,
    mapProvider: site.mapProvider,
    dbRegion: t("legal.dbRegion"),
    minAge: site.minAge,
    processors: t.raw("legal.processors") as string,
    deleteSubject: t("legal.deleteSubject", { app: site.app }),
  };
}
