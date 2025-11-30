import { NextFunction, Request, Response } from "express";
import httpsStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "User Logged In Successfully",
      data: loginInfo,
    });
  }
);
export const AuthController = {
  credentialsLogin,
};
