import React, {useState} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet} from 'react-native';
import {Button, Card, Form, Input, Text, View, WhiteSpace} from '@ant-design/react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {login, logoutAllDevices} from '../api';
import {friendlyError} from '../hooks';
import {AntIcon, ButtonLabel, CardContent, ErrorBar, cardHeaderStyles} from '../components/ui';
import {colors, font, radius, spacing} from '../theme';

export default function LoginScreen({onSuccess}: {onSuccess: () => void}) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!mobile.trim() || !password) {
      setError('Enter your mobile number and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(mobile, password);
      onSuccess();
    } catch (reason: any) {
      const message = friendlyError(reason);
      if (/another device/i.test(message)) {
        try {
          await logoutAllDevices(mobile);
          await login(mobile, password);
          onSuccess();
          return;
        } catch (retryError) {
          setError(friendlyError(retryError));
          return;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brandMark}>
            <AntIcon name="team" color="#fff" size={36} />
          </View>
          <Text style={styles.title}>Eklavya</Text>
          <Text style={styles.subtitle}>Parent app for Gurukull — attendance, homework and school updates.</Text>
          <WhiteSpace size="xl" />
          <Card style={styles.card}>
            <Card.Header
              styles={cardHeaderStyles}
              title="Parent sign in"
              thumb={<AntIcon name="safety-certificate" />}
            />
            <CardContent>
              <ErrorBar message={error} onClose={() => setError('')} />
              <WhiteSpace size="lg" />
              <Form layout="vertical">
                <Form.Item label="Mobile number" required>
                  <Input
                    type="number"
                    value={mobile}
                    onChangeText={setMobile}
                    placeholder="Registered mobile number"
                  />
                </Form.Item>
                <Form.Item label="Password" required>
                  <Input
                    type="password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                  />
                </Form.Item>
              </Form>
              <WhiteSpace size="lg" />
              <Button type="primary" loading={loading} onPress={submit}>
                <ButtonLabel icon="check-circle" tone="onPrimary">
                  Sign in
                </ButtonLabel>
              </Button>
            </CardContent>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  safe: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.xl, paddingTop: 48},
  brandMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {fontSize: 32, fontWeight: '700', color: colors.text},
  subtitle: {fontSize: font.main, color: colors.textSecondary, marginTop: 8, lineHeight: 22},
  card: {borderRadius: radius.l, overflow: 'hidden'},
});
