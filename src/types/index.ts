import type { Types } from "mongoose";

export type UserRole = "student" | "admin" | "instructor";
export type ItemStatus = "lost" | "found" | "claimed";

export interface Item {
  id: string;
  title: string;
  description: string;
  location: string;
  status: ItemStatus;
  dateReported: string;
  categoryId: string;
  quantity?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Claim {
  id: string;
  itemId: string;
  claimantName: string;
  claimDate: string;
  status: "pending" | "approved" | "rejected";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export type UserDoc = Omit<User, "id"> & { password: string };
export type NewUserBody = Pick<User, "name" | "email"> & { password: string };

export type ItemDoc = Omit<Item, "id" | "dateReported" | "quantity"> & {
  userId: Types.ObjectId;
  dateReported: Date;
  quantity: number;
};

export type NewItemBody = Pick<
  Item,
  "title" | "description" | "location" | "status" | "dateReported" | "categoryId" | "quantity"
>;