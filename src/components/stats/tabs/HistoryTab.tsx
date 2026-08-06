import WorkoutHistoryList from "@/components/workout/WorkoutHistoryList";

interface Props {
  isAr: boolean;
}

export default function HistoryTab({ isAr }: Props) {
  return <WorkoutHistoryList isAr={isAr} />;
}
