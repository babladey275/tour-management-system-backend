import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
require('dotenv').config();

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wf6wg.mongodb.net/tour-management-backend?appName=Cluster0`)

    console.log("Connected to DB")

    server = app.listen(5000, ()=>{
      console.log("Server is listening to port 5000")
    })
  } catch (error){
    console.log(error)
  }
};

startServer()

