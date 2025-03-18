"use server";

import { iDeleteApplicationGroup, iGetApplicationGroup, iGetApplications, iGetGroups, iGetUsers, iPatchApplication, iPatchGroup, iPatchUsuario, iPostApplication, iPostApplicationGroup, iPostApplicationResp, iPostGroup, iPostUsuario } from "@/interfaces/SeguridadInterface";

const url = process.env.API_URL;

export const getGroups = async () => {
    try {
        const resp = await fetch(`${url}/groups`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetGroups[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener coberturas: ', error);
    }
}

export const postGroup = async (body: iPostGroup) => {
    try {
        const resp = await fetch(`${url}/groups`, {
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

export const patchGroup = async (id: number, body: iPatchGroup) => {
    try {
        const resp = await fetch(`${url}/groups/${id}`, {
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
        console.log('Error al crear paquete: ', error);
    }
}

export const deleteGroup = async (id: number) => {
    try {
        const resp = await fetch(`${url}/groups/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!resp.ok) return null;

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const getApplications = async () => {
    try {
        const resp = await fetch(`${url}/applications`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetApplications[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener coberturas: ', error);
    }
}

export const postApplication = async (body: iPostApplication) => {
    try {
        const resp = await fetch(`${url}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostApplicationResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const patchApplication = async (id: number, body: iPatchApplication) => {
    try {
        const resp = await fetch(`${url}/applications/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostApplicationResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const deleteApplication = async (id: number) => {
    try {
        const resp = await fetch(`${url}/applications/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!resp.ok) return null;

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const getUsuarios = async () => {
    try {
        const resp = await fetch(`${url}/users`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetUsers[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener usuarios: ', error);
    }
}

export const postUsuario = async (body: iPostUsuario) => {
    try {
        const resp = await fetch(`${url}/users/register`, {
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

export const patchUsuario = async (id: number, body: iPatchUsuario) => {
    try {
        const resp = await fetch(`${url}/users/${id}`, {
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
        console.log('Error al modificar usuario: ', error);
    }
}

export const getApplicationsGroup = async () => {
    try {
        const resp = await fetch(`${url}/applications-grupos`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetApplicationGroup[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener coberturas: ', error);
    }
}

export const postApplicationGroup = async (id: number, body: iPostApplicationGroup) => {
    try {
        const resp = await fetch(`${url}/applications-grupos/${id}`, {
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

export const patchApplicationGroup = async (id: number, body: iPostApplicationGroup) => {
    try {
        const resp = await fetch(`${url}/applications-grupos/${id}`, {
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
        console.log('Error al crear paquete: ', error);
    }
}

export const deleteApplicationGroup = async (grupoId: number, aplicacionesIds: iDeleteApplicationGroup) => {
    try {
        const resp = await fetch(`${url}/applications-grupos/${grupoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(aplicacionesIds)
        });

        if (!resp.ok) return null;

        const data = await resp.json();
        // console.log('Data:', data);

        return data;
    } catch (error) {
        console.log('Error al eliminar: ', error);
    }
}