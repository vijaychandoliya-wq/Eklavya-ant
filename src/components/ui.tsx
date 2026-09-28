/**
 * Shared Ant Design Mobile building blocks.
 *
 * Padding contract:
 * - Screen owns the page inset (16).
 * - Ant Design RN Card.Body has NO default horizontal padding. Always use
 *   `<CardContent>` (or wrap Body children in a View with `cardBodyPad`).
 */
import React, {ReactNode, useMemo, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  ActivityIndicator,
  Card,
  DatePicker,
  Flex,
  List,
  NoticeBar,
  Result,
  Tag,
  Text,
  View,
  WhiteSpace,
} from '@ant-design/react-native';
import {IconOutline, OutlineGlyphMapType} from '@ant-design/icons-react-native';
import {formatDate, formatDateTime, initials} from '../hooks';
import {
  colorsDark,
  colorsLight,
  font,
  radius,
  spacing,
  statusColor,
  useAppTheme,
  type AppColors,
} from '../theme';

type Palette = AppColors | typeof colorsDark;

/** Inner padding for card content — 16px sides, 12px vertical. */
export const cardBodyPad = {
  paddingVertical: spacing.m,
  paddingHorizontal: spacing.l,
};

/** Zero Ant Body chrome so our wrapper owns all padding. */
const emptyBodyStyles = {
  body: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    minHeight: 0,
    borderTopWidth: 0,
    flexGrow: 0,
  },
};

/** Pass to `<Card.Header styles={cardHeaderStyles}>`. */
export const cardHeaderStyles = {
  headerWrap: {
    paddingVertical: spacing.m,
    paddingLeft: spacing.l,
    paddingRight: spacing.l,
    marginLeft: 0,
    alignItems: 'center' as const,
  },
};

/** @deprecated Prefer CardContent — kept for call sites. */
export const cardBodyStyles = emptyBodyStyles;
export const compactCardStyles = {
  card: {
    borderRadius: radius.l,
    paddingBottom: 0,
    overflow: 'hidden' as const,
  },
  ...cardHeaderStyles,
  ...emptyBodyStyles,
};

