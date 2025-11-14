"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 dot-grid">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-light">Verify Your Email</CardTitle>
          <CardDescription className="font-light">
            We've sent a verification link to your email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm font-light text-muted-foreground mb-4">
              A verification email has been sent to:
            </p>
            <p className="text-base font-medium">{email}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              📧 Verification Link Available
            </p>
            <p className="text-sm font-light text-amber-800 dark:text-amber-200">
              Check your <strong>server terminal</strong> (where npm run dev is running) for the verification link.
            </p>
            <p className="text-xs font-light text-amber-700 dark:text-amber-300">
              Look for "🔗 VERIFICATION LINK" in the console output, copy that link, and paste it into your browser.
            </p>
            <div className="mt-3 pt-3 border-t border-amber-300 dark:border-amber-700">
              <p className="text-xs font-light text-amber-700 dark:text-amber-300">
                <strong>Note:</strong> Email delivery is in development mode. For production, emails will be sent automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
