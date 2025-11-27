import { PropertyForm } from "@/components/property-form"
import { Button } from "@/components/ui/button"
import { List } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Panel de Administración</h1>
            <p className="text-muted-foreground">Carga una nueva propiedad en alquiler</p>
          </div>
          <Link href="/admin/propiedades">
            <Button variant="outline" className="gap-2">
              <List className="h-4 w-4" />
              Ver todas las propiedades
            </Button>
          </Link>
        </div>

        <PropertyForm />
      </div>
    </div>
  )
}
