// Interfaces para el módulo de Validación de Movimientos

export interface iMovimientoPendiente {
    TransaccionID: number;
    TipoTransaccion: string;
    FormaPago: string;
    Monto: string;
    Validado: number;
    FechaTransaccion: Date | string;
    FechaActualizacion?: Date | string;
    Descripcion: string;
    InicioCaja?: any;
    UsuarioCreo: {
        UsuarioID: number;
        NombreUsuario: string;
        EmpleadoID?: number;
        SucursalID?: number | null;
    };
    UsuarioValido?: {
        UsuarioID: number;
        NombreUsuario: string;
        EmpleadoID?: number;
        SucursalID?: number | null;
    };
    CuentaBancaria?: {
        CuentaBancariaID: number;
        NombreBanco: string;
        NumeroCuenta: string;
        ClabeInterbancaria?: string;
        Activa?: number;
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
