/**
 * Voz del sitio. Español de Colombia.
 * Los datos comerciales y legales no viven aquí: salen de src/config.ts.
 */

export const navegacion = [
  { id: "colecciones", etiqueta: "Colecciones" },
  { id: "atelier", etiqueta: "Atelier" },
  { id: "cuidado", etiqueta: "Cuidado" },
  { id: "contacto", etiqueta: "Contacto" },
] as const;

export const copy = {
  meta: {
    title: "Maison — Una pieza. Sin prisa.",
    description:
      "Anillos, collares, aretes y pulseras para elegir con calma. Material, medida y precio se conversan por WhatsApp.",
    ogDescription: "Elige una pieza con calma. Material, medida y precio, por WhatsApp.",
    twitterDescription: "Una pieza, sin prisa. Material y medida se conversan por WhatsApp.",
    imagenAlt: "Collar de perlas y anillo con piedra clara sobre terciopelo verde.",
  },
  ui: {
    saltar: "Saltar al contenido",
    abrirMenu: "Abrir menú",
    cerrarMenu: "Cerrar menú",
    menu: "Menú",
    secciones: "Secciones",
    cerrar: "Cerrar",
    cerrarVista: "Cerrar la pieza",
    volverInicio: "Volver al inicio",
    volverArriba: "Volver arriba",
    filtrar: "Filtrar piezas",
    galeria: "Imagen 1 de 1",
    whatsappFlotante: "Pedir asesoría por WhatsApp",
    whatsappCorto: "WhatsApp",
  },
  hero: {
    kicker: "Con calma.",
    lines: ["UNA PIEZA.", "SIN PRISA."],
    texto: "Anillos, collares, aretes y pulseras. Material, medida y precio, en una conversación.",
    colecciones: "Descubrir colecciones",
    whatsapp: "Reservar mi pieza por WhatsApp",
    alt: "Collar de perlas y anillo con piedra clara sobre terciopelo verde, con cortinas claras al fondo.",
  },
  colecciones: {
    numero: "01",
    lines: ["MIRA DESPACIO.", "QUÉDATE CON UNA."],
    texto: "Seis grupos para mirar sin apuro.",
    ver: "Ver la colección",
    items: {
      Anillos: {
        linea: "El círculo que decides llevar.",
        alt: "Anillo con piedra clara en cuatro garras, sobre mármol.",
      },
      Collares: {
        linea: "Una luz quieta en el cuello.",
        alt: "Collar con dije de corazón, sobre tela clara.",
      },
      Aretes: {
        linea: "El brillo que se mueve contigo.",
        alt: "Aretes largos con perlas, sobre seda beige.",
      },
      Pulseras: {
        linea: "Cerca del pulso, todo el día.",
        alt: "Pulsera de piedras en línea, en la muñeca.",
      },
      Compromiso: {
        linea: "Una pregunta, dicha en silencio.",
        alt: "Anillo con piedra clara dentro de un estuche de terciopelo verde.",
      },
      Regalos: {
        linea: "Para dar, sin decir de más.",
        alt: "Dije en un estuche de terciopelo verde, con un lazo.",
      },
    },
  },
  catalogo: {
    numero: "02",
    lines: ["EN LA MANO.", "EN LA LUZ."],
    texto: "Ocho piezas. El precio no está en la página.",
    todos: "Todas",
    vacio: "Aquí no hay piezas por ahora.",
    ver: "Ver la pieza",
    precio: "Por WhatsApp",
    material: "Material y medidas por WhatsApp",
    una: "pieza",
    varias: "piezas",
  },
  productos: {
    "prod-01": {
      nombre: "Anillo en cuatro garras",
      frase: "La piedra queda alta y quieta.",
      alt: "Anillo con una piedra clara sujeta en cuatro garras, sobre mármol.",
    },
    "prod-02": {
      nombre: "Argolla de perfil liso",
      frase: "Un aro liso, tibio en el dedo.",
      alt: "Argolla lisa de perfil abombado, sobre tela clara.",
    },
    "prod-03": {
      nombre: "Collar de corazón",
      frase: "Un corazón pequeño, cerca de la piel.",
      alt: "Collar con un dije de corazón, sobre tela clara.",
    },
    "prod-04": {
      nombre: "Collar de piedra en bisel",
      frase: "Un punto de luz, sin alzar la voz.",
      alt: "Collar con una piedra clara pequeña en bisel, sobre terciopelo verde.",
    },
    "prod-05": {
      nombre: "Aretes de piedra en bisel",
      frase: "Dos destellos, junto al rostro.",
      alt: "Par de aretes con piedra clara redonda, sobre tela clara.",
    },
    "prod-06": {
      nombre: "Aretes de perla",
      frase: "La perla baja cuando caminas.",
      alt: "Aretes largos con perlas, sobre seda beige.",
    },
    "prod-07": {
      nombre: "Pulsera de eslabones",
      frase: "Eslabones que acompañan el pulso.",
      alt: "Pulsera de eslabones ovalados, sobre fondo marfil.",
    },
    "prod-08": {
      nombre: "Pulsera de luz en línea",
      frase: "Una línea de luz en la muñeca.",
      alt: "Pulsera de piedras claras en línea, llevada en la muñeca.",
    },
  },
  atelier: {
    numero: "03",
    lines: ["DE CERCA.", "SIN RUIDO."],
    texto: "El perfil, el cierre, cómo cae la cadena.",
    cuerpo: "Material, medida y precio se hablan. Aquí no hay cifras de taller.",
    alt: "Collar con piedra clara en bisel, apoyado sobre terciopelo verde.",
  },
  cuidado: {
    numero: "04",
    lines: ["SE USA.", "SE CUIDA."],
    texto: "Indicaciones generales. Lo de cada pieza se acuerda al reservarla.",
    items: [
      {
        titulo: "Paño suave",
        texto: "Un paño suave y seco. Sin químicos ni abrasivos, salvo que para esa pieza te digan otra cosa.",
      },
      {
        titulo: "Guardar",
        texto: "Por separado, en seco, lejos de lo que pueda rayarlas.",
      },
      {
        titulo: "Garantía",
        texto: "El tiempo y la cobertura no están publicados. Se dicen al reservar.",
      },
    ],
  },
  contacto: {
    numero: "05",
    lines: ["ESCRIBE.", "AQUÍ ESTAMOS."],
    texto: "El mensaje se abre en WhatsApp. No pasa por un servidor de esta página.",
    sinNumero: "Se abre WhatsApp con el texto listo, para que elijas con quién hablar.",
    nombre: "Nombre",
    pieza: "Pieza",
    mensaje: "Mensaje",
    enviar: "Pedir asesoría",
    error: "Falta tu nombre o el mensaje.",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    direccion: "Dirección",
    horario: "Horario",
  },
  vista: {
    material: "Material",
    precio: "Precio",
    asesoria: "Pedir asesoría",
  },
  beneficios: {
    etiqueta: "Beneficios",
    envio: {
      titulo: "Envíos",
      texto: (monto: string) => `Sin costo de envío desde ${monto}.`,
    },
    registro: {
      titulo: "Primera compra",
      texto: (descuento: string) => `${descuento} de descuento en la primera compra.`,
    },
    garantia: {
      titulo: "Garantía",
      texto: (tiempo: string) => `Garantía por ${tiempo}.`,
    },
    cambios: {
      titulo: "Cambios y devoluciones",
      texto: (politica: string) => politica,
    },
  },
  footer: {
    explorar: "Explorar",
    ayuda: "Ayuda",
    atelier: "Atelier",
    legal: "Legal",
    pie: "Pie de página",
    whatsapp: "Escríbenos por WhatsApp",
    derechos: (anio: number, nombre: string) => `© ${anio} ${nombre}`,
  },
  whatsapp: {
    general: "Hola. Quiero mirar una pieza con calma.",
    consulta: (nombre: string, categoria: string) =>
      `Hola. Me gusta «${nombre}», de ${categoria}. ¿Me cuentas material y medida?`,
    contacto: (nombre: string, mensaje: string, pieza: string) => {
      const linea = pieza.trim() ? `\nPieza: ${pieza.trim()}.` : "";
      return `Hola. Soy ${nombre.trim()}.${linea}\n${mensaje.trim()}`;
    },
  },
  paginas: {
    envios: {
      titulo: "Envíos",
      parrafos: [
        "El envío se acuerda al reservar la pieza.",
        "El costo y el tiempo dependen del destino. No hay un monto publicado en esta página.",
        "Cuando elijas, lo conversamos por WhatsApp.",
      ],
    },
    cambios: {
      titulo: "Cambios y devoluciones",
      parrafos: [
        "Si la pieza no es la que esperabas, escríbenos.",
        "Cada cambio se mira por separado. No hay un plazo publicado.",
        "Cuéntanos qué pasó y vemos el siguiente paso.",
      ],
    },
    garantia: {
      titulo: "Garantía",
      parrafos: [
        "Revisamos la pieza contigo antes de que se vaya.",
        "No hay un tiempo de garantía publicado. Lo que cubre cada una se dice al reservarla.",
      ],
    },
    tallas: {
      titulo: "Guía de tallas",
      parrafos: [
        "Anillo: rodea el dedo con un hilo, marca el cruce y mide ese tramo en milímetros. Hazlo al final del día.",
        "Pulsera: mide la muñeca con una cinta y deja pasar un dedo de holgura.",
        "Collar y aretes: no hay una talla única. El largo y el cierre se confirman al reservar.",
        "Si dudas entre dos medidas, escríbenos. Material y medidas por WhatsApp.",
      ],
    },
    preguntas: {
      titulo: "Preguntas frecuentes",
      parrafos: [
        "¿Cómo reservo? Escribes por WhatsApp y conversamos la pieza.",
        "¿El precio está aquí? No. Se confirma en la conversación.",
        "¿De qué está hecha? Material y medidas por WhatsApp.",
        "¿Puedo verla? Se acuerda en esa misma conversación. No hay un horario de visita publicado.",
      ],
    },
    historia: {
      titulo: "Nuestra historia",
      parrafos: [
        "No publicamos un origen de taller que no esté confirmado.",
        "Lo que sí está aquí son las piezas, de cerca, para que elijas una y la conversemos.",
      ],
    },
    visitanos: {
      titulo: "Visítanos",
      parrafos: [
        "La dirección no está publicada.",
        "Escríbenos y te decimos cómo vernos, si hay lugar y hora.",
      ],
    },
    privacidad: {
      titulo: "Privacidad y tratamiento de datos",
      intro: "Tratamos los datos que tú decides escribirnos, conforme a la Ley 1581 de 2012.",
      finalidadTitulo: "Para qué los usamos",
      derechosTitulo: "Tus derechos",
      derechos: [
        "Conocer los datos que nos diste.",
        "Actualizarlos o corregirlos.",
        "Pedir que se supriman.",
        "Revocar la autorización.",
      ],
      contactoTitulo: "Cómo pedirlos",
      contacto: "Para ejercer esos derechos, usa el formulario de contacto de esta página.",
      aviso: "Este texto es una guía general. Debe revisarlo un abogado antes de tomarse como política de la marca.",
    },
    terminos: {
      titulo: "Términos y condiciones",
      parrafos: [
        "Esta página muestra piezas para conversar. No es una tienda con pago en línea.",
        "El precio, el material y la medida de cada pieza se confirman por WhatsApp. Lo que no está escrito aquí, no está ofrecido.",
        "Las fotos son de las piezas. No publicamos quilates ni certificaciones.",
        "Al escribirnos, nos das solo lo que pones en el mensaje.",
        "Este texto es una guía general. Debe revisarlo un abogado antes de tomarse como condición de la marca.",
      ],
    },
  },
} as const;

export type IdPagina = keyof typeof copy.paginas;

export function esPagina(id: string): id is IdPagina {
  return Object.prototype.hasOwnProperty.call(copy.paginas, id);
}
