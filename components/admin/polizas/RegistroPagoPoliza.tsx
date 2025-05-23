"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, InfoIcon } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type {
    iGetEsquemaPago,
    iGetStatusPago,
    iGetMetodosPago
} from "@/interfaces/CatPolizas";
import Loading from "@/app/(protected)/loading";
import { useTransition } from "react";
import { SyncLoader } from "react-spinners";
import { LoaderModales } from "@/components/LoaderModales";
import { useInicioCaja } from "@/context/InicioCajaContext";
import { MensajeError } from "@/components/ui/MensajeError";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { getUsuarios } from "@/actions/SeguridadActions";
import { getCuentasBancarias } from "@/actions/ClientesActions";

interface UsuarioValidador {
    UsuarioID: number;
    Nombre: string;
}

interface CuentaBancaria {
    CuentaBancariaID: number;
    Nombre: string;
    NumeroCuenta: string;
}

const esquemaPagoPoliza = z.object({
    PolizaID: z.number(),
    FechaPago: z.string(),
    MontoPagado: z.number().min(1, { message: "El monto debe ser mayor a 0" }),
    ReferenciaPago: z.string(),
    NombreTitular: z.string(),
    FechaMovimiento: z.string(),
    IDMetodoPago: z.number(),
    IDEstatusPago: z.number(),
    UsuarioID: z.number(),
    UsuarioValidoID: z.number().optional(),
    CuentaBancariaID: z.number().optional(),
    Validado: z.boolean().optional(),
}).refine((data) => {
    if (data.IDMetodoPago !== 3) {
        return data.UsuarioValidoID !== undefined && data.CuentaBancariaID !== undefined && data.Validado !== undefined;
    }
    return true;
}, {
    message: "Los campos de validación son requeridos para este método de pago",
    path: ["UsuarioValidoID", "CuentaBancariaID", "Validado"]
});

type TipoPagoForm = z.infer<typeof esquemaPagoPoliza>;

interface PropiedadesRegistroPago {
    esquemaPago: iGetEsquemaPago;
    polizaId: number;
    usuarioId: number;
    onRegistrarPago: (datos: TipoPagoForm) => Promise<void>;
    statusPago: iGetStatusPago[];
    metodosPago: iGetMetodosPago[];
}

