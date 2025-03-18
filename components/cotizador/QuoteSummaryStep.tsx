"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
    Car,
    Calendar,
    Shield,
    CreditCard,
    User,
    MapPin,
    CheckCircle,
    Info,
    Contact,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StepProps } from "@/types/cotizador";
import { formatCurrency } from "@/lib/format";
import { Input } from "../ui/input";
import { obtenerValorDeducible, obtenerValorSumaAsegurada } from "@/lib/pdf.utils";

export const QuoteSummaryStep = ({ form, setIsStepValid }: StepProps) => {
    const formData = form.getValues();
    const tipoCalculo = formData.tipoCalculo;

    useEffect(() => {
        const validarCampos = async () => {
            const validacionTelefono = await form.trigger("Telefono");
            const validacionCorreo = await form.trigger("Correo");
            const esValido = validacionTelefono && validacionCorreo;

            setIsStepValid?.(esValido);
        };

        const subscription = form.watch((value, { name }) => {
            if (name === "Telefono" || name === "Correo") {
                validarCampos();
            }
        });

        validarCampos();

        return () => subscription.unsubscribe();
    }, [form, setIsStepValid]);

    // Función para formatear fecha
    const formatDate = (dateString: string | Date) => {
        return new Date(dateString).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 md:grid-cols-2"
            >
                {/* Datos del Vehículo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            Datos del Vehículo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Marca</p>
                                <p className="font-medium">{formData.marcaNombre}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Modelo</p>
                                <p className="font-medium">{formData.modeloNombre}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Año</p>
                                <p className="font-medium">{formData.Modelo}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Versión</p>
                                <p className="font-medium">{formData.versionNombre}</p>
                            </div>
                        </div>

                        {formData.VIN && (
                            <Badge variant="secondary" className="gap-1">
                                <Info className="h-3 w-3" />
                                VIN: {formData.VIN}
                            </Badge>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Datos de la Póliza
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Suma Asegurada</p>
                                <p className="font-medium">
                                    {formatCurrency(formData.SumaAsegurada)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Período de Gracia</p>
                                <p className="font-medium">{formData.PeriodoGracia} días</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Vigencia</p>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    Del {formatDate(formData.inicioVigencia)} al{" "}
                                    {formatDate(formData.finVigencia)}
                                </span>
                            </div>
                        </div>

                        {formData.NombrePersona && (
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Asegurado</p>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{formData.NombrePersona}</span>
                                </div>
                            </div>
                        )}

                        {formData.CP && (
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Ubicación</p>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>CP: {formData.CP}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Datos de contacto */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Contact className="h-5 w-5" />
                            Datos de contacto
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="NombrePersona"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del asegurado</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Nombre del asegurado"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Correo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo electrónico</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="correo@ejemplo.com"
                                            type="email"
                                            required
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Telefono"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="10 dígitos"
                                            maxLength={10}
                                            required
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Coberturas Incluidas */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Coberturas Incluidas
                        </CardTitle>
                        <CardDescription>
                            Detalle de las coberturas seleccionadas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cobertura</TableHead>
                                    <TableHead>Suma Asegurada</TableHead>
                                    <TableHead>Deducible</TableHead>
                                    {tipoCalculo !== "fijo" && (
                                        <TableHead>Prima</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.detalles.map((detalle) => {
                                    return (
                                        <TableRow key={detalle.CoberturaID}>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <div className="flex items-center gap-2">
                                                                <span>{detalle.NombreCobertura}</span>
                                                                <Info className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-xs">{detalle.Descripcion}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell>
                                                {obtenerValorSumaAsegurada(detalle)}
                                            </TableCell>
                                            <TableCell>
                                                {obtenerValorDeducible(detalle)}
                                            </TableCell>
                                            {tipoCalculo !== "fijo" && (
                                                <TableCell>
                                                    {formatCurrency(detalle.PrimaCalculada)}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Resumen de Costos */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            {tipoCalculo === "fijo" ? "Monto Fijo" : "Resumen de Costos"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end items-center pt-2">
                            <div className="font-medium mr-5">
                                Costo Total Pago Anual:
                            </div>
                            <span className="text-2xl font-bold text-primary">
                                {formatCurrency(formData.costoTotalAnual)}
                            </span>
                        </div>

                        <div className="flex justify-end items-center pt-2">
                            <div className="font-medium mr-5">
                                Costo Total Pago Semestral:
                            </div>
                            <span className="text-2xl font-bold text-primary">
                                {formatCurrency(formData.costoTotalSemestral)}
                            </span>
                        </div>

                        <div className="flex justify-end items-center pt-2">
                            <div className="font-medium mr-5">
                                Costo Total Pago Trimestral:
                            </div>
                            <span className="text-2xl font-bold text-primary">
                                {formatCurrency(formData.costoTotalTrimestral)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Alertas y Notas */}
            <div className="space-y-4">
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                        Tu cotización está lista para ser procesada. Verifica todos los datos
                        antes de continuar.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
};

export default QuoteSummaryStep;