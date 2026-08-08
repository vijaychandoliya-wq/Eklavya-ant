import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {MENU, screenTitle} from '../src/navigation';

test('parent menu includes core screens', () => {
  const keys = MENU.map(item => item.key);
  expect(keys).toEqual(
    expect.arrayContaining([
      'dashboard',
      'homework',
      'assignments',
      'attendance',
      'fees',
      'leave',
      'onlineClass',
      'trackLocation',
    ]),
  );
  expect(screenTitle('dashboard')).toBe('Home');
});

test('renders without crashing when importing LoginScreen', async () => {
  const LoginScreen = require('../src/screens/LoginScreen').default;
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(React.createElement(LoginScreen, {onSuccess: () => undefined}));
  });
});
