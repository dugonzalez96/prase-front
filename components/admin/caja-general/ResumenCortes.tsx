"use client";

import { iCorteUsuarioResumen } from "@/interfaces/CajaGeneralInterface";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";
import { CheckCircle, Clock } from "lucide-react";

interface ResumenCortesProps {
    cortes: iCorteUsuarioResumen[];
}

export function ResumenCortes({ cortes }: ResumenCortesProps) {
    const getEstadoBadge = (estado: string) => {
        return estado === 'CERRADO' ? (
            <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Cerrado
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                <Clock className="h-3 w-3 mr-1" />
                Pendiente
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cortes de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Total Efectivo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha de Corte</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cortes.map((corte) => (
                            <TableRow key={corte.CorteUsuarioID}>
                                <TableCell className="font-medium">
                                    {corte.NombreUsuario}
                                </TableCell>
                                <TableCell className="font-semibold">
                                    {formatCurrency(corte.TotalEfectivo)}
                                </TableCell>
                                <TableCell>
                                    {getEstadoBadge(corte.Estado)}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDateTimeFull(corte.FechaCorte)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
