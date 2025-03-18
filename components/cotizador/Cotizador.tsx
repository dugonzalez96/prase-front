"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { nuevaCotizacionSchema } from "@/schemas/cotizadorSchema";
import type { Step } from "@/types/cotizador";
import VehicleDataStep from "./VehicleDataStep";
import QuoteDataStep from "./QuoteDataStep";
import CoverageStep from "./CoverageStep";
import QuoteSummaryStep from "./QuoteSummaryStep";
import VehicleUseStep from "./VehicleUseStep";
import { StepIndicator } from "./StepIndicator";
import { iGetTiposVehiculo, iGetUsosVehiculo } from "@/interfaces/CatVehiculosInterface";
import { iGetAnios } from "@/interfaces/LibroAzul";
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import { iGetTiposSumasAseguradas } from "@/interfaces/CatTiposSumasInterface";
import { iGetAllPaquetes, iGetAsociacionPaqueteCobertura } from "@/interfaces/CatPaquetesInterface";
import { iGetCoberturas, iGetTiposMoneda } from "@/interfaces/CatCoberturasInterface";
import { iGetAllReglaNegocio } from "@/interfaces/ReglasNegocios";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/app/(protected)/loading";
import { manejarCotizacion } from "./ManejarCotizacion";

type FormData = z.infer<typeof nuevaCotizacionSchema>;

interface CotizadorProps {
    apiKey: string;
    tiposVehiculo: iGetTiposVehiculo[];
    usosVehiculo: iGetUsosVehiculo[];
    years: iGetAnios[];
    usuarioID: number;
    tiposPagos: iGetTipoPagos[];
    tiposSumas: iGetTiposSumasAseguradas[];
    derechoPoliza: string;
    paquetesCobertura: iGetAllPaquetes[];
    coberturas: iGetCoberturas[];
    asociaciones: iGetAsociacionPaqueteCobertura[];
    reglasNegocio: iGetAllReglaNegocio[];
    tiposMoneda: iGetTiposMoneda[] | [];
}

const steps: Step[] = [
    { title: "Origen y uso", icon: "Car" },
    { title: "Datos del vehículo", icon: "Truck" },
    { title: "Datos de cotización", icon: "FileText" },
    { title: "Coberturas", icon: "Shield" },
    { title: "Resumen", icon: "CheckCircle" },
];

