import React, {useCallback, useState} from 'react';
import {Button, Form, Input, Picker, WhiteSpace} from '@ant-design/react-native';
import {AnyRecord, getFeedbackCategories, getFeedbacks, sendFeedback} from '../api';
import {friendlyError, pickerData, useAsyncData} from '../hooks';
import {ButtonLabel, EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen, SectionTitle} from '../components/ui';

export default function FeedbackScreen() {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loader = useCallback(async () => {
    const [feedbacks, categories] = await Promise.all([getFeedbacks(), getFeedbackCategories()]);
    return {feedbacks, categories};
  }, []);
  const {data, loading, refreshing, error, refresh, clearError, reload} = useAsyncData(loader, {feedbacks: [], categories: []});

  const submit = async () => {
    if (!message.trim() || !category) {
      setFormError('Choose a category and enter a message.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await sendFeedback({message, category});
      setMessage('');
      reload();
    } catch (reason) {
      setFormError(friendlyError(reason));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock />;
  const categoryLabel = data.categories.find((item: AnyRecord) => String(item.id) === category)?.name
    || data.categories.find((item: AnyRecord) => String(item.id) === category)?.title
    || 'Select category';

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error || formError} onDismissError={() => { clearError(); setFormError(''); }}>
      <PageTitle title="Feedback" subtitle="Send feedback to the school." />
      <Form layout="vertical">
        <Form.Item label="Category" required>
          <Button onPress={() => setPickerVisible(true)}>{categoryLabel}</Button>
        </Form.Item>
        <Form.Item label="Message" required>
          <Input value={message} onChangeText={setMessage} placeholder="Write your feedback" />
        </Form.Item>
      </Form>
      <Button type="primary" loading={saving} onPress={submit}>
        <ButtonLabel icon="mail" tone="onPrimary">Send feedback</ButtonLabel>
      </Button>
      <WhiteSpace size="xl" />
      <SectionTitle title="Previous feedback" />
      {data.feedbacks.length ? data.feedbacks.map((item: AnyRecord, index: number) => (
        <RecordCard key={item.id || index} title={item.category || 'Feedback'} icon="message" meta={[item.created_at]} body={item.message} />
      )) : <EmptyBlock title="No feedback yet" message="Sent feedback will appear here." icon="message" />}
      <Picker
        visible={pickerVisible}
        data={pickerData(data.categories, data.categories[0]?.name ? 'name' : 'title', 'id')}
        cols={1}
        value={category ? [category] : []}
        onClose={() => setPickerVisible(false)}
        onOk={value => { setCategory(String(value?.[0] || '')); setPickerVisible(false); }}
      />
    </Screen>
  );
}
