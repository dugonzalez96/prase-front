import { useState, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { postGenerarCodigo } from "@/actions/MovimientosActions";
import { Loader2, KeyRound } from "lucide-react";

interface PropiedadesGenerarCodigo {
    abierto: boolean;
    alCerrar: () => void;
}

export default function GenerarCodigoModal({ abierto, alCerrar }: PropiedadesGenerarCodigo) {
    const [idTransaccion, setIdTransaccion] = useState("");
    const [codigo, setCodigo] = useState("");
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const generarCodigo = async () => {
        if (!idTransaccion) {
            toast({
                title: "Error",
                description: "Debes ingresar un ID de transacción",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            try {
                const respuesta = await postGenerarCodigo(Number(idTransaccion));

                if (!respuesta) {
                    toast({
                        title: "Error",
                        description: "Error al generar el código",
                        variant: "destructive",
                    });
                    return;
                }

                setCodigo(respuesta.codigo);
                toast({
                    title: "Éxito",
                    description: "Código generado correctamente",
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Error al generar el código",
                    variant: "destructive",
                });
            }
        })
    };

    const handleCerrar = () => {
        setCodigo("");
        setIdTransaccion("");
        alCerrar();
    }

    return (
        <Dialog open={abierto} onOpenChange={handleCerrar}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Generar Código de Autorización</DialogTitle>
                    <DialogDescription>
                        Ingresa el ID de la transacción proporcionado por el empleado para generar un código de autorización.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="ID de transacción"
                            value={idTransaccion}
                            onChange={(e) => setIdTransaccion(e.target.value)}
                        />
                        <Button
                            onClick={generarCodigo}
                            disabled={isPending}
                        >
                            <KeyRound className="w-4 h-4 mr-2" />
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : codigo ? (
                                "Generar nuevo código"
                            ) : (
                                "Generar código"
                            )}
                        </Button>
                    </div>

                    {codigo && (
                        <div className="bg-muted p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-lg font-semibold justify-center">
                                <KeyRound className="h-5 w-5 text-primary" />
                                <span>Código generado:</span>
                            </div>
                            <p className="text-4xl text-center font-mono mt-2">{codigo}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}