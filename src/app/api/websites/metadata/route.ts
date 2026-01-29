import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      )
    }

    // Fetch the website HTML
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "NavHub/1.0",
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status}` },
        { status: response.status }
      )
    }

    const html = await response.text()

    // Extract title and description from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ""

    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const ogDescriptionMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const twitterDescriptionMatch = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["'][^>]*>/i)

    const description = ogDescriptionMatch?.[1] || twitterDescriptionMatch?.[1] || descriptionMatch?.[1] || ""

    // Clean up the data
    const cleanTitle = title
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200)

    const cleanDescription = description
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500)

    return NextResponse.json({
      title: cleanTitle || null,
      description: cleanDescription || null,
    })
  } catch (error) {
    console.error("Metadata fetch error:", error)
    
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timeout" },
        { status: 408 }
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    )
  }
}
