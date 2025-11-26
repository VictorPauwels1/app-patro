import { z } from "zod";

/**
 * Schema de validation pour l'inscription complète d'un enfant
 */
export const inscriptionSchema = z.object({
  // ============================================
  // INFORMATIONS ENFANT
  // ============================================
  childFirstName: z
    .string()
    .min(2, "Le prenom doit contenir au moins 2 caracteres"),
  childLastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caracteres"),
  childBirthDate: z.string().min(1, "La date de naissance est requise"),
  patroGroup: z.enum(["GARCONS", "FILLES"]),

  // ============================================
  // ADRESSE (commune)
  // ============================================
  address: z.string().min(5, "Adresse incomplete"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().min(4, "Code postal invalide"),

  // ============================================
  // 1ER RESPONSABLE
  // ============================================
  parent1FirstName: z.string().min(2, "Prenom requis"),
  parent1LastName: z.string().min(2, "Nom requis"),
  parent1Relationship: z.string().min(1, "Lien de parente requis"),
  parent1Phone: z.string().min(9, "Numero de telephone invalide"),
  parent1Email: z.string().email("Email invalide"),

  // ============================================
  // 2EME RESPONSABLE
  // ============================================
  parent2FirstName: z.string().min(2, "Prenom requis"),
  parent2LastName: z.string().min(2, "Nom requis"),
  parent2Relationship: z.string().min(1, "Lien de parente requis"),
  parent2Phone: z.string().min(9, "Numero de telephone invalide"),

  // ============================================
  // EMAILS
  // ============================================
  secondaryEmail: z
    .string()
    .email("Email invalide")
    .optional()
    .or(z.literal("")),

  // ============================================
  // DROITS A L'IMAGE
  // ============================================
  photoConsent: z.enum(["full", "background", "none"]),
  photoUsage: z.boolean().default(false),
  photoArchive: z.boolean().default(false),

  // ============================================
  // FICHE MEDICALE
  // ============================================
  doctorName: z.string().min(2, "Nom du medecin requis"),
  doctorPhone: z.string().min(9, "Numero du medecin requis"),

  canParticipate: z.boolean(),
  participationRestrictions: z.string().optional(),

  canSwim: z.enum(["yes", "no", "alittle"]),

  importantMedicalInfo: z.string().optional(),
  medicalHistory: z.string().optional(),

  tetanusVaccine: z.boolean(),

  hasAllergies: z.boolean(),
  allergyList: z.string().optional(),
  allergyConsequences: z.string().optional(),

  hasDiet: z.boolean(),
  dietDetails: z.string().optional(),

  takesMedication: z.boolean(),
  medicationDetails: z.string().optional(),
  medicationAutonomous: z.boolean().optional(),

  otherInfo: z.string().optional(),

  weight: z.string().min(1, "Poids requis"),

  // ============================================
  // AUTORISATIONS
  // ============================================
  emergencyMedicalConsent: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter l'autorisation medicale d'urgence",
  }),
});

export type InscriptionFormData = z.infer<typeof inscriptionSchema>;
