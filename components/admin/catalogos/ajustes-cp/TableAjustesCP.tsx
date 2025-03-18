"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Ajuste, iAjustesCP } from "@/interfaces/AjustesCPInterace";
import { deletePaqueteCobertura } from "@/actions/AjustesCP";
import Loading from "@/app/(protected)/loading";
import { EditarAjusteCP } from "./EditarAjusteCP";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    MoreHorizontal,
    ChevronDown,
} from "lucide-react";

interface Props {
    ajustesCP: Ajuste[];
}

export const TableAjustesCP = ({ ajustesCP }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [ajusteSeleccionado, setAjusteSeleccionado] = useState<Ajuste | null>(null);
    const [ajusteEditar, setAjusteEditar] = useState<Ajuste | null>(null);
    const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const columns: ColumnDef<Ajuste>[] = [
        {
            accessorKey: "CodigoPostal",
            header: "Código Postal",
            cell: ({ row }) => (
                <div>{row.getValue("CodigoPostal")}</div>
            ),
        },
        {
            accessorKey: "IndiceSiniestros",
            header: "Índice Siniestros",
            cell: ({ row }) => (
                <div>{row.getValue("IndiceSiniestros")}%</div>
            ),
        },
        {
            accessorKey: "AjustePrima",
            header: "Ajuste Prima",
            cell: ({ row }) => (
                <div>{row.getValue("AjustePrima")}%</div>
            ),
        },
        {
            accessorKey: "CantSiniestros",
            header: "Cantidad Siniestros",
        },
        {
            accessorKey: "UltimaActualizacion",
            header: "Última Actualización",
            cell: ({ row }) => {
                const fecha = new Date(row.getValue("UltimaActualizacion"));
                return fecha.toLocaleDateString();
            },
        },
        {
            id: "acciones",
            enableHiding: false,
            cell: ({ row }) => {
                const ajuste = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => {
                                    setAjusteEditar(ajuste);
                                    setModalEdicionAbierto(true);
                                }}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setAjusteSeleccionado(ajuste)}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: ajustesCP,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const manejarEliminar = async () => {
        if (!ajusteSeleccionado) return;

        startTransition(async () => {
            try {
                await deletePaqueteCobertura(ajusteSeleccionado.CodigoPostal);
                toast({
                    title: "Ajuste eliminado",
                    description: `El ajuste para el CP ${ajusteSeleccionado.CodigoPostal} ha sido eliminado.`,
                });
                router.refresh();
                setAjusteSeleccionado(null);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Error al eliminar el ajuste.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            {isPending && <Loading />}

            <div className="w-full">
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Filtrar por código postal..."
                        value={(table.getColumn("CodigoPostal")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("CodigoPostal")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                </div>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No se encontraron resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="flex items-center space-x-2 py-4">
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </div>

            <AlertDialog open={!!ajusteSeleccionado} onOpenChange={() => setAjusteSeleccionado(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el ajuste para el CP {ajusteSeleccionado?.CodigoPostal}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={manejarEliminar}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog
                open={modalEdicionAbierto}
                onOpenChange={() => {
                    setAjusteEditar(null);
                    setModalEdicionAbierto(false);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Ajuste CP</DialogTitle>
                    </DialogHeader>
                    {ajusteEditar && (
                        <EditarAjusteCP
                            ajuste={ajusteEditar}
                            alGuardar={() => {
                                setAjusteEditar(null);
                                setModalEdicionAbierto(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};