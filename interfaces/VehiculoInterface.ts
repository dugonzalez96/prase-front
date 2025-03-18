export interface iPostVehiculo {
    ClienteID: number;
    Marca: string;
    Submarca: string;
    Version: string;
    Modelo: number;
    TipoVehiculo: string;
    ValorVehiculo: number;
    ValorFactura: number;
    FechaRegistro: Date | string;
    UsoVehiculo: string;
    ZonaResidencia: string;
    Salvamento: number;
    NoMotor: string;
    VIN: string;
    Placas: string;
}

export interface iGetVehiculo {
    VehiculoID: number;
    ClienteID: number;
    Marca: string;
    Modelo: string;
    Submarca: string;
    TipoVehiculo: string;
    ValorVehiculo: number;
    ValorFactura: number;
    FechaRegistro: string;
    UsoVehiculo: string;
    ZonaResidencia: string;
    Salvamento: number;
    Placas: null | string;
    VIN: null | string;
    NoMotor: null | string;
    Version: null | string;
}

export interface iPatchVehiculo {
    ValorVehiculo: number;
    UsoVehiculo: string;
}