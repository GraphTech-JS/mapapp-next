# QMaply: промо-лендінг

Next.js 16 (App Router) + Tailwind CSS v4 + next-intl. Мови: українська (`/`) і англійська (`/en`).

Лендінг універсальний для багатьох ЖК. Зараз підключені ЖК «Варшавський» (перший запуск) і ЖК «Dibrova park».

## Запуск

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run i18n:check   # перевірка, що в усіх мовах однакові ключі перекладу
npm run typecheck
```

Node.js 20.9 або новіший.

## Що заповнити перед рев'ю в App Store і Google Play

`src/config/site.ts`:

| Поле | Що це |
|---|---|
| `url` | Домен сайту (або змінна `SITE_URL`) |
| `company`, `companyId`, `address` | ФОП / ТОВ, ЄДРПОУ або РНОКПП, юридична адреса |
| `email` | Email підтримки |
| `iosUrl`, `androidUrl` | Посилання на сторінки в сторах. Поки пусті, кнопки показують «Незабаром» |
| `effectiveDate` | Дата набрання чинності політик |
| `minAge` | Мінімальний вік користувача |

Поки значення починається з `[`, воно підсвічується на сайті як незаповнене.
Список сервісів, що обробляють дані, задається ключем `legal.processors` у `messages/*.json`.

## Посилання для консолей сторів

| Поле | URL |
|---|---|
| Privacy Policy (Apple, Google) | `https://qmaply.com/privacy` |
| Support URL (Apple) | `https://qmaply.com/support` |
| Marketing URL (Apple) | `https://qmaply.com/` |
| Delete account URL (Google Play → Data safety) | `https://qmaply.com/delete-account` |
| Terms / EULA | `https://qmaply.com/terms` |
| Правила контенту (UGC, Apple 1.2) | `https://qmaply.com/content-rules` |

Англійські версії доступні з префіксом `/en/...`.

## Переклади

- `messages/uk.json` є базовою мовою, а ключі в ній типізовані: TypeScript підкаже, якщо ключа немає.
- `messages/en.json` повторює ту саму структуру. `npm run i18n:check` покаже відсутні або зайві ключі.
- Щоб додати мову: створіть `messages/<код>.json`, додайте код у `src/i18n/routing.ts` (`locales`) і підпис у `LanguageSwitcher.tsx`.
- Масиви (списки, FAQ, піни на карті) читаються через `t.raw()`.
- Розмітка в текстах політик, FAQ і «Про нас»: `**жирний**`, `[текст](/privacy)` (посилання з урахуванням мови), `{app}`, `{company}`, `{email}`, `{complex}`, `{minAge}`, `{address}`, `{companyId}`, `{processors}`.
- Документи (`legal.docs.*.blocks`) описані блоками: `p`, `h2`, `h3`, `note`, `ul`, `steps`, `table`, `copy`.

## Структура

```
messages/              переклади uk / en
src/app/[locale]/      головна, [doc]: privacy | terms | content-rules | delete-account | support
src/app/sitemap.ts     sitemap.xml для обох мов
src/components/
  layout/              Header (мобільне меню), Footer, LanguageSwitcher
  sections/            Hero, IsoMap (3D-мапа з перемикачем ЖК), Marquee, Problem, Features,
                       ForBusiness (переваги для бізнесу), Complexes (ЖК і заявка), HowItWorks, Faq, About
  phones/              макети екранів застосунку
  legal/               рендер документів, кнопка копіювання
src/config/            site.ts (дані компанії), complexes.ts (ЖК і планування), legal.ts (список документів)
src/i18n/              routing, navigation, request
src/proxy.ts           визначення мови (Next 16: proxy замість middleware)
```

## Житлові комплекси

Список ЖК задається в `src/config/complexes.ts`. Звідти беруться перемикач на 3D-карті в hero і картки в секції «Де працює QMaply».

Щоб додати новий ЖК:
1. Додайте запис у `COMPLEXES`: `{ id: "nazva", layout: "a" | "b", badge: "new" }`. Можна намалювати й нове планування в `LAYOUTS`: будинки задаються як `[x, y, ширина, глибина, висота, чи є бізнес]` на площині 440×440.
2. У кожному `messages/*.json` додайте `complexes.items.<id>` з полями `name`, `text` і `pins` (5 демо-закладів для анімації).
3. Перевірте переклади: `npm run i18n:check`.

## Іконки

`src/app/favicon.ico` (16/32/48), `src/app/icon.svg`, `src/app/apple-icon.png` (180×180) і `src/app/manifest.ts`
з іконками 192/512 та maskable 512 у `public/`. Next.js сам додає потрібні `<link>` у `<head>`.
Вихідні SVG для перегенерації: `src/app/icon.svg` (з заокругленням) і `design/icon-square.svg` (на весь квадрат).

## Деплой

Vercel: імпортуйте репозиторій, змінну `SITE_URL` встановіть на свій домен. Шрифти (Unbounded, Onest, JetBrains Mono) лежать у самому проєкті через `@fontsource`, тож Google Fonts не потрібні.
