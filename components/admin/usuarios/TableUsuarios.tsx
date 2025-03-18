"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { iGetGroups, iGetUsers } from "@/interfaces/SeguridadInterface";
import { EditarUsuarioForm } from "./EditarUsuarioForm";

interface Props {
    usuarios: iGetUsers[];
    grupos: iGetGroups[];
}

export const TableUsuarios = ({ usuarios, grupos }: Props) => {
    const [editUsuario, setEditUsuario] = useState<iGetUsers | null>(null);
    const [editUsuarioModalOpen, setEditUsuarioModalOpen] = useState(false);

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre de Usuario</TableHead>
                        <TableHead>Grupo</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {usuarios.map((usuario) => {
                        const nomGrupo = grupos.find(grupo => grupo.id === usuario.grupo);

                        return (
                            <TableRow key={usuario.UsuarioID}>
                                <TableCell>{usuario.UsuarioID}</TableCell>
                                <TableCell>{usuario.NombreUsuario}</TableCell>
                                <TableCell>{nomGrupo?.nombre}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEditUsuario(usuario);
                                                    setEditUsuarioModalOpen(true);
                                                }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>Editar</TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            {/* Modal para editar usuario */}
            <Dialog
                open={editUsuarioModalOpen}
                onOpenChange={() => {
                    setEditUsuario(null);
                    setEditUsuarioModalOpen(false);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                    </DialogHeader>
                    {editUsuario && (
                        <EditarUsuarioForm
                            usuario={editUsuario}
                            grupos={grupos}
                            onSave={() => {
                                setEditUsuario(null);
                                setEditUsuarioModalOpen(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
