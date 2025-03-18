"use server";

import { iGetTiposVehiculo, iGetUsosVehiculo, iPatchTipoVehiculo, iPostTipoVehiculo, iPostUsoVehiculo } from "@/interfaces/CatVehiculosInterface";

const url = process.env.API_URL;

export const getTiposVehiculo = async () => {
    try {
        const resp = await fetch(`${url}/tipos-vehiculo`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetTiposVehiculo[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener coberturas: ', error);
    }
}

export const postTipoVehiculo = async (body: iPostTipoVehiculo) => {
    try {
        const resp = await fetch(`${url}/tipos-vehiculo`, {
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

export const patchTipoVehiculo = async (id: number, body: iPatchTipoVehiculo) => {
    try {
        const resp = await fetch(`${url}/tipos-vehiculo/${id}`, {
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

export const deleteTipoVehiculo = async (id: number) => {
    try {
        const resp = await fetch(`${url}/tipos-vehiculo/${id}`, {
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
        console.error('Error al eliminar el paquete: ', error);
        return null;
    }
};

export const getUsoVehiculo = async () => {
    try {
        const resp = await fetch(`${url}/usos-vehiculo`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetUsosVehiculo[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener coberturas: ', error);
    }
}

export const postUsoVehiculo = async (body: iPostUsoVehiculo) => {
    try {
        const resp = await fetch(`${url}/usos-vehiculo`, {
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

export const patchUsoVehiculo = async (id: number, body: iPostUsoVehiculo) => {
    try {
        const resp = await fetch(`${url}/usos-vehiculo/${id}`, {
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

export const deleteUsoVehiculo = async (id: number) => {
    try {
        const resp = await fetch(`${url}/usos-vehiculo/${id}`, {
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
        console.error('Error al eliminar el paquete: ', error);
        return null;
    }
};