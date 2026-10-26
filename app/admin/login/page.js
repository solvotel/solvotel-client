'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';

import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  HotelOutlined,
  AdminPanelSettingsOutlined,
  CheckCircleOutline,
  BarChartOutlined,
} from '@mui/icons-material';
import { useAuth } from '@/context';
import axios from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { BASEURL } from '@/config/MainApi';

export default function AdminLoginPage() {
  const router = useRouter();
  const { dispatchAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // check authenticated
  useEffect(() => {
    const { user } = parseCookies();
    const parsedUser = JSON.parse(user || 'null');
    if (parsedUser || parsedUser?.role.name === 'Admin') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  // fet the populated user
  const getPopulatedUser = async (token, id) => {
    try {
      const res = await axios.get(`${BASEURL}/users/${id}?populate=*`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = res.data;
      return result;
    } catch (err) {
      throw err;
    }
  };

  // authenticating user account
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    dispatchAuth({ type: 'AUTH_LOADING' });
    setLoading(true);
    setError('');
    try {
      const payload = {
        identifier: email,
        password,
      };
      const res = await axios.post(`${BASEURL}/auth/local`, payload);

      if (res.data.jwt && res.data.user) {
        const populatedUser = await getPopulatedUser(
          res.data.jwt,
          res.data.user.id,
        );

        if (populatedUser?.role?.name !== 'Admin') {
          const message = 'Only admin accounts can access the admin panel.';
          setError(message);
          dispatchAuth({ type: 'LOGIN_FAILED', payload: message });
          return;
        }

        // set the jwt in the cookies
        setCookie(null, 'token', res.data.jwt, {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
        });
        // set the user in the cookies
        setCookie(null, 'user', JSON.stringify(populatedUser), {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
        });
        dispatchAuth({
          type: 'LOGIN_SUCCESS',
          payload: { token: res.data.jwt, user: populatedUser },
        });
        router.push('/admin/dashboard');
        return;
      }
      throw new Error(
        'The authentication response did not include a user token.',
      );
    } catch (error) {
      console.log(`Error while login: ${error}`);
      setError(
        'Unable to sign in. Please check your credentials and try again.',
      );
      dispatchAuth({
        type: 'LOGIN_FAILED',
        payload: error.message
          ? error.message
          : 'Something went wrong, try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: '#f8fafc',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 1050,
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          borderRadius: 5,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        {/* ───────── Left Visual Panel ───────── */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 5,
            color: '#fff',
            background: 'linear-gradient(145deg, #0a2e4b 0%, #1b4a6b 100%)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              opacity: 0.08,
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M20 30 L40 15 L60 30 L40 45 Z' fill='white'/><path d='M40 70 L60 55 L80 70 L60 85 Z' fill='white'/><path d='M70 25 L85 40 L70 55 L55 40 Z' fill='white'/><circle cx='30' cy='80' r='5' fill='white'/><circle cx='80' cy='80' r='5' fill='white'/></svg>")`,
              backgroundSize: '120px',
              pointerEvents: 'none',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <HotelOutlined fontSize="large" />
              </Box>
              <Typography variant="h4" component="h1" fontWeight={700}>
                Solvotel
              </Typography>
            </Stack>
            <Typography
              variant="subtitle1"
              sx={{ opacity: 0.85, maxWidth: 380 }}
            >
              India&apos;s Top Hotel Management Software. Manage reservations,
              front desk, housekeeping &amp; billing — all in one place.
            </Typography>
          </Box>

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Stack spacing={2} mb={4}>
              {[
                'Real-time room availability & bookings',
                'Integrated billing & invoicing',
                'Housekeeping & front desk automation',
              ].map((text, i) => (
                <Stack
                  key={i}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                >
                  <CheckCircleOutline sx={{ color: '#34d399' }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {text}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <BarChartOutlined sx={{ opacity: 0.7 }} />
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Trusted by 100+ hotels &amp; resorts across India
              </Typography>
            </Stack>
          </Box>
        </Box>

        {/* ───────── Right Login Form ───────── */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            p: { xs: 4, sm: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: { md: 420 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
            <AdminPanelSettingsOutlined color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight={700}>
              Admin Login
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sign in to access the Solvotel admin panel
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <TextField
            label="Username"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
            mb={1}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Remember me</Typography>}
            />
            <Link
              href="/admin/forgot-password"
              variant="body2"
              underline="hover"
            >
              Forgot password?
            </Link>
          </Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.4,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              borderRadius: 2.5,
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : (
              'Sign In'
            )}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              SOLVOTEL ADMIN
            </Typography>
          </Divider>

          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            display="block"
          >
            &copy; {new Date().getFullYear()} Solvotel. All rights reserved.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
