export interface iGetDeducibles {
    DeducibleID: number;
    DeducibleMinimo: string;
    DeducibleMaximo: string;
    Rango: string;
}

export interface iPostDeducible {
    DeducibleMinimo: number;
    DeducibleMaximo: number;
    Rango: number;
}

export interface iPatchDeducible {
    DeducibleMinimo?: number;
    DeducibleMaximo?: number;
    Rango?: number;
}

export interface iPostDeducibleResp {
    DeducibleMinimo: number;
    DeducibleMaximo: number;
    Rango: number;
    DeducibleID: number;
}

export interface iGetTiposDeducible {
    TipoDeducibleID: number;
    Nombre: string;
}

export interface iPostTipoDeducible {
    Nombre: string;
}
