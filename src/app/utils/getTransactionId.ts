import crypto from "crypto";

export const getTransactionId = () => {
  return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// const getTransactionId = () => `tran_${crypto.randomUUID()}`;