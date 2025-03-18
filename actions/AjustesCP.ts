"use server";

import { Ajuste, iAjustesCP, iPatchAjustesCP, iPostAjustesCP, iPostAjustesResp } from "@/interfaces/AjustesCPInterace";

const url = process.env.API_URL;

export const getAjustesCP = async (cp: string) => {
    try {
        const resp = await fetch(`${url}/ajuste-por-codigo-postal/${cp}`, {
            cache: 'no-store'
        });

        if (!resp.ok) {
            console.log(`Error al obtener ajuste con CP ${cp}`);
        }

        const data: iAjustesCP = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener regla de negocio: ', error);
    }
}

export const getAllAjustesCP = async () => {
    try {
        const resp = await fetch(`${url}/ajuste-por-codigo-postal`, {
            cache: 'no-store'
        });

        if (!resp.ok) {
            console.log(`Error al obtener ajuste de código postal`);
        }

        const data: { message: string, ajustes: Ajuste[] } = await resp.json();
        return data.ajustes;
    } catch (error) {
        console.log('Error al obtener ajuste de CP: ', error);
    }
}

export const postCobertura = async (body: iPostAjustesCP) => {
    try {
        const resp = await fetch(`${url}/ajuste-por-codigo-postal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostAjustesResp = await resp.json();
        return data.message;
    } catch (error) {
        console.log('Error al crear ajuste de CP: ', error);
    }
}

export const patchCobertura = async (body: iPatchAjustesCP, cp: string) => {
    try {
        const resp = await fetch(`${url}/ajuste-por-codigo-postal/${cp}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostAjustesResp = await resp.json();
        return data.message;
    } catch (error) {
        console.log('Error al actualizar ajuste de CP: ', error);
    }
}

export const deletePaqueteCobertura = async (cp: string) => {
    try {
        const resp = await fetch(`${url}/ajuste-por-codigo-postal/${cp}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!resp.ok) return null;

        const data: { message: string } = await resp.json();
        return data.message;
    } catch (error) {
        console.error('Error al eliminar el ajuste de CP: ', error);
        return null;
    }
};
