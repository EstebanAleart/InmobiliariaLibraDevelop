import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Property, PropertyWithDetails } from "@/lib/types"

// GET all properties
export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const propertiesRows = await sql<Property[]>`
      SELECT * FROM properties ORDER BY created_at DESC
    `
    const properties = propertiesRows as unknown as Property[]

    const propertiesWithDetails = await Promise.all(
      properties.map(async (property) => {
        const rooms = await sql`
          SELECT * FROM rooms WHERE property_id = ${property.id}
        `
        const images = await sql`
          SELECT * FROM property_images WHERE property_id = ${property.id} ORDER BY display_order
        `
        const services = await sql`
          SELECT s.* FROM services s
          JOIN property_services ps ON s.id = ps.service_id
          WHERE ps.property_id = ${property.id}
        `

        return {
          ...property,
          rooms,
          images,
          services,
        } as PropertyWithDetails
      }),
    )

    return NextResponse.json(propertiesWithDetails)
  } catch (error) {
    console.error("[v0] Error fetching properties:", error)
    return NextResponse.json({ error: "Error fetching properties" }, { status: 500 })
  }
}

// POST create new property
export async function POST(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { title, description, square_meters, rental_price, expenses, rooms, service_ids, custom_services, images } = body

    // Create property
    const propertyRows = await sql<Property[]>`
      INSERT INTO properties (title, description, square_meters, rental_price, expenses, custom_services)
      VALUES (${title}, ${description}, ${square_meters}, ${rental_price}, ${expenses}, ${custom_services || []})
      RETURNING *
    `
    const property = (propertyRows as unknown as Property[])[0]

    // Create rooms
    if (rooms && rooms.length > 0) {
      for (const room of rooms) {
        await sql`
          INSERT INTO rooms (property_id, title, description)
          VALUES (${property.id}, ${room.title}, ${room.description})
        `
      }
    }

    // Link services
    if (service_ids && service_ids.length > 0) {
      for (const serviceId of service_ids) {
        await sql`
          INSERT INTO property_services (property_id, service_id)
          VALUES (${property.id}, ${serviceId})
        `
      }
    }

    // Create images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        await sql`
          INSERT INTO property_images (property_id, cloudinary_url, cloudinary_public_id, display_order)
          VALUES (${property.id}, ${image.cloudinary_url || image.url}, ${image.cloudinary_public_id || image.public_id}, ${i})
        `
      }
    }

    return NextResponse.json({ success: true, property })
  } catch (error) {
    console.error("[v0] Error creating property:", error)
    return NextResponse.json({ error: "Error creating property" }, { status: 500 })
  }
}
