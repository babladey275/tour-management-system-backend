import PDFDocument from "pdfkit";
import AppError from "../errorHelpers/AppError";

export interface IInvoiceData {
  transactionId: string;
  bookingDate: Date;
  userName: string;
  tourTitle: string;
  guestCount: number;
  totalAmount: number;
}

export const generatePdf = async (
  invoiceData: IInvoiceData
): Promise<Buffer> => {
  try {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers: Uint8Array[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // HEADER

      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("TRAVEL INVOICE", { align: "center" });

      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text("ABC Travel", { align: "center" })
        .text("Email: support@mycompany.com | Phone: +880-XXXXXXX", {
          align: "center",
        });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

      // INVOICE INFO

      doc.moveDown();
      doc.fontSize(12).font("Helvetica");

      doc.text(`Invoice No: ${invoiceData.transactionId}`);
      doc.text(`Booking Date: ${invoiceData.bookingDate.toDateString()}`);
      doc.text(`Customer Name: ${invoiceData.userName}`);

      doc.moveDown();

      //TABLE HEADER

      const tableTop = doc.y;
      doc.font("Helvetica-Bold");
      doc.text("Description", 50, tableTop);
      doc.text("Guests", 350, tableTop);
      doc.text("Amount", 450, tableTop);

      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

      //  TABLE DATA

      doc.moveDown(0.5);
      doc.font("Helvetica");

      doc.text(invoiceData.tourTitle, 50);
      doc.text(invoiceData.guestCount.toString(), 360, doc.y - 12);
      doc.text(`$${invoiceData.totalAmount.toFixed(2)}`, 450, doc.y - 12);

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

      // TOTAL SECTION

      doc.moveDown();
      doc.font("Helvetica-Bold");
      doc
        .fontSize(14)
        .text(
          `Total Payable: $${invoiceData.totalAmount.toFixed(2)}`,
          350,
          doc.y,
          { width: 200, lineBreak: false }
        );

      //FOOTER

      doc.moveDown(2);
      doc.fontSize(10).font("Helvetica");
      doc.text("Thank you for booking with us.", 50, doc.y, {
        width: doc.page.width - 100,
        align: "center",
      });

      doc.end();
    });
  } catch (error: any) {
    console.error(error);
    throw new AppError(500, `PDF creation failed: ${error.message}`);
  }
};
