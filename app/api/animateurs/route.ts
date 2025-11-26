import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PatroGroup, FonctionAnimateur } from "@prisma/client";

// POST - Créer un animateur
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Vérifier que c'est un président ou admin
    const allowedRoles = ["ADMIN", "PRESIDENT_FILLES", "PRESIDENT_GARCONS"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const data = await request.json();

    // Vérifier que le président ne crée que pour sa section
    if (session.user.role === "PRESIDENT_FILLES" && data.section !== "FILLES") {
      return NextResponse.json(
        { error: "Vous ne pouvez gérer que les animateurs filles" },
        { status: 403 }
      );
    }
    if (
      session.user.role === "PRESIDENT_GARCONS" &&
      data.section !== "GARCONS"
    ) {
      return NextResponse.json(
        { error: "Vous ne pouvez gérer que les animateurs garçons" },
        { status: 403 }
      );
    }

    // Créer l'animateur
    const animateur = await prisma.animateur.create({
      data: {
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        email: data.email || null,
        section: data.section as PatroGroup,
        fonction: data.fonction as FonctionAnimateur,
        afficherContact: data.afficherContact || false,
      },
    });

    return NextResponse.json(animateur);
  } catch (error) {
    console.error("Erreur POST /api/animateurs:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
