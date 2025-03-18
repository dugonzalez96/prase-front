"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { cookies } from "next/headers";

export const logout = async () => {

    await signOut({ redirect: false });
    const cookieStore = cookies();

    // Itera sobre todas las cookies y elimínalas
    cookieStore.getAll().forEach((cookie) => {
        cookieStore.delete(cookie.name);
        cookies().set(cookie.name, '', {
            expires: new Date(0),
            path: '/'
        });
    });

    redirect('/login');
}