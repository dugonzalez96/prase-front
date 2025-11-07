"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cancelarCajaChicaSchema } from "@/schemas/admin/caja-chica/cajaChicaSchema";
import { generarCodigoCancelacion } from "@/actions/CajaChicaActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, XCircle, KeyRound } from "lucide-react";

type FormData = z.infer<typeof cancelarCajaChicaSchema>;

interface FormCancelarCajaChicaProps {
    cajaChicaId: number;
    onSubmit: (data: FormData) => Promise<void>;
    isLoading?: boolean;
}

export function FormCancelarCajaChica({ 
    cajaChicaId,
    onSubmit,
    isLoading = false 
}: FormCancelarCajaChicaProps) {
    const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [errorCodigo, setErrorCodigo] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm<FormData>({
        resolver: zodResolver(cancelarCajaChicaSchema),
        defaultValues: {
            usuario: "",
            codigo: "",
            motivo: ""
        }
    });

    const handleGenerarCodigo = async () => {
        setIsGeneratingCode(true);
        setErrorCodigo(null);

        try {
            const result = await generarCodigoCancelacion(cajaChicaId);

            if ('error' in result) {
                setErrorCodigo(result.error);
                return;
            }

            setCodigoGenerado(result.codigo);
            setValue("codigo", result.codigo);
        } catch (error) {
            setErrorCodigo(error instanceof Error ? error.message : 'Error al generar código');
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const handleFormSubmit = async (data: FormData) => {
        await onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Advertencia */}
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>⚠ Advertencia:</strong> Esta acción es irreversible. Una vez cancelada la caja chica, 
                    todos los movimientos asociados quedarán sin efecto y deberá iniciarse una nueva caja.
                </AlertDescription>
            </Alert>

            {/* Generación de código */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5" />
                        Código de Autorización
                    </CardTitle>
                    <CardDescription>
                        Genere un código de autorización válido para cancelar
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-3">
                        <Button 
                            type="button"
                            variant="outline"
                            onClick={handleGenerarCodigo}
                            disabled={isGeneratingCode || isLoading}
                        >
                            {isGeneratingCode ? "Generando..." : "Generar Código"}
                        </Button>
                        {codigoGenerado && (
                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-md">
                                <p className="text-sm text-muted-foreground">Código generado:</p>
                                <p className="font-mono font-bold text-lg text-green-700">{codigoGenerado}</p>
                            </div>
                        )}
                    </div>

                    {errorCodigo && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errorCodigo}</AlertDescription>
                        </Alert>
                    )}

                    <p className="text-sm text-muted-foreground">
                        El código de autorización es temporal y debe ser usado inmediatamente. 
                        Si no lo utiliza en los próximos minutos, deberá generar uno nuevo.
                    </p>
                </CardContent>
            </Card>

            {/* Campos del formulario */}
            <Card>
                <CardHeader>
                    <CardTitle>Datos de Cancelación</CardTitle>
                    <CardDescription>
                        Complete los campos requeridos para proceder
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Usuario */}
                    <div className="space-y-2">
                        <Label htmlFor="usuario">Usuario que Autoriza *</Label>
                        <Input
                            id="usuario"
                            type="text"
                            placeholder="Ingrese el nombre de usuario"
                            {...register("usuario")}
                            disabled={isLoading}
                        />
                        {errors.usuario && (
                            <p className="text-sm text-red-500">{errors.usuario.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Usuario con permisos de gerencia o administración
                        </p>
                    </div>

                    {/* Código */}
                    <div className="space-y-2">
                        <Label htmlFor="codigo">Código de Autorización *</Label>
                        <Input
                            id="codigo"
                            type="text"
                            placeholder="Ingrese el código generado"
                            {...register("codigo")}
                            disabled={isLoading}
                            className="font-mono"
                        />
                        {errors.codigo && (
                            <p className="text-sm text-red-500">{errors.codigo.message}</p>
                        )}
                    </div>

                    {/* Motivo */}
                    <div className="space-y-2">
                        <Label htmlFor="motivo">Motivo de Cancelación *</Label>
                        <Textarea
                            id="motivo"
                            placeholder="Explique detalladamente el motivo de la cancelación"
                            rows={4}
                            {...register("motivo")}
                            disabled={isLoading}
                        />
                        {errors.motivo && (
                            <p className="text-sm text-red-500">{errors.motivo.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Mínimo 10 caracteres, máximo 500
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmación final */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Al hacer clic en "Cancelar Caja Chica", confirmo que he verificado toda la información 
                    y entiendo que esta acción no se puede deshacer.
                </AlertDescription>
            </Alert>

            {/* Botones */}
            <div className="flex gap-3 justify-end">
                <Button 
                    type="submit" 
                    variant="destructive"
                    disabled={isLoading || !codigoGenerado}
                    size="lg"
                >
                    {isLoading ? "Procesando..." : "Cancelar Caja Chica"}
                </Button>
            </div>
        </form>
    );
}
