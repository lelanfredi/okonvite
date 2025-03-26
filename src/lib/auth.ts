import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!import.meta.env.VITE_AUTH0_DOMAIN || !import.meta.env.VITE_AUTH0_CLIENT_ID) {
    console.warn('Auth0 credentials not found. Authentication will not work.');
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
      cacheLocation="localstorage"
      onRedirectCallback={(appState) => {
        window.history.replaceState(
          {},
          document.title,
          appState?.returnTo || window.location.pathname
        );
      }}
    >
      {children}
    </Auth0Provider>
  );
}
