"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import FormModal, { fieldCls, labelCls } from "@/components/ui/FormModal";

export default function BusinessRequestModal({ trigger, triggerClassName }: { trigger: ReactNode; triggerClassName: string }) {
  const t = useTranslations("business.request");
  return (
    <FormModal endpoint="/api/business-request" ns="business.request" trigger={trigger} triggerClassName={triggerClassName}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          {t("complex")} *
          <input name="complex" required maxLength={120} placeholder={t("complexPh")} className={fieldCls} />
        </label>
        <label className={labelCls}>
          {t("business")} *
          <input name="business" required maxLength={120} placeholder={t("businessPh")} className={fieldCls} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          {t("name")} *
          <input name="name" required maxLength={80} autoComplete="name" className={fieldCls} />
        </label>
        <label className={labelCls}>
          {t("contact")} *
          <input
            name="contact"
            required
            maxLength={64}
            autoComplete="tel"
            pattern="(\+?[0-9\s\-\(\)]{10,20})|((https?://)?(t\.me/)?@?[A-Za-z0-9_]{5,32})"
            title={t("contactPh")}
            placeholder={t("contactPh")}
            className={fieldCls}
          />
        </label>
      </div>
      <label className={labelCls}>
        {t("comment")}
        <textarea name="comment" rows={3} maxLength={1000} placeholder={t("commentPh")} className={`${fieldCls} resize-none`} />
      </label>
    </FormModal>
  );
}
