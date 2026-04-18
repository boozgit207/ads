'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import { showToast } from '../../components/Toast';
import {
  createLaboratoireSimple,
  updateLaboratoireSimple,
  deleteLaboratoireSimple,
  createCategorieSimple,
  updateCategorieSimple,
  deleteCategorieSimple,
  listLaboratoires,
  listCategories,
} from '../actions/catalogue-simple';
import { Plus, Edit, Trash2, X, Building2, Folder, ArrowUpDown, Sparkles } from 'lucide-react';

export default function CataloguePage() {
  const [activeTab, setActiveTab] = useState<'laboratoires' | 'categories'>('laboratoires');
  const [laboratoires, setLaboratoires] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'name' | 'name-desc' | 'date'>('name');

  useEffect(() => {
    loadData();
  }, [activeTab, sortBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'laboratoires') {
        const data = await listLaboratoires();
        let sorted = [...data];
        switch (sortBy) {
          case 'name':
            sorted = sorted.sort((a, b) => a.nom.localeCompare(b.nom));
            break;
          case 'name-desc':
            sorted = sorted.sort((a, b) => b.nom.localeCompare(a.nom));
            break;
          case 'date':
            sorted = sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            break;
        }
        setLaboratoires(sorted);
      } else {
        const [labs, cats] = await Promise.all([listLaboratoires(), listCategories()]);
        setLaboratoires(labs);
        let sortedCats = [...cats];
        switch (sortBy) {
          case 'name':
            sortedCats = sortedCats.sort((a, b) => a.nom.localeCompare(b.nom));
            break;
          case 'name-desc':
            sortedCats = sortedCats.sort((a, b) => b.nom.localeCompare(a.nom));
            break;
          case 'date':
            sortedCats = sortedCats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            break;
        }
        setCategories(sortedCats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ?')) return;
    try {
      if (activeTab === 'laboratoires') {
        await deleteLaboratoireSimple(id);
      } else {
        await deleteCategorieSimple(id);
      }
      await loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleSaveLaboratoire = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      nom: fd.get('nom') as string,
      nom_en: fd.get('nom_en') as string,
      description: fd.get('description') as string,
      is_active: fd.get('is_active') === 'on',
    };

    try {
      if (editingItem) {
        await updateLaboratoireSimple(editingItem.id, data);
      } else {
        await createLaboratoireSimple(data);
      }
      setShowModal(false);
      await loadData();
      showToast(editingItem ? 'Laboratoire modifié' : 'Laboratoire ajouté', 'success');
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleSaveCategorie = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      laboratoire_id: fd.get('laboratoire_id') as string,
      nom: fd.get('nom') as string,
      nom_en: fd.get('nom_en') as string,
      description: fd.get('description') as string,
      is_active: fd.get('is_active') === 'on',
    };

    try {
      if (editingItem) {
        await updateCategorieSimple(editingItem.id, data);
      } else {
        await createCategorieSimple(data);
      }
      setShowModal(false);
      await loadData();
      showToast(editingItem ? 'Catégorie modifiée' : 'Catégorie ajoutée', 'success');
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Erreur lors de l\'enregistrement', 'error');
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                    <Folder className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                    Gestion du catalogue
                  </h1>
                </div>
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
            {/* Stats */}
            <div className="grid gap-6 sm:grid-cols-2 mb-8">
              {[
                { label: 'Laboratoires', value: laboratoires.length, Icon: Building2, gradient: 'from-blue-500 to-cyan-500' },
                { label: 'Catégories', value: categories.length, Icon: Folder, gradient: 'from-purple-500 to-pink-500' },
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

            {/* Tabs and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-1.5 flex gap-1.5 flex-1 shadow-lg">
                <button
                  onClick={() => setActiveTab('laboratoires')}
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'laboratoires'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Laboratoires
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'categories'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  Catégories
                </button>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl px-4 shadow-lg">
                <ArrowUpDown className="w-4 h-4 text-zinc-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border-none bg-transparent px-2 py-2 text-sm focus:outline-none dark:text-white transition-all"
                >
                  <option value="name">Nom A-Z</option>
                  <option value="name-desc">Nom Z-A</option>
                  <option value="date">Plus récents</option>
                </select>
              </div>
            </div>

            {/* Content */}
            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl overflow-hidden">
              {loading ? (
                <div className="p-16 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-zinc-500 dark:text-zinc-400">Chargement...</p>
                </div>
              ) : activeTab === 'laboratoires' ? (
                <div className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                  {laboratoires.length === 0 ? (
                    <div className="p-16 text-center">
                      <Building2 className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                      <p className="text-zinc-500 dark:text-zinc-400">Aucun laboratoire. Cliquez sur "Ajouter" pour créer un laboratoire.</p>
                    </div>
                  ) : (
                    laboratoires.map((lab) => (
                      <div key={lab.id} className="p-6 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <div className="flex items-center gap-4">
                          {lab.image_url ? (
                            <img src={lab.image_url} alt={lab.nom} className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                              <Building2 className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">{lab.nom}</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{lab.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(lab)}
                            className="p-2.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(lab.id)}
                            className="p-2.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                  {categories.length === 0 ? (
                    <div className="p-16 text-center">
                      <Folder className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                      <p className="text-zinc-500 dark:text-zinc-400">Aucune catégorie. Cliquez sur "Ajouter" pour créer une catégorie.</p>
                    </div>
                  ) : (
                    categories.map((cat) => {
                      const lab = laboratoires.find((l) => l.id === cat.laboratoire_id);
                      return (
                        <div key={cat.id} className="p-6 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <div className="flex items-center gap-4">
                            {cat.image_url ? (
                              <img src={cat.image_url} alt={cat.nom} className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                                <Folder className="w-6 h-6" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                <Building2 className="w-3 h-3" />
                                {lab?.nom || 'Sans laboratoire'}
                              </div>
                              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">{cat.nom}</h3>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">{cat.slug}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(cat)}
                              className="p-2.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="p-2.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </main>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50">
                <div className="px-6 py-5 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    {editingItem ? 'Modifier' : 'Ajouter'} {activeTab === 'laboratoires' ? 'un laboratoire' : 'une catégorie'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form
                  onSubmit={activeTab === 'laboratoires' ? handleSaveLaboratoire : handleSaveCategorie}
                  className="p-6 space-y-5"
                >
                  {activeTab === 'categories' && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Laboratoire</label>
                      <select
                        name="laboratoire_id"
                        defaultValue={editingItem?.laboratoire_id}
                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm dark:bg-zinc-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                        required
                      >
                        <option value="">Sélectionner un laboratoire</option>
                        {laboratoires.map((lab) => (
                          <option key={lab.id} value={lab.id}>
                            {lab.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Nom</label>
                    <input
                      name="nom"
                      type="text"
                      defaultValue={editingItem?.nom}
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm dark:bg-zinc-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Nom (English)</label>
                    <input
                      name="nom_en"
                      type="text"
                      defaultValue={editingItem?.nom_en}
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm dark:bg-zinc-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingItem?.description}
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm dark:bg-zinc-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      name="is_active"
                      type="checkbox"
                      defaultChecked={editingItem?.is_active ?? true}
                      className="w-5 h-5 rounded border-zinc-300"
                    />
                    <label className="text-sm text-zinc-700 dark:text-zinc-300">Actif</label>
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
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                    >
                      {editingItem ? 'Modifier' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
