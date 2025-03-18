import { getCoberturas } from "@/actions/CatCoberturasActions";
import { getAllPaquetes, getAsociacionPaquetesCobertura } from "@/actions/CatPaquetesActions";
import { getTiposSumasAseguradas } from "@/actions/CatSumasAseguradasActions";
import { getTipoPagos } from "@/actions/CatTipoPagos";
import { getTiposVehiculo, getUsoVehiculo } from "@/actions/CatVehiculosActions";
import { getConfiguracionGlobalByName } from "@/actions/ConfiguracionGlobal";
import { getAnios, loginAuto } from "@/actions/LibroAzul";
import Cotizador from "@/components/cotizador/Cotizador";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type {
    iGetTiposVehiculo,
    iGetUsosVehiculo
} from "@/interfaces/CatVehiculosInterface";
import type { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import type { iGetTiposSumasAseguradas } from "@/interfaces/CatTiposSumasInterface";
import type { iGetAllPaquetes, iGetAsociacionPaqueteCobertura } from "@/interfaces/CatPaquetesInterface";
import type { iGetCoberturas, iGetTiposMoneda } from "@/interfaces/CatCoberturasInterface";
import type { IGetAllConfiguracionGlobal } from "@/interfaces/ConfiguracionGlobal";
import { iGetAnios } from "@/interfaces/LibroAzul";
import { getAllReglasNegocio } from "@/actions/ReglasNegocio";
import { iGetAllReglaNegocio } from "@/interfaces/ReglasNegocios";
import { getTiposMoneda } from "@/actions/CatMonedasActions";
import { currentUser } from "@/lib/auth";

interface ApiResponse<T> {
    data: T | null;
    error?: string;
}

// Componente para mensajes de error
const ErrorMessage = ({ title, message }: { title: string; message: string }) => (
    <Alert variant="destructive">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
    </Alert>
);

// Función helper para validar respuestas de la API
const validateApiResponse = <T,>(
    response: T | null,
    resourceName: string
): ApiResponse<T> => {
    if (!response) {
        return {
            data: null,
            error: `Error al obtener ${resourceName}`
        };
    }

    if (Array.isArray(response) && response.length === 0) {
        return {
            data: null,
            error: `No hay datos disponibles para ${resourceName}`
        };
    }

    return { data: response };
};

export default async function CotizadorPage() {
    const user = await currentUser();

    // Función para cargar datos con manejo de errores
    const loadData = async () => {
        const responses = await Promise.allSettled([
            getTiposVehiculo(),
            getUsoVehiculo(),
            getTipoPagos(),
            loginAuto(),
            getTiposSumasAseguradas(),
            getConfiguracionGlobalByName("Derecho de poliza"),
            getAllPaquetes(),
            getCoberturas(),
            getAsociacionPaquetesCobertura(),
            getAllReglasNegocio(),
            getTiposMoneda(),
        ]);

        const errors: string[] = [];
        const data = {
            tiposVehiculo: null as iGetTiposVehiculo[] | null,
            usosVehiculo: null as iGetUsosVehiculo[] | null,
            tiposPagos: null as iGetTipoPagos[] | null,
            keyAuto: null as string | null,
            tiposSumas: null as iGetTiposSumasAseguradas[] | null,
            derechoPoliza: null as IGetAllConfiguracionGlobal | null,
            paquetesCobertura: null as iGetAllPaquetes[] | null,
            coberturas: null as iGetCoberturas[] | null,
            asociaciones: null as iGetAsociacionPaqueteCobertura[] | null,
            reglasNegocio: null as iGetAllReglaNegocio[] | null,
            years: null as iGetAnios[] | null,
            tiposMoneda: null as iGetTiposMoneda[] | null,
        };

        // Procesar las respuestas iniciales
        for (let i = 0; i < responses.length; i++) {
            const response = responses[i];

            if (response.status === 'fulfilled') {
                const validationResult = validateApiResponse(
                    response.value,
                    getResourceName(i)
                );

                if (validationResult.error) {
                    errors.push(validationResult.error);
                } else {
                    switch (i) {
                        case 0:
                            data.tiposVehiculo = validationResult.data as iGetTiposVehiculo[];
                            break;
                        case 1:
                            data.usosVehiculo = validationResult.data as iGetUsosVehiculo[];
                            break;
                        case 2:
                            data.tiposPagos = validationResult.data as iGetTipoPagos[];
                            break;
                        case 3:
                            data.keyAuto = validationResult.data as string;
                            break;
                        case 4:
                            data.tiposSumas = validationResult.data as iGetTiposSumasAseguradas[];
                            break;
                        case 5:
                            data.derechoPoliza = validationResult.data as IGetAllConfiguracionGlobal;
                            break;
                        case 6:
                            data.paquetesCobertura = validationResult.data as iGetAllPaquetes[];
                            break;
                        case 7:
                            data.coberturas = validationResult.data as iGetCoberturas[];
                            break;
                        case 8:
                            data.asociaciones = validationResult.data as iGetAsociacionPaqueteCobertura[];
                            break;
                        case 9:
                            data.reglasNegocio = validationResult.data as iGetAllReglaNegocio[];
                            break;
                        case 10:
                            data.tiposMoneda = validationResult.data as iGetTiposMoneda[];
                            break;
                    }
                }
            } else {
                errors.push(`Error al cargar ${getResourceName(i)}: ${response.reason}`);
            }
        }

        // Obtener años solo si tenemos keyAuto
        if (data.keyAuto) {
            try {
                const yearsData = await getAnios(data.keyAuto);
                const yearsValidation = validateApiResponse(yearsData, "años disponibles");

                if (yearsValidation.error) {
                    errors.push(yearsValidation.error);
                } else {
                    data.years = yearsValidation.data as iGetAnios[];
                }
            } catch (error) {
                errors.push(`Error al obtener años: ${error}`);
            }
        }

        return { data, errors };
    };

    try {
        const { data, errors } = await loadData();

        // Si hay errores críticos, mostrar mensaje de error
        if (errors.length > 0 && isCriticalError(errors)) {
            return (
                <div className="container mx-auto py-6 space-y-4">
                    {errors.map((error, index) => (
                        <ErrorMessage
                            key={index}
                            title="Error al cargar datos"
                            message={error}
                        />
                    ))}
                </div>
            );
        }

        // Validar datos críticos
        if (
            !data.tiposVehiculo ||
            !data.usosVehiculo ||
            !data.keyAuto ||
            !data.years ||
            !data.tiposPagos ||
            !data.tiposSumas ||
            !data.derechoPoliza ||
            !data.paquetesCobertura ||
            !data.coberturas ||
            !data.asociaciones ||
            !data.reglasNegocio
        ) {
            return (
                <ErrorMessage
                    title="Error crítico"
                    message="No se pudieron cargar los datos esenciales del cotizador"
                />
            );
        }

        return (
            <main className="container py-6">
                <h1 className="text-3xl font-bold mb-6">Cotizador de Seguros</h1>

                {/* Mostrar advertencias no críticas si existen */}
                {errors.length > 0 && (
                    <div className="mb-6 space-y-2">
                        {errors.map((error, index) => (
                            <Alert key={index}>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ))}
                    </div>
                )}

                <Cotizador
                    apiKey={data.keyAuto}
                    tiposVehiculo={data.tiposVehiculo}
                    usosVehiculo={data.usosVehiculo}
                    years={data.years}
                    tiposPagos={data.tiposPagos}
                    tiposSumas={data.tiposSumas}
                    derechoPoliza={data.derechoPoliza.ValorConfiguracion}
                    paquetesCobertura={data.paquetesCobertura}
                    coberturas={data.coberturas}
                    asociaciones={data.asociaciones}
                    reglasNegocio={data.reglasNegocio}
                    usuarioID={user?.usuario.UsuarioID || 0}
                    tiposMoneda={data.tiposMoneda ?? []}
                />
            </main>
        );
    } catch (error) {
        console.error('Error al cargar el cotizador:', error);
        return (
            <ErrorMessage
                title="Error inesperado"
                message="Ha ocurrido un error inesperado al cargar el cotizador"
            />
        );
    }
}

const getResourceName = (index: number): string => {
    const resources = [
        "tipos de vehículo",
        "usos de vehículo",
        "tipos de pago",
        "autenticación",
        "tipos de suma asegurada",
        "derecho de póliza",
        "paquetes de cobertura",
        "coberturas",
        "asociaciones",
        "reglas globales",
        "años de vehículos"
    ];
    return resources[index];
};

const isCriticalError = (errors: string[]): boolean => {
    const criticalResources = [
        "tipos de vehículo",
        "usos de vehículo",
        "autenticación"
    ];
    return errors.some(error =>
        criticalResources.some(resource =>
            error.toLowerCase().includes(resource)
        )
    );
};