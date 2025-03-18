"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SaveIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/app/(protected)/loading";
import { postTipoPago } from "@/actions/CatTipoPagos";
import { nuevoTipoPagoSchema } from "@/schemas/admin/catalogos/catalogosSchemas";

export const NuevoTipoPagoForm = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevoTipoPagoSchema>>({
        resolver: zodResolver(nuevoTipoPagoSchema),
        defaultValues: {
            Descripcion: "",
            PorcentajeAjuste: 0,
        },
    });

    const onSubmit = (values: z.infer<typeof nuevoTipoPagoSchema>) => {
        startTransition(async () => {
            try {
                const resp = await postTipoPago(values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear el tipo de pago.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Tipo de pago creado",
                        description: "El tipo de pago se ha creado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear el tipo de pago.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            {isPending && <Loading />}
            <div className="bg-white p-6 shadow-md max-w-7xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="Descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Pago Anual" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="PorcentajeAjuste"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Porcentaje Ajuste</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Ej. 10" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Divisor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número de Pagos</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Cantidad de Pagos" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending} size="lg">
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
            </div>
        </>
    );
};
