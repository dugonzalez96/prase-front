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
import { LoaderModales } from "@/components/LoaderModales"
import { Switch } from "@/components/ui/switch"
import { postSucursal } from "@/actions/SucursalesActions"

const nuevaSucursalSchema = z.object({
    NombreSucursal: z.string().min(1, "El nombre es requerido"),
    Direccion: z.string().min(1, "La dirección es requerida"),
    Ciudad: z.string().min(1, "La ciudad es requerida"),
    Estado: z.string().min(1, "El estado es requerido"),
    Activa: z.boolean()
})

export const NuevaSucursalForm = () => {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof nuevaSucursalSchema>>({
        resolver: zodResolver(nuevaSucursalSchema),
        defaultValues: {
            NombreSucursal: "",
            Direccion: "",
            Ciudad: "",
            Estado: "",
            Activa: true
        },
    })

    const onSubmit = (valores: z.infer<typeof nuevaSucursalSchema>) => {
        startTransition(async () => {
            try {
                const respuesta = await postSucursal(valores)

                if (!respuesta) {
                    throw new Error()
                }

                toast({
                    title: "Éxito",
                    description: "Sucursal creada correctamente",
                })
                form.reset()
                router.refresh()
            } catch {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al crear la sucursal",
                    variant: "destructive",
                })
            }
        })
    }

    if (isPending) {
        return <LoaderModales />
    }

    return (
        <div className="bg-white p-6 shadow-md max-w-2xl">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="NombreSucursal"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nombre de la sucursal..." />
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
                                    <Input {...field} placeholder="Dirección de la sucursal..." />
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
                                    <Input {...field} placeholder="Ciudad de la sucursal..." />
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
                                    <Input {...field} placeholder="Estado de la sucursal..." />
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

                    <Button type="submit" size="lg">
                        <SaveIcon className="w-4 h-4 mr-2" />
                        Guardar
                    </Button>
                </form>
            </Form>
        </div>
    )
}