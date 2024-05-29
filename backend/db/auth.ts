/**
 * Authentication functions for reading and writing to the MongoDB database.
 */

import User from "./models/auth";

export async function createUser(
  _id: string,
  email: string,
  firstName: string,
  lastName: string,
  birthdate: string,
  storage: number,
  skills: string[],
  guntherSessions: number,
  guntherEnabled: boolean
): Promise<void> {
  await User.create({
    _id,
    email,
    firstName,
    lastName,
    birthdate,
    storage,
    skills,
    guntherSessions,
    guntherEnabled,
  });
}

export async function getUsers(): Promise<any> {
  const users = await User.find().lean();
  return users;
}

export async function getUser(userId: string): Promise<any> {
  const user = await User.find({ _id: userId }).lean();
  return user;
}

// Updates the user payment. Since this is monthly, also refresh gunther quota.
export async function updateUserPayment(
  userId: string,
  customerId?: string,
  subscriptionId?: string,
  subscriptionExpiry?: Date,
  guntherSessions: number = 15,
  guntherEnabled: boolean = true
): Promise<void> {
  if (userId === undefined) {
    // Update based on Stripe customer ID.
    await User.updateOne(
      { customerId },
      {
        customerId,
        subscriptionId,
        subscriptionExpiry,
        guntherSessions,
        guntherEnabled,
      }
    );
  } else {
    // Newly created user gets associated with the pre-existing ID.
    await User.updateOne(
      { _id: userId },
      {
        customerId,
        subscriptionId,
        subscriptionExpiry,
        guntherSessions,
        guntherEnabled,
      }
    );
  }
}

export async function updateUserStorage(
  userId: string,
  storageAdded: number
): Promise<void> {
  await User.updateOne({ _id: userId }, { $inc: { storage: storageAdded } });
}

export async function decrementUserGuntherSessions(
  userId: string
): Promise<void> {
  await User.updateOne({ _id: userId }, { $inc: { guntherSessions: -1 } });
}
