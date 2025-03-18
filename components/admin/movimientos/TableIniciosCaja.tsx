"use client"

import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Edit, Eye, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogHeader,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCurrency } from "@/lib/format"
import { iGetIniciosCaja } from "@/interfaces/MovimientosInterface"
import { deleteInicioCaja } from "@/actions/MovimientosActions"
import { EditarInicioCajaForm } from "./EditarInicioCajaForm"
import { VisualizarFirma } from "./VisualizarFirma"
import { formatearFecha } from "@/lib/format-date"
import { Textarea } from "@/components/ui/textarea"
import { useState, useTransition } from "react"
import { LoaderModales } from "@/components/LoaderModales"
import { Button } from "@/components/ui/button"

const eliminarInicioCajaSchema = z.object({
    motivo: z.string().min(1, "El motivo es requerido"),
})

interface TableIniciosCajaProps {
    iniciosCaja: iGetIniciosCaja[]
}

export const TableIniciosCaja = ({ iniciosCaja }: TableIniciosCajaProps) => {
    const [isPending, startTransition] = useTransition()
    const [inicioCajaSeleccionado, setInicioCajaSeleccionado] = useState<iGetIniciosCaja | null>(null)
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
    const [modalFirmaAbierto, setModalFirmaAbierto] = useState(false)
    const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof eliminarInicioCajaSchema>>({
        resolver: zodResolver(eliminarInicioCajaSchema),
        defaultValues: {
            motivo: "",
        },
    })

    const manejarEliminar = async (valores: z.infer<typeof eliminarInicioCajaSchema>) => {
        if (!inicioCajaSeleccionado) return

        startTransition(async () => {
            try {
                const respuesta = await deleteInicioCaja(
                    inicioCajaSeleccionado.InicioCajaID,
                    inicioCajaSeleccionado.Usuario.UsuarioID,
                    valores
                )

                if (respuesta?.error) {
                    toast({
                        title: "Error",
                        description: "Ocurrió un error al eliminar el inicio de caja",
                        variant: "destructive",
                    })
                    return
                }

                toast({
                    title: "Éxito",
                    description: "Inicio de caja eliminado correctamente",
                })
                setModalEliminarAbierto(false)
                setInicioCajaSeleccionado(null)
                form.reset()
                router.refresh()
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al eliminar el inicio de caja",
                    variant: "destructive",
                })
            }
        })
    }

    if (isPending) {
        return <LoaderModales />
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha de Inicio</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Monto Inicial</TableHead>
                        <TableHead>Total Efectivo</TableHead>
                        <TableHead>Total Transferencia</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {iniciosCaja.map((inicio) => (
                        <TableRow key={inicio.InicioCajaID}>
                            <TableCell>{formatearFecha(inicio.FechaInicio)}</TableCell>
                            <TableCell>{inicio.Usuario.NombreUsuario}</TableCell>
                            <TableCell>{formatCurrency(Number(inicio.MontoInicial))}</TableCell>
                            <TableCell>{formatCurrency(Number(inicio.TotalEfectivo))}</TableCell>
                            <TableCell>{formatCurrency(Number(inicio.TotalTransferencia))}</TableCell>
                            <TableCell>{inicio.Estatus}</TableCell>
                            <TableCell className="flex items-center gap-3">
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Edit
                                            className="h-4 w-4 cursor-pointer text-gray-600"
                                            onClick={() => {
                                                setInicioCajaSeleccionado(inicio)
                                                setModalEditarAbierto(true)
                                            }}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>Editar</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger>
                                        <Eye
                                            className="h-4 w-4 cursor-pointer text-gray-600"
                                            onClick={() => {
                                                setInicioCajaSeleccionado(inicio)
                                                setModalFirmaAbierto(true)
                                            }}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>Ver firma</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger>
                                        <Trash2
                                            className="h-4 w-4 cursor-pointer text-gray-600"
                                            onClick={() => {
                                                setInicioCajaSeleccionado(inicio)
                                                setModalEliminarAbierto(true)
                                            }}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>Eliminar</TooltipContent>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog
                open={modalEditarAbierto}
                onOpenChange={() => {
                    setInicioCajaSeleccionado(null)
                    setModalEditarAbierto(false)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Inicio de Caja</DialogTitle>
                        <DialogDescription>
                            Modifica los datos del inicio de caja del {formatearFecha(inicioCajaSeleccionado?.FechaInicio || new Date())}
                        </DialogDescription>
                    </DialogHeader>
                    {inicioCajaSeleccionado && (
                        <EditarInicioCajaForm
                            inicioCaja={inicioCajaSeleccionado}
                            alGuardar={() => {
                                setInicioCajaSeleccionado(null)
                                setModalEditarAbierto(false)
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={modalFirmaAbierto}
                onOpenChange={() => {
                    setInicioCajaSeleccionado(null)
                    setModalFirmaAbierto(false)
                }}
            >
                <DialogContent>
                    {inicioCajaSeleccionado && (
                        <VisualizarFirma
                            firma={inicioCajaSeleccionado.FirmaElectronica}
                            usuario={inicioCajaSeleccionado.Usuario.NombreUsuario}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={modalEliminarAbierto}
                onOpenChange={() => {
                    setModalEliminarAbierto(false)
                    setInicioCajaSeleccionado(null)
                    form.reset()
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar Inicio de Caja</DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer. Por favor, proporciona un motivo para la eliminación.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(manejarEliminar)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="motivo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Motivo de eliminación</FormLabel>
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

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setModalEliminarAbierto(false)
                                        setInicioCajaSeleccionado(null)
                                        form.reset()
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="destructive">
                                    Eliminar
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}