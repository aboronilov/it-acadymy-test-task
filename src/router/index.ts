import express from "express";

import authentication from "./authentication"
import users from "./users"
import doctors from "./doctors"
import appointments from "./appointments";

const router = express.Router();

export default (): express.Router => {
   authentication(router);
   users(router);
   doctors(router);
   appointments(router)
   return router;
}