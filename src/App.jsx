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
import Dashboard from "./view/admin/components/Dashboard";
import UserManagement from "./view/admin/components/UserManagement";
import CarManagement from "./view/admin/components/CarManagement";
import LocationManagement from "./view/admin/components/LocationManagement";
import CarTypeManagement from "./view/admin/components/CarTypeManagement";
import ContactManagement from "./view/admin/components/ContactManagement";
import TaskManagement from "./view/admin/components/TaskManagement";
import TaskHistory from "./view/admin/components/TaskHistory";
import ActiveTasks from "./view/admin/components/ActiveTasks";
import Maintenance from "./view/admin/components/Maintenance";
import ContactManagementStaff from "./view/admin/components/ContactManagementStaff";
import PickupDropoffManagement from "./view/admin/components/PickupDropoffManagement";
import Loader from "./Loader";

const Home = lazy(() => import("./view/home/Home"));
const Login = lazy(() => import("./view/login/Login"));
const Register = lazy(() => import("./view/login/Register"));
const UserProfile = lazy(() => import("./view/profile/UserProfile"));
const AdminLayout = lazy(() => import("./view/admin/AdminLayout"));
const StaffLayout = lazy(() => import("./view/admin/StaffLayout"));
const OurLocationsPage = lazy(() =>
	import("./view/home/Components/OurLocation")
);
const Ride = lazy(() => import("./view/ride/Ride"));
const History = lazy(() => import("./history/History"));

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

// Role Protected Route wrapper component
const RoleProtectedRoute = ({ children, allowedRoles }) => {
	const { role } = useUserRole();

	if (!allowedRoles.includes(role)) {
		if (role === "admin") {
			return <Navigate to="/admin/dashboard" replace />;
		} else if (role === "staff") {
			return <Navigate to="/staff/task-management" replace />;
		} else {
			return <Navigate to="/home" replace />;
		}
	}

	return children;
};

// AuthRoute.js - For auth pages that should only be accessible when not logged in
const AuthRoute = ({ children }) => {
	const isAuthenticated = AUTH_CONFIG.isAuthenticated();
	const { role } = useUserRole();

	if (isAuthenticated) {
		if (role === "admin") {
			return (
				<Navigate
					to='/admin/dashboard'
					replace
				/>
			);
		}
		if (role === "staff") {
			return (
				<Navigate
					to='/staff/task-management'
					replace
				/>
			);
		}
		return (
			<Navigate
				to='/home'
				replace
			/>
		);
	}

	return children;
};

// HomeRoute.js - For the home page to redirect admins and staff
const HomeRoute = ({ children }) => {
	const { role } = useUserRole();

	if (role === "admin") {
		return (
			<Navigate
				to='/admin/dashboard'
				replace
			/>
		);
	}

	if (role === "staff") {
		return (
			<Navigate
				to='/staff/task-management'
				replace
			/>
		);
	}

	return children;
};

const router = createBrowserRouter([
	{
		index: true,
		element: (
			<HomeRoute>
				<Home />
			</HomeRoute>
		),
	},
	{
		path: "/home",
		element: (
			<HomeRoute>
				<Home />
			</HomeRoute>
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
				<RoleProtectedRoute allowedRoles={["admin"]}>
					<AdminLayout />
				</RoleProtectedRoute>
			</ProtectedRoute>
		),
		children: [
			{
				index: true,
				element: (
					<Navigate
						to='/admin/dashboard'
						replace
					/>
				),
			},
			{
				path: "dashboard",
				element: <Dashboard />,
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
				path: "location-management",
				element: <LocationManagement />,
			},
			{
				path: "car-type-management",
				element: <CarTypeManagement />,
			},
			{
				path: "contact-management",
				element: <ContactManagement />,
			},
			{
				path: "profile",
				element: <UserProfile />,
			},
			{
				path: "task-management",
				element: <TaskManagement />,
			},
			{
				path: "active-tasks",
				element: <ActiveTasks />,
			},
			{
				path: "task-history",
				element: <TaskHistory />,
			},
			{
				path: "maintenance",
				element: <Maintenance />,
			},
		],
	},
	// Staff Routes with a dedicated layout
	{
		path: "/staff",
		element: (
			<ProtectedRoute>
				<RoleProtectedRoute allowedRoles={["staff"]}>
					<StaffLayout />
				</RoleProtectedRoute>
			</ProtectedRoute>
		),
		children: [
			{
				index: true,
				element: (
					<Navigate
						to='/staff/task-management'
						replace
					/>
				),
			},
			{
				path: "task-management",
				element: <TaskManagement />,
			},
			{
				path: "pickup-dropoff",
				element: <PickupDropoffManagement />,
			},
			{
				path: "active-tasks",
				element: <ActiveTasks />,
			},
			{
				path: "task-history",
				element: <TaskHistory />,
			},
			{
				path: "maintenance",
				element: <Maintenance />,
			},
			{
				path: "contact-management",
				element: <ContactManagementStaff />,
			},
			{
				path: "profile",
				element: <UserProfile />,
			},
		],
	},
]);

const App = () => {
	return (
		<SnackbarProvider>
			<UserRoleProvider>
				<IntroFormProvider>
					<Suspense
						fallback={
							<div className='w-screen h-screen flex justify-center items-center'>
								<Loader />
							</div>
						}>
						<RouterProvider router={router} />
					</Suspense>
				</IntroFormProvider>
			</UserRoleProvider>
		</SnackbarProvider>
	);
};

export default App;
