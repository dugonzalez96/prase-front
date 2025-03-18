export interface iGetCoberturas {
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
    IndiceSiniestralidad: boolean | null;
    CoberturaAmparada: boolean;
    sumaAseguradaPorPasajero: boolean;
    primaMinima: string;
    primaMaxima: string;
    factorDecrecimiento: string;
    tipoDeducible: TipoDeducible;
    tipoMoneda: TipoMoneda;
    rangoCobertura: string;
}

export interface TipoDeducible {
    TipoDeducibleID: number;
    Nombre: string;
}

export interface TipoMoneda {
    TipoMonedaID: number;
    Nombre: string;
    Abreviacion: string;
}


export interface TipoDeducible {
    TipoDeducibleID: number;
    Nombre: string;
}

export interface iPostCobertura {
    NombreCobertura: string;
    Descripcion: string;
    PrimaBase: number;
    SumaAseguradaMin: number;
    SumaAseguradaMax: number;
    DeducibleMin: number;
    DeducibleMax: number;
    PorcentajePrima: number;
    RangoSeleccion: number;
    EsCoberturaEspecial: boolean;
    SinValor: boolean;
    AplicaSumaAsegurada: boolean;
    IndiceSiniestralidad: boolean | null;
    tipoDeducible: TipoDeduciblePost;
    tipoMoneda: TipoMonedaPost;
    CoberturaAmparada: boolean;
    sumaAseguradaPorPasajero: boolean;
    primaMinima: number;
    primaMaxima: number;
    factorDecrecimiento: number;
    rangoCobertura: number;
}

export interface TipoDeduciblePost {
    TipoDeducibleID: number;
}

export interface TipoMonedaPost {
    TipoMonedaID: number;
}

export interface iPostCoberturaResp {
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
    CoberturaID: number;
    CoberturaAmparada: boolean;
    sumaAseguradaPorPasajero: boolean;
    primaMinima: string;
    primaMaxima: string;
    factorDecrecimiento: string;
    rangoCobertura: string | null;
}

export interface iPatchCobertura {
    NombreCobertura?: string;
    Descripcion?: string;
    PrimaBase?: string;
    SumaAseguradaMin?: string;
    SumaAseguradaMax?: string;
    DeducibleMin?: string;
    DeducibleMax?: string;
    PorcentajePrima?: string;
    RangoSeleccion?: string;
    EsCoberturaEspecial?: boolean;
    SinValor?: boolean;
    AplicaSumaAsegurada?: boolean;
    CoberturaAmparada: boolean;
    sumaAseguradaPorPasajero: boolean;
    primaMinima?: string;
    primaMaxima?: string;
    tipoMoneda?: TipoMonedaPost;
    tipoDeducible?: TipoDeduciblePost;
    factorDecrecimiento?: string;
    rangoCobertura?: string | null;
}

export interface iGetTiposMoneda {
    TipoMonedaID: number;
    Nombre: string;
    Abreviacion: string;
}
