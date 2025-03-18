"use client";

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react'
import { iApplication, iDeleteApplicationGroup, iGetApplicationGroup, iPatchApplicationGroup } from '@/interfaces/SeguridadInterface'
import { Check, Edit2, Trash2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { deleteApplicationGroup, patchApplicationGroup } from '@/actions/SeguridadActions'
import Loading from '@/app/(protected)/loading';

const PermissionIcon = ({ hasPermission }: { hasPermission: boolean }) => (
    hasPermission ? <Check className="text-green-500" /> : <X className="text-red-500" />
)

interface Props {
    initialGroups: iGetApplicationGroup[];
}

export const ResumenPermisosAplicaciones = ({ initialGroups }: Props) => {
    console.log("🚀 ~ ResumenPermisosAplicaciones ~ initialGroups:", initialGroups)

    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [groups, setGroups] = useState<iGetApplicationGroup[]>(initialGroups)
    const [editingGroup, setEditingGroup] = useState<iGetApplicationGroup | null>(null)

    const handlePermissionChange = (permission: keyof iApplication) => {

        if (editingGroup && permission !== 'aplicacionId') {
            setEditingGroup({ ...editingGroup, [permission]: !editingGroup[permission] })
        }
    }


    const saveChanges = async () => {
        if (editingGroup && editingGroup.grupos) {
            const patchData: iPatchApplicationGroup = {
                aplicaciones: [{
                    aplicacionId: editingGroup.aplicaciones.id,
                    ingresar: editingGroup.ingresar,
                    insertar: editingGroup.insertar,
                    eliminar: editingGroup.eliminar,
                    actualizar: editingGroup.actualizar
                }]
            }

            await patchApplicationGroup(editingGroup.grupos.id, patchData)

            setGroups(groups.map(group =>
                group.id === editingGroup.id ? editingGroup : group
            ))

            toast({
                title: "Cambios guardados",
                description: `Los cambios en los permisos para ${editingGroup.aplicaciones.nombre} se guardaron exitosamente.`,
                variant: "default",
            });

            router.refresh();

            setEditingGroup(null)
        }
    }

    const handleDelete = async (grupoId: number, aplicacionesIds: iDeleteApplicationGroup) => {
        startTransition(async () => {
            try {
                const res = await deleteApplicationGroup(grupoId, aplicacionesIds);

                if (!res) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al eliminar la aplicación.",
                        variant: "destructive",
                    });
                    return;
                } else {
                    toast({
                        title: "Aplicación eliminada",
                        description: `La aplicación se eliminó del grupo exitosamente.`,
                        variant: "default",
                    });

                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar la aplicación.",
                    variant: "destructive",
                });
            }
        });
    }

    return (
        <>
            {isPending && <Loading />}
            <div className="max-w-7xl">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="border-b">
                            <th className="px-4 py-2 text-left">Grupo</th>
                            <th className="px-4 py-2 text-left">Aplicación</th>
                            <th className="px-4 py-2 text-left">Ingresar</th>
                            <th className="px-4 py-2 text-left">Insertar</th>
                            <th className="px-4 py-2 text-left">Eliminar</th>
                            <th className="px-4 py-2 text-left">Actualizar</th>
                            <th className="px-4 py-2 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialGroups.filter(group => group?.aplicaciones).map((group) => (
                            <tr key={group.id} className="border-b">
                                <td className="px-4 py-2">{group.grupos?.nombre}</td>
                                <td className="px-4 py-2">
                                    <div>
                                        <span className="font-medium">{group.aplicaciones.nombre}</span>
                                        <Badge variant="outline" className="text-xs ml-2">ID: {group.aplicaciones.id}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{group.aplicaciones.descripcion}</p>
                                </td>
                                <td className="px-4 py-2"><PermissionIcon hasPermission={group.ingresar} /></td>
                                <td className="px-4 py-2"><PermissionIcon hasPermission={group.insertar} /></td>
                                <td className="px-4 py-2"><PermissionIcon hasPermission={group.eliminar} /></td>
                                <td className="px-4 py-2"><PermissionIcon hasPermission={group.actualizar} /></td>
                                <td className="px-4 py-2 text-center flex justify-around">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" onClick={() => setEditingGroup(group)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        {editingGroup && (
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Editar permisos para {group.grupos?.nombre}</DialogTitle>
                                                    <DialogDescription></DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <h3 className="font-medium">Permisos para {editingGroup.aplicaciones.nombre}</h3>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {(['ingresar', 'insertar', 'eliminar', 'actualizar'] as const).map((permission) => (
                                                            <div key={permission} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`${group.id}-${permission}`}
                                                                    checked={editingGroup[permission]}
                                                                    onCheckedChange={() => handlePermissionChange(permission)}
                                                                />
                                                                <label
                                                                    htmlFor={`${group.id}-${permission}`}
                                                                    className="text-sm font-medium"
                                                                >
                                                                    {permission.charAt(0).toUpperCase() + permission.slice(1)}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Button onClick={saveChanges}>Guardar cambios</Button>
                                            </DialogContent>
                                        )}
                                    </Dialog>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el grupo y todos sus permisos asociados.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(group.grupos ? group.grupos.id : 0, { 'aplicacionesIds': [group.aplicaciones.id] })}>Continuar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
