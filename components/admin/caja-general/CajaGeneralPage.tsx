"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertCircle, Landmark } from "lucide-react";
import { CajaGeneralFormClient } from "./CajaGeneralFormClient";
import { iCajaGeneral, iResumenCajaGeneral, iCorteUsuarioResumen } from "@/interfaces/CajaGeneralInterface";
import { iGetMovimientos } from "@/interfaces/MovimientosInterface";

interface CajaGeneralPageProps {
    cajaGeneral: iCajaGeneral;
    resumenInicial: iResumenCajaGeneral;
    cortesUsuarios: iCorteUsuarioResumen[];
    movimientosIniciales: iGetMovimientos[];
    usuarioId: number;
}

export function CajaGeneralPage({
    cajaGeneral,
    resumenInicial,
    cortesUsuarios,
    movimientosIniciales,
    usuarioId
}: CajaGeneralPageProps) {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    return (
        <div className="space-y-6">
            {!mostrarFormulario ? (
                <>
                    {/* ENCABEZADO - LISTADO */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold flex items-center gap-2">
                                <Landmark className="h-8 w-8" />
                                Cuadres de Caja General
                            </h2>
                            <p className="text-muted-foreground mt-2">
                                Gestiona los cuadres de caja general
                            </p>
                        </div>
                        <Button 
                            size="lg" 
                            onClick={() => setMostrarFormulario(true)}
                            disabled={resumenInicial ? !resumenInicial.DebeCuadrarseHoy : false}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Cuadre
                        </Button>
                    </div>

                    {/* LISTADO - PLACEHOLDER */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Cuadres</CardTitle>
                            <CardDescription>
                                Cuadres de caja general realizados
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

                    {/* ALERTA - SI NO PUEDE CUADRARSE HOY */}
                    {resumenInicial && !resumenInicial.DebeCuadrarseHoy && (
                        <Alert className="bg-yellow-50 border-yellow-200">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                <strong>ℹ️ No es posible crear cuadre hoy.</strong> El cuadre debe realizarse según el período establecido.
                            </AlertDescription>
                        </Alert>
                    )}
                </>
            ) : (
                <>
                    {/* ENCABEZADO - FORMULARIO */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold">Nuevo Cuadre de Caja General</h2>
                            <p className="text-muted-foreground mt-2">
                                Completa el cuadre de caja general
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
                    <CajaGeneralFormClient
                        cajaGeneral={cajaGeneral}
                        resumenInicial={resumenInicial}
                        cortesUsuarios={cortesUsuarios}
                        movimientosIniciales={movimientosIniciales}
                        usuarioId={usuarioId}
                    />
                </>
            )}
        </div>
    );
}
