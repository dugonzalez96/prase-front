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
import { iGetTiposSumasAseguradas } from "@/interfaces/CatTiposSumasInterface";
import { patchTipoSumaAsegurada } from "@/actions/CatSumasAseguradasActions";
import { editTipoSumaSchema } from "@/schemas/admin/catalogos/catalogosSchemas";

interface EditarTipoSumaFormProps {
    tipoSumaAsegurada: iGetTiposSumasAseguradas;
    onSave: () => void;
}

export const EditarTipoSumaForm = ({ tipoSumaAsegurada, onSave }: EditarTipoSumaFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editTipoSumaSchema>>({
        resolver: zodResolver(editTipoSumaSchema),
        defaultValues: {
            NombreTipo: tipoSumaAsegurada.NombreTipo,
            DescripcionSuma: tipoSumaAsegurada.DescripcionSuma,
        },
    });

    const onSubmit = (values: z.infer<typeof editTipoSumaSchema>) => {
        startTransition(async () => {
            try {
                const resp = await patchTipoSumaAsegurada(tipoSumaAsegurada.TipoSumaAseguradaID, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar el tipo de suma asegurada.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Tipo de Suma Asegurada actualizado",
                        description: "El tipo de suma asegurada se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar el tipo de suma asegurada.",
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
                    name="NombreTipo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Tipo de Suma Asegurada</FormLabel>
                            <FormControl>
                                <Input placeholder="Tipo de suma asegurada..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="DescripcionSuma"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción del Tipo de Suma Asegurada</FormLabel>
                            <FormControl>
                                <Input placeholder="Descripción de la suma asegurada..." {...field} />
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
