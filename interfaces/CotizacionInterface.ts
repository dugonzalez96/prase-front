export interface iGetCotizacion {
  CotizacionID: number;
  UsuarioID: number;
  FechaCotizacion: Date;
  PrimaTotal: string;
  EstadoCotizacion: string;
  TipoPagoID: number;
  PorcentajeDescuento: string;
  DerechoPoliza: string;
  TipoSumaAseguradaID: number;
  SumaAsegurada: string;
  PeriodoGracia: number;
  PaqueteCoberturaID: number;
  FechaUltimaActualizacion: Date | null;
  UsoVehiculo: number;
  TipoVehiculo: number;
  AMIS: null | string;
  NombrePersona: string;
  UnidadSalvamento: number;
  VIN: string;
  CP: string;
  Marca: string;
  Submarca: string;
  Modelo: string;
  Version: string;
  Correo: null | string;
  Telefono: null | string;
  Placa: null | string;
  NoMotor: null | string;
  UsuarioRegistro: null | string | number;
  detalles: iDetallesGetCotizacion[];

  // Campos de cálculos
  CostoBase: number;
  AjusteSiniestralidad: number;
  AjusteCP: number;
  AjusteTipoPago: number;
  SubtotalSiniestralidad: number;
  SubtotalTipoPago: number;
  CostoNeto: number;
  IVA: number;
  CostoTotalAnual?: number;
  CostoTotalSemestral?: number;
  CostoTotalTrimestral?: number;
}

export interface iPostCotizacion {
  UsuarioID: number;
  UsuarioRegistro: number;
  EstadoCotizacion: string;
  PrimaTotal: number;
  TipoPagoID: number;
  PorcentajeDescuento: number;
  DerechoPoliza: number;
  TipoSumaAseguradaID: number;
  SumaAsegurada: string;
  PeriodoGracia: number;
  UsoVehiculo: number;
  TipoVehiculo: number;
  meses: number;
  vigencia: string;
  NombrePersona: string;
  Correo: string;
  Telefono: string;
  UnidadSalvamento: boolean;
  VIN: string;
  CP: string;
  Marca: string;
  Submarca: string;
  Modelo: string;
  Version: string;
  inicioVigencia: Date;
  finVigencia: Date;
  detalles: Detalle[];
  versionNombre: string;
  marcaNombre: string;
  modeloNombre: string;
  Estado: string;
  minSumaAsegurada: string;
  maxSumaAsegurada: string;
  PaqueteCoberturaID: number;
  Placa: string;
  NoMotor: string;
  CostoBase: number;
  AjusteSiniestralidad: number;
  AjusteCP: number;
  AjusteTipoPago: number;
  SubtotalSiniestralidad: number;
  SubtotalTipoPago: number;
  CostoNeto: number;
  IVA: number;
}

export interface iDetallesGetCotizacion {
  DetalleID: number;
  PolizaID: null;
  CoberturaID: number;
  MontoSumaAsegurada: string;
  MontoDeducible: string;
  PrimaCalculada: string;
  EsPoliza: null;
  PorcentajePrimaAplicado: string;
  ValorAseguradoUsado: string;
}

export interface Detalle {
  CoberturaID: number;
  NombreCobertura: string;
  Descripcion: string;
  MontoSumaAsegurada: number | string;
  DeducibleID?: number;
  MontoDeducible: number;
  PrimaCalculada: number;
  PorcentajePrimaAplicado: number;
  ValorAseguradoUsado: number | string;
  Obligatoria: boolean;
  DisplayDeducible: string;
  TipoMoneda: string;
  EsAmparada: boolean;
  SumaAseguradaPorPasajero: boolean;
  TipoDeducible: string;
  DisplaySumaAsegurada?: string;
}

export interface iPatchCotizacion {
  PrimaTotal?: number;
  EstadoCotizacion?: string;
  TipoPagoID?: number;
  PorcentajeDescuento?: number;
  DerechoPoliza?: number;
  SumaAsegurada?: number;
  NombrePersona?: string;
  UnidadSalvamento?: boolean;
  Marca?: string;
  Submarca?: string;
  Modelo?: string;
  Version?: string;
  detalles?: iDetallePatchCotizacion[];
}

export interface iDetallePatchCotizacion {
  CoberturaID: number;
  MontoSumaAsegurada: number;
  DeducibleID: number;
  MontoDeducible: number;
  PrimaCalculada: number;
  PorcentajePrimaAplicado: number;
  ValorAseguradoUsado: number;
}

export interface iSendMail {
  to: string;
  subject: string;
  attachmentBase64?: string;
  filename?: string;
}
