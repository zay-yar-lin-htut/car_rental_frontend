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
				API_ENDPOINTS.user.base,
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
		if (!user) {
			fetchUserProfile();
		} else {
			setProfileLoading(false);
		}
		checkIsHaveFine();
	}, [user, fetchUserProfile, checkIsHaveFine]);

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

			const previousUser = user;

			// Prepare optimistic data. For the UI, we can use the blob URL for an
			// instant preview of the new avatar on the main profile page.
			const optimisticUser = { ...user, ...formData };
			if (selectedFile) {
				optimisticUser.profile_image_url = URL.createObjectURL(selectedFile);
			}

			// Close dialog & apply optimistic update
			handleCloseDialog();
			setUser(optimisticUser);
			// Update localStorage, but without the temporary blob URL
			AUTH_CONFIG.setUserData({ ...user, ...formData });

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
					finalProfileData.profile_image_url = imageResponse.data.avatar_url;
				}

				const response = await dataServices.retrievePUT(
					finalProfileData,
					API_ENDPOINTS.users.updateProfile
				);

				// On success, clean up the temporary blob URL if it exists
				if (optimisticUser.profile_image_url.startsWith("blob:")) {
					URL.revokeObjectURL(optimisticUser.profile_image_url);
				}

				setUser(response.data);
				AUTH_CONFIG.setUserData(response.data);
				showSnackbar("Profile updated successfully!", "success");
			} catch (err) {
				// On failure, revert UI and show error
				if (optimisticUser.profile_image_url.startsWith("blob:")) {
					URL.revokeObjectURL(optimisticUser.profile_image_url);
				}
				setUser(previousUser);
				AUTH_CONFIG.setUserData(previousUser);
				showSnackbar(
					err.message ||
						"Failed to update profile. Changes have been reverted.",
					"error"
				);
			} finally {
				setIsSaving(false);
				setIsUpload(false);
			}
		},
		[isSaving, user, handleCloseDialog, showSnackbar]
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
