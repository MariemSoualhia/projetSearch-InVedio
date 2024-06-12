// EventTable.js
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Box,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  paper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    minWidth: 650,
  },
  imageButton: {
    backgroundColor: "#9E58FF",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#8E4CE0",
    },
  },
  imageContainer: {
    width: "100%",
    height: "300px",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    "& .MuiPaginationItem-root": {
      color: "#9E58FF",
    },
    "& .Mui-selected": {
      color: "#F47B20",
      backgroundColor: "#e1ccff",
    },
  },
  image: {
    maxWidth: "100%",  // Limite la largeur à 100% du conteneur
    maxHeight: "80vh", // Limite la hauteur à 80% de la hauteur de la vue
    objectFit: "contain", // Maintient les proportions
  },
  dialogContent: {
    display: "flex",
    justifyContent: "center", // Centre l'image horizontalement
    alignItems: "center", // Centre l'image verticalement
    padding: theme.spacing(2),
    overflow: "hidden", // Évite les débordements
  },
}));

const EventTable = ({ events }) => {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleClickOpen = (imagePath) => {
    // Assurez-vous que l'URL est correcte
    setCurrentImage(`http://localhost:3002/static-images/${imagePath}`);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentImage("");
  };

  const currentEvents = events.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper className={classes.paper}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Event ID</TableCell>
            <TableCell>Timestamp</TableCell>
            <TableCell>Camera Name</TableCell>
            <TableCell>Event Type</TableCell>
            <TableCell>Image</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentEvents.map((event) => (
            <TableRow key={event._id}>
              <TableCell>{event.EventID}</TableCell>
              <TableCell>{new Date(event.Created).toLocaleString()}</TableCell>
              <TableCell>{event.CameraName}</TableCell>
              <TableCell>{event.EventType}</TableCell>
              <TableCell>
              
                {event.PictureURL && (
                  <Button
                    variant="contained"
                    className={classes.imageButton}
                    onClick={() => handleClickOpen(event.PictureURL)}
                  >
                    View
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={events.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[]} // Désactiver le changement de lignes par page
        className={classes.pagination}
      />

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Image</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box>
            {currentImage && (
              <img src={currentImage} alt="Event" className={classes.image} />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EventTable;
