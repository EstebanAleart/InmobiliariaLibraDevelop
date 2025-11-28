import { sql } from "@/lib/db"
import type { Property, PropertyWithDetails } from "@/lib/types"
import { PropertyForm } from "@/components/property-form"
import { Button } from "@/components/ui/button"
import { DeletePropertyButton } from "@/components/delete-property-button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getProperty(id: string): Promise<PropertyWithDetails | null> {
  try {
    if (!sql) {
      console.log("Database not configured yet")
      return null
    }

    const propertyRows = await sql<Property[]>`
      SELECT * FROM properties WHERE id = ${id}
    `;
    const property = propertyRows[0];
    if (!property) return null;

    const roomRows = await sql`
      SELECT * FROM rooms WHERE property_id = ${id}
    `;
    const imageRows = await sql`
      SELECT * FROM property_images WHERE property_id = ${id} ORDER BY display_order
    `;
    const serviceRows = await sql`
      SELECT s.* FROM services s
      JOIN property_services ps ON s.id = ps.service_id
      WHERE ps.property_id = ${id}
    `;

    return {
      id: property.id,
      title: property.title,
      description: property.description,
      square_meters: property.square_meters,
      rental_price: property.rental_price,
      expenses: property.expenses,
      created_at: property.created_at,
      updated_at: property.updated_at,
      rooms: roomRows,
      images: imageRows,
      services: serviceRows,
      custom_services: property.custom_services ?? [],
    };

    if (!property) {
      return null
    }

    const rooms = await sql`
      SELECT * FROM rooms WHERE property_id = ${id}
    `
    const images = await sql`
      SELECT * FROM property_images WHERE property_id = ${id} ORDER BY display_order
    `
    const services = await sql`
      SELECT s.* FROM services s
      JOIN property_services ps ON s.id = ps.service_id
      WHERE ps.property_id = ${id}
    `

    return {
      ...property,
      rooms,
      images,
      services,
      custom_services: property.custom_services ?? [],
    }
  } catch (error) {
    console.error("[v0] Error fetching property:", error)
    return null
  }
}

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const property = await getProperty(id)

  if (!property) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <Link href="/propiedades">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a propiedades
              </Button>
            </Link>
            <DeletePropertyButton
              propertyId={Number(id)}
              propertyTitle={property.title}
              variant="outline"
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Editar Propiedad</h1>
          <p className="text-muted-foreground">Actualiza la información de la propiedad en alquiler</p>
        </div>

        <PropertyForm property={property} />
      </div>
    </div>
  )
}
