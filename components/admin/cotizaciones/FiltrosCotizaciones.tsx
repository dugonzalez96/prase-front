import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, CalendarRange, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FiltrosState {
    textoBusqueda: string;
    fechaInicio?: Date;
    fechaFin?: Date;
}

interface FiltrosCotizacionesProps {
    onFiltrar: (filtros: FiltrosState) => void;
}

export const FiltrosCotizaciones = ({
    onFiltrar
}: FiltrosCotizacionesProps) => {
    const [filtrosLocales, setFiltrosLocales] = useState<FiltrosState>({
        textoBusqueda: "",
        fechaInicio: undefined,
        fechaFin: undefined
    });

    const actualizarFiltros = (nuevosFiltros: Partial<FiltrosState>) => {
        const filtrosActualizados = { ...filtrosLocales, ...nuevosFiltros };
        setFiltrosLocales(filtrosActualizados);
        onFiltrar(filtrosActualizados);
    };

    const limpiarFiltros = () => {
        const filtrosLimpios = {
            textoBusqueda: "",
            fechaInicio: undefined,
            fechaFin: undefined
        };
        setFiltrosLocales(filtrosLimpios);
        onFiltrar(filtrosLimpios);
    };

    return (
        <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <div className="relative bg-white rounded-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, teléfono o correo..."
                            value={filtrosLocales.textoBusqueda}
                            onChange={(e) => actualizarFiltros({ textoBusqueda: e.target.value })}
                            className="pl-9"
                        />
                        {filtrosLocales.textoBusqueda && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                                onClick={() => actualizarFiltros({ textoBusqueda: "" })}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <CalendarRange className="h-4 w-4" />
                            Rango de fechas
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            locale={es}
                            selected={{
                                from: filtrosLocales.fechaInicio,
                                to: filtrosLocales.fechaFin
                            }}
                            onSelect={(rango) => {
                                actualizarFiltros({
                                    fechaInicio: rango?.from,
                                    fechaFin: rango?.to
                                });
                            }}
                        />
                    </PopoverContent>
                </Popover>

                <Button
                    variant="secondary"
                    onClick={limpiarFiltros}
                >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                </Button>
            </div>

            {(filtrosLocales.textoBusqueda || (filtrosLocales.fechaInicio && filtrosLocales.fechaFin)) && (
                <div className="flex gap-2">
                    {filtrosLocales.textoBusqueda && (
                        <Badge variant="secondary" className="gap-1">
                            Búsqueda: {filtrosLocales.textoBusqueda}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => actualizarFiltros({ textoBusqueda: "" })}
                            />
                        </Badge>
                    )}
                    {filtrosLocales.fechaInicio && filtrosLocales.fechaFin && (
                        <Badge variant="secondary" className="gap-1">
                            Fechas: {format(filtrosLocales.fechaInicio, "dd/MM/yyyy")} - {format(filtrosLocales.fechaFin, "dd/MM/yyyy")}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => actualizarFiltros({ fechaInicio: undefined, fechaFin: undefined })}
                            />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
};