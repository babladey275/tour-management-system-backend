import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log(err);

  /**
   * Mongoose
   * - duplicate
   * - Cast Error
   */

  const errorSources: any = [
    // {
    //   path: "isDeleted",
    //   message: "Cast Failed"
    // }
  ]

  let statusCode = 500;
  let message = "Something Went Wrong!";

  //duplicate error
  if (err.code === 1100) {
    const matchedArray = err.message.match(/"([^"]*)"/);
    statusCode = 400;
    message = `${matchedArray[1]} already exists!!`;
  }
  //Object Id error / Cast Error
  else if ((err.name = "CastError")) {
    statusCode = 400;
    message = "Invalid MongoDB ObjectID. Please provide a valid id";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors);

    errors.forEach((errorObject: any) =>
      errorSources.push({
        path: errorObject.path,
        message: errorObject.message,
      })
    );
    message = "Validation Error";
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    // err,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
