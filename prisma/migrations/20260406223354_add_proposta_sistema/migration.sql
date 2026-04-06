-- AlterEnum
ALTER TYPE "ServiceStatus" ADD VALUE 'AGUARDANDO_PROPOSTA';

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "mensagemProposta" TEXT,
ADD COLUMN     "valorProposto" DOUBLE PRECISION;
