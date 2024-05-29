/***
 * Mongoose models related to skills.
 */

import { model, Schema } from "mongoose";

interface ISkill {
  name: string;
  count: number;
  bgColour?: string;
  textColour?: string;
  imageId?: string;
}

const skillSchema = new Schema<ISkill>({
  name: { type: String, required: true },
  count: { type: Number, default: 0 },
  bgColour: { type: String },
  textColour: { type: String },
  imageId: { type: String },
});

const Skill = model<ISkill>("Skill", skillSchema);

export default Skill;
