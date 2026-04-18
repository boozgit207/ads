'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { showToast } from '../../components/Toast';
import { logout } from '../../actions/auth';
import { 
  listProduits, 
  listCategories, 
  listLaboratoires,
  deleteProduit,
  createProduit,
  updateProduit,
  uploadAndSaveProductImages,
  getProductImages
} from '../actions/catalogue-simple';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download,
  X,
  Package,
  Sparkles,
  Building2,
  Folder,
  ArrowUpDown,
  Image as ImageIcon,
  Tag,
  Microscope,
  DollarSign,
  Boxes,
  AlertCircle,
  Eye
} from 'lucide-react';

export default function ProduitsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLab, setSelectedLab] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [laboratories, setLaboratories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc' | 'date'>('date');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedCategory, selectedLab, sortBy]);

  const [allCategories, setAllCategories] = useState<any[]>([]); // Toutes les catégories pour filtrage

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, labsData] = await Promise.all([
        listProduits(searchTerm || undefined),
        listCategories(),
        listLaboratoires(),
      ]);
      // Stocker toutes les catégories pour filtrage dynamique
      setAllCategories(categoriesData || []);
      setLaboratories(labsData || []);
      
      // Appliquer les filtres côté client
      let filteredProducts = productsData || [];
      
      // Filtre par catégorie
      if (selectedCategory) {
        filteredProducts = filteredProducts.filter(p => p.categorie_id === selectedCategory || p.categories?.id === selectedCategory);
      }
      
      // Filtre par laboratoire
      if (selectedLab) {
        filteredProducts = filteredProducts.filter(p => 
          p.laboratoire_id === selectedLab || 
          p.categories?.laboratoire_id === selectedLab ||
          p.categories?.laboratoires?.id === selectedLab
        );
      }
      
      // Appliquer le tri
      switch (sortBy) {
        case 'name':
          filteredProducts = filteredProducts.sort((a, b) => a.nom.localeCompare(b.nom));
          break;
        case 'price-asc':
          filteredProducts = filteredProducts.sort((a, b) => a.prix - b.prix);
          break;
        case 'price-desc':
          filteredProducts = filteredProducts.sort((a, b) => b.prix - a.prix);
          break;
        case 'stock-asc':
          filteredProducts = filteredProducts.sort((a, b) => (a.quantite_stock || 0) - (b.quantite_stock || 0));
          break;
        case 'stock-desc':
          filteredProducts = filteredProducts.sort((a, b) => (b.quantite_stock || 0) - (a.quantite_stock || 0));
          break;
        case 'date':
        default:
          filteredProducts = filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Catégories filtrées selon le labo sélectionné (EN TEMPS RÉEL)
  const filteredCategories = selectedLab
    ? allCategories.filter(cat => cat.laboratoire_id === selectedLab)
    : allCategories;

  // Quand on change de labo, reset la catégorie si elle n'appartient pas au nouveau labo
  const handleLabChange = (labId: string) => {
    setSelectedLab(labId);
    if (labId) {
      // Vérifier si la catégorie actuelle appartient au nouveau labo
      const catBelongsToLab = allCategories.find(
        cat => cat.id === selectedCategory && cat.laboratoire_id === labId
      );
      if (!catBelongsToLab) {
        setSelectedCategory(''); // Reset catégorie si incompatible
      }
    }
  };

  // Quand on reset le labo, on garde la catégorie (elle existe toujours)
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLab('');
    setSortBy('date');
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setSelectedImages([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const handleEdit = async (product: any) => {
    setEditingProduct(product);
    setSelectedImages([]);
    // Load existing images if any
    if (product.images && product.images.length > 0) {
      setImagePreviews(product.images.map((img: any) => img.url));
    } else if (product.image_principale_url) {
      setImagePreviews([product.image_principale_url]);
    } else {
      setImagePreviews([]);
    }
    setShowModal(true);
  };

  const handleView = (product: any) => {
    setViewingProduct(product);
    setShowViewModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).filter(file => !selectedImages.includes(file));
      setSelectedImages([...selectedImages, ...newImages]);
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduit(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Erreur lors de la suppression du produit', 'error');
      }
    }
  };

  const handleExport = () => {
    // Implémenter l'export CSV
    console.log('Export products');
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      let imageUrl = editingProduct?.image_principale_url || '';

      // Prepare images for upload (convert to base64)
      const imagesToUpload: { base64: string; filename: string }[] = [];
      if (selectedImages.length > 0) {
        for (let index = 0; index < selectedImages.length; index++) {
          const file = selectedImages[index];
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          imagesToUpload.push({
            base64,
            filename: `${formData.get('name') as string}_${index}`
          });
        }
      }

      const data = {
        categorie_id: formData.get('category') as string,
        nom: formData.get('name') as string,
        nom_en: formData.get('name_en') as string,
        reference: formData.get('reference') as string,
        code_barre: formData.get('barcode') as string,
        description: formData.get('description') as string,
        description_en: formData.get('description_en') as string,
        prix: parseFloat(formData.get('price') as string),
        quantite_stock: parseInt(formData.get('stock') as string),
        seuil_alerte: parseInt(formData.get('min_stock') as string),
        image_principale_url: imageUrl,
      };

      let productId = editingProduct?.id;
      
      if (editingProduct) {
        await updateProduit(editingProduct.id, data);
        // Upload and save images in one action if images were selected
        if (imagesToUpload.length > 0) {
          const result = await uploadAndSaveProductImages(editingProduct.id, imagesToUpload);
          imageUrl = result.urls[0];
        }
      } else {
        const newProduct = await createProduit(data);
        productId = newProduct.id;
        // Upload and save images in one action
        if (imagesToUpload.length > 0) {
          const result = await uploadAndSaveProductImages(newProduct.id, imagesToUpload);
          imageUrl = result.urls[0];
        }
      }

      setShowModal(false);
      setSelectedImages([]);
      setImagePreviews([]);
      await loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Erreur lors de l\'enregistrement du produit', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex">
        {/* Background decoration */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <Sidebar />
        
        <div className="flex-1 lg:ml-64 transition-all duration-300">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <Package className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                    Gestion des produits
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <LanguageSwitcher />
                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un produit
                  </button>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-xl hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:shadow-lg"
                    >
                      Déconnexion
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
            {/* Stats */}
            <div className="grid gap-6 sm:grid-cols-4 mb-8">
              {[
                { label: 'Total produits', value: products.length, Icon: Boxes, gradient: 'from-blue-500 to-cyan-500' },
                { label: 'En stock', value: products.filter(p => (p.quantite_stock || 0) > (p.seuil_alerte || 0)).length, Icon: Package, gradient: 'from-green-500 to-emerald-500' },
                { label: 'Stock faible', value: products.filter(p => (p.quantite_stock || 0) <= (p.seuil_alerte || 0) && (p.quantite_stock || 0) > 0).length, Icon: AlertCircle, gradient: 'from-orange-500 to-amber-500' },
                { label: 'Épuisé', value: products.filter(p => (p.quantite_stock || 0) <= 0).length, Icon: X, gradient: 'from-red-500 to-rose-500' },
              ].map(({ label, value, Icon, gradient }) => (
                <div 
                  key={label}
                  className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity rounded-full -translate-y-1/2 translate-x-1/2`}></div>
                  <div className="relative z-10">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="mb-1">
                      <span className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">{value}</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl p-6 mb-8">
              <div className="flex gap-4 flex-wrap items-center">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                  />
                </div>
                <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 bg-white dark:bg-zinc-800 transition-all ${selectedLab ? 'border-blue-400 dark:border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/30' : 'border-zinc-200 dark:border-zinc-700'}`}>
                  <Folder className={`w-4 h-4 ${selectedLab ? 'text-blue-500' : 'text-zinc-400'}`} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent text-sm focus:outline-none dark:text-white min-w-[140px]"
                    disabled={filteredCategories.length === 0}
                  >
                    <option value="">
                      {selectedLab 
                        ? `Catégories filtrées (${filteredCategories.length})` 
                        : `Toutes catégories (${filteredCategories.length})`}
                    </option>
                    {filteredCategories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                  {selectedLab && (
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full font-medium">
                      Filtré
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 bg-white dark:bg-zinc-800">
                  <Building2 className="w-4 h-4 text-zinc-400" />
                  <select
                    value={selectedLab}
                    onChange={(e) => handleLabChange(e.target.value)}
                    className="bg-transparent text-sm focus:outline-none dark:text-white min-w-[140px]"
                  >
                    <option value="">Tous labos ({allCategories.length} catégories)</option>
                    {laboratories.map((lab: any) => {
                      const catCount = allCategories.filter(c => c.laboratoire_id === lab.id).length;
                      return (
                        <option key={lab.id} value={lab.id}>
                          {lab.nom} ({catCount} catégories)
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 bg-white dark:bg-zinc-800">
                  <ArrowUpDown className="w-4 h-4 text-zinc-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-sm focus:outline-none dark:text-white min-w-[140px]"
                  >
                    <option value="date">Plus récents</option>
                    <option value="name">Nom A-Z</option>
                    <option value="price-asc">Prix ↑</option>
                    <option value="price-desc">Prix ↓</option>
                    <option value="stock-asc">Stock ↑</option>
                    <option value="stock-desc">Stock ↓</option>
                  </select>
                </div>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-3 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
                {(searchTerm || selectedCategory || selectedLab || sortBy !== 'date') && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm px-3 py-2"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Products table */}
            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
                    <tr>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        <div className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Produit</div>
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        <div className="flex items-center gap-2"><Folder className="w-4 h-4" /> Catégorie</div>
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Laboratoire</div>
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Prix</div>
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        <div className="flex items-center gap-2"><Boxes className="w-4 h-4" /> Stock</div>
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        <div className="flex items-center gap-2"><Tag className="w-4 h-4" /> Statut</div>
                      </th>
                      <th className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-zinc-500 dark:text-zinc-400">Chargement...</p>
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <Package className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                          <p className="text-zinc-500 dark:text-zinc-400">Aucun produit trouvé</p>
                        </td>
                      </tr>
                    ) : (
                      products.map((product: any) => (
                        <tr key={product.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {product.image_principale_url ? (
                                <img 
                                  src={product.image_principale_url} 
                                  alt={product.nom}
                                  className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-lg"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30 ${product.image_principale_url ? 'hidden' : ''}`}>
                                {product.nom?.[0] || 'P'}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">{product.nom}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">ID: {product.id?.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {product.categories?.nom || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{product.categories?.laboratoires?.nom || '-'}</td>
                          <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-white">{parseFloat(product.prix || 0).toLocaleString()} FCFA</td>
                          <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{product.quantite_stock}</td>
                          <td className="px-6 py-4">
                            {(() => {
                              const stock = product.quantite_stock || 0;
                              const seuil = product.seuil_alerte || 0;
                              const isAlert = stock <= seuil && stock > 0;
                              const isOut = stock <= 0;
                              
                              if (isOut) {
                                return (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                    Épuisé
                                  </span>
                                );
                              } else if (isAlert) {
                                return (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                                    Stock faible
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                    Disponible
                                  </span>
                                );
                              }
                            })()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleView(product)}
                                className="p-2.5 text-zinc-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all"
                                title="Voir les détails"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-2.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Affichage de {products.length} résultat(s)
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50" disabled>
                  Précédent
                </button>
                <button className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50" disabled>
                  Suivant
                </button>
              </div>
            </div>
          </main>

          {/* Modal Add/Edit */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50">
                <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 py-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Nom du produit</label>
                    <input
                      name="name"
                      type="text"
                      defaultValue={editingProduct?.nom}
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Nom (English)</label>
                    <input
                      name="name_en"
                      type="text"
                      defaultValue={editingProduct?.nom_en}
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Catégorie</label>
                      <select
                        name="category"
                        defaultValue={editingProduct?.categorie_id || editingProduct?.categories?.id}
                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                        required
                      >
                        <option value="">Sélectionner</option>
                        {allCategories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.nom}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Référence</label>
                      <input
                        name="reference"
                        type="text"
                        defaultValue={editingProduct?.reference}
                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Prix (FCFA)</label>
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={editingProduct?.prix}
                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Stock</label>
                      <input
                        name="stock"
                        type="number"
                        defaultValue={editingProduct?.quantite_stock}
                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Seuil alerte</label>
                      <input
                        name="min_stock"
                        type="number"
                        defaultValue={editingProduct?.seuil_alerte}
                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingProduct?.description}
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Photos du produit</label>
                    <div className="space-y-4">
                      {/* Image Previews Grid */}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-left flex items-center gap-2"
                        >
                          <ImageIcon className="w-4 h-4" />
                          {selectedImages.length > 0 
                            ? `${selectedImages.length} image(s) sélectionnée(s)` 
                            : 'Choisir des images...'}
                        </button>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          JPG, PNG, WebP - Max 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Enregistrement...' : (editingProduct ? 'Modifier' : 'Ajouter')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Voir Détails Produit */}
          {showViewModal && viewingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl w-full max-w-2xl shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-5 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between sticky top-0 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 z-10">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    Détails du produit
                  </h2>
                  <button onClick={() => setShowViewModal(false)} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* Product Images */}
                  {viewingProduct.images?.length > 0 ? (
                    <div className="space-y-3">
                      <div className="w-full h-64 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        <img 
                          src={viewingProduct.images[0]?.url || viewingProduct.image_principale_url} 
                          alt={viewingProduct.nom}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {viewingProduct.images.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                          {viewingProduct.images.map((img: any, idx: number) => (
                            <img
                              key={idx}
                              src={img.url}
                              alt={`${viewingProduct.nom} - ${idx + 1}`}
                              className="w-20 h-20 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : viewingProduct.image_principale_url && (
                    <div className="w-full h-64 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                      <img 
                        src={viewingProduct.image_principale_url} 
                        alt={viewingProduct.nom}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Nom du produit</label>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-white">{viewingProduct.nom}</p>
                      {viewingProduct.nom_en && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{viewingProduct.nom_en}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Référence</label>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{viewingProduct.reference || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Code-barres</label>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{viewingProduct.code_barre || '-'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Catégorie</label>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{viewingProduct.categories?.nom || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Laboratoire</label>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{viewingProduct.categories?.laboratoires?.nom || '-'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Prix</label>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{parseFloat(viewingProduct.prix || 0).toLocaleString()} FCFA</p>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Stock</label>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">{viewingProduct.quantite_stock || 0}</p>
                      </div>
                    </div>

                    {viewingProduct.description && (
                      <div>
                        <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Description</label>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{viewingProduct.description}</p>
                      </div>
                    )}

                    {viewingProduct.description_en && (
                      <div>
                        <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Description (EN)</label>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{viewingProduct.description_en}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Seuil d'alerte</label>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{viewingProduct.seuil_alerte || 0}</p>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Statut</label>
                        {(() => {
                          const stock = viewingProduct.quantite_stock || 0;
                          const seuil = viewingProduct.seuil_alerte || 0;
                          if (stock <= 0) {
                            return <span className="text-sm font-semibold text-red-600 dark:text-red-400">Épuisé</span>;
                          } else if (stock <= seuil) {
                            return <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">Stock faible</span>;
                          } else {
                            return <span className="text-sm font-semibold text-green-600 dark:text-green-400">Disponible</span>;
                          }
                        })()}
                      </div>
                    </div>

                    <div className="text-xs text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                      ID: {viewingProduct.id} | Créé le: {new Date(viewingProduct.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowViewModal(false);
                        handleEdit(viewingProduct);
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowViewModal(false)}
                      className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
