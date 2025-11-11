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
import History from "./history/History";
import TaskManagement from "./view/admin/components/TaskManagement";

const Home = lazy(() => import("./view/home/Home"));
const Login = lazy(() => import("./view/login/Login"));
const Register = lazy(() => import("./view/login/Register"));
const UserProfile = lazy(() => import("./view/profile/UserProfile"));
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
	const { role } = useUserRole();

	if (isAuthenticated) {
		return (
			<Navigate
				to='/home'
				replace
			/>
		);
	} else if (isAuthenticated && role === "admin") {
		return (
			<Navigate
				to='/admin/user-management'
				replace
			/>
		);
	} else if (isAuthenticated && role === "staff") {
		return (
			<Navigate
				to='/admin/task-management'
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
		path: "/user-profile",
		element: (
			<ProtectedRoute>
				<UserProfile />
			</ProtectedRoute>
		),
	},
	{
		path: "/history",
		element: (
			<ProtectedRoute>
				<History />
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
		path: "/admin",
		element: (
			<ProtectedRoute>
				<AdminLayout />
			</ProtectedRoute>
		),
		children: [
			{
				index: true,
				element: (
					<Navigate
						to='/admin/user-management'
						replace
					/>
				),
			},
			{
				path: "user-management",
				element: <UserManagement />,
			},
			{
				path: "car-management",
				element: <CarManagement />,
			},
			{
				path: "contact-management",
				element: <h1>Hello</h1>,
			},
			{
				path: "task-management",
				element: <TaskManagement />,
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
