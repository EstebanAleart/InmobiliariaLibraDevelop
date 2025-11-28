import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Property, PropertyWithDetails } from "@/lib/types"

// GET single property
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { id } = await params

    const propertyRows = await sql<Property[]>`
      SELECT * FROM properties WHERE id = ${id}
    `
    const property = (propertyRows as unknown as Property[])[0]

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
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

    const propertyWithDetails: PropertyWithDetails = {
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
    }

    return NextResponse.json(propertyWithDetails)
  } catch (error) {
    console.error("[v0] Error fetching property:", error)
    return NextResponse.json({ error: "Error fetching property" }, { status: 500 })
  }
}

// PUT update property
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, square_meters, rental_price, expenses, rooms, service_ids, custom_services, images } = body

    // Update property
    await sql`
      UPDATE properties
      SET title = ${title},
          description = ${description},
          square_meters = ${square_meters},
          rental_price = ${rental_price},
          expenses = ${expenses},
          custom_services = ${custom_services || []},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    // Delete existing rooms and create new ones
    await sql`DELETE FROM rooms WHERE property_id = ${id}`
    if (rooms && rooms.length > 0) {
      for (const room of rooms) {
        await sql`
          INSERT INTO rooms (property_id, title, description)
          VALUES (${id}, ${room.title}, ${room.description})
        `
      }
    }

    // Update services
    await sql`DELETE FROM property_services WHERE property_id = ${id}`
    if (service_ids && service_ids.length > 0) {
      for (const serviceId of service_ids) {
        await sql`
          INSERT INTO property_services (property_id, service_id)
          VALUES (${id}, ${serviceId})
        `
      }
    }

    // Update images
    await sql`DELETE FROM property_images WHERE property_id = ${id}`
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        await sql`
          INSERT INTO property_images (property_id, cloudinary_url, cloudinary_public_id, display_order)
          VALUES (${id}, ${image.cloudinary_url}, ${image.cloudinary_public_id}, ${i})
        `
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating property:", error)
    return NextResponse.json({ error: "Error updating property" }, { status: 500 })
  }
}

// DELETE property
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { id } = await params

    await sql`DELETE FROM properties WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting property:", error)
    return NextResponse.json({ error: "Error deleting property" }, { status: 500 })
  }
}
