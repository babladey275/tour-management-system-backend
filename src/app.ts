import cors from "cors";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import "./app/config/passport";
import { envVars } from "./app/config/env";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
  })
);

// Explicit preflight handling
app.options("*", cors());

app.use(express.json());
// Parse URL-encoded form data
// extended: true allows nested objects
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Tour Management System Backend.",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
