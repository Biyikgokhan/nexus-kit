#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { validateManifest } from '../lib/manifest.mjs';
import { parseGridPlan } from '../lib/plan.mjs';
import { aiBrief } from '../lib/starter.mjs';
const server=new McpServer({name:'nexus-interlink',version:'0.3.0'});
const annotations={readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false};
const result=value=>({content:[{type:'text',text:JSON.stringify(value,null,2)}]});
server.registerTool('validate_manifest',{description:'Validate supplied Nexus Interlink 0.2 JSON. Does not read files, fetch URLs, publish or write anything. Returns validation findings, not ownership verification.',inputSchema:{manifest:z.record(z.unknown())},annotations},async({manifest})=>{const errors=validateManifest(manifest);return result({valid:errors.length===0,errors});});
server.registerTool('plan_from_grid',{description:'Turn a supplied ASCII floor plan into proposed room items. T=table, S=seat, P=plant, F=frame, O=portal. Returns data only; no file changes or model calls.',inputSchema:{grid:z.string().max(10000),width:z.number().min(3).max(16),depth:z.number().min(3).max(16)},annotations},async({grid,width,depth})=>{try{return result({room:{width,depth,items:parseGridPlan(grid,{width,depth})},geometry:'photo-sketch-and-owner-layout-interpretation'});}catch(e){return {...result({error:e.message}),isError:true};}});
server.registerTool('design_brief',{description:'Prepare a portable AI design brief from supplied place data. Keeps only public design fields; does not upload photographs or contact an AI provider.',inputSchema:{place:z.record(z.unknown())},annotations},async({place})=>result({brief:aiBrief(place)}));
await server.connect(new StdioServerTransport());
