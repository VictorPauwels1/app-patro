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
 * Calculer l'âge à partir d'une date de naissance
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
 * Déterminer la section selon l'âge et le groupe
 */
export function determineSection(
  birthDate: Date | string,
  patroGroup: PatroGroup
): Section {
  const age = calculateAge(birthDate);

  if (patroGroup === "GARCONS") {
    if (age >= 4 && age < 6) return "POUSSINS_G";
    if (age >= 6 && age < 9) return "BENJAMINS";
    if (age >= 9 && age < 12) return "CHEVALIERS";
    if (age >= 12 && age < 15) return "CONQUERANTS";
    if (age >= 15 && age < 18) return "BROTHERS";
  } else {
    if (age >= 4 && age < 6) return "POUSSINS_F";
    if (age >= 6 && age < 9) return "BENJAMINES";
    if (age >= 9 && age < 12) return "ETINCELLES";
    if (age >= 12 && age < 15) return "ALPINES";
    if (age >= 15 && age < 18) return "GRANDES";
  }

  // Par défaut, retourner la section la plus jeune
  return patroGroup === "GARCONS" ? "POUSSINS_G" : "POUSSINS_F";
}

/**
 * Obtenir le nom lisible d'une section
 */
export function getSectionLabel(section: Section): string {
  const labels: Record<Section, string> = {
    POUSSINS_G: "Poussins",
    BENJAMINS: "Benjamins",
    CHEVALIERS: "Chevaliers",
    CONQUERANTS: "Conquérants",
    BROTHERS: "Brothers",
    POUSSINS_F: "Poussins",
    BENJAMINES: "Benjamines",
    ETINCELLES: "Étincelles",
    ALPINES: "Alpines",
    GRANDES: "Grandes",
  };
  return labels[section];
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
