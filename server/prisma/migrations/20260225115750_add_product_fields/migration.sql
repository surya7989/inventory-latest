-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "stock" INTEGER NOT NULL,
    "gstRate" REAL NOT NULL DEFAULT 18,
    "unit" TEXT NOT NULL DEFAULT 'Pieces',
    "status" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "image" TEXT,
    "taxType" TEXT NOT NULL DEFAULT 'Inclusive',
    "mrp" REAL,
    "hsnCode" TEXT,
    "minStock" INTEGER NOT NULL DEFAULT 10,
    "expiryDate" TEXT,
    "returns" TEXT,
    "discountPercentage" REAL,
    "profit" REAL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("category", "createdAt", "gstRate", "id", "image", "name", "price", "purchasePrice", "sku", "status", "stock", "taxType", "unit", "updatedAt") SELECT "category", "createdAt", "gstRate", "id", "image", "name", "price", "purchasePrice", "sku", "status", "stock", "taxType", "unit", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
