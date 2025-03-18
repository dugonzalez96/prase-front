import { useState } from "react";
import { Download, Mail, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMail } from "@/actions/CotizadorActions";

interface PropiedadesVistaPrevia {
    pdfBase64: string;
    abierto: boolean;
    alCerrar: () => void;
    numeroPoliza: string;
}

export const VistaTicketModal = ({
    pdfBase64,
    abierto,
    alCerrar,
    numeroPoliza
}: PropiedadesVistaPrevia) => {
    const [mostrarFormularioCorreo, setMostrarFormularioCorreo] = useState(false);
    const [correo, setCorreo] = useState("");
    const { toast } = useToast();

    const descargarPDF = () => {
        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const archivo = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(archivo);
        const link = document.createElement('a');

        link.href = url;
        link.download = `ticket_pago_${numeroPoliza}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const enviarCorreo = async () => {
        if (!correo) return;

        try {
            await sendMail({
                to: correo,
                subject: "Ticket de Pago PRASE Seguros",
                attachmentBase64: pdfBase64,
                filename: `ticket_pago_${numeroPoliza}.pdf`
            });

            toast({
                title: "Correo enviado",
                description: "El ticket se ha enviado correctamente al correo especificado.",
            });

            setMostrarFormularioCorreo(false);
            setCorreo("");
        } catch (error) {
            toast({
                title: "Error",
                description: "Hubo un problema al enviar el correo.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={abierto} onOpenChange={alCerrar}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader className="flex-none">
                    <DialogTitle>Vista Previa del Ticket</DialogTitle>
                    <DialogClose className="absolute right-4 top-4">
                        <X className="h-4 w-4" />
                    </DialogClose>
                </DialogHeader>

                <div className="flex-1 relative min-h-0">
                    <iframe
                        src={`data:application/pdf;base64,${pdfBase64}`}
                        className="absolute inset-0 w-full h-full"
                        title="Vista previa del ticket"
                    />
                </div>

                <div className="flex-none pt-4 space-y-4">
                    {mostrarFormularioCorreo ? (
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                            <Button onClick={enviarCorreo}>Enviar</Button>
                            <Button
                                variant="outline"
                                onClick={() => setMostrarFormularioCorreo(false)}
                            >
                                Cancelar
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setMostrarFormularioCorreo(true)}>
                                <Mail className="w-4 h-4 mr-2" />
                                Enviar por correo
                            </Button>
                            <Button onClick={descargarPDF}>
                                <Download className="w-4 h-4 mr-2" />
                                Descargar
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VistaTicketModal;