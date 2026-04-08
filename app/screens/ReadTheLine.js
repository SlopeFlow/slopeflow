import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../theme';
import { getStreak, markActive } from '../api/streak';

// Sample chart challenges — will pull from Supabase in production
const CHALLENGES = [
  {
    id: 1,
    date: '2026-03-31',
    asset: 'BTC',
    setup: 'Price has bounced off this level 3 times in 2 weeks. Volume is rising.',
    chartNote: '[Chart: BTC holding $82K support, rising volume]',
    options: ['Break higher', 'Rejection, drop incoming', 'Chop sideways'],
    answer: 0,
    explanation: 'Three touches of support with rising volume = accumulation. Bulls are defending this level hard. Classic setup for a breakout.',
    metaphor: 'Like seeing a perfect lip on the jump — the build-up tells you what\'s coming.',
  },
  {
    id: 2,
    date: '2026-03-30',
    asset: 'BTC',
    setup: 'Price just made a new all-time high but volume was lower than the previous high.',
    chartNote: '[Chart: BTC new ATH, declining volume on push]',
    options: ['Confirmed breakout, buy more', 'Warning sign — weak hands', 'Doesn\'t matter'],
    answer: 1,
    explanation: 'New highs on declining volume = divergence. Price is moving up but fewer people are driving it. Often precedes a pullback.',
    metaphor: 'Like hitting a big trick but your speed was off — looked good, but the landing is sketchy.',
  },
];

export default function ReadTheLine() {
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak]     = useState(0);

  useEffect(() => {
    getStreak().then(setStreak);
  }, []);

  const challenge = CHALLENGES[current];
  const isCorrect = selected === challenge.answer;

  const handleSelect = async (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    if (idx === challenge.answer) {
      const newStreak = await markActive();
      setStreak(newStreak);
    }
  };

  const next = () => {
    setSelected(null);
    setRevealed(false);
    setCurrent(c => (c + 1) % CHALLENGES.length);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>DAILY CHALLENGE</Text>
          <Text style={styles.heading}>READ THE LINE</Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={18} color={colors.gold} />
          <Text style={styles.streakCount}>{streak}</Text>
        </View>
      </View>

      {/* Asset + date */}
      <Text style={styles.meta}>{challenge.asset} · {challenge.date}</Text>

      {/* Chart placeholder */}
      <View style={styles.chartBox}>
        <Text style={styles.chartNote}>{challenge.chartNote}</Text>
        <Text style={styles.chartSub}>Chart component renders here</Text>
      </View>

      {/* Setup description */}
      <View style={styles.setupCard}>
        <Text style={styles.setupLabel}>THE SETUP</Text>
        <Text style={styles.setupText}>{challenge.setup}</Text>
      </View>

      {/* Options */}
      <Text style={styles.questionLabel}>WHAT HAPPENS NEXT?</Text>
      {challenge.options.map((opt, idx) => {
        let btnStyle = styles.optionBtn;
        let textStyle = styles.optionText;
        if (revealed) {
          if (idx === challenge.answer) {
            btnStyle = [styles.optionBtn, styles.optionCorrect];
          } else if (idx === selected && !isCorrect) {
            btnStyle = [styles.optionBtn, styles.optionWrong];
          }
        } else if (selected === idx) {
          btnStyle = [styles.optionBtn, styles.optionSelected];
        }
        return (
          <TouchableOpacity key={idx} style={btnStyle} onPress={() => handleSelect(idx)}>
            <Text style={textStyle}>{opt}</Text>
          </TouchableOpacity>
        );
      })}

      {/* Reveal explanation */}
      {revealed && (
        <View style={[styles.explanationCard, { borderLeftColor: isCorrect ? colors.green : colors.red }]}>
          <View style={styles.resultRow}>
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={isCorrect ? colors.green : colors.red}
            />
            <Text style={[styles.resultText, { color: isCorrect ? colors.green : colors.red }]}>
              {isCorrect ? ' Clean read.' : ' Off the line.'}
            </Text>
          </View>
          <Text style={styles.explanationText}>{challenge.explanation}</Text>
          <Text style={styles.metaphorText}>{challenge.metaphor}</Text>
          <TouchableOpacity style={styles.nextBtn} onPress={next}>
            <Text style={styles.nextBtnText}>NEXT CHALLENGE →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  label:           { ...fonts.label, color: colors.accent },
  heading:         { ...fonts.heading, fontSize: 24 },
  streakBadge:     { backgroundColor: colors.card, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: 'center', flexDirection: 'row', gap: 4 },
  streakCount:     { color: colors.gold, fontWeight: '900', fontSize: 18 },
  meta:            { ...fonts.label, color: colors.textMuted, marginBottom: spacing.md },
  chartBox:        { height: 160, backgroundColor: colors.card, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  chartNote:       { color: colors.textSecondary, fontSize: 13 },
  chartSub:        { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  setupCard:       { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.accent },
  setupLabel:      { ...fonts.label, color: colors.accent, marginBottom: 6 },
  setupText:       { ...fonts.body },
  questionLabel:   { ...fonts.label, marginBottom: spacing.sm },
  optionBtn:       { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  optionSelected:  { borderColor: colors.accent },
  optionCorrect:   { borderColor: colors.green, backgroundColor: '#00E67620' },
  optionWrong:     { borderColor: colors.red, backgroundColor: '#FF174420' },
  optionText:      { ...fonts.body, color: colors.textPrimary },
  explanationCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, borderLeftWidth: 3 },
  resultRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  resultText:      { fontWeight: '800', fontSize: 16 },
  explanationText: { ...fonts.body, marginBottom: spacing.sm },
  metaphorText:    { ...fonts.body, color: colors.accent, fontStyle: 'italic', marginBottom: spacing.md },
  nextBtn:         { backgroundColor: colors.accent, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  nextBtnText:     { color: colors.bg, fontWeight: '800', fontSize: 13, letterSpacing: 1 },
});
