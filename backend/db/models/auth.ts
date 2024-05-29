/***
 * Mongoose models related to authentication and session management.
 */

import { model, Schema } from "mongoose";

interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthdate?: string;
  storage: number;
  guntherSessions: number;
  guntherEnabled: boolean;
  skills: string[];
  subscriptionId?: string;
  customerId?: string;
  subscriptionExpiry?: Date;
}

const userSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthdate: { type: String },
  storage: { type: Number, required: true },
  guntherSessions: { type: Number, required: true },
  guntherEnabled: { type: Boolean, required: true },
  skills: [{ type: String }],
  subscriptionId: { type: String },
  customerId: { type: String },
  subscriptionExpiry: { type: Date },
});

const User = model<IUser>("User", userSchema);

export default User;
