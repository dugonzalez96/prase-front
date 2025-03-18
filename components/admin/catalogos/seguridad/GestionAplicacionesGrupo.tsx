"use client";

import { postApplicationGroup } from '@/actions/SeguridadActions';
import Loading from '@/app/(protected)/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { iGetApplicationGroup, iGetApplications, iGetGroups, iPostApplicationGroup } from '@/interfaces/SeguridadInterface'
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface Props {
  grupos: iGetGroups[];
  aplicaciones: iGetApplications[];
}

export const GestionAplicacionesGrupo = ({ grupos, aplicaciones }: Props) => {

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [selectedGroup, setSelectedGroup] = useState<number>(0)
  const [applicationGroup, setApplicationGroup] = useState<iGetApplicationGroup>({
    id: 0,
    ingresar: false,
    insertar: false,
    eliminar: false,
    actualizar: false,
    aplicaciones: { id: 0, nombre: '', descripcion: '', categoria: 'Administración' },
    grupos: null
  })

  const handleGroupChange = (groupId: string) => {
    const numGroupId = Number(groupId)
    setSelectedGroup(numGroupId)
    // Simular carga de datos del grupo seleccionado
    setApplicationGroup({
      id: numGroupId,
      ingresar: false,
      insertar: false,
      eliminar: false,
      actualizar: false,
      aplicaciones: aplicaciones[0], // Asignar la primera aplicación por defecto
      grupos: grupos.find(g => g.id === numGroupId) || null
    })
  }

  const handlePermissionChange = (permission: keyof iGetApplicationGroup) => {
    setApplicationGroup(prevGroup => ({
      ...prevGroup,
      [permission]: !prevGroup[permission]
    }))
  }

  const handleApplicationChange = (appId: string) => {
    const numAppId = Number(appId)
    const selectedApp = aplicaciones.find(app => app.id === numAppId)
    if (selectedApp) {
      setApplicationGroup(prevGroup => ({
        ...prevGroup,
        aplicaciones: selectedApp
      }))
    }
  }

  const saveChanges = () => {
    const postData: iPostApplicationGroup = {
      aplicaciones: [{
        aplicacionId: applicationGroup.aplicaciones.id,
        ingresar: applicationGroup.ingresar,
        insertar: applicationGroup.insertar,
        eliminar: applicationGroup.eliminar,
        actualizar: applicationGroup.actualizar
      }]
    }

    startTransition(async () => {
      try {
        const resp = await postApplicationGroup(selectedGroup, postData);

        if (!resp) {
          toast({
            title: "Error",
            description: "Hubo un problema al guardar.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Cambios guardados",
            description: "Los cambios se han guardado exitosamente.",
            variant: "default",
          });

          router.refresh();

          setApplicationGroup({
            id: 0,
            ingresar: false,
            insertar: false,
            eliminar: false,
            actualizar: false,
            aplicaciones: aplicaciones[0],
            grupos: null
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Hubo un problema al guardar.",
          variant: "destructive",
        });
      }
    });

  }

  return (
    <>
      {isPending && <Loading />}
      <div className="max-w-7xl mt-4">
        <h1 className="text-2xl font-bold mb-4">Asignar aplicaciones a grupos</h1>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Seleccionar Grupo</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleGroupChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione un grupo" />
              </SelectTrigger>
              <SelectContent>
                {grupos.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        {selectedGroup !== 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Permisos para {applicationGroup.grupos?.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Seleccionar Aplicación</h3>
                <Select
                  value={applicationGroup.aplicaciones.id.toString()}
                  onValueChange={handleApplicationChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione una aplicación" />
                  </SelectTrigger>
                  <SelectContent>
                    {aplicaciones.map((app) => (
                      <SelectItem key={app.id} value={app.id.toString()}>
                        {app.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Permisos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ingresar"
                      checked={applicationGroup.ingresar}
                      onCheckedChange={() => handlePermissionChange('ingresar')}
                    />
                    <label htmlFor="ingresar">Ingresar</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="insertar"
                      checked={applicationGroup.insertar}
                      onCheckedChange={() => handlePermissionChange('insertar')}
                    />
                    <label htmlFor="insertar">Insertar</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="eliminar"
                      checked={applicationGroup.eliminar}
                      onCheckedChange={() => handlePermissionChange('eliminar')}
                    />
                    <label htmlFor="eliminar">Eliminar</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="actualizar"
                      checked={applicationGroup.actualizar}
                      onCheckedChange={() => handlePermissionChange('actualizar')}
                    />
                    <label htmlFor="actualizar">Actualizar</label>
                  </div>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aplicación</TableHead>
                    <TableHead>Categoría</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{applicationGroup.aplicaciones.nombre}</TableCell>
                    <TableCell>{applicationGroup.aplicaciones.categoria}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4">
                <Button onClick={saveChanges}>
                  <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
