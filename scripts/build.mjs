import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import { notes, profile, projects } from '../src/data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const image = (name) => `/assets/images/${name}.webp`;
const external = (url) => /^https?:\/\//.test(url);
const anchor = ({ label, href }, className = '') => `<a href="${esc(href)}"${className ? ` class="${className}"` : ''}${external(href) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(label)}${external(href) ? '<span aria-hidden="true"> ↗</span>' : ''}</a>`;
const links = (items) => items.map((item) => anchor(item, 'inline-link')).join('');

function renderMath(html) {
  const expression = /(\\begin\{(?:equation|align|gather)\*?\}[\s\S]*?\\end\{(?:equation|align|gather)\*?\}|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\\)\$[^$\n]+?\$)/g;
  return html.split(/(<[^>]*>)/g).map((part) => {
    if (part.startsWith('<')) return part;
    return part.replace(expression, (match) => {
      const displayMode = match.startsWith('\\[') || match.startsWith('\\begin');
      const math = match.startsWith('$') ? match.slice(1, -1) : match.startsWith('\\(') || match.startsWith('\\[') ? match.slice(2, -2) : match;
      try {
        const rendered = katex.renderToString(math, { displayMode, throwOnError: false, strict: 'ignore', trust: false });
        return displayMode ? rendered.replace('class="katex-display"', 'class="katex-display" tabindex="0"') : rendered;
      }
      catch { return match; }
    });
  }).join('');
}

