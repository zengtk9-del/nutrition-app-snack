// The one place this app's version number lives — shown at the bottom of
// the Today tab (screens/DashboardScreen.js), and, as of 0.0.14, at the
// bottom of the login screen (screens/AuthScreen.js) too — purely so Damon
// has an easy way to eyeball "did the code I just pasted in actually take
// effect?" without having to compare file contents by hand.
//
// The rule going forward: every time any file in this app is delivered
// with a change, however small, this number goes up — starting at 0.0.1
// and incrementing the last digit (0.0.2, 0.0.3, …) for each round of
// changes.
//
// 0.9.0 breaks that pattern on purpose: it is not a feature round. It is
// the move off Expo Snack and into a real Expo project — the one that can
// actually be built and submitted to a store. What changed is everything
// a Snack never needed and a build cannot do without: index.js (registers
// the root component), package.json (a `main` and pinned SDK 54
// dependencies instead of Snack's implicit ones), app.json (bundle
// identifier, version, build number, icon and splash), eas.json (build
// and submit profiles), .gitignore, and assets/.
//
// It also deleted 85 files. `utils/` had come to contain a whole second
// copy of the app at 0.0.65 — utils/App.js, utils/screens/, utils/data/,
// utils/components/, utils/utils/ — plus utils/package.json, a leftover
// Snack manifest declaring react-native-paper and react-native-url-polyfill,
// neither of which this app uses. None of it was reachable from the entry
// point. components/CornerMascot.js and components/HapticsCheck.js went
// with it for the same reason.
//
// 0.9.1 adds the two things that stand between a build and a tester's
// phone: ios.config.usesNonExemptEncryption, so the upload answers
// Apple's export-compliance question instead of sitting in App Store
// Connect marked "Missing Compliance", and an explicit
// distribution:"store" on the production profile, because TestFlight
// takes store builds only and the preview profile's internal
// distribution is a different thing entirely (ad hoc, UDID-limited).
//
// 0.9.2 brings the artwork into the app. All 1,826 images -- 1,773 food
// icons, 29 mascot animations, 24 pieces of brand art, about 49 MB --
// now ship in the binary instead of streaming from jsDelivr. Nothing a
// user sees waits on a network request any more, and the icons cannot
// all break at once if that asset repo is ever renamed or deleted.
// data/bundledArt.js is the generated table of requires;
// utils/assetHost.js checks it first and still falls back to the CDN, so
// art added between App Store releases keeps working without an update.
//
// 0.9.3 is three unrelated changes that happened to be ready together,
// plus a deletion that was overdue.
//
// THE AGE FLOOR moved from 10 to 13 (data/quizQuestions.js). It is a
// legal line, not a design one: the published privacy policy states the
// app is not directed to children under 13, which is what keeps COPPA
// out of scope, and a dial that let a 10-year-old through contradicted
// that in the app's own first minute.
//
// THE NAME PROMPT now asks "What do I call you?" with a "Name or
// nickname" placeholder instead of "What is your name?" / "Enter your
// name". Not a legal fix -- that answer has never left the phone and
// still doesn't -- but the old wording collects legal first names and
// the new one collects "Dan", and the less real identity sitting in
// device storage the better.
//
// PAGE 2 OF THE REPORT, Calorie Breakdown, is now a three-beat reveal
// built on one stacked chart instead of two figures stated one under the
// other. The old page listed BMR and then TDEE, which invited exactly
// the question it should have answered: do you add them? You do not --
// utils/goals.js computes TDEE as `bmr * neatMultiplier + trainingBonus`,
// so BMR is already inside it. The chart answers that by construction:
// At rest and Activity are two parts of one column, Activity being the
// remainder (tdee - bmr), and both columns always finish at the same
// height, with the surplus or the deficit drawn as the cap that makes up
// the difference. Next advances a beat before it turns the page, and
// buzzes for both, on the same reasoning the file already gives for why
// this screen is the one place navigation buzzes at all.
//
// AND 85 FILES ARE GONE. utils/ still carried a whole second copy of the
// app at 0.0.65 -- utils/screens/, utils/utils/, utils/data/,
// utils/components/, utils/App.js, utils/package.json -- along with
// components/CornerMascot.js and components/HapticsCheck.js. None of it
// was reachable from the entry point. It was deleted in 0.9.0 and came
// back when the repo was reconciled through the GitHub website; this
// removes it again.
export const APP_VERSION = '0.9.3';
