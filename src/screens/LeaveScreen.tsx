import React, {useCallback, useState} from 'react';
import {Button, Form, Input, Picker, WhiteSpace} from '@ant-design/react-native';
import {AnyRecord, applyLeave, deleteLeave, getLeaveReasons, getLeaves} from '../api';
import {formatDate, friendlyError, pickerData, useAsyncData} from '../hooks';
import {ButtonLabel, EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen, SectionTitle} from '../components/ui';

export default function LeaveScreen() {
  const [fromDate, setFrom] = useState(formatDate(new Date()));
  const [toDate, setTo] = useState(formatDate(new Date()));
  const [reasonId, setReasonId] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loader = useCallback(async () => {
    const [leaves, reasons] = await Promise.all([getLeaves(), getLeaveReasons()]);
    return {leaves, reasons};
  }, []);
  const {data, loading, refreshing, error, refresh, clearError, reload} = useAsyncData(loader, {leaves: [], reasons: []});

  const submit = async () => {
    if (!reasonId) {
      setFormError('Choose a leave reason.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await applyLeave({from_date: fromDate, to_date: toDate, reason_id: reasonId, remarks});
      setRemarks('');
      reload();
    } catch (reason) {
      setFormError(friendlyError(reason));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock />;
  const reasonLabel = data.reasons.find((item: AnyRecord) => String(item.id) === reasonId)?.title || 'Select reason';

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error || formError} onDismissError={() => { clearError(); setFormError(''); }}>
      <PageTitle title="Apply leave" subtitle="Submit leave for the selected child." />
      <Form layout="vertical">
        <Form.Item label="From date" required>
          <Input value={fromDate} onChangeText={setFrom} placeholder="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item label="To date" required>
          <Input value={toDate} onChangeText={setTo} placeholder="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item label="Reason" required>
          <Button onPress={() => setPickerVisible(true)}>{reasonLabel}</Button>
        </Form.Item>
        <Form.Item label="Remarks">
          <Input value={remarks} onChangeText={setRemarks} placeholder="Optional remarks" />
        </Form.Item>
      </Form>
      <Button type="primary" loading={saving} onPress={submit}>
        <ButtonLabel icon="plus" tone="onPrimary">Submit leave</ButtonLabel>
      </Button>
      <WhiteSpace size="xl" />
      <SectionTitle title="Applied leaves" />
      {data.leaves.length ? data.leaves.map((item: AnyRecord, index: number) => (
        <RecordCard
          key={item.id || index}
          title={item.reason || item.title || 'Leave'}
          status={item.status}
          icon="form"
          meta={[item.from_date, item.to_date]}
          body={item.remarks}
          footer={item.id ? (
            <Button size="small" type="warning" onPress={async () => { await deleteLeave(item.id); reload(); }}>
              Delete
            </Button>
          ) : undefined}
        />
      )) : <EmptyBlock title="No leaves" message="Submitted leave requests will appear here." icon="form" />}

      <Picker
        visible={pickerVisible}
        data={pickerData(data.reasons, 'title', 'id')}
        cols={1}
        value={reasonId ? [reasonId] : []}
        onClose={() => setPickerVisible(false)}
        onOk={value => { setReasonId(String(value?.[0] || '')); setPickerVisible(false); }}
      />
    </Screen>
  );
}
