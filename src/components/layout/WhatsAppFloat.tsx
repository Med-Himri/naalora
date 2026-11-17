import { WhatsAppIcon } from "../icons";

export default function WhatsAppFloat({ href, label, ariaLabel }: { href: string; label: string; ariaLabel: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="group fixed bottom-4 end-4 z-40 flex h-14 items-center gap-2 rounded-full bg-whatsapp px-4 text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-[#17834a] sm:bottom-6 sm:end-6"
    >
      <WhatsAppIcon width={26} height={26} />
      <span className="hidden text-sm font-semibold sm:inline">{label}</span>
    </a>
  );
}
