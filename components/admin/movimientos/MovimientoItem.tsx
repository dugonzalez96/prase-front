import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Banknote, Clock, CreditCard, RefreshCw } from "lucide-react";

const formatDateMovimiento = (dateString: string) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Fecha inválida";
        }
        return format(date, "d '/' MM '/' yyyy", { locale: es });
    } catch (error) {
        return "Fecha inválida";
    }
}

export function MovimientoItem({ movimiento, tipo }: { movimiento: any; tipo: "ingreso" | "egreso" | "pago" }) {
    // Determinar el icono según la forma de pago
    const getIcon = (formaPago: string) => {
        if (!formaPago) return <Banknote className="h-4 w-4 mr-2" />;

        switch (formaPago.toLowerCase()) {
            case "efectivo":
                return <Banknote className="h-4 w-4 mr-2" />
            case "tarjeta":
                return <CreditCard className="h-4 w-4 mr-2" />
            case "transferencia":
                return <RefreshCw className="h-4 w-4 mr-2" />
            default:
                return <Banknote className="h-4 w-4 mr-2" />
        }
    }

    return (
        <div className="p-3 border rounded-lg bg-white transition-colors">
            <div className="flex justify-between items-center">
                <div className="font-medium flex items-center">
                    {tipo === "pago"
                        ? getIcon(movimiento.MetodoPago)
                        : getIcon(movimiento.FormaPago)}
                    {tipo === "pago"
                        ? movimiento.MetodoPago
                        : movimiento.FormaPago}
                </div>
                <Badge
                    variant="outline"
                    className={
                        tipo === "ingreso"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : tipo === "pago"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-red-50 text-red-700 border-red-200"
                    }
                >
                    {tipo === "ingreso" ? "Ingreso" : tipo === "pago" ? "Pago" : "Egreso"}
                </Badge>
            </div>
            <div className="flex justify-between items-center mt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {tipo === "pago"
                        ? formatDateMovimiento(movimiento.FechaPago)
                        : formatDateMovimiento(movimiento.Fecha)}
                </div>
                <div className={`font-medium ${tipo === "ingreso" ? "text-green-600" : tipo === "pago" ? "text-blue-600" : "text-red-600"}`}>
                    {tipo === "ingreso" ? "+" : tipo === "pago" ? "+" : "-"}
                    {tipo === "pago"
                        ? formatCurrency(Number(movimiento.MontoPagado))
                        : formatCurrency(Number(movimiento.Monto))
                    }
                </div>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">
                    {/* Solo si es tipo pago */}
                    {tipo === "pago" ? (
                        <span>
                            Poliza: {movimiento.Poliza?.NumeroPoliza || ""}
                        </span>
                    ) : (
                        <span>
                            {movimiento.Descripcion?.charAt(0).toUpperCase() + movimiento.Descripcion?.slice(1).toLowerCase() || ""}
                        </span>
                    )}

                </p>
            </div>
        </div>
    )
}

export default MovimientoItem;