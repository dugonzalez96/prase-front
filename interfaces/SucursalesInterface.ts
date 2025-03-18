export interface iGetSucursales {
    SucursalID: number;
    NombreSucursal: string;
    Direccion: string;
    Ciudad: string;
    Estado: string;
    Activa: number;
}

export interface iPostSucursal {
    NombreSucursal: string;
    Direccion: string;
    Ciudad: string;
    Estado: string;
    Activa: boolean;
}

export interface iPostSucursalResp {
    NombreSucursal: string;
    Direccion: string;
    Ciudad: string;
    Estado: string;
    Activa: number;
    SucursalID: number;
}

export interface iPatchSucursal {
    NombreSucursal?: string;
    Direccion?: string;
    Ciudad?: string;
    Estado?: string;
    Activa?: boolean;
}