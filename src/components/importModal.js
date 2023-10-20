import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ImportModal = ({ open, onClose, children, title = 'Import Data' }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth='xl' fullWidth >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {/* Add your import form or content here */}
                {children}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
                {/* You can add more actions or buttons here */}
            </DialogActions>
        </Dialog>
    );
};
export default ImportModal