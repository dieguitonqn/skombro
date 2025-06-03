import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { cliente, valores, items } = data;

  // Leer el logo y convertirlo a base64
  const logoPath = path.join(process.cwd(), "public", "mainLogo.png");
  let logoBase64 = "";
  try {
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = logoBuffer.toString("base64");
  } catch (e) {
    // Si falla, no se pone logo
    console.error("Error al leer el logo:", e);
    logoBase64 = "";
  }

  // Crear PDF con colores y logo
  const doc = new jsPDF();
  let y = 15;
  // Colores principales (azul y gris oscuro)
  const azul = "#1e293b"; // tailwind slate-800
  const azulClaro = "#3b82f6"; // tailwind blue-500
  // Logo

  doc.setDrawColor(azul);
  doc.setFillColor(azul);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("Informe de Obra", 15, 20);
  y = 38;
  doc.setTextColor(azul);
  doc.setFontSize(12);
  y += 5;
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, y);
  y += 10;

  doc.setFontSize(14);
  doc.setTextColor(azulClaro);
  doc.text("Datos del Cliente", 15, y);
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(azul);
  doc.text(`Nombre: ${cliente.nombre} ${cliente.apellido}`, 15, y);
  y += 6;
  if (cliente.empresa) { doc.text(`Empresa: ${cliente.empresa}`, 15, y); y += 6; }
  if (cliente.telefono) { doc.text(`Teléfono: ${cliente.telefono}`, 15, y); y += 6; }
  if (cliente.direccion) { doc.text(`Dirección: ${cliente.direccion}`, 15, y); y += 6; }
  if (cliente.email) { doc.text(`Email: ${cliente.email}`, 15, y); y += 6; }
  y += 2;

  doc.setFontSize(14);
  doc.setTextColor(azulClaro);
  doc.text("Valores Generales", 15, y);
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(azul);
  doc.text(`Valor estimado x m²: US$${valores.valorTotal ?? "-"}`, 15, y);
  y += 6;
  doc.text(`M² de obra: ${valores.m2obra ?? "-"}`, 15, y);
  y += 6;
  doc.text(`Costo total obra: US$${valores.costoTotal ?? "-"}`, 15, y);
  y += 6;
  doc.text(`Total seleccionado: US$${valores.totalSeleccionado ?? "-"}`, 15, y);
  y += 10;

  doc.setFontSize(14);
  doc.setTextColor(azulClaro);
  doc.text("Detalle de Ítems", 15, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(azul);
  doc.setFillColor(azulClaro);
  doc.rect(15, y - 5, 180, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.text("Nombre", 17, y);
  doc.text("%", 90, y);
  doc.text("Valor", 110, y);
  doc.text("Incluido", 150, y);
  y += 7;
  doc.setTextColor(azul);
  // Detalle de ítems
  interface ItemInforme {
    id: number;
    nombre: string;
    descripcion: string;
    porcentaje: number;
    valor: number;
    incluido: boolean;
  }
  (items as ItemInforme[]).forEach((item) => {
    if (y > 270) { doc.addPage(); y = 15; }
    doc.text(item.nombre, 17, y);
    doc.text(`${item.porcentaje}%`, 90, y);
    doc.text(`US$${item.valor.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 110, y);
    doc.text(item.incluido ? "Sí" : "No", 150, y);
    y += 6;
  });
  if (logoBase64) {
    try {
      doc.addImage(
        `data:image/png;base64,${logoBase64}`,
        "PNG",
        155,
        1,
        30,
        30
      );
    } catch {
      // Si hay error al agregar la imagen, continuar sin logo
    }
  }
  // Generar PDF como blob
  const pdfBlob = doc.output("blob");
  return new NextResponse(pdfBlob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=InformeObra.pdf"
    }
  });
}
