"use client"
// interfaces
import {
    iGetCliente
} from '@/interfaces/ClientesInterface';

// actions
import {
    deleteCliente
} from '@/actions/ClientesActions';

import { useToast } from '@/hooks/use-toast';
import { useRouter } from "next/navigation";
import { useState, useTransition } from 'react';
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
import Loading from '@/app/(protected)/loading';
import { EditarClienteForm } from './EditarClienteForm';

interface Props {
    clientes: iGetCliente[];
}

export const TableClientes = ({ clientes }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [selectedCliente, setSelectedCliente] = useState<iGetCliente | null>(null);
    const [editCliente, setEditCliente] = useState<iGetCliente | null>(null);
    const [editClienteModalOpen, setEditClienteModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSelectCliente = (cliente: iGetCliente) => {
        setSelectedCliente(cliente);
    };

    const handleDelete = async () => {
        if (!selectedCliente) return;
        startTransition(async () => {
            try {
                const res = await deleteCliente(selectedCliente.ClienteID);
                if (!res) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al eliminar al cliente.",
                        variant: "destructive",
                    });
                    return;
                } else {
                    toast({
                        title: "Cliente eliminado",
                        description: "El cliente se eliminó correctamente.",
                        variant: "default",
                    });
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar el cliente.",
                    variant: "destructive",
                });
            }
        });
    }

    return (
        <>
            {isPending && <Loading />}
            <AlertDialog>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el Cliente{" "}
                            <strong>{selectedCliente?.NombreCompleto}</strong> y eliminará todos sus datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='rounded-md'>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className='rounded-md'
                            variant="destructive"
                            onClick={() => handleDelete()}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Fecha de Nacimiento</TableHead>
                            <TableHead>Género</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Historial de Siniestros</TableHead>
                            <TableHead>Historial de Reclamos</TableHead>
                            <TableHead>Zona de Residencia</TableHead>
                            <TableHead>Fecha de Registro</TableHead>
                            <TableHead>Acciones</TableHead>

                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clientes.map((cliente) => (
                            <TableRow key={cliente.ClienteID}>
                                <TableCell>{cliente.NombreCompleto}</TableCell>
                                <TableCell>
                                    {new Date(cliente.FechaNacimiento).toLocaleDateString()} {/* Convierte a Date y formatea */}
                                </TableCell>
                                <TableCell>{cliente.Genero}</TableCell>
                                <TableCell>{cliente.Direccion}</TableCell>
                                <TableCell>{cliente.Telefono}</TableCell>
                                <TableCell>{cliente.Email}</TableCell>
                                <TableCell>{cliente.HistorialSiniestros}</TableCell>
                                <TableCell>{cliente.HistorialReclamos}</TableCell>
                                <TableCell>{cliente.ZonaResidencia}</TableCell>
                                <TableCell>
                                    {new Date(cliente.FechaRegistro).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEditCliente(cliente);
                                                    setEditClienteModalOpen(true);
                                                }}
                                            >
                                            </Edit>
                                        </TooltipTrigger>
                                        <TooltipContent>Editar</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertDialogTrigger asChild>
                                                <Trash2
                                                    size={16}
                                                    className="text-gray-600 cursor-pointer"
                                                    onClick={() => handleSelectCliente(cliente)}
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

            {/* Modal para editar la regla */}
            <Dialog
                open={editClienteModalOpen}
                onOpenChange={() => {
                    setEditCliente(null);
                    setEditClienteModalOpen(false);
                }}>
                <DialogContent aria-describedby="dialog-description" className="max-w-[80vw] ">
                    <DialogHeader>
                        <DialogTitle>Editar regla de negocio</DialogTitle>
                    </DialogHeader>
                    <p id="dialog-description" className="sr-only">
                        En este formulario puedes editar los detalles de el cliente seleccionado.
                    </p>
                    {editCliente && (
                        <EditarClienteForm
                            cliente={editCliente}
                            onSave={() => {
                                setEditCliente(null);
                                setEditClienteModalOpen(false);
                            }} />
                    )}
                </DialogContent>
            </Dialog >
        </>
    )
}