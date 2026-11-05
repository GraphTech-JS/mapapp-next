import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <main>
      <Container className="flex flex-col items-start gap-5 py-24">
        <span className="eyebrow">404</span>
        <h1 className="text-4xl font-bold">QMaply</h1>
        <Link href="/" className="rounded-full bg-orange px-6 py-3.5 font-semibold text-white">← QMaply</Link>
      </Container>
    </main>
  );
}
