"use server";

import { iGetCotizacion, iPatchCotizacion, iPostCotizacion, iSendMail } from "@/interfaces/CotizacionInterface";

const url = process.env.API_URL;

export const getCotizaciones = async () => {
    try {
        const resp = await fetch(`${url}/cotizaciones`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetCotizacion[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener cotizaciones: ', error);
    }
}

export const getCotizacionById = async (id: number) => {
    try {
        const resp = await fetch(`${url}/cotizaciones/${id}`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetCotizacion = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener cotizaciones: ', error);
    }
}

export const postCotizacion = async (body: iPostCotizacion) => {
    try {
        const resp = await fetch(`${url}/cotizaciones`, {
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
        console.log('Error al crear cotización: ', error);
    }
}

export const patchCotizacion = async (id: number, body: iPatchCotizacion) => {
    try {
        const resp = await fetch(`${url}/cotizaciones/${id}/admin`, {
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
        console.log('Error al modificar cotización: ', error);
    }
}

export const deleteCotizacion = async (id: number) => {
    try {
        const resp = await fetch(`${url}/cotizaciones/${id}/admin`, {
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
        console.error('Error al eliminar cotización: ', error);
        return null;
    }
};

export const sendMail = async (body: iSendMail) => {
    try {
        const resp = await fetch(`${url}/mailer/send`, {
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
        console.log('Error al crear cotización: ', error);
    }
}
