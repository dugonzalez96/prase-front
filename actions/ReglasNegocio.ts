"use server";

import {
    iGetAllReglaNegocio,
    iPostReglaNegocio,
    iPatchReglaNegocio,
    iGetAllCobertura
} from '@/interfaces/ReglasNegocios';

const url = process.env.API_URL;

export const getAllReglasNegocio = async () => {
    try {
        const resp = await fetch(`${url}/reglas-negocio`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetAllReglaNegocio[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const getReglaNegocioById = async (id: number) => {
    try {
        const resp = await fetch(`${url}/reglas-negocio/${id}`, {
            cache: 'no-store'
        });

        if (!resp.ok) {
            console.log(`Error al obtener regla de negocio con id ${id}`);
        }

        const data: iGetAllReglaNegocio = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener regla de negocio: ', error);
    }
}

export const deleteReglaNegocio = async (id: number) => {
    try {
        const resp = await fetch(`${url}/reglas-negocio/${id}/admin`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        //TODO: Implementarlo bien ya que se modifique api
        if (resp.ok) {
            return 'OK';
        } else {
            console.error(`Error: ${resp.status} ${resp.statusText}`);
            return null;
        }

    } catch (error) {
        console.log('Error al eliminar regla de negocio: ', error);
        return error;
    }
}

export const patchReglaNegocio = async (id: number, body: iPatchReglaNegocio) => {

    try {
        const resp = await fetch(`${url}/reglas-negocio/${id}/admin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        // console.log("🚀 ~ patchReglaNegocio ~ resp:", resp)

        if (!resp.ok) return null;

        const data: iPatchReglaNegocio = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al modificar regla de negocio: ', error);
    }
}

export const postReglaNegocio = async (body: iPostReglaNegocio) => {
    try {
        const resp = await fetch(`${url}/reglas-negocio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        // console.log("🚀 ~ postReglaNegocio ~ resp:", resp)

        if (!resp.ok) return resp;

        const data: iPostReglaNegocio = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear regla de negocio: ', error);
    }
}

export const getAllCoberturas = async () => {
    try {
        const resp = await fetch(`${url}/coberturas`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetAllCobertura[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener coberturas: ', error);
    }
}

export const getReglasGlobales = async () => {
    try {
        const resp = await fetch(`${url}/reglas-negocio/regla-global?global=true`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetAllReglaNegocio[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const getReglasByCoberturaId = async (idCobertura: number) => {
    try {
        const resp = await fetch(`${url}/reglas-negocio/reglas-por-cobertura/${idCobertura}`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetAllReglaNegocio[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}