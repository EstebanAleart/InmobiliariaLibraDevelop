"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, Upload, Loader2 } from "lucide-react"
import type { PropertyWithDetails, Service } from "@/lib/types"
import { useRouter } from "next/navigation"

interface PropertyFormProps {
  property?: PropertyWithDetails
  onSubmit?: () => void
}

export function PropertyForm({ property, onSubmit }: PropertyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [newService, setNewService] = useState("")
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [customServices, setCustomServices] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: property?.title || "",
    description: property?.description || "",
    square_meters: property?.square_meters || 0,
    rental_price: property?.rental_price || 0,
    expenses: property?.expenses || 0,
    rooms: property?.rooms || [{ title: "", description: "" }],
    service_ids: property?.services.map((s) => s.id) || [],
    custom_services: [] as string[],
    images: property?.images || [],
  })

  useEffect(() => {
    fetchServices()
    if (property?.images) {
      setImagePreviews(property.images.map((img) => img.cloudinary_url))
    }
    if (property?.custom_services) {
      setCustomServices(property.custom_services)
      setFormData((prev) => ({
        ...prev,
        custom_services: property.custom_services || [],
      }))
    }
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error("[v0] Error fetching services:", error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const totalImages = formData.images.length + files.length
    if (totalImages > 10) {
      alert("Máximo 10 imágenes permitidas")
      return
    }

    setUploading(true)
    try {
      // Primero subir a Cloudinary
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (!response.ok) {
          const error = await response.json()
          console.error("Upload error response:", error)
          throw new Error(error.error || "Failed to upload image")
        }

        const result = await response.json()
        console.log("Upload success:", result)
        return result
      })

      const results = await Promise.all(uploadPromises)

      const newImages = results.map((result) => ({
        cloudinary_url: result.secure_url,
        cloudinary_public_id: result.public_id,
        display_order: 0,
      }))

      // Actualizar el estado con las nuevas imágenes
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }))

      // Actualizar las previsualizaciones con las URLs de Cloudinary
      setImagePreviews((prev) => [...prev, ...newImages.map((img) => img.cloudinary_url)])
    } catch (error) {
      console.error("Error uploading images:", error)
      alert(`Error al subir imágenes: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setUploading(false)
      // Limpiar el input para permitir subir el mismo archivo nuevamente
      e.target.value = ""
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const addRoom = () => {
    setFormData((prev) => ({
      ...prev,
      rooms: [...prev.rooms, { title: "", description: "" }],
    }))
  }

  const removeRoom = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index),
    }))
  }

  const updateRoom = (index: number, field: "title" | "description", value: string) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room, i) => (i === index ? { ...room, [field]: value } : room)),
    }))
  }

  const toggleService = (serviceId: number) => {
    setFormData((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter((id) => id !== serviceId)
        : [...prev.service_ids, serviceId],
    }))
  }

  const handleAddService = () => {
    if (!newService.trim()) return

    // Add to custom services (not saved to global services DB)
    setCustomServices((prev) => [...prev, newService.trim()])
    setFormData((prev) => ({
      ...prev,
      custom_services: [...prev.custom_services, newService.trim()],
    }))
    setNewService("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = property ? `/api/properties/${property.id}` : "/api/properties"
      const method = property ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: property ? "¡Propiedad actualizada!" : "¡Propiedad creada!",
          text: property ? "La propiedad se actualizó correctamente" : "La propiedad se creó correctamente",
          confirmButtonText: "Ver propiedades",
          confirmButtonColor: "#10b981",
        })
        
        if (onSubmit) {
          onSubmit()
        } else {
          router.push("/propiedades")
        }
      } else {
        const errorData = await response.json()
        await Swal.fire({
          icon: "error",
          title: "Error al guardar",
          text: errorData.error || "No se pudo guardar la propiedad. Intenta nuevamente.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#ef4444",
        })
      }
    } catch (error) {
      console.error("[v0] Error submitting property:", error)
      await Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: "Ocurrió un error al guardar la propiedad. Verifica tu conexión e intenta nuevamente.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#ef4444",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="square_meters">Metros Cuadrados</Label>
              <Input
                id="square_meters"
                type="number"
                step="0.01"
                value={formData.square_meters}
                onChange={(e) => setFormData({ ...formData, square_meters: Number.parseFloat(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="rental_price">Precio de Alquiler</Label>
              <Input
                id="rental_price"
                type="number"
                step="0.01"
                value={formData.rental_price}
                onChange={(e) => setFormData({ ...formData, rental_price: Number.parseFloat(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="expenses">Expensas</Label>
              <Input
                id="expenses"
                type="number"
                step="0.01"
                value={formData.expenses}
                onChange={(e) => setFormData({ ...formData, expenses: Number.parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imágenes (máximo 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="images" className="cursor-pointer">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Click para subir imágenes ({formData.images.length}/10)
                      </p>
                    </>
                  )}
                </div>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading || formData.images.length >= 10}
                />
              </Label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ambientes</CardTitle>
            <Button type="button" onClick={addRoom} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ambiente
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.rooms.map((room, index) => (
            <div key={index} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Ambiente {index + 1}</h4>
                {formData.rooms.length > 1 && (
                  <Button type="button" onClick={() => removeRoom(index)} size="sm" variant="ghost">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor={`room-title-${index}`}>Título</Label>
                <Input
                  id={`room-title-${index}`}
                  value={room.title}
                  onChange={(e) => updateRoom(index, "title", e.target.value)}
                  placeholder="Ej: Dormitorio Principal"
                  required
                />
              </div>

              <div>
                <Label htmlFor={`room-description-${index}`}>Descripción</Label>
                <Textarea
                  id={`room-description-${index}`}
                  value={room.description}
                  onChange={(e) => updateRoom(index, "description", e.target.value)}
                  rows={2}
                  placeholder="Ej: Amplio dormitorio con placard empotrado"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Servicios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`service-${service.id}`}
                  checked={formData.service_ids.includes(service.id)}
                  onCheckedChange={() => toggleService(service.id)}
                />
                <Label htmlFor={`service-${service.id}`} className="text-sm font-normal cursor-pointer">
                  {service.name}
                </Label>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Otro servicio..."
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddService()
                }
              }}
            />
            <Button type="button" onClick={handleAddService} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {customServices.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-3">Servicios personalizados:</p>
              <div className="flex flex-wrap gap-2">
                {customServices.map((service, index) => (
                  <Badge key={index} variant="secondary" className="gap-2 py-2 px-3">
                    {service}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomServices((prev) => prev.filter((_, i) => i !== index))
                        setFormData((prev) => ({
                          ...prev,
                          custom_services: prev.custom_services.filter((_, i) => i !== index),
                        }))
                      }}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>{property ? "Actualizar" : "Crear"} Propiedad</>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin")} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
