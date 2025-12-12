import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FlowCanvas } from "@/components/canvas/FlowCanvas";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/VerifyEmailPage";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";
import { updateStreak } from "@/lib/api";
import { useLearningTimeTracker } from "@/hooks/useLearningTimeTracker";
import { Toaster } from "sonner";

function App() {
  const { setLoading, isAuthenticated, user } = useAuthStore();
  const streakUpdated = useRef(false);

  // Track learning time while user is active
  useLearningTimeTracker();

  useEffect(() => {
    // Check if user is already authenticated from localStorage
    setLoading(false);
  }, [setLoading]);

  // Update streak when user logs in (once per session)
  useEffect(() => {
    if (isAuthenticated && user?.id && !streakUpdated.current) {
      streakUpdated.current = true;
      updateStreak(user.id).catch((err) => {
        console.error("Failed to update streak:", err);
      });
    }
  }, [isAuthenticated, user?.id]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <ResetPasswordPage />
          }
        />
        <Route
          path="/verify-email/:token"
          element={<VerifyEmailPage />}
        />
        <Route
          path="/auth/callback"
          element={<AuthCallbackPage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <FlowCanvas />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
