"use server";

import {
    iGetVehiculo,
    iPatchVehiculo,
    iPostVehiculo
} from '@/interfaces/VehiculoInterface';

const url = process.env.API_URL;

export const getAllVehiculos = async () => {
    try {
        const resp = await fetch(`${url}/vehiculos`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetVehiculo[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener vehiculos: ', error);
    }
}

export const getVehiculoById = async (id: number) => {
    try {
        const resp = await fetch(`${url}/vehiculos/${id}`, {
            cache: 'no-store'
        });

        if (!resp.ok) {
            console.log(`Error al obtener vehiculo con id ${id}`);
        }

        const data: iGetVehiculo = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener vehiculo: ', error);
    }
}

export const postVehiculo = async (data: iPostVehiculo) => {
    try {
        const resp = await fetch(`${url}/vehiculos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!resp.ok) {
            console.log(`Error al crear vehiculo`);
            return null;
        }

        const vehiculo: iGetVehiculo = await resp.json();
        return vehiculo;
    } catch (error) {
        console.log('Error al crear vehiculo: ', error);
    }
}

export const patchVehiculo = async (id: number, data: iPatchVehiculo) => {
    try {
        const resp = await fetch(`${url}/vehiculos/${id}/admin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        // console.log('resp', resp);

        if (!resp.ok) {
            console.log(`Error al actualizar vehiculo`);
            return null;
        }

        const vehiculo: iGetVehiculo = await resp.json();
        return vehiculo;
    } catch (error) {
        console.log('Error al actualizar vehiculo: ', error);
    }
}

export const deleteVehiculo = async (id: number) => {
    try {
        const resp = await fetch(`${url}/vehiculos/${id}/admin`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (resp.ok) {
            return 'OK';
        } else {
            console.error(`Error: ${resp.status} ${resp.statusText}`);
            return null;
        }

        return true;
    } catch (error) {
        console.log('Error al eliminar vehiculo: ', error);
    }
}