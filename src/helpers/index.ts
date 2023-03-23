import express from "express"
import crypto from "crypto";
import * as dotenv from "dotenv";
import moment from "moment";
import { getUserBySessionToken } from "../db/users";

dotenv.config();

export const random = () => crypto.randomBytes(128).toString("base64");

export const authentication = (salt: string, password: string) => {
   return crypto
      .createHmac("sha256", [salt, password].join("/"))
      .update(process.env.SECRET_JWT)
      .digest("hex")
};

export const validateAppointmentStartFormat = (start: Date) => {
   const regexExp = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01]) ([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
   return regexExp.test(start.toString());
};

export const validateAppointmentStartIsAfterNow = (start: Date) => {
   const current = moment();
   return moment(start).isAfter(current);
};

export const getAuthenticatedUserId = async (sessionToken: string) => {
   try {  
      const existingUser = await getUserBySessionToken(sessionToken).select("+authentication.salt +authentication.password");
      if (!existingUser) {
         throw new Error("Wrong session token");
      }
      return existingUser._id
   } catch (error) {
      console.log(`getAuthenticatedUser error - ${error}`)
   }
}