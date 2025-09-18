import { createTheme } from "@mui/material/styles";

const palette = {
    primary: {
        main: "#00F5D4", // Vibrant Teal
        contrastText: "#0D1B2A",
    },
    background: {
        default: "#0a0a0a", // Dark, sophisticated blue
        paper: "#1B263B", // Lighter blue for surfaces
    },
    text: {
        primary: "#E0E1DD", // Soft off-white
        secondary: "#778DA9", // Muted blue-grey
    },
    divider: "#778DA9",
};

export const theme = createTheme({
    palette,
    typography: {
        fontFamily: "'Exo 2', sans-serif",
        h1: { fontFamily: "'Orbitron', sans-serif" },
        h2: { fontFamily: "'Orbitron', sans-serif" },
        h3: { fontFamily: "'Orbitron', sans-serif" },
        h4: { fontFamily: "'Orbitron', sans-serif" },
        h5: { fontFamily: "'Orbitron', sans-serif" },
        h6: { fontFamily: "'Orbitron', sans-serif" },
    },
    components: {
        // Default styles for the outlined button
        MuiButton: {
            styleOverrides: {
                outlined: {
                    borderColor: palette.text.secondary,
                    color: palette.text.primary,
                    "&:hover": {
                        borderColor: palette.primary.main,
                        color: palette.primary.main,
                        backgroundColor: "rgba(0, 245, 212, 0.1)",
                    },
                },
            },
        },
        // Default styles for TextFields
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: palette.divider },
                        "&:hover fieldset": { borderColor: palette.primary.main },
                        "&.Mui-focused fieldset": { borderColor: palette.primary.main },
                    },
                    "& .MuiInputLabel-root": {
                        color: palette.text.secondary,
                        "&.Mui-focused": {
                            color: palette.primary.main,
                        },
                    },
                    "& .MuiInputAdornment-root .MuiSvgIcon-root": {
                        color: palette.text.secondary,
                    },
                },
            },
        },
        // Default styles for the floating action button
        MuiFab: {
            styleOverrides: {
                primary: {
                    backgroundColor: palette.primary.main,
                    "&:hover": {
                        backgroundColor: "#00d9bd", // A slightly darker teal
                    },
                },
            },
        },
    },
});

