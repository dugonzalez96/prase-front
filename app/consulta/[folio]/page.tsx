"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  ListChecks,
  Calendar,
  DollarSign,
} from "lucide-react";

export default function EsquemaPagosPage() {
  const params = useParams();
  const folioParam = params?.folio;
  const folio = Array.isArray(folioParam) ? folioParam[0] : folioParam;

  const [esquemaPagos, setEsquemaPagos] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeVigencia, setMensajeVigencia] = useState<string | null>(null);

  const fetchEsquemaPagos = async (folio: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://prase-api-production.up.railway.app/polizas/esquema-pagos/${encodeURIComponent(
          folio
        )}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Error al obtener el esquema de pagos.");
        return;
      }

      const data = await response.json();
      setEsquemaPagos(data);

      // Validación de los mensajes de vigencia
      const fechaActual = new Date();
      const tienePagosExitosos = data.esquemaPagos.some(
        (pago: any) => pago.estado === "Pagado"
      );

      if (tienePagosExitosos) {
        setMensajeVigencia("PÓLIZA VIGENTE Y AL CORRIENTE");
      } else {
        const pagosPendientes = data.esquemaPagos.filter(
          (pago: any) => new Date(fechaActual) <= new Date(pago.fechaPago)
        );

        if (pagosPendientes.length > 0) {
          const fechaLimitePago = ajustarFecha(pagosPendientes[0].fechaPago);
          setMensajeVigencia(
            `Cliente se encuentra en periodo de gracia. Vence el día ${fechaLimitePago}. Su vehículo no se encuentra asegurado hasta que realice el pago.`
          );
        } else if (data.mensajeAtraso) {
          setMensajeVigencia(data.mensajeAtraso);
        }
      }
    } catch (error: any) {
      console.error("Error:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const ajustarFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return fecha.toLocaleDateString();
  };

  useEffect(() => {
    if (folio) fetchEsquemaPagos(folio);
  }, [folio]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-100 py-5 shadow-md">
        <div className="container mx-auto flex items-center justify-center">
          <Image
            src="/prase-logo.png"
            alt="Prase logo"
            width={150}
            height={150}
            className="mx-auto"
          />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto py-10 px-4">
        {/* Folio de Póliza */}
        <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-4">
          Póliza: <span className="text-blue-600">{folio || "N/A"}</span>
        </h1>

        {/* Mensaje de Vigencia */}
        {mensajeVigencia && (
          <div
            className={`flex items-center justify-center gap-2 font-bold mb-5 p-4 rounded-lg shadow-md ${
              mensajeVigencia.includes("VIGENTE")
                ? "bg-green-50 text-green-600"
                : mensajeVigencia.includes("gracia")
                ? "bg-yellow-50 text-yellow-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {mensajeVigencia.includes("VIGENTE") ? (
              <CheckCircle className="w-6 h-6" />
            ) : mensajeVigencia.includes("gracia") ? (
              <Clock className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
            <span>{mensajeVigencia}</span>
          </div>
        )}

        {/* Loader y Error */}
        {loading && (
          <p className="text-center text-gray-600 font-medium">
            Cargando datos...
          </p>
        )}
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-600 font-bold p-4 rounded-lg bg-red-50 shadow-md">
            <AlertCircle className="w-6 h-6" />
            {error}
          </div>
        )}

        {/* Fechas de Vigencia */}
        {esquemaPagos && (
          <div className="bg-blue-50 shadow-lg rounded-lg p-5 mb-5 text-center">
            <h3 className="text-lg font-semibold text-blue-700 flex items-center justify-center gap-2 mb-2">
              <Calendar className="text-blue-500 w-6 h-6" />
              Vigencia de la Póliza
            </h3>
            <div className="text-blue-800">
              <p>
                <strong>Inicio:</strong>{" "}
                {new Date(
                  `${esquemaPagos.fechaInicio}T00:00:00Z`
                ).toLocaleDateString(undefined, { timeZone: "UTC" })}
              </p>
              <p>
                <strong>Fin:</strong>{" "}
                {new Date(
                  `${esquemaPagos.fechaFin}T00:00:00Z`
                ).toLocaleDateString(undefined, { timeZone: "UTC" })}
              </p>
              <p className="mt-2 text-sm text-gray-600 font-bold">
                LA PRESENTE VIGENCIA NO APLICARÁ SI LA EMPRESA NO CUENTA CON SU
                PAGO EN LOS TIEMPOS SEÑALADOS.
              </p>
            </div>
          </div>
        )}

        {/* Resumen */}
        {esquemaPagos && (
          <div className="bg-white shadow-lg rounded-lg p-5 mb-5">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <ListChecks className="text-blue-500 w-5 h-5" />
              Resumen del Pago
            </h3>
            <p>
              <DollarSign className="inline-block w-5 h-5 text-gray-500 mr-1" />
              <strong>Total de la Póliza:</strong> $
              {esquemaPagos.totalPrima.toFixed(2)}
            </p>
            <p>
              <DollarSign className="inline-block w-5 h-5 text-gray-500 mr-1" />
              <strong>Total Pagado:</strong> $
              {esquemaPagos.totalPagado.toFixed(2)}
            </p>
            {esquemaPagos.descuentoProntoPago && (
              <p>
                <DollarSign className="inline-block w-5 h-5 text-gray-500 mr-1" />
                <strong>Descuento Pronto Pago:</strong> $
                {esquemaPagos.descuentoProntoPago.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {/* Esquema de Pagos */}
        {esquemaPagos && (
          <div className="space-y-4">
            {esquemaPagos.esquemaPagos.map((pago: any, index: number) => (
              <div
                key={index}
                className="p-5 bg-white shadow-md rounded-lg flex flex-col gap-2 transition-all hover:scale-[1.02]"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-semibold">
                    <Clock className="inline-block w-5 h-5 mr-1 text-gray-400" />
                    Pago #{pago.numeroPago}
                  </span>
                  <span
                    className={`font-semibold ${
                      pago.estado === "Pagado"
                        ? "text-green-600"
                        : pago.estado === "Atrasado"
                        ? "text-red-600"
                        : "text-orange-500"
                    }`}
                  >
                    {pago.estado}
                  </span>
                </div>
                <p>
                  <Calendar className="inline-block w-5 h-5 text-blue-500 mr-1" />
                  <strong>Fecha Límite de Pago:</strong>{" "}
                  {ajustarFecha(pago.fechaPago)}
                </p>
                <p>
                  <DollarSign className="inline-block w-5 h-5 text-blue-500 mr-1" />
                  <strong>Monto por Pagar:</strong> ${pago.montoPorPagar}
                </p>

                {/* Pagos Realizados */}
                {pago.pagosRealizados.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">
                      Pagos Realizados:
                    </h4>
                    {pago.pagosRealizados.map((realizado: any, idx: number) => (
                      <p key={idx} className="text-gray-700 text-sm">
                        <strong>Monto:</strong> ${realizado.montoPagado} |{" "}
                        <strong>Fecha:</strong>{" "}
                        {new Date(realizado.fechaReal).toLocaleDateString()}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <section className="bg-gray-100 shadow-lg rounded-lg p-5 mt-10">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            Términos y Condiciones
          </h3>
          <p className="text-gray-600 text-sm">
            Al utilizar nuestros servicios, usted acepta los{" "}
            <a
              href="https://prase.mx/terminos-y-condiciones/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Términos y Condiciones
            </a>{" "}
            establecidos en nuestro sitio web. Estos términos regulan el uso de
            nuestros servicios y describen sus derechos y obligaciones como
            usuario.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Es su responsabilidad revisar periódicamente los términos para estar
            informado de cualquier cambio. Si tiene alguna pregunta, no dude en
            ponerse en contacto con nosotros.
          </p>
          <p className="text-blue-800 text-base font-bold flex items-center mt-2 gap-2">
            📞 Atención al Cliente:{" "}
            <a href="tel:8009089008" className="text-blue-600 underline">
              800-908-9008
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
