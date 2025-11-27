import React from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
} from '@mui/material';

const ConfirmDialog = ({
	open,
	onClose,
	onConfirm,
	title = 'Confirm Action',
	message = 'Are you sure you want to proceed?',
	confirmText = 'Confirm',
	cancelText = 'Cancel',
}) => {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			aria-labelledby="confirm-dialog-title"
			aria-describedby="confirm-dialog-description"
		>
			<DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 'bold' }}>{title}</DialogTitle>
			<DialogContent>
				<DialogContentText id="confirm-dialog-description">
					{message}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="primary">
					{cancelText}
				</Button>
				<Button onClick={onConfirm} color="primary" variant="contained" autoFocus>
					{confirmText}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmDialog;