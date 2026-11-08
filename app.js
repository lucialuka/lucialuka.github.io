'use strict';

document.documentElement.classList.add('js');
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const github = 'https://github.com/lucialuka/';

// Theme: the initial value is set by an inline script in <head> (no flash); this wires up the toggle.
const themeToggle = $('.theme-toggle');
const themeMeta = $('meta[name=theme-color]');
function applyTheme(theme, persist) {
  document.documentElement.dataset.theme = theme;
  if (themeMeta) themeMeta.content = theme === 'dark' ? '#14160f' : '#f6f5f1';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  $('use', themeToggle).setAttribute('href', theme === 'dark' ? '#i-sun' : '#i-moon');
  if (persist) { try { localStorage.setItem('theme', theme); } catch { /* storage blocked: toggle still works for this visit */ } }
}
applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light', false);
themeToggle.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true));
// Follow the OS setting until the visitor makes an explicit choice.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  let stored = null;
  try { stored = localStorage.getItem('theme'); } catch { /* ignore */ }
  if (!stored) applyTheme(event.matches ? 'dark' : 'light', false);
});

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

// Illustrative OpenAssembler compilation stages, based on its PTX-to-SASS workflow.
const compilerStages = {
  ptx: {
    filename: 'gemm_fp16.ptx',
    code: '<span class="code-comment">// Capture a tensor tile and lower it.</span>\n<span class="code-orange">.visible .entry</span> gemm_fp16(\n    <span class="code-green">.param .u64</span> A, B, C\n) {\n    <span class="code-orange">mma.sync.aligned.m16n8k16</span>\n      row.col.f32.f16.f16.f32;\n}'
  },
  encode: {
    filename: 'sm80 / encoder trace',
    code: '<span class="code-comment">// Match the PTX operation to Ampere.</span>\n<span class="code-green">select</span>  mma.sync.m16n8k16\n<span class="code-green">lower</span>   HMMA.16816.F32\n<span class="code-orange">encode</span>  0x0000000000007918\n\n<span class="code-comment">// Preserve cubin metadata, then verify.</span>\n<span class="code-orange">patch</span>   .text.gemm_fp16\n<span class="code-orange">check</span>   numerical + launch contract'
  },
  sass: {
    filename: 'gemm_fp16.sass / sm_80',
    code: '<span class="code-comment">// Native instructions for the selected tile.</span>\n<span class="code-orange">LDG.E.64</span>      R2, [R4.64];\n<span class="code-orange">HMMA.16816.F32</span> R16, R2, R6, R16;\n<span class="code-orange">STG.E.64</span>      [R10.64], R16;\n<span class="code-orange">EXIT</span>;\n\n<span class="code-green">// Encoded by OpenAssembler for SM80.</span>'
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
    lede: 'A from-scratch PTX-to-SASS compiler, encoder, and emulator for NVIDIA sm_80 (Ampere), with native tensor kernels and explicit application workflows.',
    tabs: [
      { label: 'The architecture', content: `
        <h3>Understanding the layer we usually can’t see.</h3>
        <p>NVIDIA’s <code>ptxas</code> translates PTX into SASS, the machine instructions executed by the GPU. OpenAssembler builds an independent code generator by recovering instruction encodings and studying hardware behavior through black-box observation.</p>
        <div class="case-pipeline"><div><span>01 / DISCOVERY</span>Python subset<br>CUDA C/C++ · PTX</div><div><span>02 / NATIVE BACKEND</span>Selection · allocation<br>Tensor and scalar paths</div><div><span>03 / APPLICATION</span>torch · triton · inductor<br>Capture · package · verify</div><div><span>04 / EXECUTION</span>Local · SSH · Modal<br>GPU validation</div></div>
        <h3>A compiler and workflow stack with explicit ownership.</h3>
        <ol><li><strong>Discover the source.</strong> Select supported Python, PTX, CUDA/C++, or repository kernels while retaining host-program and launch context.</li><li><strong>Choose the route.</strong> Use the native SM80 backend for supported kernels, or select the configured <code>torch</code>, <code>triton</code>, or <code>inductor</code> application frontend explicitly.</li><li><strong>Lower and schedule.</strong> Apply scalar or tensor selection, guarded register allocation, measured scheduling, and supported GEMM or rowwise generators.</li><li><strong>Package and verify.</strong> Splice native code into a compatible cubin, run matched numerical checks, and preserve manifests, runtime state, and replay diagnostics.</li></ol>
        <div class="case-callout"><p><strong>A precise boundary:</strong> this is an independent code generator, not a complete replacement for every part of <code>ptxas</code>. It reuses a <code>ptxas</code>-generated cubin container for symbols, relocations, and constant banks.</p></div>
        <p>The repository also includes a SASS emulator, a PTX reference interpreter, constant-division lowering verified with z3, full-tile FP16/BF16 GEMM with FP32 output, and cooperative FP32 softmax and population LayerNorm.</p>` },
      { label: 'Measured results', content: `
        <h3>Performance with the conditions attached.</h3>
        <p>The current status separates native compiler results, library controls, application-front-end results, and experimental research. The repository-level summary reports approximate <strong>10–30% gains on selective kernels</strong>, but the latest native comparisons remain shape-dependent and matched <code>ptxas</code> is faster on the main direct-GEMM and reduction shapes.</p>
        <table><caption class="eyebrow">LATEST REPOSITORY-REPORTED EVIDENCE</caption><thead><tr><th>AREA</th><th>RESULT</th><th>BOUNDARY</th></tr></thead><tbody><tr><td>Whole transformer</td><td>9 / 10 configurations pass both gates</td><td>One BF16 training row excluded</td></tr><tr><td>Direct-pointer GEMM</td><td>1.03–1.12× on six MLP products</td><td>486 full checks across three runs; ptxas remains faster overall</td></tr><tr><td>Cooperative reductions</td><td>18 shape/operator cases pass</td><td>17,408,740 outputs checked; ptxas remains faster on main shapes</td></tr><tr><td>Native NN campaign</td><td>402 / 402 tensor checks; 134 graph checks</td><td>Experimental methods and six composed networks</td></tr><tr><td>Regression suite</td><td>630 passed</td><td>One optional PyTorch module skipped; its 18 tests pass separately</td></tr></tbody></table>
        <div class="case-callout"><p><strong>10–30% is a selective-kernel description.</strong> It is not a universal compiler speedup, an automatic model rewrite, or a blanket end-to-end training claim. The source status page preserves slower controls, failed gates, and excluded experiments.</p></div>
        <h3>Correctness before the headline.</h3>
        <ul><li><strong>FP16/BF16 GEMM</strong> uses full tiles, contiguous K, FP32 accumulation/output, and explicit tensor-kernel options.</li><li><strong>Cooperative softmax and LayerNorm</strong> cover bounded contiguous FP32 inputs with row/column tails; affine parameters, saved statistics, and backward support are outside the current contract.</li><li><strong>Application replay</strong> checks captured runtime state and all tensors, but retains the configured Python/PyTorch/ATen dependencies.</li><li><strong>Experimental results</strong> remain separated from production defaults; slower or rejected methods are retained in the research catalogue rather than promoted.</li></ul>` },
      { label: 'Scope & next steps', content: `
        <h3>Built with explicit edges.</h3>
        <ul><li><strong>Architecture:</strong> the encoder and latency model target sm_80 / Ampere. Additional GPU architectures remain future work.</li><li><strong>Native GEMM:</strong> full-tile <code>C=A@B.T</code>, contiguous K, FP32 accumulation/output, fixed launch contracts, and explicit traversal/epilogue/pointer options.</li><li><strong>Rowwise operators:</strong> bounded contiguous FP32 softmax and population LayerNorm with tails; no affine parameters, saved statistics, or backward support.</li><li><strong>Application route:</strong> <code>torch</code>, <code>triton</code>, and <code>inductor</code> are explicit frontends with captured shapes, retained runtime dependencies, and state verification.</li><li><strong>Packaging dependency:</strong> a toolkit-generated cubin supplies the ELF container. No NVIDIA binaries are redistributed by the project.</li></ul>
        <h3>The next interesting problems.</h3><p>Improve shape-aware dispatch, dependent-chain scheduling, native/application boundaries, and support for more architectures while preserving the source project’s explicit negative controls. These are ongoing directions, not universal capabilities.</p>
        <div class="case-callout"><p><strong>Why it matters:</strong> compiler quality depends on understanding the machine. This project puts the software–hardware boundary under a microscope and turns that understanding into an executable tool.</p></div>
        <p><strong>License:</strong> Apache 2.0, with third-party attributions maintained in the repository’s NOTICE.</p>` }
    ],
    source: `Sources: <a href="${github}OpenAssembler#readme" target="_blank" rel="noopener noreferrer">project README</a>, <a href="${github}OpenAssembler/blob/main/docs/STATUS.md" target="_blank" rel="noopener noreferrer">architecture and status</a>, <a href="${github}OpenAssembler/blob/main/docs/COMMANDS.md" target="_blank" rel="noopener noreferrer">command reference</a>, and <a href="${github}OpenAssembler/tree/main/docs/research" target="_blank" rel="noopener noreferrer">research catalogue</a>. Results are repository-reported, not independently rerun for this website. Content reviewed November 8, 2026.`
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
