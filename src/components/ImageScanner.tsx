import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  RotateCcw,
  Sparkles,
  Sliders,
  AlertCircle,
  FileImage,
  RefreshCw,
  Zap,
  Leaf,
  CheckCircle2,
  SwitchCamera,
  FileCheck,
  Check,
  Image as ImageIcon,
  AlertTriangle,
  Sun,
  Focus,
  Eye,
  Edit3,
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { SAMPLE_ITEMS, SampleItem } from '../data/sampleItems';
import { AnalysisResultCard } from './AnalysisResultCard';

interface ImageScannerProps {
  onLogNewItem: (result: AnalysisResult, actionTaken?: string, imageUrl?: string) => void;
}

interface SelectedFileInfo {
  name: string;
  sizeFormatted: string;
  width?: number;
  height?: number;
}

// Format bytes into readable string
function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Downscales large photos client-side for instant preview, minimal network payload, and lightning-fast analysis
function optimizeImageFile(
  file: File
): Promise<{ dataUrl: string; width: number; height: number; sizeFormatted: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        return reject(new Error('File content was empty.'));
      }

      const img = new Image();
      img.onerror = () => {
        // If image object fails to decode directly (e.g. SVG or raw format), fallback to rawDataUrl
        resolve({
          dataUrl: rawDataUrl,
          width: 0,
          height: 0,
          sizeFormatted: formatBytes(file.size),
        });
      };
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        const maxDimension = 1200;

        // Downscale proportionally only if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve({
              dataUrl: rawDataUrl,
              width,
              height,
              sizeFormatted: formatBytes(file.size),
            });
          }
          ctx.drawImage(img, 0, 0, width, height);
          // High-efficiency JPEG for minimal payload and optimal compatibility
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve({
            dataUrl: optimizedDataUrl,
            width,
            height,
            sizeFormatted: formatBytes(Math.round((optimizedDataUrl.length * 3) / 4)),
          });
        } catch {
          resolve({
            dataUrl: rawDataUrl,
            width,
            height,
            sizeFormatted: formatBytes(file.size),
          });
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

// Converts SVG data URIs into standard JPEG raster representations so vision models can ingest them
function rasterizeSvgToJpeg(svgDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    if (!svgDataUrl || !svgDataUrl.startsWith('data:image/svg')) {
      return resolve(svgDataUrl);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 600;
        canvas.height = img.naturalHeight || 450;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(svgDataUrl);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      } catch {
        resolve(svgDataUrl);
      }
    };
    img.onerror = () => resolve(svgDataUrl);
    img.src = svgDataUrl;
  });
}

