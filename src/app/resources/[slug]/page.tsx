'use client'

import { useQuery } from '@tanstack/react-query'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import VideoPlayer from '@/components/VideoPlayer'
import Image from 'next/image'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { data: article, isLoading } = useQuery({
    queryKey: ['article', params.slug],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${params.slug}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Статья не найдена</h1>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50 py-12">
        <article className="container-custom max-w-4xl">
          {/* Video Player for knowledge base items */}
          {article.videoUrl ? (
            <div className="mb-8">
              <VideoPlayer videoUrl={article.videoUrl} title={article.title} />
            </div>
          ) : article.coverImage ? (
            <div className="aspect-video relative bg-gray-100 rounded-xl overflow-hidden mb-8">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="card">
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
                {article.category === 'ngo' ? 'Для НКО' : article.category === 'volunteers' ? 'Для Волонтеров' : article.category}
              </span>
              <span className="text-gray-500 text-sm">
                {format(new Date(article.createdAt), 'd MMMM yyyy', { locale: ru })}
              </span>
              {article.speaker && (
                <span className="text-gray-700 text-sm">
                  <strong>Спикер:</strong> {article.speaker}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-6">{article.title}</h1>

            {article.excerpt && (
              <p className="text-xl text-gray-600 mb-8">{article.excerpt}</p>
            )}

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Display tags */}
            {article.tags && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Теги:</h3>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(article.tags).map((tag: string) => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
