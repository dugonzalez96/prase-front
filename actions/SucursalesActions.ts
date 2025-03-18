"use server"

import { iGetSucursales, iPatchSucursal, iPostSucursal, iPostSucursalResp } from "@/interfaces/SucursalesInterface";

const url = process.env.API_URL;

export const getSucursales = async () => {
    try {
        const resp = await fetch(`${url}/sucursales`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetSucursales[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener usuarios: ', error);
    }
}

export const postSucursal = async (body: iPostSucursal) => {
    try {
        const resp = await fetch(`${url}/sucursales`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostSucursalResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear sucursal: ', error);
    }
}

export const patchSucursal = async (id: number, body: iPatchSucursal) => {
    try {
        const resp = await fetch(`${url}/sucursales/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostSucursalResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al modificar sucursal: ', error);
    }
}

export const deleteSucursal = async (id: number) => {
    try {
        const resp = await fetch(`${url}/sucursales/${id}`, {
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
        console.error('Error al eliminar el sucursal: ', error);
        return null;
    }
};
