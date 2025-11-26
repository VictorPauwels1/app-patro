import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PatroGroup } from "@prisma/client";

// PUT - Mettre à jour les paramètres
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Vérifier que c'est un président ou admin
    const allowedRoles = ["ADMIN", "PRESIDENT_FILLES", "PRESIDENT_GARCONS"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const data = await request.json();
    const section = data.section as PatroGroup;

    // Vérifier que le président ne modifie que sa section
    if (session.user.role === "PRESIDENT_FILLES" && section !== "FILLES") {
      return NextResponse.json(
        { error: "Vous ne pouvez gérer que les paramètres filles" },
        { status: 403 }
      );
    }
    if (session.user.role === "PRESIDENT_GARCONS" && section !== "GARCONS") {
      return NextResponse.json(
        { error: "Vous ne pouvez gérer que les paramètres garçons" },
        { status: 403 }
      );
    }

    // Mettre à jour ou créer
    const settings = await prisma.settings.upsert({
      where: { section },
      update: {
        prixInscription: data.prixInscription,
        emailContact: data.emailContact,
        adresse: data.adresse,
        horaires: data.horaires,
      },
      create: {
        section,
        prixInscription: data.prixInscription,
        emailContact: data.emailContact,
        adresse: data.adresse,
        horaires: data.horaires,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erreur PUT /api/settings:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
