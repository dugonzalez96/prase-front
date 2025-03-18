import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendMail } from "@/actions/CotizadorActions";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import { iGetTiposVehiculo, iGetUsosVehiculo } from "@/interfaces/CatVehiculosInterface";
import { generarPDFCotizacion } from "@/components/cotizador/GenerarPDFCotizacion";
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";

const emailSchema = z.object({
    email: z.string().email("Correo electrónico inválido"),
});

interface ReenviarPDFModalProps {
    cotizacion: iGetCotizacion;
    tiposVehiculo: iGetTiposVehiculo[];
    usosVehiculo: iGetUsosVehiculo[];
    abierto: boolean;
    tiposPago: iGetTipoPagos[];
    alCerrar: () => void;
}

export const ReenviarPDFModal = ({
    cotizacion,
    tiposVehiculo,
    usosVehiculo,
    abierto,
    alCerrar,
    tiposPago,
}: ReenviarPDFModalProps) => {
    const [enviando, setEnviando] = useState(false);
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: cotizacion.Correo || "",
        },
    });

    const alEnviar = async (valores: { email: string }) => {
        try {
            setEnviando(true);
            const doc = await generarPDFCotizacion({
                datos: cotizacion,
                tiposVehiculo,
                usosVehiculo,
                isSave: false,
                tiposPago,
            });

            const pdfBase64 = doc.output("datauristring").split(",")[1];
            const body = {
                to: valores.email,
                subject: "Cotización PRASE Seguros",
                attachmentBase64: pdfBase64,
                filename: `cotizacion_${cotizacion.Marca}_${cotizacion.Submarca}.pdf`,
            }

            await sendMail(body);

            toast({
                title: "PDF enviado",
                description: "El PDF se ha enviado correctamente al correo especificado.",
            });

            alCerrar();
        } catch (error) {
            toast({
                title: "Error",
                description: "Hubo un problema al enviar el PDF.",
                variant: "destructive",
            });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Dialog open={abierto} onOpenChange={alCerrar}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reenviar PDF</DialogTitle>
                    <DialogDescription>
                        Ingresa el correo electrónico donde deseas recibir el PDF de la cotización
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(alEnviar)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="correo@ejemplo.com"
                                            disabled={enviando}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={enviando} className="w-full">
                            {enviando ? "Enviando..." : "Enviar PDF"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};