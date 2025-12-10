import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { verifyEmail } from "@/lib/api";

export function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const response = await verifyEmail(token);
        setStatus("success");
        setMessage(response.message);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Verification failed");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 text-center">
        {status === "loading" && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Verifying your email...</h1>
            <p className="text-muted-foreground">Please wait while we verify your email address.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Email verified!</h1>
            <p className="text-muted-foreground">{message}</p>
            <Link to="/login">
              <Button className="mt-4">Continue to login</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Verification failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="space-y-2 mt-4">
              <Link to="/login">
                <Button variant="outline" className="w-full">Back to login</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
