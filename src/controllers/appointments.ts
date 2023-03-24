import express from "express";
import mongoose from "mongoose"
import moment from "moment"
import * as dotenv from "dotenv"
import emailjs from "@emailjs/browser";

dotenv.config()

import { getAppointments, getAppointentById, createAppointment } from "../db/appointments";
import { getDoctorById } from "../db/doctors";
import { getUserById } from "../db/users"
import { validateAppointmentStartFormat, validateAppointmentStartIsAfterNow, validateSchedule } from "../helpers/index";

export const createNewAppointment = async (req: express.Request, res: express.Response) => {
   try {
      const { start, doctorId, reason, patientId } = req.body;
      const localTime = moment(start).format("DD.MM.YYYY HH:mm")

      // start session
      const session = await mongoose.startSession();
      const user = await getUserById(patientId).session(session);
      const doctor = await getDoctorById(doctorId).session(session);

      // request body validation
      if (!start || !doctorId || !reason) {
         return res.status(400).json("Please provide start, doctorId, reason for the appointment");
      }
      if (!validateAppointmentStartFormat(start)) {
         return res.status(400).json("Please provide appointment start in format 'yyyy-mm-dd hh:mm'");
      }
      if (!validateAppointmentStartIsAfterNow(start)) {
         return res.status(400).json("The appointment start should be after the current date");
      }
      if (validateSchedule(localTime, user.visits)) {
         return res.status(400).json("You allready have an appointemt on this time");
      }
      if (validateSchedule(localTime, doctor.busy)) {
         return res.status(400).json("This doctor is busy on this time. Try another time or another doctor");
      }

      // creating new appointment
      session.startTransaction();
      const newAppointment = await createAppointment({
         start: localTime,
         doctorId,
         patientId,
         reason
      });

      // adding this appointment to doctor's and user's schedule
      user.appointmentIds.push(newAppointment._id.toString());
      user.visits.push(localTime);
      await user.save();
      doctor.appointmentIds.push(newAppointment._id.toString());
      doctor.busy.push(localTime);
      await doctor.save();

      // sending reminder emails
      const { name, middlename, surname, email } = user;
      const { name: doctorName, middlename: doctorMiddleName, surname: doctorSurname, occupation } = doctor;
      const now = moment();
      const message = `
         Уважаемый пациент ${name} ${middlename} ${surname} \n
         Администрация клиники ООО "Будь здоров" напоминает вам о записи на прием по адресу пр. Вернадского, 37, к.1А, Москва в ${localTime} (время местное) \n
         Прием проводит ${occupation} ${doctorName} ${doctorMiddleName} ${doctorSurname} \n
         C пожеланиями скорейшего выздоровления\n`
      
      const reminderTime1 = moment(localTime).subtract(1, "day");
      if (reminderTime1.isAfter(now)) {
         const delay1 = moment(reminderTime1).diff(now, "milliseconds")
         setTimeout(function(){console.log(message)}, delay1)
      }

      const reminderTime2 = moment(localTime).subtract(1, "hour")
      if (reminderTime2.isAfter(now)) {
         const delay2 = moment(reminderTime2).diff(now, "milliseconds")
         setTimeout(function(){console.log(message)}, delay2)
      }

      // end transaction
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
