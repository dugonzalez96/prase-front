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
import { iGetTiposDeducible } from "@/interfaces/CatDeduciblesInterface";
import { deleteTiposDeducible } from "@/actions/CatDeduciblesActions";
import { EditarTipoDeducibleForm } from "./EditarTipoDeducibleForm";

interface Props {
    tiposDeducible: iGetTiposDeducible[];
}

export const TableTiposDeducible = ({ tiposDeducible }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [selectedDeducible, setSelectedDeducible] = useState<iGetTiposDeducible | null>(null);
    const [editDeducible, setEditDeducible] = useState<iGetTiposDeducible | null>(null);
    const [editDeducibleModalOpen, setEditDeducibleModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSelectDeducible = (deducible: iGetTiposDeducible) => {
        setSelectedDeducible(deducible);
    };

    const handleDelete = async () => {
        if (!selectedDeducible) return;

        startTransition(async () => {
            try {
                const resp = await deleteTiposDeducible(selectedDeducible.TipoDeducibleID);

                if (resp === "OK") {
                    toast({
                        title: "Tipo de deducible eliminado",
                        description: `El tipo de deducible ${selectedDeducible.Nombre} se ha eliminado exitosamente.`,
                        variant: "default",
                    });
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar el tipo de deducible.",
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
                            Esta acción no se puede deshacer. Esto eliminará el tipo de deducible{" "}
                            <strong>{selectedDeducible?.Nombre}</strong> permanentemente.
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
                        {tiposDeducible.map((deducible) => (
                            <TableRow key={deducible.TipoDeducibleID}>
                                <TableCell>{deducible.TipoDeducibleID}</TableCell>
                                <TableCell>{deducible.Nombre}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEditDeducible(deducible);
                                                    setEditDeducibleModalOpen(true);
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
                                                    onClick={() => handleSelectDeducible(deducible)}
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
                open={editDeducibleModalOpen}
                onOpenChange={() => {
                    setEditDeducible(null);
                    setEditDeducibleModalOpen(false);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Tipo de Deducible</DialogTitle>
                    </DialogHeader>
                    {editDeducible && (
                        <EditarTipoDeducibleForm deducible={editDeducible} onSave={() => {
                            setEditDeducible(null);
                            setEditDeducibleModalOpen(false);
                        }} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
