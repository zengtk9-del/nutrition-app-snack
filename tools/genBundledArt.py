# Regenerate data/bundledArt.js from whatever is in assets/art/.
# Run from the project root:  python3 tools/genBundledArt.py
# Adding art is therefore: drop the file in assets/art/, run this, rebuild.
import os
names = sorted(os.listdir('assets/art'))
tot = sum(os.path.getsize('assets/art/' + n) for n in names)
head = open('data/bundledArt.js', encoding='utf-8').read().split('export const BUNDLED_ART')[0]
import re
head = re.sub(r'// \d[\d,]* files, about [\d.]+ MB\.',
              '// %d files, about %.1f MB.' % (len(names), tot / 1048576), head)
with open('data/bundledArt.js', 'w', encoding='utf-8') as f:
    f.write(head)
    f.write('export const BUNDLED_ART = {\n')
    for n in names:
        f.write("  '%s': require('../assets/art/%s'),\n" % (n, n))
    f.write('};\n')
print('regenerated:', len(names), 'entries')
