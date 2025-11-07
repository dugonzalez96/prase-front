"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCajasChicasPorEstatus } from "@/actions/CajaChicaActions";
import { iCajaChicaPorEstatus } from "@/interfaces/CajaChicaInterface";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LoaderModales } from "@/components/LoaderModales";
import { Search, Calendar, FileText, AlertCircle } from "lucide-react";

const ESTATUS_OPTIONS = [
    { value: "CUADRADA", label: "Cuadrada" },
    { value: "CANCELADA", label: "Cancelada" },
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "TODOS", label: "Todos los estatus" }
];

export function HistorialCajaChica() {
    const { toast } = useToast();
    const [historial, setHistorial] = useState<iCajaChicaPorEstatus[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filtros
    const [estatus, setEstatus] = useState("CUADRADA");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");

    // Cargar historial al montar o cambiar filtros
    useEffect(() => {
        fetchHistorial();
    }, []);

    const fetchHistorial = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await getCajasChicasPorEstatus(
                estatus === "TODOS" ? "" : estatus,
                fechaDesde || undefined,
                fechaHasta || undefined
            );

            if ('error' in result) {
                setError(result.error);
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive"
                });
                return;
            }

            setHistorial(result);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error al cargar historial';
            setError(errorMsg);
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBuscar = () => {
        fetchHistorial();
    };

    const handleLimpiarFiltros = () => {
        setEstatus("CUADRADA");
        setFechaDesde("");
        setFechaHasta("");
    };

    const getEstatusBadge = (estatus: string) => {
        switch (estatus) {
            case "CUADRADA":
                return <Badge variant="default" className="bg-green-600">Cuadrada</Badge>;
            case "CANCELADA":
                return <Badge variant="destructive">Cancelada</Badge>;
            case "PENDIENTE":
                return <Badge variant="secondary">Pendiente</Badge>;
            default:
                return <Badge variant="outline">{estatus}</Badge>;
        }
    };

    const getDiferenciaColor = (diferencia: number) => {
        if (Math.abs(diferencia) < 0.01) return "text-green-600 font-semibold";
        if (diferencia > 0) return "text-orange-600 font-semibold";
        return "text-blue-600 font-semibold";
    };

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Filtros de Búsqueda
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        {/* Estatus */}
                        <div className="space-y-2">
                            <Label htmlFor="estatus">Estatus</Label>
                            <Select value={estatus} onValueChange={setEstatus}>
                                <SelectTrigger id="estatus">
                                    <SelectValue placeholder="Seleccione estatus" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ESTATUS_OPTIONS.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fecha Desde */}
                        <div className="space-y-2">
                            <Label htmlFor="fechaDesde">Desde</Label>
                            <Input
                                id="fechaDesde"
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                            />
                        </div>

                        {/* Fecha Hasta */}
                        <div className="space-y-2">
                            <Label htmlFor="fechaHasta">Hasta</Label>
                            <Input
                                id="fechaHasta"
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                            />
                        </div>

                        {/* Botones */}
                        <div className="space-y-2">
                            <Label>&nbsp;</Label>
                            <div className="flex gap-2">
                                <Button onClick={handleBuscar} disabled={isLoading}>
                                    Buscar
                                </Button>
                                <Button variant="outline" onClick={handleLimpiarFiltros}>
                                    Limpiar
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Estado de carga */}
            {isLoading && <LoaderModales texto="Cargando historial..." />}

            {/* Error */}
            {error && !isLoading && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Sin resultados */}
            {!isLoading && !error && historial.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            No se encontraron registros con los filtros seleccionados
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Tabla de resultados */}
            {!isLoading && historial.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Historial de Cajas Chicas ({historial.length} registro{historial.length !== 1 && 's'})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Fondo Inicial</TableHead>
                                        <TableHead>Saldo Esperado</TableHead>
                                        <TableHead>Saldo Real</TableHead>
                                        <TableHead>Diferencia</TableHead>
                                        <TableHead>Estatus</TableHead>
                                        <TableHead>Observaciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historial.map((caja) => (
                                        <TableRow key={caja.CajaChicaID}>
                                            <TableCell className="font-medium">
                                                #{caja.CajaChicaID}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(caja.Fecha).toLocaleDateString('es-MX', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell>{formatCurrency(caja.FondoInicial)}</TableCell>
                                            <TableCell className="text-blue-600 font-semibold">
                                                {formatCurrency(caja.SaldoEsperado)}
                                            </TableCell>
                                            <TableCell>{formatCurrency(caja.SaldoReal)}</TableCell>
                                            <TableCell className={getDiferenciaColor(caja.Diferencia)}>
                                                {formatCurrency(Math.abs(caja.Diferencia))}
                                                {caja.Diferencia > 0.01 && " ↓"}
                                                {caja.Diferencia < -0.01 && " ↑"}
                                            </TableCell>
                                            <TableCell>
                                                {getEstatusBadge(caja.Estatus)}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate text-muted-foreground">
                                                {caja.Observaciones || "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
