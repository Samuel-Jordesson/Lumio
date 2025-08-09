/**
 * Processa URLs de imagem para compatibilidade com diferentes formatos
 * - Base64: data:image/jpeg;base64,XXX (formato novo - Render)
 * - URL relativa: /uploads/filename.jpg (formato antigo - precisa do backend)
 * - URL absoluta: https://... (já processada)
 */
export const getImageUrl = (imagePath: string, backendUrl?: string): string => {
  if (!imagePath) return '/default-image.png'
  
  // Se já é uma data URL (Base64), retorna como está
  if (imagePath.startsWith('data:')) {
    return imagePath
  }
  
  // Se é uma URL absoluta, retorna como está
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // Se é um caminho relativo (formato antigo), constrói a URL completa
  if (imagePath.startsWith('/uploads/')) {
    const baseUrl = backendUrl || import.meta.env.VITE_API_URL || 'http://localhost:5000'
    return `${baseUrl}${imagePath}`
  }
  
  // Fallback para outros casos
  return imagePath
}

/**
 * Processa um array de URLs de imagem
 */
export const getImageUrls = (images: string[], backendUrl?: string): string[] => {
  return images.map(image => getImageUrl(image, backendUrl))
}

/**
 * Verifica se uma imagem é Base64
 */
export const isBase64Image = (imagePath: string): boolean => {
  return imagePath.startsWith('data:image/')
}
