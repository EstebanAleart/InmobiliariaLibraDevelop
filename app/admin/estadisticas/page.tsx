import Link from "next/link";
import { ArrowLeft, Home, DollarSign, TrendingUp, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getStatistics() {
  const total = 24;
  
  return {
    total,
    propertyTypes: [
      { property_type: 'departamento', count: 15 },
      { property_type: 'casa', count: 7 },
      { property_type: 'local', count: 2 }
    ],
    avgPrice: 185000,
    minPrice: 95000,
    maxPrice: 450000,
    roomsDistribution: [
      { rooms: 1, count: 5 },
      { rooms: 2, count: 10 },
      { rooms: 3, count: 7 },
      { rooms: 4, count: 2 }
    ],
    bathroomsDistribution: [
      { bathrooms: 1, count: 8 },
      { bathrooms: 2, count: 14 },
      { bathrooms: 3, count: 2 }
    ],
    avgSqm: 68,
    recentProperties: [
      { id: 1, title: 'Departamento moderno en Palermo', price: 250000, created_at: new Date('2024-11-20') },
      { id: 2, title: 'Casa amplia en Belgrano', price: 420000, created_at: new Date('2024-11-18') },
      { id: 3, title: 'Monoambiente en Recoleta', price: 120000, created_at: new Date('2024-11-15') },
      { id: 4, title: 'Local comercial en Caballito', price: 180000, created_at: new Date('2024-11-12') },
      { id: 5, title: 'Departamento 2 ambientes en Villa Crespo', price: 165000, created_at: new Date('2024-11-10') }
    ]
  };
}

export default async function EstadisticasPage() {
  const stats = await getStatistics();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 backdrop-blur-sm bg-card/95 border-b">
        <div className="container py-3 sm:py-4 px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Estadísticas</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Análisis de propiedades</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/propiedades">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Volver</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Propiedades</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.avgPrice.toLocaleString('es-AR')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precio Mínimo</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.minPrice.toLocaleString('es-AR')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precio Máximo</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.maxPrice.toLocaleString('es-AR')}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Distribución por Tipo</CardTitle>
              <CardDescription>Cantidad de propiedades por tipo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.propertyTypes.map((type) => (
                  <div key={type.property_type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm capitalize">{type.property_type}</span>
                    </div>
                    <span className="font-semibold">{type.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Distribución por Ambientes</CardTitle>
              <CardDescription>Cantidad de propiedades por número de ambientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.roomsDistribution.map((room) => (
                  <div key={room.rooms} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Grid3x3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{room.rooms} {room.rooms === 1 ? 'ambiente' : 'ambientes'}</span>
                    </div>
                    <span className="font-semibold">{room.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Distribución por Baños</CardTitle>
              <CardDescription>Cantidad de propiedades por número de baños</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.bathroomsDistribution.map((bathroom) => (
                  <div key={bathroom.bathrooms} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-sm">{bathroom.bathrooms} {bathroom.bathrooms === 1 ? 'baño' : 'baños'}</span>
                    </div>
                    <span className="font-semibold">{bathroom.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Superficie Promedio</CardTitle>
              <CardDescription>Metros cuadrados promedio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgSqm.toFixed(0)} m²</div>
              <p className="text-xs text-muted-foreground mt-2">
                Superficie promedio de todas las propiedades
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Propiedades Recientes</CardTitle>
            <CardDescription>Últimas 5 propiedades agregadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentProperties.map((property) => (
                <div key={property.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b last:border-0">
                  <div className="flex-1">
                    <Link href={`/admin/propiedades/${property.id}/editar`} className="text-sm font-medium hover:underline">
                      {property.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(property.created_at).toLocaleDateString('es-AR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-sm font-semibold">
                    ${property.price.toLocaleString('es-AR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
