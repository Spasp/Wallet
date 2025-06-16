This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).


# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.
> Create a virtual device through Android Studio or connect a real device with your computer which has developer options enabled and USB debugging ON

## Step 1: 
-Download project to a local folder using git
-Navigate to the root file of the project ...yourepositorypath/NatechProj
- Run npm i 

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: 
npm run android
## Step 3:
In case you need a release build. Navigate to Root of the project (~/NatechProj) 
through a apropriate terminal and run
1. cd android
2. ./gradlew assembleRelease --> creates a release .apk file in folder NatechProj/android/app/build/outputs/apk/release/app-release.apk
3. copy paste the .apk file on a device and install it.
### iOS
Not build on an iOS enviromnent. I haven't tested in IOS, I don't have a mac.

# Acknowledgements
- React native/Typescript bare cli project -> not much experience with expo
- react navigation packages for navigation
- Wallet Screen + Transfer Funds bottomSheet + Validation Screen +  Settings screen (Blank)
- zod package for validation schema
- Enchanced UX with Slider component
- User feedback through UI (border colors, Error messages, Alerts, toasts) 
- mock api with fetch and Promise, Testing unhappy paths with custom inputs check src/service/TransferFundsd.ts
- minimal accessibility settings
- no tests
- no Login functionality
  
# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
