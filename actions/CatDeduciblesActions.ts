"use server";

import { iGetDeducibles, iGetTiposDeducible, iPatchDeducible, iPostDeducible, iPostDeducibleResp, iPostTipoDeducible } from "@/interfaces/CatDeduciblesInterface";

const url = process.env.API_URL;

export const getDeducibles = async () => {
    try {
        const resp = await fetch(`${url}/deducibles`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetDeducibles[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener paquetes: ', error);
    }
}

export const postDeducible = async (body: iPostDeducible) => {
    try {
        const resp = await fetch(`${url}/deducibles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostDeducibleResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const patchDeducible = async (id: number, body: iPatchDeducible) => {
    try {
        const resp = await fetch(`${url}/deducibles/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostDeducible = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al modificar paquete: ', error);
    }
}

export const getTiposDeducible = async () => {
    try {
        const resp = await fetch(`${url}/tipos-deducible`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetTiposDeducible[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener paquetes: ', error);
    }
}

export const postTipoDeducible = async (body: iPostTipoDeducible) => {
    try {
        const resp = await fetch(`${url}/tipos-deducible`, {
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

export const patchTipoDeducible = async (id: number, body: iPostTipoDeducible) => {
    try {
        const resp = await fetch(`${url}/tipos-deducible/${id}`, {
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

export const deleteTiposDeducible = async (id: number) => {
    try {
        const resp = await fetch(`${url}/tipos-deducible/${id}`, {
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
