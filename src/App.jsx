import React from "react";
import {
	createBrowserRouter,
	RouterProvider,
	Navigate,
} from "react-router-dom";
import Home from "./view/home/Home";
import Login from "./view/login/Login";
import { AUTH_CONFIG } from "./services/Configuration";
import Pricing from "./view/pricing/Pricing";
import Register from "./view/login/Register";
import UserProfile from "./view/profile/UserProfile";
import { SnackbarProvider } from "./contexts/ErrorMessage";
import { UserRoleProvider, useUserRole } from "./contexts/userRoleContext";
import Cars from "./view/cars/Cars";
import AdminLayout from "./view/admin/AdminLayout";
import Dashboard from "./view/admin/Dashboard";
import AdminPanel from "./view/admin/AdminPanel";

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

// AdminRoute.js - For routes that require admin role
const AdminRoute = ({ children }) => {
	const isAuthenticated = AUTH_CONFIG.isAuthenticated();
	const { role } = useUserRole();

	if (!isAuthenticated) {
		return (
			<Navigate
				to='/login'
				replace
			/>
		);
	}

	if (role !== "admin") {
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
		path: "/cars",
		element: (
			<ProtectedRoute>
				<Cars />
			</ProtectedRoute>
		),
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
	// Admin Routes with a dedicated layout
	{
		element: (
			<AdminRoute>
				<AdminLayout />
			</AdminRoute>
		),
		children: [
			{
				path: "/dashboard",
				element: <Dashboard />,
			},
			{
				path: "/admin-panel",
				element: <AdminPanel />,
			},
			{
				path: "/user-profile",
				element: <UserProfile />,
			},
		],
	},
]);

const App = () => {
	return (
		<SnackbarProvider>
			<UserRoleProvider>
				<RouterProvider router={router} />
			</UserRoleProvider>
		</SnackbarProvider>
	);
};

export default App;
