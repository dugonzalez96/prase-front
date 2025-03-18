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

  const formatearMoneda = (cantidad: string | number): string => {
    const valor = typeof cantidad === "string" ? parseFloat(cantidad) : cantidad;
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(valor);
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
    }
  });

  const planesPago = [
    [
      `TOTAL PAGO SEMESTRAL: ${formatearMoneda(resultadosSemestral.total)}`,
      detallesPagoSemestral ? `Primer pago: ${formatearMoneda(detallesPagoSemestral.primerPago)}` : "",
      detallesPagoSemestral ? `Pagos subsecuentes: ${formatearMoneda(detallesPagoSemestral.pagoSubsecuente)}` : ""
    ],
    [
      `TOTAL PAGO TRIMESTRAL: ${formatearMoneda(resultadosTrimestral.total)}`,
      detallesPagoTrimestral ? `Primer pago: ${formatearMoneda(detallesPagoTrimestral.primerPago)}` : "",
      detallesPagoTrimestral ? `Pagos subsecuentes: ${formatearMoneda(detallesPagoTrimestral.pagoSubsecuente)}` : ""
    ],
    ...(showMensual ? [[
      `TOTAL PAGO MENSUAL: ${formatearMoneda(resultadosMensual.total)}`,
      detallesPagoMensual ? `Primer pago: ${formatearMoneda(detallesPagoMensual.primerPago)}` : "",
      detallesPagoMensual ? `Pagos subsecuentes: ${formatearMoneda(detallesPagoMensual.pagoSubsecuente)}` : ""
    ]] : [])
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 4,
    body: planesPago,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: ANCHO_PAGINA * 0.33, fontStyle: "bold" },
      1: { cellWidth: ANCHO_PAGINA * 0.33, halign: "right" },
      2: { cellWidth: ANCHO_PAGINA * 0.33, halign: "right" },
    }
  });

  const textoLegal = [
    "Atención a siniestros en México 800-772-73-10",
    "Atención a clientes y cotizaciones al 800 908-90-08 consultas, modificaciones y otros trámites 311-909-10-00.",
    "Avenida Independencia #361 Colonia los Llanitos, Tepic Nayarit, C.p. 63170.",
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