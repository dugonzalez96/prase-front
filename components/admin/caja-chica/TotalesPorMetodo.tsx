"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { DollarSign, CreditCard, ArrowLeftRight, Building2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TotalesPorMetodoProps {
    efectivo: number;
    tarjeta: number;
    transferencia: number;
    depositoVentanilla: number;
}

export function TotalesPorMetodo({ 
    efectivo, 
    tarjeta, 
    transferencia, 
    depositoVentanilla 
}: TotalesPorMetodoProps) {
    const total = efectivo + tarjeta + transferencia + depositoVentanilla;

    const cards = [
        {
            title: "Efectivo",
            value: efectivo,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50",
            tooltip: "Total de ingresos en efectivo de cortes de usuario"
        },
        {
            title: "Tarjeta",
            value: tarjeta,
            icon: CreditCard,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            tooltip: "Total de pagos con tarjeta de débito/crédito"
        },
        {
            title: "Transferencia SPEI",
            value: transferencia,
            icon: ArrowLeftRight,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            tooltip: "Total de transferencias electrónicas SPEI"
        },
        {
            title: "Depósito Ventanilla",
            value: depositoVentanilla,
            icon: Building2,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            tooltip: "Total de depósitos realizados en ventanilla bancaria"
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Totales por Método de Pago</h3>
                <Badge variant="outline" className="text-base px-3 py-1">
                    Total del día: {formatCurrency(total)}
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <TooltipProvider key={card.title}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Card className="cursor-help hover:shadow-md transition-shadow">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                {card.title}
                                            </CardTitle>
                                            <div className={`p-2 rounded-full ${card.bgColor}`}>
                                                <Icon className={`h-5 w-5 ${card.color}`} />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className={`text-2xl font-bold ${card.color}`}>
                                                {formatCurrency(card.value)}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Automático de cortes
                                            </p>
                                        </CardContent>
                                    </Card>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">{card.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </div>
        </div>
    );
}
