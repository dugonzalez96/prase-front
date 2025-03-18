"use server";
import {
    iGetAnios,
    iGetMarcasPorAnio,
    iGetModelosPorAnioMarca,
    iGetVersionesPorAnioMarcaModelo,
    iGetPrecioVersionPorClave
} from '@/interfaces/LibroAzul';

const user = process.env.LIBRO_USER;
const pass = process.env.LIBRO_PASS;
const url = process.env.API_LIBRO_AZUL;
const clase = process.env.CLASE;

export const login = async (user: string, pass: string) => {
    try {
        const resp = await fetch(`${url}/Sesion/?Usuario=${user}&Contrasena=${pass}`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: string = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const loginAuto = async () => {
    try {
        const resp = await fetch(`${url}/Sesion/?Usuario=${user}&Contrasena=${pass}`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: string = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const getAnios = async (key: string) => {
    try {
        const resp = await fetch(`${url}/A%C3%B1os/?Llave=${key}&Clase=${clase}`, {
            method: 'POST'
        });

        if (!key) return null;

        if (!resp.ok) return null;

        const data: iGetAnios[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const getMarcasPorAnio = async (key: string, anio: iGetAnios) => {
    try {
        const resp = await fetch(`${url}/Marcas/?Llave=${key}&ClaveAnio=${anio.Clave}`, {
            method: 'POST'
        });

        if (!resp.ok) return null;

        const data: iGetMarcasPorAnio[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const getModelosPorAnioMarca = async (key: string, anio: string, marca: iGetMarcasPorAnio) => {
    try {
        const resp = await fetch(`${url}/Modelos/?Llave=${key}&ClaveAnio=${anio}&ClaveMarca=${marca.Clave}`, {
            method: 'POST'
        });

        if (!resp.ok) return null;

        const data: iGetModelosPorAnioMarca[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const getVersionesPorAnioMarcaModelo = async (key: string, anio: string, marca: string, modelo: iGetModelosPorAnioMarca) => {
    try {
        const resp = await fetch(`${url}/Versiones/?Llave=${key}&ClaveAnio=${anio}&ClaveMarca=${marca}&ClaveModelo=${modelo.Clave}`, {
            method: 'POST'
        });

        if (!resp.ok) return null;

        const data: iGetVersionesPorAnioMarcaModelo[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const getPrecioVersionPorClave = async (key: string, version: iGetVersionesPorAnioMarcaModelo) => {
    try {
        const resp = await fetch(`${url}/Precio/?Llave=${key}&ClaveVersion=${version.Clave}`, {
            method: 'POST'
        });

        if (!resp.ok) return null;

        const data: iGetPrecioVersionPorClave = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}