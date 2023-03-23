import express from "express";

import { createNewDocotor, getAllDoctors, getOneDoctor } from "../controllers/doctors"

export default ( router: express.Router ) => {
   router.get("/api/doctors", getAllDoctors)
   router.get("/api/doctors/:id", getOneDoctor)
   router.post("/api/doctors", createNewDocotor)
}