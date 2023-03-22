import express from "express";

import { getUsers, deleteUserById, getUserById } from "../db/users";

export const getAllUsers = async (req: express.Request, res: express.Response) => {
   try {
      const users = await getUsers();

      return res.status(200).json(users);
   } catch (error) {
      console.log(`getAllUsers error: ${error.message}`);
      return res.status(500).json({msg: error.message});
   }
};

export const deleteUser = async (req: express.Request, res: express.Response) => {
   try {
      const { id } = req.params;
      if (!id) {
         return res.status(400).json("No id is provided");
      }

      await deleteUserById(id)
      return res.status(200).json("Deleted successfully")
   } catch (error) {
      console.log(`deleteUser error: ${error.message}`);
      return res.status(500).json({msg: error.message});
   }
}

export const updateUser = async (req: express.Request, res: express.Response) => {
   try {
     const { id } = req.params;
      if (!id) {
         return res.status(400).json("No id is provided");
      }

     const { name, middlename, surname } = req.body; 
     if (!name || !middlename || !surname) {
      return res.status(400).json("No name, middlename or surname is provided");
     }
 
     const user = await getUserById(id);
     if (!user) {
      return res.status(404).json("No user found");
     }
     
     user.name = name;
     user.middlename = middlename;
     user.surname = surname;
     await user.save();
 
     return res.status(200).json(user);
   } catch (error) {
      console.log(`updateUser error: ${error.message}`);
      return res.status(500).json({msg: error.message});
   }
 }