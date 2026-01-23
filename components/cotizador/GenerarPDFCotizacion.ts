import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import {
  iGetTiposVehiculo,
  iGetUsosVehiculo,
} from "@/interfaces/CatVehiculosInterface";
import { generarColumnasPDF } from "@/lib/pdf.utils";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import { getCoberturas } from "@/actions/CatCoberturasActions";
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import { calcularPrima } from "./CalculosPrima";
import { getAjustesCP } from "@/actions/AjustesCP";
import { useCalculosPrima } from "@/hooks/useCalculoPrima";
import { currentUser } from "@/lib/auth";

interface GenerarPDFProps {
  datos: iGetCotizacion;
  tiposVehiculo: iGetTiposVehiculo[];
  usosVehiculo: iGetUsosVehiculo[];
  tiposPago: iGetTipoPagos[];
  isSave: boolean;
  showMensual?: boolean;
}

export const generarPDFCotizacion = async ({
  datos,
  tiposVehiculo,
  usosVehiculo,
  tiposPago,
  isSave,
  showMensual,
}: GenerarPDFProps) => {
  // Obtener dirección de la sucursal del usuario actual
  let direccionSucursal: string | undefined;
  try {
    const user = await currentUser();
    direccionSucursal = user?.Sucursal?.Direccion;
  } catch (error) {
    // Si falla (ej. del lado del cliente), direccionSucursal quedará undefined
    console.warn('No se pudo obtener la dirección de la sucursal:', error);
  }

  const doc = new jsPDF({
    format: 'letter'
  });
  const MARGEN_X = 15;
  const MARGEN_Y = 10;
  const ANCHO_PAGINA = doc.internal.pageSize.width - MARGEN_X * 2;

  const formatearFecha = (fecha: Date | string): string => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatearFechaConMesTexto = (fecha: Date | string): string => {
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const f = new Date(fecha);
    const dia = String(f.getDate()).padStart(2, '0');
    const mes = meses[f.getMonth()];
    const año = f.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const formatearMoneda = (cantidad: string | number): string => {
    const valor = typeof cantidad === "string" ? parseFloat(cantidad) : cantidad;
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(valor);
  };

  const calcularFechaPago = (fechaBase: Date | string, meses: number): string => {
    const fecha = new Date(fechaBase);
    fecha.setMonth(fecha.getMonth() + meses);
    return formatearFechaConMesTexto(fecha);
  };

  const nombreUso = usosVehiculo.find((uso) => uso.UsoID === datos.UsoVehiculo)?.Nombre || "No especificado";
  const nombreTipo = tiposVehiculo.find((tipo) => tipo.TipoID === datos.TipoVehiculo)?.Nombre || "No especificado";
  const tipoPagoAnual = tiposPago.find((t) => t.Descripcion.toLowerCase().includes('anual'));
  const tipoPagoSemestral = tiposPago.find((t) => t.Descripcion.toLowerCase().includes('semestral'));
  const tipoPagoTrimestral = tiposPago.find((t) => t.Descripcion.toLowerCase().includes('trimestral'));
  const tipoPagoMensual = tiposPago.find((t) => t.Descripcion.toLowerCase().includes('mensual'));

  const ajustesCP = await getAjustesCP(datos.CP);
  const { obtenerPagos } = useCalculosPrima();

  const resultadosAnual = calcularPrima({
    costoBase: datos.CostoBase,
    ajustes: ajustesCP,
    tipoPago: tipoPagoAnual,
    bonificacion: Number(datos.PorcentajeDescuento),
    derechoPoliza: Number(datos.DerechoPoliza)
  });

  const resultadosSemestral = calcularPrima({
    costoBase: datos.CostoBase,
    ajustes: ajustesCP,
    tipoPago: tipoPagoSemestral,
    bonificacion: Number(datos.PorcentajeDescuento),
    derechoPoliza: Number(datos.DerechoPoliza)
  });

  const resultadosTrimestral = calcularPrima({
    costoBase: datos.CostoBase,
    ajustes: ajustesCP,
    tipoPago: tipoPagoTrimestral,
    bonificacion: Number(datos.PorcentajeDescuento),
    derechoPoliza: Number(datos.DerechoPoliza)
  });

  const resultadosMensual = calcularPrima({
    costoBase: datos.CostoBase,
    ajustes: ajustesCP,
    tipoPago: tipoPagoMensual,
    bonificacion: Number(datos.PorcentajeDescuento),
    derechoPoliza: Number(datos.DerechoPoliza)
  });

  const detallesPagoSemestral = tipoPagoSemestral ? obtenerPagos(
    datos.CostoNeto,
    tipoPagoSemestral,
    Number(datos.DerechoPoliza)
  ) : null;

  const detallesPagoTrimestral = tipoPagoTrimestral ? obtenerPagos(
    datos.CostoNeto,
    tipoPagoTrimestral,
    Number(datos.DerechoPoliza)
  ) : null;

  const detallesPagoMensual = tipoPagoMensual ? obtenerPagos(
    datos.CostoNeto,
    tipoPagoMensual,
    Number(datos.DerechoPoliza)
  ) : null;

  doc.addImage("/prase-logo.png", "PNG", MARGEN_X, MARGEN_Y, 30, 30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(47, 84, 149);
  doc.text("COTIZACIÓN PRASE SEGUROS", MARGEN_X + 45, MARGEN_Y + 10);

  let posicionY = MARGEN_Y + 35;
  const mitadAncho = ANCHO_PAGINA * 0.48;
  doc.setTextColor(0);

  autoTable(doc, {
    startY: posicionY,
    head: [["DATOS DE LA UNIDAD"]],
    body: [
      [`Marca: ${datos.Marca}`],
      [`Modelo: ${datos.Submarca}`],
      [`Año de fabricación: ${datos.Modelo}`],
      [`VIN: ${datos.VIN || '---'}`],
    ],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 51, 102] },
    columnStyles: { 0: { cellWidth: mitadAncho } },
    margin: { left: MARGEN_X },
  });

  autoTable(doc, {
    startY: posicionY,
    head: [["DATOS DEL CLIENTE"]],
    body: [
      [`Nombre: ${datos.NombrePersona || "---"}`],
      [`Código Postal: ${datos.CP || "---"}`],
      [`Uso: ${nombreUso}`],
      [`Servicio: ${nombreTipo}`],
    ],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 51, 102] },
    columnStyles: { 0: { cellWidth: mitadAncho } },
    margin: { left: MARGEN_X + mitadAncho + 10 },
  });

  posicionY = Math.max(
    (doc as any).lastAutoTable.finalY + 5,
    (doc as any).previousAutoTable.finalY + 5
  );

  const coberturasInfo = await getCoberturas();
  const detallesCompletos = datos.detalles.map((detalle) => {
    const coberturaCompleta = coberturasInfo?.find(
      (c) => c.CoberturaID === detalle.CoberturaID
    );
    return coberturaCompleta ? { ...detalle, ...coberturaCompleta } : detalle;
  });

  const coberturas = generarColumnasPDF(detallesCompletos);

  autoTable(doc, {
    startY: posicionY,
    head: [["COBERTURA AMPLIA", "SUMA ASEGURADA", "DEDUCIBLE", "PRIMA"]],
    body: coberturas,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 51, 102] },
    columnStyles: {
      0: { cellWidth: ANCHO_PAGINA * 0.3 },
      1: { cellWidth: ANCHO_PAGINA * 0.3 },
      2: { cellWidth: ANCHO_PAGINA * 0.2 },
      3: { cellWidth: ANCHO_PAGINA * 0.2 },
    },
  });

  posicionY = (doc as any).lastAutoTable.finalY + 4;

  const costosBase = [
    ["Costo Base:", formatearMoneda(datos.CostoBase)],
    ["Ajuste por siniestralidad:", formatearMoneda(resultadosAnual.ajusteSiniestralidad)],
    ["Subtotal con ajuste siniestralidad:", formatearMoneda(resultadosAnual.subtotalSiniestralidad)],
    ["Bonificación técnica:", formatearMoneda(resultadosAnual.bonificacion)],
    ["Costo Neto:", formatearMoneda(resultadosAnual.costoNeto)],
    ["Derecho de Póliza:", formatearMoneda(Number(datos.DerechoPoliza))],
    ["IVA (16%):", formatearMoneda(resultadosAnual.iva)],
    ["TOTAL PAGO ANUAL:", formatearMoneda(resultadosAnual.total)]
  ];

  autoTable(doc, {
    startY: posicionY,
    body: costosBase,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: ANCHO_PAGINA * 0.7, fontStyle: "bold" },
      1: { cellWidth: ANCHO_PAGINA * 0.3, halign: "right" }
    },
    didParseCell: (data) => {
      // Resaltar la fila del TOTAL PAGO ANUAL (última fila)
      if (data.row.index === costosBase.length - 1) {
        data.cell.styles.fillColor = [240, 248, 255]; // Azul muy claro
        data.cell.styles.textColor = [0, 51, 102]; // Azul oscuro
      }
    }
  });

  const fechaActivacion = datos.FechaCotizacion || new Date();
  
  // Plan Semestral
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 4,
    body: [
      [
        `TOTAL PAGO SEMESTRAL: ${formatearMoneda(resultadosSemestral.total)}`,
        detallesPagoSemestral ? `Primer pago: ${formatearMoneda(detallesPagoSemestral.primerPago)}` : "",
        detallesPagoSemestral ? `1 PAGO SUBSECUENTE: ${formatearMoneda(detallesPagoSemestral.pagoSubsecuente)}` : ""
      ]
    ],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: ANCHO_PAGINA * 0.34, fontStyle: "bold" },
      1: { cellWidth: ANCHO_PAGINA * 0.33, halign: "right" },
      2: { cellWidth: ANCHO_PAGINA * 0.33, halign: "right" },
    }
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY,
    body: [[`FECHA DE PAGO SUBSECUENTE: ${calcularFechaPago(fechaActivacion, 6)}`]],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2, fontStyle: "bold", halign: "left" },
    columnStyles: {
      0: { cellWidth: ANCHO_PAGINA }
    },
    didDrawCell: (data) => {
      if (data.row.index === 0 && data.column.index === 0) {
        const text = data.cell.text[0];
        const fechaMatch = text.match(/\d{2}\/[A-Za-z]{3}\/\d{4}/);
        if (fechaMatch) {
          const fecha = fechaMatch[0];
          const textoAntes = text.substring(0, text.indexOf(fecha));
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          const anchoTextoAntes = doc.getTextWidth(textoAntes);
          const anchoFecha = doc.getTextWidth(fecha);
          const x = data.cell.x + anchoTextoAntes + 2;
          const y = data.cell.y + data.cell.height - 2.2;
          doc.setDrawColor(0);
          doc.setLineWidth(0.3);
          doc.line(x, y, x + anchoFecha + 1, y);
        }
      }
    }
  });

  // Plan Trimestral
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 2,
    body: [
      [
        `TOTAL PAGO TRIMESTRAL: ${formatearMoneda(resultadosTrimestral.total)}`,
        detallesPagoTrimestral ? `Primer pago: ${formatearMoneda(detallesPagoTrimestral.primerPago)}` : "",
        detallesPagoTrimestral ? `3 PAGOS SUBSECUENTES: ${formatearMoneda(detallesPagoTrimestral.pagoSubsecuente)}` : ""
      ]
    ],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: ANCHO_PAGINA * 0.34, fontStyle: "bold" },
      1: { cellWidth: ANCHO_PAGINA * 0.33, halign: "right" },
      2: { cellWidth: ANCHO_PAGINA * 0.33, halign: "right" },
    }
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY,
    body: [[`FECHAS DE PAGOS SUBSECUENTES: ${calcularFechaPago(fechaActivacion, 3)}, ${calcularFechaPago(fechaActivacion, 6)}, ${calcularFechaPago(fechaActivacion, 9)}`]],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2, fontStyle: "bold", halign: "left" },
    columnStyles: {
      0: { cellWidth: ANCHO_PAGINA }
    },
    didDrawCell: (data) => {
      if (data.row.index === 0 && data.column.index === 0) {
        const text = data.cell.text[0];
        const fechaRegex = /\d{2}\/[A-Za-z]{3}\/\d{4}/g;
        const fechas = text.match(fechaRegex);
        if (fechas) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setDrawColor(0);
          doc.setLineWidth(0.3);
          let posicionBusqueda = 0;
          fechas.forEach((fecha) => {
            const indiceFecha = text.indexOf(fecha, posicionBusqueda);
            const textoAntes = text.substring(0, indiceFecha);
            const anchoTextoAntes = doc.getTextWidth(textoAntes);
            const anchoFecha = doc.getTextWidth(fecha);
            const x = data.cell.x + anchoTextoAntes + 2;
            const y = data.cell.y + data.cell.height - 2.2;
            doc.line(x, y, x + anchoFecha + 1, y);
            posicionBusqueda = indiceFecha + fecha.length;
          });
        }
      }
    }
  });

  // Plan Mensual (opcional)
  if (showMensual) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      body: [
        [
          `TOTAL PAGO MENSUAL: ${formatearMoneda(resultadosMensual.total)}`,
          detallesPagoMensual ? `Primer pago: ${formatearMoneda(detallesPagoMensual.primerPago)}` : "",
          detallesPagoMensual ? `11 PAGOS SUBSECUENTES: ${formatearMoneda(detallesPagoMensual.pagoSubsecuente)}` : ""
        ]
      ],
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: ANCHO_PAGINA * 0.34, fontStyle: "bold" },
        1: { cellWidth: ANCHO_PAGINA * 0.33, halign: "right" },
        2: { cellWidth: ANCHO_PAGINA * 0.33, halign: "right" },
      }
    });

    const fechasMensuales = Array.from({length: 11}, (_, i) => calcularFechaPago(fechaActivacion, i + 1)).join(",  ");
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY,
      body: [[`FECHAS DE PAGOS SUBSECUENTES: ${fechasMensuales}`]],
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2, fontStyle: "bold", halign: "left" },
      columnStyles: {
        0: { cellWidth: ANCHO_PAGINA }
      },
      didDrawCell: (data) => {
        if (data.row.index === 0 && data.column.index === 0) {
          const text = data.cell.text[0];
          const fechaRegex = /\d{2}\/[A-Za-z]{3}\/\d{4}/g;
          const fechas = text.match(fechaRegex);
          if (fechas) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setDrawColor(0);
            doc.setLineWidth(0.3);
            let posicionBusqueda = 0;
            fechas.forEach((fecha) => {
              const indiceFecha = text.indexOf(fecha, posicionBusqueda);
              const textoAntes = text.substring(0, indiceFecha);
              const anchoTextoAntes = doc.getTextWidth(textoAntes);
              const anchoFecha = doc.getTextWidth(fecha);
              const x = data.cell.x + anchoTextoAntes + 2;
              const y = data.cell.y + data.cell.height - 2.2;
              doc.line(x, y, x + anchoFecha + 1, y);
              posicionBusqueda = indiceFecha + fecha.length;
            });
          }
        }
      }
    });
  }

  const textoLegal = [
    "Atención a siniestros en México 800-772-73-10",
    "Atención a clientes y cotizaciones al 800 908-90-08 consultas, modificaciones y otros trámites 311-909-10-00.",
    ...(direccionSucursal ? [direccionSucursal] : []),
    "*Esta póliza pierde cobertura en caso de no tener al corriente sus pagos.",
  ];

  textoLegal.forEach((texto, index) => {
    doc.setFontSize(7);
    doc.text(texto, MARGEN_X, doc.internal.pageSize.height - 25 + index * 4);
  });

  const qrCode = await QRCode.toDataURL('https://prase.mx/terminos-y-condiciones/');
  doc.addImage(
    qrCode,
    'PNG',
    doc.internal.pageSize.width - 35,
    doc.internal.pageSize.height - 35,
    20,
    20
  );

  if (isSave) {
    const nombreArchivo = `cotizacion_${datos.Marca}_${datos.Submarca}_${datos.Modelo}_${formatearFecha(new Date())}.pdf`;
    doc.save(nombreArchivo);
  }

  return doc;
};