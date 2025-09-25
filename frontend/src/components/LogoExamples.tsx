import React from 'react'
import Logo from './Logo'

// Componente de exemplo mostrando diferentes variações da logo
const LogoExamples: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Variações da Logo Lumio</h2>
      
      {/* Tamanhos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Tamanhos</h3>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-center space-y-2">
            <Logo size="sm" variant="primary" />
            <span className="text-xs text-gray-500">Small (sm)</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Logo size="md" variant="primary" />
            <span className="text-xs text-gray-500">Medium (md)</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Logo size="lg" variant="primary" />
            <span className="text-xs text-gray-500">Large (lg)</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Logo size="xl" variant="primary" />
            <span className="text-xs text-gray-500">Extra Large (xl)</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Logo size="2xl" variant="primary" />
            <span className="text-xs text-gray-500">2X Large (2xl)</span>
          </div>
        </div>
      </div>

      {/* Cores */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Variantes de Cor</h3>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-center space-y-2">
            <Logo size="md" variant="primary" />
            <span className="text-xs text-gray-500">Primary</span>
          </div>
          <div className="flex flex-col items-center space-y-2 bg-gray-800 p-4 rounded">
            <Logo size="md" variant="white" />
            <span className="text-xs text-white">White</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Logo size="md" variant="dark" />
            <span className="text-xs text-gray-500">Dark</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Logo size="md" variant="gray" />
            <span className="text-xs text-gray-500">Gray</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Logo size="md" color="#ef4444" />
            <span className="text-xs text-gray-500">Custom (Red)</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Logo size="md" color="#10b981" />
            <span className="text-xs text-gray-500">Custom (Green)</span>
          </div>
        </div>
      </div>

      {/* Estados interativos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Estados Interativos</h3>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-center space-y-2">
            <Logo size="md" variant="primary" animated={true} />
            <span className="text-xs text-gray-500">Com Animação</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Logo size="md" variant="primary" animated={false} />
            <span className="text-xs text-gray-500">Sem Animação</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Logo size="md" variant="primary" className="opacity-50" />
            <span className="text-xs text-gray-500">Desabilitada</span>
          </div>
        </div>
      </div>

      {/* Exemplos de uso em contexto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Exemplos de Uso</h3>
        
        {/* Header exemplo */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Logo size="md" variant="primary" />
            <h1 className="text-xl font-bold text-primary-600">Lumio</h1>
          </div>
          <p className="text-sm text-gray-500 mt-2">Header padrão</p>
        </div>

        {/* Footer exemplo */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Logo size="sm" variant="white" />
            <span className="text-white text-sm">Lumio © 2025</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Footer dark</p>
        </div>

        {/* Botão exemplo */}
        <div className="bg-primary-600 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2">
            <Logo size="sm" variant="white" />
            <span className="text-white font-medium">Entrar</span>
          </div>
          <p className="text-xs text-primary-200 mt-2 text-center">Botão com logo</p>
        </div>
      </div>
    </div>
  )
}

export default LogoExamples
