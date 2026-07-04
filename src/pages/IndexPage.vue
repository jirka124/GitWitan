<template>
  <q-page class="repository-workspace">
    <section class="repo-switcher" aria-label="Open repositories">
      <button class="repo-switcher-item repo-switcher-item-active" type="button">
        <span>No repository</span>
      </button>
      <button class="repo-switcher-item" type="button">
        <span>GitWitan</span>
      </button>
      <button class="repo-switcher-add" type="button" aria-label="Open repository">
        <q-icon name="add" />
      </button>
    </section>

    <main class="repo-grid">
      <aside class="repo-sidebar">
        <div class="repo-sidebar-header">
          <div class="repo-name">No repository</div>
        </div>

        <q-list dense padding class="repo-navigation">
          <q-item clickable :active="activeView === 'history'" @click="activeView = 'history'">
            <q-item-section avatar>
              <q-icon name="history" />
            </q-item-section>
            <q-item-section>History</q-item-section>
          </q-item>

          <q-item clickable :active="activeView === 'changes'" @click="activeView = 'changes'">
            <q-item-section avatar>
              <q-icon name="difference" />
            </q-item-section>
            <q-item-section>Local Changes</q-item-section>
          </q-item>
        </q-list>

        <q-separator />

        <q-list dense class="repo-tree">
          <q-expansion-item dense default-opened expand-icon="keyboard_arrow_right" label="Branches">
            <q-item clickable class="repo-tree-item repo-tree-item-current">
              <q-item-section avatar>
                <q-icon name="account_tree" />
              </q-item-section>
              <q-item-section>main</q-item-section>
            </q-item>
            <q-item clickable class="repo-tree-item">
              <q-item-section avatar>
                <q-icon name="account_tree" />
              </q-item-section>
              <q-item-section>feature/sidebar-polish</q-item-section>
            </q-item>
            <q-item clickable class="repo-tree-item">
              <q-item-section avatar>
                <q-icon name="account_tree" />
              </q-item-section>
              <q-item-section>release/mvp-shell</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item dense default-opened expand-icon="keyboard_arrow_right" label="Remotes">
            <q-expansion-item dense default-opened class="repo-tree-nested" expand-icon="keyboard_arrow_right" label="origin">
              <q-item clickable class="repo-tree-item repo-tree-child">
                <q-item-section avatar>
                  <q-icon name="commit" />
                </q-item-section>
                <q-item-section>origin/main</q-item-section>
              </q-item>
              <q-item clickable class="repo-tree-item repo-tree-child">
                <q-item-section avatar>
                  <q-icon name="commit" />
                </q-item-section>
                <q-item-section>origin/develop</q-item-section>
              </q-item>
              <q-item clickable class="repo-tree-item repo-tree-child">
                <q-item-section avatar>
                  <q-icon name="commit" />
                </q-item-section>
                <q-item-section>origin/feature/git-service</q-item-section>
              </q-item>
            </q-expansion-item>

            <q-expansion-item dense class="repo-tree-nested" expand-icon="keyboard_arrow_right" label="upstream">
              <q-item clickable class="repo-tree-item repo-tree-child">
                <q-item-section avatar>
                  <q-icon name="commit" />
                </q-item-section>
                <q-item-section>upstream/main</q-item-section>
              </q-item>
              <q-item clickable class="repo-tree-item repo-tree-child">
                <q-item-section avatar>
                  <q-icon name="commit" />
                </q-item-section>
                <q-item-section>upstream/preview</q-item-section>
              </q-item>
            </q-expansion-item>
          </q-expansion-item>

          <q-expansion-item dense default-opened expand-icon="keyboard_arrow_right" label="Stashes">
            <q-item clickable class="repo-tree-item">
              <q-item-section avatar>
                <q-icon name="inventory_2" />
              </q-item-section>
              <q-item-section>
                <q-item-label>WIP: sidebar density pass</q-item-label>
                <q-item-label caption>stash@{0}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable class="repo-tree-item">
              <q-item-section avatar>
                <q-icon name="inventory_2" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Before toolbar layout changes</q-item-label>
                <q-item-label caption>stash@{1}</q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </q-list>
      </aside>

      <section class="repo-main">
        <q-tab-panels v-model="activeView" animated class="view-panels">
          <q-tab-panel name="history" class="work-panel">
            <div class="empty-state">
              <q-icon name="commit" size="32px" />
              <h1>Open a repository to inspect history</h1>
              <p>Commit lists and graph controls will live here.</p>
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

        <section class="repo-detail">
          <div class="panel-title">Details</div>
          <div class="empty-detail">Select a commit or file to view its diff.</div>
        </section>
      </section>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeView = ref('history');
</script>
