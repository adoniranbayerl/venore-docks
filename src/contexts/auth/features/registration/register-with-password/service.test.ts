import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const hashPassword = vi.fn();
vi.mock("../../identity/password-hashing", () => ({
  hashPassword: (...args: unknown[]) => hashPassword(...args),
}));

const findUserIdByEmail = vi.fn();
const insertUserWithPassword = vi.fn();
vi.mock("./store", () => ({
  findUserIdByEmail: (...args: unknown[]) => findUserIdByEmail(...args),
  insertUserWithPassword: (...args: unknown[]) => insertUserWithPassword(...args),
  isUniqueViolation: (error: unknown) =>
    typeof error === "object" && error !== null && (error as { code?: string }).code === "23505",
}));

describe("registerWithPassword", () => {
  beforeEach(() => {
    hashPassword.mockReset();
    findUserIdByEmail.mockReset();
    insertUserWithPassword.mockReset();
    hashPassword.mockResolvedValue("scrypt$salt$hash");
    findUserIdByEmail.mockResolvedValue(null);
    insertUserWithPassword.mockResolvedValue({ id: "user-1", email: "a@b.com", name: "Ana" });
  });

  it("normaliza o email, faz hash da senha e cria o usuário", async () => {
    const { registerWithPassword } = await import("./service");
    const result = await registerWithPassword({ name: "  Ana ", email: " A@B.com ", password: "supersecret" });

    expect(findUserIdByEmail).toHaveBeenCalledWith("a@b.com");
    expect(hashPassword).toHaveBeenCalledWith("supersecret");
    expect(insertUserWithPassword).toHaveBeenCalledWith({ email: "a@b.com", name: "Ana", passwordHash: "scrypt$salt$hash" });
    expect(result).toEqual({ success: true, data: { id: "user-1", email: "a@b.com", name: "Ana" } });
  });

  it("rejeita email inválido sem tocar no banco", async () => {
    const { registerWithPassword } = await import("./service");
    const result = await registerWithPassword({ name: "Ana", email: "sem-arroba", password: "supersecret" });

    expect(result).toEqual({ success: false, error: { code: "auth.registration.invalid_email", message: expect.any(String) } });
    expect(findUserIdByEmail).not.toHaveBeenCalled();
    expect(insertUserWithPassword).not.toHaveBeenCalled();
  });

  it("rejeita senha com menos de 8 caracteres sem fazer hash", async () => {
    const { registerWithPassword } = await import("./service");
    const result = await registerWithPassword({ name: "Ana", email: "a@b.com", password: "curta" });

    expect(result).toEqual({ success: false, error: { code: "auth.registration.weak_password", message: expect.any(String) } });
    expect(hashPassword).not.toHaveBeenCalled();
  });

  it("rejeita email já cadastrado (pré-check)", async () => {
    findUserIdByEmail.mockResolvedValue("existing-id");

    const { registerWithPassword } = await import("./service");
    const result = await registerWithPassword({ name: "Ana", email: "a@b.com", password: "supersecret" });

    expect(result).toEqual({ success: false, error: { code: "auth.registration.email_taken", message: expect.any(String) } });
    expect(insertUserWithPassword).not.toHaveBeenCalled();
  });

  it("traduz violação de unique (corrida) em email_taken", async () => {
    insertUserWithPassword.mockRejectedValue(Object.assign(new Error("dup"), { code: "23505" }));

    const { registerWithPassword } = await import("./service");
    const result = await registerWithPassword({ name: "Ana", email: "a@b.com", password: "supersecret" });

    expect(result).toEqual({ success: false, error: { code: "auth.registration.email_taken", message: expect.any(String) } });
  });
});
