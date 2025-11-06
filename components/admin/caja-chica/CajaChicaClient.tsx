"use client";

/**
 * CajaChicaClient.tsx
 * 
 * ✅ FUNCIONA:
 * - Carga de precuadre con getPrecuadreCajaChica()
 * - Integración de TODOS los componentes según especificación
 * - Modales: Cuadrar, Actualizar, Cancelar, Previsualizar
 * - Tabs: Principal + Historial
 * - Manejo de estado con useRef para evitar loops
 * 
 * ❌ NO FUNCIONA / USA MOCK:
 * - precuadre.Info: Datos hardcoded de sucursal/caja - FALTA: Backend envíe iInfoCajaChica
 * - precuadre.TotalesPorMetodo: Calculado con mock - FALTA: Backend calcule desde cortes
 * - precuadre.Calculos: Valores mockeados - FALTA: Backend calcule fórmulas reales
 * - precuadre.Egresos: Array vacío - FALTA: Backend endpoint de egresos
 * - ListaEgresos: Handlers sin implementar - FALTA: CRUD de egresos
 * - CalculosAutomaticos: Input depósitos sin guardar - FALTA: Backend PATCH depósitos
 * 
 * 📝 PARA IMPLEMENTAR:
 * 1. Backend debe enviar iPrecuadreCajaChica completo con Info, TotalesPorMetodo, Calculos, CortesUsuarios, Egresos
 * 2. Endpoints de egresos: POST, PATCH, DELETE /caja-chica/{id}/egresos
 * 3. Endpoint de depósitos: PATCH /caja-chica/{id}/depositos-banco
 * 4. Validación backend de todos los usuarios validados antes de cuadrar
 * 5. WebSocket/polling para actualizaciones en tiempo real de cortes de usuarios
 */

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { iPrecuadreCajaChica, iUsuarioPendiente } from "@/interfaces/CajaChicaInterface";
import { getPrecuadreCajaChica, cuadrarCajaChica as cuadrarCajaChicaAction, actualizarCapturables as actualizarCapturablesAction, cancelarCajaChica as cancelarCajaChicaAction } from "@/actions/CajaChicaActions";
import { EncabezadoCajaChica } from "./EncabezadoCajaChica";
import { TotalesPorMetodo } from "./TotalesPorMetodo";
import { ListaEgresos } from "./ListaEgresos";
import { CalculosAutomaticos } from "./CalculosAutomaticos";
import { TablaDetalleUsuarios } from "./TablaDetalleUsuarios";
import { ModalPrevisualizar } from "./ModalPrevisualizar";
import { HistorialCajaChica } from "./HistorialCajaChica";
import { FormCuadrarCajaChica } from "./FormCuadrarCajaChica";
import { FormActualizarCapturables } from "./FormActualizarCapturables";
import { FormCancelarCajaChica } from "./FormCancelarCajaChica";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet, AlertCircle, CheckCircle2, XCircle, Calculator, Save, Ban, Eye } from "lucide-react";
import { LoaderModales } from "@/components/LoaderModales";

interface CajaChicaClientProps {
    precuadreInicial?: iPrecuadreCajaChica;
}

