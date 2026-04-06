-- CreateTable
CREATE TABLE "Denuncia" (
    "id" TEXT NOT NULL,
    "denuncianteId" TEXT,
    "denuncianteEmail" TEXT,
    "motivo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "emailDenunciado" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Denuncia_pkey" PRIMARY KEY ("id")
);
