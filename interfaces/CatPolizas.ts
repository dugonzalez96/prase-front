export interface iPostPoliza {
    CotizacionID: number;
    FechaInicio: Date | string;
    FechaFin: Date | string;
    EstadoPoliza: string;
    PrimaTotal: number;
    TotalPagos: number;
    NumeroPagos: number;
    DescuentoProntoPago: number;
    TipoPagoID: number;
    VersionActual: number;
    TieneReclamos: boolean;
    VehiculoID: number;
    ClienteID: number;
    DerechoPolizaAplicado: number;
    TotalSinIVA: number;
    NumOcupantes: number;
}


export interface iPatchPoliza {
    TipoPagoID?: number;
    FechaInicio?: Date;
    FechaFin?: Date;
    PrimaTotal?: number;
    TotalPagos?: number;
    NumeroPagos?: number;
    DescuentoProntoPago?: number;
    TieneReclamos?: boolean;
}



export interface iGetDocumentos {
    DocumentoDigitalizadoID: number;
    RutaArchivo: string;
    FechaCarga: Date;
    EstadoDocumento: string;
    Documento: Documento;
    Poliza: Poliza;
}

export interface Documento {
    DocumentoID: number;
    NombreDocumento: string;
    Descripcion: string;
}

export interface Poliza {
    PolizaID: number;
    NumeroPoliza: string;
    FechaInicio: Date;
    FechaFin: Date;
    EstadoPoliza: string;
    PrimaTotal: string;
    TotalPagos: string;
    NumeroPagos: number;
    DescuentoProntoPago: string;
    VersionActual: string;
    TieneReclamos: boolean;
    FechayHora: Date;
    FechaEmision: Date;
}

export interface iPostDocumento {
    Base64: string;
    PolizaID: number;
    DocumentoID: number;
    EstadoDocumento: string;
}

export interface iGetPolizas {
    PolizaID: number;
    NumeroPoliza: string;
    FechaInicio: Date;
    FechaFin: Date;
    EstadoPoliza: string;
    PrimaTotal: string;
    TotalSinIVA: string;
    DerechoPolizaAplicado: string;
    NumeroPagos: number;
    TotalPagos: string;
    DescuentoProntoPago: string;
    VersionActual: string;
    NumOcupantes: number;
    TieneReclamos: boolean;
    FechayHora: Date;
    FechaEmision: Date;
    historial: Historial[];
    detalles: Detalle[];
    cotizacion: CotizacionPoliza;
    cliente: Cliente;
    tieneDocumentos?: boolean;
}

export interface Cliente {
    ClienteID: number;
    NombreCompleto: string;
    FechaNacimiento: Date;
    Genero: string;
    Direccion: string;
    Telefono: string;
    Email: string;
    HistorialSiniestros: number;
    HistorialReclamos: number;
    ZonaResidencia: string;
    RFC: string;
    FechaRegistro: Date;
}

export interface CotizacionPoliza {
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
    FechaUltimaActualizacion: Date;
    UsoVehiculo: number;
    TipoVehiculo: number;
    NombrePersona: string;
    UnidadSalvamento: number;
    VIN: string;
    CP: string;
    Marca: string;
    Submarca: string;
    Modelo: string;
    Version: string;
    Correo: string;
    Telefono: string;
    NoMotor: string;
    Placa: string;
    UsuarioRegistro: number;
    CostoBase: string;
    AjusteSiniestralidad: string;
    AjusteCP: string;
    AjusteTipoPago: string;
    SubtotalSiniestralidad: string;
    SubtotalTipoPago: string;
    CostoNeto: string;
    IVA: string;
}

export interface Detalle {
    DetalleID: number;
    CoberturaID: number;
    MontoSumaAsegurada: string;
    MontoDeducible: string;
    PrimaCalculada: string;
    EsPoliza: boolean;
    PorcentajePrimaAplicado: string;
    ValorAseguradoUsado: string;
}

export interface Historial {
    HistorialID: number;
    NumeroPoliza: string;
    Version: number;
    FechaInicio: Date;
    FechaFin: Date;
    EstadoPoliza: string;
    TotalPagos: string;
    NumeroPagos: number;
    MontoPorPago: string;
    DescuentoProntoPago: string;
    FechaCancelacion: null;
    MotivoCancelacion: null;
    FechaVersion: Date;
}


export interface iPostPolizaResp {
    cotizacion: CotizacionResp;
    DerechoPolizaAplicado: number;
    tipoPago: TipoPago;
    vehiculo: VehiculoResp;
    cliente: Cliente;
    FechaInicio: Date;
    FechaFin: Date;
    PrimaTotal: number;
    TotalPagos: number;
    NumeroPagos: number;
    DescuentoProntoPago: number;
    TieneReclamos: boolean;
    EstadoPoliza: string;
    VersionActual: number;
    NumeroPoliza: string;
    PolizaID: number;
    FechayHora: Date;
    FechaEmision: Date;
    NumOcupantes: Number;
    TotalSinIVA: string;
}

