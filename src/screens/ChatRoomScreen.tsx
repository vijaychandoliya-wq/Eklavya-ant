import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {AnyRecord, getChatMessages, sendChatMessage} from '../api';
import {friendlyError, useAsyncData} from '../hooks';
import {AntIcon, Avatar, EmptyBlock, ErrorBar, LoadingBlock} from '../components/ui';
import {ScreenParams} from '../navigation';
import {colorsDark, font, spacing, useAppTheme, type AppColors} from '../theme';

type Palette = AppColors | typeof colorsDark;

export default function ChatRoomScreen({params}: {params?: ScreenParams}) {
  const {colors} = useAppTheme();
  const styles = useMemo(() => makeChatStyles(colors), [colors]);
  const roomId = params?.roomId;
  const listRef = useRef<FlatList<AnyRecord>>(null);
  const inputRef = useRef<TextInput>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const loader = useCallback(async () => {
    if (!roomId) {
      return {
        messages: [] as AnyRecord[],
        room: {
          name: params?.roomName || 'Chat',
          avatar: params?.roomAvatar || null,
        },
      };
    }
    return getChatMessages(roomId);
  }, [roomId, params?.roomName, params?.roomAvatar]);

  const {data, loading, refreshing, error, refresh, clearError, reload} = useAsyncData(loader, {
    messages: [] as AnyRecord[],
    room: {
      name: params?.roomName || 'Chat',
      avatar: params?.roomAvatar || null,
    } as AnyRecord,
  });

  const peerName = data.room?.name || params?.roomName || 'Chat';
  const peerAvatar = useMemo(() => {
    if (data.room?.avatar) {
      return data.room.avatar;
    }
    if (params?.roomAvatar) {
      return params.roomAvatar;
    }
    const incoming = data.messages.find(item => !item.isMe && item.avatar);
    return incoming?.avatar || null;
  }, [data.room?.avatar, data.messages, params?.roomAvatar]);

  useEffect(() => {
    if (!data.messages.length) {
      return;
    }
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({animated: false});
    }, 50);
    return () => clearTimeout(timer);
  }, [data.messages.length]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const send = async () => {
    const text = draft.trim();
    if (!text || !roomId || sending) {
      return;
    }
    setSending(true);
    setSendError('');
    try {
      await sendChatMessage(roomId, text);
      setDraft('');
      await reload();
      setTimeout(() => {
        listRef.current?.scrollToEnd({animated: true});
        focusInput();
      }, 80);
    } catch (reason) {
      setSendError(friendlyError(reason));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingBlock />;
  }

  if (!roomId) {
    return (
      <View style={styles.root}>
        <EmptyBlock title="Chat unavailable" message="Open a conversation from Messages." icon="message" />
      </View>
    );
  }

  const canSend = Boolean(draft.trim()) && !sending;

  const Container = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  const containerProps =
    Platform.OS === 'ios'
      ? {behavior: 'padding' as const, keyboardVerticalOffset: 88}
      : {};

  return (
    <Container style={styles.root} {...containerProps}>
      <View style={styles.peerHeader}>
        <Avatar uri={peerAvatar} name={peerName} size={36} style={styles.peerAvatar} />
        <View style={styles.peerText}>
          <Text style={styles.peerName} numberOfLines={1}>
            {peerName}
          </Text>
          <Text style={styles.peerHint}>Pull down to refresh</Text>
        </View>
      </View>

      {(error || sendError) && (
        <ErrorBar
          message={error || sendError}
          onClose={() => {
            clearError();
            setSendError('');
          }}
        />
      )}

      <View style={styles.listPane}>
        <FlatList
          ref={listRef}
          style={styles.list}
          data={data.messages}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={[
            styles.listContent,
            !data.messages.length && styles.listContentEmpty,
          ]}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyBlock
              title="No messages yet"
              message="Say hello to start the conversation."
              icon="message"
            />
          }
          renderItem={({item}) => {
            const isMe = Boolean(item.isMe);
            return (
              <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
                {!isMe ? (
                  <Avatar
                    uri={item.avatar}
                    name={item.senderName || 'Staff'}
                    size={28}
                    style={styles.bubbleAvatar}
                  />
                ) : null}
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                  {!isMe ? (
                    <Text style={styles.sender} numberOfLines={1}>
                      {item.senderName || 'Staff'}
                    </Text>
                  ) : null}
                  <Text style={[styles.bubbleText, isMe ? styles.textMe : styles.textThem]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.time, isMe ? styles.timeMe : styles.timeThem]}>
                    {item.time || ''}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      </View>

      <View style={styles.composer} collapsable={false}>
        <View style={styles.inputShell} collapsable={false}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message"
            placeholderTextColor={colors.weak}
            multiline
            maxLength={2000}
            editable
            showSoftInputOnFocus
            blurOnSubmit={false}
            textAlignVertical="top"
            underlineColorAndroid="transparent"
            returnKeyType="default"
            autoCorrect
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={send}
          disabled={!canSend}
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          accessibilityLabel="Send message">
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <AntIcon name="send" color="#fff" size={18} />
          )}
        </TouchableOpacity>
      </View>
    </Container>
  );
}

function makeChatStyles(c: Palette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.background,
    },
    peerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.l,
      paddingVertical: spacing.s,
      backgroundColor: c.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    peerAvatar: {marginRight: spacing.m},
    peerText: {flex: 1, minWidth: 0},
    peerName: {
      fontSize: font.l,
      fontWeight: '700',
      color: c.text,
    },
    peerHint: {
      fontSize: font.s,
      color: c.weak,
      marginTop: 1,
    },
    listPane: {
      flex: 1,
      minHeight: 0,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: spacing.l,
      paddingTop: spacing.m,
      paddingBottom: spacing.m,
    },
    listContentEmpty: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    row: {
      marginBottom: spacing.s,
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    rowMe: {
      justifyContent: 'flex-end',
    },
    rowThem: {
      justifyContent: 'flex-start',
    },
    bubbleAvatar: {
      marginRight: 8,
      marginBottom: 2,
    },
    bubble: {
      maxWidth: '72%',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignSelf: 'flex-start',
    },
    bubbleMe: {
      backgroundColor: c.primary,
      borderBottomRightRadius: 4,
    },
    bubbleThem: {
      backgroundColor: c.surface,
      borderBottomLeftRadius: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    sender: {
      fontSize: font.s,
      fontWeight: '600',
      color: c.weak,
      marginBottom: 2,
      includeFontPadding: false,
    },
    bubbleText: {
      fontSize: font.m,
      lineHeight: 20,
      includeFontPadding: false,
    },
    textMe: {
      color: '#fff',
    },
    textThem: {
      color: c.text,
    },
    time: {
      fontSize: font.xs,
      marginTop: 4,
      alignSelf: 'flex-end',
      includeFontPadding: false,
    },
    timeMe: {
      color: 'rgba(255,255,255,0.75)',
    },
    timeThem: {
      color: c.weak,
    },
    composer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      zIndex: 2,
      paddingHorizontal: spacing.m,
      paddingVertical: spacing.s,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      backgroundColor: c.surface,
      elevation: 3,
    },
    inputShell: {
      flex: 1,
      marginRight: spacing.s,
      minHeight: 44,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 20,
      backgroundColor: c.background,
      justifyContent: 'center',
      paddingHorizontal: spacing.m,
      paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    },
    input: {
      width: '100%',
      maxHeight: 120,
      minHeight: 28,
      padding: 0,
      margin: 0,
      fontSize: font.m,
      color: c.text,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnDisabled: {
      backgroundColor: c.light,
    },
  });
}
