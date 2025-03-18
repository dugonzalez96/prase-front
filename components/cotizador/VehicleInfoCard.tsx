"use client";

import { Car, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatCurrency } from '@/lib/format';

interface VehicleInfoCardProps {
    marca: string;
    modelo: string;
    año: string;
    version: string;
    precio?: number;
}

export const VehicleInfoCard = ({
    marca,
    modelo,
    año,
    version,
    precio,
}: VehicleInfoCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Información del Vehículo
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-muted-foreground">Marca</label>
                            <p className="font-medium">{marca}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Modelo</label>
                            <p className="font-medium">{modelo}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Año</label>
                            <p className="font-medium">{año}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Versión</label>
                            <p className="font-medium">{version}</p>
                        </div>
                    </div>

                    {precio && (
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Tag className="h-4 w-4" />
                                    <span>Valor comercial</span>
                                </div>
                                <span className="text-xl font-bold text-primary">
                                    {formatCurrency(precio)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};