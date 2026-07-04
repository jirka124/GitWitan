<template>
  <q-layout view="hHh LpR fFf" class="app-shell">
    <q-header class="app-header">
      <q-toolbar class="app-titlebar">
        <q-toolbar-title class="app-brand">GitWitan</q-toolbar-title>

        <div class="repo-management-actions" aria-label="Repository management">
          <q-btn flat dense no-caps icon="folder_open" label="Open" class="repo-management-action" />
          <q-btn flat dense no-caps icon="download" label="Clone" class="repo-management-action" />
          <q-btn flat dense no-caps icon="add" label="Init" class="repo-management-action" />
        </div>

        <section class="current-repo-card" aria-label="Current repository status">
          <div class="current-repo-copy">
            <div class="current-repo-name">No repository</div>
            <div class="current-repo-state">Up to date</div>
          </div>
          <div class="current-repo-progress" aria-hidden="true">
            <div class="current-repo-progress-bar" />
          </div>
        </section>

        <div class="app-command-bar" aria-label="Active repository commands">
          <q-btn flat no-caps icon="sync" label="Fetch" class="app-command" />
          <q-btn flat no-caps icon="south" label="Pull" class="app-command" />
          <q-btn flat no-caps icon="north" label="Push" class="app-command" />
          <q-btn flat no-caps icon="call_merge" label="Merge" class="app-command" />
          <q-btn flat no-caps icon="inventory_2" label="Stash" class="app-command" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
