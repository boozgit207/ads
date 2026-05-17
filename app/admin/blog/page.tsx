'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { showToast } from '../../components/Toast';
import {
  listBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../actions/blog';
import { Plus, Search, Edit, Trash2, X, FileText, Eye, EyeOff } from 'lucide-react';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    titre: '',
    titre_en: '',
    slug: '',
    extrait: '',
    extrait_en: '',
    contenu: '',
    contenu_en: '',
    image_url: '',
    auteur: 'ADS',
    is_published: false,
    meta_title: '',
    meta_description: '',
  });

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await listBlogPosts();
      setPosts(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      if (msg.includes('blog_posts') || msg.includes('42P01')) {
        showToast('Exécutez sql/blog_posts.sql dans Supabase', 'error');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      titre: '',
      titre_en: '',
      slug: '',
      extrait: '',
      extrait_en: '',
      contenu: '',
      contenu_en: '',
      image_url: '',
      auteur: 'ADS',
      is_published: false,
      meta_title: '',
      meta_description: '',
    });
    setShowModal(true);
  };

  const openEdit = (post: any) => {
    setEditing(post);
    setForm({
      titre: post.titre || '',
      titre_en: post.titre_en || '',
      slug: post.slug || '',
      extrait: post.extrait || '',
      extrait_en: post.extrait_en || '',
      contenu: post.contenu || '',
      contenu_en: post.contenu_en || '',
      image_url: post.image_url || '',
      auteur: post.auteur || 'ADS',
      is_published: post.is_published ?? false,
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.titre.trim() || !form.contenu.trim()) {
      showToast('Titre et contenu requis', 'error');
      return;
    }
    try {
      if (editing) {
        await updateBlogPost(editing.id, form);
        showToast('Article mis à jour', 'success');
      } else {
        await createBlogPost(form);
        showToast('Article créé', 'success');
      }
      setShowModal(false);
      loadPosts();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erreur', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await deleteBlogPost(id);
      showToast('Article supprimé', 'success');
      loadPosts();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erreur', 'error');
    }
  };

  const filtered = posts.filter(
    (p) =>
      p.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Sidebar />
        <main className="lg:ml-64 p-6 pt-20 lg:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-7 h-7 text-blue-600" />
                Blog
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                Gérez les articles publiés sur /blog
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Nouvel article
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            />
          </div>

          {loading ? (
            <p className="text-zinc-500">Chargement...</p>
          ) : filtered.length === 0 ? (
            <p className="text-zinc-500">Aucun article.</p>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Titre</th>
                    <th className="text-left p-4 font-semibold hidden md:table-cell">Slug</th>
                    <th className="text-left p-4 font-semibold">Statut</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((post) => (
                    <tr key={post.id} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="p-4 font-medium text-zinc-900 dark:text-white">{post.titre}</td>
                      <td className="p-4 text-zinc-500 hidden md:table-cell">{post.slug}</td>
                      <td className="p-4">
                        {post.is_published ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold">
                            <Eye className="w-3.5 h-3.5" /> Publié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-400 text-xs font-bold">
                            <EyeOff className="w-3.5 h-3.5" /> Brouillon
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {post.is_published && (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-blue-600"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}
                          <button onClick={() => openEdit(post)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{editing ? 'Modifier' : 'Nouvel article'}</h2>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    placeholder="Titre *"
                    value={form.titre}
                    onChange={(e) => setForm({ ...form, titre: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
                  />
                  <input
                    placeholder="Titre (English)"
                    value={form.titre_en}
                    onChange={(e) => setForm({ ...form, titre_en: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
                  />
                  <input
                    placeholder="Slug (optionnel)"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
                  />
                  <textarea
                    placeholder="Extrait"
                    value={form.extrait}
                    onChange={(e) => setForm({ ...form, extrait: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
                  />
                  <textarea
                    placeholder="Extrait (English)"
                    value={form.extrait_en}
                    onChange={(e) => setForm({ ...form, extrait_en: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
                  />
                  <textarea
                    placeholder="Contenu (HTML autorisé) *"
                    value={form.contenu}
                    onChange={(e) => setForm({ ...form, contenu: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 font-mono text-sm"
                  />
                  <textarea
                    placeholder="Contenu (English - HTML autorisé)"
                    value={form.contenu_en}
                    onChange={(e) => setForm({ ...form, contenu_en: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 font-mono text-sm"
                  />
                  <input
                    placeholder="URL image"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    />
                    Publier l&apos;article
                  </label>
                  <div className="flex gap-3 pt-4">
                    <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">
                      Enregistrer
                    </button>
                    <button onClick={() => setShowModal(false)} className="px-6 py-3 border rounded-xl">
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}