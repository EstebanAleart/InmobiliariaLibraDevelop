import { sql } from "@/lib/db"
import type { Property, PropertyWithDetails } from "@/lib/types"
import { ImageGallery } from "@/components/image-gallery"
import { Button } from "@/components/ui/button"
import { DeletePropertyButton } from "@/components/delete-property-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, Maximize2, FileText, ArrowLeft, Calendar, Shield, Edit } from "lucide-react"
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
    `
    const property = (propertyRows as unknown as Property[])[0]

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
      images,
      services,
    } as PropertyWithDetails
  } catch (error) {
    console.error("[v0] Error fetching property:", error)
    return null
  }
}

export default async function PropertyDetailPage({
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
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <Link href="/propiedades" className="w-full sm:w-auto">
              <Button variant="ghost" className="gap-2 w-full sm:w-auto" size="sm">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm sm:text-base">Volver a propiedades</span>
              </Button>
            </Link>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href={`/admin/propiedades/${id}/editar`} className="flex-1 sm:flex-none">
                <Button variant="outline" className="gap-2 w-full" size="sm">
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              </Link>
              <DeletePropertyButton
                propertyId={Number(id)}
                propertyTitle={property.title}
                variant="destructive"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Gallery - Full width */}
          <ImageGallery images={property.images} title={property.title} />

          {/* Title and quick facts */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">{property.title}</h1>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2.5 sm:px-3 md:px-4">
                <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm md:text-base">{property.square_meters} m²</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2.5 sm:px-3 md:px-4">
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm md:text-base">{property.rooms.length} ambientes</span>
              </Badge>
            </div>
          </div>

          {/* Two-column content area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left column: Description + Services */}
            <div className="space-y-6">
              {property.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Descripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{property.description}</p>
                  </CardContent>
                </Card>
              )}

              {(property.services.length > 0 || (property.custom_services && property.custom_services.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Servicios Incluidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {property.services.map((service) => (
                        <Badge key={service.id} variant="outline" className="py-2 px-3 md:px-4 text-xs md:text-sm">
                          {service.name}
                        </Badge>
                      ))}
                      {property.custom_services?.map((service, index) => (
                        <Badge key={`custom-${index}`} variant="secondary" className="py-2 px-3 md:px-4 text-xs md:text-sm">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column: Rooms */}
            <div className="space-y-6">
              {property.rooms.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Ambientes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {property.rooms.map((room, index) => (
                      <div key={room.id || index} className="border-l-4 border-primary pl-4 py-2">
                        <h3 className="font-bold text-base md:text-lg text-foreground">{room.title}</h3>
                        {room.description && <p className="text-sm md:text-base text-muted-foreground mt-1">{room.description}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Información de Alquiler - Full width below */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-center text-base sm:text-lg md:text-xl">Información de Alquiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="text-center py-3 sm:py-4 bg-accent rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Precio Mensual</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">${property.rental_price.toLocaleString("es-AR")}</p>
              </div>

              {property.expenses > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between px-2 sm:px-0">
                    <span className="text-xs sm:text-sm md:text-base text-muted-foreground">Expensas</span>
                    <span className="text-base sm:text-lg md:text-xl font-semibold">${property.expenses.toLocaleString("es-AR")}</span>
                  </div>
                </>
              )}

              <Link href={`/propiedades/${id}/contrato`} target="_blank">
                <Button className="w-full gap-2" size="lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Descargar Contrato</span>
                </Button>
              </Link>

              <p className="text-xs sm:text-sm text-center text-muted-foreground">
                Contrato por 24 meses con actualización trimestral
              </p>
            </CardContent>
          </Card>

          {/* Libra Insurance Card - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                <span>Seguro de Caución</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Obtén tu pre-aprobación de seguro de caución de forma rápida y sencilla
              </p>
              
              {/* Mobile: Show button */}
              <div className="md:hidden">
                <Link href="https://project-libra-seguros-stg-64129624f017.herokuapp.com/policy-quote?code=200" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2" size="lg">
                    <Shield className="h-5 w-5" />
                    Libra Seguros
                  </Button>
                </Link>
              </div>

              {/* Desktop: Show iframe */}
              <div className="hidden md:block w-full h-[500px] border border-border rounded-lg overflow-hidden">
                <iframe
                  src="https://project-libra-seguros-stg-64129624f017.herokuapp.com/policy-quote?code=200"
                  className="w-full h-full"
                  title="Libra Seguros - Cotización"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
