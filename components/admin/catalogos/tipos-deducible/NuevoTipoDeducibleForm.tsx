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
import { postTipoDeducible } from "@/actions/CatDeduciblesActions";
import { nuevoTipoDeducibleSchema } from "@/schemas/admin/catalogos/catalogosSchemas";

export const NuevoTipoDeducibleForm = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevoTipoDeducibleSchema>>({
        resolver: zodResolver(nuevoTipoDeducibleSchema),
        defaultValues: {
            Nombre: "",
        },
    });

    const onSubmit = (values: z.infer<typeof nuevoTipoDeducibleSchema>) => {
        startTransition(async () => {
            try {
                const resp = await postTipoDeducible(values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear el tipo de deducible.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Tipo de deducible creado",
                        description: "El tipo de deducible se ha creado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear el tipo de deducible.",
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
                                    <FormLabel>Nombre del tipo de deducible</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Deducible alto" {...field} />
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
