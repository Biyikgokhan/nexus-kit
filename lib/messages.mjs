// SPDX-License-Identifier: GPL-3.0-or-later
export function validationMessage(message, language = 'tr') {
  if (language !== 'en') return message;
  const rules = [
    [/^Manifest /, 'The manifest must be a JSON object.'],
    [/^protocol /, 'protocol must be "nexus-interlink/0.2".'],
    [/^id /, 'id must contain 2–40 lowercase letters, numbers or hyphens.'],
    [/^name /, 'name must contain 2–70 characters.'],
    [/^url /, 'url must use HTTPS without credentials.'],
    [/^kind /, 'kind must be studio, garden, simulation, gallery or shop.'],
    [/^description /, 'description must be text, at most 600 characters.'],
    [/^address /, 'address must be text, at most 250 characters, or null.'],
    [/^coordinates /, 'coordinates require latitude −90…90, longitude −180…180 and coordinateSource.'],
    [/^anchorId /, 'anchorId must be a valid id.'],
    [/^engine /, 'engine must be nonempty text, at most 40 characters.'],
    [/^room bir/, 'room must be an object.'],
    [/^room\.(width|depth)/, 'Room width and depth must each be 3–16 metres.'],
    [/^room.items bir/, 'room.items must be a list.'],
    [/^room.items en/, 'room.items may contain at most 24 objects.'],
    [/^room.items\[\d+\].type/, 'An item has an unknown type; use table, seat, plant, frame or portal.'],
    [/^room.items\[\d+\].target/, 'Every item target must use HTTPS without credentials.'],
    [/^room.items\[\d+\].label/, 'Item labels may contain at most 80 characters.'],
    [/^room.items\[/, 'Every item must have numeric x/z coordinates inside the room.'],
    [/^photos/, 'photos must be a list of at most 3 JPEG/PNG/WebP data URIs, each smaller than 1.5 MB.'],
    [/^links bir/, 'links must be a list; an empty list is allowed.'],
    [/^links en/, 'At most 60 links are allowed.'],
    [/^links\[\d+\].relation/, 'Every link relation must be portal or reference.'],
    [/^links\[\d+\].url/, 'Every link URL must use HTTPS without credentials.'],
    [/^links\[\d+\].object/, 'Link labels must be text, at most 80 characters.'],
    [/^aliases/, 'aliases must be a list of at most 5 HTTPS URLs.']
  ];
  return rules.find(([pattern]) => pattern.test(message))?.[1] || 'Invalid manifest. Check identity, room dimensions, object positions and HTTPS links.';
}

