import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { createElement } from "react";
import type React from "react";
import JSZip from "jszip";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVisibleGroups, canViewGroup } from "@/lib/permissions";
import {
  getCurrentSchoolYear,
  calculateSchoolAge,
  getSectionLabel,
} from "@/lib/utils";
import FicheMedicaleDocument from "@/lib/pdf/FicheMedicale";
import { Section } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const searchParams = request.nextUrl.searchParams;

    const type = searchParams.get("type"); // 'single' | 'all' | 'section' | 'animateurs'
    const mode = searchParams.get("mode") || "combined"; // 'combined' | 'individual'
    const childId = searchParams.get("childId");
    const section = searchParams.get("section") as Section | null;

    const visibleGroups = getVisibleGroups(session.user);
    const currentYear = getCurrentSchoolYear();

    // Récupérer les données selon le type
    let registrations: any[] = [];

    if (type === "single" && childId) {
      // Une seule fiche
      const registration = await prisma.registration.findFirst({
        where: {
          year: currentYear,
          childId: childId,
        },
        include: {
          child: {
            include: {
              primaryParent: true,
              secondaryParent: true,
            },
          },
        },
      });

      if (!registration) {
        return NextResponse.json(
          { error: "Enfant non trouvé" },
          { status: 404 }
        );
      }

      if (!canViewGroup(session.user, registration.child.patroGroup)) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }

      registrations = [registration];
    } else if (type === "animateurs") {
      // Toutes les fiches des animateurs (18 ans et +)
      const allRegistrations = await prisma.registration.findMany({
        where: {
          year: currentYear,
          child: {
            patroGroup: { in: visibleGroups },
          },
        },
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

      // Filtrer seulement les animateurs (18 ans et +)
      registrations = allRegistrations.filter((r) => {
        const age = calculateSchoolAge(r.child.birthDate);
        return age >= 18;
      });
    } else if (type === "section" && section) {
      // Par section
      registrations = await prisma.registration.findMany({
        where: {
          year: currentYear,
          child: {
            section: section,
            patroGroup: { in: visibleGroups },
          },
        },
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
    } else if (type === "all") {
      // Toutes les fiches (ENFANTS + ANIMATEURS)
      registrations = await prisma.registration.findMany({
        where: {
          year: currentYear,
          child: {
            patroGroup: { in: visibleGroups },
          },
        },
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
    }

    if (registrations.length === 0) {
      return NextResponse.json(
        { error: "Aucune fiche trouvée" },
        { status: 404 }
      );
    }

    // Générer les données pour le PDF
    const pdfDataArray = registrations.map((registration) => {
      const age = calculateSchoolAge(registration.child.birthDate);
      return {
        child: registration.child,
        parent1: registration.child.primaryParent,
        parent2: registration.child.secondaryParent,
        registration: registration,
        age: age,
        sectionLabel:
          age >= 18
            ? "Animateur"
            : registration.child.section
            ? getSectionLabel(registration.child.section)
            : "Non défini",
      };
    });

    // MODE INDIVIDUAL: Un PDF par enfant dans un ZIP
    if (mode === "individual") {
      const zip = new JSZip();

      for (const pdfData of pdfDataArray) {
        const doc: any = createElement(FicheMedicaleDocument, {
          data: pdfData,
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
        const filename = `fiche-${pdfData.child.lastName}-${pdfData.child.firstName}.pdf`;
        zip.file(filename, buffer);
      }

      // Générer le ZIP
      const zipBuffer: any = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 9 },
      });

      // Nom du fichier ZIP
      let zipFilename = "fiches.zip";
      if (type === "animateurs") {
        zipFilename = `fiches-animateurs-${currentYear}.zip`;
      } else if (type === "section") {
        zipFilename = `fiches-${section}-${currentYear}.zip`;
      } else {
        zipFilename = `fiches-toutes-${currentYear}.zip`;
      }

      return new NextResponse(zipBuffer, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${zipFilename}"`,
          "Content-Length": zipBuffer.length.toString(),
        },
      });
    }

    // MODE COMBINED: Un seul PDF avec toutes les fiches
    const docData = pdfDataArray.length === 1 ? pdfDataArray[0] : pdfDataArray;

    const doc: any = createElement(FicheMedicaleDocument, { data: docData });
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

    // Nom du fichier
    let filename = "fiche-medicale.pdf";
    if (type === "single" && pdfDataArray.length === 1) {
      filename = `fiche-${pdfDataArray[0].child.lastName}-${pdfDataArray[0].child.firstName}.pdf`;
    } else if (type === "animateurs") {
      filename = `fiches-animateurs-${currentYear}.pdf`;
    } else if (type === "section") {
      filename = `fiches-${section}-${currentYear}.pdf`;
    } else {
      filename = `fiches-toutes-${currentYear}.pdf`;
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Erreur génération PDF:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF", details: error.message },
      { status: 500 }
    );
  }
}
