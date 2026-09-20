"""nexus-kit Blender hattı — Fudō tools/build_shop.py yönteminin genelleştirilmiş şablonu.

Çalıştırma:  blender --background --python tools/build_place.py            (place.json'dan sahne üretir)
             blender --background --python tools/build_place.py -- --from-blend dosya.blend   (yalnız adlandırma denetimi + batch + export)

Koordinat sözleşmesi: web düzeni (x, yükseklik, derinlik); pos() Blender Z-up'a çevirir. place.json'daki x,z sayıları
Three.js'te de aynen kullanılır. Her nesne register() ile ADLANDIRILIR ve bir zone alır; adsız mesh kabul edilmez.
Eser slotları (wall-art-NN, screen-NN) boş panel olarak gelir; içeriği mekân sahibi koyar.
Ekol kuralları: docs/04-ART-DIRECTION.md — bevel ≥ 8 cm kutularda, silindir 12 kenar, çubuk 8, tek accent, ≤ 20 malzeme.
"""
import bpy, math, json, os, sys, time
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
FROM_BLEND = ARGS[ARGS.index('--from-blend') + 1] if '--from-blend' in ARGS else None
OUT_GLB = os.path.join(ROOT, 'public', 'models', 'place.glb')
OUT_REPORT = os.path.join(ROOT, 'reference', 'blender-report.json')
started = time.time()

M, groups = {}, {}
active = 'shell'

def mat(n, c, metal=0, rough=.78, emit=0):
    if n in M: return M[n]
    m = bpy.data.materials.new(n); m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*c, 1); p.inputs['Metallic'].default_value = metal; p.inputs['Roughness'].default_value = rough
    if emit: p.inputs['Emission Color'].default_value = (*c, 1); p.inputs['Emission Strength'].default_value = emit
    M[n] = m; return m

def hex_rgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) / 255 for i in (0, 2, 4))

def pos(p): return (p[0], -p[2], p[1])

def register(o, n, m):
    assert n, 'adsız nesne yasak'
    o.name = n; o.data.materials.append(M[m]); groups.setdefault(active, []).append(o); o['zone'] = active; return o

def zone(name):
    global active; active = name

def box(n, p, s, m, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(p)); o = bpy.context.object
    o.scale = (s[0], s[2], s[1]); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel and min(s) >= .08:  # bevel kuralı: her boyutu ≥ 8 cm olan kutular
        mod = o.modifiers.new('soft edges', 'BEVEL'); mod.width = min(bevel, min(s) * .12); mod.segments = 1
        bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier=mod.name)
    return register(o, n, m)

def cyl(n, p, r, h, m, vertices=12, r2=None):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r, radius2=r if r2 is None else r2, depth=h, location=pos(p))
    return register(bpy.context.object, n, m)

def rod(n, a, b, r, m):
    a, b = Vector(pos(a)), Vector(pos(b)); bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=r, depth=(b - a).length, location=(a + b) / 2)
    o = bpy.context.object; o.rotation_euler = (b - a).to_track_quat('Z', 'Y').to_euler(); return register(o, n, m)

def panel(n, p, w, h, m, rot=0):
    verts = [(-w/2, 0, -h/2), (w/2, 0, -h/2), (w/2, 0, h/2), (-w/2, 0, h/2)]
    me = bpy.data.meshes.new(n); me.from_pydata(verts, [], [(0, 1, 2, 3)]); me.uv_layers.new()
    for i, uv in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]): me.uv_layers.active.data[i].uv = uv
    o = bpy.data.objects.new(n, me); bpy.context.collection.objects.link(o); o.location = pos(p); o.rotation_euler[2] = rot
    return register(o, n, m)

def plant(n, x, y, z, size=1):
    cyl(n + ' pot', (x, y + .16 * size, z), .20 * size, .32 * size, 'terracotta', 10, .25 * size)
    for j in range(7):
        a = j * 2.4; top = y + (.6 + (j % 3) * .15) * size; xx = x + math.cos(a) * .3 * size; zz = z + math.sin(a) * .3 * size
        rod(n + f' stem-{j:02d}', (x, y + .28 * size, z), (xx, top, zz), .012 * size, 'green')
        bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=4, radius=1, location=pos((xx, top, zz))); leaf = bpy.context.object
        leaf.scale = (.10 * size, .035 * size, .25 * size); leaf.rotation_euler = (.45, math.sin(a), a); register(leaf, n + f' leaf-{j:02d}', 'green')

def table(n, x, z, w=1.4, d=.8, h=.9):
    box(n + ' top', (x, h - .065, z), (w, .13, d), 'wood', .012)
    for i, (dx, dz) in enumerate([(-w/2 + .15, -d/2 + .12), (w/2 - .15, -d/2 + .12), (-w/2 + .15, d/2 - .12), (w/2 - .15, d/2 - .12)]):
        box(n + f' leg-{i}', (x + dx, (h - .13) / 2, z + dz), (.07, h - .13, .07), 'ink')

def seat(n, x, z):
    box(n + ' base', (x, .3, z), (1.3, .42, .65), 'fabric', .02); box(n + ' back', (x, .68, z - .3), (1.3, .6, .12), 'fabric', .02)

