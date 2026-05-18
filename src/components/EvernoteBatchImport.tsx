import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Link, Upload, CheckCircle, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useComponents } from '../hooks/useComponents';

interface EvernoteBatchImportProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportResult {
  url: string;
  status: 'pending' | 'success' | 'error';
  name?: string;
  error?: string;
  category?: string;
}

const EvernoteBatchImport: React.FC<EvernoteBatchImportProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [noteContent, setNoteContent] = useState('');
  const [extractedUrls, setExtractedUrls] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);

  const { addComponent, scrapProduct } = useComponents();

  const extractUrls = () => {
    if (!noteContent.trim()) {
      toast.error('1️⃣ Por favor, cole o conteúdo da nota');
      return;
    }

    // Regex mais abrangente para capturar URLs
    const urlRegex = /https?:\/\/(?:[-\w.])+(?::\d+)?(?:\/[^\s]*)?/g;
    const urls = noteContent.match(urlRegex) || [];

    // Também procurar por URLs sem protocolo
    const urlWithoutProtocolRegex = /(?:www\.)?[-\w.]+\.(?:com|com\.br|net|org|gov|edu)(?:\/[^\s]*)?/g;
    const urlsWithoutProtocol = noteContent.match(urlWithoutProtocolRegex) || [];
    
    // Adicionar https:// nas URLs sem protocolo
    const normalizedUrlsWithoutProtocol = urlsWithoutProtocol
      .filter(url => !urls.some(fullUrl => fullUrl.includes(url)))
      .map(url => url.startsWith('www.') ? `https://${url}` : `https://www.${url}`);

    const allUrls = [...urls, ...normalizedUrlsWithoutProtocol];

    if (allUrls.length === 0) {
      toast.error('1️⃣ Nenhuma URL encontrada no conteúdo');
      return;
    }

    // Filtrar URLs válidas e remover duplicatas
    const validUrls = allUrls.filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });

    const uniqueUrls = [...new Set(validUrls)];
    setExtractedUrls(uniqueUrls);

    const initialResults: ImportResult[] = uniqueUrls.map(url => ({
      url,
      status: 'pending',
      category: categorizeUrl(url)
    }));

    setImportResults(initialResults);
    setStep(2);
    toast.success(`1️⃣ ${uniqueUrls.length} URLs encontradas`);
  };

  const categorizeUrl = (url: string): string => {
    const urlLower = url.toLowerCase();

    const patterns = {
      cpu: /cpu|processador|ryzen|intel|amd/i,
      gpu: /gpu|placa[-\s]?de[-\s]?v[ií]deo|rtx|gtx|radeon|geforce/i,
      ram: /mem[oó]ria|ram|ddr[345]/i,
      storage: /armazenamento|ssd|hd|hdd|nvme/i,
      motherboard: /placa[-\s]?m[ãa]e|motherboard|b450|b550|x570|z790|x670/i,
      psu: /fonte|psu|power[-\s]?supply|corsair|seasonic/i,
      case: /gabinete|case|tower/i,
      cooler: /cooler|water[-\s]?cooler|ventoinha|fan|refrigera/i,
      monitor: /monitor|display|lcd|led|oled|144hz/i,
      peripherals: /teclado|mouse|headset|fone|perif[ée]rico/i
    } as Record<string, string>;


    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(urlLower)) {
        return category;
      }
    }

    return 'outros';
  };

  const importBatch = async () => {
    if (extractedUrls.length === 0) {
      toast.error('2️⃣ Nenhuma URL para importar');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < extractedUrls.length; i++) {
      const url = extractedUrls[i];

      // Validar URL antes de processar
      try {
        new URL(url);
      } catch {
        setImportResults(prev =>
          prev.map(result =>
            result.url === url
              ? { ...result, status: 'error', error: 'URL inválida' }
              : result
          )
        );
        errorCount++;
        continue;
      }

      setImportResults(prev =>
        prev.map(result =>
          result.url === url ? { ...result, status: 'pending' } : result
        )
      );

      try {
        const scrapedData = await scrapProduct(url);

        if (!scrapedData || !scrapedData.name) {
          throw new Error('Dados insuficientes extraídos');
        }

        const finalCategory = scrapedData.category?.trim().toLowerCase() || categorizeUrl(url);

        const componentData = {
          name: scrapedData.name,
          category: finalCategory,
          price: scrapedData.price || 0,
          url,
          description: scrapedData.description || '',
          image_url: scrapedData.image_url || '',
          priority: 1
        };

        const success = await addComponent(componentData);

        if (success) {
          setImportResults(prev =>
            prev.map(result =>
              result.url === url
                ? {
                    ...result,
                    status: 'success',
                    name: componentData.name,
                    category: finalCategory
                  }
                : result
            )
          );
          successCount++;
        } else {
          throw new Error('Falha ao adicionar componente');
        }
      } catch (error) {
        setImportResults(prev =>
          prev.map(result =>
            result.url === url
              ? {
                  ...result,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Erro desconhecido'
                }
              : result
          )
        );
        errorCount++;
      }

      setImportProgress(((i + 1) / extractedUrls.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 500)); // Aumentar delay para evitar sobrecarga
    }

    setIsImporting(false);
    setStep(3);

    if (successCount > 0) toast.success(`3️⃣ ${successCount} importações concluídas`);
    if (errorCount > 0) toast.error(`3️⃣ ${errorCount} falharam`);
  };

  const reset = () => {
    setStep(1);
    setNoteContent('');
    setExtractedUrls([]);
    setImportProgress(0);
    setIsImporting(false);
    setImportResults([]);
  };

  const handleClose = () => {
    if (isImporting) {
      if (window.confirm('Importação em andamento. Deseja cancelar?')) {
        reset();
        onClose();
      }
    } else {
      reset();
      onClose();
    }
  };

  const getStatusIcon = (status: ImportResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="text-green-400" size={16} />;
      case 'error': return <AlertCircle className="text-red-400" size={16} />;
      default: return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[85vh] min-h-[60vh] overflow-y-auto shadow-2xl mx-4"
          >
            {/* 1️⃣ Colar nota */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 text-base sm:text-lg font-semibold text-white">
                <FileText className="text-blue-400 w-[18px] h-[18px] sm:w-5 sm:h-5" /> 1. Colar nota do Evernote
              </div>
              <textarea
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                rows={4}
                className="w-full p-2 sm:p-3 rounded-lg bg-slate-700 text-xs sm:text-sm text-white"
                placeholder="Cole aqui o conteúdo da nota com as URLs..."
              />
              <button
                onClick={extractUrls}
                className="mt-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-xs sm:text-sm"
              >
                Extrair URLs
              </button>
            </div>

            {/* 2️⃣ Verificação de URLs */}
            {step >= 2 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 text-base sm:text-lg font-semibold text-white">
                  <Link className="text-green-400 w-[18px] h-[18px] sm:w-5 sm:h-5" /> 2. URLs detectadas
                </div>
                <ul className="space-y-2">
                  {importResults.map((result, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-white flex flex-col sm:flex-row sm:items-center justify-between bg-slate-700 px-2 sm:px-3 py-2 rounded-md gap-1 sm:gap-0">
                      <span className="truncate max-w-full sm:max-w-[70%] break-all">{result.url}</span>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(result.status)}
                        <span className="capitalize text-slate-300 text-xs whitespace-nowrap">{result.category}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={importBatch}
                  disabled={isImporting}
                  className="mt-3 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-xs sm:text-sm"
                >
                  {isImporting ? 'Importando...' : 'Iniciar importação'}
                </button>
              </div>
            )}

            {/* 3️⃣ Resultados da importação */}
            {step === 3 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 text-base sm:text-lg font-semibold text-white">
                  <Upload className="text-yellow-400 w-[18px] h-[18px] sm:w-5 sm:h-5" /> 3. Resultados
                </div>
                <ul className="space-y-2">
                  {importResults.map((result, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-white flex flex-col bg-slate-700 px-2 sm:px-3 py-2 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="truncate break-all">{result.name || result.url}</span>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(result.status)}
                          {result.category && <span className="capitalize text-slate-300 text-xs whitespace-nowrap">{result.category}</span>}
                        </span>
                      </div>
                      {result.error && <span className="text-red-400 text-xs mt-1">{result.error}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleClose}
              className="mt-2 px-3 sm:px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white text-xs sm:text-sm w-full"
            >
              {step === 3 ? 'Concluir' : 'Cancelar'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EvernoteBatchImport;
