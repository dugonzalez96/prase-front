"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// actions
import { patchVehiculo } from '@/actions/vehiculoActions';
// interfaces
import { iGetVehiculo } from '@/interfaces/VehiculoInterface';
// schemas
import { patchVehiculoSchema } from '@/schemas/admin/vehiculos/vehiculosSchema';
import { formatCurrency } from "@/lib/format";

interface EditarVehiculoFormProps {
    vehiculo: iGetVehiculo;
    onSave: () => void;
}

export const EditarVehiculoForm = ({ vehiculo, onSave }: EditarVehiculoFormProps) => {

    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof patchVehiculoSchema>>({
        resolver: zodResolver(patchVehiculoSchema),
        defaultValues: {
            ValorVehiculo: vehiculo?.ValorVehiculo || 0,
            UsoVehiculo: vehiculo?.UsoVehiculo || ''
        },
    })

    const onSubmit = (values: z.infer<typeof patchVehiculoSchema>) => {
        startTransition(async () => {

            try {
                const resp = await patchVehiculo(vehiculo.VehiculoID, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar el vehículo.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Vehículo actualizado",
                        description: "El vehículo se ha actualizado correctamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar el vehículo.",
                    variant: "destructive",
                });
            }
        });
    }

    return (
        <>
            <div className="max-h-[80vh] overflow-y-auto">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8 pr-2"
                    >
                        <FormField
                            control={form.control}
                            name="ValorVehiculo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor del Vehículo</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Valor del vehículo..."
                                            {...field}
                                            value={formatCurrency(field.value)}
                                            onChange={(e) => {
                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                field.onChange(Number(valor) / 100);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="UsoVehiculo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Uso del Vehículo</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Direccion..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending} size="lg" className="rounded-md w-full">
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
    )
}