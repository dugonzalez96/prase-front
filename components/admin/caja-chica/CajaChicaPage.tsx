"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertCircle } from "lucide-react";
import { CajaChicaClient } from "./CajaChicaClient";
import { iPrecuadreCajaChicaBackend } from "@/interfaces/CajaChicaInterface";
import { iGetMovimientos } from "@/interfaces/MovimientosInterface";

interface CajaChicaPageProps {
    usuarioId: number;
    precuadreInicial?: iPrecuadreCajaChicaBackend;
    movimientosInicial?: iGetMovimientos[];
    sucursal?: any;
}

export function CajaChicaPage({
    usuarioId,
    precuadreInicial,
    movimientosInicial,
    sucursal,
}: CajaChicaPageProps) {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    return (
        <div className="space-y-6">
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
                        <Button size="lg" onClick={() => setMostrarFormulario(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Cuadre
                        </Button>
                    </div>

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
                        movimientosInicial={movimientosInicial}
                        sucursal={sucursal}
                    />
                </>
            )}
        </div>
    );
}
