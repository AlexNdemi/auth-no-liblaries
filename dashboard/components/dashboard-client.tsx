import { useQuery } from "@tanstack/react-query"

export const DashboardClient = ()=>{
    const {}= useQuery({
      queryKey:["user-event-categories"],
      queryFn:async()=>{
        
      }
    })
}