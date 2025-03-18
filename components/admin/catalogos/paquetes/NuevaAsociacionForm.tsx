"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { postAsociarPaqueteCobertura } from "@/actions/CatPaquetesActions";
import { iGetAllPaquetes } from "@/interfaces/CatPaquetesInterface";
import { nuevaAsociacionSchema } from "@/schemas/admin/catalogos/catalogosSchemas";
import { Loader2, SaveIcon } from "lucide-react";
import Loading from "@/app/(protected)/loading";
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";

interface NuevaAsociacionFormProps {
    paquetes: iGetAllPaquetes[];
    coberturas: iGetCoberturas[];
}

export const NuevaAsociacionForm = ({ paquetes, coberturas }: NuevaAsociacionFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    // Inicializar el formulario sin coberturas seleccionadas por defecto
    const form = useForm<z.infer<typeof nuevaAsociacionSchema>>({
        resolver: zodResolver(nuevaAsociacionSchema),
        defaultValues: {
            paqueteId: paquetes[0]?.PaqueteCoberturaID ?? 0,
            coberturas: [], // Inicia vacío
        },
    });

    const selectedCoberturas = form.watch("coberturas");

    // Actualiza `obligatoria` cuando cambia el Switch
    const handleObligatoriaChange = (id: number, obligatoria: boolean) => {
        const updatedCoberturas = selectedCoberturas.map((cobertura) =>
            cobertura.CoberturaID === id ? { ...cobertura, obligatoria } : cobertura
        );
        form.setValue("coberturas", updatedCoberturas);
    };

    // Agregar o quitar coberturas seleccionadas en función del Checkbox
    const handleCoberturaSelectionChange = (id: number, selected: boolean) => {
        const updatedCoberturas = selected
            ? [...selectedCoberturas, { CoberturaID: id, obligatoria: false }]
            : selectedCoberturas.filter((cobertura) => cobertura.CoberturaID !== id);

        form.setValue("coberturas", updatedCoberturas);
    };

    const onSubmit = (values: z.infer<typeof nuevaAsociacionSchema>) => {
        // console.log(values);

        startTransition(async () => {
            const { paqueteId, coberturas } = values;

            try {
                const body = { coberturas };
                const response = await postAsociarPaqueteCobertura(paqueteId, body);

                if (!response) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear la asociación.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Asociación creada",
                        description: "La asociación se ha creado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear la asociación.",
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="paqueteId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Selecciona un paquete</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un paquete" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {paquetes.map((paquete) => (
                                                    <SelectItem key={paquete.PaqueteCoberturaID} value={paquete.PaqueteCoberturaID.toString()}>
                                                        {paquete.NombrePaquete}
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
                            name="coberturas"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Selecciona Coberturas</FormLabel>
                                    <FormControl>
                                        <div className="space-y-4">
                                            {coberturas.map((cobertura) => {
                                                const isSelected = selectedCoberturas.some((selected) => selected.CoberturaID === cobertura.CoberturaID);
                                                const coberturaData = selectedCoberturas.find((selected) => selected.CoberturaID === cobertura.CoberturaID);

                                                return (
                                                    <div key={cobertura.CoberturaID} className="flex items-center gap-4">
                                                        <Checkbox
                                                            id={cobertura.CoberturaID.toString()}
                                                            checked={isSelected}
                                                            onCheckedChange={(selected) =>
                                                                handleCoberturaSelectionChange(cobertura.CoberturaID, selected as boolean)
                                                            }
                                                        />
                                                        <label htmlFor={cobertura.CoberturaID.toString()}>
                                                            {cobertura.NombreCobertura}
                                                        </label>
                                                        {isSelected && (
                                                            <div className="ml-4 flex items-center gap-3 bg-gray-200/80 px-8 py-2 rounded-full">
                                                                <FormLabel>Obligatoria</FormLabel>
                                                                <Switch
                                                                    checked={coberturaData?.obligatoria || false}
                                                                    onCheckedChange={(obligatoria) =>
                                                                        handleObligatoriaChange(cobertura.CoberturaID, obligatoria as boolean)
                                                                    }
                                                                    disabled={!isSelected}
                                                                />
                                                            </div>
                                                        )}

                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isPending} size="lg">
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
