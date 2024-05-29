/**
 * Skill-related functions for reading and writing to the MongoDB database.
 */

import User from "./models/auth";
import Skill from "./models/skills";

export async function createSkill(
  name: string,
  bgColour?: string,
  textColour?: string,
  imageId?: string
): Promise<any> {
  const skill = await Skill.create({
    name,
    bgColour,
    textColour,
    imageId,
  });
  return skill;
}

export async function getSkills(): Promise<any> {
  const skills = await Skill.find().lean();
  return skills;
}

export async function getSkill(skillId: string): Promise<any> {
  const skill = await Skill.findOne({ _id: skillId }).lean();
  return skill;
}

export async function updateSkill(
  skillId: string,
  name: string,
  bgColour?: string,
  textColour?: string,
  imageId?: string
): Promise<any> {
  await Skill.updateOne(
    { _id: skillId },
    { name, bgColour, textColour, imageId }
  );
  const skill = await Skill.findOne({ _id: skillId }).lean();
  return skill;
}

export async function updateSkillCount(
  skillId: string,
  increment: number
): Promise<any> {
  await Skill.updateOne({ _id: skillId }, { $inc: { count: increment } });
  const skill = await Skill.findOne({ _id: skillId }).lean();
  return skill;
}

export async function deleteSkill(skillId: string): Promise<any> {
  const skill = await Skill.findOne({ _id: skillId }).lean();
  await Skill.deleteOne({ _id: skillId });
  return skill;
}

export async function addUserSkill(
  userId: string,
  skillId: string
): Promise<any> {
  await User.updateOne({ _id: userId }, { $addToSet: { skills: skillId } });
  const user = await User.findOne({ _id: userId }).lean();
  return user;
}

export async function deleteUserSkill(
  userId: string,
  skillId: string
): Promise<any> {
  await User.updateOne({ _id: userId }, { $pull: { skills: skillId } });
  const user = await User.findOne({ _id: userId }).lean();
  return user;
}
