import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart, DollarSign, Users, AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Inicio() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Bienvenido a PRASE</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pólizas Activas</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">+5.2% desde el mes pasado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$54,231</div>
                        <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cotizaciones Pendientes</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">32</div>
                        <p className="text-xs text-muted-foreground">-2 desde ayer</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reclamos Activos</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">15</div>
                        <p className="text-xs text-muted-foreground">+3 desde la semana pasada</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Rendimiento de Ventas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="w-full flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium">Seguro de Auto</div>
                                        <div className="text-sm font-medium">45%</div>
                                    </div>
                                    <Progress value={45} className="h-2 mt-1" />
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-full flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium">Seguro de Vida</div>
                                        <div className="text-sm font-medium">30%</div>
                                    </div>
                                    <Progress value={30} className="h-2 mt-1" />
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-full flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium">Seguro de Hogar</div>
                                        <div className="text-sm font-medium">25%</div>
                                    </div>
                                    <Progress value={25} className="h-2 mt-1" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Actividades Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Nueva póliza creada</p>
                                    <p className="text-sm text-muted-foreground">Juan Pérez - Seguro de Auto</p>
                                </div>
                                <div className="ml-auto font-medium">Hace 2h</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Reclamo procesado</p>
                                    <p className="text-sm text-muted-foreground">María González - Seguro de Hogar</p>
                                </div>
                                <div className="ml-auto font-medium">Hace 5h</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Cotización aprobada</p>
                                    <p className="text-sm text-muted-foreground">Carlos Rodríguez - Seguro de Vida</p>
                                </div>
                                <div className="ml-auto font-medium">Ayer</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Link href="/cotizaciones/nueva">
                        <Button className="w-full">
                            Nueva Cotización
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Button className="w-full">
                        Gestionar Reclamos
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button className="w-full">
                        Ver Reportes
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button className="w-full">
                        Soporte al Cliente
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}