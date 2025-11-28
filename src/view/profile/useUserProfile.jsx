import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createDataServices } from "../../services/DataServices";
import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import { useSnackbar } from "../../contexts/ErrorMessage";

const dataServices = createDataServices();

export const useUserProfile = () => {
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar();

	const [user, setUser] = useState(AUTH_CONFIG.getUserData());
	const [profileLoading, setProfileLoading] = useState(true);
	const [openDialog, setOpenDialog] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isUpload, setIsUpload] = useState(true);
	const [fineDetails, setFineDetails] = useState(null);

	const fetchUserProfile = useCallback(async () => {
		setProfileLoading(true);
		try {
			const response = await dataServices.retrieve(
				API_ENDPOINTS.users.base,
				API_ENDPOINTS.users.getUserProfile
			);
			setUser(response.data);
			AUTH_CONFIG.setUserData(response.data);
		} catch (err) {
			showSnackbar(err.message || "Could not fetch profile.", "error");
		} finally {
			setProfileLoading(false);
		}
	}, [showSnackbar]);

	const checkIsHaveFine = useCallback(async () => {
		try {
			const response = await dataServices.retrieve(
				API_ENDPOINTS.users.base,
				API_ENDPOINTS.users.haveFine
			);

			if (response.data.have_fine && response.data.data["Total Fine"] > 0) {
				setFineDetails(response.data.data);
			}
		} catch (err) {
			// Fail silently if user is not logged in or there's an error.
			// showSnackbar("Could not fetch fines status.", "error");
		}
	}, []);

	useEffect(() => {
		fetchUserProfile();
		checkIsHaveFine();
	}, [fetchUserProfile, checkIsHaveFine]);

	const handleOpenDialog = useCallback(() => {
		if (isSaving) return;
		setOpenDialog(true);
	}, [isSaving]);

	const handleCloseDialog = useCallback(() => {
		if (isSaving) return;
		setOpenDialog(false);
	}, [isSaving]);

	const handleProfileUpdate = useCallback(
		async ({ formData, selectedFile }) => {
			if (isSaving) return;
			setIsSaving(true);

			try {
				setIsUpload(true);
				let finalProfileData = { ...formData };

				if (selectedFile) {
					const imageFormData = new FormData();
					imageFormData.append("image", selectedFile);

					const imageResponse = await dataServices.retrievePOSTFormData(
						imageFormData,
						API_ENDPOINTS.users.uploadImage
					);

					if (!imageResponse.success) {
						return { success: false, message: imageResponse.message || "Failed to upload image" };
					}

					finalProfileData.profile_image_url = imageResponse.data.avatar_url;
				}

				const response = await dataServices.retrievePUT(
					finalProfileData,
					API_ENDPOINTS.users.updateProfile
				);

				if (!response.success) {
					return { success: false, message: response.message || "Failed to update profile" };
				}

				// On success
				setUser(response.data);
				AUTH_CONFIG.setUserData(response.data);
				handleCloseDialog();
				showSnackbar("Profile updated successfully!", "success");
				return { success: true };
			} catch (err) {
				return { success: false, message: err.message || "Failed to update profile." };
			} finally {
				setIsSaving(false);
				setIsUpload(false);
			}
		},
		[isSaving, handleCloseDialog, showSnackbar]
	);

	return {
		user,
		profileLoading,
		openDialog,
		isSaving,
		navigate,
		handleOpenDialog,
		handleCloseDialog,
		handleProfileUpdate,
		isUpload,
		setIsUpload,
		fineDetails,
	};
};
