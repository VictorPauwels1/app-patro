import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { createElement } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import {
  getCurrentSchoolYear,
  calculateSchoolAge,
  getSectionLabel,
} from "@/lib/utils";
import RecapsPDF from "@/lib/pdf/RecapsPDF";
import { Section } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // 'enfants' | 'camp'
    const recapType = searchParams.get("recapType"); // 'all' | 'allergies' | 'regimes' | 'medicaments'
    const section = searchParams.get("section") as Section | null;
    const animateurs = searchParams.get("animateurs") === "true";
    const campId = searchParams.get("campId");

    const currentYear = getCurrentSchoolYear();

    let allergies: any[] = [];
    let regimes: any[] = [];
    let medicaments: any[] = [];
    let title = "Fiches Récapitulatives";

    if (type === "camp" && campId) {
      // Récupérer les données du camp
      const camp = await prisma.camp.findUnique({
        where: { id: campId },
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

      title = `Fiches Récapitulatives - ${camp.name}`;

      // Traiter les données
      camp.registrations.forEach((campReg) => {
        const child = campReg.child;
        const age = calculateSchoolAge(child.birthDate);
        const sectionLabel = child.section
          ? getSectionLabel(child.section)
          : "Non défini";

        const medicalInfo = (
          campReg.medicalInfoUpdated && campReg.medicalInfo
            ? campReg.medicalInfo
            : child.registrations[0]?.medicalInfo
        ) as any;

        if (!medicalInfo) return;

        if (medicalInfo.allergies?.hasAllergies) {
          allergies.push({
            firstName: child.firstName,
            lastName: child.lastName,
            age,
            section: sectionLabel,
            allergyList: medicalInfo.allergies.details || "Non spécifié",
            allergyConsequences: medicalInfo.allergies.consequences || null,
            parentName: `${child.primaryParent.firstName} ${child.primaryParent.lastName}`,
            parentPhone: child.primaryParent.phone,
          });
        }

        if (medicalInfo.diet?.hasDiet) {
          regimes.push({
            firstName: child.firstName,
            lastName: child.lastName,
            age,
            section: sectionLabel,
            dietDetails: medicalInfo.diet.details || "Non spécifié",
            parentName: `${child.primaryParent.firstName} ${child.primaryParent.lastName}`,
            parentPhone: child.primaryParent.phone,
          });
        }

        if (medicalInfo.medications?.takesMedication) {
          medicaments.push({
            firstName: child.firstName,
            lastName: child.lastName,
            age,
            section: sectionLabel,
            medicationDetails:
              medicalInfo.medications.details || "Non spécifié",
            isAutonomous: medicalInfo.medications.canSelfAdminister || false,
            parentName: `${child.primaryParent.firstName} ${child.primaryParent.lastName}`,
            parentPhone: child.primaryParent.phone,
          });
        }
      });
    } else if (type === "enfants") {
      // Récupérer les inscriptions générales
      const where: any = {
        year: currentYear,
      };

      if (animateurs) {
        // Filtrer les animateurs (18 ans et +)
        const allRegistrations = await prisma.registration.findMany({
          where,
          include: {
            child: {
              include: {
                primaryParent: true,
                secondaryParent: true,
              },
            },
          },
        });

        const animateurRegistrations = allRegistrations.filter((r) => {
          const age = calculateSchoolAge(r.child.birthDate);
          return age >= 18;
        });

        title = "Fiches Récapitulatives - Animateurs";

        animateurRegistrations.forEach((reg) => {
          processRegistration(reg);
        });
      } else if (section) {
        where.child = { section };
        title = `Fiches Récapitulatives - ${getSectionLabel(section)}`;

        const registrations = await prisma.registration.findMany({
          where,
          include: {
            child: {
              include: {
                primaryParent: true,
                secondaryParent: true,
              },
            },
          },
        });

        registrations.forEach((reg) => {
          processRegistration(reg);
        });
      } else {
        title = "Fiches Récapitulatives - Toutes les sections";

        const registrations = await prisma.registration.findMany({
          where,
          include: {
            child: {
              include: {
                primaryParent: true,
                secondaryParent: true,
              },
            },
          },
        });

        registrations.forEach((reg) => {
          processRegistration(reg);
        });
      }
    }

    function processRegistration(reg: any) {
      const child = reg.child;
      const age = calculateSchoolAge(child.birthDate);
      const sectionLabel =
        age >= 18
          ? "Animateur"
          : child.section
          ? getSectionLabel(child.section)
          : "Non défini";
      const medicalInfo = reg.medicalInfo as any;

      if (!medicalInfo) return;

      if (medicalInfo.allergies?.hasAllergies) {
        allergies.push({
          firstName: child.firstName,
          lastName: child.lastName,
          age,
          section: sectionLabel,
          allergyList: medicalInfo.allergies.details || "Non spécifié",
          allergyConsequences: medicalInfo.allergies.consequences || null,
          parentName: `${child.primaryParent.firstName} ${child.primaryParent.lastName}`,
          parentPhone: child.primaryParent.phone,
        });
      }

      if (medicalInfo.diet?.hasDiet) {
        regimes.push({
          firstName: child.firstName,
          lastName: child.lastName,
          age,
          section: sectionLabel,
          dietDetails: medicalInfo.diet.details || "Non spécifié",
          parentName: `${child.primaryParent.firstName} ${child.primaryParent.lastName}`,
          parentPhone: child.primaryParent.phone,
        });
      }

      if (medicalInfo.medications?.takesMedication) {
        medicaments.push({
          firstName: child.firstName,
          lastName: child.lastName,
          age,
          section: sectionLabel,
          medicationDetails: medicalInfo.medications.details || "Non spécifié",
          isAutonomous: medicalInfo.medications.canSelfAdminister || false,
          parentName: `${child.primaryParent.firstName} ${child.primaryParent.lastName}`,
          parentPhone: child.primaryParent.phone,
        });
      }
    }

    // Filtrer selon recapType
    let dataToInclude = { allergies, regimes, medicaments };
    if (recapType === "allergies") {
      dataToInclude = { allergies, regimes: [], medicaments: [] };
    } else if (recapType === "regimes") {
      dataToInclude = { allergies: [], regimes, medicaments: [] };
    } else if (recapType === "medicaments") {
      dataToInclude = { allergies: [], regimes: [], medicaments };
    }

    // Générer le PDF
    const doc: any = createElement(RecapsPDF, {
      title,
      ...dataToInclude,
    });

    const stream = await renderToStream(doc);

    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    await new Promise((resolve, reject) => {
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="recaps-${recapType}.pdf"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Erreur PDF récaps:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}
