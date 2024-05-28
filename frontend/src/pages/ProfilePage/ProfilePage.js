import React, { useState, useEffect } from "react";
import {
  Typography,
  Divider,
  Box,
  Avatar,
  Button,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Grid,
  CssBaseline,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/Upload";
import CancelIcon from "@mui/icons-material/Cancel";
const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing(4),
  },
  profileCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: "8px",
    boxShadow: theme.shadows[3],
  },
  profileDetails: {
    textAlign: "left",
    marginTop: theme.spacing(2),
  },
  profileAvatar: {
    width: theme.spacing(55),
    height: theme.spacing(55),
  },
  profileActions: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(2),
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginRight: theme.spacing(1),
    backgroundColor: "#9E58FF",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#8E4CE0",
    },
  },
  card: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: "8px",
    boxShadow: theme.shadows[3],
  },
  changePasswordButton: {
    marginTop: theme.spacing(2),
  },
}));

const ProfilePage = () => {
  const classes = useStyles();
  const storedUser = JSON.parse(localStorage.getItem("currentuser"));
  const [user, setUser] = useState(storedUser);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [selectedFile, setSelectedFile] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const lightTheme = createTheme({
    palette: {
      mode: "light",
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setUser(storedUser);
    setEditing(false);
    setChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:3002/api/user/update/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );
      localStorage.setItem("currentuser", JSON.stringify(user));
      setEditing(false);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      setSnackbarMessage("Profile updated successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setSnackbarMessage("Error updating profile. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setSnackbarMessage("Passwords do not match.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3002/api/user/change-password/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      setSnackbarMessage("Password changed successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error.message);
      setSnackbarMessage("Error changing password. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadProfilePicture = async () => {
    if (!selectedFile) {
      setSnackbarMessage("No file selected.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const formData = new FormData();
    formData.append("photoProfil", selectedFile);

    try {
      const response = await fetch(
        `http://localhost:3002/api/user/update-profile-picture/${user._id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const updatedUser = await response.json();
      localStorage.setItem("currentuser", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSnackbarMessage("Profile picture updated successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error updating profile picture:", error.message);
      setSnackbarMessage("Error updating profile picture. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",

          pt: 8,
          px: 2,

          margin: "auto",
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card className={classes.profileCard}>
              <Avatar
                className={classes.profileAvatar}
                src={`http://localhost:3002${user.photoProfil}`}
              />
              <Typography variant="h6" sx={{ fontFamily: "time", mt: 2 }}>
                {user.username}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontFamily: "time" }}
                color="textSecondary"
              >
                {user.email}
              </Typography>
              {editing && (
                <IconButton
                  sx={{
                    color: "#9E58FF",
                    mt: 2,
                  }}
                  component="label"
                >
                  <PhotoCamera />
                  <input type="file" hidden onChange={handleFileChange} />
                </IconButton>
              )}
              <Box className={classes.profileActions}>
                {!editing ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{
                      backgroundColor: "#9E58FF",
                    }}
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{
                        backgroundColor: "#9E58FF",
                        fontFamily: "time",
                        color: "#ffff",
                        mr: 1,
                      }}
                      onClick={handleSaveProfile}
                    >
                      save profil <SaveIcon />
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleCancelEdit}
                      sx={{
                        backgroundColor: "#F47B20",
                        fontFamily: "time",
                        mr: 1,
                        fontSize: "12px",
                      }}
                    >
                      cancel <CancelIcon />
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{
                        backgroundColor: "#9E58FF",
                        fontFamily: "time",
                        fontSize: "12px",
                      }}
                      onClick={handleUploadProfilePicture}
                    >
                      save image <UploadIcon />
                    </Button>
                  </>
                )}
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h6" sx={{ fontFamily: "time" }}>
                  Profile Information
                </Typography>
                <Divider sx={{ fontFamily: "time", mb: 2 }} />
                <TextField
                  label="Full Name"
                  value={user.username}
                  onChange={(e) =>
                    setUser({ ...user, username: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  disabled={!editing}
                  className={classes.textField}
                />
                <br></br>
                <br></br>

                <TextField
                  label="Email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  variant="outlined"
                  fullWidth
                  disabled={!editing}
                  className={classes.textField}
                />
                <br></br>
                <br></br>

                <Button
                  variant="contained"
                  color="secondary"
                  sx={{
                    backgroundColor: "#F47B20",
                  }}
                  onClick={() => setChangingPassword(true)}
                  className={classes.changePasswordButton}
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {changingPassword && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Card className={classes.card}>
                <CardContent>
                  <Typography sx={{ fontFamily: "time" }} variant="h6">
                    Change Password
                  </Typography>
                  <Divider sx={{ mb: 2, fontFamily: "time" }} />
                  <TextField
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    variant="outlined"
                    fullWidth
                    className={classes.textField}
                  />
                  <TextField
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    variant="outlined"
                    fullWidth
                    className={classes.textField}
                  />
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    variant="outlined"
                    fullWidth
                    className={classes.textField}
                  />
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{
                      backgroundColor: "#9E58FF",
                      fontFamily: "time",
                    }}
                    onClick={handleChangePassword}
                  >
                    Save New Password
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{ fontFamily: "time", backgroundColor: "#F47B20" }}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        )}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default ProfilePage;
