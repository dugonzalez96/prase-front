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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { iGetTiposVehiculo, iGetUsosVehiculo } from "@/interfaces/CatVehiculosInterface";
import { patchTipoVehiculo } from "@/actions/CatVehiculosActions";

const editarTipoVehiculoSchema = z.object({
    Nombre: z.string().min(1, "El nombre es requerido"),
    UsoID: z.number().min(1, "Debe seleccionar un uso de vehículo"),
});

interface EditarTipoVehiculoFormProps {
    tipoVehiculo: iGetTiposVehiculo;
    usosVehiculo: iGetUsosVehiculo[];
    onSave: () => void;
}

export const EditarTipoVehiculoForm = ({ tipoVehiculo, usosVehiculo, onSave }: EditarTipoVehiculoFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editarTipoVehiculoSchema>>({
        resolver: zodResolver(editarTipoVehiculoSchema),
        defaultValues: {
            Nombre: tipoVehiculo.Nombre,
            UsoID: tipoVehiculo.uso.UsoID,
        },
    });

    const onSubmit = (values: z.infer<typeof editarTipoVehiculoSchema>) => {
        startTransition(async () => {
            try {
                const resp = await patchTipoVehiculo(tipoVehiculo.TipoID, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar el tipo de vehículo.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Tipo de vehículo actualizado",
                        description: "El tipo de vehículo se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar el tipo de vehículo.",
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
                            <FormLabel>Nombre del tipo de vehículo</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Sedán, SUV" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="UsoID"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Uso del vehículo</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    defaultValue={field.value ? field.value.toString() : undefined}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione el uso del vehículo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {usosVehiculo.map((uso) => (
                                            <SelectItem key={uso.UsoID} value={uso.UsoID.toString()}>
                                                {uso.Nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
