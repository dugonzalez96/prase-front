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
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import { deleteTipoPago } from "@/actions/CatTipoPagos";
import { EditarTipoPagoForm } from "./EditarTipoPagoForm";

interface Props {
    tiposPago: iGetTipoPagos[];
}

export const TableTipoPagos = ({ tiposPago }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [selectedTipoPago, setSelectedTipoPago] = useState<iGetTipoPagos | null>(null);
    const [editTipoPago, setEditTipoPago] = useState<iGetTipoPagos | null>(null);
    const [editTipoPagoModalOpen, setEditTipoPagoModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSelectTipoPago = (tipoPago: iGetTipoPagos) => {
        setSelectedTipoPago(tipoPago);
    };

    const handleDelete = async () => {
        if (!selectedTipoPago) return;

        startTransition(async () => {
            try {
                const resp = await deleteTipoPago(selectedTipoPago.TipoPagoID);

                if (resp === "OK") {
                    toast({
                        title: "Tipo de pago eliminado",
                        description: `El tipo de pago ${selectedTipoPago.Descripcion} se ha eliminado exitosamente.`,
                        variant: "default",
                    });
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar el tipo de pago.",
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
                            Esta acción no se puede deshacer. Esto eliminará el tipo de pago{" "}
                            <strong>{selectedTipoPago?.Descripcion}</strong> permanentemente.
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
                            <TableHead>Descripción</TableHead>
                            <TableHead>Porcentaje Ajuste</TableHead>
                            <TableHead>Divisor</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tiposPago.map((tipoPago) => (
                            <TableRow key={tipoPago.TipoPagoID}>
                                <TableCell>{tipoPago.Descripcion}</TableCell>
                                <TableCell>{tipoPago.PorcentajeAjuste}%</TableCell>
                                <TableCell>{tipoPago.Divisor}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEditTipoPago(tipoPago);
                                                    setEditTipoPagoModalOpen(true);
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
                                                    onClick={() => handleSelectTipoPago(tipoPago)}
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
                open={editTipoPagoModalOpen}
                onOpenChange={() => {
                    setEditTipoPago(null);
                    setEditTipoPagoModalOpen(false);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Tipo de Pago</DialogTitle>
                    </DialogHeader>
                    {editTipoPago && (
                        <EditarTipoPagoForm
                            tipoPago={editTipoPago}
                            onSave={() => {
                                setEditTipoPago(null);
                                setEditTipoPagoModalOpen(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
