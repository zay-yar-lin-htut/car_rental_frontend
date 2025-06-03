import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import Home from "./view/home/Home";
import Login from "./view/login/Login";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ExampleUsage from "./services/ExampleUsage";
import { AUTH_CONFIG } from "./services/Configuration";
import Cars from "./view/cars/Cars";
import Pricing from "./view/pricing/Pricing";
import Register from "./view/login/Register";
import UserProfile from "./view/login/UserProfile";

// Protected Route wrapper component
const ProtectedRoute = ({ element }) => {
	return AUTH_CONFIG.isAuthenticated() ? (
		element
	) : (
		<Navigate
			to='/login'
			replace
		/>
	);
};

const router = createBrowserRouter([
	{
		index: true,
		element: <Home />,
	},
	{
		path: "/home",
		element: <Home />,
	},
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/register",
		element: <Register />,
	},
	{
		path: "/test",
		element: <ExampleUsage />,
	},
	{
		path: "/cars",
		element: <ProtectedRoute element={<Cars />} />,
	},
	{
		path: "/pricing",
		element: <ProtectedRoute element={<Pricing />} />,
	},
	{
		path: "/user-profile",
		element: <ProtectedRoute element={<UserProfile />} />,
	},
]);

const queryClient = new QueryClient();

const App = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	);
};

export default App;
