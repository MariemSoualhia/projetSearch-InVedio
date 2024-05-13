import React, { useState } from "react";
import {
  Typography,
  Divider,
  Box,
  Avatar,
  Button,
  TextField,
} from "@mui/material";

const ProfilePage = () => {
  // Récupérer les informations de l'utilisateur depuis le localStorage
  const storedUser = JSON.parse(localStorage.getItem("currentuser"));
  const [user, setUser] = useState(storedUser);
  const [editing, setEditing] = useState(false);

  const handleEditProfile = () => {
    setEditing(true);
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

      // Mettre à jour l'état local ou afficher un message de succès
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error.message);
      // Afficher un message d'erreur à l'utilisateur si nécessaire
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 8,
      }}
    >
      <Avatar sx={{ width: 100, height: 100, mb: 2 }} src={user.photoProfil} />
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      <Divider sx={{ width: "80%", mb: 4 }} />
      <TextField
        label="Username"
        value={user.username}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
        variant="outlined"
        fullWidth
        disabled={!editing}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        variant="outlined"
        fullWidth
        disabled={!editing}
        sx={{ mb: 2 }}
      />
      {/* Ajoutez d'autres informations de profil ici */}
      <Box sx={{ mt: 4 }}>
        {!editing ? (
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
            onClick={handleEditProfile}
          >
            Edit Profile
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
            onClick={handleSaveProfile}
          >
            Save Profile
          </Button>
        )}
        <Button variant="contained" color="error">
          Delete Account
        </Button>
      </Box>
    </Box>
  );
};

export default ProfilePage;
