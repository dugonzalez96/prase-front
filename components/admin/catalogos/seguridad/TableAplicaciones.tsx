"use client";

import { useState, useTransition } from "react";
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/app/(protected)/loading";
import { iGetApplications } from "@/interfaces/SeguridadInterface";
import { deleteApplication } from "@/actions/SeguridadActions";
import { EditarApplicationForm } from "./EditarAplicacionForm";

interface Props {
    applications: iGetApplications[];
}

export const TableAplicaciones = ({ applications }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [selectedApplication, setSelectedApplication] = useState<iGetApplications | null>(null);
    const [editApplication, setEditApplication] = useState<iGetApplications | null>(null);
    const [editApplicationModalOpen, setEditApplicationModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSelectApplication = (application: iGetApplications) => {
        setSelectedApplication(application);
    };

    const handleDelete = async () => {
        if (!selectedApplication) return;

        startTransition(async () => {
            try {
                await deleteApplication(selectedApplication.id);

                toast({
                    title: "Aplicación eliminada",
                    description: `La aplicación ${selectedApplication.nombre} se ha eliminado exitosamente.`,
                    variant: "default",
                });

                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar la aplicación.",
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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la aplicación{" "}
                            <strong>{selectedApplication?.nombre}</strong> y eliminará todos sus datos.
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
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.map((application) => (
                            <TableRow key={application.id}>
                                <TableCell className="font-medium">{application.id}</TableCell>
                                <TableCell>{application.nombre}</TableCell>
                                <TableCell>{application.descripcion}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEditApplication(application);
                                                    setEditApplicationModalOpen(true);
                                                }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Editar aplicación
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertDialogTrigger asChild>
                                                <Trash2
                                                    size={16}
                                                    className="text-gray-600 cursor-pointer"
                                                    onClick={() => handleSelectApplication(application)}
                                                />
                                            </AlertDialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Eliminar aplicación
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AlertDialog>

            <Dialog open={editApplicationModalOpen} onOpenChange={() => {
                setEditApplication(null);
                setEditApplicationModalOpen(false);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Aplicación</DialogTitle>
                    </DialogHeader>
                    <DialogDescription></DialogDescription>
                    {editApplication && (
                        <EditarApplicationForm application={editApplication} onSave={() => {
                            setEditApplication(null);
                            setEditApplicationModalOpen(false);
                        }} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
