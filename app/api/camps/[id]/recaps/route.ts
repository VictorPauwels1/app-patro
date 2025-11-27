import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import {
  getCurrentSchoolYear,
  calculateSchoolAge,
  getSectionLabel,
} from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const currentYear = getCurrentSchoolYear();

    // Récupérer le camp avec ses inscriptions
    const camp = await prisma.camp.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            child: {
              include: {
                primaryParent: true,
                secondaryParent: true,
                registrations: {
                  where: { year: currentYear },
                },
              },
            },
          },
        },
      },
    });

    if (!camp) {
      return NextResponse.json({ error: "Camp non trouvé" }, { status: 404 });
    }

    // Traiter les données pour les récaps
    const allergies: any[] = [];
    const regimes: any[] = [];
    const medicaments: any[] = [];

    camp.registrations.forEach((campReg) => {
      const child = campReg.child;
      const age = calculateSchoolAge(child.birthDate);
      const section = child.section
        ? getSectionLabel(child.section)
        : "Non défini";

      // Utiliser les infos médicales du camp si mises à jour, sinon celles de la registration
      const medicalInfo = (
        campReg.medicalInfoUpdated && campReg.medicalInfo
          ? campReg.medicalInfo
          : child.registrations[0]?.medicalInfo
      ) as any;

      if (!medicalInfo) return;

      // Allergies
      if (medicalInfo.allergies?.hasAllergies) {
        allergies.push({
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          age,
          section,
          allergyList: medicalInfo.allergies.details || "Non spécifié",
          allergyConsequences: medicalInfo.allergies.consequences || null,
          parentName: `${child.primaryParent.firstName} ${child.primaryParent.lastName}`,
          parentPhone: child.primaryParent.phone,
        });
      }

      // Régimes
      if (medicalInfo.diet?.hasDiet) {
        regimes.push({
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          age,
          section,
          dietDetails: medicalInfo.diet.details || "Non spécifié",
          parentName: `${child.primaryParent.firstName} ${child.primaryParent.lastName}`,
          parentPhone: child.primaryParent.phone,
        });
      }

      // Médicaments
      if (medicalInfo.medications?.takesMedication) {
        medicaments.push({
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          age,
          section,
          medicationDetails: medicalInfo.medications.details || "Non spécifié",
          isAutonomous: medicalInfo.medications.canSelfAdminister || false,
          parentName: `${child.primaryParent.firstName} ${child.primaryParent.lastName}`,
          parentPhone: child.primaryParent.phone,
        });
      }
    });

    return NextResponse.json({
      campName: camp.name,
      allergies,
      regimes,
      medicaments,
    });
  } catch (error) {
    console.error("Erreur GET /api/camps/[id]/recaps:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
