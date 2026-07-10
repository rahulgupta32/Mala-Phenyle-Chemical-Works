-- CreateTable
CREATE TABLE "YearlyOrderSequence" (
    "year" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "YearlyOrderSequence_pkey" PRIMARY KEY ("year")
);
