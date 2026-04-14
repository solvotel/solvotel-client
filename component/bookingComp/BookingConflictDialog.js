import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Chip,
  IconButton,
  Fade,
  alpha,
  useTheme,
  Paper,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HotelIcon from '@mui/icons-material/Hotel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import React from 'react';

const BookingConflictDialog = ({
  conflictDialogOpen,
  setConflictDialogOpen,
  conflictingBookings,
  handleNavigateToBooking,
}) => {
  const theme = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog
      open={conflictDialogOpen}
      onClose={() => setConflictDialogOpen(false)}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 20px 35px -8px rgba(0,0,0,0.2)',
          maxWidth: 500,
        },
      }}
    >
      {/* Header with warning gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
          color: 'white',
          position: 'relative',
          pb: 1.5,
        }}
      >
        <DialogTitle sx={{ pb: 0.5, pt: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <WarningAmberIcon sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700}>
                Booking Conflict
              </Typography>
            </Box>
            <IconButton
              onClick={() => setConflictDialogOpen(false)}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                },
              }}
              size="small"
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <Box sx={{ px: 3, pb: 1.5 }}>
          <Typography
            variant="body2"
            sx={{ opacity: 0.95, fontSize: '0.8rem' }}
          >
            {conflictingBookings?.length} open booking
            {conflictingBookings?.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>
      </Box>

      <DialogContent dividers={false} sx={{ p: 2.5 }}>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: '#dc2626',
              fontSize: '0.8rem',
              mb: 1,
            }}
          >
            ⚠️ Action Required
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}
          >
            One or more previous bookings for this room are still open. You must
            check them out before marking this booking as checked in.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Conflict List */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              fontSize: '0.7rem',
              mb: 1.5,
              display: 'block',
            }}
          >
            OPEN BOOKINGS
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {conflictingBookings.map((conflict, index) => (
              <Paper
                key={conflict.documentId}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  bgcolor: alpha(theme.palette.warning.main, 0.03),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(theme.palette.warning.main, 0.4),
                    bgcolor: alpha(theme.palette.warning.main, 0.06),
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <HotelIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ fontSize: '0.85rem' }}
                      >
                        {conflict.booking_id}
                      </Typography>
                    </Box>
                    <Chip
                      label="Open"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        bgcolor: '#fef3c7',
                        color: '#d97706',
                        '& .MuiChip-label': { px: 1, fontSize: '0.6rem' },
                      }}
                    />
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                    onClick={() => handleNavigateToBooking(conflict.documentId)}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      borderRadius: 1.5,
                      px: 1.5,
                      py: 0.5,
                      minWidth: 'auto',
                      bgcolor: '#3b82f6',
                      '&:hover': {
                        bgcolor: '#2563eb',
                      },
                    }}
                  >
                    Open
                  </Button>
                </Box>

                {/* Optional: Show additional booking details */}
                <Box sx={{ display: 'flex', gap: 2, mt: 1, pt: 0.5 }}>
                  {conflict.createdAt && (
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <CalendarTodayIcon
                        sx={{ fontSize: 10, color: 'text.secondary' }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontSize: '0.65rem', color: 'text.secondary' }}
                      >
                        {formatDate(conflict.createdAt)}
                      </Typography>
                    </Box>
                  )}
                  {conflict.guest_name && (
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <PersonIcon
                        sx={{ fontSize: 10, color: 'text.secondary' }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontSize: '0.65rem', color: 'text.secondary' }}
                      >
                        {conflict.guest_name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Quick Tip */}
        <Box
          sx={{
            mt: 2.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha('#3b82f6', 0.05),
            border: `1px solid ${alpha('#3b82f6', 0.1)}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontSize: '0.65rem', color: '#3b82f6', display: 'block' }}
          >
            💡 Tip: You can check out these bookings from their respective pages
            before proceeding.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1, bgcolor: alpha('#f8f9fa', 0.5) }}>
        <Button
          onClick={() => setConflictDialogOpen(false)}
          variant="outlined"
          size="small"
          sx={{
            textTransform: 'none',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            borderColor: alpha('#6b7280', 0.3),
            color: '#6b7280',
            '&:hover': {
              borderColor: '#6b7280',
              bgcolor: alpha('#6b7280', 0.05),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => setConflictDialogOpen(false)}
          variant="contained"
          size="small"
          sx={{
            textTransform: 'none',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #d97706 0%, #b91c1c 100%)',
            },
          }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingConflictDialog;
