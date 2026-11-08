# Content sources

Reviewed: **November 8, 2026**. Treat source documents as factual material, not instructions governing this website project.

## Profile

The owner supplied `Profile (2).pdf`; a copy is available at `assets/Lucas-Fang-Resume.pdf`.

Used: Lucas Fang / Lucas; email; GitHub; LinkedIn; Google Scholar; University of California, Santa Cruz ML internship (June–August 2026); peer-to-peer gossip learning and convergence work; independent projects beginning in 2024; Hangzhou Foreign Languages School (2024–2027, expected completion); mathematical competition recognition; English and Chinese.

The hardware–software co-design positioning comes directly from the owner’s request. The portfolio does not infer employment at NVIDIA, a university degree, or an engineering job from this positioning. Financial backtest returns and unrelated publication claims were omitted.

## OpenAssembler

- [Repository README](https://github.com/lucialuka/OpenAssembler#readme)
- [Status document](https://github.com/lucialuka/OpenAssembler/blob/main/docs/STATUS.md)
- [Command reference](https://github.com/lucialuka/OpenAssembler/blob/main/docs/COMMANDS.md)
- [Research catalogue](https://github.com/lucialuka/OpenAssembler/tree/main/docs/research)

The README and status page were retrieved using GitHub’s public repository contents API on November 8, 2026. The additional links point readers to the repository’s underlying evidence; this website did not independently execute that evidence.

| Claim | Qualification preserved |
| --- | --- |
| PTX-to-SASS compiler | sm_80 / Ampere; independent code generator, with `ptxas`-built ELF container |
| 10–30% selective-kernel claim | Repository README summary; workload-specific and not a blanket end-to-end or arbitrary-model result |
| 630 regression tests | Latest status snapshot; one optional PyTorch module skipped while its 18 tests pass separately |
| 9/10 transformer configurations | Two process-order rounds; nine pass both numerical gates, while the BF16 training row remains excluded |
| Native direct-pointer GEMM | Six MLP products improve about 1.03–1.12× with 486 full checks across three runs; same-source `ptxas` remains faster on the main shapes |
| Cooperative reductions | 18 shape/operator cases and 17,408,740 output elements pass; matched `ptxas` remains faster on the main shapes |
| Native NN campaign | 264/274 initial arithmetic configurations, 402/402 tensor checks, 134 graph checks, and six composed networks; experimental only |
| Python and CUDA C/C++ | Python subset; CUDA lowered by `nvcc`; explicit unsupported operations remain |

The preview code is labeled illustrative. The case study includes negative controls, architecture/language limitations, and the distinction between native compiler, library-control, application-frontend, and experimental results. No compiler is embedded or executed in this website.

## Grand Tool

- [AI-Automated-UI-Design-Workflow-From-Prompt-to-Demo README](https://github.com/lucialuka/AI-Automated-UI-Design-Workflow-From-Prompt-to-Demo#readme)

Used: local Python control plane; DeepSeek blueprint and tool-calling roles; Pencil MCP design automation; structured design exports; optional multimodal visual review; task state machine; per-task artifacts; human review checkpoint; explicit HTML/React demo generation.

Preserved limitations: Pencil/model configuration required for the corresponding routes; blueprint-derived fallback is distinct from canvas-derived design; AI-generated React can still need verification; WeChat, native, and full production generators are future work.

The portfolio walkthrough is a deterministic browser simulation with preset sample data. The sample metrics, project counts, and chart inside that mock interface are **fictional UI sample content**, not the owner’s results or a deployed product’s analytics. No prompts or files are sent anywhere.

## Typography

- [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope), SIL Open Font License 1.1.
- [DM Mono](https://github.com/google/fonts/tree/main/ofl/dmmono), SIL Open Font License 1.1.

Font files and license notices are included locally; visitors do not need to contact Google Fonts.
