---
id: mod-4
track: main
number: 4
title: Post-training I, SFT and preference learning
slug: post-training-sft-dpo
hoursMin: 20
hoursMax: 25
prereqs: [mod-1, mod-2, mod-3]
phase: flexible
---

## Goal

Understand the full preference-learning family (RLHF, DPO, KTO, IPO, ORPO, SimPO) and know when each is the right tool.

## Concepts

- rlhf
- dpo
- kto
- orpo
- simpo
- instruction-tuning

## Resources

- artifact: dlai-rlhf
- artifact: rush-rl-for-llms
- artifact: rlhf-book
- artifact: trl-repo
- artifact: alignment-handbook
- artifact: christiano-preferences
- artifact: instructgpt-paper
- artifact: dpo-paper
- artifact: kto-paper
- artifact: orpo-paper
- artifact: simpo-paper

## Interviews

- artifact: latent-space-nathan-lambert
- artifact: latent-space-hf-alignment

## Project

Take a 0.5B to 1B open model (Qwen2.5-0.5B or Llama-3.2-1B). SFT it on a small instruction set. Then DPO it on UltraFeedback-style pairs. Measure the difference on a 50-prompt eval you write yourself. Write up where DPO helped, where it hurt, and where it did nothing.
