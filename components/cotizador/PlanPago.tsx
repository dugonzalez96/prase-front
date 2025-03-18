import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "@/types/cotizador";
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import { iAjustesCP } from "@/interfaces/AjustesCPInterace";
import { getAjustesCP } from "@/actions/AjustesCP";
import { useCalculosPrima } from "@/hooks/useCalculoPrima";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface PropiedadesPlanPago {
  form: UseFormReturn<FormData>;
  tiposPagos: iGetTipoPagos[];
  costoBase: number;
  derechoPoliza: number;
}

export const PlanPago = ({
  form,
  tiposPagos,
  costoBase,
  derechoPoliza,
}: PropiedadesPlanPago) => {
  const [ajustes, setAjustes] = useState<iAjustesCP>();
  const [showMensual, setShowMensual] = useState(false);
  const { calcularAjustes, obtenerPagos } = useCalculosPrima();
  const codigoPostal = form.watch("CP");

  useEffect(() => {
    const obtenerAjustes = async () => {
      if (!codigoPostal) return;
      try {
        const respuesta = await getAjustesCP(codigoPostal);
        if (respuesta?.ajuste) setAjustes(respuesta);
      } catch (error) {
        console.error("Error al obtener ajustes:", error);
      }
    };

    obtenerAjustes();
  }, [codigoPostal]);

  const formData = form.getValues();
  const bonificacion = form.watch("PorcentajeDescuento") || 0;
  const tipoPagoAnual = tiposPagos.find((t) => t.Descripcion.toLowerCase().includes('anual'));
  const tipoPagoSemestral = tiposPagos.find((t) => t.Descripcion.toLowerCase().includes('semestral'));
  const tipoPagoTrimestral = tiposPagos.find((t) => t.Descripcion.toLowerCase().includes('trimestral'));
  const tipoPagoMensual = tiposPagos.find((t) => t.Descripcion.toLowerCase().includes('mensual'));

  const resultadosAnual = calcularAjustes({
    form,
    costoBase,
    ajustesCP: ajustes,
    tipoPago: tipoPagoAnual,
  });

  const resultadosSemestral = calcularAjustes({
    form,
    costoBase,
    ajustesCP: ajustes,
    tipoPago: tipoPagoSemestral,
  });

  const resultadosTrimestral = calcularAjustes({
    form,
    costoBase,
    ajustesCP: ajustes,
    tipoPago: tipoPagoTrimestral,
  });

  const resultadosMensual = calcularAjustes({
    form,
    costoBase,
    ajustesCP: ajustes,
    tipoPago: tipoPagoMensual,
  });

  const detallesPagoSemestral = tipoPagoSemestral ? obtenerPagos(
    formData.CostoNeto,
    tipoPagoSemestral,
    derechoPoliza
  ) : null;

  const detallesPagoTrimestral = tipoPagoTrimestral ? obtenerPagos(
    formData.CostoNeto,
    tipoPagoTrimestral,
    derechoPoliza
  ) : null;

  const detallesPagoMensual = tipoPagoMensual ? obtenerPagos(
    formData.CostoNeto,
    tipoPagoMensual,
    derechoPoliza
  ) : null;

  const validarBonificacion = (valor: string): number => {
    if (valor === "") return 0;
    const numero = Math.min(Math.max(Number(valor), 0), 35);
    return isNaN(numero) ? 0 : numero;
  };

  form.setValue('costoTotalAnual', resultadosAnual.total);
  form.setValue('costoTotalSemestral', resultadosSemestral.total);
  form.setValue('costoTotalTrimestral', resultadosTrimestral.total);
  form.setValue('costoTotalMensual', resultadosMensual.total);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Plan de pago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="PorcentajeDescuento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bonificación técnica (%)</FormLabel>
                <FormControl>
                  <Input
                    value={field.value || ""}
                    placeholder="0-35%"
                    onFocus={(e) => {
                      if (e.target.value === "0") {
                        field.onChange("");
                      }
                    }}
                    onChange={(e) => {
                      const valorValidado = validarBonificacion(e.target.value);
                      field.onChange(valorValidado);
                      calcularAjustes({
                        form,
                        costoBase,
                        ajustesCP: ajustes,
                        tipoPago: tipoPagoAnual
                      });
                    }}
                  />
                </FormControl>
                <FormDescription>Min. 0% - Max. 35%</FormDescription>
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-end gap-4 items-center">
            <span className="font-medium">Costo Base:</span>
            <span>{formatCurrency(costoBase)}</span>
          </div>

          {resultadosAnual.ajusteSiniestralidad > 0 && (
            <div className="flex justify-end gap-4 items-center text-amber-600">
              <span className="font-medium">
                Ajuste por siniestralidad ({ajustes?.ajuste.AjustePrima}%):
              </span>
              <span>+{formatCurrency(resultadosAnual.ajusteSiniestralidad)}</span>
            </div>
          )}

          <div className="flex justify-end gap-4 items-center">
            <span className="font-medium">Subtotal con ajuste siniestralidad:</span>
            <span>{formatCurrency(resultadosAnual.subtotalSiniestralidad)}</span>
          </div>

          {resultadosAnual.bonificacion > 0 && (
            <div className="flex justify-end gap-4 items-center text-green-600">
              <span className="font-medium">
                Bonificación técnica ({bonificacion}%):
              </span>
              <span>-{formatCurrency(resultadosAnual.bonificacion)}</span>
            </div>
          )}

          <div className="flex justify-end gap-4 items-center font-medium">
            <span>Costo Neto:</span>
            <span>{formatCurrency(resultadosAnual.costoNeto)}</span>
          </div>

          <div className="flex justify-end gap-4 items-center">
            <span className="font-medium">Derecho de póliza:</span>
            <span>+{formatCurrency(derechoPoliza)}</span>
          </div>

          <div className="flex justify-end gap-4 items-center">
            <span className="font-medium">IVA (16%):</span>
            <span>+{formatCurrency(resultadosAnual.iva)}</span>
          </div>

          <div className="flex justify-end gap-4 items-center pt-2 border-t">
            <span className="text-lg font-semibold">Costo Total Pago Anual:</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(resultadosAnual.total)}
            </span>
          </div>

          <div className="flex justify-end gap-4 items-center pt-2 border-t">
            <span className="text-lg font-semibold">Costo Total Pago Semestral:</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(resultadosSemestral.total)}
            </span>
          </div>

          {detallesPagoSemestral && (
            <>
              <div className="flex justify-end gap-4 items-center pt-2 border-t">
                <span className="font-medium">Primer pago:</span>
                <span>{formatCurrency(detallesPagoSemestral.primerPago)}</span>
              </div>

              <div className="flex justify-end gap-4 items-center">
                <span className="font-medium">
                  {detallesPagoSemestral.numeroPagosSubsecuentes}{" "}
                  {detallesPagoSemestral.numeroPagosSubsecuentes === 1 ? "pago" : "pagos"}{" "}
                  subsecuentes:
                </span>
                <span>{formatCurrency(detallesPagoSemestral.pagoSubsecuente)}</span>
              </div>
            </>
          )}


          {/* Costo Trimestral */}
          <div className="flex justify-end gap-4 items-center pt-2 border-t">
            <span className="text-lg font-semibold">Costo Total Pago Trimestral:</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(resultadosTrimestral.total)}
            </span>
          </div>

          {detallesPagoTrimestral && (
            <>
              <div className="flex justify-end gap-4 items-center pt-2 border-t">
                <span className="font-medium">Primer pago:</span>
                <span>{formatCurrency(detallesPagoTrimestral.primerPago)}</span>
              </div>

              <div className="flex justify-end gap-4 items-center">
                <span className="font-medium">
                  {detallesPagoTrimestral.numeroPagosSubsecuentes}{" "}
                  {detallesPagoTrimestral.numeroPagosSubsecuentes === 1 ? "pago" : "pagos"}{" "}
                  subsecuentes:
                </span>
                <span>{formatCurrency(detallesPagoTrimestral.pagoSubsecuente)}</span>
              </div>
            </>
          )}

          {/* Costo Mensual */}
          {showMensual && (
            <>
              <div className="flex justify-end gap-4 items-center pt-2 border-t">
                <span className="text-lg font-semibold">Costo Total Pago Mensual:</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(resultadosMensual.total)}
                </span>
              </div>

              {detallesPagoMensual && (
                <>
                  <div className="flex justify-end gap-4 items-center pt-2 border-t">
                    <span className="font-medium">Primer pago:</span>
                    <span>{formatCurrency(detallesPagoMensual.primerPago)}</span>
                  </div>

                  <div className="flex justify-end gap-4 items-center">
                    <span className="font-medium">
                      {detallesPagoMensual.numeroPagosSubsecuentes}{" "}
                      {detallesPagoMensual.numeroPagosSubsecuentes === 1 ? "pago" : "pagos"}{" "}
                      subsecuentes:
                    </span>
                    <span>{formatCurrency(detallesPagoMensual.pagoSubsecuente)}</span>
                  </div>
                </>
              )}
            </>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="show-mensual"
              onCheckedChange={() => {
                setShowMensual(prevState => {
                  const nuevoEstado = !prevState;
                  form.setValue('showMensual', nuevoEstado);
                  return nuevoEstado;
                });
              }}
            />
            <Label htmlFor="show-mensual">Añadir opción mensual</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};