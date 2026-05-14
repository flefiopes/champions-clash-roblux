<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import {
  LayoutDashboardIcon,
  SwordsIcon,
  ShieldIcon,
  SettingsIcon,
  ShoppingCartIcon,
  HistoryIcon,
  MenuIcon,
  Gamepad2Icon,
  ScrollTextIcon,
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();

const route = useRoute();

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
  { name: 'Guerres', href: '/wars', icon: SwordsIcon },
  { name: 'Factions', href: '/factions', icon: ShieldIcon },
  { name: 'Mini-jeux', href: '/minigames', icon: Gamepad2Icon },
  { name: 'Logs Mini-jeux', href: '/minigames/logs', icon: ScrollTextIcon },
  { name: 'Quêtes', href: '/quests', icon: ScrollTextIcon },
  { name: 'Badges', href: '/badges', icon: ShieldIcon },
  { name: 'Boutique', href: '/products', icon: ShoppingCartIcon },
  { name: 'Configuration', href: '/config', icon: SettingsIcon },
  { name: 'Audit', href: '/transactions', icon: HistoryIcon },
];
</script>

<template>
  <aside
    class="flex flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300"
    :class="props.isOpen ? 'w-64' : 'w-20'"
  >
    <div class="flex h-16 items-center justify-between px-4">
      <div v-if="props.isOpen" class="flex items-center gap-3 overflow-hidden whitespace-nowrap">
        <span
          class="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent"
        >
          Champions Clash
        </span>
      </div>
      <button
        type="button"
        class="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        @click="emit('toggle')"
      >
        <MenuIcon class="h-6 w-6" />
      </button>
    </div>

    <nav class="flex-1 space-y-1 px-3 py-4">
      <RouterLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        class="group flex items-center rounded-lg px-2 py-2.5 text-sm font-medium transition-colors"
        :class="[
          route.path === item.href
            ? 'bg-indigo-500/10 text-indigo-400'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white',
        ]"
      >
        <component
          :is="item.icon"
          class="mr-3 h-5 w-5 flex-shrink-0"
          :class="[
            route.path === item.href ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white',
          ]"
        />
        <span v-if="props.isOpen">{{ item.name }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>
