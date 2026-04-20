---
id: mod-8
track: main
number: 8
title: Agents and tool use
slug: agents-and-tool-use
hoursMin: 15
hoursMax: 20
prereqs: [mod-1, mod-4]
phase: flexible
---

## Goal

Understand what makes agents work, what makes them fail, and how to build and evaluate one without the LangChain tax.

## Concepts

- react-pattern
- tool-use
- context-engineering
- agent-eval
- mcp

## Resources

- artifact: anthropic-building-agents
- artifact: anthropic-context-engineering
- artifact: anthropic-demystifying-evals
- artifact: anthropic-state-of-agents
- artifact: anthropic-agents-deep-dive-video
- artifact: react-paper
- artifact: toolformer-paper
- artifact: gaia-paper
- artifact: swe-bench-paper
- artifact: smolagents-repo
- artifact: openai-agents-sdk
- artifact: claude-code-docs

## Interviews

- artifact: latent-space-agents-series
- artifact: no-priors-agents
- artifact: dwarkesh-dario-feb-2026

## Project

Build a small DeFi-domain agent. Concrete spec: give it read-only access to one Dune client and one RPC endpoint; task it with "for protocol X on chain Y, compute TVL, number of active troves, and average effective borrow rate, and explain any anomaly against the last 30 days." Evaluate it against a hand-written rubric of 20 queries, following the pattern in Anthropic's *Demystifying Evals* post.
