import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Scale } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataEmptyState } from "@/components/ui/DataEmptyState";
import { WeightGoalTracker } from "@/components/stats/WeightGoalTracker";
import type { BodyMeasurement } from "@/db";
import { AnimatedCounter } from "@/components/stats/AnimatedCounter";

interface Props {
  measurements: BodyMeasurement[];
  isAr: boolean;
  onAdd: (m: BodyMeasurement) => Promise<void>;
  onShowAdd: (show: boolean) => void;
  showAdd: boolean;
}

export default function MeasurementsTab({ measurements, isAr, onAdd, onShowAdd, showAdd }: Props) {
  const [form, setForm] = useState({ weight: "", bodyFat: "", waist: "", chest: "" });

  const monthsEn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthsAr = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

  const t = {
    weightGoal: isAr ? "هدف الوزن" : "Weight Goal",
    log: isAr ? "سجل القياسات" : "Weight & Fat Log",
    addWeightLog: isAr ? "سجل وزن ومقاسات جديدة ⚖️" : "Log New Weight & Metrics ⚖️",
    weightLabel: isAr ? "الوزن (كجم)" : "Weight (kg)",
    fatLabel: isAr ? "نسبة الدهون (%)" : "Body Fat (%)",
    waistLabel: isAr ? "محيط الوسط (سم)" : "Waist (cm)",
    chestLabel: isAr ? "محيط الصدر (سم)" : "Chest (cm)",
    save: isAr ? "حفظ" : "إحفظ",
    cancel: isAr ? "إلغاء" : "Cancel",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.weight) return;
    const { uid } = await import("@/utils/id");
    const m: BodyMeasurement = {
      id: uid(),
      date: new Date().toISOString(),
      weight: Number(form.weight),
      bodyFat: form.bodyFat ? Number(form.bodyFat) : undefined,
      waist: form.waist ? Number(form.waist) : undefined,
      chest: form.chest ? Number(form.chest) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await onAdd(m);
    setForm({ weight: "", bodyFat: "", waist: "", chest: "" });
    onShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[--radius-card] glass-card p-5 border border-border">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-black text-text-primary uppercase tracking-wider">{t.weightGoal}</h2>
          <Scale className="h-5 w-5 text-primary" />
        </div>
        {measurements.length >= 1 ? (
          <WeightGoalTracker current={measurements[0].weight || 0} start={measurements[measurements.length - 1].weight || measurements[0].weight || 0} target={75} isAr={isAr} />
        ) : (
          <div className="text-center py-6"><Scale className="h-10 w-10 text-text-muted/20 mx-auto mb-2" /><p className="text-xs text-text-muted uppercase font-bold tracking-wider">{isAr ? "سجل وزنك عشان نتابع الهدف" : "Log your weight to start tracking goals"}</p></div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">{t.log}</h3>
        <Button size="sm" variant="primary" onClick={() => onShowAdd(true)}><Plus className="w-4 h-4 mr-1.5" />{t.addWeightLog}</Button>
      </div>

      {showAdd && (
        <div className="glass-card p-5 border border-primary/20 bg-primary/5 rounded-xl space-y-4">
          <h4 className="text-xs font-black text-primary uppercase tracking-wider">{isAr ? "ضيف قياسات جديدة" : "Add New Measurement"}</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-text-muted font-bold block mb-1">{t.weightLabel}</label><input type="number" required placeholder="e.g. 78" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="w-full bg-bg-surface border border-border rounded-lg p-2 text-xs text-text-primary" /></div>
            <div><label className="text-[10px] text-text-muted font-bold block mb-1">{t.fatLabel}</label><input type="number" placeholder="e.g. 15" value={form.bodyFat} onChange={(e) => setForm({ ...form, bodyFat: e.target.value })} className="w-full bg-bg-surface border border-border rounded-lg p-2 text-xs text-text-primary" /></div>
            <div><label className="text-[10px] text-text-muted font-bold block mb-1">{t.waistLabel}</label><input type="number" placeholder="e.g. 82" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} className="w-full bg-bg-surface border border-border rounded-lg p-2 text-xs text-text-primary" /></div>
            <div><label className="text-[10px] text-text-muted font-bold block mb-1">{t.chestLabel}</label><input type="number" placeholder="e.g. 102" value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} className="w-full bg-bg-surface border border-border rounded-lg p-2 text-xs text-text-primary" /></div>
            <div className="col-span-2 flex gap-2 justify-end pt-2"><Button size="sm" variant="outline" onClick={() => onShowAdd(false)}>{t.cancel}</Button><Button size="sm" variant="primary" type="submit">{t.save}</Button></div>
          </form>
        </div>
      )}

      {measurements.length > 0 ? (
        <div className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
          <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider">{isAr ? "رسم بياني لوزنك" : "Weight Progression Chart"}</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={measurements.slice().reverse()} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs><linearGradient id="weightLogGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#CCFF00" stopOpacity={0.25}/><stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(str: string) => { const d = new Date(str); return isAr ? `${d.getDate()} ${monthsAr[d.getMonth()]}` : `${d.getDate()} ${monthsEn[d.getMonth()].substring(0,3)}`; }} tick={{ fill: "#A1A1AA", fontSize: 9 }} />
                <YAxis domain={["auto","auto"]} tick={{ fill: "#A1A1AA", fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1C1C1F", border: "1px solid #27272A", borderRadius: 8, fontSize: 11 }} labelStyle={{ color: "#F5F5F7" }} formatter={(value: any) => [`${value} kg`, isAr ? "الوزن" : "Weight"]} />
                <Area type="monotone" dataKey="weight" stroke="#CCFF00" strokeWidth={2} fillOpacity={1} fill="url(#weightLogGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <DataEmptyState icon={Scale} title={isAr ? "لا توجد قياسات مسجلة" : "No Measurements Recorded"} description={isAr ? "ابدأ في تسجيل وزنك ونسبة الدهون." : "Start logging your weight and body fat %!"} actionLabel={isAr ? "سجل وزنك الأول" : "Log First Weight"} onAction={() => onShowAdd(true)} />
      )}

      {measurements.length > 0 && (
        <div className="glass-card rounded-[--radius-card] p-5 border border-border space-y-3">
          <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider">{isAr ? "قياساتك اللي فاتت" : "Logged Measurements"}</h4>
          <div className="space-y-2">
            {measurements.map((m) => (
              <div key={m.id} className="bg-bg-surface-hover border border-border rounded-xl p-3 flex justify-between items-center">
                <div><span className="text-xs font-black text-text-primary"><AnimatedCounter value={m.weight || 0} /> kg</span><div className="text-[10px] text-text-muted font-semibold font-mono mt-0.5">{new Date(m.date).toLocaleDateString(isAr ? 'ar-EG' : undefined)}</div></div>
                <div className="flex gap-4 text-[10px] text-text-secondary font-semibold uppercase">{m.bodyFat && <span>Fat: <AnimatedCounter value={m.bodyFat || 0} />%</span>}{m.waist && <span>Waist: {m.waist}cm</span>}{m.chest && <span>Chest: {m.chest}cm</span>}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
