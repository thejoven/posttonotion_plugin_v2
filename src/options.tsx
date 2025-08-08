import LoginView from "~views/loginView"
import InfosView from "~views/infosView"

import { useEffect, useState } from "react"
import { BaseViewProvider } from "~baseView"
import { authService, type AuthState } from "~services"

function IndexOptions() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    apiKey: null,
    userInfo: null,
    tags: null,
    authMethod: null
  });

  useEffect(() => {
    let mounted = true;

    const loadAuthState = async () => {
      const state = await authService.getAuthState();
      if (mounted) {
        setAuthState(state);
      }
    };

    const handleAuthStateChange = (newState: AuthState) => {
      console.log('Options page received auth state change:', newState);
      if (mounted) {
        console.log('Updating options page state');
        setAuthState(newState);
      }
    };

    loadAuthState();
    authService.onAuthStateChange(handleAuthStateChange);

    return () => {
      mounted = false;
      authService.removeAuthStateListener(handleAuthStateChange);
    };
  }, []);

  return (
    <BaseViewProvider>
        {(() => {
          console.log('Options render, authState:', authState);
          return authState.isAuthenticated ? <InfosView/> : <LoginView />;
        })()}        
    </BaseViewProvider>
  )
}

export default IndexOptions
