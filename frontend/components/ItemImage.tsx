type ItemImageProps = {
  imageURI?: string;
  alt: string;
};

/**
 * Image produit (data: URI ou URL hébergée). Affiche un placeholder propre quand `imageURI`
 * est vide ou pas encore chargé — un drop peut être créé sans image depuis /admin.
 */
export function ItemImage({ imageURI, alt }: ItemImageProps) {
  if (!imageURI) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="rounded-lg aspect-square bg-black/40 flex items-center justify-center text-5xl text-muted"
      >
        🃏
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageURI} alt={alt} className="rounded-lg aspect-square object-contain bg-black/40" />
  );
}
