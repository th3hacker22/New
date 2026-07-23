import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { 
  X, Sparkles, Flame, CheckCircle2, Play, Pause, ChevronRight, 
  RotateCcw, Volume2, VolumeX, ShieldAlert, Zap, Timer, Star
} from "lucide-react";
import { uid } from "@/utils/id";

interface WarmupMobilityGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  isAr?: boolean;
}

interface WarmupExercise {
  id: string;
  name: string;
  nameAr: string;
  duration: number; // in seconds
  reps?: string;
  repsAr?: string;
  desc: string;
  descAr: string;
  category: "joint" | "dynamic" | "activation";
  targetMuscles: string;
  targetMusclesAr: string;
}

// Warmup routines by workout focus
const WARMUP_EXERCISES_BY_FOCUS: Record<string, WarmupExercise[]> = {
  lower: [
    {
      id: "leg-1",
      name: "Dynamic Hip Circles",
      nameAr: "دوران الحوض الديناميكي",
      duration: 30,
      desc: "Stand on one leg, lift the other knee to 90 degrees, and make wide outer circles to lubricate hip joints.",
      descAr: "قف على رجل واحدة، وارفع الركبة الأخرى بزاوية 90 درجة، وقم بدوران واسع للخارج لتزييت مفاصل الفخذ.",
      category: "joint",
      targetMuscles: "Hips, Glutes",
      targetMusclesAr: "الحوض، الأرداف"
    },
    {
      id: "leg-2",
      name: "Ankle Mobility Drills",
      nameAr: "إحماء مرونة الكاحل",
      duration: 30,
      desc: "Place toes on the floor and rotate ankle in a circular motion. Essential for a deep parallel squat.",
      descAr: "ضع أصابع قدميك على الأرض وقم بتدوير الكاحل بحركة دائرية. مهم جداً لعمق السكوات الموازي.",
      category: "joint",
      targetMuscles: "Ankle Joints",
      targetMusclesAr: "مفاصل الكاحل"
    },
    {
      id: "leg-3",
      name: "World's Greatest Stretch",
      nameAr: "تمدد العالم الأكبر",
      duration: 40,
      reps: "5 per side",
      repsAr: "5 تكرارات لكل جهة",
      desc: "Step forward into a deep lunge, place opposite hand on floor, and rotate the other arm up towards the sky.",
      descAr: "خطوة واسعة للأمام في وضعية اللونج العميقة، ضع اليد المعاكسة على الأرض، وقم بتدوير الذراع الأخرى لأعلى نحو السماء.",
      category: "dynamic",
      targetMuscles: "Thoracic Spine, Hip Flexors, Hamstrings",
      targetMusclesAr: "العمود الفقري الصدري، عضلات الفخذ الأمامية، عضلات الفخذ الخلفية"
    },
    {
      id: "leg-4",
      name: "Dynamic Leg Swings",
      nameAr: "أرجحة الساق الديناميكية",
      duration: 30,
      reps: "10 per leg",
      repsAr: "10 تكرارات لكل رجل",
      desc: "Swing leg forward and backward smoothly to stretch hamstrings and hip flexors actively.",
      descAr: "أرجح ساقك للأمام والخلف بسلاسة لتمديد أوتار المأبض ومثنيات الورك بشكل نشط.",
      category: "dynamic",
      targetMuscles: "Hamstrings, Hip Flexors",
      targetMusclesAr: "الفخذ الخلفي، مثنيات الورك"
    },
    {
      id: "leg-5",
      name: "Bodyweight Tempo Squats",
      nameAr: "سكوات بوزن الجسم مع التحكم",
      duration: 40,
      reps: "12 reps",
      repsAr: "12 تكرار",
      desc: "Squat down slowly (3s eccentric), pause at parallel, and rise quickly to fire up lower body neural pathways.",
      descAr: "انزل للسكوات ببطء (3 ثوان نزول)، وتوقف عند التوازي، ثم اصعد سريعاً لتنشيط المسارات العصبية للجزء السفلي.",
      category: "activation",
      targetMuscles: "Quadriceps, Glutes, Core",
      targetMusclesAr: "الفخذ الأمامي، الأرداف، الجذع"
    },
    {
      id: "leg-6",
      name: "Glute Bridges",
      nameAr: "جسر الأرداف (Glute Bridge)",
      duration: 35,
      reps: "15 reps",
      repsAr: "15 تكرار",
      desc: "Lie on your back, knees bent, squeeze glutes and drive hips upward, holding for 1s at the peak.",
      descAr: "استلق على ظهرك مع ثني الركبتين، واعتصر الأرداف وادفع الحوض لأعلى، مع الثبات لثانية عند القمة.",
      category: "activation",
      targetMuscles: "Gluteus Maximus, Hamstrings",
      targetMusclesAr: "عضلة الأرداف الكبرى، الخلفيات"
    }
  ],
  push: [
    {
      id: "push-1",
      name: "Arm & Shoulder Circles",
      nameAr: "دوران الأذرع والأكتاف",
      duration: 30,
      desc: "Extend arms horizontally and perform small-to-large slow forward and backward rotations.",
      descAr: "امد ذراعيك أفقياً وقم بدوران بطيء من الصغير للكبير للأمام والخلف لتسخين مفصل الكتف.",
      category: "joint",
      targetMuscles: "Rotator Cuff, Deltoids",
      targetMusclesAr: "الكفة المدورة، الأكتاف"
    },
    {
      id: "push-2",
      name: "Wrist Extensions & Flexions",
      nameAr: "إحماء مرونة معصم اليد",
      duration: 30,
      desc: "Gently stretch wrists back and forth to prevent wrist strain during heavy presses.",
      descAr: "قم بتمديد المعاصم برفق ذهاباً وإياباً لتجنب إجهاد المعصم أثناء تمارين الدفع الثقيلة.",
      category: "joint",
      targetMuscles: "Wrist Joints, Forearms",
      targetMusclesAr: "مفاصل المعصم، السواعد"
    },
    {
      id: "push-3",
      name: "Prone Y-T-W Raises",
      nameAr: "رفرفة Y-T-W المنبطح",
      duration: 40,
      reps: "8 reps per letter",
      repsAr: "8 تكرارات لكل حرف",
      desc: "Lie facedown or bend at hips, raise arms to form Y, T, and W shapes, squeezing shoulder blades together.",
      descAr: "استلق على بطنك أو انحن عند الحوض، وارفع ذراعيك لتشكيل حروف Y وT وW، مع اعتصار لوحي الكتف معاً.",
      category: "dynamic",
      targetMuscles: "Lower Traps, Rear Delts, Rotator Cuff",
      targetMusclesAr: "الترابيس السفلية، الأكتاف الخلفية، الكفة المدورة"
    },
    {
      id: "push-4",
      name: "Dynamic Chest Flyes (No Weight)",
      nameAr: "فتحة الصدر الديناميكية (بدون وزن)",
      duration: 30,
      desc: "Hug yourself dynamically then open arms wide backward to stretch the chest fibers actively.",
      descAr: "احضن نفسك بحركة ديناميكية ثم افتح ذراعيك للخلف على أوسع نطاق لتمديد ألياف الصدر بشكل نشط.",
      category: "dynamic",
      targetMuscles: "Pectoralis Major, Anterior Deltoids",
      targetMusclesAr: "عضلة الصدر الكبرى، الأكتاف الأمامية"
    },
    {
      id: "push-5",
      name: "Scapular Push-ups",
      nameAr: "بوش أب لوحي الكتف",
      duration: 35,
      reps: "12 reps",
      repsAr: "12 تكرار",
      desc: "In a high plank, keep arms locked, sink chest down using only shoulder blades, then push back up aggressively.",
      descAr: "في وضع البلانك المرتفع، حافظ على ذراعيك مفرودتين، وانزل بصدرك لأسفل باستخدام لوحي الكتف فقط، ثم ادفع لأعلى بقوة.",
      category: "activation",
      targetMuscles: "Serratus Anterior, Scapular Stabilizers",
      targetMusclesAr: "العضلة المنشارية الأمامية، مثبتات الكتف"
    },
    {
      id: "push-6",
      name: "Plank Shoulder Taps",
      nameAr: "لمس الأكتاف من وضع البلانك",
      duration: 40,
      reps: "20 total taps",
      repsAr: "20 لمسة إجمالاً",
      desc: "Hold a tight plank, tap opposite shoulders slowly without swaying hips to ignite your entire core.",
      descAr: "اثبت في وضع بلانك مشدود، والمس كتفك المعاكس ببطء وبدون أرجحة الحوض لتنشيط الجذع بالكامل.",
      category: "activation",
      targetMuscles: "Transverse Abdominis, Deltoids",
      targetMusclesAr: "عضلات البطن العميقة، الأكتاف"
    }
  ],
  pull: [
    {
      id: "pull-1",
      name: "Cat-Cow Stretch",
      nameAr: "تمدد القطة والبقرة",
      duration: 35,
      desc: "On all fours, alternate between arching your back upwards (cat) and dipping it downwards (cow).",
      descAr: "على يديك وركبتيك، بدل بين تقويس ظهرك للأعلى (القطة) وتنزيله للأسفل (البقرة) لتليين العمود الفقري.",
      category: "joint",
      targetMuscles: "Thoracic & Lumbar Spine",
      targetMusclesAr: "العمود الفقري الصدري والقطني"
    },
    {
      id: "pull-2",
      name: "Thoracic Rotations",
      nameAr: "دوران العمود الفقري الصدري",
      duration: 30,
      reps: "8 per side",
      repsAr: "8 لكل جهة",
      desc: "From all fours, place one hand behind head and rotate elbow up towards ceiling, opening up the upper back.",
      descAr: "من وضع الزحف، ضع يداً واحدة خلف رأسك وقم بتدوير الكوع لأعلى نحو السقف، لفتح الجزء العلوي من الظهر.",
      category: "joint",
      targetMuscles: "Upper Back, Thoracic Spine",
      targetMusclesAr: "أعلى الظهر، العمود الفقري الصدري"
    },
    {
      id: "pull-3",
      name: "Active Lat Stretch & Reach",
      nameAr: "تمدد عضلات المجنص النشط",
      duration: 35,
      desc: "Hinge at the hips, reach forward to grab an upright post or wall, push hips back to feel deep lateral stretch.",
      descAr: "انحن عند الحوض، ومد يديك للأمام لتمسك بجدار أو عمود، ثم ادفع الحوض للخلف لتشعر بتمدد عميق في اللاتس (المجنص).",
      category: "dynamic",
      targetMuscles: "Latissimus Dorsi",
      targetMusclesAr: "عضلات المجنص (اللاتس)"
    },
    {
      id: "pull-4",
      name: "Band-Style Pull-Aparts (No Band)",
      nameAr: "تمديد الأكتاف الخلفية التخيلي",
      duration: 30,
      reps: "15 reps",
      repsAr: "15 تكرار",
      desc: "Extend arms straight forward, pull them wide apart as if stretching a strong resistance band to the chest.",
      descAr: "امد ذراعيك للأمام مباشرة، ثم اسحبهما بعيداً عن بعضهما كأنك تمد حبل مقاومة قوي ليدق صدرك ويشغل كتفك الخلفي.",
      category: "dynamic",
      targetMuscles: "Rear Deltoids, Rhomboids",
      targetMusclesAr: "الأكتاف الخلفية، عضلات أعلى الظهر"
    },
    {
      id: "pull-5",
      name: "Scapular Pull-ups (Or Active Hang)",
      nameAr: "سحب لوحي الكتف على العقبة",
      duration: 30,
      reps: "10 reps",
      repsAr: "10 تكرارات",
      desc: "Hang from a bar, pull shoulder blades down and back without bending elbows, activating major back stabilizers.",
      descAr: "تعلق على عقلة، واسحب لوحي كتفيك لأسفل وللخلف بدون ثني كوعيك، لتنشيط مثبتات الظهر الكبرى.",
      category: "activation",
      targetMuscles: "Lower Traps, Lats, Rotator Cuff",
      targetMusclesAr: "الترابيس السفلية، اللاتس، الكفة المدورة"
    }
  ],
  fullbody: [
    {
      id: "fb-1",
      name: "Jumping Jacks",
      nameAr: "تمرين قفز الحبل التخيلي (Jumping Jacks)",
      duration: 30,
      desc: "Perform light jumping jacks to raise core temperature and lubricate general body joints.",
      descAr: "اقفز مع فتح الذراعين والرجلين بانتظام لرفع درجة حرارة الجسم العامة وتزييت مفاصل الجسم.",
      category: "joint",
      targetMuscles: "Full Body Cardio",
      targetMusclesAr: "كارديو كامل الجسم"
    },
    {
      id: "fb-2",
      name: "World's Greatest Stretch",
      nameAr: "تمدد العالم الأكبر",
      duration: 40,
      reps: "5 per side",
      repsAr: "5 تكرارات لكل جهة",
      desc: "Step forward into a deep lunge, place opposite hand on floor, and rotate the other arm up towards the sky.",
      descAr: "خطوة واسعة للأمام في وضعية اللونج العميقة، ضع اليد المعاكسة على الأرض، وقم بتدوير الذراع الأخرى لأعلى نحو السماء.",
      category: "dynamic",
      targetMuscles: "Thoracic Spine, Hip Flexors",
      targetMusclesAr: "العمود الفقري الصدري، مثنيات الورك"
    },
    {
      id: "fb-3",
      name: "Inchworms",
      nameAr: "تمرين الزحف (Inchworm)",
      duration: 45,
      reps: "8 reps",
      repsAr: "8 تكرارات",
      desc: "Stand tall, bend down, walk hands out into a plank, perform a light stretch, and walk hands back up.",
      descAr: "قف مستقيماً، انحنِ لأسفل، امشِ بيديك للأمام لوضع بلانك، خذ تمدداً خفيفاً ثم ارجع بيديك للخلف لتصعد.",
      category: "dynamic",
      targetMuscles: "Hamstrings, Core, Shoulders",
      targetMusclesAr: "الخلفيات، الجذع، الأكتاف"
    },
    {
      id: "fb-4",
      name: "Air Squat with Overhead Reach",
      nameAr: "سكوات بوزن الجسم مع رفع اليدين",
      duration: 40,
      reps: "12 reps",
      repsAr: "12 تكرار",
      desc: "Perform a deep squat and raise both hands straight overhead to integrate hip flexors and back opening.",
      descAr: "انزل للسكوات العميق مع رفع كلتا يديك للأعلى مباشرة لتنشيط مثنيات الفخذ وفتح عضلات الظهر.",
      category: "activation",
      targetMuscles: "Quads, Delts, Back Stabilizers",
      targetMusclesAr: "الفخذ الأمامي، الأكتاف، مثبتات الظهر"
    }
  ]
};

