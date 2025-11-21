"use client";

/**
 * CajaChicaClient.tsx - REFACTORIZADO
 * 
 * Componente refactorizado basado en la estructura real del backend.
 * 
 * ✅ FUNCIONA:
 * - Carga de precuadre con getPrecuadreCajaChicaXSucursal()
 * - Mostr encabezado simple (MOCK)
 * - Tabla de totales por método: Efectivo, Tarjeta, Transferencia
 * - Tabla de otros movimientos (ingresos/egresos)
 * - Cálculos automáticos simples
 * - Tabla vacía de cortes de usuario (pendiente de especificación)
 * - Modal para crear corte con resumen + formulario
 * - Loader durante envío del POST
 */

import { cuadrarCajaChicaXSucursal as cuadrarCajaChicaAction, getPrecuadreCajaChicaXSucursal } from "@/actions/CajaChicaActions";
import { LoaderModales } from "@/components/LoaderModales";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { iPrecuadreCajaChicaBackend } from "@/interfaces/CajaChicaInterface";
import { formatCurrency } from "@/lib/format";
import { AlertCircle, Calculator, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ClipLoader } from "react-spinners";

interface CajaChicaClientProps {
    usuarioId: number;
    precuadreInicial?: iPrecuadreCajaChicaBackend;
    sucursal?: any;
}