export interface VehiculoResp {
    VehiculoID: number;
    ClienteID: number;
    Marca: string;
    Submarca: string;
    Version: string;
    Modelo: number;
    TipoVehiculo: string;
    ValorVehiculo: string;
    ValorFactura: string;
    FechaRegistro: Date;
    UsoVehiculo: string;
    ZonaResidencia: string;
    NoMotor: string;
    VIN: string;
    Placas: string;
    Salvamento: number;
}


export interface Cliente {
    ClienteID: number;
    NombreCompleto: string;
    FechaNacimiento: Date;
    Genero: string;
    Direccion: string;
    Telefono: string;
    Email: string;
    HistorialSiniestros: number;
    HistorialReclamos: number;
    ZonaResidencia: string;
    FechaRegistro: Date;
    RFC: string;
}

export interface CotizacionResp {
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
    FechaUltimaActualizacion: null;
    UsoVehiculo: number;
    TipoVehiculo: number;
    NombrePersona: string;
    UnidadSalvamento: number;
    VIN: string;
    CP: string;
    Marca: string;
    Submarca: string;
    Modelo: string;
    Version: string;
    Correo: string;
    Telefono: string;
    NoMotor: null | string;
    Placa: null | string;
    UsuarioRegistro: null | string;
}

export interface TipoPago {
    TipoPagoID: number;
    Descripcion: string;
    PorcentajeAjuste: string;
    Divisor: number;
}

export interface Vehiculo {
    VehiculoID: number;
    ClienteID: number;
    Marca: string;
    Modelo: string;
    AnoFabricacion: number;
    TipoVehiculo: string;
    ValorVehiculo: string;
    ValorFactura: string;
    FechaRegistro: Date;
    UsoVehiculo: string;
    ZonaResidencia: string;
    NoMotor: null | string;
    VIN: null | string;
    Placas: null | string;
    Salvamento: number;
}

export interface iPostPagoPoliza {
    PolizaID: number;
    FechaPago: Date;
    MontoPagado: number;
    ReferenciaPago: string;
    NombreTitular: string;
    FechaMovimiento: Date;
    IDMetodoPago: number;
    IDEstatusPago: number;
    UsuarioID: number;
}

export interface iPostPagoPolizaResp {
    PolizaID: number;
    FechaPago: Date;
    MontoPagado: number;
    ReferenciaPago: string;
    NombreTitular: string;
    FechaMovimiento: Date;
    MetodoPago: MetodoPago;
    EstatusPago: EstatusPago;
    Usuario: Usuario;
    MotivoCancelacion: null;
    PagoID: number;
}

export interface EstatusPago {
    IDEstatusPago: number;
    NombreEstatus: string;
    FechaCreacion: Date;
    FechaActualizacion: Date;
}

export interface MetodoPago {
    IDMetodoPago: number;
    NombreMetodo: string;
    FechaCreacion: Date;
    FechaActualizacion: Date;
}

export interface Usuario {
    UsuarioID: number;
    NombreUsuario: string;
    Contrasena: string;
    EmpleadoID: null;
}


export interface iGetEsquemaPago {
    fechaInicio: Date;
    fechaFin: Date;
    esquemaPagos: EsquemaPago[];
    pagosFueraDeRango: any[];
    totalPrima: number;
    totalPagado: number;
    descuentoProntoPago: number;
    mensajeAtraso: string;
}

export interface EsquemaPago {
    numeroPago: number;
    fechaPago: Date;
    montoPorPagar: number;
    estado: string;
    pagosRealizados: any[];
}

export interface iGetStatusPago {
    IDEstatusPago: number;
    NombreEstatus: string;
    FechaCreacion: Date;
    FechaActualizacion: Date;
}

export interface iGetMetodosPago {
    IDMetodoPago: number;
    NombreMetodo: string;
    FechaCreacion: Date;
    FechaActualizacion: Date;
}

export interface iGetPagosPoliza {
    PagoID: number;
    PolizaID: number;
    FechaPago: Date;
    MontoPagado: string;
    ReferenciaPago: string;
    NombreTitular: string;
    FechaMovimiento: Date;
    MotivoCancelacion: null;
    MetodoPago: MetodoPago;
    EstatusPago: EstatusPago;
    Usuario: Usuario;
}

export interface EstatusPago {
    IDEstatusPago: number;
    NombreEstatus: string;
    FechaCreacion: Date;
    FechaActualizacion: Date;
}

export interface MetodoPago {
    IDMetodoPago: number;
    NombreMetodo: string;
    FechaCreacion: Date;
    FechaActualizacion: Date;
}

export interface Usuario {
    UsuarioID: number;
    NombreUsuario: string;
    Contrasena: string;
    EmpleadoID: null;
}

export interface iPatchPagoPoliza {
    MontoPagado?: number;
    ReferenciaPago?: string;
    IDMetodoPago?: number;
    IDEstatusPago?: number;
    NombreTitular?: string;
}
