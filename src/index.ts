import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from 'dotenv';

import router from "./router";

const app = express()

app.use(cors({
   credentials: true
}))

dotenv.config()
app.use(compression())
app.use(cookieParser())
app.use(bodyParser.json())

const server = http.createServer(app)

server.listen(8080, () => {
   console.log("Server is running ...")
})

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL as string)
mongoose.connection.on("error", (error: Error) => console.log(error.message))

app.use("/", router())

// https://dev.to/nedsoft/testing-nodejs-express-api-with-jest-and-supertest-1km6