export function CajaChicaClient({ usuarioId, precuadreInicial, sucursal }: CajaChicaClientProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [precuadre, setPrecuadre] = useState<iPrecuadreCajaChicaBackend | null>(precuadreInicial || null);
    const [isLoading, setIsLoading] = useState(!precuadreInicial);
    const [isLoadingCorte, setIsLoadingCorte] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);

    // Estado del formulario de cuadre
    const [formDataCuadre, setFormDataCuadre] = useState({
        SucursalID: sucursal.SucursalID,
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
            const precuadreResult = await getPrecuadreCajaChicaXSucursal(sucursal.SucursalID);

            if (!isMounted.current) return;

            // Precuadre
            if ("error" in precuadreResult) {
                setError(precuadreResult.error);
                toast({
                    title: "Error",
                    description: precuadreResult.error,
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }
            setPrecuadre(precuadreResult);

            // Mostrar mensajes
            if (precuadreResult.mensajes && precuadreResult.mensajes.length > 0) {
                precuadreResult.mensajes.forEach((msg: string) => {
                    toast({
                        title: "Información",
                        description: msg,
                    });
                });
            }

            setIsLoading(false);
        } catch (err) {
            if (!isMounted.current) return;
            const errorMsg = err instanceof Error ? err.message : "Error al cargar datos";
            setError(errorMsg);
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive",
            });
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Solo cargar datos si no vinieron desde props
        if (!precuadreInicial) {
            fetchData();
        }
        return () => {
            isMounted.current = false;
        };
    }, [precuadreInicial]);

    // Manejador de cuadre
    const handleCuadre = async () => {
        setIsLoadingCorte(true);
        try {
            // Calcular el saldo real antes de enviar
            const saldoReal =
                formDataCuadre.TotalEfectivoCapturado +
                formDataCuadre.TotalTarjetaCapturado +
                formDataCuadre.TotalTransferenciaCapturado;

            const dataToSend = {
                ...formDataCuadre,
                SaldoReal: saldoReal
            };

            const result = await cuadrarCajaChicaAction(usuarioId, sucursal.SucursalID, dataToSend);
            console.log("🚀 ~ handleCuadre ~ result:", result)

            if (result.success) {
                toast({
                    title: "✅ Cuadre Exitoso",
                    description: `Folio: ${result.data?.cuadre?.FolioCierre || 'N/A'}`,
                    variant: "default"
                });

                // Navegar a la lista de cajas chicas
                router.push('/admin/caja-chica');
                router.refresh();
                window.location.reload();
                setIsLoadingCorte(false);

            } else {
                if (isMounted.current) {
                    toast({
                        title: "Error",
                        description: result.message,
                        variant: "destructive",
                    });
                    setIsLoadingCorte(false);
                }
            }
        } catch (err) {
            if (!isMounted.current) return;
            const errorMsg = err instanceof Error ? err.message : "Error al cuadrar";
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive",
            });
            setIsLoadingCorte(false);
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

                {/* ALERTAS */}
                <div className="flex gap-2">
                    {/* Mensajes del backend */}
                    <div className="w-full">
                        {precuadre.mensajes && precuadre.mensajes.length > 0 && (
                            <div className="space-y-2 ">
                                {precuadre.mensajes.map((msg, idx) => (
                                    <Alert key={idx} className="bg-blue-50 border-blue-200">
                                        <AlertCircle className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800">{msg}</AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Usuarios pendientes */}
                    <div className="w-full">
                        {precuadre.UsuariosPendientes && precuadre.UsuariosPendientes.length > 0 && (
                            <Alert className="bg-blue-50 border-blue-200">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    <strong>ℹ️ Usuarios con cortes pendientes:</strong>
                                    <ul className="list-disc ml-6 mt-2">
                                        {precuadre.UsuariosPendientes.map((usuario) => (
                                            <li key={usuario.UsuarioID}>{usuario.Nombre}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>

                {/* ENCABEZADO */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información de Caja</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Sucursal</p>
                            <p className="font-semibold">{sucursal?.NombreSucursal || "No disponible"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Ciudad</p>
                            <p className="font-semibold">{sucursal?.Ciudad || "No disponible"}</p>
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
                        <div>
                            <p className="text-sm text-muted-foreground">Desde</p>
                            <p className="font-semibold">
                                {precuadre.FechaDesde
                                    ? new Date(precuadre.FechaDesde).toLocaleDateString("es-MX")
                                    : "No especificada"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Hasta</p>
                            <p className="font-semibold">
                                {precuadre.FechaHasta
                                    ? new Date(precuadre.FechaHasta).toLocaleDateString("es-MX")
                                    : "No especificada"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* TARJETAS - TOTALES POR MÉTODO */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                                Total Ingresos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(precuadre.Totales.TotalIngresos)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-orange-500" />
                                Total Egresos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-orange-600">
                                {formatCurrency(precuadre.Totales.TotalEgresos)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* TABLA - DETALLE USUARIOS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inicios de Caja Activos</CardTitle>
                        <CardDescription>
                            Usuarios con cajas activas en el período
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {precuadre.IniciosActivos && precuadre.IniciosActivos.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Autorizado Por</TableHead>
                                        <TableHead>Fecha Inicio</TableHead>
                                        <TableHead className="text-right">Monto Inicial</TableHead>
                                        <TableHead>Estatus</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {precuadre.IniciosActivos.map((inicio) => (
                                        <TableRow key={inicio.InicioCajaID}>
                                            <TableCell className="font-medium">{inicio.Usuario}</TableCell>
                                            <TableCell>{inicio.Autorizo}</TableCell>
                                            <TableCell>
                                                {new Date(inicio.FechaInicio).toLocaleDateString("es-MX")}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(inicio.MontoInicial)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                                    {inicio.Estatus}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Alert className="bg-blue-50 border-blue-200">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    No hay inicios de caja activos
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* FORMULARIO - CUADRE DIRECTO */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div>
                                <CardTitle>Cuadre de Caja Chica</CardTitle>
                                <CardDescription>
                                    Completa los datos para finalizar el cuadre
                                </CardDescription>
                            </div>
                            <div>
                                <CardTitle className=" text-blue-700">
                                    {formatCurrency(precuadre.SaldoEsperado)}
                                </CardTitle>
                                <CardDescription className=" text-blue-600">Saldo Esperado</CardDescription>
                            </div>
                        </div>

                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* CAMPOS DE CAPTURA */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium">
                                        Efec. Capturado
                                    </label>
                                    <Input
                                        type="text"
                                        value={formatCurrency(formDataCuadre.TotalEfectivoCapturado)}
                                        onChange={(e) => {
                                            const valor = e.target.value.replace(/[^0-9]/g, "");
                                            setFormDataCuadre({
                                                ...formDataCuadre,
                                                TotalEfectivoCapturado:
                                                    valor === "" ? 0 : Number(valor) / 100,
                                            });
                                        }}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">
                                        Tarjeta Capturada
                                    </label>
                                    <Input
                                        type="text"
                                        value={formatCurrency(formDataCuadre.TotalTarjetaCapturado)}
                                        onChange={(e) => {
                                            const valor = e.target.value.replace(/[^0-9]/g, "");
                                            setFormDataCuadre({
                                                ...formDataCuadre,
                                                TotalTarjetaCapturado:
                                                    valor === "" ? 0 : Number(valor) / 100,
                                            });
                                        }}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">
                                        Transfer. Capturada
                                    </label>
                                    <Input
                                        type="text"
                                        value={
                                            formatCurrency(formDataCuadre.TotalTransferenciaCapturado)
                                        }
                                        onChange={(e) => {
                                            const valor = e.target.value.replace(/[^0-9]/g, "");
                                            setFormDataCuadre({
                                                ...formDataCuadre,
                                                TotalTransferenciaCapturado:
                                                    valor === "" ? 0 : Number(valor) / 100,
                                            });
                                        }}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-5 w-full">
                                {/* SALDO REAL AUTOMÁTICO */}
                                <div className="w-full">
                                    <label className="text-sm font-medium">Saldo Real Contado</label>
                                    <p className="text-lg font-semibold p-2 bg-gray-100 rounded border border-gray-300">
                                        {formatCurrency(
                                            formDataCuadre.TotalEfectivoCapturado +
                                            formDataCuadre.TotalTarjetaCapturado +
                                            formDataCuadre.TotalTransferenciaCapturado
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Se calcula automáticamente
                                    </p>
                                </div>
                                {/* DIFERENCIA AUTOMÁTICA */}
                                <div className="w-full">
                                    <label className="text-sm font-medium">Diferencia</label>
                                    <p className={`text-lg font-semibold p-2 rounded border ${precuadre.SaldoEsperado -
                                        (formDataCuadre.TotalEfectivoCapturado +
                                            formDataCuadre.TotalTarjetaCapturado +
                                            formDataCuadre.TotalTransferenciaCapturado) !==
                                        0
                                        ? "bg-orange-100 border-orange-300"
                                        : "bg-green-100 border-green-300"
                                        }`}>
                                        {formatCurrency(
                                            precuadre.SaldoEsperado -
                                            (formDataCuadre.TotalEfectivoCapturado +
                                                formDataCuadre.TotalTarjetaCapturado +
                                                formDataCuadre.TotalTransferenciaCapturado)
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Saldo Esperado - Saldo Real
                                    </p>
                                </div>
                            </div>

                            <div className="w-full">
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

                        {/* BOTÓN - CUADRAR */}
                        <div className="flex justify-end">
                            {precuadre.UsuariosConMovimientosSinCorte &&
                                precuadre.UsuariosConMovimientosSinCorte.length > 0 && (
                                    <p className="text-sm text-red-600 mr-4 self-center">
                                        Bloqueado: {precuadre.UsuariosConMovimientosSinCorte.length}{" "}
                                        usuario(s) con movimientos sin corte
                                    </p>
                                )}

                            <Button
                                size="lg"
                                onClick={handleCuadre}
                                disabled={
                                    isLoadingCorte ||
                                    (precuadre.UsuariosConMovimientosSinCorte &&
                                        precuadre.UsuariosConMovimientosSinCorte.length > 0)
                                }
                            >
                                {isLoadingCorte ? (
                                    <>
                                        <ClipLoader size={16} color="#fff" className="mr-2" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Calculator className="h-4 w-4 mr-2" />
                                        Cuadrar Caja Chica
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
