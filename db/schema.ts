import { relations, sql } from "drizzle-orm";
import {
    index,
    integer,
    pgTable,
    real,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable(
    "users",
    {
        id: uuid("id")
            .default(sql`gen_random_uuid()`)
            .primaryKey(),
        tokenLookup: text("token_lookup").notNull(),
        tokenHash: text("token_hash").notNull(),
        displayName: text("display_name"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    },
    (t) => [uniqueIndex("users_token_lookup_idx").on(t.tokenLookup)],
);

export const sessions = pgTable(
    "sessions",
    {
        id: text("id").primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        lastRotatedAt: timestamp("last_rotated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
        userAgent: text("user_agent"),
        ip: text("ip"),
    },
    (t) => [
        index("sessions_user_idx").on(t.userId),
        index("sessions_expires_idx").on(t.expiresAt),
    ],
);

export const books = pgTable(
    "books",
    {
        id: uuid("id")
            .default(sql`gen_random_uuid()`)
            .primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        googleId: text("google_id").notNull(),
        title: text("title"),
        authors: text("authors"),
        thumbnail: text("thumbnail"),
        categories: text("categories"),
        rating: real("rating"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (t) => [
        uniqueIndex("books_user_google_idx").on(t.userId, t.googleId),
        index("books_user_idx").on(t.userId),
    ],
);

export const wishlist = pgTable(
    "wishlist",
    {
        id: uuid("id")
            .default(sql`gen_random_uuid()`)
            .primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        googleId: text("google_id").notNull(),
        title: text("title"),
        authors: text("authors"),
        thumbnail: text("thumbnail"),
        categories: text("categories"),
        rating: real("rating"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (t) => [
        uniqueIndex("wishlist_user_google_idx").on(t.userId, t.googleId),
        index("wishlist_user_idx").on(t.userId),
    ],
);

export const rateLimits = pgTable(
    "rate_limits",
    {
        id: uuid("id")
            .default(sql`gen_random_uuid()`)
            .primaryKey(),
        key: text("key").notNull(),
        windowStart: timestamp("window_start", { withTimezone: true })
            .defaultNow()
            .notNull(),
        count: integer("count").default(0).notNull(),
    },
    (t) => [uniqueIndex("rate_limits_key_idx").on(t.key)],
);

export const usersRelations = relations(users, ({ many }) => ({
    sessions: many(sessions),
    books: many(books),
    wishlist: many(wishlist),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const booksRelations = relations(books, ({ one }) => ({
    user: one(users, { fields: [books.userId], references: [users.id] }),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
    user: one(users, { fields: [wishlist.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type WishlistBook = typeof wishlist.$inferSelect;
export type NewWishlistBook = typeof wishlist.$inferInsert;
