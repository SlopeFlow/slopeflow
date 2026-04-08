import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Dimensions, Animated,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  { id: 'welcome' },
  { id: 'role' },
  { id: 'name' },
  { id: 'age' },
  { id: 'experience' },
  { id: 'interests' },
  { id: 'ready' },
];

const EXPERIENCE_OPTIONS = [
  { id: 'fresh',    label: 'Fresh drop',      sub: 'Never traded before' },
  { id: 'learning', label: 'Getting my footing', sub: 'Know the basics' },
  { id: 'riding',   label: 'Already riding',  sub: 'I\'ve made real trades' },
];

const INTEREST_OPTIONS = [
  { id: 'btc',       label: '₿  Bitcoin',        sub: 'Crypto & BTC cycles' },
  { id: 'stocks',    label: 'Stocks',             sub: 'Equities & dividends' },
  { id: 'futures',   label: 'Futures',            sub: 'NQ, MNQ, ES' },
  { id: 'all',       label: 'All of it',          sub: 'I want the full mountain' },
];

// ─── Step icons ───────────────────────────────────────────────────────────────
const STEP_ICONS = {
  welcome:    { name: 'stats-chart',       color: colors.accent },
  role:       { name: 'people-outline',    color: colors.accent },
  name:       { name: 'person-outline',    color: colors.accent },
  age:        { name: 'calendar-outline',color: colors.accent },
  experience: { name: 'bar-chart-outline', color: colors.accent },
  interests:  { name: 'options-outline', color: colors.accent },
  ready:      { name: 'checkmark-circle',color: colors.green },
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function OnboardingScreen({ onComplete }) {
  const [step, setStep]         = useState(0);
  const [role, setRole]         = useState(null); // 'teen' | 'parent'
  const [name, setName]         = useState('');
  const [age, setAge]           = useState('');
  const [experience, setExp]    = useState(null);
  const [interests, setInterests] = useState([]);
  const slideAnim               = useRef(new Animated.Value(0)).current;

  const animateNext = (direction = 1) => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -30 * direction,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      animateNext(1);
      setStep(s => s + 1);
    } else {
      onComplete?.({ name, age, experience, interests, role });
    }
  };

  const back = () => {
    if (step > 0) {
      animateNext(-1);
      setStep(s => s - 1);
    }
  };

  const toggleInterest = (id) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const canContinue = () => {
    switch (STEPS[step].id) {
      case 'welcome':    return true;
      case 'role':       return role !== null;
      case 'name':       return name.trim().length > 0;
      case 'age':        return age.trim().length > 0 && parseInt(age) > 0;
      case 'experience': return experience !== null;
      case 'interests':  return interests.length > 0;
      case 'ready':      return true;
      default:           return true;
    }
  };

  const progress = (step / (STEPS.length - 1)) * 100;
  const stepId = STEPS[step].id;
  const stepIcon = STEP_ICONS[stepId];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <Animated.View style={[styles.content, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* ── WELCOME ── */}
          {STEPS[step].id === 'welcome' && (
            <View style={styles.stepWrap}>
              <Ionicons name={stepIcon.name} size={52} color={stepIcon.color} style={styles.icon} />
              <Text style={styles.heading}>Welcome to{'\n'}SlopeFlow</Text>
              <Text style={styles.body}>
                Real signals. No noise.{'\n'}
                Built for riders who want to{'\n'}understand markets — not just follow them.
              </Text>
            </View>
          )}

          {/* ── ROLE ── */}
          {STEPS[step].id === 'role' && (
            <View style={styles.stepWrap}>
              <Ionicons name={stepIcon.name} size={52} color={stepIcon.color} style={styles.icon} />
              <Text style={styles.heading}>Who's{'\n'}dropping in?</Text>
              <TouchableOpacity
                style={[styles.optionCard, role === 'teen' && styles.optionCardActive]}
                onPress={() => setRole('teen')}
              >
                <Text style={[styles.optionLabel, role === 'teen' && styles.optionLabelActive]}>
                  I'm a Teen
                </Text>
                <Text style={styles.optionSub}>Learn to trade, earn XP, unlock payouts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionCard, role === 'parent' && styles.optionCardActive]}
                onPress={() => setRole('parent')}
              >
                <Text style={[styles.optionLabel, role === 'parent' && styles.optionLabelActive]}>
                  I'm a Parent
                </Text>
                <Text style={styles.optionSub}>Set up chores, manage escrow, approve payouts</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── NAME ── */}
          {STEPS[step].id === 'name' && (
            <View style={styles.stepWrap}>
              <Ionicons name={stepIcon.name} size={52} color={stepIcon.color} style={styles.icon} />
              <Text style={styles.heading}>What do{'\n'}we call you?</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name..."
                placeholderTextColor={colors.textMuted}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={next}
              />
            </View>
          )}

          {/* ── AGE ── */}
          {STEPS[step].id === 'age' && (
            <View style={styles.stepWrap}>
              <Ionicons name={stepIcon.name} size={52} color={stepIcon.color} style={styles.icon} />
              <Text style={styles.heading}>How old{'\n'}are you?</Text>
              <TextInput
                style={[styles.input, styles.inputCenter]}
                value={age}
                onChangeText={setAge}
                placeholder="Age"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={next}
              />
              <Text style={styles.disclaimer}>
                SlopeFlow is designed for ages 13+.{'\n'}
                No real money required to learn.
              </Text>
            </View>
          )}

          {/* ── EXPERIENCE ── */}
          {STEPS[step].id === 'experience' && (
            <View style={styles.stepWrap}>
              <Ionicons name={stepIcon.name} size={52} color={stepIcon.color} style={styles.icon} />
              <Text style={styles.heading}>Where are{'\n'}you on the mountain?</Text>
              {EXPERIENCE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, experience === opt.id && styles.optionCardActive]}
                  onPress={() => setExp(opt.id)}
                >
                  <Text style={[styles.optionLabel, experience === opt.id && styles.optionLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.optionSub}>{opt.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── INTERESTS ── */}
          {STEPS[step].id === 'interests' && (
            <View style={styles.stepWrap}>
              <Ionicons name={stepIcon.name} size={52} color={stepIcon.color} style={styles.icon} />
              <Text style={styles.heading}>What are you{'\n'}riding toward?</Text>
              <Text style={styles.subhead}>Pick all that apply</Text>
              {INTEREST_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, interests.includes(opt.id) && styles.optionCardActive]}
                  onPress={() => toggleInterest(opt.id)}
                >
                  <Text style={[styles.optionLabel, interests.includes(opt.id) && styles.optionLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.optionSub}>{opt.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── READY ── */}
          {STEPS[step].id === 'ready' && (
            <View style={styles.stepWrap}>
              <Ionicons name={stepIcon.name} size={52} color={stepIcon.color} style={styles.icon} />
              <Text style={styles.heading}>You're{'\n'}dropped in, {name}.</Text>
              <Text style={styles.body}>
                Your line is set.{'\n'}
                Let's learn how to read the mountain.
              </Text>
              <View style={styles.summaryCard}>
                <SummaryRow label="NAME"       value={name} />
                <SummaryRow label="AGE"        value={age} />
                <SummaryRow label="LEVEL"      value={EXPERIENCE_OPTIONS.find(e => e.id === experience)?.label ?? ''} />
                <SummaryRow label="FOCUS"      value={interests.map(i => INTEREST_OPTIONS.find(o => o.id === i)?.label.split(' ').slice(-1)[0]).join(', ')} />
              </View>
            </View>
          )}

        </ScrollView>
      </Animated.View>

      {/* Navigation buttons */}
      <View style={styles.navRow}>
        {step > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={back}>
            <Text style={styles.backBtnText}>← BACK</Text>
          </TouchableOpacity>
        ) : <View style={{ flex: 1 }} />}

        <TouchableOpacity
          style={[styles.nextBtn, !canContinue() && styles.nextBtnDisabled]}
          onPress={next}
          disabled={!canContinue()}
        >
          <Text style={styles.nextBtnText}>
            {step === STEPS.length - 1 ? "LET'S RIDE →" : 'CONTINUE →'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function SummaryRow({ label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.bg },
  progressTrack:    { height: 3, backgroundColor: colors.border },
  progressFill:     { height: 3, backgroundColor: colors.accent },
  content:          { flex: 1 },
  scroll:           { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl },
  stepWrap:         { flex: 1, justifyContent: 'center' },
  icon:             { marginBottom: spacing.md },
  heading:          { ...fonts.heading, marginBottom: spacing.md, lineHeight: 36 },
  body:             { ...fonts.body, fontSize: 17, lineHeight: 26, marginBottom: spacing.lg },
  subhead:          { ...fonts.body, marginBottom: spacing.md },
  input:            { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary, fontSize: 18, fontWeight: '600', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  inputCenter:      { textAlign: 'center', fontSize: 32, fontWeight: '900' },
  disclaimer:       { ...fonts.body, fontSize: 12, textAlign: 'center', color: colors.textMuted, lineHeight: 18 },
  optionCard:       { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  optionCardActive: { borderColor: colors.accent, backgroundColor: '#00E5FF12' },
  optionLabel:      { ...fonts.subhead, fontSize: 16 },
  optionLabelActive:{ color: colors.accent },
  optionSub:        { ...fonts.body, fontSize: 13, marginTop: 2 },
  summaryCard:      { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  summaryRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryLabel:     { ...fonts.label },
  summaryValue:     { ...fonts.body, color: colors.textPrimary, fontWeight: '600' },
  navRow:           { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  backBtn:          { flex: 1, padding: spacing.md, alignItems: 'center', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  backBtnText:      { ...fonts.label, color: colors.textSecondary },
  nextBtn:          { flex: 2, backgroundColor: colors.accent, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  nextBtnDisabled:  { opacity: 0.35 },
  nextBtnText:      { color: colors.bg, fontWeight: '900', fontSize: 13, letterSpacing: 1 },
});
