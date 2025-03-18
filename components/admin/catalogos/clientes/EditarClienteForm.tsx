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
import { SaveIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast";

// actions
import { patchCliente } from '@/actions/ClientesActions';
// interfaces
import { iGetCliente } from '@/interfaces/ClientesInterface';
// schemas
import { patchClientechema } from '@/schemas/admin/clientes/clienteSchema';

interface EditarClienteFormProps {
    cliente: iGetCliente;
    onSave: () => void;
}

export const EditarClienteForm = ({ cliente, onSave }: EditarClienteFormProps) => {

    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof patchClientechema>>({
        resolver: zodResolver(patchClientechema),
        defaultValues: {
            Direccion: cliente?.Direccion || '',      // Inicializa con un valor por defecto si cliente está indefinido
            Telefono: cliente?.Telefono || '',
        },
    })

    const onSubmit = (values: z.infer<typeof patchClientechema>) => {
        startTransition(async () => {

            try {
                const resp = await patchCliente(cliente.ClienteID, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar el cliente.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Cliente actualizado",
                        description: "La cliente se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar el cliente.",
                    variant: "destructive",
                });
            }
        });
    };


    return (
        <div className="max-h-[80vh] overflow-y-auto">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 pr-2"
                >
                    <FormField
                        control={form.control}
                        name="Direccion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Direccion</FormLabel>
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
                    <FormField
                        control={form.control}
                        name="Telefono"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Telefono</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Telefono..."
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
    )
}