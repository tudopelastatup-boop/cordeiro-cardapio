import React, { useRef, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../contexts/AuthContext';

type TemplateId = 'minimal' | 'branded' | 'dark' | 'elegant';

interface Template {
  id: TemplateId;
  name: string;
  description: string;
  icon: string;
}

const TEMPLATES: Template[] = [
  { id: 'minimal', name: 'Minimalista', description: 'Limpo com fundo branco', icon: 'crop_square' },
  { id: 'branded', name: 'Com Logo', description: 'Logo + QR + informações', icon: 'branding_watermark' },
  { id: 'dark', name: 'Escuro', description: 'Fundo escuro premium', icon: 'dark_mode' },
  { id: 'elegant', name: 'Elegante', description: 'Borda dourada e detalhes', icon: 'auto_awesome' },
];

export const QRCodePage: React.FC = () => {
  const { business } = useAuth();
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('branded');
  const [isDownloading, setIsDownloading] = useState(false);

  const storeUrl = `${window.location.origin}/${business?.slug || ''}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = storeUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getQrSvgDataUrl = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const container = qrContainerRef.current;
      if (!container) return reject('No QR container');
      const svg = container.querySelector('svg');
      if (!svg) return reject('No SVG');
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => { resolve(url); };
      img.onerror = reject;
      img.src = url;
    });
  }, []);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.closePath();
  };

  const drawCircularImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, cx: number, cy: number, radius: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.restore();
  };

  const renderMinimal = async (ctx: CanvasRenderingContext2D, qrImg: HTMLImageElement) => {
    const size = 1080;
    const qrSize = 680;
    const padding = (size - qrSize) / 2;

    ctx.canvas.width = size;
    ctx.canvas.height = size + 160;

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // QR code
    ctx.drawImage(qrImg, padding, padding, qrSize, qrSize);

    // Business name
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(business?.name || 'Minha Vitrine', size / 2, size + 50);

    // URL
    ctx.fillStyle = '#888888';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(storeUrl, size / 2, size + 90);

    // Thin line
    ctx.strokeStyle = '#EEEEEE';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, size + 110);
    ctx.lineTo(size - padding, size + 110);
    ctx.stroke();

    // Powered by
    ctx.fillStyle = '#BBBBBB';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('witrin.com', size / 2, size + 140);
  };

  const renderBranded = async (ctx: CanvasRenderingContext2D, qrImg: HTMLImageElement) => {
    const width = 1080;
    const height = 1400;
    const qrSize = 680;

    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // Dark background
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, width, height);

    // White card
    const cardX = 60;
    const cardY = 220;
    const cardW = width - 120;
    const cardH = qrSize + 120;
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // QR code centered in card
    const qrX = (width - qrSize) / 2;
    const qrY = cardY + 60;
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // Logo on top of the card (overlapping)
    if (business?.logoUrl) {
      try {
        const logoImg = await loadImage(business.logoUrl);
        const logoRadius = 56;
        const logoCx = width / 2;
        const logoCy = cardY - 10;

        // White circle border
        ctx.beginPath();
        ctx.arc(logoCx, logoCy, logoRadius + 6, 0, Math.PI * 2);
        ctx.fillStyle = '#0A0A0A';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(logoCx, logoCy, logoRadius + 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        drawCircularImage(ctx, logoImg, logoCx, logoCy, logoRadius);
      } catch { /* skip logo if fails */ }
    }

    // Business name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(business?.name || 'Minha Vitrine', width / 2, cardY + cardH + 70);

    // Slogan
    if (business?.slogan) {
      ctx.fillStyle = '#999999';
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(business.slogan, width / 2, cardY + cardH + 110);
    }

    // "Escaneie para ver a vitrine"
    ctx.fillStyle = '#666666';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    const scanY = business?.slogan ? cardY + cardH + 160 : cardY + cardH + 120;
    ctx.fillText('Escaneie para ver a vitrine', width / 2, scanY);

    // URL
    ctx.fillStyle = '#555555';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(storeUrl, width / 2, scanY + 40);

    // Powered by at bottom
    ctx.fillStyle = '#333333';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Powered by Witrin', width / 2, height - 40);
  };

  const renderDark = async (ctx: CanvasRenderingContext2D, qrImg: HTMLImageElement) => {
    const width = 1080;
    const height = 1350;
    const qrSize = 640;

    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // Dark gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle border card
    const cardX = 80;
    const cardY = 160;
    const cardW = width - 160;
    const cardH = qrSize + 100;

    drawRoundRect(ctx, cardX, cardY, cardW, cardH, 28);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // White QR
    const qrPad = 40;
    const qrBgSize = qrSize + qrPad;
    drawRoundRect(ctx, (width - qrBgSize) / 2, cardY + (cardH - qrBgSize) / 2, qrBgSize, qrBgSize, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.drawImage(qrImg, (width - qrSize) / 2, cardY + (cardH - qrSize) / 2, qrSize, qrSize);

    // Logo below the card
    const infoY = cardY + cardH + 60;
    if (business?.logoUrl) {
      try {
        const logoImg = await loadImage(business.logoUrl);
        const logoRadius = 40;
        drawCircularImage(ctx, logoImg, width / 2, infoY, logoRadius);
      } catch { /* skip */ }
    }

    const nameY = business?.logoUrl ? infoY + 70 : infoY + 20;

    // Business name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(business?.name || 'Minha Vitrine', width / 2, nameY);

    // Slogan
    if (business?.slogan) {
      ctx.fillStyle = '#888888';
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(business.slogan, width / 2, nameY + 40);
    }

    // "Escaneie o QR Code"
    const promptY = business?.slogan ? nameY + 90 : nameY + 55;
    ctx.fillStyle = '#555555';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Aponte a câmera para acessar', width / 2, promptY);

    // URL
    ctx.fillStyle = '#444444';
    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(storeUrl, width / 2, promptY + 35);

    // Powered by
    ctx.fillStyle = '#333333';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Powered by Witrin', width / 2, height - 40);
  };

  const renderElegant = async (ctx: CanvasRenderingContext2D, qrImg: HTMLImageElement) => {
    const width = 1080;
    const height = 1440;
    const qrSize = 620;

    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // Cream/warm background
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, width, height);

    // Gold border frame
    const borderInset = 40;
    drawRoundRect(ctx, borderInset, borderInset, width - borderInset * 2, height - borderInset * 2, 24);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner subtle frame
    const innerInset = 56;
    drawRoundRect(ctx, innerInset, innerInset, width - innerInset * 2, height - innerInset * 2, 18);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Logo at top
    let contentY = 130;
    if (business?.logoUrl) {
      try {
        const logoImg = await loadImage(business.logoUrl);
        const logoRadius = 50;
        // Gold ring
        ctx.beginPath();
        ctx.arc(width / 2, contentY, logoRadius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2;
        ctx.stroke();
        drawCircularImage(ctx, logoImg, width / 2, contentY, logoRadius);
        contentY += 80;
      } catch {
        contentY += 10;
      }
    }

    // Business name
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 42px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.fillText(business?.name || 'Minha Vitrine', width / 2, contentY + 20);

    // Gold decorative line
    const lineY = contentY + 50;
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 60, lineY);
    ctx.lineTo(width / 2 + 60, lineY);
    ctx.stroke();

    // Gold diamond in center
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.moveTo(width / 2, lineY - 6);
    ctx.lineTo(width / 2 + 6, lineY);
    ctx.lineTo(width / 2, lineY + 6);
    ctx.lineTo(width / 2 - 6, lineY);
    ctx.closePath();
    ctx.fill();

    // Slogan
    let qrCardY = lineY + 40;
    if (business?.slogan) {
      ctx.fillStyle = '#666666';
      ctx.font = 'italic 22px "Playfair Display", serif';
      ctx.fillText(business.slogan, width / 2, qrCardY + 10);
      qrCardY += 50;
    }

    // QR code in light card
    const qrPad = 50;
    const cardW = qrSize + qrPad * 2;
    const cardH = qrSize + qrPad * 2;
    const cardX = (width - cardW) / 2;
    qrCardY += 20;

    drawRoundRect(ctx, cardX, qrCardY, cardW, cardH, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.drawImage(qrImg, cardX + qrPad, qrCardY + qrPad, qrSize, qrSize);

    // "Escaneie para ver a vitrine"
    const bottomY = qrCardY + cardH + 50;
    ctx.fillStyle = '#999999';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Escaneie para ver a vitrine', width / 2, bottomY);

    // URL
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(storeUrl, width / 2, bottomY + 35);

    // Powered by
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Powered by Witrin', width / 2, height - 60);
  };

  const handleDownloadQR = async () => {
    setIsDownloading(true);
    try {
      const svgUrl = await getQrSvgDataUrl();
      const qrImg = await loadImage(svgUrl);
      URL.revokeObjectURL(svgUrl);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      switch (selectedTemplate) {
        case 'minimal':
          await renderMinimal(ctx, qrImg);
          break;
        case 'branded':
          await renderBranded(ctx, qrImg);
          break;
        case 'dark':
          await renderDark(ctx, qrImg);
          break;
        case 'elegant':
          await renderElegant(ctx, qrImg);
          break;
      }

      const link = document.createElement('a');
      link.download = `qrcode-${selectedTemplate}-${business?.slug || 'vitrine'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating QR:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif text-white mb-1">QR Code</h1>
        <p className="text-neutral-400 text-sm">Escolha um template e baixe o QR Code para imprimir</p>
      </div>

      {/* Preview Card */}
      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-8 flex flex-col items-center">
        <div className="bg-white rounded-2xl p-8 mb-6 shadow-2xl" ref={qrContainerRef}>
          <QRCodeSVG
            value={storeUrl}
            size={240}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>

        <h2 className="text-xl font-serif text-white mb-1">{business?.name}</h2>
        <p className="text-neutral-400 text-sm font-mono mb-6">{storeUrl}</p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <button
            onClick={handleDownloadQR}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black px-6 py-3 rounded-xl font-medium text-sm transition-colors"
          >
            {isDownloading ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <span className="material-icons-round text-sm">download</span>
            )}
            Baixar QR Code
          </button>
          <button
            onClick={handleCopyLink}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors border ${
              copied
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-neutral-800 border-white/10 text-white hover:border-white/20'
            }`}
          >
            <span className="material-icons-round text-sm">{copied ? 'check' : 'content_copy'}</span>
            {copied ? 'Copiado!' : 'Copiar link'}
          </button>
        </div>
      </div>

      {/* Template Selector */}
      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-medium text-white">Templates para impressão</h2>
        <p className="text-sm text-neutral-500 mb-2">Escolha o estilo do QR Code que será baixado</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl.id)}
              className={`relative p-4 rounded-xl border text-left transition-all ${
                selectedTemplate === tpl.id
                  ? 'bg-white/10 border-white/30'
                  : 'bg-neutral-800/30 border-white/5 hover:border-white/10'
              }`}
            >
              {selectedTemplate === tpl.id && (
                <div className="absolute top-2 right-2">
                  <span className="material-icons-round text-white text-sm">check_circle</span>
                </div>
              )}
              <span className={`material-icons-round text-2xl mb-2 block ${
                selectedTemplate === tpl.id ? 'text-white' : 'text-neutral-500'
              }`}>
                {tpl.icon}
              </span>
              <p className={`text-sm font-medium ${
                selectedTemplate === tpl.id ? 'text-white' : 'text-neutral-300'
              }`}>
                {tpl.name}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">{tpl.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Template Previews */}
      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-medium text-white">Pré-visualização</h2>
        <div className="flex justify-center">
          <div className={`w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl ${
            selectedTemplate === 'minimal' ? 'border border-neutral-200' : ''
          }`}>
            {selectedTemplate === 'minimal' && (
              <div className="bg-white p-6 flex flex-col items-center">
                <div className="w-40 h-40 bg-neutral-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-icons-round text-neutral-300 text-5xl">qr_code_2</span>
                </div>
                <p className="text-sm font-bold text-black">{business?.name}</p>
                <p className="text-[10px] text-neutral-400 mt-1">{storeUrl}</p>
              </div>
            )}
            {selectedTemplate === 'branded' && (
              <div className="bg-[#0A0A0A] p-6 flex flex-col items-center">
                {business?.logoUrl ? (
                  <img src={business.logoUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white mb-3" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-neutral-700 flex items-center justify-center mb-3">
                    <span className="text-white font-bold text-lg">{business?.name?.charAt(0)}</span>
                  </div>
                )}
                <div className="bg-white rounded-xl p-4 w-full flex items-center justify-center mb-4">
                  <span className="material-icons-round text-neutral-300 text-5xl">qr_code_2</span>
                </div>
                <p className="text-sm font-bold text-white">{business?.name}</p>
                {business?.slogan && <p className="text-[10px] text-neutral-500 mt-1">{business.slogan}</p>}
                <p className="text-[10px] text-neutral-600 mt-2">Escaneie para ver a vitrine</p>
              </div>
            )}
            {selectedTemplate === 'dark' && (
              <div className="bg-linear-to-b from-[#1a1a2e] to-[#0a0a0a] p-6 flex flex-col items-center">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 w-full flex flex-col items-center mb-4">
                  <div className="bg-white rounded-lg p-3">
                    <span className="material-icons-round text-neutral-300 text-4xl">qr_code_2</span>
                  </div>
                </div>
                {business?.logoUrl && (
                  <img src={business.logoUrl} alt="" className="w-10 h-10 rounded-full object-cover mb-2" />
                )}
                <p className="text-sm font-bold text-white">{business?.name}</p>
                <p className="text-[10px] text-neutral-500 mt-1">Aponte a câmera para acessar</p>
              </div>
            )}
            {selectedTemplate === 'elegant' && (
              <div className="bg-[#FAF8F5] p-5 flex flex-col items-center border-2 border-[#D4AF37]/40 rounded-xl">
                {business?.logoUrl && (
                  <img src={business.logoUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37] mb-2" />
                )}
                <p className="text-sm font-bold text-black font-serif">{business?.name}</p>
                <div className="w-8 h-px bg-[#D4AF37] my-2" />
                {business?.slogan && <p className="text-[10px] text-neutral-500 italic mb-2">{business.slogan}</p>}
                <div className="bg-white rounded-lg p-3 border border-[#D4AF37]/20 mb-3">
                  <span className="material-icons-round text-neutral-300 text-4xl">qr_code_2</span>
                </div>
                <p className="text-[10px] text-neutral-400">Escaneie para ver a vitrine</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-medium text-white">Como usar</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <span className="material-icons-round text-neutral-400 text-sm">palette</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Escolha o template</p>
              <p className="text-xs text-neutral-500">Selecione o estilo que combina com seu negócio</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <span className="material-icons-round text-neutral-400 text-sm">download</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Baixe a imagem</p>
              <p className="text-xs text-neutral-500">PNG de alta qualidade pronto para impressão</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <span className="material-icons-round text-neutral-400 text-sm">print</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Imprima</p>
              <p className="text-xs text-neutral-500">Cole em cartões, flyers, mesas ou na vitrine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
