-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('PRODUTOR', 'PRESTADOR');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('PULVERIZACAO', 'COLHEITA', 'TRANSPORTE', 'MANUTENCAO_MAQUINAS', 'PLANTIO', 'TRATORACAO', 'ANALISE_SOLO', 'CONSULTORIA_AGRONOMICA', 'IRRIGACAO', 'DRONE_AGRICOLA', 'CERCAMENTO', 'ASSISTENCIA_VETERINARIA', 'TERRAPLANAGEM', 'ARMAZENAGEM', 'APLICACAO_FERTILIZANTES', 'CONTROLE_PRAGAS', 'CAPINA', 'OUTROS');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('AGUARDANDO', 'PROCURANDO', 'MATCH_ENCONTRADO', 'EM_ROTA', 'EXECUTANDO', 'CONCLUIDO', 'CANCELADO', 'DISPUTA');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDENTE', 'ACEITO', 'RECUSADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDENTE', 'RESERVADO', 'LIBERADO', 'REEMBOLSADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "tipo" "UserType" NOT NULL,
    "avatarUrl" TEXT,
    "estado" TEXT,
    "cidade" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produtor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nomeFazenda" TEXT,
    "areaTotal" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produtor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestador" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "avaliacao" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAvaliacoes" INTEGER NOT NULL DEFAULT 0,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "raioAtendamento" INTEGER NOT NULL DEFAULT 50,
    "stripeAccountId" TEXT,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "servicosOferecidos" "ServiceType"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prestador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "produtorId" TEXT NOT NULL,
    "tipo" "ServiceType" NOT NULL,
    "descricao" TEXT,
    "area" DOUBLE PRECISION,
    "urgencia" TEXT NOT NULL DEFAULT 'MEDIA',
    "status" "ServiceStatus" NOT NULL DEFAULT 'AGUARDANDO',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "endereco" TEXT,
    "precoEstimado" DOUBLE PRECISION,
    "precoFinal" DOUBLE PRECISION,
    "agendadoPara" TIMESTAMP(3),
    "fotoProva" TEXT,
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDENTE',
    "distancia" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "comissao" DOUBLE PRECISION NOT NULL,
    "valorPrestador" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDENTE',
    "stripePaymentId" TEXT,
    "stripeTransferId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Produtor_userId_key" ON "Produtor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Prestador_userId_key" ON "Prestador"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_serviceId_prestadorId_key" ON "Match"("serviceId", "prestadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_serviceId_key" ON "Payment"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Avaliacao_serviceId_key" ON "Avaliacao"("serviceId");

-- AddForeignKey
ALTER TABLE "Produtor" ADD CONSTRAINT "Produtor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestador" ADD CONSTRAINT "Prestador_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_produtorId_fkey" FOREIGN KEY ("produtorId") REFERENCES "Produtor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
