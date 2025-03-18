export interface iGetEmpleados {
    EmpleadoID: number;
    Nombre: string;
    Paterno: string;
    Materno: null | string;
    FechaNacimiento: Date;
    SueldoQuincenal: string;
    PorcentajeComisiones: string;
    TipoEmpleado: TipoEmpleado | null;
}

export interface TipoEmpleado {
    TipoEmpleadoID: number;
    Descripcion: string;
}

export interface iPostEmpleado {
    Nombre: string;
    Paterno: string;
    Materno: string;
    FechaNacimiento: Date | string;
    SueldoQuincenal: number;
    PorcentajeComisiones: number;
    TipoEmpleadoID: number;
}

export interface iPatchEmpleado {
    Nombre?: string;
    Paterno?: string;
    Materno?: string;
    FechaNacimiento?: Date | string;
    SueldoQuincenal?: number;
    PorcentajeComisiones?: number;
    TipoEmpleadoID?: number;
}
