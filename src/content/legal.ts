/**
 * ⚠ MACHOTES DE EJEMPLO. Empowerme ya cuenta con sus documentos oficiales:
 *   reemplazar este texto por el aprobado por su área legal.
 * Al cambiar un documento, incrementa LEGAL_VERSION para que las personas
 * vuelvan a aceptarlo en su siguiente registro.
 */
export const LEGAL_VERSION = "2026-01";

export type LegalKey = "aviso-de-privacidad" | "uso-de-imagen" | "responsiva";

export const legalDocs: Record<LegalKey, { title: string; short: string; body: string[] }> = {
  "aviso-de-privacidad": {
    title: "Aviso de privacidad",
    short: "Cómo usamos y protegemos tus datos personales.",
    body: [
      "Empowerme Community (en adelante \"Empowerme\"), con domicilio en Guadalajara, Jalisco, es responsable del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.",
      "Datos que recabamos: nombre, correo electrónico, teléfono, fecha de nacimiento, contacto de emergencia y, en su caso, información de salud relevante para tu seguridad durante las actividades físicas.",
      "Finalidades primarias: gestionar tu registro y pago, enviarte tus boletos y avisos sobre la actividad, y contactar a tu contacto de emergencia si fuera necesario. Finalidades secundarias: enviarte información de próximas experiencias. Puedes oponerte a las finalidades secundarias escribiendo a hola@empowerme.mx.",
      "Tus datos no se comparten con terceros salvo con proveedores necesarios para operar el servicio (procesador de pagos, envío de correos y mensajes), quienes están obligados a protegerlos.",
      "Puedes ejercer tus derechos ARCO (acceso, rectificación, cancelación y oposición) enviando una solicitud a hola@empowerme.mx.",
    ],
  },
  "uso-de-imagen": {
    title: "Autorización de uso de imagen",
    short: "Permiso para usar fotos y video del evento en nuestros canales.",
    body: [
      "Durante las experiencias de Empowerme se toman fotografías y video para documentar la actividad y compartirla con la comunidad.",
      "Al aceptar, autorizas a Empowerme a utilizar tu imagen captada durante los eventos en sus redes sociales, sitio web y materiales de difusión, sin fines de lucro directo y sin compensación económica.",
      "Si en algún momento deseas que retiremos una imagen en la que apareces, escríbenos a hola@empowerme.mx y la retiraremos de nuestros canales en un plazo razonable.",
    ],
  },
  responsiva: {
    title: "Carta responsiva",
    short: "Declaras que estás en condiciones de realizar actividad física.",
    body: [
      "Declaro que participo de manera voluntaria en la actividad seleccionada y que me encuentro en condiciones físicas y de salud adecuadas para realizarla.",
      "Reconozco que la actividad física implica riesgos inherentes como lesiones musculares, caídas o fatiga, y me comprometo a seguir las indicaciones de las y los coaches y a detenerme si siento malestar.",
      "Me comprometo a informar a Empowerme cualquier condición médica, embarazo o lesión que pueda afectar mi participación.",
      "Libero a Empowerme, sus coaches y aliados de responsabilidad por lesiones derivadas de mi participación, salvo en casos de negligencia comprobada.",
      "Autorizo que, en caso de emergencia, se contacte a la persona que indiqué como contacto de emergencia y se me brinde atención médica.",
    ],
  },
};
