import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { supabase } from '../api/supabase';
import { getProfile, saveProfile } from '../api/auth';

import AuthScreen        from '../screens/AuthScreen';
import OnboardingScreen  from '../screens/OnboardingScreen';
import BTCDashboard      from '../screens/BTCDashboard';
import WatchlistScreen   from '../screens/WatchlistScreen';
import ReadTheLine       from '../screens/ReadTheLine';
import SignalFeed        from '../screens/SignalFeed';
import ProfileModal      from '../components/ProfileModal';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const [session,    setSession]    = useState(undefined); // undefined = loading
  const [profile,    setProfile]    = useState(null);
  const [checking,   setChecking]   = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile();
      else setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile();
      else { setProfile(null); setChecking(false); }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadProfile = async () => {
    try {
      const p = await getProfile();
      setProfile(p);
    } catch (e) {
      console.error('Profile load error:', e);
    } finally {
      setChecking(false);
    }
  };

  const handleOnboardingComplete = async (profileData) => {
    try {
      await saveProfile(profileData);
      setProfile(profileData);
    } catch (e) {
      console.error('Save profile error:', e);
    }
  };

  // Loading state
  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Not logged in → Auth
  if (!session) {
    return (
      <NavigationContainer>
        <AuthScreen onAuth={loadProfile} />
      </NavigationContainer>
    );
  }

  // Logged in but no profile → Onboarding
  if (!profile?.name) {
    return (
      <NavigationContainer>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </NavigationContainer>
    );
  }

  // Fully set up → Main app
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            const iconMap = {
              BTC:    { name: 'logo-bitcoin',   color: colors.gold },
              Signal: { name: 'radio-outline',  color: colors.accent },
              Learn:  { name: 'school-outline', color: colors.accent },
            };
            const ic = iconMap[route.name];
            const iconColor = focused ? ic.color : colors.textMuted;
            return <Ionicons name={ic.name} size={22} color={iconColor} />;
          },
          tabBarActiveTintColor:   colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor:  colors.border,
            paddingBottom:   8,
            height:          60,
          },
          headerStyle:      { backgroundColor: colors.bg, shadowColor: 'transparent' },
          headerTintColor:  colors.textPrimary,
          headerTitleStyle: { fontWeight: '800', letterSpacing: 1 },
          headerRight: () => (
            <ProfileModal profile={profile} onSignOut={() => { setProfile(null); setSession(null); }} />
          ),
        })}
      >
        <Tab.Screen name="BTC"       component={BTCDashboard}    options={{ title: 'BTC' }} />
        <Tab.Screen name="Signal"    component={SignalFeed}      options={{ title: 'SIGNAL' }} />
        <Tab.Screen name="Learn"     component={ReadTheLine}     options={{ title: 'LEARN' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
