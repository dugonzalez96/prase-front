import { getAllPaquetes } from "@/actions/CatPaquetesActions";
import { getCoberturas } from "@/actions/CatCoberturasActions";
import { getAsociacionPaquetesCobertura } from "@/actions/CatPaquetesActions";
import { TableAsociaciones } from "@/components/admin/catalogos/paquetes/TableAsociaciones";
import { NuevaAsociacionForm } from "@/components/admin/catalogos/paquetes/NuevaAsociacionForm";

export default async function AsociarPaqueteCoberturaPage() {
    const paquetes = await getAllPaquetes();
    const coberturas = await getCoberturas();
    const asociaciones = await getAsociacionPaquetesCobertura();

    if (!paquetes || !coberturas || !asociaciones) {
        return <h4 className="text-red-500">Hubo un error al obtener los datos.</h4>;
    }

    // Obtener nombres de paquetes y coberturas
    const asociacionesConNombres = asociaciones.map((asociacion) => {
        const paquete = paquetes.find((p) => p.PaqueteCoberturaID === asociacion.PaqueteCoberturaID);
        const cobertura = coberturas.find((c) => c.CoberturaID === asociacion.CoberturaID);

        return {
            ...asociacion,
            NombrePaquete: paquete ? paquete.NombrePaquete : "Desconocido",
            NombreCobertura: cobertura ? cobertura.NombreCobertura : "Desconocido",
        };
    });

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Asociaciones de Paquetes y Coberturas</h2>

            {asociacionesConNombres && asociacionesConNombres.length > 0 ? (
                <TableAsociaciones asociaciones={asociacionesConNombres} />
            ) : (
                <h4>No hay asociaciones disponibles.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nueva Asociación Paquete-Cobertura</h3>
            <NuevaAsociacionForm
                paquetes={paquetes}
                coberturas={coberturas}
            />
        </>
    );
}
