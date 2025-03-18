"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { iGetVehiculo, iPostVehiculo } from "@/interfaces/VehiculoInterface";
import { getAllVehiculos, postVehiculo } from "@/actions/vehiculoActions";
import { getTiposVehiculo, getUsoVehiculo } from "@/actions/CatVehiculosActions";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import { iGetTiposVehiculo, iGetUsosVehiculo } from "@/interfaces/CatVehiculosInterface";
import Loading from "@/app/(protected)/loading";
import { formatCurrency } from "@/lib/format";
import { ArrowRight } from "lucide-react";

type VehiculoFormData = z.infer<typeof vehiculoSchema>;

const vehiculoSchema = z.object({
    vehiculoExistente: z.string(),
    ClienteID: z.coerce.number(),
    Marca: z.string().min(1, {
        message: "Requerido"
    }),
    Submarca: z.string().min(1, {
        message: "Requerido"
    }),
    Version: z.string().min(1, { message: "Requerido" }),
    Modelo: z.coerce.number(),
    TipoVehiculo: z.string().min(1),
    ValorVehiculo: z.coerce.number().min(10000, { message: "Debe ser un número mayor o igual a 10,000" }),
    ValorFactura: z.coerce.number().min(10000, { message: "Debe ser un número mayor o igual a 10,000" }),
    FechaRegistro: z.string(),
    UsoVehiculo: z.string().min(1, {
        message: "Requerido"
    }),
    ZonaResidencia: z.string().min(1, {
        message: "Requerido"
    }),
    Salvamento: z.coerce.number().min(0, { message: "Debe ser un número mayor o igual a 0" }),
    NoMotor: z.string().min(1, { message: "Requerido" }),
    Placas: z.string().min(1, { message: "Requerido" }),
    VIN: z.string().min(1, { message: "Requerido" }),
    NumOcupantes: z.coerce.number(),
});

interface VehiculoPolizaStepProps {
    clienteId: number;
    cotizacion: iGetCotizacion;
    alSubmit: (idVehiculo: number) => void;
    zona: string;
}

