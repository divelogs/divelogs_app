import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as resources from './resources'
import * as RNLocalize from "react-native-localize";

// the laguage code from the users language settings
var locale = RNLocalize.getLocales()[0].languageCode;

const availablelanguages = ["de", "en", "fr", "it", "nl", "es"];
// Fallback to english if used language is not in available ones
if (availablelanguages.indexOf(locale)==-1) locale = "en"

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
    lng: locale
})

export default i18n