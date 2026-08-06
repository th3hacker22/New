import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../index';
import { nutritionRepository } from './nutritionRepository';

beforeEach(async () => {
  await db.foodEntries.clear();
  await db.nutritionGoals.clear();
});

describe('nutritionRepository', () => {
  it('adds and lists entries for a date', async () => {
    await nutritionRepository.add({
      date: '2026-08-06',
      name: 'Chicken',
      calories: 200,
      protein: 40,
      carbs: 0,
      fat: 4,
      mealType: 'lunch',
    });
    const list = await nutritionRepository.listByDate('2026-08-06');
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Chicken');
  });

  it('soft-deletes entries', async () => {
    const id = await nutritionRepository.add({
      date: '2026-08-06',
      name: 'Rice',
      calories: 200,
      protein: 4,
      carbs: 44,
      fat: 0,
      mealType: 'dinner',
    });
    await nutritionRepository.softDelete(id);
    const list = await nutritionRepository.listByDate('2026-08-06');
    expect(list.filter((e) => !e.deleted)).toHaveLength(0);
  });

  it('creates then updates the singleton goal', async () => {
    await nutritionRepository.setGoal({ dailyCalories: 2000, protein: 130, carbs: 200, fat: 60 });
    let goal = await nutritionRepository.getGoal();
    expect(goal?.dailyCalories).toBe(2000);

    await nutritionRepository.setGoal({ dailyCalories: 2200, protein: 140, carbs: 220, fat: 70 });
    goal = await nutritionRepository.getGoal();
    expect(goal?.dailyCalories).toBe(2200);
    expect(await db.nutritionGoals.count()).toBe(1);
  });

  it('counts all entries', async () => {
    await nutritionRepository.add({
      date: '2026-08-06',
      name: 'Eggs',
      calories: 140,
      protein: 12,
      carbs: 1,
      fat: 10,
      mealType: 'breakfast',
    });
    expect(await nutritionRepository.count()).toBe(1);
  });
});
