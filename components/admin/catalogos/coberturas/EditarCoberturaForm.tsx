"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { SaveIcon, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { patchCobertura } from "@/actions/CatCoberturasActions";
import { iGetCoberturas, iGetTiposMoneda } from "@/interfaces/CatCoberturasInterface";
import { editCoberturaSchema } from "@/schemas/admin/catalogos/catalogosSchemas";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { iGetTiposDeducible } from "@/interfaces/CatDeduciblesInterface";

interface EditarCoberturaFormProps {
    cobertura: iGetCoberturas;
    onSave: () => void;
    tiposMoneda: iGetTiposMoneda[];
    tiposDeducible: iGetTiposDeducible[];
}

export const EditarCoberturaForm = ({ cobertura, onSave, tiposMoneda, tiposDeducible }: EditarCoberturaFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editCoberturaSchema>>({
        resolver: zodResolver(editCoberturaSchema),
        defaultValues: {
            NombreCobertura: cobertura.NombreCobertura,
            Descripcion: cobertura.Descripcion,
            PrimaBase: cobertura.PrimaBase,
            SumaAseguradaMin: cobertura.SumaAseguradaMin,
            SumaAseguradaMax: cobertura.SumaAseguradaMax,
            DeducibleMin: cobertura.DeducibleMin,
            DeducibleMax: cobertura.DeducibleMax,
            PorcentajePrima: cobertura.PorcentajePrima,
            RangoSeleccion: cobertura.RangoSeleccion,
            EsCoberturaEspecial: cobertura.EsCoberturaEspecial,
            Variable: cobertura.Variable,
            SinValor: cobertura.SinValor,
            AplicaSumaAsegurada: cobertura.AplicaSumaAsegurada,
            CoberturaAmparada: cobertura.CoberturaAmparada,
            sumaAseguradaPorPasajero: cobertura.sumaAseguradaPorPasajero,
            primaMinima: cobertura.primaMinima || "",
            primaMaxima: cobertura.primaMaxima || "",
            factorDecrecimiento: cobertura.factorDecrecimiento || "",
            rangoCobertura: cobertura.rangoCobertura || "",
            tipoMoneda: cobertura.tipoMoneda.TipoMonedaID,
            tipoDeducible: cobertura.tipoDeducible.TipoDeducibleID
        },
    });

    const onSubmit = (values: z.infer<typeof editCoberturaSchema>) => {
        const formattedData = {
            ...values,
            tipoDeducible: {
                TipoDeducibleID: values.tipoDeducible
            },
            tipoMoneda: {
                TipoMonedaID: values.tipoMoneda
            }
        };

        startTransition(async () => {
            try {
                const resp = await patchCobertura(cobertura.CoberturaID, formattedData);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar la cobertura.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Cobertura actualizada",
                        description: "La cobertura se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar la cobertura.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="NombreCobertura"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre de la cobertura</FormLabel>
                                <FormControl>
                                    <Input placeholder="Cobertura..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="Descripcion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                    <Input placeholder="Descripción de la cobertura..." {...field} />
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
                                        placeholder="Prima base de la cobertura..."
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
                    <FormField
                        control={form.control}
                        name="DeducibleMin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Deducible Mínimo</FormLabel>
                                <FormControl>
                                    <Input placeholder="Deducible mínimo..." {...field} />
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
                                    <Input placeholder="Deducible máximo..." {...field} />
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
                                    <Input placeholder="Rango de selección..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="primaMinima"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tasa Base Mínima (%)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Prima mínima..." {...field} />
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
                                <FormLabel>Tasa Base Máxima (%)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Prima máxima..." {...field} />
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
                                <FormLabel>Factor de decrecimiento</FormLabel>
                                <FormControl>
                                    <Input placeholder="Factor de decrecimiento..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="EsCoberturaEspecial"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>¿Es cobertura especial?</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        defaultValue={field.value ? "true" : "false"}
                                    >
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
                        name="Variable"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>¿Es variable?</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        defaultValue={field.value ? "true" : "false"}
                                    >
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
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        defaultValue={field.value ? "true" : "false"}
                                    >
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
                        name="AplicaSumaAsegurada"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>¿Aplica suma asegurada?</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        defaultValue={field.value ? "true" : "false"}
                                    >
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
                        name="CoberturaAmparada"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>¿Cobertura Amparada?</FormLabel>
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

                    <FormField
                        control={form.control}
                        name="rangoCobertura"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor default suma asegurada</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Introduce el valor default para la suma asegurada..."
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
                        name="tipoMoneda"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Moneda</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value.toString()}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione tipo de moneda" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tiposMoneda.map((tipo) => (
                                                <SelectItem
                                                    key={tipo.TipoMonedaID}
                                                    value={tipo.TipoMonedaID.toString()}
                                                >
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
                        name="tipoDeducible"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Deducible</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value.toString()}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione tipo de deducible" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tiposDeducible.map((tipo) => (
                                                <SelectItem
                                                    key={tipo.TipoDeducibleID}
                                                    value={tipo.TipoDeducibleID.toString()}
                                                >
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
    );
};
