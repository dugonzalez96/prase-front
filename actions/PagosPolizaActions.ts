"use server";

import { iPagoPendiente, iValidarPagoPendiente } from "@/interfaces/PagosPolizaInterface";

export const getPagosPendientes = async () => {
    try {
        const url = `${process.env.API_URL}/pagos-poliza`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.log('Error al obtener pagos pendientes:', response.status);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error al obtener pagos pendientes: ', error);
        return null;
    }
}

export const validarPago = async (pagoID: number, body: iValidarPagoPendiente) => {
    try {
        const url = `${process.env.API_URL}/pagos-poliza/${pagoID}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            cache: 'no-store'
        });

        if (!response.ok) {
            console.log('Error al validar pago:', response.status);
            return {
                success: false,
                message: 'Error al validar el pago'
            };
        }

        const data = await response.json();

        return {
            success: true,
            message: 'Pago validado correctamente',
            data: data
        };
    } catch (error) {
        console.log('Error al validar pago: ', error);
        return {
            success: false,
            message: 'Error al procesar la validación'
        };
    }
}
