'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context';
import { GetDataList, CreateNewData } from '@/utils/ApiFunctions';
import { SuccessToast } from '@/utils/GenerateToast';
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
} from '@mui/material';
import { PersonAdd, CheckCircle, Cancel, Search } from '@mui/icons-material';

export default function GuestStep({ selectedGuest, setSelectedGuest }) {
  const { auth } = useAuth();

  const data = GetDataList({ auth, endPoint: 'customers' });

  const [search, setSearch] = useState(
    selectedGuest ? selectedGuest?.mobile : ''
  );
  const [searchClicked, setSearchClicked] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm());
  const [errors, setErrors] = useState({});

  function initialForm() {
    return {
      name: '',
      mobile: '',
      email: '',
      address: '',
      dob: null,
      doa: null,
      company_name: '',
      gst_no: '',
      id_type: '',
      id_number: '',
      passport_issue_date: null,
      passport_exp_date: null,
      visa_number: '',
      visa_issue_date: null,
      visa_exp_date: null,
      hotel_id: auth?.user?.hotel_id || '',
    };
  }

  // Reset searchClicked when input changes
  useEffect(() => {
    if (searchClicked) setSearchClicked(false);
  }, [search]);

  const filteredData = useMemo(() => {
    if (!search) return [];
    if (!data) return [];

    const lowerSearch = search.toLowerCase();

    let list = data.filter(
      (item) =>
        item.mobile?.toLowerCase().includes(lowerSearch) ||
        item.name?.toLowerCase().includes(lowerSearch)
    );

    if (
      selectedGuest &&
      !list.find((g) => g.documentId === selectedGuest.documentId)
    ) {
      list = [selectedGuest, ...list];
    }

    return list;
  }, [data, search, selectedGuest]);

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile is required';
    else if (!/^[0-9]{10}$/.test(formData.mobile))
      newErrors.mobile = 'Enter valid 10-digit number';

    if (formData.id_type === 'Passport') {
      if (!formData.passport_issue_date)
        newErrors.passport_issue_date = 'Passport Issue Date is required';
      if (!formData.passport_exp_date)
        newErrors.passport_exp_date = 'Passport Expiry Date is required';
      if (!formData.visa_number)
        newErrors.visa_number = 'Visa Number is required';
      if (!formData.visa_issue_date)
        newErrors.visa_issue_date = 'Visa Issue Date is required';
      if (!formData.visa_exp_date)
        newErrors.visa_exp_date = 'Visa Expiry Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const res = await CreateNewData({
      auth,
      endPoint: 'customers',
      payload: { data: formData },
    });

    SuccessToast('Guest created successfully');
    setSelectedGuest(res?.data);

    setFormOpen(false);
    setFormData(initialForm());
  };

  return (
    <Box>
      {/* Heading */}
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 700,
          background: 'linear-gradient(90deg, #FF512F, #DD2476)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Select or Create Guest
      </Typography>

      {/* Search Area */}
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 9 }}>
          <TextField
            fullWidth
            placeholder="Enter Guest Phone Number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#f3f6f9',
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Button
            variant="outlined"
            startIcon={<PersonAdd />}
            fullWidth
            onClick={() => setFormOpen(true)}
            sx={{
              borderRadius: 3,
              py: 1.2,
              borderColor: '#6a11cb',
              color: '#6a11cb',
              fontWeight: 600,
              '&:hover': { bgcolor: '#f3f6f9', borderColor: '#2575fc' },
            }}
          >
            Create Guest
          </Button>
        </Grid>
      </Grid>

      {/* Guest Results */}
      <Box sx={{ mt: 4 }}>
        {data ? (
          filteredData.length > 0 ? (
            <Grid container spacing={2}>
              {filteredData.slice(0, 2).map((guest) => {
                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={guest.documentId}>
                    <Card
                      variant={
                        selectedGuest?.documentId === guest.documentId
                          ? 'elevation'
                          : 'outlined'
                      }
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 3,
                        borderColor:
                          selectedGuest?.documentId === guest.documentId
                            ? '#6a11cb'
                            : '#ccc',
                        background:
                          selectedGuest?.documentId === guest.documentId
                            ? 'linear-gradient(135deg, #e0e0ff, #f5f5ff)'
                            : '#fff',
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: 6,
                          transform: 'scale(1.02)',
                        },
                        position: 'relative',
                      }}
                      onClick={() => setSelectedGuest(guest)}
                    >
                      <CardContent>
                        {/* Name & Mobile */}
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          {guest.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#444' }}>
                          📞 {guest.mobile || '-'}
                        </Typography>

                        {/* Optional Details */}
                        {guest.email && (
                          <Typography variant="body2" sx={{ color: '#555' }}>
                            ✉️ {guest.email}
                          </Typography>
                        )}
                        {guest.dob && (
                          <Typography variant="body2" sx={{ color: '#555' }}>
                            🎂 DOB: {guest.dob}
                          </Typography>
                        )}
                        {guest.doa && (
                          <Typography variant="body2" sx={{ color: '#555' }}>
                            💍 DOA: {guest.doa}
                          </Typography>
                        )}
                        {guest.company_name && (
                          <Typography variant="body2" sx={{ color: '#555' }}>
                            🏢 Company: {guest.company_name}
                          </Typography>
                        )}
                        {guest.gst_no && (
                          <Typography variant="body2" sx={{ color: '#555' }}>
                            🧾 GST: {guest.gst_no}
                          </Typography>
                        )}
                        {guest.id_type && (
                          <Typography variant="body2" sx={{ color: '#555' }}>
                            🪪 {guest.id_type}: {guest.id_number || '-'}
                          </Typography>
                        )}

                        {/* Passport + Visa Section */}
                        {guest.id_type === 'Passport' && (
                          <>
                            {guest.passport_issue_date && (
                              <Typography
                                variant="body2"
                                sx={{ color: '#555' }}
                              >
                                📘 Passport Issue: {guest.passport_issue_date}
                              </Typography>
                            )}
                            {guest.passport_exp_date && (
                              <Typography
                                variant="body2"
                                sx={{ color: '#555' }}
                              >
                                📘 Passport Expiry: {guest.passport_exp_date}
                              </Typography>
                            )}
                            {guest.visa_number && (
                              <Typography
                                variant="body2"
                                sx={{ color: '#555' }}
                              >
                                🛂 Visa No: {guest.visa_number}
                              </Typography>
                            )}
                            {guest.visa_issue_date && (
                              <Typography
                                variant="body2"
                                sx={{ color: '#555' }}
                              >
                                🛂 Visa Issue: {guest.visa_issue_date}
                              </Typography>
                            )}
                            {guest.visa_exp_date && (
                              <Typography
                                variant="body2"
                                sx={{ color: '#555' }}
                              >
                                🛂 Visa Expiry: {guest.visa_exp_date}
                              </Typography>
                            )}
                          </>
                        )}
                      </CardContent>

                      {/* Selection Icon */}
                      {selectedGuest?.documentId === guest.documentId && (
                        <CheckCircle
                          color="primary"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            fontSize: 28,
                          }}
                        />
                      )}
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography color="error" sx={{ mt: 2 }}>
              Guest not found ❌
            </Typography>
          )
        ) : (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        )}
      </Box>

      {/* Create Guest Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#6a11cb' }}>
          Create New Guest
        </DialogTitle>
        <Divider />
        <DialogContent>
          {/* Form fields (same as your original, just cleaned styles) */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Mobile"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                error={!!errors.mobile}
                helperText={errors.mobile}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Date of birth"
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Date of anniversary"
                type="date"
                value={formData.doa}
                onChange={(e) =>
                  setFormData({ ...formData, doa: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="GST No"
                value={formData.gst_no}
                onChange={(e) =>
                  setFormData({ ...formData, gst_no: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label="ID Type"
                value={formData.id_type}
                onChange={(e) =>
                  setFormData({ ...formData, id_type: e.target.value })
                }
                error={!!errors.id_type}
                helperText={errors.id_type}
              >
                <MenuItem value="Aadhaar Card">Aadhaar Card</MenuItem>
                <MenuItem value="PAN Card">PAN Card</MenuItem>
                <MenuItem value="Driving License">Driving License</MenuItem>
                <MenuItem value="Passport">Passport</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="ID Number"
                value={formData.id_number}
                onChange={(e) =>
                  setFormData({ ...formData, id_number: e.target.value })
                }
                error={!!errors.id_number}
                helperText={errors.id_number}
              />
            </Grid>

            {formData.id_type === 'Passport' && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Passport Issue Date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.passport_issue_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passport_issue_date: e.target.value,
                      })
                    }
                    error={!!errors.passport_issue_date}
                    helperText={errors.passport_issue_date}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Passport Expiry Date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.passport_exp_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passport_exp_date: e.target.value,
                      })
                    }
                    error={!!errors.passport_exp_date}
                    helperText={errors.passport_exp_date}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Visa Number"
                    value={formData.visa_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visa_number: e.target.value,
                      })
                    }
                    error={!!errors.visa_number}
                    helperText={errors.visa_number}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Visa Expiry Date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.visa_issue_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visa_issue_date: e.target.value,
                      })
                    }
                    error={!!errors.visa_issue_date}
                    helperText={errors.visa_issue_date}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Visa Expiry Date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.visa_exp_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visa_exp_date: e.target.value,
                      })
                    }
                    error={!!errors.visa_exp_date}
                    helperText={errors.visa_exp_date}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: 3,
              bgcolor: '#6a11cb',
              '&:hover': { bgcolor: '#2575fc' },
            }}
          >
            Save Guest
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
