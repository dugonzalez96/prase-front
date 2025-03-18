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
import { editConfiguracionGlobalSchema } from "@/schemas/admin/configuracionGlobal/configuracionGlobalSchema";
import { IGetAllConfiguracionGlobal } from "@/interfaces/ConfiguracionGlobal";
import { patchConfiguracionGlobal } from "@/actions/ConfiguracionGlobal";

interface EditarConfiguracionGlobalProps {
    configuracion: IGetAllConfiguracionGlobal;
    onSave: () => void;
}

export const EditarConfiguracionGlobal = ({ configuracion, onSave }: EditarConfiguracionGlobalProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editConfiguracionGlobalSchema>>({
        resolver: zodResolver(editConfiguracionGlobalSchema),
        defaultValues: {
            ValorConfiguracion: Number(configuracion.ValorConfiguracion),
            Descripcion: configuracion.Descripcion,
        },
    })

    const onSubmit = (values: z.infer<typeof editConfiguracionGlobalSchema>) => {
        startTransition(async () => {
            try {
                const resp = await patchConfiguracionGlobal(configuracion.ConfiguracionID, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar la configuración global.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Configuración global actualizada",
                        description: "La configuración global se actualizó correctamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar la configuración global.",
                    variant: "destructive",
                });
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                    <FormField
                        control={form.control}
                        name="ValorConfiguracion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor de la Configuración</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Valor de Configuración..."
                                        {...field}
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
                                    <Input
                                        type="text"
                                        placeholder="Descripción..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isPending} size="lg" className="mt-4 rounded-md">
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
                </div>
            </form>
        </Form >
    );
}