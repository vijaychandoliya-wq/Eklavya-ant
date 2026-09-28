import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Flex, NoticeBar} from '@ant-design/react-native';
import {
  AnyRecord,
  createChatRoom,
  getChatContacts,
  getChatRooms,
  getMessages,
} from '../api';
import {cleanDate, friendlyError, useAsyncData} from '../hooks';
import {AntIcon, Avatar, EmptyBlock, LoadingBlock, SegmentedTabs} from '../components/ui';
import {ScreenKey, ScreenParams} from '../navigation';
import {colorsDark, font, radius, spacing, useAppTheme, type AppColors} from '../theme';

type Palette = AppColors | typeof colorsDark;
type Segment = 'chats' | 'emergency';

const SEGMENTS: {key: Segment; label: string}[] = [
  {key: 'chats', label: 'Chats'},
  {key: 'emergency', label: 'Emergency'},
];

export default function MessagesScreen({
  navigate,
}: {
  navigate: (screen: ScreenKey, params?: ScreenParams) => void;
}) {
  const {colors} = useAppTheme();
  const styles = useMemo(() => makeMessagesStyles(colors), [colors]);
  const [segment, setSegment] = useState<Segment>('chats');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [contactQuery, setContactQuery] = useState('');
  const [creatingId, setCreatingId] = useState<string | number | null>(null);
  const [actionError, setActionError] = useState('');

  const chatsLoader = useCallback(async () => {
    const [rooms, contactsPayload] = await Promise.all([getChatRooms(), getChatContacts()]);
    return {rooms, contacts: contactsPayload.contacts};
  }, []);
  const mailLoader = useCallback(() => getMessages(), []);

  const chats = useAsyncData(chatsLoader, {rooms: [] as AnyRecord[], contacts: [] as AnyRecord[]});
  const mail = useAsyncData(mailLoader, [] as AnyRecord[]);

  const filteredContacts = useMemo(() => {
    const q = contactQuery.trim().toLowerCase();
    if (!q) {
      return chats.data.contacts;
    }
    return chats.data.contacts.filter(contact => {
      const name = String(contact.name || contact.label || '').toLowerCase();
      const role = String(contact.role || '').toLowerCase();
      return name.includes(q) || role.includes(q);
    });
  }, [chats.data.contacts, contactQuery]);

  const openOrCreateChat = async (contact: AnyRecord) => {
    const recipientId = contact.id || contact.value;
    if (!recipientId) {
      return;
    }
    setCreatingId(recipientId);
    setActionError('');
    try {
      const room = await createChatRoom({type: 'direct', recipientId});
      const roomId = room.id;
      if (!roomId) {
        throw new Error('Chat room was not created.');
      }
      setPickerOpen(false);
      setContactQuery('');
      navigate('chatRoom', {
        roomId,
        roomName: contact.name || contact.label || 'Chat',
        roomAvatar: contact.avatar || null,
      });
      chats.reload();
    } catch (reason) {
      setActionError(friendlyError(reason));
    } finally {
      setCreatingId(null);
    }
  };

  const loading = segment === 'chats' ? chats.loading : mail.loading;
  const refreshing = segment === 'chats' ? chats.refreshing : mail.refreshing;
  const onRefresh = segment === 'chats' ? chats.refresh : mail.refresh;
  const error = actionError || (segment === 'chats' ? chats.error : mail.error);

  if (loading) {
    return <LoadingBlock />;
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }>
        {error ? (
          <NoticeBar
            mode="closable"
            onClose={() => {
              setActionError('');
              chats.clearError();
              mail.clearError();
            }}
            icon={<AntIcon name="warning" color={colors.danger} size={18} />}>
            {error}
          </NoticeBar>
        ) : null}

        <SegmentedTabs
          items={SEGMENTS}
          value={segment}
          onChange={key => setSegment(key as Segment)}
        />

        {segment === 'chats' ? (
          <>
            <RNText style={styles.hint}>Conversations with teachers and school staff.</RNText>
            {chats.data.rooms.length ? (
              chats.data.rooms.map((room, index) => {
                const unread = Number(room.unreadCount || 0);
                return (
                  <TouchableOpacity
                    key={room.id || index}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigate('chatRoom', {
                        roomId: room.id,
                        roomName: room.name,
                        roomAvatar: room.avatar || null,
                      })
                    }
                    style={styles.chatRow}>
                    <Avatar
                      uri={room.avatar}
                      name={room.name || 'Chat'}
                      size={44}
                      style={styles.avatarGap}
                    />
                    <View style={styles.chatMain}>
                      <Flex justify="between" align="start">
                        <RNText style={styles.chatName} numberOfLines={1}>
                          {room.name || 'Chat'}
                        </RNText>
                        <RNText style={styles.chatTime}>{room.lastTime || ''}</RNText>
                      </Flex>
                      <Flex justify="between" align="center" style={styles.chatPreviewRow}>
                        <RNText style={styles.chatPreview} numberOfLines={1}>
                          {room.lastMessage || 'No messages yet'}
                        </RNText>
                        {unread > 0 ? (
                          <View style={styles.unreadBadge}>
                            <RNText style={styles.unreadText}>{unread > 99 ? '99+' : unread}</RNText>
                          </View>
                        ) : null}
                      </Flex>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <EmptyBlock
                title="No chats yet"
                message="Tap the + button to message a teacher or admin."
                icon="message"
              />
            )}
          </>
        ) : (
          <>
            <View style={styles.emergencyBanner}>
              <AntIcon name="alert" color={colors.danger} size={18} />
              <View style={styles.emergencyBannerText}>
                <RNText style={styles.emergencyBannerTitle}>School alerts</RNText>
                <RNText style={styles.emergencyBannerBody}>
                  Broadcast / emergency notices sent by the school admin. Not a chat.
                </RNText>
              </View>
            </View>

            {mail.data.length ? (
              mail.data.map((item, index) => (
                <View key={item.id || item.subject || index} style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <View style={styles.emergencyTag}>
                      <RNText style={styles.emergencyTagText}>Emergency</RNText>
                    </View>
                    <RNText style={styles.alertDate}>
                      {cleanDate(item.date || item.sentAt || item.created_at)}
                    </RNText>
                  </View>
                  <RNText style={styles.alertSubject}>
                    {item.title || item.subject || 'School alert'}
                  </RNText>
                  {item.sender ? <RNText style={styles.alertSender}>From {item.sender}</RNText> : null}
                  <RNText style={styles.alertBody}>
                    {item.body || item.message || item.content || ''}
                  </RNText>
                </View>
              ))
            ) : (
              <EmptyBlock
                title="No emergency alerts"
                message="Urgent school broadcasts will appear here when sent by admin."
                icon="alert"
              />
            )}
          </>
        )}
      </ScrollView>

      {segment === 'chats' ? (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.fab}
          onPress={() => {
            setActionError('');
            setContactQuery('');
            setPickerOpen(true);
          }}
          accessibilityLabel="Start a new chat">
          <AntIcon name="plus" color="#fff" size={26} />
        </TouchableOpacity>
      ) : null}

      <Modal
        visible={pickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <RNText style={styles.modalTitle}>New chat</RNText>
            <RNText style={styles.modalSubtitle}>Choose a staff member to message.</RNText>

            <View style={styles.searchShell} collapsable={false}>
              <AntIcon name="search" color={colors.weak} size={18} />
              <TextInput
                style={styles.searchInput}
                value={contactQuery}
                onChangeText={setContactQuery}
                placeholder="Search by name or role"
                placeholderTextColor={colors.weak}
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
                editable
                showSoftInputOnFocus
                underlineColorAndroid="transparent"
              />
              {contactQuery ? (
                <TouchableOpacity onPress={() => setContactQuery('')} hitSlop={8}>
                  <AntIcon name="close-circle" color={colors.weak} size={16} />
                </TouchableOpacity>
              ) : null}
            </View>

            {actionError ? <RNText style={styles.modalError}>{actionError}</RNText> : null}
            <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
              {filteredContacts.length ? (
                filteredContacts.map((contact, index) => {
                  const id = contact.id || contact.value;
                  const busy = creatingId === id;
                  return (
                    <TouchableOpacity
                      key={id || index}
                      activeOpacity={0.7}
                      disabled={creatingId != null}
                      onPress={() => openOrCreateChat(contact)}
                      style={styles.contactRow}>
                      <Avatar
                        uri={contact.avatar}
                        name={contact.name || contact.label || 'Staff'}
                        size={40}
                        style={styles.avatarGap}
                      />
                      <View style={styles.contactMain}>
                        <RNText style={styles.contactName}>{contact.name || contact.label}</RNText>
                        <RNText style={styles.contactRole}>{contact.role || 'Staff'}</RNText>
                      </View>
                      {busy ? (
                        <ActivityIndicator color={colors.primary} />
                      ) : (
                        <AntIcon name="right" color={colors.weak} size={16} />
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <EmptyBlock
                  title={contactQuery ? 'No matches' : 'No contacts'}
                  message={
                    contactQuery
                      ? 'Try a different name or role.'
                      : 'Staff contacts will appear here.'
                  }
                  icon="team"
                />
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => {
                setPickerOpen(false);
                setContactQuery('');
              }}>
              <RNText style={styles.modalCancelText}>Cancel</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeMessagesStyles(c: Palette) {
  return StyleSheet.create({
    root: {flex: 1, backgroundColor: c.background},
    scrollContent: {
      paddingHorizontal: spacing.l,
      paddingTop: spacing.m,
      paddingBottom: 96,
    },
    hint: {
      fontSize: font.main,
      color: c.textSecondary,
      marginBottom: spacing.m,
    },
    chatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: radius.l,
      paddingHorizontal: spacing.m,
      paddingVertical: spacing.m,
      marginBottom: spacing.s,
    },
    avatarGap: {marginRight: spacing.m},
    chatMain: {flex: 1, minWidth: 0},
    chatName: {
      flex: 1,
      fontSize: font.l,
      fontWeight: '600',
      color: c.text,
      marginRight: spacing.s,
    },
    chatTime: {fontSize: font.s, color: c.weak},
    chatPreviewRow: {marginTop: 4},
    chatPreview: {
      flex: 1,
      fontSize: font.main,
      color: c.textSecondary,
      marginRight: spacing.s,
    },
    unreadBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      paddingHorizontal: 6,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unreadText: {fontSize: font.xs, fontWeight: '700', color: '#fff'},
    emergencyBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: c.dangerSoftBg,
      borderColor: c.dangerSoftBorder,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: radius.l,
      padding: spacing.m,
      marginBottom: spacing.m,
    },
    emergencyBannerText: {flex: 1, marginLeft: spacing.s},
    emergencyBannerTitle: {
      fontSize: font.l,
      fontWeight: '700',
      color: c.danger,
    },
    emergencyBannerBody: {
      fontSize: font.main,
      color: c.textSecondary,
      marginTop: 2,
      lineHeight: 18,
    },
    alertCard: {
      backgroundColor: c.surface,
      borderRadius: radius.l,
      borderLeftWidth: 4,
      borderLeftColor: c.danger,
      padding: spacing.m,
      marginBottom: spacing.m,
    },
    alertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.s,
    },
    emergencyTag: {
      backgroundColor: c.dangerSoftBg,
      borderRadius: radius.s,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.dangerTagBorder,
    },
    emergencyTagText: {
      fontSize: font.s,
      fontWeight: '700',
      color: c.danger,
      letterSpacing: 0.3,
    },
    alertDate: {fontSize: font.s, color: c.weak},
    alertSubject: {
      fontSize: font.xl,
      fontWeight: '700',
      color: c.text,
      marginBottom: 4,
    },
    alertSender: {
      fontSize: font.main,
      color: c.textSecondary,
      marginBottom: spacing.s,
    },
    alertBody: {
      fontSize: font.m,
      lineHeight: 21,
      color: c.text,
    },
    fab: {
      position: 'absolute',
      right: spacing.l,
      bottom: spacing.l,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: {width: 0, height: 3},
    },
    modalRoot: {flex: 1, justifyContent: 'flex-end'},
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    modalSheet: {
      backgroundColor: c.surface,
      borderTopLeftRadius: radius.l,
      borderTopRightRadius: radius.l,
      paddingHorizontal: spacing.l,
      paddingTop: spacing.s,
      paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.l,
      maxHeight: '78%',
    },
    modalHandle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      marginBottom: spacing.m,
    },
    modalTitle: {fontSize: font.xxl, fontWeight: '700', color: c.text},
    modalSubtitle: {
      fontSize: font.main,
      color: c.textSecondary,
      marginTop: 2,
      marginBottom: spacing.s,
    },
    searchShell: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: radius.m,
      paddingHorizontal: spacing.m,
      minHeight: 44,
      marginBottom: spacing.m,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.s,
      paddingVertical: Platform.OS === 'ios' ? 10 : 8,
      fontSize: font.m,
      color: c.text,
    },
    modalError: {
      fontSize: font.main,
      color: c.danger,
      marginBottom: spacing.s,
    },
    modalList: {maxHeight: 380},
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.m,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    contactMain: {flex: 1, minWidth: 0},
    contactName: {fontSize: font.l, fontWeight: '600', color: c.text},
    contactRole: {fontSize: font.main, color: c.textSecondary, marginTop: 2},
    modalCancel: {
      marginTop: spacing.m,
      alignItems: 'center',
      paddingVertical: spacing.m,
    },
    modalCancelText: {fontSize: font.l, fontWeight: '600', color: c.primary},
  });
}
