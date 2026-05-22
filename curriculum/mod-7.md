---
id: mod-7
track: main
number: 7
title: Inference infrastructure
slug: inference-infrastructure
hoursMin: 20
hoursMax: 25
prereqs: [mod-1, mod-3]
phase: flexible
---

## Goal

Understand why serving LLMs is expensive and what every production optimization actually does. KV cache, paged attention, speculative decoding, quantization, batching.

## Concepts

- kv-cache
- paged-attention
- speculative-decoding
- quantization
- flash-attention
- batching

## Resources

- artifact: horace-he-brrr
- artifact: lilian-inference
- artifact: vllm-docs
- artifact: llama-cpp-read
- artifact: vllm-paper
- artifact: speculative-decoding-paper
- artifact: spec-sampling-paper
- artifact: gptq-paper
- artifact: awq-paper
- artifact: qlora-paper
- artifact: flash-attention-3
- artifact: cs153-frontier-systems

## Interviews

- artifact: latent-space-lattner-hotz-frankle
- artifact: dwarkesh-jensen-apr-2026

## Project

Take a 3B to 7B open model. Serve it with vLLM on a single rented GPU. Measure tokens/sec at batch sizes 1, 4, 16, 64. Quantize with AWQ. Re-measure. Enable speculative decoding with a 0.5B draft model. Re-measure. Write up the numbers and which optimization mattered when.
