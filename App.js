import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from './utils/supabaseClient';
import {
  fetchGoals,
  saveGoals,
  fetchEntries,
  insertEntry,
  deleteEntry,
  fetchSavedGoals,
  saveNewGoal,
  activateSavedGoal,
  deleteSavedGoal,
  fetchFavoriteFoods,
  addFavoriteFood,
  updateFavoriteFood,
  removeFavoriteFood,
  fetchDiet,
  saveDiet,
  describeDietSaveError,
} from './utils/db';
import { DEFAULT_DIET } from './data/dietOrder';
import { COLORS, TYPE, RADIUS } from './utils/theme';

import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import LogFoodScreen from './screens/LogFoodScreen';
import HistoryScreen from './screens/HistoryScreen';
import GoalsScreen from './screens/GoalsScreen';
import QuizScreen from './screens/QuizScreen';
import LoadingScreen from './screens/LoadingScreen';
import ReportScreen from './screens/ReportScreen';
import ReportPagesScreen from './screens/ReportPagesScreen';
import MacroGoalsScreen from './screens/MacroGoalsScreen';
import DietPickerScreen from './screens/DietPickerScreen';
import FollowGoalScreen from './screens/FollowGoalScreen';
import { makeEntryFromFood, entriesForToday } from './utils/nutrition';
import { buildProfile, generateGoalsReport } from './utils/goals';

const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 200, fat: 65, tdee: null };

// Icon names are MaterialCommunityIcons, from @expo/vector-icons — already a
// dependency, so the tab bar gained icons in v0.0.72 without adding one.
const TABS = [
  { key: 'dashboard', label: 'Today', icon: 'calendar-star' },
  { key: 'log', label: 'Log Food', icon: 'silverware-fork-knife' },
  { key: 'history', label: 'History', icon: 'chart-bar' },
  { key: 'goals', label: 'Goals', icon: 'target' },
];

