import mongoose, { model } from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const uri = process.env.URI
export const connectToDb = () => {
  mongoose
    .connect(uri)
    .then(() => console.log("database Connection Succesfully"))
    .catch((err) => console.log(err));
};
 