export function CajaChicaClient({ precuadreInicial }: CajaChicaClientProps) {
    const { toast } = useToast();
    const [precuadre, setPrecuadre] = useState<iPrecuadreCajaChica | null>(precuadreInicial || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);

    // Estados para modales
    const [isModalCuadrarOpen, setIsModalCuadrarOpen] = useState(false);
    const [isModalActualizarOpen, setIsModalActualizarOpen] = useState(false);
    const [isModalCancelarOpen, setIsModalCancelarOpen] = useState(false);
    const [isModalPrevisualizarOpen, setIsModalPrevisualizarOpen] = useState(false);

    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Fetch precuadre - solo se ejecuta manualmente o al montar si no hay datos iniciales
    const fetchPrecuadre = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await getPrecuadreCajaChica();

            if (!isMounted.current) return;

            if ('error' in result) {
                setError(result.error);
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive"
                });
                return;
            }

            setPrecuadre(result);

            // Mostrar mensajes del backend si existen
            if (result.mensajes && result.mensajes.length > 0) {
                result.mensajes.forEach(msg => {
                    toast({
                        title: "Información",
                        description: msg
                    });
                });
            }

        } catch (err) {
            if (!isMounted.current) return;
            const errorMsg = err instanceof Error ? err.message : 'Error al obtener precuadre';
            setError(errorMsg);
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive"
            });
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    };

    // Cuadrar caja chica
    const handleCuadrar = async (data: any) => {
        if (!precuadre) return;

        setIsLoading(true);

        try {
            // Nota: El ID debería venir del precuadre o del backend
            // Por ahora usamos 1 como placeholder
            const result = await cuadrarCajaChicaAction(1, data);

            if (!isMounted.current) return;

            if (result.success) {
                toast({
                    title: "Éxito",
                    description: result.message
                });
                setIsModalCuadrarOpen(false);
                // Refrescar precuadre después de cuadrar
                await fetchPrecuadre();
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive"
                });
            }

        } catch (err) {
            if (!isMounted.current) return;
            const errorMsg = err instanceof Error ? err.message : 'Error al cuadrar caja chica';
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive"
            });
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    };

    // Actualizar capturables
    const handleActualizarCapturables = async (data: any) => {
        setIsLoading(true);

        try {
            const result = await actualizarCapturablesAction(1, data);

            if (!isMounted.current) return;

            if (result.success) {
                toast({
                    title: "Éxito",
                    description: result.message
                });
                setIsModalActualizarOpen(false);
                await fetchPrecuadre();
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive"
                });
            }

        } catch (err) {
            if (!isMounted.current) return;
            const errorMsg = err instanceof Error ? err.message : 'Error al actualizar';
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive"
            });
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    };

    // Cancelar caja chica
    const handleCancelar = async (data: any) => {
        setIsLoading(true);

        try {
            const result = await cancelarCajaChicaAction(1, data);

            if (!isMounted.current) return;

            if (result.success) {
                toast({
                    title: "Éxito",
                    description: result.message
                });
                setIsModalCancelarOpen(false);
                await fetchPrecuadre();
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive"
                });
            }

        } catch (err) {
            if (!isMounted.current) return;
            const errorMsg = err instanceof Error ? err.message : 'Error al cancelar';
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive"
            });
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    };

    // ❌ La función calcularDiferencia legacy fue eliminada - Ya no existe SaldoEsperado
    // Las diferencias ahora vienen calculadas por usuario en precuadre.CortesUsuarios[].Diferencia

    // Renderizar alertas de usuarios pendientes
    const renderUsuariosPendientes = () => {
        if (!precuadre?.UsuariosPendientes || precuadre.UsuariosPendientes.length === 0) {
            return null;
        }
        console.log("🚀 ~ renderUsuariosPendientes ~ precuadre:", precuadre)

        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Usuarios con cortes pendientes:</strong>
                    <ul className="list-disc ml-6 mt-2">
                        {precuadre.UsuariosPendientes.map((usuario: iUsuarioPendiente) => (
                            <li key={usuario.UsuarioID}>
                                {usuario.Nombre}
                            </li>
                        ))}
                    </ul>
                </AlertDescription>
            </Alert>
        );
    };

    // Renderizar alertas de mensajes
    const renderMensajes = () => {
        if (!precuadre?.mensajes || precuadre.mensajes.length === 0) {
            return null;
        }

        return (
            <div className="space-y-2">
                {precuadre.mensajes.map((mensaje, index) => (
                    <Alert key={index}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{mensaje}</AlertDescription>
                    </Alert>
                ))}
            </div>
        );
    };

    // Estado de carga inicial
    if (isLoading && !precuadre) {
        return <LoaderModales />;
    }

    // Estado de error
    if (error && !precuadre) {
        return (
            <div className="space-y-4">
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={fetchPrecuadre}>Reintentar</Button>
            </div>
        );
    }

    // Sin datos
    if (!precuadre) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No hay datos de precuadre disponibles</p>
                <Button onClick={fetchPrecuadre}>Cargar Precuadre</Button>
            </div>
        );
    }

    return (
        <>
            {isLoading && <LoaderModales texto="Procesando..." />}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <Wallet className="h-8 w-8" />
                        Caja Chica
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        {new Date().toLocaleDateString('es-MX', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <Button onClick={fetchPrecuadre} variant="outline" disabled={isLoading}>
                    Actualizar
                </Button>
            </div>

            {renderMensajes()}
            {renderUsuariosPendientes()}

            <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="historial">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6">
                    {/* 1. Encabezado - Sucursal, Caja, Fecha, Fondo Fijo */}
                    <EncabezadoCajaChica
                        sucursal={precuadre.Info?.NombreSucursal}
                        caja={precuadre.Info?.NombreCaja}
                        fechaCorte={precuadre.Info?.FechaCorte}
                        fondoFijo={precuadre.Info?.FondoFijo}
                    />

                    {/* 2. Totales por Método de Pago */}
                    <TotalesPorMetodo
                        efectivo={precuadre.TotalesPorMetodo?.TotalEfectivo || 0}
                        tarjeta={precuadre.TotalesPorMetodo?.TotalTarjeta || 0}
                        transferencia={precuadre.TotalesPorMetodo?.TotalTransferencia || 0}
                        depositoVentanilla={precuadre.TotalesPorMetodo?.TotalDepositoVentanilla || 0}
                    />

                    {/* 3. Otros Movimientos: Egresos + Cálculos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* ❌ FALTA: Handlers de agregar/editar/eliminar egresos */}
                        <ListaEgresos
                            egresos={precuadre.Egresos}
                            onAgregar={() => {
                                toast({
                                    title: "⚠️ No implementado",
                                    description: "Falta crear FormAgregarEgreso y endpoint POST /egresos",
                                    variant: "default"
                                });
                            }}
                            onEliminar={(egresoId) => {
                                console.log("⚠️ Eliminar egreso", egresoId);
                                toast({
                                    title: "⚠️ No implementado",
                                    description: "Falta endpoint DELETE /caja-chica/egresos/" + egresoId
                                });
                            }}
                            onEditar={(egreso) => {
                                console.log("⚠️ Editar egreso", egreso);
                                toast({
                                    title: "⚠️ No implementado",
                                    description: "Falta FormEditarEgreso y PATCH /egresos"
                                });
                            }}
                        />

                        {/* ❌ FALTA: onDepositoChange debe guardar en backend */}
                        <CalculosAutomaticos
                            saldoInicial={precuadre.Calculos?.SaldoInicial || 0}
                            totalIngresos={precuadre.Calculos?.TotalIngresos || 0}
                            totalEgresos={precuadre.Calculos?.TotalEgresos || 0}
                            fondoFijo={precuadre.Info?.FondoFijo || 0}
                            onDepositoChange={(monto: number) => {
                                console.log("⚠️ Depositos banco cambió a:", monto);
                                toast({
                                    title: "⚠️ No guardado",
                                    description: "Falta endpoint PATCH /caja-chica/{id}/depositos-banco"
                                });
                            }}
                        />
                    </div>

                    {/* 4. Detalle de Cortes por Usuario */}
                    <TablaDetalleUsuarios
                        cortes={precuadre.CortesUsuarios || []}
                    />

                    {/* 5. Alertas y Badges */}
                    {precuadre.PendientesDeCorte > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Hay {precuadre.PendientesDeCorte} usuario(s) con cortes pendientes de validación.
                            </AlertDescription>
                        </Alert>
                    )}

                    {precuadre.CortesUsuarios?.some(c => Math.abs(c.Diferencia) > 0) && (
                        <Alert variant="default" className="border-orange-500 bg-orange-50">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                                <strong>⚠️ Diferencias detectadas</strong> en algunos cortes. 
                                Revisa la tabla de detalle antes de cerrar.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* 6. Botones de Acción */}
                    <div className="flex gap-3 flex-wrap justify-end border-t pt-6">
                        <Button 
                            onClick={() => setIsModalActualizarOpen(true)}
                            variant="outline"
                            disabled={isLoading}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Avance
                        </Button>
                        {/* ❌ FALTA: Modal Previsualizar */}
                        <Button 
                            onClick={() => setIsModalPrevisualizarOpen(true)}
                            variant="outline"
                            disabled={isLoading}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Previsualizar
                        </Button>
                        <Button 
                            onClick={() => setIsModalCuadrarOpen(true)}
                            disabled={isLoading || precuadre.PendientesDeCorte > 0}
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            Cerrar Corte
                        </Button>
                        <Button 
                            onClick={() => setIsModalCancelarOpen(true)}
                            variant="destructive"
                            disabled={isLoading}
                        >
                            <Ban className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="historial">
                    <HistorialCajaChica />
                </TabsContent>
            </Tabs>

            {/* Modal Cuadrar Caja Chica */}
            <Dialog open={isModalCuadrarOpen} onOpenChange={setIsModalCuadrarOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5" />
                            Cuadrar Caja Chica
                        </DialogTitle>
                        <DialogDescription>
                            Complete los montos capturados para realizar el cuadre definitivo
                        </DialogDescription>
                    </DialogHeader>
                    {precuadre && (
                        <FormCuadrarCajaChica
                            precuadre={precuadre}
                            onSubmit={handleCuadrar}
                            isLoading={isLoading}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal Actualizar Capturables */}
            <Dialog open={isModalActualizarOpen} onOpenChange={setIsModalActualizarOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Save className="h-5 w-5" />
                            Guardar Avance Parcial
                        </DialogTitle>
                        <DialogDescription>
                            Actualice los campos que desee guardar antes del cuadre final
                        </DialogDescription>
                    </DialogHeader>
                    <FormActualizarCapturables
                        onSubmit={handleActualizarCapturables}
                        isLoading={isLoading}
                        valoresActuales={{
                            // ❌ SaldoReal eliminado - Nueva estructura no tiene este campo
                            SaldoReal: undefined,
                            TotalEfectivoCapturado: precuadre?.TotalesPorMetodo?.TotalEfectivo,
                            TotalTarjetaCapturado: precuadre?.TotalesPorMetodo?.TotalTarjeta,
                            TotalTransferenciaCapturado: precuadre?.TotalesPorMetodo?.TotalTransferencia
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Modal Cancelar Caja Chica */}
            <Dialog open={isModalCancelarOpen} onOpenChange={setIsModalCancelarOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Ban className="h-5 w-5" />
                            Cancelar Caja Chica
                        </DialogTitle>
                        <DialogDescription>
                            Esta acción es irreversible y requiere autorización
                        </DialogDescription>
                    </DialogHeader>
                    <FormCancelarCajaChica
                        cajaChicaId={1}
                        onSubmit={handleCancelar}
                        isLoading={isLoading}
                    />
                </DialogContent>
            </Dialog>

            {/* Modal Previsualizar antes de cerrar */}
            {/* ❌ FALTA: onCerrar debe invocar handleCuadrar o abrir FormCuadrarCajaChica */}
            <ModalPrevisualizar
                open={isModalPrevisualizarOpen}
                onOpenChange={setIsModalPrevisualizarOpen}
                precuadre={precuadre || undefined}
                onActualizar={fetchPrecuadre}
                onCerrar={() => {
                    setIsModalPrevisualizarOpen(false);
                    setIsModalCuadrarOpen(true);
                }}
            />
        </>
    );
}
