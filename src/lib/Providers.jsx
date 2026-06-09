"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/utils/store";
import { LoadingProvider } from "@/context/LoadingContext";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#f3a833",
    },
    background: {
      default: "#000000",
      paper: "#141414",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 40,
        },
      },
    },
  },
});

export default function Providers({ children }) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <LoadingProvider>{children}</LoadingProvider>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
}
