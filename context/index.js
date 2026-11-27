import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { parseCookies, destroyCookie } from 'nookies';
import { useRouter } from 'next/navigation';
import { authReducer } from './authReducer';
import { getIndiaDateKey, getNextIndiaMidnight } from '@/utils/SessionExpiry';

export const GlobalContext = createContext();

const initialState = {
  loading: false,
  token: null,
  user: null,
  error: null,
};

const GlobalProvider = ({ children }) => {
  const router = useRouter();
  const [auth, dispatchAuth] = useReducer(authReducer, initialState);

  const logout = useCallback(() => {
    destroyCookie(null, 'user', { path: '/' });
    destroyCookie(null, 'token', { path: '/' });
    destroyCookie(null, 'sessionDate', { path: '/' });
    dispatchAuth({ type: 'AUTH_RESET' });
    localStorage.removeItem('someKey'); // only clear your auth keys if any
    router.replace('/');
    router.refresh();
  }, [router]);

  // ✅ Helper: check JWT expiry
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // decode JWT payload
      const exp = payload.exp * 1000; // convert to ms
      return Date.now() > exp;
    } catch (err) {
      return true; // if token invalid, treat as expired
    }
  };

  useEffect(() => {
    dispatchAuth({ type: 'AUTH_LOADING' });

    const loadUserFromCookies = async () => {
      const cookies = parseCookies();
      const token = cookies.token;
      const user = cookies.user ? JSON.parse(cookies.user) : null;

      if (token && user) {
        if (
          cookies.sessionDate !== getIndiaDateKey() ||
          isTokenExpired(token)
        ) {
          logout(); // 🔐 auto logout if token expired
        } else {
          dispatchAuth({
            type: 'LOGIN_SUCCESS',
            payload: { token, user },
          });
        }
      } else {
        destroyCookie(null, 'user', { path: '/' });
        destroyCookie(null, 'token', { path: '/' });
        destroyCookie(null, 'sessionDate', { path: '/' });
        dispatchAuth({ type: 'LOGIN_FAILED' });
      }
    };

    loadUserFromCookies();
  }, [logout]);

  useEffect(() => {
    if (!auth.token) return undefined;

    const checkSessionDate = () => {
      if (parseCookies().sessionDate !== getIndiaDateKey()) logout();
    };
    const midnightTimeout = window.setTimeout(
      logout,
      Math.max(0, getNextIndiaMidnight().getTime() - Date.now()),
    );

    window.addEventListener('focus', checkSessionDate);
    document.addEventListener('visibilitychange', checkSessionDate);

    return () => {
      window.clearTimeout(midnightTimeout);
      window.removeEventListener('focus', checkSessionDate);
      document.removeEventListener('visibilitychange', checkSessionDate);
    };
  }, [auth.token, logout]);

  return (
    <GlobalContext.Provider value={{ auth, dispatchAuth, logout }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useAuth = () => useContext(GlobalContext);

export default GlobalProvider;
