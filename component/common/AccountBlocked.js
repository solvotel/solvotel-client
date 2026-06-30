import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
} from '@mui/material';
import LockPersonRoundedIcon from '@mui/icons-material/LockPersonRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';

export default function AccountBlocked() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background:
          'linear-gradient(135deg, #f4f7fb 0%, #eef3ff 50%, #f8fafc 100%)',
        p: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          maxWidth: 560,
          width: '100%',
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 20px 60px rgba(15,23,42,0.08)',
        }}
      >
        <CardContent sx={{ p: 5 }}>
          <Stack spacing={4} alignItems="center">
            {/* Icon */}
            <Avatar
              sx={{
                width: 90,
                height: 90,
                bgcolor: '#FEECEC',
              }}
            >
              <LockPersonRoundedIcon
                sx={{
                  fontSize: 50,
                  color: 'error.main',
                }}
              />
            </Avatar>

            {/* Heading */}
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Account Blocked
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  maxWidth: 420,
                  mx: 'auto',
                  lineHeight: 1.8,
                }}
              >
                Your account has been blocked due to administrative reasons.
                Please contact our support team to verify your account or obtain
                further assistance.
              </Typography>
            </Box>

            {/* Support Box */}
            <Box
              sx={{
                width: '100%',
                p: 2.5,
                borderRadius: 3,
                bgcolor: '#F8FAFC',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: '#E8F1FF',
                    color: 'primary.main',
                    width: 56,
                    height: 56,
                  }}
                >
                  <SupportAgentRoundedIcon />
                </Avatar>

                <Box>
                  <Typography fontWeight={600} mb={0.5}>
                    Need Help?
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Our support team is available to help you resolve this issue
                    as quickly as possible.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Button */}
            <Button
              href="/contact"
              variant="contained"
              size="large"
              startIcon={<MailOutlineRoundedIcon />}
              sx={{
                borderRadius: 3,
                px: 5,
                py: 1.4,
                textTransform: 'none',
                fontSize: 16,
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(25,118,210,0.3)',
                },
              }}
            >
              Contact Support
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
