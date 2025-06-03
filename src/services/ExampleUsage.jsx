import React, { useState } from "react";
import {
	useFetch,
	useFetchById,
	useCreate,
	useUpdate,
	useDelete,
	useAuth,
	useInfiniteList,
} from "./DataServices";
import { API_ENDPOINTS, AUTH_CONFIG } from "./Configuration";

const ExampleUsage = () => {
	// State for form inputs
	const [carId, setCarId] = useState("");
	const [carData, setCarData] = useState({
		make: "",
		model: "",
		year: "",
		price: "",
		available: true,
	});

	// Authentication hook
	const { login, logout, isAuthenticated } = useAuth();

	// Fetch all cars with optional filtering
	const {
		data: cars,
		isLoading: carsLoading,
		error: carsError,
		refetch: refetchCars,
	} = useFetch(API_ENDPOINTS.cars.getAll, {
		// Optional query parameters
		params: {
			available: true,
			sort: "price",
		},
		// Transform the data
		select: (data) =>
			data.map((car) => ({
				...car,
				fullName: `${car.make} ${car.model} (${car.year})`,
				priceFormatted: `$${car.price.toFixed(2)}/day`,
			})),
		// Cache settings
		staleTime: 60000, // 1 minute
	});

	// Fetch a single car by ID
	const {
		data: singleCar,
		isLoading: singleCarLoading,
		error: singleCarError,
	} = useFetchById(API_ENDPOINTS.cars.base, carId, {
		// Only run the query if we have a carId
		enabled: !!carId,
		// This query requires authentication
		requireAuth: true,
	});

	// Create a new car
	const {
		mutate: createCar,
		isLoading: createLoading,
		error: createError,
	} = useCreate(API_ENDPOINTS.cars.create, {
		// Callback on successful creation
		onSuccess: (data) => {
			console.log("Car created successfully:", data);
			// Reset the form
			setCarData({
				make: "",
				model: "",
				year: "",
				price: "",
				available: true,
			});
			// Refetch the cars list
			refetchCars();
		},
		// Callback on error
		onError: (error) => {
			console.error("Error creating car:", error);
		},
		// This mutation requires authentication
		requireAuth: true,
	});

	// Update a car
	const {
		mutate: updateCar,
		isLoading: updateLoading,
		error: updateError,
	} = useUpdate(API_ENDPOINTS.cars.base, {
		// Callback on successful update
		onSuccess: (data) => {
			console.log("Car updated successfully:", data);
			// Refetch the single car
			refetchCars();
		},
		// This mutation requires authentication
		requireAuth: true,
	});

	// Delete a car
	const {
		mutate: deleteCar,
		isLoading: deleteLoading,
		error: deleteError,
	} = useDelete(API_ENDPOINTS.cars.base, {
		// Callback on successful deletion
		onSuccess: () => {
			console.log("Car deleted successfully");
			setCarId(""); // Clear the selected car
			refetchCars(); // Refetch the cars list
		},
		// This mutation requires authentication
		requireAuth: true,
	});

	// Infinite list for pagination
	const {
		data: paginatedCars,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteList(API_ENDPOINTS.cars.getAll, {
		pageSize: 5,
		params: { sort: "price" },
	});

	// Handle form submission for creating a car
	const handleCreateSubmit = (e) => {
		e.preventDefault();
		createCar({
			...carData,
			year: parseInt(carData.year),
			price: parseFloat(carData.price),
		});
	};

	// Handle form submission for updating a car
	const handleUpdateSubmit = (e) => {
		e.preventDefault();
		if (!carId) return;

		updateCar({
			id: carId,
			data: {
				...carData,
				year: parseInt(carData.year),
				price: parseFloat(carData.price),
			},
		});
	};

	// Handle car deletion
	const handleDelete = () => {
		if (!carId) return;
		if (window.confirm("Are you sure you want to delete this car?")) {
			deleteCar(carId);
		}
	};

	// Handle login
	const handleLogin = (e) => {
		e.preventDefault();
		login.mutate({
			email: "yaza9036@gmail.com",
			password: "password123",
		});
	};

	// Handle input changes
	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setCarData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	// Load car data into form when a car is selected
	const handleCarSelect = (id) => {
		setCarId(id);
		const selectedCar = cars?.find((car) => car.id === id);
		if (selectedCar) {
			setCarData({
				make: selectedCar.make,
				model: selectedCar.model,
				year: selectedCar.year.toString(),
				price: selectedCar.price.toString(),
				available: selectedCar.available,
			});
		}
	};

	return (
		<div className='container mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-6'>Car Rental Management</h1>

			{/* Authentication Section */}
			<div className='mb-8 p-4 bg-gray-100 rounded-lg'>
				<h2 className='text-xl font-semibold mb-4'>Authentication</h2>
				{isAuthenticated() ? (
					<div>
						<p className='text-green-600 mb-2'>You are logged in</p>
						<button
							onClick={() => logout.mutate()}
							className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'>
							Logout
						</button>
					</div>
				) : (
					<form
						onSubmit={handleLogin}
						className='flex gap-4'>
						<button
							type='submit'
							className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
							disabled={login.isLoading}>
							{login.isLoading ? "Logging in..." : "Login (Demo)"}
						</button>
						{login.error && (
							<p className='text-red-500'>{login.error.message}</p>
						)}
					</form>
				)}
			</div>

			{/* Cars List Section */}
			<div className='mb-8'>
				<h2 className='text-xl font-semibold mb-4'>Available Cars</h2>
				{carsLoading ? (
					<p>Loading cars...</p>
				) : carsError ? (
					<p className='text-red-500'>Error: {carsError.message}</p>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{cars?.map((car) => (
							<div
								key={car.id}
								className={`p-4 border rounded-lg cursor-pointer ${
									carId === car.id ? "border-blue-500 bg-blue-50" : ""
								}`}
								onClick={() => handleCarSelect(car.id)}>
								<h3 className='font-bold'>{car.fullName}</h3>
								<p>{car.priceFormatted}</p>
								<p
									className={car.available ? "text-green-600" : "text-red-600"}>
									{car.available ? "Available" : "Not Available"}
								</p>
							</div>
						))}
					</div>
				)}
				<button
					onClick={() => refetchCars()}
					className='mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300'
					disabled={carsLoading}>
					Refresh Cars
				</button>
			</div>

			{/* Car Form Section */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
				{/* Create/Update Form */}
				<div className='p-4 border rounded-lg'>
					<h2 className='text-xl font-semibold mb-4'>
						{carId ? "Update Car" : "Add New Car"}
					</h2>
					<form onSubmit={carId ? handleUpdateSubmit : handleCreateSubmit}>
						<div className='mb-4'>
							<label className='block mb-1'>Make</label>
							<input
								type='text'
								name='make'
								value={carData.make}
								onChange={handleInputChange}
								className='w-full p-2 border rounded'
								required
							/>
						</div>
						<div className='mb-4'>
							<label className='block mb-1'>Model</label>
							<input
								type='text'
								name='model'
								value={carData.model}
								onChange={handleInputChange}
								className='w-full p-2 border rounded'
								required
							/>
						</div>
						<div className='mb-4'>
							<label className='block mb-1'>Year</label>
							<input
								type='number'
								name='year'
								value={carData.year}
								onChange={handleInputChange}
								className='w-full p-2 border rounded'
								required
							/>
						</div>
						<div className='mb-4'>
							<label className='block mb-1'>Price per Day</label>
							<input
								type='number'
								name='price'
								value={carData.price}
								onChange={handleInputChange}
								className='w-full p-2 border rounded'
								step='0.01'
								required
							/>
						</div>
						<div className='mb-4'>
							<label className='flex items-center'>
								<input
									type='checkbox'
									name='available'
									checked={carData.available}
									onChange={handleInputChange}
									className='mr-2'
								/>
								Available for Rent
							</label>
						</div>
						<div className='flex gap-2'>
							<button
								type='submit'
								className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
								disabled={createLoading || updateLoading}>
								{createLoading || updateLoading
									? "Saving..."
									: carId
									? "Update Car"
									: "Add Car"}
							</button>
							{carId && (
								<button
									type='button'
									onClick={handleDelete}
									className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
									disabled={deleteLoading}>
									{deleteLoading ? "Deleting..." : "Delete Car"}
								</button>
							)}
							{carId && (
								<button
									type='button'
									onClick={() => {
										setCarId("");
										setCarData({
											make: "",
											model: "",
											year: "",
											price: "",
											available: true,
										});
									}}
									className='bg-gray-200 px-4 py-2 rounded hover:bg-gray-300'>
									Cancel
								</button>
							)}
						</div>
						{(createError || updateError || deleteError) && (
							<p className='mt-2 text-red-500'>
								Error: {(createError || updateError || deleteError).message}
							</p>
						)}
					</form>
				</div>

				{/* Single Car Details */}
				<div className='p-4 border rounded-lg'>
					<h2 className='text-xl font-semibold mb-4'>Car Details</h2>
					{!carId ? (
						<p className='text-gray-500'>Select a car to view details</p>
					) : singleCarLoading ? (
						<p>Loading car details...</p>
					) : singleCarError ? (
						<p className='text-red-500'>Error: {singleCarError.message}</p>
					) : singleCar ? (
						<div>
							<h3 className='text-lg font-bold'>
								{singleCar.make} {singleCar.model}
							</h3>
							<p className='mb-2'>Year: {singleCar.year}</p>
							<p className='mb-2'>Price: ${singleCar.price.toFixed(2)}/day</p>
							<p className='mb-2'>
								Status:
								<span
									className={
										singleCar.available ? "text-green-600" : "text-red-600"
									}>
									{singleCar.available ? "Available" : "Not Available"}
								</span>
							</p>
							{singleCar.features && (
								<div className='mt-4'>
									<h4 className='font-semibold'>Features:</h4>
									<ul className='list-disc pl-5'>
										{singleCar.features.map((feature, index) => (
											<li key={index}>{feature}</li>
										))}
									</ul>
								</div>
							)}
						</div>
					) : (
						<p>No car details available</p>
					)}
				</div>
			</div>

			{/* Paginated Cars Example */}
			<div className='mt-8'>
				<h2 className='text-xl font-semibold mb-4'>Paginated Cars</h2>
				{paginatedCars?.pages?.map((page, i) => (
					<div
						key={i}
						className='mb-4'>
						<h3 className='font-semibold'>Page {i + 1}</h3>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							{page.data.map((car) => (
								<div
									key={car.id}
									className='p-3 border rounded'>
									<p>
										{car.make} {car.model} ({car.year})
									</p>
									<p>${car.price}/day</p>
								</div>
							))}
						</div>
					</div>
				))}
				{hasNextPage && (
					<button
						onClick={() => fetchNextPage()}
						className='mt-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300'
						disabled={isFetchingNextPage}>
						{isFetchingNextPage ? "Loading more..." : "Load More"}
					</button>
				)}
			</div>
		</div>
	);
};

export default ExampleUsage;
