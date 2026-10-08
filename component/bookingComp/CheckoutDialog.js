import React from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CheckCircleRounded,
  MeetingRoomRounded,
  CloseRounded,
  DoneAllRounded,
  ExpandMoreRounded,
  LogoutRounded,
} from '@mui/icons-material';
import { toDateKey } from '@/utils/DateFetcher';

const CheckoutDialog = ({
  open,
  setOpen,
  rooms,
  forceCheckoutRooms = [],
  selectedRoomKeys,
  setSelectedRoomKeys,
  saving,
  handleSave,
}) => {
  const toggleRoom = (roomKey) => {
    setSelectedRoomKeys((selected) =>
      selected.includes(roomKey)
        ? selected.filter((key) => key !== roomKey)
        : [...selected, roomKey],
    );
  };

  const toggleRoomSelection = (roomList) => {
    const roomKeys = roomList.map((room) => room.key);
    const allSelected =
      roomKeys.length > 0 &&
      roomKeys.every((key) => selectedRoomKeys.includes(key));

    setSelectedRoomKeys((selected) =>
      allSelected
        ? selected.filter((key) => !roomKeys.includes(key))
        : [...new Set([...selected, ...roomKeys])],
    );
  };

  const renderRoomCards = (roomList, description) =>
    roomList.map((room) => {
      const selected = selectedRoomKeys.includes(room.key);

      return (
        <Box
          key={room.key}
          onClick={() => !saving && toggleRoom(room.key)}
          sx={{
            position: 'relative',
            cursor: saving ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: selected ? '#ff6b6b' : '#e9ecef',
            backgroundColor: selected ? '#fff0f0' : '#fff',
            transition: 'all 0.2s ease',
            boxShadow: selected
              ? '0 5px 18px rgba(224,49,49,0.12)'
              : '0 2px 8px rgba(0,0,0,0.035)',
            '&:hover': {
              borderColor: '#ff6b6b',
              transform: saving ? 'none' : 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
            },
          }}
        >
          <Checkbox
            checked={selected}
            onChange={() => toggleRoom(room.key)}
            disabled={saving}
            onClick={(event) => event.stopPropagation()}
            icon={
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: 1.5,
                  border: '2px solid #ced4da',
                }}
              />
            }
            checkedIcon={
              <CheckCircleRounded sx={{ fontSize: 25, color: '#e03131' }} />
            }
            sx={{ p: 0 }}
          />

          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? '#ffe3e3' : '#f1f3f5',
              color: selected ? '#c92a2a' : '#495057',
            }}
          >
            <MeetingRoomRounded fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body1" fontWeight={800} color="text.primary">
              Room {room.room}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selected
                ? 'Ready for checkout'
                : typeof description === 'function'
                  ? description(room)
                  : description}
            </Typography>
          </Box>

          {selected && (
            <CheckCircleRounded sx={{ color: '#e03131', fontSize: 20 }} />
          )}
        </Box>
      );
    });

  const renderEmptyRoomList = (message) => (
    <Box
      sx={{
        py: 3,
        px: 2,
        textAlign: 'center',
        borderRadius: 3,
        border: '1px dashed #ced4da',
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );

  const totalRooms = rooms.length + forceCheckoutRooms.length;

  return (
    <Dialog
      open={open}
      onClose={() => !saving && setOpen(false)}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 70px rgba(0,0,0,0.20)',
          backgroundColor: '#fff',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 0,
          position: 'relative',
          background:
            'linear-gradient(135deg, #c92a2a 0%, #e03131 55%, #ff6b6b 100%)',
          color: '#fff',
        }}
      >
        <Box
          sx={{
            px: { xs: 2.5, sm: 3.5 },
            py: 3,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.22)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <LogoutRounded sx={{ fontSize: 29 }} />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ lineHeight: 1.2 }}
              >
                Mark Check Out
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: 'rgba(255,255,255,0.84)',
                }}
              >
                Select departing guests and complete their stay
              </Typography>
            </Box>

            <IconButton
              onClick={() => setOpen(false)}
              disabled={saving}
              sx={{
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.12)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.22)',
                },
              }}
            >
              <CloseRounded />
            </IconButton>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2, sm: 3.5 },
          py: 3,
          backgroundColor: '#fffafa',
        }}
      >
        {/* Information */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              color="text.primary"
            >
              Today&apos;s Departures
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              Choose the rooms that are ready for checkout.
            </Typography>
          </Box>

          {totalRooms > 0 && (
            <Chip
              icon={<LogoutRounded sx={{ fontSize: 18 }} />}
              label={`${selectedRoomKeys.length} of ${totalRooms} selected`}
              sx={{
                fontWeight: 700,
                borderRadius: 2,
                backgroundColor:
                  selectedRoomKeys.length > 0 ? '#fff0f0' : '#f1f3f5',
                color: selectedRoomKeys.length > 0 ? '#c92a2a' : '#495057',
                '& .MuiChip-icon': {
                  color: selectedRoomKeys.length > 0 ? '#e03131' : '#868e96',
                },
              }}
            />
          )}
        </Stack>

        <Stack spacing={2.5}>
          <Accordion defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreRounded />}>
              <Typography variant="subtitle2" fontWeight={800}>
                Scheduled for today ({rooms.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                {rooms.length > 0 && (
                  <Button
                    size="small"
                    startIcon={<DoneAllRounded />}
                    onClick={() => toggleRoomSelection(rooms)}
                    disabled={saving}
                    sx={{
                      alignSelf: 'flex-end',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 2,
                      color: '#c92a2a',
                      '&:hover': { backgroundColor: '#fff0f0' },
                    }}
                  >
                    {rooms.every((room) => selectedRoomKeys.includes(room.key))
                      ? 'Clear All'
                      : 'Select All'}
                  </Button>
                )}
                {rooms.length > 0 ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(3, 1fr)',
                      },
                      gap: 1.5,
                      maxHeight: 260,
                      overflowY: 'auto',
                      pr: 0.5,
                    }}
                  >
                    {renderRoomCards(rooms, 'Scheduled checkout')}
                  </Box>
                ) : (
                  renderEmptyRoomList(
                    'No rooms are scheduled for checkout today.',
                  )
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreRounded />}>
              <Typography variant="subtitle2" fontWeight={800}>
                Force checkout ({forceCheckoutRooms.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                <Typography variant="body2" color="text.secondary">
                  Check out checked-in rooms regardless of their scheduled
                  checkout date.
                </Typography>
                {forceCheckoutRooms.length > 0 && (
                  <Button
                    size="small"
                    startIcon={<DoneAllRounded />}
                    onClick={() => toggleRoomSelection(forceCheckoutRooms)}
                    disabled={saving}
                    sx={{
                      alignSelf: 'flex-end',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 2,
                      color: '#c92a2a',
                      '&:hover': { backgroundColor: '#fff0f0' },
                    }}
                  >
                    {forceCheckoutRooms.every((room) =>
                      selectedRoomKeys.includes(room.key),
                    )
                      ? 'Clear All'
                      : 'Select All'}
                  </Button>
                )}
                {forceCheckoutRooms.length > 0 ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(3, 1fr)',
                      },
                      gap: 1.5,
                      maxHeight: 260,
                      overflowY: 'auto',
                      pr: 0.5,
                    }}
                  >
                    {renderRoomCards(
                      forceCheckoutRooms,
                      (room) =>
                        `Scheduled checkout: ${
                          toDateKey(room.out_date) || 'date unavailable'
                        }`,
                    )}
                  </Box>
                ) : (
                  renderEmptyRoomList(
                    'No other checked-in rooms need checkout.',
                  )
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>

        {/* Selection Summary */}
        {selectedRoomKeys.length > 0 && (
          <Box
            sx={{
              mt: 2.5,
              p: 1.75,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%)',
              border: '1px solid #ffc9c9',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <CheckCircleRounded
                sx={{
                  color: '#e03131',
                  fontSize: 22,
                }}
              />

              <Box>
                <Typography variant="body2" fontWeight={800} color="#c92a2a">
                  {selectedRoomKeys.length}{' '}
                  {selectedRoomKeys.length === 1 ? 'room' : 'rooms'} ready for
                  checkout
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Click Confirm Checkout to complete the departure.
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3.5 },
          py: 2,
          backgroundColor: '#fff',
          borderTop: '1px solid #f1f3f5',
          gap: 1,
        }}
      >
        <Button
          onClick={() => setOpen(false)}
          color="inherit"
          disabled={saving}
          sx={{
            px: 2.5,
            py: 1.1,
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 700,
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          color="error"
          disabled={!selectedRoomKeys.length || saving}
          startIcon={saving ? null : <LogoutRounded />}
          sx={{
            px: 3,
            py: 1.1,
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 800,
            boxShadow: '0 6px 18px rgba(224,49,49,0.25)',
            '&:hover': {
              boxShadow: '0 8px 22px rgba(224,49,49,0.32)',
            },
          }}
        >
          {saving ? 'Saving…' : 'Confirm Checkout'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutDialog;
