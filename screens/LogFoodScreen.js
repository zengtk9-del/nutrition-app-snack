import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import foods, { CATEGORIES } from '../data/foods';
import { getFoodIconImage } from '../data/foodIconImages';
import {
  RED_MEAT_SUBCATEGORIES,
  RED_MEAT_CUTS,
  BEEF_FAT_TIERS,
  PORK_FAT_TIERS,
  TRIM_TIERS,
  BEEF_GRADE_FAT_RATIO,
} from '../data/meatHierarchy';
import { POULTRY_TYPES, POULTRY_CUTS, resolvePoultryFood } from '../data/poultryHierarchy';
import { SEAFOOD_SUBCATEGORIES, SEAFOOD_CUTS } from '../data/seafoodHierarchy';
import { FRUIT_FORMS, FRUIT_TYPES } from '../data/fruitHierarchy';
import { EGG_TYPES, EGG_FORMS, EGG_SIZE_GRADES, EGG_SIZE_GRAMS, resolveEggFood } from '../data/eggHierarchy';
import {
  DAIRY_TYPES,
  MILK_FAT_LEVELS,
  CHEESE_TYPES,
  CREAM_GROUPS,
  YOGURT_STYLES,
  YOGURT_FATS,
  YOGURT_FLAVORS,
  BUTTER_FORMS,
  BUTTER_SALTS,
} from '../data/dairyHierarchy';
import { VEGETABLE_TYPES } from '../data/vegetableHierarchy';
import { LEGUME_TYPES, LEGUME_FORMS, LEGUME_ITEMS } from '../data/legumeHierarchy';
import { NUT_SEED_TYPES, NUT_PREPS, NUT_SEED_ITEMS } from '../data/nutSeedHierarchy';
import { GRAIN_TYPES, GRAIN_FORMS, GRAIN_ITEMS } from '../data/grainHierarchy';
import { FAT_OIL_TYPES, FAT_LEVELS, FAT_OIL_ITEMS } from '../data/fatOilHierarchy';
import { filterFoods, filterByCategory } from '../utils/nutrition';
// rowIconKeyOf and the two category tables moved to utils/foodIcon.js in
// v0.0.57 so the Today tab and Favorites rows could use them too; the
// 96pt icon square itself is components/FoodIcon.js for the same reason.
import { SIMPLE_CATEGORIES, ITEM_CARD_CATEGORIES, rowIconKeyOf, iconKeyForFoodId } from '../utils/foodIcon';
import FoodIcon from '../components/FoodIcon';
import CountPortion, { useUnitPortion } from '../components/PortionStep';
import { getCategoryIcon } from '../data/categoryIcons';
import { cardKeyOf, representativeRow, cardTitleOf } from '../utils/foodCards';
import { commonnessRank } from '../data/foodCommonness';
import {
  gramsToOz,
  ozToGrams,
  estimateSizes,
  shellOnToEdibleGrams,
  edibleToShellOnGrams,
  boneInToEdibleGrams,
  edibleToBoneInGrams,
} from '../utils/units';

// The star button shared by WeightFoodRow and CountFoodCard below, for
// normal browsing (NOT the My Favorites tab -- see FavoriteListItem for
// that). As of the My Favorites overhaul, favoriting a food always saves a
// brand new snapshot (exact grams included) rather than toggling a single
// shared on/off flag -- a food can now have zero, one, or several saved
// favorite variants at once, so this button can no longer show "already
// favorited" state or offer to remove one (removal only happens from
// inside My Favorites itself, where each row IS one specific saved
// variant). Tapping this is instant, no confirmation needed -- adding a
// favorite is never destructive.
function FavoriteButton({ onAdd, foodName }) {
  return (
    <TouchableOpacity
      style={styles.favBtn}
      activeOpacity={0.6}
      onPress={onAdd}
      accessibilityRole="button"
      accessibilityLabel={`Add ${foodName} to favorites`}
    >
      <Text style={styles.favBtnText}>☆ Add to Favorites</Text>
    </TouchableOpacity>
  );
}

