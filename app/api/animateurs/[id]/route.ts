import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FonctionAnimateur } from "@prisma/client";

// PUT - Mettre à jour un animateur
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();

    // Vérifier que c'est un président ou admin
    const allowedRoles = ["ADMIN", "PRESIDENT_FILLES", "PRESIDENT_GARCONS"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const data = await request.json();
    const { id } = await context.params; // ← AWAIT ici

    // Récupérer l'animateur existant
    const animateur = await prisma.animateur.findUnique({
      where: { id },
    });

    if (!animateur) {
      return NextResponse.json(
        { error: "Animateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le président ne modifie que sa section
    if (
      session.user.role === "PRESIDENT_FILLES" &&
      animateur.section !== "FILLES"
    ) {
      return NextResponse.json(
        { error: "Vous ne pouvez gérer que les animateurs filles" },
        { status: 403 }
      );
    }
    if (
      session.user.role === "PRESIDENT_GARCONS" &&
      animateur.section !== "GARCONS"
    ) {
      return NextResponse.json(
        { error: "Vous ne pouvez gérer que les animateurs garçons" },
        { status: 403 }
      );
    }

    // Mettre à jour
    const updated = await prisma.animateur.update({
      where: { id },
      data: {
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        email: data.email || null,
        fonction: data.fonction as FonctionAnimateur,
        afficherContact: data.afficherContact,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur PUT /api/animateurs/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un animateur
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();

    // Vérifier que c'est un président ou admin
    const allowedRoles = ["ADMIN", "PRESIDENT_FILLES", "PRESIDENT_GARCONS"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await context.params; // ← AWAIT ici

    // Récupérer l'animateur
    const animateur = await prisma.animateur.findUnique({
      where: { id },
    });

    if (!animateur) {
      return NextResponse.json(
        { error: "Animateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le président ne supprime que sa section
    if (
      session.user.role === "PRESIDENT_FILLES" &&
      animateur.section !== "FILLES"
    ) {
      return NextResponse.json(
        { error: "Vous ne pouvez gérer que les animateurs filles" },
        { status: 403 }
      );
    }
    if (
      session.user.role === "PRESIDENT_GARCONS" &&
      animateur.section !== "GARCONS"
    ) {
      return NextResponse.json(
        { error: "Vous ne pouvez gérer que les animateurs garçons" },
        { status: 403 }
      );
    }

    // Supprimer
    await prisma.animateur.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/animateurs/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
