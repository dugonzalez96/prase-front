"use client";

import { useTransition, useState } from "react";
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
import { iGetUsosVehiculo } from "@/interfaces/CatVehiculosInterface";
import { deleteUsoVehiculo } from "@/actions/CatVehiculosActions";
import { EditarUsoVehiculoForm } from "./EditarUsoVehiculoForm";

interface Props {
    usosVehiculo: iGetUsosVehiculo[];
}

export const TableUsosVehiculo = ({ usosVehiculo }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [selectedUso, setSelectedUso] = useState<iGetUsosVehiculo | null>(null);
    const [editUso, setEditUso] = useState<iGetUsosVehiculo | null>(null);
    const [editUsoModalOpen, setEditUsoModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSelectUso = (uso: iGetUsosVehiculo) => {
        setSelectedUso(uso);
    };

    const handleDelete = async () => {
        if (!selectedUso) return;

        startTransition(async () => {
            try {
                const resp = await deleteUsoVehiculo(selectedUso.UsoID);

                if (resp === "OK") {
                    toast({
                        title: "Uso de vehículo eliminado",
                        description: `El uso de vehículo ${selectedUso.Nombre} se ha eliminado exitosamente.`,
                        variant: "default",
                    });
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar el uso de vehículo.",
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
                            Esta acción no se puede deshacer. Esto eliminará el uso de vehículo{" "}
                            <strong>{selectedUso?.Nombre}</strong> permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => handleDelete()}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usosVehiculo.map((uso) => (
                            <TableRow key={uso.UsoID}>
                                <TableCell>{uso.UsoID}</TableCell>
                                <TableCell>{uso.Nombre}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEditUso(uso);
                                                    setEditUsoModalOpen(true);
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
                                                    onClick={() => handleSelectUso(uso)}
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
                open={editUsoModalOpen}
                onOpenChange={() => {
                    setEditUso(null);
                    setEditUsoModalOpen(false);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Uso de Vehículo</DialogTitle>
                    </DialogHeader>
                    {editUso && (
                        <EditarUsoVehiculoForm usoVehiculo={editUso} onSave={() => {
                            setEditUso(null);
                            setEditUsoModalOpen(false);
                        }} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
