"""Fetch a pinned KanjiVG subset and extract ordered stroke paths (CC BY-SA 3.0)."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import re
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
REVISION = '70a0b7ae0c18ceb5cb358274b029cce0234a43bc'
HIRAGANA = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'
CHARACTERS = HIRAGANA + ''.join(chr(ord(c) + 96) for c in HIRAGANA)
DEST = ROOT / 'dist/vendor/kanjivg'
DEST.mkdir(parents=True, exist_ok=True)

def get_character(char):
    name = f'{ord(char):05x}.svg'
    path = DEST / name
    if not path.exists():
        url = f'https://raw.githubusercontent.com/KanjiVG/kanjivg/{REVISION}/kanji/{name}'
        with urllib.request.urlopen(url, timeout=30) as response:
            path.write_bytes(response.read())
    tree = ET.fromstring(path.read_bytes())
    strokes = [p.attrib['d'] for p in tree.iter('{http://www.w3.org/2000/svg}path')
               if re.search(r'-s\d+$', p.attrib.get('id', ''))]
    assert strokes, f'Missing strokes: {char}'
    return char, {'paths': strokes, 'source': name}

with ThreadPoolExecutor(max_workers=6) as pool:
    data = dict(pool.map(get_character, CHARACTERS))
header = ('// Derived from KanjiVG, copyright Ulrich Apel and contributors. CC BY-SA 3.0.\n'
          '// Ordered SVG paths extracted without geometry changes. See ../vendor/kanjivg/CREDITS.md.\n')
(ROOT / 'dist/handwriting/strokes.js').write_text(
    header + 'export const kanaStrokes = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
print(f'Imported {len(data)} kana, {sum(len(d["paths"]) for d in data.values())} strokes, from {REVISION}')
