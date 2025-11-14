// Betting utilities for over/under markets

/**
 * Calculate American odds based on money distribution
 * Returns odds like -110, +120, etc.
 */
export function calculateOdds(
  sideMoney: number,
  oppositeMoney: number,
  vigRate: number = 0.1
): number {
  const totalMoney = sideMoney + oppositeMoney;

  if (totalMoney === 0) {
    // No bets yet, return standard -110 for both sides
    return -110;
  }

  const impliedProb = sideMoney / totalMoney;

  // Add vig to the probability
  const probWithVig = impliedProb + (vigRate / 2);

  if (probWithVig >= 0.5) {
    // Favorite (negative odds)
    const odds = -(probWithVig / (1 - probWithVig)) * 100;
    return Math.round(Math.max(odds, -500)); // Cap at -500
  } else {
    // Underdog (positive odds)
    const odds = ((1 - probWithVig) / probWithVig) * 100;
    return Math.round(Math.min(odds, 500)); // Cap at +500
  }
}

/**
 * Calculate potential payout from American odds
 */
export function calculatePayout(betAmount: number, odds: number): number {
  if (odds < 0) {
    // Negative odds: bet $110 to win $100
    return betAmount * (100 / Math.abs(odds));
  } else {
    // Positive odds: bet $100 to win $odds
    return betAmount * (odds / 100);
  }
}

/**
 * Calculate total return (original bet + winnings)
 */
export function calculateTotalReturn(betAmount: number, odds: number): number {
  return betAmount + calculatePayout(betAmount, odds);
}

/**
 * Determine if line should move based on money imbalance
 * Returns new line adjustment (positive = line moves up, negative = line moves down)
 */
export function calculateLineAdjustment(
  overMoney: number,
  underMoney: number,
  currentLine: number
): number {
  const totalMoney = overMoney + underMoney;

  if (totalMoney === 0) return 0;

  const overPercentage = overMoney / totalMoney;
  const underPercentage = underMoney / totalMoney;

  // If money is heavily on one side (>65%), move the line
  const threshold = 0.65;
  const moveAmount = 0.5; // Move by $0.50 increments

  if (overPercentage > threshold) {
    // Too much money on over, increase line to encourage under bets
    return moveAmount;
  } else if (underPercentage > threshold) {
    // Too much money on under, decrease line to encourage over bets
    return -moveAmount;
  }

  return 0;
}

/**
 * Calculate house edge/profit from resolved market
 */
export function calculateHouseProfit(
  overMoney: number,
  underMoney: number,
  winingSide: "over" | "under",
  vigRate: number
): number {
  const losingMoney = winingSide === "over" ? underMoney : overMoney;
  const winningMoney = winingSide === "over" ? overMoney : underMoney;

  // Total collected from losing side
  const totalCollected = losingMoney;

  // Need to pay out to winners (with vig applied)
  const payoutOwed = winningMoney * (1 - vigRate);

  // House keeps the difference
  return totalCollected - payoutOwed;
}
