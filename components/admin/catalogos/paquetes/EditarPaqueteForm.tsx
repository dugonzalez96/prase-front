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
import { patchPaqueteCobertura } from "@/actions/CatPaquetesActions";
import { iGetAllPaquetes } from "@/interfaces/CatPaquetesInterface";
import { editPaqueteSchema } from "@/schemas/admin/catalogos/catalogosSchemas";
import { formatCurrency } from "@/lib/format";
import { Textarea } from "@/components/ui/textarea";

interface EditarPaqueteFormProps {
    paquete: iGetAllPaquetes;
    onSave: () => void;
}

export const EditarPaqueteForm = ({ paquete, onSave }: EditarPaqueteFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editPaqueteSchema>>({
        resolver: zodResolver(editPaqueteSchema),
        defaultValues: {
            NombrePaquete: paquete.NombrePaquete,
            DescripcionPaquete: paquete.DescripcionPaquete,
            PrecioTotalFijo: Number(paquete.PrecioTotalFijo),
        },
    });

    const onSubmit = (values: z.infer<typeof editPaqueteSchema>) => {
        const newValues = {
            ...values,
            PrecioTotalFijo: values.PrecioTotalFijo.toString(),
        }
        startTransition(async () => {
            try {
                const resp = await patchPaqueteCobertura(paquete.PaqueteCoberturaID, newValues);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar el paquete.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Paquete actualizado",
                        description: "El paquete se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar el paquete.",
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
                    name="NombrePaquete"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del paquete</FormLabel>
                            <FormControl>
                                <Input placeholder="Paquete de cobertura..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="DescripcionPaquete"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción del paquete</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe lo que incluye el paquete..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="PrecioTotalFijo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Precio Total Fijo</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Costo fijo del paquete..."
                                    {...field}
                                    value={formatCurrency(field.value)}
                                    onChange={(e) => {
                                        const valor = e.target.value.replace(/[^0-9]/g, "");
                                        field.onChange(Number(valor) / 100)
                                    }}
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
