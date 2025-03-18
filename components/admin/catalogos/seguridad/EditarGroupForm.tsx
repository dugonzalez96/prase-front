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
import { iGetGroups, iPatchGroup } from "@/interfaces/SeguridadInterface";
import { patchGroup } from "@/actions/SeguridadActions";
import { groupEditSchema } from "@/schemas/admin/catalogos/catalogosSchemas";

interface EditarGrupoFormProps {
    group: iGetGroups;
    onSave: () => void;
}

export const EditarGrupoForm = ({ group, onSave }: EditarGrupoFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof groupEditSchema>>({
        resolver: zodResolver(groupEditSchema),
        defaultValues: {
            nombre: group.nombre,
            descripcion: group.descripcion,
        },
    });

    const onSubmit = (values: iPatchGroup) => {
        startTransition(async () => {
            try {
                const resp = await patchGroup(group.id, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar el grupo.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Grupo actualizado",
                        description: "El grupo se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar el grupo.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del grupo</FormLabel>
                            <FormControl>
                                <Input placeholder="Nombre del grupo..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Input placeholder="Descripción del grupo..." {...field} />
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
    );
};
