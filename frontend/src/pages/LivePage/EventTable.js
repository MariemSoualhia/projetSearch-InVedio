import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { API_API_URL } from "../../config/serverApiConfig";

const EventTable = ({ source, type }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let response;
        if (type === "camera") {
          response = await axios.get(
            API_API_URL + `/api/events?cameraId=${source._id}`
          );
        } else {
          response = await axios.get(
            API_API_URL + `/api/events?videoPath=${source}`
          );
        }
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, [source, type]);

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" gutterBottom style={{ padding: "16px" }}>
        Live Events
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>Event Type</TableCell>
            <TableCell>Camera Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event._id}>
              <TableCell>{event.Timestamp}</TableCell>
              <TableCell>{event.EventType}</TableCell>
              <TableCell>{event.CameraName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EventTable;
