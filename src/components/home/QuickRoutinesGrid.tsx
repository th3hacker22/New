import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { ChevronRight, Clock, Play } from 'lucide-react';
import { cn } from '@/utils/cn';
import pushDayImg from '@/assets/images/push_day_routine_1784768080165.jpg';
import pullDayImg from '@/assets/images/pull_day_routine_1784768092799.jpg';
import legDayImg from '@/assets/images/leg_day_routine_1784768105158.jpg';
import fullBodyImg from '@/assets/images/full_body_routine_1784768116041.jpg';
import { routineTemplates, buildTemplateRoutine } from '@/data/routineTemplates';
import type { Exercise } from '@/types/exercise';

interface Props {
  exercises: Exercise[];
  isAr: boolean;
  onStartTemplate: (exerciseIds: string[]) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
};

export default function QuickRoutinesGrid({ exercises, isAr, onStartTemplate }: Props) {
  const routines = [
    {
      name: isAr ? 'يوم الدفع' : 'Push Day',
      subtitle: isAr ? 'صدر • كتف • ترايسبس' : 'Chest • Shoulders • Triceps',
      badge: isAr ? 'تمارين الدفع' : 'PUSH',
      exercises: 6,
      duration: '45 MIN',
      image: pushDayImg,
      badgeStyle: 'bg-primary/20 text-primary border-primary/40',
      templateIdx: 0,
    },
    {
      name: isAr ? 'يوم السحب' : 'Pull Day',
      subtitle: isAr ? 'ظهر • بايسبس • كتف خلفي' : 'Back • Biceps • Rear Delts',
      badge: isAr ? 'تمارين السحب' : 'PULL',
      exercises: 6,
      duration: '45 MIN',
      image: pullDayImg,
      badgeStyle: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      templateIdx: 1,
    },
    {
      name: isAr ? 'يوم الأرجل' : 'Leg Day',
      subtitle: isAr ? 'أرجل • هامات • سمانة' : 'Quads • Hamstrings • Calves',
      badge: isAr ? 'تمارين الأرجل' : 'LEGS',
      exercises: 6,
      duration: '45 MIN',
      image: legDayImg,
      badgeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      templateIdx: 2,
    },
    {
      name: isAr ? 'كامل الجسم' : 'Full Body',
      subtitle: isAr ? 'شامل • قوة • لياقة' : 'Compound • Power • Cardio',
      badge: isAr ? 'تمارين شاملة' : 'FULL BODY',
      exercises: 5,
      duration: '50 MIN',
      image: fullBodyImg,
      badgeStyle: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      templateIdx: 3,
    },
  ];

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
          <span>{isAr ? 'الجداول السريعة' : 'Quick Routines'}</span>
        </h2>
        <Link
          to="/builder"
          className="flex items-center gap-1 text-xs font-black text-primary hover:text-primary-hover uppercase tracking-wider cursor-pointer"
        >
          <span>{isAr ? 'شوف كله' : 'See all'}</span>
          <ChevronRight className={cn('h-3.5 w-3.5', isAr && 'rotate-180')} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {routines.map((routine, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-[22px] border border-border/70 hover:border-primary/60 transition-all duration-300 group cursor-pointer bg-bg-surface flex flex-col justify-between p-3.5 min-h-[220px] shadow-lg hover:shadow-xl"
            onClick={async () => {
              const tpl = routineTemplates[routine.templateIdx];
              if (tpl && exercises.length > 0) {
                const built = buildTemplateRoutine(tpl, exercises);
                const ids = built.exercises.map((ex) => String(ex.exerciseId));
                if (ids.length > 0) {
                  onStartTemplate(ids);
                  return;
                }
              }
            }}
          >
            <div className="relative w-full h-28 mb-2 rounded-xl overflow-hidden border border-white/10 group-hover:border-primary/40 transition-all shadow-md">
              <img
                src={routine.image}
                alt={routine.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-black/30" />
              <div className="absolute top-2 left-2 z-10">
                <span
                  className={cn(
                    'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border backdrop-blur-md shadow-sm',
                    routine.badgeStyle,
                  )}
                >
                  {routine.badge}
                </span>
              </div>
              <div className="absolute top-2 right-2 z-10">
                <span className="text-[9px] font-black text-white bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                  <Clock size={10} className="text-primary" />
                  {routine.duration}
                </span>
              </div>
            </div>

            <div className="relative z-10 mb-2">
              <h3 className="text-sm font-black italic tracking-tight text-text-primary group-hover:text-primary transition-colors">
                {routine.name}
              </h3>
              <p className="text-[10px] text-text-muted font-bold mt-0.5 line-clamp-1">
                {routine.subtitle}
              </p>
            </div>

            <div className="relative z-10 pt-2 border-t border-border/40 flex items-center justify-between text-xs font-black">
              <span className="text-[9px] font-bold text-text-muted bg-bg-elevated/80 px-2 py-0.5 rounded-md border border-border/30">
                {routine.exercises} {isAr ? 'تمارين' : 'Exercises'}
              </span>
              <div
                className={cn(
                  'flex items-center gap-1 text-primary font-black transition-transform duration-200',
                  isAr ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1',
                )}
              >
                <Play size={11} className="fill-current ml-0.5" />
                <span className="text-[10px] uppercase tracking-wider">
                  {isAr ? 'بدء' : 'START'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
