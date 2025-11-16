'use client'

import { FaExternalLinkAlt, FaPlay } from 'react-icons/fa'
import Link from 'next/link'

interface VideoPlayerProps {
  videoUrl: string
  title: string
}

export default function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  // Normalize URL for checking
  const normalizedUrl = videoUrl.toLowerCase().trim()

  // IMPORTANT: Check Rutube FIRST before anything else
  // This prevents Rutube links from being misidentified as VK links
  const isRutube = normalizedUrl.includes('rutube.ru') || normalizedUrl.includes('rutube')
  const isPrivateRutube = normalizedUrl.includes('rutube.ru/video/private') || normalizedUrl.includes('rutube/video/private')

  // Check if it's YouTube (only if NOT Rutube)
  const isYouTube = !isRutube && (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be'))

  // Check if it's VK Video (only if NOT Rutube and NOT YouTube)
  const isVKVideo = !isRutube && !isYouTube && (normalizedUrl.includes('vkvideo.ru') || normalizedUrl.includes('vk.com/video'))

  // Handle Rutube videos FIRST (before VK check)
  if (isRutube) {
    // Private Rutube videos
    if (isPrivateRutube) {
    // Extract video ID and access token from URL
    // Format: https://rutube.ru/video/private/{id}/?p={token}
    const match = videoUrl.match(/rutube\.ru\/video\/private\/([a-f0-9]+)\/\?p=([^&]+)/)

    if (match) {
      const [, videoId, accessToken] = match
      // Try embedding with play/embed endpoint and access token
      const embedUrl = `https://rutube.ru/play/embed/${videoId}/?p=${accessToken}`

      return (
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full"
            frameBorder="0"
            allow="clipboard-write; autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      )
    }

      // Fallback: show link if URL format is unexpected
      return (
        <div className="relative w-full aspect-video bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg overflow-hidden flex flex-col items-center justify-center text-white p-8">
          <FaPlay className="text-6xl mb-4 opacity-80" />
          <h3 className="text-2xl font-bold mb-4 text-center">{title}</h3>
          <p className="text-center mb-6 text-primary-100 max-w-md">
            Это видео размещено на Rutube с ограниченным доступом.
            Нажмите кнопку ниже, чтобы открыть видео в новой вкладке.
          </p>
          <Link
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            <FaExternalLinkAlt />
            Смотреть на Rutube
          </Link>
        </div>
      )
    }

    // Public Rutube videos
    const regularMatch = videoUrl.match(/rutube\.ru\/video\/([a-f0-9]+)/)
    if (regularMatch) {
      const embedUrl = `https://rutube.ru/play/embed/${regularMatch[1]}/`
      return (
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full"
            frameBorder="0"
            allow="clipboard-write; autoplay"
            allowFullScreen
          />
        </div>
      )
    }

    // Fallback for any Rutube URL
    return (
      <div className="relative w-full aspect-video bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg overflow-hidden flex flex-col items-center justify-center text-white p-8">
        <FaPlay className="text-6xl mb-4 opacity-80" />
        <h3 className="text-2xl font-bold mb-4 text-center">{title}</h3>
        <Link
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
        >
          <FaExternalLinkAlt />
          Смотреть на Rutube
        </Link>
      </div>
    )
  }

  // For YouTube videos
  if (isYouTube) {
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    if (youtubeMatch) {
      const embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`
      return (
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
  }

  // For VK Video
  if (isVKVideo) {
    // Format: https://vkvideo.ru/video-172285001_456239301
    // or https://vk.com/video-172285001_456239301
    const vkMatch = videoUrl.match(/video(-?\d+)_(\d+)/)
    if (vkMatch) {
      const [, ownerId, videoId] = vkMatch
      // VK Video embed format - try multiple formats
      const embedUrl = `https://vk.com/video_ext.php?oid=${ownerId}&id=${videoId}&hd=2`
      return (
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
            allowFullScreen
          />
        </div>
      )
    }
  }

  // Fallback: show link
  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg overflow-hidden flex flex-col items-center justify-center text-white p-8">
      <FaPlay className="text-6xl mb-4 opacity-80" />
      <h3 className="text-2xl font-bold mb-4 text-center">{title}</h3>
      <Link
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-white text-gray-800 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
      >
        <FaExternalLinkAlt />
        Открыть видео
      </Link>
    </div>
  )
}
