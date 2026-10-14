/**
 * Contenido editable del sitio.
 * ⚠ Fotos y videos son de stock libre (Unsplash / Mixkit) y deben
 *   reemplazarse por material real de Empowerme antes de publicar.
 * ⚠ Cifras, trayectoria y testimonios marcados con [confirmar] son de ejemplo.
 */

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const media = {
  runPink: u("photo-1719299246410-df8d0f0845ee"),
  raceRoad: u("photo-1596460658047-1826d5921c56"),
  track: u("photo-1552209841-d2dc5fd68a30"),
  yogaRoom: u("photo-1683056255281-e52a141924f0"),
  yogaPark: u("photo-1758797315487-b3b225dff7d8"),
  beach: u("photo-1545205597-3d9d02c29597"),
  handsUp: u("photo-1608405059861-b21a68ae76a2"),
  workshop: u("photo-1697539059801-1c3471e465af"),
  circle: u("photo-1643682661119-28da0685be2c"),
  medals: u("photo-1774557937760-e07a8e01240c"),
  medalSmile: u("photo-1769867628239-32f07b0679ec"),
  yogaGroup: u("photo-1518611012118-696072aa579a"),
  dumbbells: u("photo-1518310383802-640c2de311b2"),
  elbow: u("photo-1611095968462-3dc56b14454a"),
  yogaFour: u("photo-1758274525958-4a7e209a1e0c"),
  classCrowd: u("photo-1517130038641-a774d04afb3c"),
  runIndoor: u("photo-1619107372089-9b05ed524774"),
  yogaSunny: u("photo-1679500649263-e1be61dc15c8"),
  pier: u("photo-1790336847068-10b40909fbe2"),
  officeCheer: u("photo-1758691737584-a8f17fb34475"),
  officeTeam: u("photo-1758691737492-48e8fdd336f7"),
  teamLaptop: u("photo-1576267423048-15c0040fec78"),
  teamOutdoor: u("photo-1592591281836-af5e5904c466"),
};

/** Galería que el admin puede elegir al crear una actividad. */
export const mediaLibrary = Object.entries(media).map(([key, url]) => ({ key, url }));

const mix = (id: number) => `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;

export const heroVideos = [
  { src: mix(16117), label: "Clases" },
  { src: mix(23582), label: "SocialRun" },
  { src: mix(25080), label: "Yoga" },
  { src: mix(43736), label: "Talleres" },
];

export const site = {
  name: "Empowerme",
  legalName: "Empowerme Community",
  city: "Guadalajara, Jalisco",
  instagram: "https://www.instagram.com/empowerme_mx/",
  instagramHandle: "@empowerme_mx",
  email: "hola@empowerme.mx",
  tagline: "Transformamos vidas, empresas y comunidades.",
};

export const stats = [
  { value: 1780, suffix: "", label: "personas en la comunidad digital" },
  { value: 160, prefix: "+", label: "jóvenes moviéndose juntos en una sola clase" },
  { value: 40, prefix: "+", label: "experiencias realizadas [confirmar]" },
  { value: 12, suffix: "K", label: "la distancia de nuestra carrera en relevos" },
];

export const awards = [
  {
    year: "2026",
    title: "Premio Jalisco al Emprendimiento",
    detail: "Reconocimiento a Liz Lozano como fundadora de Empowerme.",
  },
  {
    year: "2025",
    title: "Impacto anual · 2025 Wrapped",
    detail: "Un año de carreras, clases y comunidad en Guadalajara. [confirmar cifras]",
  },
];

export const timeline = [
  { year: "Inicio", title: "Una clase, un parque", text: "Empowerme nace como un punto de encuentro para moverse con propósito. [confirmar]" },
  { year: "Comunidad", title: "Nace la tribu", text: "Clases al aire libre, SocialRun y los primeros Wellness Morning." },
  { year: "2025", title: "Carreras con causa", text: "Relay 12K, Santa Run y la meta compartida que nos volvió comunidad." },
  { year: "2026", title: "Premio Jalisco", text: "Liz Lozano recibe el Premio Jalisco al Emprendimiento y llegamos a las empresas." },
];

export const pillars = [
  { verb: "Muévete", text: "Clases de yoga, funcional, pilates y dance con energía de comunidad." },
  { verb: "Respira", text: "Breathwork, meditación y talleres para bajarle al ruido." },
  { verb: "Corre", text: "SocialRun, carreras temáticas y relevos para todos los niveles." },
  { verb: "Conecta", text: "Círculos UNIDAS, convivencia y personas que suman." },
];

export const testimonials = [
  {
    quote: "Llegué sola a un Wellness Morning y salí con amigas para cada domingo. Es otra energía.",
    name: "Andrea G.",
    detail: "Comunidad desde 2025 [ejemplo]",
  },
  {
    quote: "El reto de 30 días cambió la conversación en la oficina. La gente se organiza sola para moverse.",
    name: "Mariana R.",
    detail: "People & Culture [ejemplo]",
  },
  {
    quote: "Corrí mis primeros 4K en el Relay. Nunca pensé que cruzar una meta se sintiera así.",
    name: "Daniela P.",
    detail: "Relay 12K [ejemplo]",
  },
];

export const highlights = ["Campaña", "Clases", "Experiences", "UNIDAS", "Merch", "SocialRun"];

export const founder = {
  name: "Liz Lozano",
  photo: "/images/liz-lozano.webp",
  role: "Fundadora · Creadora de experiencias con propósito · Speaker",
  education: "Tecnológico de Monterrey",
  bio: [
    "Liz creó Empowerme con una idea simple: el bienestar se sostiene mejor en comunidad. Lo que empezó como clases al aire libre hoy es un movimiento de experiencias, carreras y programas que transforman la forma en que las personas — y las empresas — cuidan de sí mismas.",
    "En 2026 recibió el Premio Jalisco al Emprendimiento por construir un modelo de bienestar integral con impacto social en Guadalajara.",
  ],
};
