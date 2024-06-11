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
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  paper: {
    width: '100%',
    overflowX: 'auto',
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
  image: {
    maxWidth: "100%",
    maxHeight: "80vh",
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
    setCurrentImage(imagePath);
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
            {/* Ajoutez d'autres colonnes si nécessaire */}
          </TableRow>
        </TableHead>
        <TableBody>
          {currentEvents.map((event) => (
            <TableRow key={event._id}>
              <TableCell>{event.EventID}</TableCell>
              <TableCell>{new Date(event.Created).toLocaleString()}</TableCell>
              <TableCell>{event.CameraName}</TableCell>
              <TableCell>{event.EventType}</TableCell>
              <TableCell> <img src={currentImage} alt="Event"  /></TableCell>
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
              {/* Ajoutez d'autres cellules si nécessaire */}
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
      />

      <Dialog open={open} onClose={handleClose}  >
        <DialogTitle>Image</DialogTitle>
        <DialogContent>
        {currentImage}
        <div>
        <img src={currentImage} alt="Event"  />
        </div>
        

       
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
