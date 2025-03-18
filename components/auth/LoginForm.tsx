"use client"

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoIosLogIn } from "react-icons/io";
import { ClipLoader } from "react-spinners"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { LoginSchema } from "@/schemas/loginSchema";
import { login } from "@/actions/login";
import { FormError } from "../FormError";


export const LoginForm = () => {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>("");

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            username: "",
            password: "",
        }
    });
    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("");

        startTransition(() => {
            login(values)
                .then((data) => {
                    if (data?.error) {
                        setError(data.error);
                    } else {
                        form.reset();
                    }
                })
                .catch(() => {
                    console.error('¡Algo salió mal!')
                });
        });
    }


    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
            >
                <div>
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={isPending}
                                        placeholder="Nombre de usuario"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div>
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={isPending}
                                        placeholder="******"
                                        type="password"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="w-fit ml-auto">
                    <Link href="/recuperar-contrasena">
                        <h6 className="font-medium cursor-pointer text-blue-600 hover:text-blue-950 transition-colors mb-2 text-sm">¿Olvidaste tu contraseña?</h6>
                    </Link>
                </div>
                <FormError message={error} />

                <Button
                    disabled={isPending}
                    type="submit"
                    className="w-full"
                >
                    {!isPending ? (
                        <>
                            <IoIosLogIn className="mr-2 h-4 w-4" />
                            Ingresar
                        </>
                    ) : (
                        <ClipLoader size={20} color="#fff" />
                    )}
                </Button>
            </form>
        </Form>
    )
}