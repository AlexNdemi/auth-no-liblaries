import { EventCategoryTable,EventTable } from "@/drizzle/schema";
import { router,protectedProcedure } from "../trpc";
import { eq,and,gte } from "drizzle-orm"
import {startOfMonth} from "date-fns"
export const categoryRouter = router({
  getEventCategories: protectedProcedure
    .query(async ({ctx}) => {
      const categories = await ctx.db.query.EventCategoryTable.findMany({
         columns:{
          id:true,
          name:true,
          emoji:true,
          color:true,
          updatedAt:true,
          createdAt:true
        },
         where:eq(EventCategoryTable.userId, ctx.user.id),
         orderBy:(EventCategoryTable,{desc})=>desc(EventCategoryTable.createdAt)
         
      })
      const categoriesWithCounts = await Promise.all(categories.map(async(category)=>{
        const now = new Date()
        const firstDayOfMonth = startOfMonth(now)

        const [uniqueFieldCount,eventsCount,lastPing]=await Promise.all([
          // ctx.db.query.EventTable.findMany({
          //   columns:{fields:true},
          //   where:(({eventCategoryId,createdAt})=>
          //     and(
          //       eq(eventCategoryId,category.id),
          //       gte(createdAt,firstDayOfMonth)
          //     )),
          // }),
          ctx.db
            .selectDistinct({
              fields: EventTable.fields,
            })
            .from(EventTable)
            .where(
              and(
                eq(EventTable.eventCategoryId, category.id),
                gte(EventTable.createdAt, firstDayOfMonth)
              )
            ).then((events)=>{
              const fieldNames= new Set<string>()
              events.forEach((event)=>{
                Object.keys(event.fields as object).forEach((fieldName)=>{
                  fieldNames.add(fieldName)
                })
              })
              return fieldNames.size
            }),ctx.db.$count(
              EventTable,
              and(
                eq(EventTable.eventCategoryId, category.id),
                gte(EventTable.createdAt, firstDayOfMonth)
              )
            ),ctx.db.query.EventTable.findFirst({
              columns:{createdAt:true},
              where:(({eventCategoryId})=>
                eq(eventCategoryId,category.id)
              ),
              orderBy:(({createdAt},{desc})=>desc(createdAt))
            })
        ])
        return{...category,uniqueFieldCount,eventsCount,lastPing:lastPing?.createdAt || null}
      }))
      return ({categories:categoriesWithCounts})
    })
})