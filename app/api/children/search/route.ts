import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Numéro de téléphone requis" },
        { status: 400 }
      );
    }

    // Normaliser le numéro de téléphone (enlever espaces, tirets, etc.)
    const normalizedPhone = phone.replace(/[\s\-\.]/g, "");

    // Rechercher les enfants via les parents
    const children = await prisma.child.findMany({
      where: {
        OR: [
          { primaryParent: { phone: normalizedPhone } },
          { secondaryParent: { phone: normalizedPhone } },
        ],
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
    console.error("Erreur GET /api/children/search:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
