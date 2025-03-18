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
import { nuevoGrupoSchema } from "@/schemas/admin/catalogos/catalogosSchemas";
import { postGroup } from "@/actions/SeguridadActions";


export const NuevoGroupForm = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevoGrupoSchema>>({
        resolver: zodResolver(nuevoGrupoSchema),
        defaultValues: {
            nombre: '',
            descripcion: '',
        },
    });

    const onSubmit = (values: z.infer<typeof nuevoGrupoSchema>) => {
        startTransition(async () => {
            try {
                const resp = await postGroup(values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear el grupo.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Grupo creado",
                        description: "El grupo se ha creado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear el grupo.",
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del grupo</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nombre del grupo..."
                                            {...field}
                                        />
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
                                    <FormLabel>Descripción del grupo</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Descripción del grupo..."
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
