export interface iPostCliente {
    NombreCompleto: string;
    FechaNacimiento: string;
    Genero: string;
    Direccion: string;
    Telefono: string;
    Email: string;
    HistorialSiniestros: number;
    HistorialReclamos: number;
    ZonaResidencia: string;
    FechaRegistro: string;
    RFC: string;
}

export interface iGetCliente {
    ClienteID: number;
    NombreCompleto: string;
    FechaNacimiento: string;
    Genero: string;
    Direccion: string;
    Telefono: string;
    Email: string;
    HistorialSiniestros: number;
    HistorialReclamos: number;
    ZonaResidencia: string;
    FechaRegistro: string;
    RFC: string | null;
}

export interface iPatchCliente {
    Direccion: string;
    Telefono: string;
}

export interface iGetCuentasBancarias {
    CuentaBancariaID: number;
    NombreBanco: string;
    NumeroCuenta: string;
    ClabeInterbancaria: string;
    Activa: number;
}

export interface iPostCuentaBancaria {
    NombreBanco: string;
    NumeroCuenta: string;
    ClabeInterbancaria: string;
    Activa: boolean;
}

export interface iPatchCuentaBancaria {
    NombreBanco?: string;
    NumeroCuenta?: string;
    ClabeInterbancaria?: string;
    Activa?: boolean;
}
