"use client";

/**
 * CajaChicaClient.tsx - REFACTORIZADO
 * 
 * Componente refactorizado basado en la estructura real del backend.
 * 
 * ✅ FUNCIONA:
 * - Carga de precuadre con getPrecuadreCajaChica()
 * - Mostr encabezado simple (MOCK)
 * - Tabla de totales por método: Efectivo, Tarjeta, Transferencia
 * - Tabla de otros movimientos (ingresos/egresos)
 * - Cálculos automáticos simples
 * - Tabla vacía de cortes de usuario (pendiente de especificación)
 * - Modal para crear corte con resumen + formulario
 * - Loader durante envío del POST
 */

import { getPrecuadreCajaChica, cuadrarCajaChica as cuadrarCajaChicaAction } from "@/actions/CajaChicaActions";
import { getMovimientos } from "@/actions/MovimientosActions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { iPrecuadreCajaChicaBackend } from "@/interfaces/CajaChicaInterface";
import { iGetMovimientos } from "@/interfaces/MovimientosInterface";
import { AlertCircle, Calculator, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";
import { LoaderModales } from "@/components/LoaderModales";

interface CajaChicaClientProps {
    usuarioId: number;
}

export function CajaChicaClient({ usuarioId }: CajaChicaClientProps) {
    const { toast } = useToast();
    const [precuadre, setPrecuadre] = useState<iPrecuadreCajaChicaBackend | null>(null);
    const [movimientos, setMovimientos] = useState<iGetMovimientos[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingCorte, setIsLoadingCorte] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalCuadreOpen, setIsModalCuadreOpen] = useState(false);
    const isMounted = useRef(true);

    // Estado del formulario de cuadre
    const [formDataCuadre, setFormDataCuadre] = useState({
        SaldoReal: 0,
        TotalEfectivoCapturado: 0,
        TotalTarjetaCapturado: 0,
        TotalTransferenciaCapturado: 0,
        Observaciones: "",
    });

    // Fetch datos iniciales
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [precuadreResult, movimientosResult] = await Promise.all([
                getPrecuadreCajaChica(),
                getMovimientos(),
            ]);

            if (!isMounted.current) return;

            // Precuadre
            if ("error" in precuadreResult) {
                setError(precuadreResult.error);
                toast({
                    title: "Error",
                    description: precuadreResult.error,
                    variant: "destructive",
                });
                return;
            }
            setPrecuadre(precuadreResult);

            // Movimientos
            if (movimientosResult) {
                setMovimientos(movimientosResult);
            }

            // Mostrar mensajes
            if (precuadreResult.mensajes && precuadreResult.mensajes.length > 0) {
                precuadreResult.mensajes.forEach((msg) => {
                    toast({
                        title: "Información",
                        description: msg,
                    });
                });
            }
        } catch (err) {
            if (!isMounted.current) return;
            const errorMsg = err instanceof Error ? err.message : "Error al cargar datos";
            setError(errorMsg);
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive",
            });
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Manejador de cuadre
    const handleCuadre = async () => {
        setIsLoadingCorte(true);
        try {
            const result = await cuadrarCajaChicaAction(1, formDataCuadre);

            if (!isMounted.current) return;

            if (result.success) {
                toast({
                    title: "Éxito",
                    description: result.message,
                });
                setIsModalCuadreOpen(false);
                // Reset formulario
                setFormDataCuadre({
                    SaldoReal: 0,
                    TotalEfectivoCapturado: 0,
                    TotalTarjetaCapturado: 0,
                    TotalTransferenciaCapturado: 0,
                    Observaciones: "",
                });
                // Refresh de página
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                });
            }
        } catch (err) {
            if (!isMounted.current) return;
            const errorMsg = err instanceof Error ? err.message : "Error al cuadrar";
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive",
            });
        } finally {
            if (isMounted.current) {
                setIsLoadingCorte(false);
            }
        }
    };

    // Estados de carga y error
    if (isLoading) {
        return <LoaderModales />;
    }

    if (error && !precuadre) {
        return (
            <div className="space-y-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={fetchData}>Reintentar</Button>
            </div>
        );
    }

    if (!precuadre) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No hay datos de precuadre disponibles</p>
                <Button onClick={fetchData}>Cargar Precuadre</Button>
            </div>
        );
    }

    // Calcular totales de movimientos
    const ingresos = movimientos.filter((m) => m.TipoTransaccion === "Ingreso");
    const egresos = movimientos.filter((m) => m.TipoTransaccion === "Egreso");

    // Cálculos simples
    const saldoDisponible =
        precuadre.FondoInicial +
        precuadre.Totales.TotalIngresos -
        precuadre.Totales.TotalEgresos;
    const entregaAGeneral = Math.max(0, saldoDisponible - precuadre.FondoInicial);
    const saldoFinal = saldoDisponible - entregaAGeneral;

    return (
        <>
            {isLoadingCorte && <LoaderModales texto="Procesando cuadre..." />}

            <div className="container mx-auto py-8 space-y-6">
                {/* Título */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold flex items-center gap-2">
                            <Wallet className="h-8 w-8" />
                            Caja Chica
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            {new Date().toLocaleDateString("es-MX", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <Button onClick={fetchData} variant="outline">
                        Actualizar
                    </Button>
                </div>

                {/* Mensajes del backend */}
                {precuadre.mensajes && precuadre.mensajes.length > 0 && (
                    <div className="space-y-2">
                        {precuadre.mensajes.map((msg, idx) => (
                            <Alert key={idx}>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{msg}</AlertDescription>
                            </Alert>
                        ))}
                    </div>
                )}

                {/* Usuarios pendientes */}
                {precuadre.UsuariosPendientes && precuadre.UsuariosPendientes.length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>⚠️ Usuarios con cortes pendientes:</strong>
                            <ul className="list-disc ml-6 mt-2">
                                {precuadre.UsuariosPendientes.map((usuario) => (
                                    <li key={usuario.UsuarioID}>{usuario.Nombre}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                {/* ENCABEZADO - MOCK */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información de Caja</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Sucursal</p>
                            <p className="font-semibold">Centro</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Caja</p>
                            <p className="font-semibold">Mostrador #10</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Fondo Fijo</p>
                            <p className="font-semibold">{formatCurrency(precuadre.FondoInicial)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Fecha</p>
                            <p className="font-semibold">
                                {new Date().toLocaleDateString("es-MX")}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* TARJETAS - TOTALES POR MÉTODO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                Efectivo
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {formatCurrency(precuadre.Totales.TotalEfectivo)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                💳 Tarjeta
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {formatCurrency(precuadre.Totales.TotalPagoConTarjeta)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                Transferencia
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {formatCurrency(precuadre.Totales.TotalTransferencia)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* TABLA - OTROS MOVIMIENTOS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Movimientos del Día</CardTitle>
                        <CardDescription>
                            Ingresos y egresos registrados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {movimientos.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No hay movimientos registrados
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Forma de Pago</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movimientos.map((mov) => (
                                        <TableRow key={mov.TransaccionID}>
                                            <TableCell className="text-sm">
                                                {formatDateTimeFull(mov.FechaTransaccion)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {mov.TipoTransaccion}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{mov.FormaPago}</TableCell>
                                            <TableCell>{mov.UsuarioCreo.NombreUsuario}</TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {mov.TipoTransaccion === "Ingreso" ? "+" : "-"}
                                                {formatCurrency(Number(mov.Monto))}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        mov.Validado === 1
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {mov.Validado === 1
                                                        ? "Validado"
                                                        : "Pendiente"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {/* Totales de movimientos */}
                        <div className="mt-4 pt-4 border-t flex justify-end gap-8">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Ingresos</p>
                                <p className="text-lg font-bold text-green-600">
                                    {formatCurrency(precuadre.Totales.TotalIngresos)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Egresos</p>
                                <p className="text-lg font-bold text-red-600">
                                    {formatCurrency(precuadre.Totales.TotalEgresos)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* TABLA - CÁLCULOS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cálculos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Saldo Inicial</TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(precuadre.FondoInicial)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">+ Ingresos Usuarios</TableCell>
                                    <TableCell className="text-right text-green-600 font-semibold">
                                        +{formatCurrency(precuadre.Totales.TotalIngresos)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">- Egresos</TableCell>
                                    <TableCell className="text-right text-red-600 font-semibold">
                                        -{formatCurrency(precuadre.Totales.TotalEgresos)}
                                    </TableCell>
                                </TableRow>
                                <TableRow className="border-t-2">
                                    <TableCell className="font-bold">= Saldo Disponible</TableCell>
                                    <TableCell className="text-right font-bold">
                                        {formatCurrency(saldoDisponible)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">- Entrega a General</TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(entregaAGeneral)}
                                    </TableCell>
                                </TableRow>
                                <TableRow className="border-t-2 bg-slate-50">
                                    <TableCell className="font-bold">= Saldo Final</TableCell>
                                    <TableCell className="text-right font-bold">
                                        {formatCurrency(saldoFinal)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* TABLA - DETALLE USUARIOS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detalle de Cortes por Usuario</CardTitle>
                        <CardDescription>
                            ⚠️ Preguntar de dónde se obtiene esta información (backend no la proporciona en precuadre)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Esta sección está vacía. Se necesita especificar el origen de los datos:
                                ¿De un endpoint separado? ¿De los movimientos? ¿De los inicios de caja?
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* BOTÓN - CUADRAR */}
                <div className="flex justify-end">
                    <Button
                        size="lg"
                        onClick={() => setIsModalCuadreOpen(true)}
                        disabled={precuadre.PendientesDeCorte > 0}
                    >
                        <Calculator className="h-4 w-4 mr-2" />
                        Cuadrar Caja Chica
                    </Button>
                </div>

                {/* MODAL - CUADRE */}
                <Dialog open={isModalCuadreOpen} onOpenChange={setIsModalCuadreOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Cuadrar Caja Chica</DialogTitle>
                            <DialogDescription>
                                Revisa el resumen y completa los datos para finalizar el cuadre
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* RESUMEN */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Resumen del Cuadre</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Saldo Inicial:</span>
                                        <span className="font-semibold">
                                            {formatCurrency(precuadre.FondoInicial)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span className="text-muted-foreground">+ Ingresos:</span>
                                        <span className="font-semibold">
                                            +{formatCurrency(precuadre.Totales.TotalIngresos)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                        <span className="text-muted-foreground">- Egresos:</span>
                                        <span className="font-semibold">
                                            -{formatCurrency(precuadre.Totales.TotalEgresos)}
                                        </span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between font-bold">
                                        <span>Saldo Disponible:</span>
                                        <span>{formatCurrency(saldoDisponible)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* FORMULARIO */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">
                                            Saldo Real Contado
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formDataCuadre.SaldoReal}
                                            onChange={(e) =>
                                                setFormDataCuadre({
                                                    ...formDataCuadre,
                                                    SaldoReal: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Efec. Capturado
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formDataCuadre.TotalEfectivoCapturado}
                                            onChange={(e) =>
                                                setFormDataCuadre({
                                                    ...formDataCuadre,
                                                    TotalEfectivoCapturado:
                                                        parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Tarjeta Capturada
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formDataCuadre.TotalTarjetaCapturado}
                                            onChange={(e) =>
                                                setFormDataCuadre({
                                                    ...formDataCuadre,
                                                    TotalTarjetaCapturado:
                                                        parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Transfer. Capturada
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={
                                                formDataCuadre.TotalTransferenciaCapturado
                                            }
                                            onChange={(e) =>
                                                setFormDataCuadre({
                                                    ...formDataCuadre,
                                                    TotalTransferenciaCapturado:
                                                        parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Observaciones</label>
                                    <Textarea
                                        value={formDataCuadre.Observaciones}
                                        onChange={(e) =>
                                            setFormDataCuadre({
                                                ...formDataCuadre,
                                                Observaciones: e.target.value,
                                            })
                                        }
                                        placeholder="Agrega observaciones si es necesario..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* BOTONES */}
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsModalCuadreOpen(false)}
                                    disabled={isLoadingCorte}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleCuadre}
                                    disabled={isLoadingCorte}
                                >
                                    {isLoadingCorte ? "Procesando..." : "Confirmar Cuadre"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
