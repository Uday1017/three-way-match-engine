import { useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "@/lib/api";

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      documentType,
    }: {
      file: File;
      documentType: "po" | "grn" | "invoice";
    }) => documentsApi.upload(file, documentType),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["match"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}
