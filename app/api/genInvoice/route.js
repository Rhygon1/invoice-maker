// import { NextRequest, NextResponse } from "next/server";
// import fs from "fs";
// import { readFile } from "fs/promises";
// import path from "path";
// import {pdf} from "phan"

// export async function POST(req) {
//   const data = await req.json();



//   try {
//     wkhtmltopdf('http://google.com/', { pageSize: 'letter' })
//   .pipe(fs.createWriteStream('out.pdf'));    

//     const buffer = await readFile(path.join(process.cwd(), `public/${data.id}.pdf`));

//     const headers = new Headers();
//     // remember to change the filename `test.pdf` to whatever you want the downloaded file called
//     headers.append("Content-Disposition", 'attachment; filename="test.pdf"');
//     headers.append("Content-Type", "application/pdf");

//     return new Response(buffer, {
//       headers,
//     });
//   } catch (err) {
//     console.error("PDF creation error:", err);
//     return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
//   }
// }

function formatDate(date){
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
  const today = new Date(date);
  const yyyy = today.getFullYear();
  let mm = months[today.getMonth()];
  let dd = today.getDate();

  const formattedToday = dd + " " + mm + " " + yyyy;

  return formattedToday;
}

const chromium = require("@sparticuz/chromium-min");
const puppeteer = require("puppeteer-core");

async function getBrowser() {
  return puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(
      `https://github.com/Sparticuz/chromium/releases/download/v129.0.0/chromium-v129.0.0-pack.tar`
    ),
    headless: chromium.headless,
    ignoreHTTPSErrors: true
  });
}

function makeHtml(data) {
  let firstHalf = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Invoice</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 40px;
        color: #333;
        margin: 10%;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .left {
        line-height: 1.6;
      }

      .right {
        text-align: right;
      }

      .invoice-title {
        color: #c0392b;
        font-size: 36px;
        font-weight: normal;
      }

      .invoice-details {
        margin-top: 20px;
      }

      .subject {
        margin: 40px 0 10px;
        font-weight: bold;
      }

      .table-container {
        width: 100%;
        margin-top: 20px;
      }

      table {
        width: 100%;
      }

      th {
        background-color: #a33a2f;
        color: white;
        padding: 10px;
        text-align: left;
      }

      td {
        padding: 10px;
        border-bottom: 1px solid #ccc;
      }

      .sub {
        color: gray;
        font-size: 0.9em;
      }

      .totals {
        margin-top: 20px;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        align-content: space-around;
        position: relative;
      }

      .totals table {
        width: 30%;
        border-collapse: collapse;
      }

      .totals td {
        padding: 5px 10px;
        line-height: 20pt;
      }

      .bold {
        font-weight: bold;
      }

      .red {
        color: #c0392b;
      }

      .footer {
        text-align: right;
        margin-top: 20px;
        font-size: 1.1em;
      }

      .balance-box {
        background-color: #f9f9f9;
        padding: 10px;
        display: inline-block;
      }
    </style>
  </head>
  <body>
    <div class="header flex justify-between">
      <div class="left">
        <div style="line-height: 15pt;"><strong>LIS Boutique LLC.</strong></div>
        <div style="line-height: 15pt;">Blue Vw Wy, Saint Cloud</div>
        <div style="line-height: 15pt;">Florida, US 34771</div>
        <div style="line-height: 15pt;"><strong>Ph # :</strong> +1 689-267-8636</div>
        <div style="line-height: 15pt;"><strong>EMail ID :</strong> lisboutique06@gmail.com</div>
      </div>
      <div class="right" style="display: flex; flex-direction: column">
        <div style="margin-bottom: 40pt" class="invoice-title">INVOICE</div>
        <div><strong>Balance Due : </strong><strong>$${data.balanceLeft}</strong></div>

        <div style="margin-top: 20px; font-size: 0.9em">
          <div style="margin-bottom: 20pt;"><strong>Invoice # :</strong> ${data.id}</div>  
          <div style="line-height: 30pt;"><strong>Invoice Date :</strong> ${formatDate(data.date)}</div>
          <div style="line-height: 30pt;"><strong>Terms :</strong> Due in one month</div>
          <div style="line-height: 30pt;"><strong>Due Date :</strong> ${formatDate(data.dueDate)}</div>
   
        </div>
      </div>
    </div>

    <div class="invoice-details">
      <div"><strong> Customer Name & Address: </strong></div>
      <div style="line-height: 30pt;"><strong>${data.name}</strong></div>
      <div>${data.address}</div>
      <div>${data.phone}</div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>`
   data.items.forEach(item => {
    firstHalf += `<tr>
              <td style = "text-align:center">${item.number}</td>
              <td>
                ${item.name}<br />
              </td>
              <td style = "text-align:center">${item.qnt}</td>
              <td style = "text-align:right">$${item.rate}</td>
              <td style = "text-align:right">$${item.amount}</td>
            </tr>`

  })

  firstHalf += `</tbody>
      </table>
    </div>

    <div class="totals" style="height: full; display: flex; flex-direction: column; justify-content: space-between; margin: 5px;">
      <table style="border-collapse: separate; border-spacing: 0; align-self: end;">
        <tr>
          <td>Shipping</td>
          <td style = "text-align:right">$${data.shipping}</td>
        </tr>
        <tr>
          <td>Sub Total</td>
          <td style = "text-align:right">$${data.subtotal}</td>
        </tr>
        <tr>
          <td>Sales (${data.TaxPercent})</td>
          <td style = "text-align:right">$${data.TaxAmount}</td>
        </tr>
        <tr class="bold">
          <td>Total</td>
          <td style = "text-align:right">$${data.total}</td>
        </tr>
        <tr class="red">
          <td>Payment Made</td>
          <td style = "text-align:right">(-) $${data.paymentMade}</td>
        </tr>
        <tr class="bold" style="background: #e6e5e5;">
          <td>Balance Due</td>
          <td style = "text-align:right">$${data.balanceLeft}</td>
        </tr>
        
      </table>
    </div>

    
      <div style="position: absolute; bottom: 5%;">
      <p>Thank you for shopping with us!</p>
      <br></br>
      <p style="font-size:small"><strong>Disclaimer</strong></p>
      <p style="line-height: 12pt; font-size: small;">* All sales are final.</p>
      <p style="line-height: 12pt; font-size: small;">** This is a computer generated invoice and does not require a physical signature.  </p>
      </div>

  </body>
</html>`

  return firstHalf
}

export async function POST(request) {
  try {
    const json = await request.json();

    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(makeHtml(json), { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A3",
      printBackground: true,
    });
    await browser.close();

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="output.pdf"'
      }
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}