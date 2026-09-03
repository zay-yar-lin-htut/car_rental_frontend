import {
	createContext,
	useContext,
	useState,
	useMemo,
	useCallback,
	type ReactNode,
} from "react";
import { AUTH_CONFIG } from "../services/Configuration";

export type UserRole = "admin" | "staff" | "user" | null;

export interface AuthUser {
	user_type_id?: number;
	[key: string]: unknown;
}

interface UserRoleContextValue {
	role: UserRole;
	updateRole: (user: AuthUser | null) => void;
}

const getRoleFromUser = (user: AuthUser | null): UserRole => {
	if (!user) return null;
	switch (user.user_type_id) {
		case 3:
			return "admin";
		case 2:
			return "staff";
		case 1:
			return "user";
		default:
			return null;
	}
};

export const UserRoleContext = createContext<UserRoleContextValue>({
	role: null,
	updateRole: () => {},
});

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
	const [role, setRole] = useState<UserRole>(() =>
		getRoleFromUser(AUTH_CONFIG.getUserData() as AuthUser | null)
	);

	const updateRole = useCallback((user: AuthUser | null) => {
		const newRole = getRoleFromUser(user);
		setRole(newRole);
	}, []);

	const value = useMemo(() => ({ role, updateRole }), [role, updateRole]);

	return (
		<UserRoleContext.Provider value={value}>
			{children}
		</UserRoleContext.Provider>
	);
};

export const useUserRole = () => {
	const context = useContext(UserRoleContext);
	if (!context) {
		throw new Error("useUserRole must be used within a UserRoleProvider");
	}
	return context;
};
