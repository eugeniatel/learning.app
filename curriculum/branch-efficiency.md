---
id: branch-efficiency
track: branch
number: 3
title: Small model efficiency
slug: branch-small-model-efficiency
hoursMin: 10
hoursMax: 12
prereqs: [mod-5, mod-7]
phase: flexible
branchOf: mod-7
---

## Goal

Understand what makes small models useful in practice: distillation, quantization, batching, routing, and choosing when not to call a frontier model.

## Concepts

- quantization
- batching
- speculative-decoding
- sampling-compression

## Resources

- artifact: vllm-docs
- artifact: llama-cpp-read
- artifact: awq-paper
- artifact: gptq-paper
- artifact: speculative-decoding-paper

## Project

Take one real classification or drafting task. Compare a frontier model, a 7B model, and a quantized small model. Measure quality, latency, and cost, then decide the smallest model you would trust.
