interface ConfiguracionPrima {
    primaMinima: number;
    primaMaxima: number;
    sumaAseguradaMinima: number;
    sumaAseguradaMaxima: number;
    factorDecrecimiento: number;
}

export class CalculadoraPrimaUniversal {
    calcularPorcentajePrima(
        sumaAsegurada: number,
        config: ConfiguracionPrima
    ): number {
        // if (sumaAsegurada < config.sumaAseguradaMinima ||
        //     sumaAsegurada > config.sumaAseguradaMaxima) {
        //     throw new Error('Suma asegurada fuera de rango');
        // }

        // Normalizamos la suma asegurada a un valor entre 0 y 1
        const x = (sumaAsegurada - config.sumaAseguradaMinima) /
            (config.sumaAseguradaMaxima - config.sumaAseguradaMinima);

        // Aplicamos una función exponencial con el factor de decrecimiento
        const factorCurva = config.factorDecrecimiento || 3;
        const delta = config.primaMaxima - config.primaMinima;

        const porcentaje = config.primaMinima +
            delta * Math.exp(-factorCurva * x);

        // Retornamos el porcentaje ya en formato decimal (ej: 0.0084 para 0.84%)
        return Number(Math.max(
            config.primaMinima,
            Math.min(porcentaje, config.primaMaxima)
        ).toFixed(6));
    }

    calcularPrima(
        sumaAsegurada: number,
        config: ConfiguracionPrima,
        deducible = 0
    ): number {
        const porcentajePrima = this.calcularPorcentajePrima(sumaAsegurada, config);
        const primaBase = sumaAsegurada * porcentajePrima;

        return deducible > 0 ?
            primaBase * (1 - (deducible / 100)) :
            primaBase;
    }
}