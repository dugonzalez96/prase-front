"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertCircle } from "lucide-react";
import { CajaChicaClient } from "./CajaChicaClient";
import { iPrecuadreCajaChicaBackend } from "@/interfaces/CajaChicaInterface";
import { iGetMovimientos } from "@/interfaces/MovimientosInterface";
import { formatCurrency } from "@/lib/format";

interface CajaChicaPageProps {
    usuarioId: number;
    precuadreInicial?: iPrecuadreCajaChicaBackend;
    movimientosInicial?: iGetMovimientos[];
    sucursal?: any;
}

export function CajaChicaPage({
    usuarioId,
    precuadreInicial,
    sucursal,
}: CajaChicaPageProps) {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [precuadre] = useState(precuadreInicial)

    return (
        <div className="space-y-6" >
            {!mostrarFormulario ? (
                <>
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
                        // disabled={precuadreInicial ? !precuadreInicial.DebeCuadrarseHoy : false}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Cuadre
                        </Button>
                    </div>
                    {/* ALERTA - SI NO PUEDE CUADRARSE HOY */}
                    {precuadreInicial && !precuadreInicial.DebeCuadrarseHoy && (
                        <Alert className="bg-yellow-50 border-yellow-200">
                            <AlertDescription className="text-yellow-800 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <strong> No es posible crear cuadre.</strong> Ya hay un corte de caja chica hoy.
                            </AlertDescription>
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
                    {/* LISTADO - PLACEHOLDER */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Cuadres</CardTitle>
                            <CardDescription>
                                Cuadres realizados anteriormente
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    No hay cuadres anteriores registrados. Crea uno nuevo para comenzar.
                                </AlertDescription>
                            </Alert>
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
        </div >
    );
}
