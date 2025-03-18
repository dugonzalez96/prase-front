import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Files, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentosPolizaStep } from "./DocumentosPolizaStep";
import { postDocumento } from "@/actions/PolizasActions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Loading from "@/app/(protected)/loading";
import { ModalDocumentosPoliza } from "./ModalDocumentosPoliza";

interface PropiedadesDocumentosPoliza {
    polizaId: number;
    tieneDocumentos: boolean;
}

interface ArchivosBase64 {
    ine?: string;
    tarjetaCirculacion?: string;
    cartaFactura?: string;
    comprobanteDomicilio?: string;
    fotoFrontal?: string;
    fotoTrasera?: string;
    fotoLateralIzquierda?: string;
    fotoLateralDerecha?: string;
    fotoVIN?: string;
}

export const DocumentosPoliza = ({
    polizaId,
    tieneDocumentos
}: PropiedadesDocumentosPoliza) => {
    const [modalCargaAbierto, setModalCargaAbierto] = useState(false);
    const [modalVisualizacionAbierto, setModalVisualizacionAbierto] = useState(false);
    const [cargando, setCargando] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const manejarDocumentos = async (documentos: ArchivosBase64) => {
        setCargando(true);
        let hayErrores = false;

        try {
            await Promise.allSettled(
                Object.entries(documentos).map(async ([nombre, base64]) => {
                    if (!base64) return;

                    const documento = {
                        Base64: base64,
                        PolizaID: polizaId,
                        DocumentoID: 1,
                        EstadoDocumento: "Activo"
                    };

                    const respuesta = await postDocumento(documento);

                    if (!respuesta || respuesta.statusCode === 413) {
                        hayErrores = true;
                        toast({
                            title: "Error al subir documento",
                            description: `El archivo ${nombre} es demasiado grande`,
                            variant: "destructive"
                        });
                        return;
                    }

                    if (!respuesta) {
                        hayErrores = true;
                        toast({
                            title: "Error al subir documento",
                            description: `No se pudo subir ${nombre}`,
                            variant: "destructive"
                        });
                    }
                })
            );

            if (!hayErrores) {
                toast({
                    title: "Documentos guardados",
                    description: "Los documentos se han guardado exitosamente"
                });
                setModalCargaAbierto(false);
                router.refresh();
            }
        } catch (error) {
            toast({
                title: "Error inesperado",
                description: "Ocurrió un error al procesar los documentos",
                variant: "destructive"
            });
        } finally {
            setCargando(false);
        }
    };

    if (tieneDocumentos) {
        return (
            <>
                <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setModalVisualizacionAbierto(true)}
                >
                    <Files className="h-4 w-4 mr-2" />
                    Documentos cargados
                </Badge>

                <ModalDocumentosPoliza
                    abierto={modalVisualizacionAbierto}
                    alCerrar={() => setModalVisualizacionAbierto(false)}
                    polizaId={polizaId}
                />
            </>
        );
    }

    return (
        <>
            {cargando && <Loading />}
            <Button
                onClick={() => setModalCargaAbierto(true)}
                variant="outline"
                size="sm"
            >
                <Upload className="h-4 w-4 mr-2" />
                Cargar documentos
            </Button>

            <Dialog open={modalCargaAbierto} onOpenChange={setModalCargaAbierto}>
                <DialogContent className="max-w-4xl max-h-[600px] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Cargar documentos de la póliza</DialogTitle>
                    </DialogHeader>
                    <DocumentosPolizaStep alSubmit={manejarDocumentos} />
                </DialogContent>
            </Dialog>
        </>
    );
};