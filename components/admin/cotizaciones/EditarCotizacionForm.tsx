import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SaveIcon, Info } from "lucide-react";
import { iGetCotizacion, iPatchCotizacion } from "@/interfaces/CotizacionInterface";
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";
import { editarCotizacionSchema } from "@/schemas/cotizadorSchema";
import { patchCotizacion } from "@/actions/CotizadorActions";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import { valorUMA } from "@/lib/constants";

interface Props {
    cotizacion: iGetCotizacion;
    coberturas: iGetCoberturas[];
    onGuardar: () => void;
    tiposPago: iGetTipoPagos[];
}

export const EditarCotizacionForm = ({ cotizacion, coberturas, onGuardar, tiposPago }: Props) => {
    const { toast } = useToast();

    const estadosCotizacion = [
        'REGISTRO',
        'ACEPTADA',
    ] as const;

    const form = useForm<iPatchCotizacion>({
        resolver: zodResolver(editarCotizacionSchema),
        defaultValues: {
            NombrePersona: cotizacion.NombrePersona ?? "",
            EstadoCotizacion: cotizacion.EstadoCotizacion ?? "",
            TipoPagoID: Number(cotizacion.TipoPagoID) ?? 0,
            PorcentajeDescuento: Number(cotizacion.PorcentajeDescuento) ?? 0,
            DerechoPoliza: Number(cotizacion.DerechoPoliza),
            Marca: cotizacion.Marca,
            Submarca: cotizacion.Submarca,
            Modelo: cotizacion.Modelo,
            Version: cotizacion.Version,
            detalles: cotizacion.detalles.map(detalle => ({
                DetalleID: Number(detalle.DetalleID),
                PolizaID: detalle.PolizaID ?? null,
                CoberturaID: Number(detalle.CoberturaID) ?? 0,
                MontoSumaAsegurada: Number(detalle.MontoSumaAsegurada) ?? 0,
                MontoDeducible: Number(detalle.MontoDeducible) ?? 0,
                PrimaCalculada: Number(detalle.PrimaCalculada) ?? 0,
                EsPoliza: null,
                PorcentajePrimaAplicado: Number(detalle.PorcentajePrimaAplicado) ?? 0,
                ValorAseguradoUsado: Number(detalle.ValorAseguradoUsado) ?? 0,
            }))
        },
    });

    const obtenerCobertura = (coberturaId: number) =>
        coberturas.find(c => c.CoberturaID === coberturaId);

    const calcularPrimaCobertura = (detalle: typeof cotizacion.detalles[0], cobertura: iGetCoberturas) => {
        if (cobertura.CoberturaAmparada || cobertura.PrimaBase !== "0") {
            return Number(cobertura.PrimaBase);
        }

        const sumaAsegurada = Number(detalle.MontoSumaAsegurada);
        const deducible = Number(detalle.MontoDeducible);
        const porcentajePrima = Number(cobertura.PorcentajePrima) / 100;

        const primaBase = sumaAsegurada * porcentajePrima;

        if (cobertura.tipoDeducible.Nombre === "UMA") {
            const deduciblePesos = deducible * valorUMA;
            return Math.max(0, primaBase - deduciblePesos);
        }

        return primaBase * (1 - deducible / 100);
    };

    const calcularPrimaTotal = () => {
        const detalles = form.getValues("detalles") || [];
        return detalles.reduce((total, detalle) => {
            const cobertura = obtenerCobertura(detalle.CoberturaID);
            if (!cobertura) return total;
            return total + Number(detalle.PrimaCalculada);
        }, 0);
    };

    const actualizarPrimaCobertura = (index: number, detalle: any) => {
        const cobertura = obtenerCobertura(detalle.CoberturaID);
        if (!cobertura) return;

        const nuevaPrima = calcularPrimaCobertura(detalle, cobertura);
        form.setValue(`detalles.${index}.PrimaCalculada`, nuevaPrima);
    };

    const obtenerRangosDeducible = (cobertura: iGetCoberturas) => {
        const min = Number(cobertura.DeducibleMin);
        const max = Number(cobertura.DeducibleMax);
        const rango = Number(cobertura.RangoSeleccion);

        if (rango === 0 || min === max) return [min];

        const rangos = [];
        for (let valor = min; valor <= max; valor += rango) {
            rangos.push(valor);
        }
        return rangos;
    };

    const onSubmit = async (valores: iPatchCotizacion) => {
        // console.log(valores)
        try {
            const primaTotal = calcularPrimaTotal();
            const datosActualizados = {
                ...valores,
                PrimaTotal: primaTotal,
                detalles: valores.detalles
            };

            const respuesta = await patchCotizacion(cotizacion.CotizacionID, datosActualizados);

            if (!respuesta) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar la cotización.",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Cotización actualizada",
                description: "La cotización se ha actualizado exitosamente.",
            });

            onGuardar();
        } catch (error) {
            toast({
                title: "Error",
                description: "Hubo un problema al actualizar la cotización.",
                variant: "destructive",
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="NombrePersona"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del Cliente</FormLabel>
                                <FormControl>
                                    <input
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="EstadoCotizacion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estado de la Cotización</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un estado" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {estadosCotizacion.map((estado) => (
                                            <SelectItem key={estado} value={estado}>
                                                {estado}
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
                        name="TipoPagoID"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Pago</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione tipo de pago" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {tiposPago.map((tipo) => (
                                            <SelectItem
                                                key={tipo.TipoPagoID}
                                                value={tipo.TipoPagoID.toString()}
                                            >
                                                {tipo.Descripcion}
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
                        name="PorcentajeDescuento"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Porcentaje de Descuento</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="DerechoPoliza"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Derecho de Póliza</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                        disabled
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="Marca"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Marca</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="Submarca"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Submarca</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="Modelo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Modelo</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="Version"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Versión</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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
                        {form.watch("detalles")?.map((detalle, index) => {
                            const cobertura = obtenerCobertura(detalle.CoberturaID);
                            if (!cobertura) return null;

                            return (
                                <TableRow key={detalle.CoberturaID}>
                                    <TableCell>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger className="flex items-center gap-2">
                                                    <span>{cobertura.NombreCobertura}</span>
                                                    <Info className="h-4 w-4 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">{cobertura.Descripcion}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell>
                                        {cobertura.AplicaSumaAsegurada ? (
                                            <Input
                                                type="number"
                                                value={detalle.MontoSumaAsegurada}
                                                onChange={(e) => {
                                                    const valor = Number(e.target.value);
                                                    form.setValue(`detalles.${index}.MontoSumaAsegurada`, valor);
                                                    actualizarPrimaCobertura(index, {
                                                        ...detalle,
                                                        MontoSumaAsegurada: e.target.value
                                                    });
                                                }}
                                            />
                                        ) : (
                                            formatCurrency(Number(detalle.MontoSumaAsegurada))
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {cobertura.tipoDeducible.Nombre !== "NO APLICA DEDUCIBLE" ? (
                                            <Select
                                                value={detalle.MontoDeducible.toString()}
                                                onValueChange={(valor) => {
                                                    const nuevoValor = Number(valor);
                                                    form.setValue(`detalles.${index}.MontoDeducible`, nuevoValor);
                                                    actualizarPrimaCobertura(index, {
                                                        ...detalle,
                                                        MontoDeducible: valor
                                                    });
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {obtenerRangosDeducible(cobertura).map((valor) => (
                                                        <SelectItem key={valor} value={valor.toString()}>
                                                            {cobertura.tipoDeducible.Nombre === "UMA"
                                                                ? `${valor} UMAS`
                                                                : `${valor}%`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            "No aplica"
                                        )}
                                    </TableCell>
                                    <TableCell>{formatCurrency(Number(detalle.PrimaCalculada))}</TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold">
                                Prima Total:
                            </TableCell>
                            <TableCell className="font-bold">
                                {formatCurrency(calcularPrimaTotal())}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Button type="submit">
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Guardar
                </Button>
            </form>
        </Form>
    );
};

export default EditarCotizacionForm;