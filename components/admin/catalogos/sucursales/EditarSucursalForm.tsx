"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SaveIcon } from "lucide-react"
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
import { iGetSucursales } from "@/interfaces/SucursalesInterface"
import { patchSucursal } from "@/actions/SucursalesActions"
import { LoaderModales } from "@/components/LoaderModales"
import { Switch } from "@/components/ui/switch"

const editarSucursalSchema = z.object({
    NombreSucursal: z.string().min(1, "El nombre es requerido"),
    Direccion: z.string().min(1, "La dirección es requerida"),
    Ciudad: z.string().min(1, "La ciudad es requerida"),
    Estado: z.string().min(1, "El estado es requerido"),
    Activa: z.boolean()
})

interface PropiedadesEditarSucursal {
    sucursal: iGetSucursales
    alGuardar: () => void
}

export const EditarSucursalForm = ({
    sucursal,
    alGuardar
}: PropiedadesEditarSucursal) => {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof editarSucursalSchema>>({
        resolver: zodResolver(editarSucursalSchema),
        defaultValues: {
            NombreSucursal: sucursal.NombreSucursal,
            Direccion: sucursal.Direccion,
            Ciudad: sucursal.Ciudad,
            Estado: sucursal.Estado,
            Activa: Boolean(sucursal.Activa)
        },
    })

    const onSubmit = (valores: z.infer<typeof editarSucursalSchema>) => {
        startTransition(async () => {
            try {
                const respuesta = await patchSucursal(sucursal.SucursalID, valores)

                if (!respuesta) {
                    throw new Error()
                }

                toast({
                    title: "Éxito",
                    description: "Sucursal actualizada correctamente",
                })
                alGuardar()
                router.refresh()
            } catch {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al actualizar la sucursal",
                    variant: "destructive",
                })
            }
        })
    }

    if (isPending) {
        return <LoaderModales />
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="NombreSucursal"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input {...field} />
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
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="Ciudad"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ciudad</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="Estado"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="Activa"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                            <FormLabel>Activa</FormLabel>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Guardar
                </Button>
            </form>
        </Form>
    )
}