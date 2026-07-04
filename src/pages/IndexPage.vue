<template>
  <q-page class="repository-workspace">
    <section class="repo-toolbar">
      <q-btn flat dense no-caps icon="sync" label="Fetch" />
      <q-btn flat dense no-caps icon="south" label="Pull" />
      <q-btn flat dense no-caps icon="north" label="Push" />
      <q-separator vertical />
      <q-btn flat dense no-caps icon="call_merge" label="Merge" />
      <q-btn flat dense no-caps icon="inventory_2" label="Stash" />
      <q-space />
      <q-btn flat dense round icon="search" aria-label="Search" />
      <q-btn flat dense round icon="settings" aria-label="Settings" />
    </section>

    <main class="repo-grid">
      <aside class="repo-sidebar">
        <q-list dense padding>
          <q-item-label header>Branches</q-item-label>
          <q-item clickable active>
            <q-item-section avatar>
              <q-icon name="account_tree" />
            </q-item-section>
            <q-item-section>main</q-item-section>
          </q-item>

          <q-item-label header>Remotes</q-item-label>
          <q-item clickable>
            <q-item-section avatar>
              <q-icon name="cloud" />
            </q-item-section>
            <q-item-section>origin</q-item-section>
          </q-item>

          <q-item-label header>Stashes</q-item-label>
          <q-item>
            <q-item-section class="muted">No stashes</q-item-section>
          </q-item>
        </q-list>
      </aside>

      <section class="repo-main">
        <q-tabs v-model="activeView" dense align="left" class="view-tabs">
          <q-tab name="history" icon="history" label="History" />
          <q-tab name="changes" icon="difference" label="Local Changes" />
        </q-tabs>

        <q-tab-panels v-model="activeView" animated class="view-panels">
          <q-tab-panel name="history" class="work-panel">
            <div class="empty-state">
              <q-icon name="commit" size="32px" />
              <h1>Open a repository to inspect history</h1>
              <p>Commit lists, changed files, and diffs will live here.</p>
            </div>
          </q-tab-panel>

          <q-tab-panel name="changes" class="work-panel">
            <div class="empty-state">
              <q-icon name="difference" size="32px" />
              <h1>No repository selected</h1>
              <p>Staged and unstaged changes will appear in this workspace.</p>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </section>

      <aside class="repo-detail">
        <div class="panel-title">Details</div>
        <div class="empty-detail">Select a commit or file to view its diff.</div>
      </aside>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeView = ref('history');
</script>
