import { getCuentasBancarias } from "@/actions/ClientesActions";
import { NuevaCuentaBancariaForm } from "@/components/admin/catalogos/cuentas-bancarias/NuevaCuentaBancariaForm";
import { TablaCuentasBancarias } from "@/components/admin/catalogos/cuentas-bancarias/TablaCuentasBancarias";
import { MensajeError } from "@/components/ui/MensajeError";

export default async function CuentasBancariasPage() {
    const cuentasBancarias = await getCuentasBancarias();

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Cuentas Bancarias</h2>
            {!cuentasBancarias ? (
                <MensajeError mensaje="Hubo un error al obtener las cuentas bancarias" />
            ) : (
                <>
                    {cuentasBancarias.length === 0 ? (
                        <MensajeError mensaje="No existen cuentas bancarias registradas" />
                    ) : (
                        <TablaCuentasBancarias
                            cuentasBancarias={cuentasBancarias}
                        />
                    )}
                </>
            )}

            <div className="container">
                <h2 className="text-3xl font-bold mb-6 mt-8">Crear nueva cuenta bancaria</h2>
                <NuevaCuentaBancariaForm />
            </div>
        </>
    )
}