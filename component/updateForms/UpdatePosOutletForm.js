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

const UpdatePosOutletForm = ({ data, auth }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: data.name || '',
    phone: data.phone || '',
    email: data.email || null,
    alt_phone: data.alt_phone || null,
    gst_no: data.gst_no || '',
    website: data.website || '',
    address_line_1: data.address_line_1 || '',
    address_line_2: data.address_line_2 || '',
    district: data.district || '',
    state: data.state || 'West Bengal',
    pincode: data.pincode || '',
    footer: data.footer || '',
    upi_id: data.upi_id || '',
    upi_name: data.upi_name || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Restaurant name is required';
    if (!formData.phone.trim()) newErrors.phone = 'phone number is required';

    if (!formData.address_line_1.trim())
      newErrors.address_line_1 = 'Address Line 1 is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode) newErrors.pincode = 'Pin code is required';

    // Conditional validation
    if (formData.email) {
      if (
        formData.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      )
        newErrors.email = 'Enter a valid email address';
    }
    if (formData.alt_phone) {
      if (formData.alt_phone.trim() && !/^[0-9]{10}$/.test(formData.alt_phone))
        newErrors.alt_phone = 'Enter a valid 10-digit phone number';
    }
    if (formData.phone.trim() && !/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = 'Enter a valid 10-digit phone number';

    if (formData.pincode && !/^[0-9]{6}$/.test(formData.pincode))
      newErrors.pincode = 'Enter a valid 6-digit pin code';

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
        endPoint: 'pos-outlets',
        id: auth?.user?.pos_outlet_id,
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
    return formData.state ? stateDistricts[formData.state] || [] : [];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
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
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>

            {/* phone */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="phone No"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            {/* Alt phone */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="Alt phone"
                name="alt_phone"
                value={formData.alt_phone}
                onChange={handleChange}
                error={!!errors.alt_phone}
                helperText={errors.alt_phone}
              />
            </Grid>

            {/* GST */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="GST No"
                name="gst_no"
                value={formData.gst_no}
                onChange={handleChange}
                error={!!errors.gst_no}
                helperText={errors.gst_no}
              />
            </Grid>

            {/* Website */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </Grid>

            {/* Address */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                size="small"
                fullWidth
                label="Address Line 1"
                name="address_line_1"
                value={formData.address_line_1}
                onChange={handleChange}
                error={!!errors.address_line_1}
                helperText={errors.address_line_1}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                size="small"
                fullWidth
                label="Address Line 2"
                name="address_line_2"
                value={formData.address_line_2}
                onChange={handleChange}
              />
            </Grid>

            {/* District */}

            {/* State */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                select
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={!!errors.state}
                helperText={errors.state}
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
                size="small"
                select
                fullWidth
                label="District"
                name="district"
                value={formData.district}
                onChange={handleChange}
                error={!!errors.district}
                helperText={errors.district}
              >
                <MenuItem value="">Select District</MenuItem>
                {getResDistrictOptions().map((district) => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* Pin Code */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="Pin Code"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                type="number"
                error={!!errors.pincode}
                helperText={errors.pincode}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="UPI Id"
                name="upi_id"
                value={formData.upi_id}
                onChange={handleChange}
                error={!!errors.upi_id}
                helperText={errors.upi_id || ''}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="UPI Name"
                name="upi_name"
                value={formData.upi_name}
                onChange={handleChange}
                error={!!errors.upi_name}
                helperText={errors.upi_name || ''}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                size="small"
                fullWidth
                multiline
                rows={3}
                label="Invoice Footer"
                name="footer"
                value={formData.footer}
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

export default UpdatePosOutletForm;
