import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { authConfig } from "@/lib/auth-config";

export function useAuthRedirect() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // Special case for event creation process
      if (pathname === "/new") {
        console.log("On event creation page, skipping redirect");
        return;
      }

      // Check if we're coming from event creation
      const isFromEventCreation =
        localStorage.getItem("fromEventCreation") === "true";

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log(
        "Auth redirect check - path:",
        pathname,
        "session:",
        !!session,
        "fromEventCreation:",
        isFromEventCreation,
      );

      // If we just logged in and were creating an event, go back to event creation
      if (session && isFromEventCreation) {
        console.log("Redirecting back to event creation after login");
        localStorage.removeItem("fromEventCreation");
        navigate("/new");
        return;
      }

      // Verifica se é uma rota de evento público usando short_id
      const isPublicEventRoute = pathname.match(/^\/e\/[a-zA-Z0-9-]+$/);
      
      // Se for uma rota de evento público, permite acesso sem autenticação
      if (isPublicEventRoute) {
        console.log("Allowing access to public event page");
        return;
      }

      const isProtectedRoute = authConfig.protectedRoutes.some((route) =>
        pathname.startsWith(route),
      );
      const isPublicOnlyRoute = authConfig.publicOnlyRoutes.some((route) =>
        pathname.startsWith(route),
      );
      const isPublicRoute = authConfig.publicRoutes.some((route) =>
        pathname.startsWith(route),
      );

      if (session && isPublicOnlyRoute) {
        console.log("Redirecting from public-only route to dashboard");
        navigate(authConfig.defaultProtectedRoute);
      } else if (!session && isProtectedRoute) {
        // Special cases - we allow non-authenticated users to access certain routes
        if (pathname === "/new" || isPublicRoute) {
          console.log(`On ${pathname} route, allowing access without auth`);
          return;
        }

        console.log("Redirecting from protected route to public route");
        navigate(authConfig.defaultPublicRoute);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => subscription.unsubscribe();
  }, [pathname, navigate]);
}
