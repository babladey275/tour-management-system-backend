import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import crypto from "crypto";
import httpStatus from "http-status-codes";
import { Booking } from "./booking.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Tour } from "../tour/tour.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { QueryBuilder } from "../../utils/QueryBuilder";

const getTransactionId = () => {
  return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// const getTransactionId = () => `tran_${crypto.randomUUID()}`;

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
  const transactionId = getTransactionId();

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);

    if (!user?.phone || !user.address) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Please Update Your Profile to Book a Tour."
      );
    }

    const tour = await Tour.findById(payload.tour).select("costFrom");

    if (!tour?.costFrom) {
      throw new AppError(httpStatus.BAD_REQUEST, "No Tour Cost Found!");
    }

    const amount = Number(tour.costFrom) * Number(payload.guestCount);

    const booking = await Booking.create(
      [
        {
          user: userId,
          status: BOOKING_STATUS.PENDING,
          ...payload,
        },
      ],
      { session }
    );

    const payment = await Payment.create(
      [
        {
          booking: booking[0]._id,
          status: PAYMENT_STATUS.UNPAID,
          transactionId,
          amount,
        },
      ],
      { session }
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      booking[0]._id,
      { payment: payment[0]._id },
      { new: true, runValidators: true, session }
    )
      .populate("user", "name email phone address")
      .populate("tour", "title costFrom")
      .populate("payment");

    const userAddress = (updatedBooking?.user as any).address;
    const userEmail = (updatedBooking?.user as any).email;
    const userPhoneNumber = (updatedBooking?.user as any).phone;
    const userName = (updatedBooking?.user as any).name;

    const sslPayload: ISSLCommerz = {
      address: userAddress,
      email: userEmail,
      phoneNumber: userPhoneNumber,
      name: userName,
      amount: amount,
      transactionId: transactionId,
    };

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);

    await session.commitTransaction(); //transaction
    session.endSession();

    return {
      paymentUrl: sslPayment.GatewayPageURL,
      booking: updatedBooking,
    };
  } catch (error) {
    await session.abortTransaction(); //rollback
    session.endSession();
    throw error;
  }
};

const getUserBookings = async (userId: string) => {
  const booking = await Booking.find({ user: userId });

  return { data: booking };
};

const getBookingById = async (id: string) => {
  const booking = await Booking.findById(id);
  return {
    data: booking,
  };
};

const updateBookingStatus = async (id: string, payload: Partial<IBooking>) => {
  const existingBooking = await Booking.findById(id);

  if (!existingBooking) {
    throw new Error("Booking not found.");
  }
  const updatedBookingStatus = await Booking.findByIdAndUpdate(
    id,
    { status: payload.status },
    { new: true }
  );

  return updatedBookingStatus;
};

const getAllBookings = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Booking.find(), query);
  const searchableFields = ["status"];
  const bookingsQuery = queryBuilder
    .search(searchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    bookingsQuery.build(),
    queryBuilder.getMeta(),
  ]);

  return { data, meta };
};

export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookings,
};
