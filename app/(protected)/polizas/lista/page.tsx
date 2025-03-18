// page.tsx
import { getCoberturas } from "@/actions/CatCoberturasActions";
import { getAllClientes } from "@/actions/ClientesActions";
import { getPolizas, getDocumentos, getMetodosPago, getStatusPagos } from "@/actions/PolizasActions"
import TablaPolizas from "@/components/admin/polizas/TablaPolizas";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function ListaPolizasPage() {
    const [polizas, coberturas, metodosPago, statusPago, clientes] = await Promise.all([
        getPolizas(),
        getCoberturas(),
        getMetodosPago(),
        getStatusPagos(),
        getAllClientes(),
    ]);

    if (!polizas || polizas.length === 0) {
        return (
            <Alert variant="destructive" className="w-fit">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No se pudieron obtener los datos de pólizas.</AlertDescription>
            </Alert>
        )
    }

    if (!coberturas || coberturas.length === 0) {
        return (
            <Alert variant="destructive" className="w-fit">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No se pudieron obtener los datos de coberturas.</AlertDescription>
            </Alert>
        )
    }

    if (!metodosPago || metodosPago.length === 0) {
        return (
            <Alert variant="destructive" className="w-fit">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No se pudieron obtener los métodos de pago.</AlertDescription>
            </Alert>
        )
    }

    if (!statusPago || statusPago.length === 0) {
        return (
            <Alert variant="destructive" className="w-fit">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No se pudieron obtener los status de pago.</AlertDescription>
            </Alert>
        )
    }

    if (!clientes || clientes.length === 0) {
        return (
            <Alert variant="destructive" className="w-fit">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No se pudo obtener la lista de clientes.</AlertDescription>
            </Alert>
        )
    }

    const polizasConDocumentos = await Promise.all(
        polizas.map(async (poliza) => {
            const documentos = await getDocumentos(poliza.PolizaID);
            return {
                ...poliza,
                tieneDocumentos: documentos ? documentos.length > 0 : false
            };
        })
    );

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Pólizas</h2>
            <TablaPolizas
                polizas={polizasConDocumentos}
                coberturas={coberturas}
                metodosPago={metodosPago}
                statusPago={statusPago}
                clientes={clientes}
            />
        </>
    )
}