export const VehiculoPolizaStep = ({
    clienteId,
    cotizacion,
    alSubmit,
    zona
}: VehiculoPolizaStepProps) => {
    const [vehiculos, setVehiculos] = useState<iGetVehiculo[]>([]);
    const [tiposVehiculo, setTiposVehiculo] = useState<iGetTiposVehiculo[]>([]);
    const [usosVehiculo, setUsosVehiculo] = useState<iGetUsosVehiculo[]>([]);
    const [cargando, setCargando] = useState(true);

    const vehiculosCliente = vehiculos.filter(v => v.ClienteID === clienteId);

    const form = useForm<VehiculoFormData>({
        resolver: zodResolver(vehiculoSchema),
        defaultValues: {
            vehiculoExistente: "",
            ClienteID: 0,
            Marca: cotizacion.Marca,
            Submarca: cotizacion.Submarca,
            Version: cotizacion.Version,
            Modelo: Number(cotizacion.Modelo),
            TipoVehiculo: cotizacion.TipoVehiculo.toString(),
            ValorVehiculo: Number(cotizacion.SumaAsegurada),
            ValorFactura: Number(cotizacion.SumaAsegurada),
            FechaRegistro: new Date().toISOString(),
            UsoVehiculo: cotizacion.UsoVehiculo.toString(),
            ZonaResidencia: zona,
            Salvamento: 0,
            NoMotor: cotizacion.NoMotor ?? "",
            Placas: cotizacion.Placa ?? "",
            VIN: cotizacion.VIN ?? "",
            NumOcupantes: 5,
        },
        mode: "onChange", // Activar validación en tiempo real
    });

    // Obtener el estado de validación del formulario
    const { isValid, isDirty } = form.formState;

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [vehiculosResp, tiposResp, usosResp] = await Promise.all([
                    getAllVehiculos(),
                    getTiposVehiculo(),
                    getUsoVehiculo()
                ]);

                if (vehiculosResp) setVehiculos(vehiculosResp);
                if (tiposResp) setTiposVehiculo(tiposResp);
                if (usosResp) setUsosVehiculo(usosResp);
            } catch (error) {
                console.error('Error al cargar los datos:', error);
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, []);

    const manejarSeleccionVehiculo = (valorSeleccionado: string) => {
        if (valorSeleccionado === "nuevo") {
            form.reset({
                vehiculoExistente: "",
                ClienteID: 0,
                Marca: cotizacion.Marca,
                Submarca: cotizacion.Submarca,
                Modelo: Number(cotizacion.Modelo),
                TipoVehiculo: cotizacion.TipoVehiculo.toString(),
                ValorVehiculo: 0,
                ValorFactura: 0,
                FechaRegistro: new Date().toISOString(),
                UsoVehiculo: cotizacion.UsoVehiculo.toString(),
                ZonaResidencia: zona,
                Salvamento: 0,
                NoMotor: cotizacion.NoMotor ?? "",
                Placas: cotizacion.Placa ?? "",
                VIN: cotizacion.VIN ?? "",
            });
        } else {
            const vehiculoSeleccionado = vehiculos.find(
                vehiculo => vehiculo.VehiculoID.toString() === valorSeleccionado
            );

            if (vehiculoSeleccionado) {
                form.reset({
                    vehiculoExistente: valorSeleccionado,
                    ClienteID: vehiculoSeleccionado.ClienteID,
                    Marca: vehiculoSeleccionado.Marca,
                    Submarca: vehiculoSeleccionado.Submarca,
                    Modelo: Number(vehiculoSeleccionado.Modelo),
                    TipoVehiculo: vehiculoSeleccionado.TipoVehiculo,
                    FechaRegistro: vehiculoSeleccionado.FechaRegistro,
                    ValorVehiculo: vehiculoSeleccionado.ValorVehiculo,
                    ValorFactura: Number(vehiculoSeleccionado.ValorFactura),
                    UsoVehiculo: vehiculoSeleccionado.UsoVehiculo.toString(),
                    ZonaResidencia: vehiculoSeleccionado.ZonaResidencia,
                    NoMotor: vehiculoSeleccionado.NoMotor ?? "",
                    Placas: vehiculoSeleccionado.Placas ?? "",
                    VIN: vehiculoSeleccionado.VIN ?? "",
                    Salvamento: 0,
                });
            }
        }
    };

    const manejarCambioTipo = (valor: string) => {
        form.setValue("TipoVehiculo", valor);

        const usoAsociado = tiposVehiculo.find(tipo => tipo.TipoID.toString() === valor)?.uso;
        if (usoAsociado) {
            form.setValue("UsoVehiculo", usoAsociado.UsoID.toString());
        }
    };

    const onSubmit = async (datos: VehiculoFormData) => {
        if (datos.vehiculoExistente) {
            alSubmit(parseInt(datos.vehiculoExistente));
            return;
        }

        const datosVehiculo: iPostVehiculo = {
            ClienteID: clienteId,
            Marca: datos.Marca,
            Modelo: datos.Modelo,
            Submarca: datos.Submarca,
            Version: datos.Version,
            TipoVehiculo: datos.TipoVehiculo,
            ValorVehiculo: datos.ValorVehiculo,
            ValorFactura: datos.ValorFactura,
            FechaRegistro: new Date().toISOString(),
            UsoVehiculo: datos.UsoVehiculo,
            ZonaResidencia: datos.ZonaResidencia,
            Salvamento: 1,
            NoMotor: datos.NoMotor,
            VIN: datos.VIN,
            Placas: datos.Placas,
        };

        try {
            const respuesta = await postVehiculo(datosVehiculo);
            if (respuesta?.VehiculoID) {
                alSubmit(respuesta.VehiculoID);
            }
        } catch (error) {
            console.error('Error al registrar vehículo:', error);
        }
    };

    const deshabilitarCampos = !!form.watch("vehiculoExistente");

    if (cargando) {
        return <Loading />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información del Vehículo</CardTitle>
                <CardDescription>
                    {vehiculosCliente.length > 0
                        ? "Selecciona un vehículo existente o registra uno nuevo"
                        : "El cliente no cuenta con vehículos registrados"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {vehiculosCliente.length > 0 && (
                            <FormField
                                control={form.control}
                                name="vehiculoExistente"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vehículo</FormLabel>
                                        <Select
                                            onValueChange={manejarSeleccionVehiculo}
                                            value={field.value || "nuevo"}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar vehículo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="nuevo">Nuevo Vehículo</SelectItem>
                                                {vehiculosCliente.map((vehiculo) => (
                                                    <SelectItem
                                                        key={vehiculo.VehiculoID}
                                                        value={vehiculo.VehiculoID.toString()}
                                                    >
                                                        {`${vehiculo.Marca} ${vehiculo.Submarca} ${vehiculo.Modelo} `}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="Marca"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marca</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Submarca"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Submarca</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Version"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Versión</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} />
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
                                            <Input {...field} disabled={deshabilitarCampos} />
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
                                            onValueChange={manejarCambioTipo}
                                            value={field.value?.toString()}
                                            disabled={deshabilitarCampos}
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
                                            onValueChange={(valor) => {
                                                // console.log(typeof(valor))
                                                form.setValue("UsoVehiculo", valor)
                                            }}
                                            value={field.value?.toString()}
                                            disabled={deshabilitarCampos}
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
                                name="NumOcupantes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Ocupantes</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* <FormField
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
                                                disabled={deshabilitarCampos}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}

                            {/* <FormField
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
                                                disabled={deshabilitarCampos}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}

                            <FormField
                                control={form.control}
                                name="Placas"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Placas</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} placeholder="REA5610" />
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
                                            <Input {...field} disabled={deshabilitarCampos} placeholder="1234567890" />
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
                                        <FormLabel>VIN</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} placeholder="3VWSK69M12M123069" />
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
                                            <Input {...field} disabled={deshabilitarCampos} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <Button
                                type="submit"
                                disabled={
                                    !isValid ||
                                    (!isDirty && !form.watch("vehiculoExistente")) // Habilitar si hay vehículo existente seleccionado
                                }
                            >
                                Siguiente
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default VehiculoPolizaStep;