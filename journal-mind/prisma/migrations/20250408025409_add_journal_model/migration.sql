-- CreateTable
CREATE TABLE "Journal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_journalSharedWith" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_journalSharedWith_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_journalSharedWith_B_index" ON "_journalSharedWith"("B");

-- AddForeignKey
ALTER TABLE "Journal" ADD CONSTRAINT "Journal_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_journalSharedWith" ADD CONSTRAINT "_journalSharedWith_A_fkey" FOREIGN KEY ("A") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_journalSharedWith" ADD CONSTRAINT "_journalSharedWith_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
