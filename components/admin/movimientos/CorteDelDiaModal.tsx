import { getCorteByID } from "@/actions/CorteDelDiaActions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AnimatePresence, motion } from "framer-motion"
import {
    AlertTriangle,
    ArrowDownCircle,
    ArrowDownLeft,
    ArrowUpCircle,
    ArrowUpRight, Banknote,
    Calculator,
    Calendar,
    ClipboardList,
    Clock,
    CreditCard,
    Eye,
    Info,
    Mail,
    RefreshCw,
    Scale,
    X
} from "lucide-react"
import type React from "react"
import { useState } from "react"
import { createPortal } from "react-dom"
import { MovimientoItem } from "@/components/admin/movimientos/MovimientoItem"


interface Usuario {
    UsuarioID: number
    NombreUsuario: string
    Contrasena: string
    EmpleadoID: number
    SucursalID: number | null
}

interface CorteUsuario {
    CorteUsuarioID: number
    FechaCorte: string
    FechaActualizacion: string
    TotalIngresos: string
    TotalIngresosEfectivo: string
    TotalIngresosTarjeta: string
    TotalIngresosTransferencia: string
    TotalEgresos: string
    TotalEgresosEfectivo: string
    TotalEgresosTarjeta: string
    TotalEgresosTransferencia: string
    TotalEfectivo: string
    TotalPagoConTarjeta: string
    TotalTransferencia: string
    SaldoEsperado: string
    SaldoReal: string
    TotalEfectivoCapturado: string
    TotalTarjetaCapturado: string
    TotalTransferenciaCapturado: string
    Diferencia: string
    Observaciones: string
    Estatus: string
    usuarioID: Usuario
    InicioCaja?: {
        InicioCajaID: number
        FechaInicio: string
        FechaActualizacion: string
        MontoInicial: string
        TotalEfectivo: string
        TotalTransferencia: string
        FirmaElectronica: string
        Estatus: string
    }
    historial?: any
}

interface CorteUsuarioModalProps {
    corte: CorteUsuario
    onClose: () => void
}


// const MovimientoItem = ({ movimiento, tipo }: { movimiento: any; tipo: "ingreso" | "egreso" | "pago" }) => {
//     // Determinar el icono según la forma de pago
//     const getIcon = (formaPago: string) => {
//         if (!formaPago) return <Banknote className="h-4 w-4 mr-2" />;

//         switch (formaPago.toLowerCase()) {
//             case "efectivo":
//                 return <Banknote className="h-4 w-4 mr-2" />
//             case "tarjeta":
//                 return <CreditCard className="h-4 w-4 mr-2" />
//             case "transferencia":
//                 return <RefreshCw className="h-4 w-4 mr-2" />
//             default:
//                 return <Banknote className="h-4 w-4 mr-2" />
//         }
//     }

//     return (
//         <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
//             <div className="flex justify-between items-center">
//                 <div className="font-medium flex items-center">
//                     {tipo === "pago"
//                         ? getIcon(movimiento.MetodoPago)
//                         : getIcon(movimiento.FormaPago)}
//                     {tipo === "pago"
//                         ? movimiento.MetodoPago
//                         : movimiento.FormaPago}
//                 </div>
//                 <Badge
//                     variant="outline"
//                     className={
//                         tipo === "ingreso"
//                             ? "bg-green-50 text-green-700 border-green-200"
//                             : tipo === "pago"
//                                 ? "bg-blue-50 text-blue-700 border-blue-200"
//                                 : "bg-red-50 text-red-700 border-red-200"
//                     }
//                 >
//                     {tipo === "ingreso" ? "Ingreso" : tipo === "pago" ? "Pago" : "Egreso"}
//                 </Badge>
//             </div>
//             <div className="flex justify-between items-center mt-2">
//                 <div className="flex items-center text-sm text-muted-foreground">
//                     <Clock className="mr-1 h-3 w-3" />
//                     {tipo === "pago"
//                         ? formatDateMovimiento(movimiento.FechaPago)
//                         : formatDateMovimiento(movimiento.Fecha)}
//                 </div>
//                 <div className={`font-medium ${tipo === "ingreso" ? "text-green-600" : tipo === "pago" ? "text-blue-600" : "text-red-600"}`}>
//                     {tipo === "ingreso" ? "+" : tipo === "pago" ? "+" : "-"}
//                     {tipo === "pago"
//                         ? formatCurrency(Number(movimiento.MontoPagado))
//                         : formatCurrency(Number(movimiento.Monto))
//                     }
//                 </div>
//             </div>
//             <div>
//                 <p className="text-sm text-muted-foreground">
//                     {movimiento.Descripcion?.charAt(0).toUpperCase() + movimiento.Descripcion?.slice(1).toLowerCase() || ""}
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                     Poliza: {movimiento.Poliza?.NumeroPoliza || ""}
//                 </p>
//             </div>
//         </div>
//     )
// }

