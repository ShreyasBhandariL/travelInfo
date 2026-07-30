import DashboardPage from "./dashboard/page";
import {auth} from "@/auth";

export default async function Home() {
  const session = await auth();
  return (
    <div>
      <DashboardPage session={session}/>
    </div>
  );
}
