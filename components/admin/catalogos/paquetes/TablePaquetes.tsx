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
import { iGetAllPaquetes } from "@/interfaces/CatPaquetesInterface";
import { formatDateLocal } from "@/lib/format-date";
import { deletePaqueteCobertura } from "@/actions/CatPaquetesActions";
import Loading from "@/app/(protected)/loading";
import { EditarPaqueteForm } from "./EditarPaqueteForm";
import { formatCurrency } from "@/lib/format";

interface Props {
    paquetes: iGetAllPaquetes[];
}

export const TablePaquetes = ({ paquetes }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [selectedPaquete, setSelectedPaquete] = useState<iGetAllPaquetes | null>(null);
    const [editPaquete, setEditPaquete] = useState<iGetAllPaquetes | null>(null);
    const [editPaqueteModalOpen, setEditPaqueteModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSelectPaquete = (paquete: iGetAllPaquetes) => {
        setSelectedPaquete(paquete);
    };

    const handleDelete = async () => {
        if (!selectedPaquete) return;

        startTransition(async () => {
            try {
                await deletePaqueteCobertura(selectedPaquete.PaqueteCoberturaID);

                toast({
                    title: "Paquete eliminado",
                    description: `El paquete ${selectedPaquete.NombrePaquete} se ha eliminado exitosamente.`,
                    variant: "default",
                });

                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar el paquete.",
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
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el paquete{" "}
                            <strong>{selectedPaquete?.NombrePaquete}</strong> y eliminará todos sus datos.
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
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Paquete</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Precio total fijo</TableHead>
                            <TableHead>Fecha de creación</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paquetes.map((paquete) => (
                            <TableRow key={paquete.PaqueteCoberturaID}>
                                <TableCell className="font-medium">{paquete.PaqueteCoberturaID}</TableCell>
                                <TableCell>{paquete.NombrePaquete}</TableCell>
                                <TableCell>{paquete.DescripcionPaquete}</TableCell>
                                <TableCell>{formatCurrency(Number(paquete.PrecioTotalFijo))}</TableCell>
                                <TableCell>{formatDateLocal(paquete.FechaCreacion)}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEditPaquete(paquete);
                                                    setEditPaqueteModalOpen(true);
                                                }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Editar paquete
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertDialogTrigger asChild>
                                                <Trash2
                                                    size={16}
                                                    className="text-gray-600 cursor-pointer"
                                                    onClick={() => handleSelectPaquete(paquete)}
                                                />
                                            </AlertDialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Eliminar paquete
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AlertDialog>

            {/* Modal para editar paquete */}
            <Dialog open={editPaqueteModalOpen} onOpenChange={() => {
                setEditPaquete(null);
                setEditPaqueteModalOpen(false);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Paquete</DialogTitle>
                    </DialogHeader>
                    {editPaquete && (
                        <EditarPaqueteForm paquete={editPaquete} onSave={() => {
                            setEditPaquete(null);
                            setEditPaqueteModalOpen(false);
                        }} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
