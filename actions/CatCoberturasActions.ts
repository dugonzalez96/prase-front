"use server";

import { iGetCoberturas, iPatchCobertura, iPostCobertura, iPostCoberturaResp } from "@/interfaces/CatCoberturasInterface";

const url = process.env.API_URL;

export const getCoberturas = async () => {
    try {
        const resp = await fetch(`${url}/coberturas`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetCoberturas[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener coberturas: ', error);
    }
}

export const getCoberturaById = async (id: number) => {
    try {
        const resp = await fetch(`${url}/coberturas/${id}`, {
            cache: 'no-store'
        });

        if (!resp.ok) {
            console.log(`Error al obtener cobertura con id ${id}`);
        }

        const data: iGetCoberturas = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener cobertura: ', error);
    }
}

export const postCobertura = async (body: iPostCobertura) => {
    try {
        const resp = await fetch(`${url}/coberturas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostCoberturaResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const patchCobertura = async (id: number, body: iPatchCobertura) => {
    try {
        const resp = await fetch(`${url}/coberturas/${id}/admin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostCoberturaResp = await resp.json();
        // console.log(data)
        return data;
    } catch (error) {
        console.log('Error al modificar paquete: ', error);
    }
}

export const deletePaqueteCobertura = async (id: number) => {
    try {
        const resp = await fetch(`${url}/coberturas/${id}/admin`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        //TODO: Implementarlo bien ya que se modifique api
        if (resp.ok) {
            return 'OK';
        } else {
            console.error(`Error: ${resp.status} ${resp.statusText}`);
            return null;
        }
    } catch (error) {
        console.error('Error al eliminar el paquete: ', error);
        return null;
    }
};
