"""One-time migration of Oscar's authored content, excluding inherited templates.

Usage: python3 scripts/migrate_content.py /absolute/path/to/old-site
"""
from html import escape, unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote, quote
import re
import shutil
import subprocess
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1]).resolve()
OUT = ROOT / 'src' / 'content'
ASSETS = ROOT / 'assets'


class Element:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Element):
                yield from child.walk()

    def text(self):
        return ''.join(c.text() if isinstance(c, Element) else c for c in self.children)


class Tree(HTMLParser):
    VOID = {'img', 'image', 'br', 'hr', 'source', 'input', 'meta', 'link', 'wbr'}

    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.root = Element()
        self.stack = [self.root]
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        element = Element(tag, attrs)
        self.stack[-1].children.append(element)
        if tag not in self.VOID:
            self.stack.append(element)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break

    def handle_data(self, text):
        self.stack[-1].children.append(text)


COPIED = set()


def resource(url, page):
    parts = urlsplit(url)
    if parts.scheme or parts.netloc:
        if parts.netloc.lower() != 'zosov.github.io':
            return url
        path = SOURCE / unquote(parts.path.lstrip('/'))
    elif not parts.path:
        return url
    else:
        path = (page.parent / unquote(parts.path)).resolve()
    if not path.is_relative_to(SOURCE):
        return None
    relative = path.relative_to(SOURCE)
    if path.is_dir():
        path /= 'index.html'
        relative /= 'index.html'
    if path.suffix == '.html':
        parts = relative.parts
        if len(parts) >= 3 and parts[0] == 'portfolio' and parts[1] in {
            'bper', 'tensor_decomposition', 'embedding_style_gan', 'aco_path_planning',
            'neural_model', 'lpr', 'mask_rcnn'
        }:
            return '/projects/' + {
                'tensor_decomposition': 'covariancenet', 'embedding_style_gan': 'stylegan',
                'aco_path_planning': 'path-planning', 'neural_model': 'neural-model',
                'lpr': 'license-plates', 'mask_rcnn': 'grapes'
            }.get(parts[1], parts[1]) + '/'
        if len(parts) >= 3 and parts[0] == 'notes':
            note_slugs = {
                'uob_first_semester': 'first-semester',
                'hoeffding_ineq': 'hoeffding-inequality',
                'generalization_bound': 'generalization-bound',
                'dichotomy': 'dichotomy',
            }
            slug = note_slugs.get(parts[-2])
            return '/notes/' + slug + '/' if slug else None
        return None
    if not path.is_file():
        return None
    target = ASSETS / 'archive' / relative
    if path not in COPIED:
        target.parent.mkdir(parents=True, exist_ok=True)
        if path.suffix.lower() == '.mp4' and shutil.which('ffmpeg'):
            subprocess.run([
                'ffmpeg', '-loglevel', 'error', '-y', '-i', str(path),
                '-vf', 'scale=min(960\\,iw):-2', '-c:v', 'libx264',
                '-preset', 'veryfast', '-crf', '31', '-c:a', 'aac',
                '-b:a', '96k', '-movflags', '+faststart', str(target),
            ], check=True)
        else:
            shutil.copy2(path, target)
        COPIED.add(path)
    return '/assets/archive/' + quote(relative.as_posix(), safe='/')


