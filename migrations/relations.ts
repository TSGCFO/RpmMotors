import { relations } from "drizzle-orm/relations";
import { vehicles, inquiries, users, savedVehicles } from "./schema";

export const inquiriesRelations = relations(inquiries, ({one}) => ({
	vehicle: one(vehicles, {
		fields: [inquiries.vehicleId],
		references: [vehicles.id]
	}),
}));

export const vehiclesRelations = relations(vehicles, ({many}) => ({
	inquiries: many(inquiries),
	savedVehicles: many(savedVehicles),
}));

export const savedVehiclesRelations = relations(savedVehicles, ({one}) => ({
	user: one(users, {
		fields: [savedVehicles.userId],
		references: [users.id]
	}),
	vehicle: one(vehicles, {
		fields: [savedVehicles.vehicleId],
		references: [vehicles.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	savedVehicles: many(savedVehicles),
}));