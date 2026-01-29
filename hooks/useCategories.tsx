import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { categoriesApi } from '../services/apiService';
import type { Category } from '../types';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Digital Tools', slug: 'digital-tools', sortOrder: 0, createdAt: 0 },
  { id: 2, name: 'Khác', slug: 'other', sortOrder: 1, createdAt: 0 },
];

interface CategoriesContextValue {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  getLabel: (slug: string) => string;
  refetch: () => Promise<void>;
  addCategory: (data: { name: string; slug?: string }) => Promise<Category>;
  updateCategory: (id: number, data: { name?: string; slug?: string; sortOrder?: number }) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await categoriesApi.getAll();
      setCategories(list.length > 0 ? list : DEFAULT_CATEGORIES);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load categories');
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const getLabel = useCallback(
    (slug: string) => {
      const c = categories.find((cat) => cat.slug === slug);
      return c ? c.name : slug;
    },
    [categories]
  );

  const addCategory = useCallback(
    async (data: { name: string; slug?: string }) => {
      const created = await categoriesApi.create(data);
      setCategories((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      return created;
    },
    []
  );

  const updateCategory = useCallback(
    async (id: number, data: { name?: string; slug?: string; sortOrder?: number }) => {
      const updated = await categoriesApi.update(id, data);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? updated : c)).sort((a, b) => a.sortOrder - b.sortOrder)
      );
      return updated;
    },
    []
  );

  const deleteCategory = useCallback(async (id: number) => {
    await categoriesApi.delete(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      categories,
      isLoading,
      error,
      getLabel,
      refetch,
      addCategory,
      updateCategory,
      deleteCategory,
    }),
    [categories, isLoading, error, getLabel, refetch, addCategory, updateCategory, deleteCategory]
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories(): CategoriesContextValue {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    return {
      categories: DEFAULT_CATEGORIES,
      isLoading: false,
      error: null,
      getLabel: (slug: string) => DEFAULT_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug,
      refetch: async () => {},
      addCategory: async () => ({ id: 0, name: '', slug: '', sortOrder: 0, createdAt: 0 }),
      updateCategory: async () => ({ id: 0, name: '', slug: '', sortOrder: 0, createdAt: 0 }),
      deleteCategory: async () => {},
    };
  }
  return ctx;
}
