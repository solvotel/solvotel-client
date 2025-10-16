import { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import { indianStatesAndUTs, stateDistricts } from '@/data/StatesDistricts';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { UpdateData } from '@/utils/ApiFunctions';

const UpdateProfileForm = ({ data, auth }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Hotel defaults
    hotel_name: data.hotel_name || '',
    hotel_mobile: data.hotel_mobile || '',
    hotel_email: data.hotel_email || '',
    hotel_alt_mobile: data.hotel_alt_mobile || '',
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

    // Restaurant defaults
    res_name: data.res_name || '',
    res_mobile: data.res_mobile || '',
    res_email: data.res_email || '',
    res_alt_mobile: data.res_alt_mobile || '',
    res_gst_no: data.res_gst_no || '',
    res_website: data.res_website || '',
    res_address_line1: data.res_address_line1 || '',
    res_address_line2: data.res_address_line2 || '',
    res_district: data.res_district || '',
    res_state: data.res_state || 'West Bengal',
    res_pincode: data.res_pincode || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        data: formData,
      };
      await UpdateData({
        auth,
        endPoint: 'hotels',
        id: auth?.user?.hotel_id,
        payload,
      });
      SuccessToast('Data Updated Successfully.');
      setLoading(false);
      return;
    } catch (err) {
      console.log('Error Updating Profile:', err);
      ErrorToast('Something went wrong.');
      setLoading(false);
      return;
    }
  };

  const getHotelDistrictOptions = () => {
    return formData.hotel_state
      ? stateDistricts[formData.hotel_state] || []
      : [];
  };
  const getResDistrictOptions = () => {
    return formData.res_state ? stateDistricts[formData.res_state] || [] : [];
  };
  return (
    <>
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
          <Typography
            variant="h5"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            🏨 Hotel Details
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Hotel Details */}
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Hotel Name"
                  name="hotel_name"
                  value={formData.hotel_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Mobile No"
                  name="hotel_mobile"
                  value={formData.hotel_mobile}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="hotel_email"
                  value={formData.hotel_email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Alt Mobile"
                  name="hotel_alt_mobile"
                  value={formData.hotel_alt_mobile}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="GST No"
                  name="hotel_gst_no"
                  value={formData.hotel_gst_no}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Website"
                  name="hotel_website"
                  value={formData.hotel_website}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  name="hotel_address_line1"
                  value={formData.hotel_address_line1}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  name="hotel_address_line2"
                  value={formData.hotel_address_line2}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="District"
                  name="hotel_district"
                  value={formData.hotel_district}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="">Select District</MenuItem>
                  {getHotelDistrictOptions().map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="State"
                  name="hotel_state"
                  value={formData.hotel_state}
                  onChange={handleChange}
                  required
                >
                  {indianStatesAndUTs.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Pin Code"
                  name="hotel_pincode"
                  value={formData.hotel_pincode}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Check-in Time"
                  name="hotel_checkin"
                  type="time"
                  value={formData.hotel_checkin}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Check-out Time"
                  name="hotel_checkout"
                  type="time"
                  value={formData.hotel_checkout}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Terms & Conditions"
                  name="hotel_terms"
                  value={formData.hotel_terms}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Restaurant Details */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                color="secondary"
                gutterBottom
              >
                🍴 Restaurant Details
              </Typography>
            </motion.div>

            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Name"
                  name="res_name"
                  value={formData.res_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Mobile No"
                  name="res_mobile"
                  value={formData.res_mobile}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="res_email"
                  value={formData.res_email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Alt Mobile"
                  name="res_alt_mobile"
                  value={formData.res_alt_mobile}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="GST No"
                  name="res_gst_no"
                  value={formData.res_gst_no}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Website"
                  name="res_website"
                  value={formData.res_website}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  name="res_address_line1"
                  value={formData.res_address_line1}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  name="res_address_line2"
                  value={formData.res_address_line2}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="District"
                  name="res_district"
                  value={formData.res_district}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="">Select District</MenuItem>
                  {getResDistrictOptions().map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="State"
                  name="res_state"
                  value={formData.res_state}
                  onChange={handleChange}
                  required
                >
                  {indianStatesAndUTs.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Pin Code"
                  name="res_pincode"
                  value={formData.res_pincode}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ borderRadius: 3, px: 5 }}
                >
                  UPDATE
                </Button>
              </motion.div>
            </Box>
          </form>
        </Paper>
      </motion.div>
    </>
  );
};

export default UpdateProfileForm;
