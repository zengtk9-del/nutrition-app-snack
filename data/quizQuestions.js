// Everything about WHAT the quiz asks and HOW each question is displayed
// lives here, separate from QuizScreen.js, which only knows how to render
// each `type` generically. That split means rewording a question, adding
// an option, or reordering the quiz is a data change here — it never
// requires touching QuizScreen.js or utils/goals.js. Only the `key` and
// option `value`s below are load-bearing (utils/goals.js reads them); every
// `title`, `subtitle`, and option `label` is just displayed text.
//
// A couple of steps (weightHistory) need to show numbers computed from
// earlier answers (e.g. "underweight means 130 lbs" — that number depends
// on the height already answered). Those use `getOptions`/`getSubtitle`
// functions instead of a static `options`/`subtitle` string — QuizScreen
// calls them with the answers collected so far, plus a couple of helpers
// from utils/goals.js.

import { assetUri } from '../utils/assetHost';

export const QUIZ_STEPS = [
  {
    key: 'age',
    type: 'slider',
    title: 'What is your age?',
    min: 10,
    max: 120,
    step: 1,
    default: 25,
    unitLabel: 'years old',
  },
  {
    key: 'sex',
    type: 'single',
    title: 'Sex',
    // Renders as two big square boxes side by side instead of the usual
    // stacked list — see QuizScreen.js's renderStepBody for the 'single'
    // step type. Any other two-option single-choice step could opt into
    // the same layout just by adding this flag.
    layout: 'squareRow',
    // `symbol` is optional — squareRow shows it above the label when
    // present (see QuizScreen.js) and just skips it otherwise, so any other
    // squareRow step can leave it out without needing a change there.
    options: [
      { value: 'male', label: 'Male', symbol: '♂' },
      { value: 'female', label: 'Female', symbol: '♀' },
    ],
  },
  {
    key: 'height',
    type: 'height',
    title: 'Height',
  },
  {
    key: 'weight',
    type: 'weight',
    title: 'Weight',
  },
  {
    key: 'bodyFat',
    type: 'bodyFat',
    title: 'What is your body fat level?',
    subtitle: 'Choose the closest — no need to be too precise!',
  },
  {
    key: 'goal',
    type: 'single',
    title: 'What is your goal?',
    // Renders as three square icon tiles stacked vertically (small enough
    // that all three still fit on one screen with no scrolling) instead of
    // the usual plain-text list — see
    // GOAL_IMAGES below and QuizScreen.js's renderStepBody for the
    // 'single' step type. Unlike the original portrait "card" images,
    // these icons don't have any text baked in, so `label` is rendered as
    // a real <Text> under each tile by QuizScreen.js — it's not just kept
    // around for later reuse (e.g. a future profile summary row) the way
    // optionLabel() works for other steps in components/ReportPieces.js.
    layout: 'imageCards',
    options: [
      { value: 'gain', label: 'Gain weight' },
      { value: 'maintain', label: 'Maintain' },
      { value: 'lose', label: 'Lose weight' },
    ],
  },
  {
    key: 'goalWeight',
    type: 'weight',
    title: 'What is your target weight?',
    condition: (answers) => answers.goal !== 'maintain',
  },
  {
    key: 'weightHistory',
    type: 'single',
    title: 'Where has your weight been?',
    subtitle: 'Select the range that describes your weight history.',
    // Renders as a vertical weight-range scale (upper/lower threshold line
    // with color-coded bubbles around it) instead of the usual stacked
    // list — see the `layout` flag and QuizScreen.js's renderStepBody for
    // the 'single' step type. heightCm and weightUnit are always kept
    // resolved on `answers` by QuizScreen as soon as those questions are
    // answered — see utils/goals.js weightHistoryThresholds() and
    // formatWeightForUnit()/formatWeightRangeForUnit(). The upper/lower kg
    // numbers are always this person's own individualized thresholds, not
    // fixed numbers — that's why getOptions is still needed even though the
    // question wording itself no longer changes by answer.
    layout: 'weightScale',
    getOptions: (answers, helpers) => {
      const { underweightKg, overweightKg } = helpers.weightHistoryThresholds(answers.heightCm);
      const unit = answers.weightUnit || 'kg';
      return [
        {
          value: 'overweight',
          label: `I've been over ${helpers.formatWeightForUnit(overweightKg, unit)}`,
        },
        {
          value: 'neither',
          label: `I've always been between ${helpers.formatWeightRangeForUnit(
            underweightKg,
            overweightKg,
            unit
          )}`,
        },
        {
          value: 'underweight',
          label: `I've been under ${helpers.formatWeightForUnit(underweightKg, unit)}`,
        },
        {
          value: 'both',
          label: `I've been both\nOver ${helpers.formatWeightForUnit(
            overweightKg,
            unit
          )} & under ${helpers.formatWeightForUnit(underweightKg, unit)}`,
        },
      ];
    },
  },
  {
    key: 'activityLevel',
    type: 'single',
    title: 'How active are you each day?',
    subtitle: 'Outside of workouts and gym sessions.',
    // Renders as four illustrated horizontal cards (Damon's own illustrated
    // PNG on the left, title/description/step-count badge on the right)
    // instead of the usual plain-text list — see ACTIVITY_IMAGES below and
    // QuizScreen.js's renderStepBody for the 'single' step type. `label` is
    // kept as the short, complete sentence it always was ("I barely move")
    // since components/ReportPieces.js's optionLabel() still shows it
    // as-is on the report's profile summary; `description` and `badge` are
    // fields specific to this card layout, replacing the old `sub`
    // paragraph that used to cram both ideas into one sentence.
    //
    // An earlier version of this step drew its own code-only line-art
    // figures (components/ActivityIcon.js) instead of image files, same
    // "no extra assets to manage" reasoning as the weightHistory scale.
    // Damon then asked for these 4 illustrated images specifically, so this
    // step now follows the same require()'d-PNG pattern as the goal step
    // instead — ActivityIcon.js is unused now but left in the project
    // rather than deleted, in case a future step wants that same approach.
    layout: 'activityCards',
    options: [
      {
        value: 'barely',
        label: 'I barely move',
        description: 'Sitting most of the day',
        badge: 'Under 5k steps/day',
      },
      {
        value: 'little',
        label: 'I move a little bit',
        description: 'Some walking, but mostly sitting',
        badge: '5k–10k steps/day',
      },
      {
        value: 'lot',
        label: 'I move a lot',
        description: 'On my feet for much of the day',
        badge: '10k–15k steps/day',
      },
      {
        value: 'super',
        label: 'I am super active',
        description: 'Moving or doing physical work most of the day',
        badge: '15k+ steps/day',
      },
    ],
  },
  {
    key: 'training',
    type: 'multi',
    title: 'What training do you do? Select all that applies',
    noneValue: 'none',
    // Renders as four illustrated horizontal cards (Damon's own supplied
    // icon in a pale-blue circle on the left, label to the right) instead
    // of the plain text-only list every other 'multi' step still uses —
    // see TRAINING_IMAGES below and QuizScreen.js's renderStepBody for the
    // 'multi' step type. The None/Cardio/Lifting/Sports mutual-exclusivity
    // behavior (selecting None clears everything else, selecting anything
    // else clears None) is unchanged — it already lived in QuizScreen.js's
    // 'multi' handling before this layout existed and didn't need to move.
    layout: 'iconCards',
    options: [
      { value: 'none', label: 'None' },
      { value: 'cardio', label: 'Cardio' },
      { value: 'lifting', label: 'Lifting' },
      { value: 'sports', label: 'Sports & Other Activities' },
    ],
  },
  {
    key: 'diet',
    type: 'single',
    title: 'What diet do you prefer?',
    // Renders as illustrated horizontal cards (Damon's own supplied
    // illustration on the left, title + short description + a "Learn
    // more" control on the right) instead of the plain text-only
    // OptionCard every other 'single' step still falls back to — see
    // DIET_IMAGES/DIET_DETAILS below and QuizScreen.js's renderStepBody
    // for the 'single' step type. `sub` here doubles as both the
    // collapsed card's short description AND the value shown on the
    // report's profile summary via optionLabel()/SummaryRow elsewhere —
    // unchanged from before this layout existed, since its wording didn't
    // need to change.
    layout: 'illustratedCards',
    options: [
      {
        value: 'balanced',
        label: 'Balanced / Standard',
        sub: 'A mix of carbs, protein, and fat with no major food restrictions.',
      },
      { value: 'low_carb', label: 'Low-carb', sub: 'Less carbs, more protein and fat.' },
      { value: 'keto', label: 'Keto', sub: 'Very low carbs, high fat.' },
      { value: 'low_fat', label: 'Low-fat', sub: 'Less fat, more carbs and lean protein.' },
      {
        value: 'carnivore',
        label: 'Carnivore',
        sub: 'Only animal foods like meat, fish, eggs, and some dairy.',
      },
      { value: 'vegan', label: 'Vegan', sub: 'No meat, fish, eggs, or dairy.' },
      { value: 'vegetarian', label: 'Vegetarian', sub: 'No meat or fish.' },
      {
        value: 'pescatarian',
        label: 'Pescatarian',
        sub: 'No meat, but fish and seafood are okay.',
      },
    ],
  },
];

