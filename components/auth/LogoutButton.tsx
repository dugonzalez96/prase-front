"use client";

import { IoKey } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/actions/logout";
import { useState } from "react";
import { useRouter } from "next/navigation";
interface Props {
    children?: React.ReactNode;
}

export const LogoutButton = ({ children }: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            // Clear client-side storage
            localStorage.clear();
            sessionStorage.clear();

            // Call the server logout action
            await logout();

            // Force a router refresh
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center">
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <span>
                        {children}
                    </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Menú</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <IoKey className="text-gray-500 mr-2 focus:text-white" />
                        Cambiar contraseña
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                        <IoIosLogOut className="text-gray-500 mr-2 focus:text-white" size={12} />
                        {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div >
    )
}