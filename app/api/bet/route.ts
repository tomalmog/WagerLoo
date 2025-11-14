import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateOdds,
  calculatePayout,
  calculateLineAdjustment,
} from "@/lib/betting";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { marketId, side, amount } = body; // side: "over" or "under"

    if (!marketId || !side || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (side !== "over" && side !== "under") {
      return NextResponse.json({ error: "Side must be 'over' or 'under'" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const userId = session.user!.id as string;
      // Get the user
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.balance < amount) {
        throw new Error("Insufficient balance");
      }

      // Get the market
      const market = await tx.market.findUnique({
        where: { id: marketId },
      });

      if (!market) {
        throw new Error("Market not found");
      }

      if (market.status !== "active") {
        throw new Error("Market is not active");
      }

      // Calculate current odds for this side
      const sideMoney = side === "over" ? market.overMoney : market.underMoney;
      const oppositeMoney = side === "over" ? market.underMoney : market.overMoney;
      const odds = calculateOdds(sideMoney, oppositeMoney, market.vigRate);

      // Calculate potential payout
      const potentialPayout = calculatePayout(amount, odds);
      const totalReturn = amount + potentialPayout;

      // Create the bet
      await tx.bet.create({
        data: {
          userId: userId,
          marketId: marketId,
          side,
          amount,
          line: market.currentLine,
          odds,
          potentialPayout: totalReturn,
          status: "pending",
        },
      });

      // Update market money
      await tx.market.update({
        where: { id: marketId },
        data: {
          overMoney: side === "over" ? market.overMoney + amount : market.overMoney,
          underMoney: side === "under" ? market.underMoney + amount : market.underMoney,
        },
      });

      // Calculate if line should move
      const newOverMoney = side === "over" ? market.overMoney + amount : market.overMoney;
      const newUnderMoney = side === "under" ? market.underMoney + amount : market.underMoney;
      const lineAdjustment = calculateLineAdjustment(newOverMoney, newUnderMoney, market.currentLine);

      if (lineAdjustment !== 0) {
        // Move the line
        await tx.market.update({
          where: { id: marketId },
          data: {
            currentLine: market.currentLine + lineAdjustment,
          },
        });
      }

      // Deduct from user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      return {
        line: market.currentLine,
        newLine: market.currentLine + lineAdjustment,
        odds,
        potentialPayout: totalReturn,
        lineMoved: lineAdjustment !== 0,
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error placing bet:", error);
    return NextResponse.json(
      { error: error.message || "Failed to place bet" },
      { status: 500 }
    );
  }
}
