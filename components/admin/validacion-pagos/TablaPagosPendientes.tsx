"use client";

import { useState, useEffect } from "react";
import { iPagoPendiente } from "@/interfaces/PagosPolizaInterface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";
import { Eye, CheckCircle, RefreshCw } from "lucide-react";
import { DetallePageModal } from "./DetallePageModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPagosPendientes } from "@/actions/PagosPolizaActions";

interface TablaPagosPendientesProps {
    pagos: iPagoPendiente[];
    onValidar: (pagoID: number) => void;
}

export function TablaPagosPendientes({
    pagos: pagosIniciales,
    onValidar
}: TablaPagosPendientesProps) {
    const [pagoSeleccionado, setPagoSeleccionado] = useState<iPagoPendiente | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [pagos, setPagos] = useState<iPagoPendiente[]>(pagosIniciales);
    const [fechaInicio, setFechaInicio] = useState<string>("");
    const [fechaFin, setFechaFin] = useState<string>("");
    const [cargando, setCargando] = useState(false);

    // Establecer fechas por defecto (últimos 30 días)
    useEffect(() => {
        const hoy = new Date();
        const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        setFechaInicio(hace30Dias.toISOString().split('T')[0]);
        setFechaFin(hoy.toISOString().split('T')[0]);
    }, []);

    const abrirDetalle = (pago: iPagoPendiente) => {
        setPagoSeleccionado(pago);
        setModalAbierto(true);
    };

    const handleFiltrar = async () => {
        if (!fechaInicio || !fechaFin) {
            return;
        }

        setCargando(true);
        try {
            const pagosFiltrados = await getPagosPendientes(
                new Date(fechaInicio),
                new Date(fechaFin)
            );
            if (pagosFiltrados) {
                setPagos(pagosFiltrados);
            }
        } catch (error) {
            console.error('Error al filtrar pagos:', error);
        } finally {
            setCargando(false);
        }
    };

    const getEstadoBadge = (validado: number) => {
        switch (validado) {
            case 0:
                return <Badge variant="outline" className="bg-yellow-50">Pendiente</Badge>;
            case 1:
                return <Badge variant="outline" className="bg-green-50 text-green-700">Validado</Badge>;
            default:
                return <Badge variant="outline">Desconocido</Badge>;
        }
    };

    if (!pagos || pagos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Pagos Pendientes de Validación</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
                                <Input
                                    id="fecha-inicio"
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    disabled={cargando}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fecha-fin">Fecha Fin</Label>
                                <Input
                                    id="fecha-fin"
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    disabled={cargando}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={handleFiltrar}
                                    disabled={cargando || !fechaInicio || !fechaFin}
                                    className="w-full"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${cargando ? 'animate-spin' : ''}`} />
                                    Filtrar
                                </Button>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-muted-foreground py-8">
                        No hay pagos pendientes de validación
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Pagos Pendientes de Validación</span>
                        <Badge variant="default">{pagos.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
                                <Input
                                    id="fecha-inicio"
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    disabled={cargando}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fecha-fin">Fecha Fin</Label>
                                <Input
                                    id="fecha-fin"
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    disabled={cargando}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={handleFiltrar}
                                    disabled={cargando || !fechaInicio || !fechaFin}
                                    className="w-full"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${cargando ? 'animate-spin' : ''}`} />
                                    Filtrar
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Póliza</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Método de Pago</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Fecha Pago</TableHead>
                                <TableHead>Estatus</TableHead>
                                <TableHead>Validación</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pagos.map((pago) => (
                                <TableRow key={pago.PagoID}>
                                    <TableCell className="font-medium">
                                        #{pago.PagoID}
                                    </TableCell>
                                    <TableCell>
                                        #{pago.PolizaID}
                                    </TableCell>
                                    <TableCell>{pago.Usuario.NombreUsuario}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{pago.MetodoPago.NombreMetodo}</Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {formatCurrency(parseFloat(pago.MontoPagado))}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDateTimeFull(new Date(pago.FechaPago))}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{pago.EstatusPago.NombreEstatus}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getEstadoBadge(pago.Validado)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => abrirDetalle(pago)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Ver
                                            </Button>
                                            {pago.Validado === 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => onValidar(pago.PagoID)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Validar
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {pagoSeleccionado && (
                <DetallePageModal
                    pago={pagoSeleccionado}
                    abierto={modalAbierto}
                    onClose={() => {
                        setModalAbierto(false);
                        setPagoSeleccionado(null);
                    }}
                    onValidar={onValidar}
                />
            )}
        </>
    );
}
