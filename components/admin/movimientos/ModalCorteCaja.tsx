import { cancelarCorteDelDia, editarCorteDelDia, generarCorteDelDiaByID, getCorteDelDiaByID, postCorteDelDia } from "@/actions/CorteDelDiaActions";
import { getInicioActivo, getIniciosCaja, postInicioCaja } from "@/actions/MovimientosActions";
import { LoaderModales } from "@/components/LoaderModales";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { IPostCorteDelDia } from "@/interfaces/CorteDelDiaInterface";
import { iGetCorteCajaUsuario } from "@/interfaces/CortesCajaInterface";
import { iGetInicioActivo, iPostInicioCaja } from "@/interfaces/MovimientosInterface";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";
import { zodResolver } from "@hookform/resolvers/zod";
import { isSameDay, parseISO } from "date-fns";
import { Banknote, CalendarClock, CreditCard, DollarSign, Info, SaveIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

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
    return (
        <div>
            <FormLabel>{label}</FormLabel>
            {type === "number" ? (
                value == "Diferencia" ? (

                    <p className={className}>{formatCurrency(Math.abs(getValues(value)))}</p>
                ) : (
                    <p className={className}>{formatCurrency(getValues(value))}</p>
                )
            ) : (
                <p className={className}>{getValues(value)}</p>
            )}

        </div>
    );
};

interface ModalCorteCajaProps {
    usuarioId: number;
    NombreUsuario: string;
    abierto: boolean;
    alCerrar: () => void;
}

