import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mastersApi } from "@/lib/api";

export interface SkuMasterAlias {
  source: "po" | "grn" | "invoice";
  code: string;
}

export interface SkuMaster {
  _id: string;
  skuErpCode: string;
  name: string;
  eanCode: string | null;
  hsnCode: string;
  uom: string;
  agreedRate: number;
  mrp: number;
  priceTolerance: number;
  aliases: SkuMasterAlias[];
}

export function useSkuMasters() {
  return useQuery({
    queryKey: ["sku-masters"],
    queryFn: mastersApi.list,
  });
}

export function useCreateSkuMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mastersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sku-masters"] });
    },
  });
}

export function useUpdateSkuMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SkuMaster> }) =>
      mastersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sku-masters"] });
    },
  });
}

export function useDeleteSkuMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mastersApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sku-masters"] });
    },
  });
}
