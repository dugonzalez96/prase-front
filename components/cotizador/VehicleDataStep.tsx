"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StepProps } from "@/types/cotizador";
import {
  getMarcasPorAnio,
  getModelosPorAnioMarca,
  getVersionesPorAnioMarcaModelo,
  getPrecioVersionPorClave,
} from "@/actions/LibroAzul";
import { formatCurrency } from "@/lib/format";
import type {
  iGetMarcasPorAnio,
  iGetModelosPorAnioMarca,
  iGetVersionesPorAnioMarcaModelo,
  iGetPrecioVersionPorClave,
  iGetAnios,
} from "@/interfaces/LibroAzul";
import { FormData } from "@/types/cotizador";
import LocationCombobox from "./LocationCombobox";
import { Feature } from "@/interfaces/GeoApifyInterface";

interface VehicleDataStepProps extends StepProps {
  apiKey: string;
  years: iGetAnios[];
}

export const VehicleDataStep = ({
  form,
  apiKey,
  years,
  setIsStepValid,
}: VehicleDataStepProps) => {
  const [isPending, startTransition] = useTransition();
  const [marcas, setMarcas] = useState<iGetMarcasPorAnio[]>([]);
  const [modelos, setModelos] = useState<iGetModelosPorAnioMarca[]>([]);
  const [versiones, setVersiones] = useState<iGetVersionesPorAnioMarcaModelo[]>([]);
  const [precio, setPrecio] = useState<iGetPrecioVersionPorClave | null>(null);

  const valoresFormulario = form.watch([
    "Modelo",
    "Marca",
    "Submarca",
    "Version",
    "CP",
    "marcaNombre",
    "modeloNombre",
    "versionNombre"
  ]);

  const [anio, marca, submarca, version, cp] = valoresFormulario;

  useEffect(() => {
    const validarCampos = async () => {
      const camposValidar = ["Modelo", "Marca", "Submarca", "Version", "CP"] as const;
      const resultados = await Promise.all(
        camposValidar.map(campo => form.trigger(campo as keyof FormData))
      );
      setIsStepValid?.(resultados.every(Boolean));
    };

    validarCampos();
  }, [anio, marca, submarca, version, cp, form, setIsStepValid]);

  useEffect(() => {
    if (anio && apiKey) {
      startTransition(async () => {
        const respuestaMarcas = await getMarcasPorAnio(apiKey, { Clave: anio, Nombre: anio });
        if (respuestaMarcas) setMarcas(respuestaMarcas);
      });
    }
  }, [anio, apiKey]);

  useEffect(() => {
    if (anio && marca && apiKey) {
      startTransition(async () => {
        const respuestaModelos = await getModelosPorAnioMarca(
          apiKey,
          anio,
          { Clave: marca, Nombre: marca }
        );
        if (respuestaModelos) setModelos(respuestaModelos);
      });
    }
  }, [anio, marca, apiKey]);

  useEffect(() => {
    if (anio && marca && submarca && apiKey) {
      startTransition(async () => {
        const respuestaVersiones = await getVersionesPorAnioMarcaModelo(
          apiKey,
          anio,
          marca,
          { Clave: submarca, Nombre: submarca }
        );

        if (respuestaVersiones) setVersiones(respuestaVersiones);
      });
    }
  }, [anio, marca, submarca, apiKey]);

  useEffect(() => {
    if (version && apiKey) {
      startTransition(async () => {
        const respuestaPrecio = await getPrecioVersionPorClave(apiKey, { Clave: version, Nombre: version });
        if (respuestaPrecio) {
          setPrecio(respuestaPrecio);
          form.setValue("SumaAsegurada", respuestaPrecio.Venta);
          form.setValue("minSumaAsegurada", respuestaPrecio.Compra);
          form.setValue("maxSumaAsegurada", respuestaPrecio.Venta);
        }
      });
    }
  }, [version, apiKey, form]);

  const manejarSeleccionUbicacion = (ubicacion: Feature) => {
    const codigoPostal = ubicacion.properties.postcode;
    const estado = ubicacion.properties.state;

    if (codigoPostal) {
      form.setValue("CP", codigoPostal, { shouldValidate: true });
      if (estado) form.setValue("Estado", estado);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="Modelo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Año</FormLabel>
            <Select
              disabled={isPending}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona año" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {years?.map((year) => (
                  <SelectItem key={year.Clave} value={year.Clave}>
                    {year.Nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="Marca"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marca</FormLabel>
            <Select
              disabled={isPending || marcas.length === 0}
              onValueChange={(valor) => {
                const marca = marcas.find(m => m.Clave === valor);
                field.onChange(valor);
                if (marca) form.setValue("marcaNombre", marca.Nombre);
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona marca" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {marcas.map((marca) => (
                  <SelectItem key={marca.Clave} value={marca.Clave}>
                    {marca.Nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="Submarca"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modelo</FormLabel>
            <Select
              disabled={isPending || modelos.length === 0}
              onValueChange={(valor) => {
                const modelo = modelos.find(m => m.Clave === valor);
                field.onChange(valor);
                if (modelo) form.setValue("modeloNombre", modelo.Nombre);
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona modelo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {modelos.map((modelo) => (
                  <SelectItem key={modelo.Clave} value={modelo.Clave}>
                    {modelo.Nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="Version"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Versión</FormLabel>
            <Select
              disabled={isPending || versiones.length === 0}
              onValueChange={(valor) => {
                const version = versiones.find(v => v.Clave === valor);
                field.onChange(valor);
                if (version) form.setValue("versionNombre", version.Nombre);
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona versión" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {versiones.map((version) => (
                  <SelectItem key={version.Clave} value={version.Clave}>
                    {version.Nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="VIN"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Serie (VIN)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ingresa el número de serie" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="Placa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Placa (opcional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ingresa la placa del vehículo..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="NoMotor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de motor (opcional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ingresa el número de motor del vehículo..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="col-span-2">
        <LocationCombobox form={form} onLocationSelect={manejarSeleccionUbicacion} />
      </div>

      {isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-2 flex justify-center"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </motion.div>
      )}

      {precio && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-2 bg-primary/5 rounded-lg p-4"
        >
          <h4 className="font-semibold mb-2">Valor del vehículo</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor venta</p>
              <p className="text-lg font-medium">{formatCurrency(precio.Venta)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor compra</p>
              <p className="text-lg font-medium">{formatCurrency(precio.Compra)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VehicleDataStep;