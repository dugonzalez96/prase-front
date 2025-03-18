import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import { iGetEsquemaPago, iPostPolizaResp } from "@/interfaces/CatPolizas";
import { formatCurrency } from "@/lib/format";
import { iGetTiposVehiculo, iGetUsosVehiculo } from "@/interfaces/CatVehiculosInterface";

interface GenerarPDFPolizaProps {
    respuestaPoliza: iPostPolizaResp;
    cotizacion: iGetCotizacion;
    coberturas: iGetCoberturas[];
    esquemaPago?: iGetEsquemaPago | undefined | null;
    tiposVehiculo: iGetTiposVehiculo[];
    usosVehiculo: iGetUsosVehiculo[];
}

export const generarPDFPoliza = async ({
    respuestaPoliza,
    cotizacion,
    coberturas,
    esquemaPago,
    tiposVehiculo,
    usosVehiculo,
}: GenerarPDFPolizaProps) => {
    const doc = new jsPDF({
        format: 'letter'
    });

    const tipoVehiculo = tiposVehiculo.find(t => t.TipoID === Number(cotizacion.TipoVehiculo))?.Nombre || "No especificado";
    const usoVehiculo = usosVehiculo.find(u => u.UsoID === Number(cotizacion.UsoVehiculo))?.Nombre || "No especificado";

    const MARGEN_X = 15;
    const MARGEN_Y = 10;
    const ANCHO_PAGINA = doc.internal.pageSize.width - MARGEN_X * 2;

    const obtenerNombreCobertura = (coberturaId: number): string => {
        const cobertura = coberturas.find(c => c.CoberturaID === coberturaId);
        return cobertura?.NombreCobertura || `Cobertura ${coberturaId}`;
    };

    const formatearFecha = (fecha: string | Date): string => {
        return new Date(fecha).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const obtenerTextoPago = (numeroPagos: number): string => {
        const tipos = {
            1: "Pago Anual",
            2: "Pago Semestral",
            3: "Pago Cuatrimestral",
            4: "Pago Trimestral"
        };
        return tipos[numeroPagos as keyof typeof tipos] || "Pago Total";
    };

    doc.addImage("/prase-logo.png", "PNG", MARGEN_X, MARGEN_Y, 30, 25);
    doc.setFontSize(12);
    doc.setTextColor(47, 84, 149);
    doc.setFont("helvetica", "bold");
    doc.text("PÓLIZA PRASE SEGUROS", MARGEN_X + 45, MARGEN_Y + 10);
    doc.setFontSize(10);
    doc.text(`POLIZA NO. ${respuestaPoliza.NumeroPoliza}`, MARGEN_X + 180, MARGEN_Y + 20, { align: "right" });

    let posicionY = MARGEN_Y + 26;

    autoTable(doc, {
        startY: posicionY,
        head: [["PÓLIZA"]],
        body: [
            [`Inicio de vigencia: ${formatearFecha(respuestaPoliza.FechaInicio)}`],
            [`Fin de vigencia: ${formatearFecha(respuestaPoliza.FechaFin)}`],
            [`${obtenerTextoPago(respuestaPoliza.NumeroPagos)}: ${formatCurrency(respuestaPoliza.PrimaTotal)}`]
        ],
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1 },
        columnStyles: {
            0: { cellWidth: ANCHO_PAGINA }
        },
        headStyles: {
            fillColor: [0, 51, 102],
            halign: 'center'
        }
    });

    posicionY = (doc as any).lastAutoTable.finalY + 6;

    doc.setTextColor(0);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const textoLegal = "PRASE Protección Rápida y Segura A.C. protege el vehículo descrito con antelación, de conformidad con las cláusulas de su constancia de inscripción durante la vigencia establecida, contra los riesgos que aparecen en esta constancia y que figuran con límite de responsabilidad máximo.";

    doc.text(textoLegal, MARGEN_X, posicionY, {
        maxWidth: ANCHO_PAGINA,
        align: "justify"
    });

    posicionY += 8;
    const mitadAncho = ANCHO_PAGINA * 0.48;

    autoTable(doc, {
        startY: posicionY,
        head: [["DATOS DE LA UNIDAD"]],
        body: [
            [`Tipo: ${tipoVehiculo}`],
            [`Uso: ${usoVehiculo}`],
            [`Marca: ${respuestaPoliza.vehiculo.Marca}`],
            [`Submarca: ${respuestaPoliza.vehiculo.Submarca}`],
            [`Modelo: ${respuestaPoliza.vehiculo.Modelo}`],
            [`Version: ${respuestaPoliza.vehiculo.Version}`],
            [`Placas: ${respuestaPoliza.vehiculo.Placas}`],
            [`Número de motor: ${respuestaPoliza.vehiculo.NoMotor}`],
            [`VIN: ${respuestaPoliza.vehiculo.VIN || "---"}`],
            [`Número de ocupantes: ${respuestaPoliza.NumOcupantes || "---"}`],
        ],
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: [0, 51, 102] },
        columnStyles: { 0: { cellWidth: mitadAncho } },
        margin: { left: MARGEN_X }
    });

    autoTable(doc, {
        startY: posicionY,
        head: [["DATOS DEL CLIENTE"]],
        body: [
            [`Nombre: ${respuestaPoliza.cliente.NombreCompleto}`],
            [`Teléfono: ${respuestaPoliza.cliente.Telefono}`],
            [`Dirección: ${respuestaPoliza.cliente.Direccion}`],
            [`RFC: ${respuestaPoliza.cliente.RFC}`],
        ],
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: [0, 51, 102] },
        columnStyles: { 0: { cellWidth: mitadAncho } },
        margin: { left: MARGEN_X + mitadAncho + 10 }
    });

    posicionY = Math.max(
        (doc as any).lastAutoTable.finalY,
        (doc as any).previousAutoTable.finalY
    ) + 36;

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const textoInspeccion = "La Mutual PRASE Protección Rápida y Segura A.C. podrá en cualquier momento inspeccionar o verificar la existencia y estado físico del vehículo adherido, a cualquier hora y día hábil y por medio de personas debidamente autorizadas por la misma; si el contratante o el asegurado impide u obstaculiza la inspección referida; la Moral se reserva el derecho de rescindir el contrato sin responsabilidad para la moral.";

    doc.text(textoInspeccion, MARGEN_X, posicionY, {
        maxWidth: ANCHO_PAGINA,
        align: "justify"
    });

    posicionY += 10;

    autoTable(doc, {
        startY: posicionY,
        body: [],
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1 },
    });

    const coberturasTabla = cotizacion.detalles.map(detalle => [
        obtenerNombreCobertura(detalle.CoberturaID),
        detalle.MontoSumaAsegurada === '0' ? 'AMPARADA' : formatCurrency(Number(detalle.MontoSumaAsegurada)),
        detalle.MontoDeducible === '0' ? 'NO APLICA' : `${detalle.MontoDeducible}%`,
    ]);

    autoTable(doc, {
        startY: posicionY,
        head: [["COBERTURA AMPLIA", "SUMA ASEGURADA", "DEDUCIBLE"]],
        body: coberturasTabla,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: [0, 51, 102] },
        columnStyles: {
            0: { cellWidth: ANCHO_PAGINA * 0.5 },
            1: { cellWidth: ANCHO_PAGINA * 0.3 },
            2: { cellWidth: ANCHO_PAGINA * 0.2 },
        }
    });

    posicionY = (doc as any).lastAutoTable.finalY + 5;

    doc.setFontSize(7);
    const textoPrivacidad = "Aviso de privacidad: para conocer sus términos y condiciones favor de leer las condiciones generales del contrato.";
    const textoArticulo = "Artículo 25 de la ley sobre el contrato del seguro: si el contrato celebrado o sus modificaciones no concordaren con la oferta, el asociado podrá pedir la rectificación correspondiente dentro de los treinta días que sigan al día en que reciba el contrato. Transcurrido ese plazo se considerarán aceptadas las estipulaciones del contrato o de sus modificaciones. En testimonio de lo cual la compañía firma el presente contrato.";

    doc.text([textoPrivacidad, textoArticulo], MARGEN_X, posicionY, {
        maxWidth: ANCHO_PAGINA,
        align: "justify"
    });

    posicionY += 10;

    const costos = [
        ["Costo Neto:", formatCurrency(respuestaPoliza.PrimaTotal / 1.16)],
        ["Gast. Exp. Contrato:", formatCurrency(Number(respuestaPoliza.cotizacion.DerechoPoliza))],
        ["Impuesto (IVA) 16%:", formatCurrency((respuestaPoliza.PrimaTotal / 1.16) * 0.16)],
        ["COSTO TOTAL ANUAL:", formatCurrency(respuestaPoliza.PrimaTotal)]
    ];

    autoTable(doc, {
        startY: posicionY,
        body: costos,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1 },
        columnStyles: {
            0: { cellWidth: ANCHO_PAGINA * 0.7, fontStyle: "bold" },
            1: { cellWidth: ANCHO_PAGINA * 0.3, halign: "right" }
        }
    });

    // if (esquemaPago) {
    //     posicionY = (doc as any).lastAutoTable.finalY + 4;

    //     const datosPagos = esquemaPago.esquemaPagos.map(pago => [
    //         `Pago ${pago.numeroPago}:`,
    //         formatCurrency(pago.montoPorPagar),
    //         formatearFecha(pago.fechaPago)
    //     ]);

    //     autoTable(doc, {
    //         startY: posicionY,
    //         head: [["ESQUEMA DE PAGOS", "MONTO", "FECHA LÍMITE"]],
    //         body: [
    //             ...datosPagos,
    //             [`Descuento por pronto pago:`, formatCurrency(esquemaPago.descuentoProntoPago), ""],
    //             ["Total a pagar:", formatCurrency(esquemaPago.totalPrima), ""]
    //         ],
    //         theme: "grid",
    //         styles: { fontSize: 8, cellPadding: 1 },
    //         headStyles: { fillColor: [0, 51, 102] },
    //         columnStyles: {
    //             0: { cellWidth: ANCHO_PAGINA * 0.5 },
    //             1: { cellWidth: ANCHO_PAGINA * 0.25, halign: "right" },
    //             2: { cellWidth: ANCHO_PAGINA * 0.25, halign: "center" }
    //         }
    //     });
    // }

    const textoLegalPie = [
        "Atención a siniestros en México 800-772-73-10",
        "Atención a clientes y cotizaciones al 800 908-90-08 consultas, modificaciones y otros trámites 311-909-10-00",
        "Avenida Independencia #361 Colonia los Llanitos, Tepic,Nayarit, C.p. 63170",
        "*Esta póliza pierde cobertura en caso de no tener al corriente sus pagos."
    ];

    textoLegalPie.forEach((texto, index) => {
        doc.setFontSize(7);
        doc.text(texto, MARGEN_X, doc.internal.pageSize.height - 25 + index * 4);
    });

    const qrDataUrl = await QRCode.toDataURL(`https://prase.vercel.app/consulta/${respuestaPoliza.NumeroPoliza}`);
    const qrX = doc.internal.pageSize.width - 40;
    const qrY = doc.internal.pageSize.height - 35;
    const qrSize = 25;

    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    doc.setFontSize(5);

    doc.text(
        "Verifica aquí vigencia y términos y condiciones",
        qrX,
        qrY + qrSize + 2,
        {
            align: "left",
            maxWidth: qrSize
        }
    );

    return doc;
};