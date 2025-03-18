"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from 'react';
import { Edit} from "lucide-react";
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
import Loading from '@/app/(protected)/loading';
import { IGetAllConfiguracionGlobal } from '@/interfaces/ConfiguracionGlobal';
import { EditarConfiguracionGlobal } from './EditConfiguracionGlobal';

interface Props {
    configuraciones: IGetAllConfiguracionGlobal[];
}

export const TableConfiguracionGlobal = ({ configuraciones }: Props) => {
    const [isPending] = useTransition();
    const [editConfiguracion, setEditConfiguracion] = useState<IGetAllConfiguracionGlobal | null>(null);
    const [editConfiguracionModalOpen, setEditConfiguracionModalOpen] = useState(false);
    const router = useRouter();


    return (
        <>
            {isPending && <Loading />}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Valor de Configuración</TableHead>
                        <TableHead>Acciones </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {configuraciones.map((configuracion) => (
                        <TableRow key={configuracion.ConfiguracionID}>
                            <TableCell>{configuracion.NombreConfiguracion}</TableCell>
                            <TableCell>{configuracion.Descripcion}</TableCell>
                            <TableCell>{configuracion.ValorConfiguracion}</TableCell>
                            
                            <TableCell className="flex items-center gap-3">
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Edit
                                            size={16}
                                            className="text-gray-600 cursor-pointer"
                                            onClick={() => {
                                                setEditConfiguracion(configuracion);
                                                setEditConfiguracionModalOpen(true);
                                            }}
                                        >
                                        </Edit>
                                    </TooltipTrigger>
                                    <TooltipContent>Editar</TooltipContent>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Modal para editar las Configuraciones */}
            <Dialog open={editConfiguracionModalOpen} onOpenChange={() => {
                setEditConfiguracion(null);
                setEditConfiguracionModalOpen(false);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Configuración Global</DialogTitle>
                    </DialogHeader>
                    {editConfiguracion && (
                        <EditarConfiguracionGlobal
                            configuracion={editConfiguracion}
                            onSave={() => {
                                setEditConfiguracionModalOpen(false);
                                router.refresh();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}