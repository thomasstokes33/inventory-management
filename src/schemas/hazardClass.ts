import { z } from "zod";

export const HazardSchema = z.object({
    id: z.int(),
    classification: z.string()
});