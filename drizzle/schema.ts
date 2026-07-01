import { relations } from "drizzle-orm"
import {
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  unique,
  integer,
  jsonb // 💡 Tip: PostgreSQL works better with jsonb than raw json
} from "drizzle-orm/pg-core"

// ==========================================
// 1. ENUMS
// ==========================================
export const userPlans =  ["free","pro"] as const
export type userPlan = (typeof userPlans)[number]
export const userPlanEnum = pgEnum("user_plans",userPlans)

export const userRoles = ["admin", "user"] as const
export type UserRole = (typeof userRoles)[number]
export const userRoleEnum = pgEnum("user_roles", userRoles)

export const eventDeliveryStatuses = ["pending","delivered","failed"]as const
export type eventDeliveryStatus = (typeof eventDeliveryStatuses)[number]
export const eventDeliveryEnum = pgEnum("event_delivery_statuses",eventDeliveryStatuses)

export const oAuthProviders = ["discord", "github"] as const
export type OAuthProvider = (typeof oAuthProviders)[number]
export const oAuthProviderEnum = pgEnum("oauth_provides", oAuthProviders)

// ==========================================
// 2. BASE TABLES (No Foreign Keys pointing to other new tables)
// ==========================================
export const UserTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text(),
  salt: text(),
  role: userRoleEnum().notNull().default("user"),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  plan:userPlanEnum().notNull().default("free"),
  apiKey: uuid().unique().defaultRandom(),
  discordId:text()
})

export const QuotasTable = pgTable(
  "quotas",{
      id:uuid().primaryKey().defaultRandom(),
      userId:uuid()
        .notNull()
        .references(()=>UserTable.id,{onDelete:"cascade"}),
      year:integer("year"),
      month:integer("month"),
      count:integer("count").default(0)
  }
)

export const EventCategoryTable = pgTable("event_categories",{
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  color: integer("color"),
  emoji: text(),
  userId: uuid()
    .notNull()
    .references(() => UserTable.id, {onDelete:"cascade"}),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),      
  },
  (table) => [
    unique("uid_name_unique_idx").on(table.userId, table.name)
  ]
)

export const UserOAuthAccountTable = pgTable(
  "user_oauth_accounts",
  {
    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    provider: oAuthProviderEnum().notNull(),
    providerAccountId: text().notNull().unique(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  t => [primaryKey({ columns: [t.providerAccountId, t.provider] })]
)

// ==========================================
// 3. DEPENDENT TABLES (References EventCategoryTable)
// ==========================================
export const EventTable = pgTable(
  "events",
  {
    id:uuid().primaryKey().defaultRandom(),
    formattedMessage:text(),
    userId:uuid()
      .notNull()
      .references(() => UserTable.id,{onDelete:"cascade"}),
    name:text(),
    fields:jsonb("fields"), // Changed to jsonb for optimal PG performance
    deliveryStatus:eventDeliveryEnum().notNull().default("pending"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    eventCategoryId:uuid()
      .notNull()
      .references(() => EventCategoryTable.id) // ✅ Now it works because EventCategoryTable is defined above!
  }
)

// ==========================================
// 4. RELATIONS (Keep these at the bottom)
// ==========================================
export const userRelations = relations(UserTable, ({ many }) => ({
  oAuthAccounts: many(UserOAuthAccountTable),
  eventCategories:many(EventCategoryTable),
  events:many(EventTable),
  quotas:many(QuotasTable)
}))

export const eventRelations = relations(EventTable,({one})=>({
  user:one(UserTable,{
    fields:[EventTable.userId],
    references:[UserTable.id]
  }),
  eventCategory:one(EventCategoryTable,{
    fields:[EventTable.eventCategoryId],
    references:[EventCategoryTable.id]
  })
}))

export const userOauthAccountRelationships = relations(
  UserOAuthAccountTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserOAuthAccountTable.userId],
      references: [UserTable.id],
    }),
  })
)

export const eventCategoryRelationships = relations(
  EventCategoryTable,
  ({one,many}) => ({
   user: one(UserTable,{
     fields:[EventCategoryTable.userId],
     references:[UserTable.id]
   }),
   event:many(EventTable)
  })
)

export const quotasRelationships = relations(QuotasTable,
  ({ one })=>({
    user: one(UserTable,{
      fields:[QuotasTable.userId],
      references:[UserTable.id]
    })
  }))
