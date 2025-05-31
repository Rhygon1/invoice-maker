// models/User.js
import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  address: String,
  id: { type: String, required: true },
  poNum: { type: Number, required: true },
  date: { type: String, required: true },
  dueDate: { type: String, required: true },
  items: [
    {
      number: { type: Number, required: true },
      name: { type: String, required: true },
      qnt: { type: Number, required: true },
      rate: { type: String, required: true },
      amount: { type: String, required: true },
    },
  ],
  shipping: { type: String, required: true },
  subtotal: { type: String, required: true },
  total: { type: String, required: true },
  TaxPercent: { type: String, required: true },
  TaxAmount: { type: String, required: true },
  paymentMade: { type: String, required: true },
  balanceLeft: { type: String, required: true },
});

console.log(InvoiceSchema);

const Invoice =
  mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);

export default Invoice;
