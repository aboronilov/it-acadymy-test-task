import express from "express";
import { get, merge } from "lodash";

import { getAuthenticatedUserId } from "../helpers";
import { getUserBySessionToken } from "../db/users";

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   try {
      const sessionToken = req.cookies["Bearer"];
      if (!sessionToken) {
         throw new Error("Authentication failed");
      }
      const currentUserId = await getAuthenticatedUserId(sessionToken);
      if (!currentUserId) {
        return res.status(400).json("No id is given");
      }

      let id;
      if (req.params.id) {
         id = req.params.id;
      } else {
         id = req.body.patientId;
      }
      if (currentUserId.toString() !== id) {
        return res.status(403).json("Authentication failure");
      }
  
      next();
   } catch (error) {
      console.log(`isOwner error: ${error.message}`)
      return res.status(500).json({msg: error.message})
   }
}

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   try {
      const sessionToken = req.cookies["Bearer"];

      if (!sessionToken) {
         return res.status(403).json("Authentication failed")
      }

      const existingUser = await getUserBySessionToken(sessionToken)
      if (!existingUser) {
         return res.status(403).json("Wrong session token")
      }
      merge(req, { identity: existingUser })

      return next()
   } catch (error) {
      console.log(`isAuthenticated error: ${error.message}`)
      return res.status(500).json({msg: error.message})
   }
}