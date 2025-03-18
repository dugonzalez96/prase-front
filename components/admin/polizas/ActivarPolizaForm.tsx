import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { StepIndicator } from "@/components/cotizador/StepIndicator";
import { ClientePolizaStep } from "./ClientePolizaStep";
import { VehiculoPolizaStep } from "./VehiculoPolizaStep";
import { ResumenPolizaStep } from "./ResumenPolizaStep";
import { DocumentosPolizaStep } from "./DocumentosPolizaStep";
import { getEsquemaPago, postDocumento, postPoliza } from "@/actions/PolizasActions";
import { patchCotizacion } from "@/actions/CotizadorActions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import type { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";
import type { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import { iPostDocumento } from "@/interfaces/CatPolizas";
import { generarPDFPoliza } from "./GenerarPDFPoliza";
import { LoaderModales } from "@/components/LoaderModales";
import { iGetTiposVehiculo, iGetUsosVehiculo } from "@/interfaces/CatVehiculosInterface";

const pasos = [
    { title: "Cliente", icon: "User" },
    { title: "Vehículo", icon: "Car" },
    { title: "Resumen", icon: "FileText" },
];

interface ActivarPolizaFormProps {
    cotizacion: iGetCotizacion;
    coberturas: iGetCoberturas[];
    tiposPago: iGetTipoPagos[];
    tiposVehiculo: iGetTiposVehiculo[];
    usosVehiculo: iGetUsosVehiculo[];
}

interface ArchivosBase64 {
    ine?: string;
    tarjetaCirculacion?: string;
    cartaFactura?: string;
    comprobanteDomicilio?: string;
    fotoFrontal?: string;
    fotoTrasera?: string;
    fotoLateralIzquierda?: string;
    fotoLateralDerecha?: string;
    fotoVIN?: string;
}

export const ActivarPolizaForm = ({
    cotizacion,
    coberturas,
    tiposPago,
    tiposVehiculo,
    usosVehiculo,
}: ActivarPolizaFormProps) => {
    const [pasoActual, setPasoActual] = useState(1);
    const [pasoMaximoAlcanzado, setPasoMaximoAlcanzado] = useState(1);
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [vehiculoId, setVehiculoId] = useState<number | null>(null);
    const [zonaResidencia, setZonaResidencia] = useState("");
    const [modalDocumentosAbierto, setModalDocumentosAbierto] = useState(false);
    const [polizaId, setPolizaId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();
    const [numOcupantes, setNumOcupantes] = useState(5);

    const router = useRouter();
    const { toast } = useToast();

    const subirDocumentos = async (archivos: ArchivosBase64) => {
        if (!polizaId) return;

        try {
            const promesas = Object.entries(archivos).map(async ([nombre, base64]) => {
                if (!base64) return;

                const documento: iPostDocumento = {
                    Base64: base64,
                    PolizaID: polizaId,
                    DocumentoID: 1,
                    EstadoDocumento: "Activo"
                };

                const respuesta = await postDocumento(documento);

                if (!respuesta || respuesta.statusCode === 413) {
                    toast({
                        title: "Error",
                        description: `Error al subir ${nombre}`,
                        variant: "destructive"
                    });
                }
            });

            await Promise.all(promesas);

            toast({
                title: "Documentos guardados",
                description: "Los documentos se han guardado exitosamente"
            });

            setModalDocumentosAbierto(false);
            router.push("/polizas/lista");
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al subir los documentos",
                variant: "destructive"
            });
        }
    };

    const manejarCierreModal = () => {
        setModalDocumentosAbierto(false);
        router.push("/polizas/lista");
        router.refresh();
    };

    const manejarSubmitCliente = (idCliente: number, zona?: string) => {
        setClienteId(idCliente);
        if (zona) setZonaResidencia(zona);
        setPasoActual(2);
        setPasoMaximoAlcanzado(2);
    };

    const manejarSubmitVehiculo = (idVehiculo: number) => {
        setVehiculoId(idVehiculo);
        setPasoActual(3);
        setPasoMaximoAlcanzado(3);
    };

    const manejarConfirmacion = async (datosResumen: {
        primaTotal: number;
        fechaInicio: Date;
        fechaFin: Date;
        descuentoProntoPago: number;
        tieneReclamos: boolean;
        tipoPagoID: number;
    }) => {
        if (!clienteId || !vehiculoId) return;
        const numeroPagos = tiposPago.find(tipo => tipo.TipoPagoID === datosResumen.tipoPagoID)?.Divisor ?? 12;

        startTransition(async () => {
            try {
                const datosPoliza = {
                    CotizacionID: cotizacion.CotizacionID,
                    TipoPagoID: datosResumen.tipoPagoID,
                    FechaInicio: datosResumen.fechaInicio.toISOString().split("T")[0],
                    FechaFin: datosResumen.fechaFin.toISOString().split("T")[0],
                    PrimaTotal: datosResumen.primaTotal,
                    TotalPagos: 0,
                    NumeroPagos: numeroPagos,
                    DescuentoProntoPago: datosResumen.descuentoProntoPago,
                    TieneReclamos: datosResumen.tieneReclamos,
                    VehiculoID: vehiculoId,
                    ClienteID: clienteId,
                    EstadoPoliza: "ACTIVA",
                    VersionActual: 1,
                    DerechoPolizaAplicado: Number(cotizacion.DerechoPoliza),
                    TotalSinIVA: cotizacion.CostoNeto,
                    NumOcupantes: 5, //TODO: Cambiar número de ocupantes por lo que venga del vehículo
                };
                // console.log("cotizacion: ", cotizacion)
                // console.log("datos resumen: ", datosResumen)
                // const respuesta = await postPoliza(datosPoliza);

                // if (respuesta) {
                //     setPolizaId(respuesta.PolizaID);

                //     await patchCotizacion(cotizacion.CotizacionID, {
                //         EstadoCotizacion: "EMITIDA",
                //     });

                //     const esquemaPago = await getEsquemaPago(respuesta.NumeroPoliza);

                //     const doc = await generarPDFPoliza({
                //         respuestaPoliza: respuesta,
                //         cotizacion,
                //         coberturas,
                //         esquemaPago,
                //         tiposVehiculo,
                //         usosVehiculo
                //     });

                //     doc.save(`poliza_${respuesta.NumeroPoliza}.pdf`);

                //     toast({
                //         title: "Póliza activada",
                //         description: "La póliza se ha activado correctamente",
                //     });

                //     setModalDocumentosAbierto(true);
                // } else {
                //     throw new Error("Error al activar póliza");
                // }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Error al activar la póliza",
                    variant: "destructive",
                });
            }
        });
    };

    if (isPending) {
        return (
            <LoaderModales texto="Activando Póliza..." />
        );
    }

    return (
        <>
            <div className="space-y-6">
                <StepIndicator
                    pasos={pasos}
                    pasoActual={pasoActual}
                    pasoMaximoAlcanzado={pasoMaximoAlcanzado}
                    alCambiarPaso={setPasoActual}
                />
                {pasoActual === 1 && (
                    <ClientePolizaStep
                        nombreInicial={cotizacion.NombrePersona}
                        telefonoInicial={cotizacion.Telefono}
                        emailInicial={cotizacion.Correo}
                        alSubmit={manejarSubmitCliente}
                    />
                )}
                {pasoActual === 2 && clienteId && (
                    <VehiculoPolizaStep
                        cotizacion={cotizacion}
                        clienteId={clienteId}
                        zona={zonaResidencia}
                        alSubmit={manejarSubmitVehiculo}
                    />
                )}
                {pasoActual === 3 && clienteId && vehiculoId && (
                    <ResumenPolizaStep
                        cotizacion={cotizacion}
                        alConfirmar={manejarConfirmacion}
                        coberturas={coberturas}
                        tiposPago={tiposPago}
                    />
                )}
                <Dialog open={modalDocumentosAbierto} onOpenChange={manejarCierreModal}>
                    <DialogContent className="max-w-4xl max-h-[600px] 2xl:max-h-[1200px] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                Subir documentos del cliente
                            </DialogTitle>
                        </DialogHeader>
                        <DocumentosPolizaStep alSubmit={subirDocumentos} />
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default ActivarPolizaForm;