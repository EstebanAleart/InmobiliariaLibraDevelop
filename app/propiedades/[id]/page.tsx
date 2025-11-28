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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/propiedades">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a propiedades
              </Button>
            </Link>
            <div className="flex gap-2">
              <Link href={`/admin/propiedades/${id}/editar`}>
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Editar
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
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Left Column - Images and Details */}
          <div className="space-y-8">
            {/* Image Gallery */}
            <ImageGallery images={property.images} title={property.title} />

            {/* Property Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{property.title}</h1>

              <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
                <Badge variant="secondary" className="flex items-center gap-2 py-2 px-3 md:px-4">
                  <Maximize2 className="h-4 w-4" />
                  <span className="text-sm md:text-base">{property.square_meters} m²</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 py-2 px-3 md:px-4">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm md:text-base">{property.rooms.length} ambientes</span>
                </Badge>
              </div>

              {property.description && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Descripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{property.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Rooms */}
              {property.rooms.length > 0 && (
                <Card className="mb-6">
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

              {/* Services */}
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
          </div>

          {/* Right Column - Pricing and Actions */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pricing Card */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center text-lg md:text-xl">Información de Alquiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4 bg-accent rounded-lg">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Precio Mensual</p>
                    <p className="text-3xl md:text-4xl font-bold text-primary">${property.rental_price.toLocaleString("es-AR")}</p>
                  </div>

                  {property.expenses > 0 && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm md:text-base text-muted-foreground">Expensas</span>
                        <span className="text-lg md:text-xl font-semibold">${property.expenses.toLocaleString("es-AR")}</span>
                      </div>
                    </>
                  )}

                  <Link href={`/propiedades/${id}/contrato`} target="_blank">
                    <Button className="w-full gap-2" size="lg">
                      <FileText className="h-4 md:h-5 w-4 md:w-5" />
                      <span className="text-sm md:text-base">Descargar Contrato</span>
                    </Button>
                  </Link>

                  <p className="text-xs text-center text-muted-foreground">
                    Contrato por 24 meses con actualización trimestral
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Libra Insurance Card - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <span>Seguro de Caución</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                Obtén tu pre-aprobación de seguro de caución de forma rápida y sencilla
              </p>
              <div className="w-full h-96 md:h-[500px] border border-border rounded-lg overflow-hidden">
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
