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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { postCuentaBancaria } from "@/actions/ClientesActions";

const nuevaCuentaBancariaSchema = z.object({
    NombreBanco: z.string().min(1, "El nombre del banco es requerido"),
    NumeroCuenta: z.string().min(1, "El número de cuenta es requerido"),
    ClabeInterbancaria: z.string().length(18, "La CLABE debe tener 18 dígitos"),
    Activa: z.boolean().default(true),
});

export const NuevaCuentaBancariaForm = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevaCuentaBancariaSchema>>({
        resolver: zodResolver(nuevaCuentaBancariaSchema),
        defaultValues: {
            NombreBanco: "",
            NumeroCuenta: "",
            ClabeInterbancaria: "",
            Activa: true,
        },
    });

    const onSubmit = (valores: z.infer<typeof nuevaCuentaBancariaSchema>) => {
        startTransition(async () => {
            try {
                const respuesta = await postCuentaBancaria(valores);

                if (!respuesta) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear la cuenta bancaria",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Cuenta bancaria creada",
                    description: "La cuenta bancaria se ha creado exitosamente",
                });
                form.reset();
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear la cuenta bancaria",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nueva Cuenta Bancaria</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>

                        <Button type="submit" disabled={isPending}>
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
            </CardContent>
        </Card>
    );
};