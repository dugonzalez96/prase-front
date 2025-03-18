"use server";

import { iDeleteMovimiento, iGetInicioActivo, iGetIniciosCaja, iGetMovimientos, iPatchInicioCaja, iPostInicioCaja, iPostMovimiento } from "@/interfaces/MovimientosInterface";
import { currentUser } from "@/lib/auth";

const url = process.env.API_URL;

export const getIniciosCaja = async () => {
    try {
        const resp = await fetch(`${url}/inicios-caja`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetIniciosCaja[] = await resp.json();
        return data;
    } catch (error) {
        console.log(`Error al obtener inicios de caja: ${error}`);
    }
}

export const getInicioActivo = async (idUser: number) => {
    try {
        const resp = await fetch(`${url}/inicios-caja/activo/${idUser}`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetInicioActivo = await resp.json();
        return data;
    } catch (error) {
        console.log(`Error al obtener inicios de caja: ${error}`);
    }
}

export const postInicioCaja = async (body: iPostInicioCaja) => {
    try {
        const resp = await fetch(`${url}/inicios-caja`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return { error: 'Error al crear inicio de caja' };

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log(`Error al crear inicio de caja: ${error}`);
    }
}

export const patchInicioCaja = async (id: number, body: iPatchInicioCaja) => {
    try {
        const resp = await fetch(`${url}/inicios-caja/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return { error: 'Error al actualizar inicio de caja' };

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al actualizar inicio de caja: ', error);
    }
}

export const deleteInicioCaja = async (id: number, usuario: number, body: { motivo: string }) => {
    try {
        const resp = await fetch(`${url}/inicios-caja/${id}/${usuario}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!resp.ok) {
            const respuesta = await resp.json();
            // console.log(respuesta)
            return { error: 'Error al eliminar inicio de caja' }
        }

        return { msg: 'Inicio de caja eliminado correctamente' }
    } catch (error) {
        console.log(`Error al eliminar inicio de caja: ${error}`)
    }
}

export const getMovimientos = async () => {
    try {
        const resp = await fetch(`${url}/transacciones`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetMovimientos[] = await resp.json();
        return data;
    } catch (error) {
        console.log(`Error al obtener movimientos: ${error}`);
    }
}

export const postMovimiento = async (body: iPostMovimiento) => {
    try {
        const resp = await fetch(`${url}/transacciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return { error: 'Error al crear transacción' };

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log(`Error al crear transacción: ${error}`);
    }
}

export const postGenerarCodigo = async (idTransaccion: number) => {
    try {
        const resp = await fetch(`${url}/transacciones/generar-codigo/${idTransaccion}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!resp.ok) return null;

        const data: { id: string, codigo: string } = await resp.json();
        return data;
    } catch (error) {
        console.log(`Error al crear transacción: ${error}`);
    }
}

export const deleteMovimiento = async (idTransaccion: number, body: iDeleteMovimiento) => {
    try {
        const resp = await fetch(`${url}/transacciones/${idTransaccion}/admin`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!resp.ok) return { error: 'Error al eliminar movimiento' }

        return { msg: 'Movimiento eliminado correctamente' }
    } catch (error) {
        console.log(`Error al eliminar movimiento: ${error}`)
    }
}

export const getMovimientosByID = async () => {
    const user = await currentUser();
    if (!user) return null;
    const userId = user.usuario.UsuarioID
    try {
        const resp = await fetch(`${url}/transacciones/usuario/${userId}`, {
            cache: 'no-store'
        });
        
        if (!resp.ok) return null;

        const data: iGetMovimientos[] = await resp.json();
        return data;
    } catch (error) {
        console.log(`Error al obtener movimientos: ${error}`);
    }
}