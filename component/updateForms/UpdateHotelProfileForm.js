import { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import { indianStatesAndUTs, stateDistricts } from '@/data/StatesDistricts';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { UpdateData } from '@/utils/ApiFunctions';

const UpdateHotelProfileForm = ({ data, auth }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    hotel_name: data.hotel_name || '',
    hotel_mobile: data.hotel_mobile || '',
    hotel_email: data.hotel_email || null,
    hotel_alt_mobile: data.hotel_alt_mobile || null,
    hotel_gst_no: data.hotel_gst_no || '',
    hotel_website: data.hotel_website || '',
    hotel_address_line1: data.hotel_address_line1 || '',
    hotel_address_line2: data.hotel_address_line2 || '',
    hotel_district: data.hotel_district || '',
    hotel_state: data.hotel_state || 'West Bengal',
    hotel_pincode: data.hotel_pincode || '',
    hotel_checkin: data.hotel_checkin || '',
    hotel_checkout: data.hotel_checkout || '',
    hotel_terms: data.hotel_terms || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Validation function
  const validate = () => {
    let newErrors = {};

    // Required fields
    if (!formData.hotel_name.trim())
      newErrors.hotel_name = 'Hotel name is required';
    if (!formData.hotel_mobile.trim())
      newErrors.hotel_mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(formData.hotel_mobile))
      newErrors.hotel_mobile = 'Enter a valid 10-digit mobile number';

    // ✅ Alt mobile is optional, but must be valid if entered
    if (formData.hotel_alt_mobile) {
      if (!/^[0-9]{10}$/.test(formData.hotel_alt_mobile))
        newErrors.hotel_alt_mobile = 'Enter a valid 10-digit mobile number';
    }

    if (!formData.hotel_address_line1.trim())
      newErrors.hotel_address_line1 = 'Address Line 1 is required';

    if (!formData.hotel_district.trim())
      newErrors.hotel_district = 'District is required';
    if (!formData.hotel_state.trim())
      newErrors.hotel_state = 'State is required';
    if (!formData.hotel_pincode)
      newErrors.hotel_pincode = 'Pincode is required';
    else if (!/^[1-9][0-9]{5}$/.test(formData.hotel_pincode))
      newErrors.hotel_pincode = 'Enter a valid 6-digit pincode';

    if (!formData.hotel_checkin)
      newErrors.hotel_checkin = 'Check-in time is required';
    if (!formData.hotel_checkout)
      newErrors.hotel_checkout = 'Check-out time is required';

    // Optional but format check
    if (
      formData.hotel_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.hotel_email)
    )
      newErrors.hotel_email = 'Enter a valid email address';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      ErrorToast('Please fix the validation errors.');
      return;
    }

    try {
      setLoading(true);
      const payload = { data: formData };
      await UpdateData({
        auth,
        endPoint: 'hotels',
        id: auth?.user?.hotel_id,
        payload,
      });
      SuccessToast('Data Updated Successfully.');
    } catch (err) {
      console.error('Error Updating Profile:', err);
      ErrorToast('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const getHotelDistrictOptions = () => {
    return formData.hotel_state
      ? stateDistricts[formData.hotel_state] || []
      : [];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ width: '100%' }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          maxWidth: 1100,
          width: '100%',
          bgcolor: 'white',
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
          🏨 Hotel Details
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {[
              { name: 'hotel_name', label: 'Hotel Name' },
              { name: 'hotel_mobile', label: 'Mobile No' },
              { name: 'hotel_email', label: 'Email' },
              { name: 'hotel_alt_mobile', label: 'Alt Mobile' },
              { name: 'hotel_gst_no', label: 'GST No' },
              { name: 'hotel_website', label: 'Website' },
              { name: 'hotel_address_line1', label: 'Address Line 1' },
              { name: 'hotel_address_line2', label: 'Address Line 2' },
            ].map((field) => (
              <Grid item key={field.name} size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={field.label}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  error={!!errors[field.name]}
                  helperText={errors[field.name] || ''}
                />
              </Grid>
            ))}

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label="District"
                name="hotel_district"
                value={formData.hotel_district}
                onChange={handleChange}
                error={!!errors.hotel_district}
                helperText={errors.hotel_district || ''}
              >
                <MenuItem value="">Select District</MenuItem>
                {getHotelDistrictOptions().map((district) => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label="State"
                name="hotel_state"
                value={formData.hotel_state}
                onChange={handleChange}
                error={!!errors.hotel_state}
                helperText={errors.hotel_state || ''}
              >
                {indianStatesAndUTs.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Pin Code"
                name="hotel_pincode"
                value={formData.hotel_pincode}
                onChange={handleChange}
                type="number"
                error={!!errors.hotel_pincode}
                helperText={errors.hotel_pincode || ''}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Check-in Time"
                name="hotel_checkin"
                type="time"
                value={formData.hotel_checkin}
                onChange={handleChange}
                error={!!errors.hotel_checkin}
                helperText={errors.hotel_checkin || ''}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Check-out Time"
                name="hotel_checkout"
                type="time"
                value={formData.hotel_checkout}
                onChange={handleChange}
                error={!!errors.hotel_checkout}
                helperText={errors.hotel_checkout || ''}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Terms & Conditions"
                name="hotel_terms"
                value={formData.hotel_terms}
                onChange={handleChange}
                error={!!errors.hotel_terms}
                helperText={errors.hotel_terms || ''}
              />
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ borderRadius: 3, px: 5 }}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </motion.div>
          </Box>
        </form>
      </Paper>
    </motion.div>
  );
};

export default UpdateHotelProfileForm;
