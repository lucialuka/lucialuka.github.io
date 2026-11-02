'use strict';

document.documentElement.classList.add('js');
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const github = 'https://github.com/Qingyang-Lucas-Fang/';

// Keep the fine details in SVG: sharp at every size and independent of WebGL.
const svgNS = 'http://www.w3.org/2000/svg';
function svgElement(tag, attributes) {
  const element = document.createElementNS(svgNS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}
function iso(u, v, centerY = 304) { return [320 + u - v, centerY + (u + v) * .577]; }
const traces = $('#board-traces');
for (let side = 0; side < 4; side++) {
  for (let i = 0; i < 7; i++) {
    const offset = -47 + i * 15;
    const sign = side < 2 ? 1 : -1;
    const points = [[sign * 50, offset], [sign * (70 + i % 3 * 7), offset], [sign * (70 + i % 3 * 7), offset + 9], [sign * 101, offset + 9]];
    const projected = points.map(([u, v]) => side % 2 ? iso(v, u) : iso(u, v));
    traces.append(svgElement('polyline', { points: projected.map(p => p.join(',')).join(' '), opacity: .45 + i % 3 * .15 }));
    const [cx, cy] = projected.at(-1);
    traces.append(svgElement('circle', { cx, cy, r: 1.7, fill: '#d3d8c7' }));
  }
}
const pins = $('#chip-pins');
for (let side = 0; side < 4; side++) {
  for (let offset = -44; offset <= 44; offset += 11) {
    const sign = side < 2 ? 1 : -1;
    const start = side % 2 ? iso(offset, sign * 55, 231) : iso(sign * 55, offset, 231);
    const end = side % 2 ? iso(offset, sign * 65, 231) : iso(sign * 65, offset, 231);
    pins.append(svgElement('line', { x1: start[0], y1: start[1], x2: end[0], y2: end[1] }));
  }
}

const chipScene = $('.chip-scene');
const layerCopy = {
  hardware: 'Every abstraction eventually meets a physical machine.',
  software: 'A good idea becomes a language the machine can understand.',
  codesign: 'The interesting things happen between the layers.'
};
$$('.layer-controls button').forEach(button => {
  button.addEventListener('click', () => {
    const layer = button.dataset.layer;
    chipScene.dataset.layer = layer;
    $$('.layer-controls button').forEach(item => {
      item.classList.toggle('is-active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    $('.layer-description').textContent = layerCopy[layer];
  });
});
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  chipScene.addEventListener('pointermove', event => {
    if (reducedMotion.matches) return;
    const bounds = chipScene.getBoundingClientRect();
    chipScene.style.setProperty('--tilt-x', `${-(event.clientY - bounds.top - bounds.height / 2) / 65}deg`);
    chipScene.style.setProperty('--tilt-y', `${(event.clientX - bounds.left - bounds.width / 2) / 65}deg`);
  });
  chipScene.addEventListener('pointerleave', () => {
    chipScene.style.setProperty('--tilt-x', '0deg');
    chipScene.style.setProperty('--tilt-y', '0deg');
  });
}
$('.signal-button').addEventListener('click', () => {
  const button = $('.signal-button');
  button.disabled = true;
  chipScene.classList.add('is-running');
  $('.signal-button-label').textContent = 'Source → silicon';
  $('.layer-description').textContent = 'An idea, translated into instructions, executed in hardware.';
  window.setTimeout(() => {
    chipScene.classList.remove('is-running');
    $('.signal-button-label').textContent = 'Signal delivered ✓';
    button.disabled = false;
    window.setTimeout(() => {
      $('.signal-button-label').textContent = 'Send a signal';
      $('.layer-description').textContent = layerCopy[chipScene.dataset.layer];
    }, 1600);
  }, reducedMotion.matches ? 100 : 1600);
});

// These are illustrative snippets, not a compiler running in the browser.
const compilerStages = {
  ptx: {
    filename: 'vector_add.ptx',
    code: '<span class="code-comment">// From intent to instructions.</span>\n<span class="code-orange">.visible .entry</span> vector_add(\n    <span class="code-green">.param .u64</span> input_a,\n    <span class="code-green">.param .u64</span> input_b\n) {\n    <span class="code-orange">add.f32</span> %f3, %f1, %f2;\n    <span class="code-orange">st.global.f32</span> [%rd3], %f3;\n}'
  },
  ir: {
    filename: 'backend / intermediate representation',
    code: '<span class="code-comment">// A bridge between two worlds.</span>\n<span class="code-green">v0</span> ← load input_a[tid]\n<span class="code-green">v1</span> ← load input_b[tid]\n<span class="code-green">v2</span> ← <span class="code-orange">add.f32</span> v0, v1\n\n<span class="code-comment">// Select → allocate → schedule</span>\n<span class="code-orange">store</span> output[tid], v2\n<span class="code-orange">exit</span>'
  },
  sass: {
    filename: 'vector_add.sass / sm_80',
    code: '<span class="code-comment">// Closer to the silicon.</span>\n<span class="code-orange">LDG.E</span>       R2, [R4.64];\n<span class="code-orange">LDG.E</span>       R3, [R6.64];\n<span class="code-orange">FADD</span>        R8, R2, R3;\n<span class="code-orange">STG.E</span>       [R10.64], R8;\n<span class="code-orange">EXIT</span>;\n\n<span class="code-green">// Encoded by OpenAssembler.</span>'
  }
};
$$('.compiler-stages button').forEach(button => button.addEventListener('click', () => {
  $$('.compiler-stages button').forEach(item => {
    item.classList.toggle('is-active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  const stage = compilerStages[button.dataset.stage];
  $('#compiler-filename').textContent = stage.filename;
  $('#compiler-code code').innerHTML = stage.code;
}));

$$('.work-filters button').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  $$('.work-filters button').forEach(item => {
    item.classList.toggle('is-active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  let count = 0;
  $$('.project-card').forEach(card => {
    card.hidden = filter !== 'all' && card.dataset.category !== filter;
    if (!card.hidden) { count++; card.classList.add('is-visible'); }
  });
  $('.work-count').textContent = `${String(count).padStart(2, '0')} PROJECT${count === 1 ? '' : 'S'}`;
}));

const demoPresets = {
  analytics: { title: 'Good morning, builder.', label: 'Total revenue', stat: '$24,680', change: '↗ 12.8%', chart: 'A clearer view of your growth', accent: '#7e8b68' },
  portfolio: { title: 'Ideas, meet execution.', label: 'Selected projects', stat: '02', change: 'Built with curiosity', chart: 'A little progress, every day', accent: '#b96b48' },
  product: { title: 'Make room for better.', label: 'Early supporters', stat: '1,280', change: '↗ 24.6%', chart: 'A small idea, growing steadily', accent: '#7e829b' }
};
const workflowMessages = ['Understanding the prompt → creating a blueprint', 'Turning the blueprint into a design', 'Reviewing the design → human checkpoint', 'Demo preview ready. Your next idea starts here.'];
let workflowTimers = [];
function clearWorkflow() { workflowTimers.forEach(window.clearTimeout); workflowTimers = []; }
function updateDemo(preset) {
  $('#demo-title').textContent = preset.title;
  $('#demo-stat-label').textContent = preset.label;
  const stat = $('#demo-stat');
  stat.replaceChildren(document.createTextNode(preset.stat));
  const change = document.createElement('span'); change.textContent = preset.change; stat.append(change);
  $('#demo-chart-title').textContent = preset.chart;
  $('.demo-dashboard').style.setProperty('--demo-accent', preset.accent);
  $('.mini-chart svg > path:last-child').setAttribute('stroke', preset.accent);
}
$('#demo-prompt').addEventListener('change', () => {
  clearWorkflow();
  $('#run-workflow').disabled = false;
  $('.demo-browser').classList.remove('is-building');
  $$('.workflow-steps > span').forEach((step, index) => { step.classList.toggle('is-current', index === 0); step.classList.remove('is-complete'); });
  $('#workflow-status').textContent = 'New idea selected. Run the walkthrough →';
});
$('#run-workflow').addEventListener('click', () => {
  clearWorkflow();
  const run = $('#run-workflow');
  const preset = demoPresets[$('#demo-prompt').value];
  const interval = reducedMotion.matches ? 80 : 850;
  run.disabled = true;
  $('.demo-browser').classList.add('is-building');
  function step(index) {
    $$('.workflow-steps > span').forEach((item, itemIndex) => {
      item.classList.toggle('is-current', itemIndex === index);
      item.classList.toggle('is-complete', itemIndex < index);
    });
    $('#workflow-status').textContent = workflowMessages[index];
    if (index === 3) {
      updateDemo(preset);
      $('.demo-browser').classList.remove('is-building');
      run.disabled = false;
    }
  }
  step(0);
  for (let index = 1; index < 4; index++) workflowTimers.push(window.setTimeout(() => step(index), interval * index));
});

const caseStudies = {
  openassembler: {
    repo: `${github}OpenAssembler`,
    kicker: '01 / OPENASSEMBLER / SYSTEMS & COMPILERS',
    title: 'From source<br>to <span class="serif-word">silicon.</span>',
    lede: 'A from-scratch PTX-to-SASS code generator, encoder, and emulator for NVIDIA sm_80 (Ampere), grounded in observations of real A100 behavior.',
    tabs: [
      { label: 'The architecture', content: `
        <h3>Understanding the layer we usually can’t see.</h3>
        <p>NVIDIA’s <code>ptxas</code> translates PTX into SASS, the machine instructions executed by the GPU. OpenAssembler builds an independent code generator by recovering instruction encodings and studying hardware behavior through black-box observation.</p>
        <div class="case-pipeline"><div><span>01 / FRONTENDS</span>Python subset<br>CUDA C/C++ · PTX</div><div><span>02 / BACKEND</span>Instruction selection<br>Register allocation</div><div><span>03 / LOWERING</span>Scheduling<br>SASS encoding</div><div><span>04 / EXECUTION</span>ELF code splicing<br>A100 validation</div></div>
        <h3>A compiler pipeline built end to end.</h3>
        <ol><li><strong>Select an intermediate representation.</strong> Translate PTX into virtual-register operations and combine eligible instruction patterns.</li><li><strong>Remove unnecessary work.</strong> Eliminate dead code, coalesce copies, and use linear-scan register allocation with copy-affinity hints.</li><li><strong>Schedule for the hardware.</strong> Optionally unroll counted loops 4× and list-schedule basic blocks using measured A100 latencies.</li><li><strong>Encode and package.</strong> Encode SASS instruction words and splice the generated code into a compatible ELF container.</li></ol>
        <div class="case-callout"><p><strong>A precise boundary:</strong> this is an independent code generator, not a complete replacement for every part of <code>ptxas</code>. It reuses a <code>ptxas</code>-generated cubin container for symbols, relocations, and constant banks.</p></div>
        <p>The repository also includes a SASS emulator, a PTX reference interpreter, constant-division lowering verified with z3, and 97 exactly verified fast matrix-multiplication factorizations.</p>` },
      { label: 'Measured results', content: `
        <h3>Performance with the conditions attached.</h3>
        <p>The repository reports A100-SXM4-40GB wall-clock timings using 4,096 CTAs × 32 threads and 4,096 loop iterations, taking the best median from three shuffled timing rounds.</p>
        <table><caption class="eyebrow">REPOSITORY-REPORTED A100 BENCHMARKS</caption><thead><tr><th>KERNEL</th><th>PTXAS</th><th>OPENASSEMBLER</th><th>SPEEDUP</th></tr></thead><tbody><tr><td>loop.div7</td><td>0.629 ms</td><td>0.464 ms</td><td>1.36×</td></tr><tr><td>loop.rem1000</td><td>0.373 ms</td><td>0.312 ms</td><td>1.19×</td></tr><tr><td>loop.smem</td><td>0.748 ms</td><td>0.713 ms</td><td>1.05×</td></tr><tr><td>ilp4.imad</td><td>0.257 ms</td><td>0.250 ms</td><td>1.03×</td></tr><tr><td>chain.imad_lop3</td><td>0.129 ms</td><td>0.135 ms</td><td>0.95×</td></tr><tr><td>chain.ffma</td><td>0.089 ms</td><td>0.097 ms</td><td>0.92×</td></tr></tbody></table>
        <div class="case-callout"><p><strong>1.36× is a result for a selected kernel.</strong> Tight dependent chains remain 5–8% slower than <code>ptxas</code>. These measurements do not establish a general speedup across arbitrary GPU workloads.</p></div>
        <h3>Correctness before the headline.</h3>
        <ul><li><strong>110/110 compiler probes</strong> reported bit-exact on A100, with four trials × 32 threads. The compiler subsequently supported 203 probes; the additional 93 were not yet rerun on GPU in the cited README.</li><li><strong>532/541 emulator probes</strong> reported bit-exact or within PTX-specified tolerance against A100 runs.</li><li><strong>206 tests</strong> reported passing with the toolkit and probe corpus present; environment-dependent tests skip on fresh clones.</li><li><strong>13 → 2–3 instructions</strong> for supported constant-division/remainder lowering, with 32-bit equivalence checked using z3.</li></ul>
        <p>For matrix multiplication at n = 8,192, the reported Strassen variant improves on the project’s direct GEMM by 2.7%, while remaining slightly behind cuBLAS.</p>` },
      { label: 'Scope & next steps', content: `
        <h3>Built with explicit edges.</h3>
        <ul><li><strong>Architecture:</strong> the encoder and latency model target sm_80 / Ampere. Additional GPU architectures are future work.</li><li><strong>Language coverage:</strong> the Python frontend supports a subset; CUDA C/C++ is lowered to PTX by <code>nvcc</code> before this backend takes over.</li><li><strong>Compiler gaps:</strong> no f16/f64 arithmetic, warp shuffles/votes, register spilling, float division or square root, or pointer-increment loops in the documented scope.</li><li><strong>Packaging dependency:</strong> a toolkit-generated cubin supplies the ELF container. No NVIDIA binaries are redistributed by the project.</li></ul>
        <h3>The next interesting problems.</h3><p>Improve dependent-chain scheduling, explore tensor-core GEMM and asynchronous copy pipelining, and extend the encoding and latency models to more architectures. These are proposed directions, not completed capabilities.</p>
        <div class="case-callout"><p><strong>Why it matters:</strong> compiler quality depends on understanding the machine. This project puts the software–hardware boundary under a microscope and turns that understanding into an executable tool.</p></div>
        <p><strong>License:</strong> Apache 2.0, with third-party attributions maintained in the repository’s NOTICE.</p>` }
    ],
    source: `Sources: <a href="${github}OpenAssembler#readme" target="_blank" rel="noopener noreferrer">project README</a>, <a href="${github}OpenAssembler/blob/main/REPRODUCING.md" target="_blank" rel="noopener noreferrer">reproduction guide</a>, and <a href="${github}OpenAssembler/blob/main/docs/STATUS.md" target="_blank" rel="noopener noreferrer">status notes</a>. Results are repository-reported, not independently rerun for this website. Content reviewed November 2, 2026.`
  },
  grandtool: {
    repo: `${github}AI-Automated-UI-Design-Workflow-From-Prompt-to-Demo`,
    kicker: '02 / GRAND TOOL / AI AGENTS & PRODUCT TOOLS',
    title: 'A shorter path<br>from <span class="serif-word">idea to interface.</span>',
    lede: 'A local, MCP-first product studio that connects prompt understanding, design automation, visual review, and explicit demo generation in one inspectable workflow.',
    tabs: [
      { label: 'The workflow', content: `
        <h3>Make the handoffs part of the product.</h3>
        <p>Turning an idea into an interface usually means moving between a prompt, a design tool, a review process, and a code editor. Grand Tool orchestrates those handoffs while keeping intermediate artifacts and human review visible.</p>
        <div class="case-pipeline"><div><span>01 / UNDERSTAND</span>Prompt + context<br>Product blueprint</div><div><span>02 / DESIGN</span>Pencil via MCP<br>Exported artifacts</div><div><span>03 / REVIEW</span>Design review<br>Human checkpoint</div><div><span>04 / BUILD</span>Explicit approval<br>HTML / React demo</div></div>
        <ol><li><strong>Blueprint:</strong> DeepSeek turns the prompt and optional documents or images into a structured UI specification, design system, page map, component inventory, and interaction checklist.</li><li><strong>Design:</strong> a tool-calling agent uses the Pencil MCP client to create designs and export variables, layout summaries, and screenshots.</li><li><strong>Review:</strong> the reviewer inspects the exported artifacts. The workflow stops at <code>waiting_human_review</code> so the user can inspect results or request changes.</li><li><strong>Generate:</strong> an explicit code-generation action produces an <code>html_demo</code> or <code>react_web</code> output and validation artifacts.</li></ol>
        <div class="case-callout"><p><strong>The preview on this portfolio is a simulation.</strong> It illustrates the phases using preset content. It does not invoke a model, start Pencil, or generate a real application. The actual product and setup live in the linked repository.</p></div>` },
      { label: 'The architecture', content: `
        <h3>One state machine. Inspectable artifacts.</h3>
        <p>A Python <code>ThreadingHTTPServer</code> provides the local website and task API. The core orchestrator models blueprint, design, review, human checkpoint, and code-generation phases, including failure and cancellation states.</p>
        <ul><li><strong>Task isolation:</strong> each run has its own <code>output/{task_id}/</code> directory, context files, screenshots, reviews, generated code, and persisted pipeline state.</li><li><strong>Typed boundaries:</strong> Pydantic schemas describe prompts, task state, and design exports so each phase exchanges structured data.</li><li><strong>MCP integration:</strong> the native Pencil client owns tool discovery, editor interaction, layout summaries, and exported artifacts.</li><li><strong>Model roles:</strong> DeepSeek supports blueprint creation and tool-calling design; optional OpenRouter configuration enables multimodal visual review.</li><li><strong>Resilient fallback:</strong> if Pencil MCP is unavailable, the pipeline can derive a structured design export from the blueprint so demo generation remains possible.</li></ul>
        <div class="case-callout"><p><strong>Fallback provenance stays clear:</strong> blueprint-derived artifacts are different from designs exported from a live Pencil canvas. That distinction matters when assessing the output.</p></div>
        <p>The local server exposes task creation, task status, artifact listing, modification, and code-generation actions. Intermediate state and files make the process inspectable instead of hiding it behind one long model response.</p>` },
      { label: 'Scope & next steps', content: `
        <h3>A working demo is an honest milestone.</h3>
        <p>The stable MVP targets are static HTML demos and React web demos. AI-generated React can still require validation and correction; deterministic fallbacks support a reliable demonstration path.</p>
        <ul><li><strong>Local dependencies:</strong> Python, model API configuration, and a local Pencil installation / MCP server for the canvas-backed route. React outputs also need Node.js.</li><li><strong>Human review:</strong> review results pause before code generation; modification and code-generation phases remain explicit actions.</li><li><strong>Future targets:</strong> WeChat mini programs, native apps, and production web output are staged extension points, not finished production generators.</li><li><strong>Production work:</strong> backend, database, authentication, ownership, and stronger runtime validation still need target-specific decisions and implementation.</li></ul>
        <h3>The larger idea.</h3><p>AI tooling becomes more useful when the workflow around the model is designed as carefully as the model call itself: typed artifacts, resumable phases, visible review, and a clear definition of “done.”</p>
        <div class="case-callout"><p><strong>Why it matters:</strong> this project connects AI orchestration with an actual product workflow, turning separate capabilities into a tool a person can operate and inspect.</p></div>` }
    ],
    source: `Source: <a href="${github}AI-Automated-UI-Design-Workflow-From-Prompt-to-Demo#readme" target="_blank" rel="noopener noreferrer">project README and developer guide</a>. Capabilities and limitations are described as documented by the repository. Content reviewed November 2, 2026.`
  }
};

const projectDialog = $('#project-dialog');
function openCaseStudy(key) {
  const study = caseStudies[key];
  if (!study) return;
  $('#case-repo-link').href = study.repo;
  // The case study HTML is static, authored content; no user input is interpolated.
  $('#case-content').innerHTML = `<div class="eyebrow">${study.kicker}</div><h2 id="case-title">${study.title}</h2><p class="case-lede">${study.lede}</p><div class="case-tabs" role="tablist" aria-label="Case study sections">${study.tabs.map((tab, index) => `<button id="case-tab-${index}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="case-panel-${index}" tabindex="${index === 0 ? 0 : -1}" data-tab="${index}">${tab.label}</button>`).join('')}</div>${study.tabs.map((tab, index) => `<section id="case-panel-${index}" class="case-panel" role="tabpanel" aria-labelledby="case-tab-${index}" tabindex="0" ${index ? 'hidden' : ''}>${tab.content}</section>`).join('')}<div class="case-source">${study.source}</div>`;
  const tabs = $$('.case-tabs button');
  const selectTab = index => {
    tabs.forEach((button, tabIndex) => {
      button.setAttribute('aria-selected', String(index === tabIndex));
      button.tabIndex = index === tabIndex ? 0 : -1;
    });
    $$('.case-panel').forEach((panel, panelIndex) => { panel.hidden = index !== panelIndex; });
  };
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => selectTab(index));
    button.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); selectTab(next); tabs[next].focus();
    });
  });
  projectDialog.showModal();
  projectDialog.scrollTop = 0;
}
$$('[data-project]').forEach(button => button.addEventListener('click', () => openCaseStudy(button.dataset.project)));
$('.dialog-close').addEventListener('click', () => projectDialog.close());

