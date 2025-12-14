import { TGenericErrorResponse } from "../interfaces/error.types";

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const match = err.message.match(/"([^"]*)"/);
  const value = match?.[1] || "This value";

  return {
    statusCode: 400,
    message: `${value} already exists!!`,
  };
};