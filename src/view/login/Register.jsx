import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { API_ENDPOINTS } from "../../services/Configuration";
import { createDataServices } from "../../services/DataServices";
import { useSnackbar } from "../../contexts/ErrorMessage";

const dataServices = createDataServices();
const Register = () => {
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		agreeTerms: false,
	});
	const [showPassword, setShowPassword] = useState({
		password: false,
		confirmPassword: false,
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar();

	useEffect(() => {
		AOS.init({
			duration: 800,
			once: true,
		});
	}, []);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
		// Clear field-specific error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: null }));
		}
	};

	const togglePasswordVisibility = (field) => {
		setShowPassword((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	const validateForm = () => {
		const newErrors = {};
		if (!form.name.trim()) newErrors.name = "Name is required";
		if (!form.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(form.email)) {
			newErrors.email = "Invalid email address";
		}
		if (!form.phone.trim()) {
			newErrors.phone = "Phone number is required";
		} else if (!/^\+?\d{10,15}$/.test(form.phone.replace(/\s/g, ""))) {
			newErrors.phone = "Invalid phone number";
		}
		if (!form.password) {
			newErrors.password = "Password is required";
		} else if (form.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}
		if (form.password !== form.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}
		if (!form.agreeTerms) {
			newErrors.agreeTerms = "You must agree to the terms and conditions";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setErrors({});

		if (!validateForm()) {
			setLoading(false);
			return;
		}

		try {
			await dataServices
				.Register(
					{
						name: form.name,
						email: form.email,
						phone: form.phone,
						password: form.password,
						password_confirmation: form.confirmPassword,
					},
					API_ENDPOINTS.auth.register
				)
				.then((response) => {
					showSnackbar(response.message);
				})
				.catch((error) => {
					showSnackbar(error.message);
				});
			navigate("/login");
		} catch (err) {
			setErrors({ error: err.message || "Registration failed" });
		}
		setLoading(false);
	};

	return (
		<div className='min-h-screen bg-gray-50 flex flex-col justify-center py-6 sm:px-6 lg:px-8'>
			<div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				data-aos='fade-down'>
				<Link
					to='/'
					className='flex justify-center'>
					<h2 className='text-center text-3xl font-extrabold text-blue-600'>
						CarRental
					</h2>
				</Link>
				<h2 className='mt-3 text-center text-3xl font-extrabold text-gray-900'>
					Create your account
				</h2>
				<p className='mt-2 text-center text-sm text-gray-600'>
					Or{" "}
					<Link
						to='/login'
						className='font-medium text-blue-600 hover:text-blue-500'>
						sign in to your account
					</Link>
				</p>
			</div>

			<div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
				data-aos='fade-up'
				data-aos-delay='200'>
				<div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
					<form
						className='space-y-6'
						onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor='name'
								className='block text-sm font-medium text-gray-700'>
								User Name
							</label>
							<div className='mt-1'>
								<input
									id='name'
									name='name'
									type='text'
									autoComplete='given-name'
									value={form.name}
									onChange={handleChange}
									className={`appearance-none block w-full px-3 py-2 border ${
										errors.name ? "border-red-300" : "border-gray-300"
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
									placeholder='John Doe'
								/>
								{errors.name && (
									<p className='mt-1 text-sm text-red-600'>{errors.name}</p>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor='email'
								className='block text-sm font-medium text-gray-700'>
								Email address
							</label>
							<div className='mt-1'>
								<input
									id='email'
									name='email'
									type='email'
									autoComplete='email'
									value={form.email}
									onChange={handleChange}
									className={`appearance-none block w-full px-3 py-2 border ${
										errors.email ? "border-red-300" : "border-gray-300"
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
									placeholder='email@example.com'
								/>
								{errors.email && (
									<p className='mt-1 text-sm text-red-600'>{errors.email}</p>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor='phone'
								className='block text-sm font-medium text-gray-700'>
								Phone Number
							</label>
							<div className='mt-1'>
								<input
									id='phone'
									name='phone'
									type='tel'
									autoComplete='tel'
									value={form.phone}
									onChange={handleChange}
									className={`appearance-none block w-full px-3 py-2 border ${
										errors.phone ? "border-red-300" : "border-gray-300"
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
									placeholder='+1234567890'
								/>
								{errors.phone && (
									<p className='mt-1 text-sm text-red-600'>{errors.phone}</p>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium text-gray-700'>
								Password
							</label>
							<div className='mt-1 relative'>
								<input
									id='password'
									name='password'
									type={showPassword.password ? "text" : "password"}
									autoComplete='new-password'
									value={form.password}
									onChange={handleChange}
									className={`appearance-none block w-full px-3 py-2 border ${
										errors.password ? "border-red-300" : "border-gray-300"
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10`}
								/>
								<button
									type='button'
									className='absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 focus:outline-none'
									onClick={() => togglePasswordVisibility("password")}>
									{showPassword.password ? "Hide" : "Show"}
								</button>
								{errors.password && (
									<p className='mt-1 text-sm text-red-600'>{errors.password}</p>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor='confirmPassword'
								className='block text-sm font-medium text-gray-700'>
								Confirm Password
							</label>
							<div className='mt-1 relative'>
								<input
									id='confirmPassword'
									name='confirmPassword'
									type={showPassword.confirmPassword ? "text" : "password"}
									autoComplete='new-password'
									value={form.confirmPassword}
									onChange={handleChange}
									className={`appearance-none block w-full px-3 py-2 border ${
										errors.confirmPassword
											? "border-red-300"
											: "border-gray-300"
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10`}
								/>
								<button
									type='button'
									className='absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 focus:outline-none'
									onClick={() => togglePasswordVisibility("confirmPassword")}>
									{showPassword.confirmPassword ? "Hide" : "Show"}
								</button>
								{errors.confirmPassword && (
									<p className='mt-1 text-sm text-red-600'>
										{errors.confirmPassword}
									</p>
								)}
							</div>
						</div>

						<div className='flex items-center'>
							<input
								id='agreeTerms'
								name='agreeTerms'
								type='checkbox'
								checked={form.agreeTerms}
								onChange={handleChange}
								className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
							/>
							<label
								htmlFor='agreeTerms'
								className='ml-2 block text-sm text-gray-900'>
								I agree to the{" "}
								<a
									href='#'
									className='font-medium text-blue-600 hover:text-blue-500'>
									Terms and Conditions
								</a>
							</label>
							{errors.agreeTerms && (
								<p className='mt-1 text-sm text-red-600'>{errors.agreeTerms}</p>
							)}
						</div>

						{errors.error && (
							<div className='rounded-md bg-red-50 p-4'>
								<div className='flex'>
									<div className='ml-3'>
										<h3 className='text-sm font-medium text-red-800'>
											{errors.error}
										</h3>
									</div>
								</div>
							</div>
						)}

						<div>
							<button
								type='submit'
								disabled={loading}
								className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'>
								{loading ? (
									<>
										<svg
											className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
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
										Processing...
									</>
								) : (
									"Register"
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Register;
