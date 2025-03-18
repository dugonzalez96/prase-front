"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
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
import { SaveIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Loading from "@/app/(protected)/loading"

import { nuevaConfiguracionGlobalSchema } from "@/schemas/admin/configuracionGlobal/configuracionGlobalSchema"
import { postConfiguracionGlobal } from "@/actions/ConfiguracionGlobal"

export const NuevaConfiguracionForm = () => {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevaConfiguracionGlobalSchema>>({
        resolver: zodResolver(nuevaConfiguracionGlobalSchema),
        defaultValues: {
            NombreConfiguracion: '',
            ValorConfiguracion: 0,
            Descripcion: "",
        },
    })

    const onSubmit = (values: z.infer<typeof nuevaConfiguracionGlobalSchema>) => {
        startTransition(async () => {
            try {
                const resp = await postConfiguracionGlobal(values)

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear la configuración global.",
                        variant: "destructive",
                    })
                } else {
                    toast({
                        title: "Configuración global creada",
                        description: "La configuración global se creó correctamente.",
                        variant: "default",
                    })
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear la configuración global.",
                    variant: "destructive",
                })
            }
        })
    }

    return (
        <>
            {isPending && <Loading />}
            <div className="bg-white p-6 shadow-md max-w-7xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8">
                        <FormField
                            control={form.control}
                            name="NombreConfiguracion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Configuración</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Nombre de Configuración..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ValorConfiguracion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor de la Configuración</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Valor de Configuración..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Descripción..."
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
        </>
    )
}