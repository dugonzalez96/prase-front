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
import { postUsoVehiculo } from "@/actions/CatVehiculosActions";
import { nuevoUsoVehiculoSchema } from "@/schemas/admin/catalogos/catalogosSchemas";

export const NuevoUsoVehiculoForm = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevoUsoVehiculoSchema>>({
        resolver: zodResolver(nuevoUsoVehiculoSchema),
        defaultValues: {
            Nombre: "",
        },
    });

    const onSubmit = (values: z.infer<typeof nuevoUsoVehiculoSchema>) => {
        startTransition(async () => {
            try {
                const resp = await postUsoVehiculo(values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear el uso de vehículo.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Uso de vehículo creado",
                        description: "El uso de vehículo se ha creado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear el uso de vehículo.",
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
                                    <FormLabel>Nombre del uso de vehículo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Comercial, Particular" {...field} />
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
