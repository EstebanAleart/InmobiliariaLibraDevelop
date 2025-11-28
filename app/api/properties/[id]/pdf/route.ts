import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Property, PropertyWithDetails } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { id } = await params

    const propertyRows = await sql<Property[]>`
      SELECT * FROM properties WHERE id = ${id}
    `
    const property = (propertyRows as unknown as Property[])[0]

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    const rooms = await sql`
      SELECT * FROM rooms WHERE property_id = ${id}
    `
    const services = await sql`
      SELECT s.* FROM services s
      JOIN property_services ps ON s.id = ps.service_id
      WHERE ps.property_id = ${id}
    `

    const propertyData: PropertyWithDetails = {
      id: property.id,
      title: property.title,
      description: property.description,
      square_meters: property.square_meters,
      rental_price: property.rental_price,
      expenses: property.expenses,
      created_at: property.created_at,
      updated_at: property.updated_at,
      custom_services: property.custom_services ?? [],
      rooms,
      images: [],
      services,
    }

    // Generate HTML for PDF
    const html = generateContractHTML(propertyData)

    // Return HTML that can be used by the client to generate PDF
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("[v0] Error generating PDF:", error)
    return NextResponse.json({ error: "Error generating PDF" }, { status: 500 })
  }
}

function generateContractHTML(property: PropertyWithDetails): string {
  const today = new Date().toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Borrador de Contrato de Alquiler - ${property.title}</title>
  <style>
    @page {
      margin: 2cm;
    }
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #2A3136;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #FE5000;
      text-align: center;
      font-size: 24px;
      margin-bottom: 10px;
    }
    h2 {
      color: #FE5000;
      font-size: 18px;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 2px solid #FE5000;
      padding-bottom: 5px;
    }
    h3 {
      color: #425563;
      font-size: 16px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #FE5000;
    }
    .subtitle {
      color: #425563;
      font-size: 14px;
      margin-top: 5px;
    }
    .section {
      margin-bottom: 25px;
    }
    .property-info {
      background-color: #FFF4EC;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 10px 0;
    }
    .info-item {
      padding: 8px;
      background: white;
      border-radius: 4px;
    }
    .info-label {
      font-weight: bold;
      color: #425563;
      font-size: 12px;
      text-transform: uppercase;
    }
    .info-value {
      color: #2A3136;
      font-size: 16px;
      margin-top: 3px;
    }
    .room-list {
      margin: 15px 0;
    }
    .room-item {
      background: #F8F8F8;
      padding: 10px;
      margin-bottom: 10px;
      border-radius: 4px;
      border-left: 3px solid #FE5000;
    }
    .room-title {
      font-weight: bold;
      color: #2A3136;
      margin-bottom: 5px;
    }
    .room-description {
      color: #425563;
      font-size: 14px;
    }
    .clause {
      margin-bottom: 20px;
      text-align: justify;
    }
    .clause-number {
      font-weight: bold;
      color: #FE5000;
    }
    .services-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 10px 0;
    }
    .service-badge {
      background: #FE5000;
      color: white;
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 12px;
    }
    .signature-section {
      margin-top: 60px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }
    .signature-box {
      text-align: center;
      padding-top: 40px;
      border-top: 2px solid #2A3136;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #F8F8F8;
      text-align: center;
      font-size: 12px;
      color: #425563;
    }
    .highlight {
      background-color: #FFF4EC;
      padding: 2px 5px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>BORRADOR DE CONTRATO DE LOCACIÓN</h1>
    <p class="subtitle">Propiedad: ${property.title}</p>
    <p class="subtitle">Fecha: ${today}</p>
  </div>

  <div class="property-info">
    <h2>Información de la Propiedad</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Superficie</div>
        <div class="info-value">${property.square_meters} m²</div>
      </div>
      <div class="info-item">
        <div class="info-label">Cantidad de Ambientes</div>
        <div class="info-value">${property.rooms.length}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Precio Mensual</div>
        <div class="info-value">$${property.rental_price.toLocaleString("es-AR")}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Expensas</div>
        <div class="info-value">$${property.expenses.toLocaleString("es-AR")}</div>
      </div>
    </div>

    ${
      property.description
        ? `
    <div style="margin-top: 15px;">
      <div class="info-label">Descripción General</div>
      <p style="margin-top: 5px;">${property.description}</p>
    </div>
    `
        : ""
    }
  </div>

  <div class="section">
    <h2>Descripción de Ambientes</h2>
    <div class="room-list">
      ${property.rooms
        .map(
          (room) => `
        <div class="room-item">
          <div class="room-title">${room.title}</div>
          ${room.description ? `<div class="room-description">${room.description}</div>` : ""}
        </div>
      `,
        )
        .join("")}
    </div>
  </div>

  ${
    property.services.length > 0
      ? `
  <div class="section">
    <h2>Servicios Incluidos</h2>
    <div class="services-list">
      ${property.services
        .map(
          (service) => `
        <span class="service-badge">${service.name}</span>
      `,
        )
        .join("")}
    </div>
  </div>
  `
      : ""
  }

  <div class="section">
    <h2>Cláusulas del Contrato</h2>

    <div class="clause">
      <span class="clause-number">PRIMERA - PARTES:</span> Entre el <span class="highlight">LOCADOR</span> 
      (propietario del inmueble) y el <span class="highlight">LOCATARIO</span> (inquilino), se celebra el 
      presente contrato de locación bajo las siguientes condiciones.
    </div>

    <div class="clause">
      <span class="clause-number">SEGUNDA - OBJETO:</span> El LOCADOR da en locación al LOCATARIO el 
      inmueble ubicado en <span class="highlight">[DIRECCIÓN A COMPLETAR]</span>, con una superficie de 
      <strong>${property.square_meters} metros cuadrados</strong>, compuesto por ${property.rooms.length} 
      ambientes conforme a la descripción detallada anteriormente.
    </div>

    <div class="clause">
      <span class="clause-number">TERCERA - DESTINO:</span> El inmueble se destinará exclusivamente para 
      vivienda única, familiar y permanente del LOCATARIO, quedando prohibido el cambio de destino sin 
      autorización previa y por escrito del LOCADOR.
    </div>

    <div class="clause">
      <span class="clause-number">CUARTA - PLAZO:</span> El presente contrato se celebra por el término de 
      <strong>24 (VEINTICUATRO) MESES</strong>, comenzando el día <span class="highlight">[FECHA INICIO]</span> 
      y finalizando el día <span class="highlight">[FECHA FIN]</span>.
    </div>

    <div class="clause">
      <span class="clause-number">QUINTA - PRECIO:</span> El precio del alquiler mensual se fija en la suma de 
      <strong>PESOS ${property.rental_price.toLocaleString("es-AR")} ($${property.rental_price.toLocaleString("es-AR")})</strong>, 
      que el LOCATARIO abonará mensualmente por adelantado dentro de los primeros 10 días de cada mes.
    </div>

    <div class="clause">
      <span class="clause-number">SEXTA - EXPENSAS:</span> Las expensas ordinarias y extraordinarias del 
      inmueble ascienden a <strong>PESOS ${property.expenses.toLocaleString("es-AR")} ($${property.expenses.toLocaleString("es-AR")})</strong> 
      mensuales y serán abonadas por el LOCATARIO.
    </div>

    <div class="clause">
      <span class="clause-number">SÉPTIMA - ACTUALIZACIÓN:</span> El precio del alquiler será actualizado 
      <strong>TRIMESTRALMENTE</strong> de acuerdo con las variaciones del <strong>Índice de Precios al Consumidor (IPC)</strong> 
      publicado por el INDEC, según lo establecido en el artículo 14 de la Ley 27.551 (suspendida). Ante la ausencia 
      de ley de alquileres vigente, las partes acuerdan esta modalidad de actualización como mecanismo de ajuste periódico.
    </div>

    <div class="clause">
      <span class="clause-number">OCTAVA - GARANTÍA:</span> El LOCATARIO constituirá garantía mediante 
      <span class="highlight">[ESPECIFICAR TIPO DE GARANTÍA: Seguro de Caución, Título de Propiedad, Recibo de Sueldo, etc.]</span>
    </div>

    <div class="clause">
      <span class="clause-number">NOVENA - SERVICIOS:</span> Corren por cuenta del LOCATARIO los servicios de 
      ${property.services.length > 0 ? property.services.map((s) => s.name).join(", ") : "luz, agua, gas, internet"} 
      y demás servicios que se contraten para el inmueble.
    </div>

    <div class="clause">
      <span class="clause-number">DÉCIMA - OBLIGACIONES DEL LOCATARIO:</span> El LOCATARIO se compromete a:
      <ul style="margin-top: 10px;">
        <li>Mantener el inmueble en buen estado de conservación y limpieza.</li>
        <li>No realizar modificaciones sin autorización del LOCADOR.</li>
        <li>Permitir inspecciones periódicas con previo aviso.</li>
        <li>Abonar puntualmente el alquiler y expensas.</li>
        <li>Dar aviso inmediato de cualquier desperfecto.</li>
      </ul>
    </div>

    <div class="clause">
      <span class="clause-number">DECIMOPRIMERA - RESCISIÓN:</span> Cualquiera de las partes podrá rescindir 
      anticipadamente el contrato transcurridos 6 meses de contrato, debiendo notificar fehacientemente a la 
      otra parte con 60 días de anticipación si la rescisión la ejerce el LOCATARIO, o con 90 días si la ejerce 
      el LOCADOR.
    </div>
  </div>

  <div class="footer">
    <p><strong>NOTA IMPORTANTE:</strong> Este es un borrador de contrato que debe ser revisado y completado 
    por un profesional del derecho antes de su firma. Los datos marcados entre corchetes [  ] deben ser 
    completados con la información específica de las partes.</p>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <strong>LOCADOR</strong><br>
      Firma y Aclaración<br>
      DNI:
    </div>
    <div class="signature-box">
      <strong>LOCATARIO</strong><br>
      Firma y Aclaración<br>
      DNI:
    </div>
  </div>
</body>
</html>
  `
}
