"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { editarPolizaSchema } from "@/schemas/polizasSchema";
import { formatCurrency } from "@/lib/format";
import { Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { postCliente } from "@/actions/ClientesActions";
import type { iGetPolizas, iPatchPoliza } from "@/interfaces/CatPolizas";
import type { iGetCliente, iPostCliente } from "@/interfaces/ClientesInterface";

interface EditarPolizaFormProps {
    poliza: iGetPolizas;
    onGuardar: (datos: iPatchPoliza) => void;
    clientes: iGetCliente[];
}

type EstadoPoliza = "PERIODO DE GRACIA" | "ACTIVA" | "PENDIENTE";

const nuevoClienteSchema = z.object({
    nombreCompleto: z.string().min(1, { message: "El nombre es requerido" }),
    fechaNacimiento: z.string().min(1, { message: "La fecha de nacimiento es requerida" }),
    genero: z.enum(["Masculino", "Femenino", "Otro"]),
    direccion: z.string().min(1, { message: "La dirección es requerida" }),
    telefono: z.string().min(10, { message: "El teléfono debe tener al menos 10 dígitos" }),
    email: z.string().email({ message: "Correo electrónico inválido" }),
    zonaResidencia: z.string().min(1, { message: "La zona de residencia es requerida" }),
    RFC: z.string().min(1, { message: "El RFC es requerido" }),
});

const estadosPoliza: EstadoPoliza[] = ["PERIODO DE GRACIA", "ACTIVA", "PENDIENTE"];

export const EditarPolizaForm = ({ poliza, onGuardar, clientes }: EditarPolizaFormProps) => {
    const [mostrarFormularioCliente, setMostrarFormularioCliente] = useState(false);
    const [clientesActualizados, setClientesActualizados] = useState(clientes);

    const formPoliza = useForm<z.infer<typeof editarPolizaSchema>>({
        resolver: zodResolver(editarPolizaSchema),
        defaultValues: {
            EstadoPoliza: (poliza.EstadoPoliza as EstadoPoliza) || "ACTIVA",
            PrimaTotal: Number(poliza.PrimaTotal),
            ClienteID: poliza.cliente.ClienteID,
        },
    });

    const formCliente = useForm<z.infer<typeof nuevoClienteSchema>>({
        resolver: zodResolver(nuevoClienteSchema),
        defaultValues: {
            nombreCompleto: "",
            fechaNacimiento: "",
            genero: "Masculino",
            direccion: "",
            telefono: "",
            email: "",
            zonaResidencia: "",
            RFC: "",
        },
    });

    const onSubmitPoliza = (datos: z.infer<typeof editarPolizaSchema>) => {
        const clienteCompleto = clientes.find(cliente => cliente.ClienteID === datos.ClienteID);
        const datosCompletos = {
            ...datos,
            cliente: clienteCompleto,
        }

        onGuardar(datosCompletos);
    };

    const onSubmitCliente = async (datos: z.infer<typeof nuevoClienteSchema>) => {
        const nuevoCliente: iPostCliente = {
            NombreCompleto: datos.nombreCompleto,
            FechaNacimiento: datos.fechaNacimiento,
            Genero: datos.genero,
            Direccion: datos.direccion,
            Telefono: datos.telefono,
            Email: datos.email,
            HistorialSiniestros: 0,
            HistorialReclamos: 0,
            ZonaResidencia: datos.zonaResidencia,
            FechaRegistro: new Date().toISOString(),
            RFC: datos.RFC,
        };

        const clienteCreado = await postCliente(nuevoCliente);
        if (clienteCreado) {
            setClientesActualizados([...clientesActualizados, clienteCreado]);
            formPoliza.setValue("ClienteID", clienteCreado.ClienteID);
            setMostrarFormularioCliente(false);
        }
    };

    return (
        <div className="space-y-6">
            <Form {...formPoliza}>
                <form onSubmit={formPoliza.handleSubmit(onSubmitPoliza)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={formPoliza.control}
                            name="ClienteID"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cliente</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            if (value === "nuevo") {
                                                setMostrarFormularioCliente(true);
                                            } else {
                                                field.onChange(Number(value));
                                                setMostrarFormularioCliente(false);
                                            }
                                        }}
                                        value={mostrarFormularioCliente ? "nuevo" : field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar cliente" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="nuevo">Nuevo Cliente</SelectItem>
                                            {clientesActualizados.map((cliente) => (
                                                <SelectItem
                                                    key={cliente.ClienteID}
                                                    value={cliente.ClienteID.toString()}
                                                >
                                                    {cliente.NombreCompleto}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={formPoliza.control}
                            name="EstadoPoliza"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado de la Póliza</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {estadosPoliza.map((estado) => (
                                                <SelectItem key={estado} value={estado}>
                                                    {estado}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={formPoliza.control}
                            name="PrimaTotal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prima Total</FormLabel>
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
                    </div>

                    {!mostrarFormularioCliente && (
                        <Button type="submit">
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Cambios
                        </Button>
                    )}
                </form>
            </Form>

            {mostrarFormularioCliente && (
                <Card>
                    <CardHeader>
                        <CardTitle>Nuevo Cliente</CardTitle>
                        <CardDescription>
                            Ingresa los datos del nuevo cliente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...formCliente}>
                            <form onSubmit={formCliente.handleSubmit(onSubmitCliente)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={formCliente.control}
                                        name="nombreCompleto"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre Completo</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Juan Pérez González" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={formCliente.control}
                                        name="fechaNacimiento"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fecha de Nacimiento</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={formCliente.control}
                                        name="genero"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Género</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar género" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Masculino">Masculino</SelectItem>
                                                        <SelectItem value="Femenino">Femenino</SelectItem>
                                                        <SelectItem value="Otro">Otro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={formCliente.control}
                                        name="RFC"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>RFC</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="PERG940517H45" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={formCliente.control}
                                        name="direccion"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dirección</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Av. México #123, Col. Centro" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={formCliente.control}
                                        name="telefono"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Teléfono</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="3111234567" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={formCliente.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Correo Electrónico</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="email" placeholder="ejemplo@correo.com" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={formCliente.control}
                                        name="zonaResidencia"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Zona de Residencia</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Tepic, Nayarit" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setMostrarFormularioCliente(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit">
                                        Guardar Cliente
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};