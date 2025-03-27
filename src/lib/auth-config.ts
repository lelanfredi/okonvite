export const authConfig = {
  // Routes that require authentication
  protectedRoutes: [
    "/dashboard",
    "/events/create",
    "/events/manage",
    "/profile",
    "/settings",
    "/new",
  ],

  // Routes that should redirect to dashboard if user is authenticated
  publicOnlyRoutes: ["/login", "/signup"],

  // Routes that are always public
  publicRoutes: ["/e", "/e/"], // Public event routes

  // Default redirect after login if no returnTo is specified
  defaultProtectedRoute: "/dashboard",

  // Default redirect after logout
  defaultPublicRoute: "/",
};