// A row for foods measured by weight (meat, vegetables, etc.) — lets the
// user type in how many grams they're actually eating, since a "serving"
// of these varies a lot more in real life than something like a banana.
//
// Grown a little taller than before (per Damon's request) to fit the new
// favorite-toggle button alongside "+ Add" — both now live in their own
// action row underneath the grams input instead of competing for the same
// cramped strip on the right edge of the card.
//
// `item.prep` (set on the Red Meat, Poultry, and Seafood pickers' curated
// entries — see data/foodsRedMeat.js, data/foodsPoultry.js, and
// data/foodsSeafood.js) shows as a small "Raw"/"Cooked" tag before the
// per-100g line, since a raw and cooked version of the same cut share the
// exact same name (e.g. two "Ground Beef" cards, or two "Salmon" cards)
// and would otherwise be impossible to tell apart on this screen.
function WeightFoodRow({ item, onAdd, onAddFavorite }) {
  const [grams, setGrams] = useState(String(item.typicalGrams || 100));

  const handleAdd = () => {
    const n = parseFloat(grams);
    if (!Number.isFinite(n) || n <= 0) return;
    onAdd(item, n);
  };

  const n = parseFloat(grams) || 0;
  const factor = n / 100;
  const previewCalories = Math.round(item.caloriesPer100g * factor);

  // Saves whatever grams is currently typed as a brand new favorite
  // snapshot -- see FavoriteButton's own comment for why this is always a
  // fresh save rather than a toggle. `cardType: 'weightRow'` tells
  // FavoriteListItem how to re-open this saved variant later.
  const handleAddToFavorites = () => {
    const gramsN = Number.isFinite(n) && n > 0 ? n : item.typicalGrams || 100;
    onAddFavorite({
      foodId: item.id,
      name: item.name,
      servingType: 'weight',
      caloriesPer100g: item.caloriesPer100g,
      proteinPer100g: item.proteinPer100g,
      carbsPer100g: item.carbsPer100g,
      fatPer100g: item.fatPer100g,
      grams: gramsN,
      settings: { cardType: 'weightRow', grams: gramsN },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Text style={styles.icon}>{item.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>
            {item.prep ? `${item.prep === 'raw' ? 'Raw' : 'Cooked'} · ` : ''}
            per 100g: {item.caloriesPer100g} kcal · P{item.proteinPer100g} C{item.carbsPer100g} F{item.fatPer100g}
          </Text>
          <View style={styles.gramsRow}>
            <TextInput
              style={styles.gramsInput}
              value={grams}
              onChangeText={setGrams}
              keyboardType="numeric"
              placeholder="grams"
            />
            <Text style={styles.gramsUnit}>g · {previewCalories} kcal</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardActionsRow}>
        <FavoriteButton onAdd={handleAddToFavorites} foodName={item.name} />
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.6} onPress={handleAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// The count-type food card (fixed-serving foods like a banana or an egg).
// Pulled out to its own component so both the normal flat list and the
// Red Meat picker's final "here are the matching foods" step can render a
// food exactly the same way, whichever kind it is.
function CountFoodCard({ item, onAdd, onAddFavorite }) {
  const handleAddToFavorites = () =>
    onAddFavorite({
      foodId: item.id,
      name: item.name,
      servingType: 'count',
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      servingLabel: item.servingLabel,
      settings: { cardType: 'countCard' },
    });

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Text style={styles.icon}>{item.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>
            {item.servingLabel} · {item.calories} kcal · P{item.protein} C{item.carbs} F{item.fat}
          </Text>
        </View>
      </View>
      <View style={styles.cardActionsRow}>
        <FavoriteButton onAdd={handleAddToFavorites} foodName={item.name} />
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.6} onPress={() => onAdd(item, 1)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// One tile in the category strip along the top of Log Food.
//
// These were plain text pills until v0.0.60. The artwork is a compact
// scene per category (a plate of fruit, a grill of red meat) and it needs
// real size to read -- at pill height it would have been a smudge -- so
// the strip grew into a row of small cards instead.
//
// The picture sits in its own white rounded square rather than directly on
// the tile. That is not decoration: the icons are opaque white JPEGs, so
// on the blue selected tile a bare image would show as a white rectangle.
// Framed, it reads as a card sitting on the selection colour.
//
// `glyph` covers All and My Favorites, which are filters rather than
// categories and have no artwork of their own.
function CategoryTile({ label, iconKey, glyph, active, onPress }) {
  const image = iconKey ? getCategoryIcon(iconKey) : null;
  return (
    <TouchableOpacity
      style={[styles.catTile, active && styles.catTileActive]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.catTileArt}>
        {image ? (
          <Image source={image} style={styles.catTileImage} resizeMode="contain" />
        ) : (
          <Text style={styles.catTileGlyph}>{glyph}</Text>
        )}
      </View>
      <Text numberOfLines={2} style={[styles.catTileText, active && styles.catTileTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// One tappable row in the Red Meat drill-down (a Type like "Beef", or a
// Cut like "Ribeye Steak") — same look either way, just a label and a
// chevron hinting there's another screen behind it.
function DrillDownRow({ label, onPress, iconKey }) {
  return (
    <TouchableOpacity style={styles.pickerRow} activeOpacity={0.6} onPress={onPress}>
      <FoodIcon iconKey={iconKey} />
      <Text style={[styles.pickerRowText, styles.pickerRowTextWithIcon]}>{label}</Text>
      <Text style={styles.pickerRowChevron}>›</Text>
    </TouchableOpacity>
  );
}

// The "‹ Back to X" row shown above whichever drill-down list is currently
// on screen — always the first row, via FlatList's ListHeaderComponent.
function BackRow({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.backRow} activeOpacity={0.6} onPress={onPress}>
      <Text style={styles.backRowText}>‹ {label}</Text>
    </TouchableOpacity>
  );
}

// A segmented control -- used for every toggle on the Poultry card (Skin
// on/skinless, Bone in/boneless, Raw/Cooked), the portion step's grams/oz
// switch, Beef's Fat % (4 options) and Fat Trim (3 options) toggles, Eggs'
// Prep (up to 5 options) and Size (5 options) toggles, and Milk's Fat %
// (4 options) toggle. Any number of side-by-side buttons sharing one pill
// shaped border, whichever one is active gets the blue fill -- every
// option except the last gets a right-hand divider line, so every row
// reads as cleanly separated as the original 2-option ones.
//
// `isWide` (options.length > 3) switches the track from its default
// content-sized/left-aligned layout to a full-width one where every
// option gets an equal `flex: 1` share of the card's width, with smaller
// text that's allowed to wrap onto a second line. Content-sized 2-3
// option rows (Skin, Bone, Prep, g/oz, Fat Trim, Lactose Free, ...) are
// unaffected and keep their original compact look. This fixes a real bug
// Damon reported: 4+ option rows (Eggs' 5-option Prep/Size, Milk's 4-
// option Fat %) used to size each button by its own fixed padding with no
// upper bound on the track's total width, so once there were enough
// options (or long enough labels, like Fat %'s "Reduced Fat (2%)") the
// track ran past the card's right edge and got clipped instead of
// staying inside the card -- see git history around v0.0.24 for the
// screenshots that caught this. Capping the track at the card's width and
// letting each option shrink to share it (wrapping its own text if
// needed) means a wide row can never run off the edge, no matter how many
// options or how long their labels are.
// `disabled` (new as of the My Favorites overhaul) grays every option out
// and stops taps from doing anything -- used for every toggle on a card
// opened from My Favorites that hasn't had "Edit" tapped yet, so the saved
// settings are clearly visible but can't be accidentally changed.
function ToggleRow({ label, options, value, onChange, disabled }) {
  const isWide = options.length > 3;
  return (
    <View style={styles.toggleGroup}>
      {label ? <Text style={styles.toggleLabel}>{label}</Text> : null}
      <View
        style={[
          styles.toggleTrack,
          isWide && styles.toggleTrackWide,
          disabled && styles.toggleTrackDisabled,
        ]}
      >
        {options.map((opt, i) => (
          <TouchableOpacity
            key={opt.value}
            disabled={disabled}
            style={[
              styles.toggleOption,
              isWide && styles.toggleOptionWide,
              value === opt.value && styles.toggleOptionActive,
              // Wide-mode options each get their own full border (see
              // toggleOptionWide's comment below) since they can wrap onto
              // more than one row -- the single-row "border on every option
              // except the last" scheme below only makes sense when there's
              // just one row to begin with.
              !isWide && (i < options.length - 1 ? styles.toggleOptionFirst : styles.toggleOptionLast),
            ]}
            activeOpacity={0.7}
            onPress={() => onChange(opt.value)}
          >
            <Text
              numberOfLines={isWide ? 2 : 1}
              style={[
                styles.toggleOptionText,
                isWide && styles.toggleOptionTextWide,
                value === opt.value && styles.toggleOptionTextActive,
                disabled && styles.toggleOptionTextDisabled,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// The bottom action row shared by every toggle card (Beef Ground/Steak,
// Poultry, Seafood) -- what shows depends on how this particular card
// instance was opened:
//   'browsing' -- the normal picker flow. "Add to My Favorites & Today"
//     always saves a BRAND NEW favorite snapshot (never overwrites an old
//     one -- that's what lets the same food be saved multiple times with
//     different settings, numbered 1/2/3... in My Favorites) plus logs
//     today's entry; "+ Add to Today" just logs it.
//   'locked' -- opened by tapping a favorite in My Favorites, Edit not
//     tapped yet. "Edit" unlocks every toggle above; "+ Add to Today" logs
//     today's entry using the saved snapshot exactly as saved.
//   'editing' -- Edit was tapped. "Save Changes" overwrites THIS SAME
//     favorite with whatever the toggles are now set to (no new numbered
//     entry created); "+ Add to Today" logs using the current, possibly
//     just-changed values.
function CardActionButtons({ mode, onEdit, onSaveChanges, onAddFavorite, onAddFood }) {
  if (mode === 'locked') {
    return (
      <View style={styles.cardActionsRow}>
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.6} onPress={onEdit}>
          <Text style={styles.editBtnText}>✎ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.6} onPress={onAddFood}>
          <Text style={styles.addBtnText}>+ Add to Today</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (mode === 'editing') {
    return (
      <View style={styles.cardActionsRow}>
        <TouchableOpacity style={styles.favAddBtn} activeOpacity={0.6} onPress={onSaveChanges}>
          <Text style={styles.favAddBtnText}>✓ Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.6} onPress={onAddFood}>
          <Text style={styles.addBtnText}>+ Add to Today</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.cardActionsRow}>
      <TouchableOpacity style={styles.favAddBtn} activeOpacity={0.6} onPress={onAddFavorite}>
        <Text style={styles.favAddBtnText}>☆ Add to My Favorites & Today</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addBtn} activeOpacity={0.6} onPress={onAddFood}>
        <Text style={styles.addBtnText}>+ Add to Today</Text>
      </TouchableOpacity>
    </View>
  );
}

// Real icon when one exists for this exact iconKey (data/foodIconImages.js),
// otherwise the original fixed-size placeholder standing in for the cartoon
// icon Damon described -- a dashed box with the icon's key spelled out in
// small text, so the reserved size and exactly which variation belongs here
// is obvious for every iconKey that doesn't have real artwork yet. Icons are
// being filled in gradually (cut by cut), so both cases have to keep working
// side by side indefinitely, not just during a transition.
function IconPlaceholder({ iconKey }) {
  const image = getFoodIconImage(iconKey);
  if (image) {
    return (
      <View style={styles.iconImageWrap}>
        <Image source={image} style={styles.iconImage} resizeMode="contain" />
      </View>
    );
  }
  return (
    <View style={styles.iconPlaceholder}>
      <Text style={styles.iconPlaceholderText}>{iconKey}</Text>
    </View>
  );
}

// The card shown after picking a Poultry Cut -- Damon's spec: an icon
// placeholder up top that changes with the toggles below it (skin on/off,
// bone in/boneless, raw/cooked -- only the ones that actually apply to this
// cut), then a portion step (grams/oz, or Small/Medium/Large estimates),
// then the two final actions.
//
// Bone in/boneless never changes which underlying food entry is used --
// see data/foodsPoultry.js's header comment for why (bone has 0 calories,
// so USDA doesn't track a nutritionally-different bone-in version of
// anything). It only changes `iconKey` below, i.e. which icon placeholder
// variant is shown.
//
// Skin and raw/cooked DO change the underlying entry, via
// resolvePoultryFood (data/poultryHierarchy.js) -- and since USDA doesn't
// have every combination for every cut (e.g. duck breast has no skin-on +
// raw entry), that resolver can land on a food whose actual skin/prep
// doesn't match what's toggled. `matchNote` surfaces that plainly rather
// than silently showing numbers that don't seem to match the toggles.
// `initialSettings` (when this card is opened from a saved favorite via
// FavoriteListItem) seeds every toggle/portion state from the exact saved
// values instead of the usual defaults. `favoriteId` + `locked` mark this
// card as "hosting a favorite" -- when set, the card starts fully
// view-only (every toggle grayed out and non-interactive) with an "Edit"
// button instead of the normal two action buttons; tapping Edit unlocks
// everything and swaps in "Save Changes", which overwrites this same
// favorite (via onSaveFavoriteEdit) rather than creating a new one. When
// favoriteId/locked aren't set (the normal picker flow), this card behaves
// exactly as before.
function PoultryCard({
  type,
  typeLabel,
  cut,
  cutMeta,
  cutLabel,
  poultryFoods,
  initialSettings,
  favoriteId,
  locked,
  onAddFavorite,
  onSaveFavoriteEdit,
  onAdd,
}) {
  const cutFoods = poultryFoods.filter((f) => f.subcategory === type && f.cut === cut);
  const availablePreps = new Set(cutFoods.map((f) => f.prep));
  const hasPrepToggle = availablePreps.has('raw') && availablePreps.has('cooked');
  const defaultPrep = availablePreps.has('raw') ? 'raw' : 'cooked';

  const [skin, setSkin] = useState(cutMeta.hasSkinToggle ? initialSettings?.skin || 'on' : null);
  const [bone, setBone] = useState(initialSettings?.bone || 'in');
  const [prep, setPrep] = useState(initialSettings?.prep || defaultPrep);
  const [isLocked, setIsLocked] = useState(!!locked);

  const [portionMode, setPortionMode] = useState(initialSettings?.portionMode || 'weight'); // 'weight' | 'size'
  const [weightUnit, setWeightUnit] = useState(initialSettings?.weightUnit || 'g'); // 'g' | 'oz'
  const resolvedFood = resolvePoultryFood(poultryFoods, type, cut, skin, prep) || cutFoods[0];

  // boneYieldPercent (data/poultryHierarchy.js) is only set for Chicken/
  // Turkey's breast/thigh/drumstick/wing/leg/whole cuts so far -- see that
  // file's header comment for the sourced numbers and why Duck/Other Birds/
  // "Other Cuts" don't have one yet. When it's missing, the Bone toggle
  // stays exactly as it always has been: display-only.
  const boneYieldPercent = cutMeta.hasBoneToggle ? cutMeta.boneYieldPercent : null;
  const boneDataMissing = cutMeta.hasBoneToggle && !boneYieldPercent;

  // Same "show numbers in what-you'd-actually-weigh terms" logic as
  // SeafoodCard's displayTypicalGrams -- bone-in-equivalent grams when Bone
  // In is selected and a real yield percent exists, otherwise the plain
  // edible-basis typicalGrams (which is also all that's possible when
  // boneYieldPercent is missing).
  const displayTypicalGrams =
    bone === 'in' && boneYieldPercent
      ? Math.round(edibleToBoneInGrams(resolvedFood.typicalGrams, boneYieldPercent))
      : resolvedFood.typicalGrams;
  const [weightValue, setWeightValue] = useState(String(initialSettings?.weightValue ?? displayTypicalGrams));
  const [sizeChoice, setSizeChoice] = useState(initialSettings?.sizeChoice || 'medium');

  const matchNote =
    (cutMeta.hasSkinToggle && resolvedFood.skin !== skin) || resolvedFood.prep !== prep
      ? `No exact USDA data for that combination -- showing the closest match: ${
          resolvedFood.skin === 'on' ? 'skin on' : resolvedFood.skin === 'off' ? 'skinless' : 'skin N/A'
        }, ${resolvedFood.prep === 'raw' ? 'raw' : 'cooked'}.`
      : null;

  const iconKeyParts = [type, cut];
  if (cutMeta.hasSkinToggle) iconKeyParts.push(skin === 'on' ? 'skinOn' : 'skinless');
  if (cutMeta.hasBoneToggle) iconKeyParts.push(bone === 'in' ? 'boneIn' : 'boneless');
  iconKeyParts.push(prep);
  const iconKey = iconKeyParts.join('_');

  const sizes = estimateSizes(displayTypicalGrams);
  const enteredGrams =
    portionMode === 'size'
      ? sizes[sizeChoice]
      : weightUnit === 'g'
        ? parseFloat(weightValue) || 0
        : ozToGrams(parseFloat(weightValue) || 0);
  // The actual weight the calorie math should run against. Only converts
  // when Bone In is selected AND a real boneYieldPercent exists -- if it's
  // missing (Duck/Other Birds/"Other Cuts"), enteredGrams is used as-is,
  // same cosmetic-only behavior as before, but now that's a documented
  // fallback rather than the only behavior the toggle ever had.
  const grams = bone === 'in' && boneYieldPercent ? boneInToEdibleGrams(enteredGrams, boneYieldPercent) : enteredGrams;

  const previewCalories = Math.round((resolvedFood.caloriesPer100g * grams) / 100);

  const boneNote =
    bone === 'in' && boneYieldPercent && enteredGrams > 0
      ? `${Math.round(enteredGrams)}g bone-in = ${Math.round(grams)}g edible meat`
      : null;

  const handleWeightUnitChange = (nextUnit) => {
    // Convert whatever's currently typed so the number on screen keeps
    // meaning the same real-world amount when switching g <-> oz, instead
    // of jumping to some unrelated number.
    const n = parseFloat(weightValue);
    if (Number.isFinite(n)) {
      const converted = nextUnit === 'oz' ? gramsToOz(n) : ozToGrams(n);
      setWeightValue(String(Math.round(converted * 10) / 10));
    }
    setWeightUnit(nextUnit);
  };

  // Same pattern as SeafoodCard's handleShellChange -- convert what's typed
  // rather than silently resetting it, so flipping Bone In/Boneless keeps
  // describing the same real amount of chicken/turkey, just in bone-in vs.
  // edible-only terms. Only converts when a real boneYieldPercent exists;
  // otherwise this is just setBone, same as before.
  const handleBoneChange = (nextBone) => {
    if (boneYieldPercent) {
      const n = parseFloat(weightValue);
      if (Number.isFinite(n)) {
        const converted = nextBone === 'in' ? n / boneYieldPercent : n * boneYieldPercent;
        setWeightValue(String(Math.round(converted * 10) / 10));
      }
    }
    setBone(nextBone);
  };

  const handleAddFood = () => {
    if (grams <= 0) return;
    onAdd(resolvedFood, grams);
  };

  // Everything needed to fully re-open this exact card later from My
  // Favorites -- see the header comment above for why `settings` carries
  // its own cardType/type/cut/cutLabel/cutMeta rather than making
  // FavoriteListItem re-derive them from data/poultryHierarchy.js.
  const buildFavoriteData = () => ({
    foodId: resolvedFood.id,
    name: `${typeLabel} ${cutLabel}`,
    servingType: 'weight',
    caloriesPer100g: resolvedFood.caloriesPer100g,
    proteinPer100g: resolvedFood.proteinPer100g,
    carbsPer100g: resolvedFood.carbsPer100g,
    fatPer100g: resolvedFood.fatPer100g,
    grams,
    settings: {
      cardType: 'poultryCard',
      type,
      typeLabel,
      cut,
      cutLabel,
      cutMeta,
      skin,
      bone,
      prep,
      portionMode,
      weightUnit,
      weightValue,
      sizeChoice,
      grams,
    },
  });

  const handleFavoriteAndAdd = () => {
    onAddFavorite(buildFavoriteData());
    handleAddFood();
  };

  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favoriteId, buildFavoriteData());
    if (saved) setIsLocked(true);
  };

  const mode = favoriteId ? (isLocked ? 'locked' : 'editing') : 'browsing';

  return (
    <View style={styles.poultryCard}>
      <Text style={styles.poultryCardTitle}>
        {typeLabel} {cutLabel}
      </Text>

      <IconPlaceholder iconKey={iconKey} />

      {cutMeta.hasSkinToggle ? (
        <ToggleRow
          label="Skin"
          value={skin}
          onChange={setSkin}
          disabled={isLocked}
          options={[
            { value: 'on', label: 'Skin On' },
            { value: 'off', label: 'Skinless' },
          ]}
        />
      ) : null}
      {cutMeta.hasBoneToggle ? (
        <ToggleRow
          label="Bone"
          value={bone}
          onChange={handleBoneChange}
          disabled={isLocked}
          options={[
            { value: 'in', label: 'Bone In' },
            { value: 'boneless', label: 'Boneless' },
          ]}
        />
      ) : null}
      {boneDataMissing ? (
        <Text style={styles.matchNote}>
          We don't have sourced bone-weight data for {typeLabel} yet, so this toggle doesn't adjust the weight/
          calories below -- whatever amount you enter is counted as-is. (Chicken and Turkey's main cuts do have this
          fix already.)
        </Text>
      ) : null}
      {hasPrepToggle ? (
        <ToggleRow
          label="Prep"
          value={prep}
          onChange={setPrep}
          disabled={isLocked}
          options={[
            { value: 'raw', label: 'Raw' },
            { value: 'cooked', label: 'Cooked' },
          ]}
        />
      ) : null}

      {matchNote ? <Text style={styles.matchNote}>{matchNote}</Text> : null}

      <Text style={styles.poultryPer100g}>
        per 100g edible: {resolvedFood.caloriesPer100g} kcal · P{resolvedFood.proteinPer100g} C
        {resolvedFood.carbsPer100g} F{resolvedFood.fatPer100g}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.poultrySectionTitle}>Portion</Text>
      <ToggleRow
        value={portionMode}
        onChange={setPortionMode}
        disabled={isLocked}
        options={[
          { value: 'weight', label: 'Enter Weight' },
          { value: 'size', label: 'Small / Medium / Large' },
        ]}
      />

      {portionMode === 'weight' ? (
        <View style={styles.gramsRow}>
          <TextInput
            style={[styles.gramsInput, isLocked && styles.gramsInputDisabled]}
            value={weightValue}
            onChangeText={setWeightValue}
            keyboardType="numeric"
            placeholder={weightUnit}
            editable={!isLocked}
          />
          <ToggleRow
            value={weightUnit}
            onChange={handleWeightUnitChange}
            disabled={isLocked}
            options={[
              { value: 'g', label: 'g' },
              { value: 'oz', label: 'oz' },
            ]}
          />
        </View>
      ) : (
        <View>
          <View style={styles.sizeRow}>
            {['small', 'medium', 'large'].map((s) => (
              <TouchableOpacity
                key={s}
                disabled={isLocked}
                style={[styles.sizeOption, sizeChoice === s && styles.sizeOptionActive, isLocked && styles.sizeOptionDisabled]}
                activeOpacity={0.7}
                onPress={() => setSizeChoice(s)}
              >
                <Text style={[styles.sizeOptionLabel, sizeChoice === s && styles.sizeOptionLabelActive]}>
                  {s === 'small' ? 'Small' : s === 'medium' ? 'Medium' : 'Large'}
                </Text>
                <Text style={[styles.sizeOptionGrams, sizeChoice === s && styles.sizeOptionLabelActive]}>
                  ~{sizes[s]}g
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sizeEstimateNote}>
            Estimated -- USDA doesn't grade meat cuts by size the way it does eggs. Medium is this food's typical
            serving weight; Small/Large are +/-30% around it.
          </Text>
        </View>
      )}

      {boneNote ? <Text style={styles.matchNote}>{boneNote}</Text> : null}

      <Text style={styles.gramsUnit}>{grams > 0 ? `${previewCalories} kcal` : 'Enter an amount above'}</Text>

      <CardActionButtons
        mode={mode}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFavorite={handleFavoriteAndAdd}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// The card shown after picking a Seafood species -- same toggle-card style
// as Poultry above (and reuses PoultryCard's styles.poultryCard/
// poultryCardTitle/poultryPer100g/poultrySectionTitle -- named after
// Poultry since it was built first, but the look is shared across both
// pickers rather than duplicated).
//
// Unlike Poultry, Seafood never has a missing-combination problem -- every
// species in data/foodsSeafood.js that has both a raw and a cooked entry
// has both, cleanly -- so there's no fallback resolver or matchNote like
// PoultryCard's needed here; resolvedFood is just a plain lookup.
//
// Shell On/Off (only shown when seafoodHierarchy.js's SEAFOOD_CUTS flags
// this species hasShellToggle) is a different kind of toggle than Poultry's
// skin/bone ones -- it doesn't switch to a different underlying food entry,
// it converts the WEIGHT typed in. USDA only ever measures the edible meat
// (shell has 0 calories, same reason a nutrition label never counts bone),
// so there's no "with shell" nutrition data to switch to. Instead, with
// Shell On selected, whatever's typed is treated as "shell and meat
// together" and converted down to edible grams (shellOnToEdibleGrams,
// utils/units.js) before the normal calorie math runs -- and the portion
// step's own numbers (the pre-filled default, and the Small/Medium/Large
// estimates) flip to shell-on-equivalent terms too (edibleToShellOnGrams),
// so what's on screen always matches what you'd actually see on a kitchen
// scale. shellNote spells the conversion out in plain numbers underneath
// the portion step -- a stated fact, not a hedge or a disclaimer.
// `initialSettings`/`favoriteId`/`locked`/`onAddFavorite`/`onSaveFavoriteEdit`
// -- same "hosting a saved favorite" mechanism as PoultryCard above; see
// its header comment for the full explanation.
function SeafoodCard({
  type,
  typeLabel,
  cut,
  cutMeta,
  cutLabel,
  seafoodFoods,
  initialSettings,
  favoriteId,
  locked,
  onAddFavorite,
  onSaveFavoriteEdit,
  onAdd,
}) {
  const cutFoods = seafoodFoods.filter((f) => f.subcategory === type && f.cut === cut);
  const availablePreps = new Set(cutFoods.map((f) => f.prep));
  const hasPrepToggle = availablePreps.has('raw') && availablePreps.has('cooked');
  const defaultPrep = availablePreps.has('raw') ? 'raw' : 'cooked';

  const [prep, setPrep] = useState(initialSettings?.prep || defaultPrep);
  const [shell, setShell] = useState(initialSettings?.shell || 'off');
  const [isLocked, setIsLocked] = useState(!!locked);

  const [portionMode, setPortionMode] = useState(initialSettings?.portionMode || 'weight'); // 'weight' | 'size'
  const [weightUnit, setWeightUnit] = useState(initialSettings?.weightUnit || 'g'); // 'g' | 'oz'

  const resolvedFood = cutFoods.find((f) => f.prep === prep) || cutFoods[0];
  const yieldPercent = cutMeta.hasShellToggle ? cutMeta.shellYieldPercent : null;

  // The portion step always shows numbers in "what you'd actually weigh"
  // terms -- edible grams when Shell Off (or the species has no shell
  // toggle at all), shell-on grams when Shell On -- so this moves with the
  // toggle rather than always showing the smaller edible-only figure.
  const displayTypicalGrams =
    shell === 'on' && yieldPercent
      ? Math.round(edibleToShellOnGrams(resolvedFood.typicalGrams, yieldPercent))
      : resolvedFood.typicalGrams;
  const [weightValue, setWeightValue] = useState(String(initialSettings?.weightValue ?? displayTypicalGrams));
  const [sizeChoice, setSizeChoice] = useState(initialSettings?.sizeChoice || 'medium');

  const iconKeyParts = [type, cut];
  if (cutMeta.hasShellToggle) iconKeyParts.push(shell === 'on' ? 'shellOn' : 'shellOff');
  iconKeyParts.push(prep);
  const iconKey = iconKeyParts.join('_');

  const sizes = estimateSizes(displayTypicalGrams);
  const enteredGrams =
    portionMode === 'size'
      ? sizes[sizeChoice]
      : weightUnit === 'g'
        ? parseFloat(weightValue) || 0
        : ozToGrams(parseFloat(weightValue) || 0);
  const edibleGrams = shell === 'on' ? shellOnToEdibleGrams(enteredGrams, yieldPercent) : enteredGrams;

  const previewCalories = Math.round((resolvedFood.caloriesPer100g * edibleGrams) / 100);

  const shellNote =
    shell === 'on' && yieldPercent && enteredGrams > 0
      ? `${Math.round(enteredGrams)}g with shell = ${Math.round(edibleGrams)}g edible meat`
      : null;

  const handleWeightUnitChange = (nextUnit) => {
    // Same reasoning as PoultryCard's version of this -- convert what's
    // currently typed so the number keeps meaning the same real-world
    // amount when switching g <-> oz, instead of jumping to some unrelated
    // number.
    const n = parseFloat(weightValue);
    if (Number.isFinite(n)) {
      const converted = nextUnit === 'oz' ? gramsToOz(n) : ozToGrams(n);
      setWeightValue(String(Math.round(converted * 10) / 10));
    }
    setWeightUnit(nextUnit);
  };

  // Same pattern as handleWeightUnitChange above, but for the Shell
  // toggle -- convert what's typed rather than silently resetting it, so
  // flipping the toggle keeps describing the same real amount of shrimp/
  // crab/etc., just in shell-on vs. edible-only terms.
  const handleShellChange = (nextShell) => {
    if (yieldPercent) {
      const n = parseFloat(weightValue);
      if (Number.isFinite(n)) {
        const converted = nextShell === 'on' ? n / yieldPercent : n * yieldPercent;
        setWeightValue(String(Math.round(converted * 10) / 10));
      }
    }
    setShell(nextShell);
  };

  const handleAddFood = () => {
    if (edibleGrams <= 0) return;
    onAdd(resolvedFood, edibleGrams);
  };

  const buildFavoriteData = () => ({
    foodId: resolvedFood.id,
    name: `${typeLabel} ${cutLabel}`,
    servingType: 'weight',
    caloriesPer100g: resolvedFood.caloriesPer100g,
    proteinPer100g: resolvedFood.proteinPer100g,
    carbsPer100g: resolvedFood.carbsPer100g,
    fatPer100g: resolvedFood.fatPer100g,
    grams: edibleGrams,
    settings: {
      cardType: 'seafoodCard',
      type,
      typeLabel,
      cut,
      cutLabel,
      cutMeta,
      prep,
      shell,
      portionMode,
      weightUnit,
      weightValue,
      sizeChoice,
      grams: edibleGrams,
    },
  });

  const handleFavoriteAndAdd = () => {
    onAddFavorite(buildFavoriteData());
    handleAddFood();
  };

  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favoriteId, buildFavoriteData());
    if (saved) setIsLocked(true);
  };

  const mode = favoriteId ? (isLocked ? 'locked' : 'editing') : 'browsing';

  return (
    <View style={styles.poultryCard}>
      <Text style={styles.poultryCardTitle}>
        {typeLabel} {cutLabel}
      </Text>

      <IconPlaceholder iconKey={iconKey} />

      {cutMeta.hasShellToggle ? (
        <ToggleRow
          label="Shell"
          value={shell}
          onChange={handleShellChange}
          disabled={isLocked}
          options={[
            { value: 'on', label: 'Shell On' },
            { value: 'off', label: 'Shell Off' },
          ]}
        />
      ) : null}
      {hasPrepToggle ? (
        <ToggleRow
          label="Prep"
          value={prep}
          onChange={setPrep}
          disabled={isLocked}
          options={[
            { value: 'raw', label: 'Raw' },
            { value: 'cooked', label: 'Cooked' },
          ]}
        />
      ) : null}

      <Text style={styles.poultryPer100g}>
        per 100g edible: {resolvedFood.caloriesPer100g} kcal · P{resolvedFood.proteinPer100g} C
        {resolvedFood.carbsPer100g} F{resolvedFood.fatPer100g}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.poultrySectionTitle}>Portion</Text>
      <ToggleRow
        value={portionMode}
        onChange={setPortionMode}
        disabled={isLocked}
        options={[
          { value: 'weight', label: 'Enter Weight' },
          { value: 'size', label: 'Small / Medium / Large' },
        ]}
      />

      {portionMode === 'weight' ? (
        <View style={styles.gramsRow}>
          <TextInput
            style={[styles.gramsInput, isLocked && styles.gramsInputDisabled]}
            value={weightValue}
            onChangeText={setWeightValue}
            keyboardType="numeric"
            placeholder={weightUnit}
            editable={!isLocked}
          />
          <ToggleRow
            value={weightUnit}
            onChange={handleWeightUnitChange}
            disabled={isLocked}
            options={[
              { value: 'g', label: 'g' },
              { value: 'oz', label: 'oz' },
            ]}
          />
        </View>
      ) : (
        <View>
          <View style={styles.sizeRow}>
            {['small', 'medium', 'large'].map((s) => (
              <TouchableOpacity
                key={s}
                disabled={isLocked}
                style={[styles.sizeOption, sizeChoice === s && styles.sizeOptionActive, isLocked && styles.sizeOptionDisabled]}
                activeOpacity={0.7}
                onPress={() => setSizeChoice(s)}
              >
                <Text style={[styles.sizeOptionLabel, sizeChoice === s && styles.sizeOptionLabelActive]}>
                  {s === 'small' ? 'Small' : s === 'medium' ? 'Medium' : 'Large'}
                </Text>
                <Text style={[styles.sizeOptionGrams, sizeChoice === s && styles.sizeOptionLabelActive]}>
                  ~{sizes[s]}g
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sizeEstimateNote}>
            Estimated -- USDA doesn't grade seafood by size the way it does eggs. Medium is this food's typical
            serving weight; Small/Large are +/-30% around it.
          </Text>
        </View>
      )}

      {shellNote ? <Text style={styles.matchNote}>{shellNote}</Text> : null}

      <Text style={styles.gramsUnit}>{edibleGrams > 0 ? `${previewCalories} kcal` : 'Enter an amount above'}</Text>

      <CardActionButtons
        mode={mode}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFavorite={handleFavoriteAndAdd}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// Cooking-method labels for EggCard's Prep toggle -- a plain lookup rather
// than a per-bird/per-form list in eggHierarchy.js, since which preps are
// actually available just falls out of whatever's really in
// data/foodsEggs.js for that (birdType, form) (see availablePreps below),
// the same way PoultryCard derives hasPrepToggle from what's actually in
// data/foodsPoultry.js rather than a separate flag.
const EGG_PREP_LABELS = {
  raw: 'Raw',
  hard_boiled: 'Hard-Boiled',
  fried: 'Fried',
  scrambled: 'Scrambled',
  poached: 'Poached',
  cooked: 'Cooked',
  // Added for Quail Egg, Canned (data/foodsEggs.js) as part of the Dairy
  // round -- this row started out miscategorized under the old flat
  // `dairy` category (a gap left over from the Eggs round) and got moved
  // into the real Eggs hierarchy here, alongside Duck/Goose's newly-added
  // Cooked rows -- see data/foodsEggs.js's header comment.
  canned: 'Canned',
};

// The card shown after picking a Bird Type + Form (Whole Egg/Egg White
// Only/Egg Yolk Only) in the Eggs picker -- same toggle-card family as
// PoultryCard/SeafoodCard above, but shaped differently at the portion
// step: eggs are bought and eaten by COUNT and GRADE ("2 large eggs"), not
// weighed on a kitchen scale, so instead of PoultryCard's Enter Weight/
// Small-Medium-Large-estimate portion step, this card has a Size toggle
// (Small/Medium/Large/Extra Large/Jumbo, REAL USDA-standard edible weights
// -- see data/eggHierarchy.js's EGG_SIZE_GRAMS -- not a +/-30% estimate the
// way meat/seafood's size boxes are, since eggs actually have standardized
// grades) plus a simple "how many" quantity field. The two multiply
// together into a real gram amount that flows through the exact same
// per-100g calorie math (and the same onAdd(food, grams) call) every other
// weight-type card here uses -- eggs just arrive at that gram number via
// grade x count instead of a typed/estimated weight.
//
// Prep works the same as PoultryCard's (a toggle switching to a genuinely
// different underlying food row -- Raw vs. Hard-Boiled vs. Fried, etc. are
// real, differently-measured USDA entries, not a weight conversion), just
// with as many options as that (birdType, form) actually has real data for
// (1 for Duck/Goose/Quail/Turkey -- no toggle shown at all -- up to 5 for
// Chicken Whole Egg) instead of always being Raw/Cooked.
//
// `initialSettings`/`favoriteId`/`locked`/`onAddFavorite`/`onSaveFavoriteEdit`
// -- same "hosting a saved favorite" mechanism as PoultryCard above; see
// its header comment for the full explanation.
function EggCard({
  birdType,
  birdTypeLabel,
  form,
  formMeta,
  formLabel,
  eggFoods,
  initialSettings,
  favoriteId,
  locked,
  onAddFavorite,
  onSaveFavoriteEdit,
  onAdd,
}) {
  const formFoods = eggFoods.filter((f) => f.subcategory === birdType && f.form === form);
  const availablePreps = [...new Set(formFoods.map((f) => f.prep))];
  const hasPrepToggle = availablePreps.length > 1;
  const defaultPrep = availablePreps.includes('raw') ? 'raw' : availablePreps[0];

  const [prep, setPrep] = useState(initialSettings?.prep || defaultPrep);
  const [isLocked, setIsLocked] = useState(!!locked);

  const resolvedFood = resolveEggFood(eggFoods, birdType, form, prep) || formFoods[0];

  // Size only applies where EGG_FORMS flags it (Chicken's 3 forms) -- see
  // eggHierarchy.js's header comment for why Duck/Goose/Quail/Turkey don't
  // get one. Defaults to Large, the most common carton grade.
  const [size, setSize] = useState(formMeta.hasSizeToggle ? initialSettings?.size || 'large' : null);
  const [quantity, setQuantity] = useState(String(initialSettings?.quantity ?? 1));

  const sizeGramsPerEgg = formMeta.hasSizeToggle && size ? EGG_SIZE_GRAMS[form][size] : resolvedFood.typicalGrams;
  const qty = parseInt(quantity, 10) || 0;
  const grams = sizeGramsPerEgg * qty;

  const previewCalories = Math.round((resolvedFood.caloriesPer100g * grams) / 100);

  // Size is NOT in the icon key: a small egg and a jumbo egg are the same
  // drawing, only scaled, and at 96px in a list row nothing distinguishes
  // them. Same rule margarine's fat level got in v0.0.41 -- an axis reaches
  // the key only if it changes the picture. Dropping it takes Eggs from 57
  // icon slots to 21.
  const iconKeyParts = [birdType, form, prep];
  const iconKey = iconKeyParts.join('_');

  const handleAddFood = () => {
    if (grams <= 0) return;
    onAdd(resolvedFood, grams);
  };

  const buildFavoriteData = () => ({
    foodId: resolvedFood.id,
    name: `${birdTypeLabel} ${formLabel}`,
    servingType: 'weight',
    caloriesPer100g: resolvedFood.caloriesPer100g,
    proteinPer100g: resolvedFood.proteinPer100g,
    carbsPer100g: resolvedFood.carbsPer100g,
    fatPer100g: resolvedFood.fatPer100g,
    grams,
    settings: {
      cardType: 'eggCard',
      birdType,
      birdTypeLabel,
      form,
      formMeta,
      formLabel,
      prep,
      size,
      quantity,
      grams,
    },
  });

  const handleFavoriteAndAdd = () => {
    onAddFavorite(buildFavoriteData());
    handleAddFood();
  };

  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favoriteId, buildFavoriteData());
    if (saved) setIsLocked(true);
  };

  const mode = favoriteId ? (isLocked ? 'locked' : 'editing') : 'browsing';

  return (
    <View style={styles.poultryCard}>
      <Text style={styles.poultryCardTitle}>
        {birdTypeLabel} {formLabel}
      </Text>

      <IconPlaceholder iconKey={iconKey} />

      {hasPrepToggle ? (
        <ToggleRow
          label="Prep"
          value={prep}
          onChange={setPrep}
          disabled={isLocked}
          options={availablePreps.map((p) => ({ value: p, label: EGG_PREP_LABELS[p] || p }))}
        />
      ) : null}

      {formMeta.hasSizeToggle ? (
        <ToggleRow
          label="Size"
          value={size}
          onChange={setSize}
          disabled={isLocked}
          options={EGG_SIZE_GRADES.map((g) => ({ value: g.key, label: g.label }))}
        />
      ) : (
        <Text style={styles.matchNote}>
          {birdTypeLabel} doesn't have real USDA size-grade data the way Chicken does, so this uses one typical
          weight ({resolvedFood.typicalGrams}g) instead of a Small/Medium/Large/XL/Jumbo choice.
        </Text>
      )}
      {formMeta.hasSizeToggle && size ? (
        <Text style={styles.matchNote}>
          {EGG_SIZE_GRADES.find((g) => g.key === size)?.label} = {sizeGramsPerEgg}g each (edible, out of the shell)
        </Text>
      ) : null}

      <Text style={styles.poultryPer100g}>
        per 100g edible: {resolvedFood.caloriesPer100g} kcal · P{resolvedFood.proteinPer100g} C
        {resolvedFood.carbsPer100g} F{resolvedFood.fatPer100g}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.poultrySectionTitle}>How Many?</Text>
      <View style={styles.gramsRow}>
        <TextInput
          style={[styles.gramsInput, isLocked && styles.gramsInputDisabled]}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="1"
          editable={!isLocked}
        />
        <Text style={styles.poultryPer100g}>egg{qty === 1 ? '' : 's'} ({grams}g total)</Text>
      </View>

      <Text style={styles.gramsUnit}>{grams > 0 ? `${previewCalories} kcal` : 'Enter a quantity above'}</Text>

      <CardActionButtons
        mode={mode}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFavorite={handleFavoriteAndAdd}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// The card shown after tapping "Milk" in the Dairy > Milk picker --
// Damon's "condense cow milk into one category" call: instead of every
// fat-percentage/lactose-status variant being its own separate row in the
// Milk list (would be 8 nearly-identical "Milk, ..." rows to scan through
// once Lactose Free existed for every fat level, or 4 before that), all
// cow milk condenses into this ONE row, with two toggles picking which of
// the 8 real underlying USDA entries (data/foodsDairy.js's
// `milkFatLevel`/`lactoseFree` tagged rows) to use -- same "toggle picks a
// different real row" pattern as PoultryCard's skin toggle or
// GroundMeatCard's Fat % toggle below, not a runtime weight/formula
// conversion like Seafood's shell toggle. All 8 (fat level x lactose
// status) combinations have real USDA data, so there's no fallback/
// matchNote needed here the way PoultryCard's rarer birds need one.
//
// Buttermilk/Kefir/Goat Milk/Condensed Milk are NOT part of this card --
// they stay their own separate rows in the Milk list, since they aren't
// "regular cow milk at some fat %," they're each their own distinct
// product (see data/foodsDairy.js's Milk section header comment).
//
// Portion is a plain weight entry (g/oz), same idea as PoultryCard/
// SeafoodCard's "Enter Weight" mode, defaulting to the resolved food's
// typicalGrams (~244g, about 1 cup) -- no Small/Medium/Large estimate mode
// like meat/seafood get, since milk isn't sold or measured in size-graded
// portions the way a cut of meat or a whole egg is.
// `initialSettings`/`favoriteId`/`locked`/`onAddFavorite`/`onSaveFavoriteEdit`
// -- same "hosting a saved favorite" mechanism as PoultryCard above; see
// its header comment for the full explanation.
function MilkCard({ milkFoods, initialSettings, favoriteId, locked, onAddFavorite, onSaveFavoriteEdit, onAdd }) {
  const [fatLevel, setFatLevel] = useState(initialSettings?.fatLevel || 'whole');
  const [lactoseFree, setLactoseFree] = useState(initialSettings?.lactoseFree ?? false);
  const [isLocked, setIsLocked] = useState(!!locked);

  const resolvedFood =
    milkFoods.find((f) => f.milkFatLevel === fatLevel && !!f.lactoseFree === lactoseFree) || milkFoods[0];

  const [weightUnit, setWeightUnit] = useState(initialSettings?.weightUnit || 'g');
  const [weightValue, setWeightValue] = useState(String(initialSettings?.weightValue ?? resolvedFood.typicalGrams));

  // Lactose-free milk looks exactly like the milk it is made from, so the
  // lactose toggle stays out of the key -- 8 slots down to 4.
  const iconKey = `milk_${fatLevel}`;

  const grams = weightUnit === 'g' ? parseFloat(weightValue) || 0 : ozToGrams(parseFloat(weightValue) || 0);
  const previewCalories = Math.round((resolvedFood.caloriesPer100g * grams) / 100);

  const handleWeightUnitChange = (nextUnit) => {
    // Same reasoning as PoultryCard/SeafoodCard's version of this --
    // convert what's currently typed so the number keeps meaning the same
    // real-world amount when switching g <-> oz, instead of jumping to
    // some unrelated number.
    const n = parseFloat(weightValue);
    if (Number.isFinite(n)) {
      const converted = nextUnit === 'oz' ? gramsToOz(n) : ozToGrams(n);
      setWeightValue(String(Math.round(converted * 10) / 10));
    }
    setWeightUnit(nextUnit);
  };

  const handleAddFood = () => {
    if (grams <= 0) return;
    onAdd(resolvedFood, grams);
  };

  // Everything needed to fully re-open this exact card later from My
  // Favorites -- same mechanism as PoultryCard's buildFavoriteData above;
  // see its header comment for the full explanation.
  const buildFavoriteData = () => ({
    foodId: resolvedFood.id,
    name: 'Milk',
    servingType: 'weight',
    caloriesPer100g: resolvedFood.caloriesPer100g,
    proteinPer100g: resolvedFood.proteinPer100g,
    carbsPer100g: resolvedFood.carbsPer100g,
    fatPer100g: resolvedFood.fatPer100g,
    grams,
    settings: {
      cardType: 'milkCard',
      fatLevel,
      lactoseFree,
      weightUnit,
      weightValue,
      grams,
    },
  });

  const handleFavoriteAndAdd = () => {
    onAddFavorite(buildFavoriteData());
    handleAddFood();
  };

  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favoriteId, buildFavoriteData());
    if (saved) setIsLocked(true);
  };

  const mode = favoriteId ? (isLocked ? 'locked' : 'editing') : 'browsing';

  return (
    <View style={styles.poultryCard}>
      <Text style={styles.poultryCardTitle}>Milk</Text>

      <IconPlaceholder iconKey={iconKey} />

      <ToggleRow
        label="Fat %"
        value={fatLevel}
        onChange={setFatLevel}
        disabled={isLocked}
        options={MILK_FAT_LEVELS.map((l) => ({ value: l.key, label: l.label }))}
      />
      <ToggleRow
        label="Lactose Free"
        value={lactoseFree ? 'on' : 'off'}
        onChange={(v) => setLactoseFree(v === 'on')}
        disabled={isLocked}
        options={[
          { value: 'off', label: 'Off' },
          { value: 'on', label: 'On' },
        ]}
      />

      <Text style={styles.poultryPer100g}>
        per 100g: {resolvedFood.caloriesPer100g} kcal · P{resolvedFood.proteinPer100g} C{resolvedFood.carbsPer100g} F
        {resolvedFood.fatPer100g}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.poultrySectionTitle}>Portion</Text>
      <View style={styles.gramsRow}>
        <TextInput
          style={[styles.gramsInput, isLocked && styles.gramsInputDisabled]}
          value={weightValue}
          onChangeText={setWeightValue}
          keyboardType="numeric"
          placeholder={weightUnit}
          editable={!isLocked}
        />
        <ToggleRow
          value={weightUnit}
          onChange={handleWeightUnitChange}
          disabled={isLocked}
          options={[
            { value: 'g', label: 'g' },
            { value: 'oz', label: 'oz' },
          ]}
        />
      </View>

      <Text style={styles.gramsUnit}>{grams > 0 ? `${previewCalories} kcal` : 'Enter an amount above'}</Text>

      <CardActionButtons
        mode={mode}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFavorite={handleFavoriteAndAdd}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// Prep-toggle display label + matching key for the 7 vegetables' reused
// cross-listed Fruit/Vegetable rows (Tomato, Bell Pepper x4 colors,
// Cucumber, Zucchini, Eggplant, Pumpkin, Avocado x2) -- see
// data/foodsVegetables.js's header comment for why those rows live in
// data/foods.js / data/foodsSRLegacy1.js / data/foodsSRLegacy3.js instead of
// being duplicated there, and so never got a `prep`/`prepLabel` field of
// their own the way every curated row did in v0.0.26. They were tagged back
// in the Fruit round with `variety` instead (Bell Pepper's 4 colors,
// Avocado's California/Florida) or nothing at all (Tomato, Cucumber,
// Zucchini, Eggplant, Pumpkin's plain raw rows), so this is a plain lookup
// keyed by `id` -- the one thing guaranteed unique across all of them --
// rather than trying to retrofit a shared `prep` vocabulary onto rows that
// were never designed to have one.
//
// Avocado's third real row (plain `id: 'avocado'`, data/foods.js) is
// deliberately NOT listed here -- it's the one vegetable-tagged row in the
// whole app that's COUNT-based (servingType: 'count', servingLabel "1/2
// fruit") rather than weight-based, while every other vegetable (all ~78
// others, plus Avocado's own California/Florida rows) is weight-based.
// Building a second portion-entry mode into VegetableCard for one row
// wasn't worth the complexity it'd add to every other vegetable's simpler
// case, so that row is simply left out of the Prep toggle here (see
// VegetableCard's cardFoods filter below) -- it stays exactly where it
// already was, its own ordinary flat CountFoodCard row on the Fruit tab,
// unaffected by any of this, just not duplicated a third time under
// Vegetables too.
const CROSS_LISTED_VEGETABLE_PREPS = {
  tomato: { prep: 'raw', label: 'Raw' },
  peppers_bell_green_raw: { prep: 'green', label: 'Green, Raw' },
  peppers_bell_yellow_raw: { prep: 'yellow', label: 'Yellow, Raw' },
  peppers_bell_red_raw: { prep: 'red', label: 'Red, Raw' },
  peppers_bell_orange_raw: { prep: 'orange', label: 'Orange, Raw' },
  cucumber_with_peel_raw: { prep: 'raw', label: 'With Peel, Raw' },
  squash_summer_green_zucchini_includes_skin_raw: { prep: 'raw', label: 'Raw' },
  eggplant_raw: { prep: 'raw', label: 'Raw' },
  pumpkin_raw: { prep: 'raw', label: 'Raw' },
  avocados_raw_california: { prep: 'california', label: 'California, Raw' },
  avocados_raw_florida: { prep: 'florida', label: 'Florida, Raw' },
};

// The card shown after picking a Vegetable in the Vegetables picker --
// Damon's v0.0.26 call: every one of the ~80 vegetables gets the same
// "toggle picks a different real row" card treatment as PoultryCard/
// EggCard/MilkCard/GroundMeatCard above, instead of the plain flat list of
// food rows this step used through v0.0.25 (see
// data/vegetableHierarchy.js's header comment for that older shape).
//
// Unlike Egg's small, fixed Prep vocabulary (EGG_PREP_LABELS above), a
// vegetable's real-world "preps" span everything from Raw/Cooked/Canned/
// Frozen to vegetable-specific forms like French Fries, Hash Browns, or
// Sun-Dried -- so instead of a shared lookup table, each row in
// data/foodsVegetables.js just carries its own `prep` (matching key) and
// `prepLabel` (toggle button text) pair -- see that file's header comment.
// The 7 reused cross-listed rows (which don't carry those fields) are
// folded in via CROSS_LISTED_VEGETABLE_PREPS above.
//
// Vegetables with only one real row (the majority -- e.g. Iceberg Lettuce,
// Edamame, Watercress) simply don't show the Prep toggle at all
// (hasPrepToggle below), same as EggCard's Duck/Goose/Quail/Turkey case --
// they still get the full card treatment (icon placeholder, per-100g line,
// weight entry, favorite-hosting), just with one fewer row inside it.
//
// Portion is a plain weight entry (g/oz), same as MilkCard -- no
// Small/Medium/Large estimate mode or count/quantity mode, since (aside
// from the one excluded Avocado row above) every vegetable here is weighed,
// not size-graded or counted, the way meat cuts or whole eggs are.
//
// `initialSettings`/`favoriteId`/`locked`/`onAddFavorite`/`onSaveFavoriteEdit`
// -- same "hosting a saved favorite" mechanism as PoultryCard above; see
// its header comment for the full explanation.
function VegetableCard({
  vegetableType,
  vegetableTypeLabel,
  vegetableTypeFoods,
  initialSettings,
  favoriteId,
  locked,
  onAddFavorite,
  onSaveFavoriteEdit,
  onAdd,
}) {
  // Excludes the one count-based row (Avocado's plain 'avocado' id), if
  // present -- see CROSS_LISTED_VEGETABLE_PREPS's header comment above.
  const cardFoods = vegetableTypeFoods.filter((f) => f.servingType === 'weight');

  const prepOf = (f) => f.prep || CROSS_LISTED_VEGETABLE_PREPS[f.id]?.prep || 'raw';
  const labelOf = (f) => f.prepLabel || CROSS_LISTED_VEGETABLE_PREPS[f.id]?.label || f.name;

  // One option per DISTINCT prep. It used to be one per row, which quietly
  // broke Bell Pepper: its four colours are four raw rows, so all four
  // shared the value 'raw' and the picker always resolved to the first one
  // -- Yellow, Red and Orange were listed but unreachable. Colours are a
  // variety, not a preparation, and are handled as one below.
  const availablePreps = [];
  for (const f of cardFoods) {
    const prepKey = prepOf(f);
    const seen = availablePreps.find((e) => e.prep === prepKey);
    if (!seen) availablePreps.push({ food: f, prep: prepKey, label: labelOf(f) });
    // A generic row names the prep better than any one variety does
    // ("Bell Pepper", not "Peppers, bell, green, raw").
    else if (!f.variety && seen.food.variety) { seen.food = f; seen.label = labelOf(f); }
  }
  const hasPrepToggle = availablePreps.length > 1;
  // Prefer 'raw' as the default, same reasoning as EggCard's defaultPrep --
  // falls back to whichever row happens to be first if this vegetable has
  // no raw option at all (e.g. Fried Green Tomatoes' cut only has Raw/
  // Pickled/Fried, so this never actually applies there, but Sun-Dried
  // Tomatoes' cut has no raw option either and needs the fallback).
  const defaultPrep = (availablePreps.find((p) => p.prep === 'raw') || availablePreps[0])?.prep;

  const [prep, setPrep] = useState(initialSettings?.prep || defaultPrep);
  const [isLocked, setIsLocked] = useState(!!locked);

  const resolvedEntry = availablePreps.find((p) => p.prep === prep) || availablePreps[0];

  // Varieties within the chosen prep -- optional, exactly as on FruitCard:
  // nothing selected until tapped, and until then the plain row shows.
  const prepFoods = cardFoods.filter((f) => prepOf(f) === resolvedEntry.prep);
  const varietyFoods = prepFoods.filter((f) => f.variety);
  const genericFoods = prepFoods.filter((f) => !f.variety);
  const optionalVariety = varietyFoods.length > 0 && genericFoods.length === 1;
  const [variety, setVariety] = useState(initialSettings?.variety ?? null);
  const handleVariety = (next) => setVariety(next === variety ? null : next);
  const resolvedFood =
    (optionalVariety && prepFoods.find((f) => f.variety === variety)) ||
    (optionalVariety ? genericFoods[0] : null) ||
    resolvedEntry.food;

  const [weightUnit, setWeightUnit] = useState(initialSettings?.weightUnit || 'g');
  const [weightValue, setWeightValue] = useState(String(initialSettings?.weightValue ?? resolvedFood.typicalGrams));

  const iconKey = `vegetable_${vegetableType}_${resolvedEntry.prep}`;

  // Counting comes first for foods that come in units (data/unitPortions.js);
  // the weight box is still here, one tap away, for anything on a scale.
  const portion = useUnitPortion(resolvedFood, initialSettings);
  const typedGrams = weightUnit === 'g' ? parseFloat(weightValue) || 0 : ozToGrams(parseFloat(weightValue) || 0);
  const grams = portion.unit && portion.mode === 'count' ? portion.grams : typedGrams;
  const previewCalories = Math.round((resolvedFood.caloriesPer100g * grams) / 100);

  const handleWeightUnitChange = (nextUnit) => {
    // Same reasoning as MilkCard/PoultryCard/SeafoodCard's version of this --
    // convert what's currently typed so the number keeps meaning the same
    // real-world amount when switching g <-> oz, instead of jumping to some
    // unrelated number.
    const n = parseFloat(weightValue);
    if (Number.isFinite(n)) {
      const converted = nextUnit === 'oz' ? gramsToOz(n) : ozToGrams(n);
      setWeightValue(String(Math.round(converted * 10) / 10));
    }
    setWeightUnit(nextUnit);
  };

  const handleAddFood = () => {
    if (grams <= 0) return;
    onAdd(resolvedFood, grams);
  };

  // Everything needed to fully re-open this exact card later from My
  // Favorites -- same mechanism as PoultryCard's buildFavoriteData above;
  // see its header comment for the full explanation. `vegetableType` is
  // stored (not just vegetableTypeLabel) so FavoriteListItem's dispatch can
  // re-filter vegetableFoodsAll down to this vegetable's rows again -- see
  // its settings.cardType === 'vegetableCard' branch.
  const buildFavoriteData = () => ({
    foodId: resolvedFood.id,
    name: vegetableTypeLabel,
    servingType: 'weight',
    caloriesPer100g: resolvedFood.caloriesPer100g,
    proteinPer100g: resolvedFood.proteinPer100g,
    carbsPer100g: resolvedFood.carbsPer100g,
    fatPer100g: resolvedFood.fatPer100g,
    grams,
    settings: {
      cardType: 'vegetableCard',
      vegetableType,
      vegetableTypeLabel,
      prep,
      weightUnit,
      weightValue,
      variety,
      ...portion.settings,
      grams,
    },
  });

  const handleFavoriteAndAdd = () => {
    onAddFavorite(buildFavoriteData());
    handleAddFood();
  };

  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favoriteId, buildFavoriteData());
    if (saved) setIsLocked(true);
  };

  const mode = favoriteId ? (isLocked ? 'locked' : 'editing') : 'browsing';

  return (
    <View style={styles.poultryCard}>
      <Text style={styles.poultryCardTitle}>{vegetableTypeLabel}</Text>

      <IconPlaceholder iconKey={iconKey} />

      {hasPrepToggle ? (
        <ToggleRow
          label="Prep"
          value={prep}
          onChange={setPrep}
          disabled={isLocked}
          options={availablePreps.map((p) => ({ value: p.prep, label: p.label }))}
        />
      ) : null}

      {optionalVariety ? (
        <ToggleRow
          label="Variety (optional)"
          value={variety}
          onChange={handleVariety}
          disabled={isLocked}
          options={varietyFoods.map((f) => ({ value: f.variety, label: f.variety }))}
        />
      ) : null}

      <Text style={styles.poultryPer100g}>
        per 100g: {resolvedFood.caloriesPer100g} kcal · P{resolvedFood.proteinPer100g} C{resolvedFood.carbsPer100g} F
        {resolvedFood.fatPer100g}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.poultrySectionTitle}>Portion</Text>
      {portion.unit ? (
        <ToggleRow
          value={portion.mode}
          onChange={portion.setMode}
          disabled={isLocked}
          options={[
            { value: 'count', label: `By ${portion.unit.noun}` },
            { value: 'weight', label: 'Exact weight' },
          ]}
        />
      ) : null}

      {portion.unit && portion.mode === 'count' ? (
        <CountPortion state={portion} kcal={previewCalories} disabled={isLocked} />
      ) : (
      <><View style={styles.gramsRow}>
        <TextInput
          style={[styles.gramsInput, isLocked && styles.gramsInputDisabled]}
          value={weightValue}
          onChangeText={setWeightValue}
          keyboardType="numeric"
          placeholder={weightUnit}
          editable={!isLocked}
        />
        <ToggleRow
          value={weightUnit}
          onChange={handleWeightUnitChange}
          disabled={isLocked}
          options={[
            { value: 'g', label: 'g' },
            { value: 'oz', label: 'oz' },
          ]}
        />
      </View>

      <Text style={styles.gramsUnit}>{grams > 0 ? `${previewCalories} kcal` : 'Enter an amount above'}</Text></>
      )}

      <CardActionButtons
        mode={mode}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFavorite={handleFavoriteAndAdd}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// The card shown after picking Ground Beef -- Damon's spec: instead of raw
// USDA fat percentages, a plain-language Fat % toggle (Regular/Medium/Lean/
// Extra Lean) with a small reminder underneath ("If you are unsure, just
// select 'Regular'!"). Each tier swaps to a genuinely different underlying
// food entry (see data/foodsRedMeat.js's Ground Beef rows and
// BEEF_FAT_TIERS in data/meatHierarchy.js) -- same "toggle picks a
// different real row" pattern as PoultryCard's skin toggle, not a runtime
// weight/formula conversion like Seafood's shell toggle. Ground Beef always
// has both raw and cooked USDA data for all 4 tiers, so there's no
// fallback/matchNote needed here.
// `initialSettings`/`favoriteId`/`locked`/`onAddFavorite`/`onSaveFavoriteEdit`
// -- same "hosting a saved favorite" mechanism as PoultryCard above; see
// its header comment for the full explanation.
// The Ground Beef / Ground Pork card. Generalised from the old
// BeefGroundCard in v0.0.33 -- `subcategory` picks which species' tier list
// the Fat % toggle reads (BEEF_FAT_TIERS' 4 tiers, or PORK_FAT_TIERS' 3),
// and everything else is identical.
function GroundMeatCard({
  subcategory,
  cutLabel,
  meatFoods,
  initialSettings,
  favoriteId,
  locked,
  onAddFavorite,
  onSaveFavoriteEdit,
  onAdd,
}) {
  const cutFoods = meatFoods.filter((f) => f.subcategory === subcategory && f.cut === 'ground');
  // Beef has 4 USDA lean percentages, pork has 3 -- so the toggle's
  // options come from the species' own tier list rather than a shared one.
  const FAT_TIERS = subcategory === 'pork' ? PORK_FAT_TIERS : BEEF_FAT_TIERS;

  const [fatTier, setFatTier] = useState(initialSettings?.fatTier || 'regular');
  const [prep, setPrep] = useState(initialSettings?.prep || 'raw');
  const [isLocked, setIsLocked] = useState(!!locked);

  const resolvedFood = cutFoods.find((f) => f.fatTier === fatTier && f.prep === prep) || cutFoods[0];
  const tierMeta = FAT_TIERS.find((t) => t.key === fatTier) ?? FAT_TIERS[0];

  const [portionMode, setPortionMode] = useState(initialSettings?.portionMode || 'weight'); // 'weight' | 'size'
  const [weightUnit, setWeightUnit] = useState(initialSettings?.weightUnit || 'g'); // 'g' | 'oz'
  const [weightValue, setWeightValue] = useState(String(initialSettings?.weightValue ?? resolvedFood.typicalGrams));
  const [sizeChoice, setSizeChoice] = useState(initialSettings?.sizeChoice || 'medium');

  const iconKey = [subcategory, 'ground', fatTier, prep].join('_');

  const sizes = estimateSizes(resolvedFood.typicalGrams);
  const grams =
    portionMode === 'size'
      ? sizes[sizeChoice]
      : weightUnit === 'g'
        ? parseFloat(weightValue) || 0
        : ozToGrams(parseFloat(weightValue) || 0);

  const previewCalories = Math.round((resolvedFood.caloriesPer100g * grams) / 100);

  const handleWeightUnitChange = (nextUnit) => {
    const n = parseFloat(weightValue);
    if (Number.isFinite(n)) {
      const converted = nextUnit === 'oz' ? gramsToOz(n) : ozToGrams(n);
      setWeightValue(String(Math.round(converted * 10) / 10));
    }
    setWeightUnit(nextUnit);
  };

  const handleAddFood = () => {
    if (grams <= 0) return;
    onAdd(resolvedFood, grams);
  };

  const buildFavoriteData = () => ({
    foodId: resolvedFood.id,
    name: resolvedFood.name,
    servingType: 'weight',
    caloriesPer100g: resolvedFood.caloriesPer100g,
    proteinPer100g: resolvedFood.proteinPer100g,
    carbsPer100g: resolvedFood.carbsPer100g,
    fatPer100g: resolvedFood.fatPer100g,
    grams,
    settings: {
      cardType: 'groundMeatCard',
      subcategory,
      cutLabel,
      fatTier,
      prep,
      portionMode,
      weightUnit,
      weightValue,
      sizeChoice,
      grams,
    },
  });

  const handleFavoriteAndAdd = () => {
    onAddFavorite(buildFavoriteData());
    handleAddFood();
  };

  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favoriteId, buildFavoriteData());
    if (saved) setIsLocked(true);
  };

  const mode = favoriteId ? (isLocked ? 'locked' : 'editing') : 'browsing';

  return (
    <View style={styles.poultryCard}>
      {/* resolvedFood.name (e.g. "Ground Beef"), not cutLabel -- unlike
          Poultry/Seafood's cut labels, Beef's food names already include
          "Beef" where relevant (see data/foodsRedMeat.js), so there's no
          separate typeLabel to prepend here. */}
      <Text style={styles.poultryCardTitle}>{resolvedFood.name}</Text>

      <IconPlaceholder iconKey={iconKey} />

      <ToggleRow
        label="Fat %"
        value={fatTier}
        onChange={setFatTier}
        disabled={isLocked}
        options={FAT_TIERS.map((t) => ({ value: t.key, label: t.label }))}
      />
      <Text style={styles.matchNote}>
        {tierMeta.label} = {tierMeta.rangeLabel}.
      </Text>
      <Text style={styles.reminderNote}>If you are unsure, just select "Regular"!</Text>

      <ToggleRow
        label="Prep"
        value={prep}
        onChange={setPrep}
        disabled={isLocked}
        options={[
          { value: 'raw', label: 'Raw' },
          { value: 'cooked', label: 'Cooked' },
        ]}
      />

      <Text style={styles.poultryPer100g}>
        per 100g: {resolvedFood.caloriesPer100g} kcal · P{resolvedFood.proteinPer100g} C{resolvedFood.carbsPer100g} F
        {resolvedFood.fatPer100g}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.poultrySectionTitle}>Portion</Text>
      <ToggleRow
        value={portionMode}
        onChange={setPortionMode}
        disabled={isLocked}
        options={[
          { value: 'weight', label: 'Enter Weight' },
          { value: 'size', label: 'Small / Medium / Large' },
        ]}
      />

      {portionMode === 'weight' ? (
        <View style={styles.gramsRow}>
          <TextInput
            style={[styles.gramsInput, isLocked && styles.gramsInputDisabled]}
            value={weightValue}
            onChangeText={setWeightValue}
            keyboardType="numeric"
            placeholder={weightUnit}
            editable={!isLocked}
          />
          <ToggleRow
            value={weightUnit}
            onChange={handleWeightUnitChange}
            disabled={isLocked}
            options={[
              { value: 'g', label: 'g' },
              { value: 'oz', label: 'oz' },
            ]}
          />
        </View>
      ) : (
        <View>
          <View style={styles.sizeRow}>
            {['small', 'medium', 'large'].map((s) => (
              <TouchableOpacity
                key={s}
                disabled={isLocked}
                style={[styles.sizeOption, sizeChoice === s && styles.sizeOptionActive, isLocked && styles.sizeOptionDisabled]}
                activeOpacity={0.7}
                onPress={() => setSizeChoice(s)}
              >
                <Text style={[styles.sizeOptionLabel, sizeChoice === s && styles.sizeOptionLabelActive]}>
                  {s === 'small' ? 'Small' : s === 'medium' ? 'Medium' : 'Large'}
                </Text>
                <Text style={[styles.sizeOptionGrams, sizeChoice === s && styles.sizeOptionLabelActive]}>
                  ~{sizes[s]}g
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sizeEstimateNote}>
            Estimated -- USDA doesn't grade meat cuts by size the way it does eggs. Medium is this food's typical
            serving weight; Small/Large are +/-30% around it.
          </Text>
        </View>
      )}

      <Text style={styles.gramsUnit}>{grams > 0 ? `${previewCalories} kcal` : 'Enter an amount above'}</Text>

      <CardActionButtons
        mode={mode}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFavorite={handleFavoriteAndAdd}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// The card shown after picking one of Beef's 8 whole-muscle steak/roast
// cuts (Ribeye, Tenderloin/Filet, T-Bone/Porterhouse, NY Strip, Sirloin,
// Chuck, Round, Brisket) -- Damon's spec: a Fat Trim toggle (Trimmed/
// Partly Trimmed/Untrimmed) plus a USDA Grade section that's collapsed by
// default and only shows its All Grades/Choice/Select toggle once tapped
// open.
//
// Fat Trim swaps to a different underlying food row, same pattern as
// GroundMeatCard/PoultryCard's skin toggle -- see foodsRedMeat.js's header
// comment for exactly which USDA trim levels back Trimmed and Untrimmed,
// and how Partly Trimmed is computed. Grade is NOT a different row --
// selecting Choice or Select applies a real per-cut fat-content ratio
// (BEEF_GRADE_FAT_RATIO, data/meatHierarchy.js) to whichever trim/prep
// combination is already showing, and recalculates calories from the
// adjusted fat -- protein and carbs are left as-is. Favoriting always
// tracks the underlying Trim/Prep row regardless of which Grade is
// selected (Grade is a light seasoning on top, not a separate food), but
// "+ Add" logs whatever numbers are actually on screen, adjusted or not.
// `initialSettings`/`favoriteId`/`locked`/`onAddFavorite`/`onSaveFavoriteEdit`
// -- same "hosting a saved favorite" mechanism as PoultryCard above; see
// its header comment for the full explanation. When opened from a saved
// favorite that had a Grade selected, the USDA Grade section starts
// expanded (rather than the usual collapsed default) so the saved grade is
// immediately visible, not hidden behind another tap.
// The whole-muscle cut card, shared by Beef's 8 steak/roast cuts and Pork's
// 7 trim-toggle cuts. Generalised from the old BeefSteakCard in v0.0.33.
// Two things vary by species:
//   * `subcategory` selects the food rows and feeds iconKey.
//   * USDA Grade (Choice/Select) exists for beef only -- `hasGrade` hides
//     that whole collapsible section for pork rather than showing an empty
//     one, since USDA records no pork equivalent.
// What Trimmed/Partly/Untrimmed actually MEASURE also differs by species --
// see TRIM_TIERS in data/meatHierarchy.js.
function TrimTierCard({
  subcategory,
  cut,
  cutLabel,
  meatFoods,
  initialSettings,
  favoriteId,
  locked,
  onAddFavorite,
  onSaveFavoriteEdit,
  onAdd,
}) {
  const cutFoods = meatFoods.filter((f) => f.subcategory === subcategory && f.cut === cut);
  // USDA Grade (Choice/Select) is a beef-only concept -- there is no pork
  // equivalent, so the whole collapsible Grade section is hidden for pork
  // rather than shown with nothing behind it.
  const hasGrade = subcategory === 'beef' && !!BEEF_GRADE_FAT_RATIO[cut];
  const availablePreps = new Set(cutFoods.map((f) => f.prep));
  const hasPrepToggle = availablePreps.has('raw') && availablePreps.has('cooked');
  const defaultPrep = availablePreps.has('raw') ? 'raw' : 'cooked';

  // Untrimmed, matching TRIM_TIERS' first entry and the icon the Cuts list
  // showed on the way in -- tapping a row should not change the picture.
  const [trimTier, setTrimTier] = useState(initialSettings?.trimTier || 'untrimmed');
  const [prep, setPrep] = useState(initialSettings?.prep || defaultPrep);
  const [grade, setGrade] = useState(initialSettings?.grade || 'all_grades');
  const [gradeExpanded, setGradeExpanded] = useState(!!(initialSettings?.grade && initialSettings.grade !== 'all_grades'));
  const [isLocked, setIsLocked] = useState(!!locked);

  const baseFood = cutFoods.find((f) => f.trimTier === trimTier && f.prep === prep) || cutFoods[0];

  const gradeRatio = hasGrade && grade !== 'all_grades' ? (BEEF_GRADE_FAT_RATIO[cut]?.[grade] ?? 1) : 1;
  const adjustedFat = Math.round(baseFood.fatPer100g * gradeRatio * 10) / 10;
  const adjustedKcal = Math.round(baseFood.proteinPer100g * 4 + baseFood.carbsPer100g * 4 + adjustedFat * 9);
  const resolvedFood =
    !hasGrade || grade === 'all_grades'
      ? baseFood
      : { ...baseFood, fatPer100g: adjustedFat, caloriesPer100g: adjustedKcal };

  const [portionMode, setPortionMode] = useState(initialSettings?.portionMode || 'weight'); // 'weight' | 'size'
  const [weightUnit, setWeightUnit] = useState(initialSettings?.weightUnit || 'g'); // 'g' | 'oz'
  const [weightValue, setWeightValue] = useState(String(initialSettings?.weightValue ?? baseFood.typicalGrams));
  const [sizeChoice, setSizeChoice] = useState(initialSettings?.sizeChoice || 'medium');

  const iconKey = [subcategory, cut, trimTier, prep].join('_');

  const sizes = estimateSizes(baseFood.typicalGrams);
  const grams =
    portionMode === 'size'
      ? sizes[sizeChoice]
      : weightUnit === 'g'
        ? parseFloat(weightValue) || 0
        : ozToGrams(parseFloat(weightValue) || 0);

  const previewCalories = Math.round((resolvedFood.caloriesPer100g * grams) / 100);

  const handleWeightUnitChange = (nextUnit) => {
    const n = parseFloat(weightValue);
    if (Number.isFinite(n)) {
      const converted = nextUnit === 'oz' ? gramsToOz(n) : ozToGrams(n);
      setWeightValue(String(Math.round(converted * 10) / 10));
    }
    setWeightUnit(nextUnit);
  };

  const handleAddFood = () => {
    if (grams <= 0) return;
    onAdd(resolvedFood, grams);
  };

  // Unlike the old bug Damon reported, this now snapshots resolvedFood
  // (the GRADE-ADJUSTED numbers, if a grade is selected) as the favorite's
  // saved nutrition -- not baseFood's un-adjusted ones -- plus every toggle
  // (trim, prep, grade, portion) needed to re-open this exact card later.
  const buildFavoriteData = () => ({
    foodId: baseFood.id,
    name: baseFood.name,
    servingType: 'weight',
    caloriesPer100g: resolvedFood.caloriesPer100g,
    proteinPer100g: resolvedFood.proteinPer100g,
    carbsPer100g: resolvedFood.carbsPer100g,
    fatPer100g: resolvedFood.fatPer100g,
    grams,
    settings: {
      cardType: 'trimTierCard',
      subcategory,
      cut,
      cutLabel,
      trimTier,
      prep,
      grade,
      portionMode,
      weightUnit,
      weightValue,
      sizeChoice,
      grams,
    },
  });

  const handleFavoriteAndAdd = () => {
    onAddFavorite(buildFavoriteData());
    handleAddFood();
  };

  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favoriteId, buildFavoriteData());
    if (saved) setIsLocked(true);
  };

  const mode = favoriteId ? (isLocked ? 'locked' : 'editing') : 'browsing';

  const gradeLabel = grade === 'choice' ? 'Choice' : grade === 'select' ? 'Select' : 'All Grades';

  return (
    <View style={styles.poultryCard}>
      {/* baseFood.name (e.g. "Beef Ribeye Steak"), same reasoning as
          GroundMeatCard's title above. */}
      <Text style={styles.poultryCardTitle}>{baseFood.name}</Text>

      <IconPlaceholder iconKey={iconKey} />

      <ToggleRow
        label="Fat Trim"
        value={trimTier}
        onChange={setTrimTier}
        disabled={isLocked}
        options={TRIM_TIERS.map((t) => ({ value: t.key, label: t.label }))}
      />

      {hasPrepToggle ? (
        <ToggleRow
          label="Prep"
          value={prep}
          onChange={setPrep}
          disabled={isLocked}
          options={[
            { value: 'raw', label: 'Raw' },
            { value: 'cooked', label: 'Cooked' },
          ]}
        />
      ) : null}

      {/* USDA Grade is beef-only -- no pork equivalent exists in USDA, so
          for pork this whole section is absent rather than empty. */}
      {hasGrade ? (
        <>
          <TouchableOpacity
            style={styles.gradeSectionHeader}
            activeOpacity={0.6}
            onPress={() => setGradeExpanded(!gradeExpanded)}
          >
            <Text style={styles.gradeSectionHeaderText}>
              {gradeExpanded ? '▾' : '▸'} USDA Grade{grade !== 'all_grades' ? ` — ${gradeLabel}` : ' (optional)'}
            </Text>
          </TouchableOpacity>
          {gradeExpanded ? (
            <View style={styles.gradeSectionBody}>
              <ToggleRow
                value={grade}
                onChange={setGrade}
                disabled={isLocked}
                options={[
                  { value: 'all_grades', label: 'All Grades' },
                  { value: 'choice', label: 'Choice' },
                  { value: 'select', label: 'Select' },
                ]}
              />
            </View>
          ) : null}
          {grade !== 'all_grades' ? (
            <Text style={styles.matchNote}>
              {gradeLabel} grade adjusts fat based on real USDA fat-content differences for this cut -- protein and
              carbs stay the same, calories are recalculated from the adjusted fat.
            </Text>
          ) : null}
        </>
      ) : null}

      <Text style={styles.poultryPer100g}>
        per 100g: {resolvedFood.caloriesPer100g} kcal · P{resolvedFood.proteinPer100g} C{resolvedFood.carbsPer100g} F
        {resolvedFood.fatPer100g}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.poultrySectionTitle}>Portion</Text>
      <ToggleRow
        value={portionMode}
        onChange={setPortionMode}
        disabled={isLocked}
        options={[
          { value: 'weight', label: 'Enter Weight' },
          { value: 'size', label: 'Small / Medium / Large' },
        ]}
      />

      {portionMode === 'weight' ? (
        <View style={styles.gramsRow}>
          <TextInput
            style={[styles.gramsInput, isLocked && styles.gramsInputDisabled]}
            value={weightValue}
            onChangeText={setWeightValue}
            keyboardType="numeric"
            placeholder={weightUnit}
            editable={!isLocked}
          />
          <ToggleRow
            value={weightUnit}
            onChange={handleWeightUnitChange}
            disabled={isLocked}
            options={[
              { value: 'g', label: 'g' },
              { value: 'oz', label: 'oz' },
            ]}
          />
        </View>
      ) : (
        <View>
          <View style={styles.sizeRow}>
            {['small', 'medium', 'large'].map((s) => (
              <TouchableOpacity
                key={s}
                disabled={isLocked}
                style={[styles.sizeOption, sizeChoice === s && styles.sizeOptionActive, isLocked && styles.sizeOptionDisabled]}
                activeOpacity={0.7}
                onPress={() => setSizeChoice(s)}
              >
                <Text style={[styles.sizeOptionLabel, sizeChoice === s && styles.sizeOptionLabelActive]}>
                  {s === 'small' ? 'Small' : s === 'medium' ? 'Medium' : 'Large'}
                </Text>
                <Text style={[styles.sizeOptionGrams, sizeChoice === s && styles.sizeOptionLabelActive]}>
                  ~{sizes[s]}g
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sizeEstimateNote}>
            Estimated -- USDA doesn't grade meat cuts by size the way it does eggs. Medium is this food's typical
            serving weight; Small/Large are +/-30% around it.
          </Text>
        </View>
      )}

      <Text style={styles.gramsUnit}>{grams > 0 ? `${previewCalories} kcal` : 'Enter an amount above'}</Text>

      <CardActionButtons
        mode={mode}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFavorite={handleFavoriteAndAdd}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// The Fruit card -- Damon's rule that every food gets a card and an icon,
// applied to Fruit in v0.0.35.
//
// Fruit's drill-down used to be Form > Fruit > flat list, which meant you
// picked "Dried" BEFORE picking the fruit -- backwards from every other
// category, and it left nothing for a card to toggle once you arrived.
// It now matches Vegetables: pick the fruit, then switch Form on the card.
// Only forms this fruit actually has data for are offered, so Watermelon
// shows no toggle at all while Apple offers all four.
//
// Two axes, and only one of them reaches the icon:
//   Form    (Fresh / Dried / Canned / Frozen) -- IS in iconKey, since a
//           dried apricot looks nothing like a fresh one.
//   Variety (Fuji vs Gala, Green vs Red grapes)  -- is NOT in iconKey.
//           It still switches the numbers, but 6 apple varieties would be
//           6 near-identical pictures at 192px. Damon's call; it keeps
//           Fruit at 87 icons rather than 115.
//
// Variety resets whenever Form changes, because the varieties available
// differ per form -- Apple has 6 fresh but only one dried, so a stale
// "Honeycrisp" selection would resolve to nothing after switching to Dried.
//
// One row in the whole category is count-based rather than weighed
// (Avocado's "1/2 fruit" row, which is shared with Vegetables), so it's
// filtered out here the same way VegetableCard filters it -- see that
// card's header comment.
function FruitCard({
  fruitType,
  fruitTypeLabel,
  fruitTypeFoods,
  initialSettings,
  favoriteId,
  locked,
  onAddFavorite,
  onSaveFavoriteEdit,
  onAdd,
}) {
  // Almost every fruit row is weighed, but Avocado's only row is the
  // count-based "1/2 fruit" entry shared with Vegetables. Rather than
  // filtering it out (which would leave Avocado's card with no rows at all
  // and nothing to render), the card falls back to count mode for it: same
  // shape, same icon slot, servings instead of grams.
  const weighedFoods = fruitTypeFoods.filter((f) => f.servingType === 'weight');
  const isCountMode = weighedFoods.length === 0 && fruitTypeFoods.length > 0;
  const cardFoods = isCountMode ? fruitTypeFoods : weighedFoods;

  const availableForms = FRUIT_FORMS.filter((fm) => cardFoods.some((f) => f.subcategory === fm.key));
  const hasFormToggle = availableForms.length > 1;
  const defaultForm = (availableForms.find((fm) => fm.key === 'fresh') || availableForms[0])?.key;

  const [form, setForm] = useState(initialSettings?.form || defaultForm);
  const [isLocked, setIsLocked] = useState(!!locked);

  const formFoods = cardFoods.filter((f) => f.subcategory === form);

  // Varieties became OPTIONAL in v0.0.59. Before that a card opened on
  // whichever row came first in the data, so Apple opened on Fuji and
  // Avocado on California as though the user had chosen them -- and Apple's
  // first row was actually "Peeled (Without Skin)", so the default apple was
  // a peeled one. Now nothing is selected until it is tapped, and until
  // then the card shows the plain food (data/foodsGenerics.js).
  //
  // Only when this form has BOTH a generic row and named varieties. Some
  // forms have several unnamed rows that differ by packing liquid ("in
  // juice" vs "in syrup"); those still list every row and still require a
  // pick, exactly as before.
  const varietyFoods = formFoods.filter((f) => f.variety);
  const genericFoods = formFoods.filter((f) => !f.variety);
  const optionalVariety = varietyFoods.length > 0 && genericFoods.length === 1;
  const hasVarietyToggle = optionalVariety ? varietyFoods.length > 0 : formFoods.length > 1;

  const [variety, setVariety] = useState(
    initialSettings?.variety ?? (optionalVariety ? null : null)
  );
  const resolvedFood =
    formFoods.find((f) => (f.variety || f.id) === variety) ||
    (optionalVariety ? genericFoods[0] : null) ||
    formFoods[0] ||
    cardFoods[0];

  // Tapping the variety already chosen clears it, which is the only way back
  // to the plain food once you have picked one.
  const handleVariety = (next) => setVariety(optionalVariety && next === variety ? null : next);

  const [weightUnit, setWeightUnit] = useState(initialSettings?.weightUnit || 'g');
  const [weightValue, setWeightValue] = useState(
    String(initialSettings?.weightValue ?? resolvedFood?.typicalGrams ?? 100)
  );
  // Only used in count mode; harmless otherwise. Declared unconditionally
  // so the hook order stays identical either way.
  const [servings, setServings] = useState(String(initialSettings?.servings ?? 1));

  // Switching Form does two things beyond changing the row. It clears the
  // variety, because the varieties on offer differ per form (Apple has 6
  // fresh but one dried, so a stale "Honeycrisp" would silently resolve to
  // whatever happens to be first). And it reseats the weight on the new
  // form's typical serving, since those differ by an order of magnitude --
  // a fresh apple is ~140g, a dried one ~30g, so carrying 140g across
  // would quietly log four servings' worth.
  const handleFormChange = (nextForm) => {
    setForm(nextForm);
    setVariety(null);
    const next = cardFoods.find((f) => f.subcategory === nextForm);
    if (next) setWeightValue(String(next.typicalGrams));
  };

  const iconKey = `fruit_${fruitType}_${form}`;

  // Counting comes first for foods that come in units (data/unitPortions.js);
  // the weight box is still here, one tap away, for anything on a scale.
  const portion = useUnitPortion(resolvedFood, initialSettings);
  const typedGrams = weightUnit === 'g' ? parseFloat(weightValue) || 0 : ozToGrams(parseFloat(weightValue) || 0);
  const grams = portion.unit && portion.mode === 'count' ? portion.grams : typedGrams;
  const servingsN = parseFloat(servings) || 0;
  const previewCalories = isCountMode
    ? Math.round((resolvedFood.calories || 0) * servingsN)
    : Math.round((resolvedFood.caloriesPer100g * grams) / 100);

  const handleWeightUnitChange = (nextUnit) => {
    const n = parseFloat(weightValue);
    if (Number.isFinite(n)) {
      const converted = nextUnit === 'oz' ? gramsToOz(n) : ozToGrams(n);
      setWeightValue(String(Math.round(converted * 10) / 10));
    }
    setWeightUnit(nextUnit);
  };

  const handleAddFood = () => {
    if (isCountMode) {
      if (servingsN <= 0) return;
      onAdd(resolvedFood, servingsN);
      return;
    }
    if (grams <= 0) return;
    onAdd(resolvedFood, grams);
  };

  // Count-mode favorites are saved in the same shape CountFoodCard uses
  // (absolute per-serving macros, no per-100g fields) so My Favorites can
  // render them without special-casing where they came from.
  const buildFavoriteData = () =>
    isCountMode
      ? {
          foodId: resolvedFood.id,
          name: resolvedFood.name || fruitTypeLabel,
          servingType: 'count',
          calories: resolvedFood.calories,
          protein: resolvedFood.protein,
          carbs: resolvedFood.carbs,
          fat: resolvedFood.fat,
          servingLabel: resolvedFood.servingLabel,
          settings: {
            cardType: 'fruitCard',
            fruitType,
            fruitTypeLabel,
            form,
            variety: resolvedFood.variety || resolvedFood.id,
            servings,
          },
        }
      : {
          foodId: resolvedFood.id,
          name: resolvedFood.name || fruitTypeLabel,
          servingType: 'weight',
          caloriesPer100g: resolvedFood.caloriesPer100g,
          proteinPer100g: resolvedFood.proteinPer100g,
          carbsPer100g: resolvedFood.carbsPer100g,
          fatPer100g: resolvedFood.fatPer100g,
          grams,
          settings: {
            cardType: 'fruitCard',
            fruitType,
            fruitTypeLabel,
            form,
            variety: resolvedFood.variety || resolvedFood.id,
            weightUnit,
            weightValue,
      ...portion.settings,
            grams,
          },
        };

  const handleFavoriteAndAdd = () => {
    onAddFavorite(buildFavoriteData());
    handleAddFood();
  };

  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favoriteId, buildFavoriteData());
    if (saved) setIsLocked(true);
  };

  const mode = favoriteId ? (isLocked ? 'locked' : 'editing') : 'browsing';

  return (
    <View style={styles.poultryCard}>
      <Text style={styles.poultryCardTitle}>{fruitTypeLabel}</Text>

      <IconPlaceholder iconKey={iconKey} />

      {hasFormToggle ? (
        <ToggleRow
          label="Form"
          value={form}
          onChange={handleFormChange}
          disabled={isLocked}
          options={availableForms.map((fm) => ({ value: fm.key, label: fm.label }))}
        />
      ) : null}

      {hasVarietyToggle ? (
        <ToggleRow
          // "Variety" only where these really are cultivars. Coconut's canned
          // rows are Coconut milk vs Coconut cream and its dried rows are
          // sweetened vs not -- different products and different processing,
          // filed under a field that happens to be called `variety`. Those
          // keep a required choice (there is no honest average of coconut
          // milk and coconut cream) and get an honest label instead.
          // "(optional)" only where nothing is preselected. The other two
          // branches still require a pick -- coconut's Type and frozen
          // strawberries' Preparation -- and a form whose rows differ by
          // packing liquid rather than cultivar is a required Variety too.
          label={
            fruitType === 'coconut' ? 'Type'
              : !optionalVariety && varietyFoods.length > 0 ? 'Preparation'
              : optionalVariety ? 'Variety (optional)'
              : 'Variety'
          }
          // null until the user taps one -- see optionalVariety above.
          value={optionalVariety ? variety : resolvedFood.variety || resolvedFood.id}
          onChange={handleVariety}
          disabled={isLocked}
          options={(optionalVariety ? varietyFoods : formFoods).map((f) => ({
            value: f.variety || f.id,
            // Falls back to the row's full name when it carries no variety
            // of its own -- e.g. canned fruit rows differ by packing liquid
            // ("in juice" vs "in syrup") rather than by cultivar.
            label: f.variety || f.name,
          }))}
        />
      ) : null}

      <Text style={styles.poultryPer100g}>
        {isCountMode
          ? `${resolvedFood.servingLabel}: ${resolvedFood.calories} kcal · P${resolvedFood.protein} C${resolvedFood.carbs} F${resolvedFood.fat}`
          : `per 100g: ${resolvedFood.caloriesPer100g} kcal · P${resolvedFood.proteinPer100g} C${resolvedFood.carbsPer100g} F${resolvedFood.fatPer100g}`}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.poultrySectionTitle}>Portion</Text>
      {portion.unit ? (
        <ToggleRow
          value={portion.mode}
          onChange={portion.setMode}
          disabled={isLocked}
          options={[
            { value: 'count', label: `By ${portion.unit.noun}` },
            { value: 'weight', label: 'Exact weight' },
          ]}
        />
      ) : null}

      {isCountMode ? (
        <View style={styles.gramsRow}>
          <TextInput
            style={[styles.gramsInput, isLocked && styles.gramsInputDisabled]}
            value={servings}
            onChangeText={setServings}
            keyboardType="numeric"
            placeholder="servings"
            editable={!isLocked}
          />
          <Text style={styles.matchNote}>× {resolvedFood.servingLabel}</Text>
        </View>
      ) : portion.unit && portion.mode === 'count' ? (
        <CountPortion state={portion} kcal={previewCalories} disabled={isLocked} />
      ) : (
        <View style={styles.gramsRow}>
          <TextInput
            style={[styles.gramsInput, isLocked && styles.gramsInputDisabled]}
            value={weightValue}
            onChangeText={setWeightValue}
            keyboardType="numeric"
            placeholder={weightUnit}
            editable={!isLocked}
          />
          <ToggleRow
            value={weightUnit}
            onChange={handleWeightUnitChange}
            disabled={isLocked}
            options={[
              { value: 'g', label: 'g' },
              { value: 'oz', label: 'oz' },
            ]}
          />
        </View>
      )}

      {portion.unit && portion.mode === 'count' && !isCountMode ? null : (
        <Text style={styles.gramsUnit}>
          {previewCalories > 0 ? `${previewCalories} kcal` : 'Enter an amount above'}
        </Text>
      )}

      <CardActionButtons
        mode={mode}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFavorite={handleFavoriteAndAdd}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// Shared portion + actions block used by the three Dairy cards below.
// They differ only in how many toggles sit above it, so the grams input,
// unit switch, calorie preview and action buttons live here once instead
// of three near-identical copies.
// `portion` is optional -- LegumeCard passes one so grains and breads can be
// counted in slices, tortillas and bagels; the dairy cards that share this
// step pass nothing and get the weight box exactly as before.
function DairyPortion({ resolvedFood, weightUnit, setWeightUnit, weightValue, setWeightValue, isLocked, mode, onEdit, onSaveChanges, onAddFavorite, onAddFood, portion }) {
  const counting = !!(portion && portion.unit && portion.mode === 'count');
  const typedGrams = weightUnit === 'g' ? parseFloat(weightValue) || 0 : ozToGrams(parseFloat(weightValue) || 0);
  const grams = counting ? portion.grams : typedGrams;
  const previewCalories = Math.round((resolvedFood.caloriesPer100g * grams) / 100);
  const handleUnit = (nextUnit) => {
    const n = parseFloat(weightValue);
    if (Number.isFinite(n)) {
      const converted = nextUnit === 'oz' ? gramsToOz(n) : ozToGrams(n);
      setWeightValue(String(Math.round(converted * 10) / 10));
    }
    setWeightUnit(nextUnit);
  };
  return (
    <>
      <Text style={styles.poultryPer100g}>
        per 100g: {resolvedFood.caloriesPer100g} kcal · P{resolvedFood.proteinPer100g} C{resolvedFood.carbsPer100g} F
        {resolvedFood.fatPer100g}
      </Text>
      <View style={styles.divider} />
      <Text style={styles.poultrySectionTitle}>Portion</Text>
      {portion && portion.unit ? (
        <ToggleRow
          value={portion.mode}
          onChange={portion.setMode}
          disabled={isLocked}
          options={[
            { value: 'count', label: `By ${portion.unit.noun}` },
            { value: 'weight', label: 'Exact weight' },
          ]}
        />
      ) : null}
      {counting ? (
        <CountPortion state={portion} kcal={previewCalories} disabled={isLocked} />
      ) : (
      <><View style={styles.gramsRow}>
        <TextInput
          style={[styles.gramsInput, isLocked && styles.gramsInputDisabled]}
          value={weightValue}
          onChangeText={setWeightValue}
          keyboardType="numeric"
          placeholder={weightUnit}
          editable={!isLocked}
        />
        <ToggleRow
          value={weightUnit}
          onChange={handleUnit}
          disabled={isLocked}
          options={[{ value: 'g', label: 'g' }, { value: 'oz', label: 'oz' }]}
        />
      </View>
      <Text style={styles.gramsUnit}>{grams > 0 ? `${previewCalories} kcal` : 'Enter an amount above'}</Text></>
      )}
      <CardActionButtons mode={mode} onEdit={onEdit} onSaveChanges={onSaveChanges} onAddFavorite={onAddFavorite} onAddFood={onAddFood} />
    </>
  );
}

// The Yogurt card -- Style x Fat x Flavor.
//
// The only card in this app with three toggles and NO data-gating on any of
// them: USDA's generic yogurt rows form a complete 18-cell grid, so every
// combination resolves to a real row. See data/foodsDairy.js's yogurt block.
//
// Icon varies by FLAVOR only. Greek vs regular and whole vs nonfat change
// the numbers a lot (Greek nonfat plain is 10.3g protein against regular
// nonfat's 4.2g) but look identical in a bowl at 192px; plain vs fruit does
// not.
function YogurtCard({ dairyFoods, initialSettings, favoriteId, locked, onAddFavorite, onSaveFavoriteEdit, onAdd }) {
  const rows = dairyFoods.filter((f) => f.subcategory === 'yogurt');
  const [style, setStyle] = useState(initialSettings?.yogurtStyle || 'regular');
  const [fat, setFat] = useState(initialSettings?.yogurtFat || 'nonfat');
  const [flavor, setFlavor] = useState(initialSettings?.yogurtFlavor || 'plain');
  const [isLocked, setIsLocked] = useState(!!locked);

  const resolvedFood =
    rows.find((f) => f.yogurtStyle === style && f.yogurtFat === fat && f.yogurtFlavor === flavor) || rows[0];

  const [weightUnit, setWeightUnit] = useState(initialSettings?.weightUnit || 'g');
  const [weightValue, setWeightValue] = useState(String(initialSettings?.weightValue ?? resolvedFood.typicalGrams));

  const iconKey = `dairy_yogurt_${flavor}`;
  const grams = weightUnit === 'g' ? parseFloat(weightValue) || 0 : ozToGrams(parseFloat(weightValue) || 0);

  const buildFavoriteData = () => ({
    foodId: resolvedFood.id,
    name: resolvedFood.name,
    servingType: 'weight',
    caloriesPer100g: resolvedFood.caloriesPer100g,
    proteinPer100g: resolvedFood.proteinPer100g,
    carbsPer100g: resolvedFood.carbsPer100g,
    fatPer100g: resolvedFood.fatPer100g,
    grams,
    settings: { cardType: 'yogurtCard', yogurtStyle: style, yogurtFat: fat, yogurtFlavor: flavor, weightUnit, weightValue, grams },
  });

  const handleAddFood = () => { if (grams > 0) onAdd(resolvedFood, grams); };
  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favoriteId, buildFavoriteData());
    if (saved) setIsLocked(true);
  };

  return (
    <View style={styles.poultryCard}>
      <Text style={styles.poultryCardTitle}>Yogurt</Text>
      <IconPlaceholder iconKey={iconKey} />
      <ToggleRow label="Style" value={style} onChange={setStyle} disabled={isLocked}
        options={YOGURT_STYLES.map((o) => ({ value: o.key, label: o.label }))} />
      <ToggleRow label="Fat" value={fat} onChange={setFat} disabled={isLocked}
        options={YOGURT_FATS.map((o) => ({ value: o.key, label: o.label }))} />
      <ToggleRow label="Flavor" value={flavor} onChange={setFlavor} disabled={isLocked}
        options={YOGURT_FLAVORS.map((o) => ({ value: o.key, label: o.label }))} />
      {flavor !== 'plain' ? (
        <Text style={styles.matchNote}>
          USDA measures flavoured yogurt as an average across every flavour, not a specific strawberry or vanilla -- so
          this is a good estimate for flavoured yogurt generally, not an exact match for one product.
        </Text>
      ) : null}
      <DairyPortion
        resolvedFood={resolvedFood}
        weightUnit={weightUnit} setWeightUnit={setWeightUnit}
        weightValue={weightValue} setWeightValue={setWeightValue}
        isLocked={isLocked}
        mode={favoriteId ? (isLocked ? 'locked' : 'editing') : 'browsing'}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFavorite={() => { onAddFavorite(buildFavoriteData()); handleAddFood(); }}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// The Butter card -- Form x Salt, data-gated (unlike Yogurt's complete
// grid). USDA has no unsalted whipped butter and no salt variants at all
// for ghee, so the Salt toggle only appears for forms that really have
// both, and switching to a form without the current salt choice falls back
// to whatever that form does have.
//
// Worth knowing while reading the numbers: salted and unsalted butter are
// nutritionally IDENTICAL. Salt adds no calories, protein, carbs or fat, so
// that toggle records a shopping distinction rather than changing any math.
function ButterCard({ dairyFoods, initialSettings, favoriteId, locked, onAddFavorite, onSaveFavoriteEdit, onAdd }) {
  const rows = dairyFoods.filter((f) => f.subcategory === 'butter');
  const [form, setForm] = useState(initialSettings?.butterForm || 'stick');
  const [salt, setSalt] = useState(initialSettings?.butterSalt || 'salted');
  const [isLocked, setIsLocked] = useState(!!locked);

  const formRows = rows.filter((f) => f.butterForm === form);
  const saltOptions = BUTTER_SALTS.filter((o) => formRows.some((f) => f.butterSalt === o.key));
  const hasSaltToggle = saltOptions.length > 1;
  const resolvedFood = formRows.find((f) => f.butterSalt === salt) || formRows[0] || rows[0];

  const [weightUnit, setWeightUnit] = useState(initialSettings?.weightUnit || 'g');
  const [weightValue, setWeightValue] = useState(String(initialSettings?.weightValue ?? resolvedFood.typicalGrams));

  const handleFormChange = (nextForm) => {
    setForm(nextForm);
    const next = rows.filter((f) => f.butterForm === nextForm);
    if (!next.some((f) => f.butterSalt === salt) && next[0]) setSalt(next[0].butterSalt);
    if (next[0]) setWeightValue(String(next[0].typicalGrams));
  };

  const iconKey = `dairy_butter_${form}`;
  const grams = weightUnit === 'g' ? parseFloat(weightValue) || 0 : ozToGrams(parseFloat(weightValue) || 0);

  const buildFavoriteData = () => ({
    foodId: resolvedFood.id,
    name: resolvedFood.name,
    servingType: 'weight',
    caloriesPer100g: resolvedFood.caloriesPer100g,
    proteinPer100g: resolvedFood.proteinPer100g,
    carbsPer100g: resolvedFood.carbsPer100g,
    fatPer100g: resolvedFood.fatPer100g,
    grams,
    settings: { cardType: 'butterCard', butterForm: form, butterSalt: resolvedFood.butterSalt, weightUnit, weightValue, grams },
  });

  const handleAddFood = () => { if (grams > 0) onAdd(resolvedFood, grams); };
  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favoriteId, buildFavoriteData());
    if (saved) setIsLocked(true);
  };

  return (
    <View style={styles.poultryCard}>
      <Text style={styles.poultryCardTitle}>Butter</Text>
      <IconPlaceholder iconKey={iconKey} />
      <ToggleRow label="Form" value={form} onChange={handleFormChange} disabled={isLocked}
        options={BUTTER_FORMS.map((o) => ({ value: o.key, label: o.label }))} />
      {hasSaltToggle ? (
        <ToggleRow label="Salt" value={resolvedFood.butterSalt} onChange={setSalt} disabled={isLocked}
          options={saltOptions.map((o) => ({ value: o.key, label: o.label }))} />
      ) : null}
      <DairyPortion
        resolvedFood={resolvedFood}
        weightUnit={weightUnit} setWeightUnit={setWeightUnit}
        weightValue={weightValue} setWeightValue={setWeightValue}
        isLocked={isLocked}
        mode={favoriteId ? (isLocked ? 'locked' : 'editing') : 'browsing'}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFavorite={() => { onAddFavorite(buildFavoriteData()); handleAddFood(); }}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// One card serving every Dairy item whose variants are a single list --
// each cheese (Cheddar's Fat ladder, Parmesan's Form choice), each Cream
// sub-product, and the four standalone Milk products, which have no
// variants at all and so show no toggle.
//
// `toggleLabel` comes from the caller because the same mechanism means
// different things: "Fat" for cheddar regular-vs-reduced, "Form" for
// parmesan hard-vs-grated, "Type" for half-and-half-vs-heavy cream.
//
// The icon rule follows the rest of the app: a variant reaches the icon key
// only when it changes the picture. Grated parmesan looks nothing like a
// wedge, so form variants are in the key; reduced-fat cheddar is
// indistinguishable from regular, so fat variants are not.
function DairyVariantCard({ title, rows, toggleLabel, iconKey, variantField, variantLabels, initialSettings, favoriteId, locked, onAddFavorite, onSaveFavoriteEdit, onAdd }) {
  const [variant, setVariant] = useState(initialSettings?.dairyVariant || rows[0]?.[variantField] || null);
  const [isLocked, setIsLocked] = useState(!!locked);
  const resolvedFood = rows.find((f) => f[variantField] === variant) || rows[0];
  const hasToggle = rows.length > 1;

  const [weightUnit, setWeightUnit] = useState(initialSettings?.weightUnit || 'g');
  const [weightValue, setWeightValue] = useState(String(initialSettings?.weightValue ?? resolvedFood.typicalGrams));

  const grams = weightUnit === 'g' ? parseFloat(weightValue) || 0 : ozToGrams(parseFloat(weightValue) || 0);

  const buildFavoriteData = () => ({
    foodId: resolvedFood.id,
    name: resolvedFood.name,
    servingType: 'weight',
    caloriesPer100g: resolvedFood.caloriesPer100g,
    proteinPer100g: resolvedFood.proteinPer100g,
    carbsPer100g: resolvedFood.carbsPer100g,
    fatPer100g: resolvedFood.fatPer100g,
    grams,
    settings: { cardType: 'dairyVariantCard', dairyFoodId: resolvedFood.id, dairyVariant: resolvedFood[variantField], weightUnit, weightValue, grams },
  });

  const handleAddFood = () => { if (grams > 0) onAdd(resolvedFood, grams); };
  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favoriteId, buildFavoriteData());
    if (saved) setIsLocked(true);
  };

  return (
    <View style={styles.poultryCard}>
      <Text style={styles.poultryCardTitle}>{title}</Text>
      <IconPlaceholder iconKey={iconKey(resolvedFood)} />
      {hasToggle ? (
        <ToggleRow
          label={toggleLabel}
          value={resolvedFood[variantField]}
          onChange={setVariant}
          disabled={isLocked}
          options={rows.map((f) => ({ value: f[variantField], label: variantLabels(f) }))}
        />
      ) : null}
      <DairyPortion
        resolvedFood={resolvedFood}
        weightUnit={weightUnit} setWeightUnit={setWeightUnit}
        weightValue={weightValue} setWeightValue={setWeightValue}
        isLocked={isLocked}
        mode={favoriteId ? (isLocked ? 'locked' : 'editing') : 'browsing'}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFavorite={() => { onAddFavorite(buildFavoriteData()); handleAddFood(); }}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// The Legume card -- one item (a bean, a lentil, a tofu, a hummus) with an
// optional Form toggle.
//
// Beans, Lentils, Chickpeas and Dried Peas have a Form axis (Dried /
// Cooked / Canned) and it is data-gated: Adzuki, Mung, Pink and Yellow
// beans have no canned row in USDA, so their cards show two options rather
// than three. Soy Products, Peanuts and Prepared dishes are each a single
// distinct product, so they show no toggle at all.
//
// The Form numbers look alarming side by side and are worth understanding
// rather than "fixing": dried beans run 2.3x to 3.0x the calories of
// cooked per 100g, because they absorb two to three times their weight in
// water. 100g dried black beans is 341 kcal, 100g cooked is 132. Both are
// right; they're different amounts of bean. The toggle label on the card
// is what tells the two apart.
//
// Form IS in the icon key -- dried beans are hard and glossy, cooked are
// soft and matte, canned sit in liquid. Three genuinely different pictures,
// unlike most of Dairy's invisible toggles.
//
// Shared with Nuts & Seeds as of v0.0.39 -- that category is the identical
// shape ("one item, one optional list-toggle"), so rather than a third
// near-copy the card takes `variantField` (which column the toggle reads),
// `variantOptions` (the ordered list of possible values) and `iconPrefix`.
// Legumes passes legumeForm/LEGUME_FORMS/'legume'; Nuts & Seeds passes
// nutPrep/NUT_PREPS/'nutseed'.
function LegumeCard({
  title,
  rows,
  hasFormToggle,
  variantField = 'legumeForm',
  variantOptions = LEGUME_FORMS,
  iconPrefix = 'legume',
  toggleLabel = 'Form',
  // Whether the variant toggle's value belongs in the icon key. True for
  // every category through Grains, because their axes all change the
  // picture -- dried vs cooked beans, raw vs roasted almonds, dry vs
  // cooked pasta.
  //
  // Fats & Oils is the first one where it doesn't: regular and light
  // margarine are the same tub. Passing false there keeps the icon key at
  // `fatoil_margarine_tub` for both rows instead of splitting one drawing
  // into two, which is the same call milk's fat percentage got in Dairy.
  variantInIconKey = true,
  itemField = null,
  initialSettings,
  favoriteId,
  locked,
  onAddFavorite,
  onSaveFavoriteEdit,
  onAdd,
}) {
  const availableForms = hasFormToggle
    ? variantOptions.filter((f) => rows.some((r) => r[variantField] === f.key))
    : [];
  const showFormToggle = availableForms.length > 1;
  const defaultForm =
    initialSettings?.legumeForm ||
    // Legumes default to Cooked (the way people usually eat and weigh
    // them); Nuts & Seeds has no equivalent default, so it falls through to
    // whichever prep comes first.
    (availableForms.find((f) => f.key === 'cooked') || availableForms[0])?.key ||
    null;

  const [form, setForm] = useState(defaultForm);
  const [isLocked, setIsLocked] = useState(!!locked);

  const resolvedFood = (hasFormToggle ? rows.find((r) => r[variantField] === form) : rows[0]) || rows[0];

  const [weightUnit, setWeightUnit] = useState(initialSettings?.weightUnit || 'g');
  const [weightValue, setWeightValue] = useState(String(initialSettings?.weightValue ?? resolvedFood.typicalGrams));

  // Switching Form reseats the weight, same reasoning as FruitCard's fresh
  // vs dried apple: a typical serving of dried beans and of cooked beans
  // are nowhere near the same number of grams.
  const handleFormChange = (nextForm) => {
    setForm(nextForm);
    const next = rows.find((r) => r[variantField] === nextForm);
    if (next) setWeightValue(String(next.typicalGrams));
  };

  // Peanut rows reach the Nuts & Seeds picker by cross-list, so they carry
  // legumeItem rather than nutItem -- and they keep their `legume_` icon
  // key either way, since it's one food and should be one picture.
  // Which column holds this row's item key. Explicit `itemField` wins (the
  // seven v0.0.43 categories pass it); otherwise fall back to the chain of
  // categories that predate it. Peanut rows are the reason the fallback
  // ends at `legumeItem` with a hardcoded 'legume' prefix -- they reach the
  // Nuts & Seeds picker by cross-list but keep their legume_ icon key,
  // since it is one food and should be one picture.
  const iconItem = itemField
    ? resolvedFood[itemField]
    : resolvedFood.fatItem || resolvedFood.nutItem || resolvedFood.grainItem || resolvedFood.legumeItem;
  const iconPfx = itemField
    ? iconPrefix
    : resolvedFood.fatItem || resolvedFood.nutItem || resolvedFood.grainItem
      ? iconPrefix
      : 'legume';
  const iconVariant = variantInIconKey ? resolvedFood[variantField] || resolvedFood.legumeForm : null;
  const iconKey = `${iconPfx}_${iconItem}${iconVariant ? `_${iconVariant}` : ''}`;
  // Counting comes first for foods that come in units (data/unitPortions.js);
  // the weight box is still here, one tap away, for anything on a scale.
  const portion = useUnitPortion(resolvedFood, initialSettings);
  const typedGrams = weightUnit === 'g' ? parseFloat(weightValue) || 0 : ozToGrams(parseFloat(weightValue) || 0);
  const grams = portion.unit && portion.mode === 'count' ? portion.grams : typedGrams;

  const buildFavoriteData = () => ({
    foodId: resolvedFood.id,
    name: resolvedFood.name,
    servingType: 'weight',
    caloriesPer100g: resolvedFood.caloriesPer100g,
    proteinPer100g: resolvedFood.proteinPer100g,
    carbsPer100g: resolvedFood.carbsPer100g,
    fatPer100g: resolvedFood.fatPer100g,
    grams,
    settings: {
      cardType: 'legumeCard',
      legumeFoodId: resolvedFood.id,
      legumeItem: resolvedFood.legumeItem || null,
      nutItem: resolvedFood.nutItem || null,
      grainItem: resolvedFood.grainItem || null,
      fatItem: resolvedFood.fatItem || null,
      // The seven v0.0.43 categories store which column their item key
      // lives in, so a saved favorite can find its way back to the right
      // card without a lookup chain that grows every round.
      itemField: itemField || null,
      itemKey: itemField ? resolvedFood[itemField] || null : null,
      iconPrefix: itemField ? iconPrefix : null,
      toggleLabelSaved: itemField ? toggleLabel : null,
      legumeForm: resolvedFood[variantField] || null,
      weightUnit,
      weightValue,
      ...portion.settings,
      grams,
    },
  });

  const handleAddFood = () => { if (grams > 0) onAdd(resolvedFood, grams); };
  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favoriteId, buildFavoriteData());
    if (saved) setIsLocked(true);
  };

  return (
    <View style={styles.poultryCard}>
      <Text style={styles.poultryCardTitle}>{title}</Text>
      <IconPlaceholder iconKey={iconKey} />
      {showFormToggle ? (
        <ToggleRow
          label={toggleLabel}
          value={resolvedFood[variantField]}
          onChange={handleFormChange}
          disabled={isLocked}
          options={availableForms.map((f) => ({ value: f.key, label: f.label }))}
        />
      ) : null}
      {resolvedFood.legumeForm === 'dried' ? (
        <Text style={styles.matchNote}>
          Dried weight, before cooking. Beans roughly triple in weight once cooked, so 100g dried is a much bigger
          portion than 100g cooked -- switch to Cooked if you're weighing them after cooking.
        </Text>
      ) : null}
      <DairyPortion
        resolvedFood={resolvedFood}
        portion={portion}
        weightUnit={weightUnit} setWeightUnit={setWeightUnit}
        weightValue={weightValue} setWeightValue={setWeightValue}
        isLocked={isLocked}
        mode={favoriteId ? (isLocked ? 'locked' : 'editing') : 'browsing'}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFavorite={() => { onAddFavorite(buildFavoriteData()); handleAddFood(); }}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// The card for a Red Meat cut that has no extra data dimension to toggle
// -- Beef's Flank, Skirt, Short Ribs, Shank, Liver & Organs, and Other
// Cuts. USDA never measured a second fat-trim level for any of these (see
// data/foodsRedMeat.js's header comment), so there's no Fat Trim toggle to
// show and no USDA Grade ratio to apply; what's left is Prep and portion.
//
// Damon's rule, and the reason this component exists at all: every food
// gets a card and an icon, period -- when a toggle doesn't apply to a cut,
// the toggle goes away, not the card. Before this, these six cuts fell
// through to the plain flat food list ('meatFoods'), which meant they were
// the only Beef cuts with no icon, no Small/Medium/Large estimator, and no
// portion step -- an accident of the Fat Trim work (only cuts that HAD a
// trim toggle got built a card), never a decision about these cuts.
//
// Deliberately generic in `subcategory` rather than hardcoding 'beef':
// Pork, Lamb, Veal, and Game are all in exactly the same position today
// (every one of their cuts still uses the flat list), so extending this to
// them later is a one-line change in `listMode` below, not a new
// component. iconKey follows suit -- `<subcategory>_<cut>_<prep>`, e.g.
// `beef_flank_raw` -- so it stays unambiguous once other meats join.
//
// `initialSettings`/`favoriteId`/`locked`/`onAddFavorite`/`onSaveFavoriteEdit`
// -- same "hosting a saved favorite" mechanism as PoultryCard/TrimTierCard
// above; see PoultryCard's header comment for the full explanation.
function MeatCutCard({
  subcategory,
  cut,
  cutLabel,
  meatFoods,
  initialSettings,
  favoriteId,
  locked,
  onAddFavorite,
  onSaveFavoriteEdit,
  onAdd,
}) {
  const cutFoods = meatFoods.filter((f) => f.subcategory === subcategory && f.cut === cut);
  const availablePreps = new Set(cutFoods.map((f) => f.prep));
  // Same data-gated rule as PoultryCard/TrimTierCard: only offer Raw vs
  // Cooked when both actually exist for this cut, so the toggle can never
  // point at a row that isn't there.
  const hasPrepToggle = availablePreps.has('raw') && availablePreps.has('cooked');
  const defaultPrep = availablePreps.has('raw') ? 'raw' : 'cooked';

  const [prep, setPrep] = useState(initialSettings?.prep || defaultPrep);
  const [isLocked, setIsLocked] = useState(!!locked);

  const resolvedFood = cutFoods.find((f) => f.prep === prep) || cutFoods[0];

  const [portionMode, setPortionMode] = useState(initialSettings?.portionMode || 'weight'); // 'weight' | 'size'
  const [weightUnit, setWeightUnit] = useState(initialSettings?.weightUnit || 'g'); // 'g' | 'oz'
  const [weightValue, setWeightValue] = useState(String(initialSettings?.weightValue ?? resolvedFood.typicalGrams));
  const [sizeChoice, setSizeChoice] = useState(initialSettings?.sizeChoice || 'medium');

  const iconKey = [subcategory, cut, prep].join('_');

  const sizes = estimateSizes(resolvedFood.typicalGrams);
  const grams =
    portionMode === 'size'
      ? sizes[sizeChoice]
      : weightUnit === 'g'
        ? parseFloat(weightValue) || 0
        : ozToGrams(parseFloat(weightValue) || 0);

  const previewCalories = Math.round((resolvedFood.caloriesPer100g * grams) / 100);

  const handleWeightUnitChange = (nextUnit) => {
    const n = parseFloat(weightValue);
    if (Number.isFinite(n)) {
      const converted = nextUnit === 'oz' ? gramsToOz(n) : ozToGrams(n);
      setWeightValue(String(Math.round(converted * 10) / 10));
    }
    setWeightUnit(nextUnit);
  };

  const handleAddFood = () => {
    if (grams <= 0) return;
    onAdd(resolvedFood, grams);
  };

  const buildFavoriteData = () => ({
    foodId: resolvedFood.id,
    name: resolvedFood.name,
    servingType: 'weight',
    caloriesPer100g: resolvedFood.caloriesPer100g,
    proteinPer100g: resolvedFood.proteinPer100g,
    carbsPer100g: resolvedFood.carbsPer100g,
    fatPer100g: resolvedFood.fatPer100g,
    grams,
    settings: {
      cardType: 'meatCutCard',
      subcategory,
      cut,
      cutLabel,
      prep,
      portionMode,
      weightUnit,
      weightValue,
      sizeChoice,
      grams,
    },
  });

  const handleFavoriteAndAdd = () => {
    onAddFavorite(buildFavoriteData());
    handleAddFood();
  };

  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favoriteId, buildFavoriteData());
    if (saved) setIsLocked(true);
  };

  const mode = favoriteId ? (isLocked ? 'locked' : 'editing') : 'browsing';

  return (
    <View style={styles.poultryCard}>
      {/* resolvedFood.name (e.g. "Beef Flank Steak"), same reasoning as
          TrimTierCard's title above. */}
      <Text style={styles.poultryCardTitle}>{resolvedFood.name}</Text>

      <IconPlaceholder iconKey={iconKey} />

      {hasPrepToggle ? (
        <ToggleRow
          label="Prep"
          value={prep}
          onChange={setPrep}
          disabled={isLocked}
          options={[
            { value: 'raw', label: 'Raw' },
            { value: 'cooked', label: 'Cooked' },
          ]}
        />
      ) : null}

      <Text style={styles.poultryPer100g}>
        per 100g: {resolvedFood.caloriesPer100g} kcal · P{resolvedFood.proteinPer100g} C{resolvedFood.carbsPer100g} F
        {resolvedFood.fatPer100g}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.poultrySectionTitle}>Portion</Text>
      <ToggleRow
        value={portionMode}
        onChange={setPortionMode}
        disabled={isLocked}
        options={[
          { value: 'weight', label: 'Enter Weight' },
          { value: 'size', label: 'Small / Medium / Large' },
        ]}
      />

      {portionMode === 'weight' ? (
        <View style={styles.gramsRow}>
          <TextInput
            style={[styles.gramsInput, isLocked && styles.gramsInputDisabled]}
            value={weightValue}
            onChangeText={setWeightValue}
            keyboardType="numeric"
            placeholder={weightUnit}
            editable={!isLocked}
          />
          <ToggleRow
            value={weightUnit}
            onChange={handleWeightUnitChange}
            disabled={isLocked}
            options={[
              { value: 'g', label: 'g' },
              { value: 'oz', label: 'oz' },
            ]}
          />
        </View>
      ) : (
        <View>
          <View style={styles.sizeRow}>
            {['small', 'medium', 'large'].map((s) => (
              <TouchableOpacity
                key={s}
                disabled={isLocked}
                style={[styles.sizeOption, sizeChoice === s && styles.sizeOptionActive, isLocked && styles.sizeOptionDisabled]}
                activeOpacity={0.7}
                onPress={() => setSizeChoice(s)}
              >
                <Text style={[styles.sizeOptionLabel, sizeChoice === s && styles.sizeOptionLabelActive]}>
                  {s === 'small' ? 'Small' : s === 'medium' ? 'Medium' : 'Large'}
                </Text>
                <Text style={[styles.sizeOptionGrams, sizeChoice === s && styles.sizeOptionLabelActive]}>
                  ~{sizes[s]}g
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sizeEstimateNote}>
            Estimated -- USDA doesn't grade meat cuts by size the way it does eggs. Medium is this food's typical
            serving weight; Small/Large are +/-30% around it.
          </Text>
        </View>
      )}

      <Text style={styles.gramsUnit}>{grams > 0 ? `${previewCalories} kcal` : 'Enter an amount above'}</Text>

      <CardActionButtons
        mode={mode}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFavorite={handleFavoriteAndAdd}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// Shown when a favorite's saved food is a plain weight-based item with no
// toggle card of its own -- fruits, grains, and the Poultry/Seafood cuts
// that don't have a toggle card either (Pork Chops, etc.). Locked by
// default (grams shown but not editable) with an Edit button; tapping Edit
// unlocks the grams field so it can be changed and re-saved with "Save
// Changes" -- the same locked/editing shape every toggle card above uses,
// just with a single field instead of a wall of toggles.
//
// Beef's Flank/Skirt/Short Ribs/Shank/Organs/Other used to land here; they
// now have MeatCutCard above, so favorites saved from them re-open as a
// real card. Favorites saved BEFORE that change have no
// settings.cardType, so they still land here -- which is correct, not a
// bug: their saved numbers are intact and editable, they just don't get
// the toggle back.
function FavoriteWeightCard({ favorite, onSaveFavoriteEdit, onAdd }) {
  const [grams, setGrams] = useState(String(favorite.grams));
  const [isLocked, setIsLocked] = useState(true);

  const n = parseFloat(grams) || 0;
  const factor = n / 100;
  const previewCalories = Math.round(favorite.caloriesPer100g * factor);

  const handleAddFood = () => {
    if (n <= 0) return;
    onAdd(
      {
        id: favorite.foodId,
        name: favorite.name,
        servingType: 'weight',
        caloriesPer100g: favorite.caloriesPer100g,
        proteinPer100g: favorite.proteinPer100g,
        carbsPer100g: favorite.carbsPer100g,
        fatPer100g: favorite.fatPer100g,
      },
      n
    );
  };

  const handleSaveChanges = async () => {
    const saved = await onSaveFavoriteEdit(favorite.id, {
      foodId: favorite.foodId,
      name: favorite.name,
      servingType: 'weight',
      caloriesPer100g: favorite.caloriesPer100g,
      proteinPer100g: favorite.proteinPer100g,
      carbsPer100g: favorite.carbsPer100g,
      fatPer100g: favorite.fatPer100g,
      grams: n,
      settings: { ...favorite.settings, cardType: 'weightRow', grams: n },
    });
    if (saved) setIsLocked(true);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sub}>
            per 100g: {favorite.caloriesPer100g} kcal · P{favorite.proteinPer100g} C{favorite.carbsPer100g} F
            {favorite.fatPer100g}
          </Text>
          <View style={styles.gramsRow}>
            <TextInput
              style={[styles.gramsInput, isLocked && styles.gramsInputDisabled]}
              value={grams}
              onChangeText={setGrams}
              keyboardType="numeric"
              editable={!isLocked}
            />
            <Text style={styles.gramsUnit}>g · {previewCalories} kcal</Text>
          </View>
        </View>
      </View>
      <CardActionButtons
        mode={isLocked ? 'locked' : 'editing'}
        onEdit={() => setIsLocked(false)}
        onSaveChanges={handleSaveChanges}
        onAddFood={handleAddFood}
      />
    </View>
  );
}

// Shown when a favorite's saved food is a fixed-serving count food (a
// banana, an egg) -- nothing about a fixed serving can be edited, so this
// is just the full macro breakdown plus "+ Add to Today", no Edit/lock
// mechanics needed (Remove from Favorites already lives on the summary row
// above this, in FavoriteListItem).
function FavoriteCountCard({ favorite, onAdd }) {
  const handleAdd = () =>
    onAdd(
      {
        id: favorite.foodId,
        name: favorite.name,
        servingType: 'count',
        calories: favorite.calories,
        protein: favorite.protein,
        carbs: favorite.carbs,
        fat: favorite.fat,
        servingLabel: favorite.servingLabel,
      },
      1
    );

  return (
    <View style={styles.card}>
      <Text style={styles.sub}>
        {favorite.servingLabel} · {favorite.calories} kcal · P{favorite.protein} C{favorite.carbs} F{favorite.fat}
      </Text>
      <View style={styles.cardActionsRow}>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.6} onPress={handleAdd}>
          <Text style={styles.addBtnText}>+ Add to Today</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// One row in the "My Favorites" tab. Per Damon's spec: shows the saved
// snapshot exactly as saved (not the food's current defaults), a number
// suffix so multiple saved variants of the same food are told apart
// ("Beef Ribeye Steak 1", "Beef Ribeye Steak 2", ... -- numbered starting
// from 1 even when there's only one saved), and tapping the row opens the
// same food card, locked, with an Edit button. "+ Add to Today" and
// "Remove from Favorites" both work straight from the closed summary row
// -- no need to open the card first just to log or delete it.

// Renders whichever food card a given card's rows belong to.
//
// The All tab needs this because it lists every food in the app in one
// list, so tapping an entry has to be able to open ANY of the thirteen card
// types without the user having drilled down to it first. Every prop below
// is derived from the rows themselves rather than from picker state, which
// is what makes that possible.
//
// The card components are unchanged -- this only works out which one to
// call and with what.
function FoodCardFor({ rows, cardKey, pools, onAddFavorite, onAdd }) {
  const f = representativeRow(rows, cardKey);
  const title = cardTitleOf(f, cardKey);
  const common = { onAddFavorite, onAdd };
  switch (f.category) {
    case 'red_meat': {
      const meta = (RED_MEAT_CUTS[f.subcategory] || []).find((c) => c.key === f.cut) ?? null;
      const p = { subcategory: f.subcategory, cut: f.cut, cutLabel: meta?.label ?? title, meatFoods: pools.meat, ...common };
      if (meta?.hasFatTierToggle) return <GroundMeatCard {...p} />;
      if (meta?.hasTrimTierToggle) return <TrimTierCard {...p} />;
      return <MeatCutCard {...p} />;
    }
    case 'poultry': {
      const meta = (POULTRY_CUTS[f.subcategory] || []).find((c) => c.key === f.cut) ?? null;
      return <PoultryCard type={f.subcategory} typeLabel={POULTRY_TYPES.find((t) => t.key === f.subcategory)?.label ?? ''}
        cut={f.cut} cutMeta={meta} cutLabel={meta?.label ?? title} poultryFoods={pools.poultry} {...common} />;
    }
    case 'seafood': {
      const meta = (SEAFOOD_CUTS[f.subcategory] || []).find((c) => c.key === f.cut) ?? null;
      return <SeafoodCard type={f.subcategory} typeLabel={SEAFOOD_SUBCATEGORIES.find((t) => t.key === f.subcategory)?.label ?? ''}
        cut={f.cut} cutMeta={meta} cutLabel={meta?.label ?? title} seafoodFoods={pools.seafood} {...common} />;
    }
    case 'egg': {
      const meta = (EGG_FORMS[f.subcategory] || []).find((x) => x.key === f.form) ?? null;
      return <EggCard birdType={f.subcategory} birdTypeLabel={EGG_TYPES.find((t) => t.key === f.subcategory)?.label ?? ''}
        form={f.form} formMeta={meta} formLabel={meta?.label ?? ''} eggFoods={pools.egg} {...common} />;
    }
    case 'fruit':
      return <FruitCard fruitType={f.cut} fruitTypeLabel={FRUIT_TYPES.find((t) => t.key === f.cut)?.label ?? title}
        fruitTypeFoods={rows} {...common} />;
    case 'vegetable':
      return <VegetableCard vegetableType={f.cut} vegetableTypeLabel={VEGETABLE_TYPES.find((t) => t.key === f.cut)?.label ?? title}
        vegetableTypeFoods={rows} {...common} />;
    case 'dairy': {
      if (f.subcategory === 'milk') return <MilkCard milkFoods={pools.milk} {...common} />;
      if (f.subcategory === 'yogurt') return <YogurtCard dairyFoods={pools.dairy} {...common} />;
      if (f.subcategory === 'butter') return <ButterCard dairyFoods={pools.dairy} {...common} />;
      const isCheese = !!f.cheeseType;
      const isCream = !!f.creamGroup;
      return (
        <DairyVariantCard
          title={isCheese ? (CHEESE_TYPES.find((c) => c.key === f.cheeseType)?.label ?? title)
            : isCream ? (CREAM_GROUPS.find((g) => g.key === f.creamGroup)?.label ?? title) : title}
          rows={rows}
          toggleLabel={isCheese ? (f.variantAxis === 'form' ? 'Form' : 'Fat')
            : isCream ? (CREAM_GROUPS.find((g) => g.key === f.creamGroup)?.toggleLabel || 'Type') : ''}
          variantField={isCheese ? 'cheeseVariant' : isCream ? 'creamLevel' : 'id'}
          variantLabels={(x) => x.name}
          iconKey={(x) =>
            isCheese ? `dairy_cheese_${x.cheeseType}${x.variantAxis === 'form' ? `_${x.cheeseVariant}` : ''}`
              : isCream ? `dairy_cream_${x.creamGroup}` : `dairy_${x.id}`}
          {...common}
        />
      );
    }
    default: {
      const cfg = SIMPLE_CATEGORIES[f.category] || ITEM_CARD_CATEGORIES[f.category] || null;
      if (!cfg) return <WeightFoodRow item={f} onAdd={onAdd} onAddFavorite={onAddFavorite} />;
      // A cross-listed row keeps its source column and icon prefix.
      const crossHit = (cfg.crossFields || []).find(([fl]) => f[fl] !== undefined);
      const itemField = f[cfg.itemField] !== undefined ? cfg.itemField : crossHit?.[0] || cfg.itemField;
      const iconPrefix = f[cfg.itemField] !== undefined ? cfg.iconPrefix : crossHit?.[1] || cfg.iconPrefix;
      return (
        <LegumeCard
          title={title}
          rows={rows}
          hasFormToggle={!!cfg.variantField && rows.some((r) => r[cfg.variantField])}
          variantField={cfg.variantField || 'legumeForm'}
          variantOptions={cfg.varieties}
          iconPrefix={iconPrefix}
          toggleLabel={cfg.toggleLabel || 'Type'}
          variantInIconKey={cfg.variantInIconKey ?? false}
          itemField={itemField}
          {...common}
        />
      );
    }
  }
}


// One entry in the All tab: a summary row that expands into the food's real
// card. The collapsed row shows the same per-100g line the flat list always
// showed, so nothing about reading the list changed -- only that tapping it
// now opens a card with its toggles instead of a bare weight box.



function AllFoodRow({ card, expanded, onToggle, pools, onAddFavorite, onAdd }) {
  const f = card.rep;
  const extra = card.rows.length > 1 ? ` · ${card.rows.length} options` : '';
  return (
    <View style={styles.allCardWrap}>
      <TouchableOpacity style={styles.allCardRow} onPress={onToggle} activeOpacity={0.7}>
        <FoodIcon iconKey={rowIconKeyOf(f)} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.name}>{card.title}</Text>
          <Text style={styles.sub}>
            {f.servingType === 'weight'
              ? `per 100g: ${f.caloriesPer100g} kcal · P${f.proteinPer100g} C${f.carbsPer100g} F${f.fatPer100g}`
              : `${f.servingLabel} · ${f.calories} kcal · P${f.protein} C${f.carbs} F${f.fat}`}
            {extra}
          </Text>
        </View>
        <Text style={styles.allCardChevron}>{expanded ? '⌄' : '›'}</Text>
      </TouchableOpacity>
      {expanded ? (
        <FoodCardFor rows={card.rows} cardKey={card.id} pools={pools} onAddFavorite={onAddFavorite} onAdd={onAdd} />
      ) : null}
    </View>
  );
}

function FavoriteListItem({
  favorite,
  displayNumber,
  expanded,
  onToggleExpand,
  onAdd,
  onSaveFavoriteEdit,
  onRemove,
  meatFoodsAll,
  poultryFoodsAll,
  seafoodFoodsAll,
  eggFoodsAll,
  milkFoodsAll,
  dairyFoodsAll,
  vegetableFoodsAll,
  fruitFoodsAll,
  legumeFoodsAll,
  nutFoodsAll,
  grainFoodsAll,
  fatOilFoodsAll,
  simpleFoodsAllPool,
}) {
  const settings = favorite.settings || {};
  const title = `${favorite.name} ${displayNumber}`;

  const handleRemove = () => {
    Alert.alert(`Remove ${favorite.name} from your favorites?`, undefined, [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => onRemove(favorite.id) },
    ]);
  };

  const handleQuickAdd = () => {
    if (favorite.servingType === 'weight') {
      onAdd(
        {
          id: favorite.foodId,
          name: favorite.name,
          servingType: 'weight',
          caloriesPer100g: favorite.caloriesPer100g,
          proteinPer100g: favorite.proteinPer100g,
          carbsPer100g: favorite.carbsPer100g,
          fatPer100g: favorite.fatPer100g,
        },
        favorite.grams
      );
    } else {
      onAdd(
        {
          id: favorite.foodId,
          name: favorite.name,
          servingType: 'count',
          calories: favorite.calories,
          protein: favorite.protein,
          carbs: favorite.carbs,
          fat: favorite.fat,
          servingLabel: favorite.servingLabel,
        },
        1
      );
    }
  };

  const summaryDetail =
    favorite.servingType === 'weight'
      ? `per 100g: ${favorite.caloriesPer100g} kcal · P${favorite.proteinPer100g} C${favorite.carbsPer100g} F${favorite.fatPer100g} · ${favorite.grams}g`
      : `${favorite.servingLabel} · ${favorite.calories} kcal`;

  return (
    <View style={styles.favoriteListItem}>
      <TouchableOpacity style={styles.favoriteSummaryRow} activeOpacity={0.6} onPress={onToggleExpand}>
        <FoodIcon iconKey={iconKeyForFoodId(foods, favorite.foodId)} style={styles.rowIconSpacing} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {expanded ? '▾' : '▸'} {title}
          </Text>
          <Text style={styles.sub}>{summaryDetail}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.cardActionsRow}>
        <TouchableOpacity style={styles.favBtn} activeOpacity={0.6} onPress={handleRemove}>
          <Text style={styles.favBtnText}>Remove from Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.6} onPress={handleQuickAdd}>
          <Text style={styles.addBtnText}>+ Add to Today</Text>
        </TouchableOpacity>
      </View>

      {expanded ? (
        <View style={styles.favoriteExpandedCard}>
          {settings.cardType === 'groundMeatCard' || settings.cardType === 'beefGroundCard' ? (
            <GroundMeatCard
              subcategory={settings.subcategory || 'beef'}
              cutLabel={settings.cutLabel}
              meatFoods={meatFoodsAll}
              initialSettings={settings}
              favoriteId={favorite.id}
              locked
              onSaveFavoriteEdit={onSaveFavoriteEdit}
              onAdd={onAdd}
            />
          ) : settings.cardType === 'trimTierCard' || settings.cardType === 'beefSteakCard' ? (
            <TrimTierCard
              subcategory={settings.subcategory || 'beef'}
              cut={settings.cut}
              cutLabel={settings.cutLabel}
              meatFoods={meatFoodsAll}
              initialSettings={settings}
              favoriteId={favorite.id}
              locked
              onSaveFavoriteEdit={onSaveFavoriteEdit}
              onAdd={onAdd}
            />
          ) : settings.cardType === 'meatCutCard' ? (
            // Guarded because this is the one path that can outlive its
            // data: a favorite saved against a cut whose rows later get
            // deleted (v0.0.42 removed two bogus Processed & Deli rows)
            // would hand MeatCutCard an empty list and crash it on
            // resolvedFood.typicalGrams. Browsing can't reach that state --
            // availableCuts only lists cuts that still have rows -- so the
            // fallback is here rather than inside the card, where an early
            // return would sit above the remaining hooks.
            meatFoodsAll.some((f) => f.subcategory === settings.subcategory && f.cut === settings.cut) ? (
              <MeatCutCard
                subcategory={settings.subcategory}
                cut={settings.cut}
                cutLabel={settings.cutLabel}
                meatFoods={meatFoodsAll}
                initialSettings={settings}
                favoriteId={favorite.id}
                locked
                onSaveFavoriteEdit={onSaveFavoriteEdit}
                onAdd={onAdd}
              />
            ) : (
              <FavoriteWeightCard favorite={favorite} onSaveFavoriteEdit={onSaveFavoriteEdit} onAdd={onAdd} />
            )
          ) : settings.cardType === 'poultryCard' ? (
            <PoultryCard
              type={settings.type}
              typeLabel={settings.typeLabel}
              cut={settings.cut}
              cutMeta={settings.cutMeta}
              cutLabel={settings.cutLabel}
              poultryFoods={poultryFoodsAll}
              initialSettings={settings}
              favoriteId={favorite.id}
              locked
              onSaveFavoriteEdit={onSaveFavoriteEdit}
              onAdd={onAdd}
            />
          ) : settings.cardType === 'seafoodCard' ? (
            <SeafoodCard
              type={settings.type}
              typeLabel={settings.typeLabel}
              cut={settings.cut}
              cutMeta={settings.cutMeta}
              cutLabel={settings.cutLabel}
              seafoodFoods={seafoodFoodsAll}
              initialSettings={settings}
              favoriteId={favorite.id}
              locked
              onSaveFavoriteEdit={onSaveFavoriteEdit}
              onAdd={onAdd}
            />
          ) : settings.cardType === 'eggCard' ? (
            <EggCard
              birdType={settings.birdType}
              birdTypeLabel={settings.birdTypeLabel}
              form={settings.form}
              formMeta={settings.formMeta}
              formLabel={settings.formLabel}
              eggFoods={eggFoodsAll}
              initialSettings={settings}
              favoriteId={favorite.id}
              locked
              onSaveFavoriteEdit={onSaveFavoriteEdit}
              onAdd={onAdd}
            />
          ) : settings.cardType === 'milkCard' ? (
            <MilkCard
              milkFoods={milkFoodsAll}
              initialSettings={settings}
              favoriteId={favorite.id}
              locked
              onSaveFavoriteEdit={onSaveFavoriteEdit}
              onAdd={onAdd}
            />
          ) : settings.cardType === 'yogurtCard' ? (
            <YogurtCard
              dairyFoods={dairyFoodsAll}
              initialSettings={settings}
              favoriteId={favorite.id}
              locked
              onSaveFavoriteEdit={onSaveFavoriteEdit}
              onAdd={onAdd}
            />
          ) : settings.cardType === 'butterCard' ? (
            <ButterCard
              dairyFoods={dairyFoodsAll}
              initialSettings={settings}
              favoriteId={favorite.id}
              locked
              onSaveFavoriteEdit={onSaveFavoriteEdit}
              onAdd={onAdd}
            />
          ) : settings.cardType === 'dairyVariantCard' ? (
            // Re-opens whichever group the saved row belonged to -- its
            // cheese, its cream sub-product, or just itself for a
            // standalone item -- by looking the row back up from its id.
            (() => {
              const saved = dairyFoodsAll.find((f) => f.id === settings.dairyFoodId);
              if (!saved) return <FavoriteWeightCard favorite={favorite} onSaveFavoriteEdit={onSaveFavoriteEdit} onAdd={onAdd} />;
              const rows = saved.cheeseType
                ? dairyFoodsAll.filter((f) => f.cheeseType === saved.cheeseType)
                : saved.creamGroup
                  ? dairyFoodsAll.filter((f) => f.creamGroup === saved.creamGroup)
                  : [saved];
              const field = saved.cheeseType ? 'cheeseVariant' : saved.creamGroup ? 'creamLevel' : 'id';
              return (
                <DairyVariantCard
                  title={saved.name}
                  rows={rows}
                  toggleLabel={saved.cheeseType ? (saved.variantAxis === 'form' ? 'Form' : 'Fat') : 'Type'}
                  variantField={field}
                  variantLabels={(f) => f.name}
                  iconKey={(f) =>
                    f.cheeseType
                      ? `dairy_cheese_${f.cheeseType}${f.variantAxis === 'form' ? `_${f.cheeseVariant}` : ''}`
                      : f.creamGroup
                        ? `dairy_cream_${f.creamGroup}${f.creamGroup === 'sour_cream' ? '' : `_${f.creamLevel.replace(/_ff$/, '')}`}`
                        : `dairy_${f.id}`
                  }
                  initialSettings={settings}
                  favoriteId={favorite.id}
                  locked
                  onSaveFavoriteEdit={onSaveFavoriteEdit}
                  onAdd={onAdd}
                />
              );
            })()
          ) : settings.cardType === 'legumeCard' ? (
            // Re-opens the saved row's whole item group so the Form toggle
            // still works from My Favorites, not just the single row.
            (() => {
              const saved =
                legumeFoodsAll.find((f) => f.id === settings.legumeFoodId) ||
                nutFoodsAll.find((f) => f.id === settings.legumeFoodId) ||
                grainFoodsAll.find((f) => f.id === settings.legumeFoodId) ||
                fatOilFoodsAll.find((f) => f.id === settings.legumeFoodId) ||
                simpleFoodsAllPool.find((f) => f.id === settings.legumeFoodId);
              if (!saved) return <FavoriteWeightCard favorite={favorite} onSaveFavoriteEdit={onSaveFavoriteEdit} onAdd={onAdd} />;
              // A v0.0.43 favorite saved which column its item key lives
              // in, so it reopens through one path regardless of category.
              if (settings.itemField) {
                const rows = simpleFoodsAllPool.filter(
                  (f) => f[settings.itemField] === settings.itemKey && f.category === saved.category
                );
                const varField = Object.values(SIMPLE_CATEGORIES).find(
                  (c) => c.itemField === settings.itemField
                )?.variantField;
                const varOpts = Object.values(SIMPLE_CATEGORIES).find(
                  (c) => c.itemField === settings.itemField
                )?.varieties || [];
                return (
                  <LegumeCard
                    title={saved.name}
                    rows={rows.length ? rows : [saved]}
                    hasFormToggle={!!varField && rows.some((r) => r[varField])}
                    variantField={varField || 'legumeForm'}
                    variantOptions={varOpts}
                    iconPrefix={settings.iconPrefix || 'sweet'}
                    toggleLabel={settings.toggleLabelSaved || 'Type'}
                    variantInIconKey={false}
                    itemField={settings.itemField}
                    initialSettings={settings}
                    favoriteId={favorite.id}
                    locked
                    onSaveFavoriteEdit={onSaveFavoriteEdit}
                    onAdd={onAdd}
                  />
                );
              }
              const isNut = !!saved.nutItem;
              const isGrain = !!saved.grainItem;
              const isFat = !!saved.fatItem;
              const pool = isFat ? fatOilFoodsAll : isGrain ? grainFoodsAll : isNut ? nutFoodsAll : legumeFoodsAll;
              const rows = pool.filter((f) =>
                isFat
                  ? f.fatItem === saved.fatItem
                  : isGrain
                    ? f.grainItem === saved.grainItem
                    : isNut
                      ? f.nutItem === saved.nutItem
                      : f.legumeItem === saved.legumeItem
              );
              return (
                <LegumeCard
                  title={saved.name}
                  rows={rows}
                  hasFormToggle={
                    isFat
                      ? rows.some((r) => r.fatLevel)
                      : isGrain
                        ? rows.some((r) => r.grainForm)
                        : isNut
                          ? rows.some((r) => r.nutPrep)
                          : !!saved.legumeForm
                  }
                  variantField={isFat ? 'fatLevel' : isGrain ? 'grainForm' : isNut ? 'nutPrep' : 'legumeForm'}
                  variantOptions={isFat ? FAT_LEVELS : isGrain ? GRAIN_FORMS : isNut ? NUT_PREPS : LEGUME_FORMS}
                  iconPrefix={isFat ? 'fatoil' : isGrain ? 'grain' : isNut ? 'nutseed' : 'legume'}
                  toggleLabel={isFat ? 'Fat Level' : isNut ? 'Preparation' : 'Form'}
                  variantInIconKey={!isFat}
                  initialSettings={settings}
                  favoriteId={favorite.id}
                  locked
                  onSaveFavoriteEdit={onSaveFavoriteEdit}
                  onAdd={onAdd}
                />
              );
            })()
          ) : settings.cardType === 'fruitCard' ? (
            <FruitCard
              fruitType={settings.fruitType}
              fruitTypeLabel={settings.fruitTypeLabel}
              fruitTypeFoods={fruitFoodsAll.filter((f) => f.cut === settings.fruitType)}
              initialSettings={settings}
              favoriteId={favorite.id}
              locked
              onSaveFavoriteEdit={onSaveFavoriteEdit}
              onAdd={onAdd}
            />
          ) : settings.cardType === 'vegetableCard' ? (
            <VegetableCard
              vegetableType={settings.vegetableType}
              vegetableTypeLabel={settings.vegetableTypeLabel}
              vegetableTypeFoods={vegetableFoodsAll.filter((f) => f.cut === settings.vegetableType)}
              initialSettings={settings}
              favoriteId={favorite.id}
              locked
              onSaveFavoriteEdit={onSaveFavoriteEdit}
              onAdd={onAdd}
            />
          ) : favorite.servingType === 'weight' ? (
            <FavoriteWeightCard favorite={favorite} onSaveFavoriteEdit={onSaveFavoriteEdit} onAdd={onAdd} />
          ) : (
            <FavoriteCountCard favorite={favorite} onAdd={onAdd} />
          )}
        </View>
      ) : null}
    </View>
  );
}


export default function LogFoodScreen({
  onAddEntry,
  onDeleteEntry,
  favorites = [],
  onAddFavorite,
  onUpdateFavorite,
  onRemoveFavorite,
  // Test-only, same reasoning as QuizScreen.js's initialAnswers/
  // initialStepIndex — lets the local render-test harness render straight
  // into the "My Favorites" filter without needing to simulate a real tap
  // on the chip (renderToStaticMarkup is a single static pass, it can't
  // run event handlers).
  initialCategory = 'all',
  // Test-only, same reasoning as initialCategory above — lets the render
  // test harness jump straight into the Cuts step or the final Foods step
  // of the Red Meat picker without simulating the taps that would normally
  // get you there (renderToStaticMarkup can't run event handlers).
  initialMeatSubcategory = null,
  initialMeatCut = null,
  // Test-only, same reasoning as initialMeatSubcategory/initialMeatCut —
  // lets the render test harness jump straight into the Poultry picker's
  // Cuts step or its final toggle-card step.
  initialPoultryType = null,
  initialPoultryCut = null,
  // Test-only, same reasoning as initialMeatSubcategory/initialMeatCut —
  // lets the render test harness jump straight into the Seafood picker's
  // Species step or its final Foods step.
  initialSeafoodSubcategory = null,
  initialSeafoodCut = null,
  // Test-only, same reasoning as initialMeatSubcategory/initialMeatCut --
  // lets the render test harness jump straight into the Fruit picker's
  // Fruit step or its final flat Foods step.
  initialFruitType = null,
  // Test-only, same reasoning as initialMeatSubcategory/initialMeatCut --
  // lets the render test harness jump straight into the Eggs picker's Form
  // step or its final toggle-card step.
  initialEggType = null,
  initialEggForm = null,
  // Test-only, same reasoning as initialMeatSubcategory/initialMeatCut --
  // lets the render test harness jump straight into the Dairy picker's
  // final flat Foods step.
  initialDairyType = null,
  // Test-only, same reasoning as the other initial* props above -- lets
  // the render test harness jump straight into the Milk toggle card
  // without simulating the "Milk" row's tap.
  initialMilkCardOpen = false,
  // Test-only, same reasoning as the other initial* props above -- lets the
  // render test harness jump straight into the Vegetables picker's final
  // flat Foods step for a given vegetable.
  initialVegetableType = null,
  initialQuery = '',
  // Test-only, same reasoning as the other initial* props above — lets the
  // render test harness seed My Favorites' expanded-card state directly,
  // since renderToStaticMarkup can't simulate tapping a favorite row open.
  initialExpandedFavoriteId = null,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  // Red Meat — which Type (Beef, Pork, ...) and Cut (Ribeye, Chuck, ...)
  // the user has drilled into, one screen at a time, instead of one long
  // flat list. Both reset whenever the category chip changes, including
  // switching away from and back to Red Meat itself.
  const [meatSubcategory, setMeatSubcategory] = useState(initialMeatSubcategory);
  const [meatCut, setMeatCut] = useState(initialMeatCut);
  // Poultry — same drill-down idea as Red Meat, but the final step is a
  // toggle card (skin/bone/prep + portion) instead of a list of foods, see
  // PoultryCard above.
  const [poultryType, setPoultryType] = useState(initialPoultryType);
  const [poultryCut, setPoultryCut] = useState(initialPoultryCut);
  // Seafood — same simple two-step drill-down as Red Meat (Type > Species >
  // raw/cooked, no toggle card — see data/foods.js's header comment for why
  // seafood doesn't need Poultry's skin/bone treatment).
  const [seafoodSubcategory, setSeafoodSubcategory] = useState(initialSeafoodSubcategory);
  const [seafoodCut, setSeafoodCut] = useState(initialSeafoodCut);
  // Fruit -- same idea as Red Meat's Type > Cut, just renamed to match
  // Fruit -- one drill-down step (pick the fruit), then FruitCard. Form
  // (Fresh/Dried/Canned/Frozen) used to be a step BEFORE the fruit, which
  // meant choosing "Dried" before knowing which fruits had dried data; as
  // of v0.0.35 it's a toggle on the card instead, matching Vegetables.
  // Variety (Fuji vs Gala) is a second toggle there rather than a picker
  // step, same as before. See FruitCard's header comment.
  const [fruitType, setFruitType] = useState(initialFruitType);
  // Eggs -- same two-step drill-down shape as Poultry (Bird Type > Form >
  // toggle card), just with Form standing in for Cut (Whole Egg/Egg White
  // Only/Egg Yolk Only instead of Breast/Thigh/...) -- see EggCard's header
  // comment for how its toggle-card step differs from Poultry's.
  const [eggType, setEggType] = useState(initialEggType);
  const [eggForm, setEggForm] = useState(initialEggForm);
  // Dairy -- same one-step drill-down shape as Fruit's Form/Fruit steps,
  // just collapsed to a single Type step (Milk/Cheese/Yogurt/Cream &
  // Creamers/Butter) since Dairy has no second axis every Type shares the
  // way Fruit's Form (Fresh/Dried/Canned/Frozen) does -- see
  // data/dairyHierarchy.js's header comment. Every Type except Milk has no
  // toggle card, same as Fruit -- Milk is the one exception (see
  // milkCardOpen below and MilkCard's header comment).
  const [dairyType, setDairyType] = useState(initialDairyType);
  // Whether the Milk row (the one row in the Milk Type's list that opens a
  // toggle card instead of adding directly, see the 'dairyFoods' render
  // block below) has been tapped open. Only meaningful while
  // dairyType === 'milk' -- reset alongside every other drill-down state
  // on category change, and separately whenever dairyType itself changes
  // (covers "Back to Dairy Types" and any future path that leaves Milk
  // without going through the category-change effect).
  const [milkCardOpen, setMilkCardOpen] = useState(initialMilkCardOpen);
  // v0.0.37: Cheese gets a third drill-down level (Dairy > Cheese > Cheddar)
  // and Cream & Creamers a sub-product step, so both need their own
  // selection state. `dairyItemId` covers the standalone one-row products
  // (Buttermilk, Kefir, Goat Milk, Condensed Milk) that open their own card.
  const [cheeseType, setCheeseType] = useState(null);
  const [creamGroup, setCreamGroup] = useState(null);
  const [dairyItemId, setDairyItemId] = useState(null);
  // Vegetables -- Damon's explicit call for v0.0.25: no grouping layer at
  // all (the old "13 Types" plan got scrapped before any code was
  // written -- see docs/vegetables-category-plan.md). Category > Vegetable,
  // one drill-down step, same shape as Dairy's Type step but standing in
  // for all ~80 vegetables instead of 5 -- see data/vegetableHierarchy.js's
  // header comment. As of v0.0.26, the final step is VegetableCard (a
  // toggle-card, see its header comment above) instead of the plain flat
  // list of food rows this used through v0.0.25.
  const [vegetableType, setVegetableType] = useState(initialVegetableType);
  // Legumes -- Type (Beans/Lentils/...) then, for the Types that have a
  // sub-list, which item. Lentils and Chickpeas skip the item step: each is
  // one food, so its Type goes straight to a card.
  const [legumeType, setLegumeType] = useState(null);
  const [legumeItem, setLegumeItem] = useState(null);
  // Nuts & Seeds -- same two-step shape as Legumes' itemList Types.
  const [nutType, setNutType] = useState(null);
  const [nutItem, setNutItem] = useState(null);
  const [grainType, setGrainType] = useState(null);
  const [grainItem, setGrainItem] = useState(null);
  // Fats & Oils -- same two-step shape, except the Butter & Ghee Type goes
  // straight to Dairy's ButterCard instead of an item list, because its
  // rows physically live in data/foodsDairy.js and only reach this tab by
  // cross-listing. See data/fatOilHierarchy.js's header comment.
  // One pair of state variables for all seven v0.0.43 categories -- which
  // Type is open and which item, same as every other category, just shared.
  const [simpleType, setSimpleType] = useState(null);
  const [simpleItem, setSimpleItem] = useState(null);
  // Which All-tab card is open. One at a time, same as My Favorites.
  const [expandedCardKey, setExpandedCardKey] = useState(null);
  const [fatOilType, setFatOilType] = useState(null);
  const [fatOilItem, setFatOilItem] = useState(null);
  useEffect(() => {
    setMeatSubcategory(null);
    setMeatCut(null);
    setPoultryType(null);
    setPoultryCut(null);
    setSeafoodSubcategory(null);
    setSeafoodCut(null);
    setFruitType(null);
    setEggType(null);
    setEggForm(null);
    setDairyType(null);
    setMilkCardOpen(false);
    setCheeseType(null);
    setCreamGroup(null);
    setDairyItemId(null);
    setVegetableType(null);
    setLegumeType(null);
    setLegumeItem(null);
    setNutType(null);
    setNutItem(null);
    setGrainType(null);
    setGrainItem(null);
    setFatOilType(null);
    setFatOilItem(null);
    setSimpleType(null);
    setSimpleItem(null);
    setExpandedCardKey(null);
  }, [category]);
  useEffect(() => {
    setLegumeItem(null);
  }, [legumeType]);
  useEffect(() => {
    setNutItem(null);
  }, [nutType]);
  useEffect(() => {
    setGrainItem(null);
  }, [grainType]);
  useEffect(() => {
    setFatOilItem(null);
  }, [fatOilType]);
  useEffect(() => {
    setSimpleItem(null);
  }, [simpleType]);
  useEffect(() => {
    setMilkCardOpen(false);
    // Without these, switching Type while a cheese/cream/item was open
    // would drop you straight back onto that stale card instead of the new
    // Type's list -- dairyItemId in particular short-circuits listMode.
    setCheeseType(null);
    setCreamGroup(null);
    setDairyItemId(null);
  }, [dairyType]);

  const [toast, setToast] = useState(null); // { message, entryId } | null
  const toastTimer = useRef(null);
  // Which favorite (if any) is currently expanded open in the My Favorites
  // tab, showing its full locked food card underneath the summary row —
  // see FavoriteListItem. Only one open at a time, same idea as
  // TrimTierCard's gradeExpanded, so the list doesn't turn into a wall of
  // open cards.
  const [expandedFavoriteId, setExpandedFavoriteId] = useState(initialExpandedFavoriteId);

  const results = filterByCategory(filterFoods(foods, query), category);

  // Every saved favorite, oldest-saved-first (see utils/db.js's
  // fetchFavoriteFoods), numbered per FOOD NAME -- "Beef Ribeye Steak 1",
  // "Beef Ribeye Steak 2", etc., starting from 1 even when there's only one
  // saved variant of that food. Grouped by `name` rather than `foodId`
  // deliberately -- Damon's own example saves a Ribeye trimmed AND a
  // Ribeye untrimmed and expects them numbered "1"/"2" together, but
  // trimmed vs. untrimmed are two different underlying database rows
  // (different foodId), so foodId can't be the grouping key. `name` is
  // always the same across every toggle combination of the same food (see
  // each card's buildFavoriteData -- TrimTierCard/GroundMeatCard/
  // PoultryCard/SeafoodCard all set `name` to the food's plain display
  // name, never anything trim/grade/skin-specific), so it's what actually
  // matches "the same food, saved a different way" the way Damon means it.
  // Numbers are computed here rather than stored in the database, so
  // removing one favorite doesn't leave a gap (e.g. "1, 3" after deleting
  // "2") -- they always read as a clean consecutive count of however many
  // variants of that food exist right now.
  const favoritesWithNumbers = (() => {
    const counts = {};
    return favorites.map((f) => {
      counts[f.name] = (counts[f.name] || 0) + 1;
      return { ...f, displayNumber: counts[f.name] };
    });
  })();
  const favoritesFiltered = query.trim()
    ? favoritesWithNumbers.filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase()))
    : favoritesWithNumbers;

  // Unconditional (unlike meatFoods/poultryFoods/seafoodFoods below, which
  // only populate while actually browsing that category) -- FavoriteListItem
  // needs these to re-open a saved Beef/Poultry/Seafood toggle card from
  // ANY tab, not just while browsing that category's picker.
  const meatFoodsAll = foods.filter((f) => f.category === 'red_meat');
  const poultryFoodsAll = foods.filter((f) => f.category === 'poultry');
  const seafoodFoodsAll = foods.filter((f) => f.category === 'seafood');
  const eggFoodsAll = foods.filter((f) => f.category === 'egg');
  const milkFoodsAll = foods.filter((f) => f.category === 'dairy' && f.milkFatLevel);
  // Every dairy row, not just the 8 milk ones -- YogurtCard, ButterCard and
  // DairyVariantCard all need to re-open from My Favorites, and milkFoodsAll
  // is deliberately narrowed to rows carrying milkFatLevel.
  const dairyFoodsAll = foods.filter((f) => f.category === 'dairy');
  // Same "unconditional, for FavoriteListItem" reasoning as the others above
  // -- VegetableCard needs to re-open from My Favorites too. filterByCategory
  // rather than a plain f.category === 'vegetable' check, same reasoning as
  // vegetableFoods below (picks up the 7 reused cross-listed Fruit rows).
  const vegetableFoodsAll = filterByCategory(foods, 'vegetable');
  const legumeFoodsAll = filterByCategory(foods, 'legume');
  // filterByCategory (not a plain category check) so the dual
  // fruit/vegetable rows -- Avocado, Tomato, Bell Peppers, Cucumber,
  // Zucchini, Pumpkin, Eggplant -- reach FruitCard from a saved favorite
  // too, via crossListCategories.
  const fruitFoodsAll = filterByCategory(foods, 'fruit');

  // Typing a search term always wins over the Red Meat picker — searching
  // for something specific is a clearer signal than whatever drill-down
  // step you happened to be on, so a non-empty query shows normal flat
  // search results (across every category, same as always) instead.
  const isBrowsingMeat = category === 'red_meat' && !query.trim();
  const meatFoods = isBrowsingMeat ? foods.filter((f) => f.category === 'red_meat') : [];
  // Only ever show a Type/Cut if at least one food actually exists under
  // it — keeps the picker from dead-ending on an empty screen.
  const availableSubcats = RED_MEAT_SUBCATEGORIES.filter((s) =>
    meatFoods.some((f) => f.subcategory === s.key)
  );
  const availableCuts = meatSubcategory
    ? (RED_MEAT_CUTS[meatSubcategory] || []).filter((c) =>
        meatFoods.some((f) => f.subcategory === meatSubcategory && f.cut === c.key)
      )
    : [];
  const cutFoods =
    meatSubcategory && meatCut
      ? meatFoods.filter((f) => f.subcategory === meatSubcategory && f.cut === meatCut)
      : [];
  const subcategoryLabel = RED_MEAT_SUBCATEGORIES.find((s) => s.key === meatSubcategory)?.label ?? '';
  const cutLabel = (RED_MEAT_CUTS[meatSubcategory] || []).find((c) => c.key === meatCut)?.label ?? '';

  // Same idea as the Red Meat picker above, but for Poultry — see
  // data/foods.js's header comment and PoultryCard (top of this file) for
  // why the final step here is a toggle card instead of a list of foods.
  const isBrowsingPoultry = category === 'poultry' && !query.trim();
  const poultryFoods = isBrowsingPoultry ? foods.filter((f) => f.category === 'poultry') : [];
  const availablePoultryTypes = POULTRY_TYPES.filter((t) =>
    poultryFoods.some((f) => f.subcategory === t.key)
  );
  const availablePoultryCuts = poultryType
    ? (POULTRY_CUTS[poultryType] || []).filter((c) =>
        poultryFoods.some((f) => f.subcategory === poultryType && f.cut === c.key)
      )
    : [];
  const poultryTypeLabel = POULTRY_TYPES.find((t) => t.key === poultryType)?.label ?? '';
  const poultryCutMeta = (POULTRY_CUTS[poultryType] || []).find((c) => c.key === poultryCut) ?? null;
  const poultryCutLabel = poultryCutMeta?.label ?? '';

  // Seafood — same drill-down shape as Poultry above (Type > Species > a
  // toggle card), just without a fallback resolver/matchNote since every
  // species' raw/cooked pair is always complete (see SeafoodCard's own
  // comment for the Shell On/Off toggle, Seafood's equivalent of Poultry's
  // skin toggle but doing weight math instead of switching food entries).
  const isBrowsingSeafood = category === 'seafood' && !query.trim();
  const seafoodFoods = isBrowsingSeafood ? foods.filter((f) => f.category === 'seafood') : [];
  const availableSeafoodSubcats = SEAFOOD_SUBCATEGORIES.filter((s) =>
    seafoodFoods.some((f) => f.subcategory === s.key)
  );
  const availableSeafoodCuts = seafoodSubcategory
    ? (SEAFOOD_CUTS[seafoodSubcategory] || []).filter((c) =>
        seafoodFoods.some((f) => f.subcategory === seafoodSubcategory && f.cut === c.key)
      )
    : [];
  const seafoodSubcategoryLabel = SEAFOOD_SUBCATEGORIES.find((s) => s.key === seafoodSubcategory)?.label ?? '';
  const seafoodCutMeta = (SEAFOOD_CUTS[seafoodSubcategory] || []).find((c) => c.key === seafoodCut) ?? null;
  const seafoodCutLabel = seafoodCutMeta?.label ?? '';

  // Fruit -- one drill-down step (pick the fruit) then FruitCard, which
  // carries the Form and Variety toggles; see its header comment. Uses
  // filterByCategory rather than a plain f.category === 'fruit' check so
  // the dual fruit/vegetable items (Avocado, Tomato, Bell Peppers,
  // Cucumber, Zucchini, Pumpkin, Eggplant) show up here too via their
  // crossListCategories tag even though their primary category is
  // 'vegetable' -- see utils/nutrition.js's filterByCategory.
  const isBrowsingFruit = category === 'fruit' && !query.trim();
  const fruitFoods = isBrowsingFruit ? filterByCategory(foods, 'fruit') : [];
  // As of v0.0.35 Form is a toggle ON the card, not a drill-down step, so
  // the type list is every fruit with ANY data rather than every fruit with
  // data in one pre-picked form. FruitCard works out which forms to offer.
  const availableFruitTypes = FRUIT_TYPES.filter((t) => fruitFoods.some((food) => food.cut === t.key));
  const fruitTypeFoods = fruitType ? fruitFoods.filter((food) => food.cut === fruitType) : [];
  const fruitTypeLabel = FRUIT_TYPES.find((t) => t.key === fruitType)?.label ?? '';

  // Eggs -- same drill-down shape as Poultry (Type > Cut > toggle card),
  // just Cut renamed Form. See data/eggHierarchy.js and EggCard above.
  const isBrowsingEgg = category === 'egg' && !query.trim();
  const eggFoods = isBrowsingEgg ? foods.filter((f) => f.category === 'egg') : [];
  const availableEggTypes = EGG_TYPES.filter((t) => eggFoods.some((f) => f.subcategory === t.key));
  const availableEggForms = eggType
    ? (EGG_FORMS[eggType] || []).filter((f) => eggFoods.some((food) => food.subcategory === eggType && food.form === f.key))
    : [];
  const eggTypeLabel = EGG_TYPES.find((t) => t.key === eggType)?.label ?? '';
  // Duck/Goose/Quail/Turkey only ever have ONE real Form (Whole Egg) --
  // showing a Forms list with a single row in it is a dead-end tap for
  // nothing, so a Bird Type with exactly one available Form skips straight
  // to its card instead of making the user pick from a list of one. This
  // is the effective Form either way -- eggForm itself (the user's actual
  // tap, for birds with a real choice like Chicken) if set, otherwise the
  // sole available Form when there's only one. See the listMode ladder and
  // the Back button below for the other half of this (skipping the Forms
  // step also means Back from the card goes straight to Bird Types, not to
  // a Forms list that was never shown).
  const effectiveEggForm = eggForm || (availableEggForms.length === 1 ? availableEggForms[0].key : null);
  const eggFormMeta = (EGG_FORMS[eggType] || []).find((f) => f.key === effectiveEggForm) ?? null;
  const eggFormLabel = eggFormMeta?.label ?? '';

  // Dairy -- same drill-down shape as Fruit's Form/Fruit steps, just one
  // step (Type) instead of two -- see the dairyType state comment above.
  // Uses filterByCategory rather than a plain f.category === 'dairy' check
  // so Butter still shows up here even though it's cross-listed into
  // Fats & Oils too (crossListCategories doesn't affect its home tab).
  const isBrowsingDairy = category === 'dairy' && !query.trim();
  const dairyFoods = isBrowsingDairy ? filterByCategory(foods, 'dairy') : [];
  const availableDairyTypes = DAIRY_TYPES.filter((t) => dairyFoods.some((food) => food.subcategory === t.key));
  // Milk's 8 Fat %/Lactose Free rows (milkFatLevel set) are pulled OUT of
  // the flat Milk Type list here -- they're rendered through the "Milk"
  // card-trigger row + MilkCard instead (see the 'dairyFoods' render block
  // below), not as 8 separate flat rows. Every other Type is unaffected
  // (milkFatLevel is only ever set on Milk's cow-milk rows).
  const dairyTypeFoods = dairyType ? dairyFoods.filter((food) => food.subcategory === dairyType && !food.milkFatLevel) : [];
  const dairyTypeLabel = DAIRY_TYPES.find((t) => t.key === dairyType)?.label ?? '';
  // --- Legumes ---
  const isBrowsingLegume = category === 'legume' && !query.trim();
  const legumeFoods = isBrowsingLegume ? filterByCategory(foods, 'legume') : [];
  const availableLegumeTypes = LEGUME_TYPES.filter((t) => legumeFoods.some((f) => f.subcategory === t.key));
  const legumeTypeMeta = LEGUME_TYPES.find((t) => t.key === legumeType) ?? null;
  const legumeTypeLabel = legumeTypeMeta?.label ?? '';
  const availableLegumeItems = (LEGUME_ITEMS[legumeType] || []).filter((i) =>
    legumeFoods.some((f) => f.legumeItem === i.key)
  );
  // For a 'card'-shaped Type (Lentils, Chickpeas) every row of that Type is
  // the one food, so there's no item to pick.
  const legumeCardRows =
    legumeTypeMeta?.shape === 'card'
      ? legumeFoods.filter((f) => f.subcategory === legumeType)
      : legumeItem
        ? legumeFoods.filter((f) => f.legumeItem === legumeItem)
        : [];
  // --- Grains ---
  const isBrowsingGrain = category === 'grain' && !query.trim();
  const grainFoods = isBrowsingGrain ? filterByCategory(foods, 'grain') : [];
  const grainFoodsAll = filterByCategory(foods, 'grain');
  const availableGrainTypes = GRAIN_TYPES.filter((t) => grainFoods.some((f) => f.subcategory === t.key));
  const grainTypeMeta = GRAIN_TYPES.find((t) => t.key === grainType) ?? null;
  const grainTypeLabel = grainTypeMeta?.label ?? '';
  const availableGrainItems = (GRAIN_ITEMS[grainType] || []).filter((i) =>
    grainFoods.some((f) => f.grainItem === i.key)
  );
  const grainCardRows = grainItem ? grainFoods.filter((f) => f.grainItem === grainItem) : [];
  const grainItemLabel = (GRAIN_ITEMS[grainType] || []).find((i) => i.key === grainItem)?.label ?? '';

  // --- Fats & Oils ---
  // `fatOilFoods` here includes the six Butter/Ghee rows that live in
  // data/foodsDairy.js, because filterByCategory honours
  // crossListCategories -- that's what lights up the Butter & Ghee Type
  // below without duplicating those rows into data/foodsFatsOils.js.
  const isBrowsingFatOil = category === 'fat_oil' && !query.trim();
  const fatOilFoods = isBrowsingFatOil ? filterByCategory(foods, 'fat_oil') : [];
  const fatOilFoodsAll = filterByCategory(foods, 'fat_oil');
  // Every row from the seven v0.0.43 categories, for reopening a saved
  // favorite whichever of them it came from.
  const simpleFoodsAllPool = foods.filter((f) => !!SIMPLE_CATEGORIES[f.category]);
  // The pools FoodCardFor hands to whichever card it opens. Built once
  // here rather than inside the row so every expanded card shares them.
  const cardPools = useMemo(
    () => ({ meat: meatFoodsAll, poultry: poultryFoodsAll, seafood: seafoodFoodsAll,
      egg: eggFoodsAll, milk: milkFoodsAll, dairy: dairyFoodsAll }),
    [meatFoodsAll, poultryFoodsAll, seafoodFoodsAll, eggFoodsAll, milkFoodsAll, dairyFoodsAll]
  );
  const availableFatOilTypes = FAT_OIL_TYPES.filter((t) => fatOilFoods.some((f) => f.subcategory === t.key));
  const fatOilTypeMeta = FAT_OIL_TYPES.find((t) => t.key === fatOilType) ?? null;
  const fatOilTypeLabel = fatOilTypeMeta?.label ?? '';
  const availableFatOilItems = (FAT_OIL_ITEMS[fatOilType] || []).filter((i) =>
    fatOilFoods.some((f) => f.fatItem === i.key)
  );
  const fatOilCardRows = fatOilItem ? fatOilFoods.filter((f) => f.fatItem === fatOilItem) : [];
  const fatOilItemLabel = (FAT_OIL_ITEMS[fatOilType] || []).find((i) => i.key === fatOilItem)?.label ?? '';

  // --- The seven v0.0.43 categories, via SIMPLE_CATEGORIES above ---
  const simpleCfg = SIMPLE_CATEGORIES[category] ?? null;
  // A row's item key is normally in the category's own field, but a
  // cross-listed row carries its source category's field instead.
  const simpleKeyOf = (f) =>
    f[simpleCfg.itemField] ?? (simpleCfg.crossFields || []).map(([fl]) => f[fl]).find(Boolean) ?? null;
  const isBrowsingSimple = !!simpleCfg && !query.trim();
  const simpleFoods = isBrowsingSimple ? filterByCategory(foods, category) : [];
  const simpleFoodsAll = simpleCfg ? filterByCategory(foods, category) : [];
  const availableSimpleTypes = (simpleCfg?.types || []).filter((t) =>
    simpleFoods.some((f) => f.subcategory === t.key)
  );
  // A drill-down step offering exactly one choice is a tap that tells the
  // user nothing, so when a category has a single Type it is skipped and
  // the picker opens straight on that Type's item list. Meat Substitutes
  // is the only one today (17 items, no natural grouping), but this is
  // written as a rule rather than a special case -- any category whose
  // Types thin out to one gets the same treatment automatically.
  const simpleOnlyType = availableSimpleTypes.length === 1 ? availableSimpleTypes[0].key : null;
  const effectiveSimpleType = simpleType ?? simpleOnlyType;
  const simpleTypeLabel =
    (simpleCfg?.types || []).find((t) => t.key === effectiveSimpleType)?.label ?? '';
  const simpleItemsForType = simpleCfg ? simpleCfg.items[effectiveSimpleType] || [] : [];
  const availableSimpleItems = simpleItemsForType.filter((i) =>
    simpleFoods.some((f) => simpleKeyOf(f) === i.key)
  );
  const simpleCardRows =
    simpleCfg && simpleItem ? simpleFoods.filter((f) => simpleKeyOf(f) === simpleItem) : [];
  const simpleItemLabel = simpleItemsForType.find((i) => i.key === simpleItem)?.label ?? '';

  // --- The All tab ---
  // Every food in the app, as CARDS rather than rows: "Chicken Breast" once
  // instead of twice (raw and cooked), "Ranch Dressing" once instead of
  // three times. Tapping one expands the same card the drill-down would
  // have reached, toggles intact -- so All is a shortcut into the
  // hierarchy, not a second, flatter copy of the food database.
  //
  // Ordered most-common-first per data/foodCommonness.js, deliberately NOT
  // grouped by category: the point of this tab is that you can find eggs
  // without first deciding that eggs are Dairy-adjacent.
  const allCards = useMemo(() => {
    const groups = new Map();
    for (const f of results) {
      const k = cardKeyOf(f);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(f);
    }
    const out = [];
    for (const [key, rows] of groups) {
      const rep = representativeRow(rows, key);
      // Prefer the hierarchy's own label over the representative row's
      // name where one exists. The row name is a specific variety
      // ("Apple, Fuji", "Tomato (raw)", "Cheddar, sharp") while the card
      // covers all of them, so the picker's label is the honest title.
      const hierLabel =
        rep.category === 'fruit' ? FRUIT_TYPES.find((t) => t.key === rep.cut)?.label
          : rep.category === 'vegetable' ? VEGETABLE_TYPES.find((t) => t.key === rep.cut)?.label
            : rep.cheeseType ? CHEESE_TYPES.find((c) => c.key === rep.cheeseType)?.label
              : rep.creamGroup ? CREAM_GROUPS.find((g) => g.key === rep.creamGroup)?.label
                : null;
      const title = hierLabel || cardTitleOf(rep, key);
      out.push({ id: key, rows, rep, title, rank: commonnessRank(key, rep.category) });
    }
    // Two categories can legitimately produce the same title -- Bacon and
    // Sausage exist as both pork and turkey, Prunes as fruit and as baby
    // food. Side by side in one flat list those read as a duplicated row,
    // so a colliding title gets its category appended. Only the colliding
    // ones: everything unique stays clean.
    const seen = new Map();
    for (const c of out) seen.set(c.title, (seen.get(c.title) || 0) + 1);
    for (const c of out) {
      if (seen.get(c.title) > 1) {
        const label = CATEGORIES.find((x) => x.key === c.rep.category)?.label;
        if (label) c.title = `${c.title} (${label})`;
      }
    }
    // Ties break alphabetically so the tail is stable rather than
    // dependent on however data/foods.js happens to be ordered.
    out.sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title));
    return out;
  }, [results]);

  // --- Nuts & Seeds ---
  const isBrowsingNut = category === 'nut_seed' && !query.trim();
  const nutFoods = isBrowsingNut ? filterByCategory(foods, 'nut_seed') : [];
  const nutFoodsAll = filterByCategory(foods, 'nut_seed');
  const availableNutTypes = NUT_SEED_TYPES.filter((t) => nutFoods.some((f) => f.subcategory === t.key));
  const nutTypeLabel = NUT_SEED_TYPES.find((t) => t.key === nutType)?.label ?? '';
  // Peanuts cross-list in from foodsLegumes.js, so they carry `legumeItem`
  // rather than `nutItem` -- fall back to it so they get a list entry here
  // too rather than silently vanishing from this category.
  const nutKeyOf = (f) => f.nutItem || f.legumeItem;
  const availableNutItems = (NUT_SEED_ITEMS[nutType] || []).filter((i) =>
    nutFoods.some((f) => nutKeyOf(f) === i.key)
  );
  const nutCardRows = nutItem ? nutFoods.filter((f) => nutKeyOf(f) === nutItem) : [];
  const nutItemLabel = (NUT_SEED_ITEMS[nutType] || []).find((i) => i.key === nutItem)?.label ?? '';

  const legumeItemLabel =
    legumeTypeMeta?.shape === 'card'
      ? legumeTypeLabel
      : (LEGUME_ITEMS[legumeType] || []).find((i) => i.key === legumeItem)?.label ?? '';
  const dairyTypeMeta = DAIRY_TYPES.find((t) => t.key === dairyType) ?? null;
  // Only cheeses that actually have rows, same "don't show an empty step"
  // rule availableCuts uses for Red Meat.
  const availableCheeseTypes = CHEESE_TYPES.filter((c) => dairyFoods.some((f) => f.cheeseType === c.key));
  const availableCreamGroups = CREAM_GROUPS.filter((g) => dairyFoods.some((f) => f.creamGroup === g.key));
  const cheeseRows = cheeseType ? dairyFoods.filter((f) => f.cheeseType === cheeseType) : [];
  const creamRows = creamGroup ? dairyFoods.filter((f) => f.creamGroup === creamGroup) : [];
  const dairyItemRows = dairyItemId ? dairyFoods.filter((f) => f.id === dairyItemId) : [];
  const cheeseTypeLabel = CHEESE_TYPES.find((c) => c.key === cheeseType)?.label ?? '';
  const creamGroupLabel = CREAM_GROUPS.find((g) => g.key === creamGroup)?.label ?? '';
  const milkFoods = dairyType === 'milk' ? dairyFoods.filter((food) => food.milkFatLevel) : [];

  // Vegetables -- same one-step drill-down shape as Dairy's Type step, just
  // with ~80 entries instead of 5, and (as of v0.0.26) every entry opens a
  // VegetableCard instead of only Milk getting a card-trigger special case
  // the way Dairy's picker still works. Uses filterByCategory rather than a
  // plain f.category === 'vegetable' check so Avocado shows up here too via
  // its crossListCategories tag even though its primary category is
  // 'fruit' -- see utils/nutrition.js's filterByCategory. `cut` (not
  // `subcategory`) is the filtering key here, matching
  // data/foodsVegetables.js's rows and the 7 reused cross-listed
  // Fruit/Vegetable rows' existing `cut` tags -- see
  // data/vegetableHierarchy.js's header comment for why.
  const isBrowsingVegetable = category === 'vegetable' && !query.trim();
  const vegetableFoods = isBrowsingVegetable ? filterByCategory(foods, 'vegetable') : [];
  const availableVegetableTypes = VEGETABLE_TYPES.filter((t) =>
    vegetableFoods.some((food) => food.cut === t.key)
  );
  const vegetableTypeFoods = vegetableType ? vegetableFoods.filter((food) => food.cut === vegetableType) : [];
  const vegetableTypeLabel = VEGETABLE_TYPES.find((t) => t.key === vegetableType)?.label ?? '';

  // Beef's Ground and 8 whole-muscle steak/roast cuts get a toggle-card
  // instead of the plain flat list every other Red Meat cut uses (see
  // GroundMeatCard/TrimTierCard above, and RED_MEAT_CUTS' hasFatTierToggle/
  // hasTrimTierToggle flags in data/meatHierarchy.js).
  const meatCutMeta = (RED_MEAT_CUTS[meatSubcategory] || []).find((c) => c.key === meatCut) ?? null;

  // Which of the twenty-two things this screen can show right now — the My
  // Favorites list, the normal flat food list, one of the four Red Meat
  // drill-down steps (the plain Cuts list, the flat Foods list, or one of
  // Beef's two toggle-cards), one of the three Poultry drill-down steps,
  // one of the three Seafood drill-down steps, one of the three Fruit
  // drill-down steps, one of the three Eggs drill-down steps, one of
  // the two Dairy drill-down steps, or one of the two Vegetables
  // drill-down steps. My Favorites is checked first since it
  // isn't a real category on any food (data/foods.js) — it's this user's
  // own saved list, shown regardless of what category chip would
  // otherwise apply.
  const listMode =
    category === 'favorites'
      ? 'favorites'
      : isBrowsingMeat
        ? !meatSubcategory
          ? 'meatTypes'
          : !meatCut
            ? 'meatCuts'
            : meatCutMeta?.hasFatTierToggle
              ? 'groundMeatCard'
              : meatCutMeta?.hasTrimTierToggle
                ? 'trimTierCard'
                : // Every remaining Red Meat cut gets MeatCutCard -- a real
                  // card with an icon and a data-gated Prep toggle --
                  // rather than the flat 'meatFoods' list. Damon's rule: a
                  // cut losing a toggle shouldn't also lose its card and
                  // icon.
                  //
                  // As of v0.0.42 that is ALL of them. Veal, Game Meats,
                  // Processed & Deli Meats and Other Meats were the last
                  // four holdouts; they had been organized into cuts since
                  // their original round but still fell through to the flat
                  // list, so tapping a cut gave you rows instead of a card.
                  // Every card here was already generic in `subcategory`,
                  // so switching them on was this one check -- which is why
                  // 'meatFoods' is now unreachable from browsing and kept
                  // only as a defensive fallback for a subcategory that has
                  // rows but no cut assigned.
                  'meatCutCard'
        : isBrowsingPoultry
          ? !poultryType
            ? 'poultryTypes'
            : !poultryCut
              ? 'poultryCuts'
              : 'poultryCard'
          : isBrowsingSeafood
            ? !seafoodSubcategory
              ? 'seafoodTypes'
              : !seafoodCut
                ? 'seafoodCuts'
                : 'seafoodCard'
            : isBrowsingFruit
              ? !fruitType
                ? 'fruitTypes'
                : 'fruitCard'
              : isBrowsingEgg
                ? !eggType
                  ? 'eggTypes'
                  : !effectiveEggForm
                    ? 'eggForms'
                    : 'eggCard'
                : isBrowsingDairy
                  ? !dairyType
                    ? 'dairyTypes'
                    : dairyItemId
                      ? 'dairyItemCard'
                      : dairyType === 'milk' && milkCardOpen
                        ? 'milkCard'
                        : dairyTypeMeta?.shape === 'card'
                          ? dairyType === 'yogurt'
                            ? 'yogurtCard'
                            : 'butterCard'
                          : dairyTypeMeta?.shape === 'cheeseList'
                            ? cheeseType
                              ? 'cheeseCard'
                              : 'cheeseTypes'
                            : dairyTypeMeta?.shape === 'groupList'
                              ? creamGroup
                                ? 'creamCard'
                                : 'creamGroups'
                              : 'dairyFoods'
                  : isBrowsingVegetable
                    ? !vegetableType
                      ? 'vegetableTypes'
                      : 'vegetableCard'
                    : isBrowsingLegume
                      ? !legumeType
                        ? 'legumeTypes'
                        : legumeTypeMeta?.shape === 'card' || legumeItem
                          ? 'legumeCard'
                          : 'legumeItems'
                      : isBrowsingNut
                        ? !nutType
                          ? 'nutTypes'
                          : nutItem
                            ? 'nutCard'
                            : 'nutItems'
                        : isBrowsingGrain
                          ? !grainType
                            ? 'grainTypes'
                            : grainItem
                              ? 'grainCard'
                              : 'grainItems'
                          : isBrowsingFatOil
                            ? !fatOilType
                              ? 'fatOilTypes'
                              : fatOilTypeMeta?.shape === 'card'
                                ? 'fatOilButterCard'
                                : fatOilItem
                                  ? 'fatOilCard'
                                  : 'fatOilItems'
                            : isBrowsingSimple
                              ? !effectiveSimpleType
                                ? 'simpleTypes'
                                : simpleItem
                                  ? 'simpleCard'
                                  : 'simpleItems'
                              : 'flat';

  // Shows a small "X added" banner (with an Undo option) for a few
  // seconds, then hides it. Clearing any previous timer first means rapid
  // back-to-back adds just reset the clock instead of the banner flickering.
  const showToast = (message, entryId) => {
    setToast({ message, entryId });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // Wraps the real add function so every "+ Add" button (weight-based or
  // count-based) gives the same confirmation feedback afterward, and
  // remembers the new entry's id in case the user taps "Undo".
  const handleAdd = async (item, amount) => {
    const saved = await onAddEntry(item, amount);
    if (saved) {
      showToast(`${item.name} added`, saved.id);
    }
  };

  const handleUndo = () => {
    if (!toast?.entryId) return;
    if (toastTimer.current) clearTimeout(toastTimer.current);
    onDeleteEntry(toast.entryId);
    setToast(null);
  };

  // Wraps onAddFavorite (App.js's handleAddFavorite -- always creates a
  // BRAND NEW favorite row, never overwrites an old one, which is what
  // lets the same food be saved several times with different settings) so
  // every "☆ Add to Favorites"/"Add to My Favorites & Today" button gives
  // the same confirmation toast afterward.
  const handleAddFavorite = async (favoriteData) => {
    const created = await onAddFavorite(favoriteData);
    if (created) {
      showToast(`${favoriteData.name} added to Favorites`, null);
    }
  };

  // Wraps onUpdateFavorite (App.js's handleUpdateFavorite) for the Edit ->
  // "Save Changes" flow inside My Favorites -- overwrites the ONE favorite
  // being edited in place, rather than creating another numbered variant.
  // Returns the result so each card only re-locks itself (showing "saved")
  // once the write has actually succeeded, rather than always re-locking
  // even if it silently failed.
  const handleSaveFavoriteEdit = async (favoriteId, favoriteData) => {
    return onUpdateFavorite(favoriteId, favoriteData);
  };

  const handleToggleFavoriteExpand = (id) => {
    setExpandedFavoriteId((prev) => (prev === id ? null : id));
  };

  const renderFoodCard = (item) => {
    if (item.servingType === 'weight') {
      return <WeightFoodRow item={item} onAdd={handleAdd} onAddFavorite={handleAddFavorite} />;
    }
    return <CountFoodCard item={item} onAdd={handleAdd} onAddFavorite={handleAddFavorite} />;
  };

  // One FlatList, whichever of the four things is on screen — swapping
  // its data/renderItem/header rather than four separately-rendered lists
  // keeps the "no results" empty state and scrolling behavior consistent.
  let listData;
  let listKeyExtractor;
  let listRenderItem;
  let listHeader = null;
  let emptyText = 'No foods match this search and filter.';

  if (listMode === 'favorites') {
    listData = favoritesFiltered;
    listKeyExtractor = (item) => item.id;
    listRenderItem = ({ item }) => (
      <FavoriteListItem
        favorite={item}
        displayNumber={item.displayNumber}
        expanded={expandedFavoriteId === item.id}
        onToggleExpand={() => handleToggleFavoriteExpand(item.id)}
        onAdd={handleAdd}
        onSaveFavoriteEdit={handleSaveFavoriteEdit}
        onRemove={onRemoveFavorite}
        meatFoodsAll={meatFoodsAll}
        poultryFoodsAll={poultryFoodsAll}
        seafoodFoodsAll={seafoodFoodsAll}
        eggFoodsAll={eggFoodsAll}
        milkFoodsAll={milkFoodsAll}
        dairyFoodsAll={dairyFoodsAll}
        vegetableFoodsAll={vegetableFoodsAll}
        fruitFoodsAll={fruitFoodsAll}
        legumeFoodsAll={legumeFoodsAll}
        nutFoodsAll={nutFoodsAll}
        grainFoodsAll={grainFoodsAll}
        fatOilFoodsAll={fatOilFoodsAll}
        simpleFoodsAllPool={simpleFoodsAllPool}
      />
    );
    emptyText =
      "You haven't added any favorites yet — tap the star on a food (or \"Add to My Favorites & Today\" on a Beef/Poultry/Seafood card) to save it here.";
  } else if (listMode === 'meatTypes') {
    listData = availableSubcats;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={`type_red_meat_${item.key}`} onPress={() => setMeatSubcategory(item.key)} />;
  } else if (listMode === 'meatCuts') {
    listData = availableCuts;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={rowIconKeyOf(meatFoods.find((f) => f.subcategory === meatSubcategory && f.cut === item.key))} onPress={() => setMeatCut(item.key)} />;
    listHeader = <BackRow label="Back to Red Meat Types" onPress={() => setMeatSubcategory(null)} />;
  } else if (listMode === 'meatFoods') {
    listData = cutFoods;
    listKeyExtractor = (item) => item.id;
    listRenderItem = ({ item }) => renderFoodCard(item);
    listHeader = <BackRow label={`Back to ${subcategoryLabel} Cuts`} onPress={() => setMeatCut(null)} />;
  } else if (listMode === 'groundMeatCard' || listMode === 'trimTierCard' || listMode === 'meatCutCard') {
    // Same one-"row"-is-the-whole-card trick as poultryCard/seafoodCard
    // below, reusing the FlatList's empty-state/scrolling/
    // ListHeaderComponent machinery rather than a separate non-list layout
    // just for this step.
    listData = [{ id: 'meat-card' }];
    listKeyExtractor = (item) => item.id;
    listRenderItem = () =>
      listMode === 'groundMeatCard' ? (
        <GroundMeatCard
          subcategory={meatSubcategory}
          cutLabel={cutLabel}
          meatFoods={meatFoods}
          onAddFavorite={handleAddFavorite}
          onAdd={handleAdd}
        />
      ) : listMode === 'trimTierCard' ? (
        <TrimTierCard
          subcategory={meatSubcategory}
          cut={meatCut}
          cutLabel={cutLabel}
          meatFoods={meatFoods}
          onAddFavorite={handleAddFavorite}
          onAdd={handleAdd}
        />
      ) : (
        <MeatCutCard
          subcategory={meatSubcategory}
          cut={meatCut}
          cutLabel={cutLabel}
          meatFoods={meatFoods}
          onAddFavorite={handleAddFavorite}
          onAdd={handleAdd}
        />
      );
    listHeader = <BackRow label={`Back to ${subcategoryLabel} Cuts`} onPress={() => setMeatCut(null)} />;
  } else if (listMode === 'poultryTypes') {
    listData = availablePoultryTypes;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={`type_poultry_${item.key}`} onPress={() => setPoultryType(item.key)} />;
  } else if (listMode === 'poultryCuts') {
    listData = availablePoultryCuts;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={rowIconKeyOf(poultryFoods.find((f) => f.subcategory === poultryType && f.cut === item.key))} onPress={() => setPoultryCut(item.key)} />;
    listHeader = <BackRow label="Back to Poultry Types" onPress={() => setPoultryType(null)} />;
  } else if (listMode === 'poultryCard') {
    // Just one "row" — the toggle card itself — reusing the same FlatList
    // the rest of this screen already uses, purely so the empty state /
    // scrolling / ListHeaderComponent (Back row) machinery stays identical
    // rather than needing a separate non-list layout just for this step.
    listData = [{ id: 'poultry-card' }];
    listKeyExtractor = (item) => item.id;
    listRenderItem = () => (
      <PoultryCard
        type={poultryType}
        typeLabel={poultryTypeLabel}
        cut={poultryCut}
        cutMeta={poultryCutMeta}
        cutLabel={poultryCutLabel}
        poultryFoods={poultryFoods}
        onAddFavorite={handleAddFavorite}
        onAdd={handleAdd}
      />
    );
    listHeader = <BackRow label={`Back to ${poultryTypeLabel} Cuts`} onPress={() => setPoultryCut(null)} />;
  } else if (listMode === 'seafoodTypes') {
    listData = availableSeafoodSubcats;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={`type_seafood_${item.key}`} onPress={() => setSeafoodSubcategory(item.key)} />;
  } else if (listMode === 'seafoodCuts') {
    listData = availableSeafoodCuts;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={rowIconKeyOf(seafoodFoods.find((f) => f.subcategory === seafoodSubcategory && f.cut === item.key))} onPress={() => setSeafoodCut(item.key)} />;
    listHeader = <BackRow label="Back to Seafood Types" onPress={() => setSeafoodSubcategory(null)} />;
  } else if (listMode === 'seafoodCard') {
    // Same one-"row"-is-the-whole-card trick as poultryCard above, reusing
    // the FlatList's empty-state/scrolling/ListHeaderComponent machinery
    // rather than a separate non-list layout just for this step.
    listData = [{ id: 'seafood-card' }];
    listKeyExtractor = (item) => item.id;
    listRenderItem = () => (
      <SeafoodCard
        type={seafoodSubcategory}
        typeLabel={seafoodSubcategoryLabel}
        cut={seafoodCut}
        cutMeta={seafoodCutMeta}
        cutLabel={seafoodCutLabel}
        seafoodFoods={seafoodFoods}
        onAddFavorite={handleAddFavorite}
        onAdd={handleAdd}
      />
    );
    listHeader = <BackRow label={`Back to ${seafoodSubcategoryLabel} Species`} onPress={() => setSeafoodCut(null)} />;
  } else if (listMode === 'fruitTypes') {
    listData = availableFruitTypes;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={rowIconKeyOf(fruitFoods.find((f) => f.cut === item.key))} onPress={() => setFruitType(item.key)} />;
  } else if (listMode === 'fruitCard') {
    // Same one-"row"-is-the-whole-card trick as poultryCard/vegetableCard.
    listData = [{ id: 'fruit-card' }];
    listKeyExtractor = (item) => item.id;
    listRenderItem = () => (
      <FruitCard
        fruitType={fruitType}
        fruitTypeLabel={fruitTypeLabel}
        fruitTypeFoods={fruitTypeFoods}
        onAddFavorite={handleAddFavorite}
        onAdd={handleAdd}
      />
    );
    listHeader = <BackRow label="Back to Fruits" onPress={() => setFruitType(null)} />;
  } else if (listMode === 'eggTypes') {
    listData = availableEggTypes;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={`type_egg_${item.key}`} onPress={() => setEggType(item.key)} />;
  } else if (listMode === 'eggForms') {
    listData = availableEggForms;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={rowIconKeyOf(eggFoods.find((f) => f.subcategory === eggType && f.form === item.key))} onPress={() => setEggForm(item.key)} />;
    listHeader = <BackRow label="Back to Egg Types" onPress={() => setEggType(null)} />;
  } else if (listMode === 'eggCard') {
    // Same one-"row"-is-the-whole-card trick as poultryCard/seafoodCard
    // above.
    listData = [{ id: 'egg-card' }];
    listKeyExtractor = (item) => item.id;
    listRenderItem = () => (
      <EggCard
        birdType={eggType}
        birdTypeLabel={eggTypeLabel}
        form={effectiveEggForm}
        formMeta={eggFormMeta}
        formLabel={eggFormLabel}
        eggFoods={eggFoods}
        onAddFavorite={handleAddFavorite}
        onAdd={handleAdd}
      />
    );
    // Only a real multi-Form bird (Chicken) ever showed an actual Egg
    // Forms list to come back to -- a single-Form bird (Duck/Goose/Quail/
    // Turkey) skipped straight here from Bird Types (see
    // effectiveEggForm's comment above), so its Back button should go
    // straight back to Bird Types too, not "back" to a Forms list that
    // was never shown.
    listHeader =
      availableEggForms.length > 1 ? (
        <BackRow label={`Back to ${eggTypeLabel} Forms`} onPress={() => setEggForm(null)} />
      ) : (
        <BackRow label="Back to Egg Types" onPress={() => setEggType(null)} />
      );
  } else if (listMode === 'dairyTypes') {
    listData = availableDairyTypes;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={`type_dairy_${item.key}`} onPress={() => setDairyType(item.key)} />;
  } else if (listMode === 'dairyFoods') {
    // Milk's list: the "Milk" card trigger, then the four standalone
    // products (Buttermilk, Kefir, Goat Milk, Condensed Milk). As of
    // v0.0.37 those four open their own cards too rather than being bare
    // rows -- Damon's rule that every food opens as a card.
    if (dairyType === 'milk') {
      listData = [{ id: '__milk_card_trigger__', isMilkCardTrigger: true }, ...dairyTypeFoods];
      listRenderItem = ({ item }) =>
        item.isMilkCardTrigger ? (
          <DrillDownRow label="Milk" iconKey="milk_whole" onPress={() => setMilkCardOpen(true)} />
        ) : (
          <DrillDownRow label={item.name} iconKey={rowIconKeyOf(item)} onPress={() => setDairyItemId(item.id)} />
        );
    } else {
      listData = dairyTypeFoods;
      listRenderItem = ({ item }) => <DrillDownRow label={item.name} iconKey={rowIconKeyOf(item)} onPress={() => setDairyItemId(item.id)} />;
    }
    listKeyExtractor = (item) => item.id;
    listHeader = <BackRow label="Back to Dairy Types" onPress={() => setDairyType(null)} />;
  } else if (listMode === 'cheeseTypes') {
    listData = availableCheeseTypes;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={rowIconKeyOf(dairyFoods.find((f) => f.cheeseType === item.key))} onPress={() => setCheeseType(item.key)} />;
    listHeader = <BackRow label="Back to Dairy Types" onPress={() => setDairyType(null)} />;
  } else if (listMode === 'creamGroups') {
    listData = availableCreamGroups;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={rowIconKeyOf(dairyFoods.find((f) => f.creamGroup === item.key))} onPress={() => setCreamGroup(item.key)} />;
    listHeader = <BackRow label="Back to Dairy Types" onPress={() => setDairyType(null)} />;
  } else if (listMode === 'yogurtCard' || listMode === 'butterCard') {
    listData = [{ id: 'dairy-card' }];
    listKeyExtractor = (item) => item.id;
    listRenderItem = () =>
      listMode === 'yogurtCard' ? (
        <YogurtCard dairyFoods={dairyFoods} onAddFavorite={handleAddFavorite} onAdd={handleAdd} />
      ) : (
        <ButterCard dairyFoods={dairyFoods} onAddFavorite={handleAddFavorite} onAdd={handleAdd} />
      );
    listHeader = <BackRow label="Back to Dairy Types" onPress={() => setDairyType(null)} />;
  } else if (listMode === 'cheeseCard' || listMode === 'creamCard' || listMode === 'dairyItemCard') {
    // All three are the same shape -- one list of variants, one toggle --
    // so they share DairyVariantCard and differ only in what that toggle
    // is called and how the icon key is built. See its header comment.
    const isCheese = listMode === 'cheeseCard';
    const isCream = listMode === 'creamCard';
    const rows = isCheese ? cheeseRows : isCream ? creamRows : dairyItemRows;
    listData = [{ id: 'dairy-variant-card' }];
    listKeyExtractor = (item) => item.id;
    listRenderItem = () => (
      <DairyVariantCard
        title={isCheese ? cheeseTypeLabel : isCream ? creamGroupLabel : rows[0]?.name || ''}
        rows={rows}
        toggleLabel={
          isCheese
            ? rows[0]?.variantAxis === 'form'
              ? 'Form'
              : 'Fat'
            : isCream
              ? CREAM_GROUPS.find((g) => g.key === creamGroup)?.toggleLabel || 'Type'
              : ''
        }
        variantField={isCheese ? 'cheeseVariant' : isCream ? 'creamLevel' : 'id'}
        variantLabels={(f) => f.name}
        iconKey={(f) =>
          isCheese
            ? // Form variants change the picture (grated parmesan vs a
              // wedge); fat variants don't (reduced-fat cheddar looks
              // identical to regular), so only form reaches the key.
              `dairy_cheese_${f.cheeseType}${f.variantAxis === 'form' ? `_${f.cheeseVariant}` : ''}`
            : isCream
              ? // Same rule: Sour Cream's toggle is a fat ladder so it gets
                // one icon, while Cream and Whipped are different products.
                // The `_ff` fat-free variants share their parent's picture.
                `dairy_cream_${f.creamGroup}${
                  f.creamGroup === 'sour_cream' ? '' : `_${f.creamLevel.replace(/_ff$/, '')}`
                }`
              : `dairy_${f.id}`
        }
        onAddFavorite={handleAddFavorite}
        onAdd={handleAdd}
      />
    );
    listHeader = (
      <BackRow
        label={isCheese ? 'Back to Cheeses' : isCream ? 'Back to Cream & Creamers' : `Back to ${dairyTypeLabel}`}
        onPress={() => (isCheese ? setCheeseType(null) : isCream ? setCreamGroup(null) : setDairyItemId(null))}
      />
    );
  } else if (listMode === 'milkCard') {
    // Same one-"row"-is-the-whole-card trick as poultryCard/seafoodCard/
    // eggCard above.
    listData = [{ id: 'milk-card' }];
    listKeyExtractor = (item) => item.id;
    listRenderItem = () => (
      <MilkCard milkFoods={milkFoods} onAddFavorite={handleAddFavorite} onAdd={handleAdd} />
    );
    listHeader = <BackRow label={`Back to ${dairyTypeLabel}`} onPress={() => setMilkCardOpen(false)} />;
  } else if (listMode === 'vegetableTypes') {
    listData = availableVegetableTypes;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={rowIconKeyOf(vegetableFoods.find((f) => f.cut === item.key))} onPress={() => setVegetableType(item.key)} />;
  } else if (listMode === 'vegetableCard') {
    // Same one-"row"-is-the-whole-card trick as milkCard/eggCard/poultryCard
    // above -- see VegetableCard's header comment for why every one of the
    // ~80 vegetables gets this card treatment now (v0.0.26), not just a flat
    // list of its food rows the way this step worked through v0.0.25.
    listData = [{ id: 'vegetable-card' }];
    listKeyExtractor = (item) => item.id;
    listRenderItem = () => (
      <VegetableCard
        vegetableType={vegetableType}
        vegetableTypeLabel={vegetableTypeLabel}
        vegetableTypeFoods={vegetableTypeFoods}
        onAddFavorite={handleAddFavorite}
        onAdd={handleAdd}
      />
    );
    listHeader = <BackRow label="Back to Vegetables" onPress={() => setVegetableType(null)} />;
  } else if (listMode === 'grainTypes') {
    listData = availableGrainTypes;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={`type_grain_${item.key}`} onPress={() => setGrainType(item.key)} />;
  } else if (listMode === 'grainItems') {
    listData = availableGrainItems;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={rowIconKeyOf(grainFoods.find((f) => f.grainItem === item.key))} onPress={() => setGrainItem(item.key)} />;
    listHeader = <BackRow label="Back to Grains" onPress={() => setGrainType(null)} />;
  } else if (listMode === 'grainCard') {
    listData = [{ id: 'grain-card' }];
    listKeyExtractor = (item) => item.id;
    listRenderItem = () => (
      <LegumeCard
        title={grainItemLabel}
        rows={grainCardRows}
        hasFormToggle={!!grainTypeMeta?.hasFormToggle && grainCardRows.some((r) => r.grainForm)}
        variantField="grainForm"
        variantOptions={GRAIN_FORMS}
        iconPrefix="grain"
        toggleLabel="Form"
        onAddFavorite={handleAddFavorite}
        onAdd={handleAdd}
      />
    );
    listHeader = <BackRow label={`Back to ${grainTypeLabel}`} onPress={() => setGrainItem(null)} />;
  } else if (listMode === 'simpleTypes') {
    listData = availableSimpleTypes;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={`type_${category}_${item.key}`} onPress={() => setSimpleType(item.key)} />;
  } else if (listMode === 'simpleItems') {
    listData = availableSimpleItems;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={rowIconKeyOf(simpleFoods.find((f) => simpleKeyOf(f) === item.key))} onPress={() => setSimpleItem(item.key)} />;
    listHeader = simpleOnlyType ? null : (
      <BackRow label={`Back to ${simpleCfg.label}`} onPress={() => setSimpleType(null)} />
    );
  } else if (listMode === 'simpleCard') {
    listData = [{ id: 'simple-card' }];
    listKeyExtractor = (item) => item.id;
    // LegumeCard once more. It has now driven Legumes, Nuts & Seeds,
    // Grains, Fats & Oils and all seven of these -- "one item, one optional
    // list-toggle" turned out to be the shape most of the food database
    // actually has.
    listRenderItem = () => (
      <LegumeCard
        title={simpleItemLabel}
        rows={simpleCardRows}
        hasFormToggle={!!simpleCfg.variantField && simpleCardRows.some((r) => r[simpleCfg.variantField])}
        variantField={simpleCfg.variantField || 'legumeForm'}
        variantOptions={simpleCfg.varieties}
        iconPrefix={
          simpleCardRows[0] && simpleCardRows[0][simpleCfg.itemField] === undefined
            ? (simpleCfg.crossFields || []).find(([fl]) => simpleCardRows[0][fl])?.[1] || simpleCfg.iconPrefix
            : simpleCfg.iconPrefix
        }
        toggleLabel={simpleCfg.toggleLabel || 'Type'}
        variantInIconKey={false}
        itemField={
          simpleCardRows[0] && simpleCardRows[0][simpleCfg.itemField] === undefined
            ? (simpleCfg.crossFields || []).find(([fl]) => simpleCardRows[0][fl])?.[0] || simpleCfg.itemField
            : simpleCfg.itemField
        }
        onAddFavorite={handleAddFavorite}
        onAdd={handleAdd}
      />
    );
    listHeader = (
      <BackRow
        label={`Back to ${simpleOnlyType ? simpleCfg.label : simpleTypeLabel}`}
        onPress={() => setSimpleItem(null)}
      />
    );
  } else if (listMode === 'fatOilTypes') {
    listData = availableFatOilTypes;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={`type_fat_oil_${item.key}`} onPress={() => setFatOilType(item.key)} />;
  } else if (listMode === 'fatOilItems') {
    listData = availableFatOilItems;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={rowIconKeyOf(fatOilFoods.find((f) => f.fatItem === item.key))} onPress={() => setFatOilItem(item.key)} />;
    listHeader = <BackRow label="Back to Fats & Oils" onPress={() => setFatOilType(null)} />;
  } else if (listMode === 'fatOilButterCard') {
    // The Butter & Ghee Type. Deliberately the SAME component and the same
    // rows as Dairy > Butter, not a copy -- one food, one card, one icon,
    // shown under two tabs. Damon's "like bell pepper" call.
    listData = [{ id: 'fat-oil-butter-card' }];
    listKeyExtractor = (item) => item.id;
    listRenderItem = () => (
      <ButterCard dairyFoods={dairyFoodsAll} onAddFavorite={handleAddFavorite} onAdd={handleAdd} />
    );
    listHeader = <BackRow label="Back to Fats & Oils" onPress={() => setFatOilType(null)} />;
  } else if (listMode === 'fatOilCard') {
    listData = [{ id: 'fat-oil-card' }];
    listKeyExtractor = (item) => item.id;
    // LegumeCard again -- "one item, one optional list-toggle" fits Fats &
    // Oils unchanged. The one new thing is variantInIconKey={false}: the
    // Regular/Light toggle is a data axis only, since the two look
    // identical. See its header comment.
    listRenderItem = () => (
      <LegumeCard
        title={fatOilItemLabel}
        rows={fatOilCardRows}
        hasFormToggle={!!fatOilTypeMeta?.hasFatToggle && fatOilCardRows.some((r) => r.fatLevel)}
        variantField="fatLevel"
        variantOptions={FAT_LEVELS}
        iconPrefix="fatoil"
        toggleLabel="Fat Level"
        variantInIconKey={false}
        onAddFavorite={handleAddFavorite}
        onAdd={handleAdd}
      />
    );
    listHeader = <BackRow label={`Back to ${fatOilTypeLabel}`} onPress={() => setFatOilItem(null)} />;
  } else if (listMode === 'nutTypes') {
    listData = availableNutTypes;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={`type_nut_seed_${item.key}`} onPress={() => setNutType(item.key)} />;
  } else if (listMode === 'nutItems') {
    listData = availableNutItems;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={rowIconKeyOf(nutFoods.find((f) => nutKeyOf(f) === item.key))} onPress={() => setNutItem(item.key)} />;
    listHeader = <BackRow label="Back to Nuts & Seeds" onPress={() => setNutType(null)} />;
  } else if (listMode === 'nutCard') {
    listData = [{ id: 'nut-card' }];
    listKeyExtractor = (item) => item.id;
    // Reuses LegumeCard -- it is already "one item, one optional
    // list-toggle", which is exactly this shape. `variantField` picks which
    // column that toggle reads, so the same component drives both.
    listRenderItem = () => (
      <LegumeCard
        title={nutItemLabel}
        rows={nutCardRows}
        hasFormToggle={nutCardRows.some((r) => r.nutPrep)}
        variantField="nutPrep"
        variantOptions={NUT_PREPS}
        iconPrefix="nutseed"
        toggleLabel="Preparation"
        onAddFavorite={handleAddFavorite}
        onAdd={handleAdd}
      />
    );
    listHeader = <BackRow label={`Back to ${nutTypeLabel}`} onPress={() => setNutItem(null)} />;
  } else if (listMode === 'legumeTypes') {
    listData = availableLegumeTypes;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={`type_legume_${item.key}`} onPress={() => setLegumeType(item.key)} />;
  } else if (listMode === 'legumeItems') {
    listData = availableLegumeItems;
    listKeyExtractor = (item) => item.key;
    listRenderItem = ({ item }) => <DrillDownRow label={item.label} iconKey={rowIconKeyOf(legumeFoods.find((f) => f.legumeItem === item.key))} onPress={() => setLegumeItem(item.key)} />;
    listHeader = <BackRow label="Back to Legume Types" onPress={() => setLegumeType(null)} />;
  } else if (listMode === 'legumeCard') {
    listData = [{ id: 'legume-card' }];
    listKeyExtractor = (item) => item.id;
    listRenderItem = () => (
      <LegumeCard
        title={legumeItemLabel}
        rows={legumeCardRows}
        hasFormToggle={!!legumeTypeMeta?.hasFormToggle}
        onAddFavorite={handleAddFavorite}
        onAdd={handleAdd}
      />
    );
    listHeader = (
      <BackRow
        label={legumeTypeMeta?.shape === 'card' ? 'Back to Legume Types' : `Back to ${legumeTypeLabel}`}
        onPress={() => (legumeTypeMeta?.shape === 'card' ? setLegumeType(null) : setLegumeItem(null))}
      />
    );
  } else if (category === 'all' && !query.trim()) {
    listData = allCards;
    listKeyExtractor = (item) => item.id;
    listRenderItem = ({ item }) => (
      <AllFoodRow
        card={item}
        expanded={expandedCardKey === item.id}
        onToggle={() => setExpandedCardKey(expandedCardKey === item.id ? null : item.id)}
        pools={cardPools}
        onAddFavorite={handleAddFavorite}
        onAdd={handleAdd}
      />
    );
  } else {
    // Search results stay row-per-food: when you type "cooked" you want to
    // see the cooked row, not a card that happens to contain one.
    listData = results;
    listKeyExtractor = (item) => item.id;
    listRenderItem = ({ item }) => renderFoodCard(item);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Food</Text>
      <TextInput
        style={styles.search}
        placeholder="Search foods (e.g. chicken, rice, apple)"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryRow}
        contentContainerStyle={{ alignItems: 'flex-start', paddingRight: 16 }}
      >
        <CategoryTile
          label="All"
          glyph="▦"
          active={category === 'all'}
          onPress={() => setCategory('all')}
        />
        <CategoryTile
          label="Favorites"
          glyph="★"
          active={category === 'favorites'}
          onPress={() => setCategory('favorites')}
        />
        {CATEGORIES.map((c) => (
          <CategoryTile
            key={c.key}
            label={c.label}
            iconKey={c.key}
            active={category === c.key}
            onPress={() => setCategory(c.key)}
          />
        ))}
      </ScrollView>

      {listMode === 'meatCuts' ||
      listMode === 'meatFoods' ||
      listMode === 'groundMeatCard' ||
      listMode === 'trimTierCard' ||
      listMode === 'meatCutCard' ? (
        <Text style={styles.breadcrumb}>
          Red Meat › {subcategoryLabel}
          {listMode !== 'meatCuts' ? ` › ${cutLabel}` : ''}
        </Text>
      ) : null}
      {listMode === 'poultryCuts' || listMode === 'poultryCard' ? (
        <Text style={styles.breadcrumb}>
          Poultry › {poultryTypeLabel}
          {listMode === 'poultryCard' ? ` › ${poultryCutLabel}` : ''}
        </Text>
      ) : null}
      {listMode === 'seafoodCuts' || listMode === 'seafoodCard' ? (
        <Text style={styles.breadcrumb}>
          Seafood › {seafoodSubcategoryLabel}
          {listMode === 'seafoodCard' ? ` › ${seafoodCutLabel}` : ''}
        </Text>
      ) : null}
      {listMode === 'fruitCard' ? (
        <Text style={styles.breadcrumb}>
          Fruit › {fruitTypeLabel}
          {''}
        </Text>
      ) : null}
      {listMode === 'eggForms' || listMode === 'eggCard' ? (
        <Text style={styles.breadcrumb}>
          Eggs › {eggTypeLabel}
          {listMode === 'eggCard' ? ` › ${eggFormLabel}` : ''}
        </Text>
      ) : null}
      {listMode === 'dairyFoods' ||
      listMode === 'milkCard' ||
      listMode === 'cheeseTypes' ||
      listMode === 'creamGroups' ||
      listMode === 'yogurtCard' ||
      listMode === 'butterCard' ||
      listMode === 'cheeseCard' ||
      listMode === 'creamCard' ||
      listMode === 'dairyItemCard' ? (
        <Text style={styles.breadcrumb}>
          Dairy › {dairyTypeLabel}
          {listMode === 'cheeseCard' ? ` › ${cheeseTypeLabel}` : ''}
          {listMode === 'creamCard' ? ` › ${creamGroupLabel}` : ''}
        </Text>
      ) : null}
      {listMode === 'grainTypes' || listMode === 'grainItems' || listMode === 'grainCard' ? (
        <Text style={styles.breadcrumb}>
          Grains{grainType ? ` › ${grainTypeLabel}` : ''}
          {listMode === 'grainCard' ? ` › ${grainItemLabel}` : ''}
        </Text>
      ) : null}
      {listMode === 'simpleTypes' || listMode === 'simpleItems' || listMode === 'simpleCard' ? (
        <Text style={styles.breadcrumb}>
          {simpleCfg?.label}
          {effectiveSimpleType && !simpleOnlyType ? ` › ${simpleTypeLabel}` : ''}
          {listMode === 'simpleCard' ? ` › ${simpleItemLabel}` : ''}
        </Text>
      ) : null}
      {listMode === 'fatOilTypes' ||
      listMode === 'fatOilItems' ||
      listMode === 'fatOilCard' ||
      listMode === 'fatOilButterCard' ? (
        <Text style={styles.breadcrumb}>
          Fats &amp; Oils{fatOilType ? ` › ${fatOilTypeLabel}` : ''}
          {listMode === 'fatOilCard' ? ` › ${fatOilItemLabel}` : ''}
        </Text>
      ) : null}
      {listMode === 'nutTypes' || listMode === 'nutItems' || listMode === 'nutCard' ? (
        <Text style={styles.breadcrumb}>
          Nuts &amp; Seeds{nutType ? ` › ${nutTypeLabel}` : ''}
          {listMode === 'nutCard' ? ` › ${nutItemLabel}` : ''}
        </Text>
      ) : null}
      {listMode === 'legumeTypes' || listMode === 'legumeItems' || listMode === 'legumeCard' ? (
        <Text style={styles.breadcrumb}>
          Legumes{legumeType ? ` › ${legumeTypeLabel}` : ''}
          {listMode === 'legumeCard' && legumeTypeMeta?.shape !== 'card' ? ` › ${legumeItemLabel}` : ''}
        </Text>
      ) : null}
      {listMode === 'vegetableCard' ? (
        <Text style={styles.breadcrumb}>Vegetables › {vegetableTypeLabel}</Text>
      ) : null}

      <FlatList
        data={listData}
        keyExtractor={listKeyExtractor}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
        renderItem={listRenderItem}
      />

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast.message}</Text>
          {/* Favorite-add toasts (handleAddFavorite above) pass entryId: null
              -- there's nothing to undo for those, so the Undo button only
              shows for toasts about a real logged entry. */}
          {toast.entryId ? (
            <TouchableOpacity onPress={handleUndo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.undoText}>Undo</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  allCardWrap: { marginBottom: 10 },
  allCardRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    // Same as the drill-down rows: the icon sets the height.
    borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12,
  },
  allCardChevron: { fontSize: 20, color: '#bbb', marginLeft: 12 },
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12, color: '#1a1a1a' },
  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e3e3e8',
  },
  emptyText: { color: '#888', fontStyle: 'italic', marginTop: 20, textAlign: 'center', paddingHorizontal: 12 },
  // NO height. Three attempts at one -- 122, 118, 114 -- each trimmed a few
  // points off the bottom of the tiles, because a hand-computed height is
  // only ever right for the font metrics, text scale and device it was
  // computed against.
  //
  // `flexGrow: 0` is what makes that unnecessary: it stops the ScrollView
  // claiming the whole column (the reason a height was there at all) while
  // still letting it size to its tallest child. The tile below has a fixed
  // 102, so the row is 106 and stays 106 wherever it runs. If the tile ever
  // changes size, this follows it instead of needing to be found and
  // edited.
  categoryRow: { marginBottom: 12, flexGrow: 0, flexShrink: 0 },
  // The category strip. Was a row of 42pt text pills until v0.0.60; the
  // artwork needs height to read, so each is now a small card. Fixed width
  // so the row is a regular rhythm rather than jumping about with label
  // length -- "Fats & Oils" and "Condiments & Sauces" wrap to two lines,
  // which is what numberOfLines={2} and the fixed lineHeight are for.
  catTile: {
    width: 82,
    // FIXED, not summed from paddings. Twice now the strip's height was
    // computed by adding up what is inside a tile, and twice the labels
    // came out clipped -- iOS gives a Text block a little more than
    // lineHeight x lines, so the arithmetic is always a few points short
    // and the overflow spills under the food list below. Pinning the tile
    // and clipping it makes that impossible rather than unlikely: the row
    // is this number plus slack, and nothing inside can exceed it.
    height: 102,
    marginRight: 8,
    marginTop: 4,
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e3e3e8',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  catTileActive: { backgroundColor: '#4f8ef7', borderColor: '#4f8ef7' },
  // White, always -- see CategoryTile's comment: the icons carry no alpha,
  // so this frame is what stops them looking like a torn-out rectangle on
  // the selected tile.
  catTileArt: {
    width: 50, height: 50, borderRadius: 11, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  catTileImage: { width: 48, height: 48 },
  catTileGlyph: { fontSize: 26, color: '#4f8ef7' },
  catTileText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
    lineHeight: 13,
    // Room for two lines and then some. Fixed so "Fruit" and "Condiments &
    // Sauces" produce tiles of identical height -- but 30 rather than the
    // exact 26 that two 13pt lines need, because that is precisely what
    // went wrong twice: iOS wants a shade more than lineHeight x lines to
    // lay a second line out, and given exactly enough it silently drops it.
    // "My Favorites" rendered as "My".
    height: 30,
  },
  catTileTextActive: { color: '#fff' },
  // Shown above the list only while inside the Red Meat picker (Cuts step
  // or final Foods step) — a plain-text trail so it's always clear which
  // Type/Cut you're currently inside of, since the category chip row above
  // only ever shows "Red Meat", not which branch of it you've drilled into.
  breadcrumb: { fontSize: 13, color: '#888', marginBottom: 8, marginTop: -4 },
  // The card itself grew from a single horizontal row into two stacked
  // rows — the icon/name/info up top, favorite + add actions in their own
  // row below — specifically to give the new favorite button real room
  // instead of squeezing it into the old row's already-tight right edge.
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center' },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
  },
  // Fixed width (rather than sizing to whatever's inside) so this stays a
  // reserved, same-sized placeholder box now that every food's icon is
  // blank (see data/foods.js) — dropping a real designed icon in here
  // later won't need any layout changes, and the row doesn't visually
  // collapse/shift in the meantime.
  icon: { fontSize: 28, width: 28, marginRight: 12 },
  name: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  sub: { fontSize: 14, color: '#777', marginTop: 2 },
  gramsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  gramsInput: {
    backgroundColor: '#f7f7fa',
    borderWidth: 1,
    borderColor: '#e3e3e8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 68,
    fontSize: 15,
    marginRight: 6,
  },
  gramsUnit: { fontSize: 14, color: '#777' },
  favBtn: {
    borderWidth: 1,
    borderColor: '#e3e3e8',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  favBtnActive: { borderColor: '#f2b134', backgroundColor: '#fff8e8' },
  favBtnText: { color: '#777', fontWeight: '600', fontSize: 14 },
  favBtnTextActive: { color: '#b3860f' },
  addBtn: { backgroundColor: '#4f8ef7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  // Red Meat drill-down rows (Types, then Cuts) — plain tappable list rows
  // rather than full food cards, since there's no nutrition info to show
  // yet at these two steps, just a name and a hint there's another screen
  // behind it.
  pickerRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    // The 96pt icon sets the row height now, so this is just breathing
    // room around it rather than the thing making the row tall.
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerRowText: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  pickerRowTextWithIcon: { flex: 1, marginLeft: 14 },
  // The list-row icon slot. 56x56 -- big enough to read at a glance,
  // small enough that a row stays a row. The placeholder is a plain tinted
  // square rather than the key text the CARD placeholder shows: on a card
  // the key is useful (it tells you what to draw), in a list of 1,056 rows
  // it would be noise.
  // 96pt, up from 56 in v0.0.47. The row keeps roughly the height it had --
  // the padding shrank from 30/34 to 8 to pay for it -- so the icon now
  // fills its row almost edge to edge instead of floating in the middle of
  // it. That is the point of the slot: the picture should be the thing you
  // scan, not a stamp next to the words.
  pickerRowChevron: { fontSize: 20, color: '#bbb', fontWeight: '600' },
  backRow: { paddingVertical: 10, marginBottom: 4 },
  backRowText: { fontSize: 15, fontWeight: '600', color: '#4f8ef7' },
  // The Poultry toggle card (PoultryCard, above) — a taller single card
  // rather than a list of rows, since there's only ever one food shown at
  // this step (whichever one the toggles currently resolve to).
  poultryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  poultryCardTitle: { fontSize: 19, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  poultrySectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginTop: 4, marginBottom: 8 },
  poultryPer100g: { fontSize: 14, color: '#777', marginTop: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
  // A fixed 192x192 box standing in for a future cartoon icon — dashed
  // border + the icon's key spelled out in small text so it's obvious both
  // how much space is reserved and exactly which of the (up to) 8
  // variations per cut belongs here once real artwork exists. Kept exactly
  // the same size as iconImageWrap below so a cut gaining real artwork
  // never shifts the card's layout.
  iconPlaceholder: {
    width: 192,
    height: 192,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 12,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 6,
    backgroundColor: '#fafafa',
  },
  iconPlaceholderText: { fontSize: 12, color: '#999', textAlign: 'center' },
  // Same footprint as iconPlaceholder above (so swapping a placeholder for
  // real artwork never shifts layout) but no dashed border/background --
  // the icon art supplies its own look.
  iconImageWrap: {
    width: 192,
    height: 192,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconImage: { width: 192, height: 192 },
  // One toggle row (Skin / Bone / Prep / weight unit / portion mode) — a
  // small label above a two-button segmented control.
  toggleGroup: { marginBottom: 12 },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: '#777', marginBottom: 6 },
  toggleTrack: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#4f8ef7',
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  toggleOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  // Wide mode (4+ options, e.g. Eggs' Prep/Size, Milk's Fat %, Beef's Fat %,
  // Vegetables' Prep) -- see ToggleRow's header comment for why this
  // exists. Originally a single row with every option squeezed into an
  // equal flex share of the card's width, but that broke down as soon as a
  // card had both several options AND longer labels at the same time
  // (Vegetables' Potato: 6 preps including "Baked (Skin On)" and "French
  // Fries" -- squeezed into 6 flex columns, several labels got clipped to
  // "Baked (Skin..." even at numberOfLines=2, since there just wasn't
  // enough width per column no matter how small the text got). Fixed
  // (v0.0.27) by wrapping into a grid instead of one ever-shrinking row --
  // each option gets a flexBasis around a third of the track's width (so
  // roughly 2-3 fit per row depending on label length) and wraps onto
  // additional rows as needed, with its own full border/corner radius
  // instead of the single-row scheme's shared track border, since a
  // wrapped grid has no single "first"/"last" option the old border logic
  // could rely on. This is a general fix, not a Potato-specific one -- it
  // applies to every wide ToggleRow in the app (Milk's Fat %, Egg's Size,
  // Beef's Fat %, every vegetable's Prep), all of which had the same
  // underlying "N flex columns squeezed into one row" problem, just less
  // visible than Potato's 6-option/long-label worst case.
  toggleTrackWide: {
    flexWrap: 'wrap',
    alignSelf: 'stretch',
    width: '100%',
    borderWidth: 0,
    borderRadius: 0,
    overflow: 'visible',
  },
  toggleOptionWide: {
    flexGrow: 1,
    flexBasis: '30%',
    paddingHorizontal: 6,
    paddingVertical: 10,
    marginRight: 6,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4f8ef7',
    borderRadius: 8,
  },
  toggleOptionFirst: { borderRightWidth: 1, borderRightColor: '#4f8ef7' },
  toggleOptionLast: {},
  toggleOptionActive: { backgroundColor: '#4f8ef7' },
  toggleOptionText: { fontSize: 14, fontWeight: '600', color: '#4f8ef7' },
  toggleOptionTextWide: { fontSize: 12, textAlign: 'center' },
  toggleOptionTextActive: { color: '#fff' },
  matchNote: { fontSize: 12, color: '#b3860f', backgroundColor: '#fff8e8', padding: 8, borderRadius: 8, marginBottom: 4 },
  reminderNote: { fontSize: 12, color: '#4f8ef7', backgroundColor: '#eef4ff', padding: 8, borderRadius: 8, marginBottom: 10 },
  gradeSectionHeader: { paddingVertical: 6 },
  gradeSectionHeaderText: { fontSize: 14, fontWeight: '600', color: '#4f8ef7' },
  gradeSectionBody: { marginTop: 8, marginBottom: 4 },
  sizeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  sizeOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e3e3e8',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sizeOptionActive: { borderColor: '#4f8ef7', backgroundColor: '#eef4ff' },
  sizeOptionLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  sizeOptionLabelActive: { color: '#4f8ef7' },
  sizeOptionGrams: { fontSize: 13, color: '#777', marginTop: 2 },
  sizeEstimateNote: { fontSize: 12, color: '#999', marginTop: 8, fontStyle: 'italic' },
  favAddBtn: {
    borderWidth: 1,
    borderColor: '#f2b134',
    backgroundColor: '#fff8e8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  favAddBtnText: { color: '#b3860f', fontWeight: '700', fontSize: 14 },
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26,26,26,0.9)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toastText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  undoText: { color: '#7db3ff', fontWeight: '700', fontSize: 16 },
  // Grayed-out look for every toggle/input on a card opened from My
  // Favorites that hasn't had "Edit" tapped yet -- the saved settings stay
  // fully readable, just visibly non-interactive.
  toggleTrackDisabled: { borderColor: '#ccc' },
  toggleOptionTextDisabled: { color: '#aaa' },
  gramsInputDisabled: { backgroundColor: '#f0f0f0', color: '#999' },
  sizeOptionDisabled: { opacity: 0.5 },
  // "Edit" button -- CardActionButtons' 'locked' mode, and
  // FavoriteWeightCard's own locked state.
  editBtn: {
    borderWidth: 1,
    borderColor: '#4f8ef7',
    backgroundColor: '#eef4ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editBtnText: { color: '#4f8ef7', fontWeight: '700', fontSize: 14 },
  // One row in the My Favorites tab (FavoriteListItem) -- the summary strip
  // (name + number, saved snapshot, Remove/Add buttons) plus, when
  // expanded, the full locked food card underneath it.
  favoriteListItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    // Vertical padding trimmed from 12 to 8 in v0.0.57 to pay for the 96pt
    // icon the summary row gained -- same trade the browse rows made in
    // v0.0.48. The picture, not the whitespace, sets the row height.
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  // The gap between a row's icon and its text. One value, so the Favorites
  // rows and the Today entries line their text up identically.
  rowIconSpacing: { marginRight: 12 },
  favoriteSummaryRow: { flexDirection: 'row', alignItems: 'center' },
  favoriteExpandedCard: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
});
