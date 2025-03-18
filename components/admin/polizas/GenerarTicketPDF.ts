import { jsPDF } from "jspdf";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";
import { iPostPagoPolizaResp } from "@/interfaces/CatPolizas";

export const generarTicketPDF = async (
    respuestaPago: iPostPagoPolizaResp,
    numeroPoliza: string
) => {
    const doc = new jsPDF({
        format: [80, 200],
        unit: "mm"
    });

    const MARGEN_X = 8;
    let posicionY = 10;
    const ANCHO_TICKET = 64;

    doc.addImage("/prase-logo.png", "PNG", MARGEN_X, posicionY, 15, 13);

    posicionY += 18;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(47, 84, 149);
    doc.text("COMPROBANTE DE PAGO", doc.internal.pageSize.width / 2, posicionY, { align: "center" });

    posicionY += 8;
    doc.setTextColor(0);
    doc.setFontSize(7);
    doc.text(`Póliza No. ${numeroPoliza}`, doc.internal.pageSize.width / 2, posicionY, { align: "center" });

    posicionY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    const linea = (x: number, y: number, ancho: number) => {
        doc.setDrawColor(47, 84, 149);
        doc.line(x, y, x + ancho, y);
    };

    const agregarDetalle = (etiqueta: string, valor: string) => {
        doc.setFont("helvetica", "bold");
        doc.text(etiqueta, MARGEN_X, posicionY);
        doc.setFont("helvetica", "normal");
        const valorSplit = doc.splitTextToSize(valor, ANCHO_TICKET - 25);
        doc.text(valorSplit, MARGEN_X + 22, posicionY);
        posicionY += valorSplit.length * 4;
    };

    const detalles = [
        ["Fecha:", formatDateTimeFull(respuestaPago.FechaPago)],
        ["Monto:", formatCurrency(respuestaPago.MontoPagado)],
        ["Método:", respuestaPago.MetodoPago.NombreMetodo],
        ["Estado:", respuestaPago.EstatusPago.NombreEstatus],
        ["Atendió:", respuestaPago.Usuario.NombreUsuario],
        // ["Folio:", respuestaPago.PagoID.toString()],
    ];

    linea(MARGEN_X, posicionY, ANCHO_TICKET);
    posicionY += 3;

    detalles.forEach(([etiqueta, valor]) => {
        agregarDetalle(etiqueta, valor);
    });

    if (respuestaPago.NombreTitular) {
        agregarDetalle("Titular:", respuestaPago.NombreTitular);
    }

    if (respuestaPago.ReferenciaPago) {
        agregarDetalle("Referencia:", respuestaPago.ReferenciaPago);
    }

    posicionY += 2;
    linea(MARGEN_X, posicionY, ANCHO_TICKET);
    posicionY += 5;

    doc.setFontSize(6);
    const textoLegal = [
        "Este documento es un comprobante de pago válido.",
        "PRASE Protección Rápida y Segura A.C.",
        "Avenida Independencia #361 Colonia los Llanitos,",
        "Tepic Nayarit, C.p. 63170.",
        "Teléfono: 311-909-10-00",
        "Conserve este ticket para cualquier aclaración."
    ];

    textoLegal.forEach((texto) => {
        doc.text(texto, doc.internal.pageSize.width / 2, posicionY, { align: "center" });
        posicionY += 3;
    });

    doc.save(`ticket_pago_${numeroPoliza}_${respuestaPago.PagoID}.pdf`);
};