export const Cotizador = ({
    apiKey,
    tiposVehiculo,
    usosVehiculo,
    years,
    usuarioID,
    tiposPagos,
    tiposSumas,
    derechoPoliza,
    paquetesCobertura,
    coberturas,
    asociaciones,
    reglasNegocio,
    tiposMoneda,
}: CotizadorProps) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isStepValid, setIsStepValid] = useState(false);
    const [pasoMaximoAlcanzado, setPasoMaximoAlcanzado] = useState(1);
    const [isPending, startTransition] = useTransition();

    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<FormData>({
        resolver: zodResolver(nuevaCotizacionSchema),
        defaultValues: {
            UsuarioID: usuarioID,
            EstadoCotizacion: "REGISTRO",
            PrimaTotal: 0,
            TipoPagoID: tiposPagos.find(tipo => tipo.Descripcion.toLowerCase().includes("anual"))?.TipoPagoID || 0,
            PorcentajeDescuento: 0,
            DerechoPoliza: Number(derechoPoliza),
            TipoSumaAseguradaID: 2,
            SumaAsegurada: 0,
            PeriodoGracia: 3,
            UsoVehiculo: 0,
            TipoVehiculo: 0,
            meses: 12,
            vigencia: "Anual",
            NombrePersona: "",
            Correo: "",
            Telefono: "",
            UnidadSalvamento: false,
            VIN: "",
            CP: "",
            Marca: "",
            Submarca: "",
            Modelo: "",
            Version: "",
            Placa: "",
            NoMotor: "",
            inicioVigencia: new Date(),
            finVigencia: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                .toISOString()
                .split("T")[0],
            detalles: [],
            versionNombre: "",
            marcaNombre: "",
            modeloNombre: "",
            Estado: "",
            showMensual: false,
            tipoCalculo: undefined,
        },
    });

    // Validación de campos por paso
    const stepFields: Record<number, (keyof FormData)[]> = {
        1: ["UsoVehiculo", "TipoVehiculo"],
        2: ["Modelo", "Marca", "Submarca", "Version", "CP"],
        3: [
            "TipoSumaAseguradaID",
            "SumaAsegurada",
            "PeriodoGracia",
            "NombrePersona",
            "inicioVigencia",
        ],
        4: ["PaqueteCoberturaID"],
        5: ["Correo", "Telefono"],
    };

    // Manejadores de navegación entre pasos
    const handleNext = async () => {
        const fields = stepFields[currentStep];
        const isValid = await form.trigger(fields);

        if (isValid) {
            const siguientePaso = Math.min(currentStep + 1, steps.length);
            setCurrentStep(siguientePaso);
            setPasoMaximoAlcanzado(prev => Math.max(prev, siguientePaso));
            setIsStepValid(false);
        }
    };

    const handlePrevious = async () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        const fields = stepFields[currentStep - 1];
        form.trigger(fields).then(setIsStepValid);
    };

    const handleFinalSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();
        const datosFormulario = form.getValues();

        const datosFixed = {
            ...datosFormulario,
            Marca: datosFormulario.marcaNombre,
            Submarca: datosFormulario.modeloNombre,
            Version: datosFormulario.versionNombre,
        }

        // console.log(datosFixed)

        startTransition(async () => {
            try {
                const resultado = await manejarCotizacion({
                    datosFormulario: datosFixed,
                    tiposVehiculo,
                    usosVehiculo,
                    guardarCotizacion: true,
                    tiposPago: tiposPagos,
                    coberturas,
                });

                if (resultado.success) {
                    toast({
                        title: "Cotización creada",
                        description: "La cotización se ha creado y enviado exitosamente.",
                        variant: "default",
                    });

                    if (!resultado.correoEnviado) {
                        toast({
                            title: "Advertencia",
                            description: "La cotización se creó pero hubo un problema al enviar el correo.",
                            variant: "warning",
                        });
                    }

                    form.reset();
                    router.push('/cotizaciones/lista');
                } else {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al procesar la cotización.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear la cotización.",
                    variant: "destructive",
                });
            }
        });
    };

    const renderStep = () => {
        const props = {
            form,
            apiKey,
            tiposVehiculo,
            usosVehiculo,
            years,
            tiposPagos,
            tiposSumas,
            paquetesCobertura,
            coberturas,
            asociaciones,
            reglasNegocio,
            setIsStepValid,
            tiposMoneda,
        };

        switch (currentStep) {
            case 1:
                return <VehicleUseStep {...props} />;
            case 2:
                return <VehicleDataStep {...props} />;
            case 3:
                return <QuoteDataStep {...props} />;
            case 4:
                return <CoverageStep {...props} />;
            case 5:
                return <QuoteSummaryStep {...props} />;
            default:
                return null;
        }
    };

    return (
        <>
            {isPending && (
                <Loading />
            )}
            <StepIndicator
                pasos={steps}
                pasoActual={currentStep}
                pasoMaximoAlcanzado={pasoMaximoAlcanzado}
                alCambiarPaso={setCurrentStep}
            />

            <div className="mt-8 bg-white rounded-lg shadow-lg">
                <Form {...form}>
                    <form className="space-y-8 p-6">
                        <div>
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderStep()}
                            </motion.div>
                        </div>

                        <div className="flex justify-between pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentStep === 1}
                                className="flex items-center"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Anterior
                            </Button>

                            {currentStep < steps.length ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!isStepValid}
                                    className="flex items-center"
                                >
                                    Siguiente
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    disabled={!isStepValid}
                                    onClick={handleFinalSubmit}
                                    className="flex items-center"
                                >
                                    Finalizar cotización
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
        </>
    );
};

export default Cotizador;