// Picture-range options for the body-fat question — separate from
// QUIZ_STEPS because they depend on which sex was already answered. Keys
// match BODY_FAT_MIDPOINTS in goalsConstants.js exactly.
export const BODY_FAT_OPTIONS = {
  male: ['3-5', '6-10', '11-15', '16-22', '23-29', '30-35', '36-39', '40+'],
  female: ['10-13', '14-18', '19-23', '24-30', '31-36', '37-42', '43-46', '47+'],
};

// Reference silhouette image for each body-fat range, shown next to its
// percentage on the quiz's body-fat step instead of a plain numeric bar.
// require() paths must be static string literals for Metro (Expo's
// bundler) to find them at build time — it cannot follow a path built from
// a variable — so every range is spelled out explicitly here rather than
// generated from BODY_FAT_OPTIONS above. If you ever add/rename a range in
// BODY_FAT_OPTIONS, add/rename its matching line here too (and the image
// file in assets/) — QuizScreen.js already has a check that fails loudly
// (throws, doesn't just skip the image) if a range here doesn't have a
// match in BODY_FAT_OPTIONS, or vice versa.
//
// These live directly in assets/ (not a assets/bodyFat/ subfolder) because
// that's where Snack's file import actually placed them when they were
// dragged in — Snack flattened them into the top-level assets folder
// instead of preserving a nested path, so the code was adjusted to match
// reality rather than fighting the importer.
export const BODY_FAT_IMAGES = {
  male: {
    '3-5': assetUri('male-3-5.jpg'),
    '6-10': assetUri('male-6-10.jpg'),
    '11-15': assetUri('male-11-15.jpg'),
    '16-22': assetUri('male-16-22.jpg'),
    '23-29': assetUri('male-23-29.jpg'),
    '30-35': assetUri('male-30-35.jpg'),
    '36-39': assetUri('male-36-39.jpg'),
    '40+': assetUri('male-40-plus.jpg'),
  },
  female: {
    '10-13': assetUri('female-10-13.jpg'),
    '14-18': assetUri('female-14-18.jpg'),
    '19-23': assetUri('female-19-23.jpg'),
    '24-30': assetUri('female-24-30.jpg'),
    '31-36': assetUri('female-31-36.jpg'),
    '37-42': assetUri('female-37-42.jpg'),
    '43-46': assetUri('female-43-46.jpg'),
    '47+': assetUri('female-47-plus.jpg'),
  },
};

