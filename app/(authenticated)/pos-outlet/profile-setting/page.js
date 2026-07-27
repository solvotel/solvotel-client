'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { LockKeyhole } from 'lucide-react';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { useAuth } from '@/context';
import axios from 'axios';
import { BASEURL } from '@/config/MainApi';

const ProfileSettingPage = () => {
  const { auth } = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = 'Old password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updatePassword = async () => {
    const payload = {
      currentPassword: formData.oldPassword,
      password: formData.newPassword,
      passwordConfirmation: formData.confirmPassword,
    };

    await axios.post(`${BASEURL}/auth/change-password`, payload, {
      headers: {
        Authorization: `Bearer ${auth.token}`, // your logged in JWT
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      ErrorToast('Please fix the validation errors.');
      return;
    }

    try {
      setLoading(true);
      await updatePassword();
      SuccessToast('Password updated successfully.');
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      ErrorToast('Old Password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, md: 4 },
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ width: '100%', maxWidth: 520 }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            bgcolor: 'white',
          }}
        >
          <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <LockKeyhole size={24} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="primary">
              Update Password
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Keep your account secure by updating your password regularly.
            </Typography>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.2}>
              <TextField
                fullWidth
                label="Old Password"
                name="oldPassword"
                type="password"
                value={formData.oldPassword}
                onChange={handleChange}
                error={!!errors.oldPassword}
                helperText={errors.oldPassword || ''}
                autoComplete="current-password"
              />

              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                error={!!errors.newPassword}
                helperText={errors.newPassword || ''}
                autoComplete="new-password"
              />

              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword || ''}
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ borderRadius: 3, py: 1.2, mt: 1 }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Password'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ProfileSettingPage;
