import express from "express";
import { get, merge } from "lodash";

import { getUserBySessionToken } from "../db/users";

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   try {
      const { id } = req.params;

      const sessionToken = req.cookies["Bearer"];
      if (!sessionToken) {
         return res.status(403).json("Authentication failed");
      }

      const existingUser = await getUserBySessionToken(sessionToken).select("+authentication.salt +authentication.password");
      if (!existingUser) {
         return res.status(403).json("Wrong session token");
      }
      const {_id: currentUserId} = existingUser;
      if (!currentUserId) {
        return res.status(400).json("No id is given");
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