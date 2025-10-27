// Interfaces para el módulo de Validación de Movimientos

export interface iMovimientoPendiente {
    TransaccionID: number;
    TipoTransaccion: string;
    FormaPago: string;
    Monto: string;
    Validado: number;
    FechaTransaccion: Date;
    Descripcion: string;
    UsuarioCreo: {
        UsuarioID: number;
        NombreUsuario: string;
    };
    CuentaBancaria: {
        CuentaBancariaID: number;
        NombreBanco: string;
        NumeroCuenta: string;
    } | null;
}

export interface iValidacionMovimiento {
    TransaccionID: number;
    UsuarioValidoID: number;
    Aprobado: boolean;
    Motivo?: string;
    FechaValidacion: Date;
}

export interface iHistorialValidacion {
    ValidacionID: number;
    TransaccionID: number;
    UsuarioValido: {
        UsuarioID: number;
        NombreUsuario: string;
    };
    Aprobado: boolean;
    Motivo?: string;
    FechaValidacion: Date;
    Movimiento: iMovimientoPendiente;
}

export interface iPostValidarMovimiento {
    TransaccionID: number;
    UsuarioValidoID: number;
    Aprobado: boolean;
    Motivo?: string;
}

export interface iFiltrosValidacion {
    estado?: 'todos' | 'pendiente' | 'validado' | 'rechazado';
    formaPago?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    usuarioID?: number;
}