function makeUiStyles(c: Palette) {
  return StyleSheet.create({
    flex: {flex: 1},
    buttonLabel: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
    buttonLabelDefault: {fontSize: font.l, color: c.primary, marginLeft: 6},
    buttonLabelOnPrimary: {fontSize: font.l, color: '#fff', marginLeft: 6},
    buttonLabelDanger: {fontSize: font.l, color: c.danger, marginLeft: 6},
    centeredBlock: {flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center'},
    /** Single page inset — cards must not add another horizontal margin. */
    pageContent: {
      paddingHorizontal: spacing.l,
      paddingTop: spacing.m,
      paddingBottom: spacing.xl,
    },
    pageHeading: {marginBottom: spacing.m},
    pageTitle: {fontSize: 24, lineHeight: 30, fontWeight: '700', color: c.text},
    pageSubtitle: {fontSize: font.m, lineHeight: 20, color: c.textSecondary, marginTop: 2},
    sectionRow: {marginBottom: spacing.s, marginTop: spacing.s},
    sectionTitle: {fontSize: font.xxl, fontWeight: '700', color: c.text},
    sectionLink: {fontSize: font.m, color: c.primary, fontWeight: '500'},
    fieldList: {marginBottom: spacing.m},
    statusTag: {borderRadius: radius.s, marginLeft: 8},
    iconBadge: {
      width: 36,
      height: 36,
      borderRadius: radius.m,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    statCard: {marginBottom: spacing.m, borderRadius: radius.l, overflow: 'hidden'},
    statText: {flex: 1},
    statNumber: {fontSize: 22, fontWeight: '700', color: c.text, lineHeight: 26},
    statLabel: {fontSize: font.main, color: c.textSecondary, marginTop: 2},
    recordCard: {marginBottom: spacing.m, borderRadius: radius.l, overflow: 'hidden'},
    appCard: {marginBottom: spacing.m, borderRadius: radius.l, overflow: 'hidden'},
    recordMain: {flex: 1},
    recordTitle: {flex: 1, fontSize: font.l, fontWeight: '600', color: c.text, marginRight: 8},
    recordMeta: {fontSize: font.main, lineHeight: 18, color: c.textSecondary, marginTop: 4},
    recordBody: {
      fontSize: font.main,
      lineHeight: 18,
      color: c.text,
      marginTop: spacing.s,
    },
    detailLabel: {fontSize: font.m, color: c.textSecondary},
    detailValue: {fontSize: font.m, color: c.text},
    segmentWrap: {
      flexDirection: 'row',
      backgroundColor: c.border,
      borderRadius: radius.m,
      padding: 3,
      marginBottom: spacing.m,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: radius.s,
      alignItems: 'center',
    },
    segmentBtnActive: {
      backgroundColor: c.surface,
    },
    segmentLabel: {
      fontSize: font.m,
      fontWeight: '600',
      color: c.textSecondary,
    },
    segmentLabelActive: {
      color: c.primary,
    },
  });
}

function useUiStyles() {
  const {colors} = useAppTheme();
  return useMemo(() => makeUiStyles(colors), [colors]);
}

/**
 * Card.Body with real horizontal padding.
 * Ant's Body has zero side padding by default, and parent Card `styles`
 * do not cascade — always use this (or wrap content yourself).
 */
export function CardContent({children}: {children: ReactNode}) {
  // Ant CardBody types omit `children`; runtime View accepts them.
  const Body = Card.Body as React.ComponentType<{styles?: object; children?: ReactNode}>;
  return (
    <Body styles={emptyBodyStyles}>
      <View style={cardBodyPad}>{children}</View>
    </Body>
  );
}

/** Card shell with correct body padding built in. */
export function AppCard({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: object;
  onPress?: () => void;
}) {
  const styles = useUiStyles();
  const card = (
    <Card style={[styles.appCard, style]}>
      <CardContent>{children}</CardContent>
    </Card>
  );
  return onPress ? (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      {card}
    </TouchableOpacity>
  ) : (
    card
  );
}

export function ButtonLabel({
  icon,
  tone = 'default',
  children,
}: {
  icon: OutlineGlyphMapType;
  tone?: 'default' | 'onPrimary' | 'danger';
  children: ReactNode;
}) {
  const {colors} = useAppTheme();
  const styles = useUiStyles();
  const tint =
    tone === 'onPrimary' ? '#fff' : tone === 'danger' ? colors.danger : colors.primary;
  const textStyle =
    tone === 'onPrimary'
      ? styles.buttonLabelOnPrimary
      : tone === 'danger'
      ? styles.buttonLabelDanger
      : styles.buttonLabelDefault;

  return (
    <View style={styles.buttonLabel}>
      <AntIcon name={icon} color={tint} size={16} />
      <Text style={textStyle}>{children}</Text>
    </View>
  );
}

export function AntIcon({
  name,
  color,
  size = 22,
}: {
  name: OutlineGlyphMapType;
  color?: string;
  size?: number;
}) {
  const {colors} = useAppTheme();
  return <IconOutline name={name} color={color ?? colors.primary} size={size} />;
}

/** Circular photo or initials fallback — used by Messages / ChatRoom. */
export function Avatar({
  uri,
  name,
  size = 40,
  style,
}: {
  uri?: string | null;
  name?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const {colors} = useAppTheme();
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(uri) && !failed;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.wathet,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}>
      {showImage ? (
        <Image
          source={{uri: String(uri)}}
          style={{width: size, height: size}}
          onError={() => setFailed(true)}
        />
      ) : (
        <Text
          style={{
            fontSize: Math.max(10, Math.round(size * 0.36)),
            fontWeight: '700',
            color: colors.primary,
          }}>
          {initials(name || '?')}
        </Text>
      )}
    </View>
  );
}

export function LoadingBlock({text = 'Loading…'}: {text?: string}) {
  const styles = useUiStyles();
  return (
    <View style={styles.centeredBlock}>
      <ActivityIndicator size="large" text={text} />
    </View>
  );
}

export function EmptyBlock({
  title,
  message,
  icon = 'inbox',
}: {
  title: string;
  message: string;
  icon?: OutlineGlyphMapType;
}) {
  const {colors} = useAppTheme();
  return (
    <Result
      img={<AntIcon name={icon} size={54} color={colors.primary} />}
      title={title}
      message={message}
    />
  );
}

export function PageTitle({title, subtitle}: {title: string; subtitle?: string}) {
  const styles = useUiStyles();
  return (
    <View style={styles.pageHeading}>
      <Text style={styles.pageTitle}>{title}</Text>
      {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

/**
 * Theme-aware segmented control (Chats | Emergency, School | Class, etc.).
 * Prefer this over Ant Design Tabs, which stay light-chrome without per-prop overrides.
 */
export function SegmentedTabs({
  items,
  value,
  onChange,
  style,
}: {
  items: {key: string; label: string}[];
  value: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useUiStyles();
  return (
    <View style={[styles.segmentWrap, style]}>
      {items.map(item => {
        const active = value === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.8}
            onPress={() => onChange(item.key)}
            style={[styles.segmentBtn, active && styles.segmentBtnActive]}>
            <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function SectionTitle({
  title,
  extra,
  onExtraPress,
}: {
  title: string;
  extra?: ReactNode;
  onExtraPress?: () => void;
}) {
  const styles = useUiStyles();
  return (
    <Flex justify="between" align="center" style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {extra ? (
        onExtraPress ? (
          <TouchableOpacity onPress={onExtraPress} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            {typeof extra === 'string' ? <Text style={styles.sectionLink}>{extra}</Text> : extra}
          </TouchableOpacity>
        ) : (
          extra
        )
      ) : null}
    </Flex>
  );
}

/**
 * Ant Design Mobile RN date picker (popup wheel).
 *
 * Prefer this over text Inputs for every day-level date field.
 *
 * @example
 *   <DateField label="From date" value={from} onChange={setFrom} minDate={new Date()} />
 *   <DateField label="To date" value={to} onChange={setTo} minDate={from} />
 */
export function DateField({
  label,
  value,
  onChange,
  minDate,
  maxDate,
}: {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  return (
    <DatePicker
      value={value}
      precision="day"
      mode="date"
      minDate={minDate}
      maxDate={maxDate}
      onChange={onChange}
      format={formatDate}
      title={label}>
      <List.Item arrow="horizontal">{label}</List.Item>
    </DatePicker>
  );
}

/** Same pattern for datetime fields (due / reminder). */
export function DateTimeField({
  label,
  value,
  onChange,
  minDate,
  maxDate,
}: {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  return (
    <DatePicker
      value={value}
      precision="minute"
      mode="minute"
      minDate={minDate}
      maxDate={maxDate}
      onChange={onChange}
      format={d => formatDateTime(d).slice(0, 16)}
      title={label}>
      <List.Item arrow="horizontal">{label}</List.Item>
    </DatePicker>
  );
}

/** Group of DateField / Picker rows with Ant List chrome. */
export function FieldList({children}: {children: ReactNode}) {
  const styles = useUiStyles();
  const AntList = List as React.ComponentType<{style?: object; children?: ReactNode}>;
  return <AntList style={styles.fieldList}>{children}</AntList>;
}

export function ErrorBar({message, onClose}: {message: string; onClose: () => void}) {
  const {colors} = useAppTheme();
  if (!message) {
    return null;
  }
  return (
    <NoticeBar
      mode="closable"
      onClose={onClose}
      icon={<AntIcon name="warning" color={colors.danger} size={18} />}>
      {message}
    </NoticeBar>
  );
}

export function StatusTag({status}: {status?: string | null}) {
  const {colors} = useAppTheme();
  const styles = useUiStyles();
  const label = String(status || 'Pending');
  const color = statusColor(label, colors);
  return (
    <Tag small style={[styles.statusTag, {borderColor: color}]}>
      <Text style={{color, fontSize: font.s}}>{label}</Text>
    </Tag>
  );
}

/** Compact icon tile used in summary rows (notices count, etc.). */
export function IconBadge({
  icon,
  color,
  background,
}: {
  icon: OutlineGlyphMapType;
  color?: string;
  background?: string;
}) {
  const {colors} = useAppTheme();
  const styles = useUiStyles();
  return (
    <View style={[styles.iconBadge, {backgroundColor: background ?? colors.wathet}]}>
      <AntIcon name={icon} color={color ?? colors.primary} size={18} />
    </View>
  );
}

export function StatCard({
  icon,
  value,
  label,
  color,
  onPress,
}: {
  icon: OutlineGlyphMapType;
  value: number | string;
  label: string;
  color?: string;
  onPress?: () => void;
}) {
  const {colors} = useAppTheme();
  const styles = useUiStyles();
  const accent = color ?? colors.primary;
  const body = (
    <Card style={styles.statCard}>
      <CardContent>
        <Flex align="center">
          <IconBadge icon={icon} color="#fff" background={accent} />
          <View style={styles.statText}>
            <Text style={styles.statNumber}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
          {onPress ? <AntIcon name="right" color={colors.weak} size={16} /> : null}
        </Flex>
      </CardContent>
    </Card>
  );
  return onPress ? (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      {body}
    </TouchableOpacity>
  ) : (
    body
  );
}

export function Screen({
  children,
  refreshing,
  onRefresh,
  error,
  onDismissError,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  error?: string;
  onDismissError?: () => void;
}) {
  const {colors} = useAppTheme();
  const styles = useUiStyles();
  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScrollView
        contentContainerStyle={styles.pageContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={Boolean(refreshing)}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }>
        {error && onDismissError ? (
          <>
            <ErrorBar message={error} onClose={onDismissError} />
            <WhiteSpace size="md" />
          </>
        ) : null}
        {children}
        <WhiteSpace size="xl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function RecordCard({
  title,
  status,
  icon,
  meta,
  body,
  footer,
  onPress,
}: {
  title: string;
  status?: string | null;
  icon?: OutlineGlyphMapType;
  meta?: (string | null | undefined)[];
  body?: string | null;
  footer?: ReactNode;
  onPress?: () => void;
}) {
  const styles = useUiStyles();
  const lines = (meta || []).filter(Boolean);
  const card = (
    <Card style={styles.recordCard}>
      <CardContent>
        <Flex align="start">
          {icon ? <IconBadge icon={icon} /> : null}
          <View style={styles.recordMain}>
            <Flex justify="between" align="start">
              <Text style={styles.recordTitle} numberOfLines={2}>
                {title}
              </Text>
              {status ? <StatusTag status={status} /> : null}
            </Flex>
            {lines.map((line, index) => (
              <Text key={index} style={styles.recordMeta}>
                {line}
              </Text>
            ))}
            {body ? <Text style={styles.recordBody}>{body}</Text> : null}
            {footer}
          </View>
        </Flex>
      </CardContent>
    </Card>
  );

  return onPress ? (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      {card}
    </TouchableOpacity>
  ) : (
    card
  );
}

export function DetailRows({rows}: {rows: [string, any][]}) {
  const styles = useUiStyles();
  const visible = rows.filter(([, value]) => value !== null && value !== undefined && value !== '');
  if (!visible.length) {
    return null;
  }
  return (
    <List>
      {visible.map(([label, value]) => (
        <List.Item key={label} extra={<Text style={styles.detailValue}>{String(value)}</Text>}>
          <Text style={styles.detailLabel}>{label}</Text>
        </List.Item>
      ))}
    </List>
  );
}

/** Light-only snapshot for rare static consumers — prefer useUiStyles via components. */
export const styles = makeUiStyles(colorsLight);
