"use server";

import {
  iMovimientoPendiente,
  iHistorialValidacion,
  iPostValidarMovimiento,
} from "@/interfaces/ValidacionMovimientosInterface";

// Mock data para movimientos pendientes
const mockMovimientosPendientes: iMovimientoPendiente[] = [
  {
    TransaccionID: 1,
    TipoTransaccion: "Egreso",
    FormaPago: "Transferencia",
    Monto: "1500.00",
    Validado: 0,
    FechaTransaccion: new Date("2025-10-26T10:30:00"),
    Descripcion: "Pago a proveedor de papelería",
    UsuarioCreo: {
      UsuarioID: 5,
      NombreUsuario: "Juan Pérez",
    },
    CuentaBancaria: {
      CuentaBancariaID: 1,
      NombreBanco: "BBVA",
      NumeroCuenta: "****1234",
    },
  },
  {
    TransaccionID: 2,
    TipoTransaccion: "Ingreso",
    FormaPago: "Deposito",
    Monto: "3200.00",
    Validado: 0,
    FechaTransaccion: new Date("2025-10-26T11:15:00"),
    Descripcion: "Depósito de cliente por póliza",
    UsuarioCreo: {
      UsuarioID: 6,
      NombreUsuario: "María García",
    },
    CuentaBancaria: {
      CuentaBancariaID: 2,
      NombreBanco: "Santander",
      NumeroCuenta: "****5678",
    },
  },
  {
    TransaccionID: 3,
    TipoTransaccion: "Egreso",
    FormaPago: "Tarjeta",
    Monto: "850.00",
    Validado: 0,
    FechaTransaccion: new Date("2025-10-26T14:20:00"),
    Descripcion: "Compra de material de oficina",
    UsuarioCreo: {
      UsuarioID: 7,
      NombreUsuario: "Carlos López",
    },
    CuentaBancaria: null,
  },
  {
    TransaccionID: 4,
    TipoTransaccion: "Ingreso",
    FormaPago: "Transferencia",
    Monto: "5400.00",
    Validado: 0,
    FechaTransaccion: new Date("2025-10-26T15:45:00"),
    Descripcion: "Transferencia por renovación de póliza",
    UsuarioCreo: {
      UsuarioID: 5,
      NombreUsuario: "Juan Pérez",
    },
    CuentaBancaria: {
      CuentaBancariaID: 1,
      NombreBanco: "BBVA",
      NumeroCuenta: "****1234",
    },
  },
  {
    TransaccionID: 5,
    TipoTransaccion: "Egreso",
    FormaPago: "Deposito",
    Monto: "2100.00",
    Validado: 0,
    FechaTransaccion: new Date("2025-10-26T16:00:00"),
    Descripcion: "Depósito bancario diario",
    UsuarioCreo: {
      UsuarioID: 8,
      NombreUsuario: "Ana Martínez",
    },
    CuentaBancaria: {
      CuentaBancariaID: 3,
      NombreBanco: "Banorte",
      NumeroCuenta: "****9012",
    },
  },
];

// Mock data para historial de validaciones
const mockHistorialValidaciones: iHistorialValidacion[] = [
  {
    ValidacionID: 1,
    TransaccionID: 10,
    UsuarioValido: {
      UsuarioID: 2,
      NombreUsuario: "Admin Principal",
    },
    Aprobado: true,
    FechaValidacion: new Date("2025-10-25T18:30:00"),
    Movimiento: {
      TransaccionID: 10,
      TipoTransaccion: "Ingreso",
      FormaPago: "Transferencia",
      Monto: "4500.00",
      Validado: 1,
      FechaTransaccion: new Date("2025-10-25T15:00:00"),
      Descripcion: "Pago de póliza mensual",
      UsuarioCreo: {
        UsuarioID: 5,
        NombreUsuario: "Juan Pérez",
      },
      CuentaBancaria: {
        CuentaBancariaID: 1,
        NombreBanco: "BBVA",
        NumeroCuenta: "****1234",
      },
    },
  },
  {
    ValidacionID: 2,
    TransaccionID: 11,
    UsuarioValido: {
      UsuarioID: 2,
      NombreUsuario: "Admin Principal",
    },
    Aprobado: false,
    Motivo: "Comprobante ilegible, solicitar nuevo documento",
    FechaValidacion: new Date("2025-10-25T17:00:00"),
    Movimiento: {
      TransaccionID: 11,
      TipoTransaccion: "Egreso",
      FormaPago: "Deposito",
      Monto: "1200.00",
      Validado: 2,
      FechaTransaccion: new Date("2025-10-25T14:30:00"),
      Descripcion: "Pago a proveedor",
      UsuarioCreo: {
        UsuarioID: 6,
        NombreUsuario: "María García",
      },
      CuentaBancaria: {
        CuentaBancariaID: 2,
        NombreBanco: "Santander",
        NumeroCuenta: "****5678",
      },
    },
  },
];

export const getMovimientosPendientes = async (
  fechaInicio?: string,
  fechaFin?: string
) => {
  try {
    const url = new URL(
      `${process.env.API_URL}/transacciones/movimientos/pendientes`
    );

    // Agregar parámetros de fecha si se proporcionan
    if (fechaInicio) {
      url.searchParams.append("fechaInicio", fechaInicio);
    }
    if (fechaFin) {
      url.searchParams.append("fechaFin", fechaFin);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.log("Error al obtener movimientos pendientes:", response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error al obtener movimientos pendientes: ", error);
    return null;
  }
};

export const getMovimientoByID = async (id: number) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const movimiento = mockMovimientosPendientes.find(
      (m) => m.TransaccionID === id
    );
    return movimiento || null;
  } catch (error) {
    console.log("Error al obtener movimiento: ", error);
    return null;
  }
};

export const validarMovimiento = async (body: iPostValidarMovimiento) => {
  console.log("🚀 ~ validarMovimiento ~ body:", body)
  try {
    const url = `${process.env.API_URL}/transacciones/${body.TransaccionID}/usuario`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Validado: 1,
        UsuarioValidoID: body.UsuarioValidoID,
      }),
    });

    if (!response.ok) {
      console.log("Error al validar movimiento:", response.status);
      return {
        success: false,
        message: "Error al validar el movimiento",
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: "Movimiento validado correctamente",
      data: data,
    };
  } catch (error) {
    console.log("Error al validar movimiento: ", error);
    return {
      success: false,
      message: "Error al procesar la validación",
    };
  }
};

export const getHistorialValidaciones = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return mockHistorialValidaciones;
  } catch (error) {
    console.log("Error al obtener historial de validaciones: ", error);
    return null;
  }
};
