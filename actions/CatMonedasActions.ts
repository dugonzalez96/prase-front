"use server";

import { iGetTiposMoneda } from "@/interfaces/CatCoberturasInterface";
import { iPatchMoneda, iPostMoneda } from "@/interfaces/CatMonedasInterface";

const url = process.env.API_URL;

export const getTiposMoneda = async () => {
    try {
        const resp = await fetch(`${url}/tipos-moneda`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetTiposMoneda[] = await resp.json();

        return data;
    } catch (error) {
        console.log('Error al obtener tipos de moneda: ', error);
    }
}

export const postMoneda = async (body: iPostMoneda) => {
    try {
        const resp = await fetch(`${url}/tipos-moneda`, {
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
        console.log('Error al crear paquete: ', error);
    }
}

export const patchMoneda = async (id: number, body: iPatchMoneda) => {
    try {
        const resp = await fetch(`${url}/tipos-moneda/${id}`, {
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
        console.log('Error al modificar paquete: ', error);
    }
}

export const deleteMoneda = async (id: number) => {
    try {
        const resp = await fetch(`${url}/tipos-moneda/${id}`, {
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
        console.error('Error al eliminar la moneda: ', error);
        return null;
    }
};
