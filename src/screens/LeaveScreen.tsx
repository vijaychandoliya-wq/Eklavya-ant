import React, {useCallback, useState} from 'react';
import {Button, Form, Input, List, Picker, WhiteSpace} from '@ant-design/react-native';
import {AnyRecord, applyLeave, deleteLeave, getLeaveReasons, getLeaves} from '../api';
import {formatDate, friendlyError, pickerData, useAsyncData} from '../hooks';
import {
  ButtonLabel,
  DateField,
  EmptyBlock,
  FieldList,
  LoadingBlock,
  PageTitle,
  RecordCard,
  Screen,
  SectionTitle,
} from '../components/ui';

export default function LeaveScreen() {
  const today = new Date();
  const [fromDate, setFrom] = useState(today);
  const [toDate, setTo] = useState(today);
  const [reasonId, setReasonId] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loader = useCallback(async () => {
    const [leaves, reasons] = await Promise.all([getLeaves(), getLeaveReasons()]);
    return {leaves, reasons};
  }, []);
  const {data, loading, refreshing, error, refresh, clearError, reload} = useAsyncData(loader, {
    leaves: [],
    reasons: [],
  });

  const onFromChange = (date: Date) => {
    setFrom(date);
    if (toDate < date) {
      setTo(date);
    }
  };

  const submit = async () => {
    if (!reasonId) {
      setFormError('Choose a leave reason.');
      return;
    }
    if (toDate < fromDate) {
      setFormError('To date must be on or after the from date.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await applyLeave({
        from_date: formatDate(fromDate),
        to_date: formatDate(toDate),
        reason_id: reasonId,
        remarks,
      });
      setRemarks('');
      reload();
    } catch (reason) {
      setFormError(friendlyError(reason));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingBlock />;
  }

  const reasonLabel =
    data.reasons.find((item: AnyRecord) => String(item.id) === reasonId)?.title || 'Select reason';

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={refresh}
      error={error || formError}
      onDismissError={() => {
        clearError();
        setFormError('');
      }}>
      <PageTitle title="Apply leave" subtitle="Submit leave for the selected child." />

      <FieldList>
        <DateField label="From date" value={fromDate} onChange={onFromChange} minDate={today} />
        <DateField label="To date" value={toDate} onChange={setTo} minDate={fromDate} />
        <List.Item
          arrow="horizontal"
          extra={reasonLabel}
          onPress={() => setPickerVisible(true)}>
          Reason
        </List.Item>
      </FieldList>

      <Form layout="vertical">
        <Form.Item label="Remarks">
          <Input value={remarks} onChangeText={setRemarks} placeholder="Optional remarks" />
        </Form.Item>
      </Form>

      <Button type="primary" loading={saving} onPress={submit}>
        <ButtonLabel icon="plus" tone="onPrimary">
          Submit leave
        </ButtonLabel>
      </Button>

      <WhiteSpace size="xl" />
      <SectionTitle title="Applied leaves" />
      {data.leaves.length ? (
        data.leaves.map((item: AnyRecord, index: number) => (
          <RecordCard
            key={item.id || index}
            title={item.reason || item.title || 'Leave'}
            status={item.status}
            icon="form"
            meta={[item.from_date, item.to_date]}
            body={item.remarks}
            footer={
              item.id ? (
                <Button
                  size="small"
                  type="warning"
                  onPress={async () => {
                    await deleteLeave(item.id);
                    reload();
                  }}>
                  Delete
                </Button>
              ) : undefined
            }
          />
        ))
      ) : (
        <EmptyBlock title="No leaves" message="Submitted leave requests will appear here." icon="form" />
      )}

      <Picker
        visible={pickerVisible}
        data={pickerData(data.reasons, 'title', 'id')}
        cols={1}
        value={reasonId ? [reasonId] : []}
        onClose={() => setPickerVisible(false)}
        onOk={value => {
          setReasonId(String(value?.[0] || ''));
          setPickerVisible(false);
        }}
      />
    </Screen>
  );
}
