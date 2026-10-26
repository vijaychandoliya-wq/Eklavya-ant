import AsyncStorage from '@react-native-async-storage/async-storage';
import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';

export const LOCALE_STORAGE_KEY='gurukull.parent.locale.v1';
export const ALL_INDIAN_LOCALE_TAGS=['en','as','bn','brx','doi','gu','hi','kn','ks-Arab','kok-Deva','mai','ml','mni-Mtei','mr','ne','or','pa-Guru','sa','sat-Olck','sd-Arab','ta','te','ur'] as const;
export const AVAILABLE_MOBILE_LOCALES=[{tag:'en',label:'English'},{tag:'hi',label:'हिन्दी'},{tag:'ta',label:'தமிழ்'}] as const;
type LocaleTag=typeof AVAILABLE_MOBILE_LOCALES[number]['tag'];
type Key='language'|'languageHelp'|'saveLanguage'|'parentSignIn'|'schoolCode'|'identifier'|'password'|'signIn';
const copy:Record<LocaleTag,Record<Key,string>>={
  en:{language:'Language',languageHelp:'Choose the language used on this device. Save it to your school account from Profile.',saveLanguage:'Save language preference',parentSignIn:'Parent sign in',schoolCode:'School code',identifier:'Email or mobile number',password:'Password',signIn:'Sign in'},
  hi:{language:'भाषा',languageHelp:'इस डिवाइस की भाषा चुनें। विद्यालय खाते में सहेजने के लिए प्रोफ़ाइल खोलें।',saveLanguage:'भाषा वरीयता सहेजें',parentSignIn:'अभिभावक साइन इन',schoolCode:'विद्यालय कोड',identifier:'ईमेल या मोबाइल नंबर',password:'पासवर्ड',signIn:'साइन इन करें'},
  ta:{language:'மொழி',languageHelp:'இந்தச் சாதனத்தில் பயன்படுத்த வேண்டிய மொழியைத் தேர்ந்தெடுக்கவும். பள்ளிக் கணக்கில் சேமிக்க சுயவிவரத்தைத் திறக்கவும்.',saveLanguage:'மொழி விருப்பத்தைச் சேமி',parentSignIn:'பெற்றோர் உள்நுழைவு',schoolCode:'பள்ளிக் குறியீடு',identifier:'மின்னஞ்சல் அல்லது மொபைல் எண்',password:'கடவுச்சொல்',signIn:'உள்நுழைக'},
};
type Value={locale:LocaleTag;setLocale:(tag:LocaleTag)=>Promise<void>;t:(key:Key)=>string};
// A safe English fallback keeps isolated screen rendering (including error
// boundaries) usable even before the app root has mounted its provider.
const fallback:Value={locale:'en',setLocale:async()=>undefined,t:key=>copy.en[key]};
const Context=createContext<Value>(fallback);
export const LanguageProvider=({children}:{children:React.ReactNode})=>{
  const [locale,setLocaleState]=useState<LocaleTag>('en');
  useEffect(()=>{AsyncStorage.getItem(LOCALE_STORAGE_KEY).then(value=>{if(AVAILABLE_MOBILE_LOCALES.some(option=>option.tag===value))setLocaleState(value as LocaleTag);}).catch(()=>undefined);},[]);
  const value=useMemo<Value>(()=>({locale,setLocale:async next=>{setLocaleState(next);await AsyncStorage.setItem(LOCALE_STORAGE_KEY,next);},t:key=>copy[locale][key]}),[locale]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
};
export function useLanguage(){return useContext(Context);}
