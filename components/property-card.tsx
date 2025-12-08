"use client"

import type { PropertyWithDetails } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DeletePropertyButton } from "@/components/delete-property-button"
import { MapPin, Maximize2, Edit, Eye, Trash2 } from "lucide-react"
import Link from "next/link"

interface PropertyCardProps {
  property: PropertyWithDetails
  showActions?: boolean
}

export function PropertyCard({ property, showActions = false }: PropertyCardProps) {
  const mainImage = property.images[0]?.cloudinary_url || "/departamento.jpg"

  const cardContent = (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-border h-full">
      <div className="relative h-44 sm:h-48 md:h-64 overflow-hidden">
          <img
            src={mainImage || "/placeholder.svg"}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {property.images.length > 1 && (
            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs sm:text-sm font-medium">
              +{property.images.length - 1} fotos
            </div>
          )}
        </div>

        <CardContent className="p-3 sm:p-4 md:p-5">
          <h3 className="text-sm sm:text-base md:text-xl font-bold text-foreground mb-1.5 sm:mb-2 line-clamp-2">{property.title}</h3>

          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">{property.description}</p>

          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm py-0.5 sm:py-1">
              <Maximize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {property.square_meters} m²
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm py-0.5 sm:py-1">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {property.rooms.length}
            </Badge>
          </div>

          <div className="border-t border-border pt-3 sm:pt-4">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Alquiler</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary">${property.rental_price.toLocaleString("es-AR")}</p>
              </div>
              {property.expenses > 0 && (
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-muted-foreground">Expensas</p>
                  <p className="text-xs sm:text-sm font-semibold text-foreground">${property.expenses.toLocaleString("es-AR")}</p>
                </div>
              )}
            </div>
          </div>

          {(property.services.length > 0 || (property.custom_services && property.custom_services.length > 0)) && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Servicios</p>
              <div className="flex flex-wrap gap-1">
                {property.services.slice(0, 2).map((service) => (
                  <span key={service.id} className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                    {service.name}
                  </span>
                ))}
                {property.custom_services?.slice(0, 3 - property.services.slice(0, 2).length).map((service, index) => (
                  <span key={`custom-${index}`} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {service}
                  </span>
                ))}
                {(property.services.length + (property.custom_services?.length || 0)) > 3 && (
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                    +{property.services.length + (property.custom_services?.length || 0) - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {showActions && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
              <div className="flex gap-2 justify-center">
                <Link href={`/propiedades/${property.id}`}>
                  <Button variant="ghost" size="icon" title="Ver propiedad">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </Button>
                </Link>
                <Link href={`/admin/propiedades/${property.id}/editar`}>
                  <Button variant="ghost" size="icon" title="Editar propiedad">
                    <Edit className="h-4 w-4 text-orange-600" />
                  </Button>
                </Link>
                <DeletePropertyButton
                  propertyId={property.id}
                  propertyTitle={property.title}
                  variant="ghost"
                  size="icon"
                  className=""
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
  )

  if (showActions) {
    return cardContent
  }

  return <Link href={`/propiedades/${property.id}`}>{cardContent}</Link>
}
