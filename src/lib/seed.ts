import { media } from "@/content/site";
import { mxIso, shortCode } from "@/lib/format";
import { presets } from "@/content/marketing";
import type {
  ActivityWithSessions,
  Booking,
  Campaign,
  Lead,
  Notification,
  Order,
  Profile,
  Program,
  Session,
} from "@/lib/types";

/** Datos de ejemplo. Las fechas se generan a partir de hoy para que la demo nunca "caduque". */

type YMD = { y: number; m: number; d: number };

function todayMx(): YMD {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" })
    .format(new Date())
    .split("-")
    .map(Number);
  return { y: p[0], m: p[1], d: p[2] };
}

function addDays(a: YMD, n: number): YMD {
  const t = new Date(Date.UTC(a.y, a.m - 1, a.d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

/** Próximas `count` fechas que caen en `weekday` (0=dom) a partir de mañana. */
function nextWeekdays(weekday: number, count: number, startOffset = 1): YMD[] {
  const out: YMD[] = [];
  let cur = addDays(todayMx(), startOffset);
  while (out.length < count) {
    const wd = new Date(Date.UTC(cur.y, cur.m - 1, cur.d)).getUTCDay();
    if (wd === weekday) out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

function session(activityId: string, idx: number, day: YMD, h: number, min: number, dur: number, capacity: number, booked: number): Session {
  const startsAt = mxIso(day.y, day.m, day.d, h, min);
  const endsAt = new Date(new Date(startsAt).getTime() + dur * 60000).toISOString();
  return { id: `${activityId}-s${idx}`, activityId, startsAt, endsAt, capacity, booked };
}

const created = new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString();

export function seedActivities(): ActivityWithSessions[] {
  const sundays = nextWeekdays(0, 12);
  const saturdays = nextWeekdays(6, 12);
  const tuesdays = nextWeekdays(2, 10);
  const thursdays = nextWeekdays(4, 10);
  const wednesdays = nextWeekdays(3, 10);
  const mondays = nextWeekdays(1, 6, 3);

  const list: ActivityWithSessions[] = [];

  // 1 · Wellness Morning — experiencia de domingo
  {
    const id = "act-wellness-morning";
    const days = [sundays[0], sundays[2], sundays[5], sundays[8]];
    list.push({
      id,
      slug: "wellness-morning",
      title: "Wellness Morning",
      type: "clase",
      mode: "unica",
      tagline: "Un domingo para moverte, convivir y recargar energía con la comunidad.",
      description:
        "Nuestra experiencia insignia. Arrancamos con una clase funcional al aire libre, seguimos con un circuito de convivencia y cerramos con coffee break y sorteo de marcas aliadas. Ven sola, con amigas o con tu familia: aquí todas las personas suman.\n\nCada edición tiene un coach invitado y una causa distinta. No necesitas experiencia previa: adaptamos cada ejercicio a tu nivel.",
      includes: ["Clase funcional guiada", "Coffee break saludable", "Dinámica y circuito de convivencia", "Sorteo con marcas aliadas", "Fotos del evento"],
      image: media.classCrowd,
      location: { name: "Bosque Los Colomos", address: "Av. Patria s/n, Providencia, Guadalajara, Jal.", mapsUrl: "https://maps.google.com/?q=Bosque+Los+Colomos+Guadalajara" },
      coach: "Coach invitado + equipo Empowerme",
      durationMin: 150,
      level: "Todos los niveles",
      tickets: [{ id: "general", name: "Registro general", price: 180, description: "Incluye clase, coffee y sorteo" }],
      faqs: [
        { q: "¿Qué debo llevar?", a: "Ropa cómoda, tenis, botella de agua y tapete si tienes. Nosotros ponemos el resto." },
        { q: "¿Y si llueve?", a: "Te avisamos por WhatsApp con 24 h de anticipación si cambiamos de sede o de fecha. Tu registro se respeta." },
        { q: "¿Puedo ir con niñas o niños?", a: "Sí, a partir de 12 años con registro propio y acompañados de una persona adulta." },
      ],
      requiresShirtSize: false,
      published: true,
      featured: true,
      createdAt: created,
      sessions: days.map((d, i) => session(id, i, d, 8, 0, 150, 120, [94, 41, 12, 3][i])),
    });
  }

  // 2 · Yoga al amanecer — recurrente mar/jue
  {
    const id = "act-yoga-amanecer";
    const days = [...tuesdays.slice(0, 8), ...thursdays.slice(0, 8)].sort((a, b) => a.y - b.y || a.m - b.m || a.d - b.d);
    list.push({
      id,
      slug: "yoga-al-amanecer",
      title: "Yoga al amanecer",
      type: "clase",
      mode: "recurrente",
      tagline: "Vinyasa suave para empezar el día con el cuerpo despierto y la mente en calma.",
      description:
        "Clases de 60 minutos al aire libre, martes y jueves a primera hora. Fluimos con la respiración, trabajamos movilidad y cerramos con una meditación breve.\n\nElige las fechas que te funcionan en el calendario: puedes reservar una clase suelta o varias a la vez.",
      includes: ["Clase de 60 min", "Tapete disponible si no tienes", "Té de cortesía al terminar"],
      image: media.yogaPark,
      location: { name: "Parque Metropolitano", address: "Av. Beethoven 5800, Zapopan, Jal.", mapsUrl: "https://maps.google.com/?q=Parque+Metropolitano+Guadalajara" },
      coach: "Coach de yoga Empowerme",
      durationMin: 60,
      level: "Principiante – intermedio",
      tickets: [{ id: "clase", name: "Clase suelta", price: 150 }],
      faqs: [
        { q: "Nunca he hecho yoga, ¿puedo ir?", a: "Claro. Damos variantes para cada postura y la coach te acompaña." },
        { q: "¿Puedo cambiar mi fecha?", a: "Sí, hasta 12 horas antes escribiéndonos por WhatsApp." },
      ],
      requiresShirtSize: false,
      published: true,
      featured: true,
      createdAt: created,
      sessions: days.map((d, i) => session(id, i, d, 7, 0, 60, 25, [22, 25, 14, 9, 6, 3, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0][i] ?? 0)),
    });
  }

  // 3 · Pilates & Funcional — sábados
  {
    const id = "act-pilates-funcional";
    list.push({
      id,
      slug: "pilates-funcional",
      title: "Pilates & Funcional",
      type: "clase",
      mode: "recurrente",
      tagline: "Core, fuerza y control en una clase de sábado que se siente toda la semana.",
      description:
        "Combinamos pilates mat con bloques de fuerza funcional. Una clase intensa pero amable, pensada para construir fuerza real y cuidar tu postura.\n\nCupo limitado para que la coach pueda corregir a cada persona.",
      includes: ["Clase de 55 min", "Material incluido (ligas, mancuernas)", "Hidratación"],
      image: media.dumbbells,
      location: { name: "Estudio aliado · Providencia", address: "Av. Providencia 2500, Guadalajara, Jal." },
      coach: "Coach certificada en pilates",
      durationMin: 55,
      level: "Intermedio",
      tickets: [{ id: "clase", name: "Clase suelta", price: 160 }],
      faqs: [{ q: "¿Qué nivel necesito?", a: "Ideal si ya haces ejercicio 1–2 veces por semana. Si es tu primera vez, avísanos." }],
      requiresShirtSize: false,
      published: true,
      featured: false,
      createdAt: created,
      sessions: saturdays.slice(0, 10).map((d, i) => session(id, i, d, 9, 0, 55, 18, [18, 15, 10, 4, 2, 0, 0, 0, 0, 0][i])),
    });
  }

  // 4 · SocialRun — miércoles, gratis
  {
    const id = "act-socialrun";
    list.push({
      id,
      slug: "socialrun",
      title: "SocialRun",
      type: "carrera",
      mode: "recurrente",
      tagline: "Correr acompañada se siente distinto. 5K a ritmo de conversación, cada miércoles.",
      description:
        "Nuestro club de corrida gratuito. Salimos en grupos por ritmo (6:00, 6:30 y 7:00 min/km) para que nadie se quede atrás. Al final, estiramiento y convivencia.\n\nRegístrate para que podamos contarte y avisarte de cualquier cambio de ruta.",
      includes: ["Ruta de 5K guiada", "Pacers por grupo de ritmo", "Estiramiento al final"],
      image: media.runIndoor,
      location: { name: "Glorieta Chapalita", address: "Av. Guadalupe y Av. Las Rosas, Guadalajara, Jal." },
      coach: "Pacers Empowerme",
      durationMin: 75,
      level: "Todos los ritmos",
      tickets: [{ id: "libre", name: "Registro libre", price: 0 }],
      faqs: [{ q: "¿Tiene costo?", a: "No. SocialRun es gratis; solo pedimos registro para cuidar el cupo y tu seguridad." }],
      requiresShirtSize: false,
      published: true,
      featured: false,
      createdAt: created,
      sessions: wednesdays.slice(0, 8).map((d, i) => session(id, i, d, 19, 30, 75, 60, [38, 21, 9, 4, 0, 0, 0, 0][i])),
    });
  }

  // 5 · Relay 12K — carrera en relevos
  {
    const id = "act-relay-12k";
    const d = sundays[4];
    list.push({
      id,
      slug: "relay-12k",
      title: "Relay 12K",
      type: "carrera",
      mode: "unica",
      tagline: "Carrera en relevos: tres personas, 4K cada una, una sola meta.",
      description:
        "Arma tu equipo de tres y corran 12K en relevos de 4K sobre pista. Es la carrera más divertida del año: porras, música y una meta que se cruza en equipo.\n\nTu registro incluye kit de corredor con playera técnica, número, hidratación y medalla. Te enviamos tu número y la información del kit por WhatsApp o correo, como prefieras.",
      includes: ["Playera técnica oficial", "Número de corredor con chip", "Medalla finisher", "Hidratación y fruta", "Fotos oficiales"],
      image: media.track,
      location: { name: "Pista Olímpica", address: "Unidad Deportiva, Guadalajara, Jal. [confirmar sede]" },
      durationMin: 180,
      level: "Todos los niveles",
      tickets: [
        { id: "individual", name: "Relevista individual (4K)", price: 350, description: "Te asignamos equipo" },
        { id: "equipo", name: "Equipo de 3 (12K)", price: 990, description: "Registra a tu equipo completo" },
      ],
      faqs: [
        { q: "¿Cuándo recojo mi kit?", a: "El viernes y sábado previos. Te enviamos lugar y horario con tu número de corredor." },
        { q: "¿Puedo inscribirme sin equipo?", a: "Sí, con el registro individual te asignamos equipo según tu ritmo." },
        { q: "¿Hay reembolsos?", a: "No hay reembolsos, pero puedes transferir tu lugar hasta 7 días antes." },
      ],
      requiresShirtSize: true,
      published: true,
      featured: true,
      createdAt: created,
      sessions: [session(id, 0, d, 7, 0, 180, 240, 168)],
    });
  }

  // 6 · Santa Run — carrera navideña
  {
    const id = "act-santa-run";
    const dec = nextWeekdays(0, 20).find((x) => x.m === 12 && x.d >= 7) ?? sundays[8];
    list.push({
      id,
      slug: "santa-run",
      title: "Santa Run",
      type: "carrera",
      mode: "unica",
      tagline: "5K y 10K con gorro de Santa, causa social y la meta más festiva de Guadalajara.",
      description:
        "Nuestra carrera navideña. Corre o camina 5K o 10K con cientos de Santas, música y una causa: parte de cada registro se dona a una fundación local.\n\n¿Eres una marca que impulsa el bienestar? Escríbenos para ser patrocinador.",
      includes: ["Gorro y playera Santa Run", "Número de corredor", "Medalla navideña", "Hidratación", "Donativo a causa social"],
      image: media.raceRoad,
      location: { name: "Paseo Chapultepec", address: "Av. Chapultepec, Americana, Guadalajara, Jal." },
      durationMin: 150,
      level: "Todos los niveles",
      tickets: [
        { id: "5k", name: "5K", price: 420 },
        { id: "10k", name: "10K", price: 480 },
      ],
      faqs: [
        { q: "¿Puedo caminar?", a: "¡Sí! Hay bloque de caminata en la ruta de 5K." },
        { q: "¿Mi registro es deducible?", a: "La parte del donativo puede facturarse. Escríbenos después de tu compra." },
      ],
      requiresShirtSize: true,
      published: true,
      featured: true,
      createdAt: created,
      sessions: [session(id, 0, dec, 7, 30, 150, 400, 136)],
    });
  }

  // 7 · Taller Breathwork & Journaling
  {
    const id = "act-breathwork";
    list.push({
      id,
      slug: "breathwork-journaling",
      title: "Breathwork & Journaling",
      type: "taller",
      mode: "unica",
      tagline: "Respiración consciente y escritura guiada para soltar lo que pesa.",
      description:
        "Un taller íntimo de dos horas. Aprendemos técnicas de respiración para regular el sistema nervioso y las llevamos a la escritura con ejercicios de journaling.\n\nTe llevas un cuaderno Empowerme y una guía para seguir practicando en casa.",
      includes: ["Sesión guiada de breathwork", "Cuaderno Empowerme", "Guía digital de práctica", "Infusiones y snack"],
      image: media.circle,
      location: { name: "Casa Empowerme · Americana", address: "Col. Americana, Guadalajara, Jal. [confirmar]" },
      coach: "Facilitadora invitada",
      durationMin: 120,
      level: "Abierto",
      tickets: [{ id: "general", name: "Lugar en el taller", price: 450 }],
      faqs: [{ q: "¿Es seguro el breathwork?", a: "Es una práctica suave. Si tienes alguna condición cardiaca, respiratoria o estás embarazada, indícalo en tu registro." }],
      requiresShirtSize: false,
      published: true,
      featured: false,
      createdAt: created,
      sessions: [session(id, 0, saturdays[1], 17, 0, 120, 20, 13), session(id, 1, saturdays[5], 17, 0, 120, 20, 2)],
    });
  }

  // 8 · Taller Nutrición
  {
    const id = "act-nutricion";
    list.push({
      id,
      slug: "nutricion-mujeres-activas",
      title: "Nutrición para mujeres activas",
      type: "taller",
      mode: "unica",
      tagline: "Come para tener energía: hábitos reales, sin dietas extremas.",
      description:
        "Taller práctico con nutrióloga: cómo armar tu plato según tu entrenamiento, qué comer antes y después de correr y cómo leer etiquetas sin volverte loca.",
      includes: ["Taller de 2 h con nutrióloga", "Plantilla de menú semanal", "Degustación"],
      image: media.workshop,
      location: { name: "Casa Empowerme · Americana", address: "Col. Americana, Guadalajara, Jal. [confirmar]" },
      coach: "Nutrióloga invitada",
      durationMin: 120,
      level: "Abierto",
      tickets: [{ id: "general", name: "Lugar en el taller", price: 390 }],
      faqs: [],
      requiresShirtSize: false,
      published: true,
      featured: false,
      createdAt: created,
      sessions: [session(id, 0, mondays[2], 19, 0, 120, 24, 7)],
    });
  }

  // 9 · Círculo UNIDAS
  {
    const id = "act-unidas";
    list.push({
      id,
      slug: "circulo-unidas",
      title: "Círculo UNIDAS",
      type: "taller",
      mode: "recurrente",
      tagline: "Un espacio mensual para conversar, sostenernos y crecer juntas.",
      description:
        "UNIDAS es nuestro círculo de mujeres. Cada mes elegimos un tema — autoestima, límites, propósito — y lo trabajamos con dinámicas, movimiento suave y conversación honesta.",
      includes: ["Círculo guiado de 2 h", "Dinámica de movimiento", "Té y snack"],
      image: media.handsUp,
      location: { name: "Casa Empowerme · Americana", address: "Col. Americana, Guadalajara, Jal. [confirmar]" },
      coach: "Liz Lozano + invitada",
      durationMin: 120,
      level: "Abierto",
      tickets: [{ id: "general", name: "Lugar en el círculo", price: 250 }],
      faqs: [],
      requiresShirtSize: false,
      published: true,
      featured: false,
      createdAt: created,
      sessions: [thursdays[1], thursdays[5], thursdays[9]].map((d, i) => session(id, i, d, 19, 30, 120, 30, [17, 4, 0][i])),
    });
  }

  return list;
}

export function seedPrograms(): Program[] {
  return [
    {
      id: "prg-muevete",
      slug: "muevete-en-equipo",
      title: "Muévete en equipo",
      durationDays: 30,
      tagline: "El reto que pone a toda la empresa en movimiento.",
      description:
        "Un reto de 30 días que combina clases in-company, retos semanales de actividad y un ranking por equipos. Diseñado para elevar energía, convivencia y sentido de pertenencia.",
      pillars: ["Movimiento", "Convivencia", "Hábitos"],
      includes: ["8 clases in-company (presencial u online)", "Retos semanales por equipos", "Ranking y dinámica de premiación", "Kick-off y cierre con evento", "Reporte de participación"],
      outcomes: ["Participación activa medible", "Mejor clima laboral", "Hábito de movimiento sostenido"],
      image: media.officeCheer,
      format: "Presencial · Híbrido",
      color: "brand",
      published: true,
      sort: 1,
    },
    {
      id: "prg-calma",
      slug: "mente-en-calma",
      title: "Mente en calma",
      durationDays: 30,
      tagline: "Herramientas reales para gestionar el estrés en el trabajo.",
      description:
        "Breathwork, mindfulness y talleres de regulación emocional para equipos con alta carga. Cuatro semanas para bajar el ruido y recuperar foco.",
      pillars: ["Respiración", "Foco", "Salud mental"],
      includes: ["4 talleres de breathwork y mindfulness", "Pausas activas guiadas (audio)", "Guía de prácticas diarias", "Sesión de cierre", "Encuesta de bienestar pre y post"],
      outcomes: ["Menor estrés percibido", "Mejor concentración", "Lenguaje común sobre bienestar"],
      image: media.yogaFour,
      format: "Presencial · Online",
      color: "sage",
      published: true,
      sort: 2,
    },
    {
      id: "prg-nutre",
      slug: "nutre-tu-energia",
      title: "Nutre tu energía",
      durationDays: 30,
      tagline: "Hábitos de alimentación que se notan en la energía del equipo.",
      description:
        "Talleres con nutrióloga, retos de hábitos e hidratación y un recetario práctico para oficina. Sin dietas: decisiones sencillas que se sostienen.",
      pillars: ["Nutrición", "Hidratación", "Hábitos"],
      includes: ["3 talleres con nutrióloga", "Reto de hábitos con app de seguimiento", "Recetario de oficina", "Feria saludable de cierre"],
      outcomes: ["Mejores hábitos diarios", "Más energía en la jornada", "Cultura de autocuidado"],
      image: media.teamLaptop,
      format: "Presencial",
      color: "sun",
      published: true,
      sort: 3,
    },
    {
      id: "prg-wellness-day",
      slug: "wellness-day",
      title: "Wellness Day corporativo",
      durationDays: 1,
      tagline: "Un día de experiencias de bienestar para tu equipo.",
      description:
        "Llevamos la experiencia Wellness Morning a tu empresa: clase, talleres simultáneos, activaciones con marcas y una convivencia que tu equipo va a recordar.",
      pillars: ["Experiencia", "Integración", "Marca empleadora"],
      includes: ["Clase masiva de apertura", "2–3 talleres simultáneos", "Activaciones y coffee break", "Cobertura foto y video"],
      outcomes: ["Integración de equipos", "Contenido para marca empleadora", "Arranque de una cultura de bienestar"],
      image: media.teamOutdoor,
      format: "Presencial",
      color: "pink",
      published: true,
      sort: 4,
    },
  ];
}

export function seedPeople(activities: ActivityWithSessions[]) {
  const people: Profile[] = [
    ["Andrea González", "andrea.gonzalez@example.com", "3312345678"],
    ["Daniela Pérez", "daniela.perez@example.com", "3323456789"],
    ["Fernanda Ruiz", "fer.ruiz@example.com", "3334567890"],
    ["Sofía Martínez", "sofia.mtz@example.com", "3345678901"],
    ["Valeria Torres", "vale.torres@example.com", "3356789012"],
    ["Ximena López", "xime.lopez@example.com", "3367890123"],
    ["Carlos Medina", "carlos.medina@example.com", "3378901234"],
    ["Paola Hernández", "paola.hdz@example.com", "3389012345"],
  ].map(([fullName, email, phone], i) => ({
    id: `usr-demo-${i + 1}`,
    email,
    fullName,
    phone,
    // Daniela cumple años hoy para que la automatización de felicitaciones tenga a quién saludar.
    birthdate: i === 1 ? birthdayToday(1996) : `199${i}-0${(i % 9) + 1}-1${i}`,
    role: "user" as const,
    tags: [],
    consents: { version: "2026-01", privacy: created, image: created, waiver: created },
    marketing: i === 6 ? { optIn: false } : { optIn: true, at: created },
    createdAt: new Date(Date.now() - (60 - i * 5) * 86400000).toISOString(),
  }));

  const orders: Order[] = [];
  const bookings: Booking[] = [];
  const picks: [number, string, number, string][] = [
    [0, "act-wellness-morning", 0, "general"],
    [0, "act-yoga-amanecer", 0, "clase"],
    [1, "act-relay-12k", 0, "equipo"],
    [2, "act-wellness-morning", 0, "general"],
    [2, "act-breathwork", 0, "general"],
    [3, "act-santa-run", 0, "10k"],
    [4, "act-yoga-amanecer", 1, "clase"],
    [4, "act-pilates-funcional", 0, "clase"],
    [5, "act-socialrun", 0, "libre"],
    [6, "act-relay-12k", 0, "individual"],
    [7, "act-unidas", 0, "general"],
    [7, "act-wellness-morning", 1, "general"],
  ];

  picks.forEach(([pi, actId, si, ticketId], n) => {
    const p = people[pi];
    const a = activities.find((x) => x.id === actId)!;
    const s = a.sessions[si];
    const t = a.tickets.find((x) => x.id === ticketId)!;
    const code = shortCode("EM");
    const createdAt = new Date(Date.now() - (n * 2 + 1) * 86400000 - n * 3600000).toISOString();
    const order: Order = {
      id: `ord-demo-${n + 1}`,
      code,
      userId: p.id,
      email: p.email,
      fullName: p.fullName,
      phone: p.phone,
      channel: n % 3 === 0 ? "whatsapp" : "email",
      status: "pagado",
      total: t.price,
      items: [{ activityId: a.id, title: a.title, sessionId: s.id, startsAt: s.startsAt, ticketName: t.name, unitPrice: t.price, qty: 1, shirtSize: a.requiresShirtSize ? "M" : undefined }],
      provider: t.price === 0 ? "gratis" : "demo",
      createdAt,
      paidAt: createdAt,
    };
    orders.push(order);
    bookings.push({
      id: `bk-demo-${n + 1}`,
      code: shortCode("BO"),
      orderId: order.id,
      orderCode: order.code,
      userId: p.id,
      activityId: a.id,
      activityTitle: a.title,
      sessionId: s.id,
      startsAt: s.startsAt,
      attendeeName: p.fullName,
      email: p.email,
      phone: p.phone,
      ticketName: t.name,
      shirtSize: order.items[0].shirtSize,
      status: "pagado",
      createdAt,
    });
  });

  // Ventas históricas (sin boletos individuales) para que el dashboard tenga forma.
  for (let i = 0; i < 26; i++) {
    const daysAgo = 2 + Math.floor((i * 29) / 26);
    const a = activities[i % activities.length];
    const t = a.tickets[a.tickets.length - 1];
    if (t.price === 0) continue;
    const qty = 1 + (i % 3);
    const createdAt = new Date(Date.now() - daysAgo * 86400000 - (i % 7) * 3600000).toISOString();
    orders.push({
      id: `ord-hist-${i}`,
      code: shortCode("EM"),
      userId: people[i % people.length].id,
      email: people[i % people.length].email,
      fullName: people[i % people.length].fullName,
      phone: people[i % people.length].phone,
      channel: "email",
      status: "pagado",
      total: t.price * qty,
      items: [{ activityId: a.id, title: a.title, sessionId: a.sessions[0].id, startsAt: a.sessions[0].startsAt, ticketName: t.name, unitPrice: t.price, qty }],
      provider: "demo",
      createdAt,
      paidAt: createdAt,
    });
  }

  return { people, orders, bookings };
}

export function seedLeads(): Lead[] {
  const d = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
  return [
    { id: "lead-1", company: "Grupo Altamira", contactName: "Mariana Ríos", role: "Gerente de People", email: "mariana@altamira.example", phone: "3311112222", employees: "201–500", programId: "prg-muevete", programTitle: "Muévete en equipo", message: "Queremos arrancar en enero con 3 sedes.", status: "nuevo", value: 85000, notes: [], source: "Sitio web", createdAt: d(1) },
    { id: "lead-2", company: "Tequila Cielo Azul", contactName: "Jorge Castañeda", role: "Director de RH", email: "jorge@cieloazul.example", employees: "51–200", programId: "prg-calma", programTitle: "Mente en calma", status: "contactado", value: 48000, notes: [{ at: d(3), text: "Llamada inicial. Les interesa formato online para planta.", author: "Liz" }], source: "Sitio web", createdAt: d(5) },
    { id: "lead-3", company: "Fintech Jalisco", contactName: "Ana Paula Vega", role: "Employee Experience", email: "ana@fintechjal.example", employees: "51–200", programId: "prg-wellness-day", programTitle: "Wellness Day corporativo", status: "propuesta", value: 62000, notes: [{ at: d(6), text: "Enviada propuesta para 120 personas.", author: "Liz" }], source: "Recomendación", createdAt: d(10) },
    { id: "lead-4", company: "Hospital San Rafael", contactName: "Dra. Leticia Mora", email: "lmora@sanrafael.example", employees: "500+", programId: "prg-nutre", programTitle: "Nutre tu energía", status: "ganado", value: 120000, notes: [{ at: d(12), text: "Firmado. Arranque 3 de noviembre.", author: "Liz" }], source: "Sitio web", createdAt: d(20) },
    { id: "lead-5", company: "Estudio Lumen", contactName: "Rafael Ochoa", email: "rafa@lumen.example", employees: "1–50", programId: "prg-muevete", programTitle: "Muévete en equipo", status: "perdido", value: 18000, notes: [{ at: d(15), text: "Sin presupuesto este año. Retomar en febrero.", author: "Liz" }], source: "Instagram", createdAt: d(25) },
    { id: "lead-6", company: "Universidad del Valle", contactName: "Karla Núñez", email: "knunez@udv.example", employees: "500+", programTitle: "Muévete en equipo", programId: "prg-muevete", status: "nuevo", notes: [], source: "Sitio web", createdAt: d(0) },
  ];
}

function birthdayToday(year: number) {
  const t = todayMx();
  return `${year}-${String(t.m).padStart(2, "0")}-${String(t.d).padStart(2, "0")}`;
}

export function seedCampaigns(): Campaign[] {
  const d = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
  return [
    {
      id: "cmp-demo-santa",
      name: "Lanzamiento Santa Run",
      kind: "evento",
      audience: { segment: "tipo", type: "carrera" },
      body: presets.evento.body,
      activityId: "act-santa-run",
      imageUrl: media.raceRoad,
      status: "enviada",
      sentAt: d(6),
      stats: { total: 5, sent: 5, failed: 0, skipped: 1 },
      createdBy: "Liz",
      createdAt: d(6),
    },
    {
      id: "cmp-demo-unidas",
      name: "Invitación Círculo UNIDAS",
      kind: "evento",
      audience: { segment: "comunidad" },
      body: presets.evento.body,
      activityId: "act-unidas",
      imageUrl: media.handsUp,
      status: "borrador",
      stats: { total: 0, sent: 0, failed: 0, skipped: 0 },
      createdBy: "Liz",
      createdAt: d(1),
    },
  ];
}

export function seedNotifications(): Notification[] {
  return [];
}
