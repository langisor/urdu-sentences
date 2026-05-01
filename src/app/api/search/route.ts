import { NextRequest, NextResponse } from "next/server";
import { searchSentences, getAllSentences, SearchField } from "@/app/actions/search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const field = (searchParams.get("field") as SearchField) || "all";

    // Validate field parameter
    const validFields: SearchField[] = ["all", "urdu", "eng", "arb"];
    if (!validFields.includes(field)) {
      return NextResponse.json(
        { error: `Invalid field. Must be one of: ${validFields.join(", ")}` },
        { status: 400 }
      );
    }

    let results;
    if (!query.trim()) {
      results = await getAllSentences();
    } else {
      results = await searchSentences(query, field);
    }

    return NextResponse.json({
      query: query.trim() || null,
      field,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