export default function App() {
  // --- Account login state ---
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- App data state (now backed by Supabase instead of the phone) ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  // The user's diet, which reorders the Log Food tab (data/dietOrder.js).
  // Held next to `goals` rather than inside it because it is stored on the
  // same row but never travels with the numbers — saved goals, following a
  // goal and the macro sliders all move calories/protein/carbs/fat around
  // and none of them should carry a diet along with them.
  const [diet, setDiet] = useState(DEFAULT_DIET);
  // Open state for the "My Diet" picker, a full-screen takeover from the
  // Goals tab in the same style as the macro-goals screen.
  const [dietPickerOpen, setDietPickerOpen] = useState(false);
  // The up-to-5 named goals from utils/db.js's saved_goals table — a
  // separate, parallel list from the single `goals` row above. `goals`
  // itself is still the only thing Dashboard/History actually read from
  // for the progress bars; this is just the named history you can save a
  // new one into or switch back to, shown on the Goals tab.
  const [savedGoals, setSavedGoals] = useState([]);
  // Every favorite this user has saved on the Log Food tab's "My
  // Favorites" chip — as of the My Favorites overhaul, this is a list of
  // full saved snapshots (exact settings + portion), not just food ids —
  // see utils/db.js's own comment on this, and screens/LogFoodScreen.js's
  // FavoriteListItem for how each one gets displayed/numbered.
  const [favorites, setFavorites] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setEntries([]);
      setGoals(DEFAULT_GOALS);
      setSavedGoals([]);
      setFavorites([]);
      setDiet(DEFAULT_DIET);
      setDataLoading(true);
      return;
    }

    let cancelled = false;
    setDataLoading(true);
    (async () => {
      try {
        const [userGoals, userEntries, userSavedGoals, userFavorites, userDiet] = await Promise.all([
          fetchGoals(session.user.id),
          fetchEntries(session.user.id),
          fetchSavedGoals(session.user.id),
          fetchFavoriteFoods(session.user.id),
          fetchDiet(session.user.id),
        ]);
        if (cancelled) return;
        setGoals(userGoals);
        setEntries(userEntries);
        setSavedGoals(userSavedGoals);
        setFavorites(userFavorites);
        // Null for anyone who took the quiz before v0.0.69 started saving
        // this, and for anyone whose database predates the `diet` column.
        // Balanced is the ordering the app has always had, so those users
        // notice nothing until they set one.
        setDiet(userDiet || DEFAULT_DIET);
      } catch (err) {
        console.warn('Failed to load your data from Supabase', err);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  // Saves a BRAND NEW favorite snapshot (never overwrites an existing one
  // — that's what lets the same food be saved multiple times with
  // different settings, numbered 1/2/3... in My Favorites). Waits for the
  // real database row (with its real id) before updating local state,
  // since screens/LogFoodScreen.js's numbering and the Edit/Remove flow
  // both need that real id, not a locally-guessed one — the trade-off is
  // this isn't optimistic like handleDeleteEntry below, but favoriting
  // isn't on the same tight "feels instant" path a delete button is.
  // Returns the created favorite (or null on failure) so LogFoodScreen can
  // show/skip its own confirmation toast.
  const handleAddFavorite = async (favoriteData) => {
    try {
      const created = await addFavoriteFood(session.user.id, favoriteData);
      setFavorites((prev) => [...prev, created]);
      return created;
    } catch (err) {
      console.warn('Failed to save favorite', err);
      Alert.alert("Couldn't save to Favorites", 'Something went wrong. Please try again.');
      return null;
    }
  };

  // Overwrites ONE existing favorite in place — the Edit -> "Save Changes"
  // flow inside My Favorites. Never creates a new numbered variant.
  const handleUpdateFavorite = async (favoriteId, favoriteData) => {
    try {
      const updated = await updateFavoriteFood(favoriteId, favoriteData);
      setFavorites((prev) => prev.map((f) => (f.id === favoriteId ? updated : f)));
      return updated;
    } catch (err) {
      console.warn('Failed to update favorite', err);
      Alert.alert("Couldn't save your changes", 'Something went wrong. Please try again.');
      return null;
    }
  };

  // Removes one specific saved favorite by its own row id. Updates the
  // screen right away (so it feels instant), then deletes it from
  // Supabase — if that fails for some reason, it's put back, same
  // optimistic-update-then-reconcile shape as handleDeleteEntry below uses
  // for logged entries.
  const handleRemoveFavorite = async (favoriteId) => {
    const previousFavorites = favorites;
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    try {
      await removeFavoriteFood(favoriteId);
    } catch (err) {
      console.warn('Failed to remove favorite, restoring it', err);
      setFavorites(previousFavorites);
    }
  };

  // Up to 5 saved goals total — once you're at the cap, SaveGoalModal
  // (opened from ReportScreen's "Save These Goals" and MacroGoalsScreen's
  // "Save These Goals") blocks saving a new one and tells you to delete
  // one first, rather than silently replacing an old one.
  const atSavedGoalsCap = savedGoals.length >= 5;

  // Which saved goal (if any) is currently showing screens/FollowGoalScreen.js's
  // "Follow this goal?" confirmation — the actual goal object being
  // previewed, or null when that screen isn't open. Tapping "Follow this
  // goal" on the Goals tab (see GoalsScreen.js's onRequestFollow) just
  // sets this; it doesn't touch Supabase or `goals` until the user
  // actually confirms with Yes on that screen (handleFollowConfirm below)
  // — switching what you're tracking is meant to be a deliberate,
  // visible choice, not an instant side effect of a list-row tap.
  const [followPreviewGoal, setFollowPreviewGoal] = useState(null);

  // Actually switches which saved goal is active: writes through to
  // Supabase (both flipping the is_active flag there and updating the
  // single `goals` row), then mirrors that locally — updating `goals`
  // directly rather than going through handleChangeGoals, since
  // activateSavedGoal already persisted the numbers server-side and a
  // second debounced save would just be a redundant write. Left to throw
  // on failure — FollowGoalScreen awaits this and shows the error inline
  // itself (same pattern as SaveGoalModal's onConfirm), so the user stays
  // on the confirmation screen and can just tap Yes again.
  const handleFollowConfirm = async () => {
    const goal = followPreviewGoal;
    await activateSavedGoal(session.user.id, goal);
    setSavedGoals((prev) => prev.map((g) => ({ ...g, is_active: g.id === goal.id })));
    // Merged onto the previous goals state (not a full replacement) so
    // `tdee` — a fact about the user's body, unrelated to which goal they
    // just switched to — survives the switch instead of silently
    // disappearing and taking screens/FollowGoalScreen.js's calorie-math
    // paragraph down with it next time this screen opens.
    setGoals((prev) => ({ ...prev, calories: goal.calories, protein: goal.protein, carbs: goal.carbs, fat: goal.fat }));
    setFollowPreviewGoal(null);
  };

  // Saves a brand-new "Set My Own Macro Goals" goal WITHOUT switching what
  // the app is currently tracking — the "Save the goal" button on
  // FollowGoalScreen's save-mode confirmation (see MacroGoalsScreen.js's
  // saveConfirm state). Left to throw on failure, same reasoning as
  // handleFollowConfirm above: FollowGoalScreen awaits this and shows the
  // error inline itself, so the user stays on the confirmation and can
  // just try again.
  const handleSaveGoalOnly = async (name, newGoals) => {
    const created = await saveNewGoal(session.user.id, { name, ...newGoals }, { follow: false });
    setSavedGoals((prev) => [...prev, created]);
    setMacroGoalsOpen(false);
  };

  // The other button on that same confirmation — saves it AND makes it the
  // active goal, in one step. Equivalent to the old handleSaveMacroGoal
  // this replaces.
  //
  // The database side of "only one goal is_active at a time" is already
  // handled inside saveNewGoal (it clears the old active row before
  // inserting this one) — but that's invisible to whatever's already
  // sitting in the `savedGoals` array in memory here. Without also
  // clearing every OTHER goal's `is_active` locally, the previously-active
  // goal would keep showing its "Following" badge right alongside the new
  // one until the next full refetch — which is exactly the two-goals-
  // marked-Following bug Damon reported.
  const handleSaveAndFollowGoal = async (name, newGoals) => {
    const created = await saveNewGoal(session.user.id, { name, ...newGoals }, { follow: true });
    setSavedGoals((prev) => [...prev.map((g) => ({ ...g, is_active: false })), created]);
    handleChangeGoals(newGoals);
    setMacroGoalsOpen(false);
  };

  const handleDeleteSavedGoal = async (goalId) => {
    try {
      await deleteSavedGoal(session.user.id, goalId);
      setSavedGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (err) {
      console.warn('Failed to delete saved goal', err);
      Alert.alert("Couldn't delete this goal", 'Something went wrong. Please try again.');
    }
  };

  // Adds a food to today's log: builds the entry locally, saves it to
  // Supabase, then puts the saved version (with its real database id) into
  // state so the screen updates immediately. Returns the saved entry (or
  // null if it failed) so callers — like the "Undo" button — know its id.
  const handleAddEntry = async (food, servings) => {
    const localEntry = makeEntryFromFood(food, servings);
    try {
      const saved = await insertEntry(session.user.id, localEntry);
      setEntries((prev) => [saved, ...prev]);
      return saved;
    } catch (err) {
      console.warn('Failed to save entry', err);
      return null;
    }
  };

  // Removes an entry. We update the screen right away (so it feels
  // instant), then delete it from Supabase — if that fails for some
  // reason, we put the entry back so the screen still matches reality.
  const handleDeleteEntry = async (id) => {
    const previousEntries = entries;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteEntry(id);
    } catch (err) {
      console.warn('Failed to delete entry, restoring it', err);
      setEntries(previousEntries);
    }
  };

  // Goals get saved to Supabase a moment after the user stops typing,
  // instead of on every keystroke, so we're not sending a network request
  // for every digit typed.
  const goalsSaveTimer = useRef(null);
  const handleChangeGoals = (newGoals) => {
    // Merged onto the previous state rather than a full replacement —
    // several callers (handleSaveQuizGoal, handleQuizDone,
    // handleSaveAndFollowGoal) only ever pass {calories, protein, carbs,
    // fat}, with no `tdee` key at all. A full replacement would silently
    // wipe `tdee` from local state every time any of those ran — e.g. the
    // very act of saving a quiz result would erase the TDEE that same
    // quiz just computed a moment earlier. saveGoals below has the same
    // "only touches the keys it's given" property already (see its own
    // comment in utils/db.js), so this keeps local state and the database
    // consistent with each other.
    setGoals((prev) => ({ ...prev, ...newGoals }));
    if (!session) return;
    if (goalsSaveTimer.current) clearTimeout(goalsSaveTimer.current);
    goalsSaveTimer.current = setTimeout(() => {
      saveGoals(session.user.id, newGoals).catch((err) =>
        console.warn('Failed to save goals', err)
      );
    }, 600);
  };

  const todayEntries = entriesForToday(entries);

  // --- Goals quiz state ---
  // `quizStage` is null when the quiz isn't open at all, 'quiz' while
  // answering questions, 'loading' for the brief "building your plan"
  // screen right after, and 'report' once that's finished — this is
  // deliberately separate from `activeTab` so opening the quiz takes over
  // the whole screen (no tab bar) instead of being just another tab.
  const [quizStage, setQuizStage] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState(null);
  const [quizReport, setQuizReport] = useState(null);
  const [quizProfile, setQuizProfile] = useState(null);
  // Which report view is showing once the quiz is done: the multi-page
  // walkthrough ('pages', the default) or the compact one-page recap
  // ('summary', reached via "Skip to Summary" or by finishing the last
  // page). The "needs professional guidance" case has no real calorie
  // number to walk through page by page, so it goes straight to 'summary'.
  const [reportView, setReportView] = useState('pages');

  // --- "Set My Own Macro Goals" (GoalsScreen's second button) — a much
  // simpler full-screen takeover than the quiz above: no multi-step flow,
  // just one screen the user can Save from or Cancel out of. Kept as its
  // own boolean rather than folding it into `quizStage` since it's a
  // genuinely separate flow that doesn't share any of the quiz's
  // states/screens.
  const [macroGoalsOpen, setMacroGoalsOpen] = useState(false);

  const handleStartQuiz = () => setQuizStage('quiz');

  // Changing diet from the Goals tab. Reorders Log Food and nothing else —
  // it deliberately does NOT recalculate calories or macros, even though
  // diet feeds those too (see utils/goals.js). Rewriting someone's targets
  // because they tapped a button labelled "My Diet" would be a surprise;
  // recalculating stays the quiz's job.
  //
  // Applied locally first so the picker closes on an ordering that has
  // already changed, then persisted. A failed write leaves the app showing
  // the new diet until the next reload, which is a better outcome than
  // silently reverting the choice under the user.
  const handleSaveDiet = async (nextDiet) => {
    setDiet(nextDiet);
    setDietPickerOpen(false);
    if (!session) return;
    try {
      await saveDiet(session.user.id, nextDiet);
    } catch (err) {
      console.warn('Failed to save your diet', err);
      Alert.alert(
        'Could not save your diet',
        `${describeDietSaveError(err)}\n\nLog Food is reordered for now, but the change will be lost when you reload.`
      );
    }
  };

  const handleQuizComplete = (answers) => {
    const profile = buildProfile(answers);
    const report = generateGoalsReport(profile);
    setQuizAnswers(answers);
    setQuizProfile(profile);
    setQuizReport(report);
    setReportView(report.calorieTarget.capped === 'needs_professional_guidance' ? 'summary' : 'pages');
    // The report itself is ready immediately (it's all just arithmetic),
    // but we show a brief "building your plan" screen before it rather
    // than cutting straight from the last quiz question to a fully-formed
    // report — see screens/LoadingScreen.js for why.
    setQuizStage('loading');

    // The mandatory intake quiz (and every retake) is this app's one real
    // source for TDEE — persist it the moment it's computed, independent
    // of whether this particular result ever gets saved/applied as goals,
    // so screens/FollowGoalScreen.js's "you burn X calories a day" math
    // (see utils/goals.js's buildFollowSummary) always has this user's
    // latest number on hand, not just whatever their active goal happens
    // to be. saveGoals only touches the `tdee` column here — see its own
    // comment in utils/db.js — so this can't clobber calories/protein/
    // carbs/fat even if this report is never actually applied.
    setGoals((prev) => ({ ...prev, tdee: report.tdee }));
    if (session) {
      saveGoals(session.user.id, { tdee: report.tdee }).catch((err) =>
        console.warn('Failed to save TDEE', err)
      );
    }

    // The diet answer, persisted on exactly the same terms as TDEE above:
    // the moment it's known, whether or not this report ever gets applied
    // as goals. Before v0.0.69 this answer only ever existed inside
    // `quizAnswers` in this component's state and was thrown away when the
    // quiz flow closed, which is why every account created before then has
    // no diet stored and falls back to balanced.
    if (answers.diet) {
      setDiet(answers.diet);
      if (session) {
        saveDiet(session.user.id, answers.diet).catch((err) =>
          console.warn('Failed to save diet', err)
        );
      }
    }
  };

  // The shared "close out of the quiz flow" tail — used both when there's
  // nothing to save (mid-quiz cancel, or the "needs professional
  // guidance" case's plain Done button) and after a successful save (see
  // handleSaveQuizGoal below), so both paths reset the same pile of quiz
  // state the same way.
  const finishQuiz = () => {
    setQuizStage(null);
    setQuizAnswers(null);
    setQuizProfile(null);
    setQuizReport(null);
    setReportView('pages');
  };

  // Wired to QuizScreen's onCancel (backing out mid-quiz, quizReport is
  // still null — nothing to apply) and to ReportScreen's plain "Done"
  // button for the "needs professional guidance" case (a real report, but
  // calorieTarget.calories is deliberately null there — see
  // computeCalorieTarget in utils/goals.js — so there's still nothing to
  // apply). The normal case's "Save These Goals" button no longer calls
  // this directly — see handleSaveQuizGoal just below.
  const handleQuizDone = () => {
    if (quizReport && quizReport.calorieTarget.calories != null && quizReport.macros) {
      handleChangeGoals({
        calories: quizReport.calorieTarget.calories,
        protein: quizReport.macros.proteinG,
        carbs: quizReport.macros.carbsG,
        fat: quizReport.macros.fatG,
      });
    }
    finishQuiz();
  };

  // What actually runs once SaveGoalModal's own Save is confirmed with a
  // name typed in (see ReportScreen.js's onSaveGoal wiring): saves this
  // quiz result as one of up to 5 named saved goals, makes it the active
  // goal, and then closes out of the quiz flow the same way handleQuizDone
  // does. Left to throw on failure — SaveGoalModal awaits this and shows
  // the error inline itself rather than this function swallowing it, so
  // the user doesn't lose their typed name and can just retry.
  const handleSaveQuizGoal = async (name) => {
    const { calorieTarget, macros } = quizReport;
    const created = await saveNewGoal(session.user.id, {
      name,
      calories: calorieTarget.calories,
      protein: macros.proteinG,
      carbs: macros.carbsG,
      fat: macros.fatG,
    });
    // See the identical comment on handleSaveAndFollowGoal above — this
    // always saves+follows too, so every other goal's local `is_active`
    // needs clearing here for the same reason.
    setSavedGoals((prev) => [...prev.map((g) => ({ ...g, is_active: false })), created]);
    handleChangeGoals({
      calories: calorieTarget.calories,
      protein: macros.proteinG,
      carbs: macros.carbsG,
      fat: macros.fatG,
    });
    finishQuiz();
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f8ef7" />
      </SafeAreaView>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (dataLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f8ef7" />
      </SafeAreaView>
    );
  }

  if (quizStage === 'quiz') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <QuizScreen onComplete={handleQuizComplete} onCancel={handleQuizDone} />
      </SafeAreaView>
    );
  }

  if (quizStage === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <LoadingScreen onDone={() => setQuizStage('report')} />
      </SafeAreaView>
    );
  }

  if (quizStage === 'report') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        {reportView === 'pages' ? (
          <ReportPagesScreen
            profile={quizProfile}
            answers={quizAnswers}
            report={quizReport}
            onSkipToSummary={() => setReportView('summary')}
            onFinishPages={() => setReportView('summary')}
          />
        ) : (
          <ReportScreen
            profile={quizProfile}
            answers={quizAnswers}
            report={quizReport}
            onDone={handleQuizDone}
            onSaveGoal={handleSaveQuizGoal}
            atCap={atSavedGoalsCap}
          />
        )}
      </SafeAreaView>
    );
  }

  if (macroGoalsOpen) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <MacroGoalsScreen
          goals={goals}
          onSaveOnly={handleSaveGoalOnly}
          onSaveAndFollow={handleSaveAndFollowGoal}
          onCancel={() => setMacroGoalsOpen(false)}
          atCap={atSavedGoalsCap}
          tdee={goals.tdee}
        />
      </SafeAreaView>
    );
  }

  if (dietPickerOpen) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <DietPickerScreen
          diet={diet}
          onSave={handleSaveDiet}
          onCancel={() => setDietPickerOpen(false)}
        />
      </SafeAreaView>
    );
  }

  if (followPreviewGoal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <FollowGoalScreen
          mode="follow"
          goal={followPreviewGoal}
          currentTdee={goals.tdee}
          onConfirm={handleFollowConfirm}
          onCancel={() => setFollowPreviewGoal(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {activeTab === 'dashboard' && (
          <DashboardScreen entries={todayEntries} goals={goals} onDeleteEntry={handleDeleteEntry} />
        )}
        {activeTab === 'log' && (
          <LogFoodScreen
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            favorites={favorites}
            onAddFavorite={handleAddFavorite}
            onUpdateFavorite={handleUpdateFavorite}
            onRemoveFavorite={handleRemoveFavorite}
            diet={diet}
          />
        )}
        {activeTab === 'history' && <HistoryScreen entries={entries} goals={goals} />}
        {activeTab === 'goals' && (
          <GoalsScreen
            goals={goals}
            onLogout={handleLogout}
            userEmail={session.user.email}
            onRetakeQuiz={handleStartQuiz}
            onSetMacroGoals={() => setMacroGoalsOpen(true)}
            savedGoals={savedGoals}
            onRequestFollow={setFollowPreviewGoal}
            onDeleteSavedGoal={handleDeleteSavedGoal}
            diet={diet}
            onChangeDiet={() => setDietPickerOpen(true)}
          />
        )}
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const on = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
            >
              {/* The selected tab sits on a filled pill rather than just
                  changing colour -- at 12pt a colour change alone is easy
                  to miss, and the pill also gives the icon somewhere to
                  sit. */}
              <View style={[styles.tabInner, on && styles.tabInnerActive]}>
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={22}
                  color={on ? COLORS.tabActive : COLORS.tabInactive}
                />
                <Text style={[styles.tabLabel, on && styles.tabLabelActive]}>{tab.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  // Floats clear of the screen edge rather than sitting flush against it
  // (v0.0.76, from the History mockup). Shared by every tab, so this moves
  // Today, Log Food and Goals too -- a bar that only detached on one screen
  // would read as a bug.
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingVertical: 7,
    paddingHorizontal: 6,
    shadowColor: '#152a4a',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tabButton: { flex: 1, alignItems: 'center' },
  tabInner: {
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.tile,
    alignSelf: 'stretch',
  },
  tabInnerActive: { backgroundColor: COLORS.tabActiveBg },
  tabLabel: { ...TYPE.tab, color: COLORS.tabInactive, marginTop: 3 },
  tabLabelActive: { color: COLORS.tabActive, fontWeight: '700' },
});
