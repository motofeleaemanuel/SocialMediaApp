// src/index.js
import express, { Express } from "express";
import dotenv from "dotenv";
import connectDB from "./database";
import bodyParser from "body-parser";
import sgMail from "@sendgrid/mail";
import authRouter from "../src/routes/authRouter";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
if (!SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is not defined in the environment variables.");
}
sgMail.setApiKey(SENDGRID_API_KEY)

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

(async () => {
  await connectDB();

})();