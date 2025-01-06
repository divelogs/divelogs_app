This is the [**divelogs companion app**] project, for use with [**divelogs.de**](https://divelogs.de) or [**divelogs.org**](https://divelogs.org).

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Clone this Repository to some folder on your computer

```bash
 git clone https://github.com/divelogs/divelogs_app.git
 ```

## Step 2: Install all dependencies:

```bash
 npm install
 ```

## Step 3: install pods for iOS

```bash
 cd ios
 pod install
 ```

## Step 4: run the app

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see the app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## divelogs API documentation

The app uses the divelogs RESTful API documented here: [**https://divelogs.de/api/docs**](https://divelogs.de/api/docs)