export default function WarmupMobilityGenerator({ isOpen, onClose, isAr = false }: WarmupMobilityGeneratorProps) {
  const [focus, setFocus] = useState<"lower" | "push" | "pull" | "fullbody">("push");
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const activeRoutine = WARMUP_EXERCISES_BY_FOCUS[focus] || [];
  const activeExercise = activeIdx >= 0 ? activeRoutine[activeIdx] : null;

  // Initialize timer for selected exercise
  useEffect(() => {
    if (activeExercise) {
      setTimeLeft(activeExercise.duration);
    }
  }, [activeIdx, activeExercise]);

  // Audio countdown sound simulation
  const playBeep = (freq: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.value = freq;
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context block catch
    }
  };

  // Timer counter loop
  useEffect(() => {
    let timerId: any = null;
    if (isPlaying && activeIdx >= 0 && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 4 && prev > 1) {
            playBeep(600, 0.1); // Tick beep
          } else if (prev === 1) {
            playBeep(1200, 0.3); // High beep on transition
          }
          if (prev <= 1) {
            // Move to next or stop
            clearInterval(timerId);
            handleNext();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [isPlaying, activeIdx, timeLeft]);

  const handleNext = () => {
    if (activeIdx < activeRoutine.length - 1) {
      setActiveIdx((prev) => prev + 1);
    } else {
      // Completed all warmup exercises!
      setIsPlaying(false);
      setShowCelebration(true);
      // Increment total warmup count in localStorage
      const totalWarmups = Number(localStorage.getItem("pulse_total_warmups") || "0") + 1;
      localStorage.setItem("pulse_total_warmups", String(totalWarmups));
    }
  };

  const handleBack = () => {
    if (activeIdx > 0) {
      setActiveIdx((prev) => prev - 1);
    }
  };

  const handleStartRoutine = () => {
    setActiveIdx(0);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setActiveIdx(-1);
    setIsPlaying(false);
    setShowCelebration(false);
  };

  const totalDuration = activeRoutine.reduce((acc, ex) => acc + ex.duration, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-xl rounded-[24px] border border-border bg-bg-surface p-6 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col no-scrollbar"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Flame className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    {isAr ? "مُحفّز الإحماء الحركي الذكي" : "Smart Mobility & Warm-up"}
                  </h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                    {isAr ? "تجهيز المفاصل والعضلات للأداء الأقصى" : "Prepare joints & muscles for peak loads"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Sound toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-lg bg-bg-surface-hover hover:bg-bg-surface-hover/80 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  title={isAr ? "كتم/تفعيل التنبيهات" : "Toggle Sound Cues"}
                >
                  {soundEnabled ? <Volume2 size={16} className="text-primary" /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-bg-surface-hover hover:bg-bg-surface-hover/80 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-4 py-2">
              {showCelebration ? (
                /* CELEBRATION VIEW */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-10 space-y-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                    <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-5xl relative z-10 animate-bounce">
                      🏆
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-primary uppercase tracking-wider">
                      {isAr ? "تم تجهيز المحرك بالكامل! 🔥" : "Engine Fully Primed!"}
                    </h4>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                      {isAr
                        ? "لقد قمت بإحماء مفاصلك وتنشيط جهازك العصبي. أنت الآن جاهز لكسر أرقامك القياسية بأمان كامل."
                        : "Your muscle fibers are fully oxygenated, and joint capsules are lubricated. Ready for heavy sets."}
                    </p>
                  </div>

                  {/* Summary of benefits */}
                  <div className="w-full max-w-sm rounded-2xl bg-bg-surface-hover border border-border/60 p-4 grid grid-cols-2 gap-3 text-right">
                    <div className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-bg/50">
                      <Zap className="w-5 h-5 text-primary mb-1" />
                      <span className="text-[10px] text-text-muted uppercase font-bold">{isAr ? "تحفيز عصبي" : "Neural Drive"}</span>
                      <span className="text-xs font-black text-text-primary mt-0.5">{isAr ? "أقصى أداء" : "100% Ready"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-bg/50">
                      <Timer className="w-5 h-5 text-warning mb-1" />
                      <span className="text-[10px] text-text-muted uppercase font-bold">{isAr ? "وقت الإحماء" : "Warmup Time"}</span>
                      <span className="text-xs font-black text-text-primary mt-0.5">{Math.round(totalDuration / 60)} {isAr ? "دقائق" : "min"}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full max-w-xs pt-4">
                    <Button variant="ghost" className="flex-1" onClick={handleReset}>
                      {isAr ? "إعادة الإحماء" : "Warm up again"}
                    </Button>
                    <Button variant="primary" className="flex-1 shadow-glow-primary" onClick={onClose}>
                      {isAr ? "بدء التمرين 🏋️" : "Start Workout 🏋️"}
                    </Button>
                  </div>
                </motion.div>
              ) : activeIdx === -1 ? (
                /* SETUP FOCUS VIEW */
                <div className="space-y-4">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex gap-3 items-start">
                    <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-text-primary uppercase tracking-wide">
                        {isAr ? "لماذا الإحماء الحركي؟" : "Why Dynamic Mobility?"}
                      </h5>
                      <p className="text-[11px] leading-relaxed text-text-secondary">
                        {isAr
                          ? "تمديد العضلات الثابت قبل التمرين يضعف القوة! الإحماء الديناميكي يزيد مرونة المفاصل ويضخ الدم للألياف ويهيئ جهازك العصبي للأوزان."
                          : "Static stretching before lifts temporarily weakens muscles. Dynamic stretching improves ranges, fires nerves, and decreases joint wear."}
                      </p>
                    </div>
                  </div>

                  {/* Focus Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted uppercase tracking-wider block">
                      {isAr ? "اختر تركيز تمرين اليوم لتوليد روتين الإحماء:" : "Select Today's Training Focus:"}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "push", label: "Push / Chest & Shoulders", labelAr: "دفع / صدر وأكتاف", icon: "🔥", desc: "Rotator cuff & thoracic mobility", descAr: "الكفة المدورة والعمود الفقري الصدري" },
                        { id: "lower", label: "Lower Body / Legs", labelAr: "جزء سفلي / أرجل", icon: "🦵", desc: "Deep hip & ankle mobility", descAr: "حركية الحوض والورك والكاحل" },
                        { id: "pull", label: "Pull / Back & Biceps", labelAr: "سحب / ظهر وبايسبس", icon: "💪", desc: "Lat & thoracic spine opening", descAr: "تمدد عضلات الظهر والعمود الفقري" },
                        { id: "fullbody", label: "Full Body Integration", labelAr: "تكامل كامل الجسم", icon: "⚡", desc: "Systemic activation & bloodflow", descAr: "تنشيط شامل لرفع النبض والحرارة" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setFocus(item.id as any)}
                          className={`flex flex-col text-right items-start p-3.5 rounded-2xl border transition-all text-left group cursor-pointer ${
                            focus === item.id
                              ? "bg-primary/10 border-primary text-text-primary shadow-[0_0_15px_rgba(204,255,0,0.1)]"
                              : "bg-bg-surface-hover border-border/50 hover:border-border-hover"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xl">{item.icon}</span>
                            <span className={`w-2 h-2 rounded-full transition-transform ${
                              focus === item.id ? "bg-primary scale-125 shadow-[0_0_8px_#ccff00]" : "bg-transparent"
                            }`} />
                          </div>
                          <span className="text-xs font-black text-text-primary uppercase tracking-wide group-hover:text-primary transition-colors">
                            {isAr ? item.labelAr : item.label}
                          </span>
                          <span className="text-[10px] text-text-muted mt-1 leading-normal font-bold">
                            {isAr ? item.descAr : item.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Routine Preview */}
                  <div className="rounded-2xl border border-border/60 bg-bg-surface-hover/40 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-text-muted uppercase tracking-wider">
                        {isAr ? "استعراض الروتين المولد" : "Generated Routine Preview"}
                      </span>
                      <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                        {WARMUP_EXERCISES_BY_FOCUS[focus]?.length || 0} {isAr ? "تمارين" : "Drills"} ({Math.round(totalDuration / 60)} {isAr ? "دقائق" : "min"})
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
                      {WARMUP_EXERCISES_BY_FOCUS[focus]?.map((ex, i) => (
                        <div key={ex.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-bg-surface-hover/80 border border-border/30">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-text-muted w-4 h-4 rounded bg-bg-surface flex items-center justify-center border border-border">
                              {i + 1}
                            </span>
                            <span className="font-bold text-text-primary">
                              {isAr ? ex.nameAr : ex.name}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              ex.category === "joint" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                              ex.category === "dynamic" ? "bg-warning/10 text-warning border border-warning/20" :
                              "bg-primary/10 text-primary border border-primary/20"
                            }`}>
                              {ex.category === "joint" ? (isAr ? "مفاصل" : "Joint") :
                               ex.category === "dynamic" ? (isAr ? "ديناميكي" : "Dynamic") :
                               (isAr ? "تنشيط عصب" : "Activation")}
                            </span>
                          </div>
                          <span className="text-text-muted font-bold tabular-nums">
                            {ex.reps ? (isAr ? ex.repsAr : ex.reps) : `${ex.duration}s`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full py-4 rounded-2xl shadow-glow-primary text-xs font-black uppercase tracking-widest mt-2"
                    onClick={handleStartRoutine}
                  >
                    {isAr ? "بدء بروتوكول الإحماء الآن 🚀" : "Start Warmup Protocol Now 🚀"}
                  </Button>
                </div>
              ) : (
                /* ACTIVE PLAYING SCREEN */
                <div className="space-y-4">
                  {/* Progress Tracker */}
                  <div className="flex items-center gap-1.5">
                    {activeRoutine.map((ex, idx) => (
                      <div
                        key={ex.id}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          idx < activeIdx ? "bg-primary" :
                          idx === activeIdx ? "bg-primary animate-pulse" :
                          "bg-border"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Big Active Visuals Card */}
                  <div className="relative rounded-2xl border border-border bg-bg-surface-hover p-6 flex flex-col items-center justify-center text-center overflow-hidden">
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                        activeExercise?.category === "joint" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        activeExercise?.category === "dynamic" ? "bg-warning/10 text-warning border border-warning/20" :
                        "bg-primary/10 text-primary border border-primary/20"
                      }`}>
                        {activeExercise?.category === "joint" ? (isAr ? "مفاصل" : "Joint Lubrication") :
                         activeExercise?.category === "dynamic" ? (isAr ? "إطالة ديناميكية" : "Dynamic Stretch") :
                         (isAr ? "تنشيط عصب" : "Neural Activation")}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 text-[10px] text-text-muted font-bold tabular-nums">
                      {isAr ? "التمرين" : "Exercise"} {activeIdx + 1} / {activeRoutine.length}
                    </div>

                    {/* Concentric Circle Timer Visuals */}
                    <div className="relative w-44 h-44 my-4 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="88"
                          cy="88"
                          r="75"
                          className="stroke-bg stroke-2 fill-none"
                        />
                        <motion.circle
                          cx="88"
                          cy="88"
                          r="75"
                          className="stroke-primary fill-none"
                          strokeWidth="6"
                          strokeLinecap="round"
                          initial={{ strokeDasharray: "471", strokeDashoffset: "0" }}
                          animate={{
                            strokeDashoffset: `${471 - (471 * timeLeft) / (activeExercise?.duration || 30)}`
                          }}
                          transition={{ duration: 0.5, ease: "linear" }}
                        />
                      </svg>

                      {/* Breathing Assist expanding bubble inside timer */}
                      <motion.div
                        animate={{
                          scale: isPlaying ? [1, 1.08, 1] : 1,
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-8 rounded-full bg-primary/5 border border-primary/15 flex flex-col items-center justify-center"
                      >
                        <span className="text-4xl font-black text-text-primary tabular-nums tracking-tighter">
                          {timeLeft}
                        </span>
                        <span className="text-[10px] text-text-muted uppercase tracking-widest font-black mt-0.5">
                          {isAr ? "ثانية" : "SEC"}
                        </span>
                      </motion.div>
                    </div>

                    {/* Exercise title & targets */}
                    <div className="space-y-1.5 w-full max-w-sm mt-2">
                      <h4 className="text-lg font-black text-text-primary">
                        {isAr ? activeExercise?.nameAr : activeExercise?.name}
                      </h4>
                      <p className="text-[10px] font-black text-primary/80 uppercase tracking-widest bg-primary/5 px-2.5 py-0.5 rounded-full w-max mx-auto border border-primary/10">
                        {isAr ? `المستهدف: ${activeExercise?.targetMusclesAr}` : `Focus: ${activeExercise?.targetMuscles}`}
                      </p>
                      <p className="text-xs text-text-secondary leading-relaxed px-4 pt-1">
                        {isAr ? activeExercise?.descAr : activeExercise?.desc}
                      </p>
                      {activeExercise?.reps && (
                        <div className="mt-2 text-xs font-black text-warning bg-warning/5 px-3 py-1 rounded-xl w-max mx-auto border border-warning/10">
                          🎯 {isAr ? activeExercise.repsAr : activeExercise.reps}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Controller Board */}
                  <div className="flex items-center justify-between bg-bg-surface-hover/50 border border-border/60 rounded-2xl p-4 shrink-0">
                    <button
                      onClick={handleBack}
                      disabled={activeIdx === 0}
                      className="p-3 rounded-xl bg-bg-surface hover:bg-bg-surface-hover border border-border text-text-muted disabled:opacity-40 hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleReset}
                        className="p-3.5 rounded-full bg-bg-surface hover:bg-bg-surface-hover border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        title={isAr ? "إعادة البدء" : "Reset Routine"}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`p-5 rounded-full flex items-center justify-center text-black font-black transition-transform cursor-pointer hover:scale-105 active:scale-95 ${
                          isPlaying ? "bg-warning shadow-md shadow-warning/20" : "bg-primary shadow-glow-primary"
                        }`}
                      >
                        {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-0.5" />}
                      </button>
                    </div>

                    <button
                      onClick={handleNext}
                      className="p-3 rounded-xl bg-bg-surface hover:bg-bg-surface-hover border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