export const RegistroPagoPoliza = ({
    esquemaPago,
    polizaId,
    usuarioId,
    onRegistrarPago,
    statusPago,
    metodosPago,
}: PropiedadesRegistroPago) => {
    const { inicioCaja } = useInicioCaja();
    const [usuariosValidadores, setUsuariosValidadores] = useState<UsuarioValidador[]>([]);
    const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancaria[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [usuariosData, cuentasData] = await Promise.all([
                    getUsuarios(),
                    getCuentasBancarias()
                ]);

                if (usuariosData) {
                    setUsuariosValidadores(usuariosData.map(usuario => ({
                        UsuarioID: usuario.UsuarioID,
                        Nombre: usuario.NombreUsuario
                    })));
                }

                if (cuentasData) {
                    setCuentasBancarias(cuentasData.map(cuenta => ({
                        CuentaBancariaID: cuenta.CuentaBancariaID,
                        Nombre: cuenta.NombreBanco,
                        NumeroCuenta: cuenta.NumeroCuenta
                    })));
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
            } finally {
                setIsLoading(false);
            }
        };

        cargarDatos();
    }, []);

    const form = useForm<TipoPagoForm>({
        resolver: zodResolver(esquemaPagoPoliza),
        defaultValues: {
            PolizaID: polizaId,
            FechaPago: new Date().toISOString(),
            MontoPagado: 0,
            ReferenciaPago: "",
            NombreTitular: "",
            FechaMovimiento: new Date().toISOString(),
            IDMetodoPago: 3,
            IDEstatusPago: 1,
            UsuarioID: usuarioId,
            UsuarioValidoID: undefined,
            CuentaBancariaID: undefined,
            Validado: false,
        },
    });

    const calcularPagoSugerido = (esquema: iGetEsquemaPago): number => {
        for (const pago of esquema.esquemaPagos) {
            const totalPagado = pago.pagosRealizados.reduce((suma, p) => suma + p.montoPagado, 0);
            if (totalPagado < pago.montoPorPagar) {
                return pago.montoPorPagar - totalPagado;
            }
        }
        return 0;
    };

    const montoPorPagar = esquemaPago.totalPrima - esquemaPago.totalPagado;
    const pagoSugerido = calcularPagoSugerido(esquemaPago);
    const metodoPagoSeleccionado = metodosPago.find(m => m.IDMetodoPago === form.watch("IDMetodoPago"));
    const nombreMetodo = metodoPagoSeleccionado?.NombreMetodo.toLowerCase() || "";
    const esEfectivo = nombreMetodo.includes("efectivo");
    const pagosCompletos = montoPorPagar === 0;
    const [isPending, startTransition] = useTransition();

    const isFormValid = () => {
        const metodoPago = form.watch("IDMetodoPago");
        if (metodoPago === 3) return true;

        const usuarioValido = form.watch("UsuarioValidoID");
        const cuentaBancaria = form.watch("CuentaBancariaID");
        const validado = form.watch("Validado");

        return usuarioValido !== undefined && 
               cuentaBancaria !== undefined && 
               validado === true;
    };

    const onSubmit = async (datos: TipoPagoForm) => {
        startTransition(async () => {
            const datosBase = {
                PolizaID: datos.PolizaID,
                FechaPago: datos.FechaPago,
                MontoPagado: datos.MontoPagado,
                ReferenciaPago: datos.ReferenciaPago || "",
                NombreTitular: datos.NombreTitular || "",
                FechaMovimiento: datos.FechaMovimiento,
                IDMetodoPago: datos.IDMetodoPago,
                IDEstatusPago: datos.IDEstatusPago,
                UsuarioID: datos.UsuarioID,
            };

            const datosEnviar = datos.IDMetodoPago === 3
                ? datosBase
                : {
                    ...datosBase,
                    UsuarioValidoID: datos.UsuarioValidoID,
                    CuentaBancariaID: datos.CuentaBancariaID,
                    Validado: datos.Validado,
                };

            await onRegistrarPago(datosEnviar);
            form.reset();
        });
    };

    if (isPending || isLoading) {
        return (
            <LoaderModales />
        );
    }

    // if (!inicioCaja) {
    //     return (
    //         <MensajeError
    //             mensaje="Para registrar pagos necesitas tener un inicio de caja activo"
    //         />
    //     );
    // }

    return (
        <>
            <div className="space-y-4 ">
                {esquemaPago.mensajeAtraso && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {esquemaPago.mensajeAtraso}
                        </AlertDescription>
                    </Alert>
                )}

                {esquemaPago.descuentoProntoPago > 0 && (
                    <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertDescription>
                            Descuento por pronto pago disponible: {formatCurrency(esquemaPago.descuentoProntoPago)}
                        </AlertDescription>
                    </Alert>
                )}

                {pagosCompletos ? (
                    <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                            Todos los pagos de la póliza han sido completados
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="FechaPago"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de pago</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={format(new Date(field.value), "PPP", { locale: es })}
                                                disabled
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <FormLabel>Monto total de póliza:</FormLabel>
                                    <Input
                                        value={formatCurrency(esquemaPago.totalPrima)}
                                        disabled
                                    />
                                </div>

                                <div>
                                    <FormLabel>Monto por pagar</FormLabel>
                                    <Input
                                        value={formatCurrency(montoPorPagar)}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div>
                                <FormLabel>Pago sugerido</FormLabel>
                                <Input
                                    value={formatCurrency(pagoSugerido)}
                                    disabled
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="MontoPagado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto a pagar</FormLabel>
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
                                control={form.control}
                                name="IDMetodoPago"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Método de pago</FormLabel>
                                        <Select
                                            onValueChange={(valor) => field.onChange(Number(valor))}
                                            value={field.value.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona método de pago" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {metodosPago.map((metodo) => (
                                                    <SelectItem
                                                        key={metodo.IDMetodoPago}
                                                        value={metodo.IDMetodoPago.toString()}
                                                    >
                                                        {metodo.NombreMetodo}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* <FormField
                                control={form.control}
                                name="IDEstatusPago"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado del pago</FormLabel>
                                        <Select
                                            onValueChange={(valor) => field.onChange(Number(valor))}
                                            value={field.value.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona estado del pago" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {statusPago.map((status) => (
                                                    <SelectItem
                                                        key={status.IDEstatusPago}
                                                        value={status.IDEstatusPago.toString()}
                                                    >
                                                        {status.NombreEstatus}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}

                            {!esEfectivo && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="ReferenciaPago"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Número de transacción</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="NombreTitular"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Titular de la cuenta</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {form.watch("IDMetodoPago") !== 3 && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="UsuarioValidoID"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Usuario validador</FormLabel>
                                                        <Select
                                                            onValueChange={(valor) => field.onChange(Number(valor))}
                                                            value={field.value?.toString()}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecciona usuario validador" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {usuariosValidadores.map((usuario) => (
                                                                    <SelectItem
                                                                        key={usuario.UsuarioID}
                                                                        value={usuario.UsuarioID.toString()}
                                                                    >
                                                                        {usuario.Nombre}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="CuentaBancariaID"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Cuenta bancaria</FormLabel>
                                                        <Select
                                                            onValueChange={(valor) => field.onChange(Number(valor))}
                                                            value={field.value?.toString()}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecciona cuenta bancaria" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {cuentasBancarias.map((cuenta) => (
                                                                    <SelectItem
                                                                        key={cuenta.CuentaBancariaID}
                                                                        value={cuenta.CuentaBancariaID.toString()}
                                                                    >
                                                                        {cuenta.Nombre} <span className="text-gray-500">No. de cuenta: {cuenta.NumeroCuenta}</span>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="Validado"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>
                                                                Validado
                                                            </FormLabel>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            <Button 
                                type="submit" 
                                disabled={!isFormValid()}
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Registrar Pago
                            </Button>
                        </form>
                    </Form>
                )}
            </div>
        </>
    );
};

export default RegistroPagoPoliza;