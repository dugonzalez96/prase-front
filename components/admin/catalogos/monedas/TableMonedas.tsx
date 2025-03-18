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
import { iGetTiposMoneda } from "@/interfaces/CatCoberturasInterface";
import Loading from "@/app/(protected)/loading";
import { EditarMonedaForm } from "./EditarMonedaForm";
import { deleteMoneda } from "@/actions/CatMonedasActions";

interface Props {
    monedas: iGetTiposMoneda[];
}

export const TableMonedas = ({ monedas }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [selectedMoneda, setSelectedMoneda] = useState<iGetTiposMoneda | null>(null);
    const [editMoneda, setEditMoneda] = useState<iGetTiposMoneda | null>(null);
    const [editMonedaModalOpen, setEditMonedaModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSelectMoneda = (moneda: iGetTiposMoneda) => {
        setSelectedMoneda(moneda);
    };

    const handleDelete = async () => {
        if (!selectedMoneda) return;

        startTransition(async () => {
            try {
                await deleteMoneda(selectedMoneda.TipoMonedaID);

                toast({
                    title: "Moneda eliminada",
                    description: `La moneda ${selectedMoneda.Nombre} se ha eliminado exitosamente.`,
                    variant: "default",
                });

                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar la moneda.",
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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la moneda{" "}
                            <strong>{selectedMoneda?.Nombre}</strong> y eliminará todos sus datos.
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
                            <TableHead>Nombre</TableHead>
                            <TableHead>Abreviación</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {monedas.map((moneda) => (
                            <TableRow key={moneda.TipoMonedaID}>
                                <TableCell className="font-medium">{moneda.Nombre}</TableCell>
                                <TableCell>{moneda.Abreviacion}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEditMoneda(moneda);
                                                    setEditMonedaModalOpen(true);
                                                }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>Editar moneda</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertDialogTrigger asChild>
                                                <Trash2
                                                    size={16}
                                                    className="text-gray-600 cursor-pointer"
                                                    onClick={() => handleSelectMoneda(moneda)}
                                                />
                                            </AlertDialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>Eliminar moneda</TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AlertDialog>

            {/* Modal para editar moneda */}
            <Dialog
                open={editMonedaModalOpen}
                onOpenChange={() => {
                    setEditMoneda(null);
                    setEditMonedaModalOpen(false);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Moneda</DialogTitle>
                    </DialogHeader>
                    {editMoneda && (
                        <EditarMonedaForm
                            moneda={editMoneda}
                            onSave={() => {
                                setEditMoneda(null);
                                setEditMonedaModalOpen(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
