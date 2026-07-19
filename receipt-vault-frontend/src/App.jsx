import { useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TopNavBar from "./components/TopNavBar";
import SideNavBar from "./components/SideNavBar";
import ReceiptsList from "./components/ReceiptsList";
import UploadReceipt from "./components/UploadReceipt";

function App() {
  const auth = useAuth();
  const loggedSessionRef = useRef(null);

  useEffect(() => {
    if (!import.meta.env.DEV || !auth.isAuthenticated || !auth.user) {
      return;
    }

    // React StrictMode can run effects twice in development; log each session once.
    const sessionKey = `${auth.user.profile.sub}:${auth.user.access_token}`;
    if (loggedSessionRef.current === sessionKey) {
      return;
    }

    loggedSessionRef.current = sessionKey;
    console.info("Cognito sign-in response", {
      ...auth.user,
      sub: auth.user.profile.sub,
    });
  }, [auth.isAuthenticated, auth.user]);

  const signOutRedirect = async () => {
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = window.location.origin;
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
    await auth.removeUser();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface"><h2>Loading...</h2></div>;
  }

  if (auth.error) {
    return <div className="min-h-screen flex items-center justify-center bg-surface"><h2>Error: {auth.error.message}</h2></div>;
  }

  if (auth.isAuthenticated) {
    return (
      <BrowserRouter>
        <div className="bg-surface min-h-screen text-on-surface">
          <TopNavBar email={auth.user?.profile.email} onLogout={signOutRedirect} />
          <SideNavBar />
          <Routes>
            <Route path="/" element={<Navigate to="/receipts" replace />} />
            <Route path="/receipts" element={<ReceiptsList />} />
            <Route path="/upload" element={<UploadReceipt />} />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-4">
      <h1 className="font-display-lg text-display-lg text-on-surface font-bold">Receipt Vault</h1>
      <button 
        onClick={() => auth.signinRedirect()}
        className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 font-label-md text-label-md rounded transition-colors"
      >
        Login with Cognito
      </button>
    </div>
  );
}

export default App;
