"use server";

import { iGetDocumentos, iGetEsquemaPago, iGetMetodosPago, iGetPagosPoliza, iGetPolizas, iGetStatusPago, iPatchPagoPoliza, iPatchPoliza, iPostDocumento, iPostPagoPoliza, iPostPoliza, iPostPolizaResp } from "@/interfaces/CatPolizas";

const url = process.env.API_URL;

export const getPolizas = async () => {
    try {
        const resp = await fetch(`${url}/polizas`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data: iGetPolizas[] = await resp.json();
        return data;
    } catch (error) {
        console.log("Error al obtener pólizas: ", error);
    }
};

export const postPoliza = async (poliza: iPostPoliza) => {
    try {
        const resp = await fetch(`${url}/polizas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(poliza),
        });

        const data: iPostPolizaResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear póliza: ', error);
    }
}

export const patchPoliza = async (id: number, body: iPatchPoliza) => {
    try {
        const resp = await fetch(`${url}/polizas/${id}/admin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await resp.json();
        return data;
    } catch (error) {
        console.error('Error al editar póliza: ', error);
        return null;
    }
};

export const deletePoliza = async (id: number, body: { motivo: string }) => {
    try {
        const resp = await fetch(`${url}/polizas/${id}/admin`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        return resp.status;
    } catch (error) {
        console.error('Error al eliminar póliza: ', error);
        return null;
    }
};

export const getDocumentos = async (idPoliza: number) => {
    try {
        const resp = await fetch(`${url}/documentos-digitalizados/poliza/${idPoliza}`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data: iGetDocumentos[] = await resp.json();
        return data;
    } catch (error) {
        console.log("Error al obtener pólizas: ", error);
    }
};

export const getStatusPagos = async () => {
    try {
        const resp = await fetch(`${url}/estatus-pago`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data: iGetStatusPago[] = await resp.json();
        return data;
    } catch (error) {
        console.log("Error al obtener status de pago: ", error);
    }
};

export const getMetodosPago = async () => {
    try {
        const resp = await fetch(`${url}/metodos-pago`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data: iGetMetodosPago[] = await resp.json();
        return data;
    } catch (error) {
        console.log("Error al obtener métodos de pago: ", error);
    }
};

export const postDocumento = async (body: iPostDocumento) => {
    try {
        const resp = await fetch(`${url}/documentos-digitalizados/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al insertar documento: ', error);
    }
}

export const getEsquemaPago = async (numPoliza: string) => {
    try {
        const resp = await fetch(`${url}/polizas/esquema-pagos/${numPoliza}`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data: iGetEsquemaPago = await resp.json();
        return data;
    } catch (error) {
        console.log("Error al obtener esquemas de pago: ", error);
    }
};

export const getPagosByIdPoliza = async (idPoliza: number) => {
    try {
        const resp = await fetch(`${url}/pagos-poliza/poliza/${idPoliza}`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data: iGetPagosPoliza[] = await resp.json();
        return data;
    } catch (error) {
        console.log("Error al obtener pagos: ", error);
    }
};

export const getPagosPolizaByIdPago = async (idPago: number) => {
    try {
        const resp = await fetch(`${url}/pagos-poliza/${idPago}`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data: iGetPagosPoliza = await resp.json();
        return data;
    } catch (error) {
        console.log("Error al obtener pagos: ", error);
    }
};

export const getTotalPagarPoliza = async (idPoliza: number) => {
    try {
        const resp = await fetch(`${url}/pagos-poliza/poliza/${idPoliza}/total`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data: string = await resp.json();
        return data;
    } catch (error) {
        console.log("Error al obtener pagos: ", error);
    }
};

export const postPagoPoliza = async (body: iPostPagoPoliza) => {
    try {
        const resp = await fetch(`${url}/pagos-poliza`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al insertar pago de póliza: ', error);
    }
}

export const deletePagoPoliza = async (idPoliza: number, body: { usuarioidPoliza: number, motivoCancelacion: string }) => {
    try {
        const resp = await fetch(`${url}/pagos-poliza/${idPoliza}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await resp.json();
        return data;
    } catch (error) {
        console.error('Error al eliminar póliza: ', error);
        return null;
    }
};

export const patchPagoPoliza = async (id: number, body: iPatchPagoPoliza) => {
    try {
        const resp = await fetch(`${url}/pagos-poliza/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await resp.json();
        return data;
    } catch (error) {
        console.error('Error al editar el pago de la póliza: ', error);
        return null;
    }
};