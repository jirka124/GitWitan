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
          <q-expansion-item
            dense
            default-opened
            expand-icon="keyboard_arrow_right"
            label="Branches"
          >
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
            <q-expansion-item
              dense
              default-opened
              class="repo-tree-nested"
              expand-icon="keyboard_arrow_right"
              label="origin"
            >
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

            <q-expansion-item
              dense
              class="repo-tree-nested"
              expand-icon="keyboard_arrow_right"
              label="upstream"
            >
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
            <div class="repo-view-layout">
              <div class="repo-view-content">
                <div class="empty-state">
                  <q-icon name="commit" size="32px" />
                  <h1>Open a repository to inspect history</h1>
                  <p>Commit lists and graph controls will live here.</p>
                </div>
              </div>

              <section class="repo-detail" aria-label="History details">
                <div class="panel-title">Details</div>
                <div class="empty-detail">Select a commit to view its metadata and diff.</div>
              </section>
            </div>
          </q-tab-panel>

          <q-tab-panel name="changes" class="work-panel">
            <div class="repo-view-layout">
              <div class="repo-view-content changes-workspace">
                <section class="changes-file-column" aria-label="Local changes files">
                  <section class="changes-file-panel" aria-label="Unstaged files">
                    <header class="changes-file-header">
                      <div>
                        <div class="panel-title">Unstaged</div>
                        <div class="changes-file-count">{{ unstagedFileCount }} files changed</div>
                      </div>
                      <q-btn
                        flat
                        dense
                        no-caps
                        icon="add"
                        label="Stage"
                        class="changes-list-action"
                      />
                    </header>

                    <q-tree
                      :nodes="unstagedTree"
                      node-key="key"
                      default-expand-all
                      dense
                      no-connectors
                      class="changes-file-tree"
                    >
                      <template #default-header="prop">
                        <div
                          class="changes-tree-row"
                          :class="{
                            'changes-tree-folder': prop.node.children,
                            'changes-tree-file': !prop.node.children,
                          }"
                        >
                          <q-icon
                            :name="prop.node.icon"
                            class="changes-tree-icon"
                            :class="{ 'changes-tree-folder-icon': prop.node.children }"
                          />
                          <span
                            v-if="!prop.node.children"
                            class="change-status"
                            :class="`change-status-${prop.node.status}`"
                          >
                            {{ prop.node.badge }}
                          </span>
                          <div class="changes-tree-copy">
                            <div class="changes-tree-label">
                              <span class="changes-tree-label-short">{{ prop.node.label }}</span>
                              <span v-if="prop.node.caption" class="changes-tree-label-full">
                                {{ prop.node.caption }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </template>
                    </q-tree>
                  </section>

                  <section class="changes-file-panel" aria-label="Staged files">
                    <header class="changes-file-header">
                      <div>
                        <div class="panel-title">Staged</div>
                        <div class="changes-file-count">{{ stagedFileCount }} files ready</div>
                      </div>
                      <q-btn
                        flat
                        dense
                        no-caps
                        icon="remove"
                        label="Unstage"
                        class="changes-list-action"
                      />
                    </header>

                    <q-tree
                      :nodes="stagedTree"
                      node-key="key"
                      default-expand-all
                      dense
                      no-connectors
                      class="changes-file-tree"
                    >
                      <template #default-header="prop">
                        <div
                          class="changes-tree-row"
                          :class="{
                            'changes-tree-folder': prop.node.children,
                            'changes-tree-file': !prop.node.children,
                          }"
                        >
                          <q-icon
                            :name="prop.node.icon"
                            class="changes-tree-icon"
                            :class="{ 'changes-tree-folder-icon': prop.node.children }"
                          />
                          <span
                            v-if="!prop.node.children"
                            class="change-status"
                            :class="`change-status-${prop.node.status}`"
                          >
                            {{ prop.node.badge }}
                          </span>
                          <div class="changes-tree-copy">
                            <div class="changes-tree-label">
                              <span class="changes-tree-label-short">{{ prop.node.label }}</span>
                              <span v-if="prop.node.caption" class="changes-tree-label-full">
                                {{ prop.node.caption }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </template>
                    </q-tree>
                  </section>
                </section>

                <section class="changes-preview-panel" aria-label="Selected file preview">
                  <div class="changes-preview-header">
                    <div>
                      <div class="panel-title">Diff Preview</div>
                      <div class="changes-file-count">Select a changed file</div>
                    </div>
                  </div>
                  <div class="changes-preview-empty">
                    <q-icon name="difference" size="30px" />
                    <h1>No file selected</h1>
                    <p>File diffs and hunk staging controls will appear here.</p>
                  </div>
                </section>
              </div>

              <section class="repo-detail commit-panel" aria-label="Commit changes">
                <div class="commit-message-fields">
                  <q-input
                    v-model="commitSubject"
                    dense
                    outlined
                    placeholder="Commit subject"
                    class="commit-input"
                  />
                  <q-input
                    v-model="commitDescription"
                    dense
                    outlined
                    type="textarea"
                    autogrow
                    placeholder="Description"
                    class="commit-input commit-description"
                  />
                </div>

                <div class="commit-actions">
                  <div class="commit-summary">{{ stagedFileCount }} staged files</div>
                  <q-checkbox v-model="amendCommit" dense label="Amend" class="commit-amend" />
                  <q-btn unelevated no-caps icon="check" label="Commit" class="commit-button" />
                </div>
              </section>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </section>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type ChangeTreeNode = {
  key: string;
  label: string;
  icon: string;
  caption?: string;
  status?: 'modified' | 'added' | 'untracked';
  badge?: string;
  children?: ChangeTreeNode[];
};

const activeView = ref('history');
const commitSubject = ref('');
const commitDescription = ref('');
const amendCommit = ref(false);

const unstagedTree: ChangeTreeNode[] = [
  {
    key: 'unstaged-src',
    label: 'src',
    icon: 'folder',
    children: [
      {
        key: 'unstaged-src-layouts',
        label: 'layouts',
        icon: 'folder',
        children: [
          {
            key: 'unstaged-src-layouts-main-layout',
            label: 'MainLayout.vue',
            caption: 'src/layouts/MainLayout.vue',
            icon: 'description',
            status: 'modified',
            badge: 'M',
          },
        ],
      },
      {
        key: 'unstaged-src-css',
        label: 'css',
        icon: 'folder',
        children: [
          {
            key: 'unstaged-src-css-app',
            label: 'app.css',
            caption: 'src/css/app.css',
            icon: 'description',
            status: 'modified',
            badge: 'M',
          },
        ],
      },
      {
        key: 'unstaged-src-services',
        label: 'services',
        icon: 'folder',
        children: [
          {
            key: 'unstaged-src-services-git-service',
            label: 'git-service.ts',
            caption: 'src/services/git-service.ts',
            icon: 'description',
            status: 'added',
            badge: 'A',
          },
        ],
      },
      {
        key: 'unstaged-src-components',
        label: 'components',
        icon: 'folder',
        children: [
          {
            key: 'unstaged-src-components-repository-picker',
            label: 'RepositoryPicker.vue',
            caption: 'src/components/RepositoryPicker.vue',
            icon: 'description',
            status: 'untracked',
            badge: 'U',
          },
        ],
      },
    ],
  },
];

const stagedTree: ChangeTreeNode[] = [
  {
    key: 'staged-src',
    label: 'src',
    icon: 'folder',
    children: [
      {
        key: 'staged-src-pages',
        label: 'pages',
        icon: 'folder',
        children: [
          {
            key: 'staged-src-pages-index',
            label: 'IndexPage.vue',
            caption: 'src/pages/IndexPage.vue',
            icon: 'description',
            status: 'modified',
            badge: 'M',
          },
        ],
      },
      {
        key: 'staged-src-stores',
        label: 'stores',
        icon: 'folder',
        children: [
          {
            key: 'staged-src-stores-types',
            label: 'types.ts',
            caption: 'src/stores/types.ts',
            icon: 'description',
            status: 'added',
            badge: 'A',
          },
        ],
      },
    ],
  },
];

const countFiles = (nodes: ChangeTreeNode[]): number =>
  nodes.reduce((total, node) => total + (node.children ? countFiles(node.children) : 1), 0);

const unstagedFileCount = computed(() => countFiles(unstagedTree));
const stagedFileCount = computed(() => countFiles(stagedTree));
</script>
