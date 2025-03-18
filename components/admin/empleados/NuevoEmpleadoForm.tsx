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
import { TipoEmpleado } from "@/interfaces/EmpleadosInterface";
import { postEmpleado } from "@/actions/EmpleadosActionts";
import Loading from "@/app/(protected)/loading";

const nuevoEmpleadoSchema = z.object({
    Nombre: z.string().min(1, { message: "El nombre es requerido" }),
    Paterno: z.string().min(1, { message: "El apellido paterno es requerido" }),
    Materno: z.string().min(1, { message: "El apellido materno es requerido" }),
    FechaNacimiento: z.string().min(1, { message: "La fecha de nacimiento es requerida" }),
    SueldoQuincenal: z.coerce.number().min(0, { message: "El sueldo debe ser mayor a 0" }),
    PorcentajeComisiones: z.coerce.number().min(0, { message: "El porcentaje debe ser mayor a 0" }),
    TipoEmpleadoID: z.coerce.number().min(1, { message: "Debe seleccionar un tipo de empleado" }),
});

interface PropiedadesNuevoEmpleado {
    tiposEmpleado: TipoEmpleado[];
}

export const NuevoEmpleadoForm = ({ tiposEmpleado }: PropiedadesNuevoEmpleado) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevoEmpleadoSchema>>({
        resolver: zodResolver(nuevoEmpleadoSchema),
        defaultValues: {
            Nombre: "",
            Paterno: "",
            Materno: "",
            FechaNacimiento: new Date().toISOString().split('T')[0],
            SueldoQuincenal: 0,
            PorcentajeComisiones: 0,
            TipoEmpleadoID: 0,
        },
    });

    const onSubmit = (valores: z.infer<typeof nuevoEmpleadoSchema>) => {
        startTransition(async () => {
            try {
                const respuesta = await postEmpleado(valores);

                if (!respuesta) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear el empleado.",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Empleado creado",
                    description: "El empleado se ha creado exitosamente.",
                });

                form.reset();
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear el empleado.",
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="Nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre del empleado" {...field} />
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
                                            <Input placeholder="Apellido paterno" {...field} />
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
                                            <Input placeholder="Apellido materno" {...field} />
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
                                                    <SelectValue placeholder="Seleccionar tipo de empleado" />
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
                        </div>

                        <Button type="submit" disabled={isPending} size="lg">
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="w-4 h-4 mr-2" />
                                    Guardar Empleado
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </>
    );
};