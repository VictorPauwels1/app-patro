import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Section, PatroGroup } from "@prisma/client";

/**
 * Combine classes Tailwind proprement
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formater une date en français
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Formater une date courte (ex: 25/11/2024)
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Calculer l'âge réel à partir d'une date de naissance
 */
export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calculer l'âge selon l'année scolaire (basé sur l'année de naissance)
 * Utilisé pour déterminer la section au Patro
 */
export function calculateSchoolAge(birthDate: Date | string): number {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const birthYear = birth.getFullYear();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Calculer l'année scolaire actuelle
  // Si on est entre septembre (9) et décembre (12), on est dans l'année scolaire currentYear-(currentYear+1)
  // Si on est entre janvier (1) et août (8), on est dans l'année scolaire (currentYear-1)-currentYear
  const month = currentDate.getMonth() + 1; // 1-12
  const schoolYear = month >= 9 ? currentYear : currentYear - 1;

  // Age selon l'année scolaire
  return schoolYear - birthYear;
}

/**
 * Déterminer la section selon l'année de naissance et le groupe
 * Utilise l'âge scolaire (année de naissance)
 */
export function determineSection(
  birthDate: Date | string,
  patroGroup: PatroGroup
): Section | null {
  const schoolAge = calculateSchoolAge(birthDate);

  if (patroGroup === "GARCONS") {
    if (schoolAge >= 4 && schoolAge < 6) return "POUSSINS_G";
    if (schoolAge >= 6 && schoolAge < 9) return "BENJAMINS";
    if (schoolAge >= 9 && schoolAge < 12) return "CHEVALIERS";
    if (schoolAge >= 12 && schoolAge < 15) return "CONQUERANTS";
    if (schoolAge >= 15 && schoolAge < 18) return "BROTHERS";
    // Animateurs (18+)
    if (schoolAge >= 18) return "BROTHERS"; // On les met avec les Brothers par défaut
  } else {
    if (schoolAge >= 4 && schoolAge < 6) return "POUSSINS_F";
    if (schoolAge >= 6 && schoolAge < 9) return "BENJAMINES";
    if (schoolAge >= 9 && schoolAge < 12) return "ETINCELLES";
    if (schoolAge >= 12 && schoolAge < 15) return "ALPINES";
    if (schoolAge >= 15 && schoolAge < 18) return "GRANDES";
    // Animatrices (18+)
    if (schoolAge >= 18) return "GRANDES"; // On les met avec les Grandes par défaut
  }

  // Si l'âge ne correspond à aucune section (trop jeune)
  return null;
}

/**
 * Obtenir le nom lisible d'une section
 */
export function getSectionLabel(section: Section | null): string {
  if (!section) return "Section non définie";

  const labels: Record<Section, string> = {
    POUSSINS_G: "Poussins (Garçons)",
    BENJAMINS: "Benjamins",
    CHEVALIERS: "Chevaliers",
    CONQUERANTS: "Conquérants",
    BROTHERS: "Brothers",
    POUSSINS_F: "Poussins (Filles)",
    BENJAMINES: "Benjamines",
    ETINCELLES: "Étincelles",
    ALPINES: "Alpines",
    GRANDES: "Grandes",
  };

  return labels[section];
}

/**
 * Obtenir la tranche d'âge d'une section
 */
export function getSectionAgeRange(section: Section): string {
  const ranges: Record<Section, string> = {
    POUSSINS_G: "4-6 ans",
    BENJAMINS: "6-9 ans",
    CHEVALIERS: "9-12 ans",
    CONQUERANTS: "12-15 ans",
    BROTHERS: "15-17 ans",
    POUSSINS_F: "4-6 ans",
    BENJAMINES: "6-9 ans",
    ETINCELLES: "9-12 ans",
    ALPINES: "12-15 ans",
    GRANDES: "15-17 ans",
  };
  return ranges[section];
}

/**
 * Vérifier si une personne est animateur (18 ans ou plus)
 */
export function isAnimateurAge(birthDate: Date | string): boolean {
  return calculateSchoolAge(birthDate) >= 18;
}

/**
 * Obtenir l'année scolaire actuelle (ex: "2024-2025")
 */
export function getCurrentSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12

  // Si on est entre janvier et août, on est dans l'année scolaire précédente
  if (month >= 1 && month <= 8) {
    return `${year - 1}-${year}`;
  }

  return `${year}-${year + 1}`;
}

/**
 * Vérifier si une chaîne est un email valide
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formater un prix en euros
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

/**
 * Formater un numéro de téléphone belge
 */
export function formatPhoneNumber(phone: string): string {
  // Enlever tous les espaces et caractères spéciaux
  const cleaned = phone.replace(/\D/g, "");

  // Format belge: +32 XXX XX XX XX ou 0XXX XX XX XX
  if (cleaned.startsWith("32")) {
    return `+32 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(
      7,
      9
    )} ${cleaned.slice(9)}`;
  } else if (cleaned.startsWith("0")) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(
      6,
      8
    )} ${cleaned.slice(8)}`;
  }

  return phone;
}

/**
 * Normaliser un numéro de téléphone belge
 * Convertit tous les formats vers un format uniforme : 32XXXXXXXXX
 */
export function normalizePhoneNumber(phone: string): string {
  // Enlever tous les espaces, tirets, points, slashes
  let cleaned = phone.replace(/[\s\-\.\/\(\)]/g, "");

  // Enlever le + au début si présent
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // Si commence par 00, enlever
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }

  // Si commence par 32, c'est déjà le bon format
  if (cleaned.startsWith("32")) {
    return cleaned;
  }

  // Si commence par 0, remplacer par 32
  if (cleaned.startsWith("0")) {
    return "32" + cleaned.substring(1);
  }

  // Si commence directement par 4 (mobile sans 0), ajouter 32
  if (cleaned.startsWith("4") && cleaned.length === 9) {
    return "32" + cleaned;
  }

  // Sinon, retourner tel quel
  return cleaned;
}

export function getDisplaySection(
  birthDate: Date,
  section: Section | null
): string {
  const age = calculateSchoolAge(birthDate);

  if (age >= 18) {
    return "Animateur";
  }

  return getSectionLabel(section);
}
