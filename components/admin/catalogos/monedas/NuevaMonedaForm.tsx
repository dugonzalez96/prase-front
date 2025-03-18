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
import { nuevaMonedaSchema } from "@/schemas/admin/catalogos/catalogosSchemas";
import { postMoneda } from "@/actions/CatMonedasActions";

export const NuevaMonedaForm = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevaMonedaSchema>>({
        resolver: zodResolver(nuevaMonedaSchema),
        defaultValues: {
            Nombre: "",
            Abreviacion: "",
        },
    });

    const onSubmit = (values: z.infer<typeof nuevaMonedaSchema>) => {
        startTransition(async () => {
            try {
                const resp = await postMoneda(values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear la moneda.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Moneda creada",
                        description: "La moneda se ha creado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear la moneda.",
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
                            name="Nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la moneda</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Dólar Americano" {...field} />
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
                                        <Input placeholder="Ej. USD" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending} size="lg" className="mt-8">
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
