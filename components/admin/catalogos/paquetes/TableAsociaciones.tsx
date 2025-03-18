"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteAsociacionPaqueteCobertura, deleteAllAsociacionesPaqueteCobertura } from "@/actions/CatPaquetesActions";
import Loading from "@/app/(protected)/loading";

interface AsociacionProps {
    asociaciones: {
        PaqueteCoberturaID: number;
        CoberturaID: number;
        NombrePaquete: string;
        NombreCobertura: string;
        FechaAsociacion: Date;
        Obligatoria: boolean;
    }[];
}

export const TableAsociaciones = ({ asociaciones }: AsociacionProps) => {
    const [isPending, startTransition] = useTransition();
    const [selectedCobertura, setSelectedCobertura] = useState<{ paqueteId: number, coberturaId: number } | null>(null); // Mantener el ID del paquete y cobertura
    const [selectedPaquete, setSelectedPaquete] = useState<number | null>(null); // Para eliminar todas las coberturas de un paquete
    const { toast } = useToast();
    const router = useRouter();

    // Agrupar coberturas por PaqueteCoberturaID
    const asociacionesAgrupadas = asociaciones.reduce((acc, asociacion) => {
        const { PaqueteCoberturaID, NombrePaquete, FechaAsociacion, Obligatoria } = asociacion;

        if (!acc[PaqueteCoberturaID]) {
            acc[PaqueteCoberturaID] = {
                PaqueteCoberturaID,
                NombrePaquete,
                FechaAsociacion,
                Obligatoria,
                coberturas: [],
            };
        }

        acc[PaqueteCoberturaID].coberturas.push({
            CoberturaID: asociacion.CoberturaID,
            NombreCobertura: asociacion.NombreCobertura,
        });

        return acc;
    }, {} as Record<number, { PaqueteCoberturaID: number, NombrePaquete: string, FechaAsociacion: Date, Obligatoria: boolean, coberturas: { CoberturaID: number, NombreCobertura: string }[] }>);

    // Manejar eliminación de todas las coberturas asociadas a un paquete
    const handleDeleteAll = async () => {
        if (!selectedPaquete) return;

        startTransition(async () => {
            try {
                await deleteAllAsociacionesPaqueteCobertura(selectedPaquete);
                toast({
                    title: "Asociaciones eliminadas",
                    description: `Todas las asociaciones del paquete se han eliminado exitosamente.`,
                    variant: "default",
                });
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar las asociaciones.",
                    variant: "destructive",
                });
            }
        });
    };

    // Manejar eliminación de una cobertura específica
    const handleDeleteCobertura = async () => {
        if (!selectedCobertura) return;

        const body = {
            coberturaIds: [selectedCobertura.coberturaId], // Solo eliminamos la cobertura seleccionada
            usuario: "admin", // Siempre será "admin" por ahora
        };

        startTransition(async () => {
            try {
                await deleteAsociacionPaqueteCobertura(selectedCobertura.paqueteId, body);
                toast({
                    title: "Cobertura eliminada",
                    description: `La cobertura ha sido eliminada exitosamente del paquete.`,
                    variant: "default",
                });
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar la cobertura.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            {isPending && <Loading />}

            {/* Alert para eliminar una cobertura */}
            {selectedCobertura && (
                <AlertDialog open={!!selectedCobertura} onOpenChange={() => setSelectedCobertura(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar esta cobertura?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. ¿Deseas eliminar la cobertura seleccionada del paquete?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" onClick={handleDeleteCobertura}>
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Alert para eliminar todas las coberturas de un paquete */}
            {selectedPaquete && (
                <AlertDialog open={!!selectedPaquete} onOpenChange={() => setSelectedPaquete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar todas las coberturas?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esto eliminará permanentemente todas las coberturas asociadas a este paquete. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" onClick={handleDeleteAll}>
                                Eliminar todas
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Paquete</TableHead>
                        <TableHead>Coberturas</TableHead>
                        <TableHead>Fecha de Asociación</TableHead>
                        <TableHead>Obligatoria</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.values(asociacionesAgrupadas).map((asociacion) => (
                        <TableRow key={asociacion.PaqueteCoberturaID}>
                            <TableCell>{asociacion.NombrePaquete}</TableCell>
                            <TableCell>
                                {asociacion.coberturas.map((cobertura) => (
                                    <div key={cobertura.CoberturaID} className="flex items-center justify-between border-y border-b-gray-100 py-1">
                                        {cobertura.NombreCobertura}
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Trash2
                                                    size={16}
                                                    className="text-gray-600 cursor-pointer"
                                                    onClick={() =>
                                                        setSelectedCobertura({
                                                            paqueteId: asociacion.PaqueteCoberturaID,
                                                            coberturaId: cobertura.CoberturaID,
                                                        })
                                                    }
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>Eliminar cobertura</TooltipContent>
                                        </Tooltip>
                                    </div>
                                ))}
                            </TableCell>
                            <TableCell>{new Date(asociacion.FechaAsociacion).toLocaleDateString()}</TableCell>
                            <TableCell>{asociacion.Obligatoria ? "Sí" : "No"}</TableCell>
                            <TableCell>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Trash2
                                            size={20}
                                            className="text-red-600 cursor-pointer"
                                            onClick={() => setSelectedPaquete(asociacion.PaqueteCoberturaID)}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>Eliminar todas las coberturas</TooltipContent>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
};
