"use client";

import { useEffect, useState, useCallback } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Check, ChevronsUpDown, Loader2, MapPin, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Feature } from "@/interfaces/GeoApifyInterface";
import { getAutocompleteSuggestions } from "@/actions/Geoapify";
import { nuevaCotizacionSchema } from "@/schemas/cotizadorSchema";

interface LocationComboboxProps {
    form: UseFormReturn<FormData>;
    onLocationSelect?: (location: Feature) => void;
}

type FormData = z.infer<typeof nuevaCotizacionSchema>;

const LocationCombobox = ({ form, onLocationSelect }: LocationComboboxProps) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<Feature[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Feature | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const searchLocations = useCallback(
        async (query: string) => {
            if (!query || query.length < 3) {
                setLocations([]);
                return;
            }

            setLoading(true);
            try {
                const suggestions = await getAutocompleteSuggestions(query);
                setLocations(suggestions || []);
            } catch (error) {
                console.error("Error fetching locations:", error);
                setLocations([]);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const debouncedSearch = useCallback(
        (value: string) => {
            const timer = setTimeout(() => searchLocations(value), 300);
            return () => clearTimeout(timer);
        },
        [searchLocations]
    );

    const handleSelect = (location: Feature) => {
        const postcode = location.properties.postcode;
        if (!postcode) return;

        const estado = location.properties.state;
        if (estado) form.setValue("Estado", estado);

        form.setValue("CP", postcode, { shouldValidate: true });
        setSelectedLocation(location);
        setOpen(false);
        onLocationSelect?.(location);
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        form.setValue("CP", "", { shouldValidate: true });
        setSelectedLocation(null);
        setSearchTerm("");
        setLocations([]);
    };

    useEffect(() => {
        const currentCP = form.getValues("CP");
        if (currentCP && !selectedLocation) {
            searchLocations(currentCP);
        }
    }, [form, selectedLocation, searchLocations]);

    return (
        <FormField
            control={form.control}
            name="CP"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                        Código Postal
                    </FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <div
                                    className={cn(
                                        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    role="combobox"
                                    aria-expanded={open}
                                    aria-haspopup="listbox"
                                    onClick={() => setOpen(true)}
                                >
                                    {selectedLocation ? (
                                        <div className="flex items-center gap-2 text-left">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    CP: {selectedLocation.properties.postcode}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {selectedLocation.properties.formatted}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        "Buscar ubicación..."
                                    )}
                                    <div className="flex items-center gap-2">
                                        {field.value && (
                                            <button
                                                type="button"
                                                className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                                                onClick={clearSelection}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                    </div>
                                </div>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                            <Command>
                                <CommandInput
                                    placeholder="Buscar por código postal o dirección..."
                                    value={searchTerm}
                                    onValueChange={(value) => {
                                        setSearchTerm(value);
                                        debouncedSearch(value);
                                    }}
                                />
                                <CommandList>
                                    {loading && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center justify-center py-6"
                                        >
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        </motion.div>
                                    )}

                                    {!loading && locations.length === 0 && (
                                        <CommandEmpty>
                                            {searchTerm.length < 3
                                                ? "Ingresa al menos 3 caracteres..."
                                                : "No se encontraron ubicaciones"}
                                        </CommandEmpty>
                                    )}

                                    {!loading && locations.length > 0 && (
                                        <CommandGroup heading="Ubicaciones encontradas">
                                            {locations.map((location) => (
                                                <CommandItem
                                                    key={location.properties.place_id}
                                                    value={location.properties.place_id}
                                                    onSelect={() => handleSelect(location)}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <Check
                                                            className={cn(
                                                                "h-4 w-4 mt-1",
                                                                selectedLocation?.properties.place_id ===
                                                                    location.properties.place_id
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        <div className="flex flex-col cursor-pointer">
                                                            <div className="font-medium">
                                                                CP: {location.properties.postcode}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {location.properties.formatted}
                                                            </div>
                                                            <div className="flex gap-2 mt-1">
                                                                {location.properties.country_code && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {location.properties.country_code.toUpperCase()}
                                                                    </Badge>
                                                                )}
                                                                {location.properties.state && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {location.properties.state}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default LocationCombobox;