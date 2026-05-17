-- Met à jour image_principale_url depuis la première image produit_images (produits existants)
UPDATE produits p
SET image_principale_url = sub.url,
    updated_at = now()
FROM (
  SELECT DISTINCT ON (produit_id)
    produit_id,
    url
  FROM produit_images
  ORDER BY produit_id, is_primary DESC, ordre ASC
) sub
WHERE p.id = sub.produit_id
  AND (p.image_principale_url IS NULL OR p.image_principale_url = '');
