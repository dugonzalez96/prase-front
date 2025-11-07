"use client";

/**
 * EncabezadoCajaChica.tsx
 * 
 * ✅ FUNCIONA:
 * - Muestra información de sucursal, caja, fecha y fondo fijo
 * - UI responsive con cards informativos
 * - Badges de estado visuales
 * 
 * ❌ NO FUNCIONA / FALTA:
 * - Selector de sucursal (actualmente solo lectura) - FALTA: Conectar a API de sucursales
 * - Edición de fecha de corte - FALTA: Implementar DatePicker editable
 * - Los datos vienen hardcoded - FALTA: Obtener de iPrecuadreCajaChica.Info
 * 
 * 📝 PARA IMPLEMENTAR:
 * 1. Agregar campo Info: iInfoCajaChica en iPrecuadreCajaChica
 * 2. Backend debe enviar: SucursalID, NombreSucursal, NombreCaja, FechaCorte, FondoFijo
 * 3. Si es admin: permitir selector de sucursal
 * 4. Si es usuario normal: mostrar solo lectura
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { Building2, Calendar, Wallet, MapPin } from "lucide-react";

interface EncabezadoCajaChicaProps {
    sucursal?: string;
    caja?: string;
    fechaCorte?: Date;
    fondoFijo?: number;
    esAdmin?: boolean; // Para habilitar selector de sucursal
}

export function EncabezadoCajaChica({
    sucursal = "Centro", // ❌ MOCK - Debe venir de precuadre.Info.NombreSucursal
    caja = "Mostrador #10", // ❌ MOCK - Debe venir de precuadre.Info.NombreCaja
    fechaCorte = new Date(), // ❌ MOCK - Debe venir de precuadre.Info.FechaCorte
    fondoFijo = 5000, // ❌ MOCK - Debe venir de precuadre.Info.FondoFijo
    esAdmin = false // ❌ MOCK - Debe venir de user.role
}: EncabezadoCajaChicaProps) {
    
    return (
        <Card className="mb-6 border-2 border-primary/20">
            <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4">
                    {/* Sucursal */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>Sucursal</span>
                        </div>
                        {esAdmin ? (
                            // ❌ FALTA: Conectar onChange a handler para cambiar sucursal
                            <Select value={sucursal} disabled>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione sucursal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Centro">Centro</SelectItem>
                                    <SelectItem value="Norte">Norte</SelectItem>
                                    <SelectItem value="Sur">Sur</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-lg font-semibold">{sucursal}</p>
                        )}
                    </div>

                    {/* Caja Asignada */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>Caja Asignada</span>
                        </div>
                        <p className="text-lg font-semibold">{caja}</p>
                    </div>

                    {/* Fecha de Corte */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Fecha de Corte</span>
                        </div>
                        {/* ❌ FALTA: Hacer editable con DatePicker */}
                        <p className="text-lg font-semibold">
                            {fechaCorte.toLocaleDateString('es-MX', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </p>
                    </div>

                    {/* Fondo Fijo */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Wallet className="h-4 w-4" />
                            <span>Fondo Fijo</span>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1 font-bold">
                            {formatCurrency(fondoFijo)}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                            Debe mantenerse siempre
                        </p>
                    </div>
                </div>

                {/* Nota informativa */}
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                        <strong>Caja Chica:</strong> {sucursal} - {caja} | 
                        El fondo fijo de {formatCurrency(fondoFijo)} debe permanecer en caja al finalizar el día.
                        El excedente se entregará a Caja General.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
