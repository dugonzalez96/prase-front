"use server";

import { iGetTipoPagos, iPatchTipoPago, iPostTipoPago } from "@/interfaces/CatTipoPagos";

const url = process.env.API_URL;

export const getTipoPagos = async () => {
    try {
        const resp = await fetch(`${url}/tipo-pago`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetTipoPagos[] = await resp.json();

        return data;
    } catch (error) {
        console.log('Error al obtener tipos de pago: ', error);
    }
}

export const postTipoPago = async (body: iPostTipoPago) => {
    try {
        const resp = await fetch(`${url}/tipo-pago`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear tipo de pago: ', error);
    }
}

export const patchTipoPago = async (id: number, body: iPatchTipoPago) => {
    try {
        const resp = await fetch(`${url}/tipo-pago/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al modificar tipo de pago: ', error);
    }
}

export const deleteTipoPago = async (id: number) => {
    try {
        const resp = await fetch(`${url}/tipo-pago/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (resp.ok) {
            return 'OK';
        } else {
            console.error(`Error: ${resp.status} ${resp.statusText}`);
            return null;
        }
    } catch (error) {
        console.error('Error al eliminar el tipo de pago: ', error);
        return null;
    }
};
