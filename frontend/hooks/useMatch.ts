import { useQuery } from "@tanstack/react-query";
import { matchApi } from "@/lib/api";

export function useMatchStatus(poNumber: string) {
  return useQuery({
    queryKey: ["match", poNumber],
    queryFn: () => matchApi.getMatch(poNumber),
    enabled: !!poNumber,
  });
}

export function useSummary(poNumber: string) {
  return useQuery({
    queryKey: ["summary", poNumber],
    queryFn: () => matchApi.getSummary(poNumber),
    enabled: !!poNumber,
  });
}
