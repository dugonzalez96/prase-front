"use client";

import { useState } from "react";
import { iMovimientoPendiente } from "@/interfaces/ValidacionMovimientosInterface";
import { iPagoPendiente } from "@/interfaces/PagosPolizaInterface";
import { ValidacionMovimientosClient } from "@/components/admin/validacion-movimientos/ValidacionMovimientosClient";
import { ValidacionPagosClient } from "@/components/admin/validacion-pagos/ValidacionPagosClient";
import { LoaderModales } from "@/components/LoaderModales";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShieldCheck, DollarSign, RefreshCw } from "lucide-react";
import { getMovimientosPendientes } from "@/actions/ValidacionMovimientosActions";
import { getPagosPendientes } from "@/actions/PagosPolizaActions";

interface ValidacionConsolidadaProps {
    movimientos: iMovimientoPendiente[];
    pagos: iPagoPendiente[];
    usuarioId: number;
}

export function ValidacionConsolidada({
    movimientos,
    pagos,
    usuarioId
}: ValidacionConsolidadaProps) {
    const [movimientosActuales, setMovimientosActuales] = useState(movimientos);
    const [pagosActuales, setPagosActuales] = useState(pagos);
    const [cargando, setCargando] = useState(false);

    const totalMovimientos = movimientosActuales.filter(m => m.Validado === 0).length;
    const totalPagos = pagosActuales.filter(p => p.Validado === 0).length;

    const handleActualizar = async () => {
        setCargando(true);
        try {
            const [nuevosMov, nuevosPagos] = await Promise.all([
                getMovimientosPendientes(),
                getPagosPendientes()
            ]);

            if (nuevosMov) setMovimientosActuales(nuevosMov);
            if (nuevosPagos) setPagosActuales(nuevosPagos);
        } catch (error) {
            console.error('Error al actualizar:', error);
        } finally {
            setCargando(false);
        }
    };

    const handleDataActualizada = async () => {
        // Cuando se valida un movimiento o pago, recargamos los datos
        try {
            const [nuevosMov, nuevosPagos] = await Promise.all([
                getMovimientosPendientes(),
                getPagosPendientes()
            ]);

            if (nuevosMov) setMovimientosActuales(nuevosMov);
            if (nuevosPagos) setPagosActuales(nuevosPagos);
        } catch (error) {
            console.error('Error al actualizar datos:', error);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold">Centro de Validación</h2>
                    <p className="text-muted-foreground mt-2">
                        Gestiona la validación de movimientos y pagos de pólizas
                    </p>
                </div>
                <Button
                    onClick={handleActualizar}
                    disabled={cargando}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />
                    {cargando ? 'Actualizando...' : 'Actualizar'}
                </Button>
            </div>

            {cargando && <LoaderModales texto="Cargando datos pendientes de validación..." />}

            {!cargando && (
            <Tabs defaultValue="movimientos" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="movimientos" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Movimientos
                        {totalMovimientos > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                {totalMovimientos}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="pagos" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Pagos
                        {totalPagos > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                {totalPagos}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="movimientos" className="mt-6">
                    <ValidacionMovimientosClient 
                        movimientosIniciales={movimientosActuales}
                        usuarioId={usuarioId}
                        onDataActualizada={handleDataActualizada}
                    />
                </TabsContent>

                <TabsContent value="pagos" className="mt-6">
                    <ValidacionPagosClient 
                        pagosIniciales={pagosActuales}
                        usuarioId={usuarioId}
                        onDataActualizada={handleDataActualizada}
                    />
                </TabsContent>
            </Tabs>
            )}
        </div>
    );
}
