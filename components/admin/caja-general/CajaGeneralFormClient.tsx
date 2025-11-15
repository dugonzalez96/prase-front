"use client";

import { useState } from "react";
import { iCajaGeneral, iResumenCajaGeneral, iCorteUsuarioResumen } from "@/interfaces/CajaGeneralInterface";
import { iGetMovimientos } from "@/interfaces/MovimientosInterface";
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
import { TrendingUp, TrendingDown, AlertCircle, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";

interface CajaGeneralFormClientProps {
    cajaGeneral: iCajaGeneral;
    resumenInicial: iResumenCajaGeneral;
    cortesUsuarios: iCorteUsuarioResumen[];
    movimientosIniciales: iGetMovimientos[];
    usuarioId: number;
}

// Mock data para entradas del día
const mockEntradasDelDia = [
    {
        id: 1,
        sucursal: "Sucursal Centro",
        caja: "Caja 1",
        entregaGeneral: "5000.00",
        desglose: "5x1000",
        hora: "09:30",
    },
    {
        id: 2,
        sucursal: "Sucursal Centro",
        caja: "Caja 2",
        entregaGeneral: "3500.00",
        desglose: "3x1000 + 5x100",
        hora: "10:15",
    },
    {
        id: 3,
        sucursal: "Sucursal Sur",
        caja: "Caja 1",
        entregaGeneral: "7200.00",
        desglose: "7x1000 + 2x100",
        hora: "11:00",
    },
];

export function CajaGeneralFormClient({
    cajaGeneral,
    resumenInicial,
    cortesUsuarios,
    movimientosIniciales,
    usuarioId
}: CajaGeneralFormClientProps) {
    const [selectedCaja, setSelectedCaja] = useState<string>("");
    const [fondoMinimo, setFondoMinimo] = useState<string>("10000.00");
    const [efectivoContado, setEfectivoContado] = useState<string>("0.00");
    const [observaciones, setObservaciones] = useState<string>("");
    const [mostrarResumen, setMostrarResumen] = useState(false);

    // Separar movimientos en ingresos y egresos
    const ingresos = movimientosIniciales.filter(m => m.TipoTransaccion === 'Ingreso');
    const egresos = movimientosIniciales.filter(m => m.TipoTransaccion === 'Egreso');

    const totalIngresos = ingresos.reduce((sum, m) => sum + parseFloat(m.Monto || '0'), 0);
    const totalEgresos = egresos.reduce((sum, m) => sum + parseFloat(m.Monto || '0'), 0);

    const handleConfirmarCuadre = async () => {
        // Aquí iría la llamada al servicio
        console.log("Cuadre confirmado", {
            cajaSeleccionada: selectedCaja,
            efectivoContado,
            observaciones,
        });
        setMostrarResumen(false);
    };

    const fechaCorte = new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <>
            <div className="space-y-6">
                {/* ENCABEZADO DEL FORMULARIO */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <CardTitle className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Fecha de Corte
                                </CardTitle>
                                <p className="text-xl font-bold text-blue-900">{fechaCorte}</p>
                            </div>
                            <div>
                                <CardTitle className="text-sm text-muted-foreground mb-2">
                                    Caja General
                                </CardTitle>
                                <Select value={selectedCaja} onValueChange={setSelectedCaja}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Selecciona una caja" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="caja1">Caja General #1</SelectItem>
                                        <SelectItem value="caja2">Caja General #2</SelectItem>
                                        <SelectItem value="caja3">Caja General #3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <CardTitle className="text-sm text-muted-foreground mb-2">
                                    Fondo Mínimo
                                </CardTitle>
                                <p className="text-xl font-bold text-blue-900">{formatCurrency(parseFloat(fondoMinimo))}</p>
                                <p className="text-xs text-muted-foreground">Mock data (servicio pendiente)</p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* TABLA - ENTRADAS DEL DÍA */}
                <Card>
                    <CardHeader>
                        <CardTitle>Entradas del Día</CardTitle>
                        <CardDescription>
                            Movimientos de efectivo registrados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {mockEntradasDelDia.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sucursal</TableHead>
                                        <TableHead>Caja</TableHead>
                                        <TableHead className="text-right">Entrega General</TableHead>
                                        <TableHead>Desglose</TableHead>
                                        <TableHead>Hora</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockEntradasDelDia.map((entrada) => (
                                        <TableRow key={entrada.id}>
                                            <TableCell className="font-medium">
                                                {entrada.sucursal}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{entrada.caja}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(parseFloat(entrada.entregaGeneral))}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {entrada.desglose}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {entrada.hora}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    No hay entradas registradas para hoy
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* TABLA DE INGRESOS */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    Ingresos
                                </CardTitle>
                                <CardDescription>
                                    Total: {formatCurrency(totalIngresos)}
                                </CardDescription>
                            </div>
                            <Badge variant="default" className="bg-green-600">
                                {ingresos.length} movimientos
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {ingresos.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Forma de Pago</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                        <TableHead>Validado</TableHead>
                                        <TableHead>Fecha</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ingresos.map((mov) => (
                                        <TableRow key={mov.TransaccionID}>
                                            <TableCell className="font-medium">
                                                #{mov.TransaccionID}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{mov.FormaPago}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-sm truncate">
                                                {mov.Descripcion}
                                            </TableCell>
                                            <TableCell>
                                                {mov.UsuarioCreo?.NombreUsuario || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(parseFloat(mov.Monto))}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={mov.Validado === 1 ? 'default' : 'destructive'}
                                                    className={mov.Validado === 1 ? 'bg-green-600' : 'bg-red-500'}
                                                >
                                                    {mov.Validado === 1 ? 'Sí' : 'No'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(mov.FechaTransaccion).toLocaleDateString('es-MX')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Alert className="bg-blue-50 border-blue-200">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    No hay ingresos registrados
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* TABLA DE EGRESOS */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                    Egresos
                                </CardTitle>
                                <CardDescription>
                                    Total: {formatCurrency(totalEgresos)}
                                </CardDescription>
                            </div>
                            <Badge variant="destructive" className="bg-red-600">
                                {egresos.length} movimientos
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {egresos.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Forma de Pago</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                        <TableHead>Validado</TableHead>
                                        <TableHead>Fecha</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {egresos.map((mov) => (
                                        <TableRow key={mov.TransaccionID}>
                                            <TableCell className="font-medium">
                                                #{mov.TransaccionID}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{mov.FormaPago}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-sm truncate">
                                                {mov.Descripcion}
                                            </TableCell>
                                            <TableCell>
                                                {mov.UsuarioCreo?.NombreUsuario || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(parseFloat(mov.Monto))}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={mov.Validado === 1 ? 'default' : 'destructive'}
                                                    className={mov.Validado === 1 ? 'bg-green-600' : 'bg-red-500'}
                                                >
                                                    {mov.Validado === 1 ? 'Sí' : 'No'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(mov.FechaTransaccion).toLocaleDateString('es-MX')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Alert className="bg-blue-50 border-blue-200">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    No hay egresos registrados
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* FORMULARIO - CUADRE */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen de Cuadre</CardTitle>
                        <CardDescription>
                            Completa los datos para finalizar el cuadre
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
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
                                <p className={`text-lg font-semibold p-2 rounded border ${Math.abs(totalIngresos - totalEgresos - parseFloat(efectivoContado)) > 0
                                        ? "bg-orange-100 border-orange-300"
                                        : "bg-green-100 border-green-300"
                                    }`}>
                                    {formatCurrency(totalIngresos - totalEgresos - parseFloat(efectivoContado))}
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
                            <Button
                                variant="outline"
                            >
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
                            <span className="text-muted-foreground">Total Ingresos:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(totalIngresos)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Egresos:</span>
                            <span className="font-semibold text-red-600">{formatCurrency(totalEgresos)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-3">
                            <span className="text-muted-foreground">Efectivo Contado:</span>
                            <span className="font-semibold">{formatCurrency(parseFloat(efectivoContado))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Diferencia:</span>
                            <span className={`font-semibold ${Math.abs(totalIngresos - totalEgresos - parseFloat(efectivoContado)) > 0
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }`}>
                                {formatCurrency(totalIngresos - totalEgresos - parseFloat(efectivoContado))}
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
