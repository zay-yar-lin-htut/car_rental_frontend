import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createDataServices } from "../../services/DataServices";
import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import { useSnackbar } from "../../contexts/ErrorMessage";

const dataServices = createDataServices();

type UpdateResult = { success: boolean; message?: string };
type ProfileFormData = Record<string, unknown>;

export interface UserProfileData {
	user_id: string;
	name?: string;
	email?: string;
	phone?: string;
	address?: string;
	user_type_id?: number | string;
	profile_image_url?: string;
	no_show_count: number;
	cancellation_count: number;
	[key: string]: unknown;
}

export const useUserProfile = () => {
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar();

	const [user, setUser] = useState<UserProfileData | null>(AUTH_CONFIG.getUserData<UserProfileData>());
	const [profileLoading, setProfileLoading] = useState(true);
	const [openDialog, setOpenDialog] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isUpload, setIsUpload] = useState(true);
	const [fineDetails, setFineDetails] = useState<Record<string, unknown> | null>(null);

	const fetchUserProfile = useCallback(async () => {
		setProfileLoading(true);
		try {
			const response = await dataServices.retrieve(
				API_ENDPOINTS.users.base,
				API_ENDPOINTS.users.getUserProfile
			);
			setUser(response.data as UserProfileData);
			AUTH_CONFIG.setUserData(response.data);
		} catch (err) {
			showSnackbar((err as Error).message || "Could not fetch profile.", "error");
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

			const data = response.data as Record<string, unknown> & { data?: Record<string, unknown> };
			if (data?.have_fine && (data.data?.["Total Fine"] as number) > 0) {
				setFineDetails(data.data as Record<string, unknown>);
			}
		} catch {
			// Fail silently if user is not logged in or there's an error.
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
		async ({ formData, selectedFile }: { formData: ProfileFormData; selectedFile: File | null }): Promise<UpdateResult> => {
			if (isSaving) return { success: false };
			setIsSaving(true);

			try {
				setIsUpload(true);
				const finalProfileData: Record<string, unknown> = { ...formData };

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

					const imageData = imageResponse.data as Record<string, unknown>;
					finalProfileData.profile_image_url = imageData.avatar_url;
				}

				const response = await dataServices.retrievePUT(
					finalProfileData,
					API_ENDPOINTS.users.updateProfile
				);

				if (!response.success) {
					return { success: false, message: response.message || "Failed to update profile" };
				}

				// On success
				setUser(response.data as UserProfileData);
				AUTH_CONFIG.setUserData(response.data);
				handleCloseDialog();
				showSnackbar("Profile updated successfully!", "success");
				return { success: true };
			} catch (err) {
				return { success: false, message: (err as Error).message || "Failed to update profile." };
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
