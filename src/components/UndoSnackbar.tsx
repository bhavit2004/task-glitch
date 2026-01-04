import { Snackbar, Alert, Button } from '@mui/material';
import { useEffect, useState } from 'react';

interface UndoSnackbarProps {
  open: boolean;
  onClose: () => void;
  onUndo: () => void;
}

export default function UndoSnackbar({ open, onClose, onUndo }: UndoSnackbarProps) {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    setVisible(open);
  }, [open]);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setVisible(false);
    onClose(); // Clear lastDeleted
  };

  const handleUndo = () => {
    onUndo();
    setVisible(false);
    onClose(); // Clear lastDeleted after undo
  };

  return (
    <Snackbar
      open={visible}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity="info"
        action={
          <Button color="inherit" size="small" onClick={handleUndo}>
            UNDO
          </Button>
        }
      >
        Task deleted
      </Alert>
    </Snackbar>
  );
}
