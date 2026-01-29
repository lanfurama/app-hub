import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button } from '../components/UI';
import { Settings, FolderTree, Save, Plus, Pencil, Trash2, X, Sliders } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

type SettingsTab = 'general' | 'categories';

function SettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch,
  } = useCategories();

  const [workspaceName, setWorkspaceName] = useState('Furama Lab');
  const [workspaceDesc, setWorkspaceDesc] = useState('Digital Business Workspace');

  // Thêm danh mục
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Sửa danh mục
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Xóa (confirm)
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!newName.trim()) {
      setAddError('Vui lòng nhập tên danh mục.');
      return;
    }
    setAddLoading(true);
    try {
      await addCategory({
        name: newName.trim(),
        slug: newSlug.trim() || undefined,
      });
      setNewName('');
      setNewSlug('');
      setShowAddForm(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Không thể thêm danh mục.');
    } finally {
      setAddLoading(false);
    }
  };

  const startEdit = (id: number) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) {
      setEditingId(id);
      setEditName(cat.name);
      setEditSlug(cat.slug);
      setEditError('');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId == null) return;
    setEditError('');
    if (!editName.trim()) {
      setEditError('Vui lòng nhập tên danh mục.');
      return;
    }
    setEditLoading(true);
    try {
      await updateCategory(editingId, {
        name: editName.trim(),
        slug: editSlug.trim() || undefined,
      });
      setEditingId(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Không thể cập nhật danh mục.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async (id: number) => {
    setDeleteError('');
    try {
      await deleteCategory(id);
      setDeletingId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Không thể xóa danh mục.');
    }
  };

  const slugFromName = (name: string) =>
    name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'general', label: 'Cài đặt chung', icon: Sliders },
    { id: 'categories', label: 'Quản lý danh mục', icon: FolderTree },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-700 flex-shrink-0" />
          Cài đặt
        </h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý cài đặt hệ thống</p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1 -mb-px" aria-label="Cài đặt">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab: Cài đặt chung */}
      {activeTab === 'general' && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt chung</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên workspace</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <textarea
                rows={3}
                value={workspaceDesc}
                onChange={(e) => setWorkspaceDesc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="pt-4">
              <button className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Quản lý danh mục */}
      {activeTab === 'categories' && (
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-emerald-700" />
              Quản lý danh mục
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Thêm, sửa hoặc xóa danh mục ứng dụng. Slug dùng trong URL (vd: /category/digital-tools).
            </p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setShowAddForm(true);
              setNewName('');
              setNewSlug('');
              setAddError('');
            }}
            className="flex-shrink-0"
          >
            Thêm danh mục
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            {error}
            <button
              type="button"
              onClick={() => refetch()}
              className="ml-2 underline font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Đang tải danh mục...</div>
        ) : (
          <div className="space-y-4">
            {/* Form thêm mới */}
            {showAddForm && (
              <form
                onSubmit={handleAddSubmit}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
              >
                <h3 className="font-medium text-gray-900">Thêm danh mục mới</h3>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Tên hiển thị *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      if (!newSlug) setNewSlug(slugFromName(e.target.value));
                    }}
                    placeholder="VD: Marketing"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Slug (tùy chọn)</label>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="VD: marketing (tự điền từ tên)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-sm"
                  />
                </div>
                {addError && (
                  <p className="text-sm text-red-600">{addError}</p>
                )}
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" icon={Save} disabled={addLoading}>
                    {addLoading ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setAddError('');
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            )}

            {/* Danh sách danh mục */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-700">Tên</th>
                    <th className="px-4 py-3 font-medium text-gray-700 font-mono">Slug</th>
                    <th className="px-4 py-3 font-medium text-gray-700 w-28">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      {editingId === cat.id ? (
                        <>
                          <td className="px-4 py-2" colSpan={2}>
                            <form onSubmit={handleEditSubmit} className="flex flex-wrap gap-2 items-end">
                              <div className="flex-1 min-w-[120px]">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                  placeholder="Tên"
                                />
                              </div>
                              <div className="flex-1 min-w-[100px]">
                                <input
                                  type="text"
                                  value={editSlug}
                                  onChange={(e) => setEditSlug(e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-mono"
                                  placeholder="Slug"
                                />
                              </div>
                              <div className="flex gap-1">
                                <button
                                  type="submit"
                                  className="px-2 py-1.5 bg-emerald-700 text-white rounded text-sm hover:bg-emerald-800"
                                  disabled={editLoading}
                                >
                                  {editLoading ? '...' : 'Lưu'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="p-1.5 text-gray-500 hover:text-gray-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </form>
                            {editError && (
                              <p className="text-xs text-red-600 mt-1">{editError}</p>
                            )}
                          </td>
                          <td />
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                          <td className="px-4 py-3 font-mono text-gray-600">{cat.slug}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => startEdit(cat.id)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg hover:text-emerald-700"
                                title="Sửa"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(cat.id)}
                                className="p-2 text-gray-500 hover:bg-red-50 rounded-lg hover:text-red-600"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal xác nhận xóa */}
            {deletingId != null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Xóa danh mục?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Chỉ xóa được khi không còn ứng dụng nào thuộc danh mục này. Nếu vẫn còn app, hệ thống sẽ báo lỗi.
                  </p>
                  {deleteError && (
                    <p className="text-sm text-red-600 mb-4">{deleteError}</p>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => { setDeletingId(null); setDeleteError(''); }}>
                      Hủy
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleDeleteConfirm(deletingId)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
      )}
    </div>
  );
}

export const SystemPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();

  if (pageId === 'settings') {
    return <SettingsContent />;
  }

  return (
    <div className="p-4 sm:p-6">
      <Card className="p-4 sm:p-6 text-center">
        <p className="text-gray-500">Trang không tồn tại</p>
      </Card>
    </div>
  );
};
