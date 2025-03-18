"use client"

import { useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import SignatureCanvas from 'react-signature-canvas'
import { SaveIcon, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { iGetIniciosCaja } from "@/interfaces/MovimientosInterface"
import { patchInicioCaja } from "@/actions/MovimientosActions"
import { editarInicioCajaSchema } from "@/schemas/admin/movimientos/movimientosSchema"
import { formatCurrency } from "@/lib/format"
import { LoaderModales } from "@/components/LoaderModales"

type ReactSignatureCanvas = SignatureCanvas

interface EditarInicioCajaFormProps {
    inicioCaja: iGetIniciosCaja
    alGuardar: () => void
}

export const EditarInicioCajaForm = ({
    inicioCaja,
    alGuardar
}: EditarInicioCajaFormProps) => {
    const [isPending, startTransition] = useTransition();
    const [mostrarPad, setMostrarPad] = useState(false)
    const signatureRef = useRef<ReactSignatureCanvas>(null)
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof editarInicioCajaSchema>>({
        resolver: zodResolver(editarInicioCajaSchema),
        defaultValues: {
            MontoInicial: Number(inicioCaja.MontoInicial),
            TotalEfectivo: Number(inicioCaja.TotalEfectivo),
            TotalTransferencia: Number(inicioCaja.TotalTransferencia),
            Estatus: inicioCaja.Estatus,
        },
    })

    const limpiarFirma = () => {
        if (signatureRef.current) {
            signatureRef.current.clear()
        }
    }

    const onSubmit = async (valores: z.infer<typeof editarInicioCajaSchema>) => {
        startTransition(async () => {
            try {
                let firmaBase64 = ""
                if (mostrarPad && signatureRef.current) {
                    if (!signatureRef.current.isEmpty()) {
                        firmaBase64 = signatureRef.current.toDataURL()
                    }
                }

                const respuesta = await patchInicioCaja(inicioCaja.InicioCajaID, {
                    ...valores,
                    FirmaElectronica: firmaBase64 || undefined,
                })

                if (respuesta?.error) {
                    toast({
                        title: "Error",
                        description: "Ocurrió un error al actualizar el inicio de caja",
                        variant: "destructive",
                    })
                    return
                }

                toast({
                    title: "Éxito",
                    description: "Inicio de caja actualizado correctamente",
                })
                alGuardar()
                router.refresh()
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al actualizar el inicio de caja",
                    variant: "destructive",
                })
            }
        })
    }

    if(isPending){
        return (
            <LoaderModales texto="Actualizando inicio de caja..."/>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="MontoInicial"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monto Inicial</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={formatCurrency(field.value)}
                                    onChange={(e) => {
                                        const valor = e.target.value.replace(/[^0-9]/g, "")
                                        field.onChange(Number(valor) / 100)
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="TotalEfectivo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Efectivo</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={formatCurrency(field.value)}
                                    onChange={(e) => {
                                        const valor = e.target.value.replace(/[^0-9]/g, "");
                                        field.onChange(Number(valor) / 100)
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="TotalTransferencia"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Transferencia</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={formatCurrency(field.value)}
                                    onChange={(e) => {
                                        const valor = e.target.value.replace(/[^0-9]/g, "");
                                        field.onChange(Number(valor) / 100)
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="Estatus"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un estado" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Activo">Activo</SelectItem>
                                    <SelectItem value="Cerrado">Cerrado</SelectItem>
                                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <FormLabel>Firma Electrónica</FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setMostrarPad(!mostrarPad)}
                        >
                            {mostrarPad ? "Cancelar" : "Nueva Firma"}
                        </Button>
                    </div>

                    {mostrarPad ? (
                        <div className="space-y-2">
                            <div className="border rounded-lg">
                                <SignatureCanvas
                                    ref={signatureRef}
                                    canvasProps={{
                                        className: "w-full h-40",
                                        style: { width: "100%", height: "160px" }
                                    }}
                                    backgroundColor="rgb(255, 255, 255)"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={limpiarFirma}
                                size="sm"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Limpiar
                            </Button>
                        </div>
                    ) : (
                        <div className="border rounded-lg p-4">
                            <img
                                src={inicioCaja.FirmaElectronica}
                                alt="Firma actual"
                                className="max-h-40 mx-auto"
                            />
                        </div>
                    )}
                </div>

                <Button type="submit" disabled={isPending}>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Guardar
                </Button>
            </form>
        </Form>
    )
}