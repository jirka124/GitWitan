<template>
  <q-toolbar class="app-titlebar">
    <nav class="app-titlebar-menu" aria-label="Application menu">
      <button class="app-titlebar-menu-item" type="button">File</button>
      <button class="app-titlebar-menu-item" type="button">View</button>
      <button class="app-titlebar-menu-item" type="button">Repository</button>
      <button class="app-titlebar-menu-item" type="button">Window</button>
      <button class="app-titlebar-menu-item" type="button">Help</button>
    </nav>

    <div class="app-titlebar-window-title" aria-hidden="true">GitWitan</div>
  </q-toolbar>
</template>

<style scoped>
.app-titlebar {
  position: relative;
  display: flex;
  min-height: var(--app-titlebar-height);
  padding: 0 var(--app-window-controls-width) 0 6px;
  -webkit-app-region: drag;
  app-region: drag;
}

.app-titlebar-menu {
  display: flex;
  flex: 0 1 auto;
  align-items: center;
  min-width: 0;
  height: var(--app-titlebar-height);
  overflow: hidden;
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

.app-titlebar-menu-item {
  height: 24px;
  padding: 0 9px;
  color: var(--app-text-muted);
  font: inherit;
  font-size: 12px;
  line-height: 24px;
  background: transparent;
  border: 0;
  border-radius: 4px;
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

.app-titlebar-menu-item:hover {
  color: var(--app-text);
  background: var(--app-hover);
}

.app-titlebar-window-title {
  position: absolute;
  top: 0;
  left: 50%;
  max-width: 180px;
  height: var(--app-titlebar-height);
  overflow: hidden;
  color: var(--app-title-muted);
  font-size: 11px;
  font-weight: 650;
  line-height: var(--app-titlebar-height);
  text-align: center;
  text-overflow: ellipsis;
  text-transform: uppercase;
  transform: translateX(-50%);
  white-space: nowrap;
  pointer-events: none;
}

@media (max-width: 760px) {
  .app-titlebar {
    padding-right: var(--app-window-controls-width);
  }

  .app-titlebar-menu-item {
    padding-right: 7px;
    padding-left: 7px;
  }

  .app-titlebar-window-title {
    display: none;
  }
}
</style>
