import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed...\n");

  // ============================================
  // 1. PARAMÈTRES DES DEUX SECTIONS
  // ============================================
  console.log("📝 Création des paramètres...");

  const settingsGarcons = await prisma.settings.upsert({
    where: { section: "GARCONS" },
    update: {
      iban: "BE56 7755 9576 1388",
      bic: "GKCCBEBB",
      beneficiaire: "PATRO ST NICOLAS GARCONS ENGHIEN",
    },
    create: {
      section: "GARCONS",
      prixInscription: 45,
      emailContact: "garcons@patro-enghien.be",
      adresse: "Rue de la Gare 10, 7850 Enghien",
      horaires: "Dimanches 14h00 - 17h00",
      iban: "BE56 7755 9576 1388",
      bic: "GKCCBEBB",
      beneficiaire: "PATRO ST NICOLAS GARCONS ENGHIEN",
    },
  });

  const settingsFilles = await prisma.settings.upsert({
    where: { section: "FILLES" },
    update: {
      iban: "BE02 7995 2721 8240",
      bic: "GEBABEBB",
      beneficiaire: "PATRONAGE ST.NICOLAS ENGHIEN FILLES",
    },
    create: {
      section: "FILLES",
      prixInscription: 45,
      emailContact: "filles@patro-enghien.be",
      adresse: "Rue de la Gare 10, 7850 Enghien",
      horaires: "Dimanches 14h00 - 17h00",
      iban: "BE02 7995 2721 8240",
      bic: "GEBABEBB",
      beneficiaire: "PATRONAGE ST.NICOLAS ENGHIEN FILLES",
    },
  });

  console.log("✅ Paramètres créés\n");

  // ============================================
  // 2. COMPTES UTILISATEURS
  // ============================================
  console.log("👥 Création des comptes utilisateurs...");

  // Admin
  const hashedPasswordAdmin = await bcrypt.hash("AdminPatro2024", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@patro.be" },
    update: {
      password: hashedPasswordAdmin,
      role: "ADMIN",
    },
    create: {
      email: "admin@patro.be",
      name: "Administrateur",
      password: hashedPasswordAdmin,
      role: "ADMIN",
      patroGroup: null,
    },
  });

  // Président Filles
  const hashedPasswordFilles = await bcrypt.hash("PatroFilles2024", 10);
  const presidentFilles = await prisma.user.upsert({
    where: { email: "president.filles@patro.be" },
    update: {
      password: hashedPasswordFilles,
      role: "PRESIDENT_FILLES",
      patroGroup: "FILLES",
    },
    create: {
      email: "president.filles@patro.be",
      name: "Président Filles",
      password: hashedPasswordFilles,
      role: "PRESIDENT_FILLES",
      patroGroup: "FILLES",
    },
  });

  // Président Garçons
  const hashedPasswordGarcons = await bcrypt.hash("PatroGarcons2024", 10);
  const presidentGarcons = await prisma.user.upsert({
    where: { email: "president.garcons@patro.be" },
    update: {
      password: hashedPasswordGarcons,
      role: "PRESIDENT_GARCONS",
      patroGroup: "GARCONS",
    },
    create: {
      email: "president.garcons@patro.be",
      name: "Président Garçons",
      password: hashedPasswordGarcons,
      role: "PRESIDENT_GARCONS",
      patroGroup: "GARCONS",
    },
  });

  // Animateur Filles (exemple)
  const hashedPasswordAnimFilles = await bcrypt.hash("AnimFilles2024", 10);
  const animateurFilles = await prisma.user.upsert({
    where: { email: "animateur.filles@patro.be" },
    update: {
      password: hashedPasswordAnimFilles,
      role: "ANIMATEUR_FILLES",
      patroGroup: "FILLES",
    },
    create: {
      email: "animateur.filles@patro.be",
      name: "Animateur Filles",
      password: hashedPasswordAnimFilles,
      role: "ANIMATEUR_FILLES",
      patroGroup: "FILLES",
    },
  });

  // Animateur Garçons (exemple)
  const hashedPasswordAnimGarcons = await bcrypt.hash("AnimGarcons2024", 10);
  const animateurGarcons = await prisma.user.upsert({
    where: { email: "animateur.garcons@patro.be" },
    update: {
      password: hashedPasswordAnimGarcons,
      role: "ANIMATEUR_GARCONS",
      patroGroup: "GARCONS",
    },
    create: {
      email: "animateur.garcons@patro.be",
      name: "Animateur Garçons",
      password: hashedPasswordAnimGarcons,
      role: "ANIMATEUR_GARCONS",
      patroGroup: "GARCONS",
    },
  });

  console.log("✅ Comptes utilisateurs créés\n");

  // ============================================
  // 3. ANIMATEURS (fiches de contact)
  // ============================================
  console.log("📞 Création des fiches animateurs...");

  // Vérifier si les animateurs existent déjà avant de les créer
  const existingFilleAnim = await prisma.animateur.findFirst({
    where: {
      email: "marie.dupont@example.com",
    },
  });

  if (!existingFilleAnim) {
    await prisma.animateur.create({
      data: {
        nom: "Dupont",
        prenom: "Marie",
        telephone: "0477 12 34 56",
        email: "marie.dupont@example.com",
        section: "FILLES",
        fonction: "CO_PRESIDENT",
        afficherContact: true,
      },
    });
  }

  const existingGarconAnim = await prisma.animateur.findFirst({
    where: {
      email: "pierre.martin@example.com",
    },
  });

  if (!existingGarconAnim) {
    await prisma.animateur.create({
      data: {
        nom: "Martin",
        prenom: "Pierre",
        telephone: "0478 98 76 54",
        email: "pierre.martin@example.com",
        section: "GARCONS",
        fonction: "CO_PRESIDENT",
        afficherContact: true,
      },
    });
  }

  console.log("✅ Fiches animateurs créées\n");

  // ============================================
  // RÉSUMÉ
  // ============================================
  console.log("🎉 Seed terminé avec succès !\n");
  console.log("═══════════════════════════════════════");
  console.log("📋 IDENTIFIANTS CRÉÉS :");
  console.log("═══════════════════════════════════════\n");

  console.log("👑 ADMIN");
  console.log("   📧 Email : admin@patro.be");
  console.log("   🔒 Mot de passe : AdminPatro2024\n");

  console.log("👤 PRÉSIDENT FILLES");
  console.log("   📧 Email : president.filles@patro.be");
  console.log("   🔒 Mot de passe : PatroFilles2024\n");

  console.log("👤 PRÉSIDENT GARÇONS");
  console.log("   📧 Email : president.garcons@patro.be");
  console.log("   🔒 Mot de passe : PatroGarcons2024\n");

  console.log("👨‍🏫 ANIMATEUR FILLES");
  console.log("   📧 Email : animateur.filles@patro.be");
  console.log("   🔒 Mot de passe : AnimFilles2024\n");

  console.log("👨‍🏫 ANIMATEUR GARÇONS");
  console.log("   📧 Email : animateur.garcons@patro.be");
  console.log("   🔒 Mot de passe : AnimGarcons2024\n");

  console.log("═══════════════════════════════════════");
  console.log("💳 COORDONNÉES BANCAIRES :");
  console.log("═══════════════════════════════════════\n");

  console.log("🏦 GARÇONS");
  console.log("   IBAN : BE56 7755 9576 1388");
  console.log("   BIC : GKCCBEBB");
  console.log("   Bénéficiaire : PATRO ST NICOLAS GARCONS ENGHIEN\n");

  console.log("🏦 FILLES");
  console.log("   IBAN : BE02 7995 2721 8240");
  console.log("   BIC : GEBABEBB");
  console.log("   Bénéficiaire : PATRONAGE ST.NICOLAS ENGHIEN FILLES\n");

  console.log("═══════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
