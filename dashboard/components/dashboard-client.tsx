"use client"
import { useTRPC } from "@/lib/trpc"
import LoadingSpinner from "@/web/loading-spinner"
import { useQuery } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import { BarChart2, Clock, Database } from "lucide-react"
export const DashboardClient = ()=>{
  const trpc = useTRPC()
  const {data, isPending:isEventCategoriesLoading, isError, refetch,  } = useQuery(
    trpc.category.getEventCategories.queryOptions()
  )
  if (isEventCategoriesLoading){
    return <div className="flex items-center justify-center flex-1 h-full w-full">
      <LoadingSpinner/>
    </div>
  }

  const categoryList = data?.categories ?? []
  if(categoryList.length === 0){
    return <div>empty state</div>
  }

  return(
    <ul className="grid max-w-6xl grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {categoryList.map((category)=>(
        <li 
          key={category.id} 
          className="relative group z-10 transition-all duration-200 hover:-translate-y-0.5">
          <div className="absolute z-0 inset-px rounded-lg bg-white"/>
          <div className="pointer-events-none z-0 absolute inset-px rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md ring-1 ring-black/5"/>
            <div className="relative p-6 z-10">
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="size-12 rounded-full" 
                  style={{backgroundColor:category.color? `#${category.color.toString(16).padStart(6,"0")}`:"#f3f4f6"

                }}
                />
                <div>
                  <h3 className="text-lg/7 font-medium tracking-tight text-gray-950">
                    {category.emoji || "📁"} {category.name}
                  </h3>
                  <p className="text-sm/6 text-gray-600">
                    {format(category.createdAt,"MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm/5 text-gray-600">
                  <Clock className="size-4 mr-2 text-brand-500"/>
                  <span className="font-medium">Last ping:</span>
                  <span className="ml-1">
                    {category.lastPing ? formatDistanceToNow(category.lastPing)+ " ago":"Never"}
                  </span>
                </div>
                <div className="flex items-center text-sm/5 text-gray-600">
                  <Database className="size-4 mr-2 text-brand-500"/>
                  <span className="font-medium">Unique fields:</span>
                  <span className="ml-1">
                    {category.uniqueFieldCount || 0}
                  </span>
                </div>
                <div className="flex items-center text-sm/5 text-gray-600">
                  <BarChart2 className="size-4 mr-2 text-brand-500"/>
                  <span className="font-medium">Events this month:</span>
                  <span className="ml-1">
                    {category.eventsCount || 0}
                  </span>
                </div>
              </div>
          </div>
        </li>
      ))}
    </ul>
  )

}