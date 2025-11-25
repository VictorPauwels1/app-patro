import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed...");

  // Créer l'utilisateur admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@patro.be" },
    update: {},
    create: {
      email: "admin@patro.be",
      password: adminPassword,
      name: "Administrateur",
      role: "ADMIN",
      patroGroup: null,
    },
  });
  console.log("✅ Admin créé:", admin.email);

  // Créer le compte animateurs garçons
  const animateursGarconsPassword = await bcrypt.hash("garcons123", 10);
  const animateursGarcons = await prisma.user.upsert({
    where: { email: "garcons@patro.be" },
    update: {},
    create: {
      email: "garcons@patro.be",
      password: animateursGarconsPassword,
      name: "Animateurs Garçons",
      role: "ANIMATEUR_GARCONS",
      patroGroup: "GARCONS",
    },
  });
  console.log("✅ Animateurs garçons créé:", animateursGarcons.email);

  // Créer le compte animateurs filles
  const animateursFillesPassword = await bcrypt.hash("filles123", 10);
  const animateursFilles = await prisma.user.upsert({
    where: { email: "filles@patro.be" },
    update: {},
    create: {
      email: "filles@patro.be",
      password: animateursFillesPassword,
      name: "Animateurs Filles",
      role: "ANIMATEUR_FILLES",
      patroGroup: "FILLES",
    },
  });
  console.log("✅ Animateurs filles créé:", animateursFilles.email);

  console.log("🎉 Seed terminé !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
