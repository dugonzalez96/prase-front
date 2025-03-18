"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { iGetCliente, iPostCliente } from "@/interfaces/ClientesInterface";
import { getAllClientes, postCliente } from "@/actions/ClientesActions";
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
import { ArrowRight } from "lucide-react";

const clienteSchema = z.object({
    clienteExistente: z.string().optional(),
    nombreCompleto: z.string().min(1, {
        message: "El nombre es requerido"
    }),
    fechaNacimiento: z.string().min(1, {
        message: "La fecha de nacimiento es requerida"
    }),
    genero: z.enum(["Masculino", "Femenino", "Otro"]),
    direccion: z.string().min(1, {
        message: "La dirección es requerida"
    }),
    telefono: z.string().min(10, {
        message: "El teléfono debe tener al menos 10 dígitos"
    }),
    email: z.string().email({
        message: "El correo debe ser un correo electrónico válido"
    }),
    zonaResidencia: z.string().min(1, {
        message: "La zona de residencia es requerida"
    }),
    RFC: z.string().min(1, {
        message: "El RFC es requerido"
    })
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteStepProps {
    nombreInicial: string;
    telefonoInicial: string | null;
    emailInicial: string | null;
    alSubmit: (idCliente: number, zona?: string) => void;
}

export const ClientePolizaStep = ({
    nombreInicial,
    telefonoInicial,
    emailInicial,
    alSubmit
}: ClienteStepProps) => {
    const [clientes, setClientes] = useState<iGetCliente[]>([]);

    const form = useForm<ClienteFormData>({
        resolver: zodResolver(clienteSchema),
        defaultValues: {
            nombreCompleto: nombreInicial || "",
            telefono: telefonoInicial || "",
            email: emailInicial || "",
            genero: "Masculino",
            fechaNacimiento: "",
            direccion: "",
            zonaResidencia: "",
            RFC: "",
        },
        mode: "onChange",
    });
    // Obtener el estado de validación del formulario
    const { isValid, isDirty } = form.formState;
    // Modificar la lógica de validación del botón
    const clienteExistente = form.watch("clienteExistente");
    const formValido = form.formState.isValid;

    useEffect(() => {
        const cargarClientes = async () => {
            try {
                const respuesta = await getAllClientes();
                if (respuesta) {
                    setClientes(respuesta);
                }
            } catch (error) {
                console.error('Error al cargar clientes:', error);
            }
        };

        cargarClientes();
    }, []);

    const onSubmit = async (datos: ClienteFormData) => {
        if (datos.clienteExistente) {
            alSubmit(parseInt(datos.clienteExistente), datos.zonaResidencia);
            return;
        }

        const datosCliente: iPostCliente = {
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
            RFC: datos.RFC || "",
        };

        const respuesta = await postCliente(datosCliente);
        if (respuesta && respuesta.ClienteID) {
            alSubmit(respuesta.ClienteID, respuesta.ZonaResidencia);
        }
    };

    const manejarSeleccionCliente = (valorSeleccionado: string) => {
        if (valorSeleccionado === "nuevo") {
            form.reset({
                clienteExistente: undefined,
                nombreCompleto: "",
                fechaNacimiento: "",
                genero: "Masculino",
                direccion: "",
                telefono: "",
                email: "",
                zonaResidencia: "",
                RFC: "",
            });
        } else {
            const clienteSeleccionado = clientes.find(
                cliente => cliente.ClienteID.toString() === valorSeleccionado
            );
            if (clienteSeleccionado) {
                form.reset({
                    clienteExistente: valorSeleccionado,
                    nombreCompleto: clienteSeleccionado.NombreCompleto,
                    fechaNacimiento: new Date(clienteSeleccionado.FechaNacimiento)
                        .toISOString()
                        .split('T')[0],
                    genero: clienteSeleccionado.Genero as "Masculino" | "Femenino" | "Otro",
                    direccion: clienteSeleccionado.Direccion,
                    telefono: clienteSeleccionado.Telefono,
                    email: clienteSeleccionado.Email,
                    zonaResidencia: clienteSeleccionado.ZonaResidencia,
                    RFC: clienteSeleccionado.RFC || "",
                });
            }
        }
    };

    const deshabilitarCampos = !!form.watch("clienteExistente");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
                <CardDescription>
                    Selecciona un cliente existente o registra uno nuevo
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="clienteExistente"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cliente</FormLabel>
                                    <Select
                                        onValueChange={manejarSeleccionCliente}
                                        value={field.value || "nuevo"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar cliente" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="nuevo">Nuevo Cliente</SelectItem>
                                            {clientes.map((cliente) => (
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nombreCompleto"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre Completo</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} placeholder="Juan Pérez" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fechaNacimiento"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Nacimiento</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} disabled={deshabilitarCampos} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="genero"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Género</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={deshabilitarCampos}
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
                                control={form.control}
                                name="direccion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dirección</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} placeholder="Dirección del cliente..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="telefono"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} placeholder="3111234567" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} placeholder="correo@ejemplo.com" />
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
                                            <Input {...field} disabled={deshabilitarCampos} placeholder="XXXX0000000XX" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="zonaResidencia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zona de Residencia</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} placeholder="Zona de residencia..." />
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
                                    clienteExistente
                                        ? !clienteExistente // Si hay cliente existente, solo validar que haya uno seleccionado
                                        : !formValido // Si es cliente nuevo, validar todo el formulario
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