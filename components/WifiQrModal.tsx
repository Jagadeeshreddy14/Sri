import React, { useState } from 'react';
import { FloorWifi } from '../lib/types';
import {
  X,
  Wifi,
  QrCode,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  Download,
  Smartphone,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface WifiQrModalProps {
  wifi: FloorWifi | { ssid: string; password: string; floor?: number; speed?: string; frequency?: string; notes?: string } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WifiQrModal({ wifi, isOpen, onClose }: WifiQrModalProps) {
  const [copiedSSID, setCopiedSSID] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);

  if (!isOpen || !wifi) return null;

  const ssid = wifi.ssid || 'GrandHorizon_Resident';
  const password = wifi.password || 'Fiber1Gbps#2026';
  const floor = wifi.floor || 1;
  const speed = wifi.speed || '1 Gbps Fiber';
  const frequency = wifi.frequency || '5 GHz Dual-Band';

  // Standard Wi-Fi QR code payload format
  // WIFI:T:WPA;S:<SSID>;P:<PASSWORD>;;
  const wifiQrString = `WIFI:T:WPA;S:${ssid};P:${password};;`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    wifiQrString
  )}`;

  const handleCopySSID = () => {
    navigator.clipboard.writeText(ssid);
    setCopiedSSID(true);
    setTimeout(() => setCopiedSSID(false), 2000);
  };

  const handleCopyPass = () => {
    navigator.clipboard.writeText(password);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleCopyAll = () => {
    const details = `Grand Horizon Hostel Floor ${floor} Wi-Fi\nSSID (Network Name): ${ssid}\nPassword: ${password}\nSpeed: ${speed}`;
    navigator.clipboard.writeText(details);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handlePrintWifiFlyer = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Grand Horizon Hostel - Floor ${floor} Wi-Fi Access</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              background-color: #f8fafc;
              color: #0f172a;
              margin: 0;
              padding: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 90vh;
            }
            .flyer {
              background: #ffffff;
              border: 3px solid #4f46e5;
              border-radius: 28px;
              padding: 40px;
              max-width: 440px;
              width: 100%;
              text-align: center;
              box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.1);
            }
            .header-tag {
              background: #e0e7ff;
              color: #3730a3;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              padding: 6px 16px;
              border-radius: 9999px;
              display: inline-block;
              margin-bottom: 12px;
            }
            h1 {
              font-size: 26px;
              font-weight: 900;
              margin: 0 0 6px 0;
              color: #1e1b4b;
            }
            .sub {
              font-size: 13px;
              color: #64748b;
              margin-bottom: 24px;
            }
            .qr-box {
              background: #f1f5f9;
              border: 2px dashed #6366f1;
              border-radius: 20px;
              padding: 20px;
              display: inline-block;
              margin-bottom: 24px;
            }
            .qr-box img {
              width: 220px;
              height: 220px;
              display: block;
            }
            .instruction {
              font-size: 12px;
              font-weight: 700;
              color: #4f46e5;
              margin-top: 10px;
            }
            .credentials {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 16px;
              text-align: left;
              margin-bottom: 20px;
            }
            .field {
              margin-bottom: 10px;
            }
            .field:last-child {
              margin-bottom: 0;
            }
            .label {
              font-size: 10px;
              font-weight: 700;
              color: #94a3b8;
              text-transform: uppercase;
              display: block;
              margin-bottom: 2px;
            }
            .value {
              font-size: 14px;
              font-weight: 800;
              font-family: monospace;
              color: #0f172a;
            }
            .footer {
              font-size: 11px;
              color: #94a3b8;
              border-top: 1px solid #f1f5f9;
              padding-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="flyer">
            <div class="header-tag">Grand Horizon Hostel • Floor ${floor}</div>
            <h1>High-Speed Wi-Fi Access</h1>
            <div class="sub">Scan with your smartphone camera to connect automatically</div>
            
            <div class="qr-box">
              <img src="${qrImageUrl}" alt="Wi-Fi QR Code" />
              <div class="instruction">📷 Open Camera & Point at QR Code</div>
            </div>

            <div class="credentials">
              <div class="field">
                <span class="label">Wi-Fi Network Name (SSID)</span>
                <span class="value">${ssid}</span>
              </div>
              <div class="field">
                <span class="label">Wi-Fi Password</span>
                <span class="value">${password}</span>
              </div>
              <div class="field">
                <span class="label">Speed & Frequency</span>
                <span class="value" style="font-family: inherit;">${speed} • ${frequency}</span>
              </div>
            </div>

            <div class="footer">
              Complimentary Resident High-Speed Fiber Internet
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                Floor {floor} Wi-Fi QR Code
              </h3>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                Scan to Connect Automatically
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions banner */}
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <p className="text-xs text-indigo-900 dark:text-indigo-200 font-medium">
            Open your iOS or Android camera app and point it at this QR code to instantly join <strong className="font-bold">{ssid}</strong> without typing the password!
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
          <div className="w-56 h-56 mx-auto bg-white p-3.5 rounded-2xl border-2 border-indigo-500 shadow-md relative group flex items-center justify-center overflow-hidden">
            {!qrLoaded && (
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                <span className="text-[10px] text-indigo-600 font-bold">Generating Wi-Fi QR...</span>
              </div>
            )}
            <img
              src={qrImageUrl}
              alt={`Wi-Fi QR code for ${ssid}`}
              onLoad={() => setQrLoaded(true)}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                qrLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div className="absolute inset-0 bg-indigo-900/10 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold text-indigo-950 pointer-events-none">
              Scan with Camera
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Standard WPA/WPA2 Wi-Fi QR Format</span>
          </div>
        </div>

        {/* Credentials Details Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Network Name (SSID)</span>
              <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{ssid}</span>
            </div>
            <button
              onClick={handleCopySSID}
              className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition flex items-center gap-1"
            >
              {copiedSSID ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSSID ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Wi-Fi Password</span>
              <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                {showPassword ? password : '••••••••••••'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleCopyPass}
                className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition flex items-center gap-1"
              >
                {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPass ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopyAll}
            className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied All Info
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy Full Details
              </>
            )}
          </button>

          <button
            onClick={handlePrintWifiFlyer}
            className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Wi-Fi Poster
          </button>
        </div>

        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>Encrypted WPA/WPA2 High-Speed Fiber Network</span>
        </div>
      </div>
    </div>
  );
}