export const ModalCorteCaja = ({ usuarioId, NombreUsuario, abierto, alCerrar }: ModalCorteCajaProps) => {
    const [inicioCajaActivo, setInicioCajaActivo] = useState<iGetInicioActivo | null>(null);
    const [corteUsuario, setCorteUsuario] = useState<iGetCorteCajaUsuario | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [corteUsuarioID, setCorteUsuarioID] = useState(null);

    const esPrimeraVez = useRef(true);
    const ejecutado = useRef(false);

    const { toast } = useToast();

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

    const obtenerInicioCaja = async () => {
        setIsLoading(true);
        const respuesta = await getInicioActivo(usuarioId);

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
            new Date(FechaInicio).toDateString() === hoy && Usuario.UsuarioID === usuarioId);

        if (inicioCajaHoy) {
            setInicioCajaActivo(inicioCajaHoy);
        }

        setIsLoading(false);
    };

    const obtenerCorteCerradoHoy = async () => {
        setIsLoading(true);
        const respuesta = await getCorteDelDiaByID(usuarioId);

        if (respuesta && Array.isArray(respuesta) && respuesta.length > 0) {
            const hoy = new Date();

            // Buscar el corte con la misma fecha del día actual
            const corteDelDia = respuesta.find(corte =>
                isSameDay(parseISO(corte.FechaCorte), hoy)
            );

            if (corteDelDia) {
                setCorteUsuarioID(corteDelDia.CorteUsuarioID)
                setCorteUsuario(corteDelDia);
                form.reset(corteDelDia);
            } else {
                manejarGenerarCorte();
            }
        }
        else {
            manejarGenerarCorte();
        }
        setIsLoading(false);
    };
    useEffect(() => {
        if (usuarioId) {
            obtenerInicioCaja();
            obtenerCorteCerradoHoy();
        }
    }, [usuarioId]);

    useLayoutEffect(() => {
        if (abierto && inicioCajaActivo !== null) {
            manejarGenerarCorte();
            ejecutado.current = true;
        }
    }, [abierto]);

    const manejarCrearInicioCaja = async (values: z.infer<typeof NuevoInicioCajaSchema>) => {
        setIsLoading(true);
        const datosConMontoInicial: iPostInicioCaja = {
            ...values,
            MontoInicial: montoInicial,
            UsuarioID: usuarioId,
            UsuarioAutorizoID: usuarioId, // Asumiendo que el mismo usuario autoriza
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
        obtenerCorteCerradoHoy();
    };

    const manejarGenerarCorte = async () => {

        if (!inicioCajaActivo || (inicioCajaActivo && corteUsuario && corteUsuario?.Estatus === "Cerrado")) {
            return;
        }

        setIsLoading(true);
        const respuesta = await generarCorteDelDiaByID(usuarioId);
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
            usuarioID: usuarioId,
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

        alCerrar();
        setIsLoading(false);
        obtenerCorteCerradoHoy();
    };

    const manejarCancelarCorte = async () => {
        setIsLoading(true);
        if (corteUsuarioID) {
            const respuesta = await cancelarCorteDelDia(corteUsuarioID, NombreUsuario);
            if (respuesta?.error) {
                toast({
                    title: "Error",
                    description: "Error al cancelar el corte de caja",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            toast({
                title: "Éxito",
                description: "Corte de caja cancelado correctamente",
            });
            // alCerrar();
            setCorteUsuario(respuesta);
            form.reset(respuesta);
        }
        setIsLoading(false);
        obtenerCorteCerradoHoy();
    };

    const manejarEditarCorte = async () => {
        setIsLoading(true);
        const body = {
            usuarioID: usuarioId,
            SaldoReal: form.getValues("SaldoReal"),
            TotalEfectivoCapturado: form.getValues("TotalEfectivoCapturado"),
            TotalTarjetaCapturado: form.getValues("TotalTarjetaCapturado"),
            TotalTransferenciaCapturado: form.getValues("TotalTransferenciaCapturado"),
            Observaciones: form.getValues("Observaciones"),
            Estatus: "Cerrado"
        };

        if (corteUsuarioID && NombreUsuario) {
            const respuesta = await editarCorteDelDia(corteUsuarioID, NombreUsuario, body);
            if (respuesta?.error) {
                toast({
                    title: "Error",
                    description: "Error al cancelar el corte de caja",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }
            toast({
                title: "Éxito",
                description: "Corte de caja guardado correctamente",
            });

            setCorteUsuario(respuesta);
            form.reset(respuesta);
        }

        setIsLoading(false);
        obtenerCorteCerradoHoy();
    };

    const calcularTotales = () => {
        const SaldoReal = Number(form.getValues("TotalEfectivoCapturado")) + Number(form.getValues("TotalPagoConTarjeta")) + Number(form.getValues("TotalTransferencia"));
        form.setValue("SaldoReal", SaldoReal);
        const diferencia = form.getValues("SaldoEsperado") - SaldoReal;
        const difPositiva = Math.abs(diferencia);
        form.setValue("Diferencia", difPositiva);
        form.setValue("TotalTarjetaCapturado", form.getValues("TotalPagoConTarjeta"));
        form.setValue("TotalTransferenciaCapturado", form.getValues("TotalTransferencia"));
        // console log de TotalEfecitvoCapturado y Observaciones
        form.trigger();
    };

    return (
        <Dialog open={abierto} onOpenChange={alCerrar}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        <div className="flex items-center justify-between pr-10">
                            <span>Corte del dia</span>
                            {corteUsuario?.Estatus && (
                                <span className={`px-2 py-1 rounded-md ${corteUsuario?.Estatus === "Pendiente" ? "bg-yellow-500 text-white" : corteUsuario?.Estatus === "Cancelado" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
                                    {corteUsuario?.Estatus}
                                </span>
                            )}
                        </div>
                    </DialogTitle>
                </DialogHeader>
                {isLoading && <LoaderModales texto="Cargando información..." />}

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
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center space-x-3">
                                    <CalendarClock className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium leading-none">Fecha de inicio</p>
                                        <p className="text-sm text-muted-foreground">{formatDateTimeFull(inicioCajaActivo.FechaInicio)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <CalendarClock className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium leading-none">Ultima actualizacion</p>
                                        <p className="text-sm text-muted-foreground">{formatDateTimeFull(inicioCajaActivo.FechaActualizacion)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Banknote className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium leading-none">Total efectivo</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(Number(inicioCajaActivo.TotalEfectivo))}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium leading-none">Total Transferencia</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(Number(inicioCajaActivo.TotalTransferencia))}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
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

                {corteUsuario && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(manejarGuardarCorte)} className="space-y-4 container">
                            <div className="flex flex-col gap-5 lg:flex-row justify-between">
                                <div className="w-full border p-3 rounded-md">
                                    <h3 className="text-lg font-semibold mb-2">Ingresos</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <CustomValue label="Total Ingresos en Efectivo" value="TotalIngresosEfectivo" />
                                        <CustomValue label="Total Ingresos con Tarjeta" value="TotalIngresosTarjeta" />
                                        <CustomValue label="Total Ingresos con Transferencia" value="TotalIngresosTransferencia" />
                                        <CustomValue label="Total Ingresos" value="TotalIngresos" />
                                    </div>
                                </div>
                                <div className="w-full border p-3 rounded-md">
                                    <h3 className="text-lg font-semibold mb-2">Egresos</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <CustomValue label="Total Egresos en Efectivo" value="TotalEgresosEfectivo" />
                                        <CustomValue label="Total Egresos con Tarjeta" value="TotalEgresosTarjeta" />
                                        <CustomValue label="Total Egresos con Transferencia" value="TotalEgresosTransferencia" />
                                        <CustomValue label="Total Egresos" value="TotalEgresos" />
                                    </div>
                                </div>
                            </div>
                            <div className="border p-3 rounded-md">
                                <h3 className="text-lg font-semibold mb-2">Resumen General </h3>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <CustomValue label="Total Efectivo" value="TotalEfectivo" />
                                    <CustomValue label="Total Pago Con Tarjeta" value="TotalPagoConTarjeta" />
                                    <CustomValue label="Total Pago Con Transferencia" value="TotalTransferencia" />
                                    <CustomValue label="Saldo Esperado" value="SaldoEsperado" />
                                    <CustomValue label="Saldo Real" value="SaldoReal" />
                                    <CustomValue label="Diferencia" value="Diferencia" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 py-3">Totales en este usuario</h3>

                                {corteUsuario.Estatus === "Cerrado" ? (
                                    <div className="grid gap-4 grid-cols-2">
                                        <CustomValue label="Saldo Real" value="TotalEfectivoCapturado" />
                                        <CustomValue label="Diferencia" type={"string"} value="Observaciones" />
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
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
                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        alCerrar();
                                    }}
                                >
                                    Cerrar ventana
                                </Button>
                                {corteUsuario.Estatus === "Pendiente" && (
                                    <Button
                                        type="submit"
                                        onClick={(e) => {
                                            if (e.currentTarget.type !== 'submit') {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        Guardar Corte.
                                    </Button>
                                )}
                                {corteUsuario.Estatus === "Cerrado" && (
                                    <Button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            manejarCancelarCorte();
                                        }}
                                    >
                                        Cancelar Corte
                                    </Button>
                                )}
                                {corteUsuario.Estatus === "Cancelado" && (
                                    <Button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            manejarEditarCorte();
                                        }}
                                    >
                                        Guardar Corte
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog >
    );
}