"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, SaveIcon } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { postVehiculoSchema } from "@/schemas/admin/vehiculos/vehiculosSchema"
import { postVehiculo } from "@/actions/vehiculoActions"
import { iGetCliente } from "@/interfaces/ClientesInterface"
import { iGetTiposVehiculo, iGetUsosVehiculo } from "@/interfaces/CatVehiculosInterface"
import { formatCurrency } from "@/lib/format"

interface Props {
    clientes: iGetCliente[];
    tiposVehiculo: iGetTiposVehiculo[];
    usosVehiculo: iGetUsosVehiculo[];
}

export const NuevoVehiculoForm = ({ clientes, tiposVehiculo, usosVehiculo }: Props) => {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast();
    const router = useRouter();

    //TODO: Agregar campos correspondientes
    const form = useForm<z.infer<typeof postVehiculoSchema>>({
        resolver: zodResolver(postVehiculoSchema),
        defaultValues: {
            ClienteID: 0,
            Marca: "",
            Submarca: "",
            Modelo: 0,
            Version: "",
            AnoFabricacion: 0,
            TipoVehiculo: "",
            ValorVehiculo: 0,
            ValorFactura: 0,
            FechaRegistro: new Date().toISOString(),
            UsoVehiculo: "",
            ZonaResidencia: "",
            Salvamento: 0,
            NoMotor: "",
            Placas: "",
            VIN: "",
        },
    })
    //TODO: Falta agregar los nuevos parámetros de vehículo
    const onSubmit = (values: z.infer<typeof postVehiculoSchema>) => {
        startTransition(async () => {

            try {
                const resp = await postVehiculo(values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear el vehículo.",
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
                    description: "Hubo un problema al crear el vehículo.",
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
                                name="Marca"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marca</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nombre completo de la marca del vehículo..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="Modelo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Modelo</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nombre del modelo del vehículo..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="AnoFabricacion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Año de Fabricación</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1900}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="TipoVehiculo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Vehículo</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {tiposVehiculo.map((tipo) => (
                                                    <SelectItem
                                                        key={tipo.TipoID}
                                                        value={tipo.TipoID.toString()}
                                                    >
                                                        {tipo.Nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="UsoVehiculo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Uso del Vehículo</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar uso" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {usosVehiculo.map((uso, index) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={uso?.UsoID.toString() ?? ""}
                                                    >
                                                        {uso?.Nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ValorVehiculo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor del Vehículo</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={formatCurrency(field.value)}
                                                onChange={(e) => {
                                                    const valor = e.target.value.replace(/[^0-9]/g, "");
                                                    field.onChange(Number(valor) / 100);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ValorFactura"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Factura</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={formatCurrency(field.value)}
                                                onChange={(e) => {
                                                    const valor = e.target.value.replace(/[^0-9]/g, "");
                                                    field.onChange(Number(valor) / 100);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="Placas"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Placas</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Placas del vehículo..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="NoMotor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de motor</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Número de motor del vehículo..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="VIN"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de serie</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Número de serie del vehículo..."
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
                                                placeholder="Zona de residencia..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ClienteID"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clientes.map((cliente) => (
                                                        <SelectItem key={cliente.ClienteID} value={cliente.ClienteID + ''}>
                                                            {cliente.NombreCompleto}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
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
                                    Guardar
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </>
    );
}
