/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';


LogBox.ignoreLogs([
  'Each child in a list should have a unique "key" prop',
]);

AppRegistry.registerComponent(appName, () => App);