const commandDialog = $('#command-dialog');
const commandSearch = $('#command-search');
function openCommands() {
  if (projectDialog.open) projectDialog.close();
  commandSearch.value = '';
  filterCommands('');
  commandDialog.showModal();
  commandSearch.focus();
}
function filterCommands(query) {
  const normalized = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  let found = 0;
  $$('#command-results a').forEach(link => {
    link.hidden = !`${link.dataset.search} ${link.textContent}`.toLowerCase().includes(normalized);
    if (!link.hidden) found++;
  });
  $('.command-empty').hidden = found > 0;
}
$('.command-trigger').addEventListener('click', openCommands);
$('.command-close').addEventListener('click', () => commandDialog.close());
commandSearch.addEventListener('input', () => filterCommands(commandSearch.value));
$$('#command-results a').forEach(link => link.addEventListener('click', () => commandDialog.close()));
commandDialog.addEventListener('keydown', event => {
  // Search inputs can consume Escape to clear themselves before a dialog cancels.
  if (event.key === 'Escape') { event.preventDefault(); commandDialog.close(); return; }
  const items = $$('#command-results a').filter(link => !link.hidden);
  const index = items.indexOf(document.activeElement);
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const next = event.key === 'ArrowDown' ? (index + 1) % items.length : (index < 0 ? items.length - 1 : (index + items.length - 1) % items.length);
    items[next]?.focus();
  }
  if (event.key === 'Enter' && document.activeElement === commandSearch && items[0]) { event.preventDefault(); items[0].click(); }
});
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (commandDialog.open) commandDialog.close(); else openCommands();
  }
});
[projectDialog, commandDialog].forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});

