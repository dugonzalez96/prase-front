"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Car,
    Truck,
    Bus,
    AlertCircle,
    Tractor,
    Bike,
    ShieldAlert,
    Info,
    CarTaxiFront,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { iGetTiposVehiculo } from "@/interfaces/CatVehiculosInterface";

interface VehicleTypeSelectorProps {
    selectedUse: number;
    selectedType: number;
    setSelectedType: (type: number) => void;
    tiposVehiculo: iGetTiposVehiculo[];
    disabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
}

// Mapa de íconos por tipo de vehículo
const iconMap: { [key: string]: React.ElementType } = {
    "Auto": Car,
    "Camioneta": Truck,
    "Autobús": Bus,
    "Taxi": CarTaxiFront,
    "Tractocamión": Tractor,
    "Motocicleta": Bike,
    // Agregar más mapeos según necesites
};

// Variantes para animaciones
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

export const VehicleTypeSelector = ({
    selectedUse,
    selectedType,
    setSelectedType,
    tiposVehiculo,
    disabled = false,
    onValidationChange
}: VehicleTypeSelectorProps) => {
    // Filtrar tipos de vehículo por uso seleccionado
    const filteredVehiculos = tiposVehiculo.filter(
        tipo => tipo.uso.UsoID === selectedUse
    );

    // Efecto para validación
    useEffect(() => {
        if (onValidationChange) {
            onValidationChange(selectedType !== 0);
        }
    }, [selectedType, onValidationChange]);

    // Obtener icono para el tipo de vehículo
    const getIcon = (nombre: string) => {
        const Icon = iconMap[nombre] || Car;
        return Icon;
    };

    // Verificar si es un vehículo con consideraciones especiales
    const hasSpecialConsiderations = (tipo: iGetTiposVehiculo) => {
        // Aquí puedes agregar la lógica para determinar si un tipo de vehículo
        // tiene consideraciones especiales (por ejemplo, tractocamiones, autobuses, etc.)
        return ["Tractocamión", "Autobús", "Taxi"].includes(tipo.Nombre);
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                {filteredVehiculos.map((tipo) => {
                    const Icon = getIcon(tipo.Nombre);
                    const isSelected = selectedType === tipo.TipoID;
                    const hasSpecial = hasSpecialConsiderations(tipo);

                    return (
                        <motion.div
                            key={tipo.TipoID}
                            variants={itemVariants}
                            whileHover={{ scale: disabled ? 1 : 1.02 }}
                            whileTap={{ scale: disabled ? 1 : 0.98 }}
                        >
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Card
                                            className={cn(
                                                "cursor-pointer transition-all duration-200",
                                                isSelected && "ring-2 ring-primary border-primary",
                                                disabled && "opacity-50 cursor-not-allowed",
                                                !isSelected && !disabled && "hover:border-primary/50"
                                            )}
                                            onClick={() => {
                                                if (!disabled) {
                                                    setSelectedType(tipo.TipoID);
                                                }
                                            }}
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div
                                                        className={cn(
                                                            "p-3 rounded-full",
                                                            isSelected ? "bg-primary text-white" : "bg-muted"
                                                        )}
                                                    >
                                                        <Icon className="h-6 w-6" />
                                                    </div>

                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <h4 className="font-medium">{tipo.Nombre}</h4>
                                                            {hasSpecial && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger>
                                                                            <Info className="h-4 w-4 text-muted-foreground" />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p className="text-sm">
                                                                                Este tipo de vehículo puede tener
                                                                                consideraciones especiales
                                                                            </p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}
                                                        </div>
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="mt-2"
                                                            >
                                                                <Badge variant="secondary">
                                                                    Seleccionado
                                                                </Badge>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Seleccionar {tipo.Nombre.toLowerCase()}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Alertas para vehículos especiales */}
                            {isSelected && hasSpecial && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2"
                                >
                                    <Alert className="mt-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Este tipo de vehículo puede requerir documentación
                                            o coberturas adicionales.
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Mensaje cuando no hay tipos disponibles */}
            {filteredVehiculos.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Alert>
                        <ShieldAlert className="h-4 w-4" />
                        <AlertDescription>
                            No hay tipos de vehículo disponibles para el uso seleccionado.
                        </AlertDescription>
                    </Alert>
                </motion.div>
            )}

            {/* Mensaje cuando no se ha seleccionado tipo */}
            {filteredVehiculos.length > 0 && selectedType === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Selecciona el tipo específico de vehículo para continuar.
                        </AlertDescription>
                    </Alert>
                </motion.div>
            )}
        </div>
    );
};

export default VehicleTypeSelector;