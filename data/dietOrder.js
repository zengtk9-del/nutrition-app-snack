// How the user's chosen diet reorders the Log Food screen.
//
// The rule, in one line:
//
//     final = [leads] + [everything else, in balanced order] + [trails] + baby_food
//
// So each diet only has to name the categories it pulls forward and the
// ones it pushes back. Everything unnamed keeps the position it has today.
// That keeps this table short enough to argue with, and it means the
// "middle" of the list stays consistent from diet to diet for free.
//
// Two rules this file exists to protect:
//
//   1. NOTHING IS EVER HIDDEN. A vegan can still log a steak; it is just
//      further down. Reordering only, never filtering. Search is untouched
//      entirely -- a vegan typing "beef" gets beef at the top, instantly,
//      which is the safety valve that makes the reordering safe to be this
//      opinionated in the first place.
//   2. BALANCED IS THE IDENTITY. It names no leads and no trails, so
//      categoryOrderFor('balanced') returns CATEGORIES unchanged and
//      dietTierOffset returns 0 for everything. A balanced user, and any
//      user whose diet we don't know, sees exactly the app that shipped
//      before this file existed.
//
// Baby Food is pinned last for every diet. It is not "de-emphasised" in
// any dietary sense -- it just isn't what an adult is scrolling for, and
// it was already last before diets existed.

import { CATEGORIES } from './foods';

// What a user gets when the stored diet is missing or unrecognised. Every
// user takes the intake quiz, so in principle everyone has a diet -- but
// the quiz answer wasn't persisted until v0.0.69, so every account created
// before then has a null one until they retake the quiz or use the "My
// Diet" button on the Goals tab. Defaulting to balanced means those users
// see no change at all rather than a surprise reshuffle.
export const DEFAULT_DIET = 'balanced';

const ALWAYS_LAST = 'baby_food';

// Keys must match data/foods.js CATEGORIES and data/goalsConstants.js
// DIET_PROFILES. Ordering within `leads` is the order they appear in.
export const DIET_ORDER = {
  // The baseline. Deliberately empty -- see rule 2 above.
  balanced: { leads: [], trails: [] },

  // Animal foods only. Fats & Oils rides with the leads because tallow and
  // butter are the diet's cooking fats. Meat Substitutes goes last of all
  // the trails: it is the one category that is the diet's exact opposite.
  carnivore: {
    leads: ['red_meat', 'poultry', 'seafood', 'egg', 'dairy', 'fat_oil'],
    trails: ['nut_seed', 'vegetable', 'fruit', 'legume', 'grain', 'sweet', 'meat_substitute'],
  },

  // Very low carb, high fat -- so Fats & Oils leads outright, which is the
  // honest difference between keto and plain low-carb below. Vegetables
  // stay near the front (leafy greens are keto-central); Legumes drop,
  // being the one "plant protein" that is mostly carbohydrate.
  keto: {
    leads: ['fat_oil', 'red_meat', 'poultry', 'seafood', 'egg', 'dairy', 'vegetable', 'nut_seed'],
    trails: ['legume', 'fruit', 'grain', 'sweet'],
  },

  // "Less carbs, more protein and fat" -- softer than keto. Vegetables lead
  // rather than fats, and Legumes stay in the neutral middle instead of
  // being pushed back.
  low_carb: {
    leads: ['vegetable', 'red_meat', 'poultry', 'seafood', 'egg', 'dairy', 'nut_seed', 'fat_oil'],
    trails: ['fruit', 'grain', 'sweet'],
  },

  // Per the quiz's own copy: "oats, rice, fruit, legumes, and skinless
  // poultry while using less oil, butter, cheese, and fatty meat."
  //
  // Two calls here that surprise people, both deliberate:
  //   - Nuts & Seeds is a TRAIL. Nuts are roughly half fat by weight. This
  //     is a low-fat diet, not a healthy-eating diet, and the ordering has
  //     to follow the former or it means nothing.
  //   - Sweets is NOT a trail. Sorbet, jam, gummies and hard candy are
  //     genuinely low in fat. Demoting them would be moralising rather
  //     than sorting.
  // Dairy stays in the middle rather than the trail: skim milk and fat-free
  // yogurt are low-fat staples even though cheese isn't.
  low_fat: {
    leads: ['vegetable', 'fruit', 'grain', 'legume', 'poultry', 'seafood', 'egg'],
    trails: ['nut_seed', 'red_meat', 'fat_oil'],
  },

  // Seafood leads outright: it is both the defining category and the one
  // that is hardest to reach today, sitting fifth in the balanced order.
  pescatarian: {
    leads: ['seafood', 'vegetable', 'grain', 'fruit', 'legume', 'egg', 'dairy', 'nut_seed'],
    trails: ['poultry', 'red_meat'],
  },

  vegetarian: {
    leads: ['vegetable', 'fruit', 'legume', 'grain', 'egg', 'dairy', 'nut_seed', 'meat_substitute'],
    trails: ['seafood', 'poultry', 'red_meat'],
  },

  // The trails here run Eggs -> Dairy -> Seafood -> Poultry -> Red Meat,
  // which is exactly the vegetarian -> pescatarian -> omnivore ladder. The
  // principle generalises to every restrictive diet in this table: order
  // the excluded categories the way the NEXT DIET UP would, so someone
  // reaching for something off-plan reaches the nearest thing first.
  vegan: {
    leads: ['vegetable', 'fruit', 'legume', 'grain', 'nut_seed', 'meat_substitute', 'fat_oil'],
    trails: ['egg', 'dairy', 'seafood', 'poultry', 'red_meat'],
  },
};

