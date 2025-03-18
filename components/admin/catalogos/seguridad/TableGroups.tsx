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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/app/(protected)/loading";
import { iGetGroups } from "@/interfaces/SeguridadInterface";
import { deleteGroup } from "@/actions/SeguridadActions";
import { EditarGrupoForm } from "./EditarGroupForm";

interface Props {
    groups: iGetGroups[];
}

export const TableGroups = ({ groups }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [selectedGroup, setSelectedGroup] = useState<iGetGroups | null>(null);
    const [editGroup, setEditGroup] = useState<iGetGroups | null>(null);
    const [editGroupModalOpen, setEditGroupModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    // Selección del grupo para eliminar
    const handleSelectGroup = (group: iGetGroups) => {
        setSelectedGroup(group);
    };

    // Eliminar grupo
    const handleDelete = async () => {
        if (!selectedGroup) return;

        startTransition(async () => {
            try {
                await deleteGroup(selectedGroup.id);

                toast({
                    title: "Grupo eliminado",
                    description: `El grupo ${selectedGroup.nombre} se ha eliminado exitosamente.`,
                    variant: "default",
                });

                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar el grupo.",
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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el grupo{" "}
                            <strong>{selectedGroup?.nombre}</strong> y todos sus datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => handleDelete()}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>

                {/* Tabla de grupos */}
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
                        {groups.map((group) => (
                            <TableRow key={group.id}>
                                <TableCell className="font-medium">{group.id}</TableCell>
                                <TableCell>{group.nombre}</TableCell>
                                <TableCell>{group.descripcion}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEditGroup(group);
                                                    setEditGroupModalOpen(true);
                                                }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Editar grupo
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertDialogTrigger asChild>
                                                <Trash2
                                                    size={16}
                                                    className="text-gray-600 cursor-pointer"
                                                    onClick={() => handleSelectGroup(group)}
                                                />
                                            </AlertDialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Eliminar grupo
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AlertDialog>

            {/* Modal para editar grupo */}
            <Dialog open={editGroupModalOpen} onOpenChange={() => {
                setEditGroup(null);
                setEditGroupModalOpen(false);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Grupo</DialogTitle>
                    </DialogHeader>
                    {editGroup && (
                        <EditarGrupoForm group={editGroup} onSave={() => {
                            setEditGroup(null);
                            setEditGroupModalOpen(false);
                        }} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
