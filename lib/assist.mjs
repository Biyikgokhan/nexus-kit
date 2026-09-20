// The harness client lives in harness/ so `init` copies it into every project; the CLI imports it from here.
export {assist,listClaudeModels,envelope,extractJson,validateResult,imageBlock,PLACE_RULES,TASKS,ITEM_TYPES,DEFAULT_CLAUDE_MODEL} from '../harness/client.mjs';
