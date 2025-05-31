import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/connectDB";
import Invoice from "@/models/invoice";

type InvType = {
  name: String;
  phone: String;
  address: String;
  id: String;
  poNum: Number;
  date: Date;
  dueDate: Date;
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

function addMonth(date: Date) {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth()+1)
  return newDate
}

export async function POST(req: NextRequest) {
  await connectDB();
  let json = await req.json();
  console.log(json);
  
  let lastDoc = await Invoice.find().sort({ _id: -1 }).limit(1).exec();
  let poNum = 0;
  if (lastDoc.length > 0){
    poNum = lastDoc[0].poNum + 1;
  }
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
    date: json.date,
    dueDate: addMonth(json.date),
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
