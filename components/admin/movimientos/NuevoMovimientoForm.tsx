"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { SaveIcon, Loader2 } from "lucide-react";
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
import { formatCurrency } from "@/lib/format";
import { postMovimiento } from "@/actions/MovimientosActions";
import { iGetCuentasBancarias } from "@/interfaces/ClientesInterface";
import { iGetUsers } from "@/interfaces/SeguridadInterface";
import { nuevoMovimientoSchema } from "@/schemas/admin/movimientos/movimientosSchema";
import { useTransition } from "react";
import Loading from "@/app/(protected)/loading";

interface PropiedadesFormulario {
    usuarioId: number;
    cuentasBancarias: iGetCuentasBancarias[];
    usuarios: iGetUsers[];
}

const formasPago = ["Efectivo", "Transferencia", "Deposito", "Tarjeta"] as const;

export const NuevoMovimientoForm = ({
    usuarioId,
    cuentasBancarias,
    usuarios
}: PropiedadesFormulario) => {
    const { toast } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof nuevoMovimientoSchema>>({
        resolver: zodResolver(nuevoMovimientoSchema),
        defaultValues: {
            TipoTransaccion: "Ingreso",
            FormaPago: "Efectivo",
            Monto: 0,
            UsuarioCreoID: usuarioId,
            CuentaBancariaID: 0,
            Descripcion: "",
        },
    });

    const onSubmit = async (valores: z.infer<typeof nuevoMovimientoSchema>) => {
        startTransition(async () => {
            try {
                const respuesta = await postMovimiento(valores);

                if (!respuesta || respuesta.error) {
                    toast({
                        title: "Error",
                        description: "Ocurrió un error al crear el movimiento",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Éxito",
                    description: "Movimiento creado correctamente",
                });
                form.reset();
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al crear el movimiento",
                    variant: "destructive",
                });
            }
        });
    };

    const estaEnviando = form.formState.isSubmitting;
    const formaPago = form.watch("FormaPago");
    const esPagoEnEfectivo = formaPago === "Efectivo";

    return (
        <>
            {isPending ? (
                <Loading />
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow-sm container">
                        <FormField
                            control={form.control}
                            name="TipoTransaccion"
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
                                            <SelectItem value="Ingreso">Ingreso</SelectItem>
                                            <SelectItem value="Egreso">Egreso</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="FormaPago"
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
                                    name="UsuarioValidoID"
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
                                    name="CuentaBancariaID"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cuenta Bancaria</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value.toString()}
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
                            name="Monto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto</FormLabel>
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
                            name="Descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Describe el motivo del movimiento..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={estaEnviando}>
                            {estaEnviando ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="mr-2 h-4 w-4" />
                                    Guardar
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            )}
        </>
    );
};