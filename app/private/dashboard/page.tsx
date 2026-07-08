import { getUserFromSession } from "@/auth/core/session"
import { DashboardPage } from "@/web/dashboard-page"
import { NextResponse, type NextRequest } from "next/server"
const Page =async (request:NextRequest)=>{

 const user = await getUserFromSession(request.cookies)
    if(!user){
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }

    return <DashboardPage title="Dashbord">
      <DashboardClient></DashboardClient>
    </DashboardPage>

}
export default Page