// Square icon (no text baked in — QuizScreen.js renders the label
// separately) for each goal option — same "explicit static require(),
// fails loudly if out of sync" pattern as BODY_FAT_IMAGES above, and same
// reason these live flat in assets/ rather than a nested subfolder. Named
// after each image's own original filename (gain_weight.png, etc.) rather
// than the goal-*.png names used during testing — that's what actually
// ended up in the Snack project's assets folder, so the code matches that.
// These filenames stayed the same when the images themselves were swapped
// from the original tall "card" pictures to these square icons.
export const GOAL_IMAGES = {
  gain: assetUri('gain_weight.jpg'),
  maintain: assetUri('maintain.jpg'),
  lose: assetUri('lose_weight.jpg'),
};

// Illustrated PNG for each activityLevel option — same "explicit static
// require(), fails loudly if out of sync" pattern as GOAL_IMAGES/
// BODY_FAT_IMAGES above. Unlike GOAL_IMAGES, these are landscape (roughly
// 694x489, ~1.42:1) rather than square — each one already has its own
// light rounded-card background baked in from how Damon generated them, so
// QuizScreen.js's activityCards icon box is sized to that same aspect
// ratio rather than the square box the goal step uses.
export const ACTIVITY_IMAGES = {
  barely: assetUri('activity_barely.jpg'),
  little: assetUri('activity_little.jpg'),
  lot: assetUri('activity_lot.jpg'),
  super: assetUri('activity_super.jpg'),
};

// Illustrated PNG for each training option — same "explicit static
// require(), fails loudly if out of sync" pattern as the image maps above.
// These are square (143x143) and each already has its own pale-blue
// circular backdrop baked in behind the icon, on an opaque white square
// canvas — so QuizScreen.js's iconCards layout just draws the image
// directly at a small square size rather than wrapping it in its own
// circle View; the file already provides that circle.
export const TRAINING_IMAGES = {
  none: assetUri('training_none.jpg'),
  cardio: assetUri('training_cardio.jpg'),
  lifting: assetUri('training_lifting.jpg'),
  sports: assetUri('training_sports.jpg'),
};

