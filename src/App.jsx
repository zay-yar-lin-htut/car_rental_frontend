import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import Home from "./view/home/Home";
import Login from "./view/login/Login";
import { AUTH_CONFIG } from "./services/Configuration";
import Pricing from "./view/pricing/Pricing";
import Register from "./view/login/Register";
import UserProfile from "./view/profile/UserProfile";
import { SnackbarProvider } from "./contexts/ErrorMessage";

// Protected Route wrapper component
// ProtectedRoute.js - For routes that require authentication
const ProtectedRoute = ({ children }) => {
	const isAuthenticated = AUTH_CONFIG.isAuthenticated();

	if (!isAuthenticated) {
		return (
			<Navigate
				to='/login'
				replace
			/>
		);
	}

	return children;
};

// AuthRoute.js - For auth pages that should only be accessible when not logged in
const AuthRoute = ({ children }) => {
	const isAuthenticated = AUTH_CONFIG.isAuthenticated();

	if (isAuthenticated) {
		return (
			<Navigate
				to='/home'
				replace
			/>
		);
	}

	return children;
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
		element: (
			<AuthRoute>
				<Login />
			</AuthRoute>
		),
	},
	{
		path: "/register",
		element: (
			<AuthRoute>
				<Register />
			</AuthRoute>
		),
	},
	{
		path: "/innovation",
		element: (
			<ProtectedRoute>
				<Pricing />
			</ProtectedRoute>
		),
	},
	{
		path: "/user-profile",
		element: (
			<ProtectedRoute>
				<UserProfile />
			</ProtectedRoute>
		),
	},
]);

const App = () => {
	return (
		<SnackbarProvider>
			<RouterProvider router={router} />
		</SnackbarProvider>
	);
};

export default App;
