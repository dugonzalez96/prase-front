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
import { Ajuste } from "@/interfaces/AjustesCPInterace";
import { patchCobertura } from "@/actions/AjustesCP";
import { editarAjusteCPSchema } from "@/schemas/admin/catalogos/catalogosSchemas";

interface Props {
    ajuste: Ajuste;
    alGuardar: () => void;
}

export const EditarAjusteCP = ({ ajuste, alGuardar }: Props) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editarAjusteCPSchema>>({
        resolver: zodResolver(editarAjusteCPSchema),
        defaultValues: {
            IndiceSiniestros: Number(ajuste.IndiceSiniestros),
            AjustePrima: Number(ajuste.AjustePrima),
            CantSiniestros: ajuste.CantSiniestros,
        },
    });

    const onSubmit = (valores: z.infer<typeof editarAjusteCPSchema>) => {
        // console.log(valores)
        // console.log(ajuste.CodigoPostal)
        startTransition(async () => {
            try {
                const respuesta = await patchCobertura(valores, ajuste.CodigoPostal);

                if (!respuesta) {
                    toast({
                        title: "Error",
                        description: "Error al actualizar el ajuste.",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Ajuste actualizado",
                    description: "El ajuste se ha actualizado correctamente.",
                });
                form.reset();
                alGuardar();
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Error al actualizar el ajuste.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
    );
};