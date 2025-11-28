export const dynamic = 'force-dynamic'
export const revalidate = 0
import { sql } from "@/lib/db"
import type { Property, PropertyWithDetails } from "@/lib/types"
import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building2, Plus, Settings } from "lucide-react"

async function getProperties(): Promise<PropertyWithDetails[]> {
  try {
    const propertiesRows = await sql<Property[]>`
      SELECT * FROM properties ORDER BY created_at DESC
    `
    const properties = propertiesRows as unknown as Property[]

    const propertiesWithDetails = await Promise.all(
      properties.map(async (property) => {
        const rooms = await sql`
          SELECT * FROM rooms WHERE property_id = ${property.id}
        `
        const images = await sql`
          SELECT * FROM property_images WHERE property_id = ${property.id} ORDER BY display_order
        `
        const services = await sql`
          SELECT s.* FROM services s
          JOIN property_services ps ON s.id = ps.service_id
          WHERE ps.property_id = ${property.id}
        `

        return {
          ...property,
          rooms,
          images,
          services,
        } as PropertyWithDetails
      }),
    )

    return propertiesWithDetails
  } catch (error) {
    console.error("[v0] Error fetching properties:", error)
    return []
  }
}

export default async function PropiedadesPage() {
  const properties = await getProperties()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 md:gap-3 flex-1">
              <Building2 className="h-6 md:h-8 w-6 md:w-8 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-2xl font-bold text-foreground truncate">Propiedades en Alquiler</h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {properties.length} {properties.length === 1 ? "propiedad disponible" : "propiedades disponibles"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href="/admin/propiedades" className="w-full sm:w-auto">
                <Button variant="outline" className="gap-2 w-full sm:w-auto" size="sm">
                  <Settings className="h-4 w-4" />
                  <span className="text-xs md:text-base">Vista Admin</span>
                </Button>
              </Link>
              <Link href="/admin" className="w-full sm:w-auto">
                <Button className="gap-2 w-full sm:w-auto" size="sm">
                  <Plus className="h-4 w-4" />
                  <span className="text-xs md:text-base">Nueva Propiedad</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {properties.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <Building2 className="h-12 md:h-16 w-12 md:w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">No hay propiedades disponibles</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6">Comienza agregando tu primera propiedad en alquiler</p>
            <Link href="/admin">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Agregar Primera Propiedad
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 md:mt-20 py-6 md:py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-xs md:text-sm">
          <p>Plataforma de Gestión de Alquileres - Demo</p>
        </div>
      </footer>
    </div>
  )
}
