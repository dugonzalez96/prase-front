export interface iGetTiposVehiculo {
    TipoID: number;
    Nombre: string;
    uso: iGetUsosVehiculo;
}

export interface iPostTipoVehiculo {
    Nombre: string;
    UsoID: number;
}

export interface iPatchTipoVehiculo {
    Nombre?: string;
    UsoID?: number;
}

export interface iGetUsosVehiculo {
    UsoID: number;
    Nombre: string;
}

export interface iPostUsoVehiculo {
    Nombre: string;
}
