const baseLinks = [{ to: "/", label: "Home" }];

const loggedOutLinks = [
    ...baseLinks,
    { to: "/cars", label: "Models" },
    { to: "/reviews", label: "Reviews" },
    { to: "#", label: "Contact Us" },
];

const userLinks = [
    ...baseLinks,
    { to: "/cars", label: "Models" },
    { to: "/history", label: "History" },
    { to: "/user-profile", label: "Profile" },
    { to: "#", label: "Contact Us" },
];

const adminLinks = [
    ...baseLinks,
    { to: "admin/user-management", label: "User Management" },
    // { to: "/admin-pane", label: "Admin Panel" },
    { to: "/user-profile", label: "Profile" },
    { to: "#", label: "Contact Us" },
];


export const getNavLinks = (isLogin, role) => {
    if (!isLogin) {
        return loggedOutLinks;
    }

    if (role === "admin" || role === "staff") {
        return adminLinks;
    }

    // Default for any other logged-in user (e.g., 'user', 'staff')
    return userLinks;
};

