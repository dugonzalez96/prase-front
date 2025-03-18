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
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import { patchTipoPago } from "@/actions/CatTipoPagos";
import { editarTipoPagoSchema } from "@/schemas/admin/catalogos/catalogosSchemas";

interface EditarTipoPagoFormProps {
    tipoPago: iGetTipoPagos;
    onSave: () => void;
}

export const EditarTipoPagoForm = ({ tipoPago, onSave }: EditarTipoPagoFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editarTipoPagoSchema>>({
        resolver: zodResolver(editarTipoPagoSchema),
        defaultValues: {
            Descripcion: tipoPago.Descripcion,
            PorcentajeAjuste: parseFloat(tipoPago.PorcentajeAjuste),
            Divisor: tipoPago.Divisor.toString()
        },
    });

    const onSubmit = (values: z.infer<typeof editarTipoPagoSchema>) => {
        startTransition(async () => {
            try {
                const resp = await patchTipoPago(tipoPago.TipoPagoID, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar el tipo de pago.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Tipo de pago actualizado",
                        description: "El tipo de pago se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar el tipo de pago.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="Descripcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Pago a plazos" {...field} />
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
                                <Input type="number" placeholder="Ej. Cantidad de pagos 4" {...field} />
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
    );
};
