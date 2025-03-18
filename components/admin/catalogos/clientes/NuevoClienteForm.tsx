"use client"

import Loading from "@/app/(protected)/loading"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, SaveIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { postClienteSchema } from "@/schemas/admin/clientes/clienteSchema"
import { postCliente } from "@/actions/ClientesActions"

export const NuevoClienteForm = () => {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof postClienteSchema>>({
        resolver: zodResolver(postClienteSchema),
        defaultValues: {
            NombreCompleto: "",
            FechaNacimiento: "",
            Genero: "",
            Direccion: "",
            Telefono: "",
            Email: "",
            HistorialSiniestros: 0,
            HistorialReclamos: 0,
            ZonaResidencia: "",
            FechaRegistro: "",
            RFC: "",
        },
    })

    const onSubmit = (values: z.infer<typeof postClienteSchema>) => {
        startTransition(async () => {

            try {
                const resp = await postCliente(values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear el cliente.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Cliente creado",
                        description: "El cliente ha sido creado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear el cliente.",
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
                    <form onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="NombreCompleto"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre Completo</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nombre completo..."
                                                {...field}
                                            />
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
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    const dateValue = e.target.value;
                                                    field.onChange(dateValue);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="Genero"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Genero</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Masculino">Masculino</SelectItem>
                                                    <SelectItem value="Femenino">Femenino</SelectItem>
                                                    <SelectItem value="Otro">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                            <FormField
                                control={form.control}
                                name="Email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Email..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="RFC"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>RFC</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="RFC..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="HistorialSiniestros"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Historial de Siniestros</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Historial de Siniestros..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="HistorialReclamos"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Historial de Reclamos</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Historial de Reclamos..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ZonaResidencia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zona de Residencia</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Zona de Residencia..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="FechaRegistro"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Registro</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    const dateValue = e.target.value;
                                                    field.onChange(dateValue);
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

                        </div>
                    </form>
                </Form>
            </div>
        </>
    )

}