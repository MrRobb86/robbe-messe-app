// Config-Loader. fairId kommt aus VITE_FAIR_ID (Build-Zeit) — eine Messe,
// ein Build. Neue Messen registrieren sich hier.
import { fairConfig as defaultFair } from './fairs/default/fair.config.js'
import { modules as defaultModules } from './fairs/default/modules.js'
import { attractScenes as defaultAttract } from './fairs/default/attract.js'

const fairs = {
  default: { config: defaultFair, modules: defaultModules, attractScenes: defaultAttract },
}

const fairId = import.meta.env.VITE_FAIR_ID || 'default'
const active = fairs[fairId] || fairs.default

export const config = active.config
export const modules = active.modules
export const attractScenes = active.attractScenes

export function getModule(id) {
  return modules.find((m) => m.id === id)
}
