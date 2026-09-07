import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../services/auth";

import {
  registerAuthRefreshHandler,
  setAuthAccessToken,
} from "../services/apiClient";

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

  const refreshSessionPromiseRef = useRef(null);
  const sessionGenerationRef = useRef(0);


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

      setAuthAccessToken(accessToken);
      setToken(accessToken);
    },
    []
  );


  // --------------------------------------------------
  // Clear Authentication
  // --------------------------------------------------

  const clearAuth = useCallback(() => {
    sessionGenerationRef.current += 1;
    refreshSessionPromiseRef.current = null;

    localStorage.removeItem(
      TOKEN_KEY
    );

    setAuthAccessToken(null);
    setToken(null);
    setUser(null);
  }, []);


  // --------------------------------------------------
  // Refresh Session
  // --------------------------------------------------

  const refreshSession = useCallback(() => {
    if (!refreshSessionPromiseRef.current) {
      const generation = sessionGenerationRef.current;

      refreshSessionPromiseRef.current = (async () => {
        try {
          const response = await refreshAccessToken();

          if (!response?.token) {
            throw new Error(
              "Refresh token response did not contain an access token."
            );
          }

          // Do not recurse into the API client's 401 recovery while it is
          // already performing the refresh workflow.
          const meResponse = await getCurrentUser(response.token, {
            retryOnUnauthorized: false,
          });

          if (!meResponse?.user) {
            throw new Error(
              "Unable to restore the authenticated user."
            );
          }

          // Logout can occur while the refresh request is in flight. Never
          // let that late response resurrect the previous session.
          if (generation !== sessionGenerationRef.current) {
            throw new Error("Authentication session was cleared.");
          }

          saveToken(response.token);
          setUser(meResponse.user);

          return {
            token: response.token,
            user: meResponse.user,
          };
        } catch (error) {
          // Invalid, expired, revoked, or deleted refresh sessions are final.
          // Network and server failures retain the current session state.
          if (
            generation === sessionGenerationRef.current &&
            (error?.status === 401 || error?.status === 404)
          ) {
            clearAuth();
          }

          throw error;
        }
      })().finally(() => {
        refreshSessionPromiseRef.current = null;
      });
    }

    return refreshSessionPromiseRef.current;
  }, [clearAuth, saveToken]);


  // --------------------------------------------------
  // Register API Refresh Handler
  // --------------------------------------------------

  useEffect(() => {
    return registerAuthRefreshHandler(
      refreshSession
    );
  }, [refreshSession]);


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
              await getCurrentUser(storedToken, {
                retryOnUnauthorized: false,
              });

            if (response?.user) {
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
          // refreshSession clears only invalid/expired/revoked sessions. A
          // transient backend/network error intentionally preserves state.
        }
      } finally {
        setLoading(false);
      }
    }, [
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
