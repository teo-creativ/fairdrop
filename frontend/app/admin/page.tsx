"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { fairDropAbi, fairDropAddress } from "@/lib/contract";
import { isAddress, parseEther, parseEventLogs } from "viem";
import { useContractTx } from "@/hooks/useContractTx";
import { useToast } from "@/components/ToastProvider";
import { FormField } from "@/components/FormField";

const DEFAULT_DURATION = "300";
const DEFAULT_SUPPLY = "1";

/**
 * Écran Admin — formulaire `createDrop`. Protégé côté front par une vérification
 * `address === owner()` ; la vraie barrière de sécurité est le modifier `onlyOwner`
 * du contrat (voir docs/functional-spec.md §5).
 */
export default function AdminPage() {
  const { address } = useAccount();
  const { data: owner } = useReadContract({
    address: fairDropAddress,
    abi: fairDropAbi,
    functionName: "owner",
  });
  const { send, isBusy, pendingLabel } = useContractTx();
  const toast = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  // <input type="file"> n'est pas contrôlable par React : on change sa `key` pour le remonter vidé.
  const [fileInputKey, setFileInputKey] = useState(0);
  const [startPrice, setStartPrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [dropDuration, setDropDuration] = useState(DEFAULT_DURATION);
  const [totalSupply, setTotalSupply] = useState(DEFAULT_SUPPLY);
  const [officialReseller, setOfficialReseller] = useState("");

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  /** Remet le formulaire dans son état initial (appelé une fois la création CONFIRMÉE on-chain). */
  function resetForm() {
    setName("");
    setDescription("");
    setImageFile(null);
    setFileInputKey((k) => k + 1);
    setStartPrice("");
    setReservePrice("");
    setDropDuration(DEFAULT_DURATION);
    setTotalSupply(DEFAULT_SUPPLY);
    setOfficialReseller("");
  }

  function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isAddress(officialReseller.trim())) {
      toast({ kind: "error", title: "Invalid form", message: "Official reseller must be a valid 0x… address." });
      return;
    }

    let startPriceWei: bigint, reservePriceWei: bigint, durationSec: bigint, supply: bigint;
    try {
      startPriceWei = parseEther(startPrice.trim());
      reservePriceWei = parseEther(reservePrice.trim());
      durationSec = BigInt(dropDuration.trim());
      supply = BigInt(totalSupply.trim());
    } catch {
      toast({
        kind: "error",
        title: "Invalid form",
        message: "Prices must be decimal numbers; duration and total supply must be whole numbers.",
      });
      return;
    }

    // Voir docs/functional-spec.md §5 : conversion en data: URI, pas d'infra IPFS pendant le hackathon.
    // Alternative plus légère si le temps manque : remplacer ce champ par une simple URL d'image hébergée.
    const imageURI = imageFile ? await fileToDataUri(imageFile) : "";

    send(
      {
        functionName: "createDrop",
        args: [
          name,
          description,
          imageURI,
          startPriceWei,
          reservePriceWei,
          durationSec,
          supply,
          officialReseller.trim() as `0x${string}`,
        ],
      },
      {
        success: "Drop created!",
        link: (receipt) => {
          const [created] = parseEventLogs({ abi: fairDropAbi, eventName: "DropCreated", logs: receipt.logs });
          return created ? { href: `/drops/${created.args.dropId}`, label: "View the drop" } : undefined;
        },
        onSuccess: resetForm,
      },
    );
  }

  if (!isOwner) {
    return (
      <div className="px-8 py-10">
        <p className="text-muted">
          Connect the deployer wallet to access the admin panel. (Real access control is enforced
          on-chain by the contract&apos;s `onlyOwner` modifier — this page check is cosmetic.)
        </p>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 max-w-xl">
      <h1 className="text-white text-3xl mb-6">Create a drop</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-card text-white rounded-lg px-4 py-3"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-card text-white rounded-lg px-4 py-3"
          required
        />
        <input
          key={fileInputKey}
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="text-white"
        />

        <div className="grid grid-cols-2 gap-4 items-start">
          <FormField caption="Prix de départ de la Dutch Auction, en MON. Il baisse ensuite à chaque seconde.">
            <input
              placeholder="Start price (MON)"
              value={startPrice}
              onChange={(e) => setStartPrice(e.target.value)}
              className="bg-card text-white rounded-lg px-4 py-3"
              required
            />
          </FormField>
          <FormField caption="Prix plancher en MON : le prix ne descend jamais en dessous. Doit être inférieur au Start price.">
            <input
              placeholder="Reserve price (MON)"
              value={reservePrice}
              onChange={(e) => setReservePrice(e.target.value)}
              className="bg-card text-white rounded-lg px-4 py-3"
              required
            />
          </FormField>
          <FormField caption="Durée en secondes de la Dutch Auction, avant que le prix n'atteigne le Reserve price.">
            <input
              placeholder="Duration (seconds)"
              value={dropDuration}
              onChange={(e) => setDropDuration(e.target.value)}
              className="bg-card text-white rounded-lg px-4 py-3"
              required
            />
          </FormField>
          <FormField caption="Nombre d'exemplaires mis en vente dans ce drop, tous sur la même courbe de prix.">
            <input
              placeholder="Total supply"
              value={totalSupply}
              onChange={(e) => setTotalSupply(e.target.value)}
              className="bg-card text-white rounded-lg px-4 py-3"
              required
            />
          </FormField>
        </div>

        <FormField caption="Adresse du revendeur officiel de la campagne : il reçoit 1 % de chaque revente secondaire. Fixée à la création, non modifiable ensuite.">
          <input
            placeholder="Official reseller address (0x...)"
            value={officialReseller}
            onChange={(e) => setOfficialReseller(e.target.value)}
            className="bg-card text-white rounded-lg px-4 py-3"
            required
          />
        </FormField>

        <button
          type="submit"
          disabled={isBusy}
          className="bg-gradient-to-r from-accent to-accent-light text-white rounded-pill py-4 font-medium disabled:opacity-50"
        >
          {isBusy ? pendingLabel : "Create drop"}
        </button>
      </form>
    </div>
  );
}