const BASELINE = CATEGORIES.map((c) => c.key);

function specFor(diet) {
  return DIET_ORDER[diet] || DIET_ORDER[DEFAULT_DIET];
}

// categoryOrderFor is called once per render for the category strip and
// once per card (~1,057 of them) while ranking the All tab, so the result
// is cached rather than rebuilt each time. Eight possible keys, built at
// most once each, never invalidated -- DIET_ORDER is a module constant.
const ORDER_CACHE = new Map();

// The full 18 category keys, in the order this diet should show them.
export function categoryOrderFor(diet) {
  const key = DIET_ORDER[diet] ? diet : DEFAULT_DIET;
  const cached = ORDER_CACHE.get(key);
  if (cached) return cached;

  const { leads, trails } = specFor(key);
  const pinned = new Set([...leads, ...trails, ALWAYS_LAST]);
  const middle = BASELINE.filter((k) => !pinned.has(k));
  const order = [...leads, ...middle, ...trails, ALWAYS_LAST];
  ORDER_CACHE.set(key, order);
  return order;
}

// Where this category sits in the above, 0-17. Used as the sort weight for
// All-tab cards that aren't individually ranked in data/foodCommonness.js,
// so the tail of that list falls into the same order as the category strip
// instead of needing a second, separately-maintained weight table.
export function dietCategoryRank(category, diet) {
  const order = categoryOrderFor(diet);
  const i = order.indexOf(category);
  return i < 0 ? order.length : i;
}

// The gap between tiers, applied to the ~105 cards data/foodCommonness.js
// ranks by hand. Wide enough to fully separate the three tiers (that list
// is only ~105 long), narrow enough that all three still land below
// UNRANKED_BASE and never cross into the unranked tail.
export const DIET_TIER_STEP = 200;

// 0 for a lead category, one step for the neutral middle, two for a trail.
//
// This is added to a card's hand-assigned commonness rank, NOT used to
// partition the list. That distinction is the whole design: a hard
// partition would bury milk somewhere past position 600 for a vegan, which
// is elimination wearing a different hat. An offset keeps the ordinary
// staples of an off-diet category around position 90-105 -- a couple of
// scrolls down, plainly present, just not the first thing you see.
export function dietTierOffset(category, diet) {
  const { leads, trails } = specFor(diet);
  if (leads.length === 0 && trails.length === 0) return 0; // balanced
  if (leads.includes(category)) return 0;
  if (trails.includes(category)) return DIET_TIER_STEP * 2;
  return DIET_TIER_STEP;
}

export default DIET_ORDER;
