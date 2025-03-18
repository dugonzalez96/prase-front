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
import { iGetUsosVehiculo } from "@/interfaces/CatVehiculosInterface";
import { patchUsoVehiculo } from "@/actions/CatVehiculosActions";

const editarUsoVehiculoSchema = z.object({
    Nombre: z.string().min(1, "El nombre es requerido"),
});

interface EditarUsoVehiculoFormProps {
    usoVehiculo: iGetUsosVehiculo;
    onSave: () => void;
}

export const EditarUsoVehiculoForm = ({ usoVehiculo, onSave }: EditarUsoVehiculoFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editarUsoVehiculoSchema>>({
        resolver: zodResolver(editarUsoVehiculoSchema),
        defaultValues: {
            Nombre: usoVehiculo.Nombre,
        },
    });

    const onSubmit = (values: z.infer<typeof editarUsoVehiculoSchema>) => {
        startTransition(async () => {
            try {
                const resp = await patchUsoVehiculo(usoVehiculo.UsoID, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar el uso de vehículo.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Uso de vehículo actualizado",
                        description: "El uso de vehículo se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar el uso de vehículo.",
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
