export interface iAjustesCP {
  message: string;
  ajuste: Ajuste;
}

export interface Ajuste {
  CodigoPostal: string;
  IndiceSiniestros: string;
  AjustePrima: string;
  CantSiniestros: number;
  UltimaActualizacion: Date;
}

export interface iPostAjustesCP {
  CodigoPostal: string;
  IndiceSiniestros: number;
  AjustePrima: number;
  CantSiniestros: number;
}

export interface iPostAjustesResp {
  message: string;
  ajuste: AjusteResp;
}

export interface AjusteResp {
  CodigoPostal: string;
  IndiceSiniestros: number;
  AjustePrima: number;
  CantSiniestros: number;
}

export interface iPatchAjustesCP {
  IndiceSiniestros?: number;
  AjustePrima?: number;
  CantSiniestros?: number;
}