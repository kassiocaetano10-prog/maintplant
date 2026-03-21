-- CreateTable
CREATE TABLE "Valve" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tag" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "marca" TEXT,
    "serie" TEXT,
    "kit" TEXT,
    "assento" TEXT,
    "dn" TEXT,
    "tipo" TEXT,
    "ult_kit" TEXT,
    "ult_man" TEXT,
    "fabricacao" TEXT,
    "atuador" TEXT,
    "lote" TEXT,
    "mariposa" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ServiceOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zona" TEXT NOT NULL,
    "tecnico" TEXT NOT NULL,
    "data_programada" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aberta',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Valve_tag_key" ON "Valve"("tag");
