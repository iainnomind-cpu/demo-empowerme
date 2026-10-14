import { Mail } from "lucide-react";
import { Badge, Card, PageHead } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/site/SocialIcons";
import { dateTime } from "@/lib/format";
import { repo } from "@/lib/repo";

export const metadata = { title: "Envíos" };

export default async function EnviosPage() {
  const list = await repo.listNotifications();
  return (
    <>
      <PageHead title="Envíos" sub="Confirmaciones de registro enviadas por correo y WhatsApp." />
      <div className="mb-6 rounded-2xl bg-sun/30 p-4 text-sm ring-1 ring-sun/50">
        Sin llaves de Resend o de WhatsApp Cloud API, los mensajes se marcan como <b>simulado</b>: se generan igual que en producción
        pero no salen. Al configurar las variables de entorno se envían de verdad.
      </div>
      {list.length === 0 ? (
        <Card className="p-10 text-center text-muted">Aún no hay envíos. Haz una compra de prueba en el sitio para ver la confirmación aquí.</Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((n) => (
            <Card key={n.id} className="p-5">
              <div className="flex items-center gap-3">
                <span className={`grid size-9 place-items-center rounded-full ${n.channel === "whatsapp" ? "bg-sage/50" : "bg-pink/50"}`}>
                  {n.channel === "whatsapp" ? <WhatsAppIcon className="size-4" /> : <Mail className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{n.to}</p>
                  <p className="text-xs text-muted">{dateTime(n.createdAt)} · {n.ref}</p>
                </div>
                <Badge tone={n.status === "enviado" ? "good" : n.status === "error" ? "brand" : "warn"}>{n.status}</Badge>
              </div>
              {n.subject && <p className="mt-3 text-sm font-semibold">{n.subject}</p>}
              <pre className={`mt-3 whitespace-pre-wrap rounded-xl p-4 font-sans text-sm leading-relaxed ${n.channel === "whatsapp" ? "bg-[#e7f6dd]" : "bg-cream"}`}>{n.body}</pre>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
