import { jsPDF } from "jspdf";
import { z } from "zod";
import { nuevaCotizacionSchema } from "@/schemas/cotizadorSchema";
import {
    iGetTiposVehiculo,
    iGetUsosVehiculo,
} from "@/interfaces/CatVehiculosInterface";
import { iSendMail, iPostCotizacion, iGetCotizacion } from "@/interfaces/CotizacionInterface";
import { generarPDFCotizacion } from "./GenerarPDFCotizacion";
import { postCotizacion, sendMail } from "@/actions/CotizadorActions";
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";

type FormData = z.infer<typeof nuevaCotizacionSchema>;
type DetalleBase = FormData['detalles'][0];

interface DetalleExtendido extends Pick<DetalleBase, keyof DetalleBase> {
    TipoDeducible?: string;
    TipoMoneda?: string;
}

export interface FormDataExtendida extends Omit<FormData, 'detalles'> {
    detalles: DetalleExtendido[];
}

interface OpcionesCotizacion {
    datosFormulario: FormDataExtendida;
    tiposVehiculo: iGetTiposVehiculo[];
    usosVehiculo: iGetUsosVehiculo[];
    guardarCotizacion?: boolean;
    tiposPago: iGetTipoPagos[];
    coberturas: iGetCoberturas[];
}

const obtenerPDFBase64 = (doc: jsPDF): string => {
    const pdfBase64 = doc.output("datauristring");
    return pdfBase64.split(",")[1];
};

const mapearDetallesParaAPI = (detalles: FormData['detalles']): any => {
    return detalles.map((detalle) => ({
        CoberturaID: detalle.CoberturaID,
        MontoSumaAsegurada: detalle.MontoSumaAsegurada,
        MontoDeducible: detalle.MontoDeducible,
        PrimaCalculada: detalle.PrimaCalculada,
        PorcentajePrimaAplicado: detalle.PorcentajePrimaAplicado,
        ValorAseguradoUsado: detalle.ValorAseguradoUsado,
        DeducibleID: 4,
        NombreCobertura: detalle.NombreCobertura,
        Descripcion: detalle.Descripcion,
        Obligatoria: false,
        TipoMoneda: "MXN",
        EsAmparada: false,
        SumaAseguradaPorPasajero: false,
        TipoDeducible: "", //TODO: Obtener el nombre del tipo de deducible
    }));
};

const mapearDatosParaPDF = (datosFormulario: FormDataExtendida, respuestaCotizacion: any): iGetCotizacion => {
    return {
        CotizacionID: respuestaCotizacion?.CotizacionID || 0,
        UsuarioID: datosFormulario.UsuarioID,
        FechaCotizacion: new Date(),
        PrimaTotal: datosFormulario.PrimaTotal.toString(),
        EstadoCotizacion: datosFormulario.EstadoCotizacion,
        TipoPagoID: datosFormulario.TipoPagoID,
        PorcentajeDescuento: datosFormulario.PorcentajeDescuento.toString(),
        DerechoPoliza: datosFormulario.DerechoPoliza.toString(),
        TipoSumaAseguradaID: datosFormulario.TipoSumaAseguradaID,
        SumaAsegurada: datosFormulario.SumaAsegurada.toString(),
        PeriodoGracia: datosFormulario.PeriodoGracia,
        PaqueteCoberturaID: datosFormulario.PaqueteCoberturaID,
        FechaUltimaActualizacion: null,
        UsoVehiculo: datosFormulario.UsoVehiculo,
        TipoVehiculo: datosFormulario.TipoVehiculo,
        AMIS: null,
        NombrePersona: datosFormulario.NombrePersona,
        UnidadSalvamento: Number(datosFormulario.UnidadSalvamento),
        VIN: datosFormulario.VIN,
        CP: datosFormulario.CP,
        Marca: datosFormulario.Marca,
        Submarca: datosFormulario.Submarca,
        Modelo: datosFormulario.Modelo,
        Version: datosFormulario.Version,
        Correo: datosFormulario.Correo,
        Telefono: datosFormulario.Telefono,
        Placa: null,
        NoMotor: null,
        UsuarioRegistro: null,
        detalles: datosFormulario.detalles.map(detalle => ({
            DetalleID: 0,
            PolizaID: null,
            CoberturaID: detalle.CoberturaID,
            MontoSumaAsegurada: detalle.MontoSumaAsegurada.toString(),
            MontoDeducible: detalle.MontoDeducible.toString(),
            PrimaCalculada: detalle.PrimaCalculada.toString(),
            EsPoliza: null,
            PorcentajePrimaAplicado: detalle.PorcentajePrimaAplicado.toString(),
            ValorAseguradoUsado: detalle.ValorAseguradoUsado.toString(),
            NombreCobertura: detalle.NombreCobertura,
            Descripcion: detalle.Descripcion,
            TipoDeducible: detalle.TipoDeducible,
            TipoMoneda: detalle.TipoMoneda,
            SumaAseguradaPorPasajero: detalle.SumaAseguradaPorPasajero,
            DisplaySumaAsegurada: detalle.DisplaySumaAsegurada,
        })),

        // Campos de cálculos
        CostoBase: datosFormulario.CostoBase,
        AjusteSiniestralidad: datosFormulario.AjusteSiniestralidad,
        AjusteCP: datosFormulario.AjusteCP,
        AjusteTipoPago: datosFormulario.AjusteTipoPago,
        SubtotalSiniestralidad: datosFormulario.SubtotalSiniestralidad,
        SubtotalTipoPago: datosFormulario.SubtotalTipoPago,
        CostoNeto: datosFormulario.CostoNeto,
        IVA: datosFormulario.IVA,
        CostoTotalAnual: datosFormulario?.costoTotalAnual,
        CostoTotalSemestral: datosFormulario?.costoTotalSemestral,
        CostoTotalTrimestral: datosFormulario?.costoTotalTrimestral,
    };
};

