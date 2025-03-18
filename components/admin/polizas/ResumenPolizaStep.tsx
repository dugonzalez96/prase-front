"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Info, Shield } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import { useCalculosPrima } from "@/hooks/useCalculoPrima";
import { getAjustesCP } from "@/actions/AjustesCP";
import { calcularPrima } from "@/components/cotizador/CalculosPrima";

const resumenSchema = z.object({
    fechaInicio: z.date(),
    fechaFin: z.date(),
    descuentoProntoPago: z.coerce.number().min(0),
    tieneReclamos: z.boolean(),
    tipoPagoID: z.coerce.number().min(1, { message: "El tipo de pago es requerido" }),
    primaTotal: z.number(),
});

interface ResumenPolizaStepProps {
    cotizacion: iGetCotizacion;
    coberturas: iGetCoberturas[];
    alConfirmar: (datos: z.infer<typeof resumenSchema>) => void;
    tiposPago: iGetTipoPagos[];
}

const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

export const ResumenPolizaStep = ({
    cotizacion,
    coberturas,
    alConfirmar,
    tiposPago,
}: ResumenPolizaStepProps) => {

    const [resultadosCalculo, setResultadosCalculo] = useState<{
        total: number;
        ajusteSiniestralidad: number;
        subtotalSiniestralidad: number;
        ajusteTipoPago: number;
        bonificacion: number;
        costoNeto: number;
        iva: number;
        detallesPago: {
            primerPago?: number;
            pagoSubsecuente?: number;
            numeroPagosSubsecuentes?: number;
        };
    }>({
        total: 0,
        ajusteSiniestralidad: 0,
        subtotalSiniestralidad: 0,
        ajusteTipoPago: 0,
        bonificacion: 0,
        costoNeto: 0,
        iva: 0,
        detallesPago: {}
    });

    const { obtenerPagos } = useCalculosPrima();

    const form = useForm<z.infer<typeof resumenSchema>>({
        resolver: zodResolver(resumenSchema),
        defaultValues: {
            fechaInicio: hoy,
            fechaFin: new Date(hoy.getFullYear() + 1, hoy.getMonth(), hoy.getDate()),
            descuentoProntoPago: 0,
            tieneReclamos: false,
            tipoPagoID: 7,
            primaTotal: ((Number(cotizacion.CostoBase) + Number(cotizacion.DerechoPoliza)) * 0.16) + Number(cotizacion.CostoBase),
        },
        mode: "onChange", // Agregar validación en tiempo real
    });
    // Agregar este console.log para ver errores de validación
    console.log('Form Errors:', form.formState.errors);

    const actualizarCalculos = async (tipoPagoId: number) => {
        const tipoPago = tiposPago.find(t => t.TipoPagoID === tipoPagoId);
        if (!tipoPago) return;

        const ajustesCP = await getAjustesCP(cotizacion.CP);

        const resultados = calcularPrima({
            costoBase: cotizacion.CostoBase,
            ajustes: ajustesCP,
            tipoPago,
            bonificacion: Number(cotizacion.PorcentajeDescuento),
            derechoPoliza: Number(cotizacion.DerechoPoliza)
        });

        const detallesPago = tipoPago.Divisor > 1 ? obtenerPagos(
            resultados.costoNeto,
            tipoPago,
            Number(cotizacion.DerechoPoliza)
        ) : null;

        setResultadosCalculo({
            ...resultados,
            detallesPago: detallesPago || {}
        });
    };

    useEffect(() => {
        const subscription = form.watch((valor, { name }) => {
            if (name === "descuentoProntoPago") {
                const tipoPagoId = form.getValues("tipoPagoID");
                if (tipoPagoId) {
                    actualizarCalculos(tipoPagoId);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [form]);

    useEffect(() => {
        actualizarCalculos(7);
    }, []);

    const obtenerNombreCobertura = (coberturaId: number): string => {
        const cobertura = coberturas?.find(c => c.CoberturaID === coberturaId);
        return cobertura?.NombreCobertura || `Cobertura ${coberturaId}`;
    };

    const onSubmit = (datos: z.infer<typeof resumenSchema>) => {
        console.log('Form Submitted:', datos); // Verificar los datos enviados
        try {
            const datosCompletos = {
                ...datos,
                primaTotal: resultadosCalculo.total
            };
            console.log('Datos Completos:', datosCompletos);

            // Add these logs
            console.log('Executing alConfirmar...');
            alConfirmar(datosCompletos);
            console.log('alConfirmar executed successfully');
        } catch (error) {
            console.error('Error en submit:', error); // Capturar cualquier error
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Fechas y datos adicionales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="fechaInicio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de inicio</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                            onChange={e => field.onChange(new Date(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fechaFin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de fin</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                            onChange={e => field.onChange(new Date(e.target.value))}
                                            min={form.getValues("fechaInicio").toISOString().split('T')[0]}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="descuentoProntoPago"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descuento por pronto pago</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={formatCurrency(field.value)}
                                            onChange={(e) => {
                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                field.onChange(Number(valor) / 100);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tieneReclamos"
                            render={({ field }) => (
                                <FormItem className="flex items-end space-x-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel>Tiene reclamos previos</FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos del Vehículo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm">
                                <span className="text-muted-foreground">Marca:</span>{" "}
                                {cotizacion.Marca}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Submarca:</span>{" "}
                                {cotizacion.Submarca}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Modelo:</span>{" "}
                                {cotizacion.Modelo}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Versión:</span>{" "}
                                {cotizacion.Version}
                            </p>
                            {cotizacion.VIN && (
                                <p className="text-sm">
                                    <span className="text-muted-foreground">VIN:</span>{" "}
                                    {cotizacion.VIN}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Datos de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm">
                                <span className="text-muted-foreground">Cliente:</span>{" "}
                                {cotizacion.NombrePersona}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Teléfono:</span>{" "}
                                {cotizacion.Telefono}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Email:</span>{" "}
                                {cotizacion.Correo}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Coberturas Incluidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cobertura</TableHead>
                                    <TableHead>Suma Asegurada</TableHead>
                                    <TableHead>Deducible</TableHead>
                                    <TableHead>Prima</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cotizacion.detalles.map((detalle) => {

                                    return (
                                        <TableRow key={detalle.DetalleID}>
                                            <TableCell>{obtenerNombreCobertura(detalle.CoberturaID)}</TableCell>
                                            <TableCell>
                                                {detalle.MontoSumaAsegurada === '0' ? 'AMPARADA' : formatCurrency(Number(detalle.MontoSumaAsegurada))}
                                            </TableCell>
                                            <TableCell>{detalle.MontoDeducible === '0' ? 'NO APLICA' : `${detalle.MontoDeducible}%`}</TableCell>
                                            <TableCell>
                                                {formatCurrency(Number(detalle.PrimaCalculada))}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pago</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="tipoPagoID"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de pago</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={(valor) => {
                                                field.onChange(Number(valor));
                                                actualizarCalculos(Number(valor));
                                            }}
                                            value={field.value?.toString()}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona tipo de pago..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tiposPago.map(tipo => (
                                                    <SelectItem
                                                        key={tipo.TipoPagoID}
                                                        value={tipo.TipoPagoID.toString()}
                                                    >
                                                        {tipo.Descripcion}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Resumen de Pagos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Costo Base:</span>
                            <span>{formatCurrency(cotizacion.CostoBase)}</span>
                        </div>

                        {resultadosCalculo.ajusteSiniestralidad > 0 && (
                            <div className="flex justify-between items-center text-amber-600">
                                <span>Ajuste por siniestralidad:</span>
                                <span>+{formatCurrency(resultadosCalculo.ajusteSiniestralidad)}</span>
                            </div>
                        )}

                        {resultadosCalculo.bonificacion > 0 && (
                            <div className="flex justify-between items-center text-green-600">
                                <span>Bonificación:</span>
                                <span>-{formatCurrency(resultadosCalculo.bonificacion)}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span>Costo Neto:</span>
                            <span>{formatCurrency(resultadosCalculo.costoNeto)}</span>
                        </div>

                        {resultadosCalculo.ajusteTipoPago > 0 && (
                            <div className="flex justify-between items-center text-amber-600">
                                <span>Ajuste por tipo de pago:</span>
                                <span>+{formatCurrency(resultadosCalculo.ajusteTipoPago)}</span>
                            </div>
                        )}


                        <div className="flex justify-between items-center">
                            <span>Derecho de Póliza:</span>
                            <span>+{formatCurrency(Number(cotizacion.DerechoPoliza))}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span>IVA (16%):</span>
                            <span>{formatCurrency(resultadosCalculo.iva)}</span>
                        </div>

                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between font-semibold">
                                <span>Total:</span>
                                <span className="text-primary">
                                    {formatCurrency(resultadosCalculo.total)}
                                </span>
                            </div>
                        </div>

                        {resultadosCalculo.detallesPago.primerPago && (
                            <>
                                <div className="flex justify-between items-center">
                                    <span>Primer pago:</span>
                                    <span>{formatCurrency(resultadosCalculo.detallesPago.primerPago)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>{resultadosCalculo.detallesPago.numeroPagosSubsecuentes} pagos subsecuentes:</span>
                                    <span>{formatCurrency(resultadosCalculo.detallesPago.pagoSubsecuente || 0)}</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Revisa cuidadosamente todos los detalles antes de activar la póliza.
                        Esta acción no se puede deshacer.
                    </AlertDescription>
                </Alert>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        className="gap-2"
                        onClick={() => console.log('Button clicked')}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Activar Póliza
                    </Button>
                </div>
            </form>
        </Form>
    );
};