"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import type {
    iGetEsquemaPago,
    iGetMetodosPago,
    iGetStatusPago,
    iGetPolizas,
} from "@/interfaces/CatPolizas";
import { RegistroPagoPoliza } from "./RegistroPagoPoliza";
import { EditarPagosPoliza } from "./EditarPagosPoliza";
import { HistorialPagosPoliza } from "./HistorialPagosPoliza";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface PropiedadesGestionPagos {
    abierto: boolean;
    alCerrar: () => void;
    esquemaPago: iGetEsquemaPago;
    poliza: iGetPolizas;
    usuarioId: number;
    onRegistrarPago: (datos: any) => Promise<void>;
    statusPago: iGetStatusPago[];
    metodosPago: iGetMetodosPago[];
}

export const GestionPagosPoliza = ({
    abierto,
    alCerrar,
    esquemaPago,
    poliza,
    usuarioId,
    onRegistrarPago,
    statusPago,
    metodosPago,
}: PropiedadesGestionPagos) => {
    const user = useCurrentUser();

    return (
        <Dialog open={abierto} onOpenChange={alCerrar}>
            <DialogContent className="max-w-4xl h-[600px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex flex-col">
                        Gestión de Pagos
                        <Badge variant="outline" className="w-fit mt-2">
                            Póliza: {poliza.NumeroPoliza}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="registrar" className="w-full min-h-[600px]">
                    <TabsList className="w-full">
                        <TabsTrigger value="registrar">Registrar Pago</TabsTrigger>
                        <TabsTrigger value="historial">Historial</TabsTrigger>
                        {user?.grupo.nombre === 'Administrador' && <TabsTrigger value="editar">Editar Pagos</TabsTrigger>}
                    </TabsList>

                    <div className="pb-6">
                        <TabsContent value="registrar">
                            <RegistroPagoPoliza
                                esquemaPago={esquemaPago}
                                polizaId={poliza.PolizaID}
                                usuarioId={usuarioId}
                                statusPago={statusPago}
                                metodosPago={metodosPago}
                                onRegistrarPago={onRegistrarPago}
                            />
                        </TabsContent>
                        <TabsContent value="historial">
                            <HistorialPagosPoliza
                                numeroPoliza={poliza.NumeroPoliza}
                            />
                        </TabsContent>
                    </div>

                    {user?.grupo.nombre === 'Administrador' && (
                        <TabsContent value="editar">
                            <EditarPagosPoliza
                                polizaId={poliza.PolizaID}
                                statusPago={statusPago}
                                metodosPago={metodosPago}
                                usuarioId={usuarioId}
                            />
                        </TabsContent>
                    )}

                </Tabs>
            </DialogContent>
        </Dialog>
    );
};