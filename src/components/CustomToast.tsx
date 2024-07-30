import * as React from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { ToastState } from '@/app/authentication/auth/AuthLogin';

interface CustomToastProps {
  toast: ToastState;
  setToast: React.Dispatch<React.SetStateAction<ToastState>>
}
export default function CustomToast({ toast, setToast }: CustomToastProps) {



  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setToast({
      show: false,
      message: '',
      type: 'info',
    });
  };

  return (
    <div>
      <Snackbar anchorOrigin={{
        horizontal: "right", vertical: "top"
      }} open={toast.show} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={toast.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
