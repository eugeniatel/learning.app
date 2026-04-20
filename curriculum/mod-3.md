---
id: mod-3
track: main
number: 3
title: Pretraining scaling, optimization, loss dynamics
slug: pretraining-dynamics
hoursMin: 15
hoursMax: 20
prereqs: [mod-1, mod-2]
phase: foundational
---

## Goal

Know how compute, data, and parameter counts trade off; understand what the loss curve is telling you during a real run; be fluent in AdamW, learning-rate schedules, and muP.

## Concepts

- scaling-laws
- chinchilla
- mup
- adamw
- lr-schedule
- precision-scaling

## Resources

- artifact: cs336-liang-hashimoto
- artifact: raschka-ahead-of-ai
- artifact: kaplan-scaling
- artifact: chinchilla-paper
- artifact: mup-paper
- artifact: precision-scaling-paper
- artifact: 8bit-optimizers-paper

## Interviews

- artifact: dwarkesh-dario-feb-2026
- artifact: dwarkesh-jensen-apr-2026
- artifact: dwarkesh-dylan-patel

## Project

Run a tiny, honest scaling sweep: 4 model sizes by 3 token counts at 1 to 20M params. Plot loss vs. compute; see whether your tiny data points respect Chinchilla's slopes.
