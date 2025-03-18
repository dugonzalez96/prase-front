"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/format"
import { formatDateTimeFull } from "@/lib/format-date"
import { iGetMovimientos } from "@/interfaces/MovimientosInterface"
import { deleteMovimiento } from "@/actions/MovimientosActions"
import { eliminarMovimientoSchema } from "@/schemas/admin/movimientos/movimientosSchema"
import { LoaderModales } from "@/components/LoaderModales"
import { useRouter } from "next/navigation"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { addDays } from "date-fns"
import { DateRange } from "react-day-picker"

interface PropiedadesTabla {
    movimientos: iGetMovimientos[]
}

export const TablaMovimientos = ({ movimientos }: PropiedadesTabla) => {
    const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<iGetMovimientos | null>(null)
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })

    const form = useForm<z.infer<typeof eliminarMovimientoSchema>>({
        resolver: zodResolver(eliminarMovimientoSchema),
        defaultValues: {
            codigo: "",
            motivo: ""
        }
    })

    const onSubmit = async (valores: z.infer<typeof eliminarMovimientoSchema>) => {
        if (!movimientoSeleccionado) return
        // console.log(movimientoSeleccionado)
        startTransition(async () => {
            try {
                const respuesta = await deleteMovimiento(movimientoSeleccionado.TransaccionID, valores)

                if (!respuesta || respuesta.error) {
                    toast({
                        title: "Error",
                        description: "Ocurrió un error al eliminar el movimiento",
                        variant: "destructive"
                    })
                    return
                }

                toast({
                    title: "Éxito",
                    description: "Movimiento eliminado correctamente"
                })
                setMovimientoSeleccionado(null);
                form.reset();
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al eliminar el movimiento",
                    variant: "destructive"
                })
            }
        })
    }

    // Filter transactions based on date range
    const filteredTransacciones = movimientos.filter((movimiento) => {
        const transactionDate = new Date(movimiento.FechaTransaccion)
        return (
            (!dateRange.from || transactionDate >= dateRange.from) &&
            (!dateRange.to || transactionDate <= addDays(dateRange.to, 1))
        )
    })
    return (
        <>
            <div className="flex items-center mb-6 container">
                <DateRangePicker dateRange={dateRange} onDateRangeChange={(range) => setDateRange(range || { from: undefined, to: undefined })} />
                <Button
                    variant="outline"
                    onClick={() => setDateRange({ from: undefined, to: undefined })}
                >
                    Limpiar
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Forma de Pago</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTransacciones.map((movimiento) => (
                        <TableRow key={movimiento.TransaccionID}>
                            <TableCell>{movimiento.TransaccionID}</TableCell>
                            <TableCell>{formatDateTimeFull(movimiento.FechaTransaccion)}</TableCell>
                            <TableCell>{movimiento.TipoTransaccion}</TableCell>
                            <TableCell>{movimiento.FormaPago}</TableCell>
                            <TableCell>{formatCurrency(Number(movimiento.Monto))}</TableCell>
                            <TableCell>{movimiento.Validado ? "Validado" : "Pendiente"}</TableCell>
                            <TableCell>{movimiento.UsuarioCreo.NombreUsuario}</TableCell>
                            <TableCell>{movimiento.Descripcion || "-"}</TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setMovimientoSeleccionado(movimiento)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog
                open={!!movimientoSeleccionado}
                onOpenChange={() => {
                    setMovimientoSeleccionado(null)
                    form.reset()
                }}
            >
                <DialogContent className="max-w-4xl">
                    {isPending ? (
                        <LoaderModales />
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle>Eliminar Movimiento</DialogTitle>
                                <DialogDescription>
                                    Para eliminar este movimiento, necesitas el código de autorización.
                                    Contacta a tu administrador y proporciónale el ID <span className="text-blue-700 font-bold text-lg">{movimientoSeleccionado?.TransaccionID}</span> para obtener el código correspondiente.
                                </DialogDescription>
                            </DialogHeader>

                            {movimientoSeleccionado && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tipo</p>
                                            <p className="font-medium">{movimientoSeleccionado.TipoTransaccion}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Monto</p>
                                            <p className="font-medium">{formatCurrency(Number(movimientoSeleccionado.Monto))}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Forma de Pago</p>
                                            <p className="font-medium">{movimientoSeleccionado.FormaPago}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Usuario</p>
                                            <p className="font-medium">{movimientoSeleccionado.UsuarioCreo.NombreUsuario}</p>
                                        </div>
                                    </div>

                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="codigo"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Código de autorización</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="text" placeholder="Ingresa tu código aquí..." />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="motivo"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Motivo de Eliminación</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                {...field}
                                                                placeholder="Explica el motivo de la eliminación..."
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button type="submit" variant="destructive">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Eliminar Movimiento
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}