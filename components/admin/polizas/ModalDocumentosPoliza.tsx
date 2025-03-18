import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getDocumentos } from "@/actions/PolizasActions";
import { iGetDocumentos } from "@/interfaces/CatPolizas";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PropiedadesModalDocumentos {
    abierto: boolean;
    alCerrar: () => void;
    polizaId: number;
}

export const ModalDocumentosPoliza = ({
    abierto,
    alCerrar,
    polizaId
}: PropiedadesModalDocumentos) => {
    const [documentos, setDocumentos] = useState<iGetDocumentos[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const obtenerDocumentos = async () => {
            if (!polizaId) return;
            try {
                const respuesta = await getDocumentos(polizaId);
                if (respuesta) setDocumentos(respuesta);
            } catch (error) {
                console.error("Error al obtener documentos:", error);
            } finally {
                setCargando(false);
            }
        };

        if (abierto) {
            obtenerDocumentos();
        }
    }, [polizaId, abierto]);

    const formatearFecha = (fecha: string | Date) => {
        return format(new Date(fecha), "PPP", { locale: es });
    };

    return (
        <Dialog open={abierto} onOpenChange={alCerrar}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Documentos de la póliza</DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[500px] pr-4">
                    {cargando ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : documentos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {documentos.map((documento) => (
                                <motion.div
                                    key={documento.DocumentoDigitalizadoID}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <FileIcon className="h-4 w-4 text-primary" />
                                                    <h3 className="font-medium">
                                                        {documento.Documento.NombreDocumento}
                                                    </h3>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {documento.Documento.Descripcion}
                                                </p>
                                                <p className="text-sm">
                                                    Fecha: {formatearFecha(documento.FechaCarga)}
                                                </p>
                                                <p className="text-sm">
                                                    Estado: {documento.EstadoDocumento}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                No hay documentos disponibles para esta póliza
                            </AlertDescription>
                        </Alert>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};