"use client";

import { useState, useEffect } from "react";
import { iCajaGeneral, iResumenCajaGeneral, iCorteUsuarioResumen } from "@/interfaces/CajaGeneralInterface";
import { iGetMovimientos } from "@/interfaces/MovimientosInterface";
import { iCajaGeneralDashboard } from "@/interfaces/CajaGeneralDashboardInterface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, AlertCircle, Calendar, DollarSign, Users, LogIn, Eye, Landmark, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";
import { getCajaGeneralDashboard } from "@/actions/CajaGeneralActions";

interface CajaGeneralFormClientProps {
    cajaGeneral: iCajaGeneral;
    resumenInicial: iResumenCajaGeneral;
    cortesUsuarios: iCorteUsuarioResumen[];
    movimientosIniciales: iGetMovimientos[];
    usuarioId: number;
}

export function CajaGeneralFormClient({
    cajaGeneral,
    resumenInicial,
    cortesUsuarios,
    movimientosIniciales,
    usuarioId
}: CajaGeneralFormClientProps) {
    const [selectedCaja, setSelectedCaja] = useState<string>("");
    const [efectivoContado, setEfectivoContado] = useState<string>("0.00");
    const [observaciones, setObservaciones] = useState<string>("");
    const [mostrarResumen, setMostrarResumen] = useState(false);
    const [dashboardData, setDashboardData] = useState<iCajaGeneralDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDetalle, setSelectedDetalle] = useState<any>(null);
    const [openDetalleModal, setOpenDetalleModal] = useState(false);
    const [detalleType, setDetalleType] = useState<"entrada" | "egreso" | null>(null);

    const fecha = new Date().toISOString().split('T')[0];
    const fechaCorte = new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Cargar datos del dashboard al montar
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                const data = await getCajaGeneralDashboard(fecha);
                setDashboardData(data);
            } catch (error) {
                console.error('Error al cargar dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [fecha]);

    const handleConfirmarCuadre = async () => {
        console.log("Cuadre confirmado", {
            cajaSeleccionada: selectedCaja,
            efectivoContado,
            observaciones,
        });
        setMostrarResumen(false);
    };

    const handleRefresh = async () => {
        try {
            setLoading(true);
            const data = await getCajaGeneralDashboard(fecha);
            setDashboardData(data);
        } catch (error) {
            console.error('Error al refrescar:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTipoBadgeColor = (tipo: string) => {
        switch (tipo) {
            case "CORTE_CAJA_CHICA":
                return "bg-blue-100 text-blue-800";
            case "PAGO_POLIZA":
                return "bg-green-100 text-green-800";
            case "TRANSACCION_INGRESO":
                return "bg-purple-100 text-purple-800";
            case "REPOSICION_CAJA_CHICA":
                return "bg-orange-100 text-orange-800";
            case "DEPOSITO_BANCARIO":
                return "bg-blue-100 text-blue-800";
            case "GASTO_ADMINISTRATIVO":
                return "bg-red-100 text-red-800";
            case "RETIRO_AUTORIZADO":
                return "bg-purple-100 text-purple-800";
            case "PAGO_PROVEEDOR":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "PRE_CUADRE":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "CUADRADA":
                return "bg-green-50 text-green-700 border-green-200";
            case "CON_DIFERENCIA":
                return "bg-orange-50 text-orange-700 border-orange-200";
            case "CERRADA":
                return "bg-gray-50 text-gray-700 border-gray-200";
            default:
                return "bg-blue-50 text-blue-700 border-blue-200";
        }
    };

    const getEstadoLabel = (estado: string) => {
        const labels: { [key: string]: string } = {
            PRE_CUADRE: "Pre-cuadre",
            CUADRADA: "Cuadrada",
            CON_DIFERENCIA: "Con diferencia",
            CERRADA: "Cerrada",
        };
        return labels[estado] || estado;
    };

    const getEstadoCajaChicaBadge = (estado: string) => {
        switch (estado) {
            case "Cerrado":
                return "bg-green-100 text-green-800";
            case "Pendiente":
                return "bg-yellow-100 text-yellow-800";
            case "Abierto":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getEstadoCajaGeneralBadge = (estado: string) => {
        switch (estado) {
            case "Cuadrado":
                return "bg-green-100 text-green-800";
            case "Pendiente":
                return "bg-yellow-100 text-yellow-800";
            case "Con diferencia":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case "Abierto":
                return "bg-green-100 text-green-800";
            case "Cerrado":
                return "bg-gray-100 text-gray-800";
            case "Pendiente":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-blue-100 text-blue-800";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin inline-block">
                        <RefreshCw className="h-8 w-8" />
                    </div>
                    <p className="mt-4 text-muted-foreground">Cargando datos...</p>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                    Error al cargar los datos del dashboard. Por favor, intenta nuevamente.
                </AlertDescription>
            </Alert>
        );
    }

    const { resumen, entradas, egresos, cortesUsuarios: cortes, iniciosUsuarios, preCuadre } = dashboardData;

    return (
        <>
            <div className="space-y-6">
                {/* TARJETAS DE RESUMEN - 5 COLUMNAS */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {/* Saldo Inicial */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Saldo Inicial</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(resumen.saldoInicial)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Al inicio del día</p>
                        </CardContent>
                    </Card>

                    {/* Total Entradas */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(resumen.totalEntradas)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{entradas.length} movimientos</p>
                        </CardContent>
                    </Card>

                    {/* Total Egresos */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(resumen.totalEgresos)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{egresos.length} movimientos</p>
                        </CardContent>
                    </Card>

                    {/* Saldo Calculado */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Saldo Calculado</CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(resumen.saldoCalculado)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Entrada - Salida</p>
                        </CardContent>
                    </Card>

                    {/* Estado */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Estado</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Badge className={`${getEstadoColor(resumen.estadoCuadre)} mb-2`}>
                                {getEstadoLabel(resumen.estadoCuadre)}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">Estado del cuadre</p>
                        </CardContent>
                    </Card>
                </div>

                {/* TABLA - ENTRADAS */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    Entradas del Día
                                </CardTitle>
                                <CardDescription>
                                    Total: {formatCurrency(entradas.reduce((sum, e) => sum + e.monto, 0))}
                                </CardDescription>
                            </div>
                            <Badge variant="default" className="bg-green-600">
                                {entradas.length} movimientos
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {entradas.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hora</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Sucursal</TableHead>
                                        <TableHead>Referencia</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                        <TableHead className="text-center">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entradas.map((entrada, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{entrada.hora}</TableCell>
                                            <TableCell>
                                                <Badge className={getTipoBadgeColor(entrada.tipo)}>
                                                    {entrada.tipo.replace(/_/g, " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{entrada.nombreSucursal}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {entrada.referencia}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {entrada.descripcion}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-green-600">
                                                {formatCurrency(entrada.monto)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedDetalle(entrada);
                                                        setDetalleType("entrada");
                                                        setOpenDetalleModal(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Alert className="bg-blue-50 border-blue-200">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    No hay entradas registradas
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* TABLA - EGRESOS */}
                {egresos.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                        Egresos del Día
                                    </CardTitle>
                                    <CardDescription>
                                        Total: {formatCurrency(egresos.reduce((sum, e) => sum + e.monto, 0))}
                                    </CardDescription>
                                </div>
                                <Badge variant="destructive" className="bg-red-600">
                                    {egresos.length} movimientos
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hora</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Sucursal</TableHead>
                                        <TableHead>Referencia</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                        <TableHead className="text-center">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {egresos.map((egreso, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{egreso.hora}</TableCell>
                                            <TableCell>
                                                <Badge className={getTipoBadgeColor(egreso.tipo)}>
                                                    {egreso.tipo.replace(/_/g, " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{egreso.nombreSucursal}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {egreso.referencia}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {egreso.descripcion}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-red-600">
                                                {formatCurrency(egreso.monto)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedDetalle(egreso);
                                                        setDetalleType("egreso");
                                                        setOpenDetalleModal(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* TABLA - CORTES DE USUARIOS */}
                {cortes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        Cortes de Usuarios
                                    </CardTitle>
                                    <CardDescription>
                                        Total: {formatCurrency(cortes.reduce((sum, c) => sum + c.montoCorte, 0))}
                                    </CardDescription>
                                </div>
                                <Badge variant="default" className="bg-purple-600">
                                    {cortes.length} usuarios
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Sucursal</TableHead>
                                        <TableHead>Fecha/Hora Corte</TableHead>
                                        <TableHead className="text-right">Monto Corte</TableHead>
                                        <TableHead>Est. Caja Chica</TableHead>
                                        <TableHead>Est. Caja General</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cortes.map((corte, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{corte.usuario}</TableCell>
                                            <TableCell className="text-sm">{corte.nombreSucursal}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDateTimeFull(new Date(corte.fechaHoraCorte))}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(corte.montoCorte)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getEstadoCajaChicaBadge(corte.estadoCajaChica)}>
                                                    {corte.estadoCajaChica}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getEstadoCajaGeneralBadge(corte.estadoCajaGeneral)}>
                                                    {corte.estadoCajaGeneral}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* TABLA - INICIOS DE USUARIOS */}
                {iniciosUsuarios.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <LogIn className="h-5 w-5 text-teal-600" />
                                        Inicios de Usuarios
                                    </CardTitle>
                                    <CardDescription>
                                        Total: {formatCurrency(iniciosUsuarios.reduce((sum, i) => sum + i.montoInicio, 0))}
                                    </CardDescription>
                                </div>
                                <Badge variant="default" className="bg-teal-600">
                                    {iniciosUsuarios.length} usuarios
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Sucursal</TableHead>
                                        <TableHead>Fecha/Hora Inicio</TableHead>
                                        <TableHead className="text-right">Monto Inicio</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {iniciosUsuarios.map((inicio, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{inicio.usuario}</TableCell>
                                            <TableCell className="text-sm">{inicio.nombreSucursal}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDateTimeFull(new Date(inicio.fechaInicio))}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(inicio.montoInicio)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getEstadoBadge(inicio.estado)}>
                                                    {inicio.estado}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* RESUMEN PRE-CUADRE */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                        <CardTitle>Resumen Pre-cuadre</CardTitle>
                        <CardDescription>
                            Comparativa entre el saldo calculado y la diferencia
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                                <p className="text-xl font-bold">
                                    {formatCurrency(preCuadre.saldoInicial)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Entradas</p>
                                <p className="text-xl font-bold text-green-600">
                                    {formatCurrency(preCuadre.totalEntradas)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Egresos</p>
                                <p className="text-xl font-bold text-red-600">
                                    {formatCurrency(preCuadre.totalEgresos)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Saldo Calculado</p>
                                <p className="text-xl font-bold text-blue-600">
                                    {formatCurrency(preCuadre.saldoCalculado)}
                                </p>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <p className="text-sm text-muted-foreground">Diferencia</p>
                                <p className={`text-xl font-bold ${
                                    preCuadre.diferencia === 0
                                        ? "text-green-600"
                                        : "text-orange-600"
                                }`}>
                                    {formatCurrency(preCuadre.diferencia)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* FORMULARIO - CUADRE */}
                <Card>
                    <CardHeader>
                        <CardTitle>Crear Cuadre</CardTitle>
                        <CardDescription>
                            Completa los datos para finalizar el cuadre
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Fecha de Corte
                                </label>
                                <p className="text-lg font-semibold text-blue-900">{fechaCorte}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sucursal</label>
                                <Select value={selectedCaja} onValueChange={setSelectedCaja}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Selecciona una sucursal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sucursal1">Sucursal #1</SelectItem>
                                        <SelectItem value="sucursal2">Sucursal #2</SelectItem>
                                        <SelectItem value="sucursal3">Sucursal #3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Efectivo Contado</label>
                                <Input
                                    type="text"
                                    value={efectivoContado}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9.]/g, "");
                                        setEfectivoContado(value === "" ? "0.00" : value);
                                    }}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Diferencia</label>
                                <p className={`text-lg font-semibold p-2 rounded border ${
                                    Math.abs(preCuadre.saldoCalculado - parseFloat(efectivoContado)) > 0
                                        ? "bg-orange-100 border-orange-300"
                                        : "bg-green-100 border-green-300"
                                }`}>
                                    {formatCurrency(preCuadre.saldoCalculado - parseFloat(efectivoContado))}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Observaciones</label>
                            <Textarea
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                placeholder="Agrega observaciones si es necesario..."
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline">
                                Cancelar
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => setMostrarResumen(true)}
                                disabled={!selectedCaja}
                            >
                                Crear Cuadre
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* MODAL DE DETALLES */}
            <Dialog open={openDetalleModal} onOpenChange={setOpenDetalleModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Detalles de {detalleType === "entrada" ? "Entrada" : "Egreso"}
                        </DialogTitle>
                        <DialogDescription>
                            Información completa del movimiento
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDetalle && (
                        <Tabs defaultValue="general" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="detalles">Detalles</TabsTrigger>
                            </TabsList>

                            <TabsContent value="general" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tipo</p>
                                        <Badge className={getTipoBadgeColor(selectedDetalle.tipo)}>
                                            {selectedDetalle.tipo.replace(/_/g, " ")}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Hora</p>
                                        <p className="font-semibold">{selectedDetalle.hora}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Sucursal</p>
                                        <p className="font-semibold">{selectedDetalle.nombreSucursal}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Monto</p>
                                        <p className={`font-semibold ${detalleType === "entrada" ? "text-green-600" : "text-red-600"}`}>
                                            {formatCurrency(selectedDetalle.monto)}
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="detalles" className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Referencia</p>
                                    <p className="font-semibold">{selectedDetalle.referencia}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Descripción</p>
                                    <p className="font-semibold">{selectedDetalle.descripcion}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">ID Sucursal</p>
                                    <p className="font-semibold">{selectedDetalle.sucursalId}</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>

            {/* MODAL DE RESUMEN */}
            <AlertDialog open={mostrarResumen} onOpenChange={setMostrarResumen}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Resumen del Cuadre</AlertDialogTitle>
                        <AlertDialogDescription>
                            Revisa los datos antes de confirmar
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-3 py-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Caja Seleccionada:</span>
                            <span className="font-semibold">{selectedCaja || "No seleccionada"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Fecha de Corte:</span>
                            <span className="font-semibold">{fechaCorte}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Entradas:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(resumen.totalEntradas)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Egresos:</span>
                            <span className="font-semibold text-red-600">{formatCurrency(resumen.totalEgresos)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-3">
                            <span className="text-muted-foreground">Efectivo Contado:</span>
                            <span className="font-semibold">{formatCurrency(parseFloat(efectivoContado))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Diferencia:</span>
                            <span className={`font-semibold ${
                                Math.abs(preCuadre.saldoCalculado - parseFloat(efectivoContado)) > 0
                                    ? "text-orange-600"
                                    : "text-green-600"
                            }`}>
                                {formatCurrency(preCuadre.saldoCalculado - parseFloat(efectivoContado))}
                            </span>
                        </div>
                        {observaciones && (
                            <div className="text-sm border-t pt-3">
                                <span className="text-muted-foreground">Observaciones:</span>
                                <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                                    {observaciones}
                                </p>
                            </div>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmarCuadre}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Confirmar Cuadre
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
