"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Landmark, Search, Clock, ArrowUpRight, ArrowDownLeft, Plus, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Calendar, BarChart3, Zap, Target } from "lucide-react";
import { iCajaGeneralDashboard } from "@/interfaces/CajaGeneralDashboardInterface";
import { getCajaGeneralDashboard, getPreCuadreCajaGeneral } from "@/actions/CajaGeneralActions";
import { iGetSucursales } from "@/interfaces/SucursalesInterface";
import { iPreCuadreResponse } from "@/interfaces/PreCuadreInterface";
import { iGetCuentasBancarias } from "@/interfaces/ClientesInterface";
import { iGetUsers } from "@/interfaces/SeguridadInterface";
import { ModalNuevoMovimientoCajaGeneral } from "./ModalNuevoMovimientoCajaGeneral";
import { ModalCuadreCajaGeneral } from "./ModalCuadreCajaGeneral";
import { formatNumber } from "@/lib/format-number";

interface CajaGeneralPageProps {
    usuarioId: number;
    sucursalUsuarioId: number;
    sucursales: iGetSucursales[];
    dashboardInicial: iCajaGeneralDashboard | null;
    preCuadreInicial: iPreCuadreResponse | null;
    usuarios: iGetUsers[];
    cuentasBancarias: iGetCuentasBancarias[];
    fechaActual: string;
}

