import { BaseError, ContractFunctionRevertedError, InsufficientFundsError, UserRejectedRequestError } from "viem";

export type TxErrorInfo = { title: string; message: string };

/** Erreurs custom du contrat (OpenZeppelin) → phrase lisible. */
const CUSTOM_ERROR_MESSAGES: Record<string, string> = {
  OwnableUnauthorizedAccount: "Only the contract owner (deployer wallet) can do this.",
  ERC721IncorrectOwner: "You are not the owner of this token.",
  ERC721InsufficientApproval: "This token is not approved for transfer.",
  ERC721NonexistentToken: "This token does not exist (anymore).",
  ReentrancyGuardReentrantCall: "Reentrant call blocked.",
};

const GENERIC_MESSAGE = "The transaction failed. Check your wallet and balance, then try again.";
const REVERTED_ON_CHAIN_MESSAGE = "The transaction was reverted on-chain (no reason returned by the contract).";

/**
 * Transforme une erreur viem/wagmi (signature, simulation ou revert) en message affichable.
 * Priorité : rejet wallet → raison du revert du contrat → fonds insuffisants → message générique.
 */
export function parseTxError(error: unknown): TxErrorInfo {
  const title = "Transaction failed";

  if (!(error instanceof BaseError)) {
    return { title, message: GENERIC_MESSAGE };
  }

  const rejected =
    error.walk((e) => e instanceof UserRejectedRequestError) ||
    /user (rejected|denied)|rejected the request/i.test(error.message);
  if (rejected) {
    return { title: "Transaction cancelled", message: "You rejected the request in your wallet." };
  }

  const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError);
  if (reverted instanceof ContractFunctionRevertedError) {
    // `reason` d'abord : viem décode `Error(string)` avec errorName === "Error" et renseigne `reason`.
    if (reverted.reason) {
      return { title, message: `Contract reverted: "${reverted.reason}"` };
    }
    const errorName = reverted.data?.errorName;
    if (errorName && errorName !== "Error") {
      return { title, message: CUSTOM_ERROR_MESSAGES[errorName] ?? `Contract error: ${errorName}` };
    }
  }

  // Certains wallets/nœuds ne renvoient pas la donnée décodable, seulement du texte :
  // "execution reverted: <reason>" (details) ou "Execution reverted with reason: <reason>." (shortMessage).
  const texts = [error.details, error.shortMessage].filter((t): t is string => Boolean(t));
  for (const text of texts) {
    const match = /reverted(?:\s+with\s+reason)?:\s*(?:revert:\s*)?([^\n"]+?)\.?\s*$/i.exec(text);
    if (match?.[1]) return { title, message: `Contract reverted: "${match[1]}"` };
  }
  if (texts.some((t) => /revert/i.test(t))) {
    return { title, message: REVERTED_ON_CHAIN_MESSAGE };
  }

  if (error.walk((e) => e instanceof InsufficientFundsError)) {
    return { title, message: "Insufficient funds to cover the price and the gas fees." };
  }

  return { title, message: GENERIC_MESSAGE };
}

/**
 * Erreur levée pendant l'attente du receipt (`useWaitForTransactionReceipt`).
 * Sur une tx minée puis revertée, wagmi rejoue l'appel et lève `new Error(<raison décodée>)`
 * (Error simple, pas une BaseError viem) : on affiche cette raison si elle est lisible.
 * Une BaseError viem (erreur RPC/réseau, ou rejeu du call qui expose le revert) passe par parseTxError.
 */
export function parseReceiptError(error: unknown): TxErrorInfo {
  const title = "Transaction failed";

  if (error instanceof BaseError) {
    const parsed = parseTxError(error);
    return parsed.message === GENERIC_MESSAGE
      ? { title, message: "The transaction did not complete — it may have been reverted on-chain. Check your wallet activity, then try again." }
      : parsed;
  }

  // eslint-disable-next-line no-control-regex
  const reason = error instanceof Error ? error.message.replace(/\u0000/g, "").trim() : "";
  // Une erreur custom du contrat n'est pas décodable comme une string : le texte serait illisible.
  const readable = /^[\x20-\x7E -￿]+$/.test(reason) && reason !== "unknown reason";

  return { title, message: readable ? `Contract reverted: "${reason}"` : REVERTED_ON_CHAIN_MESSAGE };
}
