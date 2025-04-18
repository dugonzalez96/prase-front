"use client"

import { generarCorteDelDiaByID, getCorteDelDiaByID, postCorteDelDia } from "@/actions/CorteDelDiaActions";
import { getInicioActivo, getIniciosCaja, postInicioCaja } from "@/actions/MovimientosActions";
import { MovimientoItem } from "@/components/admin/movimientos/MovimientoItem";
import { LoaderModales } from "@/components/LoaderModales";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { IPostCorteDelDia } from "@/interfaces/CorteDelDiaInterface";
import { iGetCorteCajaUsuario } from "@/interfaces/CortesCajaInterface";
import { iGetInicioActivo, iPostInicioCaja } from "@/interfaces/MovimientosInterface";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";
import { zodResolver } from "@hookform/resolvers/zod";
import { isSameDay, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownCircle, ArrowDownLeft, ArrowUpCircle, ArrowUpRight, Banknote, CalendarClock, CreditCard, DollarSign, Eye, Info, SaveIcon, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
interface Usuario {
    UsuarioID: number;
    NombreUsuario: string;
    Contrasena: string;
    EmpleadoID: number | null;
    SucursalID: number | null;
    grupo: number;
}

interface Props {
    usuarios: {
        usuarios: Usuario[];
    }
    onClose: () => void
}

// Definir el esquema de validación con Zod
const CorteDelDiaSchema = z.object({
    TotalIngresos: z.number(),
    TotalIngresosEfectivo: z.number(),
    TotalIngresosTarjeta: z.number(),
    TotalIngresosTransferencia: z.number(),
    TotalEgresos: z.number(),
    TotalEgresosEfectivo: z.number(),
    TotalEgresosTarjeta: z.number(),
    TotalEgresosTransferencia: z.number(),
    TotalEfectivo: z.number(),
    TotalPagoConTarjeta: z.number(),
    TotalTransferencia: z.number(),
    SaldoEsperado: z.number(),
    SaldoReal: z.number(),
    TotalEfectivoCapturado: z.number(),
    TotalTarjetaCapturado: z.number(),
    TotalTransferenciaCapturado: z.number(),
    Diferencia: z.number(),
    Observaciones: z.string(),
    Estatus: z.string(),
});

const NuevoInicioCajaSchema = z.object({
    TotalEfectivo: z.number().min(0, { message: "El total de efectivo es requerido" }),
    TotalTransferencia: z.number().min(0, { message: "El total de transferencia es requerido" }),
});

// Componente CustomValue
const CustomValue: React.FC<{ label: string; value: string; className?: string, type?: String }> = ({ label, value, className, type = "number" }) => {
    const { getValues } = useFormContext();
    const isTotal = label === "Total";
    return (
        <div className={`p-2 ${isTotal ? 'bg-muted/30 border border-border/50' : 'bg-muted/50'} rounded-lg`}>
            <FormLabel className={`${isTotal ? 'font-bold' : 'font-semibold'}`}>{label}</FormLabel>
            {type === "number" ? (
                value == "Diferencia" ? (
                    <p className={`${isTotal ? 'font-bold' : className}`}>{formatCurrency(Math.abs(getValues(value)))}</p>
                ) : (
                    <p className={`${isTotal ? 'font-bold' : className}`}>{formatCurrency(getValues(value))}</p>
                )
            ) : (
                <p className={`${isTotal ? 'font-bold' : className}`}>{getValues(value)}</p>
            )}
        </div>
    );
};

export const NuevoCorteDelDiaForm = ({ usuarios, onClose }: Props) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1)
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [selectedUserName, setSelectedUserName] = useState<string>("");

    const [inicioCajaActivo, setInicioCajaActivo] = useState<iGetInicioActivo | null>(null);
    const [corteUsuario, setCorteUsuario] = useState<iGetCorteCajaUsuario | null>(null);
    const [btnTerminarDisabled, setBtnTerminarDisabled] = useState(true)

    const [ingresos, setIngresos] = useState<any[]>([]);
    const [egresos, setEgresos] = useState<any[]>([]);
    const [pagosPoliza, setPagosPoliza] = useState<any[]>([]);

    const [showMovementsModal, setShowMovementsModal] = useState(false);

    const form = useForm<z.infer<typeof CorteDelDiaSchema>>({
        resolver: zodResolver(CorteDelDiaSchema),
        defaultValues: {
            TotalIngresos: 0,
            TotalIngresosEfectivo: 0,
            TotalIngresosTarjeta: 0,
            TotalIngresosTransferencia: 0,
            TotalEgresos: 0,
            TotalEgresosEfectivo: 0,
            TotalEgresosTarjeta: 0,
            TotalEgresosTransferencia: 0,
            TotalEfectivo: 0,
            TotalPagoConTarjeta: 0,
            TotalTransferencia: 0,
            SaldoEsperado: 0,
            SaldoReal: 0,
            TotalEfectivoCapturado: 0,
            TotalTarjetaCapturado: 0,
            TotalTransferenciaCapturado: 0,
            Diferencia: 0,
            Observaciones: "",
            Estatus: ""
        },
    });

    const nuevoInicioCajaForm = useForm<z.infer<typeof NuevoInicioCajaSchema>>({
        resolver: zodResolver(NuevoInicioCajaSchema),
        defaultValues: {
            TotalEfectivo: 0,
            TotalTransferencia: 0,
        },
    });

    const totalEfectivo = nuevoInicioCajaForm.watch("TotalEfectivo");
    const totalTransferencia = nuevoInicioCajaForm.watch("TotalTransferencia");
    const montoInicial = totalEfectivo + totalTransferencia;

    function obtenerNombreUsuario(usuarios: Usuario[], usuarioID: number) {
        const usuario = usuarios.find(u => u.UsuarioID === usuarioID);
        return usuario ? usuario.NombreUsuario : null;
    }
    const handleUserSelection = async (userId: string) => {
        setSelectedUser(userId);
        // Aseguramos que usuarios está definido y es un array antes de buscar el nombre
        const nombreUsuario = Array.isArray(usuarios) ? obtenerNombreUsuario(usuarios, Number(userId)) : null;

        setSelectedUserName(nombreUsuario || "");

        setIsLoading(true);
        const respuesta = await getCorteDelDiaByID(Number(userId));

        if (respuesta && Array.isArray(respuesta) && respuesta.length > 0) {
            const hoy = new Date();
            const corteDelDia = respuesta.find(corte =>
                isSameDay(parseISO(corte.FechaCorte), hoy)
            );

            if (corteDelDia) {
                setCorteUsuario(corteDelDia);
                form.reset(corteDelDia);
                toast({
                    title: "Corte existente",
                    description: "Ya existe un corte para este usuario el día de hoy.",
                    variant: "warning",
                });
                setStep(3); // Skip to step 3 if there's a corte
                setIsLoading(false);
                return;
            }
        }
        setIsLoading(false);
        setStep(2); // Continue to step 2 if there's no corte
    };

    const obtenerInicioCaja = async () => {
        setIsLoading(true);
        const respuesta = await getInicioActivo(Number(selectedUser));

        if (respuesta) {
            setInicioCajaActivo(respuesta);
            setIsLoading(false);
            return;
        }
        setInicioCajaActivo(null);

        const iniciosCaja = await getIniciosCaja();
        if (!iniciosCaja?.length) {
            setIsLoading(false);
            return
        };

        const hoy = new Date().toDateString();
        const inicioCajaHoy = iniciosCaja.find(({ FechaInicio, Usuario }) =>
            new Date(FechaInicio).toDateString() === hoy && Usuario.UsuarioID === Number(selectedUser));

        if (inicioCajaHoy) {
            setInicioCajaActivo(inicioCajaHoy);
        }

        setIsLoading(false);
    }

    const obtenerCorteCerradoHoy = async () => {
        setIsLoading(true);
        const respuesta = await getCorteDelDiaByID(Number(selectedUser));

        if (respuesta && Array.isArray(respuesta) && respuesta.length > 0) {
            const hoy = new Date();

            // Buscar el corte con la misma fecha del día actual
            const corteDelDia = respuesta.find(corte =>
                isSameDay(parseISO(corte.FechaCorte), hoy)
            );

            if (corteDelDia) {
                setCorteUsuario(corteDelDia);
                form.reset(corteDelDia);
                return;
            } else {
                manejarGenerarCorte();
            }
        }
        else {
            manejarGenerarCorte();
        }
        setIsLoading(false);
    };

    const manejarCrearInicioCaja = async (values: z.infer<typeof NuevoInicioCajaSchema>) => {
        setIsLoading(true);
        const datosConMontoInicial: iPostInicioCaja = {
            ...values,
            MontoInicial: montoInicial,
            UsuarioID: Number(selectedUser),
            UsuarioAutorizoID: Number(selectedUser), // Asumiendo que el mismo usuario autoriza
        };

        const respuesta = await postInicioCaja(datosConMontoInicial);
        if (respuesta?.error) {
            toast({
                title: "Error",
                description: "Error al crear el inicio de caja",
                variant: "destructive",
            });
            setIsLoading(false);;
            return;
        }

        toast({
            title: "Éxito",
            description: "Inicio de caja creado correctamente",
        });

        setInicioCajaActivo(respuesta);
        setIsLoading(false);
        obtenerInicioCaja();
        // obtenerCorteCerradoHoy();
    };

    const manejarGenerarCorte = async () => {

        if (!inicioCajaActivo || (inicioCajaActivo && corteUsuario && corteUsuario?.Estatus === "Cerrado")) {
            return;
        }

        setIsLoading(true);
        const respuesta = await generarCorteDelDiaByID(Number(selectedUser));
        if (respuesta.statusCode) {
            toast({
                title: "Atencion.",
                description: respuesta.message,
                variant: "warning",
            });
            setIsLoading(false);
            return;
        } else {
            setCorteUsuario(respuesta);
            form.reset(respuesta);
        }

        setIsLoading(false);
    };

    const manejarGuardarCorte = async (data: z.infer<typeof CorteDelDiaSchema>) => {
        setIsLoading(true);

        const datosCorte: IPostCorteDelDia = {
            usuarioID: Number(selectedUser),
            SaldoReal: data.SaldoReal,
            TotalEfectivoCapturado: data.TotalEfectivoCapturado,
            TotalTarjetaCapturado: data.TotalTarjetaCapturado,
            TotalTransferenciaCapturado: data.TotalTransferenciaCapturado,
            Observaciones: data.Observaciones,
        };

        const respuesta = await postCorteDelDia(datosCorte);

        if (respuesta.statusCode) {
            toast({
                title: "Error",
                description: "Error al guardar el corte de caja: " + respuesta.message,
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        toast({
            title: "Éxito",
            description: "Corte de caja guardado correctamente",
        });
        setShowMovementsModal(false)
        setIsLoading(false);
        setStep(4)
        setBtnTerminarDisabled(false)

        setTimeout(function () {
            location.reload();
        }, 2000);

    };

    const toggleMovementsModal = () => {
        if (showMovementsModal === false) {
            setIngresos(corteUsuario?.DetalleIngresos || []);
            setEgresos(corteUsuario?.DetalleEgresos || []);
            setPagosPoliza(corteUsuario?.DetallePagosPoliza || []);
            setShowMovementsModal(!showMovementsModal);

        } else {
            setShowMovementsModal(false);
        }
    };

    useEffect(() => {
        switch (step) {
            case 2:
                obtenerInicioCaja();
                break;
            case 3:
                obtenerCorteCerradoHoy();
                break;
            case 4:
                resetStates();
                setOpen(false); // This will close the dialog
                break;
            default:
                break;
        }
    }, [step])

    const calcularTotales = () => {
        const SaldoReal = Number(form.getValues("TotalEfectivoCapturado")) + Number(form.getValues("TotalPagoConTarjeta")) + Number(form.getValues("TotalTransferencia"));
        form.setValue("SaldoReal", SaldoReal);
        const diferencia = form.getValues("SaldoEsperado") - SaldoReal;
        const difPositiva = Math.abs(diferencia);
        form.setValue("Diferencia", difPositiva);
        form.setValue("TotalTarjetaCapturado", form.getValues("TotalPagoConTarjeta"));
        form.setValue("TotalTransferenciaCapturado", form.getValues("TotalTransferencia"));
        form.trigger();
    };

    if (isPending) {
        return <LoaderModales texto="Guardando cierre de caja..." />;
    }

    const resetStates = () => {
        setStep(1);
        setSelectedUser("");
        setInicioCajaActivo(null);
        setCorteUsuario(null);
    };

    return (
        <>
            {createPortal(
                <AnimatePresence>
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col md:flex-row gap-4 overflow-auto">
                            {/* Modal principal */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            >
                                <Card className={`${showMovementsModal ? '' : 'w-[80vw] max-w-7xl'} md:max-h-[90vh] max-h-[60vh] bg-white shadow-lg rounded-md flex flex-col transition-all duration-300`}>
                                    <Button
                                        className="absolute top-2 right-2 bg-red-400 rounded-sm hover:bg-red-500 active:bg-red-600"
                                        size={"icon"}
                                        onClick={onClose}
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </Button>
                                    <CardHeader>
                                        <div>
                                            <CardTitle>Crear nuevo corte</CardTitle>
                                            <CardDescription>
                                                {selectedUser ? selectedUserName : "Selecciona a un usuario para generar su corte."}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 overflow-y-auto">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                            <div className="w-full">
                                                {step == 1 && (
                                                    <div className="grid gap-4 py-4 min-w-[400px]">
                                                        <Select value={selectedUser} onValueChange={handleUserSelection}>
                                                            <SelectTrigger >
                                                                <SelectValue placeholder="Seleccionar Usuario" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Array.isArray(usuarios) ? usuarios.map((usuario) => (
                                                                    <SelectItem
                                                                        key={usuario.UsuarioID}
                                                                        value={usuario.UsuarioID.toString()}
                                                                    >
                                                                        {usuario.NombreUsuario}
                                                                    </SelectItem>
                                                                )) : null}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                {step == 2 && (
                                                    <div className="w-full max-w-4xl mx-auto">
                                                        {inicioCajaActivo ? (
                                                            <Card className="w-full mx-auto rounded-md">
                                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                                    <CardTitle className="text-xl font-bold">Inicio de Caja #{inicioCajaActivo?.InicioCajaID}</CardTitle>
                                                                    <Badge
                                                                        variant={inicioCajaActivo.Estatus === "Activo" ? "default" : "secondary"}
                                                                        className={inicioCajaActivo.Estatus === "Activo" ? "bg-green-500" : ""}
                                                                    >
                                                                        {inicioCajaActivo.Estatus}
                                                                    </Badge>
                                                                </CardHeader>
                                                                <CardContent className="pt-4">
                                                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                                        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                                                                            <CalendarClock className="h-5 w-5 text-muted-foreground" />
                                                                            <div>
                                                                                <p className="text-sm font-medium leading-none">Fecha de inicio</p>
                                                                                <p className="text-sm text-muted-foreground">{formatDateTimeFull(inicioCajaActivo.FechaInicio)}</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                                                                            <CalendarClock className="h-5 w-5 text-muted-foreground" />
                                                                            <div>
                                                                                <p className="text-sm font-medium leading-none">Ultima actualizacion</p>
                                                                                <p className="text-sm text-muted-foreground">{formatDateTimeFull(inicioCajaActivo.FechaActualizacion)}</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                                                                            <Banknote className="h-5 w-5 text-muted-foreground" />
                                                                            <div>
                                                                                <p className="text-sm font-medium leading-none">Total efectivo</p>
                                                                                <p className="text-sm text-muted-foreground">{formatCurrency(Number(inicioCajaActivo.TotalEfectivo))}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                                                                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                                                                            <div>
                                                                                <p className="text-sm font-medium leading-none">Total Transferencia</p>
                                                                                <p className="text-sm text-muted-foreground">{formatCurrency(Number(inicioCajaActivo.TotalTransferencia))}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                                                                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                                                                            <div>
                                                                                <p className="text-sm font-medium leading-none">Total</p>
                                                                                <p className="text-sm font-bold">
                                                                                    {formatCurrency(Number(inicioCajaActivo.MontoInicial))}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ) : (
                                                            <Form {...nuevoInicioCajaForm}>
                                                                <form onSubmit={nuevoInicioCajaForm.handleSubmit(manejarCrearInicioCaja)} className="space-y-4">
                                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                                        <FormItem>
                                                                            <FormLabel>Monto Inicial</FormLabel>
                                                                            <Input
                                                                                value={formatCurrency(montoInicial)}
                                                                                disabled
                                                                            />
                                                                        </FormItem>

                                                                        <FormField
                                                                            control={nuevoInicioCajaForm.control}
                                                                            name="TotalEfectivo"
                                                                            render={({ field }) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Total Efectivo</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input
                                                                                            {...field}
                                                                                            value={formatCurrency(field.value)}
                                                                                            onChange={(e) => {
                                                                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                                                                field.onChange(Number(valor) / 100);
                                                                                            }}
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormMessage />
                                                                                </FormItem>
                                                                            )}
                                                                        />

                                                                        <FormField
                                                                            control={nuevoInicioCajaForm.control}
                                                                            name="TotalTransferencia"
                                                                            render={({ field }) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Total Transferencia</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input
                                                                                            {...field}
                                                                                            value={formatCurrency(field.value)}
                                                                                            onChange={(e) => {
                                                                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                                                                field.onChange(Number(valor) / 100);
                                                                                            }}
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormMessage />
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    </div>

                                                                    <div className="flex justify-between gap-2">
                                                                        <p className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                                                                            <Info /> Nota: El total en efectivo y transferencia pueden ser cero.
                                                                        </p>
                                                                        <Button type="submit" disabled={isLoading}>
                                                                            <SaveIcon className="w-4 h-4 mr-2" />
                                                                            Crear Inicio de Caja
                                                                        </Button>
                                                                    </div>
                                                                </form>
                                                            </Form>
                                                        )}
                                                    </div>
                                                )}

                                                {step == 3 && (
                                                    <div className="w-full">
                                                        {corteUsuario && (
                                                            <Form {...form}>
                                                                <form onSubmit={form.handleSubmit(manejarGuardarCorte)} className="space-y-2">
                                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                                        <div className="border p-2 rounded-lg bg-card">
                                                                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                                                                <ArrowDownCircle className="h-4 w-4 mr-1 text-green-500" />
                                                                                Ingresos
                                                                            </h3>
                                                                            <div className="grid sm:grid-cols-2 gap-3">
                                                                                <CustomValue label="Total en Efectivo" value="TotalIngresosEfectivo" />
                                                                                <CustomValue label="Total con Tarjeta" value="TotalIngresosTarjeta" />
                                                                                <CustomValue label="Total con Transferencia" value="TotalIngresosTransferencia" />
                                                                                <CustomValue label="Total" value="TotalIngresos" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="border p-2 rounded-lg bg-card">
                                                                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                                                                <ArrowUpCircle className="h-4 w-4 mr-1 text-red-500" />
                                                                                Egresos
                                                                            </h3>
                                                                            <div className="grid sm:grid-cols-2 gap-3">
                                                                                <CustomValue label="Total en Efectivo" value="TotalEgresosEfectivo" />
                                                                                <CustomValue label="Total con Tarjeta" value="TotalEgresosTarjeta" />
                                                                                <CustomValue label="Total con Transferencia" value="TotalEgresosTransferencia" />
                                                                                <CustomValue label="Total" value="TotalEgresos" />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="border p-2 rounded-lg bg-card">
                                                                        <div className="flex justify-between items-center gap-2 mb-2">
                                                                            <h3 className="font-semibold">Resumen Financiero</h3>
                                                                            <Button type="button" className="rounded-full h-8" onClick={toggleMovementsModal}>
                                                                                <Eye className="w-4 h-4 mr-2" />
                                                                                {showMovementsModal ? "Ocultar Movimientos" : "Ver Movimientos"}
                                                                            </Button>
                                                                        </div>
                                                                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                                            <CustomValue label="Total Efectivo" value="TotalEfectivo" />
                                                                            <CustomValue label="Total Tarjeta" value="TotalPagoConTarjeta" />
                                                                            <CustomValue label="Total Transferencia" value="TotalTransferencia" />
                                                                            <CustomValue label="Saldo Esperado" value="SaldoEsperado" />
                                                                            <CustomValue label="Saldo Real" value="SaldoReal" />
                                                                            <CustomValue label="Diferencia" value="Diferencia" />
                                                                        </div>

                                                                        <div className="mt-2">
                                                                            <h3 className="text-lg font-semibold ">Totales en este usuario</h3>

                                                                            {corteUsuario.Estatus === "Cerrado" ? (
                                                                                <div className="grid gap-4 sm:grid-cols-2">
                                                                                    <CustomValue label="Saldo Real" value="TotalEfectivoCapturado" />
                                                                                    <CustomValue label="Observaciones" type={"string"} value="Observaciones" />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="grid gap-4 sm:grid-cols-2">
                                                                                    <FormField
                                                                                        name="TotalEfectivoCapturado"
                                                                                        control={form.control}
                                                                                        render={({ field }) => (
                                                                                            <FormItem>
                                                                                                <FormLabel>Efectivo</FormLabel>
                                                                                                <FormControl>
                                                                                                    <Input
                                                                                                        {...field}
                                                                                                        value={formatCurrency(field.value)}
                                                                                                        onChange={(e) => {
                                                                                                            const valor = e.target.value.replace(/[^0-9]/g, "");
                                                                                                            field.onChange(Number(valor) / 100);
                                                                                                            calcularTotales();
                                                                                                        }}
                                                                                                    />
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                    <FormField
                                                                                        name="Observaciones"
                                                                                        control={form.control}
                                                                                        render={({ field }) => (
                                                                                            <FormItem>
                                                                                                <FormLabel>Observaciones</FormLabel>
                                                                                                <FormControl>
                                                                                                    <Input {...field} value={field.value} />
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex justify-end gap-2 mt-4">
                                                                        {corteUsuario.Estatus === "Pendiente" && (
                                                                            <Button
                                                                                type="submit"
                                                                                className="rounded-md w-full"
                                                                                onClick={(e) => {
                                                                                    if (e.currentTarget.type !== 'submit') {
                                                                                        e.preventDefault();
                                                                                    }
                                                                                }}
                                                                            >
                                                                                Guardar Corte
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </form>
                                                            </Form>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex flex-row items-center justify-between w-full p-5 border-t">
                                        <Button
                                            className="rounded-md"
                                            onClick={() => {
                                                setStep(step - 1)
                                                setShowMovementsModal(false)
                                            }}
                                            disabled={step == 1}
                                        >
                                            Atras
                                        </Button>
                                        <span>{step}/3</span>
                                        {step == 1 && (
                                            <Button
                                                className="rounded-md"
                                                onClick={() => setStep(2)}
                                                type="button"
                                                disabled={!selectedUser}
                                            >
                                                Siguiente
                                            </Button>
                                        )}
                                        {step == 2 && (
                                            <Button
                                                className="rounded-md"
                                                onClick={() => {
                                                    setStep(3)
                                                }}
                                                type="button"
                                                disabled={inicioCajaActivo ? false : true}
                                            >
                                                Siguiente
                                            </Button>
                                        )}
                                        {step == 3 && (
                                            <div
                                            >
                                                <Button
                                                    className="rounded-md"
                                                    onClick={() => {
                                                        setOpen(false)
                                                        resetStates()
                                                    }}
                                                    disabled={btnTerminarDisabled}
                                                >
                                                    Terminar
                                                </Button>
                                            </div>
                                        )}
                                    </CardFooter>

                                </Card>
                            </motion.div>

                            {/* Modal de movimientos */}
                            <AnimatePresence>
                                {showMovementsModal && (
                                    <motion.div
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 50, opacity: 0 }}
                                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    >
                                        <Card className="flex flex-col  h-[90vh] shadow-lg bg-white">
                                            <CardHeader className="pb-2">
                                                <CardTitle>Movimientos</CardTitle>
                                                <div className="text-sm text-muted-foreground">Detalle de ingresos y egresos</div>
                                            </CardHeader>
                                            <CardContent className="flex-1 overflow-hidden p-0">
                                                <ScrollArea className="h-full p-4">
                                                    <div className="space-y-3">
                                                        {/* Ingresos Section */}
                                                        {ingresos && ingresos.length > 0 && (
                                                            <div>
                                                                <h3 className="text-md font-semibold mb-2 flex items-center">
                                                                    <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                                                                    Ingresos ({ingresos.length})
                                                                </h3>
                                                                <div className="space-y-3">
                                                                    {ingresos.map((ingreso, index) => (
                                                                        <MovimientoItem
                                                                            key={`ingreso-${index}`}
                                                                            movimiento={ingreso}
                                                                            tipo="ingreso"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* Egresos Section */}
                                                        {egresos && egresos.length > 0 && (
                                                            <div>
                                                                <h3 className="text-md font-semibold mb-2 flex items-center">
                                                                    <ArrowDownLeft className="h-4 w-4 mr-2 text-red-500" />
                                                                    Egresos ({egresos.length})
                                                                </h3>
                                                                <div className="space-y-3">
                                                                    {egresos.map((egreso, index) => (
                                                                        <MovimientoItem
                                                                            key={`egreso-${index}`}
                                                                            movimiento={egreso}
                                                                            tipo="egreso"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* Pagos de Poliza Section */}
                                                        {pagosPoliza && pagosPoliza.length > 0 && (
                                                            <div>
                                                                <h3 className="text-md font-semibold mb-2 flex items-center">
                                                                    <ArrowDownLeft className="h-4 w-4 mr-2 text-red-500" />
                                                                    Pagos de Poliza ({pagosPoliza.length})
                                                                </h3>
                                                                <div className="space-y-3">
                                                                    {pagosPoliza.map((pago, index) => (
                                                                        <MovimientoItem
                                                                            key={`pago-${index}`}
                                                                            movimiento={pago}
                                                                            tipo="pago"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* Mensaje si no hay movimientos */}
                                                        {!ingresos?.length && !egresos?.length && !pagosPoliza?.length && (
                                                            <div className="text-center py-8 text-muted-foreground">
                                                                No hay movimientos registrados para este corte.
                                                            </div>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </motion.div >
                </AnimatePresence >,
                document.body
            )}
        </>
    );
}