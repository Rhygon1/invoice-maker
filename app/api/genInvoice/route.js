import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-creator-node";
import fs from "fs";
import { readFile } from "fs/promises";
import path from "path";

export async function POST(req) {
  const data = await req.json();

  const html = fs.readFileSync(
    path.join(process.cwd(), "app/api/genInvoice/index.html"),
    "utf8"
  );

  const outputPath = path.join(process.cwd(), "public", `${data.id}.pdf`);

  const options = {
    format: "A2",
    orientation: "portrait",
    script: path.join(process.cwd(),'node_modules/html-pdf/lib/scripts/pdf_a4_portrait.js').replace('app.asar\src', 'app.asar.unpacked')
  };

  const document = {
    html,
    data: { data },
    path: outputPath,
    type: "",
  };

  try {
    await pdf.create(document, options);

    const buffer = await readFile(path.join(process.cwd(), `public/${data.id}.pdf`));

    const headers = new Headers();
    // remember to change the filename `test.pdf` to whatever you want the downloaded file called
    headers.append("Content-Disposition", 'attachment; filename="test.pdf"');
    headers.append("Content-Type", "application/pdf");

    return new Response(buffer, {
      headers,
    });
  } catch (err) {
    console.error("PDF creation error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
