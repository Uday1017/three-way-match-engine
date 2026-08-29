import { useQuery } from "@tanstack/react-query";
import { documentsApi } from "@/lib/api";

export function useDocumentsByPo(poNumber: string) {
  return useQuery({
    queryKey: ["documents", poNumber],
    queryFn: () => documentsApi.list({ poNumber }),
    enabled: !!poNumber,
  });
}