const menuButton = $('.menu-toggle');
const mobileNav = $('#mobile-nav');
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); mobileNav.hidden = true; }
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  mobileNav.hidden = !expanded;
});
$$('#mobile-nav a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); } });
window.matchMedia('(min-width: 721px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

$('.copy-email').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('LucasFang2@outlook.com');
    $('#copy-status').textContent = 'Email copied. Say hello!';
    $('.copy-email use').setAttribute('href', '#i-check');
    window.setTimeout(() => { $('#copy-status').textContent = ''; $('.copy-email use').setAttribute('href', '#i-copy'); }, 3000);
  } catch {
    $('#copy-status').textContent = 'LucasFang2@outlook.com — select to copy';
  }
});
$('#copyright-year').textContent = new Date().getFullYear();

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: .07 });
  $$('.reveal').forEach(element => revealObserver.observe(element));
  const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) $$('.desktop-nav a').forEach(link => link.classList.toggle('is-current', link.hash === `#${entry.target.id}`));
  }), { rootMargin: '-10% 0px -65% 0px' });
  $$('main > section[id]').forEach(section => navObserver.observe(section));
} else {
  $$('.reveal').forEach(element => element.classList.add('is-visible'));
}
let scrollQueued = false;
function updateScrollProgress() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  $('.scroll-progress').style.width = `${total > 0 ? window.scrollY / total * 100 : 0}%`;
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; window.requestAnimationFrame(updateScrollProgress); }
}, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();
