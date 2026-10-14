import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildContacts } from "@/lib/crm";
import { repo } from "@/lib/repo";

function csv(rows: (string | number | undefined | null)[][]) {
  return "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
}

/** Exporta CSV (abre directo en Excel) de personas, leads o inscritos de una sesión. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return new NextResponse("No autorizado", { status: 401 });
  const { kind } = await params;
  let rows: (string | number | undefined | null)[][] = [];
  let name = kind;

  if (kind === "personas") {
    const contacts = await buildContacts();
    rows = [
      ["Nombre", "Correo", "Teléfono", "Reservas", "Total gastado", "Actividades", "Privacidad", "Responsiva", "Uso de imagen", "Alta"],
      ...contacts.map((c) => [c.fullName, c.email, c.phone, c.bookings, c.spent, c.tags.join(" | "), c.consents?.privacy ?? "", c.consents?.waiver ?? "", c.consents?.image ?? "", c.createdAt]),
    ];
  } else if (kind === "leads") {
    const leads = await repo.listLeads();
    rows = [
      ["Empresa", "Contacto", "Puesto", "Correo", "Teléfono", "Colaboradores", "Programa", "Estado", "Valor", "Fuente", "Fecha", "Mensaje"],
      ...leads.map((l) => [l.company, l.contactName, l.role, l.email, l.phone, l.employees, l.programTitle, l.status, l.value, l.source, l.createdAt, l.message]),
    ];
  } else if (kind === "inscritos") {
    const sessionId = req.nextUrl.searchParams.get("session") ?? "";
    const list = await repo.listBookings({ sessionId });
    name = `inscritos-${sessionId}`;
    rows = [
      ["Boleto", "Nombre", "Correo", "Teléfono", "Tipo", "Talla", "Estado", "Asistencia"],
      ...list.map((b) => [b.code, b.attendeeName, b.email, b.phone, b.ticketName, b.shirtSize, b.status, b.checkedInAt ?? ""]),
    ];
  } else {
    return new NextResponse("No encontrado", { status: 404 });
  }

  return new NextResponse(csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="empowerme-${name}.csv"`,
    },
  });
}
