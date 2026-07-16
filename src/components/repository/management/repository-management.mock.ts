import type { ManagedRepository, RepositoryIconOption } from './repository-management.types';

export const repositoryIconOptions: RepositoryIconOption[] = [
  { name: 'data_object', label: 'Code' },
  { name: 'folder_special', label: 'Project folder' },
  { name: 'account_tree', label: 'Git tree' },
  { name: 'dns', label: 'Service' },
  { name: 'space_dashboard', label: 'Dashboard' },
  { name: 'science', label: 'Experiment' },
  { name: 'terminal', label: 'Command line' },
  { name: 'storage', label: 'Database' },
  { name: 'web_asset', label: 'Frontend' },
  { name: 'hub', label: 'Integration' },
  { name: 'settings_applications', label: 'Configuration' },
  { name: 'lock', label: 'Private' },
];

export const managedRepositories: ManagedRepository[] = [
  {
    key: 'gitwitan',
    name: 'GitWitan',
    path: 'C:/xampp/htdocs/PHPcodes/quasar/GitWitan',
    icon: 'data_object',
    dirtyCount: 4,
    lastFetch: '12 min ago',
    commitCount: '148',
    lastCommit: '24 min ago',
    remotes: [
      {
        name: 'origin',
        href: 'https://github.com/example/gitwitan',
        status: 'reachable',
        tone: 'ok',
        lastFetch: '12 min ago',
      },
      {
        name: 'upstream',
        href: 'https://github.com/example/gitwitan-upstream',
        status: 'not fetched',
        tone: 'warning',
        lastFetch: 'Never',
      },
    ],
  },
  {
    key: 'api',
    name: 'GitWitan API',
    path: 'C:/xampp/htdocs/PHPcodes/quasar/GitWitan/apps/api',
    icon: 'dns',
    dirtyCount: 2,
    lastFetch: '1 hr ago',
    commitCount: '86',
    lastCommit: '2 hr ago',
    remotes: [
      {
        name: 'origin',
        href: 'https://github.com/example/gitwitan-api',
        status: 'reachable',
        tone: 'ok',
        lastFetch: '1 hr ago',
      },
    ],
  },
  {
    key: 'dashboard',
    name: 'Dashboard Shell',
    path: 'C:/xampp/htdocs/PHPcodes/quasar/GitWitan/apps/dashboard',
    icon: 'space_dashboard',
    dirtyCount: 0,
    lastFetch: 'Yesterday',
    commitCount: '231',
    lastCommit: 'Yesterday',
    remotes: [
      {
        name: 'origin',
        href: 'https://github.com/example/dashboard',
        status: 'reachable',
        tone: 'ok',
        lastFetch: 'Yesterday',
      },
    ],
  },
  {
    key: 'experiments',
    name: 'UI Experiments',
    path: 'D:/workspace/ui-experiments',
    icon: 'science',
    dirtyCount: 7,
    lastFetch: '3 days ago',
    commitCount: '34',
    lastCommit: '4 days ago',
    remotes: [
      {
        name: 'origin',
        href: 'https://github.com/example/ui-experiments',
        status: 'stale',
        tone: 'stale',
        lastFetch: '3 days ago',
      },
    ],
  },
];
