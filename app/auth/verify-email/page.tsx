"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function VerifyEmailContent() {
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
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              📧 Check Your Email
            </p>
            <p className="text-sm font-light text-blue-800 dark:text-blue-200">
              The verification email should arrive within <strong>1 minute</strong>. Click the link in the email to verify your account.
            </p>
            <p className="text-xs font-light text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> If you don't see the email in your inbox, please check your <strong>spam or junk folder</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4">Loading…</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
