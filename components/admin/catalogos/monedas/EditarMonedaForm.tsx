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
import { iGetTiposMoneda } from "@/interfaces/CatCoberturasInterface";
import { patchMoneda } from "@/actions/CatMonedasActions";
import { editMonedaSchema } from "@/schemas/admin/catalogos/catalogosSchemas";

interface EditarMonedaFormProps {
    moneda: iGetTiposMoneda;
    onSave: () => void;
}

export const EditarMonedaForm = ({ moneda, onSave }: EditarMonedaFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editMonedaSchema>>({
        resolver: zodResolver(editMonedaSchema),
        defaultValues: {
            Nombre: moneda.Nombre,
            Abreviacion: moneda.Abreviacion,
        },
    });

    const onSubmit = (values: z.infer<typeof editMonedaSchema>) => {
        startTransition(async () => {
            try {
                const resp = await patchMoneda(moneda.TipoMonedaID, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar la moneda.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Moneda actualizada",
                        description: "La moneda se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar la moneda.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="Nombre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="Ej. Dólar Americano"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="Abreviacion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Abreviación</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="Ej. USD"
                                    {...field}
                                />
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
    );
};
