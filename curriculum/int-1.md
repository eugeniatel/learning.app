---
id: int-1
track: interpretability
number: 1
title: Interpretability foundations, probing, logit lens, feature viz
slug: interp-foundations
hoursMin: 15
hoursMax: 20
prereqs: [mod-1]
phase: foundational
---

## Goal

Build the basic interpretability toolkit. Know how to probe, how to run a logit lens, and how to visualize what a layer represents.

## Concepts

- probing
- logit-lens
- feature-visualization
- transformer-lens

## Resources

- artifact: nanda-concrete-steps
- artifact: arena-mech-interp
- artifact: distill-pub
- artifact: alain-bengio-probes
- artifact: logit-lens-post
- artifact: anthropic-math-framework

## Interviews

- artifact: 80k-neel-nanda-oct-2025
- artifact: mlst-neel-dec-2024
- artifact: axrp-chris-olah

## Project

Using TransformerLens on GPT-2 small: train a simple probe for part-of-speech on intermediate layers, plot accuracy by layer. Separately, run the logit lens on a handful of sentences and write up what you see.
