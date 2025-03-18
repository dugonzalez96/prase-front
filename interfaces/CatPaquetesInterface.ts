export interface iGetAllPaquetes {
    PaqueteCoberturaID: number;
    NombrePaquete: string;
    DescripcionPaquete: string;
    FechaCreacion: Date;
    PrecioTotalFijo: string;
}

export interface iPostPaqueteCobertura {
    NombrePaquete: string;
    DescripcionPaquete: string;
    PrecioTotalFijo: string;
}

export interface iPatchPaqueteCobertura {
    NombrePaquete?: string;
    DescripcionPaquete?: string;
    PrecioTotalFijo?: string;
}

export interface iPostPaqueteResp {
    NombrePaquete: string;
    DescripcionPaquete: string;
    PaqueteCoberturaID: number;
    FechaCreacion: Date;
}

export interface iAsociarPaqueteCobertura {
    coberturas: iCoberturaPost[];
}

export interface iCoberturaPost {
    CoberturaID: number;
    obligatoria: boolean;
}

export interface iDeletePaqueteCobertura {
    coberturaIds: number[];
    usuario: string;
}

export interface iPostPaqueteCoberturaResp {
    PaqueteCoberturaID: number;
    CoberturaID: number;
    FechaAsociacion: Date;
    Obligatoria: boolean;
    paquete: Paquete;
    cobertura: Cobertura;
}

export interface Cobertura {
    CoberturaID: number;
    NombreCobertura: string;
    Descripcion: string;
    PrimaBase: string;
    SumaAseguradaMin: string;
    SumaAseguradaMax: string;
    DeducibleMin: string;
    DeducibleMax: string;
    PorcentajePrima: string;
    RangoSeleccion: string;
    EsCoberturaEspecial: boolean;
    Variable: boolean;
    SinValor: boolean;
    AplicaSumaAsegurada: boolean;
}

export interface Paquete {
    PaqueteCoberturaID: number;
    NombrePaquete: string;
    DescripcionPaquete: string;
    FechaCreacion: Date;
}

export interface iGetAsociacionPaqueteCobertura {
    PaqueteCoberturaID: number;
    CoberturaID: number;
    FechaAsociacion: Date;
    Obligatoria: boolean;
}
