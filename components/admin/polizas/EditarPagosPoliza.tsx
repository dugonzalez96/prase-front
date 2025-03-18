"use client";

import { useState, useEffect } from 'react';
import { SyncLoader } from 'react-spinners';
import { AlertCircle, Edit2, Save, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { formatDateFullTz } from "@/lib/format-date";
import {
    getPagosByIdPoliza,
    patchPagoPoliza,
    deletePagoPoliza
} from "@/actions/PolizasActions";
import type {
    iGetPagosPoliza,
    iGetStatusPago,
    iGetMetodosPago,
    iPatchPagoPoliza
} from "@/interfaces/CatPolizas";
import { getUsuarios } from '@/actions/SeguridadActions';
import { iGetUsers } from '@/interfaces/SeguridadInterface';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PropiedadesEditarPagos {
    polizaId: number;
    statusPago: iGetStatusPago[];
    metodosPago: iGetMetodosPago[];
    usuarioId: number;
}

interface CambiosPendientes {
    [key: number]: {
        MontoPagado?: number;
        IDMetodoPago?: number;
        IDEstatusPago?: number;
        NombreTitular?: string;
        Referencia?: string;
    };
}

export const EditarPagosPoliza = ({
    polizaId,
    statusPago,
    metodosPago,
}: PropiedadesEditarPagos) => {
    const [pagos, setPagos] = useState<iGetPagosPoliza[]>([]);
    const [usuarios, setUsuarios] = useState<iGetUsers[]>([]);
    const [cargando, setCargando] = useState(true);
    const [pagoEditando, setPagoEditando] = useState<number | null>(null);
    const [cambiosPendientes, setCambiosPendientes] = useState<CambiosPendientes>({});
    const [dialogoEliminar, setDialogoEliminar] = useState<number | null>(null);
    const [motivoCancelacion, setMotivoCancelacion] = useState("");
    const [usuarioAutorizador, setUsuarioAutorizador] = useState<string>("");
    const [errorMotivo, setErrorMotivo] = useState(false);
    const [errorUsuario, setErrorUsuario] = useState(false);
    const { toast } = useToast();

    const requiereDatosAdicionales = (metodoPagoId: number): boolean => {
        const metodo = metodosPago.find(m => m.IDMetodoPago === metodoPagoId);
        return !metodo?.NombreMetodo.toUpperCase().includes('EFECTIVO');
    };

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [datosUsuarios, datosPagos] = await Promise.all([
                    getUsuarios(),
                    getPagosByIdPoliza(polizaId)
                ]);

                if (datosUsuarios) setUsuarios(datosUsuarios);
                if (datosPagos) setPagos(datosPagos);
            } catch (error) {
                console.error("Error al cargar datos:", error);
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los datos",
                    variant: "destructive",
                });
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [polizaId, toast]);

    if (cargando) {
        return (
            <div className="w-full h-[300px] flex justify-center items-center">
                <SyncLoader size={8} color="#9ca3af" />
            </div>
        );
    }

    const validarEliminar = () => {
        let esValido = true;

        if (!motivoCancelacion.trim()) {
            setErrorMotivo(true);
            esValido = false;
        }

        if (!usuarioAutorizador) {
            setErrorUsuario(true);
            esValido = false;
        }

        return esValido;
    };

    const eliminarPago = async () => {
        if (!dialogoEliminar) return;
        if (!validarEliminar()) return;

        try {
            await deletePagoPoliza(dialogoEliminar, {
                usuarioidPoliza: parseInt(usuarioAutorizador),
                motivoCancelacion: motivoCancelacion.trim()
            });
            toast({
                title: "Pago eliminado",
                description: "El pago se eliminó correctamente",
            });

            const nuevosPagos = await getPagosByIdPoliza(polizaId);
            if (nuevosPagos) setPagos(nuevosPagos);

            setDialogoEliminar(null);
            setMotivoCancelacion("");
            setUsuarioAutorizador("");
            setErrorMotivo(false);
            setErrorUsuario(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al eliminar el pago",
                variant: "destructive",
            });
        }
    };

    const guardarCambios = async (pagoId: number) => {
        const cambios = cambiosPendientes[pagoId];
        if (!cambios) return;

        const datosPatch: iPatchPagoPoliza = {
            MontoPagado: cambios.MontoPagado,
            IDMetodoPago: cambios.IDMetodoPago,
            IDEstatusPago: cambios.IDEstatusPago,
            NombreTitular: cambios.NombreTitular,
            ReferenciaPago: cambios.Referencia,
        };

        try {
            await patchPagoPoliza(pagoId, datosPatch);
            toast({
                title: "Cambios guardados",
                description: "Los cambios se guardaron correctamente",
            });

            const nuevosPagos = await getPagosByIdPoliza(polizaId);
            if (nuevosPagos) setPagos(nuevosPagos);

            setPagoEditando(null);
            setCambiosPendientes(prev => {
                const nuevoCambios = { ...prev };
                delete nuevoCambios[pagoId];
                return nuevoCambios;
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al guardar los cambios",
                variant: "destructive",
            });
        }
    };

    return (
        <>
            <AlertDialog
                open={!!dialogoEliminar}
                onOpenChange={(isOpen) => {
                    setDialogoEliminar(isOpen ? dialogoEliminar : null);
                    if (!isOpen) {
                        setMotivoCancelacion("");
                        setUsuarioAutorizador("");
                        setErrorMotivo(false);
                        setErrorUsuario(false);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar pago?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer
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
                        <div className="space-y-2">
                            <Label htmlFor="usuario">
                                Usuario autorizador <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={usuarioAutorizador}
                                onValueChange={(valor) => {
                                    setUsuarioAutorizador(valor);
                                    setErrorUsuario(false);
                                }}
                            >
                                <SelectTrigger className={cn(
                                    errorUsuario && "border-destructive focus-visible:ring-destructive"
                                )}>
                                    <SelectValue placeholder="Selecciona un usuario" />
                                </SelectTrigger>
                                <SelectContent>
                                    {usuarios.map((usuario) => (
                                        <SelectItem
                                            key={usuario.UsuarioID}
                                            value={usuario.UsuarioID.toString()}
                                        >
                                            {usuario.NombreUsuario}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errorUsuario && (
                                <span className="text-sm text-destructive">
                                    Debes seleccionar un usuario autorizador
                                </span>
                            )}
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            variant='destructive'
                            onClick={eliminarPago}
                            disabled={usuarioAutorizador === ""}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="space-y-4">
                {pagos && pagos.length > 0 ? (
                    <div className="grid gap-4">
                        {pagos.map((pago) => {
                            const esEditable = pagoEditando === pago.PagoID;
                            const cambiosPago = cambiosPendientes[pago.PagoID] || {};
                            const metodoPagoActual = cambiosPago.IDMetodoPago || pago.MetodoPago.IDMetodoPago;
                            const mostrarDatosAdicionales = requiereDatosAdicionales(metodoPagoActual);

                            return (
                                <Card key={pago.PagoID}>
                                    <CardContent className="pt-6">
                                        <div className="grid gap-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Fecha de pago</p>
                                                    <p className="font-medium">{formatDateFullTz(pago.FechaPago)}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {esEditable ? (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => guardarCambios(pago.PagoID)}
                                                            >
                                                                <Save className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setPagoEditando(null);
                                                                    setCambiosPendientes(prev => {
                                                                        const nuevoCambios = { ...prev };
                                                                        delete nuevoCambios[pago.PagoID];
                                                                        return nuevoCambios;
                                                                    });
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {pago.EstatusPago.IDEstatusPago !== 1 &&
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setPagoEditando(pago.PagoID)}
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                            {pago.EstatusPago.IDEstatusPago === 3 &&
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setDialogoEliminar(pago.PagoID)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            }
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Monto</Label>
                                                    {esEditable ? (
                                                        <Input
                                                            type="text"
                                                            value={formatCurrency(cambiosPendientes[pago.PagoID]?.MontoPagado ?? Number(pago.MontoPagado))}
                                                            onChange={(e) => {
                                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                                setCambiosPendientes(prev => ({
                                                                    ...prev,
                                                                    [pago.PagoID]: {
                                                                        ...prev[pago.PagoID],
                                                                        MontoPagado: valor === "" ? 0 : Number(valor) / 100
                                                                    }
                                                                }));
                                                            }}
                                                        />
                                                    ) : (
                                                        <p className="font-medium">{formatCurrency(Number(pago.MontoPagado))}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label>Método de pago</Label>
                                                    {esEditable ? (
                                                        <Select
                                                            value={String(cambiosPendientes[pago.PagoID]?.IDMetodoPago || pago.MetodoPago.IDMetodoPago)}
                                                            onValueChange={(valor) => {
                                                                setCambiosPendientes(prev => ({
                                                                    ...prev,
                                                                    [pago.PagoID]: {
                                                                        ...prev[pago.PagoID],
                                                                        IDMetodoPago: Number(valor)
                                                                    }
                                                                }));
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {metodosPago.map((metodo) => (
                                                                    <SelectItem
                                                                        key={metodo.IDMetodoPago}
                                                                        value={String(metodo.IDMetodoPago)}
                                                                    >
                                                                        {metodo.NombreMetodo}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <p className="font-medium">{pago.MetodoPago.NombreMetodo}</p>
                                                    )}
                                                </div>

                                                {mostrarDatosAdicionales && (
                                                    <>
                                                        <div>
                                                            <Label>Titular</Label>
                                                            {esEditable ? (
                                                                <Input
                                                                    value={cambiosPago.NombreTitular ?? pago.NombreTitular ?? ''}
                                                                    onChange={(e) => {
                                                                        setCambiosPendientes(prev => ({
                                                                            ...prev,
                                                                            [pago.PagoID]: {
                                                                                ...prev[pago.PagoID],
                                                                                NombreTitular: e.target.value
                                                                            }
                                                                        }));
                                                                    }}
                                                                    placeholder="Nombre del titular"
                                                                />
                                                            ) : (
                                                                <p className="font-medium">{pago.NombreTitular || '-'}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <Label>Referencia</Label>
                                                            {esEditable ? (
                                                                <Input
                                                                    value={cambiosPago.Referencia ?? pago.ReferenciaPago ?? ''}
                                                                    onChange={(e) => {
                                                                        setCambiosPendientes(prev => ({
                                                                            ...prev,
                                                                            [pago.PagoID]: {
                                                                                ...prev[pago.PagoID],
                                                                                Referencia: e.target.value
                                                                            }
                                                                        }));
                                                                    }}
                                                                    placeholder="Referencia"
                                                                />
                                                            ) : (
                                                                <p className="font-medium">{pago.ReferenciaPago || '-'}</p>
                                                            )}
                                                        </div>
                                                    </>
                                                )}

                                                <div>
                                                    <Label>Estado</Label>
                                                    {esEditable ? (
                                                        <Select
                                                            value={String(cambiosPendientes[pago.PagoID]?.IDEstatusPago || pago.EstatusPago.IDEstatusPago)}
                                                            onValueChange={(valor) => {
                                                                setCambiosPendientes(prev => ({
                                                                    ...prev,
                                                                    [pago.PagoID]: {
                                                                        ...prev[pago.PagoID],
                                                                        IDEstatusPago: Number(valor)
                                                                    }
                                                                }));
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {statusPago.map((status) => (
                                                                    <SelectItem
                                                                        key={status.IDEstatusPago}
                                                                        value={String(status.IDEstatusPago)}
                                                                    >
                                                                        {status.NombreEstatus}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <div>
                                                            {pago.EstatusPago.NombreEstatus}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No hay pagos registrados para esta póliza
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </>
    );
};