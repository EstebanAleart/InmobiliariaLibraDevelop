import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName) {
      return NextResponse.json({ error: "Cloudinary cloud name not configured" }, { status: 500 })
    }
    if (!uploadPreset) {
      return NextResponse.json({ error: "Cloudinary upload preset not configured" }, { status: 500 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`

    // Use unsigned upload via preset
    const folder = "rental-properties"

    // Prepare form data for Cloudinary
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append("file", base64Image)
    cloudinaryFormData.append("upload_preset", uploadPreset)
    cloudinaryFormData.append("folder", folder)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: cloudinaryFormData,
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Cloudinary error:", result)
      throw new Error(`Cloudinary upload failed: ${result.error?.message || "Unknown error"}`)
    }

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error uploading image",
      },
      { status: 500 },
    )
  }
}
