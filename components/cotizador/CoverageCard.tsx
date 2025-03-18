"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";

interface CoverageCardProps {
    coverage: iGetCoberturas;
    isSelected?: boolean;
    isRequired?: boolean;
    onClick?: () => void;
    premium?: number;
}

export const CoverageCard = ({
    coverage,
    isSelected = false,
    isRequired = false,
    onClick,
    premium
}: CoverageCardProps) => {
    return (
        <motion.div
            whileHover={{ scale: onClick ? 1.02 : 1 }}
            whileTap={{ scale: onClick ? 0.98 : 1 }}
        >
            <Card
                className={cn(
                    "transition-all duration-200",
                    onClick && "cursor-pointer",
                    isSelected && "border-primary ring-2 ring-primary",
                    !isSelected && onClick && "hover:border-primary/50"
                )}
                onClick={onClick}
            >
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className={cn(
                                "h-5 w-5",
                                isSelected ? "text-primary" : "text-muted-foreground"
                            )} />
                            <span>{coverage.NombreCobertura}</span>
                        </div>
                        {isRequired && (
                            <Badge variant="secondary">Obligatoria</Badge>
                        )}
                    </CardTitle>
                    <CardDescription className="flex items-start gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">{coverage.Descripcion}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <span>{coverage.Descripcion}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {premium && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Prima:</span>
                                <span className="font-medium text-primary">
                                    {formatCurrency(premium)}
                                </span>
                            </div>
                        )}
                        {coverage.SumaAseguradaMin && (
                            <div className="text-sm text-muted-foreground">
                                Suma asegurada: {formatCurrency(Number(coverage.SumaAseguradaMin))}
                                - {formatCurrency(Number(coverage.SumaAseguradaMax))}
                            </div>
                        )}
                        {coverage.DeducibleMin && (
                            <div className="text-sm text-muted-foreground">
                                Deducible: {coverage.DeducibleMin}% - {coverage.DeducibleMax}%
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};