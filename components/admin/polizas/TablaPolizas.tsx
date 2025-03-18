"use client"

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ChevronDown, ChevronUp, AlertCircle, DollarSign, FileText } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { iGetEsquemaPago, iGetMetodosPago, iGetStatusPago, iPostPagoPoliza, iPostPolizaResp, type iGetPolizas, type iPatchPoliza } from "@/interfaces/CatPolizas";
import type { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";
import { useToast } from "@/hooks/use-toast";
import { deletePoliza, getEsquemaPago, patchPoliza, postPagoPoliza } from "@/actions/PolizasActions";
import { EditarPolizaForm } from "./EditarPolizaForm";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatDateFullTz } from "@/lib/format-date";
import { DocumentosPoliza } from "./DocumentosPoliza";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { GestionPagosPoliza } from "./GestionPagosPoliza";
import { generarTicketPDF } from "./GenerarTicketPDF";
import { FiltrosPolizas, FiltrosPolizasState } from "./FiltrosPolizas";
import { generarPDFPoliza } from "./GenerarPDFPoliza";
import { getCotizacionById } from "@/actions/CotizadorActions";
import { iGetCliente } from "@/interfaces/ClientesInterface";
import { LoaderModales } from "@/components/LoaderModales";
import React from "react";

interface TablaPolizasProps {
    polizas: iGetPolizas[];
    coberturas: iGetCoberturas[];
    statusPago: iGetStatusPago[];
    metodosPago: iGetMetodosPago[];
    clientes: iGetCliente[];
}

