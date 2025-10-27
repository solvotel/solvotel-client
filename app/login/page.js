'use client';
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  Link,
  Divider,
  FormControl,
  InputAdornment,
  IconButton,
  OutlinedInput,
  CircularProgress,
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// mui icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

import { ErrorToast, WarningToast } from '@/utils/GenerateToast';
import styled from '@emotion/styled';
import { useAuth } from '@/context';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { setCookie } from 'nookies';
import axios from 'axios';

import { BASEURL } from '@/config/MainApi';

const CustomLable = styled(Box)`
  display: flex;
  align-items: center;
  font-size: 17px;
  margin-bottom: 1px;
  color: #7f7f7f;
  & > svg {
    font-size: 20px;
    margin-right: 4px;
  }
`;

export default function FacebookLogin() {
  const router = useRouter();
  const { dispatchAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

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
      console.log(err);
    }
  };

  // authenticating user account
  const authenticateUser = async (data, event) => {
    event.preventDefault();
    if (!data.userName || !data.password) {
      WarningToast('Please Enter Email and Password');
      return;
    }
    dispatchAuth({ type: 'AUTH_LOADING' });
    setLoading(true);
    try {
      const payload = {
        identifier: data.userName,
        password: data.password,
      };
      const res = await axios.post(`${BASEURL}/auth/local`, payload);

      if (res.data.jwt && res.data.user) {
        const populatedUser = await getPopulatedUser(
          res.data.jwt,
          res.data.user.id
        );

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

        router.push(`/dashboard`);
        return;
      }
    } catch (error) {
      setLoading(false);
      ErrorToast('Email or Password does not exist.');
      console.log(`Error while login: ${error}`);
      dispatchAuth({
        type: 'LOGIN_FAILED',
        payload: error.message
          ? error.message
          : 'Something went wrong, try again',
      });
    }
  };
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#1e3a8a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: '980px',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 4,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Left Side */}
        <Box sx={{ flex: 1 }}>
          <Image
            src="https://res.cloudinary.com/deyxdpnom/image/upload/v1760010903/logo_f027a1ac91.webp"
            height={60}
            width={250}
            alt="logo"
          />
          <Typography sx={{ fontSize: '28px', color: '#fff' }}>
            Solvotel helps you manage and share with the people in your life.
          </Typography>
        </Box>

        {/* Right Side (Login Card) */}
        <Card
          sx={{
            flex: 1,
            p: 4,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: 2,
            maxWidth: '396px',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',

              mb: 3,
            }}
          >
            Login to your dashbaord
          </Typography>
          <form onSubmit={handleSubmit(authenticateUser)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <CustomLable>
                  <AccountCircleOutlinedIcon />
                  Username
                </CustomLable>
                <TextField
                  id="outlined-basic"
                  placeholder="Enter your username"
                  variant="outlined"
                  size="small"
                  {...register('userName')}
                />
              </FormControl>
              <FormControl variant="outlined" fullWidth>
                <CustomLable>
                  <LockOutlinedIcon />
                  Password
                </CustomLable>
                <OutlinedInput
                  {...register('password')}
                  size="small"
                  id="outlined-adornment-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
              <Button
                variant="contained"
                fullWidth
                type="submit"
                sx={{
                  bgcolor: '#f97316',
                  fontWeight: 'bold',
                  fontSize: '17px',
                  textTransform: 'none',
                  py: 1.2,
                  '&:hover': { bgcolor: '#eb6302ff' },
                }}
              >
                {loading ? (
                  <CircularProgress color={'#fff'} size={30} />
                ) : (
                  'Log in'
                )}
              </Button>
            </Box>
          </form>
        </Card>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          textAlign: 'center',
          width: '100%',
        }}
      ></Box>
    </Box>
  );
}
