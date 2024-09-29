import express, { Express } from "express";
import dotenv from "dotenv";
import connectDB from "./database";
import bodyParser from "body-parser";
import authRouter from "../src/routes/authRouter";
import settingsRouter from "../src/routes/settingsRouter";
import postRouter from "../src/routes/postRouter"
import commentRouter from "../src/routes/commentRouter"
import likeRouter from "../src/routes/likeRouter"
import friendshipRouter from "../src/routes/friendshipRouter"
import userProfileRouter from "../src/routes/userProfileRouter"
import cors from "cors";
import * as admin from "firebase-admin"

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const firebaseAccountBase64 = process.env.FIREBASE_ACCOUNT_BASE64_STRING;
if (!firebaseAccountBase64) {
  throw new Error("FIREBASE_ACCOUNT_BASE64_STRING is not defined in environment variables.");
}

const firebaseAccountJson = Buffer.from(firebaseAccountBase64, 'base64').toString('utf-8');

const serviceAccount = JSON.parse(firebaseAccountJson);
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket
});

export const bucket = admin.storage().bucket();

// const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
// if (!SENDGRID_API_KEY) {
//   throw new Error("SENDGRID_API_KEY is not defined in the environment variables.");
// }
// sgMail.setApiKey(SENDGRID_API_KEY)

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/profile", userProfileRouter)
app.use("/api/settings", settingsRouter);
app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);
app.use("/api/like", likeRouter)
app.use("/api/friend", friendshipRouter)




app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

(async () => {
  await connectDB();

})();