export function CajaGeneralPage({
    usuarioId,
    sucursalUsuarioId,
    sucursales,
    dashboardInicial,
    preCuadreInicial,
    usuarios,
    cuentasBancarias,
    fechaActual
}: CajaGeneralPageProps) {
    console.log("🚀 ~ CajaGeneralPage ~ preCuadreInicial:", preCuadreInicial)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalCuadreOpen, setIsModalCuadreOpen] = useState(false);

    // Obtener fecha local (no UTC)
    const getLocalDate = () => {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
    };

    const [fecha, setFecha] = useState(getLocalDate());
    const [sucursal, setSucursal] = useState("todas");
    const [loading, setLoading] = useState(false);
    const [dashboard, setDashboard] = useState<iCajaGeneralDashboard | null>(dashboardInicial);
    const [preCuadre, setPreCuadre] = useState<iPreCuadreResponse | null>(preCuadreInicial);

    const handleBuscar = useCallback(async () => {
        setLoading(true);
        try {
            const sucursalId = sucursal !== "todas" ? Number(sucursal) : undefined;
            const data = await getCajaGeneralDashboard(fecha, sucursalId);
            setDashboard(data);
        } catch (error) {
            console.error("Error al cargar dashboard:", error);
        } finally {
            setLoading(false);
        }
    }, [fecha, sucursal]);

    const cargarPreCuadre = useCallback(async () => {
        try {
            const data = await getPreCuadreCajaGeneral(fecha);
            setPreCuadre(data);
        } catch (error) {
            console.error("Error al cargar pre-cuadre:", error);
        }
    }, [fecha, sucursal]);

    // Auto-cargar datos cuando cambia la fecha o sucursal
    useEffect(() => {
        handleBuscar();
        cargarPreCuadre();
    }, [fecha, sucursal, handleBuscar, cargarPreCuadre]);

    const getEstadoBadge = (estado: string) => {
        const variants: Record<string, any> = {
            CERRADO: "bg-green-100 text-green-800",
            PENDIENTE: "bg-yellow-100 text-yellow-800",
            CUADRADA: "bg-blue-100 text-blue-800",
            "CON_DIFERENCIA": "bg-orange-100 text-orange-800",
        };
        return variants[estado] || "bg-gray-100 text-gray-800";
    };

    const formatHora = (horaString: string): string => {
        try {
            const [horas, minutos] = horaString.split(":").slice(0, 2);
            return `${horas}:${minutos}`;
        } catch {
            return horaString;
        }
    };

    return (
        <div className="space-y-6 pb-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <Landmark className="h-8 w-8" />
                        Dashboard Caja General
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Gestiona y monitorea el movimiento de caja general
                    </p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    size="sm"
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Movimiento
                </Button>
            </div>

            {/* FILTROS */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Label htmlFor="fecha" className="mb-2 block">
                                Fecha del Cuadre
                            </Label>
                            <Input
                                id="fecha"
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="sucursal" className="mb-2 block">
                                Sucursal
                            </Label>
                            <Select value={sucursal} onValueChange={setSucursal}>
                                <SelectTrigger id="sucursal">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todas">Todas las Sucursales</SelectItem>
                                    {sucursales.map((suc) => (
                                        <SelectItem key={suc.SucursalID} value={String(suc.SucursalID)}>
                                            {suc.NombreSucursal}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleBuscar}
                            disabled={loading}
                            className="gap-2"
                        >
                            <Search className="h-4 w-4" />
                            {loading ? "Buscando..." : "Buscar"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* RESUMEN - 4 TARJETAS */}
            {dashboard && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Saldo Inicial */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Saldo
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    $ {formatNumber(dashboard.resumen.saldoInicial)}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Entradas */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                                    Entradas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    $ {formatNumber(dashboard.resumen.totalEntradas)}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Egresos */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <ArrowDownLeft className="h-4 w-4 text-red-600" />
                                    Egresos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    $ {formatNumber(dashboard.resumen.totalEgresos)}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Saldo Final  */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Saldo Final
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    $ {formatNumber(dashboard.resumen.saldoCalculado)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ENTRADAS DEL DÍA - TIMELINE */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Entradas del Día</CardTitle>
                                <CardDescription>
                                    Detalle de ingresos registrados
                                </CardDescription>
                            </div>

                        </CardHeader>
                        <CardContent>
                            {dashboard.entradas && dashboard.entradas.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboard.entradas.map((entrada, idx) => (
                                        <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold">{entrada.hora} — {entrada.descripcion}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {entrada.nombreSucursal} • Ref: {entrada.referencia}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-green-600 flex-shrink-0">
                                                        $ {formatNumber(entrada.monto)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay entradas registradas</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* EGRESOS DEL DÍA - TIMELINE */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Egresos del Día</CardTitle>
                            <CardDescription>
                                Detalle de salidas registradas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dashboard.egresos && dashboard.egresos.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboard.egresos.map((egreso, idx) => (
                                        <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                                    <ArrowDownLeft className="h-5 w-5 text-red-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold">{egreso.hora} — {egreso.descripcion}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {egreso.nombreSucursal} • Ref: {egreso.referencia}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-red-600 flex-shrink-0">
                                                        $ {formatNumber(egreso.monto)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay egresos registrados</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* CORTES DE USUARIO - TABLA */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cortes de Usuario</CardTitle>
                            <CardDescription>
                                Detalle de cortes de cajas de usuarios
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dashboard.cortesUsuarios && dashboard.cortesUsuarios.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Usuario</TableHead>
                                                <TableHead>Sucursal</TableHead>
                                                <TableHead>Hora Corte</TableHead>
                                                <TableHead className="text-right">Monto Corte</TableHead>
                                                <TableHead>Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dashboard.cortesUsuarios.map((corte, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="font-medium">{corte.usuario}</TableCell>
                                                    <TableCell>{corte.nombreSucursal}</TableCell>
                                                    <TableCell>{formatHora(corte.fechaHoraCorte)}</TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        $ {formatNumber(corte.montoCorte)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getEstadoBadge(corte.estadoCajaChica)}>
                                                            {corte.estadoCajaChica}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay cortes de usuario registrados</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* INICIOS DE USUARIO - AUDITORÍA */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inicios de Usuario</CardTitle>
                            <CardDescription>
                                Auditoría de inicios de caja
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dashboard.iniciosUsuarios && dashboard.iniciosUsuarios.length > 0 ? (
                                <div className="overflow-x-auto">
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
                                            {dashboard.iniciosUsuarios.map((inicio, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="font-medium">{inicio.usuario}</TableCell>
                                                    <TableCell>{inicio.nombreSucursal}</TableCell>
                                                    <TableCell>{formatHora(inicio.fechaInicio)}</TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        $ {formatNumber(inicio.montoInicio)}
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
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay inicios de usuario registrados</p>
                            )}
                        </CardContent>
                    </Card>


                </>
            )}

            {/* PRE-CUADRE CAJA GENERAL */}
            {preCuadre ? (
                <>
                    <Card className="border-2 border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="text-lg">Pre-Cuadre Caja General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* SECCIÓN DE CÁLCULO */}
                            <div className="space-y-3 bg-white p-4 rounded-lg border">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Saldo Inicial:</span>
                                    <span className="text-sm font-semibold">
                                        $ {formatNumber(preCuadre.preCuadre.saldoInicial)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-sm font-medium text-green-600">+ Total Entradas del día:</span>
                                    <span className="text-sm font-semibold text-green-600">
                                        $ {formatNumber(preCuadre.preCuadre.totalEntradas)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b">
                                    <span className="text-sm font-medium text-red-600">- Total Egresos del día:</span>
                                    <span className="text-sm font-semibold text-red-600">
                                        $ {formatNumber(preCuadre.preCuadre.totalEgresos)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 bg-blue-100 p-2 rounded">
                                    <span className="font-semibold">= Saldo Calculado:</span>
                                    <span className="font-bold text-lg">
                                        $ {formatNumber(preCuadre.preCuadre.saldoCalculado)}
                                    </span>
                                </div>
                            </div>

                            {/* SECCIÓN DE ANALÍTICA */}
                            {preCuadre && (
                                <div className="space-y-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-5 rounded-xl border-2 border-indigo-200 shadow-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                                            Analítica Avanzada
                                        </h3>
                                        <Zap className="h-5 w-5 text-amber-500" />
                                    </div>

                                    {/* ÚLTIMO CUADRE */}
                                    {preCuadre.analitica ? (
                                        <div className="bg-white/80 backdrop-blur p-4 rounded-lg border-l-4 border-l-indigo-500 shadow-md hover:shadow-lg transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Calendar className="h-4 w-4 text-indigo-600" />
                                                <p className="text-sm font-bold text-indigo-900">Último Cuadre</p>
                                            </div>
                                            <div className="space-y-2 ml-7">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-slate-600">Fecha:</span>
                                                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                                                        {new Date(preCuadre.analitica.ultimoCuadreFecha).toLocaleDateString('es-MX', { 
                                                            year: 'numeric', 
                                                            month: '2-digit', 
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-indigo-100">
                                                    <span className="text-xs text-slate-600 font-medium">Saldo Final:</span>
                                                    <span className="text-sm font-bold text-indigo-900 bg-indigo-100 px-3 py-1 rounded-full">
                                                        $ {formatNumber(preCuadre.analitica.ultimoCuadreSaldoFinal)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white/80 backdrop-blur p-4 rounded-lg border-l-4 border-l-slate-300 shadow-md">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                <p className="text-sm font-bold text-slate-600">Sin datos de últimos cuadres</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* PROMEDIO DE LOS ÚLTIMOS CUADRES */}
                                    {preCuadre.analitica ? (
                                        <div>
                                            <p className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                <Target className="h-4 w-4 text-blue-600" />
                                                Promedios (Últimos {preCuadre.analitica.promedioUltimosCuadres.diasConsiderados} día(s))
                                            </p>
                                            <div className="grid sm:grid-cols-3 gap-3">
                                                {/* Promedio Entradas */}
                                                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 opacity-10"></div>
                                                    <div className="relative p-4 bg-white border-2 border-green-300">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-2 bg-green-100 rounded-lg">
                                                                <ArrowUpRight className="h-4 w-4 text-green-600" />
                                                            </div>
                                                            <span className="text-xs font-bold text-green-700">Entradas</span>
                                                        </div>
                                                        <p className="text-lg font-black text-green-900 mb-2">
                                                            $ {formatNumber(preCuadre.analitica.promedioUltimosCuadres.totalEntradas)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Promedio Egresos */}
                                                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 opacity-10"></div>
                                                    <div className="relative p-4 bg-white border-2 border-red-300">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-2 bg-red-100 rounded-lg">
                                                                <ArrowDownLeft className="h-4 w-4 text-red-600" />
                                                            </div>
                                                            <span className="text-xs font-bold text-red-700">Egresos</span>
                                                        </div>
                                                        <p className="text-lg font-black text-red-900 mb-2">
                                                            $ {formatNumber(preCuadre.analitica.promedioUltimosCuadres.totalEgresos)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Saldo Promedio */}
                                                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-10"></div>
                                                    <div className="relative p-4 bg-white border-2 border-blue-300">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <span className="text-xs font-bold text-blue-700">Saldo Promedio</span>
                                                        </div>
                                                        <p className="text-lg font-black text-blue-900 mb-2">
                                                            $ {formatNumber(preCuadre.analitica.promedioUltimosCuadres.saldoFinal)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-white/80 rounded-lg border-2 border-slate-200 text-center">
                                            <p className="text-xs text-slate-500 font-medium">Sin datos de promedio disponibles</p>
                                        </div>
                                    )}

                                    {/* VARIACIÓN VS PROMEDIO */}
                                    {preCuadre.analitica && preCuadre.analitica.variacionVsPromedio ? (
                                        <div className="bg-white/80 backdrop-blur p-4 rounded-lg border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                                            <p className="text-sm font-bold text-purple-900 mb-4 flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-purple-600" />
                                                Variación vs Promedio
                                            </p>
                                            <div className="flex flex-col md:flex-row gap-2 space-y-3 ">
                                                {/* Entradas */}
                                                <div className="flex flex-1 items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-200 rounded-full">
                                                            {preCuadre.analitica.variacionVsPromedio.totalEntradasPct < 0 ? (
                                                                <TrendingDown className="h-4 w-4 text-red-500" />
                                                            ) : preCuadre.analitica.variacionVsPromedio.totalEntradasPct > 0 ? (
                                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <span className="text-xs text-slate-500 font-bold">─</span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-700">Entradas</span>
                                                    </div>
                                                    <span className={`text-sm font-black px-4 py-2 rounded-full font-mono ${
                                                        preCuadre.analitica.variacionVsPromedio.totalEntradasPct < 0
                                                            ? 'bg-red-500 text-white shadow-lg'
                                                            : preCuadre.analitica.variacionVsPromedio.totalEntradasPct > 0
                                                            ? 'bg-green-500 text-white shadow-lg'
                                                            : 'bg-slate-300 text-slate-800 shadow'
                                                    }`}>
                                                        {preCuadre.analitica.variacionVsPromedio.totalEntradasPct > 0 ? '+' : ''}{preCuadre.analitica.variacionVsPromedio.totalEntradasPct}%
                                                    </span>
                                                </div>

                                                {/* Egresos */}
                                                <div className="flex flex-1 items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-200 rounded-full">
                                                            {preCuadre.analitica.variacionVsPromedio.totalEgresosPct < 0 ? (
                                                                <TrendingDown className="h-4 w-4 text-green-500" />
                                                            ) : preCuadre.analitica.variacionVsPromedio.totalEgresosPct > 0 ? (
                                                                <TrendingUp className="h-4 w-4 text-red-500" />
                                                            ) : (
                                                                <span className="text-xs text-slate-500 font-bold">─</span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-700">Egresos</span>
                                                    </div>
                                                    <span className={`text-sm font-black px-4 py-2 rounded-full font-mono ${
                                                        preCuadre.analitica.variacionVsPromedio.totalEgresosPct > 0
                                                            ? 'bg-red-500 text-white shadow-lg'
                                                            : preCuadre.analitica.variacionVsPromedio.totalEgresosPct < 0
                                                            ? 'bg-green-500 text-white shadow-lg'
                                                            : 'bg-slate-300 text-slate-800 shadow'
                                                    }`}>
                                                        {preCuadre.analitica.variacionVsPromedio.totalEgresosPct > 0 ? '+' : ''}{preCuadre.analitica.variacionVsPromedio.totalEgresosPct}%
                                                    </span>
                                                </div>

                                                {/* Saldo */}
                                                <div className="flex flex-1 items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border-2 border-indigo-300 font-bold">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-200 rounded-full">
                                                            {preCuadre.analitica.variacionVsPromedio.saldoCalculadoPct < 0 ? (
                                                                <TrendingDown className="h-4 w-4 text-red-500" />
                                                            ) : preCuadre.analitica.variacionVsPromedio.saldoCalculadoPct > 0 ? (
                                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-semibold text-indigo-900">Saldo Calculado</span>
                                                    </div>
                                                    <span className={`text-sm font-black px-4 py-2 rounded-full font-mono ${
                                                        preCuadre.analitica.variacionVsPromedio.saldoCalculadoPct < 0
                                                            ? 'bg-red-500 text-white shadow-lg'
                                                            : preCuadre.analitica.variacionVsPromedio.saldoCalculadoPct > 0
                                                            ? 'bg-green-500 text-white shadow-lg'
                                                            : 'bg-indigo-500 text-white shadow-lg'
                                                    }`}>
                                                        {preCuadre.analitica.variacionVsPromedio.saldoCalculadoPct > 0 ? '+' : ''}{preCuadre.analitica.variacionVsPromedio.saldoCalculadoPct}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-white/80 rounded-lg border-2 border-slate-200 text-center">
                                            <p className="text-xs text-slate-500 font-medium">Sin datos de variación disponibles</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button 
                                className="w-full" 
                                size="lg"
                                onClick={() => setIsModalCuadreOpen(true)}
                                disabled={!preCuadre.puedeCuadrarHoy}
                                title={!preCuadre.puedeCuadrarHoy && preCuadre.motivosBloqueo.length > 0 ? preCuadre.motivosBloqueo[0] : ''}
                            >
                                {preCuadre.yaCuadradoHoy ? 'Ya Cuadrado Hoy' : preCuadre.puedeCuadrarHoy ? 'Proceder al Cuadre' : 'No se puede cuadrar'}
                            </Button>

                            {!preCuadre.puedeCuadrarHoy && preCuadre.motivosBloqueo.length > 0 && (
                                <div className="p-3 bg-amber-50 border-l-4 border-l-amber-500 rounded">
                                    <p className="text-xs font-semibold text-amber-900 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Motivo del bloqueo:
                                    </p>
                                    <p className="text-xs text-amber-800 mt-1">
                                        {preCuadre.motivosBloqueo[0]}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : (
                <p className="text-sm text-muted-foreground">Cargando pre-cuadre...</p>
            )}

            {/* HISTORIAL DE CUADRES */}
            {dashboard && (
                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Cuadres de Caja</CardTitle>
                        <CardDescription>
                            Cuadres realizados anteriormente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {dashboard.historialCuadres && dashboard.historialCuadres.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Sucursal</TableHead>
                                            <TableHead className="text-right">Saldo Inicial</TableHead>
                                            <TableHead className="text-right">Entradas</TableHead>
                                            <TableHead className="text-right">Egresos</TableHead>
                                            <TableHead className="text-right">Saldo Final</TableHead>
                                            <TableHead>Usuario</TableHead>
                                            <TableHead>Estatus</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dashboard.historialCuadres.map((cuadre, idx) => {
                                            const fecha = new Date(cuadre.fecha);
                                            const fechaFormato = fecha.toLocaleDateString('es-MX');
                                            return (
                                                <TableRow key={idx}>
                                                    <TableCell>{fechaFormato}</TableCell>
                                                    <TableCell>{cuadre.nombreSucursal || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        $ {formatNumber(cuadre.saldoInicial)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-green-600 font-semibold">
                                                        $ {formatNumber(cuadre.totalEntradas)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-red-600 font-semibold">
                                                        $ {formatNumber(cuadre.totalEgresos)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        $ {formatNumber(cuadre.saldoFinal)}
                                                    </TableCell>
                                                    <TableCell>{cuadre.usuarioCuadre || '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getEstadoBadge(cuadre.estatus)}>
                                                            {cuadre.estatus}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No hay cuadres en el historial</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ESTADO DE CARGA */}
            {loading && (
                <div className="flex justify-center py-12">
                    <p className="text-muted-foreground">Cargando datos...</p>
                </div>
            )}

            {/* MODAL NUEVO MOVIMIENTO */}
            <ModalNuevoMovimientoCajaGeneral
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    // Recargar datos después de registrar movimiento
                    handleBuscar();
                    cargarPreCuadre();
                }}
                usuarioId={usuarioId}
                cuentasBancarias={cuentasBancarias}
                usuarios={usuarios}
                fechaActual={fechaActual}
            />

            {/* MODAL CUADRE */}
            <ModalCuadreCajaGeneral
                isOpen={isModalCuadreOpen}
                onOpenChange={setIsModalCuadreOpen}
                onSuccess={() => {
                    // Recargar datos después de cuadrar
                    handleBuscar();
                    cargarPreCuadre();
                }}
                usuarioId={usuarioId}
                sucursalUsuarioId={sucursalUsuarioId}
                sucursales={sucursales}
                fechaActual={fechaActual}
                saldoEsperado={preCuadre?.preCuadre.saldoCalculado || 0}
            />
        </div>
    );
}
