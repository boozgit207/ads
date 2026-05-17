export interface BlogPost {
  id: string;
  titre: string;
  titre_en: string | null;
  slug: string;
  extrait: string | null;
  extrait_en: string | null;
  contenu: string;
  contenu_en: string | null;
  image_url: string | null;
  auteur: string | null;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}
