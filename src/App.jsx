import React, { Suspense, lazy } from "react";
import {
	createBrowserRouter,
	RouterProvider,
	Navigate,
} from "react-router-dom";
import { AUTH_CONFIG } from "./services/Configuration";
import { SnackbarProvider } from "./contexts/ErrorMessage";
import { UserRoleProvider, useUserRole } from "./contexts/userRoleContext";
import { IntroFormProvider } from "./contexts/IntroFormProvider";
import UserManagement from "./view/admin/components/UserManagement";
import CarManagement from "./view/admin/components/CarManagement";

const Home = lazy(() => import("./view/home/Home"));
const Login = lazy(() => import("./view/login/Login"));
const Register = lazy(() => import("./view/login/Register"));
const UserProfile = lazy(() => import("./view/profile/UserProfile"));
const Cars = lazy(() => import("./view/cars/Cars"));
const AdminLayout = lazy(() => import("./view/admin/AdminLayout"));
const OurLocationsPage = lazy(() =>
	import("./view/home/Components/OurLocation")
);
const Ride = lazy(() => import("./view/ride/Ride"));

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
		path: "/user-profile",
		element: (
			<ProtectedRoute>
				<UserProfile />
			</ProtectedRoute>
		),
	},
	{
		path: "/our-locations",
		element: <OurLocationsPage />,
	},
	{
		path: "/ride",
		element: (
			<ProtectedRoute>
				<Ride />
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
				path: "/user-profile",
				element: <UserProfile />,
			},
			{
				path: "/user-management",
				element: <UserManagement />,
			},
			{
				path: "/car-management",
				element: <CarManagement />,
			},
			{
				path: "/contact-management",
				element: <UserProfile />,
			},
			{
				path: "/task-management",
				element: <UserProfile />,
			},
			{
				path: "/our-locations",
				element: <OurLocationsPage />,
			},
		],
	},
]);

const App = () => {
	return (
		<SnackbarProvider>
			<UserRoleProvider>
				<IntroFormProvider>
					<Suspense fallback={<div>Loading...</div>}>
						<RouterProvider router={router} />
					</Suspense>
				</IntroFormProvider>
			</UserRoleProvider>
		</SnackbarProvider>
	);
};

export default App;