export const TablaPolizas = ({ polizas, coberturas, statusPago, metodosPago, clientes }: TablaPolizasProps) => {
    const [isPending, startTransition] = useTransition();
    const [polizaExpandida, setPolizaExpandida] = useState<number | null>(null);
    const [detalleVisible, setDetalleVisible] = useState<"historial" | "coberturas" | null>(null);
    const [polizaParaEditar, setPolizaParaEditar] = useState<iGetPolizas | null>(null);
    const [polizaParaEliminar, setPolizaParaEliminar] = useState<iGetPolizas | null>(null);
    const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
    const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false);
    const [motivoCancelacion, setMotivoCancelacion] = useState("");
    const [errorMotivo, setErrorMotivo] = useState(false);
    const [modalPagosAbierto, setModalPagosAbierto] = useState(false);
    const [polizaSeleccionada, setPolizaSeleccionada] = useState<iGetPolizas | null>(null);
    const [esquemaPago, setEsquemaPago] = useState<iGetEsquemaPago | null | undefined>(null);
    const [filtros, setFiltros] = useState<FiltrosPolizasState>({
        textoBusqueda: "",
        estado: null
    });

    const { toast } = useToast();
    const router = useRouter();
    const user = useCurrentUser();

    const polizasFiltradas = useMemo(() => {
        return polizas.filter(poliza => {
            const cumpleBusqueda = !filtros.textoBusqueda ||
                poliza.NumeroPoliza.toLowerCase().includes(filtros.textoBusqueda.toLowerCase());

            const cumpleEstado = !filtros.estado || poliza.EstadoPoliza === filtros.estado;

            return cumpleBusqueda && cumpleEstado;
        });
    }, [polizas, filtros]);

    const obtenerColorEstado = (estado: string): "pendiente" | "success" | "default" | "destructive" | "secondary" | "outline" | null | undefined => {
        const colores = {
            "ACTIVA": "success",
            "PERIODO DE GRACIA": "default",
            "PENDIENTE": "pendiente",
            "CANCELADA": "destructive",
            "VENCIDA": "secondary",
        } as const;

        return colores[estado as keyof typeof colores] || "default";
    };

    const obtenerNombreCobertura = (coberturaId: number): string => {
        const cobertura = coberturas.find(c => c.CoberturaID === coberturaId);
        return cobertura?.NombreCobertura || `Cobertura ${coberturaId}`;
    };

    const manejarEliminar = async () => {
        if (!polizaParaEliminar) return;
        if (!motivoCancelacion.trim()) {
            setErrorMotivo(true);
            return;
        }

        try {
            const respuesta = await deletePoliza(polizaParaEliminar.PolizaID, {
                motivo: motivoCancelacion.trim()
            });

            if (respuesta === 200) {
                toast({
                    title: "Póliza eliminada",
                    description: "La póliza se canceló correctamente.",
                });
                router.refresh();
            } else {
                throw new Error("Error al cancelar la póliza");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo cancelar la póliza.",
                variant: "destructive",
            });
        } finally {
            setPolizaParaEliminar(null);
            setDialogoEliminarAbierto(false);
            setMotivoCancelacion("");
            setErrorMotivo(false);
        }
    };

    const manejarGuardarEdicion = async (datos: iPatchPoliza) => {
        if (!polizaParaEditar) return;

        startTransition(async () => {
            try {
                const respuesta = await patchPoliza(polizaParaEditar.PolizaID, datos);

                if (respuesta.statusCode !== 400) {
                    toast({
                        title: "Póliza actualizada",
                        description: "Los cambios se guardaron correctamente.",
                    });
                    router.refresh();
                } else {
                    toast({
                        title: "Error",
                        description: respuesta.message,
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "No se pudieron guardar los cambios.",
                    variant: "destructive",
                });
            } finally {
                setPolizaParaEditar(null);
                setModalEdicionAbierto(false);
            }
        })

    };

    const MensajeVacio = ({ mensaje }: { mensaje: string }) => (
        <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{mensaje}</AlertDescription>
        </Alert>
    );

    const abrirModalPagos = async (poliza: iGetPolizas) => {
        try {
            const esquema = await getEsquemaPago(poliza.NumeroPoliza);
            if (esquema) {
                setEsquemaPago(esquema);
                setPolizaSeleccionada(poliza);
                setModalPagosAbierto(true);
            } else {
                throw new Error("No se pudo obtener el esquema de pagos");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo obtener el esquema de pagos",
                variant: "destructive",
            });
        }
    };

    const registrarPago = async (datos: iPostPagoPoliza) => {
        try {
            const resp = await postPagoPoliza(datos);

            if (resp.statusCode !== 400) {
                await generarTicketPDF(resp, polizaSeleccionada?.NumeroPoliza || '');

                if (polizaSeleccionada) {
                    const nuevoEsquema = await getEsquemaPago(polizaSeleccionada.NumeroPoliza);
                    setEsquemaPago(nuevoEsquema);
                }

                toast({
                    title: "Éxito",
                    description: "Pago registrado correctamente",
                });
            } else {
                toast({
                    title: "Error",
                    description: resp.message,
                    variant: "destructive",
                });
            }
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al registrar el pago",
                variant: "destructive",
            });
        }
    };

    const manejarDescargaPolizaPDF = async (poliza: iGetPolizas) => {
        // try {
        //     const [esquemaPago, cotizacionCompleta] = await Promise.all([
        //         getEsquemaPago(poliza.NumeroPoliza),
        //         getCotizacionById(poliza.cotizacion.CotizacionID)
        //     ]);

        //     if (!cotizacionCompleta) {
        //         throw new Error("No se pudo obtener la información completa de la cotización");
        //     }

        //     const cotizacionMapeada = {
        //         ...cotizacionCompleta,
        //         FechaUltimaActualizacion: null,
        //         FechaCotizacion: new Date(cotizacionCompleta.FechaCotizacion)
        //     };

        //     const datosPoliza: iPostPolizaResp = {
        //         PolizaID: poliza.PolizaID,
        //         NumeroPoliza: poliza.NumeroPoliza,
        //         FechaInicio: poliza.FechaInicio,
        //         FechaFin: poliza.FechaFin,
        //         PrimaTotal: Number(poliza.PrimaTotal),
        //         TotalPagos: Number(poliza.TotalPagos),
        //         NumeroPagos: poliza.NumeroPagos,
        //         DescuentoProntoPago: Number(poliza.DescuentoProntoPago),
        //         VersionActual: Number(poliza.VersionActual),
        //         TieneReclamos: poliza.TieneReclamos,
        //         DerechoPolizaAplicado: poliza.DerechoPolizaAplicado,
        //         EstadoPoliza: poliza.EstadoPoliza,
        //         cliente: {
        //             NombreCompleto: cotizacionCompleta.NombrePersona,
        //             Telefono: cotizacionCompleta.Telefono || '',
        //             RFC: '',
        //             Direccion: '',
        //             Email: cotizacionCompleta.Correo || ''
        //         },
        //         vehiculo: {
        //             Marca: cotizacionCompleta.Marca,
        //             Modelo: cotizacionCompleta.Submarca,
        //             AnoFabricacion: cotizacionCompleta.Modelo,
        //             Placas: cotizacionCompleta.Placa || '',
        //             NoMotor: cotizacionCompleta.NoMotor || '',
        //             VIN: cotizacionCompleta.VIN || ''
        //         },
        //         tipoPago: {
        //             TipoPagoID: cotizacionCompleta.TipoPagoID,
        //             Divisor: poliza.NumeroPagos,
        //             PorcentajeAjuste: "0"
        //         },
        //         cotizacion: cotizacionMapeada,
        //         historial: poliza.historial,
        //         detalles: poliza.detalles,
        //         FechayHora: new Date().toISOString(),
        //         FechaEmision: new Date().toISOString()
        //     };

        //     const doc = await generarPDFPoliza({
        //         respuestaPoliza: datosPoliza,
        //         cotizacion: cotizacionCompleta,
        //         coberturas,
        //         esquemaPago
        //     });

        //     doc.save(`poliza_${poliza.NumeroPoliza}.pdf`);

        //     toast({
        //         title: "PDF generado",
        //         description: "La póliza se ha descargado correctamente"
        //     });
        // } catch (error) {
        //     console.error('Error al generar PDF:', error);
        //     toast({
        //         title: "Error",
        //         description: "Hubo un problema al generar el PDF",
        //         variant: "destructive"
        //     });
        // }
    };

    return (
        <div className="space-y-4">
            <FiltrosPolizas onFiltrar={setFiltros} />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Número de Póliza</TableHead>
                        <TableHead>Vigencia</TableHead>
                        <TableHead>Prima Total</TableHead>
                        <TableHead>Documentos</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Pagos</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {polizasFiltradas.map((poliza, index) => (
                        <React.Fragment key={poliza.PolizaID}>
                            <TableRow
                                key={index}
                                className={cn(
                                    "cursor-pointer transition-colors",
                                    polizaExpandida === poliza.PolizaID && "bg-muted"
                                )}
                                onClick={() => setPolizaExpandida(
                                    polizaExpandida === poliza.PolizaID ? null : poliza.PolizaID
                                )}
                            >
                                <TableCell className="font-medium">
                                    {poliza.NumeroPoliza}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <p>Del: {formatDateFullTz(poliza.FechaInicio)}</p>
                                        <p>Al: {formatDateFullTz(poliza.FechaFin)}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(Number(poliza.PrimaTotal))}
                                </TableCell>
                                <TableCell>
                                    <DocumentosPoliza
                                        polizaId={poliza.PolizaID}
                                        tieneDocumentos={poliza.tieneDocumentos || false}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Badge variant={obtenerColorEstado(poliza.EstadoPoliza)}>
                                        {poliza.EstadoPoliza}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <p>Total: {poliza.TotalPagos}</p>
                                        <p>Número de pagos: {poliza.NumeroPagos}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    {polizaExpandida === poliza.PolizaID ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Ver detalles</TooltipContent>
                                        </Tooltip>
                                        {poliza.EstadoPoliza !== 'CANCELADA' && (
                                            <>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                abrirModalPagos(poliza);
                                                            }}
                                                        >
                                                            <DollarSign className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Gestionar Pagos</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPolizaParaEditar(poliza);
                                                                setModalEdicionAbierto(true);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Editar</TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <FileText
                                                            size={16}
                                                            className="text-gray-600 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                manejarDescargaPolizaPDF(poliza)
                                                            }}
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent>Descargar Póliza PDF</TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPolizaParaEliminar(poliza);
                                                                setDialogoEliminarAbierto(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Eliminar</TooltipContent>
                                                </Tooltip>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>

                            {polizaExpandida === poliza.PolizaID && (
                                <TableRow>
                                    <TableCell colSpan={6} className="p-0">
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="p-4"
                                        >
                                            <div className="flex gap-4 mb-4">
                                                <Button
                                                    variant={detalleVisible === "historial" ? "default" : "outline"}
                                                    onClick={() => setDetalleVisible(
                                                        detalleVisible === "historial" ? null : "historial"
                                                    )}
                                                >
                                                    Ver Historial
                                                </Button>
                                                <Button
                                                    variant={detalleVisible === "coberturas" ? "default" : "outline"}
                                                    onClick={() => setDetalleVisible(
                                                        detalleVisible === "coberturas" ? null : "coberturas"
                                                    )}
                                                >
                                                    Ver Coberturas
                                                </Button>
                                            </div>

                                            {detalleVisible === "historial" && (
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Historial de la Póliza</CardTitle>
                                                        <CardDescription>
                                                            Versiones y cambios de la póliza
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {poliza.historial.length > 0 ? (
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Versión</TableHead>
                                                                        <TableHead>Estado</TableHead>
                                                                        <TableHead>Fecha Versión</TableHead>
                                                                        <TableHead>Pagos</TableHead>
                                                                        <TableHead>Monto por Pago</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {poliza.historial.map((version, index) => (
                                                                        <TableRow key={index}>
                                                                            <TableCell>{version.Version}</TableCell>
                                                                            <TableCell>
                                                                                <Badge variant={obtenerColorEstado(version.EstadoPoliza)}>
                                                                                    {version.EstadoPoliza}
                                                                                </Badge>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {formatDateFullTz(version.FechaVersion || new Date())}
                                                                            </TableCell>
                                                                            <TableCell>{version.NumeroPagos}</TableCell>
                                                                            <TableCell>
                                                                                {formatCurrency(Number(version.MontoPorPago))}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        ) : (
                                                            <MensajeVacio mensaje="No hay registros en el historial de esta póliza" />
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {detalleVisible === "coberturas" && (
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Coberturas de la Póliza</CardTitle>
                                                        <CardDescription>
                                                            Detalles de las coberturas incluidas
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {poliza.detalles.length > 0 ? (
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Cobertura</TableHead>
                                                                        <TableHead>Suma Asegurada</TableHead>
                                                                        <TableHead>Deducible</TableHead>
                                                                        <TableHead>Prima</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {poliza.detalles.map((detalle, index) => (
                                                                        <TableRow key={index}>
                                                                            <TableCell>
                                                                                {obtenerNombreCobertura(detalle.CoberturaID)}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {formatCurrency(Number(detalle.MontoSumaAsegurada))}
                                                                            </TableCell>
                                                                            <TableCell>{detalle.MontoDeducible}%</TableCell>
                                                                            <TableCell>
                                                                                {formatCurrency(Number(detalle.PrimaCalculada))}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        ) : (
                                                            <MensajeVacio mensaje="No hay coberturas registradas para esta póliza" />
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </motion.div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={modalEdicionAbierto} onOpenChange={setModalEdicionAbierto}>
                <DialogContent className="max-w-2xl">
                    {isPending ? (
                        <LoaderModales texto="Actualizando Póliza" />
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle>Editar Póliza</DialogTitle>
                            </DialogHeader>
                            {polizaParaEditar && (
                                <EditarPolizaForm
                                    poliza={polizaParaEditar}
                                    onGuardar={manejarGuardarEdicion}
                                    clientes={clientes}
                                />
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={dialogoEliminarAbierto} onOpenChange={(isOpen) => {
                setDialogoEliminarAbierto(isOpen);
                if (!isOpen) {
                    setMotivoCancelacion("");
                    setErrorMotivo(false);
                }
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la póliza
                            {polizaParaEliminar && (
                                <span className="font-semibold"> {polizaParaEliminar.NumeroPoliza}</span>
                            )} y todos sus registros asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="motivo">
                                Motivo de cancelación <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="motivo"
                                value={motivoCancelacion}
                                onChange={(e) => {
                                    setMotivoCancelacion(e.target.value);
                                    setErrorMotivo(false);
                                }}
                                placeholder="Ingresa el motivo de la cancelación"
                                className={cn(
                                    errorMotivo && "border-destructive focus-visible:ring-destructive"
                                )}
                            />
                            {errorMotivo && (
                                <span className="text-sm text-destructive">
                                    El motivo de cancelación es requerido
                                </span>
                            )}
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setPolizaParaEliminar(null);
                                setMotivoCancelacion("");
                                setErrorMotivo(false);
                            }}
                        >
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={motivoCancelacion.length <= 3}
                            onClick={manejarEliminar}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {polizaSeleccionada && esquemaPago && (
                <GestionPagosPoliza
                    abierto={modalPagosAbierto}
                    alCerrar={() => {
                        setModalPagosAbierto(false);
                        setPolizaSeleccionada(null);
                        setEsquemaPago(null);
                    }}
                    esquemaPago={esquemaPago}
                    poliza={polizaSeleccionada}
                    usuarioId={user?.usuario.UsuarioID ?? 0}
                    onRegistrarPago={registrarPago}
                    statusPago={statusPago}
                    metodosPago={metodosPago}
                />
            )}
        </div>
    );
};

export default TablaPolizas;