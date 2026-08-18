import {auth} from "@clerk/nextjs/server";
import {
  percent,
  ProgressRepository,
  toDateKey,
  type ActivityDay,
  type DashboardSummary,
  type ProgressStats
} from "@/features/progress/repositories/progress-repository";
import {SettingsRepository} from "@/features/settings/repositories/settings-repository";

const HEATMAP_DAYS = 56;

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const {userId} = await auth.protect();
  const repository = new ProgressRepository();
  const settingsRepository = new SettingsRepository();
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);

  const [settings, statusCounts, dueReviews, queue, recentDecks, todaySummary, allActivity] =
    await Promise.all([
      settingsRepository.ensureForUser(userId),
      repository.getStatusCounts(userId),
      repository.getDueReviewCount(userId, now),
      repository.getQueue(userId, now, 5),
      repository.getDeckProgress(userId, 4),
      repository.getTodaySummary(userId, todayStart, tomorrowStart),
      repository.getActivity(userId)
    ]);

  return {
    streakDays: calculateStreaks(allActivity, now).current,
    dailyGoal: settings.dailyGoal,
    dailyProgress: percent(Math.min(todaySummary.totalActivity, settings.dailyGoal), settings.dailyGoal),
    dailyCompleted: todaySummary.totalActivity,
    newWords: statusCounts.new,
    dueReviews,
    mastered: statusCounts.mastered,
    queue,
    recentDecks,
    todaySummary
  };
}

export async function getProgressStats(): Promise<ProgressStats> {
  const {userId} = await auth.protect();
  const repository = new ProgressRepository();
  const settingsRepository = new SettingsRepository();
  const now = new Date();
  const heatmapStart = addDays(startOfDay(now), -(HEATMAP_DAYS - 1));

  const [settings, statusCounts, deckProgress, allActivity, heatmapActivity] = await Promise.all([
    settingsRepository.ensureForUser(userId),
    repository.getStatusCounts(userId),
    repository.getDeckProgress(userId),
    repository.getActivity(userId),
    repository.getActivity(userId, heatmapStart)
  ]);

  const streaks = calculateStreaks(allActivity, now);
  const reviews = allActivity.reduce((sum, day) => sum + day.reviews, 0);
  const correct = allActivity.reduce((sum, day) => sum + day.correct, 0);
  const sevenDayStart = toDateKey(addDays(startOfDay(now), -6));
  const thirtyDayStart = toDateKey(addDays(startOfDay(now), -29));
  const thirtyDays = allActivity.filter((day) => day.date >= thirtyDayStart);

  return {
    accuracy: percent(correct, reviews),
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    totalVocabulary: statusCounts.total,
    statusCounts,
    dailyGoal: settings.dailyGoal,
    dailyGoalCompletion: percent(
      thirtyDays.filter((day) => day.total >= settings.dailyGoal).length,
      30
    ),
    activity: {
      sevenDays: sumActivity(allActivity.filter((day) => day.date >= sevenDayStart)),
      thirtyDays: sumActivity(thirtyDays),
      allTime: sumActivity(allActivity),
      heatmap: fillActivityRange(heatmapActivity, heatmapStart, HEATMAP_DAYS)
    },
    deckProgress
  };
}

function calculateStreaks(activity: ActivityDay[], now: Date) {
  const activeDays = new Set(activity.filter((day) => day.total > 0).map((day) => day.date));
  const today = startOfDay(now);
  let cursor = activeDays.has(toDateKey(today)) ? today : addDays(today, -1);
  let current = 0;

  while (activeDays.has(toDateKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  let previous: Date | null = null;

  for (const day of [...activeDays].sort()) {
    const currentDay = parseDateKey(day);
    run = previous && daysBetween(previous, currentDay) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = currentDay;
  }

  return {current, longest};
}

function fillActivityRange(activity: ActivityDay[], start: Date, days: number) {
  const activityByDate = new Map(activity.map((day) => [day.date, day]));

  return Array.from({length: days}, (_, index) => {
    const date = toDateKey(addDays(start, index));
    return activityByDate.get(date) ?? {date, reviews: 0, correct: 0, newWords: 0, total: 0};
  });
}

function sumActivity(activity: ActivityDay[]) {
  return activity.reduce((sum, day) => sum + day.total, 0);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseDateKey(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function daysBetween(left: Date, right: Date) {
  return Math.round((right.getTime() - left.getTime()) / 86_400_000);
}