ALLOWED = {'p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'sub', 'sup', 'br', 'hr', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'blockquote', 's', 'u'}


def inline_text(text, notes=False):
    text = escape(text)
    if notes:
        # The old note editor used a few Markdown-like inline delimiters.
        for pattern, tag in [(r'\*\*(.+?)\*\*', 'strong'), (r'__(.+?)__', 'em'), (r'==(.+?)==', 'mark')]:
            text = re.sub(pattern, lambda m: f'<{tag}>{m[1]}</{tag}>', text)
    return text


def render(node, page, notes=False):
    if isinstance(node, str):
        return inline_text(node, notes)
    if node.tag in {'script', 'style', 'nav', 'textarea'}:
        return ''
    inner = ''.join(render(child, page, notes) for child in node.children)
    if node.tag in {'h1', 'h2', 'h3', 'h4', 'h5'}:
        return '<h2>' + inner.strip() + '</h2>'
    if node.tag in {'img', 'image'}:
        url = resource(node.attrs.get('src', ''), page)
        if not url:
            return ''
        name = Path(unquote(url)).stem.replace('_', ' ').replace('-', ' ')
        alt = node.attrs.get('alt', '')
        if alt.lower() in {'', 'test', 'overview'}:
            alt = name.capitalize() + ' — project illustration'
        return f'<figure><img src="{escape(url)}" alt="{escape(alt)}" loading="lazy"></figure>'
    if node.tag == 'a':
        url = resource(node.attrs.get('href', ''), page)
        if not url or url == '#':
            return inner
        return f'<a href="{escape(url)}">{inner}</a>'
    if node.tag == 'iframe':
        url = node.attrs.get('src', '')
        if 'youtube.com/embed/' in url:
            video = urlsplit(url).path.split('/')[-1]
            return f'<p><a href="https://www.youtube.com/watch?v={escape(video)}">Watch the project video on YouTube ↗</a></p>'
        return ''
    if node.tag == 'video':
        sources = [x for x in node.walk() if x.tag == 'source']
        src = node.attrs.get('src') or next((x.attrs.get('src') for x in sources), None)
        url = resource(src, page) if src else None
        if not url:
            return ''
        return f'<video controls preload="none" playsinline aria-label="Project demonstration"><source src="{escape(url)}" type="video/mp4"><a href="{escape(url)}">Download project demonstration</a></video>'
    if node.tag == 'source':
        return ''
    if node.tag in ALLOWED:
        if node.tag in {'br', 'hr'}:
            return f'<{node.tag}>'
        return f'<{node.tag}>{inner}</{node.tag}>'
    return inner


def tidy(text):
    text = re.sub(r'<p>\s*</p>', '', text)
    text = re.sub(r'<h2>\s*</h2>', '', text)
    text = re.sub(r'<ul>\s*</ul>\s*((?:<li>[\s\S]*?</li>\s*)+)', r'<ul>\1</ul>', text)
    # The old editor placed sublists beside their parent item. Nest them in
    # that item so lists remain valid and their relationship is clear.
    text = re.sub(r'</li>(\s*)(<(?:ul|ol)>[\s\S]*?</(?:ul|ol)>)', r'\1\2</li>', text)
    text = re.sub(r'(?:<br>\s*){3,}', '<br><br>', text)
    return text.strip() + '\n'


OUT.mkdir(parents=True, exist_ok=True)
projects = ['bper', 'tensor_decomposition', 'embedding_style_gan', 'aco_path_planning', 'neural_model', 'lpr', 'mask_rcnn']
for slug in projects + ['uob_first_semester']:
    kind = 'notes' if slug == 'uob_first_semester' else 'portfolio'
    page = SOURCE / kind / slug / 'index.html'
    tree = Tree(page.read_text()).root
    sections = []
    for node in tree.walk():
        # Only substantive old article sections, excluding headers and templates.
        if node.tag != 'div' or 'col-md-8' not in node.attrs.get('class', '').split():
            continue
        headings = [c for c in node.children if isinstance(c, Element) and c.tag in {'h2', 'h3'}]
        if not headings or any('Citation' == h.text().strip() for h in headings):
            continue
        sections.append(render(node, page))
    (OUT / f'{slug}.html').write_text(tidy('\n'.join(sections)))

for slug in ['hoeffding_ineq', 'generalization_bound', 'dichotomy']:
    page = SOURCE / 'notes' / 'machine_learning' / slug / 'index.html'
    tree = Tree(page.read_text()).root
    sections = []
    for node in tree.walk():
        if node.tag == 'div' and 'note-container' in node.attrs.get('class', '').split():
            for child in node.children:
                if isinstance(child, Element) and 'topic' in child.attrs.get('class', '').split():
                    sections.append('<h2>' + escape(child.text().strip()) + '</h2>')
                else:
                    sections.append(render(child, page, notes=True))
    (OUT / f'{slug}.html').write_text(tidy('\n'.join(sections)))

# Only homepage images actually used by Oscar's retained projects.
images = {
    'portrait': 'OscarGuarnizo.png',
    'bper': 'banner_front_bper.jpg',
    'covariancenet': 'CovNet_before.png',
    'stylegan': '../../portfolio/embedding_style_gan/assets/images/teaser_image.png',
    'path-planning': 'ACOPathPlanning_before.jpg',
    'neural-model': 'SuccessiveModel_before.png',
    'rl-hangman': 'hangman_bert_rl.png',
    'hangman-bert': 'hangman.webp',
    'minimal-rl': 'rl_comparison.gif',
    'license-plates': 'ALPR_before.jpg',
    'grapes': 'MaskRCNN_before.jpg',
    'game-jam': 'GameJam_before.gif',
}
(ASSETS / 'images').mkdir(parents=True, exist_ok=True)
for name, filename in images.items():
    with Image.open((SOURCE / 'assets' / 'images' / filename).resolve()) as image:
        image.seek(0)
        image = image.convert('RGB')
        image.thumbnail((1000, 800))
        image.save(ASSETS / 'images' / f'{name}.webp', 'WEBP', quality=86)
(ASSETS / 'documents').mkdir(parents=True, exist_ok=True)
shutil.copy2(SOURCE / 'assets' / 'data' / 'OscarGuarnizoCV.pdf', ASSETS / 'documents' / 'OscarGuarnizoCV.pdf')
for filename in [
    'Master Thesis - Oscar Guarnizo - Bisimulation Prioritized Experience Replay.pdf',
    'Bi_Similatuion_Experience_Replay___EEML_2024.pdf',
]:
    resource('assets/' + quote(filename), SOURCE / 'portfolio' / 'bper' / 'index.html')
print(f'Migrated 7 project articles, 4 note pages, {len(COPIED)} referenced archive assets, 12 optimized images and the personal CV.')
