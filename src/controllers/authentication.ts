import express from "express";
import * as EmailValidator from 'email-validator';
import * as dotenv from "dotenv"

import { random, authentication } from './../helpers/index';
import { createUser, getUserByEmail } from '../db/users';

dotenv.config()

export const login = async (req: express.Request, res: express.Response) => {
   const domain = process.env.DOMAIN
   try {
      const { email, password } = req.body;
      if (!email || !password) {
         return res.status(400).json("Please provide email and password");
      }

      const user = await getUserByEmail(email).select("+authentication.salt +authentication.password");
      const expectedHash = authentication(user?.authentication.salt, password);
      if (!user || expectedHash !== user?.authentication.password) {
         return res.status(403).json("Wrong email or password")
      }

      const salt = random();
      user.authentication.sessionToken = authentication(salt, user._id.toString());
      await user.save()

      res.cookie('Bearer', user.authentication.sessionToken, { domain , path: '/' });
      return res.status(200).json(user)
   } catch (error: any) {
      console.log(`Login error - ${error.message}`);
      return res.status(500).json({msg: error.message});
   }
}

export const register = async (req: express.Request, res: express.Response) => {
   try {
      const {name, middlename, surname, email, password} = req.body;

      if (!name || !middlename || !surname || !email || !password) {
         return res.status(400).json("name, middlename, surname, email, password must be provided");
      }

      if (!EmailValidator.validate(email)) {
         return res.status(400).json("Please provide the valid email");
      }

      const existingUser = await getUserByEmail(email)
      if (existingUser) {
         return res.status(400).json(`User with email ${email} already exists`);
      }

      const salt = random();
      const user = await createUser({
         name, 
         middlename, 
         surname, 
         email, 
         authentication: {
            salt,
            password: authentication(salt, password),
         },
      });

      return res.status(201).json(user)

   } catch (error: any) {
      console.log(`Register error - ${error.message}`);
      return res.status(500).json({msg: error.message});
   }
}