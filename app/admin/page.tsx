import { PropertyForm } from "@/components/property-form"
import { Button } from "@/components/ui/button"
import { List } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Panel de Administración</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Carga una nueva propiedad en alquiler</p>
          </div>
          <Link href="/admin/propiedades" className="w-full sm:w-auto">
            <Button variant="outline" className="gap-2 w-full sm:w-auto" size="sm">
              <List className="h-4 w-4" />
              <span className="text-sm sm:text-base">Ver todas las propiedades</span>
            </Button>
          </Link>
        </div>

        <PropertyForm />
      </div>
    </div>
  )
}
