import { DashboardPage } from "@/web/dashboard-page"
import { DashboardClient } from "@/dashboard/components/dashboard-client"
import { NextRequest } from "next/server"
const Page =async (request:NextRequest)=>{
    return <DashboardPage title="Dashboard">
      <DashboardClient></DashboardClient>
    </DashboardPage>

}
export default Page