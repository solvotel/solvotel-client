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

const UpdateRestaurantProfileForm = ({ data, auth }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    res_name: data.res_name || '',
    res_mobile: data.res_mobile || '',
    res_email: data.res_email || null,
    res_alt_mobile: data.res_alt_mobile || null,
    res_gst_no: data.res_gst_no || '',
    res_website: data.res_website || '',
    res_address_line1: data.res_address_line1 || '',
    res_address_line2: data.res_address_line2 || '',
    res_district: data.res_district || '',
    res_state: data.res_state || 'West Bengal',
    res_pincode: data.res_pincode || '',
    res_footer: data.res_footer || '',
    res_upi_id: data.res_upi_id || '',
    res_upi_name: data.res_upi_name || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    // Required fields
    if (!formData.res_name.trim())
      newErrors.res_name = 'Restaurant name is required';
    if (!formData.res_mobile.trim())
      newErrors.res_mobile = 'Mobile number is required';

    if (!formData.res_address_line1.trim())
      newErrors.res_address_line1 = 'Address Line 1 is required';
    if (!formData.res_district.trim())
      newErrors.res_district = 'District is required';
    if (!formData.res_state.trim()) newErrors.res_state = 'State is required';
    if (!formData.res_pincode) newErrors.res_pincode = 'Pin code is required';

    // Conditional validation
    if (formData.res_email) {
      if (
        formData.res_email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.res_email)
      )
        newErrors.res_email = 'Enter a valid email address';
    }
    if (formData.res_alt_mobile) {
      if (
        formData.res_alt_mobile.trim() &&
        !/^[0-9]{10}$/.test(formData.res_alt_mobile)
      )
        newErrors.res_alt_mobile = 'Enter a valid 10-digit mobile number';
    }
    if (formData.res_mobile.trim() && !/^[0-9]{10}$/.test(formData.res_mobile))
      newErrors.res_mobile = 'Enter a valid 10-digit mobile number';

    if (formData.res_pincode && !/^[0-9]{6}$/.test(formData.res_pincode))
      newErrors.res_pincode = 'Enter a valid 6-digit pin code';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      ErrorToast('Please fix validation errors.');
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

  const getResDistrictOptions = () => {
    return formData.res_state ? stateDistricts[formData.res_state] || [] : [];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ width: '100%', marginTop: '2rem' }}
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
        <form onSubmit={handleSubmit}>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="secondary"
            gutterBottom
          >
            🍴 Restaurant Details
          </Typography>

          <Grid container spacing={2}>
            {/* Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Name"
                name="res_name"
                value={formData.res_name}
                onChange={handleChange}
                error={!!errors.res_name}
                helperText={errors.res_name}
              />
            </Grid>

            {/* Mobile */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Mobile No"
                name="res_mobile"
                value={formData.res_mobile}
                onChange={handleChange}
                error={!!errors.res_mobile}
                helperText={errors.res_mobile}
              />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                name="res_email"
                value={formData.res_email}
                onChange={handleChange}
                error={!!errors.res_email}
                helperText={errors.res_email}
              />
            </Grid>

            {/* Alt Mobile */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Alt Mobile"
                name="res_alt_mobile"
                value={formData.res_alt_mobile}
                onChange={handleChange}
                error={!!errors.res_alt_mobile}
                helperText={errors.res_alt_mobile}
              />
            </Grid>

            {/* GST */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="GST No"
                name="res_gst_no"
                value={formData.res_gst_no}
                onChange={handleChange}
                error={!!errors.res_gst_no}
                helperText={errors.res_gst_no}
              />
            </Grid>

            {/* Website */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Website"
                name="res_website"
                value={formData.res_website}
                onChange={handleChange}
              />
            </Grid>

            {/* Address */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Address Line 1"
                name="res_address_line1"
                value={formData.res_address_line1}
                onChange={handleChange}
                error={!!errors.res_address_line1}
                helperText={errors.res_address_line1}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Address Line 2"
                name="res_address_line2"
                value={formData.res_address_line2}
                onChange={handleChange}
              />
            </Grid>

            {/* District */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label="District"
                name="res_district"
                value={formData.res_district}
                onChange={handleChange}
                error={!!errors.res_district}
                helperText={errors.res_district}
              >
                <MenuItem value="">Select District</MenuItem>
                {getResDistrictOptions().map((district) => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* State */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label="State"
                name="res_state"
                value={formData.res_state}
                onChange={handleChange}
                error={!!errors.res_state}
                helperText={errors.res_state}
              >
                {indianStatesAndUTs.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Pin Code */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Pin Code"
                name="res_pincode"
                value={formData.res_pincode}
                onChange={handleChange}
                type="number"
                error={!!errors.res_pincode}
                helperText={errors.res_pincode}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="UPI Id"
                name="res_upi_id"
                value={formData.res_upi_id}
                onChange={handleChange}
                error={!!errors.res_upi_id}
                helperText={errors.res_upi_id || ''}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="UPI Name"
                name="res_upi_name"
                value={formData.res_upi_name}
                onChange={handleChange}
                error={!!errors.res_upi_name}
                helperText={errors.res_upi_name || ''}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Invoice Footer"
                name="res_footer"
                value={formData.res_footer}
                onChange={handleChange}
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

export default UpdateRestaurantProfileForm;
