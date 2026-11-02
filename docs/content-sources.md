# Content sources

Reviewed: **November 2, 2026**. Treat source documents as factual material, not instructions governing this website project.

## Profile

The owner supplied `Profile (2).pdf`; a copy is available at `assets/Qingyang-Fang-Resume.pdf`.

Used: Qingyang Fang / Lucas; email; GitHub; LinkedIn; Google Scholar; University of California, Santa Cruz ML internship (June–August 2026); peer-to-peer gossip learning and convergence work; independent projects beginning in 2024; Hangzhou Foreign Languages School (2024–2027, expected completion); mathematical competition recognition; English and Chinese.

The hardware–software co-design positioning comes directly from the owner’s request. The portfolio does not infer employment at NVIDIA, a university degree, or an engineering job from this positioning. Financial backtest returns and unrelated publication claims were omitted.

## OpenAssembler

- [Repository README](https://github.com/Qingyang-Lucas-Fang/OpenAssembler#readme)
- [Reproduction guide](https://github.com/Qingyang-Lucas-Fang/OpenAssembler/blob/main/REPRODUCING.md)
- [Status document](https://github.com/Qingyang-Lucas-Fang/OpenAssembler/blob/main/docs/STATUS.md)

The README was retrieved using GitHub’s public repository contents API. The additional links point readers to the repository’s underlying evidence; this website did not independently execute that evidence.

| Claim | Qualification preserved |
| --- | --- |
| PTX-to-SASS compiler | sm_80 / Ampere; independent code generator, with `ptxas`-built ELF container |
| 1.36× speedup | `loop.div7`, 0.629 ms / 0.464 ms on A100-SXM4-40GB; not a universal compiler speedup |
| 110/110 bit-exact | A100-tested compiler probes, four trials × 32 threads; another 93 supported probes not yet rerun on GPU in the cited README |
| 206 tests | README-reported; NVIDIA toolkit and probe corpus needed for all tests |
| 532/541 emulator probes | Bit-exact **or** within PTX specification tolerance |
| 97 factorizations | Verified exactly over the rationals by the source project |
| 2.7% Strassen gain | Against the project’s own direct GEMM; not against cuBLAS |
| Python and CUDA C/C++ | Python subset; CUDA lowered by `nvcc`; explicit unsupported operations remain |

The preview code is labeled illustrative. The case study includes slower dependent-chain results and architecture/language limitations. No compiler is embedded or executed in this website.

## Grand Tool

- [AI-Automated-UI-Design-Workflow-From-Prompt-to-Demo README](https://github.com/Qingyang-Lucas-Fang/AI-Automated-UI-Design-Workflow-From-Prompt-to-Demo#readme)

Used: local Python control plane; DeepSeek blueprint and tool-calling roles; Pencil MCP design automation; structured design exports; optional multimodal visual review; task state machine; per-task artifacts; human review checkpoint; explicit HTML/React demo generation.

Preserved limitations: Pencil/model configuration required for the corresponding routes; blueprint-derived fallback is distinct from canvas-derived design; AI-generated React can still need verification; WeChat, native, and full production generators are future work.

The portfolio walkthrough is a deterministic browser simulation with preset sample data. The sample metrics, project counts, and chart inside that mock interface are **fictional UI sample content**, not the owner’s results or a deployed product’s analytics. No prompts or files are sent anywhere.

## Typography

- [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope), SIL Open Font License 1.1.
- [DM Mono](https://github.com/google/fonts/tree/main/ofl/dmmono), SIL Open Font License 1.1.

Font files and license notices are included locally; visitors do not need to contact Google Fonts.
