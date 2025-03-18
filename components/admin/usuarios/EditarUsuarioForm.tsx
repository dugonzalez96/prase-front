"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { iGetUsers } from "@/interfaces/SeguridadInterface";
import { patchUsuario } from "@/actions/SeguridadActions";
import { Loader2, Eye, EyeOff, Save as SaveIcon } from "lucide-react";
import { editarUsuarioSchema } from "@/schemas/admin/usuariosSchemas";

interface EditarUsuarioFormProps {
    usuario: iGetUsers;
    grupos: { id: number; nombre: string }[];
    onSave: () => void;
}

export const EditarUsuarioForm = ({ usuario, grupos, onSave }: EditarUsuarioFormProps) => {
    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editarUsuarioSchema>>({
        resolver: zodResolver(editarUsuarioSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
            idGroup: usuario.grupo || 0,
        },
        mode: "onChange",
    });

    const onSubmit = (values: z.infer<typeof editarUsuarioSchema>) => {
        startTransition(async () => {
            try {
                const { password, idGroup } = values;
                const resp = await patchUsuario(usuario.UsuarioID, { password, idGroup });

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar el usuario.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Usuario actualizado",
                        description: "El usuario se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar el usuario.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Campo de Nueva Contraseña */}
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nueva Contraseña</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Dejar en blanco para no cambiar"
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Campo de Confirmar Contraseña */}
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirme la nueva contraseña"
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Campo de Grupo */}
                <FormField
                    control={form.control}
                    name="idGroup"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Grupo</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    defaultValue={field.value ? field.value.toString() : undefined}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione grupo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {grupos.map((grupo) => (
                                            <SelectItem key={grupo.id} value={grupo.id.toString()}>
                                                {grupo.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} size="lg">
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <SaveIcon className="w-4 h-4 mr-2" />
                            Guardar
                        </>
                    )}
                </Button>
            </form>
        </Form>
    );
};
