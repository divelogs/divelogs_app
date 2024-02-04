import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as resources from './resources'
import { NativeModules, Platform } from 'react-native';

// the laguage code from the users language settings
//var language = (NativeModules.SettingsManager.settings.AppleLocale ||
    //NativeModules.SettingsManager.settings.AppleLanguages[0]).substr(0,2);

var language =
      (Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
        : NativeModules.I18nManager.localeIdentifier).substr(0,2);

const availablelanguages = ["de", "en"];
// Fallback to english if used language is not in available ones
if (availablelanguages.indexOf(language)==-1) language = "en"

i18n.use(initReactI18next).init ({
    compatibilityJSON: 'v3',
    resources: {
        ...Object.entries(resources).reduce(
            (acc, [key, value]) => ({
               ...acc,
                [key]: {
                    translation: value,
                },                
            }),
            {},
        ),
    },
    lng: language
})

export default i18n