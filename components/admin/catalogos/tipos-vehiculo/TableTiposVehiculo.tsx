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
import { iGetTiposVehiculo, iGetUsosVehiculo } from "@/interfaces/CatVehiculosInterface";
import { deleteTipoVehiculo } from "@/actions/CatVehiculosActions";
import { EditarTipoVehiculoForm } from "./EditarTipoVehiculoForm";

interface Props {
    tiposVehiculo: iGetTiposVehiculo[];
    usosVehiculo: iGetUsosVehiculo[];
}

export const TableTiposVehiculo = ({ tiposVehiculo, usosVehiculo }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [selectedTipo, setSelectedTipo] = useState<iGetTiposVehiculo | null>(null);
    const [editTipo, setEditTipo] = useState<iGetTiposVehiculo | null>(null);
    const [editTipoModalOpen, setEditTipoModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSelectTipo = (tipo: iGetTiposVehiculo) => {
        setSelectedTipo(tipo);
    };

    const handleDelete = async () => {
        if (!selectedTipo) return;

        startTransition(async () => {
            try {
                const resp = await deleteTipoVehiculo(selectedTipo.TipoID);

                if (resp === "OK") {
                    toast({
                        title: "Tipo de vehículo eliminado",
                        description: `El tipo de vehículo ${selectedTipo.Nombre} se ha eliminado exitosamente.`,
                        variant: "default",
                    });
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar el tipo de vehículo.",
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
                            Esta acción no se puede deshacer. Esto eliminará el tipo de vehículo{" "}
                            <strong>{selectedTipo?.Nombre}</strong> permanentemente.
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
                            <TableHead>Uso</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tiposVehiculo.map((tipo) => (
                            <TableRow key={tipo.TipoID}>
                                <TableCell>{tipo.TipoID}</TableCell>
                                <TableCell>{tipo.Nombre}</TableCell>
                                <TableCell>{tipo.uso.Nombre}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEditTipo(tipo);
                                                    setEditTipoModalOpen(true);
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
                                                    onClick={() => handleSelectTipo(tipo)}
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
                open={editTipoModalOpen}
                onOpenChange={() => {
                    setEditTipo(null);
                    setEditTipoModalOpen(false);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Tipo de Vehículo</DialogTitle>
                    </DialogHeader>
                    {editTipo && (
                        <EditarTipoVehiculoForm
                            usosVehiculo={usosVehiculo}
                            tipoVehiculo={editTipo}
                            onSave={() => {
                                setEditTipo(null);
                                setEditTipoModalOpen(false);
                            }} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