def frame(n, x, z, w=1.3, h=1.4, index=0):
    box(n + ' frame', (x, 1.25, z), (w, h, .12), 'wood', .01); box(n + ' mount', (x, 1.25, z + .08), (w - .18, h - .18, .04), 'paper')
    panel(f'wall-art-{index:02d}', (x, 1.25, z + .105), w - .3, h - .3, 'paper')  # eser slotu: sahibi doldurur

def portal(n, x, z):
    box(n + ' cabin', (x, .85, z), (.9, 1.5, .3), 'ink', .012); box(n + ' screen', (x, 1.0, z + .17), (.66, .85, .025), 'accent')
    cyl(n + ' ring', (x, 1.0, z + .2), .19, .02, 'paper', 24, .19)

def shell(room, palette):
    w, d, c = room['width'], room['depth'], room.get('ceiling', 3.0)
    zone('shell')
    box('floor', (0, -.11, 0), (w, .22, d), 'floor'); box('wall-back', (0, c / 2, -d / 2), (w, c, .14), 'wall'); box('wall-left', (-w / 2, c / 2, 0), (.14, c, d), 'wall-side')
    for i, x in enumerate([-w / 2 + .5 + k * .5 for k in range(int(w * 2) - 1)]): box(f'floor-board-{i:02d}', (x, .007, 0), (.016, .012, d - .2), 'board')

def build_from_place(place):
    palette = place.get('palette', {})
    mat('floor', hex_rgb(palette.get('paper', '#eae6d8'))); mat('wall', (.86, .85, .75)); mat('wall-side', (.71, .75, .67)); mat('board', (.81, .79, .71))
    mat('wood', hex_rgb(palette.get('wood', '#8f6950'))); mat('ink', hex_rgb(palette.get('ink', '#22362e'))); mat('paper', (.92, .90, .85)); mat('accent', hex_rgb(palette.get('accent', '#bd4834')), emit=.6)
    mat('fabric', (.39, .46, .40), rough=1); mat('terracotta', (.67, .40, .31)); mat('green', (.44, .55, .37))
    room = place['room']; shell(room, palette); art = 0
    for i, o in enumerate(room.get('items', [])):
        zone(o.get('id') or f'item-{i:02d}'); n = o.get('id') or f'{o["type"]}-{i:02d}'
        if o['type'] == 'table': table(n, o['x'], o['z'])
        elif o['type'] == 'seat': seat(n, o['x'], o['z'])
        elif o['type'] == 'plant': plant(n, o['x'], 0, o['z'], 2)
        elif o['type'] == 'frame': frame(n, o['x'], o['z'], index=art); art += 1
        elif o['type'] == 'portal': portal(n, o['x'], o['z'])

def batch_and_export():
    # zone + malzeme bazında birleştirme: Three.js tarafında zone kökü userData.station olur.
    report_meshes = 0
    for z, objs in groups.items():
        by_mat = {}
        for o in objs: by_mat.setdefault(o.data.materials[0].name, []).append(o)
        for mname, same in by_mat.items():
            if len(same) < 2: continue
            bpy.ops.object.select_all(action='DESELECT')
            for o in same: o.select_set(True)
            bpy.context.view_layer.objects.active = same[0]; bpy.ops.object.join(); same[0].name = f'{z}--{mname}'; same[0]['zone'] = z
    tris = 0; meshes = 0; unnamed = []
    for o in bpy.data.objects:
        if o.type != 'MESH': continue
        meshes += 1; o.data.validate(); o.data.calc_loop_triangles(); tris += len(o.data.loop_triangles)
        if o.name.startswith('Cube') or o.name.startswith('Cylinder') or o.name.startswith('Sphere'): unnamed.append(o.name)
    os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True); os.makedirs(os.path.dirname(OUT_REPORT), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format='GLB', export_apply=True, export_yup=True, export_extras=True)
    textures = [{'name': i.name, 'width': i.size[0], 'height': i.size[1]} for i in bpy.data.images if i.size[0] and i.name not in ('Viewer Node', 'Render Result')]
    report = {'triangles': tris, 'meshes': meshes, 'materials': len([m for m in bpy.data.materials if m.users]), 'zones': len(groups), 'lights': len([o for o in bpy.data.objects if o.type == 'LIGHT']),
              'glbBytes': os.path.getsize(OUT_GLB), 'textures': textures, 'unnamed': unnamed, 'seconds': round(time.time() - started, 1), 'note': 'Geometri sayımıdır; FPS ölçümü değildir.'}
    with open(OUT_REPORT, 'w', encoding='utf-8') as f: json.dump(report, f, ensure_ascii=False, indent=2)
    print('nexus-kit blender:', json.dumps(report, ensure_ascii=False))
    if unnamed: print('UYARI adsız mesh:', ', '.join(unnamed))

if FROM_BLEND:
    bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT, FROM_BLEND))
    for o in bpy.data.objects:
        if o.type == 'MESH':
            z = o.get('zone') or (o.users_collection[0].name if o.users_collection else 'shell'); o['zone'] = z; groups.setdefault(z, []).append(o)
            if not o.data.materials: o.data.materials.append(mat('untitled', (.6, .6, .6)))
    batch_and_export()
else:
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
    with open(os.path.join(ROOT, 'place.json'), encoding='utf-8') as f: place = json.load(f)
    build_from_place(place); batch_and_export()
