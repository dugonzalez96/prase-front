export interface iCondicionReglaNegocio {
    CondicionID?: number;
    Campo: string;
    Operador: string;
    Valor: string;
    Evaluacion: string;
}

export interface iPostCobertura {
    CoberturaID: number | null;
}

export interface iGetAllCobertura {
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
    tipoDeducible: TipoDeducible | null;
    tipoMoneda: TipoMoneda | null;
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


export interface iGetAllReglaNegocio {
    ReglaID: number;
    NombreRegla: string;
    Descripcion: string;
    TipoAplicacion: string;
    TipoRegla: string;
    ValorAjuste: string | null;
    EsGlobal: boolean;
    Activa: boolean;
    cobertura: iGetAllCobertura;
    condiciones: iCondicionReglaNegocio[];
    TipoMonedaID: number;
}

export interface iPostReglaNegocio {
    NombreRegla: string;
    Descripcion: string;
    TipoAplicacion: string;
    TipoRegla: string;
    EsGlobal: boolean;
    Activa: boolean;
    TipoMonedaID: number;
    cobertura: iPostCobertura;
    condiciones: iCondicionReglaNegocio[];
}

export interface iPatchReglaNegocio {
    NombreRegla: string;
    EsGlobal: boolean;
    Activa: boolean;
    cobertura: iPostCobertura;
    condiciones: iCondicionReglaNegocio[];
    TipoRegla: string;
}
