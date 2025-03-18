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
import { iGetDeducibles } from "@/interfaces/CatDeduciblesInterface";
import { EditarDeducibleForm } from "./EditarDeducibleForm";

interface Props {
    deducibles: iGetDeducibles[];
}

export const TableDeducibles = ({ deducibles }: Props) => {
    const [editDeducible, setEditDeducible] = useState<iGetDeducibles | null>(null);
    const [editDeducibleModalOpen, setEditDeducibleModalOpen] = useState(false);

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Deducible Mínimo</TableHead>
                        <TableHead>Deducible Máximo</TableHead>
                        <TableHead>Rango</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {deducibles.map((deducible) => (
                        <TableRow key={deducible.DeducibleID}>
                            <TableCell className="font-medium">{deducible.DeducibleID}</TableCell>
                            <TableCell>{deducible.DeducibleMinimo}</TableCell>
                            <TableCell>{deducible.DeducibleMaximo}</TableCell>
                            <TableCell>{deducible.Rango}</TableCell>
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
                                    <TooltipContent>
                                        Editar paquete
                                    </TooltipContent>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Modal para editar paquete */}
            <Dialog open={editDeducibleModalOpen} onOpenChange={() => {
                setEditDeducible(null);
                setEditDeducibleModalOpen(false);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Deducible</DialogTitle>
                    </DialogHeader>
                    {editDeducible && (
                        <EditarDeducibleForm deducible={editDeducible} onSave={() => {
                            setEditDeducible(null);
                            setEditDeducibleModalOpen(false);
                        }} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
