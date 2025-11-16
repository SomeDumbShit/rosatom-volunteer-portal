'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function AdminArticlesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'FOR_VOLUNTEERS',
    published: true,
    videoUrl: '',
    pdfUrl: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      router.push('/')
    }
  }, [status, session, router])

  const { data: articles, isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const res = await fetch('/api/articles')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    enabled: session?.user.role === 'ADMIN' || session?.user.role === 'MODERATOR',
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Ошибка при создании')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Статья создана')
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      setShowCreateForm(false)
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: 'FOR_VOLUNTEERS',
        published: true,
        videoUrl: '',
        pdfUrl: '',
      })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при создании')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/articles/id/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Статья удалена')
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
    },
    onError: () => {
      toast.error('Ошибка при удалении')
    },
  })

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const res = await fetch(`/api/articles/id/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Статус обновлен')
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
    },
    onError: () => {
      toast.error('Ошибка при обновлении')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  if (status === 'loading' || !session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50">
        <div className="container-custom py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Управление статьями</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-primary flex items-center gap-2"
              >
                <FiPlus /> Создать статью
              </button>
              <Link href="/admin" className="text-primary-600 hover:text-primary-700 flex items-center">
                ← Назад
              </Link>
            </div>
          </div>

          {showCreateForm && (
            <div className="card mb-8">
              <h2 className="text-xl font-bold mb-4">Новая статья</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Заголовок</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Краткое описание</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="input-field"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <label className="label">Категория</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="FOR_VOLUNTEERS">Для волонтеров</option>
                    <option value="FOR_NGO">Для НКО</option>
                    <option value="NEWS">Новости</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    Содержание (минимум 100 символов)
                    <span className="text-sm text-gray-500 ml-2">
                      {formData.content.length}/100
                    </span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input-field"
                    rows={10}
                    required
                    minLength={100}
                  />
                  {formData.content.length > 0 && formData.content.length < 100 && (
                    <p className="text-xs text-red-600 mt-1">
                      Необходимо ещё {100 - formData.content.length} символов
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">Ссылка на видео (Rutube, YouTube, VK Video)</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://rutube.ru/video/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Поддерживаются: Rutube, YouTube, VK Video
                  </p>
                </div>
                <div>
                  <label className="label">Ссылка на PDF документ</label>
                  <input
                    type="url"
                    value={formData.pdfUrl}
                    onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/document.pdf"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Укажите прямую ссылку на PDF файл
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  />
                  <label htmlFor="published">Опубликовать сразу</label>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Создание...' : 'Создать'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn-secondary"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4">Заголовок</th>
                    <th className="text-left py-4 px-4">Категория</th>
                    <th className="text-left py-4 px-4">Дата создания</th>
                    <th className="text-left py-4 px-4">Статус</th>
                    <th className="text-left py-4 px-4">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {articles?.map((article: any) => (
                    <tr key={article.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Link href={`/resources/${article.slug}`} className="font-medium text-primary-600 hover:text-primary-700">
                          {article.title}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        {article.category === 'FOR_VOLUNTEERS'
                          ? 'Для волонтеров'
                          : article.category === 'FOR_NGO'
                          ? 'Для НКО'
                          : 'Новости'}
                      </td>
                      <td className="py-4 px-4">
                        {format(new Date(article.createdAt), 'd MMM yyyy', { locale: ru })}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            article.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {article.published ? 'Опубликовано' : 'Черновик'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              togglePublishMutation.mutate({ id: article.id, published: !article.published })
                            }
                            className="text-primary-600 hover:text-primary-700 text-sm"
                          >
                            {article.published ? 'Снять с публикации' : 'Опубликовать'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Удалить эту статью?')) {
                                deleteMutation.mutate(article.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-700 text-sm ml-4"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
