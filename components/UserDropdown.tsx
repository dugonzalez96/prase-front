import { LogOut } from "lucide-react";
import { CustomUser } from "@/next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/actions/logout";
import { signOut } from "next-auth/react";

export default function UserDropdown({ user }: { user: CustomUser | null }) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" }); // 🔹 Cierra sesión y redirige a login
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start p-0">
          <div className="flex items-center space-x-2">
            {user && (
              <>
                <Avatar className="w-10 h-10">
                  {/* <AvatarImage src="https://xsgames.co/randomusers/assets/avatars/male/47.jpg" alt="Usuario" /> */}
                  <AvatarFallback>
                    {user.empleado.Nombre.toUpperCase().slice(0, 1)}
                    {user.empleado.Paterno.toUpperCase().slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-medium truncate w-44">
                    {user.empleado.Nombre} {user.empleado.Paterno}{" "}
                    {user.empleado.Materno}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-44">
                    {user.usuario.NombreUsuario}
                  </span>
                </div>
              </>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Button
            className="w-full text-left items-center justify-start p-0 m-0"
            variant="ghost"
            onClick={() => handleLogout()}
            type="button"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span >Cerrar Sesión</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
