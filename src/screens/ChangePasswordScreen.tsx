import React, {useState} from 'react';
import {Button, Form, Input, WhiteSpace} from '@ant-design/react-native';
import {changePassword} from '../api';
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
    setLoading(true);
    setError('');
    setDone('');
    try {
      await changePassword({oldpassword, newpassword, confirmpassword});
      setDone('Password updated.');
      setTimeout(onDone, 800);
    } catch (reason) {
      setError(friendlyError(reason));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen error={error} onDismissError={() => setError('')}>
      <PageTitle title="Change password" subtitle="Update your parent account password." />
      {done ? <ErrorBar message={done} onClose={() => setDone('')} /> : null}
      <Form layout="vertical">
        <Form.Item label="Current password" required>
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
