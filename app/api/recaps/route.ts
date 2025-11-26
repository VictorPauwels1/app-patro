import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVisibleGroups } from "@/lib/permissions";
import {
  getCurrentSchoolYear,
  calculateSchoolAge,
  getSectionLabel,
  formatPhoneNumber,
} from "@/lib/utils";
import { Section } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const searchParams = request.nextUrl.searchParams;

    const section = searchParams.get("section") as Section | null;
    const animateurs = searchParams.get("animateurs") === "true";

    const visibleGroups = getVisibleGroups(session.user);
    const currentYear = getCurrentSchoolYear();

    // Construire la requête selon les filtres
    let whereClause: any = {
      year: currentYear,
      child: {
        patroGroup: { in: visibleGroups },
      },
    };

    if (section) {
      whereClause.child.section = section;
    }

    // Récupérer toutes les inscriptions
    const registrations = await prisma.registration.findMany({
      where: whereClause,
      include: {
        child: {
          include: {
            primaryParent: true,
            secondaryParent: true,
          },
        },
      },
      orderBy: {
        child: {
          lastName: "asc",
        },
      },
    });

    // Filtrer par âge si animateurs
    let filteredRegistrations = registrations;
    if (animateurs) {
      filteredRegistrations = registrations.filter((r) => {
        const age = calculateSchoolAge(r.child.birthDate);
        return age >= 18;
      });
    } else if (!section) {
      // Si pas de section spécifique et pas animateurs, prendre que les enfants
      filteredRegistrations = registrations.filter((r) => {
        const age = calculateSchoolAge(r.child.birthDate);
        return age < 18;
      });
    }

    // Extraire les données par catégorie
    const allergies: any[] = [];
    const regimes: any[] = [];
    const medicaments: any[] = [];

    filteredRegistrations.forEach((registration) => {
      const child = registration.child;
      const parent1 = child.primaryParent;
      const medicalInfo = registration.medicalInfo as any;
      const age = calculateSchoolAge(child.birthDate);

      const baseData = {
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        age: age,
        section:
          age >= 18
            ? "Animateur"
            : child.section
            ? getSectionLabel(child.section)
            : "Non défini",
        parentName: `${parent1.firstName} ${parent1.lastName}`,
        parentPhone: formatPhoneNumber(parent1.phone),
      };

      // Allergies
      if (medicalInfo?.allergies?.hasAllergies) {
        allergies.push({
          ...baseData,
          allergyList: medicalInfo.allergies.allergyList,
          allergyConsequences: medicalInfo.allergies.allergyConsequences,
        });
      }

      // Régimes
      if (medicalInfo?.diet?.hasDiet) {
        regimes.push({
          ...baseData,
          dietDetails: medicalInfo.diet.dietDetails,
        });
      }

      // Médicaments
      if (medicalInfo?.medications?.takesMedication) {
        medicaments.push({
          ...baseData,
          medicationDetails: medicalInfo.medications.medicationDetails,
          isAutonomous: medicalInfo.medications.isAutonomous,
        });
      }
    });

    return NextResponse.json({
      allergies,
      regimes,
      medicaments,
    });
  } catch (error: any) {
    console.error("Erreur récaps:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
