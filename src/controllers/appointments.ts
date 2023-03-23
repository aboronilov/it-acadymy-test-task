import express from "express";
import mongoose from "mongoose"
import moment from "moment"
import * as dotenv from "dotenv"

dotenv.config()

import { getAppointments, getAppointentById, createAppointment } from "../db/appointments";
import { getDoctorById } from "../db/doctors";
import { getUserById } from "../db/users"
import { validateAppointmentStartFormat, validateAppointmentStartIsAfterNow } from "../helpers/index";

export const createNewAppointment = async (req: express.Request, res: express.Response) => {
   try {
      const { start, doctorId, reason, patientId } = req.body;
      const localTime = moment(start).utcOffset(120)

      const session = await mongoose.startSession();
      session.startTransaction();
      const user = await getUserById(patientId).session(session);
      const doctor = await getDoctorById(doctorId).session(session);

      if (!start || !doctorId || !reason) {
         return res.status(400).json("Please provide start, doctorId, reason for the appointment");
      }

      if (!validateAppointmentStartFormat(start)) {
         return res.status(400).json("Please provide appointment start in format 'yyyy-mm-dd hh:mm'");
      }

      if (!validateAppointmentStartIsAfterNow(start)) {
         return res.status(400).json("The appointment start should be after the current date");
      }

      if (user.visits.includes(localTime.toString())) {
         return res.status(400).json("You allready have an appointemt on this time");
      }

      if (doctor.busy.includes(localTime.toString())) {
         return res.status(400).json("This doctor is busy on this time. Try another time or another doctor");
      }

      const newAppointment = await createAppointment({
         start: localTime,
         doctorId,
         patientId,
         reason
      });

      user.appointmentIds.push(newAppointment._id.toString());
      user.visits.push(localTime.toString());
      await user.save();
      doctor.appointmentIds.push(newAppointment._id.toString());
      doctor.busy.push(localTime.toString());
      await doctor.save();

      await session.commitTransaction();
      
      return res.status(200).json(newAppointment);
   } catch (error) {
      console.log(`createNewAppointment error - ${error.message}`)
      return res.status(500).json({msg: error.message})
   }
}

export const getAllApointments = async (req: express.Request, res: express.Response) => {
   try {
      const appointments = await getAppointments()

      return res.status(200).json(appointments)
   } catch (error) {
      console.log(`getAllApointments error - ${error.message}`)
      return res.status(500).json({msg: error.message})
   }
}

export const getOneApointment = async (req: express.Request, res: express.Response) => {
   try {
      const {id} = req.params;
      if (!id) {
         return res.status(400).json("No id is provided")
      }

      const appointment = await getAppointentById(id)
      if (!appointment) {
         return res.status(404).json(`No appointment with id ${id} is found`)
      }

      return res.status(200).json(appointment)
   } catch (error) {
      console.log(`getOneApointment error - ${error.message}`)
      return res.status(500).json({msg: error.message})
   }
}
