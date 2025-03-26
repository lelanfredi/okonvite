import { useEffect, useState } from "react";
import Header from "./layout/Header";
import Hero from "./landing/Hero";
import EventsList from "./event/EventsList";
import { supabase } from "@/lib/supabase";

import { setPageTitle } from "@/lib/utils/page-title";

const Home = () => {
  useEffect(() => {
    setPageTitle();
  }, []);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {!session ? (
        <Hero />
      ) : (
        <main className="container mx-auto px-4 py-8 pt-24">
          <EventsList />
        </main>
      )}
    </div>
  );
};

export default Home;
