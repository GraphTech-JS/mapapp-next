import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import type { Vars } from "./rich";
import type { Locale } from "@/i18n/routing";

export async function getSiteVars(locale: Locale): Promise<Vars> {
  const t = await getTranslations({ locale });
  return {
    app: site.app,
    company: site.company,
    owner: t("legal.owner"),
    companyId: t("legal.ownerId"),
    address: t("legal.ownerAddress"),
    email: site.email,
    emailPlain: site.email,
    domain: site.domain,
    mapProvider: t("legal.mapProvider"),
    dbRegion: t("legal.dbRegion"),
    minAge: site.minAge,
    processors: t.raw("legal.processors") as string,
    deleteSubject: t("legal.deleteSubject", { app: site.app }),
  };
}
