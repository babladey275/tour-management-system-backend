import z from "zod";
import { AccountStatus, Role } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string({ message: "Name must be a string." })
    .min(2, { message: "Name too short. Minimum 2 characters long" })
    .max(50, { message: "Name too long." }),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string({ message: "Password must be a string." })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/\d/, {
      message: "Password must contain at least 1 number.",
    })
    .regex(/[!@#$%^&*()[\]{}\-_=+<>?\/~]/, {
      message: "Password must contain at least 1 special character.",
    }),
  phone: z
    .string({ message: "Phone number must be a string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be a valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  address: z
    .string({ message: "Address must be a string" })
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),
});

export const updateUserZodSchema = z.object({
  name: z
    .string({ message: "Name must be a string." })
    .min(2, { message: "Name too short. Minimum 2 characters long" })
    .max(50, { message: "Name too long." })
    .optional(),
  password: z
    .string({ message: "Password must be a string." })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/\d/, {
      message: "Password must contain at least 1 number.",
    })
    .regex(/[!@#$%^&*()[\]{}\-_=+<>?\/~]/, {
      message: "Password must contain at least 1 special character.",
    })
    .optional(),
  phone: z
    .string({ message: "Phone number must be a string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be a valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  role: z.enum(Object.values(Role)).optional(),
  status: z.enum(Object.values(AccountStatus)).optional(),
  isDeleted: z
    .boolean({ message: "isDeleted must be true or false" })
    .optional(),
  isVerified: z.boolean({ message: "isVerified must be true or false" }).optional(),
  address: z
    .string({ message: "Address must be a string" })
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),
});
