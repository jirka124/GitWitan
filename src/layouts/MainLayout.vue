<template>
  <q-layout view="hHh LpR fFf" class="app-shell">
    <q-header class="app-header">
      <q-toolbar class="app-titlebar">
        <q-toolbar-title class="app-brand">GitWitan</q-toolbar-title>

        <q-btn flat dense no-caps icon="folder_open" label="Open" class="app-action" />
        <q-btn flat dense no-caps icon="download" label="Clone" class="app-action" />
        <q-btn flat dense no-caps icon="add" label="Init" class="app-action" />
      </q-toolbar>

      <q-tabs align="left" dense class="repo-tabs" active-class="repo-tab-active">
        <q-route-tab to="/" name="welcome" icon="home" label="No repository" />
        <q-btn flat dense round icon="add" aria-label="Open repository" class="repo-add" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
