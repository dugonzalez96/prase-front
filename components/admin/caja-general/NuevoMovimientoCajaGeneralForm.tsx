"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/format-number";
import { formatCurrency } from "@/lib/format";
import { registrarMovimientoCajaGeneral } from "@/actions/CajaGeneralActions";
import { iGetCuentasBancarias } from "@/interfaces/ClientesInterface";
import { iGetUsers } from "@/interfaces/SeguridadInterface";
import { useTransition } from "react";

interface NuevoMovimientoCajaGeneralFormProps {
    usuarioId: number;
    cuentasBancarias: iGetCuentasBancarias[];
    usuarios: iGetUsers[];
    onSuccess?: () => void;
    onCancel?: () => void;
    fechaActual: string;
}

const tiposTransaccion = ["Ingreso", "Egreso"] as const;
const formasPago = ["Efectivo", "Transferencia", "Deposito", "Tarjeta"] as const;

const nuevoMovimientoSchema = z.object({
    tipoTransaccion: z.enum(["Ingreso", "Egreso"]),
    formaPago: z.enum(["Efectivo", "Transferencia", "Deposito", "Tarjeta"]),
    monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
    descripcion: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
    usuarioValidoId: z.number().optional(),
    cuentaBancariaId: z.number().optional(),
}).refine((data) => {
    if (data.formaPago !== "Efectivo" && !data.cuentaBancariaId) {
        return false;
    }
    return true;
}, {
    message: "La cuenta bancaria es requerida para formas de pago no efectivo",
    path: ["cuentaBancariaId"],
}).refine((data) => {
    if (data.formaPago !== "Efectivo" && !data.usuarioValidoId) {
        return false;
    }
    return true;
}, {
    message: "El usuario validador es requerido para formas de pago no efectivo",
    path: ["usuarioValidoId"],
});

export function NuevoMovimientoCajaGeneralForm({
    usuarioId,
    cuentasBancarias,
    usuarios,
    onSuccess,
    onCancel,
    fechaActual,
}: NuevoMovimientoCajaGeneralFormProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof nuevoMovimientoSchema>>({
        resolver: zodResolver(nuevoMovimientoSchema),
        defaultValues: {
            tipoTransaccion: "Ingreso",
            formaPago: "Efectivo",
            monto: 0,
            descripcion: "",
            usuarioValidoId: undefined,
            cuentaBancariaId: undefined,
        },
    });

    const onSubmit = async (valores: z.infer<typeof nuevoMovimientoSchema>) => {
        startTransition(async () => {
            try {
                const respuesta = await registrarMovimientoCajaGeneral({
                    tipoTransaccion: valores.tipoTransaccion,
                    formaPago: valores.formaPago,
                    monto: valores.monto,
                    descripcion: valores.descripcion,
                    usuarioCreoId: usuarioId,
                    cuentaBancariaId: valores.cuentaBancariaId || null,
                    fechaTransaccion: fechaActual,
                });

                if (!respuesta) {
                    toast({
                        title: "Error",
                        description: "Ocurrió un error al registrar el movimiento",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Éxito",
                    description: "Movimiento registrado correctamente",
                });
                form.reset();
                onSuccess?.();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al registrar el movimiento",
                    variant: "destructive",
                });
            }
        });
    };

    const formaPago = form.watch("formaPago");
    const esPagoEnEfectivo = formaPago === "Efectivo";
    const estaEnviando = form.formState.isSubmitting || isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="tipoTransaccion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Transacción</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona tipo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {tiposTransaccion.map((tipo) => (
                                        <SelectItem key={tipo} value={tipo}>
                                            {tipo}
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
                    name="formaPago"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Forma de Pago</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona forma de pago" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {formasPago.map((forma) => (
                                        <SelectItem key={forma} value={forma}>
                                            {forma}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!esPagoEnEfectivo && (
                    <>
                        <FormField
                            control={form.control}
                            name="usuarioValidoId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Usuario Validador</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value?.toString() || ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona usuario validador" />
                                            </SelectTrigger>
                                        </FormControl>
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cuentaBancariaId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cuenta Bancaria</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value?.toString() || ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona cuenta" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {cuentasBancarias.map((cuenta) => (
                                                <SelectItem
                                                    key={cuenta.CuentaBancariaID}
                                                    value={cuenta.CuentaBancariaID.toString()}
                                                >
                                                    {cuenta.NombreBanco} - {cuenta.NumeroCuenta}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}

                <FormField
                    control={form.control}
                    name="monto"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monto</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={formatCurrency(field.value, { showSymbol: true })}
                                    placeholder="$ 0.00"
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
                    name="descripcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Describe el movimiento..."
                                    rows={3}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={estaEnviando}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={estaEnviando}>
                        {estaEnviando ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            "Guardar"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
