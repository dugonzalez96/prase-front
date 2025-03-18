import Inicio from "@/components/Inicio";
import { currentUser } from "@/lib/auth";

export default async function InicioPage() {
const user = await currentUser();

// console.log(user)
  return (
    <>
      <Inicio />
    </>
  );
}
