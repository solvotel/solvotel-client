import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';

const CheckoutDialog = ({ open, setopen, handleSave }) => {
  return (
    <>
      <Dialog open={open} onClose={() => setopen(false)}>
        <DialogTitle>Mark Check Out</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to Check Out.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setopen(false)} color="inherit">
            No
          </Button>
          <Button onClick={handleSave} color="error" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CheckoutDialog;
