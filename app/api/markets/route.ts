import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const excludeVoted = searchParams.get("excludeVoted") === "true";

    // Get markets user has already voted on if filtering is requested
    let votedMarketIds: string[] = [];
    if (excludeVoted && session?.user?.id) {
      const votes = await prisma.vote.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          marketId: true,
        },
      });
      votedMarketIds = votes.map(v => v.marketId);
    }

    const markets = await prisma.market.findMany({
      where: {
        status: "active",
        ...(votedMarketIds.length > 0 ? {
          id: {
            notIn: votedMarketIds,
          },
        } : {}),
      },
      include: {
        profile: {
          select: {
            name: true,
            profilePicture: true,
            resumeUrl: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format market data for frontend
    const formattedMarkets = markets.map((market: (typeof markets)[number]) => {
      return {
        id: market.id,
        title: market.title,
        profile: market.profile,
        currentLine: market.currentLine,
        overVotes: market.overVotes,
        underVotes: market.underVotes,
      };
    });

    return NextResponse.json(formattedMarkets);
  } catch (error) {
    console.error("Error fetching markets:", error);
    return NextResponse.json(
      { error: "Failed to fetch markets" },
      { status: 500 }
    );
  }
}
