"use client"

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface FiltrosPolizasState {
    textoBusqueda: string;
    estado?: "ACTIVA" | "CANCELADA" | null;
}

interface PropiedadesFiltrosPolizas {
    onFiltrar: (filtros: FiltrosPolizasState) => void;
}

export const FiltrosPolizas = ({ onFiltrar }: PropiedadesFiltrosPolizas) => {
    const form = useForm<FiltrosPolizasState>({
        defaultValues: {
            textoBusqueda: "",
            estado: null,
        }
    });

    const manejarCambios = form.watch(() => {
        onFiltrar(form.getValues());
    });

    useEffect(() => {
        const subscription = manejarCambios;
        return () => subscription.unsubscribe();
    }, [manejarCambios]);

    return (
        <div className="flex items-center gap-4 mb-4">
            <Input
                placeholder="Buscar por número de póliza..."
                {...form.register("textoBusqueda")}
                className="max-w-sm bg-white"
            />
            <Select
                onValueChange={(valor) => form.setValue("estado", valor === "TODOS" ? null : valor as "ACTIVA" | "CANCELADA")}
                value={form.watch("estado") || "TODOS"}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estado de póliza" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="TODOS">Todos</SelectItem>
                    <SelectItem value="ACTIVA">Activas</SelectItem>
                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                    <SelectItem value="PERIODO DE GRACIA">Periodo de gracia</SelectItem>
                    <SelectItem value="CANCELADA">Canceladas</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};