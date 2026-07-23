import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Camera, RefreshCcw, Check, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface MealScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: any) => void;
  isAr?: boolean;
}

export function MealScanner({ isOpen, onClose, onScan, isAr }: MealScannerProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError(isAr ? "تعذر الوصول للكاميرا" : "Unable to access camera");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setPreviewImage(imageData);
      stopCamera();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmScan = async () => {
    if (!previewImage) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      const base64Image = previewImage.split(",")[1];
      const response = await fetch("/api/scan-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          mimeType: "image/jpeg",
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");
      
      const data = await response.json();
      onScan(data);
      handleClose();
    } catch (err) {
      console.error("Scan error:", err);
      setError(isAr ? "فشل تحليل الوجبة" : "Failed to analyze meal");
    } finally {
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setPreviewImage(null);
    setError(null);
    onClose();
  };

  const reset = () => {
    setPreviewImage(null);
    startCamera();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-bg-elevated shadow-2xl border border-white/5"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-black text-text-primary uppercase tracking-wider">
                    {isAr ? "ماسح الوجبات الذكي" : "Smart Meal Scanner"}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-surface text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-black/40 border border-white/5">
                {!previewImage ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="h-full w-full object-cover"
                      onLoadedMetadata={() => videoRef.current?.play()}
                    />
                    {!stream && !error && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button 
                          onClick={startCamera}
                          variant="primary"
                          className="rounded-full px-8"
                        >
                          {isAr ? "تشغيل الكاميرا" : "Start Camera"}
                        </Button>
                      </div>
                    )}
                    {stream && (
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6">
                        <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-2xl bg-bg-surface/80 text-text-muted backdrop-blur-md transition-all hover:bg-bg-surface hover:text-text-primary">
                          <ImageIcon className="h-6 w-6" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                        </label>
                        <button
                          onClick={handleCapture}
                          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary p-1 shadow-lg shadow-primary/20 active:scale-90 transition-all"
                        >
                          <div className="h-full w-full rounded-full border-4 border-bg" />
                        </button>
                        <div className="w-16" /> {/* Spacer */}
                      </div>
                    )}
                  </>
                ) : (
                  <img src={previewImage} className="h-full w-full object-cover" alt="Captured meal" />
                )}

                {isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-sm font-black text-white uppercase tracking-widest animate-pulse">
                      {isAr ? "جاري تحليل الوجبة..." : "Analyzing Meal..."}
                    </p>
                  </div>
                )}
                
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-danger/10 p-6 text-center">
                    <p className="text-sm font-bold text-danger">{error}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                {previewImage && !isScanning && (
                  <>
                    <button
                      onClick={reset}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-bg-surface text-text-muted font-bold uppercase tracking-widest hover:text-text-primary transition-all"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      {isAr ? "إعادة" : "Retake"}
                    </button>
                    <button
                      onClick={handleConfirmScan}
                      className="flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-bg font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    >
                      <Check className="h-5 w-5" />
                      {isAr ? "تأكيد" : "Analyze"}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
