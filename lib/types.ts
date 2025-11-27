export interface Property {
  id: number
  title: string
  description: string
  square_meters: number
  rental_price: number
  expenses: number
  custom_services?: string[]
  created_at: string
  updated_at: string
}

export interface Room {
  id: number
  property_id: number
  title: string
  description: string
  created_at: string
}

export interface PropertyImage {
  id: number
  property_id: number
  cloudinary_url: string
  cloudinary_public_id: string
  display_order: number
  created_at: string
}

export interface Service {
  id: number
  name: string
  created_at: string
}

export interface PropertyWithDetails extends Property {
  rooms: Room[]
  images: PropertyImage[]
  services: Service[]
}

export interface CreatePropertyData {
  title: string
  description: string
  square_meters: number
  rental_price: number
  expenses: number
  rooms: Omit<Room, "id" | "property_id" | "created_at">[]
  service_ids: number[]
}
