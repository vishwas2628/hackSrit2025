import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInctance = await mongoose.connect(
      `${process.env.MOMGOURL}/${DB_NAME}`
    );

    console.log(
      `Mongo Db connected! Db host : ${connectionInctance.connection.host}`
    );
  } catch (error) {
    console.error("MonmgoDb connection error", error);
    process.exit(1);
  }
};

export default connectDB;
