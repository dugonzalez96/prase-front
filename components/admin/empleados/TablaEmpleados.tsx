"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/app/(protected)/loading";
import { iGetEmpleados } from "@/interfaces/EmpleadosInterface";
import { deleteEmpleado } from "@/actions/EmpleadosActionts";
import { EditarEmpleadosForm } from "./EditarEmpleadosForm";

interface PropiedadesTablaEmpleados {
    empleados: iGetEmpleados[];
}

export const TablaEmpleados = ({ empleados }: PropiedadesTablaEmpleados) => {
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<iGetEmpleados | null>(null);
    const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const manejarEliminar = async () => {
        if (!empleadoSeleccionado) return;

        startTransition(async () => {
            try {
                await deleteEmpleado(empleadoSeleccionado.EmpleadoID);

                // if (respuesta) {
                toast({
                    title: "Empleado eliminado",
                    description: "El empleado se ha eliminado exitosamente.",
                });
                router.refresh();
                // } else {
                //     toast({
                //         title: "Error",
                //         description: "Hubo un problema al eliminar el empleado.",
                //         variant: "destructive",
                //     });
                // }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar el empleado.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            {isPending && <Loading />}
            <AlertDialog>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente al empleado{" "}
                            <strong>{empleadoSeleccionado?.Nombre} {empleadoSeleccionado?.Paterno}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={manejarEliminar}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Tipo Empleado</TableHead>
                            <TableHead>Sueldo Quincenal</TableHead>
                            <TableHead>Comisiones (%)</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {empleados.map((empleado) => (
                            <TableRow key={empleado.EmpleadoID}>
                                <TableCell>
                                    {empleado.Nombre} {empleado.Paterno} {empleado.Materno}
                                </TableCell>
                                <TableCell>{empleado.TipoEmpleado?.Descripcion}</TableCell>
                                <TableCell>${empleado.SueldoQuincenal}</TableCell>
                                <TableCell>{empleado.PorcentajeComisiones}%</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEmpleadoSeleccionado(empleado);
                                                    setModalEdicionAbierto(true);
                                                }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>Editar</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertDialogTrigger asChild>
                                                <Trash2
                                                    size={16}
                                                    className="text-gray-600 cursor-pointer"
                                                    onClick={() => setEmpleadoSeleccionado(empleado)}
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

            <Dialog open={modalEdicionAbierto} onOpenChange={setModalEdicionAbierto}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Empleado</DialogTitle>
                    </DialogHeader>
                    {empleadoSeleccionado && (
                        <EditarEmpleadosForm
                            empleado={empleadoSeleccionado}
                            onGuardar={() => {
                                setEmpleadoSeleccionado(null);
                                setModalEdicionAbierto(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};