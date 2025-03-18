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
import { iGetTiposDeducible } from "@/interfaces/CatDeduciblesInterface";
import { patchTipoDeducible } from "@/actions/CatDeduciblesActions";

const editarTipoDeducibleSchema = z.object({
    Nombre: z.string().min(1, "El nombre es requerido"),
});

interface EditarTipoDeducibleFormProps {
    deducible: iGetTiposDeducible;
    onSave: () => void;
}

export const EditarTipoDeducibleForm = ({ deducible, onSave }: EditarTipoDeducibleFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editarTipoDeducibleSchema>>({
        resolver: zodResolver(editarTipoDeducibleSchema),
        defaultValues: {
            Nombre: deducible.Nombre,
        },
    });

    const onSubmit = (values: z.infer<typeof editarTipoDeducibleSchema>) => {
        startTransition(async () => {
            try {
                const resp = await patchTipoDeducible(deducible.TipoDeducibleID, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar el tipo de deducible.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Tipo de deducible actualizado",
                        description: "El tipo de deducible se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar el tipo de deducible.",
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
                            <FormLabel>Nombre del tipo de deducible</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Deducible alto" {...field} />
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
