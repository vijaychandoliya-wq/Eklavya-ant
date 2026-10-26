import React, {useState} from 'react';
import {Button, Form, Input, WhiteSpace} from '@ant-design/react-native';
import {changePassword, ApiError} from '../api';
import {friendlyError} from '../hooks';
import {ButtonLabel, ErrorBar, PageTitle, Screen} from '../components/ui';

export default function ChangePasswordScreen({onDone}: {onDone: () => void}) {
  const [oldpassword, setOld] = useState('');
  const [newpassword, setNew] = useState('');
  const [confirmpassword, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const submit = async () => {
    if (!oldpassword) {setError('Enter your current password or access key.');return;}
    if (newpassword.trim().length < 15 || newpassword.length > 128) {setError('Use 15–128 characters for the new password.');return;}
    if (newpassword !== confirmpassword) {setError('The new passwords do not match.');return;}
    if (newpassword === oldpassword) {setError('Choose a different password.');return;}
    setLoading(true);
    setError('');
    setDone('');
    try {
      await changePassword({oldpassword, newpassword, confirmpassword});
      setOld('');setNew('');setConfirm('');
      onDone();
    } catch (reason) {
      setError(reason instanceof ApiError ? friendlyError(reason) : 'The change could not be confirmed. If your connection was interrupted, try signing in with the new password before retrying.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen error={error} onDismissError={() => setError('')}>
      <PageTitle title="Change password" subtitle="Use 15–128 characters. All devices will be signed out." />
      {done ? <ErrorBar message={done} onClose={() => setDone('')} /> : null}
      <Form layout="vertical">
        <Form.Item label="Current password or access key" required>
          <Input type="password" value={oldpassword} onChangeText={setOld} />
        </Form.Item>
        <Form.Item label="New password" required>
          <Input type="password" value={newpassword} onChangeText={setNew} />
        </Form.Item>
        <Form.Item label="Confirm password" required>
          <Input type="password" value={confirmpassword} onChangeText={setConfirm} />
        </Form.Item>
      </Form>
      <WhiteSpace size="lg" />
      <Button type="primary" loading={loading} onPress={submit}>
        <ButtonLabel icon="check" tone="onPrimary">Save password</ButtonLabel>
      </Button>
    </Screen>
  );
}
