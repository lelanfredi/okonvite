import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { UserMenu } from "@/components/ui/user-menu";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AuthDialog from "../auth/AuthDialog";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/language-toggle";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [session, setSession] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    // Verifica a sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escuta mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <div className="md:hidden">
            <MobileMenu />
          </div>
          <a href="/" className="text-xl font-bold text-primary">
            Konvite
          </a>
          <nav className="hidden md:flex items-center gap-6">
            {!session && (
              <a
                href="/recursos"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                {t("header.resources")}
              </a>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          {!session ? (
            <Button
              size="sm"
              onClick={() => setShowAuthDialog(true)}
              className="hidden md:flex"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {t("header.login")}
            </Button>
          ) : (
            <div className="hidden md:block">
              <UserMenu
                user={{
                  name: session.user?.user_metadata?.name || session.user.email,
                  email: session.user?.email,
                  picture: session.user?.user_metadata?.avatar_url,
                }}
                onLogout={handleLogout}
              />
            </div>
          )}
        </div>
      </div>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onComplete={() => setShowAuthDialog(false)}
      />
    </header>
  );
}
