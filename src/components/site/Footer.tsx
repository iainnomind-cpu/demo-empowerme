import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Wave } from "@/components/brand/Wave";
import { InstagramIcon, WhatsAppIcon } from "@/components/site/SocialIcons";
import { site } from "@/content/site";
import { env } from "@/lib/env";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-16 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="space-y-6">
            <Logo className="text-[2.2rem]" />
            <p className="max-w-xs text-sm leading-relaxed text-paper/70">
              {site.tagline} Experiencias y programas de bienestar integral desde {site.city}.
            </p>
            <div className="flex gap-2">
              <a href={site.instagram} target="_blank" rel="noreferrer" className="grid size-11 place-items-center rounded-full ring-1 ring-white/20 transition hover:bg-white hover:text-ink" aria-label="Instagram">
                <InstagramIcon className="size-5" />
              </a>
              <a href={`https://wa.me/${env.whatsapp}`} target="_blank" rel="noreferrer" className="grid size-11 place-items-center rounded-full ring-1 ring-white/20 transition hover:bg-white hover:text-ink" aria-label="WhatsApp">
                <WhatsAppIcon className="size-5" />
              </a>
            </div>
          </div>
          <FooterCol
            title="Experiencias"
            links={[
              ["Calendario", "/experiencias"],
              ["Clases", "/experiencias?tipo=clase"],
              ["Talleres", "/experiencias?tipo=taller"],
              ["Carreras", "/experiencias?tipo=carrera"],
            ]}
          />
          <FooterCol
            title="Empowerme"
            links={[
              ["Nosotros", "/#nosotros"],
              ["Programas para empresas", "/programas"],
              ["Comunidad", "/#comunidad"],
              ["Mi cuenta", "/cuenta"],
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              ["Aviso de privacidad", "/legal/aviso-de-privacidad"],
              ["Uso de imagen", "/legal/uso-de-imagen"],
              ["Carta responsiva", "/legal/responsiva"],
            ]}
          />
        </div>
        <Wave className="mt-16 h-8 w-full text-brand" arches={30} strokeWidth={2} />
        <div className="mt-6 flex flex-col justify-between gap-2 text-xs text-paper/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.legalName} · {site.city}</p>
          <p>El movimiento nos volvió comunidad.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow mb-4 text-paper/50">{title}</p>
      <ul className="space-y-2.5">
        {links.map(([l, h]) => (
          <li key={h}>
            <Link href={h} className="text-sm text-paper/85 transition hover:text-white hover:underline underline-offset-4">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
