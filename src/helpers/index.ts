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

export const validateAppointmentStartFormat = (start: string) => {
   const regexExp = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01]) ([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
   return regexExp.test(start);
};

export const validateAppointmentStartIsAfterNow = (start: string) => {
   const current = moment();
   return moment(start).isAfter(current);
};

export const validateSchedule = (start: string, visits: string[]) => {
   return visits.includes(start) 
}

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

// export const sendEmail = (
//    localTime: string,
//    name: string, 
//    middlename: string, 
//    surname: string, 
//    email: string, 
//    doctorName: string, 
//    doctorMiddleName: string, 
//    doctorSurname: string, 
//    occupation: string
// ) => {
//    const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       host: 'smtp.gmail.com',
//       port: 465,
//       secure: true,
//       auth: {
//          user: "boronilov@gmail.com",
//          pass: process.env.PASSWORD
//       },
//       tls: {
//         // do not fail on invalid certs
//         rejectUnauthorized: false,
//       },
//     });

//    const mailOptions = {
//       from: "boronilov@gmail.com",
//       to: `${email}`,
//       subject: 'Напоминание',
//       html: `
//          <h1>Уважаемый пациент ${name} ${middlename} ${surname}</h1> 
//          <p>Администрация клиники ООО "Будь здоров" напоминает вам о записи на прием по адресу пр. Вернадского, 37, к.1А, Москва в ${localTime} (время местное)</p>
//          <p>Прием проводит ${occupation} ${doctorName} ${doctorMiddleName} ${doctorSurname}</p>
//          <p>C пожеланиями скорейшего выздоровления</p>
//       `
//    };

//    transporter.sendMail(mailOptions, (error: any, info: any) => {
//       if (error) 
//          console.log(error)
//       else
//          console.log('EMail sent to ' + info.response)
//    })
// } 
