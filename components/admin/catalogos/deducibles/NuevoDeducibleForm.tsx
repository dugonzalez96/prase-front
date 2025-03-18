"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { nuevoDeducibleSchema } from "@/schemas/admin/catalogos/catalogosSchemas"
import { postDeducible } from "@/actions/CatDeduciblesActions"

export const NuevoDeducibleForm = () => {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof nuevoDeducibleSchema>>({
        resolver: zodResolver(nuevoDeducibleSchema),
        defaultValues: {
            DeducibleMinimo: 0,
            DeducibleMaximo: 0,
            Rango: 0,
        },
    })

    const onSubmit = (values: z.infer<typeof nuevoDeducibleSchema>) => {
        startTransition(async () => {
            try {
                const resp = await postDeducible(values)

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear el deducible.",
                        variant: "destructive",
                    })
                } else {
                    toast({
                        title: "Deducible creado",
                        description: "El deducible se ha creado exitosamente.",
                        variant: "default",
                    })
                    form.reset()
                    router.refresh()
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear el deducible.",
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="DeducibleMinimo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deducible Mínimo</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Ej. 20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="DeducibleMaximo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deducible Máximo</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Ej. 50"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Rango"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rango</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Ej. 20"
                                            {...field}
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
                    </form>
                </Form>
            </div>
        </>
    )
}
