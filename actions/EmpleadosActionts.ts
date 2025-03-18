"use server"

import { iGetEmpleados, iPatchEmpleado, iPostEmpleado, TipoEmpleado } from "@/interfaces/EmpleadosInterface";

const url = process.env.API_URL;

export const getEmpleados = async () => {
    try {
        const resp = await fetch(`${url}/empleados`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data: iGetEmpleados[] = await resp.json();
        return data;
    } catch (error) {
        console.log("Error al obtener empleados: ", error);
    }
};

export const getTiposEmpleado = async () => {
    try {
        const resp = await fetch(`${url}/tipos-empleado`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data: TipoEmpleado[] = await resp.json();
        return data;
    } catch (error) {
        console.log("Error al obtener tipos de empleado: ", error);
    }
};

export const postEmpleado = async (body: iPostEmpleado) => {
    try {
        const resp = await fetch(`${url}/empleados`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear empleado: ', error);
    }
}

export const patchEmpleado = async (id: number, body: iPatchEmpleado) => {
    try {
        const resp = await fetch(`${url}/empleados/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await resp.json();
        return data;
    } catch (error) {
        console.error('Error al editar empleado: ', error);
        return null;
    }
};

export const deleteEmpleado = async (id: number) => {
    try {
        const resp = await fetch(`${url}/empleados/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        const data = await resp.json();
        return data;
    } catch (error) {
        console.error('Error al eliminar empleado: ', error);
        return null;
    }
};