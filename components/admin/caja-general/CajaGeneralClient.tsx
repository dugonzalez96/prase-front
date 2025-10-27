"use client";

import { useState } from "react";
import { 
    iCajaGeneral, 
    iResumenCajaGeneral, 
    iCorteUsuarioResumen,
    iMovimientoCajaGeneral 
} from "@/interfaces/CajaGeneralInterface";
import { DashboardCajaGeneral } from "./DashboardCajaGeneral";
import { ResumenCortes } from "./ResumenCortes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Landmark, Plus, Minus, ClipboardList, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";

interface CajaGeneralClientProps {
    cajaGeneral: iCajaGeneral;
    resumenInicial: iResumenCajaGeneral;
    cortesUsuarios: iCorteUsuarioResumen[];
    movimientosIniciales: iMovimientoCajaGeneral[];
    usuarioId: number;
}

export function CajaGeneralClient({
    cajaGeneral,
    resumenInicial,
    cortesUsuarios,
    movimientosIniciales,
    usuarioId
}: CajaGeneralClientProps) {
    const [resumen] = useState(resumenInicial);
    const [movimientos] = useState(movimientosIniciales);

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <Landmark className="h-8 w-8" />
                        Caja General
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        {new Date(cajaGeneral.Fecha).toLocaleDateString('es-MX', { 
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
                    <DashboardCajaGeneral resumen={resumen} />

                    <div className="flex gap-3">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Registrar Ingreso
                        </Button>
                        <Button variant="outline">
                            <Minus className="h-4 w-4 mr-2" />
                            Registrar Egreso
                        </Button>
                        <Button variant="outline">
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Precuadre General
                        </Button>
                        <Button variant="outline">
                            <Check className="h-4 w-4 mr-2" />
                            Cuadre Final
                        </Button>
                    </div>

                    <ResumenCortes cortes={cortesUsuarios} />

                    {/* Movimientos del día */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Movimientos de Hoy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Monto</TableHead>
                                        <TableHead>Fecha</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movimientos.slice(0, 5).map((mov) => (
                                        <TableRow key={mov.MovimientoCajaGeneralID}>
                                            <TableCell>
                                                <Badge variant={mov.TipoMovimiento === 'INGRESO' ? 'default' : 'destructive'}>
                                                    {mov.TipoMovimiento}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{mov.Categoria}</Badge>
                                            </TableCell>
                                            <TableCell>{mov.Descripcion}</TableCell>
                                            <TableCell className="font-semibold">
                                                {formatCurrency(parseFloat(mov.Monto))}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDateTimeFull(mov.FechaMovimiento)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="historial">
                    <div className="text-center py-12 text-muted-foreground">
                        Historial de cajas generales anteriores
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
}
