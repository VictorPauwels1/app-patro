import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

/**
 * Obtenir la session côté serveur
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Vérifier si l'utilisateur est authentifié
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    throw new Error("Non authentifié");
  }

  return session;
}

/**
 * Vérifier si l'utilisateur est admin
 */
export async function requireAdmin() {
  const session = await requireAuth();

  if (session.user.role !== "ADMIN") {
    throw new Error("Accès refusé : admin requis");
  }

  return session;
}
