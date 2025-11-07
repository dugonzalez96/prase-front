"use client";

/**
 * TablaIniciosCajaChica.tsx
 * 
 * Tabla simplificada de inicios de caja para mostrar en Caja Chica.
 * Muestra los inicios activos que afectan al saldo de la caja.
 * 
 * ✅ FUNCIONA:
 * - Lista de inicios de caja activos
 * - Información de usuario y montos
 * - Filtro por estatus "Activo"
 * - Visualización de firma electrónica
 * 
 * 🔗 INTEGRADO CON:
 * - MovimientosActions: getIniciosCaja()
 * - iGetIniciosCaja interface
 * 
 * 📝 NOTA:
 * Los inicios de caja afectan a Caja General cuando se entregan.
 */

import { useState } from "react";
import { Eye } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { formatearFecha } from "@/lib/format-date";
import { iGetIniciosCaja } from "@/interfaces/MovimientosInterface";

interface TablaIniciosCajaChicaProps {
    inicios: iGetIniciosCaja[];
}

export function TablaIniciosCajaChica({ inicios }: TablaIniciosCajaChicaProps) {
    const [modalFirmaAbierto, setModalFirmaAbierto] = useState(false);
    const [firmaSeleccionada, setFirmaSeleccionada] = useState<{
        firma: string;
        usuario: string;
    } | null>(null);

    // Filtrar solo inicios activos
    const iniciosActivos = inicios.filter(inicio => inicio.Estatus === "Activo");

    const handleVerFirma = (firma: string, usuario: string) => {
        setFirmaSeleccionada({ firma, usuario });
        setModalFirmaAbierto(true);
    };

    if (iniciosActivos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Inicios de Caja Activos</CardTitle>
                    <CardDescription>
                        Fondos entregados a usuarios que afectan el saldo de Caja General
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No hay inicios de caja activos
                    </p>
                </CardContent>
            </Card>
        );
    }

    const totalInicios = iniciosActivos.reduce(
        (sum, inicio) => sum + Number(inicio.MontoInicial),
        0
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                Inicios de Caja Activos
                                <Badge variant="secondary">{iniciosActivos.length} activos</Badge>
                            </CardTitle>
                            <CardDescription>
                                Fondos entregados a usuarios que afectan el saldo de Caja General
                            </CardDescription>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Entregado</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(totalInicios)}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha Inicio</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Autorizó</TableHead>
                                <TableHead className="text-right">Monto Inicial</TableHead>
                                <TableHead className="text-right">Total Efectivo</TableHead>
                                <TableHead className="text-right">Total Transfer.</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Firma</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {iniciosActivos.map((inicio) => (
                                <TableRow key={inicio.InicioCajaID}>
                                    <TableCell className="text-sm">
                                        {formatearFecha(inicio.FechaInicio)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {inicio.Usuario.NombreUsuario}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {inicio.UsuarioAutorizo.NombreUsuario}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {formatCurrency(Number(inicio.MontoInicial))}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(Number(inicio.TotalEfectivo))}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(Number(inicio.TotalTransferencia))}
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={inicio.Estatus === "Activo" ? "default" : "secondary"}
                                        >
                                            {inicio.Estatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleVerFirma(
                                                    inicio.FirmaElectronica,
                                                    inicio.Usuario.NombreUsuario
                                                )
                                            }
                                            title="Ver firma electrónica"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Nota informativa */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Información:</strong> Los inicios de caja activos representan 
                            fondos entregados a usuarios que deben ser devueltos a Caja General al 
                            finalizar el día. El total entregado es{" "}
                            <strong>{formatCurrency(totalInicios)}</strong>.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Modal para visualizar firma */}
            <Dialog open={modalFirmaAbierto} onOpenChange={setModalFirmaAbierto}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Firma Electrónica</DialogTitle>
                    </DialogHeader>
                    {firmaSeleccionada && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Usuario:</p>
                                <p className="font-semibold">{firmaSeleccionada.usuario}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Firma:</p>
                                <div className="border rounded-md p-4 bg-white">
                                    <img
                                        src={firmaSeleccionada.firma}
                                        alt="Firma electrónica"
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
