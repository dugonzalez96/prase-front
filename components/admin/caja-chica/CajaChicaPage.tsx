"use client";

import { getCajasChicasPorEstatus, getPrecuadreCajaChicaXSucursal } from "@/actions/CajaChicaActions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { iCajaChicaPorEstatus, iPrecuadreCajaChicaBackend } from "@/interfaces/CajaChicaInterface";
import { iGetMovimientos } from "@/interfaces/MovimientosInterface";
import { formatCurrency } from "@/lib/format";
import { AlertCircle, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CajaChicaClient } from "./CajaChicaClient";
import { CajaChicaGenerarCodigo } from "./CajaChicaGenerarCodigo";
import { CancelarCuadreModal } from "./CancelarCuadreModal";

interface CajaChicaPageProps {
    usuarioId: number;
    precuadreInicial?: iPrecuadreCajaChicaBackend;
    movimientosInicial?: iGetMovimientos[];
    sucursal: any;
}

export function CajaChicaPage({
    usuarioId,
    precuadreInicial,
    sucursal,
}: CajaChicaPageProps) {
    const user = useCurrentUser();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [precuadre, setPrecuadre] = useState(precuadreInicial);
    const [historial, setHistorial] = useState<iCajaChicaPorEstatus[]>([]);
    const [cargando, setCargando] = useState(false);
    const [fechaDesde, setFechaDesde] = useState<string>("");
    const [fechaHasta, setFechaHasta] = useState<string>("");
    const [estatusSeleccionado, setEstatusSeleccionado] = useState<"Cerrado" | "Cancelado" | "Ambos">("Ambos");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(10);
    const [modalCancelacionAbierto, setModalCancelacionAbierto] = useState(false);
    const [cuadreSeleccionado, setCuadreSeleccionado] = useState<number | null>(null);

    // Calcular fechas por defecto (últimos 30 días)
    useEffect(() => {
        const hoy = new Date();
        const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

        const formatFecha = (fecha: Date) => fecha.toISOString().split("T")[0];

        setFechaDesde(formatFecha(hace30Dias));
        setFechaHasta(formatFecha(hoy));
    }, []);

    // Cargar historial cuando cambien las fechas o el estatus
    useEffect(() => {
        if (fechaDesde && fechaHasta) {
            cargarHistorial();
        }
    }, [fechaDesde, fechaHasta, estatusSeleccionado]);

    const cargarHistorial = async () => {
        setCargando(true);
        try {
            if (estatusSeleccionado === "Ambos") {
                // Hacer dos peticiones en paralelo
                const [datosCerrados, datosCancelados] = await Promise.all([
                    getCajasChicasPorEstatus("Cerrado", fechaDesde, fechaHasta),
                    getCajasChicasPorEstatus("Cancelado", fechaDesde, fechaHasta)
                ]);
                
                // Combinar ambos arrays
                const todosLosDatos = [
                    ...(Array.isArray(datosCerrados) ? datosCerrados : []),
                    ...(Array.isArray(datosCancelados) ? datosCancelados : [])
                ];
                
                // Ordenar por ID descendente
                todosLosDatos.sort((a, b) => b.CajaChicaID - a.CajaChicaID);
                
                setHistorial(todosLosDatos);
                setPaginaActual(1);
            } else {
                const datos = await getCajasChicasPorEstatus(estatusSeleccionado, fechaDesde, fechaHasta);
                if (Array.isArray(datos)) {
                    setHistorial(datos);
                    setPaginaActual(1);
                }
            }
        } catch (error) {
            console.error("Error al cargar historial:", error);
        } finally {
            setCargando(false);
        }
    };

    const recargarPrecuadre = async () => {
        try {
            const precuadreActualizado = await getPrecuadreCajaChicaXSucursal(sucursal.SucursalID);
            if (precuadreActualizado && !("error" in precuadreActualizado)) {
                setPrecuadre(precuadreActualizado);
                cargarHistorial();
            }
        } catch (error) {
            console.error("Error al recargar precuadre:", error);
        }
    };

    // Calcular paginación
    const totalPaginas = Math.ceil(historial.length / elementosPorPagina);
    const indiceInicio = (paginaActual - 1) * elementosPorPagina;
    const indiceFin = indiceInicio + elementosPorPagina;
    const datosPaginados = historial.slice(indiceInicio, indiceFin);

    // Obtener el último cuadre cerrado para mostrar el faltante
    const ultimoCuadre = historial.length > 0 
        ? historial.reduce((masReciente, actual) => 
            new Date(actual.Fecha) > new Date(masReciente.Fecha) ? actual : masReciente
          , historial[0])
        : null;

    const diferenciaultimaXCuadre = ultimoCuadre ? Number(ultimoCuadre.Diferencia) : 0;
    const esNegativo = diferenciaultimaXCuadre < 0;

    return (
        <div className="space-y-6" >
            {!mostrarFormulario ? (
                <>
                    {/* Boton para generar el codigo aqui */}
                    {user?.grupo?.nombre === "Administrador" && (
                        <div className="flex justify-end pt-2">
                            <CajaChicaGenerarCodigo />
                        </div>
                    )}
                    {/* Fin de la seccion del boton para generar el codigo */}
                    {/* ENCABEZADO - LISTADO */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold">Cuadres de Caja Chica</h2>
                            <p className="text-muted-foreground mt-2">
                                Gestiona los cuadres de caja chica de tu sucursal
                            </p>
                        </div>

                        <Button
                            size="lg"
                            onClick={() => setMostrarFormulario(true)}
                            disabled={precuadre ? !precuadre.DebeCuadrarseHoy : false}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Cuadre
                        </Button>
                    </div>
                    {/* ALERTA - SI NO PUEDE CUADRARSE HOY */}
                    {precuadre && !precuadre.DebeCuadrarseHoy && (
                        <Alert className="bg-yellow-50 border-yellow-200">
                            <AlertDescription className="text-yellow-800 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-600 " />
                                <strong> No es posible crear cuadre hoy, ya hay uno existente.</strong>
                            </AlertDescription>
                            <ul className="text-yellow-800 list-disc ml-5">
                                {precuadre.mensajes.map((msg, index) => (
                                    <li key={index} className="list-disc">{msg}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}
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
                                <p className="font-semibold">{precuadre ? formatCurrency(precuadre.FondoInicial) : formatCurrency(0)}</p>
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
                                    {precuadre?.FechaDesde
                                        ? new Date(precuadre.FechaDesde).toLocaleDateString("es-MX")
                                        : "No especificada"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Hasta</p>
                                <p className="font-semibold">
                                    {precuadre?.FechaHasta
                                        ? new Date(precuadre.FechaHasta).toLocaleDateString("es-MX")
                                        : "No especificada"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* TARJETA INFORMATIVA - FALTANTE DEL ÚLTIMO CUADRE */}
                    {ultimoCuadre && (
                        <Card className={`py-3 px-4 ${esNegativo ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className={`text-sm font-medium ${esNegativo ? "text-red-700" : "text-green-700"}`}>
                                        {esNegativo ? "⚠️ Faltante" : "✓ Sobrante"} • {new Date(ultimoCuadre.Fecha).toLocaleDateString("es-MX")}
                                    </p>
                                    {ultimoCuadre.Observaciones && (
                                        <p className={`text-xs mt-1 ${esNegativo ? "text-red-600" : "text-green-600"}`}>
                                            {ultimoCuadre.Observaciones}
                                        </p>
                                    )}
                                </div>
                                <span className={`text-xl font-bold whitespace-nowrap ${esNegativo ? "text-red-600" : "text-green-600"}`}>
                                    {formatCurrency(diferenciaultimaXCuadre)}
                                </span>
                            </div>
                        </Card>
                    )}
                    {/* FIN TARJETA INFORMATIVA */}
                    {/* LISTADO - PLACEHOLDER */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Cuadres</CardTitle>
                            <CardDescription>
                                Cuadres realizados anteriormente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* FILTROS */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Desde</label>
                                    <Input
                                        type="date"
                                        value={fechaDesde}
                                        onChange={(e) => setFechaDesde(e.target.value)}
                                        disabled={cargando}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Hasta</label>
                                    <Input
                                        type="date"
                                        value={fechaHasta}
                                        onChange={(e) => setFechaHasta(e.target.value)}
                                        disabled={cargando}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Estatus</label>
                                    <Select
                                        value={estatusSeleccionado}
                                        onValueChange={(val: "Cerrado" | "Cancelado" | "Ambos") => {
                                            setEstatusSeleccionado(val);
                                            setPaginaActual(1);
                                        }}
                                        disabled={cargando}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cerrado">Cerrado</SelectItem>
                                            <SelectItem value="Cancelado">Cancelado</SelectItem>
                                            <SelectItem value="Ambos">Ambos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Elementos por página
                                    </label>
                                    <Select
                                        value={elementosPorPagina.toString()}
                                        onValueChange={(val) => {
                                            setElementosPorPagina(Number(val));
                                            setPaginaActual(1);
                                        }}
                                        disabled={cargando}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5</SelectItem>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            {/* TABLA */}
                            {cargando ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">Cargando historial...</p>
                                </div>
                            ) : historial.length === 0 ? (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        No hay cuadres cerrados en el rango de fechas especificado.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-2 px-2 font-medium">ID</th>
                                                    <th className="text-left py-2 px-2 font-medium">Folio</th>
                                                    <th className="text-left py-2 px-2 font-medium">Fecha</th>
                                                    <th className="text-right py-2 px-2 font-medium">Total Ingresos</th>
                                                    <th className="text-right py-2 px-2 font-medium">Saldo Esperado en Efectivo</th>
                                                    <th className="text-right py-2 px-2 font-medium">Saldo entregado efectivo</th>
                                                    <th className="text-right py-2 px-2 font-medium">Diferencia</th>
                                                    <th className="text-center py-2 px-2 font-medium">Estatus</th>
                                                    <th className="text-center py-2 px-2 font-medium">Opciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {datosPaginados.map((cuadre) => {
                                                    // Determinar si es el cuadre más reciente
                                                    const cuadreMasReciente = historial.reduce((masReciente, actual) => {
                                                        return new Date(actual.Fecha) > new Date(masReciente.Fecha) ? actual : masReciente;
                                                    }, historial[0]);
                                                    const esElMasReciente = cuadre.CajaChicaID === cuadreMasReciente?.CajaChicaID;
                                                    
                                                    return (
                                                        <tr key={cuadre.CajaChicaID} className="border-b hover:bg-muted/50">
                                                            <td className="py-2 px-2">
                                                                {cuadre.CajaChicaID}
                                                            </td>
                                                            <td className="py-2 px-2">
                                                                {cuadre.FolioCierre}
                                                            </td>
                                                            <td className="py-2 px-2">
                                                                {new Date(cuadre.Fecha).toLocaleDateString("es-MX")}
                                                            </td>
                                                            <td className="text-right py-2 px-2">
                                                                {formatCurrency(Number(cuadre.SaldoEsperado))}
                                                            </td>
                                                            <td className="text-right py-2 px-2">
                                                                {formatCurrency(Number(cuadre.SaldoEsperado))}
                                                            </td>
                                                            <td className="text-right py-2 px-2">
                                                                {formatCurrency(Number(cuadre.SaldoReal))}
                                                            </td>
                                                            <td className={`text-right py-2 px-2 font-medium ${Number(cuadre.Diferencia) === 0
                                                                ? "text-green-600"
                                                                : Number(cuadre.Diferencia) > 0
                                                                    ? "text-blue-600"
                                                                    : "text-red-600"
                                                                }`}>
                                                                {formatCurrency(Number(cuadre.Diferencia))}
                                                            </td>
                                                            <td className="text-center py-2 px-2">
                                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                                                    cuadre.Estatus === "Cancelado" 
                                                                        ? "bg-gray-100 text-gray-600" 
                                                                        : "bg-green-100 text-green-800"
                                                                }`}>
                                                                    {cuadre.Estatus}
                                                                </span>
                                                            </td>
                                                            <td className="text-center py-2 px-2">
                                                                {cuadre.Estatus !== "Cancelado" && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setCuadreSeleccionado(cuadre.CajaChicaID);
                                                                            setModalCancelacionAbierto(true);
                                                                        }}
                                                                        disabled={!esElMasReciente}
                                                                        title={esElMasReciente 
                                                                            ? "Cancelar cuadre" 
                                                                            : "Solo se puede cancelar el cuadre más reciente"}
                                                                    >
                                                                        <Trash2 className={`h-4 w-4 ${esElMasReciente ? "text-red-600" : "text-gray-400"}`} />
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* PAGINACIÓN */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            Mostrando {indiceInicio + 1} a {Math.min(indiceFin, historial.length)} de {historial.length} registros
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPaginaActual(paginaActual - 1)}
                                                disabled={paginaActual === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">
                                                    Página {paginaActual} de {totalPaginas}
                                                </span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPaginaActual(paginaActual + 1)}
                                                disabled={paginaActual === totalPaginas}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>


                </>
            ) : (
                <>

                    {/* ENCABEZADO - FORMULARIO */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold">Nuevo Cuadre de Caja Chica</h2>
                            <p className="text-muted-foreground mt-2">
                                Completa el cuadre de tu caja chica
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setMostrarFormulario(false)}
                        >
                            Volver al Listado
                        </Button>
                    </div>

                    {/* FORMULARIO - CUADRE */}
                    <CajaChicaClient
                        usuarioId={usuarioId}
                        precuadreInicial={precuadreInicial}
                        sucursal={sucursal}
                    />
                </>
            )}

            {/* MODAL DE CANCELACIÓN */}
            {cuadreSeleccionado && (
                <CancelarCuadreModal
                    abierto={modalCancelacionAbierto}
                    alCerrar={() => setModalCancelacionAbierto(false)}
                    cuadreId={cuadreSeleccionado}
                    onCancelarExitoso={() => {
                        cargarHistorial();
                        recargarPrecuadre();
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }}
                />
            )}
        </div >
    );
}
