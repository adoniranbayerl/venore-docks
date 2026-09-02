import { getCurrentUser } from "@/contexts/auth";
import { MEDIA_ALLOWED_TYPES } from "../../../contracts/types";
import { uploadReservedCategoryAsset } from "./service";
import type { UploadReservedCategoryAssetInput, UploadReservedCategoryAssetResult } from "./types";

// Qualquer ator autenticado envia o PRÓPRIO arquivo (sem media.manage) — a autorização de negócio
// (matrícula, acesso ao chamado etc.) é do plugin chamador, antes/depois. Aqui só: autenticado +
// tipo/tamanho dentro de MEDIA_ALLOWED_TYPES (e da lista `allowedMimeCategories` do chamador).
export async function uploadReservedCategoryAssetHandler(
  input: UploadReservedCategoryAssetInput,
): Promise<UploadReservedCategoryAssetResult> {
  if (input.filename.trim().length === 0) {
    return { success: false, error: { code: "media.upload.invalid_filename", message: "O nome do arquivo não pode ser vazio." } };
  }

  const rule = MEDIA_ALLOWED_TYPES[input.contentType];
  const categoryOk = rule && (!input.allowedMimeCategories || input.allowedMimeCategories.includes(rule.category));
  if (!rule || !categoryOk) {
    return {
      success: false,
      error: { code: "media.reserved_upload.invalid_mime_type", message: "Tipo de arquivo não permitido para este envio." },
    };
  }

  if (input.size <= 0) {
    return { success: false, error: { code: "media.upload.invalid_size", message: "O tamanho do arquivo deve ser maior que zero." } };
  }
  if (input.size > rule.maxSizeBytes) {
    return {
      success: false,
      error: {
        code: "media.upload.file_too_large",
        message: `O arquivo excede o limite de ${Math.floor(rule.maxSizeBytes / (1024 * 1024))}MB para o tipo "${input.contentType}".`,
      },
    };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "media.reserved_upload.unauthenticated", message: "É necessário estar autenticado para executar esta operação." },
    };
  }

  return uploadReservedCategoryAsset({ ...input, actorId: currentUser.data.id });
}
