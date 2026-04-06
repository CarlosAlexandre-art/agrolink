-- CreateTable
CREATE TABLE "AvaliacaoProdutor" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "produtorId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvaliacaoProdutor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AvaliacaoProdutor_serviceId_key" ON "AvaliacaoProdutor"("serviceId");

-- AddForeignKey
ALTER TABLE "AvaliacaoProdutor" ADD CONSTRAINT "AvaliacaoProdutor_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoProdutor" ADD CONSTRAINT "AvaliacaoProdutor_produtorId_fkey" FOREIGN KEY ("produtorId") REFERENCES "Produtor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