async function article(filename) {
  const raw = await readFile(path.join(root, 'src', 'content', filename + '.html'), 'utf8');
  let index = 0;
  const withIds = renderMath(raw).replace(/<h2>([\s\S]*?)<\/h2>/g, (_match, title) => `<h2 id="section-${++index}">${title}</h2>`);
  return { body: withIds, headings: [...withIds.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map((m) => ({ id: m[1], title: m[2].replace(/<[^>]+>/g, '') })) };
}

function shell({ title, description, content, active = '' }) {
  const nav = [
    { label: 'About', href: '/#about', key: 'about' },
    { label: 'Research', href: '/#research', key: 'research' },
    { label: 'Software', href: '/#software', key: 'software' },
    { label: 'Learning', href: '/#learning', key: 'learning' },
    { label: 'Contact', href: '/#contact', key: 'contact' },
  ];
  return `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#17212B"><meta name="description" content="${esc(description)}">
  <meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/katex.min.css">
  <title>${esc(title)}</title>
</head><body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="container header-inner">
    <a class="brand" href="/" aria-label="Oscar Guarnizo, home"><span class="brand-mark">og<span>.</span></span><span class="brand-name">Oscar Guarnizo</span></a>
    <nav class="site-nav" aria-label="Main navigation">${nav.map((item) => `<a href="${item.href}"${active === item.key ? ' aria-current="page"' : ''}>${item.label}</a>`).join('')}</nav>
    <a class="header-contact" href="mailto:${esc(profile.email)}">Let’s talk <span aria-hidden="true">↗</span></a>
  </div></header>
  <main id="main">${content}</main>
  <footer class="site-footer"><div class="container footer-inner"><a class="footer-brand" href="/">Oscar Guarnizo<span>.</span></a><p>Curiosity, code, and a little persistence.</p><a href="#main">Back to top ↑</a></div></footer>
</body></html>`;
}

function projectRow(project, index) {
  const href = `/projects/${project.slug}/`;
  return `<article class="project-row">
    <a class="row-image" href="${href}" aria-label="Read about ${esc(project.title)}"><img src="${image(project.image)}" alt="${esc(project.imageAlt)}" loading="${index < 2 ? 'eager' : 'lazy'}" width="640" height="420"></a>
    <div class="row-copy"><p class="row-meta">${esc(project.label)} <span aria-hidden="true">·</span> ${esc(project.year)}</p>
      <h3><a href="${href}">${esc(project.title)}</a></h3><p class="row-authors">${esc(project.authors)}</p>
      <p class="row-description">${esc(project.summary)}</p>
      <div class="row-links"><a href="${href}">Project page <span aria-hidden="true">↗</span></a>${links(project.links)}</div>
    </div>
  </article>`;
}

function noteRow(note) {
  const href = note.url || `/notes/${note.slug}/`;
  return `<article class="note-row"><div class="note-row-index">${esc(note.tag)}${note.year ? ` · ${esc(note.year)}` : ''}</div><div><h3><a href="${esc(href)}"${note.url ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(note.title)}</a></h3><p>${esc(note.description)}</p><a class="row-primary-link" href="${esc(href)}"${note.url ? ' target="_blank" rel="noopener noreferrer"' : ''}>Read notes <span aria-hidden="true">↗</span></a></div></article>`;
}

function home() {
  return shell({ title: 'Oscar Guarnizo — AI & Machine Learning', description: 'Research, machine learning engineering, and software projects by Oscar Guarnizo.', active: 'about', content: `
  <section class="hero container" id="about" aria-labelledby="hero-title">
    <div class="hero-copy"><p class="eyebrow"><span class="eyebrow-line"></span> COMPUTER SCIENTIST · AI / ML</p>
      <h1 id="hero-title">Oscar Guarnizo<span class="hero-period">.</span></h1>
      <p class="hero-intro">Hi, I’m a computer scientist with experience in AI and machine learning. I completed a master’s degree in AI/ML at the <a href="https://www.birmingham.ac.uk/">University of Birmingham</a>, fully funded by a <a href="https://deepmind.google/">Google DeepMind International Scholarship</a>.</p>
      <p class="hero-sub">I explore reinforcement learning, representation learning, computer vision, and how machines can adapt and reuse knowledge.</p>
      <div class="hero-actions"><a class="button button-primary" href="#research">Explore my work <span aria-hidden="true">↗</span></a><a class="button button-quiet" href="#contact">Get in touch <span aria-hidden="true">→</span></a></div>
      <div class="hero-social">${profile.links.map((item) => anchor(item)).join('')}</div>
    </div>
    <div class="hero-visual"><div class="portrait-frame"><img src="${image('portrait')}" alt="Portrait of Oscar Guarnizo" width="600" height="600"></div><div class="portrait-note"><span class="status-dot"></span><span>MSc AI &amp; ML<br><strong>University of Birmingham</strong></span></div></div>
  </section>
  <section class="section container story" aria-labelledby="story-title"><div class="section-kicker">01 / ABOUT ME</div><div class="story-main"><h2 id="story-title">About <em>me.</em></h2>
    <p>During my master’s program, I focused on state abstractions in reinforcement learning, representation learning in RL, and bisimulation metrics under the supervision of <a href="https://mircogiacobbe.github.io/">Mirco Giacobbe</a> and <a href="https://www.leonardostella.com/">Leonardo Stella</a>, with additional mentorship from <a href="https://psc-g.github.io/">Pablo Samuel Castro</a> and <a href="https://www.linkedin.com/in/rishabhkabra/">Rishabh Kabra</a>.</p>
    <p>After college, I gained industry experience as a Machine Learning Engineer at <a href="https://mobia.la/">Mobia Latam</a> and <a href="https://digevo.com/en/">DIGEVO</a>. During my undergraduate studies, I worked as a part-time Junior Researcher at the <a href="https://www.yachay-scg.com/">Scientific Computing Group</a>, supervised by <a href="https://www.linkedin.com/in/israel-pineda/">Israel Pineda</a>, and at <a href="https://www.deeparcresearch.com/about">DeepARC Research</a>, supervised by <a href="https://www.eugeniomorocho.com/">Eugenio Morocho</a>. Later, I completed a research internship at <a href="https://www.kaust.edu.sa/en">KAUST</a>, working on StyleGANs under the supervision of <a href="http://peterwonka.net/">Peter Wonka</a>.</p>
    <p>I participated in <a href="https://drive.google.com/file/d/1F_DgdpYCXg0zr_L6Mle6cFRs3UKh1X9T/view?usp=drive_link">Oxford ML 2024</a>, <a href="https://drive.google.com/file/d/1vy9bmwwtvwWk4nTfDkGHAQUMafuo4BkJ/view">EEML 2022</a>, <a href="https://drive.google.com/file/d/1shWxeAqxcfEUDfkuqxGBx65Q7mpCPLER/view">EEML 2021</a>, <a href="https://drive.google.com/file/d/1osJYXyUI_xXMqNrjJmcUmVBYOSV58Wge/view">IssoDL 2021</a>, and <a href="https://drive.google.com/file/d/1IXUxIrElRU9iuiyH6YjKprBQFFW9mVUP/view">Workshop MathRL 2021</a>, strengthening both my technical knowledge and interpersonal skills.</p>
    <p class="story-belief">I firmly believe in the power of knowledge and that anyone can learn or practice whatever they want without needing to be an expert.</p>
    <div class="story-links">${anchor({label:'View my CV',href:'/assets/documents/OscarGuarnizoCV.pdf'})}${anchor({label:'Find me on GitHub',href:'https://github.com/ZosoV'})}</div>
  </div></section>
  <section class="background-band"><div class="container background-grid"><div><h3>Skills</h3><p>Spanish (native) · English (C1)<br>Python · Pandas · LaTeX · PyTorch · TensorFlow · NVIDIA DeepStream · NVIDIA TAO Toolkit</p><p class="muted">Also familiar with OpenCV, Docker, Kafka, Unix, and C.</p></div><div><h3>Coursework</h3><p>Artificial Intelligence &amp; Neural Networks · Programming · Database Management · Operating Systems · Functional Programming · Computer Graphics &amp; Image Processing · Probability &amp; Statistics</p><p class="muted">Teaching Assistant in programming; Research Assistant in functional programming and statistics.</p></div><div><h3>Further learning</h3><p>Deep Learning Specialization · Video AI Applications on Jetson Nano · Machine Learning · Data Structures &amp; Algorithms · Learning How to Learn · Neuromatch Deep Learning Academy</p></div></div></section>
  <div id="work"><section class="section container listing-section" id="research" aria-labelledby="research-title"><div class="listing-head"><p class="section-kicker">02 / RESEARCH</p><h2 id="research-title">Research<span>.</span></h2><p>I have experience in reinforcement learning, computer vision, and deep learning.</p></div><div class="project-list">${projects.filter((p) => p.category === 'research').map(projectRow).join('')}</div></section>
  <section class="section container listing-section" id="software" aria-labelledby="software-title"><div class="listing-head"><p class="section-kicker">03 / SOFTWARE</p><h2 id="software-title">Software<span>.</span></h2><p>I’ve also developed software projects related to language models, reinforcement learning, computer vision, and video games.</p></div><div class="project-list">${projects.filter((p) => p.category === 'software').map((p, i) => projectRow(p, i + 5)).join('')}</div></section></div>
  <section class="section learning-section" id="learning" aria-labelledby="learning-title"><div class="container"><div class="listing-head"><p class="section-kicker">04 / LEARNING</p><h2 id="learning-title">Learning <em>notes.</em></h2><p>A collection of coursework, notebooks, and ideas I’ve shared while learning.</p></div><div class="note-list">${notes.filter((n) => n.slug === 'second-semester' || n.slug === 'first-semester' || n.slug === 'pandas').map(noteRow).join('')}<h3 class="notes-subheading">Other notes</h3>${notes.filter((n) => !['second-semester', 'first-semester', 'pandas'].includes(n.slug)).map(noteRow).join('')}</div></div></section>
  <section class="section contact-section container" id="contact" aria-labelledby="contact-title"><p class="section-kicker">05 / SAY HELLO</p><h2 id="contact-title">Have an idea worth <em>exploring together?</em></h2><p>I’m always interested in a good conversation about research, engineering, or a thoughtful project.</p><a class="contact-mail" href="mailto:${esc(profile.email)}">${esc(profile.email)} <span aria-hidden="true">↗</span></a><div class="contact-social">${profile.links.map((item) => anchor(item)).join('')}</div></section>
  ` });
}

function breadcrumbs(last) { return `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/#work">Work</a><span aria-hidden="true">/</span><span aria-current="page">${esc(last)}</span></nav>`; }

async function projectPage(project) {
  const full = project.content ? await article(project.content) : null;
  return shell({ title: `${project.title} — Oscar Guarnizo`, description: project.summary, active: project.category, content: `<div class="container detail-page">${breadcrumbs(project.title)}
    <header class="detail-header"><div><p class="eyebrow">${esc(project.label.toUpperCase())} · ${esc(project.year)}</p><h1>${esc(project.title)}</h1><p class="detail-lead">${esc(project.summary)}</p><p class="detail-authors"><span>With</span> ${esc(project.authors)}</p><div class="detail-links">${links(project.links)}</div></div><div class="detail-hero-image"><img src="${image(project.image)}" alt="${esc(project.imageAlt)}" width="640" height="420"></div></header>
    ${full ? `<div class="detail-body"><article class="prose">${full.body}</article><aside class="detail-aside"><div class="detail-sticky"><p class="aside-title">ON THIS PAGE</p><nav aria-label="Page sections">${full.headings.map((h) => `<a href="#${h.id}">${h.title}</a>`).join('')}</nav><a class="back-link" href="/#work">← Back to all work</a></div></aside></div>` : `<p class="back-row"><a href="/#work">← Back to all work</a></p>`}
  </div>` });
}

async function notePage(note) {
  const full = await article(note.content);
  return shell({ title: `${note.title} — Oscar Guarnizo`, description: note.description, active: 'learning', content: `<div class="container detail-page note-page"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/#learning">Learning</a><span aria-hidden="true">/</span><span aria-current="page">${esc(note.title)}</span></nav><header class="note-header"><p class="eyebrow">${esc(note.tag.toUpperCase())}</p><h1>${esc(note.title)}</h1><p class="detail-lead">${esc(note.description)}</p></header><div class="detail-body"><article class="prose">${full.body}</article><aside class="detail-aside"><div class="detail-sticky"><p class="aside-title">ON THIS PAGE</p><nav aria-label="Page sections">${full.headings.map((h) => `<a href="#${h.id}">${h.title}</a>`).join('')}</nav><a class="back-link" href="/#learning">← Back to notes</a></div></aside></div></div>` });
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });
await cp(path.join(root, 'src', 'styles.css'), path.join(dist, 'styles.css'));
await cp(path.join(root, 'src', 'favicon.svg'), path.join(dist, 'favicon.svg'));
await cp(path.join(root, 'node_modules', 'katex', 'dist', 'katex.min.css'), path.join(dist, 'katex.min.css'));
await cp(path.join(root, 'node_modules', 'katex', 'dist', 'fonts'), path.join(dist, 'fonts'), { recursive: true });
await writeFile(path.join(dist, '.nojekyll'), '');
await writeFile(path.join(dist, 'index.html'), home());
for (const project of projects) {
  const folder = path.join(dist, 'projects', project.slug);
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(folder, 'index.html'), await projectPage(project));
}
for (const note of notes.filter((item) => item.content)) {
  const folder = path.join(dist, 'notes', note.slug);
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(folder, 'index.html'), await notePage(note));
}
console.log(`Built homepage, ${projects.length} project pages, and ${notes.filter((item) => item.content).length} note pages in dist/.`);
