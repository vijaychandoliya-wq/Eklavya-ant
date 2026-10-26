# Eklavya

Parent mobile app for Gurukull — React Native + Ant Design Mobile.

This is a common multi-school build. It uses the shared API at
`https://gurukul-worker-api.gurukull.workers.dev` and sends the school code in `x-school-code` on every
request. Enter any configured school code on the sign-in screen; the app does
not guess a DNS hostname from that code.

## Run

```sh
npm install
npm start
npm run android
```

## Login

Use the parent mobile number registered by the school administrator and the one-time access key issued from **Roles & access**. No demo account is bundled.

## Stack

Mirrors `gurukull-teacher-ant`:
- React Native 0.83
- `@ant-design/react-native`
- AsyncStorage session + selected child
