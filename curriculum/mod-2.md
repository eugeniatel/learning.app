---
id: mod-2
track: main
number: 2
title: Tokenization and pretraining data
slug: tokenization-and-data
hoursMin: 10
hoursMax: 15
prereqs: [mod-1]
phase: foundational
---

## Goal

Understand BPE end-to-end, know why tokenizer choices leak into model behavior, and be able to audit a pretraining corpus for quality, duplication, and contamination.

## Concepts

- byte-pair-encoding
- sentencepiece
- pretraining-data-quality
- deduplication
- contamination

## Resources

- artifact: karpathy-tokenizer
- artifact: hf-tokenizers-course
- artifact: bpe-paper
- artifact: sentencepiece-paper
- artifact: fineweb-paper
- artifact: dolma-paper
- artifact: dedup-paper

## Interviews

- artifact: latent-space-fineweb
- artifact: dwarkesh-gwern

## Project

Build a BPE tokenizer from scratch (Karpathy's minbpe or your own). Then point it at a 1 GB slice of FineWeb, measure token efficiency, find ten of the strangest tokens, and write up why they exist.
