import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { db } from '@/drizzle/db';
import { cookies } from "next/headers"
import { getUserFromSession,updateUserSessionExpiration } from '@/auth/core/session';


export const createTRPCContext = async () => {
  const cookieStore = await cookies()

  const user = await getUserFromSession(cookieStore).catch(() => null)

  await updateUserSessionExpiration({
    get: (key) => cookieStore.get(key),
    set: (key, value, options) => {
      cookieStore.set({
        name: key,
        value,
        ...options,
      })
    },
  }).catch((err) => {
    console.error("Failed to slide tRPC session expiration:", err)
  })

  return { 
    db,
    cookieStore,
    user
  }
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED", 
      message: "You must be logged in to perform this action." 
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, 
    },
  })
})


const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "admin") {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Administrative privileges required." 
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated)
export const adminProcedure = t.procedure.use(isAdmin)


