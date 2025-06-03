import React, { useState } from "react";
import { useFetch } from "../../services/DataServices";
import { API_ENDPOINTS } from "../../services/Configuration";

const Cars = () => {
	// State for filtering
	const [filters, setFilters] = useState({
		available: true,
		sort: "price",
	});

	// Fetch all cars with filtering
	const {
		data: cars,
		isLoading,
		error,
		refetch,
	} = useFetch(API_ENDPOINTS.cars.getAll, {
		params: filters,
		select: (data) =>
			data?.map((car) => ({
				...car,
				fullName: `${car.make} ${car.model} (${car.year})`,
				priceFormatted: `$${car.price?.toFixed(2)}/day`,
			})),
	});

	// Handle filter changes
	const handleFilterChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFilters({
			...filters,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-8 text-center'>Available Cars</h1>

			{/* Filters */}
			<div className='bg-white rounded-lg shadow-md p-4 mb-8'>
				<h2 className='text-xl font-semibold mb-4'>Filters</h2>
				<div className='flex flex-wrap gap-4'>
					<div className='flex items-center'>
						<input
							type='checkbox'
							id='available'
							name='available'
							checked={filters.available}
							onChange={handleFilterChange}
							className='mr-2 h-5 w-5'
						/>
						<label
							htmlFor='available'
							className='text-gray-700'>
							Show only available cars
						</label>
					</div>
					<div className='flex items-center'>
						<label
							htmlFor='sort'
							className='text-gray-700 mr-2'>
							Sort by:
						</label>
						<select
							id='sort'
							name='sort'
							value={filters.sort}
							onChange={handleFilterChange}
							className='border rounded-md px-3 py-1'>
							<option value='price'>Price (Low to High)</option>
							<option value='-price'>Price (High to Low)</option>
							<option value='make'>Make (A-Z)</option>
							<option value='-year'>Year (Newest)</option>
						</select>
					</div>
				</div>
			</div>

			{/* Loading state */}
			{isLoading && (
				<div className='flex justify-center items-center h-64'>
					<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
				</div>
			)}

			{/* Error state */}
			{error && (
				<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6'>
					<strong className='font-bold'>Error!</strong>
					<span className='block sm:inline'>
						{" "}
						{error.message || "Failed to load cars."}
					</span>
				</div>
			)}

			{/* Cars grid */}
			{!isLoading && !error && (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{cars?.length > 0 ? (
						cars.map((car) => (
							<div
								key={car._id}
								className='bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105'>
								{/* Car image with fallback */}
								<div className='h-48 bg-gray-200 relative'>
									<img
										src={
											car.image ||
											`https://source.unsplash.com/random/300x200/?car,${car.make},${car.model}`
										}
										alt={car.fullName}
										className='w-full h-full object-cover'
										onError={(e) => {
											e.target.src = `https://source.unsplash.com/random/300x200/?car`;
										}}
									/>
									{!car.available && (
										<div className='absolute top-0 right-0 bg-red-500 text-white px-3 py-1 m-2 rounded-md'>
											Rented
										</div>
									)}
								</div>

								{/* Car details */}
								<div className='p-4'>
									<h3 className='text-xl font-bold mb-2'>{car.fullName}</h3>
									<div className='flex justify-between items-center mb-4'>
										<span className='text-gray-700'>{car.type || "Sedan"}</span>
										<span className='text-blue-600 font-bold'>
											{car.priceFormatted}
										</span>
									</div>

									{/* Car features */}
									<div className='flex flex-wrap gap-2 mb-4'>
										<span className='bg-gray-100 px-2 py-1 rounded-md text-sm'>
											{car.transmission || "Automatic"}
										</span>
										<span className='bg-gray-100 px-2 py-1 rounded-md text-sm'>
											{car.fuel || "Gasoline"}
										</span>
										<span className='bg-gray-100 px-2 py-1 rounded-md text-sm'>
											{car.seats || 5} seats
										</span>
									</div>

									{/* Action buttons */}
									<div className='flex justify-between'>
										<button className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors'>
											View Details
										</button>
										{car.available && (
											<button className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors'>
												Book Now
											</button>
										)}
									</div>
								</div>
							</div>
						))
					) : (
						<div className='col-span-full text-center py-12'>
							<h3 className='text-xl font-medium text-gray-500'>
								No cars found matching your criteria
							</h3>
							<button
								onClick={() => {
									setFilters({ available: true, sort: "price" });
									refetch();
								}}
								className='mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors'>
								Reset Filters
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Cars;
