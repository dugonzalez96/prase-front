"use server";

import { iGetCorteCajaUsuario, iGetCortesCaja, iPatchCorteCaja, iPostGuardarCorteCaja, iPostGuardarCorteResp } from "@/interfaces/CortesCajaInterface";

const url = process.env.API_URL;

export const getCorteUsuario = async (idUsuario: number) => {
    try {
        const resp = await fetch(`${url}/cortes-usuarios/generar/${idUsuario}`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetCorteCajaUsuario = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener coberturas: ', error);
    }
}

export const postGuardarCorteCaja = async (body: iPostGuardarCorteCaja) => {
    try {
        const resp = await fetch(`${url}/cortes-usuarios/guardar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostGuardarCorteResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const getCortesCaja = async () => {
    try {
        const resp = await fetch(`${url}/cortes-usuarios`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetCortesCaja[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener coberturas: ', error);
    }
}

export const patchActCorte = async (body: iPatchCorteCaja, idCorte: number) => {
    try {
        const resp = await fetch(`${url}/cortes-usuarios/${idCorte}/admin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostGuardarCorteResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}