import { Button } from "antd";
import React, { useState, useEffect } from "react";
import { FiEdit3 } from "react-icons/fi";
import { MdPhotoCamera } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, AUTH_CONFIG } from "../../../services/Configuration";
import defaultAvatar from "../../../assets/default_avatar.svg";
import { createDataServices } from "../../../services/DataServices";

const dataServices = createDataServices();

const ProfileView = () => {
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [updateProfileLoading, setUpdateProfileLoading] = useState(false);
	const [edit, setEdit] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		address: "",
		file: null,
	});
	const [user, setUser] = useState({});

	// Fetch user profile on mount
	useEffect(() => {
		const fetchProfile = async () => {
			setLoading(true);
			try {
				const res = await dataServices.retrieve(
					API_ENDPOINTS.users.base,
					API_ENDPOINTS.users.getUserProfile
				);
				const userData = Array.isArray(res) ? res[0] : res;
				setUser(userData);
				setFormData({
					name: userData.name || "",
					email: userData.email || "",
					phone: userData.phone || "",
					address: userData.address || "",
					file: userData.profile_image_url || null,
				});
			} catch (err) {
				console.error("Failed to fetch user data:", err.message);
			}
			setLoading(false);
		};
		fetchProfile();
	}, []);

	const handleSave = async () => {
		const payload = new FormData();
		payload.append("name", formData.name);
		payload.append("email", formData.email);
		payload.append("phone", formData.phone);
		payload.append("address", formData.address);

		if (formData.file instanceof File) {
			payload.append("image", formData.file);
		}
		setUpdateProfileLoading(true);
		try {
			await dataServices.retrievePOSTFormData(
				payload,
				API_ENDPOINTS.users.updateProfile
			);
			setEdit(false);
			// Optionally refetch user profile
			const res = await dataServices.retrieve(
				API_ENDPOINTS.users.base,
				API_ENDPOINTS.users.getUserProfile
			);
			const userData = Array.isArray(res) ? res[0] : res;
			setUser(userData);
			setFormData({
				name: userData.name || "",
				email: userData.email || "",
				phone: userData.phone || "",
				address: userData.address || "",
				file: userData.profile_image_url || null,
			});
		} catch (err) {
			console.error("Profile update failed:", err.message);
		}
		setUpdateProfileLoading(false);
	};

	const handleCancel = () => {
		setEdit(false);
		setFormData({
			name: user.name || "",
			email: user.email || "",
			phone: user.phone || "",
			address: user.address || "",
			file: user.profile_image_url || null,
		});
	};

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		if (!selectedFile) return;
		setFormData({
			...formData,
			file: selectedFile,
		});
	};

	useEffect(() => {
		let objectUrl;
		if (formData.file instanceof File) {
			objectUrl = URL.createObjectURL(formData.file);
		}
		return () => {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	}, [formData.file]);

	return (
		<div className='w-full bg-gray-50 min-h-screen py-8'>
			<div className='max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden'>
				{/* Header */}
				<div className='px-8 py-6 border-b flex justify-between items-center'>
					<div className='flex items-center space-x-3'>
						<div className='w-5 h-2 rounded-full bg-blue-600'></div>
						<h1 className='text-2xl font-semibold text-gray-800'>
							{edit ? "Edit Profile" : "My Profile"}
						</h1>
					</div>
					<button
						onClick={() => setEdit(!edit)}
						className='p-2 rounded-full hover:bg-gray-100 transition-colors'>
						<FiEdit3 className='w-5 h-5 text-gray-600' />
					</button>
				</div>

				{loading ? (
					<div className='flex w-full h-[35rem] items-center justify-center'>
						<div className='text-blue-700 text-lg font-semibold flex items-center gap-2'>
							<span className='animate-spin rounded-full border-4 border-blue-300 border-t-blue-700 h-8 w-8 inline-block'></span>
							Loading profile...
						</div>
					</div>
				) : (
					<div className='md:flex'>
						{/* Profile Picture Section */}
						<div className='md:w-1/3 p-8 flex flex-col items-center'>
							<div className='relative mb-4'>
								<div className='w-48 h-48 rounded-lg overflow-hidden bg-gray-100'>
									<img
										src={
											formData.file instanceof File
												? URL.createObjectURL(formData.file)
												: formData.file || defaultAvatar
										}
										alt='Profile'
										className='w-full h-full object-cover'
									/>
								</div>
								{edit && (
									<label className='absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100'>
										<MdPhotoCamera className='w-5 h-5 text-gray-700' />
										<input
											type='file'
											className='hidden'
											onChange={handleFileChange}
										/>
									</label>
								)}
							</div>
							<h2 className='text-xl font-medium text-gray-800'>
								{formData.name}
							</h2>
							<p className='text-gray-500'>{formData.email}</p>
						</div>

						{/* Profile Details Section */}
						<div className='md:w-2/3 p-8 border-t md:border-t-0 md:border-l border-gray-200'>
							<div className='space-y-6'>
								{["name", "email", "phone", "address"].map((field) => (
									<div
										key={field}
										className='grid grid-cols-1 md:grid-cols-3 gap-4'>
										<label className='text-gray-600 font-medium self-center'>
											{field.charAt(0).toUpperCase() + field.slice(1)}
										</label>
										<div className='md:col-span-2'>
											{edit ? (
												<input
													type={field === "email" ? "email" : "text"}
													value={formData[field]}
													onChange={(e) =>
														setFormData({
															...formData,
															[field]: e.target.value,
														})
													}
													className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
												/>
											) : (
												<p className='px-4 py-2 text-gray-800'>
													{formData[field] || "-"}
												</p>
											)}
										</div>
									</div>
								))}
							</div>

							{/* Action Buttons */}
							{edit && (
								<div className='mt-8 flex space-x-4 justify-end'>
									<button
										onClick={handleCancel}
										className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'>
										Cancel
									</button>
									<button
										onClick={handleSave}
										disabled={updateProfileLoading}
										className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center'>
										{updateProfileLoading && (
											<svg
												className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'>
												<circle
													className='opacity-25'
													cx='12'
													cy='12'
													r='10'
													stroke='currentColor'
													strokeWidth='4'></circle>
												<path
													className='opacity-75'
													fill='currentColor'
													d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
											</svg>
										)}
										Save Changes
									</button>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProfileView;
