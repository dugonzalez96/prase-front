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
import { iGetApplications } from "@/interfaces/SeguridadInterface";
import { editApplicationSchema } from "@/schemas/admin/catalogos/catalogosSchemas";
import { patchApplication } from "@/actions/SeguridadActions";
import { Textarea } from "@/components/ui/textarea";

interface EditarApplicationFormProps {
    application: iGetApplications;
    onSave: () => void;
}

export const EditarApplicationForm = ({ application, onSave }: EditarApplicationFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const categorias = [
        'Administración',
        'Catalogos',
        'Cotizaciones',
        'Siniestros',
        'Reportería',
        'Control de Cajas',
        'Recursos Humanos'
    ];

    const form = useForm<z.infer<typeof editApplicationSchema>>({
        resolver: zodResolver(editApplicationSchema),
        defaultValues: {
            nombre: application.nombre,
            descripcion: application.descripcion,
            icon: application.icon || '',
            color: application.color || '#000000',
            categoria: application.categoria ? application.categoria : 'Administración',
        },
    });

    const onSubmit = (values: z.infer<typeof editApplicationSchema>) => {
        startTransition(async () => {
            try {
                const resp = await patchApplication(application.id, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar la aplicación.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Aplicación actualizada",
                        description: "La aplicación se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar la aplicación.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nombre de la aplicación..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ícono</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ícono de la aplicación..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">

                    <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Color</FormLabel>
                                <FormControl>
                                    <div className="flex">
                                        <Input
                                            id="color"
                                            name="color"
                                            type="color"
                                            value={field.value || '#000000'} // Usar el valor directamente del campo
                                            onChange={(e) => field.onChange(e.target.value)} // Actualizar el valor con onChange
                                            required
                                            className="w-12 p-1 mr-2"
                                        />
                                        <Input
                                            type="text"
                                            value={field.value || '#000000'} // Sincronizar el texto con el valor del campo
                                            onChange={(e) => field.onChange(e.target.value)} // Asegurarse de que el cambio actualice el valor
                                            name="color"
                                            className="flex-grow"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="categoria"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoría</FormLabel>
                                <FormControl>
                                    <select {...field} className="w-full border border-gray-300 rounded-md p-2">
                                        {categorias.map((categoria) => (
                                            <option key={categoria} value={categoria}>
                                                {categoria}
                                            </option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción de la aplicación</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Descripción de la aplicación..." {...field} />
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