export const ImageScanner: React.FC<ImageScannerProps> = ({ onLogNewItem }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileInfo, setSelectedFileInfo] = useState<SelectedFileInfo | null>(null);
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<string>('');
  const [estimatedWeight, setEstimatedWeight] = useState<number>(50);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [showApproximateResult, setShowApproximateResult] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Listen to logo click event to return directly to "Use Camera, Browse Files" view
  useEffect(() => {
    const handleResetToScanner = () => {
      stopCamera();
      setSelectedImage(null);
      setSelectedFileInfo(null);
      setCurrentResult(null);
      setFileError(null);
      setShowApproximateResult(false);
      setIsAnalyzing(false);

      setTimeout(() => {
        const el = document.getElementById('scanner-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    };

    window.addEventListener('ecovision:reset-to-scanner', handleResetToScanner);
    return () => {
      window.removeEventListener('ecovision:reset-to-scanner', handleResetToScanner);
    };
  }, []);

  // Clipboard paste listener: Allows users to paste screenshots or images (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Ensure stream is attached whenever isCameraActive is toggled
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch((err) => {
        console.warn('Video play caught in effect:', err);
      });
    }
  }, [isCameraActive]);

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    setFileError(null);
    setIsCameraLoading(true);
    setIsVideoReady(false);
    setIsCameraActive(true); // Mount video container immediately

    // Stop any previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser or environment. Please upload an image instead.');
      setIsCameraLoading(false);
      setIsCameraActive(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (idealErr) {
        console.warn('Ideal facingMode constraint failed, falling back to default camera:', idealErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
          setIsVideoReady(true);
        } catch (playErr) {
          console.warn('Initial play error:', playErr);
        }
      }
      setIsCameraLoading(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsCameraLoading(false);
      setIsCameraActive(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was blocked. Please allow camera access in your browser address bar/settings, or upload a photo.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device was detected on your computer or phone. Please upload an image instead.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is already in use by another program or tab. Please close other camera apps and try again.');
      } else {
        setCameraError(`Camera error (${err.message || 'Unable to start'}). Please check permissions or upload an image.`);
      }
    }
  };

  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
    setIsVideoReady(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    if (width === 0 || height === 0) {
      setCameraError('Camera feed is still initializing. Please wait a moment.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setSelectedImage(dataUrl);
    setSelectedFileInfo({
      name: `Snapshot_${new Date().toTimeString().slice(0, 8).replace(/:/g, '')}.jpg`,
      sizeFormatted: `${Math.round((dataUrl.length * 0.75) / 1024)} KB`,
      width,
      height,
    });
    setFileError(null);
    stopCamera();
    setCurrentResult(null);
    setIsLogged(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Critical: reset value so selecting the same file consecutively triggers change
    e.target.value = '';
  };

  const processFile = async (file: File) => {
    const isLikelyImage =
      file.type.startsWith('image/') ||
      /\.(jpe?g|png|webp|avif|bmp|gif|heic|heif|svg)$/i.test(file.name);

    if (!isLikelyImage) {
      setFileError('Please select a valid image file (JPG, PNG, WEBP, AVIF, HEIC, etc.).');
      setAnalysisError('Please select a valid image file (JPG, PNG, WEBP, AVIF, HEIC, etc.).');
      return;
    }

    setFileError(null);
    setAnalysisError(null);
    setIsFileLoading(true);

    try {
      const optimized = await optimizeImageFile(file);
      setSelectedImage(optimized.dataUrl);
      setSelectedFileInfo({
        name: file.name,
        sizeFormatted: optimized.sizeFormatted,
        width: optimized.width,
        height: optimized.height,
      });
      setCurrentResult(null);
      setIsLogged(false);
      // Close camera if active
      if (isCameraActive) {
        stopCamera();
      }
    } catch (err: any) {
      console.error('File load error:', err);
      setFileError(err?.message || 'Failed to process image file. Please try another image.');
      setAnalysisError(err?.message || 'Failed to process image file. Please try another image.');
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleItem) => {
    setSelectedImage(sample.dataUri);
    setSelectedFileInfo({
      name: `${sample.name}.jpg`,
      sizeFormatted: 'Sample Preset',
    });
    setFileError(null);
    setUserNotes(sample.notes);
    setEstimatedWeight(sample.weightGrams);
    setCurrentResult(null);
    setIsLogged(false);
    setAnalysisError(null);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage && !userNotes) {
      setAnalysisError('Please upload an image, snap a photo, or choose a sample item.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 28000);

    try {
      // If image is an SVG (e.g. preset samples), rasterize into standard JPEG so model vision can process it
      const sendableImage = selectedImage?.startsWith('data:image/svg')
        ? await rasterizeSvgToJpeg(selectedImage)
        : selectedImage;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          imageBase64: sendableImage,
          mimeType: sendableImage?.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
          notes: userNotes,
          estimatedWeight: estimatedWeight,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setCurrentResult(data);

      // Automatically store in Activity History as soon as the item is analyzed
      if (!data.is_poor_quality) {
        onLogNewItem(data, 'Scanned & Properly Diverted', selectedImage || undefined);
        setIsLogged(true);
      } else {
        setIsLogged(false);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Analysis error:', err);
      if (err.name === 'AbortError') {
        setAnalysisError('Analysis timed out after 28 seconds. Please check your network or try again.');
      } else if (err.message && (err.message.includes('Load failed') || err.message.includes('Failed to fetch'))) {
        setAnalysisError('Network connection interrupted. The analysis service is reconnecting; please try clicking Analyze Item again.');
      } else {
        setAnalysisError(err.message || 'Error communicating with analysis engine.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogCurrentItem = (actionTaken: string) => {
    if (!currentResult) return;
    onLogNewItem(currentResult, actionTaken, selectedImage || undefined);
    setIsLogged(true);
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-[#4F7942] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xs">
        {/* Geometric Balance Circle Accent */}
        <div className="hidden sm:flex absolute -right-6 -bottom-6 w-48 h-48 border-4 border-white/20 rounded-full items-center justify-center pointer-events-none">
          <div className="w-32 h-32 border-2 border-white/30 rounded-full rotate-45 flex items-center justify-center">
            <div className="w-16 h-16 border border-white/40 rounded-full"></div>
          </div>
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[10px] font-bold uppercase tracking-widest mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Multimodal Vision + Python Carbon Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Space_Grotesk']">
            Identify Waste, Vegetables &amp; Plastics Instantly
          </h1>
          <p className="text-white/85 text-sm sm:text-base mt-2 leading-relaxed max-w-2xl font-normal">
            Upload an image or use your camera to classify plastics (Resin #1 to #7), reusable packaging, or vegetable kitchen scraps. Get step-by-step disposal protocols, carbon impact metrics, and creative upcycling recipes.
          </p>
        </div>
      </div>

      {/* Quick Sample Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C6B5C]">
            Quick Test With Sample Items (1-Click)
          </span>
          <span className="text-xs text-[#7A8A7A]">Click any card below to test immediately</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SAMPLE_ITEMS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="text-left p-2.5 rounded-2xl border border-[#DDE3D9] bg-white hover:border-[#4F7942] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="aspect-video w-full rounded-xl bg-[#F4F7F2] overflow-hidden mb-2 relative">
                <img
                  src={sample.dataUri}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F7942] block">
                  {sample.badge}
                </span>
                <span className="text-xs font-semibold text-[#1A241A] line-clamp-1">
                  {sample.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick AI Image Identification Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C6B5C]">
            Quick AI Image Identification
          </span>
          <span className="text-xs text-[#7A8A7A]">Capture with live camera or browse photo files</span>
        </div>

        {/* Upload and Scanner Stage */}
        <div id="scanner-section" className="bg-white rounded-3xl border border-[#DDE3D9] p-6 sm:p-8 shadow-xs relative overflow-hidden scroll-mt-24">
        {/* Subtle geometric corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#F4F7F2] rounded-bl-[60px] border-l border-b border-[#DDE3D9] pointer-events-none hidden sm:block"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Image Canvas / Dropzone / Camera View */}
          <div className="lg:col-span-7">
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-stone-800 shadow-inner">
                {/* Live Video Feed */}
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el && streamRef.current && el.srcObject !== streamRef.current) {
                      el.srcObject = streamRef.current;
                      el.play().catch((err) => console.warn('Video play on ref callback caught:', err));
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => {
                    setIsVideoReady(true);
                    videoRef.current?.play().catch((err) => console.warn('Play error on metadata:', err));
                  }}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isVideoReady ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Loading / Warming-up Indicator */}
                {(!isVideoReady || isCameraLoading) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white z-10 space-y-3 p-6 text-center">
                    <RefreshCw className="w-7 h-7 animate-spin text-[#A9BA9D]" />
                    <p className="text-xs font-bold tracking-wider uppercase text-stone-200">
                      Starting Camera Feed...
                    </p>
                    <p className="text-[11px] text-stone-400 max-w-xs leading-relaxed">
                      If prompted, please grant camera permissions in your browser.
                    </p>
                  </div>
                )}

                {/* Viewfinder Target Framing Overlay */}
                {isVideoReady && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-10">
                    <div className="w-48 h-48 sm:w-60 sm:h-60 border border-white/30 rounded-3xl relative">
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-[#4F7942] rounded-tl-xl"></div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-[#4F7942] rounded-tr-xl"></div>
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-[#4F7942] rounded-bl-xl"></div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-[#4F7942] rounded-br-xl"></div>
                      <span className="absolute bottom-2.5 inset-x-0 text-center text-[10px] font-bold uppercase tracking-widest text-white/90 drop-shadow-md">
                        Position Item in Viewfinder
                      </span>
                    </div>
                  </div>
                )}

                {/* Camera Overlay Controls */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2.5 z-20 px-4">
                  <button
                    onClick={captureCameraPhoto}
                    disabled={!isVideoReady}
                    className={`px-6 py-2.5 bg-[#4F7942] hover:bg-[#3e6034] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 transition-all ${
                      !isVideoReady ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Snapshot</span>
                  </button>

                  <button
                    onClick={switchCamera}
                    title="Switch camera (front/back)"
                    className="p-2.5 bg-black/60 hover:bg-black/90 text-white rounded-full backdrop-blur cursor-pointer transition-all border border-white/20 flex items-center justify-center active:scale-95"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>

                  <button
                    onClick={stopCamera}
                    className="px-4 py-2.5 bg-black/60 hover:bg-black/90 text-white text-xs font-semibold rounded-full backdrop-blur cursor-pointer transition-all border border-white/20 active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Always-mounted accessible native file input */}
                <input
                  id="scanner-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.bmp,.gif,.heic,.heif"
                  onChange={handleFileChange}
                  onClick={(e) => {
                    (e.currentTarget as HTMLInputElement).value = '';
                  }}
                  className="sr-only"
                />

                {selectedImage ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative rounded-2xl overflow-hidden bg-[#FBFCFA] border border-[#DDE3D9] transition-all shadow-xs group ${
                      dragActive ? 'ring-2 ring-[#4F7942] bg-[#E8EDE6]/50' : ''
                    }`}
                  >
                    {/* Drag overlay on preview if dragging another file */}
                    {dragActive && (
                      <div className="absolute inset-0 bg-[#4F7942]/90 text-white z-30 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xs">
                        <Upload className="w-8 h-8 animate-bounce mb-2" />
                        <p className="text-sm font-bold">Drop here to replace current image</p>
                      </div>
                    )}

                    <div className="aspect-video w-full flex items-center justify-center p-4 bg-[#FBFCFA] relative">
                      <img
                        src={selectedImage}
                        alt={selectedFileInfo?.name || 'Selected material'}
                        className="max-h-72 w-auto object-contain rounded-xl shadow-xs"
                      />
                    </div>

                    {/* Laser Scanning Animation Overlay when analyzing */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-[#1A241A]/35 backdrop-blur-[2px] flex flex-col items-center justify-center overflow-hidden z-20">
                        <div className="absolute w-full h-1.5 bg-[#4F7942] shadow-[0_0_18px_#4F7942] animate-bounce"></div>
                        <div className="bg-[#1A241A]/95 text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2.5 shadow-xl border border-[#4F7942]/40">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#A9BA9D]" />
                          <span>Analyzing Molecular &amp; Organic Structure...</span>
                        </div>
                      </div>
                    )}

                    {/* File Details and Quick Actions Bar */}
                    {!isAnalyzing && (
                      <div className="p-3.5 bg-white border-t border-[#DDE3D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#E8EDE6] text-[#4F7942] flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-[#1A241A] truncate text-xs">
                              {selectedFileInfo?.name || 'Loaded Image'}
                            </p>
                            <p className="text-[11px] text-[#5C6B5C] flex items-center gap-1.5">
                              {selectedFileInfo?.sizeFormatted && <span>{selectedFileInfo.sizeFormatted}</span>}
                              {selectedFileInfo?.width && selectedFileInfo?.height && (
                                <>
                                  <span>&middot;</span>
                                  <span>{selectedFileInfo.width}&times;{selectedFileInfo.height}px</span>
                                </>
                              )}
                              <span>&middot;</span>
                              <span className="text-[#4F7942] font-semibold">Ready to analyze</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <label
                            htmlFor="scanner-file-input"
                            title="Upload a different image"
                            className="px-3.5 py-1.5 rounded-full bg-[#1A241A] hover:bg-[#2D3A2D] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-all inline-flex items-center gap-1.5 active:scale-95 select-none"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Change File</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImage(null);
                              setSelectedFileInfo(null);
                              setCurrentResult(null);
                            }}
                            title="Remove image"
                            className="p-1.5 rounded-full hover:bg-stone-100 text-[#5C6B5C] hover:text-[#1A241A] transition-all cursor-pointer border border-transparent hover:border-[#DDE3D9]"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Dropzone */
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button, label, a, .no-drop-click')) return;
                      fileInputRef.current?.click();
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[270px] relative overflow-hidden ${
                      dragActive
                        ? 'border-[#4F7942] bg-[#E8EDE6]/70 scale-[1.005]'
                        : 'border-[#A9BA9D] hover:border-[#4F7942] bg-[#FBFCFA] hover:bg-[#F4F7F2]'
                    }`}
                  >
                    {isFileLoading ? (
                      <div className="flex flex-col items-center justify-center p-6 space-y-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-[#4F7942]" />
                        <p className="text-sm font-bold text-[#1A241A]">Processing &amp; Optimizing Image...</p>
                        <p className="text-xs text-[#5C6B5C]">Preparing for multimodal AI inspection</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-[#E8EDE6] text-[#4F7942] flex items-center justify-center mb-3 shadow-xs">
                          <Upload className="w-6 h-6" />
                        </div>

                        <p className="text-sm font-bold text-[#1A241A] mb-1">
                          Drag and drop your waste or vegetable photo here
                        </p>
                        <p className="text-xs text-[#5C6B5C] mb-4 max-w-sm leading-relaxed">
                          Or click to browse. Supports JPG, PNG, WEBP, AVIF, HEIC, or paste (Ctrl+V).
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-2.5">
                          <label
                            htmlFor="scanner-file-input"
                            className="px-5 py-2.5 rounded-full bg-[#1A241A] hover:bg-[#2D3A2D] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-all inline-flex items-center gap-1.5 active:scale-95 select-none"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Browse Files</span>
                          </label>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startCamera();
                            }}
                            className="px-5 py-2.5 rounded-full bg-[#4F7942] hover:bg-[#436738] text-white text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Use Camera</span>
                          </button>
                        </div>

                        {fileError && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="no-drop-click mt-3.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5 max-w-md text-left"
                          >
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-bold block mb-0.5 text-rose-950">File Notice:</span>
                              <p className="text-[11px] text-rose-800 leading-relaxed">{fileError}</p>
                            </div>
                          </div>
                        )}

                        {cameraError && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="no-drop-click mt-3.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 max-w-md text-left"
                          >
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-bold block mb-0.5 text-amber-950">Camera Notice:</span>
                              <p className="text-[11px] text-amber-800 leading-relaxed">{cameraError}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Scan Parameters & Trigger */}
          <div className="lg:col-span-5 space-y-4 relative z-10">
            {/* Compact, Clear Typing Bar Container */}
            <div className="bg-white rounded-xl p-3 border border-[#4F7942]/30 shadow-2xs focus-within:border-[#4F7942] focus-within:ring-2 focus-within:ring-[#4F7942]/15 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="scanner-item-notes"
                  className="text-[11px] font-bold uppercase tracking-wider text-[#1A241A] flex items-center gap-1.5"
                >
                  <Edit3 className="w-3 h-3 text-[#4F7942]" />
                  <span>Item Notes &amp; Markings</span>
                </label>
                {userNotes && (
                  <button
                    type="button"
                    onClick={() => setUserNotes('')}
                    className="text-[10px] font-semibold text-[#7A8A7A] hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                id="scanner-item-notes"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Type item name, plastic code, or details (e.g. 'Clear PET #1 bottle', 'Carrot peels')..."
                rows={2}
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-[#4F7942] text-[#1A241A] bg-white placeholder:text-stone-400 leading-normal shadow-2xs resize-none min-h-[54px]"
              />
              <div className="flex items-center justify-between text-[10px] text-[#5C6B5C] mt-1">
                <span>💡 Type markings or describe item directly</span>
                <span className="text-[#7A8A7A]">
                  {userNotes.length > 0 ? `${userNotes.length} chars` : 'Optional'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5C6B5C]">
                  Approximate Weight
                </label>
                <span className="text-xs font-bold text-[#4F7942] bg-[#E8EDE6] px-2.5 py-0.5 rounded-full border border-[#DDE3D9]">
                  {estimatedWeight} grams
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={estimatedWeight}
                onChange={(e) => setEstimatedWeight(Number(e.target.value))}
                className="w-full accent-[#4F7942] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#7A8A7A] mt-1">
                <span>5g (Cap/Film)</span>
                <span>30g (PET bottle)</span>
                <span>120g (Scraps)</span>
                <span>300g+ (Jar)</span>
              </div>
            </div>

            <div className="bg-[#F4F7F2] rounded-2xl p-4 border border-[#DDE3D9] text-xs space-y-2 text-[#2D3A2D]">
              <div className="flex items-center gap-1.5 font-bold text-[#1A241A]">
                <Zap className="w-3.5 h-3.5 text-[#4F7942]" />
                <span>Detection Capabilities</span>
              </div>
              <ul className="space-y-1 text-[11px] text-[#5C6B5C] list-disc pl-4">
                <li>Resin Identification Codes (Plastics #1 through #7)</li>
                <li>Vegetables &amp; organic scraps (broth, compost, regrowing)</li>
                <li>Calculates life-cycle CO2e, energy &amp; water savings</li>
                <li>Generates actionable creative reuse recipes</li>
              </ul>
            </div>

            {analysisError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{analysisError}</span>
              </div>
            )}

            <button
              id="btn-analyze-item"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || (!selectedImage && !userNotes)}
              className={`w-full py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xs ${
                isAnalyzing || (!selectedImage && !userNotes)
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-[#1A241A] hover:bg-[#2D3A2D] text-white cursor-pointer active:scale-98'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#A9BA9D]" />
                  <span>Processing Analysis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Item &amp; Compute Impact</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Poor Quality Image Prompt: Asks user to upload again */}
      {currentResult && currentResult.is_poor_quality && !showApproximateResult && (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 text-[#1A241A] shadow-xs relative overflow-hidden animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-amber-200">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-200 flex items-center justify-center text-amber-900 shrink-0">
                <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-200/80 text-amber-950 mb-1">
                  Quality Check Notice
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-amber-950 font-['Space_Grotesk']">
                  Poor Quality Image Detected — Please Upload Again
                </h3>
                <p className="text-xs sm:text-sm text-amber-900 mt-1 max-w-2xl leading-relaxed">
                  {currentResult.poor_quality_report?.reason ||
                    'The image is too blurry, dark, or out of focus for the AI to reliably identify the resin code, cleanliness, or specific material composition.'}
                </p>
              </div>
            </div>
          </div>

          {/* Tips for better photos */}
          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 mb-3 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-700" />
              <span>Recommended Steps for an Accurate Scan:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200 text-xs">
                <span className="font-bold text-amber-950 block mb-1">1. Ample Bright Light</span>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  Turn on overhead lighting or move near a window to prevent shadows and underexposure.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200 text-xs">
                <span className="font-bold text-amber-950 block mb-1">2. Steady Focus</span>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  Hold your phone or camera steady 12-18 inches away until the lens sharpens on the object.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200 text-xs">
                <span className="font-bold text-amber-950 block mb-1">3. Show Markings &amp; Base</span>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  Direct the triangular recycling stamp (#1-#7) or container label straight at the camera.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200 text-xs">
                <span className="font-bold text-amber-950 block mb-1">4. Plain Clean Background</span>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  Place the item on a plain counter, table, or cutting board without visual clutter.
                </p>
              </div>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="mt-6 pt-5 border-t border-amber-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-retake-upload"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                    fileInputRef.current.click();
                  }
                }}
                className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider bg-[#1A241A] hover:bg-[#2D3A2D] text-white flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Upload a Clearer Photo</span>
              </button>

              <button
                id="btn-retake-camera"
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedFileInfo(null);
                  setCurrentResult(null);
                  startCamera('environment');
                }}
                className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4 text-amber-800" />
                <span>Open Camera &amp; Retake</span>
              </button>
            </div>

            <button
              onClick={() => {
                setShowApproximateResult(true);
                if (currentResult && !isLogged) {
                  onLogNewItem(currentResult, 'Scanned (Approximate Match)', selectedImage || undefined);
                  setIsLogged(true);
                }
              }}
              className="text-xs text-amber-900 hover:text-amber-950 font-semibold underline underline-offset-4 cursor-pointer"
            >
              View Approximate Detection Result Anyway →
            </button>
          </div>
        </div>
      )}

      {/* Analysis Result Presentation */}
      {currentResult && (!currentResult.is_poor_quality || showApproximateResult) && (
        <AnalysisResultCard
          result={currentResult}
          onLogItem={handleLogCurrentItem}
          isLogged={isLogged}
        />
      )}
    </div>
  );
};
