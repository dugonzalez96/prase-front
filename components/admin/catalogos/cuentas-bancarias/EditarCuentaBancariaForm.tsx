"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { SaveIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { iGetCuentasBancarias } from "@/interfaces/ClientesInterface";
import { patchCuentaBancaria } from "@/actions/ClientesActions";

const editarCuentaBancariaSchema = z.object({
    NombreBanco: z.string().min(1, "El nombre del banco es requerido"),
    NumeroCuenta: z.string().min(1, "El número de cuenta es requerido"),
    ClabeInterbancaria: z.string().length(18, "La CLABE debe tener 18 dígitos"),
    Activa: z.boolean(),
});

interface EditarCuentaBancariaFormProps {
    cuenta: iGetCuentasBancarias;
    alGuardar: () => void;
}

export const EditarCuentaBancariaForm = ({
    cuenta,
    alGuardar
}: EditarCuentaBancariaFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editarCuentaBancariaSchema>>({
        resolver: zodResolver(editarCuentaBancariaSchema),
        defaultValues: {
            NombreBanco: cuenta.NombreBanco,
            NumeroCuenta: cuenta.NumeroCuenta,
            ClabeInterbancaria: cuenta.ClabeInterbancaria,
            Activa: Boolean(cuenta.Activa),
        },
    });

    const onSubmit = (valores: z.infer<typeof editarCuentaBancariaSchema>) => {
        startTransition(async () => {
            try {
                const respuesta = await patchCuentaBancaria(cuenta.CuentaBancariaID, valores);

                if (!respuesta) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar la cuenta bancaria",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Cuenta bancaria actualizada",
                    description: "La cuenta bancaria se ha actualizado exitosamente",
                });
                alGuardar();
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar la cuenta bancaria",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <FormField
                        control={form.control}
                        name="NombreBanco"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del Banco</FormLabel>
                                <FormControl>
                                    <Input placeholder="BBVA, Santander, etc..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="NumeroCuenta"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de Cuenta</FormLabel>
                                <FormControl>
                                    <Input placeholder="Número de cuenta..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="ClabeInterbancaria"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CLABE Interbancaria</FormLabel>
                                <FormControl>
                                    <Input placeholder="18 dígitos..." {...field} maxLength={18} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="Activa"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Estado de la cuenta</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <SaveIcon className="w-4 h-4 mr-2" />
                            Guardar
                        </>
                    )}
                </Button>
            </form>
        </Form>
    );
};