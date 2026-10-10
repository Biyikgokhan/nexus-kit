---
name: nexus-place
description: Create, edit, or validate a Nexus Interlink place with Nexus Kit, a portable place.json and a small stylized Three.js scene. Use for a Nexus place, its Blender or GLB workflow, or connections between independent creative spaces.
---

Work in the user's existing project. Inspect place.json, package.json and relevant project instructions. Use the language of the user. For a new place, locate the installed Nexus Kit CLI or its checked-out bin/nexus-kit.mjs; run init in the requested output directory. For visual setup, run the kit's wizard command and give the local address. Neither path needs a paid model.

Use photos and sketches the user chooses to share. Record uncertain geometry as interpretation, not survey data. Do not invent a business address, unseen room, artist permission or reciprocal endorsement.

Use one place.json as the editable source: name, kind (studio/garden/simulation/gallery/shop), HTTPS url, description, room {width,depth,items} and links [{object,relation,url}]. Room dimensions are 3–16 metres; x/z are centred metres, +z is the front. Up to 24 items: table, seat, plant, frame, portal. Keep positions inside the room. relation is portal or reference. HTTPS links have no credentials. See the kit's schema/nexus-interlink-0.2.schema.json for full manifests.

AI may propose a JSON plan; validate it before applying. Keep original photographs in reference/photos/ and the sketch in reference/sketch.*, excluded from Git and deployment. Keep credentials out of place.json, public/, generated ZIPs and prompts. Do not add addresses or embed reference photographs in the public manifest without the owner's choice.

For Blender: the kit supplies tools/build_place.py. The blender CLI command creates public/models/place.glb and reference/blender-report.json. GLB exports from other authoring tools are also usable. Use named objects, simple geometry and few materials. Targets: 250k scene triangles, 300 meshes, 20 materials, 1024px textures, 3 MB per GLB. These are budgets, not measured FPS guarantees. Preserve the user's deliberate creative direction.

After editing, run manifest and check from the place directory, then npm run build. Preview the result at desktop and mobile widths; check accessible portal links and a useful no-WebGL fallback. check returning yellow means warnings remain; do not call it fully verified. The starter is an orbitable diorama, not a collision-tested first-person game.

Optional MCP tools, when configured: validate_manifest validates supplied data; plan_from_grid proposes a layout; design_brief prepares a prompt. They do not read files, upload, deploy or register a place. Do not claim these tools are present without checking.

Publishing needs the owner's request. The kit's publish command produces hosting guidance and a registry application; it does not deploy or guarantee listing. Publish /.well-known/nexus.json at the HTTPS domain root. A portal is an ordinary link, not identity federation or a trust guarantee. Report what actually built, ran, or was published and what remains unverified.
