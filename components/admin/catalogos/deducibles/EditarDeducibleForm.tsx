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
import { editDeducibleSchema } from "@/schemas/admin/catalogos/catalogosSchemas";
import { patchDeducible } from "@/actions/CatDeduciblesActions";
import { iGetDeducibles } from "@/interfaces/CatDeduciblesInterface";

interface EditarDeducibleFormProps {
    deducible: iGetDeducibles;
    onSave: () => void;
}

export const EditarDeducibleForm = ({ deducible, onSave }: EditarDeducibleFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editDeducibleSchema>>({
        resolver: zodResolver(editDeducibleSchema),
        defaultValues: {
            DeducibleMinimo: Number(deducible.DeducibleMinimo),
            DeducibleMaximo: Number(deducible.DeducibleMaximo),
            Rango: Number(deducible.Rango),
        },
    });

    const onSubmit = (values: z.infer<typeof editDeducibleSchema>) => {
        startTransition(async () => {
            try {
                const resp = await patchDeducible(deducible.DeducibleID, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar el deducible.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Deducible actualizado",
                        description: "El deducible se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar el deducible.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="DeducibleMinimo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Deducible Mínimo</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Ej. 12"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="DeducibleMaximo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Deducible Máximo</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Ej. 23"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="Rango"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rango</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Ej. 7"
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
    );
};
