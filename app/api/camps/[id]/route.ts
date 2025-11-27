import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { Section } from "@prisma/client";

// GET - Récupérer un camp spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const camp = await prisma.camp.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        animators: {
          select: {
            id: true,
            name: true,
          },
        },
        registrations: {
          include: {
            child: true,
          },
        },
      },
    });

    if (!camp) {
      return NextResponse.json({ error: "Camp non trouvé" }, { status: 404 });
    }

    return NextResponse.json(camp);
  } catch (error) {
    console.error("Erreur GET /api/camps/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du camp" },
      { status: 500 }
    );
  }
}

// PUT - Modifier un camp
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      location,
      startDate,
      endDate,
      startTime,
      endTime,
      price,
      sections,
      animatorIds,
      maxParticipants,
    } = body;

    // Validation
    if (
      !name ||
      !location ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      price === undefined ||
      !sections ||
      sections.length === 0
    ) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    // Vérifier que le camp existe
    const existingCamp = await prisma.camp.findUnique({
      where: { id: params.id },
    });

    if (!existingCamp) {
      return NextResponse.json({ error: "Camp non trouvé" }, { status: 404 });
    }

    // Vérifier les permissions
    if (
      session.user.patroGroup &&
      session.user.patroGroup !== existingCamp.patroGroup
    ) {
      return NextResponse.json(
        { error: "Vous ne pouvez modifier que les camps de votre groupe" },
        { status: 403 }
      );
    }

    // Mettre à jour le camp
    const camp = await prisma.camp.update({
      where: { id: params.id },
      data: {
        name,
        description,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        price: parseFloat(price),
        sections: sections as Section[],
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        animators: {
          set: [], // Déconnecte tous les animateurs existants
          connect:
            animatorIds && animatorIds.length > 0
              ? animatorIds.map((id: string) => ({ id }))
              : [],
        },
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        animators: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(camp);
  } catch (error) {
    console.error("Erreur PUT /api/camps/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du camp" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un camp
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que le camp existe
    const existingCamp = await prisma.camp.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!existingCamp) {
      return NextResponse.json({ error: "Camp non trouvé" }, { status: 404 });
    }

    // Vérifier les permissions
    if (
      session.user.patroGroup &&
      session.user.patroGroup !== existingCamp.patroGroup
    ) {
      return NextResponse.json(
        { error: "Vous ne pouvez supprimer que les camps de votre groupe" },
        { status: 403 }
      );
    }

    // Supprimer le camp (les inscriptions seront supprimées en cascade)
    await prisma.camp.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Camp supprimé avec succès" });
  } catch (error) {
    console.error("Erreur DELETE /api/camps/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du camp" },
      { status: 500 }
    );
  }
}
