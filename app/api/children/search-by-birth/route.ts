import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const birthDate = searchParams.get("birthDate");

    if (!birthDate) {
      return NextResponse.json(
        { error: "Date de naissance requise" },
        { status: 400 }
      );
    }

    // Rechercher les enfants avec cette date de naissance
    const children = await prisma.child.findMany({
      where: {
        birthDate: new Date(birthDate),
      },
      include: {
        primaryParent: true,
        secondaryParent: true,
      },
    });

    if (children.length === 0) {
      return NextResponse.json(
        { error: "Aucun enfant trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(children);
  } catch (error) {
    console.error("Erreur GET /api/children/search-by-birth:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
