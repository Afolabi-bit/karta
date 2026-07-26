import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import authSeller from "@/middlewares/authsellers";
import openai from "@/config/openai";

async function main(base64Image: string, mimeType: string) {
  const messages: any[] = [
    {
      role: "system",
      content: `You are a product listing assistant for an e-commerce store.
Your job is to analyze an image of a product and generate structured data.

Respond ONLY with raw JSON (no code block, no markdown, no explanation).
The JSON must strictly follow this schema:

{
  "name": string, // Short product name
  "description": string, // Marketing-friendly description of the product
}`,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Analyze this image and generate a product name and description",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`,
          },
        },
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: messages,
  });

  console.log(response.choices[0]);
  const raw = response.choices[0].message?.content || "";

  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("Invalid AI response", err);
    throw new Error("Invalid AI response");
  }

  // Final validation
  if (!parsed.name || !parsed.description) {
    throw new Error("Incomplete AI response");
  }

  return parsed;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Image payload is too large or invalid." },
        { status: 400 }
      );
    }

    const { base64Image, mimeType } = body || {};

    if (!base64Image || !mimeType) {
      return NextResponse.json(
        { error: "Image data is required." },
        { status: 400 }
      );
    }

    const result = await main(base64Image, mimeType);

    return NextResponse.json(
      {
        ...result,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to analyze image with AI" },
      { status: 400 }
    );
  }
}
