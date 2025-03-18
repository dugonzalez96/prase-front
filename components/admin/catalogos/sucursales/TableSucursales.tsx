"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit, Trash2 } from "lucide-react"
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { iGetSucursales } from "@/interfaces/SucursalesInterface"
import { deleteSucursal } from "@/actions/SucursalesActions"
import { EditarSucursalForm } from "./EditarSucursalForm"

interface PropiedadesTabla {
    sucursales: iGetSucursales[]
}

export const TableSucursales = ({ sucursales }: PropiedadesTabla) => {
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState<iGetSucursales | null>(null)
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const manejarEliminar = async () => {
        if (!sucursalSeleccionada) return

        try {
            const respuesta = await deleteSucursal(sucursalSeleccionada.SucursalID)

            if (respuesta === 'OK') {
                toast({
                    title: "Éxito",
                    description: "Sucursal eliminada correctamente",
                })
                router.refresh()
            } else {
                throw new Error()
            }
        } catch {
            toast({
                title: "Error",
                description: "Ocurrió un error al eliminar la sucursal",
                variant: "destructive",
            })
        }
    }

    return (
        <>
            <AlertDialog>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará la sucursal permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={manejarEliminar}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Ciudad</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Activa</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sucursales.map((sucursal) => (
                            <TableRow key={sucursal.SucursalID}>
                                <TableCell>{sucursal.NombreSucursal}</TableCell>
                                <TableCell>{sucursal.Direccion}</TableCell>
                                <TableCell>{sucursal.Ciudad}</TableCell>
                                <TableCell>{sucursal.Estado}</TableCell>
                                <TableCell>{sucursal.Activa ? "Sí" : "No"}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                className="h-4 w-4 cursor-pointer text-gray-600"
                                                onClick={() => {
                                                    setSucursalSeleccionada(sucursal)
                                                    setModalEditarAbierto(true)
                                                }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>Editar</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertDialogTrigger asChild>
                                                <Trash2
                                                    className="h-4 w-4 cursor-pointer text-gray-600"
                                                    onClick={() => setSucursalSeleccionada(sucursal)}
                                                />
                                            </AlertDialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>Eliminar</TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AlertDialog>

            <Dialog
                open={modalEditarAbierto}
                onOpenChange={() => {
                    setSucursalSeleccionada(null)
                    setModalEditarAbierto(false)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Sucursal</DialogTitle>
                    </DialogHeader>
                    {sucursalSeleccionada && (
                        <EditarSucursalForm
                            sucursal={sucursalSeleccionada}
                            alGuardar={() => {
                                setSucursalSeleccionada(null)
                                setModalEditarAbierto(false)
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}