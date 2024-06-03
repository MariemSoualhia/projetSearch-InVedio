import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  CssBaseline,
  CircularProgress,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme,
  Paper,
  Grid,
} from "@mui/material";
import {
  API_API_URL,
  API_API_URLDetection,
  API_API_URLRTSP,
} from "../../config/serverApiConfig";
const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setOpenSnackbar(true);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(
        API_API_URL + `/api/user/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      setSuccessMessage("Password has been reset successfully.");
      setOpenSnackbar(true);
      setTimeout(() => navigate("/signin"), 3000);
    } catch (error) {
      setErrorMessage(error.message);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="lg">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Grid container>
            <Grid
              item
              xs={false}
              sm={4}
              md={7}
              sx={{
                backgroundImage:
                  "url(https://datadoit.io/wp-content/uploads/2023/08/datadoit-banner-768x462.png)",
                backgroundRepeat: "no-repeat",
                backgroundColor: (theme) =>
                  theme.palette.mode === "light"
                    ? theme.palette.grey[50]
                    : theme.palette.grey[900],
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            ></Grid>
            <Grid
              item
              xs={12}
              sm={8}
              md={5}
              component={Paper}
              elevation={6}
              square
            >
              <Box
                sx={{
                  my: 8,
                  mx: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src="https://data-doit.com/wp-content/uploads/2022/11/datadoit1-150x150.png"
                  alt="Logo"
                />
                <Typography
                  component="h1"
                  variant="h5"
                  sx={{
                    fontFamily: "time",
                    mt: 2,
                    fontSize: "36px",
                    fontWeight: "bold",
                  }}
                >
                  Reset Password
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="New Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={handlePasswordChange}
                    InputProps={{
                      style: { color: darkMode ? "#fff" : "#000" },
                    }}
                    InputLabelProps={{
                      style: {
                        color: darkMode ? "#fff" : "#000",
                        fontFamily: "time",
                        fontSize: "20px",
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    InputProps={{
                      style: { color: darkMode ? "#fff" : "#000" },
                    }}
                    InputLabelProps={{
                      style: {
                        color: darkMode ? "#fff" : "#000",
                        fontFamily: "time",
                        fontSize: "20px",
                      },
                    }}
                  />
                  <Box sx={{ position: "relative", mt: 3, mb: 2 }}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{
                        backgroundColor: "#9e58ff",
                        color: "#fff",
                        ":hover": {
                          backgroundColor: "#8e4ce0",
                        },
                        fontFamily: "time",
                        fontSize: "20px",
                      }}
                      disabled={loading}
                    >
                      Reset Password
                    </Button>
                    {loading && (
                      <CircularProgress
                        size={24}
                        sx={{
                          color: "#9e58ff",
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginTop: "-12px",
                          marginLeft: "-12px",
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={successMessage ? "success" : "error"}
            sx={{ width: "100%" }}
          >
            {successMessage || errorMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default ResetPasswordPage;
