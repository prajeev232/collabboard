// src/theme.ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",

    // Fresh / collaborative teal
    primary: {
      main: "#0F766E", // teal-700
      dark: "#0B5F59",
      light: "#14B8A6", // teal-500 (used occasionally)
      contrastText: "#FFFFFF",
    },

    // A warm secondary for subtle accents (chips, highlights)
    secondary: {
      main: "#F59E0B", // amber-500
      dark: "#D97706",
      contrastText: "#111827",
    },

    background: {
      default: "#F7F9FC", // soft cool canvas
      paper: "#FFFFFF",
    },

    text: {
      primary: "#0F172A", // slate-900
      secondary: "#475569", // slate-600
    },

    divider: "rgba(15, 23, 42, 0.10)", // subtle slate divider
  },

  shape: { borderRadius: 12 },

  typography: {
    fontFamily: [
      "Inter",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
    h4: { fontWeight: 900, letterSpacing: -0.6 },
    h6: { fontWeight: 900, letterSpacing: -0.2 },
    button: { fontWeight: 800, textTransform: "none" },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F7F9FC",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(15, 23, 42, 0.10)",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(10px)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        outlined: {
          borderColor: "rgba(15, 23, 42, 0.10)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 800,
        },
        contained: {
          boxShadow: "none",
        },
        containedPrimary: {
          // slightly “softer” than default primary
          backgroundColor: "#7C3AED",
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#FFFFFF",
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 800,
          minHeight: 44,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(15, 23, 42, 0.10)",
        },
      },
    },
  },
});
