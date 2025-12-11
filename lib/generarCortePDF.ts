import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getEmpleadosByID } from "@/actions/EmpleadosActionts";

// Imagen base64
const getBase64FromImageUrl = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No se pudo crear el contexto");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
};

// Formato MXN
const formatCurrency = (value: number | string): string => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value));
};

// Capitalizar nombres (respeta acentos)
const capitalizarNombre = (texto: string): string => {
  return texto
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
};

export const generarCortePDF = async (data: any) => {
  const doc = new jsPDF();
  const { corte, historial } = data;

  const empleadoData = await getEmpleadosByID(corte.usuarioID.EmpleadoID);
  const empleadoNombre = empleadoData
    ? capitalizarNombre(`${empleadoData.Nombre?.trim() || ""} ${empleadoData.Paterno?.trim() || ""} ${empleadoData.Materno?.trim() || ""}`.trim())
    : "Desconocido";

  const usuario = corte.usuarioID?.NombreUsuario || "Desconocido";
  const fechaCorte = format(
    new Date(corte.FechaCorte),
    "d 'de' MMMM 'del' yyyy",
    { locale: es }
  );
  const saldoEsperado = formatCurrency(corte.SaldoEsperado);
  const saldoReal = formatCurrency(corte.SaldoReal);
  const observaciones = corte.Observaciones || "-";

  const logoSize = 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Logo
  try {
    const logoBase64 = await getBase64FromImageUrl("/prase-logo.png");
    doc.addImage(
      logoBase64,
      "PNG",
      pageWidth - logoSize - 14,
      10,
      logoSize,
      logoSize
    );
  } catch (err) {
    console.warn("No se pudo cargar el logo:", err);
  }

  // Título
  doc.setFontSize(16);
  doc.text("Corte del Día", pageWidth / 2, 20, { align: "center" });

  // Datos generales
  doc.setFontSize(11);
  const campos = [
    ["Usuario:", usuario],
    ["Empleado:", empleadoNombre],
    ["Fecha del Corte:", fechaCorte],
    ["Saldo Esperado:", saldoEsperado],
    ["Saldo Real:", saldoReal],
  ];

  let y = 35;
  campos.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text("   " + value, 14 + doc.getTextWidth(label), y); // espacio entre label y valor
    y += 7; // más espacio entre filas
  });

  let startY = y + 10;

  // Función para agregar cada sección con su título centrado
  const addTableSection = (
    title: string,
    head: string[][],
    body: any[][],
    yStart: number
  ) => {
    // Título centrado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, pageWidth / 2, yStart, { align: "center" });

    autoTable(doc, {
      startY: yStart + 5,
      head,
      body,
      theme: "grid",
      styles: {
        fontSize: 9,
      },
      headStyles: {
        fillColor: [28, 64, 181], // #1c40b5
        textColor: [255, 255, 255],
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center" },
        1: { halign: "center" },
        2: { halign: "center" },
      },
      margin: { left: 14, right: 14 },
    });

    return (doc as any).lastAutoTable.finalY + 15;
  };

  // Ingresos
  const ingresos = historial.DetalleIngresos || [];
  if (ingresos.length) {
    const body = ingresos.map((i: any) => [
      formatCurrency(i.Monto),
      i.FormaPago,
      format(new Date(i.Fecha), "dd/MM/yyyy"),
      i.Descripcion || "-",
    ]);
    startY = addTableSection(
      "Ingresos",
      [["Monto", "Forma de Pago", "Fecha", "Descripción"]],
      body,
      startY
    );
  }

  // Egresos
  const egresos = historial.DetalleEgresos || [];
  if (egresos.length) {
    const body = egresos.map((e: any) => [
      formatCurrency(e.Monto),
      e.FormaPago,
      format(new Date(e.Fecha), "dd/MM/yyyy"),
      e.Descripcion || "-",
    ]);
    startY = addTableSection(
      "Egresos",
      [["Monto", "Forma de Pago", "Fecha", "Descripción"]],
      body,
      startY
    );
  }

  // Pagos de póliza
  const pagos = historial.DetallePagosPoliza || [];
  if (pagos.length) {
    const body = pagos.map((p: any) => [
      formatCurrency(p.MontoPagado),
      p.MetodoPago,
      format(new Date(p.FechaPago), "dd/MM/yyyy"),
      p.Poliza?.NumeroPoliza || "-",
    ]);
    startY = addTableSection(
      "Pagos de Póliza",
      [["Monto Pagado", "Método de Pago", "Fecha de Pago", "Póliza"]],
      body,
      startY
    );
  }

  // Observaciones y firma
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Observaciones:", 14, startY);
  doc.setFont("helvetica", "normal");
  doc.text(observaciones, 14, startY + 6);

  // Centrar firma
  const firmaLine = "_________________________";
  const firmaLabel = empleadoNombre;

  const firmaLineX = (pageWidth - doc.getTextWidth(firmaLine)) / 2;
  const firmaLabelX = (pageWidth - doc.getTextWidth(firmaLabel)) / 2;

  doc.text(firmaLine, firmaLineX, startY + 30);
  doc.text(firmaLabel, firmaLabelX, startY + 37);

  // Guardar
  doc.save(`corte_del_dia_${fechaCorte}.pdf`);
};
