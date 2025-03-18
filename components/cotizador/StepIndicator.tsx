import { motion } from "framer-motion";
import {
    Car,
    Truck,
    FileText,
    Shield,
    CheckCircle,
    User,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    title: string;
    icon: string;
    description?: string;
}

interface PropiedadesIndicadorPasos {
    pasos: Step[];
    pasoActual: number;
    pasoMaximoAlcanzado: number;
    alCambiarPaso?: (paso: number) => void;
}

const mapaIconos: Record<string, LucideIcon> = {
    Car,
    Truck,
    FileText,
    Shield,
    CheckCircle,
    User,
};

export const StepIndicator = ({
    pasos,
    pasoActual,
    pasoMaximoAlcanzado,
    alCambiarPaso
}: PropiedadesIndicadorPasos) => {
    const manejarClicPaso = (indicePaso: number) => {
        if (alCambiarPaso && indicePaso <= pasoMaximoAlcanzado) {
            alCambiarPaso(indicePaso);
        }
    };

    return (
        <div className="relative px-4">
            <div className="relative flex items-center justify-between">
                {/* Línea de progreso base */}
                <div className="absolute left-5 top-6 right-0 h-0.5 bg-gray-200">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{
                            width: `${((pasoActual - 1) / (pasos.length - 1)) * 100}%`,
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>

                {pasos.map((paso, indice) => {
                    const estaCompletado = indice + 1 < pasoActual;
                    const esActual = indice + 1 === pasoActual;
                    const estaPendiente = indice + 1 > pasoActual;
                    const estaDisponible = indice + 1 <= pasoMaximoAlcanzado;

                    const Icono = mapaIconos[paso.icon];

                    return (
                        <div
                            key={indice}
                            className={cn(
                                "relative flex flex-col items-center",
                                estaDisponible && "cursor-pointer"
                            )}
                            onClick={() => manejarClicPaso(indice + 1)}
                        >
                            {/* Círculo del paso */}
                            <div className="relative">
                                {esActual && (
                                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                                )}
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full border-2 flex items-center justify-center bg-white transition-colors relative z-10",
                                        estaCompletado && "border-primary bg-primary",
                                        esActual && "border-primary",
                                        estaPendiente && "border-gray-300",
                                        estaDisponible && "hover:border-primary/70"
                                    )}
                                >
                                    {estaCompletado ? (
                                        <CheckCircle className="h-6 w-6 text-white" />
                                    ) : (
                                        <Icono
                                            className={cn(
                                                "h-6 w-6",
                                                esActual && "text-primary",
                                                estaPendiente && "text-gray-400"
                                            )}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Título del paso */}
                            <span
                                className={cn(
                                    "mt-2 text-xs text-center transition-colors",
                                    estaCompletado && "text-primary font-medium",
                                    esActual && "text-primary font-semibold",
                                    estaPendiente && "text-gray-500",
                                    estaDisponible && "hover:text-primary"
                                )}
                            >
                                {paso.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};