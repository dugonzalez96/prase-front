import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
    AlertTriangle,
    ArrowDownCircle,
    ArrowUpCircle,
    Calculator,
    Calendar,
    ClipboardList,
    Clock,
    CreditCard,
    Info,
    Mail,
    Scale,
} from "lucide-react"
import type React from "react"

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
}

interface CorteUsuarioModalProps {
    corte: CorteUsuario
    onClose: () => void
}

export function CorteUsuarioModal({ corte, onClose }: CorteUsuarioModalProps) {
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
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                {/* Header similar al de la tarjeta */}
                <div className="bg-primary/10 p-6">
                    <div className="flex justify-between items-start mb-2">
                        <DialogTitle className="text-xl">Corte #{corte.CorteUsuarioID}</DialogTitle>
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
                        <h3 className="font-semibold mb-3">Resumen Financiero</h3>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p>
                                                <strong>ID de Inicio:</strong> {corte.InicioCaja.InicioCajaID}
                                            </p>
                                            <p className="mt-2">
                                                <strong>Fechas:</strong>
                                            </p>
                                            <div className="bg-white p-2 rounded-md mt-1 mb-3">
                                                <p className="flex items-center text-sm mb-1">
                                                    <span className="font-medium mr-2">Inicio:</span>
                                                    <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                                                    <span>{formatDate(corte.InicioCaja.FechaInicio)}</span>
                                                    <Clock className="w-3 h-3 ml-2 mr-1 text-muted-foreground" />
                                                    <span>{formatTime(corte.InicioCaja.FechaInicio)}</span>
                                                </p>
                                                <p className="flex items-center text-sm">
                                                    <span className="font-medium mr-2">Actualización:</span>
                                                    <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                                                    <span>{formatDate(corte.InicioCaja.FechaActualizacion)}</span>
                                                    <Clock className="w-3 h-3 ml-2 mr-1 text-muted-foreground" />
                                                    <span>{formatTime(corte.InicioCaja.FechaActualizacion)}</span>
                                                </p>
                                            </div>
                                            <p>
                                                <strong>Estatus:</strong> {corte.InicioCaja.Estatus}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-2">
                                                <strong>Montos:</strong>
                                            </p>
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="bg-white p-3 rounded-md shadow-sm">
                                                    <p className="text-sm text-muted-foreground">Monto Inicial:</p>
                                                    <p className="font-medium text-lg">{formatCurrency(corte.InicioCaja.MontoInicial)}</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-md shadow-sm">
                                                    <p className="text-sm text-muted-foreground">Total Efectivo:</p>
                                                    <p className="font-medium text-lg">{formatCurrency(corte.InicioCaja.TotalEfectivo)}</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-md shadow-sm">
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
            </DialogContent>
        </Dialog>
    )
}

