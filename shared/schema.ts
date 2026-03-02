import { z } from "zod";

export const assignmentSchema = z.object({
  stopName: z.string(),
  object: z.string(),
});

export type Assignment = z.infer<typeof assignmentSchema>;

export interface WalkthroughAnswer {
  stopName: string;
  userAnswer: string;
  correctObject: string;
  isCorrect: boolean;
}
