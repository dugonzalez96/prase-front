export interface iGetIniciosCaja {
    InicioCajaID: number;
    FechaInicio: Date;
    FechaActualizacion: Date;
    MontoInicial: string;
    TotalEfectivo: string;
    TotalTransferencia: string;
    FirmaElectronica: string;
    Estatus: string;
    Usuario: UsuarioInicioCaja;
    UsuarioAutorizo: UsuarioInicioCaja;
}

export interface UsuarioInicioCaja {
    UsuarioID: number;
    NombreUsuario: string;
    Contrasena: string;
    EmpleadoID: number | null;
    SucursalID: null;
}

export interface iPostInicioCaja {
    UsuarioID: number;
    UsuarioAutorizoID: number;
    MontoInicial: number;
    FirmaElectronica?: string;
    TotalEfectivo: number;
    TotalTransferencia?: number;
}

export interface iPatchInicioCaja {
    MontoInicial?: number;
    TotalEfectivo?: number;
    TotalTransferencia?: number;
    FirmaElectronica?: string;
    Estatus?: string;
}

export interface iGetInicioActivo {
    InicioCajaID: number;
    FechaInicio: Date;
    FechaActualizacion: Date;
    MontoInicial: string;
    TotalEfectivo: string;
    TotalTransferencia: string;
    FirmaElectronica: string;
    Estatus: string;
    Usuario: UsuarioInicioCaja;
    UsuarioAutorizo: UsuarioInicioCaja;
}

export interface iGetMovimientos {
    TransaccionID: number;
    TipoTransaccion: string;
    FormaPago: string;
    Monto: string;
    Validado: number;
    FechaTransaccion: Date;
    FechaActualizacion: Date;
    Descripcion: null | string;
    InicioCaja: InicioCaja;
    UsuarioCreo: UsuarioMovimiento;
    UsuarioValido: UsuarioMovimiento | null;
    CuentaBancaria: CuentaBancaria | null;
}

export interface CuentaBancaria {
    CuentaBancariaID: number;
    NombreBanco: string;
    NumeroCuenta: string;
    ClabeInterbancaria: string;
    Activa: number;
}

export interface InicioCaja {
    InicioCajaID: number;
    FechaInicio: Date;
    FechaActualizacion: Date;
    MontoInicial: string;
    TotalEfectivo: string;
    TotalTransferencia: string;
    FirmaElectronica: string;
    Estatus: string;
}

export interface UsuarioMovimiento {
    UsuarioID: number;
    NombreUsuario: string;
    Contrasena: string;
    EmpleadoID: number | null;
    SucursalID: null;
}

export interface iPostMovimiento {
    TipoTransaccion: string;
    FormaPago: string;
    Monto: number;
    UsuarioCreoID: number;
    UsuarioValidoID?: number;
    CuentaBancariaID: number;
    Descripcion: string;
}

export interface iDeleteMovimiento {
    codigo: string;
    motivo: string;
}