// const formatDateMovimiento = (dateString: string) => {
//     try {
//         const date = new Date(dateString);
//         if (isNaN(date.getTime())) {
//             return "Fecha inválida";
//         }
//         return format(date, "d '/' MM '/' yyyy", { locale: es });
//     } catch (error) {
//         return "Fecha inválida";
//     }
// }



export function CorteUsuarioModal({ corte, onClose }: CorteUsuarioModalProps) {
    //useState para Ingresos y Egresos
    const [ingresos, setIngresos] = useState<any[]>([]);
    const [egresos, setEgresos] = useState<any[]>([]);
    const [pagosPoliza, setPagosPoliza] = useState<any[]>([]);

    const [showMovementsModal, setShowMovementsModal] = useState(false);

    const toggleMovementsModal = async () => {
        setIngresos([]);
        setEgresos([]);
        setPagosPoliza([]);
        if (showMovementsModal === false) {
            try {
                const resp = await getCorteByID(corte.CorteUsuarioID);
                setIngresos(resp.historial.DetalleIngresos || []);
                setEgresos(resp.historial.DetalleEgresos || []);
                setPagosPoliza(resp.historial.DetallePagosPoliza || []);
            } catch (e) {
                console.log("🚀 ~ toggleMovementsModal ~ e:", e)
            } finally {
                setShowMovementsModal(!showMovementsModal);
            }
        } else {
            setShowMovementsModal(false);
        }
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number.parseFloat(amount))
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return format(date, "h:mm a", { locale: es })
    }

    const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
        <div className="flex items-center space-x-2 mb-3">
            {icon}
            <h3 className="font-semibold">{title}</h3>
        </div>
    )

    const hasDifference = Number.parseFloat(corte.Diferencia) !== 0

    // Función para obtener el valor absoluto de la diferencia
    const getAbsoluteDifference = (difference: string) => {
        return Math.abs(Number.parseFloat(difference)).toFixed(2)
    }

    // Función para truncar el correo electrónico
    const truncateEmail = (email: string, maxLength = 25) => {
        if (email.length <= maxLength) return email

        const atIndex = email.indexOf("@")
        if (atIndex <= 0) return email.substring(0, maxLength) + "..."

        const username = email.substring(0, atIndex)
        const domain = email.substring(atIndex)

        if (username.length <= maxLength - 3) return email

        return username.substring(0, maxLength - 3) + "..." + domain
    }


    return (
        <>
            {createPortal(
                <AnimatePresence>
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >

                        <div className="flex flex-col md:flex-row gap-4 overflow-auto">
                            {/* Modal principal */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            >
                                <Card className="max-w-3xl md:max-h-[90vh] max-h-[50vh] overflow-y-auto bg-white shadow-lg rounded-md">

                                    <Button
                                        className="absolute top-2 right-2 bg-red-400 rounded-sm hover:bg-red-500 active:bg-red-600"
                                        size={"icon"}
                                        onClick={onClose}
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </Button>
                                    <CardHeader>
                                        {/* Header similar al de la tarjeta */}
                                        <div className="bg-primary/10 p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <CardTitle className="text-xl">Corte #{corte.CorteUsuarioID}</CardTitle>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${corte.Estatus === "Cerrado" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                >
                                                    {corte.Estatus}
                                                </span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                                <div className="flex items-center mb-2 sm:mb-0">
                                                    <Mail className="w-4 h-4 mr-2 text-primary" />
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="font-medium">{truncateEmail(corte.usuarioID.NombreUsuario)}</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{corte.usuarioID.NombreUsuario}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                                <div className="flex space-x-4">
                                                    <div className="flex items-center text-sm">
                                                        <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                                                        <span>{formatDate(corte.FechaCorte)}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm">
                                                        <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                                                        <span>{formatTime(corte.FechaCorte)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Contenido principal */}
                                        <div className="p-6">
                                            {hasDifference && (
                                                <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
                                                    <div className="flex items-start">
                                                        <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                                                        <div>
                                                            <h4 className="font-semibold text-red-700">Diferencia detectada</h4>
                                                            <p className="text-red-600">
                                                                Hay una diferencia de {formatCurrency(getAbsoluteDifference(corte.Diferencia))} entre el saldo
                                                                esperado y el saldo real.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Resumen financiero - similar a las tarjetas */}
                                            <div className="bg-muted/20 p-4 rounded-lg mb-6">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-semibold mb-3">Resumen Financiero</h3>
                                                    <Button type="button" className="rounded-full h-6" onClick={toggleMovementsModal}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        {showMovementsModal ? "Ocultar Movimientos" : "Ver Movimientos"}
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                                        <p className="flex items-center text-sm text-muted-foreground">
                                                            <ArrowDownCircle className="w-3 h-3 mr-1 text-green-500" />
                                                            Ingresos
                                                        </p>
                                                        <p className="font-medium text-lg">{formatCurrency(corte.TotalIngresos)}</p>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                                        <p className="flex items-center text-sm text-muted-foreground">
                                                            <ArrowUpCircle className="w-3 h-3 mr-1 text-red-500" />
                                                            Egresos
                                                        </p>
                                                        <p className="font-medium text-lg">{formatCurrency(corte.TotalEgresos)}</p>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                                        <p className="flex items-center text-sm text-muted-foreground">
                                                            <Scale className="w-3 h-3 mr-1 text-blue-500" />
                                                            Saldo Esperado
                                                        </p>
                                                        <p className="font-medium text-lg">{formatCurrency(corte.SaldoEsperado)}</p>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                                        <p className="flex items-center text-sm text-muted-foreground">
                                                            <Scale className="w-3 h-3 mr-1 text-blue-500" />
                                                            Saldo Real
                                                        </p>
                                                        <p className="font-medium text-lg">{formatCurrency(corte.SaldoReal)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Información detallada */}
                                            <div className="space-y-6">
                                                <div>
                                                    <SectionTitle icon={<Info className="w-5 h-5 text-primary" />} title="Información General" />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/10 p-4 rounded-lg">
                                                        <div>
                                                            <p className="mb-2">
                                                                <strong>Fecha Actualización:</strong>
                                                            </p>
                                                            <p className="flex items-center text-sm mb-3">
                                                                <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                                                                <span>{formatDate(corte.FechaActualizacion)}</span>
                                                                <Clock className="w-3 h-3 ml-2 mr-1 text-muted-foreground" />
                                                                <span>{formatTime(corte.FechaActualizacion)}</span>
                                                            </p>
                                                            <p>
                                                                <strong>Estatus:</strong> {corte.Estatus}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p>
                                                                <strong>Observaciones:</strong>
                                                            </p>
                                                            <p className="bg-white p-2 rounded-md min-h-[60px]">{corte.Observaciones || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <SectionTitle
                                                            icon={<ArrowDownCircle className="w-5 h-5 text-green-500" />}
                                                            title="Desglose de Ingresos"
                                                        />
                                                        <div className="bg-muted/10 p-4 rounded-lg">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Efectivo:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalIngresosEfectivo)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Tarjeta:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalIngresosTarjeta)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Transferencia:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalIngresosTransferencia)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Total:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalIngresos)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <SectionTitle icon={<ArrowUpCircle className="w-5 h-5 text-red-500" />} title="Desglose de Egresos" />
                                                        <div className="bg-muted/10 p-4 rounded-lg">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Efectivo:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalEgresosEfectivo)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Tarjeta:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalEgresosTarjeta)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Transferencia:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalEgresosTransferencia)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Total:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalEgresos)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <SectionTitle
                                                            icon={<CreditCard className="w-5 h-5 text-primary" />}
                                                            title="Totales por Método de Pago"
                                                        />
                                                        <div className="bg-muted/10 p-4 rounded-lg">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Efectivo:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalEfectivo)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Tarjeta:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalPagoConTarjeta)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Transferencia:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalTransferencia)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <SectionTitle icon={<Calculator className="w-5 h-5 text-primary" />} title="Totales Capturados" />
                                                        <div className="bg-muted/10 p-4 rounded-lg">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Efectivo:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalEfectivoCapturado)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Tarjeta:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalTarjetaCapturado)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Transferencia:</p>
                                                                    <p className="font-medium">{formatCurrency(corte.TotalTransferenciaCapturado)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {corte.InicioCaja && (
                                                    <div>
                                                        <SectionTitle
                                                            icon={<ClipboardList className="w-5 h-5 text-primary" />}
                                                            title="Información de Inicio de Caja"
                                                        />
                                                        <div className="bg-muted/10 p-4 rounded-lg">
                                                            <div className="grid grid-cols-1 gap-4">
                                                                <div className="p-4 bg-white rounded-lg shadow-md">
                                                                    <p className="text-lg font-semibold">
                                                                        ID de Inicio: <span className="font-normal">{corte.InicioCaja.InicioCajaID}</span>
                                                                    </p>

                                                                    <div className="">
                                                                        <p className="text-lg font-semibold">Fechas:</p>
                                                                        <div className="bg-gray-100 p-3 rounded-lg mt-2">
                                                                            <div className="grid grid-cols-1 gap-3 text-sm">
                                                                                <div className="flex items-center">
                                                                                    <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                                                                                    <span className="font-medium">Inicio:</span>
                                                                                    <span className="ml-2">{formatDate(corte.InicioCaja.FechaInicio)}</span>
                                                                                    <Clock className="w-4 h-4 ml-2 text-muted-foreground" />
                                                                                    <span className="ml-1">{formatTime(corte.InicioCaja.FechaInicio)}</span>
                                                                                </div>
                                                                                <div className="flex items-center">
                                                                                    <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                                                                                    <span className="font-medium">Actualización:</span>
                                                                                    <span className="ml-2">{formatDate(corte.InicioCaja.FechaActualizacion)}</span>
                                                                                    <Clock className="w-4 h-4 ml-2 text-muted-foreground" />
                                                                                    <span className="ml-1">{formatTime(corte.InicioCaja.FechaActualizacion)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <p className="mt-4 text-lg font-semibold">
                                                                        Estatus: <span className="font-normal">{corte.InicioCaja.Estatus}</span>
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="mb-2">
                                                                        <strong>Montos:</strong>
                                                                    </p>
                                                                    <div className="grid grid-cols-1 gap-3 sm:flex w-full">
                                                                        <div className="bg-white p-3 rounded-md shadow-sm w-full">
                                                                            <p className="text-sm text-muted-foreground">Monto Inicial:</p>
                                                                            <p className="font-medium text-lg">{formatCurrency(corte.InicioCaja.MontoInicial)}</p>
                                                                        </div>
                                                                        <div className="bg-white p-3 rounded-md shadow-sm w-full">
                                                                            <p className="text-sm text-muted-foreground">Total Efectivo:</p>
                                                                            <p className="font-medium text-lg">{formatCurrency(corte.InicioCaja.TotalEfectivo)}</p>
                                                                        </div>
                                                                        <div className="bg-white p-3 rounded-md shadow-sm w-full">
                                                                            <p className="text-sm text-muted-foreground">Total Transferencia:</p>
                                                                            <p className="font-medium text-lg">{formatCurrency(corte.InicioCaja.TotalTransferencia)}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </motion.div>

                            {/* Modal de movimientos */}
                            <AnimatePresence>
                                {showMovementsModal && (
                                    <motion.div
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 50, opacity: 0 }}
                                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    >
                                        <Card className="min-w-[300px] max-w-3xl md:max-h-[90vh] max-h-[50vh] bg-white shadow-lg rounded-md">
                                            <CardHeader className="pb-2">
                                                <CardTitle>Movimientos</CardTitle>
                                                <div className="text-sm text-muted-foreground">Detalle de ingresos y egresos</div>
                                            </CardHeader>
                                            <CardContent>
                                                <ScrollArea className="pr-4">
                                                    <div className="space-y-6">
                                                        {/* Ingresos Section */}
                                                        {ingresos && ingresos.length > 0 && (
                                                            <div>
                                                                <h3 className="text-md font-semibold mb-2 flex items-center">
                                                                    <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                                                                    Ingresos ({ingresos.length})
                                                                </h3>
                                                                <div className="space-y-3">
                                                                    {ingresos.map((ingreso, index) => (
                                                                        <MovimientoItem
                                                                            key={`ingreso-${index}`}
                                                                            movimiento={ingreso}
                                                                            tipo="ingreso"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Egresos Section */}
                                                        {egresos && egresos.length > 0 && (
                                                            <div>
                                                                <h3 className="text-md font-semibold mb-2 flex items-center">
                                                                    <ArrowDownLeft className="h-4 w-4 mr-2 text-red-500" />
                                                                    Egresos ({egresos.length})
                                                                </h3>
                                                                <div className="space-y-3">
                                                                    {egresos.map((egreso, index) => (
                                                                        <MovimientoItem
                                                                            key={`egreso-${index}`}
                                                                            movimiento={egreso}
                                                                            tipo="egreso"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}


                                                        {/* Pagos de Poliza Section */}
                                                        {pagosPoliza && pagosPoliza.length > 0 && (
                                                            <div>
                                                                <h3 className="text-md font-semibold mb-2 flex items-center">
                                                                    <ArrowDownLeft className="h-4 w-4 mr-2 text-red-500" />
                                                                    Pagos de Poliza ({pagosPoliza.length})
                                                                </h3>
                                                                <div className="space-y-3">
                                                                    {pagosPoliza.map((pago, index) => (
                                                                        <MovimientoItem
                                                                            key={`pago-${index}`}
                                                                            movimiento={pago}
                                                                            tipo="pago"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Mensaje si no hay movimientos */}
                                                        {(!ingresos?.length && !egresos?.length && !pagosPoliza?.length) && (
                                                            <div className="text-center py-8 text-muted-foreground">
                                                                No hay movimientos registrados para este corte.
                                                            </div>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}

        </>
    )
}

