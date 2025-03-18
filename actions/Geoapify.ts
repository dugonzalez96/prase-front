"use server";

import { iAutoComplete } from "@/interfaces/GeoApifyInterface";

const url = process.env.API_URL;

// Función para obtener sugerencias de autocompletar desde tu API de Geoapify
export const getAutocompleteSuggestions = async (query: string) => {
    try {
        const resp = await fetch(`${url}/geoapify/autocomplete?query=${encodeURIComponent(query)}`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iAutoComplete = await resp.json();
        return data.features;
    } catch (error) {
        console.log('Error al obtener sugerencias de autocompletar: ', error);
        return null;
    }
};
