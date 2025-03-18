export interface iGetTiposSumasAseguradas {
    TipoSumaAseguradaID: number;
    NombreTipo: string;
    DescripcionSuma: string;
    FechaCreacion: Date | null;
}

export interface iPostTipoSumaAsegurada {
    NombreTipo: string;
    DescripcionSuma: string;
}

export interface iPostTipoSumaResp {
    NombreTipo: string;
    DescripcionSuma: string;
    TipoSumaAseguradaID: number;
    FechaCreacion: Date | null;
}

export interface iEditTipoSumaAsegurada {
    NombreTipo?: string;
    DescripcionSuma?: string;
}

