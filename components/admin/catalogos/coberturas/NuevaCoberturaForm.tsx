"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SaveIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { postCobertura } from "@/actions/CatCoberturasActions";
import Loading from "@/app/(protected)/loading";
import { nuevaCoberturaSchema } from "@/schemas/admin/catalogos/catalogosSchemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { iGetTiposMoneda } from "@/interfaces/CatCoberturasInterface";
import { iGetTiposDeducible } from "@/interfaces/CatDeduciblesInterface";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";

export const NuevaCoberturaForm = ({ tiposMoneda, tiposDeducible }: { tiposMoneda: iGetTiposMoneda[], tiposDeducible: iGetTiposDeducible[] }) => {
    const [isPending, startTransition] = useTransition();
    const [showDeducibles, setSetshowDeducibles] = useState(true);
    const [isAmparada, setIsAmparada] = useState(false);
    const [isSinValor, setIsSinValor] = useState(false);
    const [aplicaSumaAsegurada, setAplicaSumaAsegurada] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevaCoberturaSchema>>({
        resolver: zodResolver(nuevaCoberturaSchema),
        defaultValues: {
            NombreCobertura: '',
            Descripcion: '',
            PrimaBase: 0,
            SumaAseguradaMin: 0,
            SumaAseguradaMax: 0,
            DeducibleMin: 0,
            DeducibleMax: 0,
            PorcentajePrima: 0,
            RangoSeleccion: 0,
            IndiceSiniestralidad: false,
            EsCoberturaEspecial: false,
            SinValor: false,
            AplicaSumaAsegurada: false,
            tipoMoneda: 0,
            tipoDeducible: 0,
            CoberturaAmparada: false,
            sumaAseguradaPorPasajero: false,
            primaMinima: 0,
            primaMaxima: 0,
            factorDecrecimiento: 3,
            rangoCobertura: 0,
        },
    });

    const handleTipoDeducibleChange = (idDeducible: string) => {
        form.setValue("tipoDeducible", Number(idDeducible))

        const aplica = tiposDeducible.find(tipo => tipo.TipoDeducibleID === Number(idDeducible))?.Nombre.toLowerCase().includes("no aplica");
        aplica ? setSetshowDeducibles(false) : setSetshowDeducibles(true);
    }

    const handleAmparadaChange = (value: string) => {
        if (value === "true") {
            setIsAmparada(true);
            form.setValue("CoberturaAmparada", true)
            form.setValue("PorcentajePrima", 0)
        } else {
            setIsAmparada(false);
            form.setValue("CoberturaAmparada", false)
        }
    }

    const handleSinValorChange = (value: string) => {
        if (value === "true") {
            setIsSinValor(true);
            form.setValue("SinValor", true)
            form.setValue("PrimaBase", 0)
            form.setValue("PorcentajePrima", 0)

            const mxn = tiposMoneda.find(tipo => tipo.Abreviacion === "MXN")?.TipoMonedaID;
            form.setValue("tipoMoneda", mxn ?? 1)
        } else {
            setIsSinValor(false);
            form.setValue("SinValor", false)
        }
    }

    const handleAplicaSumaChange = (value: string) => {
        if (value === "true") {
            setAplicaSumaAsegurada(true);
            form.setValue("AplicaSumaAsegurada", true)
            form.setValue("SumaAseguradaMin", 0)
            form.setValue("SumaAseguradaMax", 0)
        } else {
            setAplicaSumaAsegurada(false);
            form.setValue("AplicaSumaAsegurada", false)
        }
    }

    const onSubmit = (values: z.infer<typeof nuevaCoberturaSchema>) => {
        const formattedData = {
            ...values,
            tipoDeducible: {
                TipoDeducibleID: values.tipoDeducible,
            },
            tipoMoneda: {
                TipoMonedaID: values.tipoMoneda,
            }
        };

        startTransition(async () => {
            try {
                const resp = await postCobertura(formattedData);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear la cobertura.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Cobertura creada",
                        description: "La cobertura se ha creado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear la cobertura.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            {isPending && <Loading />}
            <div className="bg-white p-6 shadow-md max-w-7xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="NombreCobertura"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre de la cobertura</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Cobertura..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="CoberturaAmparada"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>¿Cobertura Amparada?</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={handleAmparadaChange} defaultValue={field.value ? "true" : "false"}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Sí</SelectItem>
                                                    <SelectItem value="false">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="SinValor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>¿Sin valor?</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={handleSinValorChange} defaultValue={field.value ? "true" : "false"}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Sí</SelectItem>
                                                    <SelectItem value="false">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!isSinValor && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="tipoMoneda"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Moneda</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        defaultValue={field.value ? field.value.toString() : undefined}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccione tipo de moneda..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {tiposMoneda.map((tipo) => (
                                                                <SelectItem key={tipo.TipoMonedaID} value={tipo.TipoMonedaID.toString()}>
                                                                    {tipo.Nombre}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="PrimaBase"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Prima Base</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Prima base de la cobertura.."
                                                        value={formatCurrency(Number(field.value))}
                                                        onChange={(e) => {
                                                            const valor = e.target.value.replace(/[^0-9]/g, "");
                                                            field.onChange((Number(valor) / 100).toString());
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {!isAmparada && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="primaMinima"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tasa Base Mínima(%)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Tasa base mínima..."
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="primaMaxima"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tasa Base Máxima(%)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Tasa base máxima..."
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="factorDecrecimiento"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Factor Decrecimiento</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Factor decrecimiento..."
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="rangoCobertura"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Valor default suma asegurada</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Introduce el valor default para la suma asegurada..."
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}
                                </>
                            )}


                            <FormField
                                control={form.control}
                                name="tipoDeducible"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Deducible</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={handleTipoDeducibleChange}
                                                defaultValue={field.value ? field.value.toString() : undefined}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione tipo de deducible..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tiposDeducible.map((tipo) => (
                                                        <SelectItem key={tipo.TipoDeducibleID} value={tipo.TipoDeducibleID.toString()}>
                                                            {tipo.Nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {showDeducibles && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="DeducibleMin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Deducible Mínimo</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Deducible mínimo..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="DeducibleMax"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Deducible Máximo</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Deducible máximo..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="RangoSeleccion"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Rango de Selección</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Rango de selección..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            <FormField
                                control={form.control}
                                name="AplicaSumaAsegurada"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>¿Aplica suma asegurada?</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={handleAplicaSumaChange} defaultValue={field.value ? "true" : "false"}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Sí</SelectItem>
                                                    <SelectItem value="false">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!aplicaSumaAsegurada && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="SumaAseguradaMin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Suma Asegurada Mínima</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Suma asegurada mínima..."
                                                        value={formatCurrency(Number(field.value))}
                                                        onChange={(e) => {
                                                            const valor = e.target.value.replace(/[^0-9]/g, "");
                                                            field.onChange((Number(valor) / 100).toString());
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="SumaAseguradaMax"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Suma Asegurada Máxima</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Suma asegurada máxima..."
                                                        value={formatCurrency(Number(field.value))}
                                                        onChange={(e) => {
                                                            const valor = e.target.value.replace(/[^0-9]/g, "");
                                                            field.onChange((Number(valor) / 100).toString());
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            <FormField
                                control={form.control}
                                name="sumaAseguradaPorPasajero"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>¿Suma asegurada aplica por pasajero?</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value ? "true" : "false"}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Sí</SelectItem>
                                                    <SelectItem value="false">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Selects para los campos booleanos */}
                            <FormField
                                control={form.control}
                                name="EsCoberturaEspecial"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>¿Seleccionable para cobertura accesoria?</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value ? "true" : "false"}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Sí</SelectItem>
                                                    <SelectItem value="false">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name="Descripcion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripción de la cobertura</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe lo que incluye la cobertura..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={isPending} size="lg" className="mt-8">
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="w-4 h-4 mr-2" />
                                    Guardar
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </>
    );
};
