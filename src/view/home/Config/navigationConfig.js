const baseLinks = [{ to: "/", label: "Home" }];

const loggedOutLinks = [
    ...baseLinks,
    { to: "/cars", label: "Models" },
    { to: "/innovation", label: "Innovation" },
];

const userLinks = [
    ...baseLinks,
    { to: "/cars", label: "Models" },
    // { to: "/innovation", label: "Innovation" },
    { to: "/user-profile", label: "Profile" },
];

const adminLinks = [
    ...baseLinks,
    { to: "/user-management", label: "User Management" },
    // { to: "/admin-pane", label: "Admin Panel" },
    { to: "/user-profile", label: "Profile" },
];


export const getNavLinks = (isLogin, role) => {
    if (!isLogin) {
        return loggedOutLinks;
    }

    if (role === "admin") {
        return adminLinks;
    }

    // Default for any other logged-in user (e.g., 'user', 'staff')
    return userLinks;
};

