import { describe, expect, it } from "vitest";
import { db } from "@/infrastructure/database/client";
import { seedUser } from "@/test-support/integration/user-seed";
import { assets } from "./index";

// Prova de garantia de schema (não de comportamento de aplicação): `uploaded_by` é NOT NULL e
// `visibility` tem NOT NULL DEFAULT 'private' — um insert que só define as colunas obrigatórias
// ainda assim nunca nasce sem dono nem sem visibilidade.
describe("visibility — schema não permite asset sem dono e sem visibilidade", () => {
  it("um insert que só define as colunas obrigatórias herda visibility='private' do default da coluna", async () => {
    const actor = await seedUser();

    const [row] = await db
      .insert(assets)
      .values({
        filename: "no-visibility-given.png",
        pathname: `${crypto.randomUUID()}-no-visibility-given.png`,
        url: "https://example.test/no-visibility-given.png",
        contentType: "image/png",
        size: 10,
        checksum: "checksum-1",
        uploadedBy: actor.id,
      })
      .returning();

    expect(row.uploadedBy).toBe(actor.id);
    expect(row.visibility).toBe("private");
  });
});