// Illustrated PNG for each diet option — same "explicit static require(),
// fails loudly if out of sync" pattern as the image maps above. Unlike the
// activity/training images, Damon is uploading these himself directly into
// Snack's assets folder rather than sending the files to be copied in here,
// so these filenames are used EXACTLY as he specified them (leading
// zero-padded numbers + hyphens) instead of being renamed to this project's
// usual `<step>_<value>.png` convention — if what he uploads doesn't match
// one of these names exactly, Metro's bundler will fail to resolve the
// require() and say so, rather than silently showing a blank icon.
export const DIET_IMAGES = {
  balanced: assetUri('01-balanced-standard.jpg'),
  low_carb: assetUri('02-low-carb.jpg'),
  keto: assetUri('03-keto.jpg'),
  low_fat: assetUri('04-low-fat.jpg'),
  carnivore: assetUri('05-carnivore.jpg'),
  vegan: assetUri('06-vegan.jpg'),
  vegetarian: assetUri('07-vegetarian.jpg'),
  pescatarian: assetUri('08-pescatarian.jpg'),
};

// Longer, richer copy for each diet's "Learn more" detail view — shown in
// DietDetailModal.js. `detailedDescription` is the full paragraph;
// `boldPhrases` are exact substrings of that paragraph that should render as
// bold text (via components/RichText.js) instead of using Markdown-style
// asterisks, which would otherwise show up as literal characters on screen.
export const DIET_DETAILS = {
  balanced: {
    detailedDescription:
      'A flexible approach that includes a mix of carbohydrates, protein, and healthy fats. It can include grains, meat, fish, dairy, fruits, and vegetables, with no major food groups intentionally excluded.',
    boldPhrases: [
      'mix of carbohydrates, protein, and healthy fats',
      'no major food groups intentionally excluded',
    ],
  },
  low_carb: {
    detailedDescription:
      'A diet that reduces foods high in carbohydrates, such as bread, pasta, rice, and sweets, without necessarily eliminating them. Meals typically emphasize protein, vegetables, and healthy fats, with smaller portions of carbohydrate-rich foods.',
    boldPhrases: ['carbohydrates', 'protein, vegetables, and healthy fats'],
  },
  keto: {
    detailedDescription:
      'A very-low-carbohydrate, high-fat diet designed to shift the body toward using fat as its primary energy source. Meals often feature foods such as meat, fish, eggs, cheese, avocado, oils, and other high-fat foods, while grains, sugar, and most high-carb foods are heavily restricted.',
    boldPhrases: [
      'very-low-carbohydrate, high-fat',
      'meat, fish, eggs, cheese, avocado, oils, and other high-fat foods',
    ],
  },
  low_fat: {
    detailedDescription:
      'An approach that limits high-fat foods and prioritizes carbohydrates, fruits, vegetables, grains, and lean sources of protein. Meals commonly include foods such as oats, rice, fruit, legumes, and skinless poultry while using less oil, butter, cheese, and fatty meat.',
    boldPhrases: ['high-fat foods', 'lean sources of protein'],
  },
  carnivore: {
    detailedDescription:
      'A highly restrictive diet made up primarily—or entirely—of animal-based foods. It generally includes meat, fish, eggs, and some dairy, while excluding vegetables, fruit, grains, legumes, nuts, and other plant foods.',
    boldPhrases: ['animal-based foods', 'meat, fish, eggs, and some dairy'],
  },
  vegan: {
    detailedDescription:
      'A fully plant-based diet that excludes all animal-derived foods, including meat, fish, eggs, dairy, and often honey. Common foods include vegetables, fruit, grains, legumes, tofu, nuts, seeds, and plant-based alternatives.',
    boldPhrases: [
      'all animal-derived foods',
      'vegetables, fruit, grains, legumes, tofu, nuts, seeds, and plant-based alternatives',
    ],
  },
  vegetarian: {
    detailedDescription:
      'A plant-focused diet that excludes meat and fish but may include animal-derived foods such as eggs and dairy. Meals commonly feature vegetables, fruit, grains, beans, lentils, tofu, eggs, cheese, nuts, and seeds.',
    boldPhrases: ['meat and fish', 'eggs and dairy'],
  },
  pescatarian: {
    detailedDescription:
      'A mostly plant-based diet that excludes red meat and poultry but includes fish and seafood. It may also include eggs and dairy, with meals commonly built around vegetables, grains, legumes, salmon, shrimp, and other seafood.',
    boldPhrases: ['red meat and poultry', 'fish and seafood'],
  },
};
