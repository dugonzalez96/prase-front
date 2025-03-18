"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { iGetCuentasBancarias } from "@/interfaces/ClientesInterface";
import { deleteCuentaBancaria } from "@/actions/ClientesActions";
import { EditarCuentaBancariaForm } from "./EditarCuentaBancariaForm";

interface TablaCuentasBancariasProps {
    cuentasBancarias: iGetCuentasBancarias[];
}

export const TablaCuentasBancarias = ({ cuentasBancarias }: TablaCuentasBancariasProps) => {
    const [cuentaSeleccionada, setCuentaSeleccionada] = useState<iGetCuentasBancarias | null>(null);
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleEliminar = async () => {
        if (!cuentaSeleccionada) return;
        try {
            const respuesta = await deleteCuentaBancaria(cuentaSeleccionada.CuentaBancariaID);

            if (respuesta === 'OK') {
                toast({
                    title: "Cuenta bancaria eliminada",
                    description: "La cuenta bancaria se ha eliminado correctamente",
                });
                router.refresh();
            } else {
                throw new Error('Error al eliminar cuenta bancaria');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Ocurrió un error al eliminar la cuenta bancaria",
                variant: "destructive",
            });
        }
    };

    return (
        <>
            <AlertDialog>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará la cuenta bancaria permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={handleEliminar}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Banco</TableHead>
                            <TableHead>Número de Cuenta</TableHead>
                            <TableHead>CLABE</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cuentasBancarias.map((cuenta) => (
                            <TableRow key={cuenta.CuentaBancariaID}>
                                <TableCell>{cuenta.NombreBanco}</TableCell>
                                <TableCell>{cuenta.NumeroCuenta}</TableCell>
                                <TableCell>{cuenta.ClabeInterbancaria}</TableCell>
                                <TableCell>{cuenta.Activa ? "Activa" : "Inactiva"}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                className="h-4 w-4 cursor-pointer text-gray-600"
                                                onClick={() => {
                                                    setCuentaSeleccionada(cuenta);
                                                    setModalEditarAbierto(true);
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
                                                    onClick={() => setCuentaSeleccionada(cuenta)}
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
                    setCuentaSeleccionada(null);
                    setModalEditarAbierto(false);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Cuenta Bancaria</DialogTitle>
                    </DialogHeader>
                    {cuentaSeleccionada && (
                        <EditarCuentaBancariaForm
                            cuenta={cuentaSeleccionada}
                            alGuardar={() => {
                                setCuentaSeleccionada(null);
                                setModalEditarAbierto(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};