import { z } from "zod";

export const hazardSchema = z.object({
    id: z.int(),
    classification: z.string()
});