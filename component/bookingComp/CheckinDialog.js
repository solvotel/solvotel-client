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
} from '@mui/material';
import {
  CheckCircleRounded,
  MeetingRoomRounded,
  CloseRounded,
  DoneAllRounded,
} from '@mui/icons-material';

const CheckinDialog = ({
  open,
  setOpen,
  rooms,
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

  const selectAllRooms = () => {
    setSelectedRoomKeys(rooms.map((room) => room.key));
  };

  const clearAllRooms = () => {
    setSelectedRoomKeys([]);
  };

  const allSelected =
    rooms.length > 0 && selectedRoomKeys.length === rooms.length;

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
            'linear-gradient(135deg, #087f5b 0%, #099268 55%, #20c997 100%)',
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
              <MeetingRoomRounded sx={{ fontSize: 29 }} />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ lineHeight: 1.2 }}
              >
                Mark Check In
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: 'rgba(255,255,255,0.82)',
                }}
              >
                Select arriving guests and confirm their rooms
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
          backgroundColor: '#fafcfb',
        }}
      >
        {/* Top information */}
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
              Today&apos;s Arrivals
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              Choose the rooms that are ready for check-in.
            </Typography>
          </Box>

          {rooms.length > 0 && (
            <Chip
              icon={<CheckCircleRounded sx={{ fontSize: 18 }} />}
              label={`${selectedRoomKeys.length} of ${rooms.length} selected`}
              sx={{
                fontWeight: 700,
                borderRadius: 2,
                backgroundColor:
                  selectedRoomKeys.length > 0 ? '#e6fcf5' : '#f1f3f5',
                color: selectedRoomKeys.length > 0 ? '#087f5b' : '#495057',
                '& .MuiChip-icon': {
                  color: selectedRoomKeys.length > 0 ? '#099268' : '#868e96',
                },
              }}
            />
          )}
        </Stack>

        {/* Select all / clear */}
        {rooms.length > 0 && (
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Button
              size="small"
              startIcon={<DoneAllRounded />}
              onClick={allSelected ? clearAllRooms : selectAllRooms}
              disabled={saving}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              {allSelected ? 'Clear All' : 'Select All'}
            </Button>
          </Stack>
        )}

        {/* Rooms */}
        {rooms.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)',
              },
              gap: 1.5,
              maxHeight: 340,
              overflowY: 'auto',
              pr: 0.5,
              '&::-webkit-scrollbar': {
                width: 6,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#ced4da',
                borderRadius: 10,
              },
            }}
          >
            {rooms.map((room) => {
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
                    borderColor: selected ? '#20c997' : '#e9ecef',
                    backgroundColor: selected ? '#e6fcf5' : '#fff',
                    transition: 'all 0.2s ease',
                    boxShadow: selected
                      ? '0 5px 18px rgba(32,201,151,0.12)'
                      : '0 2px 8px rgba(0,0,0,0.035)',
                    '&:hover': {
                      borderColor: '#20c997',
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
                      <CheckCircleRounded
                        sx={{
                          fontSize: 25,
                          color: '#099268',
                        }}
                      />
                    }
                    sx={{
                      p: 0,
                    }}
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
                      backgroundColor: selected ? '#c3fae8' : '#f1f3f5',
                      color: selected ? '#087f5b' : '#495057',
                    }}
                  >
                    <MeetingRoomRounded fontSize="small" />
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="body1"
                      fontWeight={800}
                      color="text.primary"
                    >
                      Room {room.room}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {selected ? 'Ready for check-in' : 'Not selected'}
                    </Typography>
                  </Box>

                  {selected && (
                    <CheckCircleRounded
                      sx={{
                        color: '#099268',
                        fontSize: 20,
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box
            sx={{
              py: 6,
              px: 2,
              textAlign: 'center',
              borderRadius: 3,
              border: '1px dashed #ced4da',
              backgroundColor: '#fff',
            }}
          >
            <MeetingRoomRounded
              sx={{
                fontSize: 48,
                color: '#adb5bd',
                mb: 1,
              }}
            />

            <Typography fontWeight={700} color="text.primary">
              No arrivals found
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              There are no rooms scheduled for check-in today.
            </Typography>
          </Box>
        )}

        {/* Selection summary */}
        {selectedRoomKeys.length > 0 && (
          <Box
            sx={{
              mt: 2.5,
              p: 1.75,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #f0fff9 0%, #e6fcf5 100%)',
              border: '1px solid #c3fae8',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <CheckCircleRounded
                sx={{
                  color: '#099268',
                  fontSize: 22,
                }}
              />

              <Box>
                <Typography variant="body2" fontWeight={800} color="#087f5b">
                  {selectedRoomKeys.length}{' '}
                  {selectedRoomKeys.length === 1 ? 'room' : 'rooms'} ready for
                  check-in
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Click Save to confirm the check-in.
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
          color="success"
          disabled={!selectedRoomKeys.length || saving}
          startIcon={saving ? null : <CheckCircleRounded />}
          sx={{
            px: 3,
            py: 1.1,
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 800,
            boxShadow: '0 6px 18px rgba(25,135,84,0.25)',
            '&:hover': {
              boxShadow: '0 8px 22px rgba(25,135,84,0.32)',
            },
          }}
        >
          {saving ? 'Saving…' : 'Confirm Check In'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckinDialog;
