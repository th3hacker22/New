import { useState, useRef } from "react";
import { Camera, Trash2, ChevronsLeftRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataEmptyState } from "@/components/ui/DataEmptyState";
import type { ProgressPhoto } from "@/db";
import { cn } from "@/utils/cn";

interface PhotoWithUrl extends ProgressPhoto {
  url: string;
}

interface Props {
  photos: PhotoWithUrl[];
  beforePhotoId: string;
  afterPhotoId: string;
  sliderPos: number;
  isAr: boolean;
  onBeforeChange: (id: string) => void;
  onAfterChange: (id: string) => void;
  onSliderChange: (pos: number) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (id: string) => void;
}

export default function PhotosTab({ photos, beforePhotoId, afterPhotoId, sliderPos, isAr, onBeforeChange, onAfterChange, onSliderChange, onUpload, onDelete }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const beforePhoto = photos.find((p) => p.id === beforePhotoId);
  const afterPhoto = photos.find((p) => p.id === afterPhotoId);

  const t = {
    beforeAfterTitle: isAr ? "مقارنة الصور ⚡" : "Interactive Before & After ⚡",
    uploadPhotoBtn: isAr ? "ارفع صورة لتطورك" : "Upload New Progress Photo",
    photoHistoryTitle: isAr ? "صورك القديمة" : "Photo History",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">{t.beforeAfterTitle}</h3>
        <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
          <Camera className="w-4 h-4 mr-1.5" />{t.uploadPhotoBtn}
        </Button>
        <input type="file" ref={fileInputRef} onChange={onUpload} accept="image/*" className="hidden" />
      </div>

      {photos.length >= 2 ? (
        <div className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
          <div className="flex gap-4 mb-2">
            <div className="flex-1">
              <label className="text-[10px] block font-bold text-text-muted mb-1">{isAr ? "صورة قبل" : "Before Photo"}</label>
              <select value={beforePhotoId} onChange={(e) => onBeforeChange(e.target.value)} className="w-full bg-bg-surface border border-border rounded-lg p-2 text-xs text-text-primary">
                {photos.map((p) => <option key={p.id} value={p.id}>{new Date(p.date).toLocaleDateString()}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] block font-bold text-text-muted mb-1">{isAr ? "صورة بعد" : "After Photo"}</label>
              <select value={afterPhotoId} onChange={(e) => onAfterChange(e.target.value)} className="w-full bg-bg-surface border border-border rounded-lg p-2 text-xs text-text-primary">
                {photos.map((p) => <option key={p.id} value={p.id}>{new Date(p.date).toLocaleDateString()}</option>)}
              </select>
            </div>
          </div>

          {beforePhoto && afterPhoto && (
            <div className="relative w-full aspect-square sm:max-w-md mx-auto rounded-2xl overflow-hidden border border-border shadow-2xl select-none">
              <img src={afterPhoto.url} alt="After" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute bottom-3 right-3 bg-primary/90 text-primary-text text-[9px] font-black uppercase px-2 py-1 rounded-md z-10">{isAr ? "بعد" : "AFTER"}</div>
              <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                <img src={beforePhoto.url} alt="Before" className="absolute inset-y-0 left-0 w-full h-full object-cover" style={{ width: "100%", maxWidth: "none" }} referrerPolicy="no-referrer" />
                <div className="absolute bottom-3 left-3 bg-bg-surface/90 text-text-primary text-[9px] font-black uppercase px-2 py-1 rounded-md z-10">{isAr ? "قبل" : "BEFORE"}</div>
              </div>
              <div className="absolute inset-y-0 w-1 bg-primary cursor-ew-resize flex items-center justify-center" style={{ left: `${sliderPos}%` }}>
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-text shadow-lg border-2 border-border"><ChevronsLeftRight className="w-3.5 h-3.5" /></div>
              </div>
              <input type="range" min="0" max="100" value={sliderPos} onChange={(e) => onSliderChange(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" />
            </div>
          )}
        </div>
      ) : (
        <DataEmptyState icon={Camera} title={isAr ? "تحتاج صورتين للبدء" : "Upload 2 Photos to Compare"} description={isAr ? "ارفع صورتين على الأقل لمتابعة تطور جسمك." : "Please upload at least 2 progress photos."} actionLabel={isAr ? "ارفع صورتك الأولى" : "Upload Photo"} onAction={() => fileInputRef.current?.click()} />
      )}

      {photos.length > 0 && (
        <div className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
          <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">{t.photoHistoryTitle}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((p) => (
              <div key={p.id} className="bg-bg-surface rounded-xl overflow-hidden border border-border relative group aspect-square flex flex-col">
                <img src={p.url} alt="Progress" className="w-full h-full object-cover flex-1" referrerPolicy="no-referrer" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onDelete(p.id!)} className="bg-red-500/90 text-white p-1.5 rounded-lg hover:bg-red-600 shadow"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="bg-bg-surface-hover p-2 text-center text-[10px] font-bold text-text-secondary border-t border-border font-mono">{new Date(p.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
