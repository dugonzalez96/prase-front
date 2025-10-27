"use client";

import { useState } from "react";
import { iCajaChica, iMovimientoCajaChica, iResumenCajaChica } from "@/interfaces/CajaChicaInterface";
import { DashboardCajaChica } from "./DashboardCajaChica";
import { TablaGastos } from "./TablaGastos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, ClipboardList, Check } from "lucide-react";

interface CajaChicaClientProps {
    cajaChica: iCajaChica;
    movimientosIniciales: iMovimientoCajaChica[];
    resumenInicial: iResumenCajaChica;
    usuarioId: number;
}

export function CajaChicaClient({
    cajaChica,
    movimientosIniciales,
    resumenInicial,
    usuarioId
}: CajaChicaClientProps) {
    const [movimientos] = useState(movimientosIniciales);
    const [resumen] = useState(resumenInicial);

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <Wallet className="h-8 w-8" />
                        Caja Chica
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        {new Date(cajaChica.Fecha).toLocaleDateString('es-MX', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="historial">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-4">
                    <DashboardCajaChica resumen={resumen} />

                    <div className="flex gap-3">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Registrar Gasto
                        </Button>
                        <Button variant="outline">
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Precuadre
                        </Button>
                        <Button variant="outline">
                            <Check className="h-4 w-4 mr-2" />
                            Cuadre Final
                        </Button>
                    </div>

                    <TablaGastos movimientos={movimientos} />
                </TabsContent>

                <TabsContent value="historial">
                    <div className="text-center py-12 text-muted-foreground">
                        Historial de cajas chicas anteriores
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
}
