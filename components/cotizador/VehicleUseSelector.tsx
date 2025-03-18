"use client";

import { motion } from 'framer-motion';
import {
    Car,
    Truck,
    Bus,
    Briefcase,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Alert,
    AlertDescription,
} from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { iGetUsosVehiculo } from '@/interfaces/CatVehiculosInterface';

interface VehicleUseSelectorProps {
    selectedUse: number;
    setSelectedUse: (use: number) => void;
    setSelectedType: (type: number) => void;
    usosVehiculo: iGetUsosVehiculo[];
    disabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
}

const iconMap: { [key: string]: React.ElementType } = {
    'Particular': Car,
    'Comercial': Truck,
    'Transporte': Bus,
    'Servicio': Briefcase,
};

// Variantes para las animaciones
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
        y: 20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3
        }
    }
};

export const VehicleUseSelector = ({
    selectedUse,
    setSelectedUse,
    setSelectedType,
    usosVehiculo,
    disabled = false,
    onValidationChange
}: VehicleUseSelectorProps) => {
    // Helper para obtener el ícono basado en el uso
    const getIcon = (uso: string) => {
        const icon = iconMap[uso] || Car;
        return icon;
    };

    // Handler para selección
    const handleUseSelect = (usoId: number) => {
        if (disabled) return;

        setSelectedUse(usoId);
        setSelectedType(0); // Resetear tipo de vehículo
        onValidationChange?.(true);
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6"
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Uso del vehículo</h3>
                    {selectedUse !== 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 text-green-600"
                        >
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-medium">Uso seleccionado</span>
                        </motion.div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {usosVehiculo.map((uso) => {
                        const Icon = getIcon(uso.Nombre);
                        const isSelected = selectedUse === uso.UsoID;

                        return (
                            <motion.div
                                key={uso.UsoID}
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
                                                onClick={() => handleUseSelect(uso.UsoID)}
                                            >
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col items-center gap-4 text-center">
                                                        <div className={cn(
                                                            "p-3 rounded-full",
                                                            isSelected ? "bg-primary text-white" : "bg-muted"
                                                        )}>
                                                            <Icon className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium mb-1">{uso.Nombre}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {/* Aquí podrías agregar una descripción si la tienes */}
                                                                Vehículos de uso {uso.Nombre.toLowerCase()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Seleccionar uso {uso.Nombre.toLowerCase()}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mensaje informativo */}
                {selectedUse === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Alert className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Selecciona el uso principal que le darás al vehículo para continuar.
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                {/* Disclaimer para uso comercial */}
                {selectedUse !== 0 && usosVehiculo.find(u => u.UsoID === selectedUse)?.Nombre === 'Comercial' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Para vehículos de uso comercial se pueden aplicar condiciones especiales.
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default VehicleUseSelector;