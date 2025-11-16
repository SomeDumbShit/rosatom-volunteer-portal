'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'ADMIN')) {
      router.push('/')
    }
  }, [status, session, router])

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    enabled: session?.user.role === 'ADMIN',
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Пользователь удален')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => {
      toast.error('Ошибка при удалении')
    },
  })

  if (status === 'loading' || !session || session.user.role !== 'ADMIN') {
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
            <h1 className="text-3xl font-bold">Управление пользователями</h1>
            <Link href="/admin" className="text-primary-600 hover:text-primary-700">
              ← К панели администратора
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4">Email</th>
                    <th className="text-left py-4 px-4">Имя</th>
                    <th className="text-left py-4 px-4">Роль</th>
                    <th className="text-left py-4 px-4">Город</th>
                    <th className="text-left py-4 px-4">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user: any) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">{user.email}</td>
                      <td className="py-4 px-4">{user.name || '-'}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'MODERATOR'
                              ? 'bg-blue-100 text-blue-800'
                              : user.role === 'NGO'
                              ? 'bg-primary-100 text-primary-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.role === 'ADMIN'
                            ? 'Администратор'
                            : user.role === 'MODERATOR'
                            ? 'Модератор'
                            : user.role === 'NGO'
                            ? 'НКО'
                            : 'Волонтер'}
                        </span>
                      </td>
                      <td className="py-4 px-4">{user.city || '-'}</td>
                      <td className="py-4 px-4">
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => {
                              if (confirm(`Удалить пользователя ${user.email}?`)) {
                                deleteUserMutation.mutate(user.id)
                              }
                            }}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Удалить
                          </button>
                        )}
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
