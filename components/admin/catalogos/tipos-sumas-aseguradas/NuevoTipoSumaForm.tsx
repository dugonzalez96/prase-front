"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
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
import Loading from "@/app/(protected)/loading";
import { postTipoSumaAsegurada } from "@/actions/CatSumasAseguradasActions";
import { nuevoTipoSumaSchema } from "@/schemas/admin/catalogos/catalogosSchemas";

export const NuevoTipoSumaForm = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevoTipoSumaSchema>>({
        resolver: zodResolver(nuevoTipoSumaSchema),
        defaultValues: {
            NombreTipo: '',
            DescripcionSuma: '',
        },
    });

    const onSubmit = (values: z.infer<typeof nuevoTipoSumaSchema>) => {
        startTransition(async () => {
            try {
                const resp = await postTipoSumaAsegurada(values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear el tipo de suma asegurada.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Tipo de Suma Asegurada creado",
                        description: "El tipo de suma asegurada se ha creado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear el tipo de suma asegurada.",
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="NombreTipo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Tipo de Suma Asegurada</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nombre del tipo de suma asegurada..."
                                            {...field}
                                        />
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
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Describe el tipo de suma asegurada..."
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
            </div>
        </>
    );
};
