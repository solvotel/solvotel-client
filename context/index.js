import { createContext, useContext, useReducer, useEffect } from 'react';
import { parseCookies, destroyCookie } from 'nookies';
import { useRouter } from 'next/navigation';
import { authReducer } from './authReducer';

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

  const logout = () => {
    destroyCookie(null, 'user', { path: '/' });
    destroyCookie(null, 'token', { path: '/' });
    dispatchAuth({ type: 'AUTH_RESET' });
    localStorage.removeItem('someKey'); // only clear your auth keys if any
    router.replace('/');
    router.refresh();
  };

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
        if (isTokenExpired(token)) {
          logout(); // 🔐 auto logout if token expired
        } else {
          dispatchAuth({
            type: 'LOGIN_SUCCESS',
            payload: { token, user },
          });
        }
      } else {
        dispatchAuth({ type: 'LOGIN_FAILED' });
      }
    };

    loadUserFromCookies();
  }, []);

  return (
    <GlobalContext.Provider value={{ auth, dispatchAuth, logout }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useAuth = () => useContext(GlobalContext);

export default GlobalProvider;
