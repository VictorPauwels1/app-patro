import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campId, childId, medicalInfoChanged, remarks } = body;

    if (!campId || !childId || medicalInfoChanged === undefined) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que le camp existe et est disponible
    const camp = await prisma.camp.findUnique({
      where: { id: campId },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    if (!camp) {
      return NextResponse.json({ error: "Camp non trouvé" }, { status: 404 });
    }

    if (!camp.isPublic) {
      return NextResponse.json(
        { error: "Ce camp n'est pas ouvert aux inscriptions" },
        { status: 403 }
      );
    }

    // Vérifier si le camp est complet
    if (camp.maxParticipants) {
      const placesRestantes = camp.maxParticipants - camp._count.registrations;
      if (placesRestantes <= 0) {
        return NextResponse.json(
          { error: "Ce camp est complet" },
          { status: 400 }
        );
      }
    }

    // Vérifier que l'enfant existe et appartient au bon groupe
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouvé" }, { status: 404 });
    }

    if (child.patroGroup !== camp.patroGroup) {
      return NextResponse.json(
        { error: "Cet enfant ne peut pas s'inscrire à ce camp" },
        { status: 403 }
      );
    }

    // Vérifier si l'enfant n'est pas déjà inscrit
    const existingRegistration = await prisma.campRegistration.findUnique({
      where: {
        campId_childId: {
          campId,
          childId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "Cet enfant est déjà inscrit à ce camp" },
        { status: 400 }
      );
    }

    // Créer l'inscription
    const registration = await prisma.campRegistration.create({
      data: {
        campId,
        childId,
        medicalInfoUpdated: medicalInfoChanged,
        remarks,
        paidAmount: camp.price,
      },
      include: {
        child: true,
        camp: true,
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/camp-registrations:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
