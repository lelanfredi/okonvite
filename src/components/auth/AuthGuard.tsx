import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import AuthDialog from "./AuthDialog";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica a sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuta mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!session) {
    // Allow the user to start creating the event
    if (location.pathname === "/new") {
      console.log("AuthGuard: allowing access to /new without auth");
      return <>{children}</>;
    }

    // Check if we have saved event data
    const savedEventData = localStorage.getItem("eventCreationData");
    const savedStep = localStorage.getItem("eventCreationStep");

    return (
      <AuthDialog
        open={true}
        onOpenChange={() => {}}
        onComplete={() => {
          console.log("Auth completed in AuthGuard");
          if (savedEventData && savedStep && location.pathname === "/new") {
            console.log("Returning to event creation with saved data");
            // Stay on the current page if we're in event creation
            return;
          }
          navigate("/");
        }}
      />
    );
  }

  return <>{children}</>;
}
