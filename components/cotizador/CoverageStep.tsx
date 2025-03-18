import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Info, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StepProps } from "@/types/cotizador";
import { formatCurrency } from "@/lib/format";
import { PlanPago } from "./PlanPago";
import { aplicarReglasPorCobertura } from "../../lib/ManejadorReglasCobertura";
import { Switch } from "../ui/switch";
import { CalculadoraPrimaUniversal } from "./CalculadoraPrimaUniversal";
import { valorUMA } from "@/lib/constants";

type TipoCalculo = "fijo" | "cobertura";

interface CoberturaExtendida {
  sumaAseguradaPorPasajeroOriginal: boolean;
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
  CoberturaAmparada: boolean;
  sumaAseguradaPorPasajero: boolean;
  IndiceSiniestralidad: null;
  tipoDeducible: {
    TipoDeducibleID: number;
    Nombre: string;
  };
  tipoMoneda: {
    TipoMonedaID: number;
    Nombre: string;
    Abreviacion: string;
  };
  Obligatoria?: boolean;
  deducibleSeleccionado?: number;
  sumaAseguradaPersonalizada?: number;
  valorSeleccionado?: number;
  primaMinima: string;
  primaMaxima: string;
  factorDecrecimiento: string;
  rangoCobertura: string;
}

export const CoverageStep = ({
  form,
  paquetesCobertura,
  coberturas,
  asociaciones,
  tiposPagos,
  setIsStepValid,
  reglasNegocio,
  tiposMoneda,
}: StepProps) => {
  const [coberturasSeleccionadas, setCoberturasSeleccionadas] = useState<
    CoberturaExtendida[]
  >([]);
  const [costoBaseAnual, setCostoBaseAnual] = useState("");
  const [montoFijo, setMontoFijo] = useState("");

  const tipoCalculo = form.watch("tipoCalculo");
  const paqueteId = form.watch("PaqueteCoberturaID");
  const calculadoraPrima = new CalculadoraPrimaUniversal();

  useEffect(() => {
    if (paqueteId && tipoCalculo) {
      manejarSeleccionPaquete(paqueteId.toString());

      if (tipoCalculo === "fijo") {
        const paqueteSeleccionado = paquetesCobertura?.find(
          (p) => p.PaqueteCoberturaID === paqueteId
        );
        if (paqueteSeleccionado?.PrecioTotalFijo) {
          setMontoFijo(paqueteSeleccionado.PrecioTotalFijo);
          const costoAnual = ((Number(paqueteSeleccionado.PrecioTotalFijo) * 100) / 116) - form.getValues('DerechoPoliza');
          setCostoBaseAnual(costoAnual.toString());
        }
      }
    }
  }, []);

  const obtenerSumaAsegurada = useCallback(
    (cobertura: CoberturaExtendida): number => {
      if (cobertura.CoberturaAmparada) return 0;

      if (cobertura.valorSeleccionado !== undefined) {
        return cobertura.valorSeleccionado;
      }

      if (cobertura.AplicaSumaAsegurada) {
        return cobertura.sumaAseguradaPersonalizada || form.getValues("SumaAsegurada");
      }

      if (cobertura.tipoMoneda.Abreviacion === "UMA") {
        return parseFloat(cobertura.SumaAseguradaMin) * valorUMA;
      }

      return parseFloat(cobertura.rangoCobertura || cobertura.SumaAseguradaMin);
    },
    [form]
  );

  const obtenerDeducible = useCallback((cobertura: CoberturaExtendida): number => {
    // if (cobertura.CoberturaAmparada) return 0;
    if (cobertura.tipoDeducible.Nombre === "UMA") {
      return (
        cobertura.deducibleSeleccionado || parseInt(cobertura.DeducibleMin)
      );
    }

    return (
      cobertura.deducibleSeleccionado || parseFloat(cobertura.DeducibleMin)
    );
  }, []);

  const calcularPrima = useCallback(
    (cobertura: CoberturaExtendida, tipo: TipoCalculo): number => {
      if (tipo === "fijo" || cobertura.SinValor) return 0;

      const sumaAsegurada = obtenerSumaAsegurada(cobertura);
      const deducible = obtenerDeducible(cobertura);

      if (Number(cobertura.PrimaBase) > 1) {
        return parseFloat(cobertura.PrimaBase);
      }

      const config = {
        // Convertimos los porcentajes a decimales (ej: 0.84% -> 0.0084)
        primaMinima: parseFloat(cobertura.primaMinima) / 100,
        primaMaxima: parseFloat(cobertura.primaMaxima) / 100,
        sumaAseguradaMinima: parseFloat(cobertura.SumaAseguradaMin),
        sumaAseguradaMaxima: parseFloat(cobertura.SumaAseguradaMax),
        factorDecrecimiento: parseFloat(cobertura.factorDecrecimiento)
      };

      const primaBase = calculadoraPrima.calcularPrima(sumaAsegurada, config);

      if (cobertura.CoberturaAmparada) {
        return primaBase;
      }

      if (cobertura.tipoDeducible.Nombre === "UMA") {
        const deduciblePesos = deducible * valorUMA;
        const factorReduccion = deduciblePesos / sumaAsegurada;
        return primaBase * (1 - factorReduccion);
      }

      return primaBase * (1 - deducible / 100);
    },
    [obtenerSumaAsegurada, obtenerDeducible]
  );
  const actualizarDetalles = useCallback(
    (coberturas: CoberturaExtendida[]) => {
      const detalles = coberturas.map((cobertura) => {
        const deducible = obtenerDeducible(cobertura);
        const displayDeducible = cobertura.tipoDeducible.Nombre === "UMA"
          ? `${deducible} UMAS`
          : `${deducible}%`;

        return {
          CoberturaID: cobertura.CoberturaID,
          NombreCobertura: cobertura.NombreCobertura,
          Descripcion: cobertura.Descripcion,
          MontoSumaAsegurada: obtenerSumaAsegurada(cobertura),
          DeducibleID: cobertura.tipoDeducible.TipoDeducibleID,
          MontoDeducible: deducible,
          PrimaCalculada: calcularPrima(cobertura, tipoCalculo || "cobertura"),
          PorcentajePrimaAplicado: parseFloat(cobertura.PorcentajePrima),
          ValorAseguradoUsado: obtenerSumaAsegurada(cobertura),
          Obligatoria: cobertura.Obligatoria || false,
          DisplaySumaAsegurada: cobertura.CoberturaAmparada
            ? "AMPARADA"
            : cobertura.tipoMoneda.Abreviacion === "UMA"
              ? `${cobertura.SumaAseguradaMax} UMAS`
              : undefined,
          DisplayDeducible: displayDeducible,
          TipoMoneda: cobertura.tipoMoneda.Abreviacion,
          EsAmparada: cobertura.CoberturaAmparada,
          SumaAseguradaPorPasajero: cobertura.sumaAseguradaPorPasajero,
          TipoDeducible: cobertura.tipoDeducible.Nombre,
        };
      });

      form.setValue("detalles", detalles, { shouldValidate: true });
    },
    [form, obtenerDeducible]
  );

  const manejarCambioTipoCalculo = useCallback(
    (valor: TipoCalculo) => {
      form.setValue("tipoCalculo", valor);
      form.setValue("PaqueteCoberturaID", 0);
      setCoberturasSeleccionadas([]);
      setMontoFijo("");
      setIsStepValid?.(false);
    },
    [form, setIsStepValid]
  );

  const manejarSeleccionPaquete = useCallback(
    (valor: string) => {
      if (valor === "none") {
        form.setValue("PaqueteCoberturaID", 0);
        form.setValue("detalles", []);
        form.setValue("PrimaTotal", 0);
        setCoberturasSeleccionadas([]);
        setMontoFijo("");
        setIsStepValid?.(false);
        return;
      }

      const paqueteId = parseInt(valor);
      form.setValue("PaqueteCoberturaID", paqueteId);

      const paqueteSeleccionado = paquetesCobertura?.find(
        (p) => p.PaqueteCoberturaID === paqueteId
      );

      const asociacionesPaquete =
        asociaciones?.filter((a) => a.PaqueteCoberturaID === paqueteId) ?? [];

      const valoresFormulario = {
        Estado: form.getValues("Estado"),
        Modelo: form.getValues("Modelo"),
        Marca: form.getValues("Marca"),
        marcaNombre: form.getValues("marcaNombre"),
        Submarca: form.getValues("Submarca"),
        modeloNombre: form.getValues("modeloNombre"),
        Version: form.getValues("Version"),
        versionNombre: form.getValues("versionNombre"),
        CP: form.getValues("CP"),
        UsoVehiculo: form.getValues("UsoVehiculo"),
        TipoVehiculo: form.getValues("TipoVehiculo"),
        SumaAsegurada: form.getValues("SumaAsegurada"),
      };

      const coberturasDelPaquete = asociacionesPaquete
        .map((asociacion) => {
          const cobertura = coberturas?.find(
            (c) => c.CoberturaID === asociacion.CoberturaID
          );
          if (!cobertura) return null;

          const valoresAjustados = aplicarReglasPorCobertura(
            cobertura,
            reglasNegocio || [],
            valoresFormulario
          );

          const coberturaNueva = { ...cobertura };

          if (valoresAjustados.tipoMonedaID) {
            const tipoMonedaNuevo = tiposMoneda?.find(
              (tipo) => tipo.TipoMonedaID === valoresAjustados.tipoMonedaID
            );
            if (tipoMonedaNuevo) {
              coberturaNueva.tipoMoneda = tipoMonedaNuevo;
            }
          }

          return {
            ...coberturaNueva,
            sumaAseguradaPorPasajeroOriginal: cobertura.sumaAseguradaPorPasajero,
            SumaAseguradaMin: valoresAjustados.sumaAseguradaMin.toString(),
            SumaAseguradaMax: valoresAjustados.sumaAseguradaMax.toString(),
            PrimaBase: valoresAjustados.primaBase.toString(),
            DeducibleMin: valoresAjustados.deducibleMin.toString(),
            DeducibleMax: valoresAjustados.deducibleMax.toString(),
            Obligatoria: asociacion.Obligatoria,
            deducibleSeleccionado: valoresAjustados.deducibleMin,
          } as CoberturaExtendida;
        })
        .filter((c): c is CoberturaExtendida => c !== null);

      setCoberturasSeleccionadas(coberturasDelPaquete);
      actualizarDetalles(coberturasDelPaquete);

      if (tipoCalculo === "fijo" && paqueteSeleccionado?.PrecioTotalFijo) {
        setMontoFijo(paqueteSeleccionado.PrecioTotalFijo);
        const costoAnual = ((Number(paqueteSeleccionado.PrecioTotalFijo) * 100) / 116) - form.getValues('DerechoPoliza');
        setCostoBaseAnual(costoAnual.toString());
        form.setValue("PrimaTotal", costoAnual);
      } else {
        const primaTotal = coberturasDelPaquete.reduce(
          (total, cobertura) => total + calcularPrima(cobertura, "cobertura"),
          0
        );
        form.setValue("PrimaTotal", primaTotal);
      }

      if (coberturasDelPaquete.length > 0) setIsStepValid?.(true);
      else setIsStepValid?.(false);
    },
    [form, paquetesCobertura, asociaciones, coberturas, reglasNegocio, tipoCalculo, tiposMoneda, actualizarDetalles, calcularPrima, setIsStepValid]
  );

  const manejarCambioMontoFijo = useCallback(
    (valor: string) => {

      //Obtenemos el pago anual ya con iba y derecho de póliza
      const costoDerecho = form.getValues('DerechoPoliza');
      const costoAnual = ((Number(valor) * 100) / 116) - costoDerecho;

      setCostoBaseAnual(costoAnual.toString())
      setMontoFijo(valor.toString());
      form.setValue("PrimaTotal", costoAnual || 0);
    },
    [form]
  );

  const manejarCambioDeducible = useCallback(
    (coberturaId: number, valor: string) => {
      const nuevasCoberturas = coberturasSeleccionadas.map((cobertura) =>
        cobertura.CoberturaID === coberturaId
          ? { ...cobertura, deducibleSeleccionado: parseInt(valor) }
          : cobertura
      );

      setCoberturasSeleccionadas(nuevasCoberturas);

      const nuevosDetalles = nuevasCoberturas.map((cobertura) => {
        const montoSumaAsegurada = obtenerSumaAsegurada(cobertura);
        const deducible = obtenerDeducible(cobertura);
        const prima = calcularPrima(cobertura, "cobertura");

        return {
          CoberturaID: cobertura.CoberturaID,
          NombreCobertura: cobertura.NombreCobertura,
          Descripcion: cobertura.Descripcion,
          MontoSumaAsegurada: montoSumaAsegurada,
          DeducibleID: cobertura.tipoDeducible.TipoDeducibleID,
          MontoDeducible: deducible,
          PrimaCalculada: prima,
          PorcentajePrimaAplicado: parseFloat(cobertura.PorcentajePrima),
          ValorAseguradoUsado: montoSumaAsegurada,
          Obligatoria: cobertura.Obligatoria || false,
          TipoDeducible: cobertura.tipoDeducible.Nombre,
          TipoMoneda: cobertura.tipoMoneda.Abreviacion,
        };
      });

      form.setValue("detalles", nuevosDetalles);

      const nuevaPrimaTotal = nuevosDetalles.reduce(
        (total, detalle) => total + detalle.PrimaCalculada,
        0
      );
      form.setValue("PrimaTotal", nuevaPrimaTotal);
    },
    [coberturasSeleccionadas, obtenerSumaAsegurada, obtenerDeducible, calcularPrima, form]
  );

  const manejarEliminarCobertura = useCallback(
    (coberturaId: number) => {
      const nuevasCoberturas = coberturasSeleccionadas.filter(
        (cobertura) => cobertura.CoberturaID !== coberturaId
      );

      setCoberturasSeleccionadas(nuevasCoberturas);
      actualizarDetalles(nuevasCoberturas);

      if (tipoCalculo === "cobertura") {
        const primaTotal = nuevasCoberturas.reduce(
          (total, cobertura) => total + calcularPrima(cobertura, tipoCalculo),
          0
        );
        form.setValue("PrimaTotal", primaTotal);
      }
    },
    [
      coberturasSeleccionadas,
      actualizarDetalles,
      tipoCalculo,
      calcularPrima,
      form,
    ]
  );

  const manejarCambioSumaAsegurada = useCallback(
    (coberturaId: number, nuevoValor: string) => {
      const valorNumerico = parseFloat(nuevoValor);

      const nuevasCoberturas = coberturasSeleccionadas.map((cobertura) => {
        if (cobertura.CoberturaID === coberturaId) {
          return {
            ...cobertura,
            sumaAseguradaPersonalizada: valorNumerico,
            valorSeleccionado: valorNumerico
          };
        }
        return cobertura;
      });

      setCoberturasSeleccionadas(nuevasCoberturas);

      const nuevosDetalles = nuevasCoberturas.map((cobertura) => {
        const montoSumaAsegurada = obtenerSumaAsegurada(cobertura);
        const deducible = obtenerDeducible(cobertura);
        const prima = calcularPrima(cobertura, "cobertura");

        return {
          CoberturaID: cobertura.CoberturaID,
          NombreCobertura: cobertura.NombreCobertura,
          Descripcion: cobertura.Descripcion,
          MontoSumaAsegurada: montoSumaAsegurada,
          DeducibleID: cobertura.tipoDeducible.TipoDeducibleID,
          MontoDeducible: deducible,
          PrimaCalculada: prima,
          PorcentajePrimaAplicado: parseFloat(cobertura.PorcentajePrima),
          ValorAseguradoUsado: montoSumaAsegurada,
          Obligatoria: cobertura.Obligatoria || false,
        };
      });

      form.setValue("detalles", nuevosDetalles);

      const nuevaPrimaTotal = nuevosDetalles.reduce(
        (total, detalle) => total + detalle.PrimaCalculada,
        0
      );
      form.setValue("PrimaTotal", nuevaPrimaTotal);
    },
    [coberturasSeleccionadas, obtenerSumaAsegurada, obtenerDeducible, calcularPrima, form]
  );

  const generarRangosSumaAsegurada = useCallback(
    (sumaBase: number, limiteInferior: number, limiteSuperior: number): number[] => {
      const rangos: number[] = [];
      const esMayorA500k = sumaBase > 1000000;
      const incremento = esMayorA500k ? 100000 : 10000;
      // const limiteInferior = Math.floor(sumaBase * 0.5);
      // const limiteSuperior = sumaBase;

      for (
        let valor = limiteInferior;
        valor <= limiteSuperior;
        valor += incremento
      ) {
        rangos.push(valor);
      }

      if (!rangos.includes(sumaBase)) {
        rangos.push(sumaBase);
        rangos.sort((a, b) => a - b);
      }

      return rangos;
    },
    []
  );

  const renderizarValorCobertura = useCallback(
    (cobertura: CoberturaExtendida): React.ReactNode => {
      const sumaAseguradaAnterior = form.getValues("SumaAsegurada");

      // console.log(cobertura)

      // Si la cobertura aplica suma asegurada, mostrar el select
      if (cobertura.AplicaSumaAsegurada) {
        const limiteInferior = Math.floor(sumaAseguradaAnterior * 0.5)
        const limiteSuperior = sumaAseguradaAnterior;
        const rangos = generarRangosSumaAsegurada(sumaAseguradaAnterior, limiteInferior, limiteSuperior);
        const valorActual =
          cobertura.sumaAseguradaPersonalizada || sumaAseguradaAnterior;

        return (
          <Select
            value={valorActual.toString()}
            onValueChange={(valor) =>
              manejarCambioSumaAsegurada(cobertura.CoberturaID, valor)
            }
            disabled
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue>
                {formatCurrency(parseFloat(valorActual.toString()))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {rangos.map((valor) => (
                <SelectItem key={valor} value={valor.toString()}>
                  {formatCurrency(valor)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      // Si es cobertura amparada
      if (cobertura.CoberturaAmparada) {
        return "AMPARADA";
      }

      // Si es por pasajero
      if (cobertura.sumaAseguradaPorPasajeroOriginal) {
        let montoTexto;
        if (cobertura.tipoMoneda.Abreviacion === "UMA") {
          montoTexto = `${cobertura.SumaAseguradaMax} UMAS`;
        } else if (
          Number(cobertura.SumaAseguradaMin) <= 1 &&
          Number(cobertura.SumaAseguradaMax) <= 1
        ) {
          montoTexto = formatCurrency(sumaAseguradaAnterior);
        } else {
          montoTexto = formatCurrency(Number(cobertura.SumaAseguradaMax));
        }

        // Para montos en pesos
        const rangosMax = generarRangosSumaAsegurada(
          Number(cobertura.SumaAseguradaMax),
          Number(cobertura.SumaAseguradaMin),
          Number(cobertura.SumaAseguradaMax)
        );
        const valorSelect = cobertura.sumaAseguradaPersonalizada || cobertura.SumaAseguradaMin;

        return (
          <>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <Select
                  value={valorSelect.toString()}
                  onValueChange={(valor) =>
                    manejarCambioSumaAsegurada(cobertura.CoberturaID, valor)
                  }
                // disabled={cobertura.tipoMoneda.Abreviacion === 'UMA'}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue>
                      {cobertura.tipoMoneda.Abreviacion === 'UMA' ? `${valorSelect.toString()} UMAS` : formatCurrency(parseFloat(valorSelect.toString()))}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {rangosMax.map((valor) => (
                      <SelectItem key={valor} value={valor.toString()}>
                        {cobertura.tipoMoneda.Abreviacion === 'UMA' ? `${valor.toString()} UMAS` : formatCurrency(valor)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  {cobertura.sumaAseguradaPorPasajero ? "POR CADA PASAJERO" : "TOTAL"}
                </span>
              </div>
              <Switch
                checked={cobertura.sumaAseguradaPorPasajero}
                onCheckedChange={(valor) => {
                  const nuevasCoberturas = coberturasSeleccionadas.map((c) => {
                    if (c.CoberturaID === cobertura.CoberturaID) {
                      return {
                        ...c,
                        sumaAseguradaPorPasajero: valor
                      };
                    }
                    return c;
                  });

                  setCoberturasSeleccionadas(nuevasCoberturas);
                  actualizarDetalles(nuevasCoberturas);
                }}
                className="ml-2"
              />
            </div>
          </>
        );
      }

      // Para montos en UMA
      if (cobertura.tipoMoneda.Abreviacion === "UMA") {
        return `${cobertura.SumaAseguradaMax} UMAS`;
      }

      // Para montos en pesos
      const rangosMax = generarRangosSumaAsegurada(
        Number(cobertura.SumaAseguradaMax),
        Number(cobertura.SumaAseguradaMin),
        Number(cobertura.SumaAseguradaMax)
      );

      const valorSelect = cobertura.sumaAseguradaPersonalizada || cobertura.rangoCobertura;

      return (
        <Select
          value={valorSelect.toString()}
          onValueChange={(valor) =>
            manejarCambioSumaAsegurada(cobertura.CoberturaID, valor)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue>
              {formatCurrency(parseFloat(valorSelect.toString()))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {rangosMax.map((valor) => (
              <SelectItem key={valor} value={valor.toString()}>
                {formatCurrency(valor)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
    [form, generarRangosSumaAsegurada, manejarCambioSumaAsegurada]
  );

  const generarRangoDeducibles = useCallback(
    (cobertura: CoberturaExtendida): number[] => {
      const min = parseInt(cobertura.DeducibleMin) || 0;
      const max = parseInt(cobertura.DeducibleMax) || 0;
      const rango = parseInt(cobertura.RangoSeleccion) || 1;

      if (rango === 0 || min === max || min > max) {
        return [min, max].filter(
          (val, index, arr) => arr.indexOf(val) === index && val !== 0
        );
      }

      const deducibles: number[] = [];
      const iteraciones = Math.floor((max - min) / rango) + 1;

      for (let i = 0; i < Math.min(iteraciones, 100); i++) {
        const valor = min + i * rango;
        if (valor <= max) deducibles.push(valor);
      }

      if (deducibles[deducibles.length - 1] !== max) {
        deducibles.push(max);
      }

      return deducibles;
    },
    []
  );

  const renderizarSelectorDeducible = useCallback(
    (cobertura: CoberturaExtendida) => {
      // if (cobertura.CoberturaAmparada) return "NO APLICA";

      const deducibles = generarRangoDeducibles(cobertura);

      if (cobertura.tipoDeducible.Nombre === "UMA") {
        return (
          <>
            {deducibles.length > 0 ? (
              <Select
                value={
                  cobertura.deducibleSeleccionado?.toString() ||
                  `${cobertura.DeducibleMax} UMAS`
                }
                onValueChange={(valor) =>
                  manejarCambioDeducible(cobertura.CoberturaID, valor)
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deducibles.map((deducible) => (
                    <SelectItem key={deducible} value={deducible.toString()}>
                      {deducible} UMAS
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div>NO APLICA</div>
            )}
          </>
        );
      }

      return (
        <>
          {deducibles.length > 0 ? (
            <Select
              value={
                cobertura.deducibleSeleccionado?.toString() ||
                cobertura.DeducibleMin
              }
              onValueChange={(valor) =>
                manejarCambioDeducible(cobertura.CoberturaID, valor)
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {deducibles.map((deducible) => (
                  <SelectItem key={deducible} value={deducible.toString()}>
                    {deducible}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div>NO APLICA</div>
          )}
        </>
      );
    },
    [tipoCalculo, generarRangoDeducibles, manejarCambioDeducible]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Selección de Coberturas
          </CardTitle>
          <CardDescription>
            Elige cómo quieres calcular las coberturas de tu seguro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="tipoCalculo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Cálculo</FormLabel>
                <Select
                  onValueChange={manejarCambioTipoCalculo}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de cálculo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fijo">Monto Fijo</SelectItem>
                    <SelectItem value="cobertura">Cálculo por Coberturas</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Elige cómo quieres que se calcule el costo de tu seguro
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="PaqueteCoberturaID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paquete de Coberturas</FormLabel>
                <Select
                  onValueChange={manejarSeleccionPaquete}
                  value={field.value ? field.value.toString() : "none"}
                  disabled={!tipoCalculo}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un paquete" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {paquetesCobertura?.sort((a, b) => a.NombrePaquete.localeCompare(b.NombrePaquete))
                      .map((paquete) => (
                        <SelectItem
                          key={paquete.PaqueteCoberturaID}
                          value={paquete.PaqueteCoberturaID.toString()}
                        >
                          {paquete.NombrePaquete}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {tipoCalculo === "fijo"
                    ? "Selecciona un paquete con precio fijo"
                    : "Selecciona un paquete para calcular el costo por coberturas"}
                </FormDescription>
              </FormItem>
            )}
          />

          {tipoCalculo === "fijo" && coberturasSeleccionadas.length > 0 && (
            <FormItem>
              <FormLabel>Monto Fijo del Paquete</FormLabel>
              <Input
                placeholder="Ingrese el monto fijo"
                value={formatCurrency(Number(montoFijo))}
                onChange={(e) => {
                  const valor = e.target.value.replace(/[^0-9]/g, "");
                  manejarCambioMontoFijo((Number(valor) / 100).toString())
                }}
              />
              <FormDescription>
                Este es el monto fijo para el paquete seleccionado
              </FormDescription>
            </FormItem>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Coberturas */}
      {coberturasSeleccionadas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Coberturas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cobertura</TableHead>
                    <TableHead>Suma Asegurada</TableHead>
                    <TableHead>Deducible</TableHead>
                    {tipoCalculo === "cobertura" && (
                      <TableHead>Prima</TableHead>
                    )}
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coberturasSeleccionadas.map((cobertura) => (
                    <TableRow key={cobertura.CoberturaID}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-help">
                                  <span>{cobertura.NombreCobertura}</span>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  {cobertura.Descripcion}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {cobertura.Obligatoria && (
                            <Badge variant="outline">Obligatoria</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderizarValorCobertura(cobertura)}
                      </TableCell>
                      <TableCell>
                        {renderizarSelectorDeducible(cobertura)}
                      </TableCell>
                      {tipoCalculo === "cobertura" && (
                        <TableCell className="font-medium">
                          {formatCurrency(
                            calcularPrima(cobertura, "cobertura")
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        {!cobertura.Obligatoria && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              manejarEliminarCobertura(cobertura.CoberturaID)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {coberturasSeleccionadas.length > 0 &&
        tiposPagos &&
        tiposPagos.length > 0 && (
          <PlanPago
            form={form}
            tiposPagos={tiposPagos}
            costoBase={
              tipoCalculo === "fijo"
                ? parseFloat(costoBaseAnual) || 0
                : coberturasSeleccionadas.reduce(
                  (total, cobertura) =>
                    total + calcularPrima(cobertura, "cobertura"),
                  0
                )
            }
            derechoPoliza={form.getValues("DerechoPoliza") ?? 0}
          />
        )}
    </div>
  );
};

export default CoverageStep;
