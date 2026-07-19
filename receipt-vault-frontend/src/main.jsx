import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";

import "./index.css";
import App from "./App.jsx";

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,

  // Automatically uses localhost during development
  // and the CloudFront URL after deployment
  redirect_uri: window.location.origin,

  post_logout_redirect_uri: window.location.origin,

  response_type: "code",
  scope: "openid email",
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>
);
