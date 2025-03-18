"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, AlertCircle, CheckCircle2 } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import type { StepProps } from "@/types/cotizador";
import { ScrollArea } from "../ui/scroll-area";
import VehicleUseSelector from "./VehicleUseSelector";
import VehicleTypeSelector from "./VehicleTypeSelector";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
    },
};

export const VehicleUseStep = ({
    form,
    usosVehiculo,
    tiposVehiculo,
    setIsStepValid,
}: StepProps) => {
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [isUseValid, setIsUseValid] = useState(false);
    const [isTypeValid, setIsTypeValid] = useState(false);

    const selectedUse = form.watch("UsoVehiculo");
    const selectedType = form.watch("TipoVehiculo");

    // Validar el paso completo
    useEffect(() => {
        const isValid = isUseValid && (showTypeSelector ? isTypeValid : true);
        setIsStepValid?.(isValid);
    }, [isUseValid, isTypeValid, showTypeSelector, setIsStepValid]);

    // Actualizar visibilidad del selector de tipo
    useEffect(() => {
        if (selectedUse !== 0) {
            setShowTypeSelector(true);
        } else {
            setShowTypeSelector(false);
            setIsTypeValid(false);
        }
    }, [selectedUse]);

    const handleUseSelect = (useId: number) => {
        form.setValue("UsoVehiculo", useId, { shouldValidate: true });
        // Resetear tipo de vehículo cuando cambia el uso
        form.setValue("TipoVehiculo", 0, { shouldValidate: true });
        setIsTypeValid(false);
    };

    const handleTypeSelect = (typeId: number) => {
        form.setValue("TipoVehiculo", typeId, { shouldValidate: true });
    };

    return (
        <ScrollArea className="h-[calc(100vh-300px)] pr-4">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Sección de uso del vehículo */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Car className="h-5 w-5" />
                                        Selección de Uso
                                    </CardTitle>
                                    <CardDescription>
                                        Indica el uso principal que le darás al vehículo
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <VehicleUseSelector
                                selectedUse={selectedUse}
                                setSelectedUse={handleUseSelect}
                                setSelectedType={handleTypeSelect}
                                usosVehiculo={usosVehiculo || []}
                                onValidationChange={setIsUseValid}
                            />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Sección de tipo de vehículo */}
                {showTypeSelector && (
                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Tipo de Vehículo</CardTitle>
                                        <CardDescription>
                                            Selecciona el tipo específico de vehículo
                                        </CardDescription>
                                    </div>
                                    {isTypeValid && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="flex items-center gap-2 text-green-600"
                                        >
                                            <CheckCircle2 className="h-5 w-5" />
                                            <span className="text-sm font-medium">
                                                Tipo seleccionado
                                            </span>
                                        </motion.div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <VehicleTypeSelector
                                    selectedUse={selectedUse}
                                    selectedType={selectedType}
                                    setSelectedType={handleTypeSelect}
                                    tiposVehiculo={tiposVehiculo || []}
                                    onValidationChange={setIsTypeValid}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Mensajes informativos */}
                <AnimatePresence>
                    {!selectedUse && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Importante</AlertTitle>
                                <AlertDescription>
                                    Selecciona el uso del vehículo para continuar con la cotización.
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}

                    {selectedUse && !selectedType && showTypeSelector && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Ahora selecciona el tipo específico de vehículo.
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}

                    {/* Alerta de uso comercial */}
                    {selectedUse &&
                        usosVehiculo?.find(u => u.UsoID === selectedUse)?.Nombre === 'Comercial' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Uso Comercial</AlertTitle>
                                    <AlertDescription>
                                        Ten en cuenta que los vehículos de uso comercial pueden tener
                                        consideraciones especiales en cuanto a coberturas y costos.
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                </AnimatePresence>

                {/* Resumen de selección */}
                {isUseValid && isTypeValid && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-lg bg-muted p-4"
                    >
                        <div className="space-y-2">
                            <h4 className="font-medium">Resumen de selección:</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Uso del vehículo:
                                    </span>
                                    <p className="font-medium">
                                        {usosVehiculo?.find(u => u.UsoID === selectedUse)?.Nombre}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Tipo de vehículo:
                                    </span>
                                    <p className="font-medium">
                                        {tiposVehiculo?.find(t => t.TipoID === selectedType)?.Nombre}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </ScrollArea>
    );
};

export default VehicleUseStep;