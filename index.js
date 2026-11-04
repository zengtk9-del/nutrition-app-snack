// The app's entry point, and the thing a Snack never needed.
//
// Snack loaded App.js directly. A real build does not: something has to
// register the root component with React Native's AppRegistry before
// anything renders. registerRootComponent does that, and does it the same
// way whether the app is running in Expo Go, a development build or the
// signed binary that goes to the App Store — which is why `main` in
// package.json points here rather than at App.js.
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
