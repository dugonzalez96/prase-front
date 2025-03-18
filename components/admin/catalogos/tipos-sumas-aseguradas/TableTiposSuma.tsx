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
import { formatDateLocal } from "@/lib/format-date";
import Loading from "@/app/(protected)/loading";
import { iGetTiposSumasAseguradas } from "@/interfaces/CatTiposSumasInterface";
import { deleteTipoSumaAsegurada } from "@/actions/CatSumasAseguradasActions";
import { EditarTipoSumaForm } from "./EditarTipoSumaForm";

interface Props {
    tiposSumas: iGetTiposSumasAseguradas[];
}

export const TableTiposSumas = ({ tiposSumas }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [selectedTipoSuma, setSelectedTipoSuma] = useState<iGetTiposSumasAseguradas | null>(null);
    const [editTipoSuma, setEditTipoSuma] = useState<iGetTiposSumasAseguradas | null>(null);
    const [editTipoSumaModalOpen, setEditTipoSumaModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSelectTipoSuma = (tipoSuma: iGetTiposSumasAseguradas) => {
        setSelectedTipoSuma(tipoSuma);
    };

    const handleDelete = async () => {
        if (!selectedTipoSuma) return;

        startTransition(async () => {
            try {
                await deleteTipoSumaAsegurada(selectedTipoSuma.TipoSumaAseguradaID);

                toast({
                    title: "Tipo de Suma Asegurada eliminado",
                    description: `El tipo ${selectedTipoSuma.NombreTipo} se ha eliminado exitosamente.`,
                    variant: "default",
                });

                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar el tipo de suma asegurada.",
                    variant: "destructive",
                });
            }
        });
    };

    const handleEdit = async (tipoSumaAsegurada: iGetTiposSumasAseguradas) => {
        setEditTipoSuma(tipoSumaAsegurada);
        setEditTipoSumaModalOpen(true);
    };

    return (
        <>
            {isPending && <Loading />}
            <AlertDialog>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo{" "}
                            <strong>{selectedTipoSuma?.NombreTipo}</strong> y eliminará todos sus datos.
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
                            <TableHead>Nombre del Tipo</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Fecha de creación</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tiposSumas.map((tipoSuma) => (
                            <TableRow key={tipoSuma.TipoSumaAseguradaID}>
                                <TableCell className="font-medium">{tipoSuma.TipoSumaAseguradaID}</TableCell>
                                <TableCell>{tipoSuma.NombreTipo}</TableCell>
                                <TableCell>{tipoSuma.DescripcionSuma}</TableCell>
                                <TableCell>{tipoSuma.FechaCreacion ? formatDateLocal(tipoSuma.FechaCreacion) : ''}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => handleEdit(tipoSuma)}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Editar tipo de suma
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertDialogTrigger asChild>
                                                <Trash2
                                                    size={16}
                                                    className="text-gray-600 cursor-pointer"
                                                    onClick={() => handleSelectTipoSuma(tipoSuma)}
                                                />
                                            </AlertDialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Eliminar tipo de suma
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AlertDialog>

            {/* Modal para editar tipo de suma asegurada */}
            <Dialog open={editTipoSumaModalOpen} onOpenChange={() => {
                setEditTipoSuma(null);
                setEditTipoSumaModalOpen(false);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Tipo de Suma Asegurada</DialogTitle>
                    </DialogHeader>
                    {editTipoSuma && (
                        <EditarTipoSumaForm
                            tipoSumaAsegurada={editTipoSuma}
                            onSave={() => {
                                setEditTipoSuma(null);
                                setEditTipoSumaModalOpen(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};