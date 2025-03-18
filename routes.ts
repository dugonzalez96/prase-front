/**
 * An array of routes that are accesible to the public
 * These routes do not require authentication
 * @type {string[]}
 */

/**
 * An array of routes that are for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
  "/login",
  "/error",
  "/reset",
  "/recuperar-contrasena",
  /^\/consulta\/.+$/ 
];

/**
* Prefix for API authentication routes
* Routes that start with this prefix are used for API
authentication purposes
* @type {string}
*/
export const apiAuthPrefix = "/api/auth";

/**
 * Default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/";
