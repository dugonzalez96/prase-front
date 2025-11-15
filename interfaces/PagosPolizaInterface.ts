export interface iMetodoPago {
  IDMetodoPago: number;
  NombreMetodo: string;
  FechaCreacion: Date | string;
  FechaActualizacion: Date | string;
}

export interface iEstatusPago {
  IDEstatusPago: number;
  NombreEstatus: string;
  FechaCreacion: Date | string;
  FechaActualizacion: Date | string;
}

export interface iUsuarioPago {
  UsuarioID: number;
  NombreUsuario: string;
  EmpleadoID: number;
  SucursalID: number | null;
}

export interface iPagoPendiente {
  PagoID: number;
  PolizaID: number;
  FechaPago: Date | string;
  MontoPagado: string;
  ReferenciaPago: string;
  NombreTitular: string;
  FechaMovimiento: Date | string;
  Validado: number;
  MotivoCancelacion: string | null;
  MetodoPago: iMetodoPago;
  EstatusPago: iEstatusPago;
  Usuario: iUsuarioPago;
}

export interface iValidarPagoPendiente {
  UsuarioValidoID: number;
  Validado: boolean;
}
