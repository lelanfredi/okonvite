import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogIn } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import AuthDialog from "@/components/auth/AuthDialog";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { t } = useI18n();
  const [session, setSession] = useState<any>(null);

  React.useEffect(() => {
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

  const handleAuthComplete = () => {
    // Função chamada quando a autenticação é concluída
    setAuthDialogOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu de navegação</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
          <div className="flex flex-col gap-6 py-4">
            <div className="px-4">
              <h2 className="text-lg font-bold">Konvite</h2>
            </div>
            <nav className="flex flex-col gap-2">
              <a
                href="/"
                className="px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={() => setOpen(false)}
              >
                {t("header.home")}
              </a>
              {!session && (
                <a
                  href="/recursos"
                  className="px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                  onClick={() => setOpen(false)}
                >
                  {t("header.resources")}
                </a>
              )}
              {session && (
                <>
                  <a
                    href="/dashboard"
                    className="px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                    onClick={() => setOpen(false)}
                  >
                    {t("header.dashboard")}
                  </a>
                  <a
                    href="/events/create"
                    className="px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                    onClick={() => setOpen(false)}
                  >
                    {t("header.createEvent")}
                  </a>
                  <a
                    href="/profile"
                    className="px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                    onClick={() => setOpen(false)}
                  >
                    {t("header.profile")}
                  </a>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground rounded-md"
                  >
                    {t("header.logout")}
                  </button>
                </>
              )}
              {!session && (
                <div className="px-4 pt-4">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setOpen(false);
                      setAuthDialogOpen(true);
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {t("header.login")}
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        onComplete={handleAuthComplete}
      />
    </>
  );
}
