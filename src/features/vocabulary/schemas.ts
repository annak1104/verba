import {z} from "zod";

const optionalText = z
  .string()
  .trim()
  .default("");

export const cardFormSchema = z.object({
  deckId: z.string().uuid(),
  english: z.string().trim().min(1).max(180),
  ukrainianTranslation: z.string().trim().min(1).max(2000),
  ukrainianPronunciation: z.string().trim().min(1).max(180),
  ipa: optionalText,
  exampleEnglish: optionalText,
  exampleUkrainian: optionalText,
  notes: optionalText,
  favorite: z.boolean().default(false),
  difficulty: z.coerce.number().int().min(1).max(5).default(1),
  tags: z.string().default("")
});

export const deckFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: optionalText,
  color: z.enum(["emerald", "cyan", "amber", "rose"]).default("emerald")
});

export type CardFormValues = z.output<typeof cardFormSchema>;
export type CardFormInput = z.input<typeof cardFormSchema>;
export type DeckFormValues = z.output<typeof deckFormSchema>;
export type DeckFormInput = z.input<typeof deckFormSchema>;
