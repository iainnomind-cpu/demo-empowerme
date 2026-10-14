import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { SpotsBar, TypeChip } from "@/components/ui";
import { dayNum, monthShort, mxn, time, weekdayShort } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ActivityWithSessions, Session } from "@/lib/types";

/** Tarjeta de experiencia con fecha tipo "dorsal" y cupo visible. */
export function ActivityCard({
  activity,
  session,
  className,
  priority,
}: {
  activity: ActivityWithSessions;
  session?: Session;
  className?: string;
  priority?: boolean;
}) {
  const s = session ?? activity.sessions.find((x) => new Date(x.startsAt) > new Date());
  const minPrice = Math.min(...activity.tickets.map((t) => t.price));
  const moreDates = activity.mode === "recurrente" ? activity.sessions.filter((x) => new Date(x.startsAt) > new Date()).length - 1 : 0;

  return (
    <Link
      href={`/experiencias/${activity.slug}${session ? `?fecha=${session.id}` : ""}`}
      className={cn("group flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgb(27_23_20/0.35)]", className)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        <Image
          src={activity.image}
          alt=""
          fill
          priority={priority}
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          unoptimized={activity.image.startsWith("data:")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
        {s && (
          <div className="absolute left-3 top-3 rounded-xl bg-paper px-3 py-2 text-center shadow-sm">
            <span className="eyebrow block !text-[0.58rem] text-muted">{weekdayShort(s.startsAt)}</span>
            <span className="display block text-[2rem] leading-[0.85]">{dayNum(s.startsAt)}</span>
            <span className="eyebrow block !text-[0.58rem]">{monthShort(s.startsAt)}</span>
          </div>
        )}
        <TypeChip type={activity.type} className="absolute right-3 top-3" />
        <span className="absolute bottom-3 right-3 grid size-10 translate-y-2 place-items-center rounded-full bg-paper text-ink opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-5" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="display text-[1.9rem] leading-[0.9]">{activity.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{activity.tagline}</p>
        </div>
        <div className="mt-auto space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            {s && <span className="font-medium text-ink">{time(s.startsAt)}</span>}
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {activity.location.name}
            </span>
            {moreDates > 0 && <span className="text-ink">+{moreDates} fechas</span>}
          </div>
          {s && <SpotsBar capacity={s.capacity} booked={s.booked} />}
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm text-muted">{activity.tickets.length > 1 ? "Desde" : activity.mode === "recurrente" ? "Por clase" : "Registro"}</span>
            <span className="text-lg font-bold tabular">{mxn(minPrice)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
