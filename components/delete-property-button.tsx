"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"

interface DeletePropertyButtonProps {
  propertyId: number
  propertyTitle: string
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  onDelete?: () => void
}

export function DeletePropertyButton({
  propertyId,
  propertyTitle,
  variant = "destructive",
  size = "sm",
  className = "",
  onDelete,
}: DeletePropertyButtonProps) {
  const router = useRouter()

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      html: `Se eliminará la propiedad:<br><strong>${propertyTitle}</strong>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/properties/${propertyId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "¡Eliminada!",
            text: "La propiedad ha sido eliminada correctamente",
            confirmButtonColor: "#10b981",
          })

          if (onDelete) {
            onDelete()
          } else {
            router.push("/admin/propiedades")
            router.refresh()
          }
        } else {
          throw new Error("Error al eliminar la propiedad")
        }
      } catch (error) {
        console.error("Error deleting property:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar la propiedad. Intenta nuevamente.",
          confirmButtonColor: "#ef4444",
        })
      }
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
      onClick={handleDelete}
      type="button"
    >
      <Trash2 className="h-4 w-4" />
      Eliminar
    </Button>
  )
}
