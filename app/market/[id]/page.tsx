"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";

interface Market {
  id: string;
  title: string;
  description: string;
  status: string;
  totalVolume: number;
  currentLine: number;
  initialLine: number;
  overOdds: number;
  underOdds: number;
  overMoney: number;
  underMoney: number;
  profile: {
    name: string;
    program: string;
    year: string;
    bio: string;
    previousCoops: string;
  };
}

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [betAmount, setBetAmount] = useState("");
  const [placingBet, setPlacingBet] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchMarket();
    }
  }, [status, params.id]);

  const fetchMarket = async () => {
    try {
      const response = await fetch(`/api/markets/${params.id}`);
      const data = await response.json();
      setMarket(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching market:", error);
      setIsLoading(false);
    }
  };

  const handlePlaceBet = async (side: "over" | "under") => {
    const amount = parseFloat(betAmount);

    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setPlacingBet(true);

    try {
      const response = await fetch("/api/bet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marketId: market?.id,
          side,
          amount,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh market data
        await fetchMarket();
        // Clear the bet amount
        setBetAmount("");
        // Show success
        alert(
          `Bet placed! ${result.lineMoved ? `Line moved to $${result.newLine.toFixed(2)}` : ""}`
        );
        // Trigger a refresh of the navbar balance
        window.dispatchEvent(new Event("balanceUpdate"));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to place bet");
      }
    } catch (error) {
      console.error("Error placing bet:", error);
      alert("Failed to place bet");
    } finally {
      setPlacingBet(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground font-light">Loading...</p>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground font-light">Market not found</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12 dot-grid">
        <div className="max-w-3xl mx-auto px-6">
          {/* Profile Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-3xl font-light">{market.profile.name}</CardTitle>
              <CardDescription className="text-base font-light">
                {market.profile.program} • {market.profile.year}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {market.profile.bio && (
                <div>
                  <h3 className="font-light text-sm text-muted-foreground mb-1">About</h3>
                  <p className="font-light">{market.profile.bio}</p>
                </div>
              )}
              {market.profile.previousCoops && (
                <div>
                  <h3 className="font-light text-sm text-muted-foreground mb-1">Previous Co-ops</h3>
                  <p className="font-light">{market.profile.previousCoops}</p>
                </div>
              )}
              <div className="flex gap-6 text-sm pt-2 border-t border-border">
                <div className="font-light">
                  <span className="text-muted-foreground">Total Volume: </span>
                  <span className="text-foreground">${market.totalVolume.toLocaleString()}</span>
                </div>
                <div className="font-light">
                  <span className="text-muted-foreground">Status: </span>
                  <span className="text-foreground capitalize">{market.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Betting Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-light">Place Your Bet</CardTitle>
              <CardDescription className="font-light">
                Take the over or under on {market.profile.name}'s next co-op salary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Line Information */}
              <div className="text-center py-8 border border-border rounded-lg">
                <div className="text-sm text-muted-foreground font-light mb-2">
                  Over/Under Line
                </div>
                <div className="text-5xl font-light mb-1">
                  ${market.currentLine.toFixed(2)}
                  <span className="text-xl text-muted-foreground">/hr</span>
                </div>
                {market.currentLine !== market.initialLine && (
                  <div className="text-xs text-muted-foreground font-light mt-2">
                    Initial line: ${market.initialLine.toFixed(2)}/hr
                  </div>
                )}
              </div>

              {/* Money Distribution */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-muted-foreground font-light mb-1">Over Money</div>
                  <div className="text-xl font-light">${market.overMoney.toLocaleString()}</div>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-muted-foreground font-light mb-1">Under Money</div>
                  <div className="text-xl font-light">${market.underMoney.toLocaleString()}</div>
                </div>
              </div>

              {/* Bet Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-light text-muted-foreground">
                  Bet Amount
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount ($)"
                  min="0"
                  step="0.01"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="text-center text-lg font-light"
                />
              </div>

              {/* Over/Under Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handlePlaceBet("over")}
                  disabled={placingBet || !betAmount}
                  className="h-32 text-xl font-light flex flex-col gap-2"
                  variant="outline"
                >
                  <div>Over ${market.currentLine.toFixed(2)}</div>
                  <div className="text-base text-muted-foreground">
                    {market.overOdds > 0 ? "+" : ""}
                    {market.overOdds}
                  </div>
                </Button>
                <Button
                  onClick={() => handlePlaceBet("under")}
                  disabled={placingBet || !betAmount}
                  className="h-32 text-xl font-light flex flex-col gap-2"
                  variant="outline"
                >
                  <div>Under ${market.currentLine.toFixed(2)}</div>
                  <div className="text-base text-muted-foreground">
                    {market.underOdds > 0 ? "+" : ""}
                    {market.underOdds}
                  </div>
                </Button>
              </div>

              {betAmount && parseFloat(betAmount) > 0 && (
                <div className="text-center text-sm text-muted-foreground font-light p-4 bg-muted rounded-lg">
                  Potential payout varies based on odds. American odds shown above.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
