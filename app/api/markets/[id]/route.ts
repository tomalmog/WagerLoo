import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const market = await prisma.market.findUnique({
      where: {
        id,
      },
      include: {
        profile: {
          select: {
            name: true,
            profilePicture: true,
            resumeUrl: true,
          },
        },
      },
    });

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: market.id,
      title: market.title,
      description: market.description,
      status: market.status,
      profile: market.profile,
      currentLine: market.currentLine,
      initialLine: market.initialLine,
      overVotes: market.overVotes,
      underVotes: market.underVotes,
    });
  } catch (error) {
    console.error("Error fetching market:", error);
    return NextResponse.json(
      { error: "Failed to fetch market" },
      { status: 500 }
    );
  }
}
