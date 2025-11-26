import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inscriptionSchema } from "@/lib/validations";
import {
  getCurrentSchoolYear,
  determineSection,
  normalizePhoneNumber,
} from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Valider les donnees
    const validatedData = inscriptionSchema.parse(body);

    // Normaliser les numeros de telephone
    const parent1Phone = normalizePhoneNumber(validatedData.parent1Phone);
    const parent2Phone = normalizePhoneNumber(validatedData.parent2Phone);

    // Creer ou recuperer le 1er responsable
    let parent1 = await prisma.parent.findUnique({
      where: { phone: parent1Phone },
    });

    if (!parent1) {
      parent1 = await prisma.parent.create({
        data: {
          firstName: validatedData.parent1FirstName,
          lastName: validatedData.parent1LastName,
          relationship: validatedData.parent1Relationship,
          email: validatedData.parent1Email,
          phone: parent1Phone,
        },
      });
    } else {
      // Mettre a jour l'email au cas ou il a change
      parent1 = await prisma.parent.update({
        where: { id: parent1.id },
        data: {
          email: validatedData.parent1Email,
        },
      });
    }

    // Creer ou recuperer le 2eme responsable
    let parent2 = await prisma.parent.findUnique({
      where: { phone: parent2Phone },
    });

    if (!parent2) {
      parent2 = await prisma.parent.create({
        data: {
          firstName: validatedData.parent2FirstName,
          lastName: validatedData.parent2LastName,
          relationship: validatedData.parent2Relationship,
          email: validatedData.parent1Email, // Utilise l'email du parent 1 par defaut
          phone: parent2Phone,
        },
      });
    }

    // Verifier si l'enfant existe deja
    const existingChild = await prisma.child.findFirst({
      where: {
        firstName: validatedData.childFirstName,
        lastName: validatedData.childLastName,
        birthDate: new Date(validatedData.childBirthDate),
        OR: [
          { primaryParentId: parent1.id },
          { secondaryParentId: parent1.id },
          { primaryParentId: parent2.id },
          { secondaryParentId: parent2.id },
        ],
      },
    });

    let child;

    if (existingChild) {
      // Mettre a jour les informations de l'enfant
      child = await prisma.child.update({
        where: { id: existingChild.id },
        data: {
          address: validatedData.address,
          city: validatedData.city,
          postalCode: validatedData.postalCode,
          secondaryEmail: validatedData.secondaryEmail || null,
        },
      });
    } else {
      // Creer l'enfant
      const section = determineSection(
        new Date(validatedData.childBirthDate),
        validatedData.patroGroup
      );

      child = await prisma.child.create({
        data: {
          firstName: validatedData.childFirstName,
          lastName: validatedData.childLastName,
          birthDate: new Date(validatedData.childBirthDate),
          patroGroup: validatedData.patroGroup,
          section: section,
          address: validatedData.address,
          city: validatedData.city,
          postalCode: validatedData.postalCode,
          secondaryEmail: validatedData.secondaryEmail || null,
          primaryParentId: parent1.id,
          secondaryParentId: parent2.id,
        },
      });
    }

    // Verifier si une inscription existe deja pour cette annee
    const currentYear = getCurrentSchoolYear();
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        childId_year: {
          childId: child.id,
          year: currentYear,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "Cet enfant est deja inscrit pour cette annee" },
        { status: 400 }
      );
    }

    // Construire les informations medicales
    const medicalInfo = {
      doctorName: validatedData.doctorName,
      doctorPhone: validatedData.doctorPhone,
      canParticipate: validatedData.canParticipate,
      participationRestrictions: validatedData.participationRestrictions || "",
      canSwim: validatedData.canSwim,
      importantMedicalInfo: validatedData.importantMedicalInfo || "",
      medicalHistory: validatedData.medicalHistory || "",
      tetanusVaccine: validatedData.tetanusVaccine,
      allergies: {
        hasAllergies: validatedData.hasAllergies,
        allergyList: validatedData.allergyList || "",
        allergyConsequences: validatedData.allergyConsequences || "",
      },
      diet: {
        hasDiet: validatedData.hasDiet,
        dietDetails: validatedData.dietDetails || "",
      },
      medications: {
        takesMedication: validatedData.takesMedication,
        medicationDetails: validatedData.medicationDetails || "",
        isAutonomous: validatedData.medicationAutonomous || false,
      },
      otherInfo: validatedData.otherInfo || "",
    };

    // Creer l'inscription
    const registration = await prisma.registration.create({
      data: {
        childId: child.id,
        year: currentYear,
        medicalInfo: medicalInfo,
        weight: parseFloat(validatedData.weight),
        photoConsent: validatedData.photoConsent,
        photoUsage: validatedData.photoUsage,
        photoArchive: validatedData.photoArchive,
        emergencyMedicalConsent: validatedData.emergencyMedicalConsent,
        isPaid: false,
        amount: 45,
      },
    });

    return NextResponse.json({
      success: true,
      registration,
      message: "Inscription reussie !",
    });
  } catch (error: any) {
    console.error("Erreur inscription:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Donnees invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
