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
import { iGetEmpleados, TipoEmpleado } from "@/interfaces/EmpleadosInterface";
import { patchEmpleado } from "@/actions/EmpleadosActionts";

const editarEmpleadoSchema = z.object({
    Nombre: z.string().min(1, { message: "El nombre es requerido" }),
    Paterno: z.string().min(1, { message: "El apellido paterno es requerido" }),
    Materno: z.string().optional(),
    FechaNacimiento: z.string().min(1, { message: "La fecha de nacimiento es requerida" }),
    SueldoQuincenal: z.coerce.number().min(0, { message: "El sueldo debe ser mayor a 0" }),
    PorcentajeComisiones: z.coerce.number().min(0, { message: "El porcentaje debe ser mayor a 0" }),
    TipoEmpleadoID: z.coerce.number().min(1, { message: "Debe seleccionar un tipo de empleado" }),
});

interface PropiedadesEditarEmpleadoForm {
    empleado: iGetEmpleados;
    onGuardar: () => void;
    tiposEmpleado?: TipoEmpleado[];
}

export const EditarEmpleadosForm = ({ empleado, onGuardar, tiposEmpleado }: PropiedadesEditarEmpleadoForm) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editarEmpleadoSchema>>({
        resolver: zodResolver(editarEmpleadoSchema),
        defaultValues: {
            Nombre: empleado.Nombre,
            Paterno: empleado.Paterno,
            Materno: empleado.Materno || undefined,
            FechaNacimiento: new Date(empleado.FechaNacimiento).toISOString().split('T')[0],
            SueldoQuincenal: Number(empleado.SueldoQuincenal),
            PorcentajeComisiones: Number(empleado.PorcentajeComisiones),
            TipoEmpleadoID: empleado.TipoEmpleado?.TipoEmpleadoID || 0,
        },
    });

    const onSubmit = (valores: z.infer<typeof editarEmpleadoSchema>) => {
        startTransition(async () => {
            try {
                const respuesta = await patchEmpleado(empleado.EmpleadoID, valores);

                if (!respuesta) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar el empleado.",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Empleado actualizado",
                    description: "El empleado se ha actualizado exitosamente.",
                });

                onGuardar();
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar el empleado.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="Nombre"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="Paterno"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido Paterno</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="Materno"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido Materno</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="FechaNacimiento"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de Nacimiento</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="SueldoQuincenal"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sueldo Quincenal</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="PorcentajeComisiones"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Porcentaje de Comisiones</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {tiposEmpleado && (
                        <FormField
                            control={form.control}
                            name="TipoEmpleadoID"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Empleado</FormLabel>
                                    <Select
                                        onValueChange={(valor) => field.onChange(Number(valor))}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {tiposEmpleado.map((tipo) => (
                                                <SelectItem
                                                    key={tipo.TipoEmpleadoID}
                                                    value={tipo.TipoEmpleadoID.toString()}
                                                >
                                                    {tipo.Descripcion}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <SaveIcon className="w-4 h-4 mr-2" />
                            Guardar Cambios
                        </>
                    )}
                </Button>
            </form>
        </Form>
    );
};