import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/connectDB";
import Invoice from "@/models/invoice";

type InvType = {
  name: String;
  phone: String;
  address: String;
  id: String;
  poNum: Number;
  date: String;
  dueDate: String;
  items: [
    {
      number: Number;
      name: String;
      qnt: Number;
      rate: String;
      amount: String;
    }
  ];
  shipping: String;
  subtotal: String;
  total: String;
  TaxPercent: String;
  TaxAmount: String;
  paymentMade: String;
  balanceLeft: String;
};

type ItemType = {
  number: Number;
  name: String;
  qnt: number;
  rate: number;
  amount: number;
};

function getDate(monthOffset: number) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = months[today.getMonth() + monthOffset]; // Months start at 0!
  let dd = today.getDate();

  let str_dd = String(dd);
  if (dd < 10) str_dd = "0" + String(dd);

  const formattedToday = str_dd + " " + mm + " " + yyyy;

  return formattedToday;
}

export async function POST(req: NextRequest) {
  await connectDB();
  let json = await req.json();
  console.log(json);

  let poNum = await Invoice.countDocuments({});
  let id = "INV-" + String(poNum).padStart(5, "0");
  const items_total = json.items?.reduce(
    (a: number, i: ItemType) => a + Number(i.qnt * i.rate),
    0
  );
  let new_tax = json.tax / 100;

  let invoice: InvType = {
    name: json.name,
    phone: json.phone,
    address: json.address,
    poNum: poNum,
    id: id,
    date: getDate(0),
    dueDate: getDate(1),
    items: json.items?.map((a: ItemType, i: number) => {
      return {
        number: i + Number(1),
        name: a.name,
        qnt: a.qnt,
        rate: (a.rate / (1 + new_tax)).toFixed(2),
        amount: ((a.qnt * a.rate) / (1 + new_tax)).toFixed(2),
      };
    }),
    shipping: (json.shipping / (1 + new_tax)).toFixed(2),
    subtotal: ((items_total + json.shipping) / (1 + new_tax)).toFixed(2),
    total: (items_total + json.shipping).toFixed(2),
    paymentMade: (json.paid).toFixed(2),
    TaxPercent: (new_tax*100).toFixed(1)+"%",
    TaxAmount: (
      (new_tax * (items_total + json.shipping)) /
      (1 + new_tax)
    ).toFixed(2),
    balanceLeft: (items_total + json.shipping - json.paid).toFixed(2),
  };

  const invoice_db = new Invoice(invoice)
  try{
    await invoice_db.save()
  } catch (err) {
    return NextResponse.json({message: err}, {status: 400})
  }

  return NextResponse.json(invoice, { status: 200 });
}
