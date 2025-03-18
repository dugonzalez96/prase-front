"use server";

import { iEditTipoSumaAsegurada, iGetTiposSumasAseguradas, iPostTipoSumaAsegurada, iPostTipoSumaResp } from "@/interfaces/CatTiposSumasInterface";

const url = process.env.API_URL;

export const getTiposSumasAseguradas = async () => {
    try {
        const resp = await fetch(`${url}/tipos-suma-asegurada`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetTiposSumasAseguradas[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener paquetes: ', error);
    }
}

export const postTipoSumaAsegurada = async (body: iPostTipoSumaAsegurada) => {
    try {
        const resp = await fetch(`${url}/tipos-suma-asegurada`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostTipoSumaResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const patchTipoSumaAsegurada = async (id: number, body: iEditTipoSumaAsegurada) => {
    try {
        const resp = await fetch(`${url}/tipos-suma-asegurada/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostTipoSumaResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al modificar paquete: ', error);
    }
}

export const deleteTipoSumaAsegurada = async (id: number) => {
    try {
        const resp = await fetch(`${url}/tipos-suma-asegurada/${id}`, {
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
