import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { PatroGroup, Section } from "@prisma/client";

// GET - Récupérer la liste des camps
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patroGroup = searchParams.get("patroGroup") as PatroGroup | null;

    const camps = await prisma.camp.findMany({
      where: patroGroup ? { patroGroup } : undefined,
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
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json(camps);
  } catch (error) {
    console.error("Erreur GET /api/camps:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des camps" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau camp
export async function POST(request: NextRequest) {
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
      iban,
      beneficiaire,
      patroGroup,
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
      !iban ||
      !beneficiaire ||
      !patroGroup ||
      !sections ||
      sections.length === 0
    ) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    // Vérifier les permissions (animateurs/présidents ne peuvent créer que pour leur groupe)
    if (session.user.patroGroup && session.user.patroGroup !== patroGroup) {
      return NextResponse.json(
        { error: "Vous ne pouvez créer un camp que pour votre groupe" },
        { status: 403 }
      );
    }

    // Créer le camp
    const camp = await prisma.camp.create({
      data: {
        name,
        description,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        price: parseFloat(price),
        iban,
        beneficiaire,
        patroGroup,
        sections,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        createdById: session.user.id,
        animators:
          animatorIds && animatorIds.length > 0
            ? {
                connect: animatorIds.map((id: string) => ({ id })),
              }
            : undefined,
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

    return NextResponse.json(camp, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/camps:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du camp" },
      { status: 500 }
    );
  }
}
