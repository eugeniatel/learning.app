---
id: mod-5
track: main
number: 5
title: Post-training II, RLVR and reasoning models
slug: post-training-rlvr
hoursMin: 20
hoursMax: 25
prereqs: [mod-4]
phase: flexible
---

## Goal

Understand the reasoning-model training regime: RL from verifiable rewards, GRPO, and how o1-class models are actually trained. Also understand the current debate on whether RLVR is genuine capability expansion or sampling compression.

## Concepts

- rlvr
- grpo
- ppo
- process-reward-models
- reasoning-models
- sampling-compression

## Resources

- artifact: rush-rl-for-llms
- artifact: open-r1
- artifact: ppo-paper
- artifact: deepseekmath-paper
- artifact: deepseek-r1-paper
- artifact: o1-system-card
- artifact: verify-step-by-step
- artifact: rlvr-beyond-base
- artifact: rlvr-incentivize-reasoning
- artifact: limit-of-rlvr
- artifact: promptfoo-rlvr

## Interviews

- artifact: dwarkesh-dario-feb-2026
- artifact: latent-space-deepseek-r1
- artifact: mlst-reasoning

## Project

Run a tiny GRPO loop on GSM8K or MATH using a 0.5B base. You won't match o1; you'll feel the shape of the training dynamics. Compare pass@1 to pass@16 before and after RL to see the sampling-compression effect directly. Write up the reward hacking you observe and where your numbers land in the debate above.
