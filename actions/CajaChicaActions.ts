"use server";

import {
  iPrecuadreCajaChicaBackend,
  iCuadrarCajaChica,
  iActualizarCapturables,
  iCancelarCajaChica,
  iCodigoCancelacion,
  iCajaChicaPorEstatus,
} from "@/interfaces/CajaChicaInterface";

/**
 * Obtener precuadre de caja chica
 * GET /caja-chica/precuadre
 */

const url = process.env.API_URL;

export const getPrecuadreCajaChica = async () => {
  try {
    const resp = await fetch(`${url}/caja-chica/precuadre`, {
      cache: "no-store",
    });

    if (!resp.ok) {
      const error = await resp.json();
      return { error: error.message || "Error al obtener precuadre" };
    }

    const data: iPrecuadreCajaChicaBackend = await resp.json();
    return data;
  } catch (error) {
    console.log("Error al obtener precuadre de caja chica:", error);
    return { error: "Error al conectar con el servidor" };
  }
};

export const getPrecuadreCajaChicaXSucursal = async (idSucursal: number) => {
  try {
    const resp = await fetch(`${url}/caja-chica/precuadre/${idSucursal}`, {
      cache: "no-store",
    });

    if (!resp.ok) {
      const error = await resp.json();
      return { error: error.message || "Error al obtener precuadre" };
    }

    const data: iPrecuadreCajaChicaBackend = await resp.json();
    return data;
  } catch (error) {
    console.log("Error al obtener precuadre de caja chica:", error);
    return { error: "Error al conectar con el servidor" };
  }
};
/**
 * Cuadrar corte de caja chica
 * POST /caja-chica/cuadrar/{id}
 */
export const cuadrarCajaChica = async (id: number, body: iCuadrarCajaChica) => {
  try {
    const resp = await fetch(`${url}/caja-chica/cuadrar/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    console.log("🚀 ~ cuadrarCajaChica ~ data:", data);

    if (!resp.ok) {
      return {
        success: false,
        message: data.message || data.error || "Error al cuadrar corte",
      };
    }

    return {
      success: true,
      message: data.message || "Corte cuadrado correctamente",
      data,
    };
  } catch (error) {
    console.log("Error al cuadrar caja chica:", error);
    return {
      success: false,
      message: "Error al conectar con el servidor",
    };
  }
};

export const cuadrarCajaChicaXSucursal = async (
  id: number,
  idSucursal: number,
  body: iCuadrarCajaChica
) => {
  try {
    const resp = await fetch(`${url}/caja-chica/cuadrar/${id}/${idSucursal}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    console.log("🚀 ~ cuadrarCajaChicaXSucursal ~ data:", data);

    if (!resp.ok) {
      return {
        success: false,
        message: data.message || data.error || "Error al cuadrar corte",
      };
    }

    return {
      success: true,
      message: data.message || "Corte cuadrado correctamente",
      data,
    };
  } catch (error) {
    console.log("Error al cuadrar caja chica:", error);
    return {
      success: false,
      message: "Error al conectar con el servidor",
    };
  }
};

/**
 * Actualizar campos capturables antes del cierre
 * PATCH /caja-chica/{id}/capturables
 */
export const actualizarCapturables = async (
  id: number,
  body: iActualizarCapturables
) => {
  try {
    const resp = await fetch(`${url}/caja-chica/${id}/capturables`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return {
        success: false,
        message: data.message || data.error || "Error al actualizar campos",
      };
    }

    return {
      success: true,
      message: data.message || "Campos actualizados correctamente",
      data,
    };
  } catch (error) {
    console.log("Error al actualizar capturables:", error);
    return {
      success: false,
      message: "Error al conectar con el servidor",
    };
  }
};

/**
 * Cancelar caja chica
 * PATCH /caja-chica/{id}/cancelar
 */
export const cancelarCajaChica = async (
  id: number,
  body: iCancelarCajaChica
) => {
  try {
    const resp = await fetch(`${url}/caja-chica/${id}/cancelar`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return {
        success: false,
        message: data.message || data.error || "Error al cancelar caja chica",
      };
    }

    return {
      success: true,
      message: data.message || "Caja chica cancelada correctamente",
      data,
    };
  } catch (error) {
    console.log("Error al cancelar caja chica:", error);
    return {
      success: false,
      message: "Error al conectar con el servidor",
    };
  }
};

/**
 * Generar código de cancelación
 * GET /caja-chica/{id}/codigo
 */
export const generarCodigoCancelacion = async (id: number) => {
  try {
    const resp = await fetch(`${url}/caja-chica/${id}/codigo`, {
      cache: "no-store",
    });

    if (!resp.ok) {
      const error = await resp.json();
      return { error: error.message || "Error al generar código" };
    }

    const data: iCodigoCancelacion = await resp.json();
    return data;
  } catch (error) {
    console.log("Error al generar código de cancelación:", error);
    return { error: "Error al conectar con el servidor" };
  }
};

/**
 * Obtener cajas chicas por estatus
 * GET /caja-chica/estatus/{estatus}?desde={YYYY-MM-DD}&hasta={YYYY-MM-DD}
 */
export const getCajasChicasPorEstatus = async (
  estatus: string,
  desde?: string,
  hasta?: string
) => {
  try {
    let urlQuery = `${url}/caja-chica/estatus/${estatus}`;
    const params = new URLSearchParams();

    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);

    if (params.toString()) {
      urlQuery += `?${params.toString()}`;
    }

    const resp = await fetch(urlQuery, {
      cache: "no-store",
    });

    if (!resp.ok) {
      const error = await resp.json();
      return { error: error.message || "Error al obtener cajas chicas" };
    }

    const data: iCajaChicaPorEstatus[] = await resp.json();
    return data;
  } catch (error) {
    console.log("Error al obtener cajas chicas por estatus:", error);
    return { error: "Error al conectar con el servidor" };
  }
};
