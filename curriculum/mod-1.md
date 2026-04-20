---
id: mod-1
track: main
number: 1
title: Transformer architecture, inside-out
slug: transformer-deep-dive
hoursMin: 20
hoursMax: 25
prereqs: [mod-0]
phase: foundational
---

## Goal

Implement a decoder-only transformer from scratch, understand every component by rewriting it, and be able to explain attention, MLPs, residual stream, and norms without hedging.

## Concepts

- attention
- residual-stream
- mlp-block
- rope
- gqa
- layer-norm-placement

## Resources

- artifact: karpathy-build-gpt
- artifact: karpathy-deep-dive
- artifact: cs25-v5
- artifact: 3b1b-attention
- artifact: nanogpt-repo
- artifact: raschka-llms-from-scratch
- artifact: llm-c-repo
- artifact: attention-is-all-you-need
- artifact: gpt2-paper
- artifact: gpt3-paper
- artifact: rope-paper
- artifact: gqa-paper

## Interviews

- artifact: latent-space-llama4

## Project

Train nanoGPT on TinyStories or Shakespeare. Swap learned positional embeddings for RoPE, and MHA for GQA. Write a short post with your own diagrams explaining how these changes alter the residual stream.
