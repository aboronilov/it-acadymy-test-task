import express from "express";

import { createNewAppointment, getAllApointments, getOneApointment } from "../controllers/appointments";
import { isAuthenticated, isOwner } from "../middlewares";

export default ( router: express.Router ) => {
   router.post("/api/appointments", isAuthenticated, isOwner, createNewAppointment);
   router.get("/api/appointments", isAuthenticated, getAllApointments)
   router.get("/api/appointments/:id", isAuthenticated, getOneApointment)
}