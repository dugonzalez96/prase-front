"use client"

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registrarUsuarioSchema } from '@/schemas/admin/usuariosSchemas';
import Loading from '@/app/(protected)/loading';
import { iGetGroups } from '@/interfaces/SeguridadInterface';
import { postUsuario } from '@/actions/SeguridadActions';
import { iGetEmpleados } from '@/interfaces/EmpleadosInterface';
import { iGetSucursales } from '@/interfaces/SucursalesInterface';

export const NuevoUsuarioForm = ({ groups, empleados, sucursales }: { groups: iGetGroups[], empleados: iGetEmpleados[], sucursales: iGetSucursales[] }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [fuerzaPassword, setFuerzaPassword] = useState(0);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof registrarUsuarioSchema>>({
        resolver: zodResolver(registrarUsuarioSchema),
        defaultValues: {
            username: "",
            password: "",
            confirmPassword: "",
            idGroup: 0,
            EmpleadoID: 0,
            SucursalID: 0,
        },
    })

    const calcularFuerza = useCallback((password: string) => {
        let strength = 0
        if (password.length >= 8) strength++
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
        if (/\d/.test(password)) strength++
        if (/[^a-zA-Z\d]/.test(password)) strength++
        setFuerzaPassword(Math.min(strength, 3))
    }, [])

    const fuerzaContraInfo = useCallback(() => {
        if (fuerzaPassword <= 1) return { label: 'Débil', color: 'text-red-500', barColor: 'bg-red-500' }
        if (fuerzaPassword === 2) return { label: 'Regular', color: 'text-yellow-500', barColor: 'bg-yellow-500' }
        return { label: 'Buena', color: 'text-green-500', barColor: 'bg-green-500' }
    }, [fuerzaPassword])

    const onSubmit = (values: z.infer<typeof registrarUsuarioSchema>) => {
        // console.log(values)
        startTransition(async () => {
            try {
                const resp = await postUsuario(values)

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear usuario.",
                        variant: "destructive",
                    })
                } else {
                    toast({
                        title: "Usuario creado",
                        description: "El usuario se ha creado exitosamente.",
                        variant: "default",
                    })
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear el usuario.",
                    variant: "destructive",
                })
            }
        })
    }

    const strengthInfo = fuerzaContraInfo()

    return (
        <>
            {isPending && <Loading />}
            <div className="bg-white p-6 shadow-md max-w-7xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="EmpleadoID"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Empleado</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione empleado relacionado al usuario..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {empleados.map(empleado => (
                                                        <SelectItem key={empleado.EmpleadoID} value={empleado.EmpleadoID.toString()}>
                                                            {empleado.Nombre} {empleado.Paterno} {empleado.Materno}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='correo@ejemplo.com' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e)
                                                        calcularFuerza(e.target.value)
                                                    }}
                                                    placeholder='******'
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        {field.value && (
                                            <>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                                    <div
                                                        className={`h-2.5 rounded-full ${strengthInfo.barColor}`}
                                                        style={{ width: `${(fuerzaPassword + 1) * 25}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-sm mt-1">
                                                    Fuerza de la contraseña: <span className={`font-medium ${strengthInfo.color}`}>{strengthInfo.label}</span>
                                                </p>
                                            </>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} placeholder='******' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="idGroup"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Grupo</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione grupo..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {groups.map(group => (
                                                        <SelectItem key={group.id} value={group.id.toString()}>{group.nombre}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="SucursalID"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sucursal</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione sucursal..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sucursales.map(sucursal => (
                                                        <SelectItem key={sucursal.SucursalID} value={sucursal.SucursalID.toString()}>{sucursal.NombreSucursal}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" className="mt-5">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Registrar
                        </Button>
                    </form>
                </Form>
            </div>
        </>
    )
}