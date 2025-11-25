import {
	createContext,
	useContext,
	useState,
	useMemo,
	useCallback,
} from "react";
import { AUTH_CONFIG } from "../services/Configuration";

const getRoleFromUser = (user) => {
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

export const UserRoleContext = createContext({
	role: null,
	updateRole: () => {},
});

export const UserRoleProvider = ({ children }) => {
	const [role, setRole] = useState(() =>
		getRoleFromUser(AUTH_CONFIG.getUserData())
	);

	const updateRole = useCallback((user) => {
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
