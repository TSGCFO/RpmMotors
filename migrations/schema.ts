import { pgTable, serial, text, integer, boolean, timestamp, foreignKey, unique, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const testimonials = pgTable("testimonials", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	vehicle: text().notNull(),
	rating: integer().notNull(),
	comment: text().notNull(),
	isApproved: boolean("is_approved").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const inquiries = pgTable("inquiries", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text(),
	subject: text().notNull(),
	message: text().notNull(),
	vehicleId: integer("vehicle_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	status: text().default('new'),
}, (table) => [
	foreignKey({
			columns: [table.vehicleId],
			foreignColumns: [vehicles.id],
			name: "inquiries_vehicle_id_vehicles_id_fk"
		}).onDelete("set null"),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	email: text(),
	role: text().default('customer'),
	firstName: text("first_name"),
	lastName: text("last_name"),
	phone: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const savedVehicles = pgTable("saved_vehicles", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	vehicleId: integer("vehicle_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "saved_vehicles_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.vehicleId],
			foreignColumns: [vehicles.id],
			name: "saved_vehicles_vehicle_id_vehicles_id_fk"
		}).onDelete("cascade"),
	unique("saved_vehicles_user_id_vehicle_id_unique").on(table.userId, table.vehicleId),
]);

export const vehicles = pgTable("vehicles", {
	id: serial().primaryKey().notNull(),
	make: text().notNull(),
	model: text().notNull(),
	year: integer().notNull(),
	price: integer().notNull(),
	mileage: integer().notNull(),
	fuelType: text("fuel_type").notNull(),
	transmission: text().notNull(),
	color: text().notNull(),
	description: text().notNull(),
	category: text().notNull(),
	condition: text().default('Used').notNull(),
	isFeatured: boolean("is_featured").default(false),
	features: json().default([]).notNull(),
	images: json().default([]).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	vin: text().notNull(),
	isSold: boolean("is_sold").default(false),
	soldPrice: integer("sold_price"),
	soldDate: timestamp("sold_date", { mode: 'string' }),
}, (table) => [
	unique("vehicles_vin_unique").on(table.vin),
]);
