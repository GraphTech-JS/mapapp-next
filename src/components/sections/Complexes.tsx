import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import SectionHead from "@/components/ui/SectionHead";
import { COMPLEXES, LAYOUTS } from "@/config/complexes";
import ComplexRequestModal from "./ComplexRequestModal";
import Modal from "@/components/ui/Modal";
import StoreBadges from "@/components/ui/StoreBadges";

function Plan({ layout }: { layout: keyof typeof LAYOUTS }) {
  const l = LAYOUTS[layout];
  return (
    <svg viewBox="0 0 440 440" aria-hidden className="h-full w-full">
      <rect width="440" height="440" rx="28" fill="#FFF8F3" />
      {l.roads.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#FFE6D4" />
      ))}
      <rect
        x={l.park.x}
        y={l.park.y}
        width={l.park.w}
        height={l.park.h}
        rx="14"
        fill="#FFE9DA"
      />
      <path
        d={l.route}
        fill="none"
        stroke="#FF6B1A"
        strokeWidth="5"
        strokeDasharray="10 10"
        strokeLinecap="round"
      />
      {l.buildings.map(([x, y, w, d, , biz], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={d}
          rx="5"
          fill={biz ? "#FF6B1A" : "#fff"}
          stroke={biz ? "#E0520A" : "#F2E1D3"}
          strokeWidth="3"
        />
      ))}
      {l.pinBuildings.map((bi, i) => {
        const [x, y, w, d] = l.buildings[bi];
        return (
          <circle
            key={i}
            cx={x + w / 2}
            cy={y + d / 2}
            r="11"
            fill="#1C1410"
            stroke="#fff"
            strokeWidth="4"
          />
        );
      })}
    </svg>
  );
}

export default async function Complexes() {
  const t = await getTranslations("complexes");
  const steps = t.raw("request.steps") as string[];
  return (
    <section id="complexes" className="pb-12 sm:pb-16">
      <Container>
        <SectionHead
          eyebrow={t("eyebrow")}
          title={t("title")}
          text={t("text")}
          className="mb-6 sm:mb-8"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COMPLEXES.map((c) => {
            const connecting = c.id === "dibrova";
            return (
              <article
                key={c.id}
                className="reveal flex flex-col overflow-hidden rounded-[28px] border border-line bg-white"
              >
                <div className="relative aspect-[16/10] bg-tint p-5">
                  <div className="mx-auto h-full max-w-[220px]">
                    <Plan layout={c.layout} />
                  </div>
                  <span
                    className={`absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-sm ${connecting ? "text-orange-deep" : "text-ok"}`}
                  >
                    <i
                      className={`size-2 animate-blink rounded-full ${connecting ? "bg-orange" : "bg-ok"}`}
                    />
                    {connecting ? t("connecting") : t("live")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <h3 className="text-xl font-bold">
                    {t(`items.${c.id}.name`)}
                  </h3>
                  <p className="text-[15.5px] text-ink-2">
                    {t(`items.${c.id}.text`)}
                  </p>
                  <div className="mt-auto pt-3">
                    <Modal
                      trigger={`${t("open")} →`}
                      label={t("openModal.title", {
                        name: t(`items.${c.id}.name`),
                      })}
                      triggerClassName="text-left text-[15px] font-semibold text-orange-deep hover:text-orange"
                    >
                      <div className="flex flex-col gap-5">
                        <div className="pr-10">
                          <h3 className="text-2xl font-bold">
                            {t("openModal.title", {
                              name: t(`items.${c.id}.name`),
                            })}
                          </h3>
                          <p className="mt-2 text-[15px] text-ink-2">
                            {t("openModal.text", {
                              name: t(`items.${c.id}.name`),
                            })}
                          </p>
                        </div>
                        <StoreBadges />
                      </div>
                    </Modal>
                  </div>
                </div>
              </article>
            );
          })}

          <article className="reveal flex flex-col gap-4 rounded-[28px] border-2 border-dashed border-orange-soft bg-tint p-6 md:col-span-2 lg:col-span-1">
            <span className="grid size-12 place-items-center rounded-2xl bg-orange text-2xl font-bold text-white">
              +
            </span>
            <h3 className="text-xl font-bold">{t("request.title")}</h3>
            <p className="text-[15.5px] text-ink-2">{t("request.text")}</p>
            <ol className="grid gap-2.5">
              {steps.map((s, i) => (
                <li
                  key={s}
                  className="flex items-start gap-3 text-[15px] font-medium"
                >
                  <span className="grid size-6 flex-none place-items-center rounded-full bg-white font-display text-xs font-bold text-orange-deep">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            <ComplexRequestModal />
          </article>
        </div>
      </Container>
    </section>
  );
}
