"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SaveIcon, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { postCobertura } from "@/actions/AjustesCP";
import Loading from "@/app/(protected)/loading";
import { nuevoAjusteCPSchema } from "@/schemas/admin/catalogos/catalogosSchemas";

export const NuevoAjusteCP = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevoAjusteCPSchema>>({
        resolver: zodResolver(nuevoAjusteCPSchema),
        defaultValues: {
            CodigoPostal: "",
            IndiceSiniestros: 0,
            AjustePrima: 0,
            CantSiniestros: 0,
        },
    });

    const onSubmit = (valores: z.infer<typeof nuevoAjusteCPSchema>) => {
        startTransition(async () => {
            try {
                const respuesta = await postCobertura(valores);

                if (!respuesta) {
                    toast({
                        title: "Error",
                        description: "Error al crear el ajuste.",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Ajuste creado",
                    description: "El ajuste se ha creado correctamente.",
                });
                form.reset();
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Error al crear el ajuste.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            {isPending && <Loading />}
            <div className="bg-white p-6 shadow-md max-w-lg">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="CodigoPostal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código Postal</FormLabel>
                                    <FormControl>
                                        <Input {...field} maxLength={5} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="IndiceSiniestros"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Índice de Siniestros (%)</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" step="0.01" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="AjustePrima"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ajuste Prima (%)</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" step="0.01" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="CantSiniestros"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cantidad de Siniestros</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isPending} size="lg" className="w-full">
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