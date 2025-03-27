import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { useAuthRedirect } from "./hooks/useAuthRedirect";
import EventCreationWizard from "./components/event/EventCreationWizard";
import EventPage from "./components/event/EventPage";
import PublicEventPage from "./components/event/PublicEventPage";
import { AuthGuard } from "./components/auth/AuthGuard";
import Resources from "./components/landing/Resources";

function App() {
  useAuthRedirect();
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="min-h-screen">
        <Routes>
          {/* Public routes first */}
          <Route path="/" element={<Home />} />
          <Route path="/recursos" element={<Resources />} />
          <Route path="/e/:shortId" element={<PublicEventPage />} />

          {/* Protected routes */}
          <Route
            path="/new"
            element={
              <AuthGuard>
                <EventCreationWizard />
              </AuthGuard>
            }
          />
          <Route
            path="/events/:id"
            element={
              <AuthGuard>
                <EventPage />
              </AuthGuard>
            }
          />
          {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
        </Routes>
        {tempoRoutes}
      </div>
    </Suspense>
  );
}

export default App;
