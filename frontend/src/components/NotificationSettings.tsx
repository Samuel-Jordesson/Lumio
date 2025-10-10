import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, BellOff, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const {
    isSupported,
    permission,
    requestPermission,
    testNotification,
    subscribeToPush
  } = useNotifications();

  const [isLoading, setIsLoading] = useState(false);

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        toast.success('Notificações ativadas com sucesso!');
        await subscribeToPush();
      } else {
        toast.error('Permissão para notificações negada');
      }
    } catch (error) {
      toast.error('Erro ao ativar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = () => {
    testNotification();
    toast.success('Notificação de teste enviada!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSupported ? (
          <div className="text-center py-4">
            <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">
              Seu navegador não suporta notificações
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status da permissão */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Status:</span>
              <div className="flex items-center gap-2">
                {permission.granted ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Ativado</span>
                  </>
                ) : permission.denied ? (
                  <>
                    <X className="w-4 h-4 text-red-500" />
                    <span className="text-red-600">Negado</span>
                  </>
                ) : (
                  <span className="text-yellow-600">Não solicitado</span>
                )}
              </div>
            </div>

            {/* Botões de ação */}
            <div className="space-y-2">
              {!permission.granted && (
                <button
                  onClick={handleRequestPermission}
                  disabled={isLoading}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                  {isLoading ? 'Ativando...' : 'Ativar Notificações'}
                </button>
              )}

              {permission.granted && (
                <button
                  onClick={handleTestNotification}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Testar Notificação
                </button>
              )}
            </div>

            {/* Informações */}
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Notificações de mensagens:</strong> Receba alertas quando alguém enviar uma mensagem
              </p>
              <p>
                <strong>Mobile:</strong> Funciona mesmo sem instalar o app
              </p>
              <p>
                <strong>Desktop:</strong> Notificações na barra de tarefas
              </p>
            </div>

            {permission.denied && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Permissão negada:</strong> Para ativar notificações, 
                  acesse as configurações do seu navegador e permita notificações para este site.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
