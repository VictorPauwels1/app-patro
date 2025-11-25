import { Role, PatroGroup } from "@prisma/client";

interface User {
  role: Role;
  patroGroup: PatroGroup | null;
}

/**
 * Vérifier si l'utilisateur est admin
 */
export function isAdmin(user: User): boolean {
  return user.role === "ADMIN";
}

/**
 * Vérifier si l'utilisateur peut voir les données d'un groupe
 */
export function canViewGroup(user: User, group: PatroGroup): boolean {
  // Admin voit tout
  if (isAdmin(user)) return true;

  // Animateurs ne voient que leur groupe
  return user.patroGroup === group;
}

/**
 * Vérifier si l'utilisateur peut modifier les données d'un groupe
 */
export function canEditGroup(user: User, group: PatroGroup): boolean {
  return canViewGroup(user, group);
}

/**
 * Obtenir les groupes visibles par l'utilisateur
 */
export function getVisibleGroups(user: User): PatroGroup[] {
  if (isAdmin(user)) {
    return ["GARCONS", "FILLES"];
  }

  return user.patroGroup ? [user.patroGroup] : [];
}

/**
 * Obtenir le label du rôle
 */
export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    ADMIN: "Administrateur",
    ANIMATEUR_GARCONS: "Animateur Garçons",
    ANIMATEUR_FILLES: "Animateur Filles",
  };
  return labels[role];
}

/**
 * Obtenir le label du groupe
 */
export function getGroupLabel(group: PatroGroup): string {
  return group === "GARCONS" ? "Garçons" : "Filles";
}
