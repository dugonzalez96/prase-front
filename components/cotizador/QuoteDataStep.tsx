"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StepProps } from "@/types/cotizador";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Info } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";
import { Calendar } from "../ui/calendar";

export const QuoteDataStep = ({
    form,
    tiposSumas,
    setIsStepValid,
}: StepProps) => {
    const vigencia = form.watch("vigencia");
    const meses = form.watch("meses");
    const inicioVigencia = form.watch("inicioVigencia");
    const modelo = form.watch("Modelo");
    const tipoSumaAsegurada = form.watch("TipoSumaAseguradaID");
    const sumaAsegurada = form.watch("SumaAsegurada");

    const getNextMonthDate = (date: Date, monthsToAdd: number) => {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + monthsToAdd);
        return newDate;
    };

    const updateFinVigencia = () => {
        if (!inicioVigencia) return;

        const monthsToAdd = vigencia === "Anual" ? 12 : (meses || 1);
        const startDate = new Date(inicioVigencia);
        const endDate = getNextMonthDate(startDate, monthsToAdd);

        form.setValue("finVigencia", endDate.toISOString().split('T')[0], {
            shouldValidate: true
        });
    };

    const validarSumaAsegurada = () => {
        const tipoSuma = tiposSumas?.find(t => t.TipoSumaAseguradaID === tipoSumaAsegurada);
        const valorSumaAsegurada = Number(sumaAsegurada);
        const minSumaAsegurada = Number(form.getValues("minSumaAsegurada"));
        const maxSumaAsegurada = Number(form.getValues("maxSumaAsegurada"));

        // Si no hay tipo de suma seleccionado o es valor factura, la validación pasa
        if (!tipoSuma || tipoSuma.NombreTipo === "Valor Factura") {
            return true;
        }

        // Para valor comercial
        if (tipoSuma.NombreTipo === "Valor Comercial") {
            return true; // Siempre pasa porque el campo está disabled
        }

        // Solo validamos rango para valor convenido
        if (tipoSuma.NombreTipo.toLowerCase() === "valor convenido") {
            const minPermitido = maxSumaAsegurada * 0.5;
            const maxPermitido = maxSumaAsegurada * 1.5;

            return valorSumaAsegurada >= minPermitido && valorSumaAsegurada <= maxPermitido;
        }

        return true;
    };

    const validarCampos = async () => {
        const fieldsToValidate = [
            "inicioVigencia",
            "vigencia",
            "meses",
            "TipoSumaAseguradaID",
            "SumaAsegurada",
            "PeriodoGracia",
        ] as const;

        const results = await Promise.all(
            fieldsToValidate.map(field => form.trigger(field))
        );

        const isValid = results.every(Boolean) && validarSumaAsegurada();

        setIsStepValid?.(isValid);
    };

    useEffect(() => {
        if (!inicioVigencia) {
            const today = new Date();
            form.setValue("inicioVigencia", today, { shouldValidate: true });
            form.setValue("vigencia", "Anual", { shouldValidate: true });
            form.setValue("meses", 12, { shouldValidate: true });

            const initialEndDate = getNextMonthDate(today, 12);
            form.setValue("finVigencia", initialEndDate.toISOString().split('T')[0], {
                shouldValidate: true
            });
        }

        validarCampos();
    }, []);

    useEffect(() => {
        updateFinVigencia();
    }, [inicioVigencia, vigencia, meses]);

    useEffect(() => {
        const subscription = form.watch(() => {
            validarCampos();
        });

        return () => subscription.unsubscribe();
    }, [form.watch]);

    useEffect(() => {
        if (tipoSumaAsegurada === 2) {
            const minSumaAsegurada = Number(form.getValues("minSumaAsegurada"));
            form.setValue("SumaAsegurada", minSumaAsegurada, { shouldValidate: true });
        }
    }, [tipoSumaAsegurada]);

    const tiposSumasDisponibles = tiposSumas?.filter(tipo => {
        if (tipo.NombreTipo === "Valor Factura") {
            const modeloAnio = Number(modelo);
            const anioActual = new Date().getFullYear();
            return modeloAnio >= anioActual - 1;
        }
        return true;
    });

    const obtenerMensajeSumaAsegurada = () => {
        const tipoSuma = tiposSumas?.find(t => t.TipoSumaAseguradaID === tipoSumaAsegurada);
        const maxSumaAsegurada = Number(form.getValues("maxSumaAsegurada"));

        if (!tipoSuma || tipoSuma.NombreTipo === "Valor Factura") {
            return null;
        }

        if (tipoSuma.NombreTipo === "Valor convenido") {
            return `Rango permitido ${formatCurrency(maxSumaAsegurada * 0.5)} - ${formatCurrency(maxSumaAsegurada * 1.5)}`;
        }

        return null;
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-2 bg-primary/5 rounded-lg p-4"
            >
                <h4 className="font-semibold mb-2">Valor del vehículo</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Valor venta</p>
                        <p className="text-lg font-medium">
                            {formatCurrency(form.getValues("maxSumaAsegurada"))}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Valor compra</p>
                        <p className="text-lg font-medium">
                            {formatCurrency(form.getValues("minSumaAsegurada"))}
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <FormField
                    control={form.control}
                    name="DerechoPoliza"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Derecho de póliza</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={formatCurrency(field.value)}
                                    readOnly
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="vigencia"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vigencia</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    const newMeses = value === "Anual" ? 12 : 1;
                                    form.setValue("meses", newMeses, { shouldValidate: true });
                                    updateFinVigencia();
                                }}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona vigencia" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Anual">Anual</SelectItem>
                                    <SelectItem value="Por meses">Por meses</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {vigencia === "Por meses" && (
                    <FormField
                        control={form.control}
                        name="meses"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de meses</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        const numValue = Number(value);
                                        field.onChange(numValue);
                                        updateFinVigencia();
                                    }}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona meses" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                                            <SelectItem key={mes} value={mes.toString()}>
                                                {mes} {mes === 1 ? "mes" : "meses"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="inicioVigencia"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Inicio de vigencia</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP", { locale: es })
                                            ) : (
                                                <span>Selecciona una fecha</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                            field.onChange(date);
                                            updateFinVigencia();
                                        }}
                                        disabled={(date) =>
                                            date < new Date()
                                        }
                                        initialFocus
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="finVigencia"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fin de vigencia</FormLabel>
                            <FormControl>
                                <Input {...field} type="date" disabled />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="TipoSumaAseguradaID"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de suma asegurada</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(Number(value));
                                }}
                                value={field.value?.toString()}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona tipo de suma" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {tiposSumasDisponibles?.map((tipo) => (
                                        <SelectItem
                                            key={tipo.TipoSumaAseguradaID}
                                            value={tipo.TipoSumaAseguradaID.toString()}
                                        >
                                            {tipo.NombreTipo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="SumaAsegurada"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Suma asegurada</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={formatCurrency(Number(field.value))}
                                    onChange={(e) => {
                                        const valor = e.target.value.replace(/[^0-9]/g, "");
                                        const valorNumerico = Number(valor) / 100;
                                        field.onChange(valorNumerico);
                                    }}
                                    disabled={tipoSumaAsegurada === 2}
                                />
                            </FormControl>
                            {obtenerMensajeSumaAsegurada() && (
                                <div className="text-sm text-muted-foreground">
                                    {obtenerMensajeSumaAsegurada()}
                                </div>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="PeriodoGracia"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Período de gracia</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value?.toString()}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona período" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Array.from({ length: 28 }, (_, i) => i + 3).map((dia) => (
                                        <SelectItem key={dia} value={dia.toString()}>
                                            {dia} días
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </motion.div>

            {!validarSumaAsegurada() &&
                tipoSumaAsegurada === 4 &&
                obtenerMensajeSumaAsegurada() && (
                    <Alert variant="destructive">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            {obtenerMensajeSumaAsegurada()}
                        </AlertDescription>
                    </Alert>
                )}
        </div>
    );
};

export default QuoteDataStep;