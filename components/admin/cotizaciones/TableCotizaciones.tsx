"use client";

import { useMemo, useState, useTransition } from "react";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import {
  iGetTiposVehiculo,
  iGetUsosVehiculo,
} from "@/interfaces/CatVehiculosInterface";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Phone, Mail, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditarCotizacionForm } from "./EditarCotizacionForm";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { deleteCotizacion } from "@/actions/CotizadorActions";
import Loading from "@/app/(protected)/loading";
import { FiltrosCotizaciones } from "./FiltrosCotizaciones";
import { generarPDFCotizacion } from "@/components/cotizador/GenerarPDFCotizacion";
import { ReenviarPDFModal } from "./ReenviarPDFModal";
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import { ActivarPolizaForm } from "../polizas/ActivarPolizaForm";
import { cn } from "@/lib/utils";

type EstadoCotizacion = "REGISTRO" | "EMITIDA" | "RECHAZADA";

interface FiltrosState {
  textoBusqueda: string;
  fechaInicio?: Date;
  fechaFin?: Date;
}

interface TableCotizacionesProps {
  cotizaciones: iGetCotizacion[];
  tiposVehiculo: iGetTiposVehiculo[];
  usosVehiculo: iGetUsosVehiculo[];
  coberturasData: iGetCoberturas[] | null | undefined;
  tiposPago: iGetTipoPagos[] | null | undefined;
}

interface ModalesControlProps {
  modalEdicionAbierto: boolean;
  modalReenvioAbierto: boolean;
  modalActivarAbierto: boolean;
  cotizacionSeleccionada: iGetCotizacion | null;
  cotizacionParaReenvio: iGetCotizacion | null;
  tiposVehiculo: iGetTiposVehiculo[];
  usosVehiculo: iGetUsosVehiculo[];
  onCerrarEdicion: () => void;
  onCerrarReenvio: () => void;
  coberturas: iGetCoberturas[] | null | undefined;
  tiposPago: iGetTipoPagos[] | null | undefined;
}

