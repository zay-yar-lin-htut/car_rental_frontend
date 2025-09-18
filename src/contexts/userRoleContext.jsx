import { createContext, useContext, useMemo } from "react";
import { AUTH_CONFIG } from "../services/Configuration";

export const UserRoleContext = createContext({ role: null });

export const UserRoleProvider = ({ children }) => {
	const user = AUTH_CONFIG.getUserData();

	const role = useMemo(() => {
		if (!user) {
			return null;
		}
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
	}, [user]);

	return (
		<UserRoleContext.Provider value={{ role }}>
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
