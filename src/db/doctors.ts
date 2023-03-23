import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
   name: { type: String, requiered: true },
   middlename: { type: String, requiered: true },
   surname: { type: String, requiered: true },
   email: { 
      type: String, 
      requiered: true, 
      unique: true,
   },
   occupation: {type: String, requiered: true},
   appointmentIds: [
      { type: String }
   ],
   busy: [
      { type: String }
   ]
})

const DoctorModel = mongoose.model("Doctor", DoctorSchema)

export const getDoctors = () => DoctorModel.find();
export const getDoctorByEmail = (email: string) => DoctorModel.findOne({ email })
export const getDoctorById = (id: string) => DoctorModel.findById(id)
export const createDoctor = (values: Record<string, any>) => new DoctorModel(values)
   .save()
   .then((doctor) => doctor.toObject())
