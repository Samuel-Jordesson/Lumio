import { useState } from 'react'
import { X } from 'lucide-react'

interface PostImageGalleryProps {
  images: string[]
}

const PostImageGallery: React.FC<PostImageGalleryProps> = ({ images }) => {
  const [showAll, setShowAll] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  if (!images || images.length === 0) return null

  // Definir quantas imagens mostrar
  const maxVisible = 3
  const visibleImages = showAll ? images : images.slice(0, maxVisible)
  const remainingCount = images.length - maxVisible

  const getGridClass = (count: number) => {
    // Sempre usar grid de 2 colunas para manter tamanho consistente
    return 'grid-cols-2'
  }

  const getImageClass = (index: number, totalVisible: number) => {
    // Se é uma imagem única, usa apenas 1 coluna (metade da largura)
    if (totalVisible === 1) {
      return 'col-span-1 aspect-square'
    }
    // Primeira imagem ocupa mais espaço apenas quando há 3+ imagens
    if (totalVisible >= 3 && index === 0) {
      return 'col-span-2 row-span-2 aspect-square'
    }
    return 'aspect-square'
  }

  const handleImageClick = (image: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedImage(image)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  return (
    <>
      <div className="mt-3">
        <div className={`grid gap-2 ${getGridClass(visibleImages.length)}`}>
          {visibleImages.map((image, index) => (
            <div 
              key={index} 
              className={`relative overflow-hidden rounded-lg ${getImageClass(index, visibleImages.length)}`}
            >
              <img
                src={image}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                onClick={(e) => handleImageClick(image, e)}
              />
              
              {/* Overlay para indicar mais fotos (apenas na última imagem visível) */}
              {!showAll && 
               remainingCount > 0 && 
               index === maxVisible - 1 && (
                <div 
                  className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center cursor-pointer hover:bg-opacity-70 transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAll(true)
                  }}
                >
                  <span className="text-white text-xl font-semibold">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Botão para mostrar menos fotos */}
        {showAll && images.length > maxVisible && (
          <button 
            onClick={() => setShowAll(false)}
            className="mt-2 text-primary-600 text-sm hover:text-primary-700 transition-colors"
          >
            Mostrar menos
          </button>
        )}
      </div>

      {/* Modal de visualização de imagem */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-screen p-4">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Imagem expandida"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default PostImageGallery
