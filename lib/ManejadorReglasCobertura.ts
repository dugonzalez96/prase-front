import {
  iGetAllCobertura,
  iGetAllReglaNegocio,
} from "@/interfaces/ReglasNegocios";

interface ValoresCobertura {
  sumaAseguradaMin: number;
  sumaAseguradaMax: number;
  primaBase: number;
  deducibleMin: number;
  deducibleMax: number;
  porcentajePrima: number;
  rangoSeleccion: number;
  tipoMonedaID?: number;
}

interface ValoresFormulario {
  Estado?: string;
  Modelo?: string;
  Marca?: string;
  marcaNombre?: string;
  Submarca?: string;
  modeloNombre?: string;
  Version?: string;
  versionNombre?: string;
  CP?: string;
  UsoVehiculo?: number;
  TipoVehiculo?: number;
  SumaAsegurada?: number;
  [key: string]: any;
}

const evaluarCondicion = (
  condicion: {
    Campo: string;
    Operador: string;
    Evaluacion: string;
  },
  valoresFormulario: Record<string, any>
): boolean => {
  const valorCampo = valoresFormulario[condicion.Campo];
  const valorEvaluacion = condicion.Evaluacion;

  if (!valorCampo) return false;

  switch (condicion.Operador) {
    case "=":
      return valorCampo.toLowerCase() === valorEvaluacion.toLowerCase();
    case ">":
      return Number(valorCampo) > Number(valorEvaluacion);
    case "<":
      return Number(valorCampo) < Number(valorEvaluacion);
    case ">=":
      return Number(valorCampo) >= Number(valorEvaluacion);
    case "<=":
      return Number(valorCampo) <= Number(valorEvaluacion);
    default:
      return false;
  }
};

export const aplicarReglasPorCobertura = (
  cobertura: iGetAllCobertura,
  reglas: iGetAllReglaNegocio[],
  valoresFormulario: ValoresFormulario
): ValoresCobertura => {
  // Inicializar todos los valores desde la cobertura original
  const valores: ValoresCobertura = {
    sumaAseguradaMin: Number(cobertura.SumaAseguradaMin),
    sumaAseguradaMax: Number(cobertura.SumaAseguradaMax),
    primaBase: Number(cobertura.PrimaBase),
    deducibleMin: Number(cobertura.DeducibleMin),
    deducibleMax: Number(cobertura.DeducibleMax),
    porcentajePrima: Number(cobertura.PorcentajePrima),
    rangoSeleccion: Number(cobertura.RangoSeleccion),
    tipoMonedaID: cobertura.tipoMoneda?.TipoMonedaID,
  };

  // Filtrar reglas aplicables (globales o específicas para esta cobertura)
  const reglasAplicables = reglas.filter(
    (regla) =>
      regla.Activa &&
      (regla.EsGlobal || regla.cobertura?.CoberturaID === cobertura.CoberturaID)
  );

  reglasAplicables.forEach((regla) => {
    const condicionesCumplidas = regla.condiciones.every((condicion) =>
      evaluarCondicion(condicion, valoresFormulario)
    );

    if (condicionesCumplidas) {
      const valorCondicion = regla.condiciones[0]?.Valor;
      const valorAjuste = Number(regla.ValorAjuste || valorCondicion || 0);

      // Actualizar tipo de moneda si está especificado
      if (regla.TipoMonedaID) {
        valores.tipoMonedaID = regla.TipoMonedaID;
      }

      // Aplicar la regla según su tipo
      switch (regla.TipoRegla) {
        case "SumaAsegurada":
          // Si el tipo de moneda cambia, convertir el valor
          const valorAjustadoSuma = obtenerValorAjustado(
            valorAjuste,
            cobertura.tipoMoneda?.TipoMonedaID || 4,
            regla.TipoMonedaID,
            Number(process.env.VALOR_UMA || 0)
          );
          valores.sumaAseguradaMin = valorAjustadoSuma;
          valores.sumaAseguradaMax = valorAjustadoSuma;

          break;

        case "Prima":
          valores.primaBase = valorAjuste;
          break;

        case "Deducible":
          valores.deducibleMin = valorAjuste;
          valores.deducibleMax = valorAjuste;
          break;

        case "TasaBase":
          valores.porcentajePrima = Math.max(
            0,
            valores.porcentajePrima * (1 + valorAjuste / 100)
          );
          break;

        case "RangoSeleccion":
          valores.rangoSeleccion = valorAjuste;
          break;
      }
    }
  });

  return valores;
};

export const obtenerValorAjustado = (
  valor: number,
  tipoMonedaOriginal: number,
  tipoMonedaNuevo: number | undefined,
  valorUMA: number
): number => {
  if (!tipoMonedaNuevo || tipoMonedaOriginal === tipoMonedaNuevo) {
    return valor;
  }

  if (tipoMonedaOriginal === 1 && tipoMonedaNuevo === 5) {
    return valor / valorUMA;
  } else if (tipoMonedaOriginal === 5 && tipoMonedaNuevo === 1) {
    return valor * valorUMA;
  }

  return valor;
};
