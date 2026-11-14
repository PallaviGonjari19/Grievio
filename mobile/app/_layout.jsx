import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#0f172a',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#f8fafc',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: 'Sign In',
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: 'Register',
          }}
        />
        <Stack.Screen
          name="student"
          options={{
            title: 'Student Portal',
          }}
        />
        <Stack.Screen
          name="staff"
          options={{
            title: 'Department Queue',
          }}
        />
        <Stack.Screen
          name="complaint_new"
          options={{
            title: 'Raise Grievance',
          }}
        />
        <Stack.Screen
          name="complaint_detail"
          options={{
            title: 'Grievance Overview',
          }}
        />
      </Stack>
    </>
  );
}

