const baseLinks = [{ to: "/", label: "Home" }];

const loggedOutLinks = [
    ...baseLinks,
    { to: "#", label: "Contact Us" },
];

const userLinks = [
    ...baseLinks,
    { to: "/history", label: "History" },
    { to: "/user-profile", label: "Profile" },
    { to: "#", label: "Contact Us" },
];




export const getNavLinks = (isLogin: boolean) => {
    if (!isLogin) {
        return loggedOutLinks;
    }

    // Default for any other logged-in user (e.g., 'user', 'staff')
    return userLinks;
};

