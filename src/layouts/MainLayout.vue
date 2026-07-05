<template>
  <q-layout view="hHh LpR fFf" class="app-shell">
    <q-header class="app-header">
      <q-toolbar class="app-titlebar">
        <nav class="app-menu-bar" aria-label="Application menu">
          <button class="app-menu-item" type="button">File</button>
          <button class="app-menu-item" type="button">View</button>
          <button class="app-menu-item" type="button">Repository</button>
          <button class="app-menu-item" type="button">Window</button>
          <button class="app-menu-item" type="button">Help</button>
        </nav>

        <div class="app-window-title" aria-hidden="true">GitWitan</div>
      </q-toolbar>

      <q-toolbar class="app-workbar">
        <div class="repo-management-actions" aria-label="Repository management">
          <q-btn
            flat
            dense
            round
            icon="folder_open"
            aria-label="Repository actions"
            class="repo-management-trigger"
          >
            <q-tooltip>Repository</q-tooltip>
          </q-btn>
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
          <div class="app-command-group app-branch-group" aria-label="Branch commands">
            <q-btn
              flat
              no-caps
              icon="account_tree"
              label="main"
              class="app-command app-branch-command"
            >
              <q-icon name="keyboard_arrow_down" class="app-command-caret" />
              <q-tooltip>Branch</q-tooltip>
            </q-btn>
          </div>

          <div class="app-command-group" aria-label="Sync commands">
            <q-btn flat no-caps icon="sync" label="Fetch" class="app-command" />
            <q-btn flat no-caps icon="south" label="Pull" class="app-command" />
            <q-btn flat no-caps icon="north" label="Push" class="app-command" />
          </div>

          <div class="app-command-group" aria-label="Change commands">
            <q-btn flat no-caps icon="call_merge" label="Merge" class="app-command" />
            <q-btn flat no-caps icon="inventory_2" label="Stash" class="app-command" />
          </div>

          <q-btn
            flat
            dense
            round
            icon="settings"
            aria-label="Settings"
            class="app-settings-trigger"
          >
            <q-tooltip>Settings</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
