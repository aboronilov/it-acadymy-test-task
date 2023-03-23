import express from "express";
import * as EmailValidator from 'email-validator';

import { getDoctors, getDoctorByEmail, getDoctorById, createDoctor } from "../db/doctors"

export const createNewDocotor = async (req: express.Request, res: express.Response) => {
   try {
      const {name, middlename, surname, email, occupation} = req.body;
   
      if (!name || !middlename || !surname || !email || !occupation ) {
         return res.status(400).json("Please provide name, middlename, surname, email, occupation");
      }
   
      if (!EmailValidator.validate(email)) {
         return res.status(400).json("Please provide the valid email");
      }
   
      const existingDoctor = await getDoctorByEmail(email)
      if (existingDoctor) {
         return res.status(400).json("Doctor with this email allready exists");
      }
   
      const doctor = await createDoctor({
         name,
         middlename,
         surname,
         email,
         occupation
      })
      return res.status(201).json(doctor);
   } catch (error) {
      console.log(`error createNewDocotor - ${error.message}`);
      return res.status(500).json({msg: error.message});
   }
}

export const getAllDoctors =  async (req: express.Request, res: express.Response) => {
   try {
      const doctors = await getDoctors();

      return res.status(200).json(doctors);
   } catch (error) {
      console.log(`error getAllDoctors - ${error.message}`);
      return res.status(500).json({msg: error.message});
   }
}

export const getOneDoctor = async (req: express.Request, res: express.Response) => {
   try {
      const {id} = req.params;
      if (!id) {
         return res.status(400).json("No id is given")
      }

      const doctor = await getDoctorById(id)
      if (!doctor) {
         return res.status(404).json(`No doctor found with id ${id}`)
      }

      return res.status(200).json(doctor)
   } catch (error) {
      console.log(`error getOneDoctor - ${error.message}`);
      return res.status(500).json({msg: error.message});
   }
}