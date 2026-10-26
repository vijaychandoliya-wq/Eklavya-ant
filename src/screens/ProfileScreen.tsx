import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Card, Text, WhiteSpace} from '@ant-design/react-native';
import {AnyRecord, getChildDetails, getLocalePreference, getSelectedChild, saveLocalePreference} from '../api';
import {friendlyError,useAsyncData} from '../hooks';
import {
  AntIcon,
  ButtonLabel,
  CardContent,
  LoadingBlock,
  Screen,
  SegmentedTabs,
  cardHeaderStyles,
} from '../components/ui';
import {ScreenKey} from '../navigation';
import {
  colorsDark,
  font,
  radius,
  spacing,
  useAppTheme,
  type AppColors,
  type ThemeMode,
} from '../theme';
import {AVAILABLE_MOBILE_LOCALES,useLanguage} from '../i18n';

type Palette = AppColors | typeof colorsDark;

const THEME_OPTIONS: {key: ThemeMode; label: string}[] = [
  {key: 'light', label: 'Light'},
  {key: 'dark', label: 'Dark'},
  {key: 'system', label: 'System'},
];

function makeStyles(c: Palette) {
  return StyleSheet.create({
    card: {borderRadius: radius.l, overflow: 'hidden'},
    line: {fontSize: font.xxl, fontWeight: '700', color: c.text},
    meta: {fontSize: font.main, color: c.textSecondary, marginTop: 4},
    themeHint: {
      fontSize: font.main,
      color: c.textSecondary,
      marginBottom: spacing.m,
      lineHeight: 18,
    },
    themeSegment: {marginBottom: 0},
  });
}

export default function ProfileScreen({
  profile,
  navigate,
}: {
  profile: AnyRecord | null;
  navigate: (screen: ScreenKey) => void;
}) {
  const {colors, mode, setMode} = useAppTheme();
  const {locale,setLocale,t}=useLanguage();
  const [preferenceVersion,setPreferenceVersion]=useState(0);
  const [savingLanguage,setSavingLanguage]=useState(false);
  const [languageError,setLanguageError]=useState('');
  const styles = useMemo(() => makeStyles(colors), [colors]);
  useEffect(()=>{getLocalePreference().then(value=>{if(AVAILABLE_MOBILE_LOCALES.some(option=>option.tag===value.localeTag))void setLocale(value.localeTag);setPreferenceVersion(Number(value.version)||0);}).catch(()=>undefined);},[setLocale]);
  const saveLanguage=async()=>{try{setSavingLanguage(true);setLanguageError('');const saved=await saveLocalePreference(locale,preferenceVersion);setPreferenceVersion(Number(saved.version)||preferenceVersion+1);}catch(error){setLanguageError(friendlyError(error));}finally{setSavingLanguage(false);}};

  const loader = useCallback(async () => {
    const child = await getSelectedChild();
    const details = await getChildDetails(child?.student_id);
    return {child, details};
  }, []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData(loader, {
    child: null,
    details: {},
  });
  if (loading) {
    return <LoadingBlock />;
  }
  const details = data.details || {};
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <Card style={styles.card}>
        <Card.Header
          styles={cardHeaderStyles}
          title="Parent"
          thumb={<AntIcon name="user" color={colors.primary} />}
        />
        <CardContent>
          <Text style={styles.line}>{profile?.name || 'Parent'}</Text>
          <Text style={styles.meta}>{profile?.email || ''}</Text>
        </CardContent>
      </Card>
      <WhiteSpace size="md" />
      <Card style={styles.card}>
        <Card.Header
          styles={cardHeaderStyles}
          title="Selected child"
          thumb={<AntIcon name="user" color={colors.primary} />}
        />
        <CardContent>
          <Text style={styles.line}>{details.fullName || data.child?.name || 'Child'}</Text>
          <Text style={styles.meta}>
            {details.gender} · DOB {details.dateOfBirth || '—'}
          </Text>
          <Text style={styles.meta}>
            {details.className || details.standard || details.schoolName || ''}
          </Text>
        </CardContent>
      </Card>
      <WhiteSpace size="md" />
      <Card style={styles.card}>
        <Card.Header
          styles={cardHeaderStyles}
          title="Appearance"
          thumb={<AntIcon name="bulb" color={colors.primary} />}
        />
        <CardContent>
          <Text style={styles.themeHint}>
            Choose light, dark, or follow the device setting. Preference is saved on this phone.
          </Text>
          <SegmentedTabs
            items={THEME_OPTIONS}
            value={mode}
            onChange={key => setMode(key as ThemeMode)}
            style={styles.themeSegment}
          />
        </CardContent>
      </Card>
      <WhiteSpace size="md" />
      <Card style={styles.card}>
        <Card.Header styles={cardHeaderStyles} title={t('language')} thumb={<AntIcon name="global" color={colors.primary} />} />
        <CardContent>
          <Text style={styles.themeHint}>{t('languageHelp')}</Text>
          <SegmentedTabs items={AVAILABLE_MOBILE_LOCALES.map(option=>({key:option.tag,label:option.label}))} value={locale} onChange={key => void setLocale(key as typeof locale)} style={styles.themeSegment} />
          {languageError?<Text style={[styles.themeHint,{color:colors.danger,marginTop:10}]}>{languageError}</Text>:null}
          <WhiteSpace size="md" />
          <Button type="primary" loading={savingLanguage} onPress={()=>void saveLanguage()}><ButtonLabel icon="check-circle" tone="onPrimary">{t('saveLanguage')}</ButtonLabel></Button>
        </CardContent>
      </Card>
      <WhiteSpace size="lg" />
      <Button type="primary" onPress={() => navigate('changePassword')}>
        <ButtonLabel icon="lock" tone="onPrimary">
          Change password
        </ButtonLabel>
      </Button>
    </Screen>
  );
}
