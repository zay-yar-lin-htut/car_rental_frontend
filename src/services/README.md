# Data Fetching System with TanStack Query

This directory contains a reusable data fetching system built with TanStack Query (formerly React Query) for the Car Rental application. The system provides custom hooks for common API operations with built-in error handling, loading states, and caching.

## Available Hooks

### `useFetch(endpoint, options)`

Fetches data from the specified API endpoint.

```jsx
const { data, isLoading, error, refetch } = useFetch("/api/cars", {
	params: { limit: 10 },
	select: (data) => data.results,
});
```

### `useFetchById(endpoint, id, options)`

Fetches a single item by its ID.

```jsx
const { data: car, isLoading, error } = useFetchById("/api/cars", carId);
```

### `useCreate(endpoint, options)`

Creates a new resource via a POST request.

```jsx
const {
	mutate: createCar,
	isPending,
	error,
} = useCreate("/api/cars", {
	onSuccess: (data) => {
		console.log("Car created:", data);
	},
});

// Usage
createCar({
	make: "Toyota",
	model: "Camry",
	year: 2023,
});
```

### `useUpdate(endpoint, options)`

Updates an existing resource via a PUT request.

```jsx
const {
	mutate: updateCar,
	isPending,
	error,
} = useUpdate("/api/cars", {
	onSuccess: (data) => {
		console.log("Car updated:", data);
	},
});

// Usage
updateCar({
	id: "123",
	data: {
		price: 25000,
		available: true,
	},
});
```

### `useDelete(endpoint, options)`

Deletes a resource via a DELETE request.

```jsx
const {
	mutate: deleteCar,
	isPending,
	error,
} = useDelete("/api/cars", {
	onSuccess: () => {
		console.log("Car deleted");
	},
});

// Usage
deleteCar("123"); // Pass the ID of the resource to delete
```

## Common Options

All hooks accept common options:

- `headers`: Custom HTTP headers to include in the request
- `onSuccess`: Callback function when the operation succeeds
- `onError`: Callback function when the operation fails

Query hooks (`useFetch` and `useFetchById`) also accept:

- `enabled`: Boolean to control if the query should run automatically
- `staleTime`: Time in ms after data becomes stale (default: 5 minutes)
- `cacheTime`: Time in ms to keep unused data in cache (default: 10 minutes)
- `select`: Function to transform or select a part of the data
- `params`: URL parameters to include in the request

## Example Usage

See `ExampleUsage.jsx` for a complete example of how to use these hooks in a component.

## Best Practices

1. **Use Query Keys Consistently**: The system automatically uses the endpoint and params as query keys. If you need custom query keys, provide them in the options.

2. **Transform Data with Select**: Use the `select` option to transform API responses into the shape your components need.

3. **Handle Loading and Error States**: Always check `isLoading` and `error` states to provide appropriate UI feedback.

4. **Invalidate Queries**: After mutations, related queries are automatically invalidated. You can also manually invalidate queries using `queryClient.invalidateQueries()`.

5. **Optimistic Updates**: For a better user experience, consider implementing optimistic updates for mutations.

## Configuration

The system uses the base URL defined in `BaseUrl.js`. Make sure this points to your API server.