export const TableCotizaciones = ({
  cotizaciones,
  tiposVehiculo,
  usosVehiculo,
  coberturasData,
  tiposPago,
}: TableCotizacionesProps) => {
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<iGetCotizacion | null>(null);
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [modalReenvioAbierto, setModalReenvioAbierto] = useState(false);
  const [modalActivarAbierto, setModalActivarAbierto] = useState(false);
  const [cotizacionParaReenvio, setCotizacionParaReenvio] = useState<iGetCotizacion | null>(null);
  const [filtros, setFiltros] = useState<FiltrosState>({
    textoBusqueda: "",
    fechaInicio: undefined,
    fechaFin: undefined
  });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const cotizacionesFiltradas = useMemo(() => {
    return cotizaciones.filter(cotizacion => {
      const cumpleBusqueda = !filtros.textoBusqueda ||
        cotizacion.NombrePersona.toLowerCase().includes(filtros.textoBusqueda.toLowerCase()) ||
        (cotizacion.Telefono?.toLowerCase() || "").includes(filtros.textoBusqueda.toLowerCase()) ||
        (cotizacion.Correo?.toLowerCase() || "").includes(filtros.textoBusqueda.toLowerCase());

      const cumpleFechas = !filtros.fechaInicio || !filtros.fechaFin ||
        (new Date(cotizacion.FechaCotizacion) >= filtros.fechaInicio &&
          new Date(cotizacion.FechaCotizacion) <= filtros.fechaFin);

      return cumpleBusqueda && cumpleFechas;
    });
  }, [cotizaciones, filtros]);

  const handleFiltrosChange = (nuevosFiltros: FiltrosState) => {
    setFiltros(nuevosFiltros);
  };

  const formatearFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const obtenerNombreTipoVehiculo = (tipoId: number) =>
    tiposVehiculo.find((tipo) => tipo.TipoID === tipoId)?.Nombre || "No especificado";

  const obtenerNombreUsoVehiculo = (usoId: number) =>
    usosVehiculo.find((uso) => uso.UsoID === usoId)?.Nombre || "No especificado";

  const obtenerColorEstado = (estado: string): "default" | "secondary" | "destructive" | "outline" | "success" => {
    const estados: Record<EstadoCotizacion, "default" | "secondary" | "destructive" | "outline" | "success"> = {
      "REGISTRO": "default",
      "EMITIDA": "success",
      "RECHAZADA": "destructive"
    } as const;

    return estados[estado.toUpperCase() as EstadoCotizacion] || "secondary";
  };

  const handleEliminar = async () => {
    if (!cotizacionSeleccionada) return;

    startTransition(async () => {
      try {
        const respuesta = await deleteCotizacion(cotizacionSeleccionada.CotizacionID);

        if (!respuesta) {
          toast({
            title: "Error",
            description: "Hubo un problema al eliminar la cotización.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Cotización eliminada",
          description: "La cotización se eliminó correctamente.",
        });

        setCotizacionSeleccionada(null);
        router.refresh();

      } catch (error) {
        toast({
          title: "Error",
          description: "Hubo un problema al eliminar la cotización.",
          variant: "destructive",
        });
      }
    });
  };

  const handleCerrarEdicion = () => {
    setModalEdicionAbierto(false);
    setCotizacionSeleccionada(null);
    setModalActivarAbierto(false);
    startTransition(() => {
      router.refresh();
    });
  };

  const manejarDescargaPDF = async (cotizacion: iGetCotizacion) => {
    try {
      await generarPDFCotizacion({
        datos: cotizacion,
        tiposVehiculo,
        usosVehiculo,
        isSave: true,
        tiposPago: tiposPago ?? [],
      });

      toast({
        title: "PDF generado",
        description: "El PDF se ha descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al generar el PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl">
      {isPending && <Loading />}

      <FiltrosCotizaciones
        onFiltrar={handleFiltrosChange}
      />

      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la cotización
              {cotizacionSeleccionada && (
                <> del cliente <strong>{cotizacionSeleccionada.NombrePersona}</strong></>
              )}
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-md"
              variant="destructive"
              onClick={handleEliminar}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activa</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Información del Cliente</TableHead>
              <TableHead>Uso del Vehículo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cotizacionesFiltradas.map((cotizacion) => (
              <TableRow key={cotizacion.CotizacionID}>
                <TableCell>
                  {cotizacion.EstadoCotizacion !== "RECHAZADA" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "inline-flex h-8 items-center justify-center rounded-full px-3 text-sm",
                            "cursor-pointer transition-colors",
                            "border border-input hover:bg-accent hover:text-accent-foreground",
                            cotizacion.EstadoCotizacion === 'ACTIVA' || cotizacion.EstadoCotizacion === 'EMITIDA'
                              ? "bg-green-600 text-primary-foreground border-none"
                              : "bg-background"
                          )}
                          onClick={() => {
                            if (cotizacion.EstadoCotizacion === 'ACTIVA' || cotizacion.EstadoCotizacion === 'EMITIDA') {
                              return;
                            }
                            setCotizacionSeleccionada(cotizacion);
                            setModalActivarAbierto(true);
                          }}
                        >
                          {cotizacion.EstadoCotizacion === 'ACTIVA' || cotizacion.EstadoCotizacion === 'EMITIDA'
                            ? 'ACTIVA'
                            : 'ACTIVAR'
                          }
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Activar
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>{formatearFecha(cotizacion.FechaCotizacion)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{cotizacion.NombrePersona}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {cotizacion.Telefono || "No especificado"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {cotizacion.Correo || "No especificado"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p>Tipo: {obtenerNombreTipoVehiculo(cotizacion.TipoVehiculo)}</p>
                    <p>Uso: {obtenerNombreUsoVehiculo(cotizacion.UsoVehiculo)}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={obtenerColorEstado(cotizacion.EstadoCotizacion)}>
                    {cotizacion.EstadoCotizacion}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-3 mt-3">
                  {(cotizacion.EstadoCotizacion !== "EMITIDA") && (
                    <AccionesMenu
                      cotizacion={cotizacion}
                      onDescargar={manejarDescargaPDF}
                      onEditar={() => {
                        setCotizacionSeleccionada(cotizacion);
                        setModalEdicionAbierto(true);
                      }}
                      onEliminar={() => setCotizacionSeleccionada(cotizacion)}
                      onReenviar={() => {
                        setCotizacionParaReenvio(cotizacion);
                        setModalReenvioAbierto(true);
                      }}
                    />
                  )}

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AlertDialog>

      <ModalesControl
        modalEdicionAbierto={modalEdicionAbierto}
        modalReenvioAbierto={modalReenvioAbierto}
        modalActivarAbierto={modalActivarAbierto}
        cotizacionSeleccionada={cotizacionSeleccionada}
        cotizacionParaReenvio={cotizacionParaReenvio}
        tiposVehiculo={tiposVehiculo}
        usosVehiculo={usosVehiculo}
        onCerrarEdicion={handleCerrarEdicion}
        onCerrarReenvio={() => {
          setModalReenvioAbierto(false);
          setCotizacionParaReenvio(null);
        }}
        coberturas={coberturasData}
        tiposPago={tiposPago}
      />
    </div>
  );
};

const AccionesMenu = ({
  cotizacion,
  onDescargar,
  onEditar,
  onEliminar,
  onReenviar
}: {
  cotizacion: iGetCotizacion;
  onDescargar: (cotizacion: iGetCotizacion) => void;
  onEditar: () => void;
  onEliminar: () => void;
  onReenviar: () => void;
}) => (
  <>
    {cotizacion.EstadoCotizacion !== "RECHAZADA" && (
      <>
        <Tooltip>
          <TooltipTrigger>
            <Download
              size={16}
              className="text-gray-600 cursor-pointer"
              onClick={() => onDescargar(cotizacion)}
            />
          </TooltipTrigger>
          <TooltipContent>Descargar PDF</TooltipContent>
        </Tooltip>

        {/* <Tooltip>
      <TooltipTrigger>
        <Edit
          size={16}
          className="text-gray-600 cursor-pointer"
          onClick={onEditar}
        />
      </TooltipTrigger>
      <TooltipContent>Editar</TooltipContent>
    </Tooltip> */}

        <Tooltip>
          <TooltipTrigger>
            <Mail
              size={16}
              className="text-gray-600 cursor-pointer"
              onClick={onReenviar}
            />
          </TooltipTrigger>
          <TooltipContent>Reenviar PDF</TooltipContent>
        </Tooltip>
      </>
    )}
    {/* <Tooltip>
      <TooltipTrigger>
        <Download
          size={16}
          className="text-gray-600 cursor-pointer"
          onClick={() => onDescargar(cotizacion)}
        />
      </TooltipTrigger>
      <TooltipContent>Descargar PDF</TooltipContent>
    </Tooltip>

    //<Tooltip>
    //  <TooltipTrigger>
    //    <Edit
    //      size={16}
    //      className="text-gray-600 cursor-pointer"
    //      onClick={onEditar}
    //    />
    //  </TooltipTrigger>
    //  <TooltipContent>Editar</TooltipContent>
    //</Tooltip> 

    <Tooltip>
      <TooltipTrigger>
        <Mail
          size={16}
          className="text-gray-600 cursor-pointer"
          onClick={onReenviar}
        />
      </TooltipTrigger>
      <TooltipContent>Reenviar PDF</TooltipContent>
    </Tooltip> */}

    <Tooltip>
      <TooltipTrigger>
        <AlertDialogTrigger asChild>
          <Trash2
            size={16}
            className="text-gray-600 cursor-pointer"
            onClick={onEliminar}
          />
        </AlertDialogTrigger>
      </TooltipTrigger>
      <TooltipContent>Eliminar</TooltipContent>
    </Tooltip>
  </>
);

const ModalesControl = ({
  modalEdicionAbierto,
  modalReenvioAbierto,
  modalActivarAbierto,
  cotizacionSeleccionada,
  cotizacionParaReenvio,
  tiposVehiculo,
  usosVehiculo,
  onCerrarEdicion,
  onCerrarReenvio,
  coberturas,
  tiposPago,
}: ModalesControlProps) => (
  <>
    <Dialog open={modalEdicionAbierto} onOpenChange={onCerrarEdicion}>
      <DialogContent className="max-w-[80vw] max-h-[800px] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Editar Cotización</DialogTitle>
        </DialogHeader>
        <>
          {coberturas && coberturas.length > 0 && tiposPago && tiposPago.length > 0 ? (
            <>
              {cotizacionSeleccionada && (
                <EditarCotizacionForm
                  cotizacion={cotizacionSeleccionada}
                  onGuardar={onCerrarEdicion}
                  coberturas={coberturas}
                  tiposPago={tiposPago}
                />
              )}
            </>
          ) : (
            <div>
              No se pudieron obtener los datos necesarios.
            </div>
          )}
        </>
        <>

        </>
      </DialogContent>
    </Dialog>

    <Dialog open={modalActivarAbierto} onOpenChange={onCerrarEdicion}>
      <DialogContent className="max-w-[80vw] max-h-[800px] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Activar Póliza</DialogTitle>
        </DialogHeader>
        {(cotizacionSeleccionada && tiposPago && tiposPago.length > 0 && coberturas && coberturas.length > 0) && (
          <ActivarPolizaForm
            cotizacion={cotizacionSeleccionada}
            coberturas={coberturas}
            tiposPago={tiposPago}
            tiposVehiculo={tiposVehiculo}
            usosVehiculo={usosVehiculo}
          />
        )}
      </DialogContent>
    </Dialog>

    {cotizacionParaReenvio && tiposPago && (
      <ReenviarPDFModal
        cotizacion={cotizacionParaReenvio}
        tiposVehiculo={tiposVehiculo}
        usosVehiculo={usosVehiculo}
        abierto={modalReenvioAbierto}
        alCerrar={onCerrarReenvio}
        tiposPago={tiposPago}
      />
    )}
  </>
);
