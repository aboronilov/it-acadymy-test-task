import mongoose from 'mongoose';
import moment from "moment"

const AppointmentSchema = new mongoose.Schema({   
   start: {type: String, required: true},
   doctorId: {type: String, required: true},
   patientId: {type: String, required: true},
   reason: {type: String, required: true}
});

export const AppointmentModel = mongoose.model("Appointment", AppointmentSchema);

export const getAppointments = () => AppointmentModel.find();
export const getAppointentById = (id: string) => AppointmentModel.findById(id);
export const createAppointment = (values: Record<string, any>) => new AppointmentModel(values)
   .save()
   .then((appointment) => appointment.toObject())