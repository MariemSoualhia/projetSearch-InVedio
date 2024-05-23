import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  ThemeProvider,
  createTheme,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleForgotPasswordChange = (event) => {
    setForgotEmail(event.target.value);
  };

  const handleForgotPasswordSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3002/api/user/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      setForgotMessage("Recovery email sent. Please check your inbox.");
      setOpenSnackbar(true);
      setOpenDialog(false);
    } catch (error) {
      setErrorMessage(error.message);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3002/api/user/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const responseData = await response.json();
      const token = responseData.token;
      const user = JSON.stringify(responseData.user);

      localStorage.setItem("token", token);
      localStorage.setItem("currentuser", user);

      navigate("/liveAll");
      window.location.reload();
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

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("theme", darkMode ? "light" : "dark");
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
                  "url(https://datadoit.io/wp-content/uploads/2023/09/nexus-datadoit-768x678.png)",
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
                <Typography component="h1" variant="h5">
                  Sign in
                </Typography>
                <Box
                  component="form"
                  noValidate
                  onSubmit={handleSubmit}
                  sx={{ mt: 1 }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      style: { color: darkMode ? "#fff" : "#000" },
                    }}
                    InputLabelProps={{
                      style: { color: darkMode ? "#fff" : "#000" },
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      style: { color: darkMode ? "#fff" : "#000" },
                    }}
                    InputLabelProps={{
                      style: { color: darkMode ? "#fff" : "#000" },
                    }}
                  />
                  {/* <FormControlLabel
                    control={<Checkbox value="remember" color="primary" />}
                    label="Remember me"
                    sx={{ color: darkMode ? "#fff" : "#000" }}
                  /> */}
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
                      }}
                      disabled={loading}
                    >
                      Sign In
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
                  <Grid container>
                    <Grid item xs>
                      <Link
                        href="#"
                        variant="body2"
                        sx={{ color: "#9e58ff" }}
                        onClick={handleOpenDialog}
                      >
                        <LockOutlinedIcon sx={{ mr: 1 }} />
                        Forgot password?
                      </Link>
                    </Grid>
                    {/* <Grid item>
                      <Link href="#" variant="body2" sx={{ color: "#9e58ff" }}>
                        {"Don't have an account? Sign Up"}
                      </Link>
                    </Grid> */}
                  </Grid>
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
            severity={forgotMessage ? "success" : "error"}
            sx={{ width: "100%" }}
          >
            {forgotMessage || errorMessage}
          </Alert>
        </Snackbar>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter your email address. We will send you an email to
              reset your password.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="forgotEmail"
              label="Email Address"
              type="email"
              fullWidth
              variant="standard"
              value={forgotEmail}
              onChange={handleForgotPasswordChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleForgotPasswordSubmit}>Submit</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default LoginPage;
