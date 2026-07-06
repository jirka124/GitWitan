<template>
  <q-layout view="hHh LpR fFf" class="app-shell">
    <q-header class="app-header">
      <AppTitleBar />
      <AppWorkBar :theme-icon="themeIcon" :theme-label="themeLabel" @toggle-theme="toggleTheme" />
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import AppTitleBar from '../components/app/AppTitleBar.vue';
import AppWorkBar from '../components/app/AppWorkBar.vue';

const THEME_STORAGE_KEY = 'gitwitan-theme';

type AppTheme = 'dark' | 'light';

declare global {
  interface Window {
    gitwitanWindow?: {
      setTheme: (theme: AppTheme) => void;
    };
  }
}

const $q = useQuasar();
const currentTheme = ref<AppTheme>('dark');

const applyTheme = (theme: AppTheme) => {
  currentTheme.value = theme;
  $q.dark.set(theme === 'dark');
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.gitwitanWindow?.setTheme(theme);
};

const toggleTheme = () => {
  applyTheme(currentTheme.value === 'dark' ? 'light' : 'dark');
};

const themeIcon = computed(() => (currentTheme.value === 'dark' ? 'light_mode' : 'dark_mode'));
const themeLabel = computed(() =>
  currentTheme.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
);

onMounted(() => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const preferredTheme: AppTheme =
    savedTheme === 'dark' || savedTheme === 'light'
      ? savedTheme
      : window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';

  applyTheme(preferredTheme);
});
</script>
