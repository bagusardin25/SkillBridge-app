import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { getCurrentUser } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Authentication failed. Please try again.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      if (!token) {
        setError("No authentication token received.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        // Fetch user data with token
        const user = await getCurrentUser(token);

        // Set auth state (zustand persist writes localStorage).
        // Also write immediately so the first post-login requests never race.
        setAuth(user, token);
        try {
          const existing = localStorage.getItem("auth-storage");
          const prev = existing ? JSON.parse(existing) : {};
          localStorage.setItem(
            "auth-storage",
            JSON.stringify({
              ...prev,
              state: {
                ...(prev.state || {}),
                user,
                token,
                isAuthenticated: true,
              },
              version: prev.version ?? 0,
            })
          );
        } catch {
          // non-fatal — persist middleware still has the token
        }

        toast.success("Successfully logged in!");
        navigate("/app");
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Failed to authenticate. Please try again.");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-semibold text-destructive">{error}</h1>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
        <h1 className="text-xl font-semibold">Completing sign in...</h1>
        <p className="text-muted-foreground">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
}