export const manejarCotizacion = async ({
    datosFormulario,
    tiposVehiculo,
    usosVehiculo,
    guardarCotizacion = false,
    tiposPago,
}: OpcionesCotizacion) => {
    try {
        let respuestaCotizacion;

        if (guardarCotizacion) {
            const cotizacionParaAPI: iPostCotizacion = {
                UsuarioID: datosFormulario.UsuarioID,
                UsuarioRegistro: datosFormulario.UsuarioID,
                EstadoCotizacion: datosFormulario.EstadoCotizacion,
                PrimaTotal: datosFormulario.PrimaTotal,
                TipoPagoID: datosFormulario.TipoPagoID,
                PorcentajeDescuento: datosFormulario.PorcentajeDescuento,
                DerechoPoliza: datosFormulario.DerechoPoliza,
                TipoSumaAseguradaID: datosFormulario.TipoSumaAseguradaID,
                SumaAsegurada: datosFormulario.SumaAsegurada.toString(),
                PeriodoGracia: datosFormulario.PeriodoGracia,
                UsoVehiculo: datosFormulario.UsoVehiculo,
                TipoVehiculo: datosFormulario.TipoVehiculo,
                meses: datosFormulario.meses,
                vigencia: datosFormulario.vigencia,
                NombrePersona: datosFormulario.NombrePersona,
                Correo: datosFormulario.Correo,
                Telefono: datosFormulario.Telefono,
                UnidadSalvamento: datosFormulario.UnidadSalvamento,
                VIN: datosFormulario.VIN,
                CP: datosFormulario.CP,
                Marca: datosFormulario.Marca,
                Submarca: datosFormulario.Submarca,
                Modelo: datosFormulario.Modelo,
                Version: datosFormulario.Version,
                inicioVigencia: datosFormulario.inicioVigencia,
                finVigencia: new Date(datosFormulario.finVigencia),
                detalles: mapearDetallesParaAPI(datosFormulario.detalles),
                versionNombre: datosFormulario.versionNombre,
                marcaNombre: datosFormulario.marcaNombre,
                modeloNombre: datosFormulario.modeloNombre,
                Estado: datosFormulario.Estado,
                minSumaAsegurada: datosFormulario.minSumaAsegurada.toString(),
                maxSumaAsegurada: datosFormulario.maxSumaAsegurada.toString(),
                PaqueteCoberturaID: datosFormulario.PaqueteCoberturaID,
                Placa: datosFormulario.Placa,
                NoMotor: datosFormulario.NoMotor,
                CostoBase: datosFormulario.CostoBase,
                AjusteSiniestralidad: datosFormulario.AjusteSiniestralidad,
                AjusteCP: datosFormulario.AjusteCP,
                AjusteTipoPago: datosFormulario.AjusteTipoPago,
                SubtotalSiniestralidad: datosFormulario.SubtotalSiniestralidad,
                SubtotalTipoPago: datosFormulario.SubtotalTipoPago,
                CostoNeto: datosFormulario.CostoNeto,
                IVA: datosFormulario.IVA,
            };

            respuestaCotizacion = await postCotizacion(cotizacionParaAPI);
        }

        const datosPDF = mapearDatosParaPDF(datosFormulario, respuestaCotizacion);
        // console.log("datospdf:  ", datosPDF)
        const doc = await generarPDFCotizacion({
            datos: datosPDF,
            tiposVehiculo,
            usosVehiculo,
            tiposPago,
            isSave: guardarCotizacion,
            showMensual: datosFormulario.showMensual,
        });

        if (datosFormulario.Correo) {
            const pdfBase64 = obtenerPDFBase64(doc);
            const datosCorreo: iSendMail = {
                to: datosFormulario.Correo,
                subject: "Cotización PRASE Seguros",
                attachmentBase64: pdfBase64,
                filename: `cotizacion_${datosFormulario.Marca}_${datosFormulario.Submarca}.pdf`,
            };

            await sendMail(datosCorreo);
        }

        return {
            success: true,
            cotizacion: respuestaCotizacion,
            correoEnviado: !!datosFormulario.Correo,
        };
    } catch (error) {
        console.error("Error en el proceso:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido",
        };
    }
};