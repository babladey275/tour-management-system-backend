import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  try {
    const user = await UserServices.createUser(req.body);

    res.status(httpStatus.CREATED).json({
      message: "User Created Successfully",
      user,
    });
  } catch (err: any) {
    console.log(err);
    res.status(httpStatus.BAD_REQUEST).json({
      message: `Something Went Wrong! ${err.message}`,
      err,
    });
  }
};

export const UserControllers = {
  createUser,
};

//route matching -> controller -> service -> model -> DB