"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import type { ContractFunctionArgs, ContractFunctionName, Hash, TransactionReceipt } from "viem";
import { useToast } from "@/components/ToastProvider";
import { fairDropAbi, fairDropAddress } from "@/lib/contract";
import { parseReceiptError, parseTxError } from "@/lib/txErrors";

type WriteFunctionName = ContractFunctionName<typeof fairDropAbi, "nonpayable" | "payable">;

export type TxRequest<F extends WriteFunctionName> = {
  functionName: F;
  /** Pas d'argument ? Passer `[]`. */
  args: ContractFunctionArgs<typeof fairDropAbi, "nonpayable" | "payable", F>;
  value?: bigint;
};

export type TxMeta = {
  /** Identifie l'élément visé (ex. `resell-3`) pour afficher l'état de chargement sur la bonne carte. */
  key?: string;
  /** Titre du toast de succès. */
  success: string;
  /** Lien affiché dans le toast de succès, éventuellement dérivé des logs du receipt (ex. dropId créé). */
  link?: (receipt: TransactionReceipt) => { href: string; label: string } | undefined;
  /** Appelé une seule fois, quand la tx est CONFIRMÉE on-chain (pas à la signature). Ex. reset d'un formulaire. */
  onSuccess?: (receipt: TransactionReceipt) => void;
};

/**
 * Écriture sur le contrat FairDrop + feedback complet :
 *  1. `isSigning`    → en attente de la signature dans le wallet (`isPending` de useWriteContract)
 *  2. `isConfirming` → tx envoyée, en attente de confirmation on-chain (`useWaitForTransactionReceipt`)
 *  3. toast de succès (avec lien) ou d'erreur (raison du revert si récupérable), puis refetch des lectures.
 * Une seule tx à la fois par instance du hook.
 */
export function useContractTx() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { writeContract, isPending: isSigning } = useWriteContract();

  const [pending, setPending] = useState<{ hash: Hash; meta: TxMeta } | undefined>();
  const [activeKey, setActiveKey] = useState<string | undefined>();

  // `retry: false` : sur une tx revertée, wagmi LÈVE l'erreur (avec la raison) au lieu de renvoyer un receipt
  // "reverted". Avec les retries par défaut de react-query, le toast d'erreur arriverait ≥ 7 s trop tard
  // (et resterait bloqué tant que l'onglet est en arrière-plan). L'attente d'inclusion, elle, est déjà
  // gérée en boucle par viem.
  const { data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: pending?.hash,
    query: { retry: false },
  });

  useEffect(() => {
    if (!pending || !receipt || receipt.transactionHash !== pending.hash) return;

    toast({ kind: "success", title: pending.meta.success, link: pending.meta.link?.(receipt) });
    // Les lectures on-chain (collection, listings, soldes…) sont périmées : on les recharge.
    queryClient.invalidateQueries();
    pending.meta.onSuccess?.(receipt);

    setPending(undefined);
    setActiveKey(undefined);
  }, [pending, receipt, toast, queryClient]);

  useEffect(() => {
    if (!pending || !receiptError) return;
    toast({ kind: "error", ...parseReceiptError(receiptError) });
    // Un revert n'invalide pas les lectures, mais l'état affiché peut être obsolète (ex. listing déjà vendu).
    queryClient.invalidateQueries();
    setPending(undefined);
    setActiveKey(undefined);
  }, [pending, receiptError, toast, queryClient]);

  const send = useCallback(
    <F extends WriteFunctionName>(request: TxRequest<F>, meta: TxMeta) => {
      setActiveKey(meta.key ?? "");
      // Le cast est local : l'API publique du hook reste typée par l'ABI (functionName → args).
      writeContract({ address: fairDropAddress, abi: fairDropAbi, ...request } as never, {
        onSuccess: (hash) => setPending({ hash, meta }),
        onError: (error) => {
          toast({ kind: "error", ...parseTxError(error) });
          setActiveKey(undefined);
        },
      });
    },
    [writeContract, toast],
  );

  const isConfirming = pending !== undefined;

  return {
    send,
    isSigning,
    isConfirming,
    isBusy: isSigning || isConfirming,
    /** `key` de la tx en cours (undefined si aucune). */
    activeKey,
    /** Label de bouton pendant la tx : signature wallet, puis confirmation on-chain. */
    pendingLabel: isSigning ? "Confirm in wallet…" : "Confirming…",
  };
}
