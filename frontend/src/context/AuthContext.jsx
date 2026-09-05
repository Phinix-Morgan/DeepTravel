import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../services/auth";

const AuthContext = createContext(null);

const TOKEN_KEY =
  "deeptravel_access_token";

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [token, setToken] =
    useState(() =>
      localStorage.getItem(
        TOKEN_KEY
      )
    );

  const [loading, setLoading] =
    useState(true);


  // --------------------------------------------------
  // Save Access Token
  // --------------------------------------------------

  const saveToken = useCallback(
    (accessToken) => {
      if (!accessToken) {
        return;
      }

      localStorage.setItem(
        TOKEN_KEY,
        accessToken
      );

      setToken(accessToken);
    },
    []
  );


  // --------------------------------------------------
  // Clear Authentication
  // --------------------------------------------------

  const clearAuth = useCallback(() => {
    localStorage.removeItem(
      TOKEN_KEY
    );

    setToken(null);
    setUser(null);
  }, []);


  // --------------------------------------------------
  // Refresh Session
  // --------------------------------------------------

  const refreshSession =
    useCallback(async () => {
      const response =
        await refreshAccessToken();

      if (!response?.token) {
        throw new Error(
          "Refresh token response did not contain an access token."
        );
      }

      saveToken(response.token);

      const meResponse =
        await getCurrentUser(
          response.token
        );

      if (!meResponse?.user) {
        throw new Error(
          "Unable to restore the authenticated user."
        );
      }

      setUser(meResponse.user);

      return {
        token: response.token,
        user: meResponse.user,
      };
    }, [saveToken]);


  // --------------------------------------------------
  // Restore Existing Session
  // --------------------------------------------------

  const restoreSession =
    useCallback(async () => {
      try {
        const storedToken =
          localStorage.getItem(
            TOKEN_KEY
          );

        // ------------------------------------------------
        // First try the existing access token
        // ------------------------------------------------

        if (storedToken) {
          try {
            const response =
              await getCurrentUser(
                storedToken
              );

            if (response?.user) {
              setToken(storedToken);
              setUser(response.user);

              return;
            }
          } catch (error) {
            /*
             * A 401 means the access token is
             * expired/invalid. Continue to the
             * refresh-token flow.
             */

            if (error.status !== 401) {
              clearAuth();
              return;
            }
          }
        }


        // ------------------------------------------------
        // Then try the HttpOnly refresh cookie
        // ------------------------------------------------

        try {
          await refreshSession();
        } catch {
          clearAuth();
        }
      } finally {
        setLoading(false);
      }
    }, [
      clearAuth,
      refreshSession,
    ]);


  // --------------------------------------------------
  // Restore Session On Application Start
  // --------------------------------------------------

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);


  // --------------------------------------------------
  // Register
  // --------------------------------------------------

  const register = useCallback(
    async (
      name,
      email,
      password
    ) => {
      return registerUser({
        name,
        email,
        password,
      });
    },
    []
  );


  // --------------------------------------------------
  // Login
  // --------------------------------------------------

  const login = useCallback(
    async (
      email,
      password
    ) => {
      const response =
        await loginUser({
          email,
          password,
        });

      if (response?.token) {
        saveToken(
          response.token
        );
      }

      if (response?.user) {
        setUser(response.user);
      }

      return response;
    },
    [saveToken]
  );


  // --------------------------------------------------
  // Complete OAuth Login
  // --------------------------------------------------

  const completeOAuthLogin =
    useCallback(async () => {
      return refreshSession();
    }, [refreshSession]);


  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const logout = useCallback(
    async () => {
      try {
        await logoutUser();
      } finally {
        clearAuth();
      }
    },
    [clearAuth]
  );


  // --------------------------------------------------
  // Context Value
  // --------------------------------------------------

  const value = {
    user,
    token,
    loading,

    isAuthenticated:
      Boolean(user) &&
      Boolean(token),

    register,
    login,
    logout,

    completeOAuthLogin,

    clearAuth,
    restoreSession,
    refreshSession,
  };


  // --------------------------------------------------
  // Provider
  // --------------------------------------------------

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


// --------------------------------------------------
// useAuth Hook
// --------------------------------------------------

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
